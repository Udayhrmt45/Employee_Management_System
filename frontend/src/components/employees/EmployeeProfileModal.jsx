import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Phone, Briefcase, Building2, CalendarDays, Hash, User } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useDepartments, useEmployeeDetails, useEmployeeLeaveBalances, useUpdateEmployee, useManagers } from '@/hooks/useEmployees';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  designation: '',
  employeeCode: '',
  departmentId: '',
  joiningDate: '',
  employmentType: 'FULL_TIME',
  status: 'ACTIVE',
  managerId: 'none',
};

function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString();
}

function buildFormData(employee) {
  if (!employee) {
    return EMPTY_FORM;
  }

  return {
    name: employee.name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    designation: employee.designation || '',
    employeeCode: employee.employeeCode || '',
    departmentId: employee.departmentId ? String(employee.departmentId) : '',
    joiningDate: employee.joiningDate ? String(employee.joiningDate).slice(0, 10) : '',
    employmentType: employee.employmentType || 'FULL_TIME',
    status: employee.rawStatus || 'ACTIVE',
    managerId: employee.managerId ? String(employee.managerId) : 'none',
  };
}

function EditEmployeeForm({ employeeId, employee, departments, isDepartmentsLoading, isDepartmentsError, departmentsErrorMessage, managers, isManagersLoading, onOpenChange, updateMutation, isAdmin }) {
  const [formData, setFormData] = useState(() => buildFormData(employee));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    updateMutation.mutate({
      employeeId,
      employeeData: {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        designation: formData.designation || undefined,
        employeeCode: formData.employeeCode || undefined,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        joiningDate: formData.joiningDate || null,
        employmentType: formData.employmentType,
        status: formData.status,
        managerId: formData.managerId && formData.managerId !== 'none' ? Number(formData.managerId) : null,
      },
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="employee-name">Full Name</Label>
          <Input id="employee-name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-email">Email</Label>
          <Input id="employee-email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-phone">Phone</Label>
          <Input id="employee-phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-designation">Designation</Label>
          <Input id="employee-designation" name="designation" value={formData.designation} onChange={handleChange} disabled={!isAdmin} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-code">Employee Code</Label>
          <Input id="employee-code" name="employeeCode" value={formData.employeeCode} onChange={handleChange} disabled={!isAdmin} />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={formData.departmentId} onValueChange={(value) => setFormData((prev) => ({ ...prev, departmentId: value }))} disabled={isDepartmentsLoading || !isAdmin}>
            <SelectTrigger>
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={String(department.id)}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isDepartmentsError && (
            <p className="text-sm text-destructive">{departmentsErrorMessage}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Select value={formData.employmentType} onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentType: value }))} disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Reporting Manager</Label>
          <Select value={formData.managerId} onValueChange={(value) => setFormData((prev) => ({ ...prev, managerId: value }))} disabled={isManagersLoading || !isAdmin}>
            <SelectTrigger>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {managers?.filter(m => String(m.id) !== String(employeeId)).map((manager) => (
                <SelectItem key={manager.id} value={String(manager.id)}>
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="joining-date">Joining Date</Label>
          <Input id="joining-date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} disabled={!isAdmin} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))} disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function EmployeeProfileModal({ employeeId, mode = 'view', open, onOpenChange }) {
  const isEditMode = mode === 'edit';
  const { userRole, employeeId: currentEmployeeId } = useAuthUser();
  const isAdmin = hasPermission(userRole, ROLES.ADMIN);
  const { employee, isLoading, isError, errorMessage, refetch } = useEmployeeDetails(employeeId, open);
  const {
    leaveBalances,
    isLoading: isLeaveBalancesLoading,
    isError: isLeaveBalancesError,
    errorMessage: leaveBalancesErrorMessage,
    refetch: refetchLeaveBalances,
  } = useEmployeeLeaveBalances(employeeId, open && !isEditMode && isAdmin);
  const {
    departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    errorMessage: departmentsErrorMessage,
  } = useDepartments();
  const updateMutation = useUpdateEmployee();
  const { managers, isLoading: isManagersLoading } = useManagers();
  const normalizedUserRole = String(userRole || '').toUpperCase();

  const canEditEmployee = employee
    ? (
      normalizedUserRole === 'OWNER' ||
      (normalizedUserRole === 'ADMIN' && String(employee.userRole || 'EMPLOYEE').toUpperCase() === 'EMPLOYEE') ||
      Number(employee.id) === Number(currentEmployeeId)
    )
    : false;

  const renderViewContent = () => (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{employee.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{employee.position}</p>
        </div>
        <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
          {employee.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" /> Email</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.email || 'Not provided'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Phone className="h-4 w-4" /> Phone</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.phone || 'Not provided'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Building2 className="h-4 w-4" /> Department</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.department}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Briefcase className="h-4 w-4" /> Employment Type</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.employmentType ? employee.employmentType.replace('_', ' ') : 'Not set'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4" /> Joining Date</div>
          <p className="mt-2 text-sm text-muted-foreground">{formatDate(employee.joiningDate)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Hash className="h-4 w-4" /> Employee Code</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.employeeCode || 'Not set'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><User className="h-4 w-4" /> Manager</div>
          <p className="mt-2 text-sm text-muted-foreground">{employee.managerName || 'No manager assigned'}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Leave Summary</h4>
              <p className="text-xs text-muted-foreground">Paid leave balance and remaining leave balances for this employee.</p>
            </div>
          </div>

          {isLeaveBalancesLoading ? (
            <LoadingSkeleton type="list" rows={3} />
          ) : isLeaveBalancesError ? (
            <ErrorState title="Leave balances unavailable" message={leaveBalancesErrorMessage} onRetry={refetchLeaveBalances} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-medium text-emerald-800">Paid Leave Balance</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-700">Remaining</span>
                  <Badge variant="outline" className="border-emerald-200 bg-white text-emerald-800">
                    {employee.paidLeaveBalance ?? 0} days
                  </Badge>
                </div>
              </div>
              {leaveBalances.map((balance) => (
                <div key={balance.leaveTypeId} className="rounded-lg border bg-muted/20 p-4">
                  <div className="text-sm font-medium text-foreground">{balance.leaveTypeName}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Remaining</span>
                    <Badge variant="outline" className="bg-background">
                      {balance.balance} / {balance.maxDays} days
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Employee' : 'Employee Details'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update this employee profile without leaving the directory.' : 'Review this employee profile and key information.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingSkeleton type="list" rows={4} />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={refetch} />
        ) : employee ? (
          isEditMode && canEditEmployee ? (
            <EditEmployeeForm
              key={employee.id}
              employeeId={employeeId}
              employee={employee}
              departments={departments}
              isDepartmentsLoading={isDepartmentsLoading}
              isDepartmentsError={isDepartmentsError}
              departmentsErrorMessage={departmentsErrorMessage}
              managers={managers}
              isManagersLoading={isManagersLoading}
              onOpenChange={onOpenChange}
              updateMutation={updateMutation}
              isAdmin={isAdmin}
            />
          ) : isEditMode ? (
            <ErrorState message="You do not have permission to edit this employee profile." onRetry={refetch} />
          ) : renderViewContent()
        ) : (
          <ErrorState message="Employee details are unavailable." onRetry={refetch} />
        )}
      </DialogContent>
    </Dialog>
  );
}
