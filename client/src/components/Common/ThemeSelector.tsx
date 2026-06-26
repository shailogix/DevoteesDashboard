import { useTheme } from "@/contexts/ThemeContext";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const THEME_VISUALS: Record<string, { gradient: string; label: string }> = {
  devotional: {
    gradient: "from-orange-500 to-rose-700",
    label: "Saffron Sanctum",
  },
  matrix: {
    gradient: "from-indigo-500 to-violet-700",
    label: "Carbon Noir",
  },
  ironman: {
    gradient: "from-blue-500 to-cyan-500",
    label: "Aurora Dark",
  },
  ocean: {
    gradient: "from-cyan-500 to-blue-600",
    label: "Arctic Frost",
  },
  forest: {
    gradient: "from-emerald-600 to-teal-700",
    label: "Sage Bloom",
  },
  royal: {
    gradient: "from-violet-600 to-purple-800",
    label: "Velvet Orchid",
  },
  sunset: {
    gradient: "from-rose-500 to-pink-600",
    label: "Neon Sakura",
  },
  midnight: {
    gradient: "from-blue-500 to-indigo-700",
    label: "Obsidian Elite",
  },
};

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
  const currentVisual = THEME_VISUALS[theme];

  return (
    <div className="space-y-1.5 w-full">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
        Theme Appearance
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-9 text-xs px-3 border-border/80 hover:bg-muted/40 font-semibold rounded-xl flex items-center gap-2 group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${currentVisual?.gradient || "from-primary to-secondary"} shadow-sm shrink-0`} />
              <span className="truncate text-foreground font-bold">{currentVisual?.label || "Select Theme"}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[190px] p-1.5 rounded-2xl border border-border/60 bg-[var(--surface-container-high,var(--card))] shadow-elevation-3 z-50">
          {themes.map((t) => {
            const visual = THEME_VISUALS[t.value];
            const isActive = theme === t.value;
            return (
              <DropdownMenuItem
                key={t.value}
                onClick={() => setTheme(t.value as any)}
                className={[
                  "flex items-center justify-between text-xs px-2.5 py-2 rounded-xl cursor-pointer hover:bg-primary/8 focus:bg-primary/8 transition-colors",
                  isActive ? "bg-primary/8 font-bold text-primary" : "text-muted-foreground"
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${visual?.gradient || "from-primary to-secondary"} shadow-sm shrink-0`} />
                  <span className="truncate leading-none">{visual?.label || t.label}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
