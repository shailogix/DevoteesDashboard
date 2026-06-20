
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDevoteeSchema, type InsertDevotee, type Devotee } from "@shared/schema";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  Save, 
  X,
  Camera,
  Heart,
  Book,
  Users,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DevoteeFormProps {
  devotee?: Devotee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DevoteeForm({ devotee, onSuccess, onCancel }: DevoteeFormProps) {
  const [formData, setFormData] = useState<Partial<InsertDevotee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    dateOfBirth: undefined,
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    occupation: "",
    spiritualLevel: "Beginner",
    joinDate: new Date(),
    mentorId: undefined,
    familyId: undefined,
    profileImage: "",
    notes: "",
    specialSkills: "",
    previousExperience: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    dietaryPreferences: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const [joinDateOpen, setJoinDateOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing devotee data
  useEffect(() => {
    if (devotee) {
      setFormData({
        ...devotee,
        dateOfBirth: devotee.dateOfBirth ? new Date(devotee.dateOfBirth) : undefined,
        joinDate: devotee.joinDate ? new Date(devotee.joinDate) : new Date(),
      });
    }
  }, [devotee]);

  // Fetch families and mentors for dropdowns
  const { data: families = [] } = useQuery({
    queryKey: ["/api/families"],
  });

  const { data: mentors = [] } = useQuery({
    queryKey: ["/api/mentors"],
  });

  // Generate devotee ID
  useEffect(() => {
    if (!devotee && formData.firstName && formData.lastName) {
      const firstName = formData.firstName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const lastName = formData.lastName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      const devoteeId = `${firstName}${lastName}${timestamp}`;
      setFormData(prev => ({ ...prev, devoteeId }));
    }
  }, [formData.firstName, formData.lastName, devotee]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertDevotee) => {
      if (devotee) {
        return await apiRequest("PUT", `/api/devotees/${devotee.id}`, data);
      } else {
        return await apiRequest("POST", "/api/devotees", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      toast({
        title: "Success",
        description: devotee ? "Devotee updated successfully" : "Devotee created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save devotee",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = insertDevoteeSchema.parse(formData);
      mutation.mutate(validatedData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof InsertDevotee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const spiritualLevels = [
    "Beginner",
    "Intermediate", 
    "Advanced",
    "Teacher",
    "Mentor",
    "Guide"
  ];

  const genderOptions = [
    "Male",
    "Female", 
    "Other"
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Jain",
    "No Restrictions"
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>{devotee ? "Edit Devotee" : "Add New Devotee"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={cn(errors.firstName && "border-destructive")}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={cn(errors.lastName && "border-destructive")}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="devoteeId">Devotee ID</Label>
                <Input
                  id="devoteeId"
                  value={formData.devoteeId || ""}
                  onChange={(e) => handleInputChange("devoteeId", e.target.value)}
                  disabled={!!devotee}
                  className={devotee ? "bg-muted" : ""}
                />
              </div>

              <div>
                <Label htmlFor="gender">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.gender || ""} 
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className={cn(errors.gender && "border-destructive")}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive mt-1">{errors.gender}</p>
                )}
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP")
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => {
                        handleInputChange("dateOfBirth", date);
                        setDateOfBirthOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Join Date</Label>
                <Popover open={joinDateOpen} onOpenChange={setJoinDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.joinDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.joinDate ? (
                        format(formData.joinDate, "PPP")
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.joinDate}
                      onSelect={(date) => {
                        handleInputChange("joinDate", date);
                        setJoinDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation || ""}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={cn(errors.phone && "border-destructive")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone || ""}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode || ""}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spiritualLevel">Spiritual Level</Label>
                <Select 
                  value={formData.spiritualLevel || ""} 
                  onValueChange={(value) => handleInputChange("spiritualLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spiritual level" />
                  </SelectTrigger>
                  <SelectContent>
                    {spiritualLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mentorId">Mentor</Label>
                <Select 
                  value={formData.mentorId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("mentorId", value && value !== "none-mentor" ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-mentor">No Mentor</SelectItem>
                    {mentors.map((mentor: any) => (
                      <SelectItem key={mentor.id} value={mentor.id.toString()}>
                        {mentor.devoteeId} - {mentor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="familyId">Family</Label>
                <Select 
                  value={formData.familyId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("familyId", value && value !== "none-family" ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-family">No Family</SelectItem>
                    {families.map((family: any) => (
                      <SelectItem key={family.id} value={family.id.toString()}>
                        {family.familyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                <Select 
                  value={formData.dietaryPreferences || ""} 
                  onValueChange={(value) => handleInputChange("dietaryPreferences", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="previousExperience">Previous Spiritual Experience</Label>
              <Textarea
                id="previousExperience"
                value={formData.previousExperience || ""}
                onChange={(e) => handleInputChange("previousExperience", e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div>
              <Label htmlFor="specialSkills">Special Skills</Label>
              <Textarea
                id="specialSkills"
                value={formData.specialSkills || ""}
                onChange={(e) => handleInputChange("specialSkills", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions || ""}
                onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active Devotee</Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end space-x-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Saving..." : devotee ? "Update" : "Create"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
