import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Users, MapPin, Phone, Mail, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Family, Devotee } from "@shared/schema";

export default function Families() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editFamily, setEditFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({
    familyName: "", headOfFamily: "", address: "", city: "", state: "",
    pincode: "", country: "India", phone: "", email: "", totalMembers: "", emergencyContact: "", notes: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: families = [], isLoading } = useQuery<Family[]>({ queryKey: ["/api/families"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/attendance"] });

  const activeFamiliesList = useMemo(() => {
    return [...families]
      .map((f: Family) => {
        const fMembers = devotees.filter((d: Devotee) => d.familyId === f.id);
        const fAttendance = fMembers.reduce((sum: number, d: Devotee) => {
          return sum + attendance.filter((a: any) => a.devoteeId === d.id).length;
        }, 0);
        return { ...f, memberCount: fMembers.length, attendanceCount: fAttendance };
      })
      .sort((a, b) => b.attendanceCount - a.attendanceCount)
      .slice(0, 3);
  }, [families, devotees, attendance]);

  const getDevoteeName = (id: number | null | undefined) => {
    if (!id) return "Not assigned";
    const d = devotees.find((dv: Devotee) => dv.id === id);
    return d ? `${d.firstName} ${d.lastName}` : `Devotee #${id}`;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/families", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      toast({ title: "Success", description: "Family added successfully" });
      setIsFormOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add family", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/families/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      toast({ title: "Success", description: "Family updated successfully" });
      setIsFormOpen(false);
      setEditFamily(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update family", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/families/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      toast({ title: "Success", description: "Family deleted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete family", variant: "destructive" }),
  });

  const filteredFamilies = families.filter((family: Family) =>
    family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDevoteeName(family.headOfFamily as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setEditFamily(null);
    setFormData({ familyName: "", headOfFamily: "", address: "", city: "", state: "", pincode: "", country: "India", phone: "", email: "", totalMembers: "", emergencyContact: "", notes: "" });
    setIsFormOpen(true);
  };

  const openEdit = (family: Family) => {
    setEditFamily(family);
    setFormData({
      familyName: family.familyName,
      headOfFamily: String(family.headOfFamily || ""),
      address: family.address || "",
      city: family.city || "",
      state: family.state || "",
      pincode: family.pincode || "",
      country: family.country || "India",
      phone: family.phone || "",
      email: family.email || "",
      totalMembers: String(family.totalMembers || ""),
      emergencyContact: family.emergencyContact || "",
      notes: family.notes || ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      headOfFamily: formData.headOfFamily ? parseInt(formData.headOfFamily) : null,
      totalMembers: formData.totalMembers ? parseInt(formData.totalMembers) : null,
    };
    if (editFamily) {
      updateMutation.mutate({ id: editFamily.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading families..." /></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Families" subtitle="Manage family information and relationships" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Featured / Active Families */}
        {activeFamiliesList.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Most Active Families</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeFamiliesList.map((f: any) => (
                <Card 
                  key={f.id} 
                  className="cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all bg-gradient-to-br from-amber-50/20 to-white dark:to-background border-border/60"
                  onClick={() => navigate(`/families/${f.id}`)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-base font-bold text-primary">
                        {f.familyName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-foreground">{f.familyName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.memberCount} members registered</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100/60 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 font-semibold">
                        {f.attendanceCount} Attendances
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Family Directory ({filteredFamilies.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search families..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-56" />
                </div>
                <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" /> Add Family
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFamilies.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No families found</h3>
                <p className="text-muted-foreground mb-4">{searchTerm ? "No families match your search." : "Add your first family."}</p>
                <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add First Family</Button>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Family Name</TableHead>
                      <TableHead>Head of Family</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilies.map((family: Family) => (
                      <TableRow key={family.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/families/${family.id}`)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                              {family.familyName[0]}
                            </div>
                            <span className="text-primary hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/families/${family.id}`); }}>{family.familyName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            {family.headOfFamily ? (
                              <span className="text-sm text-primary hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/devotees/${family.headOfFamily}`); }}>
                                {getDevoteeName(family.headOfFamily as any)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">{family.totalMembers || 0} members</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{[family.city, family.state].filter(Boolean).join(", ") || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {family.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{family.phone}</div>}
                            {family.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{family.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={family.isActive ? "default" : "secondary"}>{family.isActive ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/families/${family.id}`); }} title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(family); }} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Delete" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Family</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete "{family.familyName}"? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(family.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editFamily ? "Edit Family" : "Add New Family"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Family Name *</Label>
                <Input required value={formData.familyName} onChange={e => setFormData({...formData, familyName: e.target.value})} placeholder="e.g. Sharma Family" />
              </div>
              <div className="space-y-1.5">
                <Label>Head of Family</Label>
                <Select value={formData.headOfFamily} onValueChange={v => setFormData({...formData, headOfFamily: v})}>
                  <SelectTrigger><SelectValue placeholder="Select head of family" /></SelectTrigger>
                  <SelectContent>
                    {devotees.map((d: Devotee) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.firstName} {d.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Total Members</Label>
                <Input type="number" min="1" value={formData.totalMembers} onChange={e => setFormData({...formData, totalMembers: e.target.value})} placeholder="4" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="family@email.com" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street address" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ahmedabad" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Gujarat" />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} placeholder="380009" />
              </div>
              <div className="space-y-1.5">
                <Label>Emergency Contact</Label>
                <Input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} placeholder="Contact name" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional information about this family..." rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditFamily(null); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-primary to-secondary">
                {editFamily ? "Save Changes" : "Add Family"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
