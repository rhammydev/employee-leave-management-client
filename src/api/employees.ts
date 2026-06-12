import client from "./client";
import type {
  Employee,
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  EmployeeOnLeave,
} from "../types";

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const res = await client.get<Employee[]>("/employees");
    return res.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const res = await client.get<Employee>(`/employees/${id}`);
    return res.data;
  },

  create: async (dto: CreateEmployeeRequestDto): Promise<Employee> => {
    const res = await client.post<Employee>("/employees", dto);
    return res.data;
  },

  update: async (
    id: number,
    dto: UpdateEmployeeRequestDto,
  ): Promise<Employee> => {
    const res = await client.put<Employee>(
      `/employees/${id}`,
      dto,
    );
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/employees/${id}`);
  },

  getOnLeave: async (): Promise<EmployeeOnLeave[]> => {
    const res = await client.get<EmployeeOnLeave[]>(
      "/employees/on-leave",
    );
    return res.data;
  },
};
