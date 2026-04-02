import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import NotesEditor from './NotesEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function DemoDetailsDrawer({ isOpen, onClose, request, onUpdateStatus, onSaveNotes, onDelete, isMutating }) {
  if (!request) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer side panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-2xl border-l ring-1 ring-border/50 overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-base font-semibold leading-6 text-foreground">Demo Request Details</h2>
                <button
                  type="button"
                  className="rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 px-6 py-6 space-y-8">
                
                {/* Lead Summary */}
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{request.name}</h3>
                  <a href={`mailto:${request.email}`} className="text-sm font-medium text-primary hover:underline">{request.email}</a>
                </div>

                {/* Info Grid */}
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                    <dd className="mt-1 text-sm text-foreground">{request.company_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Team Size</dt>
                    <dd className="mt-1 text-sm text-foreground">{request.team_size}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Original Message</dt>
                    <dd className="mt-1 text-sm text-foreground bg-muted p-3 rounded-md">
                      {request.message || <span className="italic text-muted-foreground/70">No message provided.</span>}
                    </dd>
                  </div>
                </dl>

                <hr className="border-border" />

                {/* Status Assignment */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-foreground">Current Status</Label>
                    <StatusBadge status={request.status} />
                  </div>
                  <Select 
                    value={request.status} 
                    onValueChange={(val) => onUpdateStatus(request.id, val)}
                    disabled={isMutating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                      <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                      <SelectItem value="CLOSED">CLOSED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <hr className="border-border" />

                {/* Internal Notes */}
                <NotesEditor 
                  initialNotes={request.notes} 
                  onSave={(notes) => onSaveNotes(request.id, notes)} 
                  isLoading={isMutating} 
                />

                <hr className="border-border" />

                {/* Delete Zone */}
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                       if (window.confirm('Are you sure you want to permanently delete this lead?')) {
                         onDelete(request.id);
                       }
                    }}
                    disabled={isMutating}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Lead
                  </Button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
