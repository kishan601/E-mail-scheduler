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
import { Trash2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-32 text-[#64748B] bg-white rounded-[2.5rem] border-2 border-dashed border-[#E2E8F0] shadow-inner">
        <div className="bg-[#F1F5F9] p-6 rounded-full mb-6 shadow-sm">
          <RefreshCw className="h-10 w-10 text-[#94A3B8] animate-[spin_4s_linear_infinite]" />
        </div>
        <h3 className="text-2xl font-bold text-[#1E293B]">No emails found</h3>
        <p className="text-[#64748B] mt-2 text-lg">There are no emails with status "{status}".</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[#E2E8F0] shadow-xl bg-white overflow-hidden transition-all duration-500">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8FAFC] border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
            <TableHead className="w-[300px] text-[#475569] font-bold py-6 pl-8">Subject</TableHead>
            <TableHead className="text-[#475569] font-bold py-6">Recipient</TableHead>
            <TableHead className="text-[#475569] font-bold py-6">{status === "scheduled" ? "Scheduled For" : "Sent At"}</TableHead>
            <TableHead className="w-[140px] text-[#475569] font-bold py-6">Status</TableHead>
            <TableHead className="text-right text-[#475569] font-bold py-6 pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow key={email.id} className="group hover:bg-[#F1F5F9]/50 transition-all border-b border-[#F1F5F9] last:border-0">
              <TableCell className="font-semibold text-[#1E293B] py-6 pl-8">{email.subject}</TableCell>
              <TableCell className="text-[#64748B] py-6 font-medium">{email.recipient}</TableCell>
              <TableCell className="text-[#64748B] py-6 font-medium">
                {status === "scheduled" 
                  ? format(new Date(email.scheduledTime), "PPp")
                  : email.sentTime ? format(new Date(email.sentTime), "PPp") : "-"}
              </TableCell>
              <TableCell className="py-6">
                <StatusBadge status={email.status} />
              </TableCell>
              <TableCell className="text-right py-6 pr-8">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-[#FEE2E2]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold text-[#1E293B]">Delete this campaign?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#64748B] text-lg">
                        This will permanently remove the email from your list. This action cannot be reversed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-4">
                      <AlertDialogCancel className="rounded-xl border-[#E2E8F0] font-semibold">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-xl font-semibold shadow-lg shadow-red-200"
                        onClick={() => handleDelete(email.id)}
                      >
                        {deletingId === email.id ? "Removing..." : "Delete Campaign"}
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
    scheduled: "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] border-[#DBEAFE] shadow-sm shadow-blue-50",
    processing: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] border-[#FEF3C7] shadow-sm shadow-amber-50",
    sent: "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] border-[#D1FAE5] shadow-sm shadow-emerald-50",
    failed: "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] border-[#FEE2E2] shadow-sm shadow-red-50",
    cancelled: "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border-[#E2E8F0] shadow-sm shadow-slate-50",
  };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const className = styles[status as keyof typeof styles] || styles.cancelled;

  return (
    <Badge variant="outline" className={`${className} font-bold border-2 px-3 py-1 rounded-lg transition-all`}>
      {label}
    </Badge>
  );
}
