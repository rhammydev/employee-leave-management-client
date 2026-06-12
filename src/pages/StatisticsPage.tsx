import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useLeaveStatistics } from '../hooks/useLeaveRequests';
import { DEPARTMENTS } from '../constants/options';
import { FormField, Select } from '../components/FormField';

export function StatisticsPage() {
  const [department, setDepartment] = useState('');
  const { data: stats, isLoading } = useLeaveStatistics(department || undefined);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">Statistics</h1>
          <p className="text-gray-500 text-sm mt-1">Leave requests breakdown by department</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
          <FormField label="Department">
            <Select
              value={department}
              onChange={e => setDepartment(e.target.value)}
            >
              <option value="">Select a department...</option>
              {DEPARTMENTS.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </FormField>
        </div>

        {!department ? (
          <div className="text-center py-20 text-gray-400">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a department to view its statistics.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-gray-400">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No statistics available for this selection.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="font-semibold text-gray-900">{stats.department}</h3>
              <span className="text-sm text-gray-400">{stats.totalRequests} total</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
              {[
                { label: 'Pending',    value: stats.pending,    color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Processing', value: stats.processing, color: 'text-blue-600',  bg: 'bg-blue-50' },
                { label: 'Approved',   value: stats.approved,   color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Rejected',   value: stats.rejected,   color: 'text-red-600',   bg: 'bg-red-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-semibold ${color} font-display`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}