// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data...");

  // 1. Create Business Owner
  const hashedPassword = await bcrypt.hash("Gamage@2026", 10);
  await prisma.user.upsert({
    where: { email: "owner@gamageconstructions.lk" },
    update: {},
    create: {
      email: "owner@gamageconstructions.lk",
      name: "Mr. Gamage",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  // 2. Add JCB Machinery
  const jcb1 = await prisma.jcbMachine.upsert({
    where: { plateNumber: "SP-CAB-2045" },
    update: {},
    create: {
      plateNumber: "SP-CAB-2045",
      modelName: "JCB 3DX Plus EcoMax",
      driverName: "Sunil Shantha",
      driverPhone: "0771234567",
      baseMeterHours: 1250.5,
      status: "ACTIVE",
    },
  });

  await prisma.jcbMachine.upsert({
    where: { plateNumber: "WP-DAA-9081" },
    update: {},
    create: {
      plateNumber: "WP-DAA-9081",
      modelName: "JCB 4DX Heavy Duty",
      driverName: "Kamal Perera",
      driverPhone: "0719876543",
      baseMeterHours: 840.0,
      status: "ACTIVE",
    },
  });

  // 3. Add Sample Income Record (1 pt = 1 hr = LKR 7000)[cite: 1]
  // 4 hours 30 mins = 4.5 points = LKR 31,500
  await prisma.incomeLog.create({
    data: {
      jcbId: jcb1.id,
      clientName: "Southern Highway Extension Subcontract",
      siteLocation: "Matara - Godagama",
      logDate: new Date(),
      startTime: "08:00",
      endTime: "12:30",
      durationHours: 4.5,
      points: 4.5,
      ratePerPoint: 7000.0,
      totalCharge: 31500.0,
      paymentStatus: "PAID",
      notes: "Canal excavation shift 1",
    },
  });

  // 4. Add Sample Expenses
  await prisma.expenseLog.create({
    data: {
      jcbId: jcb1.id,
      expenseDate: new Date(),
      category: "FUEL",
      amount: 14500.0,
      liters: 40.0,
      meterReading: 1255.0,
      description: "Auto Diesel replenishment Lanka IOC",
    },
  });

  await prisma.expenseLog.create({
    data: {
      jcbId: jcb1.id,
      expenseDate: new Date(),
      category: "MAINTENANCE",
      amount: 6000.0,
      description: "Hydraulic hose replacement & greasing",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });