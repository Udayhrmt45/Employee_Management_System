import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

import MetricCard, { itemVariants } from '@/components/dashboard/MetricCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useDashboard } from '@/hooks/useDashboard';
import { useExportAttendanceCsv } from '@/hooks/useAttendance';
import { useAuthUser } from '@/hooks/useAuthUser';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Dashboard() {
  const { userRole } = useAuthUser();
  const isAdmin = ['ADMIN', 'OWNER'].includes(String(userRole).toUpperCase());
  const { summary, recentActivity, isLoading, isError, errorMessage, refetch } = useDashboard();
  const exportMutation = useExportAttendanceCsv();
  const today = React.useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleGenerateReport = () => {
    exportMutation.mutate({
      dateFrom: today,
      dateTo: today,
    });
  };

  const statCards = [
    {
      title: "Total Employees",
      value: String(summary?.totalEmployees ?? 0),
      trend: "Active employee records",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Present Today",
      value: String(summary?.presentToday ?? 0),
      trend: "Checked in today",
      icon: UserCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "On Leave",
      value: String(summary?.onLeave ?? 0),
      trend: "Approved leave today",
      icon: UserX,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Late Arrivals",
      value: String(summary?.lateArrivals ?? 0),
      trend: "Checked in after 9:00 AM",
      icon: Clock,
      color: "text-red-500",
      bg: "bg-red-500/10",
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <PageHeader 
        title="Dashboard" 
        description="Overview of your HR metrics and daily activities."
      >
        {isAdmin && (
          <Button
            className="shrink-0 group"
            onClick={handleGenerateReport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            )}
            Generate Report
          </Button>
        )}
      </PageHeader>
      
      {isLoading ? (
        <>
          <LoadingSkeleton type="card" rows={4} />
          <LoadingSkeleton type="table" rows={5} className="bg-card border rounded-xl shadow-sm p-6" />
        </>
      ) : isError ? (
        <ErrorState message={errorMessage} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <MetricCard key={stat.title} {...stat} />
            ))}
          </div>

          <RecentActivity activities={recentActivity} />
        </>
      )}
    </motion.div>
  );
}
