import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock, Users, Archive, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  satsang: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  meeting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
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

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/events/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event archived successfully" });
    },
  });

  const upcomingEvents = events
    .filter(e => !e.isArchived && new Date(e.startDate) >= new Date(Date.now() - 86400000))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No upcoming events</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate("/events")}>
              Add Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="text-muted-foreground">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map(event => {
          const isPast = new Date(event.startDate) < new Date();
          const days = daysUntil(event.startDate);

          return (
            <div key={event.id} className="flex gap-4 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group">
              {/* Event Image / Icon */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <CalendarDays className="w-7 h-7 text-primary" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground break-words">{event.title}</h3>
                    <Badge className={`text-xs mt-1 ${EVENT_TYPE_COLORS[event.eventType] || "bg-muted text-muted-foreground"}`}>
                      {event.eventType}
                    </Badge>
                  </div>
                  <div className={`text-xs font-medium whitespace-nowrap px-2 py-1 rounded-full ${
                    days === "Today" ? "bg-red-100 text-red-700" :
                    days === "Tomorrow" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {days}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {event.startTime ? ` · ${event.startTime}` : ""}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 break-words" title={event.location}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {event.location}
                    </span>
                  )}
                  {event.maxParticipants && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Max {event.maxParticipants}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {isPast && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => archiveMutation.mutate(event.id)}
                    disabled={archiveMutation.isPending}
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
