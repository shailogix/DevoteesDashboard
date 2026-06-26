import { useTheme } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";

// Theme visual config: primary gradient + background preview for each theme
const THEME_VISUALS: Record<string, { gradient: string; bg: string; label: string }> = {
  devotional: {
    gradient: "from-orange-500 to-rose-700",
    bg: "bg-amber-50",
    label: "Saffron\nSanctum",
  },
  matrix: {
    gradient: "from-indigo-500 to-violet-700",
    bg: "bg-zinc-900",
    label: "Carbon\nNoir",
  },
  ironman: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-slate-900",
    label: "Aurora\nDark",
  },
  ocean: {
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-sky-50",
    label: "Arctic\nFrost",
  },
  forest: {
    gradient: "from-emerald-600 to-teal-700",
    bg: "bg-green-50",
    label: "Sage\nBloom",
  },
  royal: {
    gradient: "from-violet-600 to-purple-800",
    bg: "bg-purple-50",
    label: "Velvet\nOrchid",
  },
  sunset: {
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    label: "Neon\nSakura",
  },
  midnight: {
    gradient: "from-blue-500 to-indigo-700",
    bg: "bg-slate-950",
    label: "Obsidian\nElite",
  },
};

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
        Color Theme
      </p>
      {/* M3 theme swatch grid — 4 columns */}
      <div className="grid grid-cols-4 gap-1.5">
        {themes.map((t) => {
          const visual = THEME_VISUALS[t.value];
          const isActive = theme === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as any)}
              title={t.label}
              className={[
                "relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isActive
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-[var(--surface-container,var(--card))] scale-105"
                  : "opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              {/* Color swatch */}
              <div
                className={[
                  "w-full aspect-square rounded-lg bg-gradient-to-br shadow-elevation-1",
                  visual?.gradient ?? "from-primary to-secondary",
                  "flex items-center justify-center",
                ].join(" ")}
              >
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center animate-spring-pop">
                    <Check className="w-3 h-3 text-white font-black" strokeWidth={3} />
                  </div>
                )}
              </div>
              {/* Theme name — two lines */}
              <span className="text-[9px] font-bold text-muted-foreground leading-tight text-center whitespace-pre-line">
                {visual?.label ?? t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
