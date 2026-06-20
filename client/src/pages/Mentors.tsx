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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, GraduationCap, Users, Star, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Devotee } from "@shared/schema";

interface Mentor {
  id: number;
  devoteeId: number;
  specialization: string | null;
  experience: string | null;
  qualifications: string | null;
  availableHours: string | null;
  contactPreference: string | null;
  maxMentees: number | null;
  currentMentees: number | null;
  isActive: boolean;
  createdAt: string;
}

const SPECIALIZATIONS = [
  "Bhagavat Gita", "Vedanta Philosophy", "Bhakti Yoga", "Meditation",
  "Sanskrit", "Kirtan & Music", "Devotional Arts", "Youth Mentoring",
  "Family Counseling", "Spiritual Guidance", "Vedic Studies", "Ayurveda"
];

export default function Mentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMentor, setEditMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    devoteeId: "", specialization: "", experience: "", qualifications: "",
    availableHours: "", contactPreference: "any", maxMentees: "5", isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: mentors = [], isLoading } = useQuery<Mentor[]>({ queryKey: ["/api/mentors"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });

  const getDevoteeName = (id: number | null | undefined) => {
    if (!id) return "Unassigned";
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName} ${d.lastName}` : `Devotee #${id}`;
  };

  const getDevoteeInitials = (id: number | null | undefined) => {
    if (!id) return "?";
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName[0]}${d.lastName[0]}` : "?";
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/mentors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentors"] });
      toast({ title: "Success", description: "Mentor added successfully" });
      setIsFormOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add mentor", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/mentors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentors"] });
      toast({ title: "Success", description: "Mentor updated successfully" });
      setIsFormOpen(false);
      setEditMentor(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update mentor", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/mentors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentors"] });
      toast({ title: "Success", description: "Mentor removed successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove mentor", variant: "destructive" }),
  });

  const filteredMentors = mentors.filter((mentor: Mentor) => {
    const name = getDevoteeName(mentor.devoteeId).toLowerCase();
    const spec = (mentor.specialization || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || spec.includes(query);
  });

  const openAdd = () => {
    setEditMentor(null);
    setFormData({ devoteeId: "", specialization: "", experience: "", qualifications: "", availableHours: "", contactPreference: "any", maxMentees: "5", isActive: true });
    setIsFormOpen(true);
  };

  const openEdit = (mentor: Mentor) => {
    setEditMentor(mentor);
    setFormData({
      devoteeId: String(mentor.devoteeId),
      specialization: mentor.specialization || "",
      experience: mentor.experience || "",
      qualifications: mentor.qualifications || "",
      availableHours: mentor.availableHours || "",
      contactPreference: mentor.contactPreference || "any",
      maxMentees: String(mentor.maxMentees || 5),
      isActive: mentor.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      devoteeId: parseInt(formData.devoteeId),
      maxMentees: formData.maxMentees ? parseInt(formData.maxMentees) : 5,
    };
    if (editMentor) {
      updateMutation.mutate({ id: editMentor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const activeCount = mentors.filter((m: Mentor) => m.isActive).length;
  const totalMentees = mentors.reduce((sum: number, m: Mentor) => sum + (m.currentMentees || 0), 0);

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading mentors..." /></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Mentors" subtitle="Manage spiritual mentors and their mentee assignments" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{mentors.length}</p><p className="text-xs text-muted-foreground">Total Mentors</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Star className="w-8 h-8 text-yellow-500" /><div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{totalMentees}</p><p className="text-xs text-muted-foreground">Current Mentees</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{mentors.reduce((s: number, m: Mentor) => s + (m.maxMentees || 0), 0) - totalMentees}</p><p className="text-xs text-muted-foreground">Open Slots</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Mentor Directory ({filteredMentors.length})</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search mentors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-56" />
                </div>
                <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" /> Add Mentor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMentors.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                <p className="text-muted-foreground mb-4">{searchTerm ? "No mentors match your search." : "Add your first mentor."}</p>
                <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add First Mentor</Button>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Mentees</TableHead>
                      <TableHead>Available Hours</TableHead>
                      <TableHead>Preferred Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMentors.map((mentor: Mentor) => (
                      <TableRow key={mentor.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => {
                            if (mentor.devoteeId) navigate(`/devotees/${mentor.devoteeId}`);
                          }}>
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold text-primary">
                                {getDevoteeInitials(mentor.devoteeId)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm hover:text-primary transition-colors">{getDevoteeName(mentor.devoteeId)}</p>
                              <p className="text-xs text-muted-foreground">Mentor #{mentor.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {mentor.specialization ? (
                            <Badge variant="secondary" className="font-normal">{mentor.specialization}</Badge>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{mentor.experience || "Not specified"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{mentor.currentMentees || 0}</span>
                            <span className="text-muted-foreground text-xs">/ {mentor.maxMentees || 5}</span>
                          </div>
                          <div className="w-16 bg-muted rounded-full h-1 mt-1">
                            <div
                              className="bg-primary rounded-full h-1 transition-all"
                              style={{ width: `${Math.min(100, ((mentor.currentMentees || 0) / (mentor.maxMentees || 5)) * 100)}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell><span className="text-sm">{mentor.availableHours || "Flexible"}</span></TableCell>
                        <TableCell><span className="text-sm capitalize">{mentor.contactPreference || "Any"}</span></TableCell>
                        <TableCell>
                          <Badge variant={mentor.isActive ? "default" : "secondary"}>{mentor.isActive ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(mentor)} title="Edit"><Edit className="w-4 h-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Mentor</AlertDialogTitle>
                                  <AlertDialogDescription>Remove {getDevoteeName(mentor.devoteeId)} as a mentor? This cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(mentor.id)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
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
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMentor ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Devotee *</Label>
              <Select required value={formData.devoteeId} onValueChange={v => setFormData({...formData, devoteeId: v})}>
                <SelectTrigger><SelectValue placeholder="Select devotee to assign as mentor" /></SelectTrigger>
                <SelectContent>
                  {devotees.map((d: Devotee) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.firstName} {d.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Specialization</Label>
              <Select value={formData.specialization} onValueChange={v => setFormData({...formData, specialization: v})}>
                <SelectTrigger><SelectValue placeholder="Select area of specialization" /></SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Experience</Label>
              <Input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 10 years of teaching Gita" />
            </div>
            <div className="space-y-1.5">
              <Label>Qualifications</Label>
              <Textarea value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} placeholder="List qualifications, certifications, training..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Available Hours</Label>
                <Input value={formData.availableHours} onChange={e => setFormData({...formData, availableHours: e.target.value})} placeholder="e.g. Weekends 10am-12pm" />
              </div>
              <div className="space-y-1.5">
                <Label>Max Mentees</Label>
                <Input type="number" min="1" max="50" value={formData.maxMentees} onChange={e => setFormData({...formData, maxMentees: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contact Preference</Label>
              <Select value={formData.contactPreference} onValueChange={v => setFormData({...formData, contactPreference: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any method</SelectItem>
                  <SelectItem value="phone">Phone call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in-person">In-person only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={v => setFormData({...formData, isActive: v})} />
              <Label>Active mentor</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditMentor(null); }}>Cancel</Button>
              <Button type="submit" disabled={!formData.devoteeId || createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-primary to-secondary">
                {editMentor ? "Save Changes" : "Add Mentor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
