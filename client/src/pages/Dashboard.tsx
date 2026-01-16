import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposeEmailDialog } from "@/components/ComposeEmailDialog";
import { StatsCards } from "@/components/StatsCards";
import { EmailList } from "@/components/EmailList";
import { LogOut, LayoutDashboard, Send, Clock, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#EEF2FF] p-2 rounded-xl border border-[#E0E7FF]">
              <Send className="h-6 w-6 text-[#4F46E5] -rotate-12" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">MailFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 border border-[#E2E8F0]">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-[#F1F5F9] text-[#475569] font-semibold">
                      {user?.firstName?.[0] || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2 border-b">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>}
                    {user?.email && <p className="text-xs text-[#64748B] truncate w-[180px]">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => logout()} className="text-[#EF4444] focus:text-[#EF4444] cursor-pointer mt-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#1E293B]">Dashboard</h2>
            <p className="text-[#64748B] mt-2 text-lg">Overview of your scheduled email campaigns.</p>
          </div>
          <ComposeEmailDialog />
        </div>

        <StatsCards />

        <div className="mt-12">
          <Tabs defaultValue="scheduled" className="w-full">
            <div className="flex items-center justify-start mb-8">
              <TabsList className="bg-[#F1F5F9] p-1.5 rounded-xl border border-[#E2E8F0]">
                <TabsTrigger 
                  value="scheduled" 
                  className="px-6 py-2.5 rounded-lg gap-2.5 data-[state=active]:bg-white data-[state=active]:text-[#1E293B] data-[state=active]:shadow-sm transition-all text-[#64748B] font-semibold"
                >
                  <Clock className="h-4 w-4" />
                  Scheduled
                </TabsTrigger>
                <TabsTrigger 
                  value="sent" 
                  className="px-6 py-2.5 rounded-lg gap-2.5 data-[state=active]:bg-white data-[state=active]:text-[#1E293B] data-[state=active]:shadow-sm transition-all text-[#64748B] font-semibold"
                >
                  <Send className="h-4 w-4" />
                  Sent History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scheduled" className="mt-0 outline-none animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
              <EmailList status="scheduled" />
            </TabsContent>
            
            <TabsContent value="sent" className="mt-0 outline-none animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
              <div className="grid grid-cols-1 gap-10">
                <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[#1E293B]">
                    <div className="h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
                    Successfully Sent
                  </h3>
                  <EmailList status="sent" />
                </div>
                <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[#1E293B]">
                    <div className="h-3 w-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> 
                    Failed Attempts
                  </h3>
                  <EmailList status="failed" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
