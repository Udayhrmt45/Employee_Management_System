import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EmptyState from '@/components/shared/EmptyState';
import { Inbox } from 'lucide-react';

const getStatusBadge = (status) => {
  switch(status) {
    case 'On Time': return <Badge variant="default" className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">On Time</Badge>;
    case 'Late': return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Late</Badge>;
    case 'Pending': return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Pending</Badge>;
    case 'Approved': return <Badge variant="default" className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">Approved</Badge>;
    case 'Rejected': return <Badge variant="outline" className="bg-slate-500/10 text-slate-700 border-slate-200">Rejected</Badge>;
    case 'Completed': return <Badge variant="outline">Completed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function formatActivityTime(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivity({ activities = [] }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest check-ins and leave requests from your employees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {activities.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Inbox}
                  title="No Recent Activity"
                  description="Attendance updates and leave requests will show up here."
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Time</TableHead>
                    <TableHead className="font-semibold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {activity.employeeName}
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {formatActivityTime(activity.occurredAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(activity.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
