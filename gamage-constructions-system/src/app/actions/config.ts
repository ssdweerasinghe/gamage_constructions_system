// src/app/actions/config.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const DIESEL_PRICE_KEY = "DIESEL_PRICE_PER_LITER";
const DEFAULT_DIESEL_PRICE = 330.0; // Default LKR per Liter

export async function getDieselPrice(): Promise<number> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: DIESEL_PRICE_KEY },
    });

    if (!config) {
      // Initialize if not present
      await prisma.systemConfig.create({
        data: {
          key: DIESEL_PRICE_KEY,
          value: DEFAULT_DIESEL_PRICE.toString(),
          description: "Current market price for 1 Liter of Auto Diesel in LKR",
        },
      });
      return DEFAULT_DIESEL_PRICE;
    }

    return parseFloat(config.value) || DEFAULT_DIESEL_PRICE;
  } catch (error) {
    return DEFAULT_DIESEL_PRICE;
  }
}

export async function updateDieselPrice(newPrice: number) {
  await requireAdmin();

  if (isNaN(newPrice) || newPrice <= 0) {
    return { error: "Please provide a valid price greater than 0." };
  }

  try {
    await prisma.systemConfig.upsert({
      where: { key: DIESEL_PRICE_KEY },
      update: { value: newPrice.toFixed(2) },
      create: {
        key: DIESEL_PRICE_KEY,
        value: newPrice.toFixed(2),
        description: "Current market price for 1 Liter of Auto Diesel in LKR",
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update diesel price." };
  }
}