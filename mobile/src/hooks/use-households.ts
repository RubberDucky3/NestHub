import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { useAuth } from "./use-auth";

interface Household {
  id: number;
  name: string;
  joinCode: string;
  createdAt: string | null;
  members?: any[];
}

export function useHousehold() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["household"],
    queryFn: async () => {
      try {
        return await apiRequest<Household>("GET", "/api/households/current");
      } catch (e: any) {
        if (e.message?.includes("404") || e.message?.includes("Not in")) return null;
        throw e;
      }
    },
    enabled: isAuthenticated,
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest<Household>("POST", "/api/households", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
  });
}

export function useJoinHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) =>
      apiRequest<Household>("POST", "/api/households/join", { joinCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
  });
}
