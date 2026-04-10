import React, { useState, useEffect } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSetSalaryStructure, useSalaryStructure } from '@/hooks/useSalary';

function Field({ label, children, id, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const selectClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary';

export default function SetStructureModal({ open, onOpenChange, employeeId }) {
  const { mutate: setStructure, isPending } = useSetSalaryStructure();

  const [form, setForm] = useState({
    basicSalary: '',
    hra: '',
    allowances: '',
    deductions: '',
  });

  // Pre-fill form when existing structure is loaded
  const { structure } = useSalaryStructure(employeeId || null);

  useEffect(() => {
    if (structure) {
      setForm({
        basicSalary: structure.basicSalary ?? '',
        hra: structure.hra ?? '',
        allowances: structure.allowances ?? '',
        deductions: structure.deductions ?? '',
      });
    } else {
      setForm({ basicSalary: '', hra: '', allowances: '', deductions: '' });
    }
  }, [structure, employeeId]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!employeeId) return;

    setStructure(
      {
        employeeId: Number(employeeId),
        basicSalary: Number(form.basicSalary) || 0,
        hra: Number(form.hra) || 0,
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ basicSalary: '', hra: '', allowances: '', deductions: '' });
        },
      }
    );
  }

  const grossPreview =
    (Number(form.basicSalary) || 0) +
    (Number(form.hra) || 0) +
    (Number(form.allowances) || 0);
  const netPreview = grossPreview - (Number(form.deductions) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold">Set Salary Structure</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define the monthly salary breakdown for an employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Earnings */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Earnings
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Basic Salary (₹)" id="struct-basic">
                <input
                  id="struct-basic"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.basicSalary}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field label="HRA (₹)" id="struct-hra">
                <input
                  id="struct-hra"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.hra}
                  onChange={(e) => handleChange('hra', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field label="Allowances (₹)" id="struct-allowances" hint="Other allowances">
                <input
                  id="struct-allowances"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.allowances}
                  onChange={(e) => handleChange('allowances', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field label="Deductions (₹)" id="struct-deductions" hint="PF, tax, etc.">
                <input
                  id="struct-deductions"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.deductions}
                  onChange={(e) => handleChange('deductions', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>
          </div>

          {/* Live preview */}
          {(form.basicSalary || form.hra || form.allowances) && (
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Gross → Net Preview
              </span>
              <span className="font-semibold text-foreground">
                ₹{grossPreview.toLocaleString('en-IN')} →&nbsp;
                <span className="text-primary">₹{netPreview.toLocaleString('en-IN')}</span>
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              id="set-structure-submit"
              type="submit"
              disabled={isPending || !employeeId}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Structure
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
