// src/components/EditExpenseModal.tsx
"use client";

import { useState, useTransition } from "react";
import { updateExpenseLog } from "@/app/actions/admin";
import { Pencil, X, TrendingDown, Loader2, Check } from "lucide-react";

interface EditExpenseModalProps {
  expense: {
    id: string;
    jcbId: string;
    category: string;
    expenseDate: string;
    amount: number;
    liters?: number | null;
    meterReading?: number | null;
    description: string;
  };
  jcbList: { id: string; plateNumber: string; modelName: string }[];
}

export default function EditExpenseModal({ expense, jcbList }: EditExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("id", expense.id);

    startTransition(async () => {
      const res = await updateExpenseLog(formData);
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
        title="Admin: Edit Expense"
        className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Expense Record</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ID: {expense.id.slice(-6).toUpperCase()}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Select JCB *
                  </label>
                  <select
                    name="jcbId"
                    defaultValue={expense.jcbId}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  >
                    {jcbList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.plateNumber} ({j.modelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    defaultValue={expense.expenseDate.split("T")[0]}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue={expense.category}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="FUEL">FUEL</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="REPAIR">REPAIR</option>
                    <option value="SALARY">SALARY</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    defaultValue={expense.amount}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Diesel Volume (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="liters"
                    defaultValue={expense.liters ?? ""}
                    placeholder="Optional"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Meter Reading (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="meterReading"
                    defaultValue={expense.meterReading ?? ""}
                    placeholder="Optional"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={expense.description}
                  required
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}