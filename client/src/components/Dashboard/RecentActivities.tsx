import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { UserPlus, Heart, Calendar, Users, Clock, HandHeart } from "lucide-react";

export function RecentActivities() {
  const [, navigate] = useLocation();
  const { data: devotees = [] } = useQuery<any[]>({ queryKey: ["/api/devotees"] });
  const { data: donations = [] } = useQuery<any[]>({ queryKey: ["/api/donations"] });
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });
  const { data: groups = [] } = useQuery<any[]>({ queryKey: ["/api/groups"] });
  const { data: volunteering = [] } = useQuery<any[]>({ queryKey: ["/api/volunteering"] });
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/attendance"] });

  const activities = useMemo(() => {
    const items: { id: string; message: string; time: string; icon: any; color: string; href?: string }[] = [];

    devotees.slice(-2).forEach((d: any) => {
      const date = d.createdAt ? new Date(d.createdAt) : new Date();
      items.push({
        id: `dev-${d.id}`,
        message: `New devotee: ${d.firstName} ${d.lastName}`,
        time: formatDistanceToNow(date, { addSuffix: true }),
        icon: UserPlus,
        color: 'from-green-500 to-green-600',
        href: `/devotees/${d.id}`,
      });
    });

    donations.slice(-2).forEach((d: any) => {
      const date = d.donationDate ? new Date(d.donationDate) : new Date();
      items.push({
        id: `don-${d.id}`,
        message: `Donation: ₹${d.amount || 0}`,
        time: formatDistanceToNow(date, { addSuffix: true }),
        icon: Heart,
        color: 'from-blue-500 to-blue-600',
        href: `/donations`,
      });
    });

    events.slice(-2).forEach((e: any) => {
      const date = e.eventDate ? new Date(e.eventDate) : new Date();
      items.push({
        id: `evt-${e.id}`,
        message: `Event: ${e.title}`,
        time: formatDistanceToNow(date, { addSuffix: true }),
        icon: Calendar,
        color: 'from-yellow-500 to-yellow-600',
        href: `/events/${e.id}`,
      });
    });

    groups.slice(-2).forEach((g: any) => {
      items.push({
        id: `grp-${g.id}`,
        message: `Group: ${g.name || g.groupName}`,
        time: 'Recently',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
        href: `/groups`,
      });
    });

    volunteering.slice(-2).forEach((v: any) => {
      const date = v.activityDate ? new Date(v.activityDate) : new Date();
      items.push({
        id: `vol-${v.id}`,
        message: `Volunteering: ${v.hoursCompleted || v.hours || 0}h`,
        time: formatDistanceToNow(date, { addSuffix: true }),
        icon: HandHeart,
        color: 'from-orange-500 to-orange-600',
        href: `/volunteering`,
      });
    });

    return items.slice(-6).reverse();
  }, [devotees, donations, events, groups, volunteering, attendance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            No recent activity yet. Start adding devotees, events, donations, and more to see activity here.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const Wrapper = activity.href ? 'button' : 'div';
              const wrapperProps = activity.href ? {
                onClick: () => navigate(activity.href!),
                className: "w-full text-left"
              } : {};

              return (
                <Wrapper key={activity.id} {...wrapperProps}>
                  <div className="flex items-center space-x-3.5 p-3.5 bg-muted/40 rounded-2xl hover:bg-muted/70 transition-all duration-200 cursor-pointer">
                    {/* M3 expressive rounded-xl icon bubble */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm ${activity.color}`}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5 font-medium">{activity.time}</p>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
