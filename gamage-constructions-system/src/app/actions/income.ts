// src/app/actions/income.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculateFromPoints, RATE_PER_POINT } from "@/lib/calculations";

export async function createIncomeLog(formData: FormData) {
  const jcbId = formData.get("jcbId") as string;
  const clientName = (formData.get("clientName") as string)?.trim();
  const siteLocation = (formData.get("siteLocation") as string)?.trim();
  const logDateStr = formData.get("logDate") as string;
  const pointsInput = parseFloat(formData.get("points") as string);
  const startTime = (formData.get("startTime") as string)?.trim() || "08:00";
  const endTime = (formData.get("endTime") as string)?.trim() || "N/A";
  const paymentStatus = (formData.get("paymentStatus") as string) || "PENDING";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!jcbId || !clientName || !siteLocation || !logDateStr || isNaN(pointsInput)) {
    return { error: "Please enter JCB, client, location, date, and points." };
  }

  if (pointsInput <= 0) {
    return { error: "Points must be greater than 0.0" };
  }

  const { points, totalCharge, equivalentHours } = calculateFromPoints(pointsInput);

  try {
    await prisma.incomeLog.create({
      data: {
        jcbId,
        clientName,
        siteLocation,
        logDate: new Date(logDateStr),
        startTime,
        endTime,
        durationHours: equivalentHours,
        points,
        ratePerPoint: RATE_PER_POINT,
        totalCharge,
        paymentStatus,
        notes,
      },
    });

    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jcb");
    return { success: true };
  } catch (error) {
    return { error: "Failed to record shift points log. Please try again." };
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