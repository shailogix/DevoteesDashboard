import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock, Users, Archive, ChevronRight, Check, Share2, CalendarPlus } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200/50",
  satsang: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50",
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50",
  meeting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200/50",
};

// Gorgeous Unsplash images matching event categories
const EVENT_IMAGES: Record<string, string> = {
  festival: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&q=80", // sacred lights/festivity
  satsang: "https://images.unsplash.com/photo-1609137144814-7e045bc9050d?w=600&q=80", // lotus / spiritual flower
  workshop: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80", // group learning/study
  meeting: "https://images.unsplash.com/photo-1521737711867-e3b90473bd58?w=600&q=80", // community discussion
  fallback: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80", // mandir sunset entrance
};

function daysUntil(date: string | Date) {
  const d = new Date(date);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 3600 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `In ${diff} days`;
}

export function UpcomingEvents() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: myRsvps = [] } = useQuery<any[]>({
    queryKey: ["/api/events/rsvps"],
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: number) => apiRequest("POST", `/api/events/${eventId}/rsvp`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/rsvps"] });
      toast({
        title: data.status === "registered" ? "Successfully Registered!" : "RSVP Cancelled",
        description: data.status === "registered" ? "You are now registered for this event." : "Your RSVP has been removed.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Registration Failed",
        description: err.message || "Failed to update RSVP status.",
        variant: "destructive"
      });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/events/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event archived successfully" });
    },
  });

  const handleShare = (event: Event) => {
    const text = `Join us for "${event.title}" on ${new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${event.startTime || 'TBD'}. Location: ${event.location || 'TBD'}.`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied details to clipboard",
      description: "Event details are copied. Ready to share!",
    });
  };

  const handleAddToCalendar = (event: Event) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 7200000); // default 2 hours
    const formattedStart = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const formattedEnd = end.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      `LOCATION:${event.location || ''}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");
    
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Saved Calendar Event",
      description: "Calendar download completed.",
    });
  };

  const upcomingEvents = events
    .filter(e => !e.isArchived && new Date(e.startDate) >= new Date(Date.now() - 86400000))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3); // show top 3 beautiful cards

  if (upcomingEvents.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-amber-50/20 to-white dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No upcoming events scheduled</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate("/events")}>
              Create Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
          <CalendarDays className="w-5 h-5 text-primary animate-pulse" />
          Spiritual Events & Celebrations
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="text-xs text-muted-foreground hover:text-primary">
          View All Events <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upcomingEvents.map(event => {
          const isPast = new Date(event.startDate) < new Date();
          const days = daysUntil(event.startDate);
          const isRegistered = myRsvps.some((r: any) => r.eventId === event.id);
          const bgImg = event.imageUrl || EVENT_IMAGES[event.eventType] || EVENT_IMAGES.fallback;

          return (
            <Card key={event.id} className="overflow-hidden border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-elevation-3 transition-all duration-300 flex flex-col group h-full rounded-3xl">
              {/* Event Image Banner */}
              <div className="h-40 w-full relative overflow-hidden bg-muted">
                <img 
                  src={bgImg} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Event Type Badge — theme aware M3 Chips */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={
                      event.eventType === "festival" ? "warning" :
                      event.eventType === "satsang" ? "tonal" :
                      event.eventType === "workshop" ? "info" :
                      event.eventType === "meeting" ? "success" : "default"
                    }
                    className="capitalize border-0 font-bold"
                  >
                    {event.eventType}
                  </Badge>
                </div>
                
                {/* Days Until overlay */}
                <div className={`absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full text-white shadow-elevation-1 transition-all ${
                  days === "Today" ? "bg-red-600 animate-pulse" :
                  days === "Tomorrow" ? "bg-orange-500" :
                  "bg-amber-500"
                }`}>
                  {days}
                </div>

                {/* Bottom title overlay for compact text space */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base truncate drop-shadow-md" title={event.title}>{event.title}</h3>
                </div>
              </div>

              {/* Event Body */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2" title={event.description}>
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {event.startTime ? ` · ${event.startTime}` : ""}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                        <span className="truncate" title={event.location}>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Options Footer */}
                <div className="pt-3 border-t border-dashed flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => handleShare(event)}
                      title="Share Event"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => handleAddToCalendar(event)}
                      title="Add to Calendar"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPast && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/5"
                        onClick={() => archiveMutation.mutate(event.id)}
                        disabled={archiveMutation.isPending}
                      >
                        <Archive className="w-3.5 h-3.5 mr-1" /> Archive
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => rsvpMutation.mutate(event.id)}
                      disabled={rsvpMutation.isPending}
                      className={`h-8 text-xs font-semibold px-3 transition-all ${
                        isRegistered 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-gradient-to-r from-primary to-secondary text-white"
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 animate-bounce" /> Registered
                        </>
                      ) : (
                        "RSVP / Attend"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
