import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";

export interface Task {
  id: number;
  householdId: number;
  title: string;
  description: string | null;
  assignedToId: string | null;
  points: number | null;
  completed: boolean | null;
  dueDate: string | null;
  createdAt: string | null;
  assignedTo: { id: string; firstName: string | null; lastName: string | null } | null;
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiRequest<Task[]>("GET", "/api/tasks"),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; points?: number; assignedToId?: string }) =>
      apiRequest<Task>("POST", "/api/tasks", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; completed?: boolean; title?: string }) => {
      const { id, ...rest } = data;
      return apiRequest<Task>("PATCH", `/api/tasks/${id}`, rest);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
