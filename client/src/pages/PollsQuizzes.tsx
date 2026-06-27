import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { HelpCircle, BarChart3, Plus, Vote, Trophy, Check, Radio, AlertCircle } from "lucide-react";

export default function PollsQuizzes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"polls" | "quizzes">("polls");
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  // Load Polls and Quizzes
  const { data: polls = [], isLoading: loadingPolls, isError: pollsError, error: pollsErr, refetch: refetchPolls } = useQuery<any[]>({ queryKey: ["/api/polls"] });
  const { data: quizzes = [], isLoading: loadingQuizzes, isError: quizzesError, error: quizzesErr, refetch: refetchQuizzes } = useQuery<any[]>({ queryKey: ["/api/quizzes"] });

  // Creation State
  const [pollForm, setPollForm] = useState({ title: "", description: "", option1: "", option2: "", option3: "" });
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    qText: "",
    opt1: "",
    opt2: "",
    opt3: "",
    correctAnswer: "1"
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: number, optionId: number }) => {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vote Cast", description: "Your response has been registered." });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to Vote", description: "You might have already voted or poll is closed.", variant: "destructive" });
    }
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ quizId, answers }: { quizId: number, answers: any }) => {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Quiz submission failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Quiz Completed", description: `You scored ${data.score}/${data.totalQuestions}!` });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    }
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Poll Created Successfully" });
      setShowCreatePoll(false);
      setPollForm({ title: "", description: "", option1: "", option2: "", option3: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    }
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Quiz Created Successfully" });
      setShowCreateQuiz(false);
      setQuizForm({ title: "", description: "", qText: "", opt1: "", opt2: "", opt3: "", correctAnswer: "1" });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    }
  });

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const options = [pollForm.option1, pollForm.option2].filter(Boolean);
    if (pollForm.option3) options.push(pollForm.option3);
    createPollMutation.mutate({
      title: pollForm.title,
      description: pollForm.description,
      options,
    });
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    createQuizMutation.mutate({
      title: quizForm.title,
      description: quizForm.description,
      questions: [{
        questionText: quizForm.qText,
        options: [quizForm.opt1, quizForm.opt2, quizForm.opt3].filter(Boolean),
        correctAnswer: quizForm.correctAnswer === "1" ? quizForm.opt1 : (quizForm.correctAnswer === "2" ? quizForm.opt2 : quizForm.opt3)
      }]
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="Polls & Quizzes" 
        subtitle="Voice your opinions and test your scriptural knowledge with community polls and quizzes." 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "polls" ? "default" : "ghost"}
              onClick={() => setActiveTab("polls")}
              className="text-xs"
            >
              <Vote className="w-4 h-4 mr-1.5" /> Polls
            </Button>
            <Button
              variant={activeTab === "quizzes" ? "default" : "ghost"}
              onClick={() => setActiveTab("quizzes")}
              className="text-xs"
            >
              <Trophy className="w-4 h-4 mr-1.5" /> Quizzes
            </Button>
          </div>

          {isAdmin && (
            <div>
              {activeTab === "polls" ? (
                <Button onClick={() => setShowCreatePoll(!showCreatePoll)} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Create Poll
                </Button>
              ) : (
                <Button onClick={() => setShowCreateQuiz(!showCreateQuiz)} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Create Quiz
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Create Forms */}
        {showCreatePoll && (
          <Card className="border border-border/80">
            <CardHeader><CardTitle className="text-base">Create a Poll</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div className="space-y-1">
                  <Label>Poll Title</Label>
                  <Input value={pollForm.title} onChange={e => setPollForm(prev => ({ ...prev, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input value={pollForm.description} onChange={e => setPollForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Option 1</Label>
                    <Input value={pollForm.option1} onChange={e => setPollForm(prev => ({ ...prev, option1: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Option 2</Label>
                    <Input value={pollForm.option2} onChange={e => setPollForm(prev => ({ ...prev, option2: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Option 3 (Optional)</Label>
                    <Input value={pollForm.option3} onChange={e => setPollForm(prev => ({ ...prev, option3: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowCreatePoll(false)}>Cancel</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Publish Poll</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showCreateQuiz && (
          <Card className="border border-border/80">
            <CardHeader><CardTitle className="text-base">Create a Scriptural Quiz</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Quiz Title</Label>
                    <Input value={quizForm.title} onChange={e => setQuizForm(prev => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Input value={quizForm.description} onChange={e => setQuizForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1 border-t border-border/40 pt-3">
                  <Label>Question 1 Text</Label>
                  <Input value={quizForm.qText} onChange={e => setQuizForm(prev => ({ ...prev, qText: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Option 1</Label>
                    <Input value={quizForm.opt1} onChange={e => setQuizForm(prev => ({ ...prev, opt1: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Option 2</Label>
                    <Input value={quizForm.opt2} onChange={e => setQuizForm(prev => ({ ...prev, opt2: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Option 3</Label>
                    <Input value={quizForm.opt3} onChange={e => setQuizForm(prev => ({ ...prev, opt3: e.target.value }))} required />
                  </div>
                </div>
                <div className="w-1/3">
                  <Label>Correct Answer Option</Label>
                  <select
                    className="w-full py-2 px-3 border border-border bg-background rounded-md text-sm"
                    value={quizForm.correctAnswer}
                    onChange={e => setQuizForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  >
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateQuiz(false)}>Cancel</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Publish Quiz</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content Renderers */}
        {activeTab === "polls" ? (
          <div>
            {loadingPolls ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="Loading polls..." />
              </div>
            ) : pollsError ? (
              <Card className="border-destructive/20 p-6 text-center">
                <p className="text-destructive text-sm font-semibold mb-2 flex items-center justify-center gap-1.5"><AlertCircle className="w-4 h-4" /> Failed to load polls</p>
                <p className="text-muted-foreground text-xs mb-4">{(pollsErr as any)?.message || "An unexpected error occurred."}</p>
                <Button size="sm" onClick={() => refetchPolls()}>Try Again</Button>
              </Card>
            ) : polls.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No polls published yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {polls.map((poll) => {
                  const totalVotes = poll.responses?.length || 0;
                  return (
                    <Card key={poll.id} className="border border-border/40 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-foreground">{poll.title}</CardTitle>
                        <CardDescription className="text-xs">{poll.description || "Community opinion poll"}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {poll.options?.map((opt: any) => {
                            const optVotes = poll.responses?.filter((r: any) => r.optionId === opt.id).length || 0;
                            const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                            return (
                              <div key={opt.id} className="space-y-1">
                                <button
                                  onClick={() => voteMutation.mutate({ pollId: poll.id, optionId: opt.id })}
                                  className="w-full flex justify-between items-center text-xs p-2.5 rounded-lg border border-border/50 hover:bg-muted/40 text-left transition-colors font-medium"
                                >
                                  <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-primary" /> {opt.optionText}</span>
                                  <span className="text-[10px] text-muted-foreground">{optVotes} votes ({pct}%)</span>
                                </button>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right">Total Votes: {totalVotes}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingQuizzes ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="Loading quizzes..." />
              </div>
            ) : quizzesError ? (
              <Card className="border-destructive/20 p-6 text-center">
                <p className="text-destructive text-sm font-semibold mb-2 flex items-center justify-center gap-1.5"><AlertCircle className="w-4 h-4" /> Failed to load quizzes</p>
                <p className="text-muted-foreground text-xs mb-4">{(quizzesErr as any)?.message || "An unexpected error occurred."}</p>
                <Button size="sm" onClick={() => refetchQuizzes()}>Try Again</Button>
              </Card>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No scriptural quizzes published yet</div>
            ) : (
              <div className="space-y-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="border border-border/40">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-primary" /> {quiz.title}
                      </CardTitle>
                      <CardDescription>{quiz.description || "Test your devotional wisdom"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quiz.questions?.map((q: any) => {
                        const optionsArray = Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]");
                        return (
                          <div key={q.id} className="space-y-3 p-4 bg-muted/20 border border-border/30 rounded-xl">
                            <p className="text-sm font-semibold">{q.questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {optionsArray.map((opt: string, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => submitQuizMutation.mutate({ quizId: quiz.id, answers: { [q.id]: opt } })}
                                  className="p-3 text-xs text-center border border-border/80 hover:bg-muted/40 rounded-lg font-medium transition-colors"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
