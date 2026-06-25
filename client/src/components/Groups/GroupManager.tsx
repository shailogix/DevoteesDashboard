import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MessageCircle, Send, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { Group } from "@shared/schema";

interface GroupManagerProps {
  groups: Group[];
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onCreateWhatsAppGroup: (group: Group) => void;
  onCreateTelegramGroup: (group: Group) => void;
  onSendBulkMessage: (group: Group) => void;
}

export function GroupManager({
  groups,
  onAddGroup,
  onCreateWhatsAppGroup,
  onCreateTelegramGroup,
  onSendBulkMessage
}: GroupManagerProps) {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Group Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={onAddGroup}>
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/groups')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Groups
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No groups created yet.</p>
                <p className="text-sm">Create your first group to get started.</p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{group.groupName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.currentMembers} members • {group.groupType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={group.isActive ? "default" : "secondary"}>
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/groups')}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateWhatsAppGroup(group)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateTelegramGroup(group)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Telegram
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendBulkMessage(group)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Bulk Message
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
