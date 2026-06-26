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
      if (typeof window !== 'undefined') {
        localStorage.removeItem("view_as_role");
        sessionStorage.removeItem("portal_choice_made");
        sessionStorage.removeItem("splash_dismissed");
      }
      await fetch("/api/logout", { method: "GET", credentials: "include" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  const isSuperAdmin = user?.role === "super-admin";
  const isActualAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isViewingAsDevotee = isActualAdmin && typeof window !== 'undefined' && localStorage.getItem("view_as_role") === "devotee";
  
  const isAdmin = isActualAdmin && !isViewingAsDevotee;
  const isLeader = (user?.role === "leader" || isActualAdmin) && !isViewingAsDevotee;
  const isApproved = user?.approvalStatus === "approved" || isSuperAdmin;
  const hasRole = (role: string) => (user?.role === role || isSuperAdmin) && !isViewingAsDevotee;

  // Pages accessible to leaders (read-only or operational tasks)
  const LEADER_PAGES = [
    "dashboard", "devotees", "groups", "mentors", "attendance",
    "volunteering", "events", "notifications", "polls-quizzes", "feedback"
  ];

  const canSeePage = (pageId: string) => {
    if (isAdmin) return true;
    if (isLeader && LEADER_PAGES.includes(pageId)) return true;
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
    isLeader,
    isSuperAdmin,
    isViewingAsDevotee,
    isApproved,
    hasRole,
    canSeePage,
    permissions,
  };
}