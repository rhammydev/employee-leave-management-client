import { Users, CalendarDays, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import { StatusBadge, LeaveTypeBadge } from '../components/Badges';
import type { LeaveRequest } from '../types';

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: typeof Users; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs lg:text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 font-display">{value}</p>
          {sub && <p className="text-[11px] lg:text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 lg:p-2.5 rounded-xl ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function getDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export function DashboardPage() {
  const { data: employees = [], isLoading: loadingEmp } = useEmployees();
  const { data: leaves = [], isLoading: loadingLeaves } = useLeaveRequests();

  const pending    = leaves?.filter(l => l.status === 'PENDING')?.length;
  const processing = leaves?.filter(l => l.status === 'PROCESSING')?.length;
  const approved   = leaves?.filter(l => l.status === 'APPROVED')?.length;
  const approvalRate = leaves?.length ? Math.round((approved / leaves?.length) * 100) : 0;

  const recent: LeaveRequest[] = [...leaves]
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 8);

  if (loadingEmp || loadingLeaves) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your leave management system</p>
        </div>

        {/* Stats grid — 2 cols on mobile, 3 on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard label="Employees"    value={employees?.length} icon={Users}       color="bg-blue-600"   sub="registered" />
          <StatCard label="Total"        value={leaves?.length}    icon={CalendarDays} color="bg-slate-500"  sub="all time" />
          <StatCard label="Pending"      value={pending}          icon={Clock}        color="bg-amber-500"  sub="1st approval" />
          <StatCard label="Processing"   value={processing}       icon={RefreshCw}    color="bg-blue-400"   sub="2nd approval" />
          <StatCard label="Approved"     value={approved}         icon={CheckCircle}  color="bg-green-600"  sub="fully approved" />
          <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={TrendingUp} color="bg-indigo-600" sub="of all requests" />
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Leave Requests</h2>
          </div>
          {recent?.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No leave requests yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent?.map(lr => (
                <div key={lr.id} className="px-4 lg:px-6 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lr?.employeeName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(lr?.startDate)} → {formatDate(lr?.endDate)} · {getDays(lr?.startDate, lr?.endDate)}d
                    </p>
                  </div>
                  {/* Hide LeaveTypeBadge on very small screens */}
                  <span className="hidden sm:inline-flex">
                    <LeaveTypeBadge type={lr?.leaveType} />
                  </span>
                  <StatusBadge status={lr?.status} />
                  <span className="hidden md:inline text-xs text-gray-300 whitespace-nowrap">
                    {lr?.approvals?.length}/2
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
