import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

import DemoTable from '@/components/admin/demo/DemoTable';
import DemoDetailsDrawer from '@/components/admin/demo/DemoDetailsDrawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DemoRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch API
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminDemoRequests', statusFilter],
    queryFn: async () => {
      const response = await api.get(`/admin/demo-requests?status=${statusFilter}`);
      return response.data;
    }
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.put(`/admin/demo-requests/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (updatedReq) => {
      queryClient.invalidateQueries(['adminDemoRequests']);
      setSelectedRequest((prev) => prev?.id === updatedReq.id ? updatedReq : prev);
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status')
  });

  const notesMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      const response = await api.put(`/admin/demo-requests/${id}/notes`, { notes });
      return response.data;
    },
    onSuccess: (updatedReq) => {
      queryClient.invalidateQueries(['adminDemoRequests']);
      setSelectedRequest((prev) => prev?.id === updatedReq.id ? updatedReq : prev);
      toast.success('Notes saved successfully');
    },
    onError: () => toast.error('Failed to save notes')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/demo-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDemoRequests']);
      setIsDrawerOpen(false);
      setSelectedRequest(null);
      toast.success('Lead deleted successfully');
    },
    onError: () => toast.error('Failed to delete lead')
  });

  const handleRowClick = (request) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const isMutating = statusMutation.isPending || notesMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage incoming prospects and update their trial status.
          </p>
        </div>
        
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">NEW</SelectItem>
              <SelectItem value="CONTACTED">CONTACTED</SelectItem>
              <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
              <SelectItem value="CLOSED">CLOSED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DemoTable requests={requests} onRowClick={handleRowClick} />
      )}

      <DemoDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
        isMutating={isMutating}
        onUpdateStatus={(id, status) => statusMutation.mutate({ id, status })}
        onSaveNotes={(id, notes) => notesMutation.mutate({ id, notes })}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
