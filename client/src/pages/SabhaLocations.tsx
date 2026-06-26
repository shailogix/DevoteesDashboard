import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, MapPin, CalendarDays, Landmark, Phone, Mail, Navigation, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { SabhaLocation, Event, Mandal } from "@shared/schema";

const getMockPincode = (id: number, city: string | null) => {
  if (!city) return "380001";
  const c = city.toLowerCase();
  if (c.includes("ahmedabad")) return "380009";
  if (c.includes("mumbai")) return "400001";
  if (c.includes("delhi")) return "110001";
  if (c.includes("bangalore") || c.includes("bengaluru")) return "560001";
  if (c.includes("pune")) return "411001";
  return `3800${(id % 90) + 10}`;
};

const getMockCoordinates = (id: number) => {
  const baseLat = 22.3072;
  const baseLng = 72.1800;
  return {
    lat: (baseLat + (id % 7) * 0.15 - 0.5).toFixed(4),
    lng: (baseLng + (id % 5) * 0.15 - 0.3).toFixed(4),
    x: 80 + (id % 7) * 45,
    y: 70 + (id % 5) * 35,
  };
};

export default function SabhaLocations() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");
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

  const filtered = locations.filter((l: SabhaLocation) => {
    const pin = getMockPincode(l.id, l.city);
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPin = !pincodeSearch || pin.includes(pincodeSearch);
    return matchesSearch && matchesPin;
  });

  const getLocationEvents = (locationName: string) => events.filter((e: Event) => e.location?.toLowerCase().includes(locationName.toLowerCase()));
  const getLocationMandal = (city: string | null) => mandals.find((m: Mandal) => m.name.toLowerCase().includes(city?.toLowerCase() || ""));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-transparent">
      <Header title="Sabha & Mandal Locator" subtitle="Find local weekly congregation centers, leaders, and events" />

      {/* Premium Searching Dashboard */}
      <Card className="mb-6 border-amber-200/50 shadow-sm bg-white/70 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by center name, city, state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 focus-visible:ring-amber-500"
                data-testid="input-search-locations"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by Pincode..."
                value={pincodeSearch}
                onChange={(e) => setPincodeSearch(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              {isAdmin && (
                <Button onClick={openAdd} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 w-full md:w-auto" data-testid="button-add-location">
                  <Plus className="w-4 h-4 mr-2" /> Add Location
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List of centers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Satsang Centers ({filtered.length})</h3>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-12 bg-white/30 rounded-xl border border-dashed border-amber-200">No centers found</div>
            )}
            {filtered.map((location: SabhaLocation) => {
              const locEvents = getLocationEvents(location.name);
              const mandal = getLocationMandal(location.city);
              const pin = getMockPincode(location.id, location.city);
              const coords = getMockCoordinates(location.id);
              return (
                <Card
                  key={location.id}
                  data-testid={`card-location-${location.id}`}
                  className="cursor-pointer hover:border-amber-300 hover:shadow-md transition-all duration-300 bg-white/80 border-amber-100"
                  onClick={() => setViewLocation(location)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-amber-900">{location.name}</CardTitle>
                        <CardDescription className="text-xs">Pincode: {pin}</CardDescription>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-amber-100/50 text-amber-700" onClick={() => openEdit(location)} data-testid={`button-edit-location-${location.id}`}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-50 text-red-600" data-testid={`button-delete-location-${location.id}`}>
                               <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Location?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will delete the location profile from the portal.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(location.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {location.address && <p className="text-sm text-muted-foreground line-clamp-1">{location.address}</p>}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{location.city}{location.city && location.state ? ", " : ""}{location.state}</span>
                    </div>
                    {mandal && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Landmark className="w-3.5 h-3.5 text-orange-600" />
                        <span>Mandal: {mandal.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-50">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {locEvents.length} events
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Navigation className="w-3 h-3" />
                        {coords.lat}, {coords.lng}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Vector Map Visualizer */}
        <div className="lg:col-span-7">
          <Card className="border-amber-200/50 shadow-sm bg-white/70 backdrop-blur-md h-full min-h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-orange-600 animate-pulse" />
                Mandal Locator Map Index
              </CardTitle>
              <CardDescription>Styled interactive digital map index. Click on nodes to view mandal congregations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-4 relative bg-slate-900/5 rounded-xl border border-amber-100/50 m-4">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 rounded-xl" />
              
              {/* Stylized region borders inside SVG */}
              <svg className="w-full h-full min-h-[380px] max-h-[420px] relative z-10" viewBox="0 0 450 320" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                {/* Simulated geographic paths */}
                <path d="M50 150 C 100 80, 200 40, 300 90 C 350 110, 420 180, 380 250 C 350 290, 200 310, 100 280 Z" fill="rgba(245, 158, 11, 0.03)" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M120 180 C 180 120, 280 120, 330 190 C 300 240, 210 260, 140 230 Z" fill="rgba(249, 115, 22, 0.02)" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1.5" />
                
                {/* Grid coordinates labels */}
                <text x="20" y="30" fill="#94a3b8" fontSize="8" fontFamily="monospace">GRID REGION: WEST-CENTRAL</text>
                
                {/* Draw locations */}
                {filtered.map((location: SabhaLocation) => {
                  const coords = getMockCoordinates(location.id);
                  const isSelected = viewLocation?.id === location.id;
                  return (
                    <g key={location.id} className="cursor-pointer group" onClick={() => setViewLocation(location)}>
                      {/* Outer pulse when selected or hovered */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "18" : "12"}
                        fill="url(#glow)"
                        className={isSelected ? "animate-pulse" : "opacity-0 group-hover:opacity-100 transition-opacity"}
                      />
                      
                      {/* Pulse ring */}
                      {isSelected && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="14"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                          className="animate-ping"
                          style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                        />
                      )}

                      {/* Main Node */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="6"
                        fill={isSelected ? "#ea580c" : "#f59e0b"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-colors duration-200 shadow-sm"
                      />
                      
                      {/* Center dot */}
                      <circle cx={coords.x} cy={coords.y} r="2" fill="#ffffff" />
                      
                      {/* Floating tooltip/text */}
                      <text
                        x={coords.x}
                        y={coords.y - 12}
                        textAnchor="middle"
                        fill={isSelected ? "#ea580c" : "#64748b"}
                        fontSize="9"
                        fontWeight={isSelected ? "bold" : "medium"}
                        className="bg-white/90 shadow px-1 rounded pointer-events-none transition-all"
                      >
                        {location.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Legend overlay */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur border border-amber-100 rounded-lg p-2.5 z-20 text-xs space-y-1.5 shadow-sm">
                <div className="font-semibold text-amber-900 mb-0.5">Map Guide</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block border border-white" />
                  <span>Sabha Center</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block border border-white" />
                  <span>Selected Node</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-950 font-bold">{editLocation ? "Edit Sabha Location" : "Add New Sabha Location"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-amber-900 font-medium">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-amber-200 focus-visible:ring-amber-500"
                placeholder="e.g. Swaminarayan Mandir, Satellite"
                data-testid="input-location-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-amber-900 font-medium">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-amber-200 focus-visible:ring-amber-500"
                placeholder="e.g. 102, Shanti Kunj Apartments"
                data-testid="input-location-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-amber-900 font-medium">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-amber-200 focus-visible:ring-amber-500"
                  placeholder="e.g. Ahmedabad"
                  data-testid="input-location-city"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-amber-900 font-medium">State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="border-amber-200 focus-visible:ring-amber-500"
                  placeholder="e.g. Gujarat"
                  data-testid="input-location-state"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                {editLocation ? "Update" : "Add"} Location
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="border-amber-200 hover:bg-amber-50 text-amber-800">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog with Mock Mandal Leader and Coordinates */}
      <Dialog open={!!viewLocation} onOpenChange={() => setViewLocation(null)}>
        <DialogContent className="sm:max-w-lg border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-950 font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              {viewLocation?.name}
            </DialogTitle>
          </DialogHeader>
          {viewLocation && (
            <div className="space-y-5 pt-2">
              {/* Address details */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-2 text-sm text-amber-950">
                <div className="font-semibold text-amber-900">Location Address</div>
                <p className="leading-relaxed">{viewLocation.address || "No address provided"}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-800 font-medium pt-1">
                  <span>City: {viewLocation.city || "N/A"}</span>
                  <span>•</span>
                  <span>State: {viewLocation.state || "N/A"}</span>
                  <span>•</span>
                  <span>Pincode: {getMockPincode(viewLocation.id, viewLocation.city)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-orange-700 font-bold pt-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Coordinates: Lat {getMockCoordinates(viewLocation.id).lat}° N, Lng {getMockCoordinates(viewLocation.id).lng}° E</span>
                </div>
              </div>

              {/* Mandal Connection */}
              {getLocationMandal(viewLocation.city) && (
                <div className="flex items-center gap-2 text-sm text-slate-800">
                  <Landmark className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">Associated Mandal:</span>
                  <span className="text-amber-900 font-medium">{getLocationMandal(viewLocation.city)?.name}</span>
                </div>
              )}

              {/* Mandal Leader Contact Card */}
              <Card className="border-amber-200 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent overflow-hidden shadow-sm">
                <CardHeader className="py-3 px-4 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-b border-amber-200/50">
                  <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-orange-600" />
                    Designated Mandal Leader
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-950 text-base">Pujya Kirtan Das</div>
                      <div className="text-xs text-amber-800 font-medium">Head Spiritual Coordinator</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">Online</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1.5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span className="truncate">kirtandas@madhavmandir.org</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none font-semibold text-xs h-8">
                      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Message
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 border-amber-200 text-amber-900 hover:bg-amber-100/50 font-semibold text-xs h-8">
                      <a href="mailto:kirtandas@madhavmandir.org">
                        <Mail className="w-3.5 h-3.5 mr-1.5" /> Send Email
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <div>
                <h4 className="text-sm font-semibold text-amber-950 mb-2.5 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-amber-600" />
                  Upcoming Events at Center ({getLocationEvents(viewLocation.name).length})
                </h4>
                {getLocationEvents(viewLocation.name).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-3 text-center bg-muted/40 rounded-lg">No scheduled events at this location currently.</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {getLocationEvents(viewLocation.name).map((e: Event) => (
                      <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-white shadow-sm hover:border-amber-200 transition-colors">
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">{e.title}</span>
                          {e.description && <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{e.description}</span>}
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-100/50 shrink-0">
                          {e.startDate ? new Date(e.startDate).toLocaleDateString() : "No date"}
                        </span>
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
