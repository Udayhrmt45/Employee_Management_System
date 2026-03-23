export const MOCK_EMPLOYEES = [
  { id: 1, name: 'Alice Cooper', email: 'alice@hrsaas.com', position: 'HR Manager', department: 'Human Resources', status: 'Active', phone: '+1 234 567 8900' },
  { id: 2, name: 'Bob Smith', email: 'bob@hrsaas.com', position: 'Software Engineer', department: 'Engineering', status: 'Active', phone: '+1 234 567 8901' },
  { id: 3, name: 'Charlie Davis', email: 'charlie@hrsaas.com', position: 'Product Designer', department: 'Design', status: 'On Leave', phone: '+1 234 567 8902' },
  { id: 4, name: 'Diana Prince', email: 'diana@hrsaas.com', position: 'Marketing Lead', department: 'Marketing', status: 'Active', phone: '+1 234 567 8903' },
];

export const MOCK_ATTENDANCE = [
  { id: 1, date: new Date().toISOString().split('T')[0], checkInTime: '08:45 AM', checkOutTime: null, status: 'Present', notes: 'Arrived early' },
  { id: 2, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], checkInTime: '09:05 AM', checkOutTime: '05:15 PM', status: 'Late', notes: 'Traffic' },
  { id: 3, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], checkInTime: '08:55 AM', checkOutTime: '05:00 PM', status: 'Present', notes: '' },
  { id: 4, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], checkInTime: null, checkOutTime: null, status: 'Absent', notes: 'Sick leave' },
];

export const MOCK_LEAVES = [
  { id: 1, employee: 'Bob Smith', avatar: 'B', type: 'Annual Leave', startDate: '2023-10-15', endDate: '2023-10-20', status: 'Approved', reason: 'Family vacation' },
  { id: 2, employee: 'Charlie Davis', avatar: 'C', type: 'Sick Leave', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], status: 'Pending', reason: 'Not feeling well' },
  { id: 3, employee: 'Diana Prince', avatar: 'D', type: 'Personal Leave', startDate: '2023-11-01', endDate: '2023-11-02', status: 'Rejected', reason: 'Personal errands' },
];
