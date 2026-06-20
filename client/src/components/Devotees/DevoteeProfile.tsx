import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart,
  Book,
  Users,
  Edit,
  X,
  MessageCircle,
  AlertTriangle,
  Utensils
} from "lucide-react";
import type { Devotee } from "@shared/schema";

interface DevoteeProfileProps {
  devotee: Devotee;
  onEdit: () => void;
  onClose: () => void;
}

export function DevoteeProfile({ devotee, onEdit, onClose }: DevoteeProfileProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth?: Date | string) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(devotee.dateOfBirth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={devotee.profileImage || undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(devotee.firstName, devotee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {devotee.firstName} {devotee.lastName}
            </h2>
            <p className="text-muted-foreground">ID: {devotee.devoteeId}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={devotee.isActive ? "default" : "secondary"}>
                {devotee.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">
                {devotee.spiritualLevel || "Beginner"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span>{devotee.firstName} {devotee.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span>{devotee.gender || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span>
                    {devotee.dateOfBirth 
                      ? new Date(devotee.dateOfBirth).toLocaleDateString()
                      : "-"
                    }
                    {age && ` (${age} years)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupation:</span>
                  <span>{devotee.occupation || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Join Date:</span>
                  <span>
                    {devotee.joinDate 
                      ? new Date(devotee.joinDate).toLocaleDateString()
                      : "-"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devotee.address ? (
                  <div className="space-y-2">
                    <p>{devotee.address}</p>
                    <p>
                      {devotee.city && `${devotee.city}, `}
                      {devotee.state && `${devotee.state} `}
                      {devotee.pincode}
                    </p>
                    <p>{devotee.country || "India"}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No address provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {devotee.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{devotee.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{devotee.email || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{devotee.phone || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span>{devotee.whatsappNumber || "-"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                    <p className="mt-1">{devotee.emergencyContact || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <p className="mt-1">{devotee.emergencyPhone || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spiritual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Spiritual Journey</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Spiritual Level</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {devotee.spiritualLevel || "Beginner"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dietary Preferences</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Utensils className="w-4 h-4 text-muted-foreground" />
                    <span>{devotee.dietaryPreferences || "-"}</span>
                  </div>
                </div>
              </div>

              {devotee.previousExperience && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Previous Experience</Label>
                    <p className="mt-1 whitespace-pre-wrap">{devotee.previousExperience}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          {devotee.specialSkills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-4 h-4" />
                  <span>Special Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{devotee.specialSkills}</p>
              </CardContent>
            </Card>
          )}

          {devotee.medicalConditions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Medical Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{devotee.medicalConditions}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {devotee.createdAt 
                    ? new Date(devotee.createdAt).toLocaleString()
                    : "-"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>
                  {devotee.updatedAt 
                    ? new Date(devotee.updatedAt).toLocaleString()
                    : "-"
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
