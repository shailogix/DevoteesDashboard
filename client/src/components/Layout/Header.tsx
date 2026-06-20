import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import {
  Bell, Check, CheckCheck, Trash2, AlertTriangle, Info,
  CheckCircle, XCircle, X, Pin, PinOff
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  isPinned: boolean;
  relatedEntity?: string;
  createdAt: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const TYPE_BORDER: Record<string, string> = {
  success: "border-l-green-400",
  warning: "border-l-yellow-400",
  error:   "border-l-red-400",
  info:    "border-l-blue-400",
};

function NotifIcon({ type }: { type: string }) {
  if (type === "success") return <CheckCircle  className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />;
  if (type === "warning") return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />;
  if (type === "error")   return <XCircle       className="w-4 h-4 text-red-500   flex-shrink-0 mt-0.5" />;
  return                         <Info          className="w-4 h-4 text-blue-500  flex-shrink-0 mt-0.5" />;
}

function NotifItem({
  n, formatTime, onMarkRead, onDelete, onTogglePin, pinSection,
}: {
  n: Notification;
  formatTime: (s: string) => string;
  onMarkRead: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  pinSection: boolean;
}) {
  return (
    <div
      className={[
        "p-3 hover:bg-muted/50 transition-colors border-l-4",
        TYPE_BORDER[n.type] ?? "border-l-border",
        !n.isRead ? "bg-primary/5" : "",
        pinSection ? "bg-amber-50/30 dark:bg-amber-900/5" : "",
      ].join(" ")}
    >
      <div className="flex gap-2.5 items-start">
        <NotifIcon type={n.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-tight break-words ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
              {n.title}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {formatTime(n.createdAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words whitespace-pre-wrap">
            {n.message}
          </p>
          {n.relatedEntity && (
            <p className="text-xs text-primary/60 mt-0.5 italic capitalize">{n.relatedEntity}</p>
          )}
          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
            {!n.isRead && (
              <button onClick={onMarkRead} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Mark read
              </button>
            )}
            <button
              onClick={onTogglePin}
              className={`text-xs flex items-center gap-0.5 ${n.isPinned ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"}`}
              title={n.isPinned ? "Unpin" : "Pin to top"}
            >
              {n.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              {n.isPinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-0.5 ml-auto"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const unread = notifications.filter((n) => !n.isRead).length;
  const pinned = notifications.filter((n) => n.isPinned);
  const unpinned = notifications.filter((n) => !n.isPinned);

  const markRead = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const markAll = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/notifications/read-all", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
  const togglePin = useMutation({
    mutationFn: ({ id, isPinned }: { id: number; isPinned: boolean }) =>
      apiRequest("PUT", `/api/notifications/${id}/${isPinned ? "unpin" : "pin"}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fmt = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {actions}

          {/* Bell button */}
          <div className="relative" ref={panelRef}>
            <Button variant="ghost" size="sm" className="relative" onClick={() => setOpen(!open)}>
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>

            {open && (
              <div
                className="absolute right-0 top-10 w-96 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col"
                style={{ maxHeight: "520px" }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Notifications</span>
                    {unread > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0">{unread} unread</Badge>
                    )}
                    {pinned.length > 0 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 text-amber-600 border-amber-300">
                        <Pin className="w-2.5 h-2.5 mr-0.5 inline" />{pinned.length} pinned
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {unread > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => markAll.mutate()}>
                        <CheckCheck className="w-3 h-3 mr-1" /> All read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Pinned section — fixed, not scrollable */}
                {pinned.length > 0 && (
                  <div className="flex-shrink-0 border-b border-amber-200 dark:border-amber-900">
                    <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 flex items-center gap-1.5">
                      <Pin className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pinned</span>
                    </div>
                    <div className="divide-y divide-amber-100 dark:divide-amber-900/40">
                      {pinned.map((n) => (
                        <NotifItem
                          key={n.id}
                          n={n}
                          formatTime={fmt}
                          onMarkRead={() => markRead.mutate(n.id)}
                          onDelete={() => del.mutate(n.id)}
                          onTogglePin={() => togglePin.mutate({ id: n.id, isPinned: n.isPinned })}
                          pinSection
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent section — scrollable */}
                <ScrollArea className="flex-1" style={{ maxHeight: "380px" }}>
                  {unpinned.length === 0 && pinned.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No notifications
                    </div>
                  ) : unpinned.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-xs">
                      No recent notifications
                    </div>
                  ) : (
                    <>
                      {pinned.length > 0 && (
                        <div className="px-3 py-1.5 bg-muted/40 border-b border-border flex-shrink-0">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
                        </div>
                      )}
                      <div className="divide-y divide-border">
                        {unpinned.map((n) => (
                          <NotifItem
                            key={n.id}
                            n={n}
                            formatTime={fmt}
                            onMarkRead={() => markRead.mutate(n.id)}
                            onDelete={() => del.mutate(n.id)}
                            onTogglePin={() => togglePin.mutate({ id: n.id, isPinned: n.isPinned })}
                            pinSection={false}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
