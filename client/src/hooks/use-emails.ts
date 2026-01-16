import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ScheduleRequestInput, type EmailResponse } from "@shared/routes";
import { z } from "zod";

export function useEmails(status?: "scheduled" | "sent" | "failed") {
  return useQuery({
    queryKey: [api.emails.list.path, status],
    queryFn: async () => {
      const url = status 
        ? `${api.emails.list.path}?status=${status}` 
        : api.emails.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch emails");
      
      const data = await res.json();
      return api.emails.list.responses[200].parse(data);
    },
  });
}

export function useEmailStats() {
  return useQuery({
    queryKey: [api.emails.stats.path],
    queryFn: async () => {
      const res = await fetch(api.emails.stats.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      const data = await res.json();
      return api.emails.stats.responses[200].parse(data);
    },
  });
}

export function useScheduleEmails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ScheduleRequestInput) => {
      // Validate with shared schema first
      const validated = api.emails.schedule.input.parse(data);
      
      const res = await fetch(api.emails.schedule.path, {
        method: api.emails.schedule.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to schedule emails");
      }

      return api.emails.schedule.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.emails.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.emails.stats.path] });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.emails.delete.path, { id });
      const res = await fetch(url, { 
        method: api.emails.delete.method,
        credentials: "include" 
      });

      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 404) throw new Error("Email not found");
      if (!res.ok) throw new Error("Failed to delete email");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.emails.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.emails.stats.path] });
    },
  });
}
