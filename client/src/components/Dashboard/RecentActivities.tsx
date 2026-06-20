import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Heart, Calendar, Users } from "lucide-react";

const activities = [
  {
    id: 1,
    type: 'devotee',
    message: 'New devotee registered',
    time: '5 minutes ago',
    icon: UserPlus,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    type: 'donation',
    message: 'Donation received',
    time: '12 minutes ago',
    icon: Heart,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 3,
    type: 'event',
    message: 'Event scheduled',
    time: '1 hour ago',
    icon: Calendar,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 4,
    type: 'group',
    message: 'Group created',
    time: '2 hours ago',
    icon: Users,
    color: 'from-purple-500 to-purple-600'
  }
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${activity.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
