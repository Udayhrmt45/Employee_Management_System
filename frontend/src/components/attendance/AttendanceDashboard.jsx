import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/shared/EmptyState';
import { Activity, CalendarDays, ClipboardCheck, Clock3, LogOut, TriangleAlert, Users } from 'lucide-react';
import { itemVariants } from './CheckInCard';

const statusOptions = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PRESENT', label: 'Present' },
  { value: 'LATE', label: 'Late' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'HALF_DAY', label: 'Half Day' },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Present':
      return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Present</Badge>;
    case 'Late':
      return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Late</Badge>;
    case 'Absent':
      return <Badge variant="secondary" className="bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-200">Absent</Badge>;
    case 'Half Day':
      return <Badge variant="outline" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Half Day</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  }
};

function formatSelectedDate(value) {
  if (!value) {
    return 'today';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildMetrics(records) {
  return {
    tracked: records.length,
    present: records.filter((record) => record.status === 'Present').length,
    late: records.filter((record) => record.status === 'Late').length,
    checkedOut: records.filter((record) => Boolean(record.checkOut)).length,
  };
}

export default function AttendanceDashboard({
  records,
  selectedDate,
  status,
  onDateChange,
  onStatusChange,
}) {
  const metrics = buildMetrics(records);
  const metricsCards = [
    {
      title: 'Records Tracked',
      value: metrics.tracked,
      icon: Users,
      accent: 'text-sky-600',
      tone: 'from-sky-500/10 to-sky-500/5',
    },
    {
      title: 'Present',
      value: metrics.present,
      icon: ClipboardCheck,
      accent: 'text-green-600',
      tone: 'from-green-500/10 to-green-500/5',
    },
    {
      title: 'Late Check-ins',
      value: metrics.late,
      icon: TriangleAlert,
      accent: 'text-amber-600',
      tone: 'from-amber-500/10 to-amber-500/5',
    },
    {
      title: 'Checked Out',
      value: metrics.checkedOut,
      icon: LogOut,
      accent: 'text-indigo-600',
      tone: 'from-indigo-500/10 to-indigo-500/5',
    },
  ];

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className={`border-none shadow-md bg-gradient-to-br ${card.tone}`}>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between text-sm">
                  <span>{card.title}</span>
                  <Icon className={`h-4 w-4 ${card.accent}`} />
                </CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" /> Attendance Dashboard
            </CardTitle>
            <CardDescription className="mt-1">
              Monitor check-ins for {formatSelectedDate(selectedDate)} and surface late arrivals quickly.
            </CardDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:w-auto">
            <div className="space-y-1">
              <label htmlFor="attendance-date" className="text-xs font-medium text-muted-foreground">
                Date
              </label>
              <Input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="min-w-[180px] bg-background"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="min-w-[180px] bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarDays}
                title="No team attendance found"
                description="There are no attendance records for the selected filters yet."
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Check In</TableHead>
                  <TableHead className="font-semibold">Check Out</TableHead>
                  <TableHead className="font-semibold">Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="px-6 text-right font-semibold">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
                    className="border-b transition-colors hover:bg-muted/10"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {record.employeeName?.charAt(0)?.toUpperCase() || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{record.employeeName || 'Unknown employee'}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(`${record.date}T00:00:00`).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.checkInTime || '--:--'}</TableCell>
                    <TableCell className="text-muted-foreground">{record.checkOutTime || '--:--'}</TableCell>
                    <TableCell className="text-muted-foreground">{record.totalHours ? `${record.totalHours} hrs` : '--'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        <span>{record.notes || 'No additional notes'}</span>
                      </div>
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
