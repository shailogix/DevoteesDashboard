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
  color: string;  // gradient classes e.g. "from-primary to-secondary"
  href?: string;
}

export function StatsCard({ title, value, change, icon: Icon, color, href }: StatsCardProps) {
  const [, navigate] = useLocation();

  const trendColor = !change ? '' :
    change.trend === 'up'   ? 'text-emerald-600 dark:text-emerald-400' :
    change.trend === 'down' ? 'text-red-500 dark:text-red-400' :
    'text-muted-foreground';

  const trendIcon = !change ? null :
    change.trend === 'up'   ? '↑' :
    change.trend === 'down' ? '↓' : '→';

  const Wrapper = href ? "button" : "div";
  const wrapperProps = href
    ? { onClick: () => navigate(href), className: "w-full text-left" }
    : {};

  return (
    <Card
      className={[
        "group relative overflow-hidden border-border/50",
        "hover:shadow-elevation-3 hover:-translate-y-1.5",
        "transition-all duration-300",
        href ? "cursor-pointer" : "",
      ].join(" ")}
    >
      {/* Subtle gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-80 rounded-t-3xl`} />

      <Wrapper {...wrapperProps}>
        <CardContent className="p-6 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase text-[11px]">
                {title}
              </p>
              <p className="text-3xl font-extrabold text-foreground mt-1.5 tracking-tight leading-none">
                {value}
              </p>
              {change && (
                <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${trendColor}`}>
                  <span className="text-sm font-black">{trendIcon}</span>
                  {change.value}
                  <span className="text-muted-foreground font-normal">vs last month</span>
                </p>
              )}
            </div>

            {/* M3 large filled icon container */}
            <div
              className={[
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                "bg-gradient-to-br shadow-elevation-2",
                "group-hover:scale-110 group-hover:rotate-[-4deg]",
                "transition-all duration-300 m3-icon-hero",
                color,
              ].join(" ")}
            >
              <Icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}
