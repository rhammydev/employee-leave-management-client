import { ArrowLeft, CalendarDays, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge, LeaveTypeBadge } from '../components/Badges';
import { useEmployeeLeaves } from '../hooks/useLeaveRequests';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export function EmployeeLeavesPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);
  const { data: leaves = [], isLoading } = useEmployeeLeaves(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/employees')}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to employees
        </button>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">Employee Leave History</h1>
            <p className="text-gray-500 text-sm mt-1">
              {leaves.length} leave {leaves.length !== 1 ? 'requests' : 'request'} for employee #{id}
            </p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No leave requests found for this employee.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Request</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Period</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Days</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Approvals</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves.map(lr => (
                    <tr key={lr.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 text-sm">Request #{lr.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[220px]">{lr.reason}</p>
                      </td>
                      <td className="px-5 py-4">
                        <LeaveTypeBadge type={lr.leaveType} />
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {formatDate(lr.startDate)}
                        <br />
                        <span className="text-gray-400">→ {formatDate(lr.endDate)}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">{getDays(lr.startDate, lr.endDate)}d</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {[0, 1].map(i => (
                            <div
                              key={i}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                ${i < lr.approvals.length
                                  ? lr.approvals[i].action === 'Approve'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-500'
                                  : 'bg-gray-100 text-gray-300'
                                }`}
                            >
                              {i < lr.approvals.length
                                ? lr.approvals[i].action === 'Approve'
                                  ? '✓'
                                  : '✗'
                                : i + 1}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={lr.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {lr.rejectionReason ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <Info size={14} />
                            {lr.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
