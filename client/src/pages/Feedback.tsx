import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Plus, Check, Clock, ShieldCheck, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function Feedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "suggestion" });
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  const { data: list = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/feedback"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Feedback Submitted", description: "Thank you! Admin will review your submission shortly." });
      setForm({ title: "", description: "", category: "suggestion" });
      setShowSubmit(false);
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => {
      const res = await fetch(`/api/feedback/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Feedback Updated", description: "Status successfully adjusted." });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    }
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, any> = {
      pending: <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>,
      approved: <Badge className="bg-blue-600 flex items-center gap-1"><Check className="w-3 h-3" /> Approved</Badge>,
      implemented: <Badge className="bg-green-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Implemented</Badge>,
      rejected: <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>,
    };
    return map[status] || <Badge>{status}</Badge>;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="Feedback & Suggestions" 
        subtitle="Submit feature requests, report bugs, or share suggestion ideas for the Madhav Parivar community portal." 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Community Submissions</h2>
          <Button onClick={() => setShowSubmit(!showSubmit)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Feedback
          </Button>
        </div>

        {showSubmit && (
          <Card className="border border-border/80 shadow-md">
            <CardHeader><CardTitle className="text-base">Submit Feedback</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    className="w-full py-2 px-3 border border-border bg-background rounded-md text-sm"
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="suggestion">Suggestion / Idea</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Report a Bug</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowSubmit(false)}>Cancel</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Submit Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading suggestions...</div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No feedback or suggestions recorded yet</div>
          ) : (
            list.map((item) => (
              <Card key={item.id} className="border border-border/40 hover:border-border/60 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">{item.category}</Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground mt-2">{item.title}</CardTitle>
                      <CardDescription className="text-[10px] mt-0.5">Submitted on {format(new Date(item.createdAt), "PPP")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  
                  {item.adminNotes && (
                    <div className="p-3 bg-muted/30 border border-border/30 rounded-lg text-xs">
                      <p className="font-bold text-foreground mb-1">Admin Response:</p>
                      <p className="text-muted-foreground">{item.adminNotes}</p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-3 border-t border-border/20 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Admin Response Notes</Label>
                        <Input
                          placeholder="Add update comments here..."
                          value={adminNotes[item.id] || ""}
                          onChange={e => setAdminNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => updateStatusMutation.mutate({ id: item.id, status: "approved", notes: adminNotes[item.id] })}
                          size="sm"
                          variant="outline"
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateStatusMutation.mutate({ id: item.id, status: "implemented", notes: adminNotes[item.id] })}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Mark Implemented
                        </Button>
                        <Button
                          onClick={() => updateStatusMutation.mutate({ id: item.id, status: "rejected", notes: adminNotes[item.id] })}
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
