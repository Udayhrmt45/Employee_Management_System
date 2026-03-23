import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Users, ClipboardCheck } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { useApproveLeave, useRejectLeave } from '@/hooks/useLeaves';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LeaveApprovalPanel({ pendingLeaves }) {
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const handleApprove = (id) => approveMutation.mutate(id);
  const handleReject = (id) => rejectMutation.mutate(id);

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" /> Team Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingLeaves.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                icon={ClipboardCheck} 
                title="All Caught Up" 
                description="The team currently has no outstanding leave requests requiring approval." 
              />
            </div>
          ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-3">Employee</TableHead>
                <TableHead className="font-semibold">Request Details</TableHead>
                <TableHead className="font-semibold text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingLeaves.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="bg-primary/10 text-primary">{leave.avatar || leave.employee.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{leave.employee}</div>
                        <div className="text-xs text-muted-foreground">{leave.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} to {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px] mt-1" title={leave.reason}>
                      "{leave.reason}"
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full"
                        onClick={() => handleApprove(leave.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full"
                        onClick={() => handleReject(leave.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="sr-only">Reject</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
