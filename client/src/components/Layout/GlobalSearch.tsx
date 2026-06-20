import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Users, Building, CalendarDays, Heart, Landmark, Users2 } from "lucide-react";

interface SearchResult {
  id: number;
  type: "devotee" | "family" | "event" | "group" | "mandal" | "donation";
  title: string;
  subtitle: string;
  url: string;
}

const TYPE_ICON: Record<string, any> = {
  devotee: Users,
  family: Building,
  event: CalendarDays,
  group: Users2,
  mandal: Landmark,
  donation: Heart,
};

const TYPE_COLOR: Record<string, string> = {
  devotee: "bg-blue-100 text-blue-800 border-blue-200",
  family: "bg-amber-100 text-amber-800 border-amber-200",
  event: "bg-purple-100 text-purple-800 border-purple-200",
  group: "bg-pink-100 text-pink-800 border-pink-200",
  mandal: "bg-green-100 text-green-800 border-green-200",
  donation: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"], enabled: open && query.length > 1 });
  const { data: families = [] } = useQuery<any[]>({ queryKey: ["/api/families"], enabled: open && query.length > 1 });
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"], enabled: open && query.length > 1 });
  const { data: groups = [] } = useQuery<any[]>({ queryKey: ["/api/groups"], enabled: open && query.length > 1 });
  const { data: mandals = [] } = useQuery<any[]>({ queryKey: ["/api/mandals"], enabled: open && query.length > 1 });
  const { data: donations = [] } = useQuery<any[]>({ queryKey: ["/api/donations"], enabled: open && query.length > 1 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  if (query.length > 1) {
    devotees.forEach((d: any) => {
      if (d.firstName?.toLowerCase().includes(q) || d.lastName?.toLowerCase().includes(q) || d.devoteeId?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q)) {
        results.push({ id: d.id, type: "devotee", title: `${d.firstName} ${d.lastName}`, subtitle: d.email || d.phone || d.city || "", url: `/devotees/${d.id}` });
      }
    });
    families.forEach((f: any) => {
      if (f.familyName?.toLowerCase().includes(q) || f.city?.toLowerCase().includes(q)) {
        results.push({ id: f.id, type: "family", title: f.familyName, subtitle: [f.city, f.state].filter(Boolean).join(", ") || "", url: `/families/${f.id}` });
      }
    });
    events.forEach((ev: any) => {
      if (ev.title?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q) || ev.location?.toLowerCase().includes(q)) {
        results.push({ id: ev.id, type: "event", title: ev.title, subtitle: ev.location || ev.eventType || "", url: `/events/${ev.id}` });
      }
    });
    groups.forEach((g: any) => {
      if (g.groupName?.toLowerCase().includes(q) || g.name?.toLowerCase().includes(q)) {
        results.push({ id: g.id, type: "group", title: g.groupName || g.name, subtitle: `${g.memberCount || 0} members`, url: `/groups` });
      }
    });
    mandals.forEach((m: any) => {
      if (m.name?.toLowerCase().includes(q) || m.hindiName?.toLowerCase().includes(q)) {
        results.push({ id: m.id, type: "mandal", title: m.name, subtitle: m.hindiName || "", url: `/mandals` });
      }
    });
    donations.forEach((dn: any) => {
      if (dn.devoteeName?.toLowerCase().includes(q) || dn.donationType?.toLowerCase().includes(q)) {
        results.push({ id: dn.id, type: "donation", title: `₹${dn.amount}`, subtitle: `${dn.devoteeName} · ${dn.donationType}`, url: `/donations` });
      }
    });
  }

  results.sort((a, b) => a.type.localeCompare(b.type));

  return (
    <div className="relative w-80" ref={panelRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search devotees, families, events... (Ctrl+K)"
          className="pl-9 pr-8 h-9 text-sm"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-10 left-0 w-full bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {query.length < 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="p-1 space-y-0.5">
                {results.map((r) => {
                  const Icon = TYPE_ICON[r.type] || Search;
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => { navigate(r.url); setOpen(false); setQuery(""); }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/60 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${TYPE_COLOR[r.type] || "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{r.type}</Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
