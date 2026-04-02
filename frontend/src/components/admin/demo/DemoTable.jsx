import React from 'react';
import StatusBadge from './StatusBadge';

export default function DemoTable({ requests, onRowClick }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No demo requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-border sm:rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">Lead</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Company</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Team Size</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Status</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {requests.map((request) => (
            <tr 
              key={request.id} 
              onClick={() => onRowClick(request)}
              className="hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center">
                  <div>
                    <div className="font-medium text-foreground">{request.name}</div>
                    <div className="text-muted-foreground">{request.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                {request.company_name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                {request.team_size}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <StatusBadge status={request.status} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
