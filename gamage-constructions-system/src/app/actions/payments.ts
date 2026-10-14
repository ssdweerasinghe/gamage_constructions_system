// src/app/actions/payments.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getClientCreditData() {
  const logs = await prisma.incomeLog.findMany({
    orderBy: { logDate: "desc" },
    include: {
      jcb: true,
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  // Self-heal and sync legacy records
  const normalizedLogs = logs.map((log) => {
    const isExplicitlyPaid = log.paymentStatus === "PAID";
    // If marked PAID but amountPaid was left at 0, treat it as fully paid
    const effectivePaid = isExplicitlyPaid
      ? log.totalCharge
      : Math.min(log.amountPaid || 0, log.totalCharge);
    const balance = isExplicitlyPaid ? 0 : Math.max(0, log.totalCharge - effectivePaid);

    return {
      ...log,
      amountPaid: effectivePaid,
      balanceDue: balance,
    };
  });

  const clientMap = new Map<
    string,
    {
      clientName: string;
      totalBilled: number;
      totalPaid: number;
      totalDue: number;
      invoiceCount: number;
      unsettledCount: number;
    }
  >();

  normalizedLogs.forEach((log) => {
    const client = log.clientName.trim();

    if (!clientMap.has(client)) {
      clientMap.set(client, {
        clientName: client,
        totalBilled: 0,
        totalPaid: 0,
        totalDue: 0,
        invoiceCount: 0,
        unsettledCount: 0,
      });
    }

    const curr = clientMap.get(client)!;
    curr.totalBilled += log.totalCharge;
    curr.totalPaid += log.amountPaid;
    curr.totalDue += log.balanceDue;
    curr.invoiceCount += 1;

    if (log.balanceDue > 0.05) {
      curr.unsettledCount += 1;
    }
  });

  const clients = Array.from(clientMap.values()).sort((a, b) => b.totalDue - a.totalDue);

  return {
    invoices: normalizedLogs,
    clients,
    metrics: {
      totalReceivables: clients.reduce((acc, c) => acc + c.totalBilled, 0),
      totalCollected: clients.reduce((acc, c) => acc + c.totalPaid, 0),
      totalOutstanding: clients.reduce((acc, c) => acc + c.totalDue, 0),
    },
  };
}

export async function recordClientPayment(formData: FormData) {
  const user = await getCurrentUser();
  const incomeLogId = formData.get("incomeLogId") as string;
  const paymentAmount = parseFloat(formData.get("amount") as string);
  const paymentDateStr = formData.get("paymentDate") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!incomeLogId || isNaN(paymentAmount) || paymentAmount <= 0) {
    return { error: "Please enter a valid payment amount greater than zero." };
  }

  try {
    const shift = await prisma.incomeLog.findUnique({
      where: { id: incomeLogId },
    });

    if (!shift) {
      return { error: "Shift invoice not found." };
    }

    const currentPaid = shift.paymentStatus === "PAID" ? shift.totalCharge : (shift.amountPaid || 0);
    const newPaidTotal = currentPaid + paymentAmount;
    const outstanding = Math.max(0, shift.totalCharge - currentPaid);

    if (paymentAmount > outstanding + 0.05) {
      return {
        error: `Payment exceeds remaining balance. Max payable is LKR ${outstanding.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
      };
    }

    const newStatus = newPaidTotal >= shift.totalCharge - 0.05 ? "PAID" : "PARTIAL";

    await prisma.$transaction([
      prisma.paymentRecord.create({
        data: {
          incomeLogId,
          amount: paymentAmount,
          paymentDate: paymentDateStr ? new Date(paymentDateStr) : new Date(),
          note,
          recordedBy: user?.name || "System",
        },
      }),
      prisma.incomeLog.update({
        where: { id: incomeLogId },
        data: {
          amountPaid: newPaidTotal,
          paymentStatus: newStatus,
        },
      }),
    ]);

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error recording invoice installment:", error);
    return { error: "Failed to record payment in ledger." };
  }
}

export async function recordContractorInstallment(formData: FormData) {
  const user = await getCurrentUser();
  const clientName = (formData.get("clientName") as string)?.trim();
  const paymentAmount = parseFloat(formData.get("amount") as string);
  const paymentDateStr = formData.get("paymentDate") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!clientName || isNaN(paymentAmount) || paymentAmount <= 0) {
    return { error: "Please provide a valid client name and installment amount." };
  }

  try {
    const pendingShifts = await prisma.incomeLog.findMany({
      where: {
        clientName: { equals: clientName },
        paymentStatus: { not: "PAID" },
      },
      orderBy: { logDate: "asc" },
    });

    if (pendingShifts.length === 0) {
      return { error: "This contractor has no pending invoices." };
    }

    const totalDueAcrossAll = pendingShifts.reduce(
      (sum, s) => sum + Math.max(0, s.totalCharge - (s.amountPaid || 0)),
      0
    );

    if (paymentAmount > totalDueAcrossAll + 0.05) {
      return {
        error: `Installment exceeds total debt. Maximum payable is LKR ${totalDueAcrossAll.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
      };
    }

    let remainingToAllocate = paymentAmount;
    const paymentDate = paymentDateStr ? new Date(paymentDateStr) : new Date();

    await prisma.$transaction(async (tx) => {
      for (const shift of pendingShifts) {
        if (remainingToAllocate <= 0) break;

        const currentPaid = shift.amountPaid || 0;
        const shiftBalance = Math.max(0, shift.totalCharge - currentPaid);

        if (shiftBalance <= 0) continue;

        const allocationForThisShift = Math.min(shiftBalance, remainingToAllocate);
        const newPaidTotal = currentPaid + allocationForThisShift;
        const newStatus = newPaidTotal >= shift.totalCharge - 0.05 ? "PAID" : "PARTIAL";

        await tx.paymentRecord.create({
          data: {
            incomeLogId: shift.id,
            amount: allocationForThisShift,
            paymentDate,
            note: note ? `${note} (Contractor Installment)` : "Contractor Installment",
            recordedBy: user?.name || "System",
          },
        });

        await tx.incomeLog.update({
          where: { id: shift.id },
          data: {
            amountPaid: newPaidTotal,
            paymentStatus: newStatus,
          },
        });

        remainingToAllocate -= allocationForThisShift;
      }
    });

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error recording contractor installment:", error);
    return { error: "Failed to record installment." };
  }
}

// Add to src/app/actions/payments.ts

/**
 * Admin action to update an existing payment record and reconcile the parent shift invoice.
 */
export async function updatePaymentRecord(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const paymentId = formData.get("paymentId") as string;
  const newAmount = parseFloat(formData.get("amount") as string);
  const paymentDateStr = formData.get("paymentDate") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!paymentId || isNaN(newAmount) || newAmount <= 0) {
    return { error: "Please enter a valid payment amount greater than zero." };
  }

  try {
    const existingPayment = await prisma.paymentRecord.findUnique({
      where: { id: paymentId },
      include: { incomeLog: { include: { payments: true } } },
    });

    if (!existingPayment) {
      return { error: "Payment record not found." };
    }

    const shift = existingPayment.incomeLog;
    // Calculate new total paid on this shift by swapping this payment's amount
    const otherPaymentsTotal = shift.payments
      .filter((p) => p.id !== paymentId)
      .reduce((sum, p) => sum + p.amount, 0);

    const updatedPaidTotal = otherPaymentsTotal + newAmount;

    if (updatedPaidTotal > shift.totalCharge + 0.05) {
      return {
        error: `Updated payment exceeds total invoice charge of LKR ${shift.totalCharge.toLocaleString("en-LK")}.`,
      };
    }

    const updatedStatus = updatedPaidTotal >= shift.totalCharge - 0.05 ? "PAID" : updatedPaidTotal > 0 ? "PARTIAL" : "PENDING";

    await prisma.$transaction([
      prisma.paymentRecord.update({
        where: { id: paymentId },
        data: {
          amount: newAmount,
          paymentDate: paymentDateStr ? new Date(paymentDateStr) : existingPayment.paymentDate,
          note,
        },
      }),
      prisma.incomeLog.update({
        where: { id: shift.id },
        data: {
          amountPaid: updatedPaidTotal,
          paymentStatus: updatedStatus,
        },
      }),
    ]);

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${encodeURIComponent(shift.clientName)}`);
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return { error: error?.message || "Failed to update payment." };
  }
}

/**
 * Admin action to delete an accidental payment record and roll back the invoice status.
 */
export async function deletePaymentRecord(paymentId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  try {
    const payment = await prisma.paymentRecord.findUnique({
      where: { id: paymentId },
      include: { incomeLog: { include: { payments: true } } },
    });

    if (!payment) {
      return { error: "Payment record not found." };
    }

    const shift = payment.incomeLog;
    const remainingPaymentsTotal = shift.payments
      .filter((p) => p.id !== paymentId)
      .reduce((sum, p) => sum + p.amount, 0);

    const updatedStatus =
      remainingPaymentsTotal >= shift.totalCharge - 0.05
        ? "PAID"
        : remainingPaymentsTotal > 0
        ? "PARTIAL"
        : "PENDING";

    await prisma.$transaction([
      prisma.paymentRecord.delete({
        where: { id: paymentId },
      }),
      prisma.incomeLog.update({
        where: { id: shift.id },
        data: {
          amountPaid: remainingPaymentsTotal,
          paymentStatus: updatedStatus,
        },
      }),
    ]);

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${encodeURIComponent(shift.clientName)}`);
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return { error: error?.message || "Failed to delete payment." };
  }
}


