import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AttendanceChart } from "@/components/Dashboard/AttendanceChart";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { GroupManager } from "@/components/Groups/GroupManager";
import { UpcomingEvents } from "@/components/Dashboard/UpcomingEvents";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Users, Building, Heart, Calendar, MessageSquare, Send, TrendingUp, HandHeart, Landmark, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [bulkMessageGroup, setBulkMessageGroup] = useState<any>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: groups } = useQuery({
    queryKey: ["/api/groups"],
  });

  const { data: donations = [] } = useQuery<any[]>({ queryKey: ["/api/donations"] });
  const { data: volunteering = [] } = useQuery<any[]>({ queryKey: ["/api/volunteering"] });
  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"] });
  const { data: families = [] } = useQuery<any[]>({ queryKey: ["/api/families"] });
  const { data: mandals = [] } = useQuery<any[]>({ queryKey: ["/api/mandals"] });
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/attendance"] });

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const handleGroupActions = {
    onAddGroup: () => toast({ title: "Add Group", description: "Use the Groups management page to add new groups." }),
    onEditGroup: (group: any) => toast({ title: `Edit: ${group.groupName || group.name}`, description: "Use the Groups section to edit group details." }),
    onCreateWhatsAppGroup: (group: any) => {
      if (group.whatsappLink) {
        window.open(group.whatsappLink, '_blank');
      } else {
        const name = encodeURIComponent(group.groupName || group.name || "Group");
        window.open(`https://wa.me/?text=Join+${name}`, '_blank');
        toast({ title: "WhatsApp", description: `Opening WhatsApp for ${group.groupName || group.name}` });
      }
    },
    onCreateTelegramGroup: (group: any) => {
      if (group.telegramLink) {
        window.open(group.telegramLink, '_blank');
      } else {
        window.open("https://t.me/", '_blank');
        toast({ title: "Telegram", description: `Opening Telegram for ${group.groupName || group.name}` });
      }
    },
    onSendBulkMessage: (group: any) => {
      setBulkMessageGroup(group);
      setBulkMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Dashboard" 
        subtitle="Madhav Parivar — Devotional Management System" 
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Devotees"
            value={stats?.totalDevotees?.toLocaleString() || "0"}
            icon={Users}
            color="from-primary to-secondary"
          />
          <StatsCard
            title="Active Families"
            value={stats?.activeFamilies?.toLocaleString() || "0"}
            icon={Building}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Donations"
            value={`₹${(stats?.totalDonations || 0).toLocaleString('en-IN')}`}
            icon={Heart}
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Avg. Attendance"
            value={`${stats?.avgAttendance || 0}%`}
            icon={Calendar}
            color="from-yellow-500 to-yellow-600"
          />
        </div>

        {/* Upcoming Events — shown prominently above the attendance section */}
        <UpcomingEvents />

        {/* Attendance + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceChart />
          <RecentActivities />
        </div>

        {/* Interconnected Summary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Donors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Top Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No donation records yet</div>
              ) : (
                <div className="space-y-2">
                  {donations
                    .sort((a: any, b: any) => parseFloat(b.amount || "0") - parseFloat(a.amount || "0"))
                    .slice(0, 5)
                    .map((d: any) => {
                      const dev = devotees.find((dv: any) => dv.id === d.devoteeId);
                      const devName = dev ? `${dev.firstName} ${dev.lastName}` : "Anonymous";
                      return (
                        <button
                          key={d.id}
                          onClick={() => d.devoteeId && navigate(`/devotees/${d.devoteeId}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-green-100 text-green-700">
                              {devName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{devName}</div>
                            <div className="text-xs text-muted-foreground">{d.donationType}</div>
                          </div>
                          <div className="text-sm font-bold text-green-600">₹{parseFloat(d.amount || "0").toLocaleString("en-IN")}</div>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Volunteers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HandHeart className="w-4 h-4" /> Top Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {volunteering.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No volunteering records yet</div>
              ) : (
                <div className="space-y-2">
                  {volunteering
                    .sort((a: any, b: any) => (b.hoursCompleted || b.hours || 0) - (a.hoursCompleted || a.hours || 0))
                    .slice(0, 5)
                    .map((v: any) => {
                      const dev = devotees.find((dv: any) => dv.id === v.devoteeId);
                      const devName = dev ? `${dev.firstName} ${dev.lastName}` : "Unknown";
                      return (
                        <button
                          key={v.id}
                          onClick={() => v.devoteeId && navigate(`/devotees/${v.devoteeId}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                              {devName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{devName}</div>
                            <div className="text-xs text-muted-foreground">{v.activityType}</div>
                          </div>
                          <Badge variant="secondary">{v.hoursCompleted || v.hours || 0}h</Badge>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* By City breakdown (mandals map to cities) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="w-4 h-4" /> By City
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const cities = Array.from(new Set(devotees.map((d: any) => d.city).filter(Boolean)));
              return cities.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No city data yet</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cities.map((city: string) => {
                    const cDevs = devotees.filter((d: any) => d.city === city);
                    const cDonations = cDevs.reduce((s: number, d: any) => s + donations.filter((dn: any) => dn.devoteeId === d.id).reduce((ss: number, dn: any) => ss + parseFloat(dn.amount || "0"), 0), 0);
                    const cAttendance = cDevs.reduce((s: number, d: any) => s + attendance.filter((a: any) => a.devoteeId === d.id).length, 0);
                    const cVolunteering = cDevs.reduce((s: number, d: any) => s + volunteering.filter((v: any) => v.devoteeId === d.id).reduce((ss: number, v: any) => ss + (v.hoursCompleted || v.hours || 0), 0), 0);
                    return (
                      <button
                        key={city}
                        onClick={() => navigate(`/mandals`)}
                        className="text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <div className="text-sm font-medium">{city}</div>
                        <div className="text-xs text-muted-foreground mt-1">{cDevs.length} devotees · ₹{cDonations.toLocaleString("en-IN")}</div>
                        <div className="text-xs text-muted-foreground">{cAttendance} attendances · {cVolunteering}h seva</div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Most Active Families */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="w-4 h-4" /> Most Active Families
            </CardTitle>
          </CardHeader>
          <CardContent>
            {families.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No families yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {families.slice(0, 6).map((f: any) => {
                  const fMembers = devotees.filter((d: any) => d.familyId === f.id);
                  const fDonations = fMembers.reduce((s: number, d: any) => s + donations.filter((dn: any) => dn.devoteeId === d.id).reduce((ss: number, dn: any) => ss + parseFloat(dn.amount || "0"), 0), 0);
                  const fAttendance = fMembers.reduce((s: number, d: any) => s + attendance.filter((a: any) => a.devoteeId === d.id).length, 0);
                  return (
                    <button
                      key={f.id}
                      onClick={() => navigate(`/families/${f.id}`)}
                      className="text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {f.familyName?.[0]}
                        </div>
                        <div className="font-medium text-sm truncate">{f.familyName}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{fMembers.length} members · ₹{fDonations.toLocaleString("en-IN")} · {fAttendance} attendances</div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        {groups && (
          <GroupManager
            groups={groups}
            {...handleGroupActions}
          />
        )}
      </main>

      {/* Bulk Message Dialog */}
      <Dialog open={!!bulkMessageGroup} onOpenChange={() => setBulkMessageGroup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Bulk Message — {bulkMessageGroup?.groupName || bulkMessageGroup?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compose a message to send to all {bulkMessageGroup?.memberCount || "all"} members of this group.
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
                  toast({ title: "Message Ready", description: "WhatsApp opened with your message. Send it to the group members." });
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
