import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface CardSettings {
  template: string;
  showPhoto: boolean;
  showQR: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showSpiritualLevel: boolean;
  showEvent: boolean;
  orgName: string;
  cardTitle: string;
  customMessage: string;
  cardSize: string;
  useSpiritualColor: boolean;
  event?: any;
}

interface IDCardPreviewProps {
  devotee: any;
  settings: CardSettings;
  scale?: number;
}

export const SPIRITUAL_LEVELS: Record<string, { label: string; gradient: string; headerGrad: string; badge: string; accent: string; symbol: string; border: string }> = {
  beginner:     { label: "Sadhaka",       gradient: "from-emerald-400 to-green-600",    headerGrad: "from-emerald-500 to-green-700",     badge: "bg-emerald-100 text-emerald-800",  accent: "#059669", symbol: "🌱", border: "#6ee7b7" },
  seeker:       { label: "Mumukshu",      gradient: "from-sky-400 to-blue-600",         headerGrad: "from-sky-500 to-blue-700",          badge: "bg-sky-100 text-sky-800",          accent: "#0284c7", symbol: "💠", border: "#7dd3fc" },
  intermediate: { label: "Shishya",       gradient: "from-violet-400 to-purple-600",    headerGrad: "from-violet-500 to-purple-700",     badge: "bg-violet-100 text-violet-800",    accent: "#7c3aed", symbol: "🔮", border: "#c4b5fd" },
  initiated:    { label: "Dikshit",       gradient: "from-amber-400 to-orange-600",     headerGrad: "from-amber-500 to-orange-600",      badge: "bg-amber-100 text-amber-800",      accent: "#d97706", symbol: "🪷", border: "#fcd34d" },
  advanced:     { label: "Sr. Devotee",   gradient: "from-rose-400 to-red-600",         headerGrad: "from-rose-500 to-red-700",          badge: "bg-rose-100 text-rose-800",        accent: "#e11d48", symbol: "🌸", border: "#fda4af" },
  vaishnava:    { label: "Vaishnava",     gradient: "from-orange-400 to-amber-500",     headerGrad: "from-orange-500 to-red-600",        badge: "bg-orange-100 text-orange-800",    accent: "#ea580c", symbol: "🙏", border: "#fdba74" },
  default:      { label: "Devotee",       gradient: "from-slate-400 to-gray-600",       headerGrad: "from-slate-500 to-gray-700",        badge: "bg-gray-100 text-gray-800",        accent: "#475569", symbol: "✨", border: "#cbd5e1" },
};

export const TEMPLATES = [
  {
    id: "devotional",
    name: "Devotional Classic",
    desc: "Traditional saffron & maroon",
    previewGrad: "from-orange-500 to-red-700",
    textColor: "#fff",
    category: "spiritual",
  },
  {
    id: "festival",
    name: "Festival Gold",
    desc: "Vibrant gold for festivals",
    previewGrad: "from-yellow-400 to-orange-500",
    textColor: "#fff",
    category: "event",
  },
  {
    id: "vip",
    name: "VIP Platinum",
    desc: "Luxury dark with gold trim",
    previewGrad: "from-gray-800 to-gray-900",
    textColor: "#fbbf24",
    category: "official",
  },
  {
    id: "royal",
    name: "Royal Purple",
    desc: "Regal deep purple & gold",
    previewGrad: "from-purple-700 to-indigo-800",
    textColor: "#fde68a",
    category: "official",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    desc: "Modern minimalist white",
    previewGrad: "from-gray-50 to-gray-100",
    textColor: "#1e293b",
    category: "modern",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    desc: "Calm blue-teal gradients",
    previewGrad: "from-blue-500 to-teal-600",
    textColor: "#fff",
    category: "modern",
  },
  {
    id: "forest",
    name: "Forest Retreat",
    desc: "Earthy green for ashrams",
    previewGrad: "from-green-600 to-emerald-800",
    textColor: "#fff",
    category: "spiritual",
  },
  {
    id: "holographic",
    name: "Holographic",
    desc: "Dazzling rainbow gradient",
    previewGrad: "from-pink-500 via-purple-500 to-blue-500",
    textColor: "#fff",
    category: "modern",
  },
  {
    id: "seva",
    name: "Seva Warrior",
    desc: "Bold red for volunteers",
    previewGrad: "from-red-600 to-rose-800",
    textColor: "#fff",
    category: "event",
  },
  {
    id: "midnight",
    name: "Night Temple",
    desc: "Dark with glowing accents",
    previewGrad: "from-slate-900 to-blue-950",
    textColor: "#a5f3fc",
    category: "modern",
  },
  {
    id: "youth",
    name: "Youth Energy",
    desc: "Vibrant for youth events",
    previewGrad: "from-fuchsia-500 to-violet-600",
    textColor: "#fff",
    category: "event",
  },
  {
    id: "event-pass",
    name: "Event Pass",
    desc: "Landscape event entry card",
    previewGrad: "from-teal-500 to-cyan-600",
    textColor: "#fff",
    category: "event",
  },
];

