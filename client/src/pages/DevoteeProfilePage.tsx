import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, Briefcase, 
  Star, Heart, Users, Clock, TrendingUp, Activity,
  AlertCircle, User, Home, FileText, Upload, Trash2, Download, Camera
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { adminFetch } from "@/contexts/DevModeContext";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import type { Devotee } from "@shared/schema";

const COLORS = ["#f97316", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

function age(dob: string | Date | null) {
  if (!dob) return null;
  const b = new Date(dob);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function monthLabel(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

interface DevoteeDoc {
  id: string;
  devoteeId: number;
  type: string;
  filename: string;
  base64: string;
  uploadedAt: string;
}

export default function DevoteeProfilePage() {
  const [match, params] = useRoute("/devotees/:id");
  const [, navigate] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("Aadhaar Card");

  const { data: devotee, isLoading: devoteeLoading } = useQuery<Devotee>({
    queryKey: ["/api/devotees", id],
    queryFn: () => fetch(`/api/devotees/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: familyMembers = [] } = useQuery<Devotee[]>({
    queryKey: ["/api/devotees", id, "family"],
    queryFn: () => fetch(`/api/devotees/${id}/family`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: analytics } = useQuery<{ attendance: any[], donations: any[], volunteering: any[] }>({
    queryKey: ["/api/devotees", id, "analytics"],
    queryFn: () => fetch(`/api/devotees/${id}/analytics`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery<DevoteeDoc[]>({
    queryKey: ["/api/devotees", id, "documents"],
    queryFn: () => fetch(`/api/devotees/${id}/documents`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: groups = [] } = useQuery<any[]>({
    queryKey: ["/api/devotees", id, "groups"],
    queryFn: () => fetch(`/api/devotees/${id}/groups`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: mandal } = useQuery<any>({
    queryKey: ["/api/devotees", id, "mandal"],
    queryFn: () => fetch(`/api/devotees/${id}/mandal`).then(r => r.json()),
    enabled: !!id,
  });

  const uploadDocMutation = useMutation({
    mutationFn: async ({ type, filename, base64 }: { type: string; filename: string; base64: string }) =>
      adminFetch(`/api/devotees/${id}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, filename, base64 }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/devotees", id, "documents"] });
      toast({ title: "Document uploaded", description: "Document saved successfully." });
    },
    onError: () => toast({ title: "Upload failed. Developer mode required to upload documents.", variant: "destructive" }),
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => adminFetch(`/api/devotees/${id}/documents/${docId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/devotees", id, "documents"] });
      toast({ title: "Document deleted" });
    },
    onError: () => toast({ title: "Delete failed. Developer mode required.", variant: "destructive" }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      uploadDocMutation.mutate({ type: docType, filename: file.name, base64 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!id || devoteeLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!devotee) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Devotee not found</p>
          <Button onClick={() => navigate("/devotees")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devotees
          </Button>
        </div>
      </div>
    );
  }

  // ─── Analytics Processing ────────────────────────────────────────────────

  // Attendance trend by month
  const attendanceByMonth: Record<string, { month: string; present: number; absent: number }> = {};
  (analytics?.attendance || []).forEach((a: any) => {
    const key = monthLabel(a.attendanceDate);
    if (!attendanceByMonth[key]) attendanceByMonth[key] = { month: key, present: 0, absent: 0 };
    if (a.status === "present") attendanceByMonth[key].present++;
    else attendanceByMonth[key].absent++;
  });
  const attendanceData = Object.values(attendanceByMonth).slice(-12);
  const totalPresent = (analytics?.attendance || []).filter((a: any) => a.status === "present").length;
  const totalAttendance = (analytics?.attendance || []).length;
  const attendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  // Donation trend by month
  const donationByMonth: Record<string, { month: string; amount: number }> = {};
  (analytics?.donations || []).forEach((d: any) => {
    const key = monthLabel(d.donationDate);
    if (!donationByMonth[key]) donationByMonth[key] = { month: key, amount: 0 };
    donationByMonth[key].amount += parseFloat(d.amount || "0");
  });
  const donationData = Object.values(donationByMonth).slice(-12);
  const totalDonated = (analytics?.donations || []).reduce((s: number, d: any) => s + parseFloat(d.amount || "0"), 0);

  // Donation type breakdown
  const donationByType: Record<string, number> = {};
  (analytics?.donations || []).forEach((d: any) => {
    donationByType[d.donationType] = (donationByType[d.donationType] || 0) + parseFloat(d.amount || "0");
  });
  const donationPieData = Object.entries(donationByType).map(([name, value]) => ({ name, value }));

  // Volunteering activity frequency by month
  const volByMonth: Record<string, { month: string; sessions: number; hours: number }> = {};
  (analytics?.volunteering || []).forEach((v: any) => {
    const key = monthLabel(v.activityDate);
    if (!volByMonth[key]) volByMonth[key] = { month: key, sessions: 0, hours: 0 };
    volByMonth[key].sessions++;
    volByMonth[key].hours += (v.hours || 0);
  });
  const volData = Object.values(volByMonth).slice(-12);
  const totalVolHours = (analytics?.volunteering || []).reduce((s: number, v: any) => s + (v.hours || 0), 0);

  const initials = `${devotee.firstName?.[0] || ""}${devotee.lastName?.[0] || ""}`.toUpperCase();

  const infoRows = [
    { icon: User, label: "Devotee ID", value: devotee.devoteeId },
    { icon: Calendar, label: "Date of Birth", value: devotee.dateOfBirth ? `${new Date(devotee.dateOfBirth).toLocaleDateString("en-IN")} (Age: ${age(devotee.dateOfBirth)})` : "—" },
    { icon: Briefcase, label: "Occupation", value: devotee.occupation || "—" },
    { icon: Star, label: "Spiritual Level", value: devotee.spiritualLevel || "—" },
    { icon: Calendar, label: "Join Date", value: devotee.joinDate ? new Date(devotee.joinDate).toLocaleDateString("en-IN") : "—" },
    { icon: MapPin, label: "Address", value: [devotee.address, devotee.city, devotee.state].filter(Boolean).join(", ") || "—" },
    { icon: Phone, label: "Phone", value: devotee.phone || "—" },
    { icon: Mail, label: "Email", value: devotee.email || "—" },
    { icon: Heart, label: "Dietary Preference", value: devotee.dietaryPreferences || "—" },
    { icon: AlertCircle, label: "Medical", value: devotee.medicalConditions || "None" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Devotee Profile"
        subtitle={`${devotee.firstName} ${devotee.lastName} · ${devotee.devoteeId}`}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/devotees")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devotees
        </Button>

        {/* ── HERO SECTION ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6">
          {/* Profile Image — 25% screen width */}
          <div className="w-1/4 min-w-[180px] max-w-[320px] aspect-square relative">
            <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl bg-muted flex items-center justify-center">
              {devotee.profileImage ? (
                <img
                  src={devotee.profileImage}
                  alt={`${devotee.firstName} ${devotee.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar className="w-full h-full rounded-none">
                  <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <Badge className={`text-sm px-3 py-1 ${devotee.isActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                {devotee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Name + Quick Stats */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {devotee.firstName} {devotee.lastName}
            </h1>
            <p className="text-muted-foreground">{devotee.spiritualLevel || "Devotee"} · {devotee.city || "—"}</p>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{attendanceRate}%</div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{totalDonated.toLocaleString("en-IN")}</div>
                <div className="text-xs text-muted-foreground">Total Donated</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalVolHours}h</div>
                <div className="text-xs text-muted-foreground">Seva Hours</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{(analytics?.volunteering || []).length}</div>
                <div className="text-xs text-muted-foreground">Seva Activities</div>
              </div>
            </div>

            {/* Groups & Mandal */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {mandal?.name && (
                <button
                  onClick={() => navigate(`/mandals`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="w-3 h-3" /> {mandal.name}
                </button>
              )}
              {groups.map((g: any) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/groups`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-3 h-3" /> {g.groupName || g.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── FAMILY MEMBERS ─────────────────────────────────────────── */}
          {familyMembers.length > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Family Members</span>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/devotees/${member.id}`)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group min-w-[80px]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-primary font-bold text-lg">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-foreground leading-tight">{member.firstName}</div>
                      <div className="text-xs text-muted-foreground">{member.lastName}</div>
                      {member.gender && <div className="text-xs text-muted-foreground/70">{member.gender}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* ── TABS ────────────────────────────────────────────────────── */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="volunteering">Volunteering</TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-3.5 h-3.5 mr-1 inline" />Documents
              {documents.length > 0 && <Badge className="ml-1 text-xs px-1 py-0 h-4">{documents.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ── DETAILS TAB ────────────────────────────────────────────── */}
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {infoRows.slice(0, 6).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-sm font-medium">{value}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Contact & Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact & Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {infoRows.slice(6).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-sm font-medium break-all">{value}</div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Emergency Contact</div>
                    <div className="text-sm font-medium">{devotee.emergencyContact || "—"}</div>
                    <div className="text-sm text-muted-foreground">{devotee.emergencyPhone || ""}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Experience */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4" /> Skills & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Special Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {devotee.specialSkills ? devotee.specialSkills.split(",").map(s => (
                        <Badge key={s} variant="secondary">{s.trim()}</Badge>
                      )) : <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Previous Experience</div>
                    <p className="text-sm">{devotee.previousExperience || "—"}</p>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Notes</div>
                    <p className="text-sm">{devotee.notes || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── ATTENDANCE TAB ──────────────────────────────────────────── */}
          <TabsContent value="attendance" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-primary">{attendanceRate}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Attendance Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-green-600">{totalPresent}</div>
                  <div className="text-sm text-muted-foreground mt-1">Events Attended</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-muted-foreground">{totalAttendance - totalPresent}</div>
                  <div className="text-sm text-muted-foreground mt-1">Events Missed</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Monthly Attendance Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No attendance records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DONATIONS TAB ───────────────────────────────────────────── */}
          <TabsContent value="donations" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-green-600">
                    ₹{totalDonated.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Donated</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-primary">{(analytics?.donations || []).length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Donations Made</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-orange-500">
                    ₹{(analytics?.donations || []).length > 0
                      ? Math.round(totalDonated / (analytics?.donations || []).length).toLocaleString("en-IN")
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Avg per Donation</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Monthly Donation Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={donationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No donation records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" /> Donations by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donationPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={donationPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                          {donationPieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── VOLUNTEERING TAB ────────────────────────────────────────── */}
          <TabsContent value="volunteering" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-purple-600">{totalVolHours}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Seva Hours</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-primary">{(analytics?.volunteering || []).length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Seva Activities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-orange-500">
                    {(analytics?.volunteering || []).length > 0
                      ? Math.round(totalVolHours / (analytics?.volunteering || []).length)
                      : 0}h
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Avg Hours per Activity</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Monthly Volunteering Activity Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {volData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={volData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="hours" name="Hours" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No volunteering records found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity breakdown */}
            {(analytics?.volunteering || []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Seva Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.volunteering || []).slice(0, 8).map((v: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="text-sm font-medium">{v.activityType}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(v.activityDate).toLocaleDateString("en-IN")}
                            {v.description ? ` · ${v.description}` : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{v.hours}h</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{v.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── DOCUMENTS TAB ───────────────────────────────────────────── */}
          <TabsContent value="documents" className="mt-6 space-y-6">
            {/* Upload panel — admin/dev mode only */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="w-4 h-4" /> Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Document Type</p>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                        <SelectItem value="PAN Card">PAN Card</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                        <SelectItem value="Driving Licence">Driving Licence</SelectItem>
                        <SelectItem value="Photo">Photo</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadDocMutation.isPending}
                      className="bg-primary text-primary-foreground"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadDocMutation.isPending ? "Uploading..." : "Choose File & Upload"}
                    </Button>
                    <p className="text-xs text-muted-foreground">Accepts: images, PDF (stored in-memory)</p>
                  </div>
                </CardContent>
              </Card>

            {/* Document list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" /> Stored Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No documents uploaded yet.</p>
                    <p className="text-xs mt-1">Use the upload panel above to add documents.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc: DevoteeDoc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {doc.base64?.startsWith("data:image") ? (
                              <img src={doc.base64} alt={doc.filename} className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{doc.filename}</div>
                            <div className="text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs mr-1">{doc.type}</Badge>
                              {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = doc.base64;
                              a.download = doc.filename;
                              a.click();
                            }}
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => deleteDocMutation.mutate(doc.id)}
                            disabled={deleteDocMutation.isPending}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
