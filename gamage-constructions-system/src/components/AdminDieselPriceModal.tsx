// src/components/AdminDieselPriceModal.tsx
"use client";

import { useState, useTransition } from "react";
import { updateDieselPrice } from "@/app/actions/config";
import { formatLKR } from "@/lib/calculations";
import { Fuel, Settings, X, Check, Loader2 } from "lucide-react";

export default function AdminDieselPriceModal({
  currentPrice,
}: {
  currentPrice: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(currentPrice.toString());
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSave() {
    setErrorMsg(null);
    const parsed = parseFloat(priceInput);

    startTransition(async () => {
      const res = await updateDieselPrice(parsed);
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
          setPriceInput(currentPrice.toString());
          setIsOpen(true);
        }}
        title="Admin: Set Diesel Price"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm active:scale-95"
      >
        <Settings className="h-3.5 w-3.5" />
        <span>Rate: {formatLKR(currentPrice)}/L</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <Fuel className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm">Configure Diesel Price</h3>
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

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Rate for 1 Liter of Diesel (LKR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                This rate will be used to auto-calculate the total expense whenever liters are entered.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>Save New Rate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}