// src/app/actions/expense.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createExpenseLog(formData: FormData) {
  const jcbId = formData.get("jcbId") as string;
  const expenseDateStr = formData.get("expenseDate") as string;
  const category = (formData.get("category") as string) || "MAINTENANCE";
  const amount = parseFloat(formData.get("amount") as string);
  const liters = formData.get("liters") ? parseFloat(formData.get("liters") as string) : null;
  const meterReading = formData.get("meterReading") ? parseFloat(formData.get("meterReading") as string) : null;
  const description = (formData.get("description") as string)?.trim();

  if (!jcbId || !expenseDateStr || isNaN(amount) || !description) {
    return { error: "Please provide JCB, date, amount, and description." };
  }

  try {
    await prisma.expenseLog.create({
      data: {
        jcbId,
        expenseDate: new Date(expenseDateStr),
        category,
        amount,
        liters,
        meterReading,
        description,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jcb");
    return { success: true };
  } catch {
    return { error: "Failed to log expense record. Please try again." };
  }
}

export async function getExpenseLogs() {
  return await prisma.expenseLog.findMany({
    orderBy: { expenseDate: "desc" },
    include: {
      jcb: true,
    },
  });
}