export async function getContractorProfile(clientName: string) {
  const decodedClient = decodeURIComponent(clientName).trim();

  const shifts = await prisma.incomeLog.findMany({
    where: { clientName: { equals: decodedClient } },
    orderBy: { logDate: "desc" },
    include: {
      jcb: true,
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  const normalizedShifts = shifts.map((log) => {
    const isExplicitlyPaid = log.paymentStatus === "PAID";
    const effectivePaid = isExplicitlyPaid ? log.totalCharge : Math.min(log.amountPaid || 0, log.totalCharge);
    const balance = isExplicitlyPaid ? 0 : Math.max(0, log.totalCharge - effectivePaid);

    return {
      ...log,
      amountPaid: effectivePaid,
      balanceDue: balance,
    };
  });

  const totalBilled = normalizedShifts.reduce((acc, s) => acc + s.totalCharge, 0);
  const totalPaid = normalizedShifts.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalDue = Math.max(0, totalBilled - totalPaid);
  const totalPoints = normalizedShifts.reduce((acc, s) => acc + s.points, 0);

  // Flatten all individual payments with shift context
  const paymentHistory = normalizedShifts.flatMap((s) =>
    s.payments.map((p) => ({
      ...p,
      clientName: s.clientName,
      jcbPlate: s.jcb.plateNumber,
      siteLocation: s.siteLocation,
    }))
  ).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return {
    clientName: decodedClient,
    shifts: normalizedShifts,
    paymentHistory,
    metrics: {
      totalBilled,
      totalPaid,
      totalDue,
      totalPoints,
      shiftCount: normalizedShifts.length,
      unsettledCount: normalizedShifts.filter((s) => s.balanceDue > 0.05).length,
    },
  };
}