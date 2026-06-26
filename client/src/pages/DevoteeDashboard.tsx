import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, Heart, Settings, ShieldCheck, MapPin, Phone, Mail, Award, Edit3, Sun, Moon, BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";
import { getDailyPanchang, getScriptureOfTheDay } from "@/lib/panchang";

export default function DevoteeDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [simulatingAlert, setSimulatingAlert] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/devotee/dashboard"],
  });

  const triggerAlertCheck = async () => {
    setSimulatingAlert(true);
    try {
      const res = await fetch("/api/panchang/check-alerts", { method: "POST" });
      if (!res.ok) throw new Error("Failed to dispatch alert");
      const data = await res.json();
      
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      
      toast({
        title: "Panchang Alert Triggered!",
        description: `Simulated dispatch of "${data.alert.name}" email & SMS logs created. Check notifications pane!`,
      });
    } catch (err: any) {
      toast({
        title: "Alert Check Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSimulatingAlert(false);
    }
  };

  const [formData, setFormData] = useState<any>({});

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/devotee/profile-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit profile update");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Update Submitted",
        description: data.message || "Your changes are awaiting administrator approval.",
      });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !dashboardData) {
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
            <p className="text-muted-foreground text-sm font-medium">Loading Devotee Portal…</p>
          </div>
        </div>
      </div>
    );
  }

  const { devotee, upcomingEvents = [], familyMembers = [], stats = {} } = dashboardData;
  
  const { totalVolHours = 0, totalAttendance = 0, donationCount = 0, totalDonationAmount = 0, isMentor = false } = stats;

  const achievements = [
    {
      id: "seva_champion",
      title: "Seva Champion",
      description: "Earned by completing 50+ hours of volunteering service.",
      unlocked: totalVolHours >= 50,
      progress: `${totalVolHours} / 50 hrs`,
      icon: "🎖️",
      color: "from-amber-400 to-yellow-600",
    },
    {
      id: "satsang_regular",
      title: "Satsang Regular",
      description: "Earned by attending 10+ congregation programs.",
      unlocked: totalAttendance >= 10,
      progress: `${totalAttendance} / 10 programs`,
      icon: "🚩",
      color: "from-orange-400 to-red-600",
    },
    {
      id: "daan_veer",
      title: "Daan Veer",
      description: "Earned with 3+ donations or total contribution >= ₹5,000.",
      unlocked: donationCount >= 3 || totalDonationAmount >= 5000,
      progress: `₹${totalDonationAmount} (${donationCount} times)`,
      icon: "🤝",
      color: "from-emerald-400 to-teal-600",
    },
    {
      id: "community_guide",
      title: "Community Guide",
      description: "Earned by registering as a spiritual mentor/counselor.",
      unlocked: isMentor,
      progress: isMentor ? "Active Mentor" : "Not registered",
      icon: "🔱",
      color: "from-purple-400 to-indigo-600",
    },
  ];

  const startEdit = () => {
    setFormData({
      firstName: devotee.firstName,
      lastName: devotee.lastName,
      phone: devotee.phone || "",
      whatsappNumber: devotee.whatsappNumber || "",
      address: devotee.address || "",
      city: devotee.city || "",
      state: devotee.state || "",
      pincode: devotee.pincode || "",
      occupation: devotee.occupation || "",
      specialSkills: devotee.specialSkills || "",
      emergencyContact: devotee.emergencyContact || "",
      emergencyPhone: devotee.emergencyPhone || "",
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const panchang = getDailyPanchang();
  const scripture = getScriptureOfTheDay();

  const devotionalGreeting = localStorage.getItem("devotional_greeting") || "Jai Shree Madhav 🙏🏻";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="Devotee Portal" 
        subtitle={`॥ ${devotionalGreeting} ॥ Manage your profile, view upcoming events, and participate in community service`} 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Panchang & Daily Scripture Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-950/15 dark:to-orange-950/15 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-wider text-amber-600 uppercase flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" /> Daily Hindu Panchang
              </CardTitle>
              <CardDescription className="text-xs">{panchang.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-2">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="font-semibold text-foreground">Tithi</span>
                <span className="font-medium text-amber-800 dark:text-amber-300">{panchang.tithi} ({panchang.paksha})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="font-semibold text-foreground">Nakshatra</span>
                <span className="font-medium">{panchang.nakshatra}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="font-semibold text-foreground">Yoga / Karana</span>
                <span className="font-medium">{panchang.yoga} / {panchang.karana}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="font-semibold text-foreground">Rahu Kaal</span>
                <span className="font-medium flex items-center gap-1"><Clock className="w-3 h-3 text-red-500" /> {panchang.rahuKaal}</span>
              </div>
              
              {panchang.isEkadashi && (
                <div className="mt-3 p-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-md text-center shadow-md animate-pulse">
                  <p className="font-bold text-xs">✨ Fasting Day: {panchang.festival || "Ekadashi Vrata"} ✨</p>
                  <p className="text-[10px] opacity-90 mt-0.5">Refrain from grains & beans</p>
                </div>
              )}
              {!panchang.isEkadashi && panchang.festival && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-md text-center">
                  <p className="font-bold text-xs">🚩 Festival: {panchang.festival} 🚩</p>
                </div>
              )}

              {/* Simulated Alerts Trigger */}
              <div className="mt-4 pt-3 border-t border-amber-100/30">
                <Button 
                  onClick={triggerAlertCheck} 
                  disabled={simulatingAlert}
                  className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30 text-xs py-1.5 h-auto"
                >
                  <Sun className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Simulate Daily Alert Dispatch
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-950/15 dark:to-amber-950/15 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-wider text-orange-600 uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" /> Verse of the Day
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-primary">{scripture.source}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col justify-center">
              <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-500/10 text-center font-serif text-amber-800 dark:text-amber-300 text-sm whitespace-pre-line leading-relaxed italic">
                {scripture.shloka}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
                <span className="font-bold text-foreground">Translation:</span> "{scripture.translation}"
              </p>
              {scripture.purport && (
                <p className="text-[11px] text-muted-foreground mt-2 italic text-center">
                  <span className="font-semibold text-foreground">Reflection:</span> {scripture.purport}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border border-border/60 bg-gradient-to-b from-amber-500/5 to-transparent shadow-md">
            <CardHeader className="pb-4 text-center">
              <Avatar className="w-24 h-24 mx-auto border-2 border-primary/20 shadow-md">
                <AvatarImage src={devotee.profileImage || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-amber-500/10 text-amber-700">
                  {devotee.firstName?.[0]}{devotee.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-lg font-bold text-foreground">{devotee.firstName} {devotee.lastName}</CardTitle>
              <CardDescription className="text-sm font-semibold tracking-wide text-primary uppercase">
                {devotee.devoteeId}
              </CardDescription>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-amber-500/30 text-amber-700 bg-amber-500/5">
                  {devotee.spiritualLevel || "Beginner"}
                </Badge>
                <Badge className="bg-green-600">Approved</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t border-border/40 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span className="truncate">{devotee.email || "No Email"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>{devotee.phone || "No Phone"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{devotee.city ? `${devotee.city}, ${devotee.state || ""}` : "No Address"}</span>
              </div>
              
              <Button onClick={startEdit} variant="outline" className="w-full mt-4 flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> Request Profile Update
              </Button>
            </CardContent>
          </Card>

          {/* Center Details / Form */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              <Card className="border border-border/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" /> Edit Profile Request
                  </CardTitle>
                  <CardDescription>Changes will take effect once approved by an administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>First Name</Label>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-1">
                        <Label>Last Name</Label>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Phone Number</Label>
                        <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>WhatsApp Number</Label>
                        <Input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Address</Label>
                      <Input name="address" value={formData.address} onChange={handleInputChange} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label>City</Label>
                        <Input name="city" value={formData.city} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>State</Label>
                        <Input name="state" value={formData.state} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>Pincode</Label>
                        <Input name="pincode" value={formData.pincode} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Occupation</Label>
                      <Input name="occupation" value={formData.occupation} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-1">
                      <Label>Special Skills</Label>
                      <Textarea name="specialSkills" value={formData.specialSkills} onChange={handleInputChange} placeholder="e.g. Bhajan Singing, Cooking, Decorating" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Emergency Contact Person</Label>
                        <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>Emergency Phone</Label>
                        <Input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {updateProfileMutation.isPending ? "Submitting..." : "Submit Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Family details */}
                {familyMembers.length > 0 && (
                  <Card className="border border-border/40">
                    <CardHeader>
                      <CardTitle className="text-base font-bold text-foreground">Family Connection</CardTitle>
                      <CardDescription>Members connected to your family profile</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/30">
                      {familyMembers.map((m: any) => (
                        <div key={m.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 bg-muted">
                              <AvatarFallback className="text-xs">{m.firstName?.[0]}{m.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{m.firstName} {m.lastName}</p>
                              <p className="text-xs text-muted-foreground">{m.phone || "No phone connected"}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-700 bg-amber-500/5">
                            {m.spiritualLevel || "Beginner"}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Spiritual Milestones & Badges */}
                <Card className="border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent shadow-elevation-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600 animate-pulse" /> Spiritual Milestones & Badges
                    </CardTitle>
                    <CardDescription className="text-xs">Unlocks as you participate in community service, attendance, and giving</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {achievements.map((badge) => (
                        <div
                          key={badge.id}
                          className={[
                            "relative p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300",
                            badge.unlocked
                              ? "bg-card border-amber-500/30 shadow-sm hover:shadow-elevation-2 hover:-translate-y-0.5 group cursor-pointer"
                              : "bg-muted/40 border-muted opacity-40 select-none"
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* M3 squircle icon container */}
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-xl shadow-elevation-1`}>
                              {badge.icon}
                            </div>
                            {badge.unlocked ? (
                              <Badge variant="success" className="text-[10px] font-bold py-0.5">Unlocked</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] py-0.5 opacity-60">Locked</Badge>
                            )}
                          </div>
                          <div className="mt-3">
                            <h5 className="font-bold text-xs text-foreground">{badge.title}</h5>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{badge.description}</p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-border/40 flex justify-between items-center text-[10px]">
                            <span className="text-muted-foreground font-medium">Progress:</span>
                            <span className={[
                              "font-bold",
                              badge.unlocked ? "text-primary" : "text-muted-foreground"
                            ].join(" ")}>{badge.progress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border border-border/40 bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Devotional Events & Festivals
                    </CardTitle>
                    <CardDescription>Upcoming temple programs and festivals viewable by devotees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">No upcoming events listed yet</div>
                    ) : (
                      upcomingEvents.map((e: any) => (
                        <div key={e.id} className="p-4 rounded-lg bg-muted/30 border border-border/30 flex justify-between items-center gap-4">
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{e.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{e.description}</p>
                            <p className="text-xs font-semibold text-primary mt-2">
                              {format(new Date(e.startDate), "PPP")} {e.startTime ? `@ ${e.startTime}` : ""}
                            </p>
                          </div>
                          <Badge className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                            {e.eventType || "Festival"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
