import { useState } from "react";
import {
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  CalendarDays,
  ChevronDown,
  Info,
  Pencil,
} from "lucide-react";
import {
  useLeaveRequests,
  useLeaveRequestsByStatus,
  useSubmitLeaveRequest,
  useUpdateLeaveRequest,
  useApproveLeave,
  useRejectLeave,
  useDeleteLeaveRequest,
} from "../hooks/useLeaveRequests";
import { useEmployees } from "../hooks/useEmployees";
import { Modal } from "../components/Modal";
import { StatusBadge, LeaveTypeBadge } from "../components/Badges";
import { FormField, Input, Select, Textarea } from "../components/FormField";
import { LEAVE_TYPES } from "../constants/options";
import {
  approveLeaveRequestSchema,
  rejectLeaveRequestSchema,
  submitLeaveRequestSchema,
  validateForm,
} from "../validation/schemas";
import type {
  SubmitLeaveRequestDto,
  LeaveActionRequestDto,
  LeaveType,
  LeaveStatus,
  LeaveRequest,
} from "../types";

const STATUS_FILTERS: Array<LeaveStatus | "All"> = [
  "All",
  "PENDING",
  "PROCESSING",
  "APPROVED",
  "REJECTED",
];

const EMPTY_SUBMIT: SubmitLeaveRequestDto = {
  employeeId: 0,
  leaveType: "ANNUAL",
  startDate: "",
  endDate: "",
  reason: "",
};
const EMPTY_ACTION: LeaveActionRequestDto = { approverId: 0, reason: "" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function getDays(start: string, end: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
    ) + 1,
  );
}
function getApiError(err: unknown): string {
  const e = err as {
    response?: {
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };
  if (e?.response?.data?.errors)
    return Object.values(e.response.data.errors).flat().join(". ");
  return e?.response?.data?.message || "Something went wrong. Try again.";
}

function ApprovalTimeline({ request }: Readonly<{ request: LeaveRequest }>) {
  return (
    <div className="mt-3 space-y-2">
      {request?.approvals?.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No approvals yet</p>
      ) : (
        request?.approvals?.map((a, i) => (
          <div key={a?.id} className="flex items-start gap-2 text-xs">
            <div
              className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${a?.action === "Approve" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {a?.action === "Approve" ? (
                <CheckCircle size={10} />
              ) : (
                <XCircle size={10} />
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Step {i + 1}: </span>
              <span className="text-gray-500">
                {a?.approverName}{" "}
                {a?.action === "Approve" ? "approved" : "rejected"}
              </span>
              {a?.reason && (
                <span className="text-gray-400"> — "{a?.reason}"</span>
              )}
              <p className="text-gray-300">{formatDate(a?.dateActed)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Mobile leave card ────────────────────────────────────────────────────────
function LeaveCard({
  lr,
  onApprove,
  onReject,
  onDetail,
  onEdit,
  onDelete,
}: Readonly<{
  lr: LeaveRequest;
  onApprove: () => void;
  onReject: () => void;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}>) {
  const canAct = lr?.status === "PENDING" || lr?.status === "PROCESSING";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {lr?.employeeName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {lr?.reason}
          </p>
        </div>
        <StatusBadge status={lr?.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <LeaveTypeBadge type={lr?.leaveType} />
        <span className="text-xs text-gray-400">
          {formatDate(lr?.startDate)} → {formatDate(lr?.endDate)} ·{" "}
          {getDays(lr?.startDate, lr?.endDate)}d
        </span>
      </div>

      {/* Approval steps */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Approvals:</span>
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
            ${i < lr?.approvals?.length
                ? lr?.approvals[i]?.action === "Approve"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-300"
              }`}
          >
            {i < lr?.approvals?.length
              ? lr?.approvals[i]?.action === "Approve"
                ? "✓"
                : "✗"
              : i + 1}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={onDetail}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50"
        >
          <Info size={13} /> History
        </button>
        {canAct && (
          <>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors py-1 px-2 rounded-lg hover:bg-green-50"
            >
              <CheckCircle size={13} /> Approve
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
            >
              <XCircle size={13} /> Reject
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function LeavesPage() {
  const { data: allLeaves = [], isLoading: isAllLeavesLoading } = useLeaveRequests();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const submitMutation = useSubmitLeaveRequest();
  const updateMutation = useUpdateLeaveRequest();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const deleteMutation = useDeleteLeaveRequest();

  const [showSubmit, setShowSubmit] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    request: LeaveRequest;
    type: "approve" | "reject";
  } | null>(null);
  const [detailTarget, setDetailTarget] = useState<LeaveRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null);
  const [submitForm, setSubmitForm] =
    useState<SubmitLeaveRequestDto>(EMPTY_SUBMIT);
  const [actionForm, setActionForm] =
    useState<LeaveActionRequestDto>(EMPTY_ACTION);
  const [approverIdInput, setApproverIdInput] = useState('');
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | "All">("All");
  const { data: statusLeaves = [], isLoading: isStatusLeavesLoading } = useLeaveRequestsByStatus(filterStatus);
  const leaves = filterStatus === "All" ? allLeaves : statusLeaves;
  const isLoading = isAllLeavesLoading || (filterStatus !== "All" && isStatusLeavesLoading);

  function validateSubmit() {
    const validationErrors = validateForm(submitLeaveRequestSchema, submitForm);
    if (
      submitForm.startDate &&
      submitForm.endDate &&
      submitForm.endDate < submitForm.startDate
    ) {
      validationErrors.endDate = "End date must be after start date";
    }

    const today = new Date().toISOString().split('T')[0];
    if (submitForm.startDate && submitForm.startDate < today) {
      validationErrors.startDate = "Start date cannot be in the past";
    }

    setSubmitErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  function validateAction(requireReason: boolean) {
    const actionValues = {
      ...actionForm,
      approverId: approverIdInput === '' ? 0 : Number(approverIdInput),
    };
    const validationErrors = validateForm(
      requireReason ? rejectLeaveRequestSchema : approveLeaveRequestSchema,
      actionValues,
    );

    setActionErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateSubmit()) return;

    if (editingLeave) {
      await updateMutation.mutateAsync({ id: editingLeave.id, dto: submitForm });
      setEditingLeave(null);
      setShowSubmit(false);
    } else {
      await submitMutation.mutateAsync(submitForm);
      setShowSubmit(false);
    }

    setSubmitForm(EMPTY_SUBMIT);
    setSubmitErrors({});
  }

  async function handleAction() {
    if (!actionTarget) return;
    const isReject = actionTarget.type === "reject";
    if (!validateAction(isReject)) return;

    const dto = {
      ...actionForm,
      approverId: Number(approverIdInput),
    };

    if (isReject) {
      await rejectMutation.mutateAsync({
        id: actionTarget.request.id,
        dto,
      });
    } else {
      await approveMutation.mutateAsync({
        id: actionTarget.request.id,
        dto,
      });
    }
    setActionTarget(null);
    setActionForm(EMPTY_ACTION);
    setApproverIdInput('');
    setActionErrors({});
  }

  function openAction(request: LeaveRequest, type: "approve" | "reject") {
    setActionTarget({ request, type });
    setActionForm(EMPTY_ACTION);
    setApproverIdInput('');
    setActionErrors({});
  }

  function openEditLeave(request: LeaveRequest) {
    setEditingLeave(request);
    setSubmitForm({
      employeeId: request.employeeId,
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
    });
    setSubmitErrors({});
    setShowSubmit(true);
  }

  async function confirmDeleteLeave() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const actionPending = approveMutation.isPending || rejectMutation.isPending;
  const actionError =
    actionTarget?.type === "approve"
      ? approveMutation.error
      : rejectMutation.error;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-display">
              Leave Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {leaves?.length} of {allLeaves?.length} requests
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLeave(null);
              setSubmitForm(EMPTY_SUBMIT);
              setSubmitErrors({});
              setShowSubmit(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 lg:mb-5 text-xs text-blue-700">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>
            <strong>Two-step approval:</strong> Pending → (1st) → Processing →
            (2nd) → Approved. Self-approval and duplicate actions are rejected
            by the API.
          </p>
        </div>

        {/* Filter tabs — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 mb-4 lg:mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0
                ${filterStatus === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
            >
              {s}
              <span className="ml-1.5 opacity-60">
                {s === "All"
                  ? allLeaves?.length
                  : allLeaves?.filter((l) => l?.status === s)?.length}
              </span>
            </button>
          ))}
        </div>

        {leaves?.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No leave requests found.</p>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {leaves?.map((lr) => (
                <LeaveCard
                  key={lr?.id}
                  lr={lr}
                  onApprove={() => openAction(lr, "approve")}
                  onReject={() => openAction(lr, "reject")}
                  onDetail={() => setDetailTarget(lr)}
                  onEdit={() => openEditLeave(lr)}
                  onDelete={() => setDeleteTarget(lr)}
                />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    {[
                      "Employee",
                      "Type",
                      "Period",
                      "Days",
                      "Approvals",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves?.map((lr) => (
                    <tr
                      key={lr?.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">
                          {lr?.employeeName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[160px]">
                          {lr?.reason}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <LeaveTypeBadge type={lr?.leaveType} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {formatDate(lr?.startDate)}
                        <br />
                        <span className="text-gray-400">
                          → {formatDate(lr?.endDate)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-gray-700 font-medium">
                          {getDays(lr?.startDate, lr?.endDate)}d
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {[0, 1]?.map((i) => (
                            <div
                              key={i}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                              ${i < lr?.approvals?.length
                                  ? lr?.approvals[i].action?.toLowerCase() === "approved"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-500"
                                  : "bg-gray-100 text-gray-300"
                                }`}
                            >
                              {i < lr?.approvals?.length
                                ? lr?.approvals?.[i].action?.toLowerCase() === "approved"
                                  ? "✓"
                                  : "✗"
                                : i + 1}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={lr?.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailTarget(lr)}
                            title="View approvals"
                            className="p-1.5 rounded-lg text-black hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Info size={14} />
                          </button>
                          {lr?.status?.toLowerCase() === "pending" && (
                            <button
                              onClick={() => openEditLeave(lr)}
                              title="Edit leave request"
                              className="p-1.5 rounded-lg text-black hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {(lr?.status?.toLowerCase() === "pending" ||
                            lr?.status?.toLowerCase() === "processing") && (
                            <>
                              <button
                                onClick={() => openAction(lr, "approve")}
                                title="Approve"
                                className="p-1.5 rounded-lg text-black hover:text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => openAction(lr, "reject")}
                                title="Reject"
                                className="p-1.5 rounded-lg text-black hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteTarget(lr)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-black hover:text-red-500 hover:bg-red-50 transition-colors"
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
          </>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title={editingLeave ? "Edit Leave Request" : "Submit Leave Request"}
      >
        <div className="space-y-4">
          <FormField label="Employee" error={submitErrors.employeeId}>
            <div className="relative">
              <Select
                value={submitForm.employeeId === 0 ? "" : String(submitForm.employeeId)}
                error={!!submitErrors.employeeId}
                onChange={(e) =>
                  setSubmitForm((f) => ({
                    ...f,
                    employeeId: Number(e.target.value),
                  }))
                }
              >
                <option value="">
                  {isLoadingEmployees ? "Loading employees..." : "Select employee..."}
                </option>
                {employees?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} — {e.department}
                  </option>
                ))}
              </Select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </FormField>
          <FormField label="Leave Type" error={submitErrors.leaveType}>
            <div className="relative">
              <Select
                value={submitForm.leaveType}
                error={!!submitErrors.leaveType}
                onChange={(e) =>
                  setSubmitForm((f) => ({
                    ...f,
                    leaveType: e.target.value as LeaveType,
                  }))
                }
              >
                <option value="">Select leave type...</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" error={submitErrors.startDate}>
              <Input
                type="date"
                value={submitForm.startDate}
                error={!!submitErrors.startDate}
                onChange={(e) =>
                  setSubmitForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </FormField>
            <FormField label="End Date" error={submitErrors.endDate}>
              <Input
                type="date"
                value={submitForm.endDate}
                error={!!submitErrors.endDate}
                onChange={(e) =>
                  setSubmitForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </FormField>
          </div>
          <FormField label="Reason" error={submitErrors.reason}>
            <Textarea
              rows={3}
              value={submitForm.reason}
              error={!!submitErrors.reason}
              placeholder="Brief description of leave reason..."
              onChange={(e) =>
                setSubmitForm((f) => ({ ...f, reason: e.target.value }))
              }
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setEditingLeave(null);
                setShowSubmit(false);
              }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
          {submitMutation.isError && (
            <p className="text-xs text-red-500 text-center">
              {getApiError(submitMutation.error)}
            </p>
          )}
        </div>
      </Modal>

      {/* Approve / Reject Modal */}
      <Modal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={
          actionTarget?.type === "approve"
            ? "✓ Approve Leave Request"
            : "✗ Reject Leave Request"
        }
      >
        {actionTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p className="font-medium text-gray-900">
                {actionTarget.request.employeeName}
              </p>
              <p className="text-gray-500">
                {actionTarget.request.leaveType} ·{" "}
                {getDays(
                  actionTarget.request.startDate,
                  actionTarget.request.endDate,
                )}{" "}
                days
              </p>
              <p className="text-gray-400 text-xs">
                {formatDate(actionTarget.request.startDate)} →{" "}
                {formatDate(actionTarget.request.endDate)}
              </p>
              <div className="pt-1">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Approval progress:
                </p>
                <ApprovalTimeline request={actionTarget.request} />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-xs text-amber-700">
              <strong>Note:</strong> You cannot approve your own leave or act
              twice on the same request.
            </div>
            <FormField
              label="Approver"
              error={actionErrors.approverId}
            >

              <div className="relative">
                <Select
                  value={approverIdInput}
                  error={!!actionErrors.approverId}
                  onChange={(e) => setApproverIdInput(e.target.value)}
                >
                  <option value="">
                    {isLoadingEmployees ? "Loading employees..." : "Select approver..."}
                  </option>
                  {employees
                    ?.filter((e) => e.fullName !== actionTarget.request.employeeName)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} — {e.department}
                      </option>
                    ))}
                </Select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </FormField>
            <FormField
              label={
                actionTarget.type === "reject"
                  ? "Rejection Reason (required)"
                  : "Reason"
              }
              error={actionErrors.reason}
            >
              <Textarea
                rows={3}
                value={actionForm.reason}
                error={!!actionErrors.reason}
                placeholder={
                  actionTarget.type === "reject"
                    ? "State the reason for rejection..."
                    : "Optional approval note..."
                }
                onChange={(e) =>
                  setActionForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActionTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionPending}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60
                  ${actionTarget.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {actionPending
                  ? "Processing..."
                  : actionTarget.type === "approve"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
            {actionError && (
              <p className="text-xs text-red-500 text-center">
                {getApiError(actionError)}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Leave Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this leave request? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteLeave}
              disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Approval History"
        size="md"
      >
        {detailTarget && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {detailTarget.employeeName}
              </p>
              <StatusBadge status={detailTarget.status} />
            </div>
            <p className="text-xs text-gray-500">
              {detailTarget.leaveType} · {formatDate(detailTarget.startDate)} →{" "}
              {formatDate(detailTarget.endDate)}
            </p>
            <div className="border-t border-gray-100 pt-3">
              <ApprovalTimeline request={detailTarget} />
            </div>
            {detailTarget.approvals.length < 2 &&
              detailTarget.status !== "REJECTED" && (
                <p className="text-xs text-gray-400 italic pt-1">
                  {2 - detailTarget.approvals.length} more approval(s) needed.
                </p>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
}
