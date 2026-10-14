// src/app/dashboard/clients/page.tsx
import { getClientCreditData } from "@/app/actions/payments";
import { getCurrentUser } from "@/lib/auth";
import ContractorInstallmentModal from "@/components/ContractorInstallmentModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import { formatLKR } from "@/lib/calculations";
import { connection } from "next/server";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  CreditCard,
  Building,
  Check,
} from "lucide-react";

export default async function ClientLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; client?: string }>;
}) {
  await connection();
  const { filter, client: selectedClient } = await searchParams;
  const [{ invoices, clients, metrics }, user] = await Promise.all([
    getClientCreditData(),
    getCurrentUser(),
  ]);

  const isAdmin = user?.role === "ADMIN";

  // Apply filters
  const filteredInvoices = invoices.filter((item) => {
    if (filter === "UNSETTLED" && item.paymentStatus === "PAID") return false;
    if (selectedClient && item.clientName.trim() !== selectedClient.trim()) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Accounts Receivable
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold">
              Sallige Potha
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Client Credit Ledger & Installments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track billed work, record tranche payments one by one, and settle balances.
          </p>
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/clients"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              !filter && !selectedClient
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
          >
            All Shifts
          </Link>
          <Link
            href="/dashboard/clients?filter=UNSETTLED"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              filter === "UNSETTLED"
                ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                : "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-slate-200 dark:border-slate-800"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Pending Debts Only</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Invoiced Work
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatLKR(metrics.totalReceivables)}
          </p>
          <span className="text-xs text-slate-500">Gross billing across all JCBs</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Cash Collected
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatLKR(metrics.totalCollected)}
          </p>
          <span className="text-xs text-slate-500">Installments & settled amounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-5 shadow-sm bg-rose-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Pending Outstanding Debt</span>
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatLKR(metrics.totalOutstanding)}
          </p>
          <span className="text-xs text-slate-500">Total balance remaining across clients</span>
        </div>
      </div>

      {/* CONTRACTOR ACCOUNTS SUMMARY */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-500" />
          <span>Contractor Accounts Summary</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => {
            const hasDebt = c.totalDue > 0.05;

            return (
              <div
                key={c.clientName}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/dashboard/clients/${encodeURIComponent(c.clientName)}`}
                      className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-500 transition-colors flex items-center gap-1.5"
                    >
                      <span>{c.clientName}</span>
                      <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </Link>

                    {hasDebt ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 flex items-center gap-1 shrink-0">
                        <AlertCircle className="h-3 w-3" />
                        <span>PENDING</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3" />
                        <span>PAID</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/clients/${encodeURIComponent(c.clientName)}`}
                    className="text-xs text-slate-400 mt-1 block hover:underline"
                  >
                    {c.invoiceCount} total shift(s) &bull;{" "}
                    {hasDebt ? (
                      <span className="text-rose-500 font-semibold">{c.unsettledCount} pending bill(s)</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">All bills cleared</span>
                    )}
                  </Link>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 text-xs gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Billed</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatLKR(c.totalBilled)}
                      </span>
                    </div>
                    <div className="border-x border-slate-100 dark:border-slate-800 px-2 text-center">
                      <span className="text-slate-400 block text-[10px] uppercase">Paid</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatLKR(c.totalPaid)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold text-rose-500">
                        Balance
                      </span>
                      <span
                        className={`font-black ${
                          hasDebt ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatLKR(c.totalDue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {hasDebt && (
                    <ContractorInstallmentModal
                      clientName={c.clientName}
                      totalDue={c.totalDue}
                      totalBilled={c.totalBilled}
                      totalPaid={c.totalPaid}
                    />
                  )}
                  <Link
                    href={`/dashboard/clients/${encodeURIComponent(c.clientName)}`}
                    className="w-full block text-center py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    View History & Audit Trail &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice Tranche Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Shift Invoices & Payment Tranches
            </h3>
            <p className="text-xs text-slate-400">
              {selectedClient ? `Showing history for ${selectedClient}` : "All contractors and worksite assignments"}
            </p>
          </div>
          {selectedClient && (
            <Link
              href="/dashboard/clients"
              className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline"
            >
              Clear Client Filter &times;
            </Link>
          )}
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No invoices matching the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date / JCB</th>
                  <th className="px-5 py-3.5">Client & Site</th>
                  <th className="px-5 py-3.5 text-center">Points</th>
                  <th className="px-5 py-3.5 text-right">Bill Amount</th>
                  <th className="px-5 py-3.5 text-right">Paid</th>
                  <th className="px-5 py-3.5 text-right">Balance Due</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                  {isAdmin && <th className="px-5 py-3.5 text-center">Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium text-xs">
                {filteredInvoices.map((inv) => {
                  const paid = inv.amountPaid || 0;
                  const balance = Math.max(0, inv.totalCharge - paid);

                  const invoicePayload = {
                    invoiceNumber: inv.id.slice(-6).toUpperCase(),
                    clientName: inv.clientName,
                    siteLocation: inv.siteLocation,
                    date: new Date(inv.logDate).toLocaleDateString("en-GB"),
                    jcbPlate: inv.jcb.plateNumber,
                    jcbModel: inv.jcb.modelName,
                    driverName: inv.jcb.driverName,
                    startTime: inv.startTime || "Shift",
                    endTime: inv.endTime || "Standard",
                    durationHours: inv.durationHours,
                    points: inv.points,
                    ratePerPoint: inv.ratePerPoint,
                    totalCharge: inv.totalCharge,
                    paymentStatus: inv.paymentStatus,
                    notes: inv.notes,
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-500 mb-0.5">
                          {inv.jcb.plateNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(inv.logDate).toLocaleDateString("en-GB")}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/clients/${encodeURIComponent(inv.clientName)}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors"
                        >
                          {inv.clientName}
                        </Link>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {inv.siteLocation}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {inv.points.toFixed(1)} PTS
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatLKR(inv.totalCharge)}
                      </td>

                      <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatLKR(paid)}
                      </td>

                      <td className="px-5 py-4 text-right font-black">
                        {balance > 0.05 ? (
                          <span className="text-rose-600 dark:text-rose-400">{formatLKR(balance)}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">LKR 0.00</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : inv.paymentStatus === "PARTIAL"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {inv.paymentStatus === "PAID" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {inv.paymentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {balance > 0.05 && (
                            <RecordPaymentModal
                              incomeLogId={inv.id}
                              clientName={inv.clientName}
                              jcbPlate={inv.jcb.plateNumber}
                              totalCharge={inv.totalCharge}
                              amountPaid={paid}
                            />
                          )}
                          <DownloadInvoiceButton invoiceData={invoicePayload} />
                        </div>
                      </td>

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <AdminDeleteButton id={inv.id} type="INCOME" />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}