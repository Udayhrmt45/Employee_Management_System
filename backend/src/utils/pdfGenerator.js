const PDFDocument = require("pdfkit");

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Palette
const COLORS = {
  primary: "#4F46E5",      // Indigo
  primaryLight: "#EEF2FF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  positive: "#059669",
  negative: "#DC2626"
};

function currencyFormat(amount) {
  return `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Generates a salary slip PDF and resolves with a Buffer.
 *
 * @param {object} slip        — salary slip record from DB
 * @param {string} companyName — company name to display on header
 * @returns {Promise<Buffer>}
 */
function generateSalarySlipPDF(slip, companyName = "Your Company") {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100; // L+R margins = 100

    // ── Header Banner ───────────────────────────────────────────────────────
    doc.rect(50, 50, pageWidth, 70).fill(COLORS.primary);

    doc.fillColor(COLORS.white)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(companyName, 60, 65, { width: pageWidth - 20 });

    doc.fontSize(11)
      .font("Helvetica")
      .text(
        `Salary Slip — ${MONTH_NAMES[slip.month]} ${slip.year}`,
        60,
        92,
        { width: pageWidth - 20 }
      );

    // ── Employee Details ─────────────────────────────────────────────────────
    let y = 140;

    doc.rect(50, y, pageWidth, 80).fill(COLORS.primaryLight);

    doc.fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("EMPLOYEE NAME", 60, y + 10)
      .text("PAY PERIOD", 240, y + 10)
      .text("WORKING DAYS", 400, y + 10);

    doc.fillColor(COLORS.text)
      .font("Helvetica")
      .fontSize(12)
      .text(slip.employeeName || "—", 60, y + 24)
      .text(`${MONTH_NAMES[slip.month]} ${slip.year}`, 240, y + 24)
      .text(`${slip.workingDays || '-'} / ${slip.totalDays || '-'}`, 400, y + 24);

    doc.fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("HOLIDAYS", 60, y + 45)
      .text("PAID LEAVE", 150, y + 45)
      .text("LOP DAYS", 240, y + 45)
      .text("PAYABLE DAYS", 400, y + 45);

    doc.fillColor(COLORS.text)
      .font("Helvetica")
      .fontSize(12)
      .text(String(slip.holidayCount || 0), 60, y + 59)
      .text(String(slip.paidLeaveDays || 0), 150, y + 59)
      .text(String(slip.lopDays || '0'), 240, y + 59)
      .text(String(slip.payableDays || slip.workingDays || '-'), 400, y + 59);

    // ── Earnings & Deductions Table ──────────────────────────────────────────
    y = 220;

    // Section heading
    doc.fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("EARNINGS", 60, y);

    y += 16;

    // Table header
    doc.rect(50, y, pageWidth, 20).fill(COLORS.border);
    doc.fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Component", 60, y + 5)
      .text("Amount", pageWidth - 30, y + 5, { align: "right", width: 80 });

    y += 22;

    const earningsRows = [
      ["Basic Salary", slip.basicSalary],
      ["House Rent Allowance (HRA)", slip.hra],
      ["Other Allowances", slip.allowances]
    ];

    earningsRows.forEach(([label, amount], idx) => {
      if (idx % 2 === 0) doc.rect(50, y, pageWidth, 18).fill("#F9FAFB");
      doc.fillColor(COLORS.text)
        .font("Helvetica")
        .fontSize(10)
        .text(label, 60, y + 4)
        .text(currencyFormat(amount), 60, y + 4, { align: "right", width: pageWidth - 10 });
      y += 18;
    });

    // Earnings total
    doc.rect(50, y, pageWidth, 22).fill(COLORS.primaryLight);
    doc.fillColor(COLORS.positive)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Total Earnings", 60, y + 6)
      .text(currencyFormat(slip.totalEarnings), 60, y + 6, {
        align: "right",
        width: pageWidth - 10
      });

    y += 35;

    // ── Deductions ───────────────────────────────────────────────────────────
    doc.fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("DEDUCTIONS", 60, y);

    y += 16;

    doc.rect(50, y, pageWidth, 20).fill(COLORS.border);
    doc.fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Component", 60, y + 5)
      .text("Amount", pageWidth - 30, y + 5, { align: "right", width: 80 });

    y += 22;

    doc.rect(50, y, pageWidth, 18).fill("#F9FAFB");
    doc.fillColor(COLORS.text)
      .font("Helvetica")
      .fontSize(10)
      .text("Total Deductions", 60, y + 4)
      .text(currencyFormat(slip.totalDeductions), 60, y + 4, {
        align: "right",
        width: pageWidth - 10
      });

    y += 18;

    doc.rect(50, y, pageWidth, 22).fill("#FEF2F2");
    doc.fillColor(COLORS.negative)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Total Deductions", 60, y + 6)
      .text(currencyFormat(slip.totalDeductions), 60, y + 6, {
        align: "right",
        width: pageWidth - 10
      });

    y += 35;

    // ── Net Salary Banner ────────────────────────────────────────────────────
    doc.rect(50, y, pageWidth, 40).fill(COLORS.primary);
    doc.fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("NET SALARY", 60, y + 12)
      .text(currencyFormat(slip.netSalary), 60, y + 12, {
        align: "right",
        width: pageWidth - 10
      });

    y += 60;

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke(COLORS.border);
    doc.fillColor(COLORS.subtext)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "This is a computer-generated salary slip and does not require a signature.",
        50,
        y + 8,
        { align: "center", width: pageWidth }
      );

    doc.end();
  });
}

module.exports = { generateSalarySlipPDF };
