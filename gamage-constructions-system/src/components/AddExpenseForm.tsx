// src/components/AddExpenseForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createExpenseLog } from "@/app/actions/expense";
import { formatLKR } from "@/lib/calculations";
import { TrendingDown, Fuel, Wrench, Calendar, Gauge, CheckCircle2, Sparkles } from "lucide-react";

interface JcbOption {
  id: string;
  plateNumber: string;
  modelName: string;
}

interface AddExpenseFormProps {
  jcbList: JcbOption[];
  dieselPricePerLiter: number;
}

export default function AddExpenseForm({
  jcbList,
  dieselPricePerLiter,
}: AddExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState("FUEL");
  const [liters, setLiters] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-calculated amount for FUEL
  const parsedLiters = parseFloat(liters) || 0;
  const computedFuelAmount = Math.round(parsedLiters * dieselPricePerLiter * 100) / 100;
  
  // Final amount to submit
  const effectiveAmount =
    category === "FUEL" && parsedLiters > 0
      ? computedFuelAmount
      : parseFloat(manualAmount) || 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Override amount field with the calculated or entered value
    formData.set("amount", effectiveAmount.toString());

    startTransition(async () => {
      const result = await createExpenseLog(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg(
          category === "FUEL"
            ? `Fuel recorded: ${parsedLiters}L @ ${formatLKR(dieselPricePerLiter)}/L -> ${formatLKR(effectiveAmount)}`
            : "Expense record saved successfully!"
        );
        form.reset();
        setLiters("");
        setManualAmount("");
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
            Fuel refills with auto-calculation ({formatLKR(dieselPricePerLiter)}/L), maintenance, and repairs.
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
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="FUEL">FUEL (Auto Diesel Refill)</option>
              <option value="MAINTENANCE">MAINTENANCE (Filter, Greasing, Oil)</option>
              <option value="REPAIR">REPAIR (Mechanical Breakdown)</option>
              <option value="SALARY">OPERATOR WAGE / ALLOWANCE</option>
              <option value="OTHER">OTHER OVERHEAD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Date *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                name="expenseDate"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* FUEL DYNAMIC CALCULATION BLOCK */}
        {category === "FUEL" ? (
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Liters Input */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Fuel className="h-4 w-4" />
                  <span>Diesel Volume (Liters) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    name="liters"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    required
                    placeholder="e.g. 50"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/60 rounded-xl px-4 py-3 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    Liters
                  </span>
                </div>
                {/* Quick Add buttons */}
                <div className="flex gap-1.5 mt-2">
                  {[20, 35, 50, 75, 100].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setLiters(quick.toString())}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-colors"
                    >
                      +{quick}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Multiplier Info */}
              <div className="sm:col-span-3 text-center sm:text-left border-y sm:border-y-0 sm:border-x border-slate-200 dark:border-slate-800 py-2 sm:py-0 sm:px-4">
                <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  Configured Rate
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {formatLKR(dieselPricePerLiter)}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">per 1 Liter</span>
              </div>

              {/* Total Auto-calculated Outflow */}
              <div className="sm:col-span-4 text-center sm:text-right">
                <span className="text-[11px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center sm:justify-end gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Auto-Calculated Outflow</span>
                </span>
                <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {formatLKR(computedFuelAmount)}
                </p>
                <span className="text-xs text-slate-400">
                  {parsedLiters}L &times; {formatLKR(dieselPricePerLiter)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Amount input for Non-Fuel Expenses */
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Total Amount (LKR) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                Rs.
              </span>
              <input
                type="number"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                required
                placeholder="e.g. 15000.00"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meter Reading (Hours) - Optional
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Gauge className="h-4 w-4" />
              </span>
              <input
                type="number"
                step="0.1"
                name="meterReading"
                placeholder="e.g. 1280.5"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              defaultValue={category === "FUEL" ? "Diesel Refill" : ""}
              placeholder="e.g. Lanka IOC Auto Diesel filling 45L or Hydraulic hose repair"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || jcbList.length === 0 || effectiveAmount <= 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <TrendingDown className="h-4 w-4" />
            <span>{isPending ? "Recording Outflow..." : "Record Fleet Expense"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}