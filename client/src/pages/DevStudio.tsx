import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

async function godModeApiRequest(method: string, url: string, data?: any) {
  const res = await adminFetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

const godModeQueryFn = async ({ queryKey }: any) => {
  const res = await adminFetch(queryKey[0]);
  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error(await res.text());
  }
  return res.json().catch(() => ({}));
};
import { useTheme } from "@/contexts/ThemeContext";
import {
  Code2, Palette, Navigation, Settings, Users, Database,
  Download, Upload, Save, RotateCcw, Plus, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, RefreshCw, Check, AlertTriangle, Copy,
  Layers, Paintbrush, LayoutDashboard, Shield, FileJson, History,
  Home, Building, Calendar, Heart, CalendarDays, HandHeart,
  BarChart3, CreditCard, GraduationCap, PanelTop, Type,
  Sliders, Sparkles, Tag, Move, Edit2, Search, Link2, Unlink2,
  Play, Square, Zap, Clock, Activity, Filter, Table, GitBranch,
  CheckSquare, MinusSquare, ArrowRight, XCircle, Info,
  Terminal, Flag, Sprout, RotateCw, Send, Lock
} from "lucide-react";
import { useVisualEditor } from "@/contexts/VisualEditorContext";
import { adminFetch, useDevMode } from "@/contexts/DevModeContext";
import { SchemaVisualizer } from "@/components/DevStudio/SchemaVisualizer";
import { CsvExportImport } from "@/components/DevStudio/CsvExportImport";
import { ApiDocumentation } from "@/components/DevStudio/ApiDocumentation";

const ICON_OPTIONS = [
  "Home", "Users", "Building", "GraduationCap", "Calendar", "Heart",
  "CalendarDays", "HandHeart", "BarChart3", "CreditCard", "Settings",
  "PanelTop", "Shield", "Database", "Layers", "Sparkles", "Tag"
];

const FIELD_TYPES = ["text", "number", "date", "dropdown", "boolean", "email", "phone", "textarea"];

const THEME_PRESETS = [
  { id: "devotional", label: "Devotional Classic", primary: "24 100% 60%", secondary: "343 100% 25%", accent: "51 100% 50%", bg: "60 29% 94%" },
  { id: "ocean", label: "Ocean Blue", primary: "210 100% 40%", secondary: "189 100% 38%", accent: "180 100% 63%", bg: "210 100% 97%" },
  { id: "forest", label: "Forest Green", primary: "120 61% 34%", secondary: "25 76% 31%", accent: "120 73% 75%", bg: "120 100% 97%" },
  { id: "royal", label: "Royal Purple", primary: "270 50% 40%", secondary: "51 100% 50%", accent: "300 47% 64%", bg: "240 100% 99%" },
  { id: "sunset", label: "Sunset Orange", primary: "30 100% 50%", secondary: "330 100% 70%", accent: "351 100% 86%", bg: "54 100% 93%" },
  { id: "midnight", label: "Midnight Dark", primary: "263 100% 65%", secondary: "239 84% 67%", accent: "267 57% 65%", bg: "240 37% 6%" },
  { id: "matrix", label: "Matrix Digital", primary: "120 100% 50%", secondary: "120 100% 7%", accent: "156 100% 53%", bg: "0 0% 0%" },
  { id: "ironman", label: "Iron Man", primary: "0 100% 50%", secondary: "51 100% 50%", accent: "16 100% 60%", bg: "0 0% 10%" },
];

const ALL_PAGES = [
  { id: "dashboard", label: "Dashboard" }, { id: "devotees", label: "Devotees" },
  { id: "families", label: "Families" }, { id: "mentors", label: "Mentors" },
  { id: "attendance", label: "Attendance" }, { id: "donations", label: "Donations" },
  { id: "events", label: "Events" }, { id: "volunteering", label: "Volunteering" },
  { id: "analytics", label: "Analytics" }, { id: "id-cards", label: "ID Cards" },
  { id: "settings", label: "Settings" }, { id: "dev-studio", label: "Dev Studio" },
];

const ENTITIES = ["devotees", "families", "events", "attendance", "donations", "volunteering", "mentors", "groups"];

function ColorSlider({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const parts = value.split(" ");
  const h = parseInt(parts[0]) || 0;
  const s = parseInt(parts[1]) || 0;
  const l = parseInt(parts[2]) || 50;
  const preview = `hsl(${h}, ${s}%, ${l}%)`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-border" style={{ background: preview }} />
          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">{value}</code>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><Label className="text-xs text-muted-foreground">Hue (0-360)</Label>
          <Input type="number" min={0} max={360} value={h} onChange={e => onChange(`${e.target.value} ${s}% ${l}%`)} className="h-7 text-xs" /></div>
        <div><Label className="text-xs text-muted-foreground">Saturation %</Label>
          <Input type="number" min={0} max={100} value={s} onChange={e => onChange(`${h} ${e.target.value}% ${l}%`)} className="h-7 text-xs" /></div>
        <div><Label className="text-xs text-muted-foreground">Lightness %</Label>
          <Input type="number" min={0} max={100} value={l} onChange={e => onChange(`${h} ${s}% ${e.target.value}%`)} className="h-7 text-xs" /></div>
      </div>
    </div>
  );
}

