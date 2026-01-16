import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Zap, Shield, ArrowRight, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Send className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display">MailFlow</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleLogin}>Log in</Button>
            <Button onClick={handleLogin}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Bulk scheduling is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground leading-[1.1]">
            Schedule emails like a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Pro Developer</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The most reliable way to schedule bulk email campaigns. Upload CSVs, set your schedule, and let our queue system handle the delivery with precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1" onClick={handleLogin}>
              Start Scheduling Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full hover:bg-muted/50" onClick={() => window.open('https://github.com', '_blank')}>
              View Documentation
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 w-full max-w-6xl mx-auto rounded-xl border bg-card/50 shadow-2xl overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="h-10 border-b bg-muted/30 flex items-center px-4 gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <div className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="aspect-[16/9] bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center text-muted-foreground/30 font-display text-4xl">
            {/* Ideally an image here, but abstract representation works for code gen */}
            Dashboard Preview UI
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={Zap}
              title="Bulk Processing"
              description="Upload CSVs with thousands of recipients. Our queue system processes them efficiently without timeouts."
            />
            <FeatureCard 
              icon={Clock}
              title="Precision Scheduling"
              description="Set exact times for delivery. We handle timezone conversions and ensure punctual arrival."
            />
            <FeatureCard 
              icon={Shield}
              title="Reliable Delivery"
              description="Built-in rate limiting and retries ensure your emails land in inboxes, not spam folders."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/90 p-1.5 rounded-lg">
              <Send className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold font-display">MailFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 MailFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-start space-y-4 p-8 rounded-2xl bg-background border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold font-display">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
