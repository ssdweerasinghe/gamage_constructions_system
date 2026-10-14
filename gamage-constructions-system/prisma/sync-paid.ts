// prisma/sync-paid.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Synchronizing legacy PAID records...");

  const paidLogs = await prisma.incomeLog.findMany({
    where: { paymentStatus: "PAID" },
  });

  for (const log of paidLogs) {
    if (log.amountPaid < log.totalCharge) {
      await prisma.incomeLog.update({
        where: { id: log.id },
        data: { amountPaid: log.totalCharge },
      });
      console.log(`Synced: ${log.clientName} (LKR ${log.totalCharge})`);
    }
  }

  console.log("Database successfully synced!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });