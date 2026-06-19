import client from "./client";
import type {
  Employee,
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  EmployeeOnLeave,
} from "../types";
import { DEPARTMENTS } from "../constants/options";

function normalizeDepartment(department: string): string {
  const matchedDepartment = DEPARTMENTS.find(
    item => item.toLowerCase() === department.toLowerCase(),
  );

  if (matchedDepartment) {
    return matchedDepartment;
  }

  return department
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeEmployee<T extends { department: string }>(employee: T): T {
  return {
    ...employee,
    department: normalizeDepartment(employee.department),
  };
}

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const res = await client.get<Employee[]>("/employees");
    return res.data.map(normalizeEmployee);
  },

  getById: async (id: number): Promise<Employee> => {
    const res = await client.get<Employee>(`/employees/${id}`);
    return normalizeEmployee(res.data);
  },

  create: async (dto: CreateEmployeeRequestDto): Promise<Employee> => {
    const res = await client.post<Employee>("/employees", dto);
    return normalizeEmployee(res.data);
  },

  update: async (
    id: number,
    dto: UpdateEmployeeRequestDto,
  ): Promise<Employee> => {
    const res = await client.put<Employee>(
      `/employees/${id}`,
      dto,
    );
    return normalizeEmployee(res.data);
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/employees/${id}`);
  },

  getOnLeave: async (): Promise<EmployeeOnLeave[]> => {
    const res = await client.get<EmployeeOnLeave[]>(
      "/employees/on-leave",
    );
    return res.data.map(normalizeEmployee);
  },
};
