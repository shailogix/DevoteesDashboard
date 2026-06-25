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

  if (!isAdmin) return null;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-amber-50/20 via-background to-orange-50/20 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border/80 rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
            <span className="text-white text-3xl font-bold font-serif">॥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Account Awaiting Approval</h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your devotee registration has been submitted and is currently pending administrator verification.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 bg-muted/40 p-5 rounded-xl border border-border/40">
          <div className="space-y-1 text-center">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Have an Activation Code?
            </label>
            <p className="text-xs text-muted-foreground">Enter the 7-digit code provided by your admin</p>
          </div>
          
          <input
            type="text"
            maxLength={7}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="0000000"
            className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {error && (
            <div className="text-xs text-destructive flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-xs text-green-600 font-medium text-center">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={verifying || code.length !== 7}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-md shadow-orange-500/10"
          >
            {verifying ? "Activating..." : "Verify Code"}
          </Button>
        </form>

        <div className="pt-2 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout & Sign In with Another Account
          </Button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, isAdmin, isApproved, logout } = useAuth();
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
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/" component={isAdmin ? Dashboard : DevoteeDashboard} />
            <Route path="/devotees" component={Devotees} />
            <Route path="/families" component={Families} />
            <Route path="/mentors" component={Mentors} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/donations" component={Donations} />
            <Route path="/events" component={Events} />
            <Route path="/volunteering" component={Volunteering} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/mandals" component={Mandals} />
            <Route path="/sabha-locations" component={SabhaLocations} />
            <Route path="/groups" component={Groups} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/devotee-dashboard" component={DevoteeDashboard} />
            <Route path="/polls-quizzes" component={PollsQuizzes} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/import-data">
              <AdminRoute component={ImportData} />
            </Route>
            <Route path="/dashboard-designer" component={DashboardDesigner} />
            <Route path="/dev-studio">
              <AdminRoute component={DevStudio} />
            </Route>
            <Route path="/devotees/:id" component={DevoteeProfilePage} />
            <Route path="/events/:id" component={EventDetailPage} />
            <Route path="/families/:id" component={FamilyDetailPage} />
            <Route path="/id-cards" component={IDCardGenerator} />
            <Route path="/settings" component={Settings} />
            <Route path="/page/:slug" component={DynamicPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      <EditModeCursor />
      <GodModeEditorPanel />
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
