import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Bounty, type RewardStoreItem, type InsertBounty, type InsertRewardStore } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch available and claimed bounties
export function useBounties() {
    return useQuery<(Bounty & { claimedBy: { firstName: string, lastName: string, id: string } | null })[]>({
        queryKey: ["/api/bounties"],
        queryFn: async () => {
            const res = await fetch("/api/bounties", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch bounties");
            return await res.json();
        },
    });
}

// Create a new bounty
export function useCreateBounty() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: InsertBounty) => {
            const res = await fetch("/api/bounties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to create bounty");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
            toast({
                title: "Bounty Created",
                description: "New bounty successfully posted for the household.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create bounty",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}

// Claim a bounty
export function useClaimBounty() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (bountyId: number) => {
            const res = await fetch(`/api/bounties/${bountyId}/claim`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to claim bounty");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // Refresh points
            queryClient.invalidateQueries({ queryKey: ["/api/households/current"] }); // Refresh aggregate household points
            queryClient.invalidateQueries({ queryKey: ["/api/ai-briefing"] });
            toast({
                title: "Bounty Claimed!",
                description: "Points have been added to your account.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to claim bounty",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}

// Fetch Reward Store items
export function useRewardStore() {
    return useQuery<RewardStoreItem[]>({
        queryKey: ["/api/rewards"],
        queryFn: async () => {
            const res = await fetch("/api/rewards", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch rewards");
            return await res.json();
        },
    });
}

// Create a new Reward Store item
export function useCreateReward() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: InsertRewardStore) => {
            const res = await fetch("/api/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to create reward");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
            queryClient.invalidateQueries({ queryKey: ["/api/ai-briefing"] });
            toast({
                title: "Reward Created",
                description: "New item added to the reward store.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create reward",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}

// Purchase a reward
export function usePurchaseReward() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (rewardId: number) => {
            const res = await fetch("/api/rewards/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId }),
                credentials: "include",
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to purchase reward");
            }
            return await res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // Refresh points
            queryClient.invalidateQueries({ queryKey: ["/api/households/current"] }); // Refresh aggregate household points
            queryClient.invalidateQueries({ queryKey: ["/api/ai-briefing"] });
            toast({
                title: "Reward Purchased!",
                description: `Enjoy your ${data.reward.name}. You have ${data.remainingPoints} points left.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Purchase Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    });
}
