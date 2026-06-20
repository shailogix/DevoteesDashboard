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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Eye, Landmark, Users, MapPin, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Mandal, Devotee, Event, SabhaLocation } from "@shared/schema";

export default function Mandals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMandal, setEditMandal] = useState<Mandal | null>(null);
  const [viewMandal, setViewMandal] = useState<Mandal | null>(null);
  const [formData, setFormData] = useState({ name: "", hindiName: "", code: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mandals = [], isLoading } = useQuery<Mandal[]>({ queryKey: ["/api/mandals"] });
  const { data: devotees = [] } = useQuery<Devotee[]>({ queryKey: ["/api/devotees"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: locations = [] } = useQuery<SabhaLocation[]>({ queryKey: ["/api/sabha-locations"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/mandals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mandals"] });
      toast({ title: "Success", description: "Mandal added successfully" });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to add mandal", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/mandals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mandals"] });
      toast({ title: "Success", description: "Mandal updated successfully" });
      setIsFormOpen(false);
      setEditMandal(null);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to update mandal", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/mandals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mandals"] });
      toast({ title: "Success", description: "Mandal deleted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete mandal", variant: "destructive" }),
  });

  const resetForm = () => setFormData({ name: "", hindiName: "", code: "", description: "" });

  const openAdd = () => { resetForm(); setEditMandal(null); setIsFormOpen(true); };
  const openEdit = (m: Mandal) => { setFormData({ name: m.name, hindiName: m.hindiName || "", code: m.code, description: m.description || "" }); setEditMandal(m); setIsFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMandal) updateMutation.mutate({ id: editMandal.id, data: formData });
    else createMutation.mutate(formData);
  };

  const filtered = mandals.filter((m: Mandal) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.hindiName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMandalDevotees = (mandalName: string) => devotees.filter((d: Devotee) => d.city?.toLowerCase().includes(mandalName.toLowerCase()));
  const getMandalEvents = (mandalName: string) => events.filter((e: Event) => e.location?.toLowerCase().includes(mandalName.toLowerCase()));
  const getMandalLocations = (mandalName: string) => locations.filter((l: SabhaLocation) => l.city?.toLowerCase().includes(mandalName.toLowerCase()));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-auto p-6">
      <Header title="Mandals" subtitle="Manage spiritual mandals and communities" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search mandals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" data-testid="input-search-mandals" />
        </div>
        <Button onClick={openAdd} data-testid="button-add-mandal"><Plus className="w-4 h-4 mr-2" />Add Mandal</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No mandals found</TableCell></TableRow>
              )}
              {filtered.map((mandal: Mandal) => {
                const memberCount = getMandalDevotees(mandal.name).length;
                return (
                  <TableRow key={mandal.id} data-testid={`row-mandal-${mandal.id}`}>
                    <TableCell>
                      <div className="font-medium">{mandal.name}</div>
                      {mandal.hindiName && <div className="text-xs text-muted-foreground">{mandal.hindiName}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{mandal.code}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{mandal.description || "—"}</TableCell>
                    <TableCell><Badge variant="secondary"><Users className="w-3 h-3 mr-1" />{memberCount}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewMandal(mandal)} data-testid={`button-view-mandal-${mandal.id}`}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(mandal)} data-testid={`button-edit-mandal-${mandal.id}`}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-mandal-${mandal.id}`}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Mandal?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(mandal.id)} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editMandal ? "Edit Mandal" : "Add Mandal"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="input-mandal-name" /></div>
            <div className="space-y-2"><Label>Hindi Name</Label><Input value={formData.hindiName} onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })} data-testid="input-mandal-hindi-name" /></div>
            <div className="space-y-2"><Label>Code *</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} maxLength={2} required data-testid="input-mandal-code" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} data-testid="input-mandal-description" /></div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>{editMandal ? "Update" : "Add"} Mandal</Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewMandal} onOpenChange={() => setViewMandal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewMandal?.name}</DialogTitle></DialogHeader>
          {viewMandal && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Badge variant="outline">{viewMandal.code}</Badge>{viewMandal.hindiName && <span className="text-sm text-muted-foreground">{viewMandal.hindiName}</span>}</div>
              <p className="text-sm text-muted-foreground">{viewMandal.description || "No description"}</p>
              <div className="grid grid-cols-2 gap-3">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Members</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{getMandalDevotees(viewMandal.name).length}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Events</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{getMandalEvents(viewMandal.name).length}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Locations</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{getMandalLocations(viewMandal.name).length}</p></CardContent></Card>
              </div>
              {getMandalDevotees(viewMandal.name).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Members</h4>
                  <div className="space-y-1">
                    {getMandalDevotees(viewMandal.name).map((d: Devotee) => (
                      <div key={d.id} className="text-sm px-2 py-1 rounded bg-muted">{d.firstName} {d.lastName}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
