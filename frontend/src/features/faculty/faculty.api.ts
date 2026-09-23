import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Application, ApplicationDocument, ApplicationStatus, Review, ReviewRecommendation } from "@/lib/types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ReviewListResponse {
  applications: Application[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface FacultyDashboardStats {
  assignedApplications: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
}

export interface FacultyProfile {
  _id: string;
  user: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  specialization?: string[];
}

export function useFacultyDashboardStatsQuery() {
  return useQuery({
    queryKey: ["faculty", "dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<FacultyDashboardStats>>("/faculty/dashboard-stats");
      return data.data;
    },
  });
}

export function useReviewApplicationsQuery(params: { status?: string; search?: string; scope?: string } = {}) {
  return useQuery({
    queryKey: ["faculty", "applications", params],
    queryFn: async () => {
      const { data } = await api.get<Envelope<ReviewListResponse>>("/faculty/applications", { params });
      return data.data;
    },
  });
}

export function useApplicationForReviewQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Application>>(`/applications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useClaimApplicationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<Envelope<Application>>(`/faculty/applications/${id}/claim`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "applications"] });
    },
  });
}

export function useChangeApplicationStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { status: ApplicationStatus; note?: string }) => {
      const { data } = await api.patch<Envelope<Application>>(`/faculty/applications/${id}/status`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "applications"] });
    },
  });
}

export function useSubmitReviewMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { recommendation: ReviewRecommendation; comments: string }) => {
      const { data } = await api.post<Envelope<{ review: Review; application: Application }>>(
        `/faculty/applications/${id}/review`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "dashboard-stats"] });
    },
  });
}

export function useApplicationReviewsQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["faculty", "reviews", id],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Review[]>>(`/faculty/applications/${id}/reviews`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useRequestCorrectionMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: string) => {
      const { data } = await api.patch<Envelope<Application>>(`/faculty/applications/${id}/request-correction`, { note });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "applications"] });
    },
  });
}

export function useAddApplicationNoteMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<Envelope<Application>>(`/faculty/applications/${id}/notes`, { message });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["application", id] }),
  });
}

export function useSendMessageMutation(id: string) {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post(`/faculty/applications/${id}/message`, { message });
      return data.data;
    },
  });
}

export function useUpdateDocumentStatusMutation(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      documentId,
      status,
      rejectionReason,
      remarks,
    }: {
      documentId: string;
      status: string;
      rejectionReason?: string;
      remarks?: string;
    }) => {
      const { data } = await api.patch(`/faculty/documents/${documentId}/status`, { status, rejectionReason, remarks });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
    },
  });
}

export function useFacultyDocumentsQuery(params: { status?: string } = {}) {
  return useQuery({
    queryKey: ["faculty", "documents", params],
    queryFn: async () => {
      const { data } = await api.get<Envelope<ApplicationDocument[]>>("/faculty/documents", {
        params,
      });
      return data.data;
    },
  });
}

export function useMyFacultyProfileQuery() {
  return useQuery({
    queryKey: ["faculty", "profile"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<FacultyProfile>>("/faculty/profile/me");
      return data.data;
    },
  });
}

export function useUpdateFacultyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FacultyProfile>) => {
      const { data } = await api.put<Envelope<FacultyProfile>>("/faculty/profile/me", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty", "profile"] }),
  });
}

export function useStudentProfileForStaffQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ["staff", "student-profile", userId],
    queryFn: async () => {
      const { data } = await api.get(`/students/${userId}/profile`);
      return data.data;
    },
    enabled: !!userId,
  });
}
