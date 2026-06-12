import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveRequests';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from './useToast';
import type { SubmitLeaveRequestDto, LeaveActionRequestDto, LeaveStatus } from '../types';

export const LEAVES_KEY = ['leaves'] as const;

export function useLeaveRequests() {
  return useQuery({ queryKey: LEAVES_KEY, queryFn: leaveApi.getAll });
}

export function useLeaveStatistics(department?: string) {
  return useQuery({
    queryKey: [...LEAVES_KEY, 'statistics', department ?? 'all'],
    queryFn: () => leaveApi.getStatistics(department),
    enabled: department !== undefined,
  });
}

export function useEmployeeLeaves(employeeId: number) {
  return useQuery({
    queryKey: [...LEAVES_KEY, 'employee', employeeId],
    queryFn: () => leaveApi.getByEmployee(employeeId),
    enabled: employeeId > 0,
  });
}

export function useLeaveRequestsByStatus(status: LeaveStatus | 'All') {
  return useQuery({
    queryKey: [...LEAVES_KEY, 'status', status],
    queryFn: () => status === 'All' ? leaveApi.getAll() : leaveApi.getByStatus(status),
    enabled: status !== 'All',
  });
}

export function useSubmitLeaveRequest() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (dto: SubmitLeaveRequestDto) => leaveApi.submit(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEAVES_KEY });
      toast.success('Leave request submitted successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to submit leave request')),
  });
}

export function useUpdateLeaveRequest() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: SubmitLeaveRequestDto }) =>
      leaveApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEAVES_KEY });
      toast.success('Leave request updated successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update leave request')),
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: LeaveActionRequestDto }) =>
      leaveApi.approve(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEAVES_KEY });
      toast.success('Leave request approved successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to approve leave request')),
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: LeaveActionRequestDto }) =>
      leaveApi.reject(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEAVES_KEY });
      toast.success('Leave request rejected successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to reject leave request')),
  });
}

export function useDeleteLeaveRequest() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => leaveApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEAVES_KEY });
      toast.success('Leave request deleted successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete leave request')),
  });
}
