import { useEffect } from 'react';
import { Switch, Route } from "wouter";
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
import DevStudio from "@/pages/DevStudio";
import DashboardDesigner from "@/components/Dashboard/DashboardDesigner";

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

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
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

  return (
    <div className={`h-screen flex bg-background flex-col ${isDevMode ? 'pt-7' : ''}`}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/devotees" component={Devotees} />
            <Route path="/families" component={Families} />
            <Route path="/mentors" component={Mentors} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/donations" component={Donations} />
            <Route path="/events" component={Events} />
            <Route path="/volunteering" component={Volunteering} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/dashboard-designer" component={DashboardDesigner} />
            <Route path="/dev-studio" component={DevStudio} />
            <Route path="/devotees/:id" component={DevoteeProfilePage} />
            <Route path="/id-cards" component={IDCardGenerator} />
            <Route path="/settings" component={Settings} />
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
