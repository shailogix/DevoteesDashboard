import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useDevMode } from "@/contexts/DevModeContext";
import { ThemeSelector } from "@/components/Common/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Home, Users, Building, GraduationCap, Calendar, Heart,
  CalendarDays, HandHeart, BarChart3, Settings, CreditCard,
  LogOut, Code2, Layers, Sparkles, ChevronDown, ChevronRight,
  Plus, Users2, Globe, BookOpen, Landmark, Leaf, Mountain, X,
  FileText
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Home, Users, Building, GraduationCap, Calendar, Heart,
  CalendarDays, HandHeart, BarChart3, Settings, CreditCard,
  Layers, Sparkles, Code2,
};

const DEFAULT_NAVIGATION = [
  { id: "dashboard", name: "Dashboard", href: "/", icon: "Home", visible: true },
  { id: "devotees", name: "Devotees", href: "/devotees", icon: "Users", visible: true },
  { id: "families", name: "Families", href: "/families", icon: "Building", visible: true },
  { id: "mentors", name: "Mentors", href: "/mentors", icon: "GraduationCap", visible: true },
  { id: "attendance", name: "Attendance", href: "/attendance", icon: "Calendar", visible: true },
  { id: "donations", name: "Donations", href: "/donations", icon: "Heart", visible: true },
  { id: "events", name: "Events", href: "/events", icon: "CalendarDays", visible: true },
  { id: "volunteering", name: "Volunteering", href: "/volunteering", icon: "HandHeart", visible: true },
  { id: "analytics", name: "Analytics", href: "/analytics", icon: "BarChart3", visible: true },
  { id: "id-cards", name: "ID Card Generator", href: "/id-cards", icon: "CreditCard", visible: true },
  { id: "settings", name: "Settings", href: "/settings", icon: "Settings", visible: true },
];

const FLAG_TO_NAV_ID: Record<string, string> = {
  donations: "donations",
  analytics: "analytics",
  volunteering: "volunteering",
  idCards: "id-cards",
  mentors: "mentors",
  events: "events",
  attendance: "attendance",
  groups: "groups",
};

// A small palette of colours cycled across group items
const GROUP_COLORS = [
  "text-orange-500 bg-orange-500/10",
  "text-blue-500 bg-blue-500/10",
  "text-purple-500 bg-purple-500/10",
  "text-green-500 bg-green-500/10",
  "text-pink-500 bg-pink-500/10",
  "text-yellow-500 bg-yellow-500/10",
  "text-cyan-500 bg-cyan-500/10",
  "text-red-500 bg-red-500/10",
  "text-indigo-500 bg-indigo-500/10",
  "text-teal-500 bg-teal-500/10",
];

function groupInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface Group {
  id: number;
  groupName: string;
  description?: string | null;
}

function AddGroupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { groupName: string; description: string }) =>
      apiRequest("POST", "/api/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group added", description: `"${name}" has been created.` });
      setName("");
      setDesc("");
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to add group", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ groupName: name.trim(), description: desc.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Add New Group
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Group Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nav Braj Mandal"
              autoFocus
              required
              data-testid="input-group-name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description (optional)"
              data-testid="input-group-desc"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim() || mutation.isPending}
              data-testid="button-submit-group"
            >
              {mutation.isPending ? "Adding…" : "Add Group"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isDevMode, showDevLogin, deactivateDevMode } = useDevMode();
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const { data: devConfig } = useQuery<any>({
    queryKey: ["/api/dev-config"],
    enabled: true,
  });

  const { data: featureFlags } = useQuery<any>({
    queryKey: ["/api/admin/feature-flags"],
    enabled: true,
  });

  const { data: groupsData = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    refetchOnWindowFocus: false,
  });

  const { data: dynamicPages = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/page-registry"],
    refetchOnWindowFocus: false,
  });

  const appInfo = devConfig?.appInfo || {
    name: "Madhav Parivar",
    subtitle: "Database System",
    logoSymbol: "॥",
  };

  const rawNavItems: any[] = devConfig?.navigation?.items
    ? [...devConfig.navigation.items]
        .sort((a: any, b: any) => a.order - b.order)
        .filter((n: any) => n.visible)
    : DEFAULT_NAVIGATION;

  const navItems = featureFlags
    ? rawNavItems.filter((item) => {
        const flagKey = Object.entries(FLAG_TO_NAV_ID).find(
          ([, navId]) => navId === item.id
        )?.[0];
        if (!flagKey) return true;
        return featureFlags[flagKey] !== false;
      })
    : rawNavItems;

  const getNavItemClass = (href: string) => {
    const isActive = location === href;
    const base =
      "flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200";
    return isActive
      ? `${base} bg-primary/10 text-primary font-medium`
      : `${base} text-muted-foreground hover:bg-muted hover:text-foreground`;
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-lg font-bold">
              {appInfo.logoSymbol || "॥"}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground break-words leading-tight">
              {appInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground break-words leading-tight mt-0.5">
              {appInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="p-4 border-b border-border">
        <ThemeSelector />
      </div>

      {/* Navigation + Groups — scrollable together */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main nav items */}
        {navItems.map((item: any) => {
          const Icon = ICON_MAP[item.icon] || Home;
          return (
            <Link key={item.id || item.href} href={item.href}>
              <div
                className={getNavItemClass(item.href)}
                data-testid={`nav-link-${item.id || item.href.replace(/\//g, "")}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="break-words min-w-0">{item.name}</span>
              </div>
            </Link>
          );
        })}

        {/* ── GROUPS SECTION ── */}
        <div className="pt-3">
          {/* Section header */}
          <div className="flex items-center justify-between px-1 mb-1">
            <button
              onClick={() => setGroupsOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              data-testid="button-toggle-groups"
            >
              {groupsOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Groups
              <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0 font-normal">
                {groupsData.length}
              </span>
            </button>
            <button
              onClick={() => setAddOpen(true)}
              title="Add new group"
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              data-testid="button-add-group"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group list */}
          {groupsOpen && (
            <div className="space-y-0.5">
              {groupsData.length === 0 && (
                <p className="text-xs text-muted-foreground/50 px-4 py-2 italic">
                  No groups yet
                </p>
              )}
              {groupsData.map((group, idx) => {
                const colorClass = GROUP_COLORS[idx % GROUP_COLORS.length];
                const initials = groupInitials(group.groupName);
                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                    title={group.description || group.groupName}
                    data-testid={`nav-group-${group.id}`}
                  >
                    {/* Avatar bubble */}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${colorClass}`}
                    >
                      {initials}
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground leading-tight min-w-0 break-words transition-colors">
                      {group.groupName}
                    </span>
                  </div>
                );
              })}

              {/* Always-visible Add button at the bottom of list */}
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left hover:bg-muted transition-colors text-muted-foreground/60 hover:text-muted-foreground"
                data-testid="button-add-group-inline"
              >
                <div className="w-7 h-7 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">Add a group…</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic pages */}
        {dynamicPages.length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4">
                Dynamic Pages
              </p>
            </div>
            {dynamicPages.map((page: any) => {
              const href = `/page/${page.slug}`;
              const Icon = ICON_MAP[page.icon] || FileText;
              return (
                <Link key={page.id} href={href}>
                  <div className={getNavItemClass(href)} data-testid={`nav-link-dynamic-${page.slug}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="break-words min-w-0">{page.label}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}

        {/* Dev Studio link – only in dev mode */}
        {isDevMode && (
          <>
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4">
                Developer
              </p>
            </div>
            <Link href="/dev-studio">
              <div
                className={getNavItemClass("/dev-studio")}
                data-testid="nav-link-dev-studio"
              >
                <Code2 className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                <span className="break-words min-w-0 text-yellow-600 dark:text-yellow-400 font-medium">
                  Dev Studio
                </span>
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* Developer Mode Toggle */}
      <div className="px-4 pb-3">
        {isDevMode ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            onClick={deactivateDevMode}
            data-testid="button-exit-dev-mode"
          >
            <Code2 className="w-4 h-4 mr-2" />
            Exit Dev Mode
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={showDevLogin}
            data-testid="button-enter-dev-mode"
          >
            <Code2 className="w-4 h-4 mr-2" />
            Developer Mode
          </Button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground break-words leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <Badge variant="secondary" className="text-xs mt-0.5">
              {user?.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/api/logout")}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Group Dialog */}
      <AddGroupDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
