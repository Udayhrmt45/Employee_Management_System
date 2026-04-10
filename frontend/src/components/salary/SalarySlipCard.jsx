import React from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useDownloadSlip } from '@/hooks/useSalary';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function currencyFormat(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function StatBox({ label, value, color = 'default' }) {
  const colors = {
    default: 'bg-muted/50 text-foreground',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    primary: 'bg-primary text-primary-foreground',
  };
  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

export default function SalarySlipCard({ slip }) {
  const { mutate: download, isPending } = useDownloadSlip();

  if (!slip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between bg-gradient-to-r from-primary to-violet-600 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Salary Slip
          </p>
          <h3 className="mt-1 text-xl font-bold text-primary-foreground">
            {MONTH_NAMES[slip.month]} {slip.year}
          </h3>
          {slip.employeeName && (
            <p className="mt-0.5 text-sm text-primary-foreground/80">{slip.employeeName}</p>
          )}
        </div>
        <button
          id={`card-download-${slip.id}`}
          onClick={() => download(slip.id)}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </button>
      </div>

      {/* Breakdown */}
      <div className="p-6">
        <div className="mb-5 flex flex-wrap gap-4">
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">Total Days:</span>
             <span className="font-semibold">{slip.totalDays || '-'}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">Working Days:</span>
             <span className="font-semibold">{slip.workingDays || '-'} / {slip.totalDays || '-'}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">Holidays:</span>
             <span className="font-semibold">{slip.holidayCount || '0'}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">Paid Leave:</span>
             <span className="font-semibold text-emerald-600 dark:text-emerald-400">{slip.paidLeaveDays || '0'}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">LOP Days:</span>
             <span className="font-semibold text-rose-600 dark:text-rose-400">{slip.lopDays || '0'}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
             <span className="text-muted-foreground mr-2">Payable Days:</span>
             <span className="font-semibold">{slip.payableDays ?? slip.workingDays ?? '-'}</span>
          </div>
          {slip.payableDays > 0 && (
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
               <span className="text-muted-foreground mr-2">Per-Day Pay:</span>
               <span className="font-semibold">{currencyFormat(slip.netSalary / slip.payableDays)}</span>
            </div>
          )}
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Earnings Breakdown
        </p>
        <div className="space-y-2">
          {[
            { label: 'Basic Salary', value: slip.basicSalary },
            { label: 'HRA', value: slip.hra },
            { label: 'Other Allowances', value: slip.allowances },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/40">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{currencyFormat(value)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatBox label="Total Earnings" value={currencyFormat(slip.totalEarnings)} color="green" />
          <StatBox label="Deductions" value={currencyFormat(slip.totalDeductions)} color="red" />
          <StatBox label="Net Salary" value={currencyFormat(slip.netSalary)} color="primary" />
        </div>
      </div>
    </motion.div>
  );
}
