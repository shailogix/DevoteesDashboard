import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "@/components/Layout/GlobalSearch";
import {
  Bell, Check, CheckCheck, Trash2, AlertTriangle, Info,
  CheckCircle, XCircle, X, Pin, PinOff, Eye, EyeOff
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

// M3 type → tonal icon container colors
const TYPE_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  success: { bg: "bg-emerald-500/12", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  warning: { bg: "bg-amber-500/12",   text: "text-amber-600 dark:text-amber-400",   bar: "bg-amber-500" },
  error:   { bg: "bg-red-500/12",     text: "text-red-600 dark:text-red-400",       bar: "bg-red-500" },
  info:    { bg: "bg-sky-500/12",     text: "text-sky-600 dark:text-sky-400",       bar: "bg-sky-500" },
};

function NotifIcon({ type }: { type: string }) {
  const styles = TYPE_STYLES[type] ?? TYPE_STYLES.info;
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error:   <XCircle className="w-4 h-4" />,
    info:    <Info className="w-4 h-4" />,
  };
  return (
    <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.bg} ${styles.text}`}>
      {icons[type] ?? icons.info}
    </span>
  );
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
  const typeStyle = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
  return (
    <div
      className={[
        "p-3 hover:bg-muted/60 transition-all duration-200 rounded-2xl mx-1 my-0.5",
        "flex gap-3 items-start relative pl-4",
        !n.isRead ? "bg-primary/4" : "",
        pinSection ? "bg-amber-50/40 dark:bg-amber-900/8" : "",
      ].join(" ")}
    >
      {/* M3 left accent bar */}
      <div className={`absolute left-1 top-3 bottom-3 w-1 rounded-full ${typeStyle.bar} opacity-70`} />

      <NotifIcon type={n.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight break-words ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
            {n.title}
          </p>
          <span className="text-xs text-muted-foreground/60 whitespace-nowrap flex-shrink-0 mt-0.5">
            {formatTime(n.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words whitespace-pre-wrap">
          {n.message}
        </p>
        {n.relatedEntity && (
          <Badge variant="tonal" className="mt-1.5 text-[10px] px-2 py-0.5 h-5">
            {n.relatedEntity}
          </Badge>
        )}
        <div className="flex gap-2 mt-2 flex-wrap items-center">
          {!n.isRead && (
            <button onClick={onMarkRead} className="text-xs text-primary hover:underline flex items-center gap-0.5 font-semibold">
              <Check className="w-3 h-3" /> Mark read
            </button>
          )}
          <button
            onClick={onTogglePin}
            className={`text-xs flex items-center gap-0.5 font-medium ${n.isPinned ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"}`}
            title={n.isPinned ? "Unpin" : "Pin to top"}
          >
            {n.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            {n.isPinned ? "Unpin" : "Pin"}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-0.5 ml-auto font-medium"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { isSuperAdmin, isViewingAsDevotee } = useAuth();
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

  const handleToggleDevoteeView = () => {
    if (isViewingAsDevotee) {
      localStorage.removeItem("view_as_role");
    } else {
      localStorage.setItem("view_as_role", "devotee");
    }
    window.location.reload();
  };

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
    <header className="bg-[var(--surface-container-high,var(--card))] border-b border-border/50 px-6 py-3.5 sticky top-0 z-30 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Devotee portal preview toggle */}
          {isSuperAdmin && (
            <Button
              variant={isViewingAsDevotee ? "default" : "tonal"}
              size="sm"
              onClick={handleToggleDevoteeView}
              className={`flex items-center gap-1.5 text-xs font-bold ${
                isViewingAsDevotee
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                  : "text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border-0"
              }`}
            >
              {isViewingAsDevotee ? (
                <><EyeOff className="w-3.5 h-3.5" /><span>Devotee View</span></>
              ) : (
                <><Eye className="w-3.5 h-3.5" /><span>Preview Portal</span></>
              )}
            </Button>
          )}

          {/* Global Search */}
          <GlobalSearch />

          {/* Extra actions */}
          {actions}

          {/* Bell — M3 filled-tonal icon button */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setOpen(!open)}
              className={[
                "w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-200",
                "hover:bg-primary/10 active:bg-primary/18",
                open ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-black shadow-elevation-1 animate-spring-pop">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {open && (
              <div
                className="absolute right-0 top-12 w-96 bg-[var(--surface-container-high,var(--card))] border border-border/60 rounded-3xl shadow-elevation-4 z-50 flex flex-col overflow-hidden animate-fade-in-up"
                style={{ maxHeight: "520px" }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-xl bg-primary/12 text-primary flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-sm text-foreground">Notifications</span>
                    {unread > 0 && (
                      <Badge variant="default" className="text-[10px] px-2 py-0 h-5">{unread} unread</Badge>
                    )}
                    {pinned.length > 0 && (
                      <Badge variant="warning" className="text-[10px] px-2 py-0 h-5">
                        <Pin className="w-2.5 h-2.5 mr-0.5 inline" />{pinned.length} pinned
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {unread > 0 && (
                      <Button variant="ghost" size="icon-sm" className="h-7 w-auto px-2 text-xs gap-1 rounded-full" onClick={() => markAll.mutate()}>
                        <CheckCheck className="w-3 h-3" /> All read
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" className="rounded-full h-7 w-7" onClick={() => setOpen(false)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Pinned section */}
                {pinned.length > 0 && (
                  <div className="flex-shrink-0 border-b border-amber-200/60 dark:border-amber-900/40">
                    <div className="px-4 py-2 bg-amber-500/5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                        <Pin className="w-3 h-3" />
                      </span>
                      <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Pinned</span>
                    </div>
                    <div className="pb-1">
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

                {/* Recent section */}
                <ScrollArea className="flex-1" style={{ maxHeight: "380px" }}>
                  {unpinned.length === 0 && pinned.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-7 h-7 opacity-30" />
                      </div>
                      <p className="font-semibold text-foreground/60">All caught up!</p>
                      <p className="text-xs mt-1">No notifications yet</p>
                    </div>
                  ) : unpinned.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-xs font-medium">
                      No recent notifications
                    </div>
                  ) : (
                    <>
                      {pinned.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent</span>
                        </div>
                      )}
                      <div className="pb-2">
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
