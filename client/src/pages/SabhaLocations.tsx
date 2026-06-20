import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, MapPin, CalendarDays, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SabhaLocation, Event, Mandal } from "@shared/schema";

export default function SabhaLocations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<SabhaLocation | null>(null);
  const [viewLocation, setViewLocation] = useState<SabhaLocation | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", city: "", state: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery<SabhaLocation[]>({ queryKey: ["/api/sabha-locations"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: mandals = [] } = useQuery<Mandal[]>({ queryKey: ["/api/mandals"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/sabha-locations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sabha-locations"] });
      toast({ title: "Success", description: "Location added successfully" });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to add location", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/sabha-locations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sabha-locations"] });
      toast({ title: "Success", description: "Location updated successfully" });
      setIsFormOpen(false);
      setEditLocation(null);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to update location", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/sabha-locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sabha-locations"] });
      toast({ title: "Success", description: "Location deleted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete location", variant: "destructive" }),
  });

  const resetForm = () => setFormData({ name: "", address: "", city: "", state: "" });
  const openAdd = () => { resetForm(); setEditLocation(null); setIsFormOpen(true); };
  const openEdit = (l: SabhaLocation) => { setFormData({ name: l.name, address: l.address || "", city: l.city || "", state: l.state || "" }); setEditLocation(l); setIsFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLocation) updateMutation.mutate({ id: editLocation.id, data: formData });
    else createMutation.mutate(formData);
  };

  const filtered = locations.filter((l: SabhaLocation) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLocationEvents = (locationName: string) => events.filter((e: Event) => e.location?.toLowerCase().includes(locationName.toLowerCase()));
  const getLocationMandal = (city: string | null) => mandals.find((m: Mandal) => m.name.toLowerCase().includes(city?.toLowerCase() || ""));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-auto p-6">
      <Header title="Sabha Locations" subtitle="Manage satsang and event locations" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search locations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" data-testid="input-search-locations" />
        </div>
        <Button onClick={openAdd} data-testid="button-add-location"><Plus className="w-4 h-4 mr-2" />Add Location</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">No locations found</div>
        )}
        {filtered.map((location: SabhaLocation) => {
          const locEvents = getLocationEvents(location.name);
          const mandal = getLocationMandal(location.city);
          return (
            <Card key={location.id} data-testid={`card-location-${location.id}`} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewLocation(location)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{location.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(location); }} data-testid={`button-edit-location-${location.id}`}><Edit className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()} data-testid={`button-delete-location-${location.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Location?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(location.id)} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {location.address && <p className="text-sm text-muted-foreground">{location.address}</p>}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{location.city}{location.city && location.state ? ", " : ""}{location.state}</span>
                </div>
                {mandal && (
                  <div className="flex items-center gap-2 text-sm">
                    <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{mandal.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{locEvents.length} upcoming events</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editLocation ? "Edit Location" : "Add Location"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="input-location-name" /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} data-testid="input-location-address" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} data-testid="input-location-city" /></div>
              <div className="space-y-2"><Label>State</Label><Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} data-testid="input-location-state" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>{editLocation ? "Update" : "Add"} Location</Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewLocation} onOpenChange={() => setViewLocation(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewLocation?.name}</DialogTitle></DialogHeader>
          {viewLocation && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {viewLocation.address || "No address"}
                {viewLocation.city && <span>• {viewLocation.city}</span>}
                {viewLocation.state && <span>• {viewLocation.state}</span>}
              </div>
              {getLocationMandal(viewLocation.city) && (
                <div className="flex items-center gap-2 text-sm">
                  <Landmark className="w-4 h-4" />
                  <span>Mandal: {getLocationMandal(viewLocation.city)?.name}</span>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Upcoming Events ({getLocationEvents(viewLocation.name).length})</h4>
                {getLocationEvents(viewLocation.name).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events at this location</p>
                ) : (
                  <div className="space-y-2">
                    {getLocationEvents(viewLocation.name).map((e: Event) => (
                      <div key={e.id} className="flex items-center justify-between p-2 rounded bg-muted">
                        <span className="text-sm font-medium">{e.title}</span>
                        <span className="text-xs text-muted-foreground">{e.startDate ? new Date(e.startDate).toLocaleDateString() : "No date"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
