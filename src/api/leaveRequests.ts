import client from "./client";
import type {
  LeaveRequest,
  SubmitLeaveRequestDto,
  LeaveActionRequestDto,
  LeaveStatus,
  DepartmentStatistic,
  LeaveType,
} from "../types";

function normalizeLeaveRequest(request: LeaveRequest): LeaveRequest {
  return {
    ...request,
    leaveType: request.leaveType.toUpperCase() as LeaveType,
  };
}

function normalizeLeaveRequests(requests: LeaveRequest[]): LeaveRequest[] {
  return requests.map(normalizeLeaveRequest);
}

export const leaveApi = {
  getAll: async (): Promise<LeaveRequest[]> => {
    const res = await client.get<LeaveRequest[]>("/leaves");
    if (!res.data || !Array.isArray(res.data)) {
      console.error("Invalid response format from getAll:", res);
      return [];
    }

    return normalizeLeaveRequests(res.data);
  },

  getById: async (id: number): Promise<LeaveRequest> => {
    const res = await client.get<LeaveRequest>(`/leaves/${id}`);
    return normalizeLeaveRequest(res.data);
  },

  getByEmployee: async (employeeId: number): Promise<LeaveRequest[]> => {
    const res = await client.get<LeaveRequest[]>(
      `/employees/${employeeId}/leaves`,
    );
    return normalizeLeaveRequests(res.data);
  },

  getByStatus: async (status: LeaveStatus): Promise<LeaveRequest[]> => {
    const res = await client.get<LeaveRequest[]>(
      `/leaves/status/${status}`,
    );
    return normalizeLeaveRequests(res.data);
  },

  getStatistics: async (department?: string): Promise<DepartmentStatistic> => {
    const res = await client.get<DepartmentStatistic>(
      "/leaves/statistics",
      { params: department && department !== "All" ? { department } : undefined },
    );
    return res.data;
  },

  submit: async (dto: SubmitLeaveRequestDto): Promise<LeaveRequest> => {
    const res = await client.post<LeaveRequest>("/leaves", dto);
    return normalizeLeaveRequest(res.data);
  },

  update: async (
    id: number,
    dto: SubmitLeaveRequestDto,
  ): Promise<LeaveRequest> => {
    const res = await client.put<LeaveRequest>(
      `/leaves/${id}`,
      dto,
    );
    return normalizeLeaveRequest(res.data);
  },

  approve: async (
    id: number,
    dto: LeaveActionRequestDto,
  ): Promise<LeaveRequest> => {
    const res = await client.post<LeaveRequest>(
      `/leaves/approve/${id}`,
      dto,
    );
    return normalizeLeaveRequest(res.data);
  },

  reject: async (
    id: number,
    dto: LeaveActionRequestDto,
  ): Promise<LeaveRequest> => {
    const res = await client.post<LeaveRequest>(
      `/leaves/reject/${id}`,
      dto,
    );
    return normalizeLeaveRequest(res.data);
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/leaves/${id}`);
  },
};
