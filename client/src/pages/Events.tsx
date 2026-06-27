import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Plus, MapPin, Users, Clock, Edit, Trash2, Archive, ArchiveRestore, Image, Search, Eye, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

const EVENT_TYPES = ["satsang", "festival", "workshop", "meeting", "other"];
const TYPE_COLORS: Record<string, string> = {
  satsang: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  festival: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  meeting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

function EventFormDialog({ event, onClose }: { event?: Event | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    eventType: event?.eventType || "satsang",
    location: event?.location || "",
    startDate: event?.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "",
    endDate: event?.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "",
    startTime: event?.startTime || "",
    endTime: event?.endTime || "",
    maxParticipants: (event as any)?.maxParticipants?.toString() || "",
    imageUrl: (event as any)?.imageUrl || "",
    status: event?.status || "planned",
    registrationRequired: event?.registrationRequired || false,
    cost: event?.cost || "0",
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => event
      ? apiRequest("PUT", `/api/events/${event.id}`, data)
      : apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: event ? "Event updated" : "Event created" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save event", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : (form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString()),
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
      cost: form.cost || "0",
    };
    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Event Title *</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Janmashtami Mahotsav" />
        </div>
        <div>
          <Label>Event Type *</Label>
          <Select value={form.eventType} onValueChange={v => setForm(f => ({ ...f, eventType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Start Date *</Label>
          <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <div>
          <Label>Start Time</Label>
          <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
        </div>
        <div>
          <Label>End Time</Label>
          <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue / address" />
        </div>
        <div>
          <Label>Max Participants</Label>
          <Input type="number" min="1" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} placeholder="Unlimited" />
        </div>
        <div>
          <Label>Entry Fee (₹)</Label>
          <Input value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0 = free" />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.registrationRequired} onCheckedChange={v => setForm(f => ({ ...f, registrationRequired: v }))} id="reg" />
          <Label htmlFor="reg" className="cursor-pointer">Registration Required</Label>
        </div>
        <div className="col-span-2">
          <Label className="flex items-center gap-2">
            <Image className="w-4 h-4" /> Event Image URL
          </Label>
          <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
          {form.imageUrl && (
            <div className="mt-2 w-full h-36 rounded-lg overflow-hidden border border-border">
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
            </div>
          )}
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Event details, schedule, special instructions..." />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EventCard({
  event, onEdit, onDelete, onArchive, onUnarchive, onView
}: {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onView: () => void;
}) {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : start;
  const isArchived = !!(event as any).isArchived;
  const isUpcoming = !isArchived && start > now;
  const isOngoing = !isArchived && start <= now && end >= now;

  const statusBadge = isArchived
    ? <Badge variant="secondary">Archived</Badge>
    : isUpcoming ? <Badge className="bg-blue-100 text-blue-800 border-0">Upcoming</Badge>
    : isOngoing ? <Badge className="bg-green-100 text-green-800 border-0">Ongoing</Badge>
    : <Badge variant="secondary">Completed</Badge>;

  return (
    <Card className={`group hover:shadow-lg hover:border-primary/40 transition-all overflow-hidden ${isArchived ? "opacity-60" : ""}`}>
      {(event as any).imageUrl && (
        <div className="w-full h-44 overflow-hidden">
          <img
            src={(event as any).imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2 justify-between">
          <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
          {statusBadge}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs border-0 ${TYPE_COLORS[event.eventType] || TYPE_COLORS.other}`}>
            {event.eventType}
          </Badge>
          {event.registrationRequired && <Badge variant="outline" className="text-xs">Registration</Badge>}
          {event.cost && parseFloat(String(event.cost)) > 0 && (
            <Badge variant="outline" className="text-xs">₹{parseFloat(String(event.cost)).toLocaleString("en-IN")}</Badge>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {event.startTime ? ` · ${event.startTime}` : ""}
            {event.endTime ? ` – ${event.endTime}` : ""}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />{event.location}
            </div>
          )}
          {(event as any).maxParticipants && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />Max {(event as any).maxParticipants}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={onEdit}>
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={onView}>
            <Eye className="w-3 h-3 mr-1" /> View
          </Button>
          {isArchived ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onUnarchive}>
              <ArchiveRestore className="w-3 h-3 mr-1" /> Restore
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:border-orange-300" onClick={onArchive}>
              <Archive className="w-3 h-3 mr-1" /> Archive
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{event.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: events = [], isLoading, isError, error, refetch } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); toast({ title: "Event deleted" }); },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/events/${id}/archive`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); toast({ title: "Event archived" }); },
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/events/${id}/unarchive`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); toast({ title: "Event restored" }); },
  });

  const autoArchiveMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/events/auto-archive"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: `Auto-archived ${data?.archived || 0} past events` });
    },
  });

  const filteredEvents = events.filter(e => {
    const matchesSearch = !searchTerm ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || e.eventType === selectedType;
    const matchesArchived = showArchived ? !!(e as any).isArchived : !(e as any).isArchived;
    return matchesSearch && matchesType && matchesArchived;
  });

  const now = new Date();
  const upcomingCount = events.filter(e => !(e as any).isArchived && new Date(e.startDate) > now).length;
  const archivedCount = events.filter(e => !!(e as any).isArchived).length;
  const todayCount = events.filter(e => {
    const d = new Date(e.startDate); return d.toDateString() === now.toDateString();
  }).length;

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading events..." />
    </div>
  );

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full border-destructive/20 shadow-elevation-2">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Error Loading Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "An unexpected error occurred while loading events."}
            </p>
            <Button onClick={() => refetch()} className="w-full flex items-center justify-center gap-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Events Management" subtitle="Create, schedule, and archive devotional events" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: events.length, color: "text-primary" },
            { label: "Upcoming", value: upcomingCount, color: "text-blue-600" },
            { label: "Today", value: todayCount, color: "text-red-500" },
            { label: "Archived", value: archivedCount, color: "text-orange-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="archived-toggle" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="archived-toggle" className="text-sm cursor-pointer whitespace-nowrap">
              {showArchived ? "Showing Archived" : "Show Archived"}
            </Label>
          </div>
          <Button
            variant="outline"
            onClick={() => autoArchiveMutation.mutate()}
            disabled={autoArchiveMutation.isPending}
            className="text-orange-600 border-orange-300 hover:bg-orange-50 whitespace-nowrap"
          >
            <Archive className="w-4 h-4 mr-2" />
            Auto-Archive Past
          </Button>
          <Dialog open={isFormOpen} onOpenChange={v => { setIsFormOpen(v); if (!v) setEditingEvent(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              </DialogHeader>
              <EventFormDialog
                event={editingEvent}
                onClose={() => { setIsFormOpen(false); setEditingEvent(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {showArchived ? "No archived events" : "No events found"}
            </p>
            <p className="text-sm mt-1">
              {showArchived ? "Archive past events to see them here" : "Create your first event to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => { setEditingEvent(event); setIsFormOpen(true); }}
                onDelete={() => deleteMutation.mutate(event.id)}
                onArchive={() => archiveMutation.mutate(event.id)}
                onUnarchive={() => unarchiveMutation.mutate(event.id)}
                onView={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
