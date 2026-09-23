import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Program } from "@/lib/types";

interface ProgramListResponse {
  programs: Program[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useProgramsQuery(params: { search?: string; department?: string } = {}) {
  return useQuery({
    queryKey: ["programs", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: ProgramListResponse }>("/programs", { params });
      return data.data;
    },
  });
}

export function useProgramQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Program }>(`/programs/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
