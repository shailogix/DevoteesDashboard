import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/Common/LoadingSpinner";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glassmorphism">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground text-3xl font-bold">॥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Madhav Parivar</h1>
                <p className="text-muted-foreground mt-2">Devotional Management System</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A comprehensive database system for managing devotees, families, events, and spiritual activities.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-medium text-foreground mb-2">Features:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Devotee and family management</li>
                  <li>• Attendance and donation tracking</li>
                  <li>• Event planning and coordination</li>
                  <li>• Group management with messaging</li>
                  <li>• ID card generation</li>
                  <li>• Analytics and reporting</li>
                  <li>• 8 premium themes</li>
                  <li>• Dashboard customization</li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-3"
              >
                Sign In to Continue
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Secure authentication powered by Google</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
