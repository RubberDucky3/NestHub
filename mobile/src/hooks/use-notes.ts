import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";

export interface StickyNote {
  id: number;
  householdId: number;
  content: string;
  color: string | null;
  authorId: string | null;
  createdAt: string | null;
  author: { id: string; firstName: string | null } | null;
}

export function useStickyNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: () => apiRequest<StickyNote[]>("GET", "/api/notes"),
  });
}

export function useCreateStickyNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; color?: string }) =>
      apiRequest<StickyNote>("POST", "/api/notes", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteStickyNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
