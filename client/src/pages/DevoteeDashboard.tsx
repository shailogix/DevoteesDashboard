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
import { 
  Calendar, User, Heart, Settings, ShieldCheck, MapPin, Phone, Mail, Award, Edit3, Sun, Moon, BookOpen, Clock,
  ChevronLeft, ChevronRight, Play, CheckCircle2, MessageSquare, HelpCircle, ExternalLink, Sparkles, AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { getDailyPanchang, getScriptureOfTheDay } from "@/lib/panchang";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DevoteeDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [simulatingAlert, setSimulatingAlert] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/devotee/dashboard"],
  });

  // Polls Query & Mutation
  const { data: pollsList = [] } = useQuery<any[]>({
    queryKey: ["/api/polls"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: number; optionId: number }) => {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit vote");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote Counted!",
        description: "Thank you for participating in the community poll.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
    onError: (err: any) => {
      toast({
        title: "Vote Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const [selectedPollOption, setSelectedPollOption] = useState<{ [pollId: number]: number }>({});

  // Quizzes Query & Mutation
  const { data: quizzesList = [] } = useQuery<any[]>({
    queryKey: ["/api/quizzes"],
  });

  const [quizAnswers, setQuizAnswers] = useState<{ [quizId: number]: { [questionId: number]: string } }>({});
  const [submittingQuiz, setSubmittingQuiz] = useState<{ [quizId: number]: boolean }>({});
  const [quizResults, setQuizResults] = useState<{ [quizId: number]: any }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<{ [quizId: number]: number }>({});

  const submitQuizAnswers = async (quizId: number, questions: any[]) => {
    const answers = quizAnswers[quizId] || {};
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingQuiz(prev => ({ ...prev, [quizId]: true }));
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz answers");
      const data = await res.json();
      
      setQuizResults(prev => ({ ...prev, [quizId]: data }));
      toast({
        title: "Quiz Completed!",
        description: `You scored ${data.score} out of ${data.totalQuestions}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingQuiz(prev => ({ ...prev, [quizId]: false }));
    }
  };

  // YouTube Carousel State
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  const mockYouTubeVideos = [
    {
      id: "v1",
      title: "Madhur Hari Naam Sankirtan - Hare Krishna Hare Rama kirtan",
      thumbnail: "https://images.unsplash.com/photo-1609137144813-059942a6c1d7?q=80&w=600&auto=format&fit=crop",
      duration: "12:45",
      views: "15K views",
      publishedAt: "2 days ago",
      embedId: "dQw4w9WgXcQ",
      description: "Experience the pure bliss of Hari Naam Sankirtan. Chant along and immerse yourself in divine love."
    },
    {
      id: "v2",
      title: "Shree Madhav Stuti - Morning Devotional Prayers",
      thumbnail: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600&auto=format&fit=crop",
      duration: "08:20",
      views: "24K views",
      publishedAt: "5 days ago",
      embedId: "h10E_r-qY-Q",
      description: "Start your day with these sacred morning prayers to Lord Madhav for peace, health, and spiritual strength."
    },
    {
      id: "v3",
      title: "Divine Bhajans & Kirtans | Live from Madhav Temple",
      thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=600&auto=format&fit=crop",
      duration: "45:10",
      views: "42K views",
      publishedAt: "1 week ago",
      embedId: "9gX_U21oN70",
      description: "Live kirtan session recorded at the main temple hall on the auspicious occasion of Ekadashi."
    },
    {
      id: "v4",
      title: "Spiritual Discourse: Path of Bhakti and Devotion",
      thumbnail: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop",
      duration: "18:15",
      views: "9.8K views",
      publishedAt: "1 week ago",
      embedId: "q6hT_O4HmgM",
      description: "A profound lecture explaining the stages of Bhakti Yoga and how to cultivate steady spiritual practices in daily life."
    },
    {
      id: "v5",
      title: "Evening Aarti & Meditation | Madhavstuti Channel",
      thumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=600&auto=format&fit=crop",
      duration: "10:30",
      views: "18K views",
      publishedAt: "2 weeks ago",
      embedId: "Y2wLIsVqKco",
      description: "Join the congregational evening offering and meditation session. Let your mind find supreme tranquility."
    }
  ];

  const scrollCarousel = (direction: "left" | "right") => {
    const container = document.getElementById("youtube-carousel-container");
    if (container) {
      const scrollAmt = 340;
      container.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

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
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-border/60 bg-gradient-to-b from-amber-500/5 to-transparent shadow-md">
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

            {/* Mentor & Spiritual Guide Card */}
            <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-950/15 dark:to-orange-950/15 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
                  <ShieldCheck className="w-4 h-4" /> Spiritual Mentor & Guide
                </CardTitle>
                <CardDescription className="text-xs">Your assigned spiritual counselor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                {dashboardData.mentorDetails ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-amber-500/30">
                        <AvatarFallback className="bg-amber-100 text-amber-800 font-bold text-sm">
                          {dashboardData.mentorDetails.name?.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{dashboardData.mentorDetails.name}</h4>
                        <Badge variant="secondary" className="text-[10px] mt-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-300">
                          {dashboardData.mentorDetails.specialization}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2.5 pt-3 border-t border-border/40 text-xs">
                      {dashboardData.mentorDetails.whatsappNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-green-500" /> WhatsApp:
                          </span>
                          <a 
                            href={`https://wa.me/${dashboardData.mentorDetails.whatsappNumber.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            {dashboardData.mentorDetails.whatsappNumber} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {dashboardData.mentorDetails.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-primary" /> Call:
                          </span>
                          <a href={`tel:${dashboardData.mentorDetails.phone}`} className="font-semibold text-foreground hover:underline">
                            {dashboardData.mentorDetails.phone}
                          </a>
                        </div>
                      )}
                      {dashboardData.mentorDetails.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" /> Email:
                          </span>
                          <a href={`mailto:${dashboardData.mentorDetails.email}`} className="font-semibold text-foreground hover:underline truncate max-w-[150px]">
                            {dashboardData.mentorDetails.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <User className="w-8 h-8 text-muted-foreground/60 mx-auto animate-pulse" />
                    <p className="text-xs text-muted-foreground font-medium">No spiritual guide assigned yet.</p>
                    <p className="text-[10px] text-muted-foreground/80">Please contact the temple administrator to link a mentor.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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

                {/* Interactive Engagement: Polls & Quizzes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Community Poll Widget */}
                  <Card className="border border-border/40 bg-card flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                        <MessageSquare className="w-4 h-4" /> Community Poll
                      </CardTitle>
                      {pollsList && pollsList.length > 0 && (
                        <CardDescription className="text-xs font-semibold mt-1 line-clamp-2">
                          {pollsList.find((p: any) => p.isActive)?.title || pollsList[0].title}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
                      {(() => {
                        const activePoll = pollsList?.find((p: any) => p.isActive) || pollsList?.[0];
                        if (!activePoll) {
                          return (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              No active polls at the moment.
                            </div>
                          );
                        }

                        const hasVotedPoll = activePoll.responses?.some((r: any) => r.userId === user?.id) || voteMutation.isSuccess;

                        if (hasVotedPoll) {
                          const totalPollVotes = activePoll.responses?.length || 0;
                          const optionsWithVotes = activePoll.options?.map((opt: any) => {
                            const count = activePoll.responses?.filter((r: any) => r.optionId === opt.id).length || 0;
                            const pct = totalPollVotes > 0 ? Math.round((count / totalPollVotes) * 100) : 0;
                            return { ...opt, count, pct };
                          }) || [];

                          return (
                            <div className="space-y-3.5">
                              {optionsWithVotes.map((opt: any) => (
                                <div key={opt.id} className="space-y-1">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-foreground truncate max-w-[170px]">{opt.optionText}</span>
                                    <span className="text-primary">{opt.pct}% ({opt.count})</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-amber-500 to-orange-600 h-2.5 rounded-full transition-all duration-500" 
                                      style={{ width: `${opt.pct}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <p className="text-[10px] text-muted-foreground mt-4 italic">
                                Thank you for your participation! Total votes: {totalPollVotes}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {activePoll.description || "Cast your vote below to help us coordinate better."}
                            </p>
                            <div className="space-y-2 mt-3">
                              {activePoll.options?.map((opt: any) => (
                                <Button
                                  key={opt.id}
                                  variant={selectedPollOption[activePoll.id] === opt.id ? "default" : "outline"}
                                  className={[
                                    "w-full justify-start text-left text-xs h-auto py-2.5 px-4 font-medium transition-all",
                                    selectedPollOption[activePoll.id] === opt.id 
                                      ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm"
                                      : "hover:bg-amber-500/5 hover:text-amber-800 dark:hover:text-amber-300 border-border/80"
                                  ].join(" ")}
                                  onClick={() => setSelectedPollOption(prev => ({ ...prev, [activePoll.id]: opt.id }))}
                                >
                                  <div className="flex items-center gap-2.5 w-full">
                                    <span className={[
                                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] shrink-0",
                                      selectedPollOption[activePoll.id] === opt.id ? "border-white bg-white text-amber-600 font-bold" : "border-muted-foreground"
                                    ].join(" ")}>
                                      {selectedPollOption[activePoll.id] === opt.id && "✓"}
                                    </span>
                                    <span className="truncate">{opt.optionText}</span>
                                  </div>
                                </Button>
                              ))}
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-700 mt-4 text-xs h-9"
                              disabled={!selectedPollOption[activePoll.id] || voteMutation.isPending}
                              onClick={() => voteMutation.mutate({ pollId: activePoll.id, optionId: selectedPollOption[activePoll.id] })}
                            >
                              {voteMutation.isPending ? "Recording Vote..." : "Cast Your Vote"}
                            </Button>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Devotional Quiz Widget */}
                  <Card className="border border-border/40 bg-card flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Devotional Quiz
                      </CardTitle>
                      {quizzesList && quizzesList.length > 0 && (
                        <CardDescription className="text-xs font-semibold mt-1 line-clamp-2">
                          {quizzesList.find((q: any) => q.isActive)?.title || quizzesList[0].title}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
                      {(() => {
                        const activeQuiz = quizzesList?.find((q: any) => q.isActive) || quizzesList?.[0];
                        if (!activeQuiz) {
                          return (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              No active quizzes at the moment. Check back later!
                            </div>
                          );
                        }

                        const isQuizDone = activeQuiz.hasSubmitted || quizResults[activeQuiz.id] !== undefined;
                        const quizRes = activeQuiz.userResponse || quizResults[activeQuiz.id];

                        if (isQuizDone) {
                          return (
                            <div className="text-center py-6 space-y-3 flex-1 flex flex-col justify-center items-center">
                              <div className="inline-flex w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600 animate-bounce" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground">Quiz Completed!</h4>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  Your Score: <span className="text-primary font-bold text-sm">{quizRes.score}</span> / {activeQuiz.questions?.length}
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed pt-1">
                                Great job! Devotional quizzes build spiritual knowledge and scripture understanding.
                              </p>
                            </div>
                          );
                        }

                        const curQIndex = currentQuestionIndex[activeQuiz.id] || 0;
                        const totalQuestions = activeQuiz.questions?.length || 0;

                        if (totalQuestions === 0) {
                          return (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                              This quiz has no questions available.
                            </div>
                          );
                        }

                        const currentQ = activeQuiz.questions[curQIndex];
                        const selectedAnswer = quizAnswers[activeQuiz.id]?.[currentQ.id];

                        return (
                          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                <span>Question {curQIndex + 1} of {totalQuestions}</span>
                                <span>{Math.round(((curQIndex + 1) / totalQuestions) * 100)}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-amber-600 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${((curQIndex + 1) / totalQuestions) * 100}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-xs font-semibold text-foreground mt-2 leading-relaxed min-h-[40px]">
                              {currentQ.questionText}
                            </p>

                            <div className="space-y-2 mt-2">
                              {currentQ.options?.map((opt: string) => {
                                const isSelected = selectedAnswer === opt;
                                return (
                                  <Button
                                    key={opt}
                                    variant={isSelected ? "default" : "outline"}
                                    className={[
                                      "w-full justify-start text-left text-xs h-auto py-2 px-3 font-medium transition-all",
                                      isSelected 
                                        ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm"
                                        : "hover:bg-amber-500/5 hover:text-amber-800 dark:hover:text-amber-300 border-border/80"
                                    ].join(" ")}
                                    onClick={() => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [activeQuiz.id]: {
                                          ...(prev[activeQuiz.id] || {}),
                                          [currentQ.id]: opt
                                        }
                                      }));
                                    }}
                                  >
                                    {opt}
                                  </Button>
                                );
                              })}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-border/40">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[11px] h-8 px-2.5"
                                disabled={curQIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => ({ ...prev, [activeQuiz.id]: Math.max(0, curQIndex - 1) }))}
                              >
                                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                              </Button>
                              {curQIndex < totalQuestions - 1 ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] h-8 px-2.5"
                                  disabled={!selectedAnswer}
                                  onClick={() => setCurrentQuestionIndex(prev => ({ ...prev, [activeQuiz.id]: Math.min(totalQuestions - 1, curQIndex + 1) }))}
                                >
                                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-[11px] h-8 px-2.5 font-bold"
                                  disabled={!selectedAnswer || submittingQuiz[activeQuiz.id]}
                                  onClick={() => submitQuizAnswers(activeQuiz.id, activeQuiz.questions)}
                                >
                                  {submittingQuiz[activeQuiz.id] ? "Submitting..." : "Submit Quiz"}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

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

        {/* YouTube Videos Carousel from @madhavstuti */}
        <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-amber-600">
                <Play className="w-4 h-4 fill-amber-600 text-amber-600" /> Watch & Listen: @madhavstuti
              </CardTitle>
              <CardDescription className="text-xs">Devotional videos, daily kirtans and katha on YouTube</CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-full border-amber-500/20 text-amber-700 hover:bg-amber-500/10"
                onClick={() => scrollCarousel("left")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-full border-amber-500/20 text-amber-700 hover:bg-amber-500/10"
                onClick={() => scrollCarousel("right")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div 
              id="youtube-carousel-container" 
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {mockYouTubeVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="flex-none w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] snap-start group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border/80 shadow-sm transition-all duration-300 group-hover:border-amber-500/40 group-hover:shadow-md">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100 transition-all duration-300">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="mt-2.5 px-1">
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>{video.views}</span>
                      <span>•</span>
                      <span>{video.publishedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Video Player Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
          <DialogContent className="max-w-3xl border border-amber-500/20 bg-background/95 backdrop-blur-md p-0 overflow-hidden shadow-2xl rounded-2xl">
            {selectedVideo && (
              <div className="flex flex-col">
                <div className="aspect-video w-full relative bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&rel=0`}
                    title={selectedVideo.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[10px]">YouTube Official</Badge>
                      <span className="text-[10px] text-muted-foreground">@madhavstuti kirtans</span>
                    </div>
                    <DialogTitle className="text-sm font-extrabold text-foreground leading-snug">
                      {selectedVideo.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
                      {selectedVideo.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                    <div className="flex gap-4">
                      <span>Views: <strong>{selectedVideo.views}</strong></span>
                      <span>Published: <strong>{selectedVideo.publishedAt || "Recently"}</strong></span>
                    </div>
                    <a 
                      href={`https://www.youtube.com/watch?v=${selectedVideo.embedId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      Watch on YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
