import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import {
  ArrowLeft, CalendarDays, MapPin, Users, Clock, Activity,
  Heart, HandHeart, TrendingUp, AlertCircle
} from "lucide-react";
import type { Event } from "@shared/schema";

const TYPE_COLORS: Record<string, string> = {
  satsang: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  festival: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  meeting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

function statusColor(status: string) {
  switch (status) {
    case "planned": return "bg-blue-500 text-white";
    case "completed": return "bg-green-500 text-white";
    case "cancelled": return "bg-red-500 text-white";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function EventDetailPage() {
  const [match, params] = useRoute("/events/:id");
  const [, navigate] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState("details");

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    queryFn: () => fetch(`/api/events/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: attendance = [] } = useQuery<any[]>({
    queryKey: ["/api/events", id, "attendance"],
    queryFn: () => fetch(`/api/events/${id}/attendance`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: donations = [] } = useQuery<any[]>({
    queryKey: ["/api/events", id, "donations"],
    queryFn: () => fetch(`/api/events/${id}/donations`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: volunteering = [] } = useQuery<any[]>({
    queryKey: ["/api/events", id, "volunteering"],
    queryFn: () => fetch(`/api/events/${id}/volunteering`).then(r => r.json()),
    enabled: !!id,
  });

  if (eventLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate("/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const totalDonated = donations.reduce((s: number, d: any) => s + parseFloat(d.amount || "0"), 0);
  const totalVolHours = volunteering.reduce((s: number, v: any) => s + (v.hoursCompleted || v.hours || 0), 0);
  const presentCount = attendance.filter((a: any) => a.status === "present").length;
  const absentCount = attendance.filter((a: any) => a.status === "absent").length;

  const eventDate = new Date(event.startDate);
  const isPast = eventDate < new Date();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Event Details"
        subtitle={event.title}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/events")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>

        {/* Hero Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Event Image */}
              <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <CalendarDays className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={TYPE_COLORS[event.eventType] || TYPE_COLORS.other}>
                    {event.eventType}
                  </Badge>
                  <Badge className={statusColor(event.status)}>
                    {event.status}
                  </Badge>
                  {event.isArchived && <Badge variant="secondary">Archived</Badge>}
                </div>

                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-muted-foreground">{event.description || "No description provided."}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="text-sm font-medium">{eventDate.toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Time</div>
                      <div className="text-sm font-medium">{event.startTime || "—"} {event.endTime ? `- ${event.endTime}` : ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm font-medium">{event.location || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Capacity</div>
                      <div className="text-sm font-medium">{(event as any).maxParticipants || event.capacity || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                      <div className="text-sm font-medium">{event.cost === "0" || !event.cost ? "Free" : `₹${event.cost}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Registration</div>
                      <div className="text-sm font-medium">{event.registrationRequired ? "Required" : "Open"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{attendance.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Attendance Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">₹{totalDonated.toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground mt-1">Donations Collected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{totalVolHours}h</div>
              <div className="text-xs text-muted-foreground mt-1">Volunteering Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{presentCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Present</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attendance">Attendance ({attendance.length})</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Event Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Event Type</span><span className="text-sm font-medium capitalize">{event.eventType}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status</span><span className="text-sm font-medium capitalize">{event.status}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Created By</span><span className="text-sm font-medium">{event.createdBy || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Active</span><span className="text-sm font-medium">{event.isActive ? "Yes" : "No"}</span></div>
                  {event.registrationDeadline && (
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Registration Deadline</span><span className="text-sm font-medium">{new Date(event.registrationDeadline).toLocaleDateString("en-IN")}</span></div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm">{event.location || "Location not specified"}</div>
                  <div className="text-xs text-muted-foreground mt-2">{isPast ? "This event has passed" : "Upcoming event"}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Attendance List
                  <Badge variant="outline" className="ml-2">{presentCount} present · {absentCount} absent</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No attendance records for this event</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {(a.devoteeName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{a.devoteeName || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.checkInTime ? `Checked in: ${a.checkInTime}` : "No check-in time"}
                            </div>
                          </div>
                        </div>
                        <Badge className={a.status === "present" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions" className="mt-6 space-y-4">
            {/* Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" /> Donations
                  <Badge variant="outline" className="ml-2">{donations.length} records · ₹{totalDonated.toLocaleString("en-IN")}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No donations linked to this event</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {donations.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-green-100 text-green-700">
                              {(d.devoteeName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{d.devoteeName || "Anonymous"}</div>
                            <div className="text-xs text-muted-foreground">{d.donationType} · {d.paymentMethod}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">₹{parseFloat(d.amount || "0").toLocaleString("en-IN")}</div>
                          <div className="text-xs text-muted-foreground">{d.receiptNumber || "—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volunteering */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="w-5 h-5" /> Volunteering
                  <Badge variant="outline" className="ml-2">{volunteering.length} records · {totalVolHours}h</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {volunteering.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HandHeart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No volunteering records linked to this event</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {volunteering.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                              {(v.devoteeName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{v.devoteeName || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{v.activityType}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{v.hoursCompleted || v.hours || 0}h</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{v.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
