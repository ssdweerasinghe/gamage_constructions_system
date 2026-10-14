// src/components/ExportMonthlyReportButton.tsx
"use client";

import { generateMonthlyStatementPDF, MonthlyStatementData } from "@/lib/pdfGenerator";
import { Printer } from "lucide-react";

export default function ExportMonthlyReportButton({
  data,
}: {
  data: MonthlyStatementData;
}) {
  return (
    <button
      onClick={() => generateMonthlyStatementPDF(data)}
      className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-xs shadow-md active:scale-95 transition-all"
    >
      <Printer className="h-4 w-4 text-amber-500" />
      <span>Print Monthly Statement</span>
    </button>
  );
}