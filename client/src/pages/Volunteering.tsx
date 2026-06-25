import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { HandHeart, Plus, Clock, Award, Users, Activity, Edit, Trash2, Calendar, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Devotee } from "@shared/schema";

interface VolRecord {
  id: number;
  devoteeId: number;
  activityType: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  hoursCommitted: number | null;
  hoursCompleted: number | null;
  skills: string | null;
  status: string;
  supervisorId: number | null;
  feedback: string | null;
  createdAt: string;
}

const ACTIVITY_TYPES = ["Seva", "Decoration", "Cooking", "Management", "Teaching", "Cleanup", "Music & Kirtan", "Audio/Visual", "Security", "Transportation", "Medical Support", "Children Programs"];

const ACTIVITY_COLORS: Record<string, string> = {
  Seva: "bg-orange-100 text-orange-800 border-orange-200",
  Decoration: "bg-pink-100 text-pink-800 border-pink-200",
  Cooking: "bg-green-100 text-green-800 border-green-200",
  Management: "bg-blue-100 text-blue-800 border-blue-200",
  Teaching: "bg-purple-100 text-purple-800 border-purple-200",
  Cleanup: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function VolunteeringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<VolRecord | null>(null);
  const [formData, setFormData] = useState({
    devoteeId: "", activityType: "", description: "", location: "",
    startDate: new Date().toISOString().slice(0, 10), hoursCommitted: "", hoursCompleted: "",
    skills: "", status: "active", supervisorId: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: records = [], isLoading } = useQuery<VolRecord[]>({ queryKey: ["/api/volunteering"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });

  const getDevoteeName = (id: number) => {
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName} ${d.lastName}` : `Devotee #${id}`;
  };

  const getDevoteeInitials = (id: number) => {
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName[0]}${d.lastName[0]}` : "?";
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/volunteering", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteering"] });
      toast({ title: "Success", description: "Volunteering record added" });
      setIsFormOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add record", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/volunteering/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteering"] });
      toast({ title: "Success", description: "Record updated" });
      setIsFormOpen(false);
      setEditRecord(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/volunteering/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteering"] });
      toast({ title: "Success", description: "Record deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const filteredRecords = records.filter((r: VolRecord) => {
    const rDate = new Date(r.startDate);
    const now = new Date();
    const devoteeName = getDevoteeName(r.devoteeId).toLowerCase();
    const matchesSearch = !searchTerm ||
      devoteeName.includes(searchTerm.toLowerCase()) ||
      r.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = selectedActivity === "all" || r.activityType.toLowerCase() === selectedActivity;
    let matchesMonth = true;
    if (selectedMonth === "current") {
      matchesMonth = rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    } else if (selectedMonth === "last") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1);
      matchesMonth = rDate.getMonth() === last.getMonth() && rDate.getFullYear() === last.getFullYear();
    }
    return matchesSearch && matchesActivity && matchesMonth;
  });

  const totalHours = records.reduce((s: number, r: VolRecord) => s + (r.hoursCompleted || r.hoursCommitted || 0), 0);
  const monthlyHours = records.filter((r: VolRecord) => {
    const d = new Date(r.startDate); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s: number, r: VolRecord) => s + (r.hoursCompleted || r.hoursCommitted || 0), 0);
  const activeVolunteers = new Set(records.map((r: VolRecord) => r.devoteeId)).size;

  const openAdd = () => {
    setEditRecord(null);
    setFormData({ devoteeId: "", activityType: "", description: "", location: "", startDate: new Date().toISOString().slice(0, 10), hoursCommitted: "", hoursCompleted: "", skills: "", status: "active", supervisorId: "" });
    setIsFormOpen(true);
  };

  const openEdit = (r: VolRecord) => {
    setEditRecord(r);
    setFormData({
      devoteeId: String(r.devoteeId),
      activityType: r.activityType,
      description: r.description || "",
      location: r.location || "",
      startDate: r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : "",
      hoursCommitted: String(r.hoursCommitted || ""),
      hoursCompleted: String(r.hoursCompleted || ""),
      skills: r.skills || "",
      status: r.status,
      supervisorId: String(r.supervisorId || "")
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      devoteeId: parseInt(formData.devoteeId),
      hoursCommitted: formData.hoursCommitted ? parseInt(formData.hoursCommitted) : null,
      hoursCompleted: formData.hoursCompleted ? parseInt(formData.hoursCompleted) : null,
      supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
      startDate: new Date(formData.startDate).toISOString(),
    };
    if (editRecord) updateMutation.mutate({ id: editRecord.id, data });
    else createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading volunteering records..." /></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Volunteering" subtitle="Track volunteer activities and seva hours" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-blue-600" /><div><p className="text-2xl font-bold">{totalHours}</p><p className="text-xs text-muted-foreground">Total Hours</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><HandHeart className="w-8 h-8 text-red-600" /><div><p className="text-2xl font-bold">{monthlyHours}</p><p className="text-xs text-muted-foreground">This Month</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-green-600" /><div><p className="text-2xl font-bold">{activeVolunteers}</p><p className="text-xs text-muted-foreground">Unique Volunteers</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Activity className="w-8 h-8 text-purple-600" /><div><p className="text-2xl font-bold">{records.length}</p><p className="text-xs text-muted-foreground">Total Records</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2"><HandHeart className="w-5 h-5 text-primary" /> Volunteering Records ({filteredRecords.length})</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search volunteer, activity..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 w-52"
                      />
                    </div>
                    <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        {ACTIVITY_TYPES.map(a => <SelectItem key={a} value={a.toLowerCase()}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="current">This Month</SelectItem>
                        <SelectItem value="last">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-secondary">
                      <Plus className="w-4 h-4 mr-2" /> Log Activity
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No records found</h3>
                    <p className="text-muted-foreground mb-4">No volunteering records match your filters.</p>
                    <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Log First Activity</Button>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Volunteer</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((r: VolRecord) => (
                          <TableRow key={r.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/devotees/${r.devoteeId}`)}>
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold text-primary">{getDevoteeInitials(r.devoteeId)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm hover:text-primary transition-colors">{getDevoteeName(r.devoteeId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={ACTIVITY_COLORS[r.activityType] || "bg-gray-100 text-gray-800"}>{r.activityType}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium">{r.hoursCompleted || r.hoursCommitted || 0}h</span>
                                {r.hoursCommitted && r.hoursCompleted !== null && r.hoursCompleted !== r.hoursCommitted && (
                                  <span className="text-xs text-muted-foreground">/ {r.hoursCommitted}h committed</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                {new Date(r.startDate).toLocaleDateString('en-IN')}
                              </div>
                            </TableCell>
                            <TableCell><span className="text-sm">{r.location || "—"}</span></TableCell>
                            <TableCell>
                              <Badge variant={r.status === "completed" ? "default" : r.status === "active" ? "secondary" : "outline"} className="capitalize">{r.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Edit className="w-4 h-4" /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                      <AlertDialogDescription>Delete this volunteering record for {getDevoteeName(r.devoteeId)}?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMutation.mutate(r.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Top Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {records.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">No records yet</div>
                ) : (
                  (() => {
                    const volunteerSums: Record<number, number> = {};
                    records.forEach(r => {
                      const hrs = r.hoursCompleted || r.hoursCommitted || 0;
                      volunteerSums[r.devoteeId] = (volunteerSums[r.devoteeId] || 0) + hrs;
                    });
                    
                    return Object.entries(volunteerSums)
                      .map(([devoteeId, hours]) => ({ devoteeId: parseInt(devoteeId), hours }))
                      .sort((a, b) => b.hours - a.hours)
                      .slice(0, 6)
                      .map(({ devoteeId, hours }) => {
                        const name = getDevoteeName(devoteeId);
                        const initials = getDevoteeInitials(devoteeId);
                        return (
                          <div
                            key={devoteeId}
                            onClick={() => navigate(`/devotees/${devoteeId}`)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-left transition-colors cursor-pointer"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-700 font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate text-foreground">{name}</div>
                              <div className="text-[10px] text-muted-foreground">Active Volunteer</div>
                            </div>
                            <Badge variant="secondary" className="text-xs">{hours}h</Badge>
                          </div>
                        );
                      });
                  })()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRecord ? "Edit Volunteering Record" : "Log Volunteer Activity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Devotee *</Label>
                <Select required value={formData.devoteeId} onValueChange={v => setFormData({...formData, devoteeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select volunteer" /></SelectTrigger>
                  <SelectContent>
                    {devotees.map((d: Devotee) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.firstName} {d.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Activity Type *</Label>
                <Select required value={formData.activityType} onValueChange={v => setFormData({...formData, activityType: v})}>
                  <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hours Committed</Label>
                <Input type="number" min="0" step="0.5" value={formData.hoursCommitted} onChange={e => setFormData({...formData, hoursCommitted: e.target.value})} placeholder="4" />
              </div>
              <div className="space-y-1.5">
                <Label>Hours Completed</Label>
                <Input type="number" min="0" step="0.5" value={formData.hoursCompleted} onChange={e => setFormData({...formData, hoursCompleted: e.target.value})} placeholder="4" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Temple Hall, Main Mandap" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the volunteer work done..." rows={2} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Skills Used</Label>
                <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. Cooking, Decoration, Management" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditRecord(null); }}>Cancel</Button>
              <Button type="submit" disabled={!formData.devoteeId || !formData.activityType || createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-primary to-secondary">
                {editRecord ? "Save Changes" : "Log Activity"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
