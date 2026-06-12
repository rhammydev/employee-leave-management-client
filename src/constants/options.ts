export const DEPARTMENTS = [
  'Research',
  'Engineering',
  'Product',
  'Design',
  'Quality Assurance',
  'Information Technology',
  'Data Analytics',
  'Business Development',
  'Marketing',
  'Customer Support',
  'Human Resources',
  'Finance',
  'Compliance',
  'Operations',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const LEAVE_TYPES = [
  'ANNUAL',
  'SICK',
  'MATERNITY',
  'PATERNITY',
  'UNPAID',
  'EMERGENCY',
  'STUDY',
] as const;

export type LeaveTypeOption = (typeof LEAVE_TYPES)[number];
