// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatLKR } from "@/lib/calculations";

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
};

const getLastAutoTableFinalY = (doc: jsPDF) =>
  (doc as JsPDFWithAutoTable).lastAutoTable.finalY;

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  siteLocation: string;
  date: string;
  jcbPlate: string;
  jcbModel: string;
  driverName: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  points: number;
  ratePerPoint: number;
  totalCharge: number;
  paymentStatus: string;
  notes?: string | null;
}

export interface MonthlyStatementData {
  monthYear: string;
  totalShifts: number;
  totalHours: number;
  totalPoints: number;
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  shifts: {
    date: string;
    jcbPlate: string;
    client: string;
    hours: number;
    points: number;
    amount: number;
    status: string;
  }[];
  expenses: {
    date: string;
    jcbPlate: string;
    category: string;
    description: string;
    amount: number;
  }[];
}

/**
 * Generates an official Gamage Constructions JCB Shift Invoice / Work Slip.
 */
export function generateShiftInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Company Brand Colors
  const navy = [15, 23, 42]; // #0f172a
  const amber = [217, 119, 6]; // #d97706
  const slate = [100, 116, 139]; // #64748b

  // 1. Company Letterhead Header
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, 210, 36, "F");

  // Accent Line
  doc.setFillColor(amber[0], amber[1], amber[2]);
  doc.rect(0, 36, 210, 2, "F");

  // Company Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("GAMAGE CONSTRUCTIONS (PVT) LTD", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Civil Contractors, JCB Heavy Earthmovers & Machinery Logistics", 14, 23);
  doc.text("Tel: +94 77 123 4567 | Email: accounts@gamageconstructions.lk", 14, 29);

  // Document Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(amber[0], amber[1], amber[2]);
  doc.text("EQUIPMENT WORK SLIP", 140, 16);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Slip No: ${data.invoiceNumber}`, 140, 23);
  doc.text(`Date: ${data.date}`, 140, 29);

  // 2. Client & Machine Assignment Details
  let currentY = 48;

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 86, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("CLIENT / PROJECT DETAILS", 18, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Client Name: ${data.clientName}`, 18, currentY + 14);
  doc.text(`Site Location: ${data.siteLocation}`, 18, currentY + 20);
  doc.text(`Payment Status: ${data.paymentStatus}`, 18, currentY + 26);

  // Machinery Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, currentY, 88, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("MACHINERY & OPERATOR", 112, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Plate No: ${data.jcbPlate}`, 112, currentY + 14);
  doc.text(`Model: ${data.jcbModel}`, 112, currentY + 20);
  doc.text(`Assigned Driver: ${data.driverName}`, 112, currentY + 26);

  // 3. Operational Points Table
  currentY = 88;

  autoTable(doc, {
    startY: currentY,
    head: [["Operation & Shift Timing", "Duration", "Billable Points", "Unit Rate (LKR)", "Total Amount (LKR)"]],
    body: [
      [
        `Heavy Earthmoving / Excavation Shift\nTime Window: ${data.startTime} to ${data.endTime}`,
        `${data.durationHours} Hours`,
        `${data.points.toFixed(1)} PTS\n(1 pt = 1 hr / 0.1 pt = 6 min)`,
        formatLKR(data.ratePerPoint),
        formatLKR(data.totalCharge),
      ],
    ],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 26, halign: "center" },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    theme: "grid",
  });

  const finalTableY = getLastAutoTableFinalY(doc) + 8;

  // Notes if available
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text("Operational Notes / Worksite Details:", 14, finalTableY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(data.notes, 14, finalTableY + 5);
  }

  // 4. Grand Total Summary Block
  const totalBoxY = data.notes ? finalTableY + 14 : finalTableY;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, totalBoxY, 76, 26, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", 125, totalBoxY + 8);
  doc.text(formatLKR(data.totalCharge), 191, totalBoxY + 8, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("NET AMOUNT PAYABLE:", 125, totalBoxY + 18);
  doc.setTextColor(amber[0], amber[1], amber[2]);
  doc.text(formatLKR(data.totalCharge), 191, totalBoxY + 18, { align: "right" });

  // 5. Signatures & Legal Verification
  const signY = 240;

  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);

  // Machine Operator Signature
  doc.line(20, signY, 70, signY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text("Driver / Operator Signature", 24, signY + 6);

  // Client Verification Signature
  doc.line(80, signY, 130, signY);
  doc.text("Client / Site In-Charge Signature", 82, signY + 6);

  // Authorized Stamp
  doc.line(140, signY, 190, signY);
  doc.text("Gamage Constructions Authorized", 141, signY + 6);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Gamage Constructions PVT. (LTD.) - Computer generated work slip powered by Smart Fleet Manager",
    105,
    285,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`WorkSlip_${data.jcbPlate}_${data.invoiceNumber}.pdf`);
}

/**
 * Generates an Executive Monthly Statement PDF report with comprehensive Incomes & Expenses.
 */
export function generateMonthlyStatementPDF(data: MonthlyStatementData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const navy = [15, 23, 42];
  const amber = [217, 119, 6];

  // Header Banner
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, 210, 32, "F");

  doc.setFillColor(amber[0], amber[1], amber[2]);
  doc.rect(0, 32, 210, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("GAMAGE CONSTRUCTIONS (PVT) LTD", 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`EXECUTIVE MONTHLY FINANCIAL STATEMENT - ${data.monthYear.toUpperCase()}`, 14, 23);

  // KPI Summary Boxes
  const boxY = 42;
  const boxWidth = 43;

  // Box 1: Gross Income
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, boxY, boxWidth, 20, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text("TOTAL REVENUE", 18, boxY + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatLKR(data.grossIncome), 18, boxY + 14);

  // Box 2: Total Expenses
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(61, boxY, boxWidth, 20, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(153, 27, 27);
  doc.text("TOTAL EXPENSES", 65, boxY + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatLKR(data.totalExpenses), 65, boxY + 14);

  // Box 3: Net Profit
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(108, boxY, boxWidth, 20, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(133, 77, 14);
  doc.text("NET PROFIT", 112, boxY + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatLKR(data.netProfit), 112, boxY + 14);

  // Box 4: Total Points
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(155, boxY, boxWidth, 20, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL POINTS BILLED", 159, boxY + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.totalPoints.toFixed(1)} PTS`, 159, boxY + 14);

  // Table 1: Incomes
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("1. Operational Inflows (Shift Billings)", 14, 70);

  autoTable(doc, {
    startY: 74,
    head: [["Date", "JCB Plate", "Client", "Duration", "Points", "Total Charge (LKR)", "Status"]],
    body: data.shifts.map((s) => [
      s.date,
      s.jcbPlate,
      s.client,
      `${s.hours} hrs`,
      `${s.points.toFixed(1)} pts`,
      formatLKR(s.amount),
      s.status,
    ]),
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      5: { halign: "right", fontStyle: "bold" },
      4: { halign: "center" },
    },
    theme: "striped",
  });

  const nextY = getLastAutoTableFinalY(doc) + 10;

  // Table 2: Expenses
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("2. Fleet Operating Expenses", 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Date", "JCB Plate", "Category", "Description", "Outflow (LKR)"]],
    body: data.expenses.map((e) => [
      e.date,
      e.jcbPlate,
      e.category,
      e.description,
      formatLKR(e.amount),
    ]),
    headStyles: { fillColor: [180, 83, 9], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      4: { halign: "right", fontStyle: "bold" },
    },
    theme: "striped",
  });

  doc.save(`MonthlyStatement_${data.monthYear.replace(" ", "_")}.pdf`);
}