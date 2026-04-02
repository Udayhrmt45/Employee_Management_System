import React from 'react';

const STATUS_CONFIG = {
  NEW: { colors: 'bg-gray-100 text-gray-700 ring-gray-600/20' },
  CONTACTED: { colors: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  SCHEDULED: { colors: 'bg-green-50 text-green-700 ring-green-600/20' },
  CLOSED: { colors: 'bg-red-50 text-red-700 ring-red-600/10' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['NEW'];

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.colors}`}>
      {status}
    </span>
  );
}
