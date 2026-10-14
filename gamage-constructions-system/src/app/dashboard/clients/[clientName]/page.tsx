// src/app/dashboard/clients/[clientName]/page.tsx
import { getContractorProfile } from "@/app/actions/payments";
import { getCurrentUser } from "@/lib/auth";
import { formatLKR } from "@/lib/calculations";
import ContractorInstallmentModal from "@/components/ContractorInstallmentModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import EditPaymentModal from "@/components/EditPaymentModal";
import DeletePaymentButton from "@/components/DeletePaymentButton";
import { connection } from "next/server";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  Check,
  History,
} from "lucide-react";

export default async function ContractorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientName: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const { clientName } = await params;
  const { tab = "invoices" } = await searchParams;

  const [contractorData, user] = await Promise.all([
    getContractorProfile(clientName),
    getCurrentUser(),
  ]);

  const isAdmin = user?.role === "ADMIN";
  const { metrics, shifts, paymentHistory } = contractorData;
  const hasDebt = metrics.totalDue > 0.05;

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Contractor Accounts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {contractorData.clientName}
                </h2>
                <span className="text-xs text-slate-400">
                  Individual Contractor Credit Profile & Payment Ledger
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasDebt ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>PENDING: {formatLKR(metrics.totalDue)}</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>ALL BILLS SETTLED</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
            Total Billed Work
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatLKR(metrics.totalBilled)}
          </p>
          <span className="text-[11px] text-slate-500">{metrics.shiftCount} shift invoices</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-bold uppercase tracking-wider">
            Paid Installments
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatLKR(metrics.totalPaid)}
          </p>
          <span className="text-[11px] text-slate-500">{paymentHistory.length} tranche deposit(s)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-4 shadow-sm bg-rose-500/5">
          <span className="text-rose-600 dark:text-rose-400 block text-[11px] font-bold uppercase tracking-wider">
            Outstanding Due
          </span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatLKR(metrics.totalDue)}
          </p>
          <span className="text-[11px] text-slate-500">{metrics.unsettledCount} pending shift bill(s)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-amber-600 dark:text-amber-500 block text-[11px] font-bold uppercase tracking-wider">
            Operational Points
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.totalPoints.toFixed(1)} PTS
          </p>
          <span className="text-[11px] text-slate-500">Cumulative machinery run</span>
        </div>
      </div>

      {/* Installment Action Trigger */}
      {hasDebt && (
        <div className="max-w-md">
          <ContractorInstallmentModal
            clientName={contractorData.clientName}
            totalDue={metrics.totalDue}
            totalBilled={metrics.totalBilled}
            totalPaid={metrics.totalPaid}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4">
        <Link
          href={`/dashboard/clients/${encodeURIComponent(clientName)}?tab=invoices`}
          className={`pb-3 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            tab === "invoices"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Shift Invoices ({shifts.length})</span>
        </Link>
        <Link
          href={`/dashboard/clients/${encodeURIComponent(clientName)}?tab=payments`}
          className={`pb-3 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            tab === "payments"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Tranche Payment History ({paymentHistory.length})</span>
        </Link>
      </div>

      {/* TAB 1: SHIFTS / INVOICES */}
      {tab === "invoices" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Invoiced Equipment Shifts
            </h3>
            <span className="text-xs text-slate-400">Chronological billing records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Date / JCB</th>
                  <th className="px-5 py-3">Site Location</th>
                  <th className="px-5 py-3 text-center">Points</th>
                  <th className="px-5 py-3 text-right">Bill Amount</th>
                  <th className="px-5 py-3 text-right">Paid</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium text-xs">
                {shifts.map((inv) => {
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
                        <div className="text-slate-900 dark:text-white flex items-center gap-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{inv.siteLocation}</span>
                        </div>
                        {inv.notes && (
                          <div className="text-[11px] text-slate-400 italic mt-0.5">
                            {inv.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {inv.points.toFixed(1)} PTS
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatLKR(inv.totalCharge)}
                      </td>

                      <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatLKR(inv.amountPaid)}
                      </td>

                      <td className="px-5 py-4 text-right font-black">
                        {inv.balanceDue > 0.05 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatLKR(inv.balanceDue)}
                          </span>
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
                          {inv.balanceDue > 0.05 && (
                            <RecordPaymentModal
                              incomeLogId={inv.id}
                              clientName={inv.clientName}
                              jcbPlate={inv.jcb.plateNumber}
                              totalCharge={inv.totalCharge}
                              amountPaid={inv.amountPaid}
                            />
                          )}
                          <DownloadInvoiceButton invoiceData={invoicePayload} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TRANCHE PAYMENT HISTORY */}
      {tab === "payments" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Contractor Installment Audit Trail
            </h3>
            <span className="text-xs text-slate-400">Every tranche deposited</span>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No tranche payment records found for this contractor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Target Shift / JCB</th>
                    <th className="px-5 py-3">Reference / Notes</th>
                    <th className="px-5 py-3">Logged By</th>
                    <th className="px-5 py-3 text-right">Amount (LKR)</th>
                    {isAdmin && <th className="px-5 py-3 text-center">Admin Controls</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium text-xs">
                  {paymentHistory.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(pmt.paymentDate).toLocaleDateString("en-GB")}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-500">
                          {pmt.jcbPlate}
                        </span>
                        <div className="text-[11px] text-slate-400">{pmt.siteLocation}</div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {pmt.note || "Standard Installment"}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {pmt.recordedBy || "System"}
                      </td>

                      <td className="px-5 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatLKR(pmt.amount)}
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <EditPaymentModal
                              payment={{
                                id: pmt.id,
                                amount: pmt.amount,
                                paymentDate: pmt.paymentDate.toISOString(),
                                note: pmt.note,
                                jcbPlate: pmt.jcbPlate,
                              }}
                            />
                            <DeletePaymentButton paymentId={pmt.id} />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}