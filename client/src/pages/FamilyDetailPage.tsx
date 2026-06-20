import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import {
  ArrowLeft, Users, MapPin, Phone, Mail, Heart, Activity,
  HandHeart, AlertCircle, Home
} from "lucide-react";
import type { Family, Devotee } from "@shared/schema";

export default function FamilyDetailPage() {
  const [match, params] = useRoute("/families/:id");
  const [, navigate] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;

  const { data: family, isLoading: familyLoading } = useQuery<Family>({
    queryKey: ["/api/families", id],
    queryFn: () => fetch(`/api/families/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: members = [] } = useQuery<Devotee[]>({
    queryKey: ["/api/families", id, "members"],
    queryFn: () => fetch(`/api/families/${id}/members`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/families", id, "stats"],
    queryFn: () => fetch(`/api/families/${id}/stats`).then(r => r.json()),
    enabled: !!id,
  });

  if (familyLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading family..." />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Family not found</p>
          <Button onClick={() => navigate("/families")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Families
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Family Details"
        subtitle={family.familyName}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/families")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Families
        </Button>

        {/* Hero Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                {family.familyName[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{family.familyName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {[family.city, family.state].filter(Boolean).join(", ") || "No location set"}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={family.isActive ? "default" : "secondary"}>{family.isActive ? "Active" : "Inactive"}</Badge>
                  <Badge variant="outline">{members.length} members</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{stats?.totalMembers || members.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">₹{(stats?.totalDonations || 0).toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Donations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats?.totalVolunteeringHours || 0}h</div>
              <div className="text-xs text-muted-foreground mt-1">Seva Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats?.attendanceRate || 0}%</div>
              <div className="text-xs text-muted-foreground mt-1">Attendance Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {family.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="text-sm font-medium">{family.phone}</div>
                  </div>
                </div>
              )}
              {family.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm font-medium">{family.email}</div>
                  </div>
                </div>
              )}
              {family.address && (
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Address</div>
                    <div className="text-sm font-medium">{family.address}</div>
                  </div>
                </div>
              )}
              {family.emergencyContact && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Emergency Contact</div>
                    <div className="text-sm font-medium">{family.emergencyContact}</div>
                  </div>
                </div>
              )}
              {family.notes && (
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">Notes</div>
                  <div className="text-sm">{family.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">Combined Stats</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Events Attended</span>
                <span className="text-sm font-medium">{stats?.totalEventsAttended || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Donation Records</span>
                <span className="text-sm font-medium">{stats?.totalDonations ? `₹${stats.totalDonations.toLocaleString("en-IN")}` : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Seva Hours</span>
                <span className="text-sm font-medium">{stats?.totalVolunteeringHours || 0}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Attendance Rate</span>
                <span className="text-sm font-medium">{stats?.attendanceRate || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Family Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No members found in this family</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/devotees/${member.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <Avatar className="w-10 h-10">
                      {member.profileImage ? (
                        <AvatarImage src={member.profileImage} alt={member.firstName} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{member.firstName} {member.lastName}</div>
                      <div className="text-xs text-muted-foreground">{member.spiritualLevel || "Devotee"} · {member.city || "—"}</div>
                    </div>
                    {member.id === family.headOfFamily && (
                      <Badge variant="secondary" className="text-xs">Head</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
