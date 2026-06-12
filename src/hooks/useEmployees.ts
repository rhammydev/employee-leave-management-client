import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employees';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from './useToast';
import type { CreateEmployeeRequestDto, UpdateEmployeeRequestDto } from '../types';

export const EMPLOYEES_KEY = ['employees'] as const;

export function useEmployees() {
  return useQuery({ queryKey: EMPLOYEES_KEY, queryFn: employeeApi.getAll });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, id],
    queryFn: () => employeeApi.getById(id),
    enabled: id > 0,
  });
}

export function useEmployeesOnLeave() {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, 'on-leave'],
    queryFn: employeeApi.getOnLeave,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (dto: CreateEmployeeRequestDto) => employeeApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee added successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to add employee')),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateEmployeeRequestDto }) =>
      employeeApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee updated successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update employee')),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee deleted successfully');
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete employee')),
  });
}
