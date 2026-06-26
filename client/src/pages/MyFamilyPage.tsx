import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building, Phone, Mail, Award, Calendar, ArrowRight, MapPin, Briefcase } from "lucide-react";
import { format } from "date-fns";

export default function MyFamilyPage() {
  const [, navigate] = useLocation();
  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/devotee/dashboard"],
  });

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
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0">
            Registered Family Unit
          </Badge>
        </div>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.length === 0 ? (
            <Card className="col-span-full border-dashed border-border/60 py-12 text-center">
              <CardContent className="space-y-4">
                <Building className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">No family connections found</h4>
                  <p className="text-sm text-muted-foreground">Please request an administrator to link family records to your profile.</p>
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
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
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
    </div>
  );
}
