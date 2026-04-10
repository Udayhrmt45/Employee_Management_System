import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useSalarySlips } from '@/hooks/useSalary';
import SalaryTable from '@/components/salary/SalaryTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function EmployeePayslips() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const [filterYear, setFilterYear] = useState('ALL');

  const { slips, isLoading, isError, errorMessage, refetch } = useSalarySlips({ employeeId });

  const years = Array.from(new Set((slips || []).map(s => s.year))).sort((a,b) => b - a);
  const filteredSlips = (slips || []).filter(s => filterYear === 'ALL' || String(s.year) === String(filterYear));

  // Try extracting employee name from slips if available. (Admins have access to all slips via the query if employeeId is passed, wait, useSalarySlips hooks takes query params)
  const employeeName = slips && slips.length > 0 ? slips[0].employeeName : 'Employee';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/salary')} className="pl-0 gap-2 hover:bg-transparent -ml-2">
           <ArrowLeft className="h-4 w-4" /> Back to Salary Dashboard
        </Button>
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/salary')} className="pl-0 gap-2 hover:bg-transparent -ml-2">
           <ArrowLeft className="h-4 w-4" /> Back to Salary Dashboard
        </Button>
        <ErrorState message={errorMessage || "Failed to load payslips"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      <div className="flex flex-col mb-4">
        <Button variant="ghost" onClick={() => navigate('/salary')} className="pl-0 gap-2 w-max hover:bg-transparent text-muted-foreground hover:text-foreground mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Salary Dashboard
        </Button>
        <PageHeader title={`${employeeName}'s Payslips`} description="View and filter all historical payslips for this employee." />
      </div>

      <div className="border bg-card rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
           <h5 className="font-semibold text-lg">Payslip Entries</h5>
           <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground font-medium">Filter Year:</span>
             <Select value={filterYear} onValueChange={setFilterYear}>
               <SelectTrigger className="w-[120px] bg-background">
                 <SelectValue placeholder="Year" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="ALL">All Years</SelectItem>
                 {years.map(y => <SelectItem key={String(y)} value={String(y)}>{y}</SelectItem>)}
               </SelectContent>
             </Select>
           </div>
        </div>
        
        {filteredSlips.length === 0 ? (
           <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
             <p className="text-sm font-medium text-muted-foreground">No payslips found for this period</p>
           </div>
        ) : (
           <SalaryTable slips={filteredSlips} showEmployee={false} />
        )}
      </div>
    </motion.div>
  );
}
