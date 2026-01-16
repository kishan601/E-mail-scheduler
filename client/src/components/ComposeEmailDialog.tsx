import { useState } from "react";
import { useScheduleEmails } from "@/hooks/use-emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Upload, CalendarClock, Mail, AlertCircle, Send, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { z } from "zod";

const emailSchema = z.string().email();

export function ComposeEmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const scheduleMutation = useScheduleEmails();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    Papa.parse(file, {
      complete: (results) => {
        const emails: string[] = [];
        const errors: any[] = [];
        
        // Simple heuristic: assume the first column that looks like an email is the email
        // Or just scan all cells
        results.data.forEach((row: any) => {
          const rowValues = Array.isArray(row) ? row : Object.values(row);
          rowValues.forEach((val: any) => {
            if (typeof val === 'string') {
              const cleaned = val.trim();
              if (emailSchema.safeParse(cleaned).success) {
                emails.push(cleaned);
              }
            }
          });
        });

        if (emails.length === 0) {
          setFileError("No valid email addresses found in CSV.");
        } else {
          setRecipients([...new Set(emails)]); // Dedupe
          toast({
            title: "CSV Parsed",
            description: `Found ${emails.length} valid recipients.`,
          });
        }
      },
      error: (err) => {
        setFileError("Failed to parse CSV file.");
        console.error(err);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please upload a CSV with email addresses.",
        variant: "destructive",
      });
      return;
    }

    if (!startTime) {
      toast({
        title: "Missing Schedule Time",
        description: "Please select when to start sending.",
        variant: "destructive",
      });
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        subject,
        body,
        recipients,
        startTime: new Date(startTime).toISOString(),
        delay: 5, // Default 5s delay
        hourlyLimit: 100, // Default 100/hr
      });

      toast({
        title: "Campaign Scheduled",
        description: `Successfully queued emails for ${recipients.length} recipients.`,
      });
      setOpen(false);
      
      // Reset form
      setSubject("");
      setBody("");
      setRecipients([]);
      setStartTime("");
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-7 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 gap-3">
          <Send className="h-5 w-5" />
          Compose New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Create Campaign</DialogTitle>
          <DialogDescription>
            Schedule bulk emails to your contact list. Upload a CSV to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input 
              id="subject" 
              placeholder="e.g., Monthly Newsletter - October" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Content</Label>
            <Textarea 
              id="body" 
              placeholder="Write your message here..." 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="min-h-[150px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recipients (CSV)</Label>
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-muted/30 relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {recipients.length > 0 
                      ? `${recipients.length} recipients loaded` 
                      : "Drop CSV or click to browse"}
                  </span>
                </div>
              </div>
              {fileError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {fileError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Start Sending At</Label>
              <div className="relative">
                <CalendarClock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="start-time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Local time. Server will convert to UTC.</p>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={scheduleMutation.isPending || recipients.length === 0}
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              {scheduleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Campaign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
