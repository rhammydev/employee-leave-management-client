// ─── Enums ────────────────────────────────────────────────────────────────────
export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'EMERGENCY' | 'STUDY';

// Updated: now includes "Processing" for the two-step workflow
export type LeaveStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';

export type ApprovalAction = 'Approve' | 'Reject';

// ─── Entities ────────────────────────────────────────────────────────────────
export interface Employee {
  id: number;
  employeeName: string;
  fullName: string;   // was "name" before — updated to match FullName
  email: string;
  department: string;
  dateJoined: string;
}

export interface LeaveApproval {
  id: number;
  leaveRequestId: number;
  approverId: number;
  approverName: string;
  action: ApprovalAction;
  reason: string | null;
  dateActed: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  dateCreated: string;
  rejectionReason?: string | null;
  approvals: LeaveApproval[];
}

// ─── Request DTOs (match spec exactly) ───────────────────────────────────────
export interface CreateEmployeeRequestDto {
  fullName: string;
  email: string;
  department: string;
}

export interface UpdateEmployeeRequestDto {
  fullName: string;
  email: string;
  department: string;
}

export interface SubmitLeaveRequestDto {
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveActionRequestDto {
  approverId: number;
  reason: string;
}

// ─── Statistics ───────────────────────────────────────────────────────────────
export interface DepartmentStatistic {
  department: string;
  totalRequests: number;
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Employee on Leave ───────────────────────────────────────────────────────
export interface EmployeeOnLeave {
  id: number;
  employeeName: string;
  fullName: string;   // was "name" before — updated to match FullName
  email: string;
  department: string;
  startDate: string;
  endDate: string;
}