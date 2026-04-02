import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TARGET_TYPE_LABELS = {
  ALL_USERS: 'All users',
  ALL_OWNERS: 'All owners',
  SELECTED_OWNERS: 'Selected owners',
  COMPANY_ALL: 'Entire company',
  COMPANY_ADMINS: 'Only admins',
};

function buildDefaultTarget(allowedTargetTypes) {
  return allowedTargetTypes?.[0] || '';
}

export default function SendNotificationModal({
  open,
  onOpenChange,
  permissions,
  availableOwners = [],
  onSubmit,
  isSubmitting = false,
  initialValues = null,
  trigger = null,
}) {
  const allowedTargetTypes = permissions?.allowedTargetTypes || [];
  const isEditMode = Boolean(initialValues);
  const selectableOwners = useMemo(
    () => availableOwners.filter((owner) => owner?.id),
    [availableOwners]
  );

  const formKey = `${initialValues?.id || 'new'}-${allowedTargetTypes.join('-')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <NotificationFormBody
            key={formKey}
            isEditMode={isEditMode}
            allowedTargetTypes={allowedTargetTypes}
            selectableOwners={selectableOwners}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            initialValues={initialValues}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NotificationFormBody({
  isEditMode,
  allowedTargetTypes,
  selectableOwners,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialValues,
}) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [message, setMessage] = useState(initialValues?.message || '');
  const [targetType, setTargetType] = useState(initialValues?.targetType || buildDefaultTarget(allowedTargetTypes));
  const [selectedOwnerIds, setSelectedOwnerIds] = useState(initialValues?.selectedOwnerIds || []);

  const handleOwnerToggle = (ownerId) => {
    setSelectedOwnerIds((current) => (
      current.includes(ownerId)
        ? current.filter((id) => id !== ownerId)
        : [...current, ownerId]
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      title: title.trim(),
      message: message.trim(),
      targetType,
      selectedOwnerIds,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Notification' : 'Send Notification'}</DialogTitle>
        <DialogDescription>
          Send a role-aware message to the right audience without breaking company isolation.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="notification-title">Title</Label>
          <Input
            id="notification-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter a clear notification title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-message">Message</Label>
          <Textarea
            id="notification-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write the message your recipients should receive"
            className="min-h-32"
            required
          />
        </div>

        {!isEditMode && (
          <div className="space-y-2">
            <Label>Target audience</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select an audience" />
              </SelectTrigger>
              <SelectContent>
                {allowedTargetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TARGET_TYPE_LABELS[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isEditMode && targetType === 'SELECTED_OWNERS' && (
          <div className="space-y-3">
            <Label>Select owners</Label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border bg-muted/20 p-3">
              {selectableOwners.map((owner) => {
                const isSelected = selectedOwnerIds.includes(owner.id);

                return (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => handleOwnerToggle(owner.id)}
                    className={`flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{owner.name || owner.email}</p>
                      <p className="text-xs text-muted-foreground">{owner.email}</p>
                      <p className="text-xs text-muted-foreground">{owner.companyName || 'No company assigned'}</p>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </button>
                );
              })}
              {!selectableOwners.length && (
                <p className="text-sm text-muted-foreground">No owners are currently available to target.</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !title.trim() ||
              !message.trim() ||
              (!isEditMode && targetType === 'SELECTED_OWNERS' && selectedOwnerIds.length === 0)
            }
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Send notification'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
