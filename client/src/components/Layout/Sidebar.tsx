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
  Plus, Users2, Globe, BookOpen, Landmark, MapPin, Bell, Leaf, Mountain, X,
  FileText, Vote, Trophy, MessageSquare, Database, Shield
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Home, Users, Building, GraduationCap, Calendar, Heart,
  CalendarDays, HandHeart, BarChart3, Settings, CreditCard,
  Layers, Sparkles, Code2, Landmark, MapPin, Bell, Users2,
  Vote, Trophy, MessageSquare, Database,
};

const DEFAULT_NAVIGATION = [
  { id: "dashboard", name: "Dashboard", href: "/", icon: "Home", visible: true },
  { id: "polls-quizzes", name: "Polls & Quizzes", href: "/polls-quizzes", icon: "Vote", visible: true },
  { id: "feedback", name: "Feedback", href: "/feedback", icon: "MessageSquare", visible: true },
  { id: "import-data", name: "Intelligent Import", href: "/import-data", icon: "Database", visible: true },
  { id: "devotees", name: "Devotees", href: "/devotees", icon: "Users", visible: true },
  { id: "families", name: "Families", href: "/families", icon: "Building", visible: true },
  { id: "mandals", name: "Mandals", href: "/mandals", icon: "Landmark", visible: true },
  { id: "sabha-locations", name: "Sabha Locations", href: "/sabha-locations", icon: "MapPin", visible: true },
  { id: "groups", name: "Groups", href: "/groups", icon: "Users2", visible: true },
  { id: "mentors", name: "Mentors", href: "/mentors", icon: "GraduationCap", visible: true },
  { id: "attendance", name: "Attendance", href: "/attendance", icon: "Calendar", visible: true },
  { id: "donations", name: "Donations", href: "/donations", icon: "Heart", visible: true },
  { id: "events", name: "Events", href: "/events", icon: "CalendarDays", visible: true },
  { id: "volunteering", name: "Volunteering", href: "/volunteering", icon: "HandHeart", visible: true },
  { id: "notifications", name: "Notifications", href: "/notifications", icon: "Bell", visible: true },
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

// M3 Expressive color palette for group avatars
const GROUP_COLORS = [
  { bg: "bg-orange-500/15", text: "text-orange-600", ring: "ring-orange-400/30" },
  { bg: "bg-violet-500/15", text: "text-violet-600", ring: "ring-violet-400/30" },
  { bg: "bg-sky-500/15", text: "text-sky-600", ring: "ring-sky-400/30" },
  { bg: "bg-emerald-500/15", text: "text-emerald-600", ring: "ring-emerald-400/30" },
  { bg: "bg-rose-500/15", text: "text-rose-600", ring: "ring-rose-400/30" },
  { bg: "bg-amber-500/15", text: "text-amber-600", ring: "ring-amber-400/30" },
  { bg: "bg-cyan-500/15", text: "text-cyan-600", ring: "ring-cyan-400/30" },
  { bg: "bg-pink-500/15", text: "text-pink-600", ring: "ring-pink-400/30" },
  { bg: "bg-indigo-500/15", text: "text-indigo-600", ring: "ring-indigo-400/30" },
  { bg: "bg-teal-500/15", text: "text-teal-600", ring: "ring-teal-400/30" },
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
      <DialogContent className="sm:max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="w-8 h-8 m3-icon-tonal flex items-center justify-center rounded-xl">
              <Users2 className="w-4 h-4" />
            </span>
            Add New Group
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Group Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nav Braj Mandal"
              autoFocus
              required
              data-testid="input-group-name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Description
            </label>
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
  const { user, isAdmin, isLeader, isSuperAdmin, canSeePage } = useAuth();
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

  const ADMIN_ONLY_PAGES = [
    "analytics", "id-cards", "devotees", "families", "mandals",
    "sabha-locations", "groups", "mentors", "attendance", "donations",
    "events", "volunteering", "import-data"
  ];

  const navItems = featureFlags
    ? rawNavItems.filter((item) => {
        const flagKey = Object.entries(FLAG_TO_NAV_ID).find(
          ([, navId]) => navId === item.id
        )?.[0];
        if (!flagKey) return true;
        if (featureFlags[flagKey] === false) return false;
        if (!isAdmin && !isLeader && ADMIN_ONLY_PAGES.includes(item.id)) return false;
        if (!isAdmin && !canSeePage(item.id)) return false;
        return true;
      })
    : rawNavItems.filter((item) => {
        if (!isAdmin && !isLeader && ADMIN_ONLY_PAGES.includes(item.id)) return false;
        if (!isAdmin && !canSeePage(item.id)) return false;
        return true;
      });

  const isActive = (href: string) => location === href;

  return (
    <div className="w-64 flex flex-col h-full border-r border-border/60 bg-[var(--surface-container,var(--card))]">

      {/* ── Logo / App Header ── */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          {/* M3 Expressive logo container */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-elevation-2">
            <span className="text-primary-foreground text-lg font-black select-none">
              {appInfo.logoSymbol || "॥"}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-foreground leading-tight tracking-tight">
              {appInfo.name}
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-medium">
              {appInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Theme Selector ── */}
      <div className="px-4 pb-3">
        <ThemeSelector />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">

        {navItems.map((item: any, idx: number) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const active = isActive(item.href);
          return (
            <Link key={item.id || item.href} href={item.href}>
              <div
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer transition-all duration-200",
                  "animate-fade-in",
                  active
                    ? "bg-primary/12 text-primary font-bold"
                    : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground font-medium"
                ].join(" ")}
                style={{ animationDelay: `${idx * 0.03}s` }}
                data-testid={`nav-link-${item.id || item.href.replace(/\//g, "")}`}
              >
                {/* M3 icon container — filled-tonal on active, ghost on inactive */}
                <div className={[
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  active
                    ? "bg-primary/20 text-primary scale-105"
                    : "text-muted-foreground"
                ].join(" ")}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm leading-tight">
                  {!isAdmin && item.id === "dashboard" ? "Devotee Portal" : item.name}
                </span>
                {/* Active indicator dot */}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>
            </Link>
          );
        })}

        {/* ── GROUPS SECTION ── */}
        <div className="pt-4">
          {/* Section header — M3 label style */}
          <div className="flex items-center justify-between px-3 mb-2">
            <button
              onClick={() => setGroupsOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              data-testid="button-toggle-groups"
            >
              <div className={`transition-transform duration-200 ${groupsOpen ? "rotate-90" : ""}`}>
                <ChevronRight className="w-3 h-3" />
              </div>
              Groups
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[9px] font-bold">
                {groupsData.length}
              </span>
            </button>
            <button
              onClick={() => setAddOpen(true)}
              title="Add new group"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              data-testid="button-add-group"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group list */}
          {groupsOpen && (
            <div className="space-y-0.5">
              {groupsData.length === 0 && (
                <p className="text-xs text-muted-foreground/40 px-4 py-2 italic text-center">
                  No groups yet
                </p>
              )}
              {groupsData.map((group, idx) => {
                const colors = GROUP_COLORS[idx % GROUP_COLORS.length];
                const initials = groupInitials(group.groupName);
                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-foreground/6 transition-colors cursor-pointer group"
                    title={group.description || group.groupName}
                    data-testid={`nav-group-${group.id}`}
                  >
                    {/* M3 avatar bubble */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-black ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}>
                      {initials}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground leading-tight min-w-0 break-words transition-colors font-medium">
                      {group.groupName}
                    </span>
                  </div>
                );
              })}

              {/* Add group inline button */}
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full w-full text-left hover:bg-foreground/6 transition-colors text-muted-foreground/50 hover:text-muted-foreground"
                data-testid="button-add-group-inline"
              >
                <div className="w-7 h-7 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium">Add a group…</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Dynamic pages ── */}
        {dynamicPages.length > 0 && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-3">
                Custom Pages
              </p>
            </div>
            {dynamicPages.map((page: any) => {
              const href = `/page/${page.slug}`;
              const Icon = ICON_MAP[page.icon] || FileText;
              const active = isActive(href);
              return (
                <Link key={page.id} href={href}>
                  <div
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer transition-all duration-200",
                      active
                        ? "bg-primary/12 text-primary font-bold"
                        : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground font-medium"
                    ].join(" ")}
                    data-testid={`nav-link-dynamic-${page.slug}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm leading-tight">{page.label}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}

        {/* ── Dev Studio ── */}
        {isDevMode && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-3">
                Developer
              </p>
            </div>
            <Link href="/dev-studio">
              <div
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer transition-all duration-200",
                  isActive("/dev-studio")
                    ? "bg-amber-500/12 text-amber-600 font-bold"
                    : "text-amber-600/70 hover:bg-amber-500/8 hover:text-amber-600 font-medium"
                ].join(" ")}
                data-testid="nav-link-dev-studio"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="text-sm leading-tight">Dev Studio</span>
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* ── Dev Mode Toggle ── */}
      {isSuperAdmin && (
        <div className="px-3 pb-2">
          {isDevMode ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-amber-400/40 text-amber-600 hover:bg-amber-500/10 hover:border-amber-400 text-xs"
              onClick={deactivateDevMode}
              data-testid="button-exit-dev-mode"
            >
              <Code2 className="w-3.5 h-3.5" />
              Exit Dev Mode
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-full text-muted-foreground/60 hover:text-muted-foreground text-xs"
              onClick={showDevLogin}
              data-testid="button-enter-dev-mode"
            >
              <Code2 className="w-3.5 h-3.5" />
              Developer Mode
            </Button>
          )}
        </div>
      )}

      {/* ── User Profile ── */}
      <div className="p-3 border-t border-border/50 bg-[var(--surface-container,var(--muted))/30]">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-foreground/5 transition-colors">
          <Avatar className="w-9 h-9 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-black">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <Badge variant="tonal" className="text-[10px] px-2 py-0 mt-0.5 h-4">
              {user?.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => (window.location.href = "/api/logout")}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
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
