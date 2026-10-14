// src/app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete JCB machine. Ensure no conflicting records exist." };
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
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete income log." };
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