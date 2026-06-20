import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Pin, Trash2, Filter, CheckCheck, BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  isPinned: boolean;
  relatedEntity?: string;
  relatedId?: number;
  createdAt: string;
}

export default function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread" | "pinned" | "info" | "success" | "warning" | "error">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => apiRequest("PUT", `/api/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => apiRequest("PUT", "/api/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const pinNotification = useMutation({
    mutationFn: async (id: number) => apiRequest("PUT", `/api/notifications/${id}/pin`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const unpinNotification = useMutation({
    mutationFn: async (id: number) => apiRequest("PUT", `/api/notifications/${id}/unpin`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const filtered = notifications.filter((n: Notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "pinned") return n.isPinned;
    return n.type === filter;
  });

  const pinnedFirst = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "success": return "bg-green-500/10 text-green-600 border-green-200";
      case "warning": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "error": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "bg-muted";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info": return <Bell className="w-4 h-4" />;
      case "success": return <Check className="w-4 h-4" />;
      case "warning": return <BellRing className="w-4 h-4" />;
      case "error": return <BellRing className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-auto p-6">
      <Header title="Notifications" subtitle={`${unreadCount} unread`} />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All ({notifications.length})</Button>
        <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>Unread ({unreadCount})</Button>
        <Button variant={filter === "pinned" ? "default" : "outline"} size="sm" onClick={() => setFilter("pinned")}>Pinned</Button>
        <Button variant={filter === "info" ? "default" : "outline"} size="sm" onClick={() => setFilter("info")}>Info</Button>
        <Button variant={filter === "warning" ? "default" : "outline"} size="sm" onClick={() => setFilter("warning")}>Warnings</Button>
        <Button variant={filter === "error" ? "default" : "outline"} size="sm" onClick={() => setFilter("error")}>Errors</Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} disabled={unreadCount === 0}><CheckCheck className="w-4 h-4 mr-1" />Mark all read</Button>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-2">
          {pinnedFirst.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
          {pinnedFirst.map((n: Notification) => (
            <Card key={n.id} className={`${!n.isRead ? "border-l-4 border-l-primary" : ""} ${n.isPinned ? "border-amber-200" : ""}`} data-testid={`notification-${n.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(n.type)}`}>{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{n.title}</span>
                      {!n.isRead && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
                      {n.isPinned && <Badge variant="outline" className="text-[10px] h-4 border-amber-300 text-amber-600"><Pin className="w-2.5 h-2.5 mr-0.5" />Pinned</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                      {n.relatedEntity && <Badge variant="secondary" className="text-[10px]">{n.relatedEntity} #{n.relatedId}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => markRead.mutate(n.id)} title="Mark read">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => n.isPinned ? unpinNotification.mutate(n.id) : pinNotification.mutate(n.id)} title={n.isPinned ? "Unpin" : "Pin"}>
                      <Pin className={`w-3.5 h-3.5 ${n.isPinned ? "text-amber-500 fill-amber-500" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteNotification.mutate(n.id)} title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
