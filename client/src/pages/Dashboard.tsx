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
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">MailFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {user?.firstName?.[0] || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && <p className="font-medium">{user.firstName} {user.lastName}</p>}
                    {user?.email && <p className="text-xs text-muted-foreground truncate w-[180px]">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Overview of your scheduled email campaigns.</p>
          </div>
          <ComposeEmailDialog />
        </div>

        <StatsCards />

        <div className="space-y-6">
          <Tabs defaultValue="scheduled" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1 border">
                <TabsTrigger value="scheduled" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Clock className="h-4 w-4" />
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Send className="h-4 w-4" />
                  Sent History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scheduled" className="mt-0 outline-none animate-in fade-in-50 duration-300">
              <EmailList status="scheduled" />
            </TabsContent>
            
            <TabsContent value="sent" className="mt-0 outline-none animate-in fade-in-50 duration-300">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Successfully Sent
                  </h3>
                  <EmailList status="sent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Failed Attempts
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
