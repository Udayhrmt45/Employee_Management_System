import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useGenerateSalarySlip } from '@/hooks/useSalary';
import { useEmployees } from '@/hooks/useEmployees';
import { getApiData } from '@/utils/normalizers';

const MONTHS = [
  { value: 1,  label: 'January' },
  { value: 2,  label: 'February' },
  { value: 3,  label: 'March' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'May' },
  { value: 6,  label: 'June' },
  { value: 7,  label: 'July' },
  { value: 8,  label: 'August' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function Field({ label, children, id }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function GenerateSalaryModal({ open, onOpenChange }) {
  const { mutate: generate, isPending } = useGenerateSalarySlip();
  const { employees = [] } = useEmployees();

  const currentMonth = new Date().getMonth() + 1;

  const [form, setForm] = useState({
    employeeId: '',
    month: currentMonth,
    year: CURRENT_YEAR,
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.employeeId) return;

    generate(
      {
        employeeId: Number(form.employeeId),
        month: Number(form.month),
        year: Number(form.year),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ employeeId: '', month: currentMonth, year: CURRENT_YEAR });
        },
      }
    );
  }

  const selectClass =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold">Generate Salary Slip</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select an employee and pay period to generate their salary slip.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Field label="Employee" id="gen-employee">
            <select
              id="gen-employee"
              className={selectClass}
              value={form.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              required
            >
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Month" id="gen-month">
              <select
                id="gen-month"
                className={selectClass}
                value={form.month}
                onChange={(e) => handleChange('month', e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Year" id="gen-year">
              <select
                id="gen-year"
                className={selectClass}
                value={form.year}
                onChange={(e) => handleChange('year', e.target.value)}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              id="generate-slip-submit"
              type="submit"
              disabled={isPending || !form.employeeId}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
