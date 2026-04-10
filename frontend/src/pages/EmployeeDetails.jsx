import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Mail, Phone, Briefcase, Building2, CalendarDays, Hash, User, Pencil } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useEmployeeDetails, useEmployeeLeaveBalances } from '@/hooks/useEmployees';
import { useSalarySlips } from '@/hooks/useSalary';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import SalaryTable from '@/components/salary/SalaryTable';
import SetStructureModal from '@/components/salary/SetStructureModal';
import EmployeeProfileModal from '@/components/employees/EmployeeProfileModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

export default function EmployeeDetails() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const { userRole, employeeId: currentEmployeeId } = useAuthUser();
  const isAdmin = hasPermission(userRole, ROLES.ADMIN);

  const [activeTab, setActiveTab] = useState('profile');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSetStructure, setShowSetStructure] = useState(false);

  // Employee Profile Fetches
  const { employee, isLoading, isError, errorMessage, refetch } = useEmployeeDetails(employeeId, true);
  
  // Conditionally fetch Leave Balances
  const {
    leaveBalances,
    isLoading: isLeaveBalancesLoading,
    isError: isLeaveBalancesError,
    errorMessage: leaveBalancesErrorMessage,
    refetch: refetchLeaveBalances,
  } = useEmployeeLeaveBalances(employeeId, isAdmin);

  // Salary Slips fetch
  const {
    slips,
    isLoading: isSlipsLoading,
    isError: isSlipsError,
    errorMessage: slipsErrorMessage,
    refetch: refetchSlips,
  } = useSalarySlips({ employeeId });

  const normalizedUserRole = String(userRole || '').toUpperCase();
  const canEditEmployee = employee
    ? (
      normalizedUserRole === 'OWNER' ||
      (normalizedUserRole === 'ADMIN' && String(employee.userRole || 'EMPLOYEE').toUpperCase() === 'EMPLOYEE') ||
      Number(employee.id) === Number(currentEmployeeId)
    )
    : false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/employees')} className="pl-0 gap-2 hover:bg-transparent -ml-2">
           <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>
        <LoadingSkeleton type="card" rows={3} />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/employees')} className="pl-0 gap-2 hover:bg-transparent -ml-2">
           <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>
        <ErrorState message={errorMessage || "Employee not found"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/employees')} className="pl-0 gap-2 hover:bg-transparent text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Button>
          <PageHeader title={employee.name} description={employee.designation || 'Employee'} />
        </div>
        <div className="flex items-center gap-3">
          {canEditEmployee && (
            <Button onClick={() => setShowEditProfile(true)} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="rounded-md px-6">Overview</TabsTrigger>
          <TabsTrigger value="salary" className="rounded-md px-6">Salary & Payslips</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{employee.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{employee.designation}</p>
              </div>
              <Badge variant={employee.status === 'ACTIVE' || employee.status === 'Active' ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
                {employee.status}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><Mail className="h-4 w-4" /> Email address</div>
                <p className="text-base font-medium">{employee.email || 'Not provided'}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><Phone className="h-4 w-4" /> Phone number</div>
                <p className="text-base font-medium">{employee.phone || 'Not provided'}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><Building2 className="h-4 w-4" /> Department</div>
                <p className="text-base font-medium">{employee.departmentName || employee.department}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><Briefcase className="h-4 w-4" /> Employment Type</div>
                <p className="text-base font-medium">{employee.employmentType ? employee.employmentType.replace('_', ' ') : 'Not set'}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><CalendarDays className="h-4 w-4" /> Joining Date</div>
                <p className="text-base font-medium">{formatDate(employee.joiningDate)}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><Hash className="h-4 w-4" /> Employee Code</div>
                <p className="text-base font-medium">{employee.employeeCode || 'Not set'}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3"><User className="h-4 w-4" /> Reporting Manager</div>
                <p className="text-base font-medium">{employee.managerName || 'No manager'}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">Leave Balances</h4>
                    <p className="text-sm text-muted-foreground">Paid leave balance and remaining leave limits allocated</p>
                  </div>
                </div>

                {isLeaveBalancesLoading ? (
                  <LoadingSkeleton type="list" rows={3} />
                ) : isLeaveBalancesError ? (
                  <ErrorState title="Unavailable" message={leaveBalancesErrorMessage} onRetry={refetchLeaveBalances} />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 relative overflow-hidden">
                      <div className="text-sm font-semibold text-emerald-700">Paid Leave Balance</div>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-2xl font-bold text-emerald-800">{employee.paidLeaveBalance ?? 0}</span>
                        <span className="text-xs text-emerald-700 font-medium uppercase tracking-wider mb-1">days</span>
                      </div>
                    </div>
                    {leaveBalances?.map((balance) => (
                      <div key={balance.leaveTypeId} className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden group hover:bg-primary/10 transition">
                        <div className="text-sm font-semibold text-primary">{balance.leaveTypeName}</div>
                        <div className="mt-3 flex items-end justify-between">
                          <span className="text-2xl font-bold">{balance.balance}</span>
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full bg-background border">of {balance.maxDays}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* SALARY TAB */}
        <TabsContent value="salary" className="space-y-6 focus-visible:outline-none">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Salary Configuration</h3>
                <p className="text-sm text-muted-foreground">View or manage salary allocations for this employee.</p>
              </div>
              {isAdmin && (
                 <Button onClick={() => setShowSetStructure(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                   Manage Salary Structure
                 </Button>
              )}
            </div>

            <div className="mt-8">
              <h4 className="text-base font-semibold mb-4">Payslip History</h4>
              {isSlipsLoading ? (
                 <LoadingSkeleton type="table" rows={4} />
              ) : isSlipsError ? (
                 <ErrorState message={slipsErrorMessage} onRetry={refetchSlips} />
              ) : slips?.length === 0 ? (
                 <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
                   <p className="text-muted-foreground">No payslips have been generated yet.</p>
                 </div>
              ) : (
                 <SalaryTable slips={slips} showEmployee={false} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showEditProfile && (
        <EmployeeProfileModal 
          employeeId={employeeId} 
          mode="edit" 
          open={showEditProfile} 
          onOpenChange={setShowEditProfile} 
        />
      )}

      {showSetStructure && (
        <SetStructureModal 
          open={showSetStructure} 
          onOpenChange={setShowSetStructure} 
          employeeId={employeeId}
        />
      )}
    </motion.div>
  );
}
