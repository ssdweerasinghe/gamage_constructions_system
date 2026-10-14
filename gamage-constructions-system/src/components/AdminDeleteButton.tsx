// src/components/AdminDeleteButton.tsx
"use client";

import { useState, useTransition } from "react";
import { deleteJcbMachine, deleteIncomeLog, deleteExpenseLog } from "@/app/actions/admin";
import { Trash2, Loader2 } from "lucide-react";

interface AdminDeleteButtonProps {
  id: string;
  type: "JCB" | "INCOME" | "EXPENSE";
  label?: string;
}

export default function AdminDeleteButton({ id, type, label }: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      if (type === "JCB") await deleteJcbMachine(id);
      if (type === "INCOME") await deleteIncomeLog(id);
      if (type === "EXPENSE") await deleteExpenseLog(id);
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Admin Delete"
      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label && <span>{label}</span>}
    </button>
  );
}