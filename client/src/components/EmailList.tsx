import { useEmails, useDeleteEmail } from "@/hooks/use-emails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface EmailListProps {
  status: "scheduled" | "sent" | "failed";
}

export function EmailList({ status }: EmailListProps) {
  const { data: emails, isLoading, error } = useEmails(status);
  const deleteMutation = useDeleteEmail();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Loading {status} emails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-4" />
        <p>Failed to load emails</p>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
        <div className="bg-muted p-4 rounded-full mb-4">
          <RefreshCw className="h-6 w-6 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No emails found</h3>
        <p className="text-sm mt-1">There are no emails with status "{status}".</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[300px]">Subject</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>{status === "scheduled" ? "Scheduled For" : "Sent At"}</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow key={email.id} className="group hover:bg-muted/20 transition-colors">
              <TableCell className="font-medium text-foreground">{email.subject}</TableCell>
              <TableCell className="text-muted-foreground">{email.recipient}</TableCell>
              <TableCell>
                {status === "scheduled" 
                  ? format(new Date(email.scheduledTime), "PPp")
                  : email.sentTime ? format(new Date(email.sentTime), "PPp") : "-"}
              </TableCell>
              <TableCell>
                <StatusBadge status={email.status} />
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this email from the queue. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(email.id)}
                      >
                        {deletingId === email.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    scheduled: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
    sent: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
    failed: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const className = styles[status as keyof typeof styles] || styles.cancelled;

  return (
    <Badge variant="outline" className={`${className} font-medium border`}>
      {label}
    </Badge>
  );
}
