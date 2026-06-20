import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AttendanceChart } from "@/components/Dashboard/AttendanceChart";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { GroupManager } from "@/components/Groups/GroupManager";
import { UpcomingEvents } from "@/components/Dashboard/UpcomingEvents";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, Heart, Calendar, MessageSquare, Send } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [bulkMessageGroup, setBulkMessageGroup] = useState<any>(null);
  const [bulkMessage, setBulkMessage] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: groups } = useQuery({
    queryKey: ["/api/groups"],
  });

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const handleGroupActions = {
    onAddGroup: () => toast({ title: "Add Group", description: "Use the Groups management page to add new groups." }),
    onEditGroup: (group: any) => toast({ title: `Edit: ${group.groupName || group.name}`, description: "Use the Groups section to edit group details." }),
    onCreateWhatsAppGroup: (group: any) => {
      if (group.whatsappLink) {
        window.open(group.whatsappLink, '_blank');
      } else {
        const name = encodeURIComponent(group.groupName || group.name || "Group");
        window.open(`https://wa.me/?text=Join+${name}`, '_blank');
        toast({ title: "WhatsApp", description: `Opening WhatsApp for ${group.groupName || group.name}` });
      }
    },
    onCreateTelegramGroup: (group: any) => {
      if (group.telegramLink) {
        window.open(group.telegramLink, '_blank');
      } else {
        window.open("https://t.me/", '_blank');
        toast({ title: "Telegram", description: `Opening Telegram for ${group.groupName || group.name}` });
      }
    },
    onSendBulkMessage: (group: any) => {
      setBulkMessageGroup(group);
      setBulkMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Dashboard" 
        subtitle="Madhav Parivar — Devotional Management System" 
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Devotees"
            value={stats?.totalDevotees?.toLocaleString() || "0"}
            icon={Users}
            color="from-primary to-secondary"
          />
          <StatsCard
            title="Active Families"
            value={stats?.activeFamilies?.toLocaleString() || "0"}
            icon={Building}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Donations"
            value={`₹${(stats?.totalDonations || 0).toLocaleString('en-IN')}`}
            icon={Heart}
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Avg. Attendance"
            value={`${stats?.avgAttendance || 0}%`}
            icon={Calendar}
            color="from-yellow-500 to-yellow-600"
          />
        </div>

        {/* Upcoming Events — shown prominently above the attendance section */}
        <UpcomingEvents />

        {/* Attendance + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceChart />
          <RecentActivities />
        </div>

        {/* Groups */}
        {groups && (
          <GroupManager 
            groups={groups}
            {...handleGroupActions}
          />
        )}
      </main>

      {/* Bulk Message Dialog */}
      <Dialog open={!!bulkMessageGroup} onOpenChange={() => setBulkMessageGroup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Bulk Message — {bulkMessageGroup?.groupName || bulkMessageGroup?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compose a message to send to all {bulkMessageGroup?.memberCount || "all"} members of this group.
            </p>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Type your message here..."
                value={bulkMessage}
                onChange={e => setBulkMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkMessageGroup(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!bulkMessage.trim()) return;
                  const encoded = encodeURIComponent(bulkMessage);
                  window.open(`https://wa.me/?text=${encoded}`, '_blank');
                  toast({ title: "Message Ready", description: "WhatsApp opened with your message. Send it to the group members." });
                  setBulkMessageGroup(null);
                }}
                disabled={!bulkMessage.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" /> Send via WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