function QRPlaceholder({ size = 56, color = "#374151" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="2" fill={color} opacity="0.15"/>
      <rect x="4" y="4" width="16" height="16" rx="1" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="8" y="8" width="8" height="8" fill={color}/>
      <rect x="34" y="2" width="20" height="20" rx="2" fill={color} opacity="0.15"/>
      <rect x="36" y="4" width="16" height="16" rx="1" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="40" y="8" width="8" height="8" fill={color}/>
      <rect x="2" y="34" width="20" height="20" rx="2" fill={color} opacity="0.15"/>
      <rect x="4" y="36" width="16" height="16" rx="1" fill="none" stroke={color} strokeWidth="2"/>
      <rect x="8" y="40" width="8" height="8" fill={color}/>
      <rect x="32" y="32" width="4" height="4" fill={color}/>
      <rect x="38" y="32" width="4" height="4" fill={color}/>
      <rect x="44" y="32" width="8" height="4" fill={color}/>
      <rect x="32" y="38" width="4" height="4" fill={color}/>
      <rect x="38" y="38" width="8" height="8" fill={color}/>
      <rect x="48" y="38" width="4" height="4" fill={color}/>
      <rect x="32" y="48" width="8" height="4" fill={color}/>
      <rect x="44" y="46" width="8" height="6" fill={color}/>
    </svg>
  );
}

function SpiritualBadge({ level, small }: { level: string; small?: boolean }) {
  const cfg = SPIRITUAL_LEVELS[level] || SPIRITUAL_LEVELS.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
      <span>{cfg.symbol}</span>
      {!small && <span>{cfg.label}</span>}
    </span>
  );
}

function DevoteeName({ devotee }: { devotee: any }) {
  return `${devotee.firstName || ""} ${devotee.lastName || ""}`.trim() || "Devotee Name";
}

function DevoteeInitials({ devotee }: { devotee: any }) {
  return `${(devotee.firstName || " ")[0]}${(devotee.lastName || " ")[0]}`.toUpperCase();
}

function CardAvatar({ devotee, size = "w-16 h-16", textSize = "text-xl", border = "border-2 border-white/60" }: any) {
  return (
    <Avatar className={`${size} ${border} shadow-md`}>
      <AvatarImage src={devotee?.photoUrl || ""} alt={`${devotee?.firstName}`} />
      <AvatarFallback className="bg-white/20 text-white font-bold">
        <span className={textSize}>{DevoteeInitials({ devotee })}</span>
      </AvatarFallback>
    </Avatar>
  );
}

function getHeaderGradient(template: string, level: string, useSpiritualColor: boolean) {
  if (useSpiritualColor) {
    const sl = SPIRITUAL_LEVELS[level] || SPIRITUAL_LEVELS.default;
    return `linear-gradient(135deg, ${sl.accent} 0%, ${sl.border} 100%)`;
  }
  const tmpl = TEMPLATES.find(t => t.id === template);
  return tmpl ? `linear-gradient(135deg, var(--tw-gradient-stops))` : "";
}

