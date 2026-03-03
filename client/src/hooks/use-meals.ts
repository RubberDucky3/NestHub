import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMeal } from "@shared/routes";

export function useMeals() {
    return useQuery({
        queryKey: [api.meals.list.path],
        queryFn: async () => {
            const res = await fetch(api.meals.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch meals");
            return api.meals.list.responses[200].parse(await res.json());
        },
    });
}

export function useCreateMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: InsertMeal) => {
            const res = await fetch(api.meals.create.path, {
                method: api.meals.create.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to create meal");
            return api.meals.create.responses[201].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
        },
        onError: (error) => {
            console.error("Error planning meal:", error.message);
        },
    });
}

export function useDeleteMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = buildUrl(api.meals.delete.path, { id });
            const res = await fetch(url, {
                method: api.meals.delete.method,
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete meal");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
        },
        onError: (error) => {
            console.error("Error deleting meal:", error.message);
        },
    });
}
