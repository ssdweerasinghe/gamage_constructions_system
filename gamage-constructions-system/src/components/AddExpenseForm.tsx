// src/components/AddExpenseForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createExpenseLog } from "@/app/actions/expense";
import { TrendingDown, Fuel, Wrench, Calendar, Gauge, CheckCircle2 } from "lucide-react";

interface JcbOption {
  id: string;
  plateNumber: string;
  modelName: string;
}

export default function AddExpenseForm({ jcbList }: { jcbList: JcbOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState("FUEL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createExpenseLog(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg("Expense record saved successfully!");
        form.reset();
        setCategory("FUEL");
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl text-slate-900 dark:text-white">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
          <TrendingDown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Record Fleet Expense</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track diesel fuel refills, mechanical repairs, greasing, and maintenance costs.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select JCB Machine *
            </label>
            <select
              name="jcbId"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Choose Equipment --</option>
              {jcbList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.plateNumber} ({j.modelName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Category *
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="FUEL">FUEL (Diesel Refill)</option>
              <option value="MAINTENANCE">MAINTENANCE (Filter, Greasing, Oil)</option>
              <option value="REPAIR">REPAIR (Mechanical Breakdown)</option>
              <option value="SALARY">OPERATOR WAGE / ALLOWANCE</option>
              <option value="OTHER">OTHER OPERATIONAL OVERHEAD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Date *
            </label>
            <input
              type="date"
              name="expenseDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Total Amount (LKR) *
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              placeholder="e.g. 15000.00"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {category === "FUEL" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Diesel Volume (Liters)
              </label>
              <input
                type="number"
                step="0.1"
                name="liters"
                placeholder="e.g. 45.0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meter Reading (Hours)
            </label>
            <input
              type="number"
              step="0.1"
              name="meterReading"
              placeholder="e.g. 1280.5"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Description & Notes *
          </label>
          <input
            type="text"
            name="description"
            required
            placeholder="e.g. Lanka IOC Auto Diesel filling 45L or Hydraulic hose repair"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || jcbList.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <TrendingDown className="h-4 w-4" />
            <span>{isPending ? "Logging Expense..." : "Record Fleet Expense"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}