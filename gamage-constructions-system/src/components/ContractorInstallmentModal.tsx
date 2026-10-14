// src/components/ContractorInstallmentModal.tsx
"use client";

import { useState, useTransition } from "react";
import { recordContractorInstallment } from "@/app/actions/payments";
import { formatLKR } from "@/lib/calculations";
import { PlusCircle, X, Check, Loader2, DollarSign } from "lucide-react";

interface ContractorInstallmentModalProps {
  clientName: string;
  totalDue: number;
  totalBilled: number;
  totalPaid: number;
}

export default function ContractorInstallmentModal({
  clientName,
  totalDue,
  totalBilled,
  totalPaid,
}: ContractorInstallmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState<string>(totalDue.toString());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("clientName", clientName);

    startTransition(async () => {
      const res = await recordContractorInstallment(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setInstallmentAmount(totalDue.toString());
          setIsOpen(true);
        }}
        className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span>Add Installment ({formatLKR(totalDue)})</span>
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Record Client Installment</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Contractor: <strong className="text-amber-500">{clientName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-4 grid grid-cols-3 text-center text-xs">
              <div>
                <span className="text-slate-400 block">Total Billed</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatLKR(totalBilled)}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Already Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatLKR(totalPaid)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-rose-500">Total Pending</span>
                <span className="font-black text-rose-600 dark:text-rose-400">
                  {formatLKR(totalDue)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Installment Amount Received (LKR) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    max={totalDue}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {/* Quick Shortcuts */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setInstallmentAmount(totalDue.toString())}
                    className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    Full Settlement ({formatLKR(totalDue)})
                  </button>
                  {totalDue > 10000 && (
                    <button
                      type="button"
                      onClick={() => setInstallmentAmount("10000")}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    >
                      Rs. 10,000
                    </button>
                  )}
                  {totalDue > 25000 && (
                    <button
                      type="button"
                      onClick={() => setInstallmentAmount("25000")}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    >
                      Rs. 25,000
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Installment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Payment Reference / Mode
                </label>
                <input
                  type="text"
                  name="note"
                  placeholder="e.g. Tranche 1 / Cash at site / Cheque deposit"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || parseFloat(installmentAmount) <= 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Confirm Installment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}