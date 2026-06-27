import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceChart } from "@/components/Dashboard/AttendanceChart";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, CheckCircle, XCircle, Clock, AlertCircle, Users, TrendingUp, Award, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Attendance, Devotee, Event } from "@shared/schema";

type AttendanceRecord = Attendance & { devoteeName?: string; eventTitle?: string };

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({ devoteeId: "", eventId: "", status: "present", checkInTime: "09:00", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: attendanceRaw = [], isLoading: attLoading, isError: attError, error: attErr, refetch: attRefetch } = useQuery<Attendance[]>({ queryKey: ["/api/attendance"] });
  const { data: devotees = [], isLoading: devLoading, isError: devError, error: devErr, refetch: devRefetch } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });
  const { data: events = [], isLoading: evtLoading, isError: evtError, error: evtErr, refetch: evtRefetch } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const isLoading = attLoading || devLoading || evtLoading;
  const isError = attError || devError || evtError;

  const devoteeMap = useMemo(() => {
    const m: Record<number, string> = {};
    devotees.forEach((d) => { m[d.id] = `${d.firstName} ${d.lastName}`; });
    return m;
  }, [devotees]);

  const eventMap = useMemo(() => {
    const m: Record<number, string> = {};
    events.forEach((e) => { m[e.id] = e.title; });
    return m;
  }, [events]);

  const enriched: AttendanceRecord[] = useMemo(() =>
    attendanceRaw.map(r => ({
      ...r,
      devoteeName: devoteeMap[r.devoteeId] || `Devotee #${r.devoteeId}`,
      eventTitle: r.eventId ? (eventMap[r.eventId] || `Event #${r.eventId}`) : "General Satsang",
    })), [attendanceRaw, devoteeMap, eventMap]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const present = enriched.filter(r => r.status === "present").length;
    const absent = enriched.filter(r => r.status === "absent").length;
    const late = enriched.filter(r => r.status === "late").length;
    const presentRate = total ? Math.round((present / total) * 100) : 0;
    const uniqueDevotees = new Set(enriched.map(r => r.devoteeId)).size;
    return { total, present, absent, late, presentRate, uniqueDevotees };
  }, [enriched]);

  const topAttendees = useMemo(() => {
    const counts: Record<number, { name: string; present: number; total: number }> = {};
    enriched.forEach(r => {
      if (!counts[r.devoteeId]) counts[r.devoteeId] = { name: r.devoteeName || "", present: 0, total: 0 };
      counts[r.devoteeId].total++;
      if (r.status === "present") counts[r.devoteeId].present++;
    });
    return Object.entries(counts)
      .map(([id, v]) => ({ id: Number(id), ...v, rate: Math.round((v.present / v.total) * 100) }))
      .sort((a, b) => b.present - a.present)
      .slice(0, 5);
  }, [enriched]);

  const eventOptions = useMemo(() => {
    const seen = new Set<number>();
    const opts: { id: number; title: string }[] = [];
    enriched.forEach(r => { if (r.eventId && !seen.has(r.eventId)) { seen.add(r.eventId); opts.push({ id: r.eventId, title: r.eventTitle || "" }); } });
    return opts;
  }, [enriched]);

  const filtered = useMemo(() => enriched.filter(r => {
    const matchesSearch = !searchTerm ||
      (r.devoteeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.eventTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEventId === "all" || String(r.eventId) === selectedEventId;
    const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  }).slice(0, 200), [enriched, searchTerm, selectedEventId, selectedStatus]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setShowAddDialog(false);
      setNewRecord({ devoteeId: "", eventId: "", status: "present", checkInTime: "09:00", notes: "" });
      toast({ title: "Attendance recorded" });
    },
    onError: () => toast({ title: "Failed to record attendance", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/attendance/${id}`, undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }); toast({ title: "Record deleted" }); },
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: any; label: string }> = {
      present: { cls: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Present" },
      absent: { cls: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Absent" },
      late: { cls: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Late" },
      excused: { cls: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle, label: "Excused" },
    };
    const cfg = map[status] || { cls: "bg-gray-100 text-gray-800", icon: AlertCircle, label: status };
    const Icon = cfg.icon;
    return <Badge className={`${cfg.cls} border text-xs`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>;
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading attendance data..." /></div>;

  if (isError) {
    const errorMsg = (attErr || devErr || evtErr)?.message || "Failed to load database queries.";
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full border-destructive/20 shadow-elevation-2">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Error Loading Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {errorMsg}
            </p>
            <Button onClick={() => { attRefetch(); devRefetch(); evtRefetch(); }} className="w-full flex items-center justify-center gap-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Attendance"
        subtitle={`${stats.total} records across ${stats.uniqueDevotees} devotees`}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" /> Mark Attendance
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.presentRate}%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
              <Progress value={stats.presentRate} className="mt-3 h-1.5" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueDevotees}</p>
                  <p className="text-xs text-muted-foreground">Devotees Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Total Present</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{topAttendees[0]?.present || 0}</p>
                  <p className="text-xs text-muted-foreground">Top Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <AttendanceChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Attendance Records
                    <Badge variant="outline" className="text-xs">{filtered.length} shown</Badge>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search devotee or event..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 w-44 text-sm"
                      />
                    </div>
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <Filter className="w-3 h-3 mr-1" />
                        <SelectValue placeholder="All Events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {eventOptions.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title.slice(0, 30)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-base font-medium mb-1">No records found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or add attendance records.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[520px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Devotee</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check-In</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((record) => (
                          <TableRow key={record.id} className="group hover:bg-muted/30">
                            <TableCell className="font-medium">
                              <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate(`/devotees/${record.devoteeId}`)}>
                                {record.devoteeName}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[180px]" title={record.eventTitle}><span className="block truncate" title={record.eventTitle}>{record.eventTitle}</span></TableCell>
                            <TableCell className="text-sm">
                              {record.attendanceDate ? new Date(record.attendanceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{record.checkInTime || "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground capitalize">{record.recordedBy || "System"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
                                onClick={() => deleteMutation.mutate(record.id)}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Attendees Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Top Attendees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topAttendees.map((att, idx) => (
                  <div key={att.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"}`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium break-words max-w-[100px] text-primary hover:underline cursor-pointer" title={att.name} onClick={() => navigate(`/devotees/${att.id}`)}>{att.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{att.present} times</span>
                    </div>
                    <Progress value={att.rate} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {eventOptions.slice(0, 6).map(evt => {
                  const evtRecords = enriched.filter(r => r.eventId === evt.id);
                  const presentCount = evtRecords.filter(r => r.status === "present").length;
                  const rate = evtRecords.length ? Math.round((presentCount / evtRecords.length) * 100) : 0;
                  return (
                    <div key={evt.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground break-words max-w-[120px]" title={evt.title}>{evt.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{rate}%</span>
                        <span className="text-muted-foreground">({presentCount}/{evtRecords.length})</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Attendance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Devotee</Label>
              <Select value={newRecord.devoteeId} onValueChange={v => setNewRecord({ ...newRecord, devoteeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select devotee" /></SelectTrigger>
                <SelectContent>
                  {devotees.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.firstName} {d.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Event (optional)</Label>
              <Select value={newRecord.eventId} onValueChange={v => setNewRecord({ ...newRecord, eventId: v })}>
                <SelectTrigger><SelectValue placeholder="General attendance" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General Attendance</SelectItem>
                  {events.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={newRecord.status} onValueChange={v => setNewRecord({ ...newRecord, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Check-In Time</Label>
                <Input type="time" value={newRecord.checkInTime} onChange={e => setNewRecord({ ...newRecord, checkInTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={newRecord.notes} onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })} placeholder="Any notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              disabled={!newRecord.devoteeId || createMutation.isPending}
              onClick={() => createMutation.mutate({
                devoteeId: Number(newRecord.devoteeId),
                eventId: newRecord.eventId ? Number(newRecord.eventId) : null,
                attendanceDate: new Date().toISOString(),
                status: newRecord.status,
                checkInTime: newRecord.checkInTime || null,
                notes: newRecord.notes || null,
                recordedBy: "admin",
              })}
            >
              {createMutation.isPending ? "Saving..." : "Mark Attendance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
