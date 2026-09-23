import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { AdminUser, Analytics } from "./admin.types";
import { Program, Application, ApplicationDocument } from "@/lib/types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UserListResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ApplicationListResponse {
  applications: Application[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useAdminUsersQuery(params: { role?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await api.get<Envelope<UserListResponse>>("/admin/users", { params });
      return data.data;
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Pick<AdminUser, "role" | "isActive" | "name">> }) => {
      const { data } = await api.patch<Envelope<AdminUser>>(`/admin/users/${id}`, payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  role: "FACULTY" | "ADMIN";
  department?: string;
  designation?: string;
  employeeId?: string;
}

export function useCreateStaffUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const { data } = await api.post<Envelope<AdminUser>>("/admin/users", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminProgramsQuery() {
  return useQuery({
    queryKey: ["admin", "programs"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Program[]>>("/admin/programs");
      return data.data;
    },
  });
}

export function useCreateProgramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Program>) => {
      const { data } = await api.post<Envelope<Program>>("/programs", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "programs"] }),
  });
}

export function useUpdateProgramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Program> }) => {
      const { data } = await api.put<Envelope<Program>>(`/programs/${id}`, payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "programs"] }),
  });
}

export function useDeactivateProgramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<Envelope<Program>>(`/programs/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "programs"] }),
  });
}

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Analytics>>("/admin/analytics");
      return data.data;
    },
  });
}

export function useBroadcastNotificationMutation() {
  return useMutation({
    mutationFn: async (payload: { title: string; message: string; targetRole: string; studentId?: string }) => {
      const { data } = await api.post<Envelope<{ recipientCount: number }>>(
        "/admin/notifications/broadcast",
        payload
      );
      return data.data;
    },
  });
}

// ---- Application management ----

export function useAdminApplicationsQuery(
  params: { status?: string; program?: string; assignedFaculty?: string; search?: string } = {}
) {
  return useQuery({
    queryKey: ["admin", "applications", params],
    queryFn: async () => {
      const { data } = await api.get<Envelope<ApplicationListResponse>>("/admin/applications", { params });
      return data.data;
    },
  });
}

export function useAssignFacultyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, facultyId }: { id: string; facultyId: string }) => {
      const { data } = await api.patch<Envelope<Application>>(`/admin/applications/${id}/assign`, { facultyId });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "applications"] }),
  });
}

export function useAdminChangeApplicationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data } = await api.patch<Envelope<Application>>(`/admin/applications/${id}/status`, { status, note });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "applications"] }),
  });
}

// ---- Documents ----

export function useAdminDocumentsQuery(params: { status?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "documents", params],
    queryFn: async () => {
      const { data } = await api.get<Envelope<ApplicationDocument[]>>("/admin/documents", { params });
      return data.data;
    },
  });
}
