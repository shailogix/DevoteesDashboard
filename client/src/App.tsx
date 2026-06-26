import { useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { ErrorBoundary } from "@/components/Common/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Layout/Sidebar";
import { useDevMode } from "@/contexts/DevModeContext";
import { DevModeProvider } from "@/contexts/DevModeContext";
import { VisualEditorProvider, useVisualEditor } from "@/contexts/VisualEditorContext";
import { GodModeEditorPanel } from "@/components/GodModeEditor/GodModeEditorPanel";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Devotees from "@/pages/Devotees";
import Families from "@/pages/Families";
import Mentors from "@/pages/Mentors";
import Attendance from "@/pages/Attendance";
import Donations from "@/pages/Donations";
import Events from "@/pages/Events";
import Volunteering from "@/pages/Volunteering";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import IDCardGenerator from "@/pages/IDCardGenerator";
import DevoteeProfilePage from "@/pages/DevoteeProfilePage";
import EventDetailPage from "@/pages/EventDetailPage";
import FamilyDetailPage from "@/pages/FamilyDetailPage";
import DevStudio from "@/pages/DevStudio";
import DashboardDesigner from "@/components/Dashboard/DashboardDesigner";
import DynamicPage from "@/pages/DynamicPage";
import Mandals from "@/pages/Mandals";
import SabhaLocations from "@/pages/SabhaLocations";
import Groups from "@/pages/Groups";
import Notifications from "@/pages/Notifications";
import DevoteeDashboard from "@/pages/DevoteeDashboard";
import ImportData from "@/pages/ImportData";
import PollsQuizzes from "@/pages/PollsQuizzes";
import Feedback from "@/pages/Feedback";

function EditModeCursor() {
  const { isEditMode } = useVisualEditor();
  useEffect(() => {
    if (isEditMode) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }
    return () => { document.body.style.cursor = ''; };
  }, [isEditMode]);
  return null;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background particle-bg">
        <div className="text-center space-y-5 animate-fade-in-up">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-elevation-3 animate-spring-pop">
              <span className="text-primary-foreground text-2xl font-black">॥</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Madhav Parivar</h1>
            <p className="text-muted-foreground text-sm font-medium">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;
  return <Component />;
}

function SuperAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSuperAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      navigate("/");
    }
  }, [isLoading, isSuperAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-primary-foreground text-2xl font-bold">॥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Madhav Parivar</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) return null;
  return <Component />;
}

function LeaderRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLeader, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isLeader) {
      navigate("/");
    }
  }, [isLoading, isLeader, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-primary-foreground text-2xl font-bold">॥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Madhav Parivar</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLeader) return null;
  return <Component />;
}


import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

