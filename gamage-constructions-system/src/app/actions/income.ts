// src/app/actions/income.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculatePoints, RATE_PER_POINT } from "@/lib/calculations";

export async function createIncomeLog(formData: FormData) {
  const jcbId = formData.get("jcbId") as string;
  const clientName = (formData.get("clientName") as string)?.trim();
  const siteLocation = (formData.get("siteLocation") as string)?.trim();
  const logDateStr = formData.get("logDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const paymentStatus = (formData.get("paymentStatus") as string) || "PENDING";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!jcbId || !clientName || !siteLocation || !logDateStr || !startTime || !endTime) {
    return { error: "Please provide all required shift details." };
  }

  // Live calculation verification on server side
  const calculation = calculatePoints(startTime, endTime);
  if (calculation.totalMinutes <= 0) {
    return { error: "End time must be after start time." };
  }

  try {
    await prisma.incomeLog.create({
      data: {
        jcbId,
        clientName,
        siteLocation,
        logDate: new Date(logDateStr),
        startTime,
        endTime,
        durationHours: calculation.durationHours,
        points: calculation.points,
        ratePerPoint: RATE_PER_POINT,
        totalCharge: calculation.totalCharge,
        paymentStatus,
        notes,
      },
    });

    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jcb");
    return { success: true };
  } catch {
    return { error: "Failed to record income log. Please try again." };
  }
}

export async function getIncomeLogs() {
  return await prisma.incomeLog.findMany({
    orderBy: { logDate: "desc" },
    include: {
      jcb: true,
    },
  });
}