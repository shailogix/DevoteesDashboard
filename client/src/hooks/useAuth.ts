import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: permissions } = useQuery<any>({
    queryKey: ["/api/users/me/permissions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!user,
  });

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "GET", credentials: "include" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  const isAdmin = user?.role === "admin";
  const hasRole = (role: string) => user?.role === role;
  const canSeePage = (pageId: string) => {
    if (isAdmin) return true;
    const visiblePages = permissions?.visiblePages || [];
    return visiblePages.includes(pageId);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    logout,
    isAdmin,
    hasRole,
    canSeePage,
    permissions,
  };
}