function PendingApprovalScreen({ logout }: { logout: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifying, setVerifying] = useState(false);
  const queryClient = useQueryClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 7) {
      setError("Activation code must be exactly 7 digits");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to verify activation code");
      } else {
        setSuccess("Account activated successfully! Reloading...");
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }, 1500);
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background particle-bg p-4">
      {/* Ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full animate-fade-in-up">
        <div className="rounded-3xl border border-border/50 bg-[var(--surface-container-high,var(--card))] shadow-elevation-4 overflow-hidden">
          {/* M3 gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />

          <div className="p-8 space-y-7">
            {/* Logo */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-elevation-3 animate-spring-pop">
                  <span className="text-white text-3xl font-black">॥</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Account Awaiting Approval</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  Your devotee registration is pending administrator verification.
                </p>
              </div>
            </div>

            {/* Activation code form */}
            <div className="rounded-2xl bg-muted/40 p-5 border border-border/40 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Have an Activation Code?</p>
                <p className="text-xs text-muted-foreground">Enter the 7-digit code from your admin</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <input
                  type="text"
                  maxLength={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000000"
                  className="w-full text-center tracking-[0.5em] text-xl font-black py-3.5 rounded-xl border-0 border-b-2 border-border/60 bg-muted/60 focus:outline-none focus:border-amber-500 focus:bg-muted/80 transition-all"
                />

                {error && (
                  <div className="text-xs text-destructive flex items-center justify-center gap-1.5 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="text-xs text-emerald-600 font-bold text-center">{success}</div>
                )}

                <Button
                  type="submit"
                  disabled={verifying || code.length !== 7}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full border-0 shadow-elevation-2 hover:shadow-elevation-3"
                >
                  {verifying ? "Activating…" : "Verify Code"}
                </Button>
              </form>
            </div>

            {/* Logout */}
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground text-xs rounded-full">
                <LogOut className="w-3.5 h-3.5" />
                Logout &amp; Sign In with Another Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, isAdmin, isLeader, isSuperAdmin, isApproved, logout, isViewingAsDevotee } = useAuth();
  const { isDevMode } = useDevMode();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-primary-foreground text-2xl font-bold">॥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Madhav Parivar</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isApproved) {
    return <PendingApprovalScreen logout={logout} />;
  }

  return (
    <div className={`h-screen flex bg-background flex-col ${isDevMode ? 'pt-7' : ''}`}>
      {isViewingAsDevotee && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-5 py-2.5 flex items-center justify-between z-50 shadow-elevation-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Previewing Devotee User Portal
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("view_as_role");
              window.location.reload();
            }}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 font-bold transition-colors text-xs ml-2"
          >
            ← Back to Admin Portal
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/" component={(isAdmin || isLeader) ? Dashboard : DevoteeDashboard} />
            <Route path="/devotees">
              <LeaderRoute component={Devotees} />
            </Route>
            <Route path="/families">
              <AdminRoute component={Families} />
            </Route>
            <Route path="/mentors">
              <LeaderRoute component={Mentors} />
            </Route>
            <Route path="/attendance">
              <LeaderRoute component={Attendance} />
            </Route>
            <Route path="/donations">
              <AdminRoute component={Donations} />
            </Route>
            <Route path="/events">
              <LeaderRoute component={Events} />
            </Route>
            <Route path="/volunteering">
              <LeaderRoute component={Volunteering} />
            </Route>
            <Route path="/analytics">
              <AdminRoute component={Analytics} />
            </Route>
            <Route path="/mandals">
              <AdminRoute component={Mandals} />
            </Route>
            <Route path="/sabha-locations">
              <AdminRoute component={SabhaLocations} />
            </Route>
            <Route path="/groups">
              <LeaderRoute component={Groups} />
            </Route>
            <Route path="/notifications" component={Notifications} />
            <Route path="/devotee-dashboard" component={DevoteeDashboard} />
            <Route path="/polls-quizzes" component={PollsQuizzes} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/import-data">
              <AdminRoute component={ImportData} />
            </Route>
            <Route path="/dashboard-designer">
              <SuperAdminRoute component={DashboardDesigner} />
            </Route>
            <Route path="/dev-studio">
              <SuperAdminRoute component={DevStudio} />
            </Route>
            <Route path="/devotees/:id">
              <LeaderRoute component={DevoteeProfilePage} />
            </Route>
            <Route path="/events/:id">
              <LeaderRoute component={EventDetailPage} />
            </Route>
            <Route path="/families/:id">
              <AdminRoute component={FamilyDetailPage} />
            </Route>
            <Route path="/id-cards">
              <AdminRoute component={IDCardGenerator} />
            </Route>
            <Route path="/settings">
              <AdminRoute component={Settings} />
            </Route>
            <Route path="/page/:slug" component={DynamicPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      {isSuperAdmin && <EditModeCursor />}
      {isSuperAdmin && <GodModeEditorPanel />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <DevModeProvider>
            <VisualEditorProvider>
              <DashboardProvider>
                <TooltipProvider>
                  <Toaster />
                  <AppContent />
                </TooltipProvider>
              </DashboardProvider>
            </VisualEditorProvider>
          </DevModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
