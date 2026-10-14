// src/app/actions/dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [incomes, expenses, machines] = await Promise.all([
    prisma.incomeLog.findMany({
      orderBy: { logDate: "asc" },
      include: { jcb: true },
    }),
    prisma.expenseLog.findMany({
      orderBy: { expenseDate: "asc" },
      include: { jcb: true },
    }),
    prisma.jcbMachine.findMany(),
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.totalCharge, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Current Month calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyIncome = incomes
    .filter((i) => {
      const d = new Date(i.logDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, item) => sum + item.totalCharge, 0);

  const monthlyExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expenseDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  // Monthly trends for the current year (Jan - Dec)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthlyChartData = monthNames.map((month, index) => {
    const inc = incomes
      .filter((i) => {
        const d = new Date(i.logDate);
        return d.getFullYear() === currentYear && d.getMonth() === index;
      })
      .reduce((sum, item) => sum + item.totalCharge, 0);

    const exp = expenses
      .filter((e) => {
        const d = new Date(e.expenseDate);
        return d.getFullYear() === currentYear && d.getMonth() === index;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      month,
      income: inc,
      expenses: exp,
      profit: inc - exp,
    };
  });

  // Expense breakdown by category for Pie Chart
  const expenseCategories = ["FUEL", "MAINTENANCE", "REPAIR", "SALARY", "OTHER"];
  const expensePieData = expenseCategories
    .map((cat) => {
      const total = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        name: cat,
        value: total,
      };
    })
    .filter((item) => item.value > 0);

  return {
    metrics: {
      totalIncome,
      totalExpenses,
      netProfit,
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit,
      activeMachines: machines.filter((m) => m.status === "ACTIVE").length,
      totalMachines: machines.length,
    },
    monthlyChartData,
    expensePieData,
    recentIncomes: incomes.slice(-5).reverse(),
  };
}