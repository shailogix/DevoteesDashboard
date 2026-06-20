import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { IDCardPreview, TEMPLATES, SPIRITUAL_LEVELS, CardSettings } from "@/components/IDCard/IDCardPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, Download, Users, Search, Printer,
  FileImage, Settings, Eye, ChevronLeft, ChevronRight,
  CheckSquare, Square, Sparkles, Palette, Star, Zap,
  Building, CalendarDays, X, Check, Filter
} from "lucide-react";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "spiritual", label: "Spiritual" },
  { id: "event", label: "Events" },
  { id: "official", label: "Official" },
  { id: "modern", label: "Modern" },
];

const CARD_SIZES = [
  { id: "credit", label: "Credit Card", sub: "85.6 × 54 mm" },
  { id: "badge", label: "Badge ID", sub: "90 × 60 mm" },
  { id: "a6", label: "A6 Portrait", sub: "105 × 148 mm" },
];

function TemplateThumbnail({ template, selected, onClick }: any) {
  const tmpl = TEMPLATES.find(t => t.id === template.id)!;
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg text-left ${selected ? 'border-primary shadow-md ring-2 ring-primary/30' : 'border-border hover:border-primary/40'}`}
      data-testid={`template-thumb-${template.id}`}
    >
      <div className={`h-16 bg-gradient-to-br ${tmpl.previewGrad} relative`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
          <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm" />
          <div className="w-12 h-1 bg-white/50 rounded" />
          <div className="w-8 h-0.5 bg-white/30 rounded" />
        </div>
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="p-2 bg-card">
        <p className="text-[10px] font-semibold truncate text-foreground leading-tight">{template.name}</p>
        <p className="text-[9px] text-muted-foreground truncate">{template.desc}</p>
      </div>
    </button>
  );
}

function SpiritualLevelDot({ level }: { level: string }) {
  const sl = SPIRITUAL_LEVELS[level] || SPIRITUAL_LEVELS.default;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: sl.accent }} />
      <span className="text-xs">{sl.symbol} {sl.label}</span>
    </span>
  );
}

export default function IDCardGenerator() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState("devotional");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevotees, setSelectedDevotees] = useState<number[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [groupFilter, setGroupFilter] = useState("all");

  const [settings, setSettings] = useState<CardSettings>({
    template: "devotional",
    showPhoto: true,
    showQR: true,
    showPhone: true,
    showEmail: true,
    showAddress: false,
    showSpiritualLevel: true,
    showEvent: false,
    orgName: "Madhav Parivar",
    cardTitle: "Devotee ID Card",
    customMessage: "Jai Shri Krishna • Jay Gurudev",
    cardSize: "credit",
    useSpiritualColor: false,
    event: null,
  });

  const { data: devotees = [], isLoading: devoteesLoading } = useQuery<any[]>({
    queryKey: ["/api/devotees"],
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const { data: groups = [] } = useQuery<any[]>({
    queryKey: ["/api/groups"],
  });

  const filteredTemplates = TEMPLATES.filter(t =>
    categoryFilter === "all" || t.category === categoryFilter
  );

  const filteredDevotees = devotees.filter((d: any) => {
    const matchSearch = !searchTerm ||
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.devoteeId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = groupFilter === "all" || d.groupId?.toString() === groupFilter;
    return matchSearch && matchGroup;
  });

  const selectedDevoteeObjects = filteredDevotees.filter((d: any) => selectedDevotees.includes(d.id));
  const previewDevotee = selectedDevoteeObjects[previewIndex] || filteredDevotees[0];

  const toggleDevotee = (id: number) => {
    setSelectedDevotees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedDevotees.length === filteredDevotees.length) setSelectedDevotees([]);
    else setSelectedDevotees(filteredDevotees.map((d: any) => d.id));
  };

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplate(id);
    setSettings(s => ({ ...s, template: id }));
  };

  const handleEventSelect = (eventId: string) => {
    if (eventId === "none") {
      setSettings(s => ({ ...s, event: null, showEvent: false }));
    } else {
      const ev = events.find((e: any) => e.id.toString() === eventId);
      setSettings(s => ({
        ...s,
        event: ev ? { title: ev.title, date: new Date(ev.startDate || ev.date || "").toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), location: ev.location || "" } : null,
        showEvent: !!ev,
        cardTitle: ev ? `${ev.title} Pass` : s.cardTitle,
      }));
    }
  };

  const handlePrint = () => {
    if (selectedDevotees.length === 0) {
      toast({ title: "No selection", description: "Select at least one devotee first", variant: "destructive" });
      return;
    }
    window.print();
    toast({ title: `Printing ${selectedDevotees.length} ID cards` });
  };

  const handleDownload = () => {
    if (selectedDevotees.length === 0) {
      toast({ title: "No selection", description: "Select at least one devotee first", variant: "destructive" });
      return;
    }
    toast({ title: `Generating ${selectedDevotees.length} ID cards`, description: "Cards will download shortly" });
  };

  const settingToggle = (key: keyof CardSettings) => (v: boolean) => setSettings(s => ({ ...s, [key]: v }));
  const settingStr = (key: keyof CardSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setSettings(s => ({ ...s, [key]: e.target.value }));

  const spiritualStats = {
    total: filteredDevotees.length,
    byLevel: Object.entries(SPIRITUAL_LEVELS).filter(([k]) => k !== 'default').map(([key, cfg]) => ({
      key, cfg,
      count: filteredDevotees.filter((d: any) => d.spiritualLevel === key).length
    })).filter(x => x.count > 0)
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="ID Card Studio"
        subtitle="Design and generate beautiful ID cards for your devotees"
        actions={
          <div className="flex items-center gap-2">
            {selectedDevotees.length > 0 && (
              <Badge className="text-sm px-3 py-1">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" /> {selectedDevotees.length} selected
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={selectedDevotees.length === 0} data-testid="button-print-cards">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={selectedDevotees.length === 0} data-testid="button-download-cards">
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto bg-background">
        {/* ── TEMPLATE GALLERY ── */}
        <div className="border-b border-border bg-card/50 px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Choose Template</span>
            <div className="flex items-center gap-1.5 ml-auto">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  data-testid={`filter-category-${cat.id}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {filteredTemplates.map(t => (
              <TemplateThumbnail
                key={t.id}
                template={t}
                selected={selectedTemplate === t.id}
                onClick={() => handleTemplateSelect(t.id)}
              />
            ))}
          </div>
        </div>

        {/* ── MAIN 3-PANEL LAYOUT ── */}
        <div className="flex h-full">
          {/* LEFT: Settings */}
          <div className="w-72 border-r border-border bg-card/30 flex flex-col flex-shrink-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">

                {/* Spiritual Level Colors */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-semibold">Color by Spiritual Level</Label>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">Override template with level-based colors</p>
                    <Switch
                      checked={settings.useSpiritualColor}
                      onCheckedChange={settingToggle("useSpiritualColor")}
                      data-testid="switch-spiritual-color"
                    />
                  </div>
                  {settings.useSpiritualColor && (
                    <div className="rounded-lg border border-border p-2 bg-muted/30 space-y-1.5">
                      {Object.entries(SPIRITUAL_LEVELS).filter(([k]) => k !== "default").map(([key, cfg]) => (
                        <div key={key} className="flex items-center justify-between">
                          <SpiritualLevelDot level={key} />
                          <div className="w-12 h-2 rounded-full" style={{ background: cfg.accent }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Event Selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-semibold">Event Card Mode</Label>
                  </div>
                  <Select onValueChange={handleEventSelect} defaultValue="none">
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="No event (standard ID)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No event (standard ID)</SelectItem>
                      {events.map((e: any) => (
                        <SelectItem key={e.id} value={e.id.toString()} className="text-xs">{e.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {settings.event && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-2 py-1.5 rounded border border-primary/20">
                      <CalendarDays className="w-3 h-3 text-primary" />
                      <span className="truncate">{settings.event.title}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Card Text */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Card Text</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Organisation Name</Label>
                      <Input value={settings.orgName} onChange={settingStr("orgName")} className="h-7 text-xs mt-0.5" data-testid="input-org-name" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Card Title</Label>
                      <Input value={settings.cardTitle} onChange={settingStr("cardTitle")} className="h-7 text-xs mt-0.5" data-testid="input-card-title" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Footer Message</Label>
                      <Input value={settings.customMessage} onChange={settingStr("customMessage")} className="h-7 text-xs mt-0.5" data-testid="input-custom-message" placeholder="e.g. Jai Shri Krishna" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Card Size */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Card Size</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CARD_SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => setSettings(s => ({ ...s, cardSize: size.id }))}
                        className={`text-center rounded-lg border p-2 transition-all ${settings.cardSize === size.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                        data-testid={`size-${size.id}`}
                      >
                        <p className="text-[10px] font-semibold">{size.label}</p>
                        <p className="text-[9px] opacity-70">{size.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Field Toggles */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Show / Hide Fields</Label>
                  <div className="space-y-2">
                    {[
                      { key: "showPhoto", label: "Profile Photo" },
                      { key: "showQR", label: "QR Code" },
                      { key: "showSpiritualLevel", label: "Spiritual Level" },
                      { key: "showPhone", label: "Phone Number" },
                      { key: "showEmail", label: "Email Address" },
                      { key: "showAddress", label: "Address" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-xs">{label}</Label>
                        <Switch
                          checked={!!(settings as any)[key]}
                          onCheckedChange={settingToggle(key as keyof CardSettings)}
                          data-testid={`toggle-${key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </ScrollArea>
          </div>

          {/* CENTER: Preview */}
          <div className="flex-1 flex flex-col items-center bg-muted/20 border-r border-border">
            <div className="w-full flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Live Preview</span>
                <Badge variant="outline" className="text-xs">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{selectedDevoteeObjects.length > 0 ? `${previewIndex + 1} / ${selectedDevoteeObjects.length}` : "No selection"}</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewIndex(i => Math.min(selectedDevoteeObjects.length - 1, i + 1))} disabled={previewIndex >= selectedDevoteeObjects.length - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col items-center justify-center py-8 px-4 min-h-[500px]">
                {previewDevotee ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <IDCardPreview devotee={previewDevotee} settings={settings} scale={1.1} />

                    {/* Spiritual Level Guide */}
                    {settings.useSpiritualColor && (
                      <div className="w-full max-w-sm">
                        <p className="text-xs text-muted-foreground text-center mb-2">Spiritual Level Color Guide</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {Object.entries(SPIRITUAL_LEVELS).filter(([k]) => k !== "default").map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-card text-[10px]">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.accent }} />
                              <span className="truncate">{cfg.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All templates mini-gallery for selected devotee */}
                    {selectedDevoteeObjects.length > 0 && (
                      <div className="w-full max-w-2xl">
                        <p className="text-xs text-muted-foreground text-center mb-3">All 12 templates for <span className="font-medium text-foreground">{previewDevotee.firstName} {previewDevotee.lastName}</span></p>
                        <div className="grid grid-cols-3 gap-3">
                          {TEMPLATES.map(t => (
                            <div
                              key={t.id}
                              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${selectedTemplate === t.id ? 'border-primary' : 'border-transparent'}`}
                              onClick={() => handleTemplateSelect(t.id)}
                            >
                              <IDCardPreview devotee={previewDevotee} settings={{ ...settings, template: t.id }} scale={0.42} />
                              <p className="text-[9px] text-center text-muted-foreground py-0.5 bg-card border-t border-border">{t.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-16">
                    <CreditCard className="w-16 h-16 mx-auto text-muted-foreground/30" />
                    <div>
                      <p className="font-medium text-muted-foreground">No devotee selected</p>
                      <p className="text-sm text-muted-foreground/60">Select devotees from the right panel to preview their ID cards</p>
                    </div>
                    {filteredDevotees.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setSelectedDevotees([filteredDevotees[0].id]); setPreviewIndex(0); }}>
                        Preview first devotee
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Devotee List */}
          <div className="w-72 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-border bg-card/50 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Select Devotees</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                  data-testid="input-search-devotees"
                />
                {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
              </div>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <Filter className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g: any) => <SelectItem key={g.id} value={g.id.toString()} className="text-xs">{g.groupName}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{filteredDevotees.length} devotees · {selectedDevotees.length} selected</span>
                <button onClick={toggleAll} className="text-primary font-medium hover:underline text-[11px]">
                  {selectedDevotees.length === filteredDevotees.length && filteredDevotees.length > 0 ? "Deselect all" : "Select all"}
                </button>
              </div>
            </div>

            {/* Spiritual Stats */}
            {spiritualStats.byLevel.length > 0 && (
              <div className="px-3 py-2 border-b border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Spiritual Distribution</p>
                <div className="flex flex-wrap gap-1">
                  {spiritualStats.byLevel.map(({ key, cfg, count }) => (
                    <span key={key} className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: `${cfg.accent}40`, background: `${cfg.accent}10` }}>
                      <span>{cfg.symbol}</span>
                      <span style={{ color: cfg.accent }}>{cfg.label}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {devoteesLoading && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                )}
                {filteredDevotees.map((d: any) => {
                  const sl = SPIRITUAL_LEVELS[d.spiritualLevel] || SPIRITUAL_LEVELS.default;
                  const isSelected = selectedDevotees.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => { toggleDevotee(d.id); setPreviewIndex(0); }}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-primary/8 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'}`}
                      data-testid={`devotee-item-${d.id}`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: sl.accent }}>
                        {(d.firstName || " ")[0]}{(d.lastName || " ")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{d.firstName} {d.lastName}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">{d.devoteeId || "—"}</span>
                          {d.spiritualLevel && (
                            <span className="text-[9px]" title={sl.label}>{sl.symbol}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedDevotees(selectedDevoteeObjects.filter(x => x.id !== d.id).map(x => x.id)); setPreviewIndex(0); }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredDevotees.length === 0 && !devoteesLoading && (
                  <div className="text-center py-8 text-muted-foreground text-xs">No devotees found</div>
                )}
              </div>
            </ScrollArea>

            {/* Generate Actions */}
            <div className="p-3 border-t border-border space-y-2">
              <Button
                className="w-full"
                onClick={handleDownload}
                disabled={selectedDevotees.length === 0}
                data-testid="button-generate-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate {selectedDevotees.length > 0 ? `${selectedDevotees.length} ` : ""}Cards
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
                disabled={selectedDevotees.length === 0}
                data-testid="button-print"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Cards
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
