import React, { createContext, useContext, useState, useCallback } from 'react';
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Eye, EyeOff, AlertTriangle, X, Layers } from "lucide-react";

const DEV_CODE = "DevelopZ";

// Module-level token store — allows VisualEditorContext and DevStudio to access the token
// without prop-drilling or circular context dependencies.
let _godModeToken: string | null = null;
export const getGodModeToken = () => _godModeToken;
export const setGodModeToken = (t: string | null) => { _godModeToken = t; };

// Helper fetch that automatically includes the GOD Mode authorization token
export async function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = _godModeToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['X-God-Mode-Token'] = token;
  return fetch(url, { ...opts, headers, credentials: 'include' });
}

interface DevModeContextType {
  isDevMode: boolean;
  godModeToken: string | null;
  activateDevMode: () => void;
  deactivateDevMode: () => void;
  deactivateGodMode: () => void;
  showDevLogin: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = React.useState(false);
  const [godModeToken, setToken] = React.useState<string | null>(null);
  const [showLogin, setShowLogin] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [showCode, setShowCode] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isActivating, setIsActivating] = React.useState(false);

  const activateDevMode = useCallback(() => setIsDevMode(true), []);
  const deactivateDevMode = useCallback(async () => {
    const token = _godModeToken;
    if (token) {
      try {
        await fetch('/api/admin/activate', {
          method: 'DELETE',
          headers: { 'X-God-Mode-Token': token },
          credentials: 'include',
        });
      } catch {}
    }
    _godModeToken = null;
    setToken(null);
    setIsDevMode(false);
  }, []);

  const deactivateGodMode = useCallback(async () => {
    const token = _godModeToken;
    if (token) {
      try {
        await fetch('/api/admin/activate', {
          method: 'DELETE',
          headers: { 'X-God-Mode-Token': token },
          credentials: 'include',
        });
      } catch {}
    }
    _godModeToken = null;
    setToken(null);
  }, []);

  const showDevLogin = useCallback(() => { setShowLogin(true); setCode(""); setError(""); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== DEV_CODE) {
      setError("Invalid developer code");
      return;
    }
    setIsActivating(true);
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: code }),
      });
      if (!res.ok) {
        setError("Server rejected activation. Check password.");
        return;
      }
      const data = await res.json();
      _godModeToken = data.token;
      setToken(data.token);
      setIsDevMode(true);
      setShowLogin(false);
      setCode("");
      setError("");
    } catch {
      setError("Failed to activate — server unreachable");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, godModeToken, activateDevMode, deactivateDevMode, deactivateGodMode, showDevLogin }}>
      {children}

      {/* Dev Mode Active Banner */}
      {isDevMode && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-1 text-xs font-medium shadow-md transition-colors ${godModeToken ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-200'}`}>
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wide">DEVELOPER MODE</span>
            {godModeToken ? (
              <Badge className="bg-black text-yellow-400 text-[10px] px-1.5 py-0 ml-0.5">DevelopZ</Badge>
            ) : (
              <Badge className="bg-zinc-600 text-zinc-300 text-[10px] px-1.5 py-0 ml-0.5">LOCKED</Badge>
            )}
            <span className={`hidden sm:inline ${godModeToken ? 'text-black/60' : 'text-zinc-400'}`}>
              — {godModeToken ? 'Full system configuration enabled' : 'GOD Mode inactive. Config is locked.'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/dev-studio">
              <button className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-colors ${godModeToken ? 'bg-black/15 hover:bg-black/25 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`} data-testid="banner-link-dev-studio">
                <Layers className="w-3 h-3" /> Dev Studio
              </button>
            </Link>
            
            {godModeToken ? (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-black hover:bg-black/15 border border-black/20 ml-1" onClick={deactivateGodMode}>
                Lock
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-zinc-200 hover:bg-white/10 border border-white/20 ml-1" onClick={showDevLogin}>
                Unlock
              </Button>
            )}

            <Button size="sm" variant="ghost" className={`h-6 px-2 text-xs border ml-1 ${godModeToken ? 'text-black hover:bg-black/15 border-black/20' : 'text-zinc-200 hover:bg-white/10 border-white/20'}`} onClick={deactivateDevMode} data-testid="banner-button-exit-dev-mode">
              <X className="w-2.5 h-2.5 mr-1" /> Exit
            </Button>
          </div>
        </div>
      )}

      {/* Dev Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-yellow-500" />
              Developer Mode Access
            </DialogTitle>
            <DialogDescription>
              Enter the developer access code to enable full system configuration capabilities.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showCode ? "text" : "password"}
                placeholder="Enter developer code"
                value={code}
                onChange={e => { setCode(e.target.value); setError(""); }}
                className={`pr-10 font-mono ${error ? "border-destructive" : ""}`}
                autoFocus
                disabled={isActivating}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" disabled={isActivating}>
                <Code2 className="w-4 h-4 mr-2" />
                {isActivating ? "Activating..." : "Activate Developer Mode"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowLogin(false)} disabled={isActivating}>Cancel</Button>
            </div>
          </form>
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Developer mode grants full access to all system settings and customizations.
          </div>
        </DialogContent>
      </Dialog>
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used within DevModeProvider");
  return ctx;
}
