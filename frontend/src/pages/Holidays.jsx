import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateHoliday, useDeleteHoliday, useHolidays } from '@/hooks/useHolidays';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function Holidays() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [formData, setFormData] = useState({ name: '', date: '' });
  const { userRole } = useAuthUser();
  const isAdmin = ['ADMIN', 'OWNER'].includes(String(userRole).toUpperCase());

  const { holidays, isLoading, isError, errorMessage, refetch } = useHolidays(selectedYear);
  const createMutation = useCreateHoliday();
  const deleteMutation = useDeleteHoliday();

  const handleSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => setFormData({ name: '', date: '' }),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Holiday Calendar"
        description="Manage company-wide holidays used by payroll working-day calculations."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {isAdmin && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Add Holiday
              </CardTitle>
              <CardDescription>Create a global holiday for the whole company.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="holiday-name">Holiday Name</Label>
                  <Input
                    id="holiday-name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Republic Day"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-date">Date</Label>
                  <Input
                    id="holiday-date"
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Holiday'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Holidays
              </CardTitle>
              <CardDescription>View holidays by year.</CardDescription>
            </div>
            <div className="w-full max-w-[180px] space-y-2">
              <Label htmlFor="holiday-year">Year</Label>
              <Input
                id="holiday-year"
                type="number"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value) || currentYear)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="p-0" />
            ) : isError ? (
              <ErrorState message={errorMessage} onRetry={refetch} />
            ) : holidays.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
                No holidays found for {selectedYear}.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                      {isAdmin && <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((holiday) => (
                      <tr key={holiday.id} className="border-t">
                        <td className="px-4 py-3 font-medium">{holiday.name}</td>
                        <td className="px-4 py-3">{new Date(holiday.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(holiday.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
