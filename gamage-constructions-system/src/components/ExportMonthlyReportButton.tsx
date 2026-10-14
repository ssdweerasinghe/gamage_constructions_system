// src/components/ExportMonthlyReportButton.tsx
"use client";

import { useState } from "react";
import { generateMonthlyStatementPDF, MonthlyStatementData } from "@/lib/pdfGenerator";
import { Printer, Calendar, X, Download } from "lucide-react";

interface RawShift {
  date: string; // ISO string or parsable date
  jcbPlate: string;
  client: string;
  hours: number;
  points: number;
  amount: number;
  status: string;
}

interface RawExpense {
  date: string;
  jcbPlate: string;
  category: string;
  description: string;
  amount: number;
}

interface ExportMonthlyReportProps {
  shifts: RawShift[];
  expenses: RawExpense[];
}

export default function ExportMonthlyReportButton({
  shifts,
  expenses,
}: ExportMonthlyReportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // Available year options around current year
  const years = [2024, 2025, 2026, 2027, 2028];

  function handleExport() {
    // Filter records for the selected month and year
    const filteredShifts = shifts.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const filteredExpenses = expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const grossIncome = filteredShifts.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = grossIncome - totalExpenses;
    const totalHours = filteredShifts.reduce((acc, curr) => acc + curr.hours, 0);
    const totalPoints = filteredShifts.reduce((acc, curr) => acc + curr.points, 0);

    const monthLabel = months.find((m) => m.value === selectedMonth)?.label || "";
    const monthYearTitle = `${monthLabel} ${selectedYear}`;

    const statementPayload: MonthlyStatementData = {
      monthYear: monthYearTitle,
      totalShifts: filteredShifts.length,
      totalHours,
      totalPoints,
      grossIncome,
      totalExpenses,
      netProfit,
      shifts: filteredShifts.map((s) => ({
        ...s,
        date: new Date(s.date).toLocaleDateString("en-GB"),
      })),
      expenses: filteredExpenses.map((e) => ({
        ...e,
        date: new Date(e.date).toLocaleDateString("en-GB"),
      })),
    };

    generateMonthlyStatementPDF(statementPayload);
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-xs shadow-md active:scale-95 transition-all"
      >
        <Printer className="h-4 w-4 text-amber-500" />
        <span>Monthly Statement</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Select Billing Period</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filter and generate executive statement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                <Download className="h-4 w-4" />
                <span>Generate PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}