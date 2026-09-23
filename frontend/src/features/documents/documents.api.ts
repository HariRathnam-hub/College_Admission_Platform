import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ApplicationDocument } from "@/lib/types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function useApplicationDocumentsQuery(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["documents", applicationId],
    queryFn: async () => {
      const { data } = await api.get<Envelope<ApplicationDocument[]>>("/documents", {
        params: { applicationId },
      });
      return data.data;
    },
    enabled: !!applicationId,
  });
}

export function useUploadDocumentMutation(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("applicationId", applicationId);
      const { data } = await api.post<Envelope<ApplicationDocument>>("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    },
  });
}

export function useReplaceDocumentMutation(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, file }: { documentId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.put<Envelope<ApplicationDocument>>(`/documents/${documentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
    },
  });
}

export function useDeleteDocumentMutation(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    },
  });
}
