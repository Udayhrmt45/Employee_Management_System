import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Send, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useLeaveBalances, useLeaveTypes, useSubmitLeave } from '@/hooks/useLeaves';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ErrorState from '@/components/shared/ErrorState';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

const formContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const mutation = useSubmitLeave();
  const {
    leaveTypes,
    isLoading: isLeaveTypesLoading,
    isError: isLeaveTypesError,
    errorMessage: leaveTypesErrorMessage,
    refetch: refetchLeaveTypes,
  } = useLeaveTypes();
  const {
    leaveBalances,
    isLoading: isLeaveBalancesLoading,
    isError: isLeaveBalancesError,
    errorMessage: leaveBalancesErrorMessage,
    refetch: refetchLeaveBalances,
  } = useLeaveBalances();

  const selectedLeaveBalance = leaveBalances.find(
    (balance) => String(balance.leaveTypeId) === String(formData.leaveTypeId)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      leaveTypeId: Number(formData.leaveTypeId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason.trim(),
    }, {
      onSuccess: () => {
        setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' }); 
      }
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card id="leave-request-form" className="border-none shadow-md overflow-hidden bg-gradient-to-br from-card to-muted/20 scroll-mt-24">
        <CardHeader className="pb-4 border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Apply for Leave
          </CardTitle>
          <CardDescription>Choose a leave type and submit your request for approval.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLeaveTypesError ? (
            <ErrorState
              title="Leave types unavailable"
              message={leaveTypesErrorMessage}
              onRetry={refetchLeaveTypes}
            />
          ) : isLeaveBalancesError ? (
            <ErrorState
              title="Leave balances unavailable"
              message={leaveBalancesErrorMessage}
              onRetry={refetchLeaveBalances}
            />
          ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            variants={formContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={formData.leaveTypeId}
                onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                disabled={isLeaveTypesLoading || isLeaveBalancesLoading || leaveTypes.length === 0}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      isLeaveTypesLoading
                        ? "Loading leave types..."
                        : leaveTypes.length === 0
                          ? "No leave types available"
                          : "Select a leave type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((leaveType) => (
                    <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                      {leaveType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLeaveBalance ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Remaining balance</span>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {selectedLeaveBalance.balance} day{selectedLeaveBalance.balance === 1 ? '' : 's'} left
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Select a leave type to view your remaining balance.
                </p>
              )}
            </motion.div>

            {leaveBalances.length > 0 && (
              <motion.div variants={itemVariants} className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3 text-sm font-medium text-foreground">Available balances</div>
                <div className="flex flex-wrap gap-2">
                  {leaveBalances.map((balance) => (
                    <Badge
                      key={balance.leaveTypeId}
                      variant={String(balance.leaveTypeId) === String(formData.leaveTypeId) ? "default" : "outline"}
                      className={String(balance.leaveTypeId) === String(formData.leaveTypeId) ? "" : "bg-background"}
                    >
                      {balance.leaveTypeName}: {balance.balance}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  className="bg-background cursor-pointer" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  className="bg-background cursor-pointer" 
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea 
                id="reason" 
                placeholder="Briefly explain the reason for your leave..." 
                className="bg-background min-h-[100px] resize-none"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden group hover:shadow-md transition-all"
              disabled={mutation.isPending || isLeaveTypesLoading || !formData.leaveTypeId || !formData.startDate || !formData.endDate || formData.reason.trim().length < 5}
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Submit Request
                </>
              )}
              </Button>
            </motion.div>
          </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
