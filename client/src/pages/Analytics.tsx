import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';
import { TrendingUp, Users, Heart, Calendar, Activity, Download, CreditCard, Clock, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#a4de6c', '#d0ed57'];

// ─── Local types for analytics data (server-provided shape) ───────────────────
interface AnalyticsData {
  stats?: { totalDevotees: number; activeFamilies: number; totalDonations: number; avgAttendance: number };
  donationTrends?: Array<{ month: string; amount: number }>;
  attendanceTrends?: Array<{ month: string; present: number; absent: number }>;
  volunteeringStats?: Array<{ activity: string; hours: number }>;
}

interface DevoteeSummary {
  id: number;
  dateOfBirth?: string;
  gender?: string;
  spiritualLevel?: string;
  city?: string;
  joinDate?: string;
}

interface EventSummary {
  id: number;
  title: string;
  eventType?: string;
  eventDate?: string;
  startDate?: string;
}

interface DonationSummary {
  id: number;
  amount: string;
  purpose?: string;
  paymentMethod?: string;
  donationType?: string;
  donationDate: string;
  status?: string;
}

export default function Analytics() {
  const [, navigate] = useLocation();
  const { data: analyticsRaw, isLoading } = useQuery<AnalyticsData>({ queryKey: ["/api/analytics"] });
  const { data: devotees = [] } = useQuery<DevoteeSummary[]>({ queryKey: ["/api/devotees"] });
  const { data: events = [] } = useQuery<EventSummary[]>({ queryKey: ["/api/events"] });
  const { data: donations = [] } = useQuery<DonationSummary[]>({ queryKey: ["/api/donations"] });
  const { data: families = [] } = useQuery<unknown[]>({ queryKey: ["/api/families"] });

  const analytics = analyticsRaw as AnalyticsData | undefined;
  const stats = analytics?.stats;
  const donationTrends: Array<{ month: string; amount: number }> = analytics?.donationTrends || [];
  const attendanceTrends: Array<{ month: string; present: number; absent: number }> = analytics?.attendanceTrends || [];
  const volunteeringStats: Array<{ activity: string; hours: number }> = analytics?.volunteeringStats || [];

  // Event type pie
  const eventTypeCounts: Record<string, number> = {};
  events.forEach((e) => {
    const type = e.eventType || "Other";
    eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
  });
  const eventTypeData = Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }));

  // Age group from devotees
  const ageBuckets: Record<string, number> = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
  devotees.forEach((d) => {
    if (d.dateOfBirth) {
      const age = Math.floor((Date.now() - new Date(d.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000));
      if (age <= 25) ageBuckets['18-25']++;
      else if (age <= 35) ageBuckets['26-35']++;
      else if (age <= 45) ageBuckets['36-45']++;
      else if (age <= 55) ageBuckets['46-55']++;
      else ageBuckets['56+']++;
    }
  });
  const ageGroupData = Object.entries(ageBuckets).map(([group, count]) => ({ group, count }));

  // Gender distribution
  const genderCounts: Record<string, number> = {};
  devotees.forEach((d) => {
    const g = d.gender || "Unknown";
    genderCounts[g] = (genderCounts[g] || 0) + 1;
  });
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  // Spiritual level distribution
  const spiritCounts: Record<string, number> = {};
  devotees.forEach((d) => {
    const l = d.spiritualLevel || "Nutan";
    spiritCounts[l] = (spiritCounts[l] || 0) + 1;
  });
  const spiritData = Object.entries(spiritCounts).map(([name, value]) => ({ name, value }));

  // City distribution
  const cityCounts: Record<string, number> = {};
  devotees.forEach((d) => {
    if (d.city) cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
  });
  const cityData = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));

  // Donation by purpose
  const purposeCounts: Record<string, number> = {};
  donations.forEach((d) => {
    const p = d.purpose || "General";
    purposeCounts[p] = (purposeCounts[p] || 0) + parseFloat(d.amount || "0");
  });
  const purposeData = Object.entries(purposeCounts).map(([name, value]) => ({ name, value }));

  // Donation by payment method
  const payMethodCounts: Record<string, number> = {};
  donations.forEach((d) => {
    const m = d.paymentMethod || d.donationType || "Other";
    payMethodCounts[m] = (payMethodCounts[m] || 0) + 1;
  });
  const payMethodData = Object.entries(payMethodCounts).map(([name, value]) => ({ name, value }));

  // Monthly donations
  const monthlyDonations: Record<string, number> = {};
  donations.forEach((d) => {
    const key = new Date(d.donationDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthlyDonations[key] = (monthlyDonations[key] || 0) + parseFloat(d.amount || "0");
  });
  const monthlyDonationData = Object.entries(monthlyDonations).map(([month, amount]) => ({ month, amount }));

  // Join date trend (devotees per month)
  const joinTrend: Record<string, number> = {};
  devotees.forEach((d) => {
    if (d.joinDate) {
      const key = new Date(d.joinDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      joinTrend[key] = (joinTrend[key] || 0) + 1;
    }
  });
  const joinTrendData = Object.entries(joinTrend).map(([month, count]) => ({ month, count }));

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  const totalDonationSum = donations.reduce((s, d) => s + parseFloat(d.amount || "0"), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Analytics" 
        subtitle="Insights and reports for your organization"
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-blue-600" /><div><p className="text-2xl font-bold">{stats?.totalDevotees || (devotees as any[]).length}</p><p className="text-xs text-muted-foreground">Total Devotees</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><Heart className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">₹{totalDonationSum.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">Total Donations</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><Activity className="w-8 h-8 text-purple-600" /><div><p className="text-2xl font-bold">{stats?.avgAttendance || 0}%</p><p className="text-xs text-muted-foreground">Avg Attendance</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-green-600" /><div><p className="text-2xl font-bold">{stats?.activeFamilies || (families as any[]).length}</p><p className="text-xs text-muted-foreground">Active Families</p></div></div></CardContent></Card>
        </div>

        {/* Tabbed Analytics */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devotees">Devotees</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4" /> Attendance Trends</CardTitle></CardHeader>
                <CardContent>
                  {attendanceTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={attendanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Present" />
                        <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absent" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center"><Activity className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No attendance data yet</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-4 h-4" /> Donation Trends</CardTitle></CardHeader>
                <CardContent>
                  {donationTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={donationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center"><Heart className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No donation data yet</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Event Types Distribution</CardTitle></CardHeader>
                <CardContent>
                  {eventTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={eventTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {eventTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center"><Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No events data</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Volunteering Hours</CardTitle></CardHeader>
                <CardContent>
                  {volunteeringStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={volunteeringStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="activity" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(v: any) => [`${v}h`, 'Hours']} />
                        <Bar dataKey="hours" fill="hsl(var(--secondary))" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center"><TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No data yet</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── DEVOTEES TAB ─────────────────────────────────────────── */}
          <TabsContent value="devotees" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Age Group Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip formatter={(v: any) => [`${v} devotees`, 'Count']} />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Gender Distribution</CardTitle></CardHeader>
                <CardContent>
                  {genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}>
                          {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Devotee Enrolments by Month</CardTitle></CardHeader>
                <CardContent>
                  {joinTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={joinTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip formatter={(v: any) => [`${v}`, 'Devotees']} />
                        <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf620" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Top Cities</CardTitle></CardHeader>
                <CardContent>
                  {cityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={cityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={80} />
                        <Tooltip formatter={(v: any) => [`${v}`, 'Devotees']} />
                        <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No city data</div>}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4" /> Spiritual Level Breakdown</CardTitle></CardHeader>
                <CardContent>
                  {spiritData.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {spiritData.map(({ name, value }, i) => (
                        <div key={name} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 min-w-[120px]">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div>
                            <div className="text-sm font-medium">{name}</div>
                            <div className="text-xl font-bold">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-sm">No data</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── DONATIONS TAB ─────────────────────────────────────────── */}
          <TabsContent value="donations" className="mt-6 space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold text-green-600">₹{totalDonationSum.toLocaleString('en-IN')}</div>
                <div className="text-xs text-muted-foreground">Total Donations</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold">{(donations as any[]).length}</div>
                <div className="text-xs text-muted-foreground">Total Records</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold">
                  ₹{(donations as any[]).length > 0 ? Math.round(totalDonationSum / (donations as any[]).length).toLocaleString('en-IN') : 0}
                </div>
                <div className="text-xs text-muted-foreground">Avg per Donation</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold text-yellow-600">{(donations as any[]).filter((d: any) => d.status === "pending").length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-4 h-4" /> Monthly Donations (₹)</CardTitle></CardHeader>
                <CardContent>
                  {monthlyDonationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlyDonationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                        <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No donation data yet</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Donations by Purpose</CardTitle></CardHeader>
                <CardContent>
                  {purposeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={purposeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {purposeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  {payMethodData.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {payMethodData.map(({ name, value }, i) => (
                        <div key={name} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 min-w-[100px]">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div>
                            <div className="text-xs capitalize text-muted-foreground">{name}</div>
                            <div className="text-xl font-bold">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-sm">No data</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4" /> Donation Status</CardTitle></CardHeader>
                <CardContent>
                  {(donations as any[]).length > 0 ? (() => {
                    const statusCounts: Record<string, number> = {};
                    (donations as any[]).forEach((d: any) => {
                      statusCounts[d.status || "received"] = (statusCounts[d.status || "received"] || 0) + 1;
                    });
                    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
                    return (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                            label={({ name, value }) => `${name}: ${value}`}>
                            {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })() : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── EVENTS TAB ─────────────────────────────────────────── */}
          <TabsContent value="events" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold">{(events as any[]).length}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold text-green-600">{(events as any[]).filter((e: any) => e.isActive).length}</div>
                <div className="text-xs text-muted-foreground">Active Events</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold text-blue-600">{eventTypeData.length}</div>
                <div className="text-xs text-muted-foreground">Event Types</div>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <div className="text-xl font-bold text-purple-600">{(events as any[]).reduce((s: number, e: any) => s + (e.maxParticipants || 0), 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-muted-foreground">Total Capacity</div>
              </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Events by Type</CardTitle></CardHeader>
                <CardContent>
                  {eventTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={eventTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip formatter={(v: any) => [`${v} events`, '']} />
                        <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No event data</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Upcoming Events</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[260px] overflow-y-auto">
                    {(events as any[])
                      .filter((e: any) => e.eventDate && new Date(e.eventDate) >= new Date())
                      .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                      .slice(0, 8)
                      .map((e: any, i: number) => (
                        <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium break-words" title={e.title}>{e.title}</div>
                            <div className="text-xs text-muted-foreground">{new Date(e.eventDate).toLocaleDateString("en-IN")}</div>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{e.eventType || "General"}</Badge>
                        </div>
                      ))
                    }
                    {(events as any[]).filter((e: any) => e.eventDate && new Date(e.eventDate) >= new Date()).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => navigate("/events")}>
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Schedule Event</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => navigate("/id-cards")}>
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Generate ID Cards</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => navigate("/donations")}>
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Record Donation</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => navigate("/devotees")}>
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Manage Devotees</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
