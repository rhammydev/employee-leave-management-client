import { useState } from 'react';
import { UserCheck, Mail, Building2, Eye, X } from 'lucide-react';
import { useEmployeesOnLeave, useEmployee } from '../hooks/useEmployees';
import type { Employee } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface EmployeeDrawerProps {
  employee?: Employee;
  isLoading: boolean;
  onClose: () => void;
}

function EmployeeDrawer({ employee, isLoading, onClose }: EmployeeDrawerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-display">Employee Details</h2>
            {employee && <p className="text-xs text-gray-500 mt-0.5">Employee #{employee.id}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : employee ? (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-semibold">{getInitials(employee.employeeName)}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 font-display truncate">{employee.employeeName}</h3>
                <p className="text-sm text-gray-500">{employee.department}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Mail size={14} />
                  <span className="text-xs font-medium uppercase tracking-wide">Email</span>
                </div>
                <p className="text-sm text-gray-900 break-words">{employee.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Building2 size={14} />
                  <span className="text-xs font-medium uppercase tracking-wide">Department</span>
                </div>
                <p className="text-sm text-gray-900">{employee.department}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <UserCheck size={14} />
                  <span className="text-xs font-medium uppercase tracking-wide">Leave Status</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  On Leave
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <UserCheck size={14} />
                  <span className="text-xs font-medium uppercase tracking-wide">Joined</span>
                </div>
                <p className="text-sm text-gray-900">{formatDate(employee.dateJoined)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500">Employee not found.</div>
        )}
      </aside>
    </>
  );
}

export function OnLeavePage() {
  const { data: employees = [], isLoading } = useEmployeesOnLeave();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { data: viewingEmployee, isLoading: isViewingLoading } = useEmployee(viewingId ?? 0);

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
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">Currently On Leave</h1>
          <p className="text-gray-500 text-sm mt-1">
            {employees.length === 0
              ? 'No employees are currently on leave'
              : `${employees.length} employee${employees.length !== 1 ? 's' : ''} currently on leave`}
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">All employees are currently at work.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-green-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <span className="text-green-600 font-semibold text-xs">{getInitials(emp.employeeName)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{emp.employeeName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Employee #{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[220px]">{emp.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          <span>{emp.department}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(emp.dateJoined)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setViewingId(emp.id)}
                            title="View details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {viewingId !== null && (
        <EmployeeDrawer
          employee={viewingEmployee}
          isLoading={isViewingLoading}
          onClose={() => setViewingId(null)}
        />
      )}
    </div>
  );
}
