import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Application, AcademicDetails } from "@/lib/types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function useMyApplicationsQuery() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Application[]>>("/applications");
      return data.data;
    },
  });
}

export function useApplicationQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data } = await api.get<Envelope<Application>>(`/applications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useStartApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (programId: string) => {
      const { data } = await api.post<Envelope<Application>>("/applications", { programId });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useUpdateApplicationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { personalStatement?: string; academicDetails?: AcademicDetails }) => {
      const { data } = await api.patch<Envelope<Application>>(`/applications/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useSubmitApplicationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Envelope<Application>>(`/applications/${id}/submit`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useWithdrawApplicationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason?: string) => {
      const { data } = await api.post<Envelope<Application>>(`/applications/${id}/withdraw`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useDeleteDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}
