import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCheckIn, useCheckOut } from '@/hooks/useAttendance';

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CheckInCard({ todayAttendance }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceMode, setAttendanceMode] = useState('PRESENT');

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = Boolean(todayAttendance?.checkInTime);
  const hasCheckedOut = Boolean(todayAttendance?.checkOutTime);

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const handleCheckIn = () => {
    checkInMutation.mutate({
      status: attendanceMode,
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({});
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Today's Attendance
          </CardTitle>
          <CardDescription>Record your daily check-in and check-out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border border-muted">
            <div className="text-4xl font-bold tracking-tight text-foreground">{formattedTime}</div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> {formattedDate}
            </div>
          </div>

          {!hasCheckedIn && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Attendance Mode</span>
                {attendanceMode === 'HALF_DAY' && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-500/10 text-amber-700">
                    Half Day
                  </Badge>
                )}
              </div>
              <Select value={attendanceMode} onValueChange={setAttendanceMode} disabled={checkInMutation.isPending}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select attendance mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Full Day</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className={`w-full relative overflow-hidden group ${hasCheckedIn ? 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'}`}
              disabled={hasCheckedIn || checkInMutation.isPending}
              onClick={handleCheckIn}
            >
              {checkInMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  Check In
                </>
              )}
            </Button>

            <Button 
              size="lg" 
              variant={hasCheckedOut || !hasCheckedIn ? "secondary" : "default"}
              className={`w-full relative overflow-hidden group ${hasCheckedOut || !hasCheckedIn ? 'cursor-not-allowed opacity-70' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'}`}
              disabled={hasCheckedOut || !hasCheckedIn || checkOutMutation.isPending}
              onClick={handleCheckOut}
            >
              {checkOutMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Check Out
                  <LogOut className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {hasCheckedIn && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t flex justify-between items-center text-sm"
              >
                <div className="text-muted-foreground">Checked In</div>
                <div className="flex items-center gap-2">
                  {todayAttendance?.status === 'Half Day' && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-500/10 text-amber-700">
                      Half Day
                    </Badge>
                  )}
                  <div className="font-semibold text-foreground">{todayAttendance.checkInTime}</div>
                </div>
              </motion.div>
            )}
            {hasCheckedOut && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 flex justify-between items-center text-sm"
              >
                <div className="text-muted-foreground">Checked Out</div>
                <div className="font-semibold text-foreground">{todayAttendance.checkOutTime}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
