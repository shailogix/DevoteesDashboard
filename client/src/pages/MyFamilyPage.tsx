import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building, Phone, Mail, Award, Calendar, ArrowRight, MapPin, Briefcase, Plus, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MyFamilyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "Male",
    dateOfBirth: "",
    relation: "Spouse",
  });

  const { data: dashboardData, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/devotee/dashboard"],
  });

  const addFamilyMutation = useMutation({
    mutationFn: (payload: any) => apiRequest("POST", "/api/devotee/profile-update", payload),
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your request to add a family member has been submitted for admin approval.",
      });
      setAddDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        gender: "Male",
        dateOfBirth: "",
        relation: "Spouse",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "First name and Last name are required.",
        variant: "destructive",
      });
      return;
    }
    addFamilyMutation.mutate({
      action: "add_family_member",
      memberDetails: formData,
    });
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background particle-bg">
        <div className="text-center space-y-5 animate-pulse">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-elevation-3">
              <span className="text-primary-foreground text-2xl font-black">॥</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Madhav Parivar</h1>
            <p className="text-muted-foreground text-sm font-medium">Loading Family records…</p>
          </div>
        </div>
      </div>
    );
  }

  const { devotee, familyMembers = [] } = dashboardData;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="My Family" 
        subtitle="Manage and view profiles connected to your family records" 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Family Header Banner */}
        <div className="p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Family Directory</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Total Members Connected: <span className="font-bold text-amber-700 dark:text-amber-500">{familyMembers.length}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm border-0"
            >
              <UserPlus className="w-4 h-4" />
              Add Family Member
            </Button>
            <Badge className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/20 border-0 px-4 py-1.5 rounded-full text-xs font-bold">
              Registered Family Unit
            </Badge>
          </div>
        </div>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.length === 0 ? (
            <Card className="col-span-full border-dashed border-border/60 py-12 text-center">
              <CardContent className="space-y-4">
                <Building className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="font-bold text-lg">No family connections found</h4>
                  <p className="text-sm text-muted-foreground">Please submit a request to link family records to your profile.</p>
                  <div className="pt-2">
                    <Button 
                      onClick={() => setAddDialogOpen(true)}
                      className="bg-primary hover:bg-primary/95 text-white font-bold"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Family Member
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            familyMembers.map((member: any, index: number) => {
              const isSelf = member.id === devotee.id;
              return (
                <Card 
                  key={member.id} 
                  className={[
                    "relative overflow-hidden border border-border/60 bg-gradient-to-b from-amber-500/5 to-transparent transition-all duration-300 shadow-md hover:shadow-elevation-2 hover:-translate-y-1 group flex flex-col justify-between",
                    isSelf ? "ring-2 ring-primary/45" : ""
                  ].join(" ")}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Glassmorphic border glow for self */}
                  {isSelf && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest border-l border-b border-border/20">
                      You
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/10 shadow-sm">
                        <AvatarImage src={member.profileImage || undefined} />
                        <AvatarFallback className="text-lg font-bold bg-amber-500/10 text-amber-700">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold tracking-wide text-primary uppercase">
                          {member.devoteeId}
                        </CardDescription>
                        <div className="pt-1.5 flex gap-1.5 flex-wrap">
                          <Badge variant="outline" className="border-amber-500/20 text-amber-700 bg-amber-500/5 text-[9px] px-2 py-0">
                            {member.spiritualLevel || "Beginner"}
                          </Badge>
                          {member.isActive && (
                            <Badge className="bg-emerald-600 text-[9px] px-2 py-0">Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 border-t border-border/40 text-xs text-muted-foreground flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {member.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground">{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground truncate max-w-[190px]">{member.email}</span>
                        </div>
                      )}
                      {member.dateOfBirth && (
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>DOB: {format(new Date(member.dateOfBirth), "PP")}</span>
                        </div>
                      )}
                      {member.city && (
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{member.city}, {member.state}</span>
                        </div>
                      )}
                      {member.occupation && (
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{member.occupation}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-2 border-t border-border/30">
                      <Button 
                        onClick={() => navigate(`/devotees/${member.id}`)}
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs font-bold text-amber-700 dark:text-amber-500 hover:text-amber-800 hover:bg-amber-500/10 flex items-center justify-center gap-1.5"
                      >
                        View Full Profile
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Add Family Member Request Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-[var(--surface-container-high,var(--card))] border border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-extrabold text-foreground">
              <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="w-4 h-4" />
              </span>
              Add Family Member Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Provide the details of your family member. This request will be sent to the administrators for approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">First Name *</label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Last Name *</label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Relation to You *</label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Spouse">Spouse</option>
                <option value="Wife">Wife</option>
                <option value="Husband">Husband</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 rounded-xl"
                disabled={addFamilyMutation.isPending}
              >
                {addFamilyMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
