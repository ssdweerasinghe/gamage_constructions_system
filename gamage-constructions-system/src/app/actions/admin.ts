// src/app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateFromPoints, RATE_PER_POINT } from "@/lib/calculations";

// ==========================================
// 1. JCB MACHINERY OPERATIONS
// ==========================================

export async function updateJcbMachine(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const plateNumber = (formData.get("plateNumber") as string)?.trim().toUpperCase();
  const modelName = (formData.get("modelName") as string)?.trim();
  const driverName = (formData.get("driverName") as string)?.trim();
  const driverPhone = (formData.get("driverPhone") as string)?.trim();
  const baseMeterHours = parseFloat(formData.get("baseMeterHours") as string) || 0;
  const status = (formData.get("status") as string) || "ACTIVE";

  if (!id || !plateNumber || !modelName || !driverName || !driverPhone) {
    return { error: "Please fill in all required JCB details." };
  }

  try {
    await prisma.jcbMachine.update({
      where: { id },
      data: {
        plateNumber,
        modelName,
        driverName,
        driverPhone,
        baseMeterHours,
        status,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jcb");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Failed to update JCB machine." };
  }
}

export async function deleteJcbMachine(jcbId: string) {
  await requireAdmin();

  try {
    await prisma.jcbMachine.delete({
      where: { id: jcbId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jcb");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete JCB machine. Ensure dependent shift data is cleared." };
  }
}

// ==========================================
// 2. OPERATIONAL INCOME / SHIFT OPERATIONS
// ==========================================

export async function updateIncomeLog(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const jcbId = formData.get("jcbId") as string;
  const clientName = (formData.get("clientName") as string)?.trim();
  const siteLocation = (formData.get("siteLocation") as string)?.trim();
  const logDateStr = formData.get("logDate") as string;
  const pointsInput = parseFloat(formData.get("points") as string);
  const paymentStatus = (formData.get("paymentStatus") as string) || "PENDING";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!id || !jcbId || !clientName || !siteLocation || !logDateStr || isNaN(pointsInput) || pointsInput <= 0) {
    return { error: "Please fill in all shift billing fields with valid points." };
  }

  const { points, totalCharge, equivalentHours } = calculateFromPoints(pointsInput);

  try {
    const existing = await prisma.incomeLog.findUnique({ where: { id } });
    if (!existing) return { error: "Record not found." };

    // Self-correct amountPaid if status is explicitly shifted to PAID
    let amountPaid = existing.amountPaid || 0;
    if (paymentStatus === "PAID") {
      amountPaid = totalCharge;
    } else if (paymentStatus === "PENDING" && existing.paymentStatus === "PAID") {
      amountPaid = 0;
    }

    await prisma.incomeLog.update({
      where: { id },
      data: {
        jcbId,
        clientName,
        siteLocation,
        logDate: new Date(logDateStr),
        durationHours: equivalentHours,
        points,
        ratePerPoint: RATE_PER_POINT,
        totalCharge,
        amountPaid,
        paymentStatus,
        notes,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Failed to update operational shift log." };
  }
}

export async function deleteIncomeLog(logId: string) {
  await requireAdmin();

  try {
    await prisma.incomeLog.delete({
      where: { id: logId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete income log." };
  }
}

// ==========================================
// 3. FLEET EXPENSE OPERATIONS
// ==========================================

export async function updateExpenseLog(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const jcbId = formData.get("jcbId") as string;
  const category = (formData.get("category") as string) || "MAINTENANCE";
  const expenseDateStr = formData.get("expenseDate") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const liters = formData.get("liters") ? parseFloat(formData.get("liters") as string) : null;
  const meterReading = formData.get("meterReading") ? parseFloat(formData.get("meterReading") as string) : null;
  const description = (formData.get("description") as string)?.trim();

  if (!id || !jcbId || !expenseDateStr || isNaN(amount) || amount <= 0 || !description) {
    return { error: "Please provide valid expense details and an amount greater than zero." };
  }

  try {
    await prisma.expenseLog.update({
      where: { id },
      data: {
        jcbId,
        category,
        expenseDate: new Date(expenseDateStr),
        amount,
        liters,
        meterReading,
        description,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Failed to update expense record." };
  }
}

export async function deleteExpenseLog(expenseId: string) {
  await requireAdmin();

  try {
    await prisma.expenseLog.delete({
      where: { id: expenseId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense record." };
  }
}