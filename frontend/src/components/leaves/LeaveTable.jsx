import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <Badge variant="default" className="bg-green-500/15 text-green-700 border-green-200">Approved</Badge>;
    case 'Rejected': return <Badge variant="destructive" className="bg-red-500/15 text-red-700 border-red-200">Rejected</Badge>;
    case 'Pending': return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 border-amber-200">Pending</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function LeaveTable({ leaves }) {
  // Assuming 'leaves' is the personal leave history of the requested user
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" /> My Leave History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leaves.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                icon={History} 
                title="No Leave History" 
                description="You haven't submitted any leave requests yet."
                action={
                  <Button asChild>
                    <a href="#leave-request-form">Request Your First Leave</a>
                  </Button>
                }
              />
            </div>
          ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold px-6">Leave Type</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold text-right px-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave, index) => (
                <motion.tr 
                  key={leave.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  whileHover={{ scale: 1.005, backgroundColor: "oklch(var(--muted) / 0.5)" }}
                  className="border-b transition-colors cursor-default"
                >
                  <TableCell className="font-medium text-foreground px-6 py-4">
                    {leave.type}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - 
                    {' '}{new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {leave.reason || '-'}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    {getStatusBadge(leave.status)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
