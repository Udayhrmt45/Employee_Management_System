import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import EmptyState from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';
import { useDeleteEmployee } from '@/hooks/useEmployees';
import { useAuthUser } from '@/hooks/useAuthUser';

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function EmployeeTable({ employees, onViewEmployee, onEditEmployee }) {
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const deleteMutation = useDeleteEmployee();
  const { userRole, employeeId: currentEmployeeId } = useAuthUser();
  const normalizedUserRole = String(userRole || '').toUpperCase();

  const canEditEmployee = (employee) => {
    const targetRole = String(employee.userRole || 'EMPLOYEE').toUpperCase();

    if (normalizedUserRole === 'OWNER') {
      return true;
    }

    if (normalizedUserRole === 'ADMIN') {
      return targetRole === 'EMPLOYEE';
    }

    return Number(employee.id) === Number(currentEmployeeId);
  };

  const canDeleteEmployee = (employee) => {
    const targetRole = String(employee.userRole || 'EMPLOYEE').toUpperCase();

    if (normalizedUserRole === 'OWNER') {
      return ['ADMIN', 'EMPLOYEE'].includes(targetRole);
    }

    if (normalizedUserRole === 'ADMIN') {
      return targetRole === 'EMPLOYEE';
    }

    return false;
  };

  const handleDelete = () => {
    if (!employeeToDelete) {
      return;
    }

    deleteMutation.mutate(employeeToDelete, {
      onSuccess: () => setEmployeeToDelete(null),
    });
  };

  return (
    <motion.div variants={itemVariants} className="rounded-md border bg-card shadow-sm overflow-hidden">
      {employees.length === 0 ? (
        <div className="p-8">
          <EmptyState 
            icon={Users} 
            title="No Employees Found" 
            description="We couldn't find any employees matching the current filters." 
          />
        </div>
      ) : (
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Position</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Department</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, index) => (
            <motion.tr 
              key={employee.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
              whileHover={{ scale: 1.005, backgroundColor: "oklch(var(--muted) / 0.5)" }}
              className="border-b transition-colors group cursor-default"
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {employee.name.charAt(0)}
                  </div>
                  {employee.name}
                </div>
              </TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="bg-primary/5">{employee.department}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground hidden sm:table-cell">{employee.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={employee.status === 'Active' ? 'default' : 'secondary'} 
                  className={employee.status === 'Active' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200' : ''}
                >
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onViewEmployee?.(employee.id)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>

                    {canEditEmployee(employee) && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEditEmployee?.(employee.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Employee
                      </DropdownMenuItem>
                    )}

                    {canDeleteEmployee(employee) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setEmployeeToDelete(employee.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      )}
      
      <ConfirmationDialog 
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        description="Are you sure you want to remove this employee? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
