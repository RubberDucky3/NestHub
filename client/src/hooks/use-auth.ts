import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { getApiUrl } from "@/lib/api-config";

function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchUser(): Promise<User | null> {
  const response = await fetch(`${getApiUrl()}/api/auth/user`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const user = await response.json();
  return user || null;
}

async function logout(): Promise<void> {
  await fetch(`${getApiUrl()}/api/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  localStorage.removeItem("auth_token");
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