// ─── DATA BROWSER COMPONENT ────────────────────────────────────────────────
function DataBrowser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [entity, setEntity] = useState("devotees");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addData, setAddData] = useState<any>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data: rows = [], isLoading } = useQuery<any[]>({ queryKey: [`/api/${entity}`] });
  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"], queryFn: godModeQueryFn });
  const { data: families = [] } = useQuery<any[]>({ queryKey: ["/api/families"], queryFn: godModeQueryFn });
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"], queryFn: godModeQueryFn });

  const devoteeMap = useMemo(() => { const m: Record<number, string> = {}; devotees.forEach((d: any) => { m[d.id] = `${d.firstName} ${d.lastName}`; }); return m; }, [devotees]);
  const familyMap = useMemo(() => { const m: Record<number, string> = {}; families.forEach((f: any) => { m[f.id] = f.familyName; }); return m; }, [families]);
  const eventMap = useMemo(() => { const m: Record<number, string> = {}; events.forEach((e: any) => { m[e.id] = e.title; }); return m; }, [events]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => godModeApiRequest("PATCH", `/api/${entity}/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/${entity}`] }); setEditingRow(null); toast({ title: "Record updated" }); },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => godModeApiRequest("DELETE", `/api/${entity}/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/${entity}`] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => godModeApiRequest("POST", "/api/admin/bulk", { entity, operation: "delete", ids: Array.from(selectedIds) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/${entity}`] }); setSelectedIds(new Set()); toast({ title: `${selectedIds.size} records deleted` }); },
    onError: () => toast({ title: "Bulk delete failed", variant: "destructive" }),
  });

  const filteredRows = useMemo(() => {
    let result = (rows as any[]);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter((r: any) => Object.values(r).some(v => String(v || "").toLowerCase().includes(s)));
    }
    if (sortKey) {
      result = [...result].sort((a: any, b: any) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, searchTerm, sortKey, sortDir]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredRows, page]);
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);

  const exportCSV = () => {
    const cols = getColumns();
    const header = cols.join(',');
    const body = filteredRows.map((r: any) => cols.map((c: string) => JSON.stringify(r[c] ?? '')).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${entity}-export.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const getDisplayValue = (key: string, val: any): string => {
    if (val === null || val === undefined) return "—";
    if (key === "devoteeId" && devoteeMap[val]) return devoteeMap[val];
    if (key === "familyId" && familyMap[val]) return familyMap[val];
    if (key === "eventId" && eventMap[val]) return eventMap[val];
    if (val instanceof Date || (typeof val === "string" && val.includes("T") && val.includes("Z"))) {
      try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return String(val); }
    }
    if (typeof val === "boolean") return val ? "✓" : "✗";
    const s = String(val);
    return s.length > 50 ? s.slice(0, 50) + "…" : s;
  };

  const getColumns = () => {
    if (filteredRows.length === 0) return [];
    const priorityKeys: Record<string, string[]> = {
      devotees: ["id", "devoteeId", "firstName", "lastName", "email", "phone", "spiritualLevel", "city", "familyId", "mentorId", "isActive"],
      families: ["id", "familyName", "headOfFamily", "city", "totalMembers", "phone", "isActive"],
      events: ["id", "title", "eventType", "location", "startDate", "status", "capacity", "isArchived"],
      attendance: ["id", "devoteeId", "eventId", "attendanceDate", "status", "checkInTime", "markedBy"],
      donations: ["id", "devoteeId", "amount", "donationType", "donationDate", "paymentMethod"],
      volunteering: ["id", "devoteeId", "activityType", "activityDate", "hours", "status"],
      mentors: ["id", "devoteeId", "specialization", "experience", "isActive"],
      groups: ["id", "groupName", "description"],
    };
    return priorityKeys[entity] || Object.keys(filteredRows[0]).slice(0, 10);
  };

  const columns = getColumns();
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRows.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredRows.map((r: any) => r.id)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={entity} onValueChange={v => { setEntity(v); setSelectedIds(new Set()); setSearchTerm(""); }}>
          <SelectTrigger className="w-44 h-8"><Database className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>{ENTITIES.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-7 h-8 text-sm" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => bulkDeleteMutation.mutate()} disabled={bulkDeleteMutation.isPending}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete {selectedIds.size} selected
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportCSV}><Download className="w-3 h-3 mr-1" />CSV</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { import('@tanstack/react-query').then(()=>{}); queryClient.invalidateQueries({ queryKey: [`/api/${entity}`] }); }}><RefreshCw className="w-3 h-3 mr-1" />Refresh</Button>
          <Badge variant="outline" className="text-xs">{filteredRows.length} / {rows.length} records</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <ScrollArea className="h-[480px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="p-2 text-left w-8">
                    <input type="checkbox" checked={selectedIds.size === filteredRows.length && filteredRows.length > 0}
                      onChange={toggleSelectAll} className="rounded" />
                  </th>
                  {columns.map(col => (
                    <th key={col}
                      className="p-2 text-left font-medium text-muted-foreground whitespace-nowrap capitalize cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => { if (sortKey === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(col); setSortDir('asc'); setPage(0); } }}>
                      <span className="flex items-center gap-1">
                        {col.replace(/([A-Z])/g, ' $1').trim()}
                        {sortKey === col && <span className="text-[10px] opacity-70">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                      </span>
                    </th>
                  ))}
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: any) => (
                  <tr key={row.id} className={`border-t border-border hover:bg-muted/20 ${selectedIds.has(row.id) ? "bg-primary/5" : ""}`}>
                    <td className="p-2">
                      <input type="checkbox" checked={selectedIds.has(row.id)}
                        onChange={e => setSelectedIds(prev => { const n = new Set(prev); e.target.checked ? n.add(row.id) : n.delete(row.id); return n; })}
                        className="rounded" />
                    </td>
                    {columns.map(col => (
                      <td key={col} className="p-2 max-w-[160px] truncate">
                        {editingRow?.id === row.id ? (
                          <Input
                            value={editData[col] ?? ""}
                            onChange={e => setEditData((p: any) => ({ ...p, [col]: e.target.value }))}
                            className="h-6 text-xs py-0 px-1"
                          />
                        ) : (
                          <span title={String(row[col] || "")} className={`${row[col] === null || row[col] === undefined ? "text-muted-foreground italic" : ""}`}>
                            {getDisplayValue(col, row[col])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-2 text-right whitespace-nowrap">
                      {editingRow?.id === row.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" className="h-6 text-xs px-2" onClick={() => updateMutation.mutate({ id: row.id, data: editData })} disabled={updateMutation.isPending}>
                            <Check className="w-3 h-3 mr-0.5" /> Save
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setEditingRow(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingRow(row); setEditData({ ...row }); }}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(row.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                <span>Page {page + 1} of {totalPages} ({filteredRows.length} total)</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>Prev</Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}>Next</Button>
                </div>
              </div>
            )}
            {filteredRows.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No records found</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ─── RELATIONAL MAP COMPONENT ─────────────────────────────────────────────
function RelationalMap() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDevoteeId, setSelectedDevoteeId] = useState<string>("");
  const [linkFamilyId, setLinkFamilyId] = useState<string>("");
  const [linkMentorId, setLinkMentorId] = useState<string>("");

  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"], queryFn: godModeQueryFn });
  const { data: families = [] } = useQuery<any[]>({ queryKey: ["/api/families"], queryFn: godModeQueryFn });
  const { data: mentors = [] } = useQuery<any[]>({ queryKey: ["/api/mentors"], queryFn: godModeQueryFn });

  const { data: relations, isLoading: relLoading } = useQuery<any>({
    queryKey: ["/api/admin/relations/devotee", selectedDevoteeId],
    queryFn: () => selectedDevoteeId ? adminFetch(`/api/admin/relations/devotee/${selectedDevoteeId}`).then(r => r.json()) : null,
    enabled: !!selectedDevoteeId,
  });

  const linkMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("PATCH", "/api/admin/link", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/relations/devotee", selectedDevoteeId] });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      toast({ title: "Relationship updated" });
    },
    onError: () => toast({ title: "Failed to update relationship", variant: "destructive" }),
  });

  const selectedDevotee = devotees.find((d: any) => String(d.id) === selectedDevoteeId);

  const familyMembers = useMemo(() => {
    if (!selectedDevotee?.familyId) return [];
    return devotees.filter((d: any) => d.familyId === selectedDevotee.familyId && d.id !== selectedDevotee.id);
  }, [devotees, selectedDevotee]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> Devotee Relationship Explorer</CardTitle>
          <CardDescription>Select a devotee to visualize their connections and manage relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDevoteeId} onValueChange={v => { setSelectedDevoteeId(v); setLinkFamilyId(""); setLinkMentorId(""); }}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select a devotee..." />
            </SelectTrigger>
            <SelectContent>
              {devotees.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.firstName} {d.lastName} ({d.devoteeId})</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDevoteeId && selectedDevotee && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Central Devotee Node */}
          <Card className="border-2 border-primary/40 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {selectedDevotee.firstName?.[0]}{selectedDevotee.lastName?.[0]}
                </div>
                {selectedDevotee.firstName} {selectedDevotee.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono">{selectedDevotee.devoteeId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Level</span><Badge variant="outline" className="text-xs">{selectedDevotee.spiritualLevel}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{selectedDevotee.city || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span>{selectedDevotee.isActive ? "✓ Yes" : "✗ No"}</span></div>
            </CardContent>
          </Card>

          {/* Family Connection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Building className="w-4 h-4 text-blue-500" /> Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDevotee.familyId ? (
                <div>
                  <p className="text-sm font-medium">{familyMembers.length > 0 ? families.find((f: any) => f.id === selectedDevotee.familyId)?.familyName || "Family" : "Family"}</p>
                  <p className="text-xs text-muted-foreground mb-2">{familyMembers.length} other member{familyMembers.length !== 1 ? "s" : ""}</p>
                  <div className="space-y-1">
                    {familyMembers.slice(0, 4).map((m: any) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs bg-muted/30 rounded p-1.5">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{m.firstName?.[0]}</div>
                        <span>{m.firstName} {m.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not linked to any family</p>
              )}
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Change Family</Label>
                <Select value={linkFamilyId} onValueChange={setLinkFamilyId}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select family..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Remove from family</SelectItem>
                    {families.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.familyName}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full h-7 text-xs" disabled={!linkFamilyId || linkMutation.isPending}
                  onClick={() => linkMutation.mutate({ devoteeId: Number(selectedDevoteeId), familyId: linkFamilyId === "null" ? null : Number(linkFamilyId) })}>
                  <Link2 className="w-3 h-3 mr-1" /> Apply Family Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Connection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4 text-green-500" /> Mentor & Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDevotee.mentorId ? (
                <div>
                  <p className="text-xs text-muted-foreground">Current Mentor</p>
                  {(() => {
                    const mentor = mentors.find((m: any) => m.id === selectedDevotee.mentorId);
                    const mentorDevotee = mentor ? devotees.find((d: any) => d.id === mentor.devoteeId) : null;
                    return mentorDevotee ? (
                      <div className="flex items-center gap-2 bg-green-50 rounded p-2 mt-1">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xs">{mentorDevotee.firstName?.[0]}</div>
                        <div>
                          <p className="text-xs font-medium">{mentorDevotee.firstName} {mentorDevotee.lastName}</p>
                          <p className="text-xs text-muted-foreground">{mentor.specialization}</p>
                        </div>
                      </div>
                    ) : <p className="text-xs">Mentor #{selectedDevotee.mentorId}</p>;
                  })()}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No mentor assigned</p>
              )}
              {relLoading ? (
                <div className="text-xs text-muted-foreground">Loading stats...</div>
              ) : relations ? (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Attendance", value: relations.attendanceCount || 0, color: "text-blue-600" },
                    { label: "Donations", value: relations.donationsCount || 0, color: "text-green-600" },
                    { label: "Volunteer", value: relations.volunteeringCount || 0, color: "text-purple-600" },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-muted/30 rounded p-2">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Change Mentor</Label>
                <Select value={linkMentorId} onValueChange={setLinkMentorId}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select mentor..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Remove mentor</SelectItem>
                    {mentors.map((m: any) => {
                      const md = devotees.find((d: any) => d.id === m.devoteeId);
                      return <SelectItem key={m.id} value={String(m.id)}>{md ? `${md.firstName} ${md.lastName}` : `Mentor #${m.id}`}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full h-7 text-xs" disabled={!linkMentorId || linkMutation.isPending}
                  onClick={() => linkMutation.mutate({ devoteeId: Number(selectedDevoteeId), mentorId: linkMentorId === "null" ? null : Number(linkMentorId) })}>
                  <Link2 className="w-3 h-3 mr-1" /> Apply Mentor Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Family Overview Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Building className="w-4 h-4 text-primary" /> Family ↔ Devotee Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {families.map((f: any) => {
              const members = devotees.filter((d: any) => d.familyId === f.id);
              return (
                <div key={f.id} className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold truncate">{f.familyName}</p>
                  <p className="text-xs text-muted-foreground">{f.city}</p>
                  <div className="flex flex-wrap gap-1">
                    {members.map((m: any) => (
                      <div key={m.id} title={`${m.firstName} ${m.lastName}`}
                        className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold cursor-pointer hover:bg-primary/20"
                        onClick={() => setSelectedDevoteeId(String(m.id))}>
                        {m.firstName?.[0]}
                      </div>
                    ))}
                    {members.length === 0 && <span className="text-xs text-muted-foreground italic">empty</span>}
                  </div>
                  <Badge variant="outline" className="text-xs">{members.length} members</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MACRO STUDIO COMPONENT ───────────────────────────────────────────────
function MacroStudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [macroName, setMacroName] = useState("");
  const [macroDesc, setMacroDesc] = useState("");
  const [steps, setSteps] = useState<any[]>([]);
  const [stepType, setStepType] = useState("create_devotee");
  const [stepLabel, setStepLabel] = useState("");
  const [stepData, setStepData] = useState("{}");
  const [runResult, setRunResult] = useState<any>(null);
  const [showRunResult, setShowRunResult] = useState(false);
  const clearLogs = () => { setRunResult(null); setShowRunResult(false); };

  const { data: macros = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/macros"], queryFn: godModeQueryFn });

  const createMacro = useMutation({
    mutationFn: () => godModeApiRequest("POST", "/api/admin/macros", { name: macroName, description: macroDesc, steps }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/macros"] }); setShowCreate(false); setMacroName(""); setMacroDesc(""); setSteps([]); toast({ title: "Macro saved" }); },
    onError: () => toast({ title: "Failed to save macro", variant: "destructive" }),
  });

  const deleteMacro = useMutation({
    mutationFn: (id: number) => godModeApiRequest("DELETE", `/api/admin/macros/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/macros"] }); toast({ title: "Macro deleted" }); },
  });

  const runMacro = useMutation({
    mutationFn: (id: number) => godModeApiRequest("POST", `/api/admin/macros/${id}/run`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/macros"] });
      setRunResult(data); setShowRunResult(true);
      const ok = data.results?.filter((r: any) => r.status === "ok").length || 0;
      toast({ title: `Macro ran: ${ok}/${data.results?.length || 0} steps succeeded` });
    },
    onError: () => toast({ title: "Macro run failed", variant: "destructive" }),
  });

  const addStep = () => {
    try {
      const data = JSON.parse(stepData);
      setSteps(prev => [...prev, { type: stepType, label: stepLabel || stepType, data }]);
      setStepLabel("");
      setStepData("{}");
    } catch { toast({ title: "Invalid JSON data for step", variant: "destructive" }); }
  };

  const STEP_TYPES = [
    { value: "create_devotee", label: "Create Devotee" },
    { value: "create_event", label: "Create Event" },
    { value: "create_attendance", label: "Mark Attendance" },
  ];

  const STEP_TEMPLATES: Record<string, any> = {
    create_devotee: { firstName: "Name", lastName: "Surname", email: "email@example.com", phone: "9876543210", gender: "Male", spiritualLevel: "Beginner", isActive: true },
    create_event: { title: "New Event", eventType: "satsang", location: "Sabha Hall", startDate: new Date().toISOString(), status: "planned", isActive: true },
    create_attendance: { devoteeId: 1, attendanceDate: new Date().toISOString(), status: "present", markedBy: "macro" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Macro Studio</h3>
          <p className="text-sm text-muted-foreground">Automate repetitive tasks with saved macro sequences</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Macro
        </Button>
      </div>

      {/* Saved Macros */}
      {isLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
      ) : macros.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No macros yet</p>
            <p className="text-sm">Create a macro to automate repetitive data operations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {macros.map((macro: any) => (
            <Card key={macro.id} className="border-border hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      {macro.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{macro.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs" onClick={() => runMacro.mutate(macro.id)} disabled={runMacro.isPending}>
                      <Play className="w-3 h-3 mr-1" /> Run
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteMacro.mutate(macro.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{macro.steps?.length || 0} steps</span>
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" />Run {macro.runCount || 0} times</span>
                  {macro.lastRunAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {new Date(macro.lastRunAt).toLocaleDateString()}</span>}
                </div>
                {macro.steps && macro.steps.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {macro.steps.slice(0, 3).map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{s.label || s.type}</span>
                      </div>
                    ))}
                    {macro.steps.length > 3 && <p className="text-xs text-muted-foreground pl-2">+{macro.steps.length - 3} more steps</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Macro Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Create New Macro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Macro Name</Label>
                <Input value={macroName} onChange={e => setMacroName(e.target.value)} placeholder="e.g. Onboard New Member" className="h-8" /></div>
              <div className="space-y-1"><Label className="text-xs">Description</Label>
                <Input value={macroDesc} onChange={e => setMacroDesc(e.target.value)} placeholder="What does this macro do?" className="h-8" /></div>
            </div>

            <div className="border rounded-lg p-3 space-y-3">
              <h4 className="text-sm font-medium">Add Steps</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Step Type</Label>
                  <Select value={stepType} onValueChange={v => { setStepType(v); setStepData(JSON.stringify(STEP_TEMPLATES[v] || {}, null, 2)); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STEP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div className="space-y-1"><Label className="text-xs">Step Label</Label>
                  <Input value={stepLabel} onChange={e => setStepLabel(e.target.value)} placeholder="Describe this step" className="h-8" /></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Step Data (JSON)</Label>
                <Textarea value={stepData} onChange={e => setStepData(e.target.value)} className="font-mono text-xs h-28" />
              </div>
              <Button size="sm" variant="outline" onClick={addStep} disabled={!stepType}><Plus className="w-3 h-3 mr-1" /> Add Step</Button>
            </div>

            {steps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Steps ({steps.length})</h4>
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded border border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <Badge variant="outline" className="text-xs">{s.type}</Badge>
                    <span className="text-xs flex-1">{s.label}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => setSteps(prev => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMacro.mutate()} disabled={!macroName || steps.length === 0 || createMacro.isPending}>
              <Save className="w-4 h-4 mr-1" /> Save Macro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Result Dialog */}
      <Dialog open={showRunResult} onOpenChange={setShowRunResult}>
        <DialogContent>
          <DialogHeader><DialogTitle>Macro Run Results — {runResult?.macro}</DialogTitle></DialogHeader>
          <ScrollArea className="h-64">
            {runResult?.results?.map((r: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-2 rounded mb-2 ${r.status === "ok" ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50" : r.status === "error" ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50" : "bg-muted"}`}>
                {r.status === "ok" ? <Check className="w-4 h-4 text-green-600 mt-0.5" /> : r.status === "error" ? <XCircle className="w-4 h-4 text-red-600 mt-0.5" /> : <Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
                <div>
                  <p className="text-xs font-medium">{r.step}</p>
                  {r.error && <p className="text-xs text-red-600">{r.error}</p>}
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </div>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── AUDIT LOG COMPONENT ──────────────────────────────────────────────────
function AuditLog() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/audit", entityFilter, actionFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "200" });
      if (entityFilter !== "all") params.set("entity", entityFilter);
      if (actionFilter !== "all") params.set("action", actionFilter);
      return adminFetch(`/api/admin/audit?${params}`).then(r => r.json());
    },
    refetchInterval: 10000,
  });

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    LINK: "bg-purple-100 text-purple-800",
    RUN_MACRO: "bg-yellow-100 text-yellow-800",
    IMPORT_DATA: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Audit Trail</h3>
          <p className="text-sm text-muted-foreground">Complete log of all data changes in this session</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {["devotee", "family", "event", "attendance", "donation", "volunteering", "mentor", "group", "macro", "system"].map(e => (
              <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {["CREATE", "UPDATE", "DELETE", "LINK", "RUN_MACRO", "IMPORT_DATA"].map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{logs.length} events</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No audit events yet</p>
            <p className="text-sm">Events are logged when you create, update, or delete records using the GOD mode tools</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px] border rounded-lg">
          <div className="divide-y divide-border">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-muted/20">
                <Badge className={`text-xs shrink-0 mt-0.5 ${actionColors[log.action] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>{log.action}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium capitalize">{log.entity}</span>
                    {log.entityId && <span className="text-xs text-muted-foreground">#{log.entityId}</span>}
                    <span className="text-xs text-muted-foreground">by {log.userId}</span>
                  </div>
                  {log.before && log.after && (
                    <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
                      {Object.keys(log.after || {}).filter(k => log.before?.[k] !== log.after?.[k]).slice(0, 3).map(k => (
                        <span key={k} className="mr-2">{k}: {String(log.before?.[k] || "null")} → {String(log.after?.[k] || "null")}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── SECURITY DISPATCH HUB COMPONENT ────────────────────────────────────────────────
function DispatchHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");

  const testNotifMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/test-notification", {
        method: "POST",
        body: JSON.stringify({ type: "email", recipient: "test@example.com", message: "Elite Dispatch Test — System verification ping." }),
      });
      if (!res.ok) throw new Error("Dispatch failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatch-logs"] });
      toast({ title: "Test notification dispatched", description: "Check the log below." });
    },
    onError: () => toast({ title: "Test dispatch failed", variant: "destructive" }),
  });

  const { data: allLogs = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/dispatch-logs"],
    queryFn: () => adminFetch("/api/admin/dispatch-logs").then(r => r.json()),
    refetchInterval: 10000,
  });

  const logs = useMemo(() => filterType === "all" ? allLogs : allLogs.filter((l: any) => l.dispatchType === filterType), [allLogs, filterType]);

  const typeColors: Record<string, string> = {
    email: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    sms: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    otp: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    whatsapp: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  };

  const handleCopyCode = (body: string) => {
    const match = body.match(/\b\d{6,7}\b/);
    if (match) {
      navigator.clipboard.writeText(match[0]);
      toast({ title: "Code Copied!", description: `Successfully copied code: ${match[0]}` });
    } else {
      navigator.clipboard.writeText(body);
      toast({ title: "Copied Message Body", description: "Entire message text copied to clipboard." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Security &amp; Dispatch Hub</h3>
          <p className="text-sm text-muted-foreground">Real-time audit trail of all security codes, OTP dispatches, and devotee notification logs.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => testNotifMutation.mutate()} disabled={testNotifMutation.isPending}>
            <Zap className="w-3.5 h-3.5 mr-1" /> {testNotifMutation.isPending ? "Sending..." : "Test Send"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => refetch()}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="otp">OTP</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{logs.length} dispatch entries</Badge>
        <span className="text-[10px] text-muted-foreground italic">(Simulated outbox)</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No dispatch events yet</p>
            <p className="text-sm">Codes and notifications will appear here when generated by the approval system.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px] border rounded-lg">
          <div className="divide-y divide-border">
            {logs.map((log: any) => {
              const codeMatch = log.body?.match(/\b\d{6,7}\b/);
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold shrink-0 mt-0.5 ${typeColors[log.dispatchType] || "bg-gray-100 text-gray-800"}`}>
                    {log.dispatchType}
                  </Badge>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">To: {log.recipient}</span>
                      {log.subject && <span className="text-xs text-muted-foreground font-medium">· {log.subject}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded border border-border/20 max-w-2xl">{log.body}</p>
                    {codeMatch && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">Code: {codeMatch[0]}</span>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleCopyCode(log.body)}>
                          <Copy className="w-3 h-3 mr-1" /> Copy Code
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                    <span className="text-[10px] text-muted-foreground">{new Date(log.sentAt).toLocaleTimeString()}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(log.sentAt).toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50 uppercase font-bold py-0">{log.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── DATA EXPORT/IMPORT COMPONENT ─────────────────────────────────────────
function DataExport({ config, setImportJson, importJson, handleImport, importMutation, handleExport, snapshotName, setSnapshotName, snapshotMutation, restoreMutation }: any) {
  const { toast } = useToast();

  const handleFullExport = async () => {
    const res = await fetch('/api/admin/export/data', { credentials: 'include' });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `madhav-parivar-data-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Full data exported" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-primary" /> Full Data Export</CardTitle>
            <CardDescription>Download complete database dump — all devotees, families, events, and more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted rounded-lg p-4 text-sm space-y-1.5">
              {["All 20 devotees + profiles", "6 families + relationships", "12 events + attendance records", "Donations + volunteering history", "Mentors + groups + mandals", "Sabha locations"].map(item => (
                <div key={item} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-3 h-3 text-green-500" /> {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleFullExport}>
              <Download className="w-4 h-4 mr-2" /> Download Full Database JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-blue-500" /> Config Export</CardTitle>
            <CardDescription>Export app configuration (theme, navigation, custom fields, roles)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Download Config JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Import Configuration</CardTitle>
            <CardDescription>Restore settings from a previously exported config file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={importJson} onChange={e => setImportJson(e.target.value)} placeholder='Paste exported config JSON here...' className="font-mono text-xs h-32" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleImport} disabled={!importJson || importMutation.isPending}>
                {importMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Import Config
              </Button>
              <Button variant="outline" onClick={() => setImportJson("")}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Config Snapshots</CardTitle>
            <CardDescription>Save and restore configuration states (up to 10 snapshots)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={snapshotName} onChange={e => setSnapshotName(e.target.value)} placeholder="Snapshot name (optional)" className="flex-1" />
              <Button onClick={() => snapshotMutation.mutate(snapshotName)} disabled={snapshotMutation.isPending}>
                {snapshotMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            <ScrollArea className="h-52">
              {(!config?.snapshots || config.snapshots.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No snapshots yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {config.snapshots.map((snap: any) => (
                    <div key={snap.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{snap.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(snap.createdAt).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => restoreMutation.mutate(snap.id)} disabled={restoreMutation.isPending}>
                        <RotateCcw className="w-3 h-3 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileJson className="w-5 h-5 text-primary" /> Live Config State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-6 text-xs z-10"
                onClick={() => { navigator.clipboard.writeText(JSON.stringify(config, null, 2)); toast({ title: "Copied" }); }}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
              <ScrollArea className="h-44">
                <pre className="text-xs font-mono text-muted-foreground bg-muted p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify({ appInfo: config?.appInfo, navigationItems: config?.navigation?.items?.length, theme: config?.theme?.activePreset, customFields: config?.customFields?.length, roleProfiles: Object.keys(config?.roleProfiles || {}) }, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── API CONSOLE ─────────────────────────────────────────────────────────────
function ApiConsole() {
  const [method, setMethod] = useState<"GET"|"POST"|"PATCH"|"DELETE">("GET");
  const [endpoint, setEndpoint] = useState("/api/devotees");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ method: string; endpoint: string; status: number; time: number }>>([]);

  const PRESETS = [
    { label: "List Devotees", method: "GET", endpoint: "/api/devotees", body: "" },
    { label: "List Families", method: "GET", endpoint: "/api/families", body: "" },
    { label: "List Events", method: "GET", endpoint: "/api/events", body: "" },
    { label: "Stats", method: "GET", endpoint: "/api/stats", body: "" },
    { label: "DB Counts", method: "GET", endpoint: "/api/admin/seed/counts", body: "" },
    { label: "Rollback Slots", method: "GET", endpoint: "/api/admin/rollback-slots", body: "" },
    { label: "Feature Flags", method: "GET", endpoint: "/api/admin/feature-flags", body: "" },
    { label: "Visual Overrides", method: "GET", endpoint: "/api/admin/visual-overrides", body: "" },
  ];

  const send = async () => {
    setLoading(true);
    const t0 = Date.now();
    try {
      const godToken = (await import("@/contexts/DevModeContext")).getGodModeToken();
      const headers: Record<string,string> = { "Content-Type": "application/json" };
      if (godToken) headers["X-God-Mode-Token"] = godToken;
      const opts: RequestInit = { method, credentials: "include", headers };
      if (method !== "GET" && body.trim()) opts.body = body;
      const res = await fetch(endpoint, opts);
      const elapsed = Date.now() - t0;
      setStatus(res.status);
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
      setHistory(prev => [{ method, endpoint, status: res.status, time: elapsed }, ...prev.slice(0, 19)]);
    } catch (e: any) {
      setStatus(0);
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-500" /> API Console
            </CardTitle>
            <CardDescription>Send requests to any backend endpoint. Full REST support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger className="w-28 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["GET","POST","PATCH","DELETE"].map(m => (
                    <SelectItem key={m} value={m}>
                      <span className={
                        m === "GET" ? "text-green-600" :
                        m === "POST" ? "text-blue-600" :
                        m === "PATCH" ? "text-yellow-600" : "text-red-600"
                      }>{m}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="flex-1 font-mono text-xs"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                placeholder="/api/..."
                onKeyDown={e => e.key === "Enter" && send()}
              />
              <Button onClick={send} disabled={loading} size="sm" className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
            {method !== "GET" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Request Body (JSON)</label>
                <textarea
                  className="w-full h-24 font-mono text-xs border rounded-md p-2 bg-muted resize-y"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}
            {response !== null && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={status && status >= 200 && status < 300 ? "default" : "destructive"} className="text-xs font-mono">
                    {status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Response</span>
                  <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs gap-1" onClick={() => navigator.clipboard.writeText(response)}>
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                </div>
                <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-auto max-h-72 whitespace-pre-wrap">{response}</pre>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <Button key={p.label} variant="outline" size="sm" className="text-xs"
                  onClick={() => { setMethod(p.method as any); setEndpoint(p.endpoint); setBody(p.body); }}>
                  {p.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Request History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No requests yet</p>
            ) : (
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b last:border-0 cursor-pointer hover:bg-muted/40 rounded px-1"
                    onClick={() => { setMethod(h.method as any); setEndpoint(h.endpoint); }}>
                    <Badge variant={h.status >= 200 && h.status < 300 ? "default" : "destructive"} className="text-[10px] w-8 justify-center">{h.status}</Badge>
                    <span className={`font-mono w-10 flex-shrink-0 ${
                      h.method === "GET" ? "text-green-600" :
                      h.method === "POST" ? "text-blue-600" :
                      h.method === "PATCH" ? "text-yellow-600" : "text-red-600"
                    }`}>{h.method}</span>
                    <span className="truncate text-muted-foreground flex-1">{h.endpoint}</span>
                    <span className="text-muted-foreground flex-shrink-0">{h.time}ms</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
function FeatureFlagsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flagsData, isLoading } = useQuery<any>({ queryKey: ["/api/admin/feature-flags"], queryFn: godModeQueryFn });

  const updateMutation = useMutation({
    mutationFn: (flags: Record<string, boolean>) =>
      adminFetch("/api/admin/feature-flags", {
        method: "PATCH",
        body: JSON.stringify(flags),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feature-flags"] });
      toast({ title: "Feature flags updated", description: "Changes take effect immediately" });
    },
  });

  const FLAG_META: Record<string, { label: string; desc: string; icon: string; color: string }> = {
    donations: { label: "Donations Module", desc: "Enable donation tracking and financial reporting", icon: "💰", color: "green" },
    analytics: { label: "Analytics Dashboard", desc: "Show advanced analytics and charts", icon: "📊", color: "blue" },
    volunteering: { label: "Volunteering Module", desc: "Track volunteer hours and activities", icon: "🤝", color: "purple" },
    idCards: { label: "ID Card Generator", desc: "Generate and print devotee ID cards", icon: "🪪", color: "orange" },
    groups: { label: "Groups & Mandals", desc: "Community group management and messaging", icon: "👥", color: "indigo" },
    mentors: { label: "Mentor System", desc: "Spiritual mentor assignment and tracking", icon: "🧘", color: "teal" },
    events: { label: "Events Module", desc: "Event planning and attendance management", icon: "📅", color: "red" },
    attendance: { label: "Attendance Tracking", desc: "Track event and satsang attendance", icon: "✅", color: "yellow" },
  };

  const flags = flagsData || {};

  const toggle = (key: string) => {
    updateMutation.mutate({ ...flags, [key]: !flags[key] });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="w-4 h-4 text-purple-500" /> Feature Flags
          </CardTitle>
          <CardDescription>Toggle application modules on/off. Changes apply immediately to all users without restart.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(FLAG_META).map(([key, meta]) => (
              <div key={key} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${flags[key] ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30' : 'border-muted bg-muted/30'}`}>
                <div className="text-2xl flex-shrink-0">{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <Switch checked={!!flags[key]} onCheckedChange={() => toggle(key)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Disabling a module hides it from the sidebar navigation. Data is preserved and the module can be re-enabled at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── SEED MANAGER ────────────────────────────────────────────────────────────
function SeedManagerPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmTruncate, setConfirmTruncate] = useState<string|null>(null);
  const [addEntity, setAddEntity] = useState("devotees");
  const [addCount, setAddCount] = useState(1);

  const { data: counts, isLoading } = useQuery<any>({ queryKey: ["/api/admin/seed/counts"], queryFn: godModeQueryFn });

  const resetMutation = useMutation({
    mutationFn: () => adminFetch("/api/admin/seed/reset", { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api"] });
      setConfirmReset(false);
      toast({ title: "Database reset", description: "All data restored to original demo seed" });
    },
  });

  const truncateMutation = useMutation({
    mutationFn: async (entity: string) => {
      const res = await adminFetch("/api/admin/seed/truncate", {
        method: "POST",
        body: JSON.stringify({ entity }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seed/counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api"] });
      setConfirmTruncate(null);
      toast({ title: "Table truncated", description: data.message });
    },
    onError: (err: any) => toast({ title: "Truncate failed", description: err.message, variant: "destructive" }),
  });

  const addMutation = useMutation({
    mutationFn: ({ entity, count }: { entity: string; count: number }) =>
      adminFetch("/api/admin/seed/add", {
        method: "POST",
        body: JSON.stringify({ entity, count }),
      }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api"] });
      toast({ title: "Records added", description: data.message || `Added new records` });
    },
  });

  const ENTITY_META: Record<string, { label: string; icon: string; color: string }> = {
    devotees: { label: "Devotees", icon: "🙏", color: "blue" },
    families: { label: "Families", icon: "🏠", color: "green" },
    events: { label: "Events", icon: "📅", color: "purple" },
    donations: { label: "Donations", icon: "💰", color: "yellow" },
    volunteering: { label: "Volunteering Records", icon: "🤝", color: "teal" },
    attendance: { label: "Attendance Records", icon: "✅", color: "orange" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-500" /> Current Data Counts
          </CardTitle>
          <CardDescription>Live snapshot of all in-memory records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(ENTITY_META).map(([key, meta]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="text-sm">{meta.label}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-sm">
                    {(counts as any)?.[key] ?? "—"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" /> Add Test Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Entity Type</label>
              <Select value={addEntity} onValueChange={setAddEntity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTITY_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Count (1–50)</label>
              <Input type="number" min={1} max={50} value={addCount} onChange={e => setAddCount(Math.max(1, Math.min(50, +e.target.value)))} />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => addMutation.mutate({ entity: addEntity, count: addCount })}
              disabled={addMutation.isPending}
            >
              <Plus className="w-4 h-4" />
              {addMutation.isPending ? "Adding..." : `Add ${addCount} ${ENTITY_META[addEntity]?.label}`}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <RotateCw className="w-4 h-4" /> Full Reset
            </CardTitle>
            <CardDescription>Clears ALL data and restores original 20-devotee / 6-family demo seed.</CardDescription>
          </CardHeader>
          <CardContent>
            {!confirmReset ? (
              <Button variant="destructive" className="w-full gap-2" onClick={() => setConfirmReset(true)}>
                <AlertTriangle className="w-4 h-4" /> Reset to Demo Data
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-destructive font-medium">⚠️ This will erase all current data!</p>
                <div className="flex gap-2">
                  <Button variant="destructive" className="flex-1" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
                    {resetMutation.isPending ? "Resetting..." : "Yes, Reset Everything"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── ROLLBACK PANEL ───────────────────────────────────────────────────────────
function RollbackPanel() {
  const { toast } = useToast();
  const { rollbackSlots, saveToSlot, restoreSlot, isSaving, isEditMode, toggleEditMode } = useVisualEditor();
  const [slotName, setSlotName] = useState("");

  const handleSave = async () => {
    await saveToSlot(slotName || undefined);
    setSlotName("");
    toast({ title: "Snapshot saved", description: "Visual state stored in rollback slot" });
  };

  const handleRestore = async (index: number) => {
    await restoreSlot(index);
    toast({ title: "State restored", description: `Rollback slot ${index + 1} applied` });
  };

  const filledSlots = rollbackSlots.filter(s => s.name && s.savedAt);
  const emptySlotCount = 5 - filledSlots.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-purple-500" /> 5-Slot Circular Rollback
            </CardTitle>
            <CardDescription>
              Save up to 5 visual snapshots. Saving beyond 5 overwrites the oldest slot automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Snapshot name (optional)"
                value={slotName}
                onChange={e => setSlotName(e.target.value)}
                className="text-sm"
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5 whitespace-nowrap">
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Snapshot"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/40 rounded text-xs text-muted-foreground">
              <span>Slots used: {filledSlots.length}/5</span>
              <span>{emptySlotCount} empty {emptySlotCount === 1 ? "slot" : "slots"} remaining</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2 items-start">
                <span className="text-purple-500 font-bold flex-shrink-0">1.</span>
                <span>Enable Visual Editor mode using the floating button (bottom-right)</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-purple-500 font-bold flex-shrink-0">2.</span>
                <span>Click any UI element to select it, then modify its appearance</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-purple-500 font-bold flex-shrink-0">3.</span>
                <span>Save a snapshot here anytime during editing</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-purple-500 font-bold flex-shrink-0">4.</span>
                <span>Restore any slot to go back to that saved state</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-purple-500 font-bold flex-shrink-0">5.</span>
                <span>The circular buffer auto-overwrites the oldest slot when full</span>
              </div>
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={toggleEditMode}>
                <Edit2 className="w-3.5 h-3.5" />
                {isEditMode ? "Exit Visual Editor" : "Launch Visual Editor"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Saved Snapshots</CardTitle>
          <CardDescription>Click Restore to apply any saved state</CardDescription>
        </CardHeader>
        <CardContent>
          {filledSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RotateCw className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No snapshots saved yet</p>
              <p className="text-xs mt-1">Save a snapshot to enable rollback</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filledSlots.map((slot, i) => (
                <div key={slot.index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {slot.index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{slot.name || `Snapshot ${i + 1}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {slot.savedAt ? new Date(slot.savedAt).toLocaleString() : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(slot.overrides || {}).length} overrides
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1 flex-shrink-0"
                    onClick={() => handleRestore(slot.index)} disabled={isSaving}>
                    <RotateCcw className="w-3 h-3" /> Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── VISUAL OVERRIDES PANEL ───────────────────────────────────────────────────
const CONTROL_TYPES = [
  { value: "label", label: "Label", defaultWrap: "nowrap" as const },
  { value: "text", label: "Text Block", defaultWrap: "normal" as const },
  { value: "heading", label: "Heading", defaultWrap: "normal" as const },
  { value: "badge", label: "Badge", defaultWrap: "nowrap" as const },
  { value: "button", label: "Button", defaultWrap: "nowrap" as const },
  { value: "custom", label: "Custom", defaultWrap: "normal" as const },
];

function VisualOverridesPanel() {
  const { overrides, setOverride, clearOverride, clearAllOverrides, isEditMode, toggleEditMode, saveToSlot, isSaving, unsavedChanges, selectedElementId } = useVisualEditor();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newElementId, setNewElementId] = useState("");
  const [newControlType, setNewControlType] = useState<string>("label");
  const [newWordWrap, setNewWordWrap] = useState<"normal" | "nowrap">("nowrap");
  const [color, setColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");

  const allIds = Object.keys(overrides);

  const handleSaveAll = async () => {
    await saveToSlot("Manual save from Visual Overrides panel");
    toast({ title: "Overrides saved", description: `${allIds.length} override(s) persisted` });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-purple-500" /> Visual Overrides Manager
            </CardTitle>
            <CardDescription>
              {allIds.length} active override{allIds.length !== 1 ? "s" : ""}. Toggle Visual Editor to apply changes by clicking elements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant={isEditMode ? "default" : "outline"} size="sm" className="gap-1.5 flex-1" onClick={toggleEditMode}>
                <Edit2 className="w-3.5 h-3.5" />
                {isEditMode ? "✓ Edit Mode ON" : "Enable Edit Mode"}
              </Button>
              <Button size="sm" className="gap-1.5 flex-1" onClick={handleSaveAll} disabled={isSaving || allIds.length === 0}>
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : unsavedChanges > 0 ? `Save (${unsavedChanges})` : "Save All"}
              </Button>
            </div>
            {isEditMode && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                ✏️ Visual Editor is active. Click any element in the app to select it, then use the controls below to style it.
              </div>
            )}
            {selectedElementId && (
              <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                <div className="font-medium text-purple-700">Selected: <code className="bg-purple-100 px-1 rounded">{selectedElementId}</code></div>
              </div>
            )}
            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Create Label / Text Control</p>
              <div className="flex gap-2">
                <Select value={newControlType} onValueChange={v => {
                  setNewControlType(v);
                  const ct = CONTROL_TYPES.find(c => c.value === v);
                  if (ct) setNewWordWrap(ct.defaultWrap);
                }}>
                  <SelectTrigger className="text-xs h-8 flex-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTROL_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Word Wrap</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{newWordWrap === "normal" ? "On" : "Off"}</span>
                  <Switch
                    checked={newWordWrap === "normal"}
                    onCheckedChange={v => setNewWordWrap(v ? "normal" : "nowrap")}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`Element ID (e.g. ${newControlType}-title)`}
                  value={newElementId}
                  onChange={e => setNewElementId(e.target.value)}
                  className="text-xs"
                />
                <Button size="sm" variant="outline" className="text-xs whitespace-nowrap" onClick={() => {
                  const id = newElementId || `${newControlType}-${Date.now()}`;
                  setOverride(id, { wordWrap: newWordWrap });
                  setEditingId(id);
                  setNewElementId("");
                  toast({ title: `${CONTROL_TYPES.find(c => c.value === newControlType)?.label} created`, description: `Override set for "${id}" with word-wrap: ${newWordWrap}` });
                }}>Create</Button>
              </div>
            </div>
            {clearAllOverrides && allIds.length > 0 && (
              <Button variant="outline" size="sm" className="w-full text-xs text-destructive border-destructive/30 gap-1"
                onClick={() => { clearAllOverrides(); toast({ title: "All overrides cleared" }); }}>
                <Trash2 className="w-3 h-3" /> Clear All Overrides
              </Button>
            )}
          </CardContent>
        </Card>

        {(editingId || selectedElementId) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Edit: <code className="text-xs bg-muted px-1 rounded">{editingId || selectedElementId}</code></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { field: "bgColor", label: "Background Color", type: "color" },
                { field: "textColor", label: "Text Color", type: "color" },
                { field: "borderColor", label: "Border Color", type: "color" },
                { field: "fontSize", label: "Font Size", placeholder: "14px" },
                { field: "fontWeight", label: "Font Weight", placeholder: "600" },
                { field: "borderRadius", label: "Border Radius", placeholder: "8px" },
                { field: "opacity", label: "Opacity", placeholder: "0.8" },
                { field: "padding", label: "Padding", placeholder: "8px 16px" },
                { field: "customCss", label: "Custom CSS", placeholder: "display: flex;" },
              ].map(({ field, label, type, placeholder }) => {
                const id = editingId || selectedElementId!;
                const current = (overrides[id] as any)?.[field] || "";
                return (
                  <div key={field} className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</label>
                    {type === "color" ? (
                      <div className="flex gap-2 flex-1">
                        <input type="color" value={current || "#ffffff"} onChange={e => setOverride(id, { [field]: e.target.value })} className="w-8 h-7 rounded cursor-pointer border" />
                        <Input value={current} onChange={e => setOverride(id, { [field]: e.target.value })} className="text-xs flex-1" placeholder="#rrggbb" />
                      </div>
                    ) : (
                      <Input value={current} onChange={e => setOverride(id, { [field]: e.target.value })} className="text-xs flex-1" placeholder={placeholder} />
                    )}
                    {current && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => setOverride(id, { [field]: "" })}>
                        <XCircle className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Word Wrap</label>
                <Switch
                  checked={overrides[editingId || selectedElementId!]?.wordWrap === "normal"}
                  onCheckedChange={v => setOverride(editingId || selectedElementId!, { wordWrap: v ? "normal" : "nowrap" })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Hide Element</label>
                <Switch
                  checked={!!overrides[editingId || selectedElementId!]?.hidden}
                  onCheckedChange={v => setOverride(editingId || selectedElementId!, { hidden: v })}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs text-destructive" onClick={() => {
                const id = editingId || selectedElementId!;
                clearOverride(id);
                setEditingId(null);
              }}>
                <Trash2 className="w-3 h-3 mr-1" /> Remove Override
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Overrides</CardTitle>
          <CardDescription>{allIds.length} element{allIds.length !== 1 ? "s" : ""} with visual overrides</CardDescription>
        </CardHeader>
        <CardContent>
          {allIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Paintbrush className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No overrides yet</p>
              <p className="text-xs mt-1">Enable edit mode and click elements to start styling</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allIds.map(id => {
                const o = overrides[id];
                return (
                  <div key={id} className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${editingId === id ? "border-purple-400 bg-purple-50" : "hover:bg-muted/40"}`}
                    onClick={() => setEditingId(editingId === id ? null : id)}>
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-[10px] bg-muted px-1 rounded">{id}</code>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={e => { e.stopPropagation(); clearOverride(id); }}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {o.bgColor && <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border" style={{ background: o.bgColor }} />bg</span>}
                      {o.textColor && <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border" style={{ background: o.textColor }} />text</span>}
                      {o.fontSize && <span className="text-muted-foreground">size:{o.fontSize}</span>}
                      {o.fontWeight && <span className="text-muted-foreground">w:{o.fontWeight}</span>}
                      {o.hidden && <Badge variant="destructive" className="text-[10px] h-4">hidden</Badge>}
                      {o.customCss && <Badge variant="secondary" className="text-[10px] h-4">custom css</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PAGE BUILDER PANEL ──────────────────────────────────────────────────────
function PageBuilderPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPage, setNewPage] = useState({ slug: "", label: "", description: "", icon: "Home", dataSource: "", sections: [{ type: "table", title: "Records", config: {} }] });

  const { data: pages = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/page-registry"], queryFn: godModeQueryFn });

  const createMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("POST", "/api/admin/page-registry", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/page-registry"] }); toast({ title: "Page created" }); setNewPage({ slug: "", label: "", description: "", icon: "Home", dataSource: "", sections: [{ type: "table", title: "Records", config: {} }] }); },
    onError: () => toast({ title: "Failed to create page", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => godModeApiRequest("DELETE", `/api/admin/page-registry/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/page-registry"] }); toast({ title: "Page deleted" }); },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Dynamic Pages</CardTitle>
            <CardDescription>Pages created here appear in the sidebar and render dynamically without code.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : (
              <div className="space-y-2">
                {pages.length === 0 && <p className="text-sm text-muted-foreground">No dynamic pages yet. Create one below.</p>}
                {pages.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-xs text-muted-foreground">/page/{p.slug} · {p.dataSource || "No data source"}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader><CardTitle className="text-sm">Create New Page</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Page label" value={newPage.label} onChange={e => setNewPage({ ...newPage, label: e.target.value })} />
            <Input placeholder="URL slug (e.g. mandals)" value={newPage.slug} onChange={e => setNewPage({ ...newPage, slug: e.target.value })} />
            <Input placeholder="Description" value={newPage.description} onChange={e => setNewPage({ ...newPage, description: e.target.value })} />
            <Select value={newPage.dataSource} onValueChange={v => setNewPage({ ...newPage, dataSource: v })}>
              <SelectTrigger><SelectValue placeholder="Data source" /></SelectTrigger>
              <SelectContent>
                {ENTITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                <SelectItem value="">None (custom)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newPage.icon} onValueChange={v => setNewPage({ ...newPage, icon: v })}>
              <SelectTrigger><SelectValue placeholder="Icon" /></SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => createMutation.mutate(newPage)} disabled={!newPage.label || !newPage.slug || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SCHEMA BUILDER PANEL ─────────────────────────────────────────────────
function SchemaBuilderPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSchema, setNewSchema] = useState({ tableName: "", label: "", description: "", fields: [{ name: "", type: "text", label: "", required: false }] });

  const { data: schemas = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/schema-registry"], queryFn: godModeQueryFn });

  const createMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("POST", "/api/admin/schema-registry", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/schema-registry"] }); toast({ title: "Schema created" }); setNewSchema({ tableName: "", label: "", description: "", fields: [{ name: "", type: "text", label: "", required: false }] }); },
    onError: () => toast({ title: "Failed to create schema", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => godModeApiRequest("DELETE", `/api/admin/schema-registry/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/schema-registry"] }); toast({ title: "Schema deleted" }); },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Table className="w-5 h-5 text-primary" /> Dynamic Schemas</CardTitle>
            <CardDescription>Schema definitions stored in the database. Future: auto-generate tables and CRUD from these.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : (
              <div className="space-y-2">
                {schemas.length === 0 && <p className="text-sm text-muted-foreground">No custom schemas yet. Create one below.</p>}
                {schemas.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">Table: {s.tableName} · {s.fields?.length || 0} fields</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader><CardTitle className="text-sm">Create New Schema</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Table name (e.g. sabha_centers)" value={newSchema.tableName} onChange={e => setNewSchema({ ...newSchema, tableName: e.target.value })} />
            <Input placeholder="Display label" value={newSchema.label} onChange={e => setNewSchema({ ...newSchema, label: e.target.value })} />
            <Input placeholder="Description" value={newSchema.description} onChange={e => setNewSchema({ ...newSchema, description: e.target.value })} />
            <div className="space-y-2">
              <Label className="text-xs">Fields</Label>
              {newSchema.fields.map((f, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Name" value={f.name} onChange={e => { const nf = [...newSchema.fields]; nf[idx].name = e.target.value; setNewSchema({ ...newSchema, fields: nf }); }} className="text-xs" />
                  <Select value={f.type} onValueChange={v => { const nf = [...newSchema.fields]; nf[idx].type = v; setNewSchema({ ...newSchema, fields: nf }); }}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Label" value={f.label} onChange={e => { const nf = [...newSchema.fields]; nf[idx].label = e.target.value; setNewSchema({ ...newSchema, fields: nf }); }} className="text-xs" />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setNewSchema({ ...newSchema, fields: [...newSchema.fields, { name: "", type: "text", label: "", required: false }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Field
              </Button>
            </div>
            <Button className="w-full" onClick={() => createMutation.mutate(newSchema)} disabled={!newSchema.tableName || !newSchema.label || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Schema"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── API BUILDER PANEL ────────────────────────────────────────────────────────
function ApiBuilderPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRoute, setNewRoute] = useState({ label: "", method: "GET", path: "", description: "", sqlQuery: "", requiredRole: "user" });

  const { data: routes = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/route-registry"], queryFn: godModeQueryFn });

  const createMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("POST", "/api/admin/route-registry", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/route-registry"] }); toast({ title: "Route created" }); setNewRoute({ label: "", method: "GET", path: "", description: "", sqlQuery: "", requiredRole: "user" }); },
    onError: () => toast({ title: "Failed to create route", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => godModeApiRequest("DELETE", `/api/admin/route-registry/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/route-registry"] }); toast({ title: "Route deleted" }); },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Terminal className="w-5 h-5 text-primary" /> Dynamic API Routes</CardTitle>
            <CardDescription>Custom REST endpoints defined in the database. Access via /api/dynamic/your-path.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : (
              <div className="space-y-2">
                {routes.length === 0 && <p className="text-sm text-muted-foreground">No custom routes yet. Create one below.</p>}
                {routes.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{r.method}</Badge>
                        {r.label || r.path}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.path} · Role: {r.requiredRole}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader><CardTitle className="text-sm">Create New Route</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Label (e.g. Top Donors)" value={newRoute.label} onChange={e => setNewRoute({ ...newRoute, label: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newRoute.method} onValueChange={v => setNewRoute({ ...newRoute, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newRoute.requiredRole} onValueChange={v => setNewRoute({ ...newRoute, requiredRole: v })}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Path (e.g. /top-donors)" value={newRoute.path} onChange={e => setNewRoute({ ...newRoute, path: e.target.value })} />
            <Input placeholder="Description" value={newRoute.description} onChange={e => setNewRoute({ ...newRoute, description: e.target.value })} />
            <Textarea placeholder="SQL query (e.g. SELECT * FROM devotees WHERE amount > 1000)" value={newRoute.sqlQuery} onChange={e => setNewRoute({ ...newRoute, sqlQuery: e.target.value })} className="min-h-[100px] text-xs font-mono" />
            <Button className="w-full" onClick={() => createMutation.mutate(newRoute)} disabled={!newRoute.path || !newRoute.sqlQuery || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Route"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserApprovalsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const { data: usersData = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: approvalsData = [], isLoading: loadingApprovals, refetch: refetchApprovals } = useQuery<any[]>({
    queryKey: ["/api/admin/approvals"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await adminFetch(`/api/admin/approvals/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to approve user");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "User Approved", description: `Activation code generated: ${data.loginCode}` });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals"] });
    },
    onError: (err: any) => {
      toast({ title: "Approval Failed", description: err.message, variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await adminFetch(`/api/admin/approvals/${userId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject user");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User Rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals"] });
    },
    onError: (err: any) => {
      toast({ title: "Rejection Failed", description: err.message, variant: "destructive" });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update role");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Role Updated Successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (err: any) => {
      toast({ title: "Role Update Failed", description: err.message, variant: "destructive" });
    }
  });

  const handleRoleSelect = (userId: string, role: string) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const filteredUsers = usersData.filter((u: any) => 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.lastName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Top: Pending Approvals */}
        <Card className="lg:col-span-1 border-amber-500/20 shadow-sm shadow-amber-500/5">
          <CardHeader className="bg-amber-500/5 pb-3">
            <CardTitle className="text-sm font-bold tracking-wider text-amber-700 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Approvals ({approvalsData.length})
            </CardTitle>
            <CardDescription className="text-xs">Users awaiting registration code activation</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {loadingApprovals ? (
              <div className="flex justify-center py-6"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
            ) : approvalsData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No pending registrations
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-border">
                {approvalsData.map((appUser: any, idx: number) => {
                  const selectedRole = selectedRoles[appUser.id] || "user";
                  return (
                    <div key={appUser.id} className={`pt-3 ${idx === 0 ? 'pt-0' : ''} space-y-2`}>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{appUser.firstName} {appUser.lastName}</p>
                        <p className="text-[10px] text-muted-foreground">{appUser.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedRole} onValueChange={(v) => handleRoleSelect(appUser.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Devotee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" 
                          onClick={() => approveMutation.mutate({ userId: appUser.id, role: selectedRole })}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => rejectMutation.mutate(appUser.id)}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Active Users list and role modification */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Active Users & Roles</CardTitle>
                <CardDescription className="text-xs">Update roles and check generated activation codes</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="h-7 text-xs pl-8 w-44" 
                  />
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { refetchUsers(); refetchApprovals(); }}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Activation Code</th>
                      <th className="p-3 font-semibold">Assigned Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item: any) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/10">
                        <td className="p-3">
                          <div className="font-semibold">{item.firstName} {item.lastName}</div>
                          <div className="text-muted-foreground text-[10px]">{item.email}</div>
                        </td>
                        <td className="p-3 capitalize">
                          <Badge variant={item.approvalStatus === "approved" ? "default" : "secondary"}>
                            {item.approvalStatus}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-700">
                          {item.loginCode || "-"}
                        </td>
                        <td className="p-3">
                          <Select 
                            value={item.role} 
                            onValueChange={(newRole) => updateRoleMutation.mutate({ userId: item.id, role: newRole })}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="h-7 text-xs w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Devotee</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// ─── DATABASE SQL CONSOLE ──────────────────────────────────────────────────
function DatabaseSQLConsole() {
  const { toast } = useToast();
  const [query, setQuery] = useState("SELECT * FROM devotees LIMIT 10;");
  const [result, setResult] = useState<any>(null);
  const [readOnly, setReadOnly] = useState(true);

  const execMutation = useMutation({
    mutationFn: async (sqlQuery: string) => {
      const res = await godModeApiRequest("POST", "/api/admin/sql-console", { query: sqlQuery });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast({ title: "Query executed successfully" });
    },
    onError: (err: any) => {
      setResult({ error: err.message });
      toast({ title: "Query failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20">
        <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-purple-600" /> Database SQL Console</CardTitle>
        <CardDescription>Execute raw SQL queries directly against the Postgres database. Exercise extreme caution.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-purple-700 dark:text-purple-400">SQL Query</Label>
          <Textarea 
            className="font-mono text-xs bg-zinc-950 text-green-400 h-32 border-purple-200 dark:border-purple-800" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => execMutation.mutate(query)} 
            disabled={execMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {execMutation.isPending ? "Executing..." : "Execute Query"} <Play className="w-4 h-4 ml-2" />
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={readOnly} onCheckedChange={setReadOnly} id="sql-readonly" />
            <label htmlFor="sql-readonly" className={`text-xs font-medium cursor-pointer ${readOnly ? 'text-green-600' : 'text-red-500'}`}>
              {readOnly ? '🔒 Read-Only' : '⚠️ Write Mode'}
            </label>
          </div>
        </div>

        {result && (
          <div className="mt-4 space-y-2">
            <Label>Results</Label>
            <div className="bg-muted p-4 rounded-lg overflow-x-auto border border-border">
              {result.error ? (
                <div className="text-red-500 font-mono text-sm">{result.error}</div>
              ) : Array.isArray(result) && result.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted-foreground/10 text-muted-foreground">
                    <tr>
                      {Object.keys(result[0]).map(k => <th key={k} className="p-2 border-b font-medium">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((row: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 border-border/50 hover:bg-muted/50">
                        {Object.values(row).map((v: any, j: number) => (
                          <td key={j} className="p-2 font-mono truncate max-w-[200px]">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-muted-foreground italic text-sm">Query executed. No rows returned.</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DevStudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();
  const { godModeToken, showDevLogin } = useDevMode();
  
  const [activeTab, setActiveTab] = useState("app-info");
  const [snapshotName, setSnapshotName] = useState("");
  const [importJson, setImportJson] = useState("");
  const [newNavItem, setNewNavItem] = useState({ name: "", href: "", icon: "Home" });
  const [newField, setNewField] = useState({ label: "", type: "text", entity: "devotee", required: false, placeholder: "", options: "" });

  const { data: config, isLoading } = useQuery<any>({ queryKey: ["/api/dev-config"], queryFn: godModeQueryFn });

  const [localAppInfo, setLocalAppInfo] = useState<any>(null);
  const [localNav, setLocalNav] = useState<any[]>([]);
  const [localTheme, setLocalTheme] = useState<any>(null);
  const [localFields, setLocalFields] = useState<any[]>([]);
  const [localRoles, setLocalRoles] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setLocalAppInfo(config.appInfo);
      setLocalNav(config.navigation?.items ? [...config.navigation.items].sort((a: any, b: any) => a.order - b.order) : []);
      setLocalTheme(config.theme);
      setLocalFields(config.customFields || []);
      setLocalRoles(config.roleProfiles);
    }
  }, [config]);

  const applyThemePreview = (colors: any) => {
    const root = document.documentElement;
    const keys = ["primary", "secondary", "accent", "background", "foreground", "card", "border", "muted"];
    keys.forEach(k => { if (colors[k]) root.style.setProperty(`--${k}`, `hsl(${colors[k]})`); });
  };

  const saveAppInfoMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("PATCH", "/api/dev-config/app-info", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); toast({ title: "App info saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveNavMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("PATCH", "/api/dev-config/navigation", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); toast({ title: "Navigation saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveThemeMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("PATCH", "/api/dev-config/theme", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] });
      toast({ title: "Theme saved" });
      if (data?.useCustom && data?.customColors) applyThemePreview(data.customColors);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveFieldsMutation = useMutation({
    mutationFn: (fields: any[]) => godModeApiRequest("PATCH", "/api/dev-config/custom-fields", { fields }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); toast({ title: "Custom fields saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveRolesMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("PATCH", "/api/dev-config/role-profiles", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); toast({ title: "Role profiles saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const snapshotMutation = useMutation({
    mutationFn: (name: string) => godModeApiRequest("POST", "/api/dev-config/snapshot", { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); setSnapshotName(""); toast({ title: "Snapshot saved" }); },
    onError: () => toast({ title: "Failed to save snapshot", variant: "destructive" }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => godModeApiRequest("POST", `/api/dev-config/restore/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); toast({ title: "Config restored" }); },
    onError: () => toast({ title: "Failed to restore", variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: (data: any) => godModeApiRequest("POST", "/api/dev-config/import", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dev-config"] }); setImportJson(""); toast({ title: "Config imported successfully" }); },
    onError: () => toast({ title: "Invalid config format", variant: "destructive" }),
  });

  const moveNavItem = (idx: number, dir: "up" | "down") => {
    const items = [...localNav];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    items.forEach((item, i) => { item.order = i; });
    setLocalNav(items);
  };

  const addNavItem = () => {
    if (!newNavItem.name || !newNavItem.href) return;
    const item = { id: `custom_${Date.now()}`, ...newNavItem, visible: true, order: localNav.length };
    setLocalNav(prev => [...prev, item]);
    setNewNavItem({ name: "", href: "", icon: "Home" });
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    const newColors = { ...localTheme?.customColors, primary: preset.primary, secondary: preset.secondary, accent: preset.accent, background: preset.bg };
    const newTheme = { ...localTheme, activePreset: preset.id, customColors: newColors };
    setLocalTheme(newTheme);
    if (localTheme?.useCustom) applyThemePreview(newColors);
    else setTheme(preset.id as any);
  };

  const updateCustomColor = (key: string, value: string) => {
    const newColors = { ...localTheme?.customColors, [key]: value };
    setLocalTheme({ ...localTheme, customColors: newColors });
    if (localTheme?.useCustom) applyThemePreview(newColors);
  };

  const addCustomField = () => {
    if (!newField.label) return;
    const id = newField.label.toLowerCase().replace(/\s+/g, "_");
    const field: any = { id, ...newField };
    if (newField.type === "dropdown") field.options = newField.options.split(",").map(o => o.trim()).filter(Boolean);
    setLocalFields(prev => [...prev, field]);
    setNewField({ label: "", type: "text", entity: "devotee", required: false, placeholder: "", options: "" });
  };

  const handleExport = async () => {
    const res = await fetch('/api/dev-config/export', { credentials: 'include' });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'madhav-parivar-config.json'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Config exported" });
  };

  const handleImport = () => {
    try { importMutation.mutate(JSON.parse(importJson)); }
    catch { toast({ title: "Invalid JSON format", variant: "destructive" }); }
  };

  const toggleRolePage = (role: string, pageId: string) => {
    setLocalRoles((prev: any) => {
      const pages: string[] = prev[role]?.visiblePages || [];
      const updated = pages.includes(pageId) ? pages.filter((p: string) => p !== pageId) : [...pages, pageId];
      return { ...prev, [role]: { ...prev[role], visiblePages: updated } };
    });
  };

  if (isLoading || !localAppInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Dev Studio...</p>
        </div>
      </div>
    );
  }

  if (!godModeToken) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-200">
        <div className="max-w-md w-full text-center space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Developer Studio Locked</h2>
          <p className="text-zinc-400">
            GOD Mode is currently inactive. You must unlock the studio to access and modify system configurations.
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Button onClick={showDevLogin} className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-8">
              Unlock Studio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const TAB_ROW1 = [
    { id: "app-info", label: "App Info", icon: LayoutDashboard },
    { id: "theme", label: "Theme Studio", icon: Paintbrush },
    { id: "navigation", label: "Navigation", icon: Navigation },
    { id: "fields", label: "Schema", icon: Database },
    { id: "roles", label: "Access Control", icon: Shield },
    { id: "page-builder", label: "Page Builder", icon: Layers },
    { id: "schema-builder", label: "Schema Builder", icon: Table },
    { id: "api-builder", label: "API Builder", icon: Terminal },
    { id: "schema-visualizer", label: "Schema Visualizer", icon: GitBranch },
  ];

  const TAB_ROW1_EXTRA = [
    { id: "user-approvals", label: "User Approvals", icon: Users },
    { id: "csv-import", label: "CSV Import/Export", icon: Download },
    { id: "api-docs", label: "API Docs", icon: FileJson },
  ];

  const TAB_ROW2 = [
    { id: "data-browser", label: "Data Browser", icon: Table },
    { id: "relational-map", label: "Relational Map", icon: GitBranch },
    { id: "macros", label: "Macro Studio", icon: Zap },
    { id: "audit-log", label: "Audit Trail", icon: Activity },
    { id: "dispatch-log", label: "Dispatch Hub", icon: Send },
    { id: "devops", label: "Dev Ops", icon: FileJson },
  ];

  const TAB_ROW3 = [
    { id: "sql-console", label: "SQL Console", icon: Database },
    { id: "api-console", label: "API Console", icon: Terminal },
    { id: "feature-flags", label: "Feature Flags", icon: Flag },
    { id: "seed-manager", label: "Seed Manager", icon: Sprout },
    { id: "rollback", label: "Rollback", icon: RotateCw },
    { id: "visual-overrides", label: "Visual Overrides", icon: Paintbrush },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Developer Studio — GOD Mode"
        subtitle="Complete application control · Data management · Automation · Audit"
        actions={
          <Badge className="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 animate-pulse">
            <Code2 className="w-3.5 h-3.5 mr-1.5" /> GOD MODE ACTIVE
          </Badge>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Three-row tab layout for 15 tabs */}
          <div className="space-y-1 mb-5">
            <div className="text-xs text-muted-foreground px-1 mb-1 font-medium tracking-wider">CONFIGURATION</div>
            <TabsList className="grid grid-cols-9 w-full bg-muted/60">
              {TAB_ROW1.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="text-xs text-muted-foreground px-1 mt-1 mb-1 font-medium tracking-wider">DATA & DOCUMENTATION</div>
            <TabsList className="grid grid-cols-3 w-full bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900/50">
              {TAB_ROW1_EXTRA.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-green-700 dark:text-green-400">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="text-xs text-muted-foreground px-1 mt-3 mb-1 font-medium tracking-wider">GOD MODE TOOLS</div>
            <TabsList className="grid grid-cols-6 w-full bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900/50">
              {TAB_ROW2.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:shadow-sm text-yellow-700 dark:text-yellow-500">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="text-xs text-muted-foreground px-1 mt-3 mb-1 font-medium tracking-wider">GOD MODE POWER</div>
            <TabsList className="grid grid-cols-6 w-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/50">
              {TAB_ROW3.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-purple-700 dark:text-purple-400">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── APP INFO ── */}
          <TabsContent value="app-info">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-primary" /> Application Identity</CardTitle>
                    <CardDescription>Customize the app name, subtitle, and logo appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Application Name</Label>
                        <Input value={localAppInfo.name} onChange={e => setLocalAppInfo({ ...localAppInfo, name: e.target.value })} placeholder="App name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input value={localAppInfo.subtitle} onChange={e => setLocalAppInfo({ ...localAppInfo, subtitle: e.target.value })} placeholder="Subtitle" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Logo Symbol</Label>
                        <Input value={localAppInfo.logoSymbol} onChange={e => setLocalAppInfo({ ...localAppInfo, logoSymbol: e.target.value })} placeholder="Logo character" maxLength={4} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => saveAppInfoMutation.mutate(localAppInfo)} disabled={saveAppInfoMutation.isPending}>
                        {saveAppInfoMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save App Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground text-lg font-bold">{localAppInfo.logoSymbol || "॥"}</span>
                        </div>
                        <div>
                          <h1 className="text-base font-bold text-foreground">{localAppInfo.name || "App Name"}</h1>
                          <p className="text-xs text-muted-foreground">{localAppInfo.subtitle || "Subtitle"}</p>
                        </div>
                      </div>
                      <Separator />
                      <p className="text-xs text-muted-foreground mt-3 text-center">Sidebar header preview</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> System Info</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[["Version", "2.0 GOD Mode"], ["Storage", "In-Memory"], ["Devotees", "20"], ["Families", "6"], ["Events", "12"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{k}</span>
                        <Badge variant="outline" className="text-xs">{v}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── THEME STUDIO ── */}
          <TabsContent value="theme">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Paintbrush className="w-5 h-5 text-primary" /> Theme Presets</CardTitle>
                    <CardDescription>8 ready-made themes — click to preview instantly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {THEME_PRESETS.map(preset => (
                        <button key={preset.id} onClick={() => applyPreset(preset)}
                          className={`group relative p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${localTheme?.activePreset === preset.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex gap-1 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.primary})` }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.secondary})` }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.accent})` }} />
                          </div>
                          <p className="text-xs font-medium truncate">{preset.label}</p>
                          {localTheme?.activePreset === preset.id && <div className="absolute top-1.5 right-1.5"><Check className="w-3 h-3 text-primary" /></div>}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-primary" /> Custom Color Overrides</CardTitle>
                        <CardDescription>Fine-tune individual HSL color values</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Enable Custom</Label>
                        <Switch checked={localTheme?.useCustom || false}
                          onCheckedChange={checked => {
                            const newT = { ...localTheme, useCustom: checked };
                            setLocalTheme(newT);
                            if (checked && localTheme?.customColors) applyThemePreview(localTheme.customColors);
                          }} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {localTheme?.useCustom ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["primary", "secondary", "accent", "background", "foreground", "card", "border", "muted"].map(key => (
                          <ColorSlider key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={localTheme?.customColors?.[key] || "0 0% 50%"}
                            onChange={v => updateCustomColor(key, v)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sliders className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Enable Custom Colors to override individual theme values</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Shape & Spacing</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Border Radius</Label>
                        <code className="text-xs bg-muted px-1 rounded">{localTheme?.borderRadius || "0.5"}rem</code>
                      </div>
                      <input type="range" min="0" max="2" step="0.125" value={localTheme?.borderRadius || "0.5"}
                        onChange={e => { setLocalTheme({ ...localTheme, borderRadius: e.target.value }); document.documentElement.style.setProperty('--radius', `${e.target.value}rem`); }}
                        className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Square</span><span>Rounded</span><span>Full</span></div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => saveThemeMutation.mutate(localTheme)} disabled={saveThemeMutation.isPending}>
                    {saveThemeMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Theme
                  </Button>
                </div>
              </div>

              <div>
                <Card className="sticky top-0">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Color Preview</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="h-10 flex items-center px-3 gap-2" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>M</div>
                        <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Madhav Parivar</span>
                      </div>
                      <div className="p-3 space-y-2" style={{ background: 'var(--background)' }}>
                        <div className="rounded p-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>Sample Card</div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Devotee profile content</div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-7 rounded text-xs flex items-center justify-center font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Primary</div>
                          <div className="flex-1 h-7 rounded text-xs flex items-center justify-center font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>Accent</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {["--primary", "--secondary", "--accent", "--background", "--foreground", "--card", "--border", "--muted"].map(v => (
                        <div key={v} className="h-6 rounded border border-border" style={{ background: `var(${v})` }} title={v.slice(2)} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── NAVIGATION ── */}
          <TabsContent value="navigation">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Navigation className="w-5 h-5 text-primary" /> Sidebar Navigation</CardTitle>
                    <CardDescription>Reorder, rename, show/hide, or add new pages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {localNav.map((item, idx) => (
                      <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.visible ? 'border-border bg-card' : 'border-dashed border-border bg-muted/30 opacity-60'}`}>
                        <Move className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input value={item.name} onChange={e => setLocalNav(prev => prev.map((n, i) => i === idx ? { ...n, name: e.target.value } : n))} className="h-7 text-sm" placeholder="Label" />
                          <Input value={item.href} onChange={e => setLocalNav(prev => prev.map((n, i) => i === idx ? { ...n, href: e.target.value } : n))} className="h-7 text-sm font-mono" placeholder="/path" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveNavItem(idx, "up")} disabled={idx === 0}><ChevronUp className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveNavItem(idx, "down")} disabled={idx === localNav.length - 1}><ChevronDown className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setLocalNav(prev => prev.map((n, i) => i === idx ? { ...n, visible: !n.visible } : n))}>
                            {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setLocalNav(prev => prev.filter(n => n.id !== item.id))}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add Navigation Item</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Label</Label>
                        <Input value={newNavItem.name} onChange={e => setNewNavItem({ ...newNavItem, name: e.target.value })} className="h-8" placeholder="Page Name" /></div>
                      <div className="space-y-1"><Label className="text-xs">Path</Label>
                        <Input value={newNavItem.href} onChange={e => setNewNavItem({ ...newNavItem, href: e.target.value })} className="h-8 font-mono" placeholder="/my-page" /></div>
                      <div className="space-y-1"><Label className="text-xs">Icon</Label>
                        <Select value={newNavItem.icon} onValueChange={v => setNewNavItem({ ...newNavItem, icon: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                        </Select></div>
                    </div>
                    <Button size="sm" className="mt-3" onClick={addNavItem} disabled={!newNavItem.name || !newNavItem.href}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => saveNavMutation.mutate({ items: localNav })} disabled={saveNavMutation.isPending}>
                    {saveNavMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Navigation
                  </Button>
                </div>
              </div>

              <div>
                <Card className="sticky top-0">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Sidebar Preview</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-border bg-card">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-bold">{localAppInfo?.logoSymbol}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold">{localAppInfo?.name}</p>
                            <p className="text-[10px] text-muted-foreground">{localAppInfo?.subtitle}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5 bg-card">
                        {localNav.filter(n => n.visible).map(item => (
                          <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted">
                            <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">{localNav.filter(n => n.visible).length} visible · {localNav.filter(n => !n.visible).length} hidden</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── SCHEMA / CUSTOM FIELDS ── */}
          <TabsContent value="fields">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Custom Fields</CardTitle>
                    <CardDescription>Add metadata fields to any entity (devotee, family, event)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {localFields.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground"><Database className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No custom fields yet</p></div>
                    )}
                    {localFields.map((field) => (
                      <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{field.label}</p>
                            <p className="text-xs text-muted-foreground font-mono">{field.id}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs capitalize">{field.type}</Badge>
                            <Badge variant="outline" className="text-xs capitalize">{field.entity}</Badge>
                            {field.required && <Badge className="text-xs">Required</Badge>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setLocalFields(prev => prev.filter(f => f.id !== field.id))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add Field</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Field Label</Label>
                        <Input value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} className="h-8" placeholder="e.g. Spiritual Name" /></div>
                      <div className="space-y-1"><Label className="text-xs">Field Type</Label>
                        <Select value={newField.type} onValueChange={v => setNewField({ ...newField, type: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                        </Select></div>
                      <div className="space-y-1"><Label className="text-xs">Entity</Label>
                        <Select value={newField.entity} onValueChange={v => setNewField({ ...newField, entity: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="devotee">Devotee</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select></div>
                      <div className="space-y-1"><Label className="text-xs">Placeholder</Label>
                        <Input value={newField.placeholder} onChange={e => setNewField({ ...newField, placeholder: e.target.value })} className="h-8" placeholder="Hint text" /></div>
                      {newField.type === "dropdown" && (
                        <div className="col-span-2 space-y-1"><Label className="text-xs">Options (comma-separated)</Label>
                          <Input value={newField.options} onChange={e => setNewField({ ...newField, options: e.target.value })} className="h-8" placeholder="Option A, Option B" /></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={newField.required} onCheckedChange={v => setNewField({ ...newField, required: v })} />
                        <Label className="text-sm">Required field</Label>
                      </div>
                      <Button size="sm" onClick={addCustomField} disabled={!newField.label}><Plus className="w-3.5 h-3.5 mr-1" /> Add Field</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => saveFieldsMutation.mutate(localFields)} disabled={saveFieldsMutation.isPending}>
                    {saveFieldsMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Fields
                  </Button>
                </div>
              </div>

              <div>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Field Types</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[{ t: "text", d: "Short string" }, { t: "number", d: "Numeric value" }, { t: "date", d: "Date picker" }, { t: "dropdown", d: "Select options" }, { t: "boolean", d: "Yes/No toggle" }, { t: "email", d: "Email address" }, { t: "phone", d: "Phone number" }, { t: "textarea", d: "Multi-line text" }].map(({ t, d }) => (
                      <div key={t} className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">{t}</Badge>
                        <span className="text-xs text-muted-foreground">{d}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── ACCESS CONTROL / ROLES ── */}
          <TabsContent value="roles">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Role-Based Access Profiles</CardTitle>
                  <CardDescription>Configure page visibility and permissions for each role</CardDescription>
                </CardHeader>
                <CardContent>
                  {localRoles && Object.entries(localRoles).map(([role, profile]: [string, any]) => (
                    <div key={role} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="capitalize text-sm px-3 py-1">{profile.label || role}</Badge>
                        <div className="flex items-center gap-4 ml-auto">
                          <div className="flex items-center gap-2">
                            <Switch checked={profile.canEdit} onCheckedChange={v => setLocalRoles((prev: any) => ({ ...prev, [role]: { ...prev[role], canEdit: v } }))} />
                            <Label className="text-xs">Can Edit</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={profile.canDelete} onCheckedChange={v => setLocalRoles((prev: any) => ({ ...prev, [role]: { ...prev[role], canDelete: v } }))} />
                            <Label className="text-xs">Can Delete</Label>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                        {ALL_PAGES.map(page => (
                          <label key={page.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={profile.visiblePages?.includes(page.id)} onChange={() => toggleRolePage(role, page.id)} className="rounded" />
                            <span className="text-xs">{page.label}</span>
                          </label>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => saveRolesMutation.mutate(localRoles)} disabled={saveRolesMutation.isPending}>
                      {saveRolesMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Roles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── GOD MODE: DATA BROWSER ── */}
          <TabsContent value="data-browser">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-yellow-500" /> Data Browser — Full Record Access
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">GOD MODE</Badge>
                </CardTitle>
                <CardDescription>Browse, edit, and delete any record across all database entities. Select rows for bulk operations.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataBrowser />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GOD MODE: RELATIONAL MAP ── */}
          <TabsContent value="relational-map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-yellow-500" /> Relational Data Manager
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">GOD MODE</Badge>
                </CardTitle>
                <CardDescription>Visualize and manage relationships between devotees, families, mentors, and more.</CardDescription>
              </CardHeader>
              <CardContent>
                <RelationalMap />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GOD MODE: MACRO STUDIO ── */}
          <TabsContent value="macros">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" /> Macro Studio — Automation Engine
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">GOD MODE</Badge>
                </CardTitle>
                <CardDescription>Record multi-step automated sequences and replay them with one click.</CardDescription>
              </CardHeader>
              <CardContent>
                <MacroStudio />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GOD MODE: AUDIT TRAIL ── */}
          <TabsContent value="audit-log">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-yellow-500" /> Audit Trail — Change History
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">GOD MODE</Badge>
                </CardTitle>
                <CardDescription>Complete log of every data change made during this session, with before/after values.</CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLog />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GOD MODE: DISPATCH HUB ── */}
          <TabsContent value="dispatch-log">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> Security & Dispatch Hub
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">GOD MODE</Badge>
                </CardTitle>
                <CardDescription>Real-time audit log of all security dispatches, activation codes, and devotee notifications.</CardDescription>
              </CardHeader>
              <CardContent>
                <DispatchHub />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DEV OPS: EXPORT / IMPORT / SNAPSHOTS ── */}
          <TabsContent value="devops">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileJson className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Dev Ops — Export, Import & Backup</h3>
              </div>
              <DataExport
                config={config}
                importJson={importJson}
                setImportJson={setImportJson}
                handleImport={handleImport}
                importMutation={importMutation}
                handleExport={handleExport}
                snapshotName={snapshotName}
                setSnapshotName={setSnapshotName}
                snapshotMutation={snapshotMutation}
                restoreMutation={restoreMutation}
                toast={toast}
              />
            </div>
          </TabsContent>

          {/* ── GOD MODE POWER: API CONSOLE ── */}
          <TabsContent value="sql-console"><DatabaseSQLConsole /></TabsContent>
          <TabsContent value="api-console">
            <ApiConsole />
          </TabsContent>

          {/* ── GOD MODE POWER: FEATURE FLAGS ── */}
          <TabsContent value="feature-flags">
            <FeatureFlagsPanel />
          </TabsContent>

          {/* ── GOD MODE POWER: SEED MANAGER ── */}
          <TabsContent value="seed-manager">
            <SeedManagerPanel />
          </TabsContent>

          {/* ── GOD MODE POWER: ROLLBACK MANAGER ── */}
          <TabsContent value="rollback">
            <RollbackPanel />
          </TabsContent>

          {/* ── GOD MODE POWER: VISUAL OVERRIDES ── */}
          <TabsContent value="visual-overrides">
            <VisualOverridesPanel />
          </TabsContent>

          {/* ── PAGE BUILDER ── */}
          <TabsContent value="page-builder">
            <PageBuilderPanel />
          </TabsContent>

          {/* ── SCHEMA BUILDER ── */}
          <TabsContent value="schema-builder">
            <SchemaBuilderPanel />
          </TabsContent>

          {/* ── API BUILDER ── */}
          <TabsContent value="api-builder">
            <ApiBuilderPanel />
          </TabsContent>

          {/* ── SCHEMA VISUALIZER ── */}
          <TabsContent value="schema-visualizer">
            <SchemaVisualizer />
          </TabsContent>

          {/* ── USER APPROVALS ── */}
          <TabsContent value="user-approvals">
            <UserApprovalsPanel />
          </TabsContent>

          {/* ── CSV IMPORT/EXPORT ── */}
          <TabsContent value="csv-import">
            <CsvExportImport />
          </TabsContent>

          {/* ── API DOCUMENTATION ── */}
          <TabsContent value="api-docs">
            <ApiDocumentation />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
