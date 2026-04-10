import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Banknote, Sparkles, Building2, Users, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useSalarySlips } from '@/hooks/useSalary';
import SalaryTable from '@/components/salary/SalaryTable';
import GenerateSalaryModal from '@/components/salary/GenerateSalaryModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function EmployeeSalaryGroup({ group }) {
  const navigate = useNavigate();

  return (
    <div 
      className="border bg-card rounded-xl shadow-sm overflow-hidden hover:bg-muted/30 hover:border-primary/50 transition cursor-pointer"
      onClick={() => navigate(`/salary/payslips/${group.employeeId}`)}
    >
      <div className="p-5 flex items-center justify-between select-none">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
             {group.employeeName ? group.employeeName.charAt(0).toUpperCase() : '?'}
           </div>
           <div>
             <h4 className="font-semibold text-lg">{group.employeeName || 'Unknown Employee'}</h4>
             <p className="text-sm text-muted-foreground">{group.slips.length} Payslip{group.slips.length !== 1 ? 's' : ''} Generated</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-emerald-600">Total Net: ₹{group.slips.reduce((a,b)=>a+(b.netSalary||0),0).toLocaleString('en-IN')}</p>
           </div>
           <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
        </div>
      </div>
    </div>
  );
}

function AdminView({ slips, isLoading, isError, errorMessage, refetch }) {
  const [showGenerate, setShowGenerate] = useState(false);

  const totalSlips = slips.length;
  const uniqueEmployees = new Set(slips.map((s) => s.employeeId)).size;
  const totalPayroll = slips.reduce((sum, s) => sum + (s.netSalary || 0), 0);

  const groupedSlips = slips.reduce((acc, slip) => {
    if (!acc[slip.employeeId]) {
      acc[slip.employeeId] = {
        employeeId: slip.employeeId,
        employeeName: slip.employeeName,
        slips: []
      };
    }
    acc[slip.employeeId].slips.push(slip);
    return acc;
  }, {});
  
  const employeeGroups = Object.values(groupedSlips);

  return (
    <>
      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total Slips"
          value={totalSlips}
          icon={Banknote}
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <StatCard
          label="Employees Paid"
          value={uniqueEmployees}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Total Payroll"
          value={`₹${totalPayroll.toLocaleString('en-IN')}`}
          icon={Banknote}
          gradient="bg-gradient-to-br from-orange-500 to-rose-500"
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-3"
      >
        <button
          id="open-generate-slip"
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Generate Salary Slip
        </button>
      </motion.div>

      {/* Table */}
      <Tabs defaultValue="all-slips" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all-slips" className="rounded-md px-6">
            All Slips
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all-slips" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {isLoading ? (
            <LoadingSkeleton type="table" rows={5} className="bg-card border rounded-xl shadow-sm p-6" />
          ) : isError ? (
            <ErrorState message={errorMessage} onRetry={refetch} />
          ) : (
            <div className="space-y-4">
              {employeeGroups.map(group => (
                <EmployeeSalaryGroup key={group.employeeId} group={group} />
              ))}
              {employeeGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No salary slips found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <GenerateSalaryModal open={showGenerate} onOpenChange={setShowGenerate} />
    </>
  );
}

// ─── Employee View ────────────────────────────────────────────────────────────

function EmployeeView({ slips, isLoading, isError, errorMessage, refetch }) {
  const latestNet = slips[0]?.netSalary ?? null;

  return (
    <>
      {latestNet !== null && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            label="Latest Net Salary"
            value={`₹${latestNet.toLocaleString('en-IN')}`}
            icon={Banknote}
            gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
          />
          <StatCard
            label="Total Slips"
            value={slips.length}
            icon={User}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </motion.div>
      )}

      {isLoading ? (
        <LoadingSkeleton type="table" rows={4} className="bg-card border rounded-xl shadow-sm p-6" />
      ) : isError ? (
        <ErrorState message={errorMessage} onRetry={refetch} />
      ) : (
        <SalaryTable slips={slips} showEmployee={false} />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Salary() {
  const { userRole } = useAuthUser();
  const isAdmin = ['ADMIN', 'OWNER'].includes(String(userRole).toUpperCase());

  const { slips, isLoading, isError, errorMessage, refetch } = useSalarySlips();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <PageHeader
        title="Salary"
        description={
          isAdmin
            ? 'Manage salary structures and generate monthly salary slips.'
            : 'View and download your monthly salary slips.'
        }
      />

      {isAdmin ? (
        <AdminView
          slips={slips}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          refetch={refetch}
        />
      ) : (
        <EmployeeView
          slips={slips}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          refetch={refetch}
        />
      )}
    </motion.div>
  );
}
