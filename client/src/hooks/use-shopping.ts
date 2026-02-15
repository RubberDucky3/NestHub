import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertShoppingItem } from "@shared/routes";

export function useShoppingList() {
  return useQuery({
    queryKey: [api.shopping.list.path],
    queryFn: async () => {
      const res = await fetch(api.shopping.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch shopping list");
      return api.shopping.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertShoppingItem) => {
      const res = await fetch(api.shopping.create.path, {
        method: api.shopping.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create item");
      return api.shopping.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shopping.list.path] }),
  });
}

export function useUpdateShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertShoppingItem> & { completed?: boolean }) => {
      const url = buildUrl(api.shopping.update.path, { id });
      const res = await fetch(url, {
        method: api.shopping.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item");
      return api.shopping.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shopping.list.path] }),
  });
}

export function useDeleteShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.shopping.delete.path, { id });
      const res = await fetch(url, { method: api.shopping.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shopping.list.path] }),
  });
}
