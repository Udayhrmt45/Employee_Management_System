import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from 'lucide-react';
import { useCreateEmployee, useDepartments, useManagers } from '@/hooks/useEmployees';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ErrorState from '@/components/shared/ErrorState';

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  designation: '',
  employeeCode: '',
  departmentId: '',
  joiningDate: '',
  employmentType: 'FULL_TIME',
  managerId: 'none',
  basicSalary: '',
  hra: '',
  allowances: '',
  deductions: '',
};

export default function AddEmployeeModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const mutation = useCreateEmployee();
  const {
    departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    errorMessage: departmentsErrorMessage,
    refetch: refetchDepartments,
  } = useDepartments();

  const {
    managers,
    isLoading: isManagersLoading,
  } = useManagers();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
      employeeCode: formData.employeeCode.trim() || undefined,
      joiningDate: formData.joiningDate || undefined,
      designation: formData.designation.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      employmentType: formData.employmentType || 'FULL_TIME',
      managerId: formData.managerId && formData.managerId !== 'none' ? Number(formData.managerId) : undefined,
      salary: formData.basicSalary ? {
        basicSalary: Number(formData.basicSalary),
        hra: Number(formData.hra || 0),
        allowances: Number(formData.allowances || 0),
        deductions: Number(formData.deductions || 0),
        effectiveFrom: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : new Date().toISOString()
      } : undefined
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData(INITIAL_FORM_STATE);
      },
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Capture the employee details supported by the current backend API.
          </DialogDescription>
        </DialogHeader>
        {isDepartmentsError ? (
          <div className="pt-4">
            <ErrorState
              title="Departments unavailable"
              message={departmentsErrorMessage}
              onRetry={refetchDepartments}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <motion.div 
              initial="hidden" 
              animate="show" 
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="space-y-4"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 555 123 4567" />
                </motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label htmlFor="designation">Job Title / Designation</Label>
                  <Input id="designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="Software Engineer" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label htmlFor="employeeCode">Employee Code</Label>
                  <Input id="employeeCode" name="employeeCode" value={formData.employeeCode} onChange={handleChange} placeholder="EMP-1024" />
                </motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, departmentId: value }))}
                    disabled={isDepartmentsLoading || departments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isDepartmentsLoading ? "Loading departments..." : departments.length === 0 ? "No departments available" : "Select a department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={String(department.id)}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentType: value }))}
                  >
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
                </motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label>Reporting Manager</Label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, managerId: value }))}
                    disabled={isManagersLoading || managers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isManagersLoading ? "Loading..." : managers.length === 0 ? "No managers" : "Select a manager"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={String(manager.id)}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
                </motion.div>
              </div>

              <div className="pt-2 border-t mt-4">
                <h4 className="text-sm font-semibold mb-3">Initial Salary Structure (Optional)</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <Input id="basicSalary" name="basicSalary" type="number" min="0" step="0.01" value={formData.basicSalary} onChange={handleChange} placeholder="0.00" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                    <Label htmlFor="hra">HRA</Label>
                    <Input id="hra" name="hra" type="number" min="0" step="0.01" value={formData.hra} onChange={handleChange} placeholder="0.00" />
                  </motion.div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                    <Label htmlFor="allowances">Allowances</Label>
                    <Input id="allowances" name="allowances" type="number" min="0" step="0.01" value={formData.allowances} onChange={handleChange} placeholder="0.00" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } } }} className="space-y-2">
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input id="deductions" name="deductions" type="number" min="0" step="0.01" value={formData.deductions} onChange={handleChange} placeholder="0.00" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Employee
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
