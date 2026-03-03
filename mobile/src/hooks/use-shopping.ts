import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";

export interface ShoppingItem {
  id: number;
  householdId: number;
  name: string;
  completed: boolean | null;
  addedById: string | null;
  createdAt: string | null;
  addedBy: { id: string; firstName: string | null } | null;
}

export function useShoppingList() {
  return useQuery({
    queryKey: ["shopping"],
    queryFn: () => apiRequest<ShoppingItem[]>("GET", "/api/shopping"),
  });
}

export function useCreateShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest<ShoppingItem>("POST", "/api/shopping", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });
}

export function useUpdateShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; completed?: boolean }) => {
      const { id, ...rest } = data;
      return apiRequest<ShoppingItem>("PATCH", `/api/shopping/${id}`, rest);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });
}

export function useDeleteShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/shopping/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });
}
