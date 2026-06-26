import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";
import { Shield, User } from "lucide-react";

const FEATURES = [
  { icon: "👨‍👩‍👧‍👦", text: "Devotee & family management" },
  { icon: "📊", text: "Attendance & donation tracking" },
  { icon: "🎉", text: "Event planning & coordination" },
  { icon: "🤝", text: "Group management with messaging" },
  { icon: "🪪", text: "ID card generation" },
  { icon: "📈", text: "Analytics & reporting" },
  { icon: "🎨", text: "8 premium themes" },
  { icon: "🔧", text: "Dashboard customization" },
];

export default function Login() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const needsPortalChoice = user?.role === "admin" || user?.role === "leader";
  const showPortalChoice = isAuthenticated && needsPortalChoice && typeof window !== 'undefined' && sessionStorage.getItem("portal_choice_made") !== "true";

  useEffect(() => {
    if (isAuthenticated && (!needsPortalChoice || (typeof window !== 'undefined' && sessionStorage.getItem("portal_choice_made") === "true"))) {
      window.location.href = "/";
    }
  }, [isAuthenticated, needsPortalChoice]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background particle-bg">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  if (showPortalChoice) {
    const isAdminRole = user?.role === "admin";
    return (
      <div className="min-h-screen bg-background particle-bg flex items-center justify-center p-4">
        {/* Ambient glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl animate-fade-in-up">
          <div className="rounded-3xl border border-border/50 bg-[var(--surface-container-high,var(--card))] shadow-elevation-4 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />
            <div className="p-8 space-y-8">
              <div className="text-center space-y-3">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-elevation-3 mx-auto">
                  <span className="text-white text-2xl font-black">॥</span>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Choose Your Portal View</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As a {user?.role}, you have access to both management/leader dashboards and your personal records. Select how you would like to proceed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin/Leader Card */}
                <button
                  onClick={() => {
                    localStorage.removeItem("view_as_role");
                    sessionStorage.setItem("portal_choice_made", "true");
                    window.location.href = "/";
                  }}
                  className="group relative rounded-2xl border border-border/80 bg-muted/30 p-6 text-left hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 flex flex-col justify-between h-56 shadow-sm hover:shadow-elevation-2"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                        {isAdminRole ? "Admin Portal View" : "Leader Portal View"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {isAdminRole 
                          ? "Access the full database management dashboard, track all devotees, run attendance, record donations, view global analytics, and configure settings."
                          : "Access the leader dashboard to coordinate congregation attendance, view RSVPs, schedule upcoming events, and manage volunteering tasks."}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-1 mt-4">
                    Access Dashboard &rarr;
                  </span>
                </button>

                {/* Devotee Card */}
                <button
                  onClick={() => {
                    localStorage.setItem("view_as_role", "devotee");
                    sessionStorage.setItem("portal_choice_made", "true");
                    window.location.href = "/";
                  }}
                  className="group relative rounded-2xl border border-border/80 bg-muted/30 p-6 text-left hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 flex flex-col justify-between h-56 shadow-sm hover:shadow-elevation-2"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-500 transition-colors">Devotee Portal View</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        View the portal as a standard devotee. Access your personal profile, check family connection records, answer quizzes, vote on polls, and view your donations.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-700 dark:text-orange-500 flex items-center gap-1 mt-4">
                    View My Portal &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background particle-bg flex items-center justify-center p-4">
      {/* Ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/8 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* Main login card */}
        <div className="rounded-3xl border border-border/50 bg-[var(--surface-container-high,var(--card))] shadow-elevation-4 overflow-hidden">

          {/* Gradient header bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

          <div className="p-8 space-y-8">
            {/* Logo & Title */}
            <div className="text-center space-y-5">
              {/* M3 Expressive logo — animated */}
              <div className="relative inline-flex items-center justify-center">
                {/* Outer pulse ring */}
                <div className="absolute w-24 h-24 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                {/* Logo container */}
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-elevation-3 animate-spring-pop">
                  <span className="text-primary-foreground text-4xl font-black select-none">॥</span>
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  Madhav Parivar
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">
                  Devotional Management System
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              A comprehensive platform for managing devotees, families,
              events, and spiritual activities with precision and grace.
            </p>

            {/* Feature chips grid */}
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[var(--surface-container,var(--muted))] animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                >
                  <span className="text-lg leading-none">{f.icon}</span>
                  <span className="text-xs font-semibold text-muted-foreground leading-tight">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Sign In Button — M3 Filled, full width, large */}
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "/api/login"}
                size="lg"
                className="w-full h-14 text-base font-bold rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0"
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>

              <p className="text-xs text-muted-foreground text-center font-medium">
                🔒 Secure authentication — your data stays private
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6 font-medium">
          Madhav Parivar · Devotional Database System · v2.0
        </p>
      </div>
    </div>
  );
}
