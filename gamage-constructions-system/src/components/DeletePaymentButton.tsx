// src/components/DeletePaymentButton.tsx
"use client";

import { useState, useTransition } from "react";
import { deletePaymentRecord } from "@/app/actions/payments";
import { Trash2, Loader2 } from "lucide-react";

export default function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deletePaymentRecord(paymentId);
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Admin: Delete Payment"
      className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}