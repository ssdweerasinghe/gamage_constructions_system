// src/components/DownloadInvoiceButton.tsx
"use client";

import { generateShiftInvoicePDF, InvoiceData } from "@/lib/pdfGenerator";
import { FileDown } from "lucide-react";

export default function DownloadInvoiceButton({
  invoiceData,
}: {
  invoiceData: InvoiceData;
}) {
  return (
    <button
      onClick={() => generateShiftInvoicePDF(invoiceData)}
      title="Download Work Slip / Official Invoice (PDF)"
      className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500 transition-all shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
    >
      <FileDown className="h-3.5 w-3.5 text-amber-500" />
      <span>Work Slip</span>
    </button>
  );
}