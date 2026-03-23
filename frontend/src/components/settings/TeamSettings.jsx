import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Mail, UserPlus, ShieldAlert, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import { useInviteTeamMember, useRemoveTeamMember, useTeamMembers } from '@/hooks/useSettings';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';

export default function TeamSettings() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const { userId, userRole } = useAuthUser();
  const isAdmin = hasPermission(userRole, ROLES.ADMIN);
  const { activeMembers, pendingInvitations, isLoading, isError, errorMessage, refetch } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const removeMutation = useRemoveTeamMember();

  const teamMembers = useMemo(() => {
    const active = activeMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role === 'ADMIN' || member.role === 'OWNER' ? 'Admin' : 'Member',
      status: 'Active',
      kind: 'user',
      isCurrentUser: String(member.id) === String(userId),
    }));

    const pending = pendingInvitations.map((invitation) => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role === 'ADMIN' || invitation.role === 'OWNER' ? 'Admin' : 'Member',
      status: 'Pending',
      kind: 'invitation',
      isCurrentUser: false,
    }));

    return [...active, ...pending];
  }, [activeMembers, pendingInvitations, userId]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail && isAdmin) {
      inviteMutation.mutate({
        email: inviteEmail,
        role: inviteRole,
      }, {
        onSuccess: () => {
          setInviteEmail('');
          setInviteRole('EMPLOYEE');
        },
      });
    }
  };

  const handleRemove = (member) => {
    if (!isAdmin) {
      setInviteEmail('');
      return;
    }

    removeMutation.mutate({ memberId: member.id, kind: member.kind });
  };

  if (isLoading && !teamMembers.length) {
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
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Invite new colleagues to join your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Email address" 
                type="email" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-9"
                required
                disabled={!isAdmin || inviteMutation.isPending}
              />
            </div>
            <Select value={inviteRole} onValueChange={setInviteRole} disabled={!isAdmin || inviteMutation.isPending}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={!isAdmin || inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
          {!isAdmin && (
            <p className="mt-3 text-sm text-muted-foreground">
              Only admins can invite or remove team members.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manage Team
          </CardTitle>
          <CardDescription>
            View and manage current active and pending team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{member.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                    <span className="text-xs px-2 py-1 bg-secondary rounded-full font-medium">
                      {member.role}
                    </span>
                    {member.status === 'Pending' && (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 rounded-full font-medium flex items-center gap-1">
                        Pending
                      </span>
                    )}
                  </div>
                  {member.role !== 'Admin' && !member.isCurrentUser ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(member)}
                      disabled={!isAdmin || removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center text-muted-foreground" title={member.isCurrentUser ? "You cannot remove yourself" : "Cannot remove Admin"}>
                       <ShieldAlert className="h-4 w-4 opacity-50" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No team members found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
