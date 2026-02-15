import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertStickyNote } from "@shared/routes";

export function useStickyNotes() {
  return useQuery({
    queryKey: [api.notes.list.path],
    queryFn: async () => {
      const res = await fetch(api.notes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return api.notes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStickyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStickyNote) => {
      const res = await fetch(api.notes.create.path, {
        method: api.notes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create note");
      return api.notes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.notes.list.path] }),
  });
}

export function useDeleteStickyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.notes.delete.path, { id });
      const res = await fetch(url, { method: api.notes.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.notes.list.path] }),
  });
}
