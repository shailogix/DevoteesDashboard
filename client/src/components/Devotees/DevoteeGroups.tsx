
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Users, Settings, Trash2, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GroupFieldWizard } from "./GroupFieldWizard";
import { GroupEntryForm } from "./GroupEntryForm";
import { GroupEntriesList } from "./GroupEntriesList";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Group } from "@shared/schema";
import type { Mandal, SabhaLocation } from "@shared/schema";

export function DevoteeGroups() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isEntriesListOpen, setIsEntriesListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: mandals = [] } = useQuery<Mandal[]>({
    queryKey: ["/api/mandals"],
  });

  const { data: sabhaLocations = [] } = useQuery<SabhaLocation[]>({
    queryKey: ["/api/sabha-locations"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsWizardOpen(false);
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    },
  });

  const filteredGroups = groups?.filter((group: Group) =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.groupType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateGroup = (groupData: any) => {
    createGroupMutation.mutate(groupData);
  };

  const handleDeleteGroup = (id: number) => {
    if (confirm("Are you sure you want to delete this group?")) {
      deleteGroupMutation.mutate(id);
    }
  };

  const handleViewEntries = (group: Group) => {
    setSelectedGroup(group);
    setIsEntriesListOpen(true);
  };

  const handleAddEntry = (group: Group) => {
    setSelectedGroup(group);
    setIsEntryFormOpen(true);
  };

  const defaultGroups = [
    { name: "Families", type: "family", description: "Family groups management" },
    { name: "Mentors", type: "mentor", description: "Spiritual mentors and guides" },
    { name: "Volunteers", type: "volunteer", description: "Active volunteers and seva workers" },
    { name: "Sabha List", type: "sabha", description: "Sabha attendees and participants" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Devotee Groups</h2>
          <p className="text-muted-foreground">Manage different devotee groups and their custom fields</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Group
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group: Group) => (
          <Card key={group.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.groupName}</CardTitle>
                <Badge variant="outline">{group.groupType}</Badge>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{group.currentMembers || 0} members</span>
                </div>
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewEntries(group)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddEntry(group)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Entry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(group);
                    setIsWizardOpen(true);
                  }}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No groups match your search." : "Create your first devotee group to get started."}
          </p>
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Group
          </Button>
        </div>
      )}

      {/* Group Field Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? "Edit Group Fields" : "Create New Group"}
            </DialogTitle>
          </DialogHeader>
          <GroupFieldWizard
            group={selectedGroup}
            mandals={mandals || []}
            sabhaLocations={sabhaLocations || []}
            onSubmit={handleCreateGroup}
            onCancel={() => {
              setIsWizardOpen(false);
              setSelectedGroup(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Group Entry Form Dialog */}
      <Dialog open={isEntryFormOpen} onOpenChange={setIsEntryFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Entry to {selectedGroup?.groupName}</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <GroupEntryForm
              group={selectedGroup}
              mandals={mandals || []}
              sabhaLocations={sabhaLocations || []}
              onSubmit={() => {
                setIsEntryFormOpen(false);
                setSelectedGroup(null);
              }}
              onCancel={() => {
                setIsEntryFormOpen(false);
                setSelectedGroup(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Group Entries List Dialog */}
      <Dialog open={isEntriesListOpen} onOpenChange={setIsEntriesListOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.groupName} Entries</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <GroupEntriesList
              group={selectedGroup}
              onClose={() => {
                setIsEntriesListOpen(false);
                setSelectedGroup(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
