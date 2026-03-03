import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";

export interface CalendarEvent {
  id: number;
  householdId: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  createdById: string | null;
  createdBy: { id: string; firstName: string | null } | null;
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => apiRequest<CalendarEvent[]>("GET", "/api/events"),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      startTime: string;
      endTime: string;
      description?: string;
      location?: string;
    }) => apiRequest<CalendarEvent>("POST", "/api/events", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}
