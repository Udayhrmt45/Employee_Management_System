import React from 'react';
import CompanyTable from '../../components/admin/CompanyTable';

export default function Companies() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all tenant companies on the platform.
        </p>
      </div>
      
      <CompanyTable />
    </div>
  );
}
