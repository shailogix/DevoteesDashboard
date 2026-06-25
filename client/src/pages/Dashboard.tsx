import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { UpcomingEvents } from "@/components/Dashboard/UpcomingEvents";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Users, Building, Calendar, Landmark } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const { data: volunteering = [] } = useQuery<any[]>({ queryKey: ["/api/volunteering"] });
  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"] });
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/attendance"] });

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Dashboard" 
        subtitle="Madhav Parivar — Devotional Management System" 
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Devotees"
            value={stats?.totalDevotees?.toLocaleString() || "0"}
            icon={Users}
            color="from-primary to-secondary"
            href="/devotees"
          />
          <StatsCard
            title="Active Families"
            value={stats?.activeFamilies?.toLocaleString() || "0"}
            icon={Building}
            color="from-blue-500 to-blue-600"
            href="/families"
          />
          <StatsCard
            title="Avg. Attendance"
            value={`${stats?.avgAttendance || 0}%`}
            icon={Calendar}
            color="from-yellow-500 to-yellow-600"
            href="/attendance"
          />
        </div>

        {/* Upcoming Events — shown prominently */}
        <UpcomingEvents />

        {/* Recent Activities + By City grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RecentActivities />
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-primary" /> Devotees by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const cities = Array.from(new Set(devotees.map((d: any) => d.city).filter(Boolean)));
                  return cities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">No city data yet</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cities.map((city: string) => {
                        const cDevs = devotees.filter((d: any) => d.city === city);
                        const cAttendance = cDevs.reduce((s: number, d: any) => s + attendance.filter((a: any) => a.devoteeId === d.id).length, 0);
                        const cVolunteering = cDevs.reduce((s: number, d: any) => s + volunteering.filter((v: any) => v.devoteeId === d.id).reduce((ss: number, v: any) => ss + (v.hoursCompleted || v.hours || 0), 0), 0);
                        return (
                          <button
                            key={city}
                            onClick={() => navigate(`/mandals`)}
                            className="text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col justify-between h-28"
                          >
                            <div className="text-sm font-semibold text-foreground">{city}</div>
                            <div>
                              <div className="text-xs text-muted-foreground">{cDevs.length} devotees</div>
                              <div className="text-xs text-primary/80 mt-1 font-medium">{cAttendance} attendances · {cVolunteering}h seva</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
