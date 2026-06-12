import * as yup from 'yup';
import { DEPARTMENTS, LEAVE_TYPES } from '../constants/options';
import type {
  CreateEmployeeRequestDto,
  LeaveActionRequestDto,
  SubmitLeaveRequestDto,
  UpdateEmployeeRequestDto,
} from '../types';

type ApproveLeaveRequestDto = Omit<LeaveActionRequestDto, 'reason'> & { reason?: string };

export const createEmployeeSchema: yup.ObjectSchema<CreateEmployeeRequestDto> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('Full name is required and must have between 3 and 100 characters')
    .min(3, 'Full name is required and must have between 3 and 100 characters')
    .max(100, 'Full name is required and must have between 3 and 100 characters'),
  email: yup
    .string()
    .trim()
    .required('A valid email is required')
    .email('A valid email is required'),
  department: yup
    .string()
    .required(`Department must be one of: ${DEPARTMENTS.join(', ')}`)
    .oneOf(DEPARTMENTS, `Department must be one of: ${DEPARTMENTS.join(', ')}`),
});

export const updateEmployeeSchema: yup.ObjectSchema<UpdateEmployeeRequestDto> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('Full name is required and must have between 3 and 100 characters')
    .min(3, 'Full name is required and must have between 3 and 100 characters')
    .max(100, 'Full name is required and must have between 3 and 100 characters'),
  email: yup
    .string()
    .trim()
    .required('A valid email is required')
    .email('A valid email is required'),
  department: yup
    .string()
    .required(`Department must be one of: ${DEPARTMENTS.join(', ')}`)
    .oneOf(DEPARTMENTS, `Department must be one of: ${DEPARTMENTS.join(', ')}`),
});

export const submitLeaveRequestSchema: yup.ObjectSchema<SubmitLeaveRequestDto> = yup.object({
  employeeId: yup
    .number()
    .typeError('Employee id is required')
    .required('Employee id is required')
    .min(1, 'Employee id is required')
    .integer('Employee id is required'),
  leaveType: yup
    .string()
    .required('Leave type is required')
    .oneOf(LEAVE_TYPES, `Invalid leave type, Leave type must be one of: ${LEAVE_TYPES.join(', ')}`),
  startDate: yup.string().trim().required('Start date is required'),
  endDate: yup.string().trim().required('End Date is required'),
  reason: yup
    .string()
    .trim()
    .required('Reason is required')
    .min(5, 'Reason must be between 5 and 150 characters')
    .max(150, 'Reason must be between 5 and 150 characters'),
});

export const approveLeaveRequestSchema: yup.ObjectSchema<ApproveLeaveRequestDto> = yup.object({
  approverId: yup
    .number()
    .typeError('Approver Id is required')
    .required('Approver Id is required')
    .min(1, 'Approver Id is required')
    .integer('Approver Id is required'),
  reason: yup.string().trim().optional(),
});

export const rejectLeaveRequestSchema: yup.ObjectSchema<LeaveActionRequestDto> = yup.object({
  approverId: yup
    .number()
    .typeError('Approver Id is required')
    .required('Approver Id is required')
    .min(1, 'Approver Id is required')
    .integer('Approver Id is required'),
  reason: yup
    .string()
    .trim()
    .required('Reason is required')
    .min(5, 'Reason is required'),
});

export function validateForm<T extends object>(
  schema: yup.ObjectSchema<T>,
  values: T,
): Record<string, string> {
  try {
    schema.validateSync(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.inner.reduce<Record<string, string>>((acc, err) => {
        if (err.path) acc[err.path] = err.message;
        return acc;
      }, {});
    }

    return { form: 'Something went wrong. Try again.' };
  }
}
