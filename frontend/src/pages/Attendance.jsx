import React from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckInCard from '@/components/attendance/CheckInCard';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import AttendanceDashboard from '@/components/attendance/AttendanceDashboard';
import { useAttendance, useExportAttendanceCsv, useTeamAttendance } from '@/hooks/useAttendance';
import { useAuthUser } from '@/hooks/useAuthUser';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Attendance() {
  const { userRole } = useAuthUser();
  const isAdmin = ['ADMIN', 'OWNER'].includes(String(userRole).toUpperCase());
  const [activeTab, setActiveTab] = React.useState('my-attendance');
  const [selectedDate, setSelectedDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const { records, todayAttendance, isLoading, isError, errorMessage, refetch } = useAttendance();
  const {
    records: teamRecords,
    isLoading: isTeamLoading,
    isError: isTeamError,
    errorMessage: teamErrorMessage,
    refetch: refetchTeamAttendance,
  } = useTeamAttendance({
    dateFrom: selectedDate,
    dateTo: selectedDate,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  }, isAdmin);
  const exportMutation = useExportAttendanceCsv();

  const handleExport = () => {
    exportMutation.mutate(
      activeTab === 'admin'
        ? {
            dateFrom: selectedDate,
            dateTo: selectedDate,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
          }
        : undefined
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <PageHeader 
        title="Attendance" 
        description={isAdmin ? "Track your time and monitor attendance across the team." : "Track your daily working hours and view history."}
      >
        {isAdmin && (
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="shrink-0"
          >
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="my-attendance" className="rounded-md px-6">
            My Attendance
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="rounded-md px-6">
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-attendance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-1 border-none">
              <CheckInCard todayAttendance={todayAttendance} />
            </div>

            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSkeleton type="table" rows={6} className="bg-card border rounded-xl shadow-sm p-6" />
              ) : isError ? (
                <ErrorState message={errorMessage} onRetry={refetch} />
              ) : (
                <AttendanceTable attendanceData={records} />
              )}
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {isTeamLoading ? (
              <LoadingSkeleton type="table" rows={6} className="bg-card border rounded-xl shadow-sm p-6" />
            ) : isTeamError ? (
              <ErrorState message={teamErrorMessage} onRetry={refetchTeamAttendance} />
            ) : (
              <AttendanceDashboard
                records={teamRecords}
                selectedDate={selectedDate}
                status={statusFilter}
                onDateChange={setSelectedDate}
                onStatusChange={setStatusFilter}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
