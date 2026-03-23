import React from 'react';
import PaymentTable from '../../components/admin/PaymentTable';

export default function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Payments</h1>
        <p className="text-muted-foreground mt-2">
          View all payment transactions across ALL companies.
        </p>
      </div>
      
      <PaymentTable />
    </div>
  );
}
