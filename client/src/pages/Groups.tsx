import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Users2, Users, MapPin, Calendar, MessageSquare, Send, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Group, GroupEntry, Devotee } from "@shared/schema";

export default function Groups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [viewGroup, setViewGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ groupName: "", description: "", groupType: "satsang", capacity: "", location: "", meetingSchedule: "" });
  const [bulkMessageGroup, setBulkMessageGroup] = useState<Group | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  
  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: entries = [] } = useQuery<GroupEntry[]>({ queryKey: ["/api/group-entries"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });

  const analyticsData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    groups.forEach(g => {
      const type = g.groupType || "other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const typeDistribution = Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    const groupCapacities = groups.slice(0, 5).map(g => {
      const groupEntries = entries.filter(e => e.groupId === g.id);
      return {
        name: g.groupName.slice(0, 12),
        members: groupEntries.length,
        capacity: g.capacity || 20
      };
    });

    const totalCapacity = groups.reduce((s, g) => s + (g.capacity || 0), 0);
    const fillRate = totalCapacity ? Math.round((entries.length / totalCapacity) * 100) : 0;

    return { typeDistribution, groupCapacities, fillRate };
  }, [groups, entries]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Success", description: "Group added successfully" });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to add group", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/groups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Success", description: "Group updated successfully" });
      setIsFormOpen(false);
      setEditGroup(null);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to update group", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Success", description: "Group deleted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete group", variant: "destructive" }),
  });

  const resetForm = () => setFormData({ groupName: "", description: "", groupType: "satsang", capacity: "", location: "", meetingSchedule: "" });
  const openAdd = () => { resetForm(); setEditGroup(null); setIsFormOpen(true); };
  const openEdit = (g: Group) => { setFormData({ groupName: g.groupName, description: g.description || "", groupType: g.groupType, capacity: g.capacity?.toString() || "", location: g.location || "", meetingSchedule: g.meetingSchedule || "" }); setEditGroup(g); setIsFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, capacity: formData.capacity ? Number(formData.capacity) : null };
    if (editGroup) updateMutation.mutate({ id: editGroup.id, data: payload });
    else createMutation.mutate(payload);
  };

  const filtered = groups.filter((g: Group) =>
    g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.groupType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupEntries = (groupId: number) => entries.filter((e: GroupEntry) => e.groupId === groupId);
  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case "satsang": return "bg-blue-500/10 text-blue-600";
      case "study": return "bg-purple-500/10 text-purple-600";
      case "service": return "bg-green-500/10 text-green-600";
      case "youth": return "bg-orange-500/10 text-orange-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-auto p-6">
      <Header title="Groups" subtitle="Manage spiritual groups and communities" />

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
        <Card className="bg-gradient-to-br from-primary/10 to-white dark:to-background border-primary/20">
          <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Groups</CardTitle></CardHeader>
          <CardContent className="py-0 pb-3"><p className="text-3xl font-extrabold">{groups.length}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-background border-blue-100">
          <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Members</CardTitle></CardHeader>
          <CardContent className="py-0 pb-3"><p className="text-3xl font-extrabold">{entries.length}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/10 dark:to-background border-amber-100">
          <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Capacity Fill Rate</CardTitle></CardHeader>
          <CardContent className="py-0 pb-3"><p className="text-3xl font-extrabold">{analyticsData.fillRate}%</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Group Type Distribution</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center h-[200px]">
            {analyticsData.typeDistribution.length === 0 ? (
              <div className="text-muted-foreground text-xs py-10">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analyticsData.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Group Size vs Capacity</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            {analyticsData.groupCapacities.length === 0 ? (
              <div className="text-muted-foreground text-xs py-10">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.groupCapacities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={10} stroke="currentColor" />
                  <YAxis fontSize={10} stroke="currentColor" />
                  <Tooltip />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Active Members" />
                  <Bar dataKey="capacity" fill="rgba(192, 192, 192, 0.4)" radius={[4, 4, 0, 0]} name="Max Capacity" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search groups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" data-testid="input-search-groups" />
        </div>
        <Button onClick={openAdd} data-testid="button-add-group"><Plus className="w-4 h-4 mr-2" />Add Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">No groups found</div>
        )}
        {filtered.map((group: Group) => {
          const groupEntries = getGroupEntries(group.id);
          const memberCount = groupEntries.length;
          return (
            <Card key={group.id} data-testid={`card-group-${group.id}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{group.groupName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getGroupTypeColor(group.groupType)}>{group.groupType}</Badge>
                      <Badge variant="outline"><Users className="w-3 h-3 mr-1" />{memberCount}/{group.capacity || "∞"}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewGroup(group)} data-testid={`button-view-group-${group.id}`}><MessageSquare className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(group)} data-testid={`button-edit-group-${group.id}`}><Edit className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" data-testid={`button-delete-group-${group.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Group?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(group.id)} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {group.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{group.location}</span>}
                  {group.meetingSchedule && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{group.meetingSchedule}</span>}
                </div>

                <div className="pt-3 border-t border-dashed flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200/50 flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = (group as any).whatsappLink;
                      if (link) window.open(link, '_blank');
                      else window.open(`https://wa.me/?text=Join+${encodeURIComponent(group.groupName)}`, '_blank');
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200/50 flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = (group as any).telegramLink;
                      if (link) window.open(link, '_blank');
                      else window.open('https://t.me/', '_blank');
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Telegram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBulkMessageGroup(group);
                      setBulkMessage("");
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editGroup ? "Edit Group" : "Add Group"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.groupName} onChange={(e) => setFormData({ ...formData, groupName: e.target.value })} required data-testid="input-group-name" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} data-testid="input-group-description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Type *</Label>
                <Select value={formData.groupType} onValueChange={(v) => setFormData({ ...formData, groupType: v })}>
                  <SelectTrigger data-testid="select-group-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satsang">Satsang</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} data-testid="input-group-capacity" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} data-testid="input-group-location" /></div>
              <div className="space-y-2"><Label>Meeting Schedule</Label><Input value={formData.meetingSchedule} onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })} placeholder="e.g. Sundays 10AM" data-testid="input-group-schedule" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>{editGroup ? "Update" : "Add"} Group</Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewGroup} onOpenChange={() => setViewGroup(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewGroup?.groupName}</DialogTitle></DialogHeader>
          {viewGroup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getGroupTypeColor(viewGroup.groupType)}>{viewGroup.groupType}</Badge>
                <Badge variant="outline"><Users className="w-3 h-3 mr-1" />{getGroupEntries(viewGroup.id).length} members</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{viewGroup.description || "No description"}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewGroup.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{viewGroup.location}</div>}
                {viewGroup.meetingSchedule && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{viewGroup.meetingSchedule}</div>}
                {viewGroup.capacity && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" />Capacity: {viewGroup.capacity}</div>}
              </div>
              {getGroupEntries(viewGroup.id).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Members</h4>
                  <div className="space-y-1">
                    {getGroupEntries(viewGroup.id).map((entry: GroupEntry) => (
                      <div key={entry.id} className="text-sm px-2 py-1 rounded bg-muted flex items-center justify-between">
                        <span>Member #{entry.id}</span>
                        <span className="text-xs text-muted-foreground">{entry.uniqueMemberId || "No ID"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Bulk Message Dialog */}
      <Dialog open={!!bulkMessageGroup} onOpenChange={() => setBulkMessageGroup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Bulk Message — {bulkMessageGroup?.groupName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compose a message to send to all members of this group.
            </p>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Type your message here..."
                value={bulkMessage}
                onChange={e => setBulkMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkMessageGroup(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!bulkMessage.trim()) return;
                  const encoded = encodeURIComponent(bulkMessage);
                  window.open(`https://wa.me/?text=${encoded}`, '_blank');
                  toast({ title: "Message Ready", description: "WhatsApp opened with your message. Send it to the group." });
                  setBulkMessageGroup(null);
                }}
                disabled={!bulkMessage.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" /> Send via WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
