import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertHousehold, type Household, type HouseholdMember, type User } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";

// GET /api/households/current
export function useHousehold() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [api.households.get.path],
    queryFn: async () => {
      const res = await fetch(api.households.get.path, { credentials: "include" });
      if (res.status === 404) return null; // No household yet
      if (!res.ok) throw new Error("Failed to fetch household");
      return api.households.get.responses[200].parse(await res.json());
    },
    enabled: isAuthenticated,
  });
}

// POST /api/households
export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHousehold) => {
      const res = await fetch(api.households.create.path, {
        method: api.households.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create household");
      return api.households.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.households.get.path] });
    },
  });
}

// POST /api/households/join
export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (joinCode: string) => {
      const res = await fetch(api.households.join.path, {
        method: api.households.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
        credentials: "include",
      });
      if (res.status === 404) throw new Error("Household not found with that code");
      if (!res.ok) throw new Error("Failed to join household");
      return api.households.join.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.households.get.path] });
    },
  });
}
