import React from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, FileText } from 'lucide-react';
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

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Paid
    </span>
  );
}

export default function SalaryTable({ slips = [], showEmployee = false }) {
  const { mutate: download, isPending: isDownloading, variables: downloadingId } =
    useDownloadSlip();

  if (!slips.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No salary slips found</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Salary slips will appear here once generated.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {showEmployee && (
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Employee
                </th>
              )}
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pay Period
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Working Days
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Holidays
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paid Leave
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                LOP
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Earnings
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Salary
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                PDF
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slips.map((slip, idx) => {
              const isThisDownloading = isDownloading && downloadingId === slip.id;
              return (
                <motion.tr
                  key={slip.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group transition-colors hover:bg-muted/30"
                >
                  {showEmployee && (
                    <td className="px-5 py-4 font-medium text-foreground">
                      {slip.employeeName || '—'}
                    </td>
                  )}
                  <td className="px-5 py-4 text-foreground">
                    <span className="font-medium">
                      {MONTH_NAMES[slip.month]} {slip.year}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">
                    {slip.payableDays ?? 0} / {slip.workingDays ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {slip.holidayCount ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">
                    {slip.paidLeaveDays ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right text-rose-500 dark:text-rose-400">
                    {slip.lopDays ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">
                    {currencyFormat(slip.totalEarnings)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-foreground">
                      {currencyFormat(slip.netSalary)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      id={`download-slip-${slip.id}`}
                      onClick={() => download(slip.id)}
                      disabled={isThisDownloading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                    >
                      {isThisDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
