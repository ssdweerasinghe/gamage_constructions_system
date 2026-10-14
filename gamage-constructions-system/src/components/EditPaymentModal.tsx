// src/components/EditPaymentModal.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePaymentRecord } from "@/app/actions/payments";
import { formatLKR } from "@/lib/calculations";
import { Pencil, X, Check, Loader2, DollarSign } from "lucide-react";

interface EditPaymentModalProps {
  payment: {
    id: string;
    amount: number;
    paymentDate: string;
    note?: string | null;
    jcbPlate?: string;
  };
}

export default function EditPaymentModal({ payment }: EditPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("paymentId", payment.id);

    startTransition(async () => {
      const res = await updatePaymentRecord(formData);
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
        onClick={() => setIsOpen(true)}
        title="Admin: Edit Installment"
        className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Installment Record</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ID: {payment.id.slice(-6).toUpperCase()}
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

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Tranche Amount (LKR) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    defaultValue={payment.amount}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={payment.paymentDate.split("T")[0]}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Reference / Payment Note
                </label>
                <input
                  type="text"
                  name="note"
                  defaultValue={payment.note || ""}
                  placeholder="e.g. Bank deposit / cash"
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
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}