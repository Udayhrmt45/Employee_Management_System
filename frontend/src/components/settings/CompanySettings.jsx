import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import { useCompanySettings, useUpdateCompanySettings, useDeleteCompany } from '@/hooks/useSettings';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';

export default function CompanySettings() {
  const { userRole } = useAuthUser();
  const canEditCompany = hasPermission(userRole, ROLES.ADMIN);
  const canDeleteCompany = hasPermission(userRole, ROLES.OWNER);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    supportEmail: '',
    website: '',
    phone: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { companySettings, isLoading, isError, errorMessage, refetch } = useCompanySettings();
  const updateMutation = useUpdateCompanySettings();
  const deleteMutation = useDeleteCompany();

  useEffect(() => {
    if (!companySettings) {
      return;
    }

    setCompanyInfo({
      name: companySettings.name || '',
      supportEmail: companySettings.supportEmail || '',
      website: companySettings.website || '',
      phone: companySettings.phone || '',
    });
  }, [companySettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    updateMutation.mutate(companyInfo);
  };

  if (isLoading && !companySettings) {
    return <LoadingSkeleton type="list" rows={4} className="rounded-xl border bg-card p-6" />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Company Profile
        </CardTitle>
        <CardDescription>
          Update your company's general information. This will be displayed on employee communications.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                name="name"
                value={companyInfo.name} 
                onChange={handleChange}
                placeholder="Enter company name" 
                required
                disabled={!canEditCompany || updateMutation.isPending}
              />
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Support Email</Label>
              <Input 
                id="email" 
                name="supportEmail"
                type="email"
                value={companyInfo.supportEmail} 
                onChange={handleChange}
                placeholder="support@company.com" 
                disabled={!canEditCompany || updateMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone"
                value={companyInfo.phone} 
                onChange={handleChange}
                placeholder="+1 (555) 000-0000" 
                disabled={!canEditCompany || updateMutation.isPending}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              name="website"
              type="url"
              value={companyInfo.website} 
              onChange={handleChange}
              placeholder="https://yourcompany.com" 
              disabled={!canEditCompany || updateMutation.isPending}
            />
          </div>
          {!canEditCompany && (
            <p className="text-sm text-muted-foreground">
              You can view company details here, but only admins and owners can update them.
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-muted/20">
          <Button type="submit" disabled={!canEditCompany || updateMutation.isPending}>
            {updateMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Changes</>
            )}
          </Button>
        </CardFooter>
      </form>
      </Card>

      {canDeleteCompany && (
        <Card className="border-destructive/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-destructive/5 border-b border-destructive/10 pb-4">
            <CardTitle className="flex items-center gap-2 text-destructive text-lg">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Irreversible and destructive actions. Proceed with extreme caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h4 className="font-medium text-foreground">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Permanently delete this workspace, all associated data, employee records, attendance logs, and your admin account. <strong className="font-semibold text-foreground">This action cannot be undone.</strong>
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
              >
                Delete Workspace
              </Button>
            </div>
          </CardContent>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="max-w-md w-full shadow-lg border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
                <CardHeader>
                  <CardTitle className="text-destructive flex flex-col items-center gap-3 pt-4 pb-2 text-center text-xl">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    Are you absolutely sure?
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    You are about to permanently delete the <strong className="text-foreground">{companySettings?.name || 'workspace'}</strong> workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4 space-y-3 text-sm border">
                    <p className="font-medium text-destructive">This action will immediately and irreversibly delete:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Your entire company workspace</li>
                      <li>All employee records and profiles</li>
                      <li>All attendance and leave history</li>
                      <li>Your personal administrator account</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-2 pb-6 border-t mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                    ) : (
                      'Yes, delete workspace'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
