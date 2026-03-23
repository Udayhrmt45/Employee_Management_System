import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

export default function CompanyTable() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/admin/companies');
        setCompanies(res.data);
      } catch (err) {
        toast.error('Failed to load companies');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const handleToggleStatus = async (companyId, currentStatus) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      await api.put(`/admin/companies/${companyId}/${action}`);
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, is_active: !currentStatus } : c
      ));
      toast.success(`Company ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      toast.error('Failed to change company status');
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.domain || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={company.plan_type === 'FREE' ? 'outline' : 'default'} className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
                      {company.plan_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.employee_count}</TableCell>
                  <TableCell>
                    <Badge variant={company.is_active ? 'success' : 'destructive'} className={company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleStatus(company.id, company.is_active)}
                      className={company.is_active ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}
                    >
                      {company.is_active ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                      {company.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No companies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
