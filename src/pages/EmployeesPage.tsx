import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, UserCircle, Mail, Building2, Eye, X, CalendarDays } from 'lucide-react';
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useEmployees';
import { Modal } from '../components/Modal';
import { FormField, Input, Select } from '../components/FormField';
import { DEPARTMENTS } from '../constants/options';
import { createEmployeeSchema, updateEmployeeSchema, validateForm } from '../validation/schemas';
import type { CreateEmployeeRequestDto, Employee } from '../types';

type FormState = CreateEmployeeRequestDto;
const EMPTY: FormState = { fullName: '', email: '', department: '' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name
    ?.split(' ')
    ?.map(n => n[0])
    ?.join('')
    ?.slice(0, 2)
    ?.toUpperCase();
}

interface EmployeeFormProps {
  form: FormState;
  errors: Partial<FormState>;
  isPending: boolean;
  editing: boolean;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

function EmployeeForm({
  form,
  errors,
  isPending,
  editing,
  onFieldChange,
  onCancel,
  onSave,
}: EmployeeFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Full Name" error={errors.fullName}>
        <Input
          value={form.fullName}
          error={!!errors.fullName}
          placeholder="e.g. Abdulrahman Umar"
          onChange={e => onFieldChange('fullName', e.target.value)}
        />
      </FormField>
      <FormField label="Email Address" error={errors.email}>
        <Input
          type="email"
          value={form.email}
          error={!!errors.email}
          placeholder="e.g. a.umar@company.com"
          onChange={e => onFieldChange('email', e.target.value)}
        />
      </FormField>
      <FormField label="Department" error={errors.department}>
        <Select
          value={form.department}
          error={!!errors.department}
          onChange={e => onFieldChange('department', e.target.value)}
        >
          <option value="">Select department...</option>
          {DEPARTMENTS.map(department => (
            <option key={department} value={department}>{department}</option>
          ))}
        </Select>
      </FormField>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </div>
  );
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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold">{getInitials(employee.fullName)}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 font-display truncate">{employee.fullName}</h3>
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
                <UserCircle size={14} />
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

export function EmployeesPage() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { data: viewingEmployee, isLoading: isViewingLoading } = useEmployee(viewingId ?? 0);

  function openAdd() {
    setForm({ ...EMPTY });
    setErrors({});
    setShowAdd(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({ fullName: emp.fullName, email: emp.email, department: emp.department });
    setErrors({});
  }

  async function handleSubmit() {
    const validationErrors = validateForm(editing ? updateEmployeeSchema : createEmployeeSchema, form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, dto: form });
      setEditing(null);
    } else {
      await createMutation.mutateAsync(form);
      setShowAdd(false);
    }
    setForm({ ...EMPTY });
    setErrors({});
  }

  async function confirmDeleteEmployee() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

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
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">Employees</h1>
            <p className="text-gray-500 text-sm mt-1">{employees.length} registered</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Employee</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No employees yet. Add your first one.</p>
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
                  {employees?.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 font-semibold text-xs">{getInitials(emp.fullName)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{emp.fullName}</p>
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingId(emp.id)}
                            title="View details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        
                          <button
                            onClick={() => navigate(`/employees/${emp.id}/leaves`)}
                            title="View employee leaves"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <CalendarDays size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(emp)}
                            title="Edit employee"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(emp)}
                            disabled={deleteMutation.isPending}
                            title="Delete employee"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={14} />
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

      <Modal size="md" open={showAdd} onClose={() => setShowAdd(false)} title="Add New Employee">
        <EmployeeForm
          form={form}
          errors={errors}
          isPending={isPending}
          editing={false}
          onFieldChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
          onCancel={() => setShowAdd(false)}
          onSave={handleSubmit}
        />
      </Modal>

      <Modal size="md" open={!!editing} onClose={() => setEditing(null)} title="Edit Employee">
        <EmployeeForm
          form={form}
          errors={errors}
          isPending={isPending}
          editing
          onFieldChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
          onCancel={() => setEditing(null)}
          onSave={handleSubmit}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete {deleteTarget?.employeeName}? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteEmployee}
              disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

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
