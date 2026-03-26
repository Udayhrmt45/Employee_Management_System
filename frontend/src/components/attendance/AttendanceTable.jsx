import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Inbox } from 'lucide-react';
import { itemVariants } from './CheckInCard';
import EmptyState from '@/components/shared/EmptyState';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Present': return <Badge variant="default" className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Present</Badge>;
    case 'Late': return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Late</Badge>;
    case 'Absent': return <Badge variant="secondary" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Absent</Badge>;
    case 'Half Day': return <Badge variant="outline" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Half Day</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AttendanceTable({ attendanceData }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" /> Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {attendanceData.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                icon={Inbox} 
                title="No Attendance Records" 
                description="There are no check-in logs for the targeted period." 
              />
            </div>
          ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold px-6">Date</TableHead>
                <TableHead className="font-semibold">Check In</TableHead>
                <TableHead className="font-semibold">Check Out</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right px-6">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record, index) => (
                <motion.tr 
                  key={record.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  whileHover={{ scale: 1.005, backgroundColor: "oklch(var(--muted) / 0.5)" }}
                  className="border-b transition-colors cursor-default"
                >
                  <TableCell className="font-medium text-foreground px-6 py-4">
                    {new Date(`${record.date}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.checkInTime || '--:--'}</TableCell>
                  <TableCell className="text-muted-foreground">{record.checkOutTime || '--:--'}</TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground px-6">
                    {record.notes || '-'}
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
