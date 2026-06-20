
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DevoteeForm } from "./DevoteeForm";
import { DevoteeProfile } from "./DevoteeProfile";
import type { Devotee } from "@shared/schema";
import { 
  User, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  Plus,
  MoreVertical,
  Download,
  Upload
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DevoteeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpiritual, setFilterSpiritual] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDevotee, setSelectedDevotee] = useState<Devotee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, navigate] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devotees = [], isLoading } = useQuery<Devotee[]>({
    queryKey: ["/api/devotees"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/devotees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      toast({
        title: "Success",
        description: "Devotee deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete devotee",
        variant: "destructive",
      });
    },
  });

  const filteredDevotees = devotees.filter((devotee: Devotee) => {
    const matchesSearch = !searchTerm || 
      devotee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devotee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devotee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devotee.devoteeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpiritual = !filterSpiritual || filterSpiritual === "all-levels" || devotee.spiritualLevel === filterSpiritual;
    const matchesStatus = !filterStatus || filterStatus === "all-status" ||
      (filterStatus === "active" && devotee.isActive) ||
      (filterStatus === "inactive" && !devotee.isActive);
    
    return matchesSearch && matchesSpiritual && matchesStatus;
  });

  const handleEdit = (devotee: Devotee) => {
    setSelectedDevotee(devotee);
    setIsFormOpen(true);
  };

  const handleView = (devotee: Devotee) => {
    navigate(`/devotees/${devotee.id}`);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedDevotee(null);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const spiritualLevels = ["Beginner", "Intermediate", "Advanced", "Teacher", "Mentor", "Guide"];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading devotees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Devotees Management</span>
              <Badge variant="secondary">{filteredDevotees.length}</Badge>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Devotee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search devotees by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterSpiritual} onValueChange={setFilterSpiritual}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Spiritual Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-levels">All Levels</SelectItem>
                {spiritualLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devotees Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Devotee</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Spiritual Level</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevotees.map((devotee: Devotee) => (
                <TableRow key={devotee.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/devotees/${devotee.id}`)}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={devotee.profileImage || undefined} />
                        <AvatarFallback>
                          {getInitials(devotee.firstName, devotee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-primary hover:underline">
                          {devotee.firstName} {devotee.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {devotee.devoteeId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-2 text-muted-foreground" />
                        {devotee.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                        {devotee.phone}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      {devotee.spiritualLevel || "Beginner"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                      {devotee.city}, {devotee.state}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-3 h-3 mr-2 text-muted-foreground" />
                      {devotee.joinDate ? new Date(devotee.joinDate).toLocaleDateString() : "-"}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={devotee.isActive ? "default" : "secondary"}>
                      {devotee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(devotee)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(devotee)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Devotee</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {devotee.firstName} {devotee.lastName}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(devotee.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDevotees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No devotees found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDevotee ? "Edit Devotee" : "Add New Devotee"}
            </DialogTitle>
          </DialogHeader>
          <DevoteeForm
            devotee={selectedDevotee || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedDevotee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Devotee Profile</DialogTitle>
          </DialogHeader>
          {selectedDevotee && (
            <DevoteeProfile
              devotee={selectedDevotee}
              onEdit={() => {
                setIsProfileOpen(false);
                setIsFormOpen(true);
              }}
              onClose={() => {
                setIsProfileOpen(false);
                setSelectedDevotee(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
