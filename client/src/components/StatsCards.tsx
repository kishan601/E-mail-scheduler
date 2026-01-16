import { useEmailStats } from "@/hooks/use-emails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Send, AlertTriangle, Clock } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useEmailStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Scheduled",
      value: stats?.totalScheduled || 0,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-200"
    },
    {
      label: "Sent Successfully",
      value: stats?.totalSent || 0,
      icon: Send,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-200"
    },
    {
      label: "Failed Attempts",
      value: stats?.totalFailed || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-200"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {items.map((item) => (
        <Card 
          key={item.label} 
          className={`border ${item.border} shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{item.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
