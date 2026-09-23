import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StudentProfile } from "./profile.types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function useMyProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<Envelope<StudentProfile>>("/students/me");
      return data.data;
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<StudentProfile>) => {
      const { data } = await api.put<Envelope<StudentProfile>>("/students/me", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
