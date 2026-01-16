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
      color: "text-[#2563EB]",
      bg: "bg-[#EFF6FF]",
      border: "border-[#DBEAFE]",
      iconBg: "bg-[#DBEAFE]/50",
      accent: "#2563EB"
    },
    {
      label: "Sent Successfully",
      value: stats?.totalSent || 0,
      icon: Send,
      color: "text-[#059669]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#D1FAE5]",
      iconBg: "bg-[#D1FAE5]/50",
      accent: "#059669"
    },
    {
      label: "Failed Attempts",
      value: stats?.totalFailed || 0,
      icon: AlertTriangle,
      color: "text-[#DC2626]",
      bg: "bg-[#FEF2F2]",
      border: "border-[#FEE2E2]",
      iconBg: "bg-[#FEE2E2]/50",
      accent: "#DC2626"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      {items.map((item) => (
        <Card 
          key={item.label} 
          className={`relative overflow-hidden border-2 ${item.border} ${item.bg} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group shadow-sm`}
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full ${item.color.replace('text-', 'bg-')}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-8 px-8">
            <CardTitle className="text-lg font-bold text-[#475569] tracking-tight">
              {item.label}
            </CardTitle>
            <div className={`p-3 rounded-2xl ${item.iconBg} group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <div className="text-5xl font-extrabold text-[#1E293B] tracking-tighter">
              {item.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
