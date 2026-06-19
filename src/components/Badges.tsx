import type { LeaveStatus, LeaveType } from '../types';

function normalizeStatus(status: string) {
  return status.toUpperCase() as LeaveStatus;
}

const statusConfig: Record<LeaveStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Processing' },
  APPROVED:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Approved' },
  REJECTED:   { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Rejected' },
};

const leaveTypeConfig: Record<LeaveType, { bg: string; text: string }> = {
  ANNUAL:    { bg: 'bg-indigo-50',  text: 'text-indigo-700'  },
  SICK:      { bg: 'bg-orange-50',  text: 'text-orange-700'  },
  MATERNITY: { bg: 'bg-pink-50',    text: 'text-pink-700'    },
  PATERNITY: { bg: 'bg-violet-50',  text: 'text-violet-700'  },
  UNPAID:    { bg: 'bg-gray-100',   text: 'text-gray-600'    },
  EMERGENCY: { bg: 'bg-red-50',     text: 'text-red-700'     },
  STUDY:     { bg: 'bg-cyan-50',    text: 'text-cyan-700'    },
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const c = statusConfig[normalizeStatus(status)];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${c?.bg} ${c?.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c?.dot}`} />
      {c?.label?.toUpperCase()}
    </span>
  );
}

export function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const c = leaveTypeConfig[type];
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${c?.bg} ${c?.text}`}>
      {type}
    </span>
  );
}
