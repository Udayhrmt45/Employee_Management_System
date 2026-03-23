import React, { useMemo, useState } from 'react';
import { Building2, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import {
  useManagedDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useSettings';

function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
  departments,
  onConfirm,
  isPending,
}) {
  const [reassignMode, setReassignMode] = useState('unassign');
  const [targetDepartmentId, setTargetDepartmentId] = useState('');

  const availableTargets = useMemo(
    () => departments.filter((entry) => String(entry.id) !== String(department?.id)),
    [departments, department]
  );

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setReassignMode('unassign');
      setTargetDepartmentId('');
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    onConfirm({
      reassignDepartmentId: reassignMode === 'transfer' && targetDepartmentId
        ? Number(targetDepartmentId)
        : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>
            {department?.employeeCount > 0
              ? 'Choose how to handle employees assigned to this department before deleting it.'
              : 'This department has no assigned employees and can be removed safely.'}
          </DialogDescription>
        </DialogHeader>

        {department?.employeeCount > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">{department.employeeCount}</strong> active employee
              {department.employeeCount === 1 ? '' : 's'} currently belong to <strong className="text-foreground">{department.name}</strong>.
            </div>

            <div className="space-y-2">
              <Label>Reassignment</Label>
              <Select value={reassignMode} onValueChange={setReassignMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose reassignment handling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassign">Remove department from affected employees</SelectItem>
                  <SelectItem value="transfer" disabled={availableTargets.length === 0}>
                    Reassign employees to another department
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reassignMode === 'transfer' && (
              <div className="space-y-2">
                <Label>Target Department</Label>
                <Select value={targetDepartmentId} onValueChange={setTargetDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a target department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.map((entry) => (
                      <SelectItem key={entry.id} value={String(entry.id)}>
                        {entry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || (department?.employeeCount > 0 && reassignMode === 'transfer' && !targetDepartmentId)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Department
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DepartmentSettings() {
  const { userRole } = useAuthUser();
  const canManageDepartments = hasPermission(userRole, ROLES.ADMIN);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const { departments, isLoading, isError, errorMessage, refetch } = useManagedDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const startEditing = (department) => {
    setEditingDepartmentId(department.id);
    setEditingName(department.name);
  };

  const cancelEditing = () => {
    setEditingDepartmentId(null);
    setEditingName('');
  };

  const handleCreate = (event) => {
    event.preventDefault();
    if (!canManageDepartments || !newDepartmentName.trim()) {
      return;
    }

    createMutation.mutate(
      { name: newDepartmentName.trim() },
      {
        onSuccess: () => {
          setNewDepartmentName('');
        },
      }
    );
  };

  const handleRename = (departmentId) => {
    if (!canManageDepartments || !editingName.trim()) {
      return;
    }

    updateMutation.mutate(
      {
        departmentId,
        payload: { name: editingName.trim() },
      },
      {
        onSuccess: () => {
          cancelEditing();
        },
      }
    );
  };

  const handleDelete = (payload) => {
    if (!departmentToDelete || !canManageDepartments) {
      return;
    }

    deleteMutation.mutate(
      {
        departmentId: departmentToDelete.id,
        payload,
      },
      {
        onSuccess: () => {
          setDepartmentToDelete(null);
        },
      }
    );
  };

  if (isLoading && !departments.length) {
    return <LoadingSkeleton type="list" rows={5} className="rounded-xl border bg-card p-6" />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Department
          </CardTitle>
          <CardDescription>
            Create departments that can be assigned to employees across your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newDepartmentName}
              onChange={(event) => setNewDepartmentName(event.target.value)}
              placeholder="Enter department name"
              disabled={!canManageDepartments || createMutation.isPending}
            />
            <Button type="submit" disabled={!canManageDepartments || createMutation.isPending || !newDepartmentName.trim()}>
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Department
            </Button>
          </form>
          {!canManageDepartments && (
            <p className="mt-3 text-sm text-muted-foreground">
              You can view departments here, but only admins and owners can add, rename, or delete them.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Manage Departments
          </CardTitle>
          <CardDescription>
            Rename departments, review active employee counts, and safely reassign employees before deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {departments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No departments have been created yet.
            </div>
          ) : (
            departments.map((department) => {
              const isEditing = editingDepartmentId === department.id;
              const isBusy = updateMutation.isPending || deleteMutation.isPending;

              return (
                <div
                  key={department.id}
                  className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            disabled={!canManageDepartments || updateMutation.isPending}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleRename(department.id)}
                              disabled={!canManageDepartments || updateMutation.isPending || !editingName.trim()}
                            >
                              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Save
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={cancelEditing} disabled={updateMutation.isPending}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-foreground">{department.name}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {department.employeeCount} active employee{department.employeeCount === 1 ? '' : 's'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(department)}
                        disabled={!canManageDepartments || isBusy}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDepartmentToDelete(department)}
                        disabled={!canManageDepartments || isBusy}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <DeleteDepartmentDialog
        open={Boolean(departmentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setDepartmentToDelete(null);
          }
        }}
        department={departmentToDelete}
        departments={departments}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