export function IDCardPreview({ devotee, settings, scale = 1 }: IDCardPreviewProps) {
  if (!devotee) return null;
  const { template, showPhoto, showQR, showPhone, showEmail, showAddress, showSpiritualLevel, showEvent, orgName, cardTitle, customMessage, useSpiritualColor, event } = settings;
  const sl = SPIRITUAL_LEVELS[devotee.spiritualLevel || "default"] || SPIRITUAL_LEVELS.default;
  const slGrad = useSpiritualColor ? sl.headerGrad : null;

  const w = settings.cardSize === "badge" ? 340 : settings.cardSize === "a6" ? 360 : 320;
  const CardWrapper = ({ children }: any) => (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", width: w, minWidth: w }}>
      {children}
    </div>
  );

  // ── DEVOTIONAL CLASSIC ──
  if (template === "devotional") {
    const header = slGrad || "linear-gradient(135deg,#f97316,#dc2626)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-orange-200" style={{ background: "#fffbf0" }}>
          <div style={{ background: header }} className="px-5 pt-5 pb-8 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-2xl font-bold">॥</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{orgName}</p>
                    <p className="text-white/70 text-[10px]">{cardTitle}</p>
                  </div>
                </div>
              </div>
              {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
            </div>
            {showPhoto && (
              <div className="flex justify-center mt-3">
                <CardAvatar devotee={devotee} size="w-20 h-20" textSize="text-2xl" border="border-4 border-white/80" />
              </div>
            )}
          </div>
          <div className="px-5 py-4 text-center -mt-4">
            <div className="bg-white rounded-xl shadow-md px-4 py-3 mb-3">
              <h2 className="text-lg font-bold text-gray-800">{DevoteeName({ devotee })}</h2>
              <p className="text-orange-600 font-mono text-xs font-bold mt-0.5">#{devotee.devoteeId || "MP-0001"}</p>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showAddress && devotee.address && <p className="text-[10px] text-gray-400">📍 {devotee.address}</p>}
              {showEvent && event && <div className="mt-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200"><p className="font-semibold text-orange-700 text-[10px]">🎉 {event.title}</p><p className="text-orange-500 text-[9px]">{event.date}</p></div>}
            </div>
            {customMessage && <p className="text-[9px] text-gray-400 italic mt-2">{customMessage}</p>}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-orange-100">
              <p className="text-[9px] text-gray-400">Jai Shri Krishna</p>
              {showQR && <QRPlaceholder size={40} color="#ea580c" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── FESTIVAL GOLD ──
  if (template === "festival") {
    const header = slGrad || "linear-gradient(135deg,#f59e0b,#f97316)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg,#fffbeb,#fef3c7)" }}>
          <div style={{ background: header }} className="px-5 py-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 text-center">
              <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">{orgName}</p>
              <p className="text-white font-bold text-base">{cardTitle}</p>
              {showEvent && event && <p className="text-yellow-100 text-xs mt-0.5">🎊 {event.title}</p>}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex gap-3 items-center">
              {showPhoto && <CardAvatar devotee={devotee} size="w-16 h-16" border="border-3 border-yellow-400 shadow-lg" />}
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-base leading-tight">{DevoteeName({ devotee })}</h2>
                <p className="text-yellow-600 font-mono text-[11px] font-bold">#{devotee.devoteeId || "MP-0001"}</p>
                {showSpiritualLevel && <div className="mt-1"><SpiritualBadge level={devotee.spiritualLevel || "default"} /></div>}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-gray-600">
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showEvent && event && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2"><p className="font-bold text-yellow-700 text-[10px]">{event.title}</p><p className="text-yellow-500 text-[9px]">{event.date} · {event.location}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-yellow-200">
              {customMessage && <p className="text-[9px] text-gray-400 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#d97706" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── VIP PLATINUM ──
  if (template === "vip") {
    const header = slGrad || "linear-gradient(135deg,#1e293b,#0f172a)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg,#0f172a,#1e293b)", border: "1px solid #fbbf24" }}>
          <div style={{ background: header }} className="px-5 py-4 relative" >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400/70 text-[9px] uppercase tracking-[3px]">Exclusive</p>
                <p className="text-yellow-400 font-bold text-sm">{orgName}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400/60 text-[9px]">{cardTitle}</p>
                {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              {showPhoto && <CardAvatar devotee={devotee} size="w-16 h-16" border="border-2 border-yellow-500" />}
              <div>
                <h2 className="text-yellow-400 font-bold text-lg leading-tight">{DevoteeName({ devotee })}</h2>
                <p className="text-yellow-600 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-[11px] text-gray-400">
              {showPhone && devotee.phone && <p className="text-yellow-400/70">📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p className="text-yellow-400/70">✉ {devotee.email}</p>}
              {showAddress && devotee.address && <p className="text-[10px] text-gray-600">📍 {devotee.address}</p>}
              {showEvent && event && <div className="mt-2 border border-yellow-800 rounded-lg px-3 py-2 bg-yellow-900/20"><p className="text-yellow-400 font-bold text-[10px]">{event.title}</p><p className="text-yellow-600 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-900/40">
              {customMessage && <p className="text-[9px] text-yellow-600/60 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#fbbf24" />}
            </div>
            <div className="mt-2 h-1 rounded-full" style={{ background: "linear-gradient(90deg,#fbbf24,#f97316,#fbbf24)", opacity: 0.6 }} />
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── ROYAL PURPLE ──
  if (template === "royal") {
    const header = slGrad || "linear-gradient(135deg,#6d28d9,#4338ca)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg,#f5f3ff,#ede9fe)", border: "1px solid #ddd6fe" }}>
          <div style={{ background: header }} className="px-5 py-5 text-center relative">
            <div className="absolute inset-x-0 bottom-0 h-4" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1))" }} />
            <p className="text-purple-200 text-[10px] uppercase tracking-[3px]">{orgName}</p>
            <p className="text-yellow-300 font-bold text-base">{cardTitle}</p>
            {showPhoto && <div className="flex justify-center mt-3"><CardAvatar devotee={devotee} size="w-18 h-18" border="border-3 border-yellow-300" /></div>}
          </div>
          <div className="px-5 py-4 text-center">
            <h2 className="text-purple-900 font-bold text-lg">{DevoteeName({ devotee })}</h2>
            <p className="text-purple-600 font-mono text-xs">#{devotee.devoteeId || "MP-0001"}</p>
            {showSpiritualLevel && <div className="mt-1 flex justify-center"><SpiritualBadge level={devotee.spiritualLevel || "default"} /></div>}
            <div className="mt-2 space-y-0.5 text-[11px] text-purple-700">
              {showPhone && devotee.phone && <p>{devotee.phone}</p>}
              {showEmail && devotee.email && <p>{devotee.email}</p>}
              {showEvent && event && <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2"><p className="font-bold text-purple-800 text-[10px]">{event.title}</p><p className="text-purple-500 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-100">
              {customMessage && <p className="text-[9px] text-purple-400 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#7c3aed" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── MINIMAL CLEAN ──
  if (template === "minimal") {
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{orgName}</p>
                <p className="text-gray-700 font-semibold text-sm">{cardTitle}</p>
              </div>
              {showSpiritualLevel && (
                <div className="w-2 h-full rounded-full" style={{ background: (SPIRITUAL_LEVELS[devotee.spiritualLevel] || SPIRITUAL_LEVELS.default).accent, minHeight: 40 }} />
              )}
            </div>
            <div className="flex items-center gap-4">
              {showPhoto && <CardAvatar devotee={devotee} size="w-14 h-14" border="border border-gray-100 shadow" />}
              <div>
                <h2 className="font-bold text-gray-900 text-base">{DevoteeName({ devotee })}</h2>
                <p className="text-gray-400 font-mono text-[11px]">{devotee.devoteeId || "MP-0001"}</p>
                {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
              </div>
            </div>
          </div>
          <div className="px-5 pb-4 space-y-1 text-[11px] text-gray-500">
            {showPhone && devotee.phone && <p>T: {devotee.phone}</p>}
            {showEmail && devotee.email && <p>E: {devotee.email}</p>}
            {showAddress && devotee.address && <p className="text-[10px] text-gray-400">{devotee.address}</p>}
            {showEvent && event && <div className="mt-2 bg-gray-50 border-l-2 border-gray-300 pl-2 py-1"><p className="font-semibold text-gray-700 text-[10px]">{event.title}</p><p className="text-gray-400 text-[9px]">{event.date}</p></div>}
          </div>
          <div className="px-5 pb-4 flex items-end justify-between">
            <div>
              {customMessage && <p className="text-[9px] text-gray-300 italic">{customMessage}</p>}
              <div className="w-16 h-0.5 bg-gray-100 mt-2" />
            </div>
            {showQR && <QRPlaceholder size={36} color="#6b7280" />}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── OCEAN BLUE ──
  if (template === "ocean") {
    const header = slGrad || "linear-gradient(135deg,#0ea5e9,#0d9488)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg,#f0f9ff,#ecfdf5)" }}>
          <div style={{ background: header }} className="px-5 py-4 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 10 C 30 0, 70 20, 100 10 C 130 0, 170 20, 200 10 L200 20 L0 20 Z%22 fill=%22white%22/%3E%3C/svg%3E')" }} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-white/70 text-[10px] uppercase tracking-widest">{orgName}</p>
                <p className="text-white font-bold">{cardTitle}</p>
              </div>
              {showPhoto && <CardAvatar devotee={devotee} size="w-14 h-14" border="border-2 border-white/60" />}
            </div>
          </div>
          <div className="px-5 py-4">
            <h2 className="text-teal-900 font-bold text-base">{DevoteeName({ devotee })}</h2>
            <p className="text-teal-600 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
            {showSpiritualLevel && <div className="mt-1"><SpiritualBadge level={devotee.spiritualLevel || "default"} /></div>}
            <div className="mt-3 space-y-1 text-[11px] text-teal-700">
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showEvent && event && <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg p-2"><p className="font-bold text-teal-700 text-[10px]">{event.title}</p><p className="text-teal-500 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-teal-100">
              {customMessage && <p className="text-[9px] text-teal-400 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#0d9488" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── FOREST RETREAT ──
  if (template === "forest") {
    const header = slGrad || "linear-gradient(135deg,#166534,#14532d)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(160deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0" }}>
          <div style={{ background: header }} className="px-5 py-4">
            <div className="flex items-center gap-3">
              {showPhoto && <CardAvatar devotee={devotee} size="w-14 h-14" border="border-2 border-green-300" />}
              <div>
                <p className="text-green-200 text-[10px] uppercase tracking-widest">{orgName}</p>
                <p className="text-white font-bold">{cardTitle}</p>
                {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            <h2 className="text-green-900 font-bold text-base">{DevoteeName({ devotee })}</h2>
            <p className="text-green-600 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
            <div className="mt-2 space-y-1 text-[11px] text-green-800">
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showAddress && devotee.address && <p className="text-[10px] text-green-600">📍 {devotee.address}</p>}
              {showEvent && event && <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-2"><p className="font-bold text-green-800 text-[10px]">🌿 {event.title}</p><p className="text-green-600 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-green-200">
              {customMessage && <p className="text-[9px] text-green-500 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#166534" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── HOLOGRAPHIC ──
  if (template === "holographic") {
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg,#ff6eb4,#a855f7,#3b82f6,#06b6d4)", border: "2px solid transparent", backgroundClip: "padding-box" }}>
          <div className="m-0.5 rounded-[14px] overflow-hidden" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}>
            <div className="px-5 pt-5 pb-3 text-center relative">
              <p className="text-white/70 text-[10px] uppercase tracking-widest">{orgName}</p>
              <p className="text-white font-bold text-base drop-shadow">{cardTitle}</p>
              {showPhoto && <div className="flex justify-center mt-2"><CardAvatar devotee={devotee} size="w-18 h-18" border="border-3 border-white/50" /></div>}
            </div>
            <div className="px-5 pb-5 text-center">
              <h2 className="text-white font-bold text-base drop-shadow-lg">{DevoteeName({ devotee })}</h2>
              <p className="text-white/70 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
              {showSpiritualLevel && <div className="mt-1 flex justify-center"><SpiritualBadge level={devotee.spiritualLevel || "default"} /></div>}
              <div className="mt-2 space-y-0.5 text-[11px] text-white/80">
                {showPhone && devotee.phone && <p>{devotee.phone}</p>}
                {showEmail && devotee.email && <p>{devotee.email}</p>}
                {showEvent && event && <div className="mt-2 bg-white/10 rounded-lg p-2"><p className="font-bold text-white text-[10px]">✨ {event.title}</p><p className="text-white/70 text-[9px]">{event.date}</p></div>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                {customMessage && <p className="text-[9px] text-white/60 italic">{customMessage}</p>}
                {showQR && <QRPlaceholder size={40} color="white" />}
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── SEVA WARRIOR ──
  if (template === "seva") {
    const header = slGrad || "linear-gradient(135deg,#dc2626,#9f1239)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
          <div style={{ background: header }} className="px-5 py-4 relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest">Seva</p>
                <p className="text-white font-bold">{orgName}</p>
              </div>
              <div className="text-right">
                <p className="text-red-200 text-[9px]">{cardTitle}</p>
                {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
              </div>
            </div>
            {showPhoto && <div className="flex justify-center mt-2"><CardAvatar devotee={devotee} size="w-16 h-16" border="border-2 border-red-200" /></div>}
          </div>
          <div className="px-5 py-4">
            <h2 className="text-red-900 font-bold text-lg text-center">{DevoteeName({ devotee })}</h2>
            <p className="text-red-500 font-mono text-[11px] text-center">#{devotee.devoteeId || "MP-0001"}</p>
            <div className="mt-3 space-y-1 text-[11px] text-red-800">
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showEvent && event && <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2"><p className="font-bold text-red-700 text-[10px]">🙏 {event.title}</p><p className="text-red-500 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-red-100">
              <p className="text-[9px] text-red-400">{customMessage || "Volunteer ID"}</p>
              {showQR && <QRPlaceholder size={40} color="#dc2626" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── NIGHT TEMPLE ──
  if (template === "midnight") {
    const accentColor = useSpiritualColor ? sl.accent : "#818cf8";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", border: `1px solid ${accentColor}30` }}>
          <div className="px-5 py-4 relative" style={{ borderBottom: `1px solid ${accentColor}20` }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 80% 50%, ${accentColor}44, transparent 60%)` }} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p style={{ color: `${accentColor}99` }} className="text-[10px] uppercase tracking-widest">{orgName}</p>
                <p style={{ color: accentColor }} className="font-bold">{cardTitle}</p>
              </div>
              {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              {showPhoto && <CardAvatar devotee={devotee} size="w-14 h-14" border={`border-2`} />}
              <div>
                <h2 style={{ color: accentColor }} className="font-bold text-base">{DevoteeName({ devotee })}</h2>
                <p className="text-gray-500 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
              </div>
            </div>
            <div className="space-y-1 text-[11px]" style={{ color: `${accentColor}80` }}>
              {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
              {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              {showAddress && devotee.address && <p className="text-[10px] text-gray-600">📍 {devotee.address}</p>}
              {showEvent && event && <div className="mt-2 rounded-lg p-2" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}><p className="font-bold text-[10px]" style={{ color: accentColor }}>{event.title}</p><p className="text-[9px] text-gray-500">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: `1px solid ${accentColor}20` }}>
              {customMessage && <p className="text-[9px] italic" style={{ color: `${accentColor}60` }}>{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color={accentColor} />}
            </div>
            <div className="mt-2 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── YOUTH ENERGY ──
  if (template === "youth") {
    const header = slGrad || "linear-gradient(135deg,#c026d3,#7c3aed)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg,#fdf4ff,#ede9fe)" }}>
          <div style={{ background: header }} className="px-5 py-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/20" />
            <div className="absolute right-8 bottom-1 w-8 h-8 rounded-full bg-white/15" />
            <div className="flex items-center gap-3 relative z-10">
              {showPhoto && <CardAvatar devotee={devotee} size="w-14 h-14" border="border-2 border-fuchsia-200" />}
              <div>
                <p className="text-fuchsia-200 text-[10px] uppercase tracking-widest">{orgName}</p>
                <p className="text-white font-bold">{cardTitle}</p>
                {showSpiritualLevel && <SpiritualBadge level={devotee.spiritualLevel || "default"} />}
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            <h2 className="text-purple-900 font-bold text-base">{DevoteeName({ devotee })}</h2>
            <p className="text-fuchsia-500 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
            <div className="mt-2 space-y-1 text-[11px] text-purple-700">
              {showPhone && devotee.phone && <p>{devotee.phone}</p>}
              {showEmail && devotee.email && <p>{devotee.email}</p>}
              {showEvent && event && <div className="mt-2 bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-2"><p className="font-bold text-fuchsia-700 text-[10px]">🎶 {event.title}</p><p className="text-fuchsia-400 text-[9px]">{event.date}</p></div>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-fuchsia-100">
              {customMessage && <p className="text-[9px] text-purple-400 italic">{customMessage}</p>}
              {showQR && <QRPlaceholder size={40} color="#c026d3" />}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── EVENT PASS (landscape-style) ──
  if (template === "event-pass") {
    const header = slGrad || "linear-gradient(135deg,#0891b2,#0d9488)";
    return (
      <CardWrapper>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#f0fdfd", border: "1px solid #99f6e4" }}>
          <div style={{ background: header }} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-[10px] uppercase tracking-widest">{orgName}</p>
              <p className="text-white font-bold text-base">{showEvent && event ? event.title : cardTitle}</p>
              {showEvent && event && <p className="text-cyan-200 text-[10px]">📅 {event.date} {event.location && `• ${event.location}`}</p>}
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">॥</span>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            {showPhoto && <CardAvatar devotee={devotee} size="w-16 h-16" border="border-2 border-teal-300 shadow" />}
            <div className="flex-1">
              <h2 className="text-teal-900 font-bold text-base">{DevoteeName({ devotee })}</h2>
              <p className="text-teal-600 font-mono text-[11px]">#{devotee.devoteeId || "MP-0001"}</p>
              {showSpiritualLevel && <div className="mt-1"><SpiritualBadge level={devotee.spiritualLevel || "default"} /></div>}
              <div className="mt-1 space-y-0.5 text-[11px] text-teal-700">
                {showPhone && devotee.phone && <p>📞 {devotee.phone}</p>}
                {showEmail && devotee.email && <p>✉ {devotee.email}</p>}
              </div>
              {customMessage && <p className="text-[9px] text-teal-400 italic mt-1">{customMessage}</p>}
            </div>
            {showQR && <div className="flex-shrink-0"><QRPlaceholder size={52} color="#0891b2" /></div>}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // ── DEFAULT fallback = devotional ──
  return <IDCardPreview devotee={devotee} settings={{ ...settings, template: "devotional" }} scale={scale} />;
}
