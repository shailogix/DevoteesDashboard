import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from "react";

export function AttendanceChart() {
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/attendance"] });
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });

  const chartData = useMemo(() => {
    const eventMap: Record<number, string> = {};
    events.forEach((e: any) => { eventMap[e.id] = e.title; });

    const byEvent: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      const key = eventMap[a.eventId] || `Event ${a.eventId}`;
      if (!byEvent[key]) byEvent[key] = { present: 0, total: 0 };
      byEvent[key].total++;
      if (a.status === 'present') byEvent[key].present++;
    });

    return Object.entries(byEvent)
      .map(([name, stats]) => ({
        name,
        attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
        present: stats.present,
        total: stats.total,
      }))
      .slice(-8);
  }, [attendance, events]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No attendance data yet. Record attendance to see trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}${name === 'attendance' ? '%' : ''}`, name === 'attendance' ? 'Attendance Rate' : name]} />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
