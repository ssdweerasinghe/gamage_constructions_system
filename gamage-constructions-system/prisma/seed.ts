// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding accounts with Owner and Admin roles...");

  // 1. Owner Account
  const ownerPassword = await bcrypt.hash("Gamage@2026", 10);
  await prisma.user.upsert({
    where: { email: "owner@gamageconstructions.lk" },
    update: { role: "OWNER" },
    create: {
      email: "owner@gamageconstructions.lk",
      name: "Mr. Gamage",
      password: ownerPassword,
      role: "OWNER",
    },
  });

  // 2. Admin Account (Full delete & edit permissions)
  const adminPassword = await bcrypt.hash("Admin@Gamage2026", 10);
  await prisma.user.upsert({
    where: { email: "admin@gamageconstructions.lk" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@gamageconstructions.lk",
      name: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Accounts created successfully:");
  console.log("Owner: owner@gamageconstructions.lk / Gamage@2026");
  console.log("Admin: admin@gamageconstructions.lk / Admin@Gamage2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });