// src/components/RecordPaymentModal.tsx
"use client";

import { useState, useTransition } from "react";
import { recordClientPayment } from "@/app/actions/payments";
import { formatLKR } from "@/lib/calculations";
import { DollarSign, X, Check, Loader2, CreditCard } from "lucide-react";

interface RecordPaymentModalProps {
  incomeLogId: string;
  clientName: string;
  jcbPlate: string;
  totalCharge: number;
  amountPaid: number;
}

export default function RecordPaymentModal({
  incomeLogId,
  clientName,
  jcbPlate,
  totalCharge,
  amountPaid,
}: RecordPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const balanceDue = Math.max(0, totalCharge - (amountPaid || 0));
  const [paymentAmount, setPaymentAmount] = useState<string>(balanceDue.toString());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("incomeLogId", incomeLogId);

    startTransition(async () => {
      const res = await recordClientPayment(formData);
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
        onClick={() => {
          setPaymentAmount(balanceDue.toString());
          setIsOpen(true);
        }}
        className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
      >
        <CreditCard className="h-3.5 w-3.5" />
        <span>Pay / Tranche</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Record Client Payment</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {clientName} &bull; {jcbPlate}
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

            {/* Financial Overview for this bill */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-4 grid grid-cols-3 text-center text-xs">
              <div>
                <span className="text-slate-400 block">Total Bill</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatLKR(totalCharge)}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Already Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatLKR(amountPaid || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Balance Due</span>
                <span className="font-black text-rose-600 dark:text-rose-400">
                  {formatLKR(balanceDue)}
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
                  Tranche Amount Received (LKR) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={balanceDue}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(balanceDue.toString())}
                    className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    Full Balance ({formatLKR(balanceDue)})
                  </button>
                  {balanceDue > 10000 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount("10000")}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    >
                      Rs. 10,000
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode & Reference
                </label>
                <input
                  type="text"
                  name="note"
                  placeholder="e.g. Cash handed over at site / Commercial Bank Transfer"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  disabled={isPending || parseFloat(paymentAmount) <= 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Save Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}