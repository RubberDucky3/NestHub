import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api-client";
import {
  saveAuth,
  clearAuth,
  loadAuth,
  getUser,
  subscribeAuth,
  type User,
} from "../lib/auth-store";
import { queryClient } from "../lib/query-client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAuth(() => setUser(getUser()));
    loadAuth().finally(() => setIsLoading(false));
    return unsub;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<{ token: string; user: User }>(
        "POST",
        "/api/mobile/login",
        { email, password }
      );
      await saveAuth(data.token, data.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      const data = await apiRequest<{ token: string; user: User }>(
        "POST",
        "/api/mobile/register",
        { email, password, firstName, lastName }
      );
      await saveAuth(data.token, data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await clearAuth();
    queryClient.clear();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
