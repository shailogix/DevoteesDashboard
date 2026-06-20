import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useLocation } from "wouter";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  color: string;
  href?: string;
}

export function StatsCard({ title, value, change, icon: Icon, color, href }: StatsCardProps) {
  const [, navigate] = useLocation();
  const getChangeColor = () => {
    if (!change) return '';
    switch (change.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const Wrapper = href ? "button" : "div";
  const wrapperProps = href ? {
    onClick: () => navigate(href),
    className: "w-full text-left"
  } : {};

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${href ? 'cursor-pointer' : ''}`}>
      <Wrapper {...wrapperProps}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <p className={`text-sm ${getChangeColor()}`}>
                  {change.value} from last month
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}
