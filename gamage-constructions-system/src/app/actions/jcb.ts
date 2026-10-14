// src/app/actions/jcb.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addJcbMachine(formData: FormData) {
  const plateNumber = (formData.get("plateNumber") as string)?.trim().toUpperCase();
  const modelName = (formData.get("modelName") as string)?.trim();
  const driverName = (formData.get("driverName") as string)?.trim();
  const driverPhone = (formData.get("driverPhone") as string)?.trim();
  const baseMeterHours = parseFloat(formData.get("baseMeterHours") as string) || 0.0;
  const status = (formData.get("status") as string) || "ACTIVE";

  if (!plateNumber || !modelName || !driverName || !driverPhone) {
    return { error: "Please fill in all required fields." };
  }

  try {
    await prisma.jcbMachine.create({
      data: {
        plateNumber,
        modelName,
        driverName,
        driverPhone,
        baseMeterHours,
        status,
      },
    });

    revalidatePath("/dashboard/jcb");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError.code === "P2002") {
      return { error: `JCB with plate number '${plateNumber}' already exists.` };
    }

    return { error: "Failed to register JCB machine. Please try again." };
  }
}

export async function getJcbMachines() {
  return await prisma.jcbMachine.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      incomeLogs: true,
      expenseLogs: true,
    },
  });
}