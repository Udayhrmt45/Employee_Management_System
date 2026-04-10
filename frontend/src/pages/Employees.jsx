import React from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeCard from '@/components/employees/EmployeeCard';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import { useEmployees } from '@/hooks/useEmployees';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function Employees() {
  const navigate = useNavigate();
  const { 
    view, 
    setView, 
    searchQuery, 
    setSearchQuery, 
    page,
    setPage,
    totalEmployees,
    totalPages,
    pageSize,
    isLoading, 
    isError,
    errorMessage,
    refetch,
    employees 
  } = useEmployees();
  const { userRole } = useAuthUser();

  const openViewModal = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const openEditModal = (employeeId) => {
    // Navigating to the same details page, the edit tab functionality can be toggled there or it's accessible inside Details
    navigate(`/employees/${employeeId}`);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <PageHeader 
        title="Employees" 
        description="Manage your entire workforce directory here."
      >
        {hasPermission(userRole, ROLES.ADMIN) && <AddEmployeeModal />}
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees by name, role, or department..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg self-end sm:self-auto">
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className={`h-8 px-3 ${view === 'list' ? 'shadow-sm' : ''}`}
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-1.5" /> List
          </Button>
          <Button 
            variant={view === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            className={`h-8 px-3 ${view === 'grid' ? 'shadow-sm' : ''}`}
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" /> Grid
          </Button>
        </div>
      </div>

      {!isLoading && !isError && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {totalEmployees === 0
              ? 'No employee records found.'
              : `Showing ${Math.min((page - 1) * pageSize + 1, totalEmployees)}-${Math.min(page * pageSize, totalEmployees)} of ${totalEmployees} employees`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="min-w-[88px] text-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton type={view === 'grid' ? 'card' : 'table'} rows={5} />
      ) : isError ? (
        <ErrorState message={errorMessage} onRetry={refetch} />
      ) : (
        <>
          {view === 'list' && (
            <EmployeeTable employees={employees} onViewEmployee={openViewModal} onEditEmployee={openEditModal} />
          )}

          {view === 'grid' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} onViewEmployee={openViewModal} />
              ))}
              {employees.length === 0 && (
                <div className="col-span-full">
                  <EmptyState 
                    title="No Employees Found" 
                    description="No employees matched your search criteria." 
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
