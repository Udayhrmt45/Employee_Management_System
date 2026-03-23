import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestForm from '@/components/leaves/LeaveRequestForm';
import LeaveTable from '@/components/leaves/LeaveTable';
import LeaveApprovalPanel from '@/components/leaves/LeaveApprovalPanel';
import { useLeaves, useTeamLeaves } from '@/hooks/useLeaves';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useAuthUser } from '@/hooks/useAuthUser';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Leaves() {
  const { userRole } = useAuthUser();
  const isAdmin = ['ADMIN', 'OWNER'].includes(String(userRole).toUpperCase());
  const { leaves, isLoading, isError, errorMessage, refetch } = useLeaves();
  const {
    pendingLeaves,
    isLoading: isTeamLeavesLoading,
    isError: isTeamLeavesError,
    errorMessage: teamLeavesErrorMessage,
    refetch: refetchTeamLeaves,
  } = useTeamLeaves(isAdmin);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <PageHeader 
        title="Leave Management" 
        description="Request time off and manage team leaves."
      />

      <Tabs defaultValue="my-leaves" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="my-leaves" className="rounded-md px-6">My Leaves</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="approvals" className="rounded-md px-6">
              Approvals
              {pendingLeaves.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full">
                  {pendingLeaves.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-leaves" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-1 border-none">
              <LeaveRequestForm />
            </div>
            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSkeleton type="table" rows={4} className="bg-card border rounded-xl shadow-sm p-6" />
              ) : isError ? (
                <ErrorState message={errorMessage} onRetry={refetch} />
              ) : (
                <LeaveTable leaves={leaves} />
              )}
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="approvals" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="max-w-5xl">
              {isTeamLeavesLoading ? (
                <LoadingSkeleton type="table" rows={5} className="bg-card border rounded-xl shadow-sm p-6" />
              ) : isTeamLeavesError ? (
                <ErrorState message={teamLeavesErrorMessage} onRetry={refetchTeamLeaves} />
              ) : (
                <LeaveApprovalPanel pendingLeaves={pendingLeaves} />
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
