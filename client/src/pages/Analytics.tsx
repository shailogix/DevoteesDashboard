import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
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
      <div className="flex-1 flex items-center justify-center bg-background particle-bg">
        <div className="text-center space-y-5 animate-fade-in-up">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-elevation-3 animate-spring-pop">
              <span className="text-primary-foreground text-2xl font-black">॥</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Madhav Parivar</h1>
            <p className="text-muted-foreground text-sm font-medium">Loading Analytics Insights…</p>
          </div>
        </div>
      </div>
    );
  }

  const totalDonationSum = donations.reduce((s, d) => s + parseFloat(d.amount || "0"), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="Analytics" 
        subtitle="Insights and reports for your organization"
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Export Action */}
        <div className="flex justify-end print:hidden">
          <Button onClick={() => setIsPrintModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold flex items-center gap-2 rounded-full shadow-elevation-1 hover:shadow-elevation-2">
            <Download className="w-4 h-4" /> Export Operational PDF Report
          </Button>
        </div>

        {/* Key Metrics — M3 Expressive Swatch Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <Card className="hover:shadow-elevation-2 hover:-translate-y-1 transition-all duration-300 rounded-3xl border-border/40">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{stats?.totalDevotees || (devotees as any[]).length}</p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Total Devotees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-elevation-2 hover:-translate-y-1 transition-all duration-300 rounded-3xl border-border/40">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">₹{totalDonationSum.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Total Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elevation-2 hover:-translate-y-1 transition-all duration-300 rounded-3xl border-border/40">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{stats?.avgAttendance || 0}%</p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Avg Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elevation-2 hover:-translate-y-1 transition-all duration-300 rounded-3xl border-border/40">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{stats?.activeFamilies || (families as any[]).length}</p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Active Families</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Print PDF Report Dialog */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-amber-200">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-amber-950 font-bold text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-600 animate-pulse" /> Operational PDF Report Preview
            </DialogTitle>
          </DialogHeader>
          
          {/* Printable Report Document */}
          <div id="printable-analytics-report" className="p-8 bg-white text-slate-900 space-y-6 font-sans">
            {/* Report Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-500 pb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-amber-900 font-serif">Devotional Community Portal</h1>
                <p className="text-xs text-muted-foreground">Comprehensive Operations & Devotee Analytics Report</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-amber-950">Jai Shree Madhav 🙏</p>
                <p className="text-slate-500 font-medium">Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center shadow-sm">
                <p className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Total Devotees</p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">{stats?.totalDevotees || devotees.length}</p>
              </div>
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center shadow-sm">
                <p className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Total Contributions</p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">₹{totalDonationSum.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center shadow-sm">
                <p className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Average Attendance</p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">{stats?.avgAttendance || 0}%</p>
              </div>
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center shadow-sm">
                <p className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Active Families</p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">{stats?.activeFamilies || families.length}</p>
              </div>
            </div>

            {/* Section: Devotee Demographics */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-amber-950 border-b border-amber-100 pb-1 uppercase tracking-wide">1. Devotee Demographics Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Spiritual Levels */}
                <div className="border border-slate-100 rounded p-3">
                  <h3 className="font-bold text-slate-800 mb-2">Spiritual Level Distribution</h3>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 font-semibold text-slate-600">
                        <th className="pb-1">Level</th>
                        <th className="pb-1 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {spiritData.map(d => (
                        <tr key={d.name}>
                          <td className="py-1 text-slate-700">{d.name}</td>
                          <td className="py-1 text-right font-medium">{d.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cities */}
                <div className="border border-slate-100 rounded p-3">
                  <h3 className="font-bold text-slate-800 mb-2">Top Congregations by City</h3>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 font-semibold text-slate-600">
                        <th className="pb-1">City</th>
                        <th className="pb-1 text-right">Devotees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {cityData.map(d => (
                        <tr key={d.city}>
                          <td className="py-1 text-slate-700">{d.city}</td>
                          <td className="py-1 text-right font-medium">{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section: Donation & Contributions */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-amber-950 border-b border-amber-100 pb-1 uppercase tracking-wide">2. Donation Summary by Purpose</h2>
              <table className="w-full text-left text-xs border border-slate-100 rounded overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 font-semibold text-slate-700">
                    <th className="p-2 border-b border-slate-100">Purpose / Category</th>
                    <th className="p-2 border-b border-slate-100 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purposeData.map(d => (
                    <tr key={d.name}>
                      <td className="p-2 text-slate-700 font-medium">{d.name}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">₹{d.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50/30 font-bold border-t-2 border-amber-100">
                    <td className="p-2 text-amber-950">Grand Total Contributions</td>
                    <td className="p-2 text-right text-amber-900 text-sm">₹{totalDonationSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section: Volunteering Activities */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-amber-950 border-b border-amber-100 pb-1 uppercase tracking-wide">3. Seva (Volunteering) Operations</h2>
              <table className="w-full text-left text-xs border border-slate-100 rounded overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 font-semibold text-slate-700">
                    <th className="p-2 border-b border-slate-100">Activity Type</th>
                    <th className="p-2 border-b border-slate-100 text-right">Total Completed Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteeringStats.length === 0 ? (
                    <tr><td colSpan={2} className="p-4 text-center text-muted-foreground italic">No volunteering activity data logged.</td></tr>
                  ) : (
                    volunteeringStats.map(d => (
                      <tr key={d.activity}>
                        <td className="p-2 text-slate-700">{d.activity}</td>
                        <td className="p-2 text-right font-bold">{d.hours} hrs</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Report Footer */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-muted-foreground mt-8">
              <span>Report Generated Automatically • Devotional Community Portal</span>
              <span>Page 1 of 1</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 print:hidden">
            <Button onClick={() => window.print()} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
              Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
