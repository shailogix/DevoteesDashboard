import { useState, useEffect, useRef, useCallback } from 'react';
import { useVisualEditor, ClickedElementInfo, ElementType } from '@/contexts/VisualEditorContext';
import { useDevMode } from '@/contexts/DevModeContext';
import {
  X, ChevronDown, ChevronUp, Type, Image, Palette, Layers, Code,
  Eye, EyeOff, RotateCcw, Save, Maximize2, AlignLeft, AlignCenter,
  AlignRight, Bold, Italic, Underline, Move, Minus, Plus, Zap, MousePointer
} from 'lucide-react';

const LUCIDE_ICON_NAMES = [
  'Home','User','Users','Heart','Star','Search','Settings','Bell','Mail',
  'Calendar','Clock','Check','X','Plus','Minus','ChevronRight','ChevronDown',
  'ArrowRight','ArrowLeft','Upload','Download','Edit','Trash','Save','Eye',
  'EyeOff','Lock','Unlock','Shield','Info','AlertTriangle','HelpCircle',
  'Phone','Smartphone','Laptop','Monitor','Globe','Link','Share','Copy',
  'Clipboard','Database','Server','Cloud','Wifi','Bluetooth','Battery',
  'Camera','Mic','Video','Music','Volume','Image','FileText','Folder',
  'Package','Gift','ShoppingCart','CreditCard','DollarSign','TrendingUp',
  'BarChart','PieChart','Activity','Map','MapPin','Navigation','Compass',
  'Sun','Moon','Zap','Wind','Droplets','Flame','Leaf','Tree','Flower',
  'Award','Flag','Bookmark','Tag','Filter','Sliders','Grid','List','Menu',
  'Layers','Code','Terminal','Cpu','HardDrive','MemoryStick','Printer',
  'Send','MessageSquare','MessageCircle','Smile','Frown','ThumbsUp','ThumbsDown',
];

const PRESET_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#ffffff','#f8fafc','#e2e8f0','#94a3b8','#475569','#1e293b','#0f172a','#000000',
  'transparent',
];

type TabId = 'content' | 'style' | 'layout' | 'advanced';

interface PanelState {
  text: string;
  imgSrc: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  padding: string;
  margin: string;
  opacity: string;
  letterSpacing: string;
  lineHeight: string;
  textAlign: string;
  textDecoration: string;
  textTransform: string;
  boxShadow: string;
  width: string;
  height: string;
  display: string;
  customCss: string;
  hidden: boolean;
}

function getTypeLabel(type: ElementType): string {
  const map: Record<ElementType, string> = {
    image: '🖼 Image',
    icon: '✦ Icon/SVG',
    button: '⬛ Button',
    input: '📝 Input',
    text: '💬 Text',
    heading: '📰 Heading',
    link: '🔗 Link',
    generic: '⬜ Element',
  };
  return map[type] || '⬜ Element';
}

function getTypeColor(type: ElementType): string {
  const map: Record<ElementType, string> = {
    image: 'bg-purple-600',
    icon: 'bg-blue-600',
    button: 'bg-green-600',
    input: 'bg-yellow-600',
    text: 'bg-orange-500',
    heading: 'bg-red-500',
    link: 'bg-cyan-600',
    generic: 'bg-gray-600',
  };
  return map[type] || 'bg-gray-600';
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value === 'transparent' ? '#ffffff' : (value || '#ffffff')}
            onChange={e => onChange(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-600 p-0.5 bg-transparent"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="color / transparent"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white font-mono placeholder-gray-600"
        />
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            title={c}
            onClick={() => onChange(c)}
            className={`w-5 h-5 rounded border ${value === c ? 'border-white scale-110' : 'border-gray-600'} transition-transform`}
            style={{ backgroundColor: c === 'transparent' ? undefined : c, background: c === 'transparent' ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 0 0 / 8px 8px' : undefined }}
          />
        ))}
      </div>
    </div>
  );
}

function NumericField({ label, value, onChange, unit = 'px', min = 0, max = 200 }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; min?: number; max?: number;
}) {
  const numVal = parseFloat(value) || 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</label>
        <span className="text-[10px] text-gray-500">{unit}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(`${Math.max(min, numVal - 1)}${unit}`)} className="w-6 h-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-gray-300">
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center font-mono"
        />
        <button onClick={() => onChange(`${Math.min(max, numVal + 1)}${unit}`)} className="w-6 h-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-gray-300">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function GodModeEditorPanel() {
  const { isDevMode } = useDevMode();
  const {
    isEditMode, toggleEditMode,
    overrides, setOverride, clearOverride,
    clickedElementInfo, setClickedElementInfo,
    isSaving, unsavedChanges, saveToSlot,
  } = useVisualEditor();

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [isDragging, setIsDragging] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [positionSet, setPositionSet] = useState(false);
  const dragStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const info = clickedElementInfo;
  const veId = info?.veId;
  const existing = veId ? (overrides[veId] || {}) : {};

  const [state, setState] = useState<PanelState>({
    text: '', imgSrc: '', bgColor: '', textColor: '', borderColor: '',
    fontSize: '', fontWeight: '', borderRadius: '', padding: '', margin: '',
    opacity: '', letterSpacing: '', lineHeight: '', textAlign: '', textDecoration: '',
    textTransform: '', boxShadow: '', width: '', height: '', display: '', customCss: '', hidden: false,
  });

  // Sync state when a new element is clicked
  useEffect(() => {
    if (!info) return;
    setState({
      text: existing.text ?? info.existingText ?? '',
      imgSrc: existing.imgSrc ?? info.existingImgSrc ?? '',
      bgColor: existing.bgColor ?? '',
      textColor: existing.textColor ?? '',
      borderColor: existing.borderColor ?? '',
      fontSize: existing.fontSize ?? '',
      fontWeight: existing.fontWeight ?? '',
      borderRadius: existing.borderRadius ?? '',
      padding: existing.padding ?? '',
      margin: existing.margin ?? '',
      opacity: existing.opacity ?? '',
      letterSpacing: existing.letterSpacing ?? '',
      lineHeight: existing.lineHeight ?? '',
      textAlign: existing.textAlign ?? '',
      textDecoration: existing.textDecoration ?? '',
      textTransform: existing.textTransform ?? '',
      boxShadow: existing.boxShadow ?? '',
      width: existing.width ?? '',
      height: existing.height ?? '',
      display: existing.display ?? '',
      customCss: existing.customCss ?? '',
      hidden: existing.hidden ?? false,
    });

    // Smart default tab
    if (info.type === 'image') setActiveTab('content');
    else if (info.type === 'text' || info.type === 'heading' || info.type === 'button' || info.type === 'link') setActiveTab('content');
    else setActiveTab('style');
  }, [info?.veId]);

  // Set initial position near click
  useEffect(() => {
    if (!info) { setPositionSet(false); return; }
    const pw = 340;
    const ph = 500;
    let x = info.x + 16;
    let y = info.y - 60;
    if (x + pw > window.innerWidth - 10) x = info.x - pw - 16;
    if (y + ph > window.innerHeight - 10) y = window.innerHeight - ph - 10;
    if (y < 50) y = 50;
    if (x < 10) x = 10;
    setPanelPos({ x, y });
    setPositionSet(true);
  }, [info?.veId]);

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: panelPos.x, py: panelPos.y };
    e.preventDefault();
  }, [panelPos]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mx;
      const dy = e.clientY - dragStartRef.current.my;
      setPanelPos({ x: dragStartRef.current.px + dx, y: dragStartRef.current.py + dy });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  const apply = useCallback((patch: Partial<PanelState>) => {
    if (!veId) return;
    const next = { ...state, ...patch };
    setState(next);
    const override: Record<string, any> = {};
    if (next.text !== undefined) override.text = next.text;
    if (next.imgSrc) override.imgSrc = next.imgSrc;
    if (next.bgColor) override.bgColor = next.bgColor;
    if (next.textColor) override.textColor = next.textColor;
    if (next.borderColor) override.borderColor = next.borderColor;
    if (next.fontSize) override.fontSize = next.fontSize;
    if (next.fontWeight) override.fontWeight = next.fontWeight;
    if (next.borderRadius) override.borderRadius = next.borderRadius;
    if (next.padding) override.padding = next.padding;
    if (next.margin) override.margin = next.margin;
    if (next.opacity) override.opacity = next.opacity;
    if (next.letterSpacing) override.letterSpacing = next.letterSpacing;
    if (next.lineHeight) override.lineHeight = next.lineHeight;
    if (next.textAlign) override.textAlign = next.textAlign;
    if (next.textDecoration) override.textDecoration = next.textDecoration;
    if (next.textTransform) override.textTransform = next.textTransform;
    if (next.boxShadow) override.boxShadow = next.boxShadow;
    if (next.width) override.width = next.width;
    if (next.height) override.height = next.height;
    if (next.customCss) override.customCss = next.customCss;
    override.hidden = next.hidden;
    setOverride(veId, override);
  }, [veId, state, setOverride]);

  const reset = () => {
    if (!veId) return;
    clearOverride(veId);
    setState({ text: info?.existingText ?? '', imgSrc: info?.existingImgSrc ?? '', bgColor: '', textColor: '', borderColor: '', fontSize: '', fontWeight: '', borderRadius: '', padding: '', margin: '', opacity: '', letterSpacing: '', lineHeight: '', textAlign: '', textDecoration: '', textTransform: '', boxShadow: '', width: '', height: '', display: '', customCss: '', hidden: false });
  };

  if (!isDevMode) return null;

  // Collapsed mode - show the floating toggle button when not in edit mode
  if (!isEditMode) {
    return (
      <button
        onClick={toggleEditMode}
        data-god-editor-panel
        className="fixed bottom-4 right-4 z-[200] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 transition-all border border-white/20"
      >
        <Zap className="w-3.5 h-3.5" />
        GOD Mode Editor
      </button>
    );
  }

  // Edit mode active but nothing selected yet
  if (!info || !positionSet) {
    return (
      <div data-god-editor-panel className="fixed bottom-4 right-4 z-[200] bg-gray-900 border border-yellow-500/50 rounded-xl shadow-2xl p-4 w-64 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">GOD Mode Editor</span>
          </div>
          <button onClick={toggleEditMode} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg p-3">
          <MousePointer className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span>Click any element on the page to edit it</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] text-gray-500">
          <div className="bg-gray-800 rounded p-1.5 text-center">Text ✓</div>
          <div className="bg-gray-800 rounded p-1.5 text-center">Images ✓</div>
          <div className="bg-gray-800 rounded p-1.5 text-center">Colors ✓</div>
          <div className="bg-gray-800 rounded p-1.5 text-center">Icons ✓</div>
          <div className="bg-gray-800 rounded p-1.5 text-center">Layout ✓</div>
          <div className="bg-gray-800 rounded p-1.5 text-center">CSS ✓</div>
        </div>
        {unsavedChanges > 0 && (
          <button
            onClick={() => saveToSlot()}
            disabled={isSaving}
            className="mt-3 w-full text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 font-medium flex items-center justify-center gap-1"
          >
            <Save className="w-3 h-3" />
            {isSaving ? 'Saving...' : `Commit ${unsavedChanges} change${unsavedChanges !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    );
  }

  const type = info.type;

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'content', label: 'Content', icon: Type },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Maximize2 },
    { id: 'advanced', label: 'Code', icon: Code },
  ];

  return (
    <div
      ref={panelRef}
      data-god-editor-panel
      style={{ position: 'fixed', left: panelPos.x, top: panelPos.y, zIndex: 200, width: 340 }}
      className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl text-white overflow-hidden select-none"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border-b border-gray-700 cursor-move"
        onMouseDown={onDragStart}
      >
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${getTypeColor(type)}`}>
          {getTypeLabel(type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 font-mono truncate" title={veId}>{veId}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => apply({ hidden: !state.hidden })}
            title={state.hidden ? 'Show element' : 'Hide element'}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            {state.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={reset} title="Reset all overrides" className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setClickedElementInfo(null)} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-850">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${activeTab === t.id ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
        {activeTab === 'content' && (
          <div className="p-3 space-y-4">
            {/* Text editing */}
            {(type === 'text' || type === 'heading' || type === 'button' || type === 'link' || type === 'generic') && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Text Content</label>
                <textarea
                  value={state.text}
                  onChange={e => apply({ text: e.target.value })}
                  rows={3}
                  placeholder="Enter new text content..."
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white resize-none outline-none placeholder-gray-600"
                />
              </div>
            )}

            {/* Image src editing */}
            {type === 'image' && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Image URL</label>
                <input
                  type="text"
                  value={state.imgSrc}
                  onChange={e => apply({ imgSrc: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono placeholder-gray-600"
                />
                {state.imgSrc && (
                  <div className="rounded-lg overflow-hidden border border-gray-700 mt-2">
                    <img src={state.imgSrc} alt="preview" className="w-full h-28 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                <p className="text-[10px] text-gray-500">Paste a direct image URL or data URI</p>
              </div>
            )}

            {/* Icon type info + color */}
            {type === 'icon' && (
              <div className="space-y-3">
                <div className="bg-blue-900/30 border border-blue-700/40 rounded-lg p-3 text-xs text-blue-300">
                  <p className="font-semibold mb-1">Icon/SVG Element</p>
                  <p className="text-blue-400/70">Use the Style tab to change icon color, size, and opacity. Use the Code tab for custom SVG overrides.</p>
                </div>
                <ColorPicker label="Icon Color" value={state.textColor} onChange={v => apply({ textColor: v })} />
                <NumericField label="Icon Size" value={state.fontSize} onChange={v => apply({ fontSize: v })} unit="px" min={8} max={96} />
                <NumericField label="Opacity" value={state.opacity} onChange={v => apply({ opacity: v })} unit="" min={0} max={1} />
              </div>
            )}

            {/* Input info */}
            {type === 'input' && (
              <div className="space-y-3">
                <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-lg p-3 text-xs text-yellow-300">
                  <p className="font-semibold mb-1">Form Input Element</p>
                  <p className="text-yellow-400/70">Use Style tab to change appearance. Placeholder text can be edited via Custom CSS.</p>
                </div>
                <ColorPicker label="Background Color" value={state.bgColor} onChange={v => apply({ bgColor: v })} />
                <ColorPicker label="Text Color" value={state.textColor} onChange={v => apply({ textColor: v })} />
                <ColorPicker label="Border Color" value={state.borderColor} onChange={v => apply({ borderColor: v })} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="p-3 space-y-4">
            <ColorPicker label="Background Color" value={state.bgColor} onChange={v => apply({ bgColor: v })} />
            <ColorPicker label="Text / Icon Color" value={state.textColor} onChange={v => apply({ textColor: v })} />
            <ColorPicker label="Border Color" value={state.borderColor} onChange={v => apply({ borderColor: v })} />

            <div className="grid grid-cols-2 gap-3">
              <NumericField label="Font Size" value={state.fontSize} onChange={v => apply({ fontSize: v })} unit="px" min={8} max={96} />
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Font Weight</label>
                <select
                  value={state.fontWeight}
                  onChange={e => apply({ fontWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="">Default</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Text Align</label>
              <div className="flex gap-1">
                {(['left','center','right'] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => apply({ textAlign: state.textAlign === a ? '' : a })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center transition-colors ${state.textAlign === a ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {a === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {a === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {a === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Text Transform</label>
              <div className="flex gap-1">
                {(['none','uppercase','lowercase','capitalize'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => apply({ textTransform: state.textTransform === t ? '' : t })}
                    className={`flex-1 py-1 rounded text-[10px] transition-colors ${state.textTransform === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {t === 'none' ? 'Aa' : t === 'uppercase' ? 'AA' : t === 'lowercase' ? 'aa' : 'Aa'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Text Decoration</label>
              <div className="flex gap-1">
                {([{v:'underline',icon:Underline},{v:'line-through',icon:Minus},{v:'none',icon:Type}] as const).map(({ v, icon: Icon }) => (
                  <button
                    key={v}
                    onClick={() => apply({ textDecoration: state.textDecoration === v ? '' : v })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center transition-colors ${state.textDecoration === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <NumericField label="Opacity" value={state.opacity} onChange={v => apply({ opacity: v })} unit="" min={0} max={1} />
            <NumericField label="Border Radius" value={state.borderRadius} onChange={v => apply({ borderRadius: v })} unit="px" min={0} max={100} />

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Box Shadow</label>
              <input
                type="text"
                value={state.boxShadow}
                onChange={e => apply({ boxShadow: e.target.value })}
                placeholder="e.g. 0 4px 12px rgba(0,0,0,0.5)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 outline-none"
              />
              <div className="flex gap-1 flex-wrap">
                {[
                  { label: 'None', v: 'none' },
                  { label: 'Soft', v: '0 2px 8px rgba(0,0,0,0.15)' },
                  { label: 'Medium', v: '0 4px 16px rgba(0,0,0,0.3)' },
                  { label: 'Hard', v: '0 8px 32px rgba(0,0,0,0.5)' },
                  { label: 'Glow', v: '0 0 16px rgba(59,130,246,0.6)' },
                ].map(p => (
                  <button key={p.label} onClick={() => apply({ boxShadow: p.v })} className="text-[10px] px-2 py-0.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-400 hover:text-white transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="p-3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Padding</label>
              <input
                type="text"
                value={state.padding}
                onChange={e => apply({ padding: e.target.value })}
                placeholder="e.g. 8px 16px or 12px"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 outline-none"
              />
              <div className="flex gap-1 flex-wrap">
                {['4px','8px','12px','16px','24px','32px'].map(v => (
                  <button key={v} onClick={() => apply({ padding: v })} className="text-[10px] px-2 py-0.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-400 hover:text-white">{v}</button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Margin</label>
              <input
                type="text"
                value={state.margin}
                onChange={e => apply({ margin: e.target.value })}
                placeholder="e.g. 8px 0 or auto"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 outline-none"
              />
              <div className="flex gap-1 flex-wrap">
                {['0','4px','8px','16px','auto'].map(v => (
                  <button key={v} onClick={() => apply({ margin: v })} className="text-[10px] px-2 py-0.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-400 hover:text-white">{v}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Width</label>
                <input
                  type="text"
                  value={state.width}
                  onChange={e => apply({ width: e.target.value })}
                  placeholder="e.g. 100px / 50%"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Height</label>
                <input
                  type="text"
                  value={state.height}
                  onChange={e => apply({ height: e.target.value })}
                  placeholder="e.g. 48px / auto"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 outline-none"
                />
              </div>
            </div>

            <NumericField label="Letter Spacing" value={state.letterSpacing} onChange={v => apply({ letterSpacing: v })} unit="px" min={-5} max={20} />
            <NumericField label="Line Height" value={state.lineHeight} onChange={v => apply({ lineHeight: v })} unit="" min={1} max={4} />

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Display</label>
              <div className="flex flex-wrap gap-1">
                {['block','inline','inline-block','flex','inline-flex','grid','none'].map(d => (
                  <button
                    key={d}
                    onClick={() => apply({ display: state.display === d ? '' : d })}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${state.display === d ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Custom CSS</label>
              <textarea
                value={state.customCss}
                onChange={e => apply({ customCss: e.target.value })}
                rows={8}
                placeholder={`/* Any valid CSS properties */\nbackground: linear-gradient(...);\ntransform: rotate(5deg);\nanimation: pulse 2s infinite;`}
                className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-green-400 font-mono resize-none outline-none placeholder-gray-700"
                spellCheck={false}
              />
              <p className="text-[10px] text-gray-600">Applied directly to the selected element via CSS injection</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Element Info</label>
              <div className="bg-gray-800 rounded-lg p-3 space-y-1.5 font-mono text-[10px]">
                <div className="flex gap-2"><span className="text-gray-500 w-16">Tag:</span><span className="text-green-400">{info.el.tagName.toLowerCase()}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-16">Type:</span><span className="text-blue-400">{type}</span></div>
                <div className="flex gap-2 items-start"><span className="text-gray-500 w-16">ID:</span><span className="text-yellow-400 break-all">{veId}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-16">Classes:</span><span className="text-purple-400 break-all">{info.el.className?.toString().slice(0, 60) || '—'}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Quick Presets</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '🌟 Highlight', css: 'background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; font-weight: bold;' },
                  { label: '✨ Glow', css: 'box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); border: 1px solid #3b82f6;' },
                  { label: '🎨 Glass', css: 'background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);' },
                  { label: '💎 Gradient', css: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;' },
                  { label: '🔥 Fire', css: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: bold;' },
                  { label: '🌊 Ocean', css: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;' },
                  { label: '⚡ Pulse', css: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' },
                  { label: '↔ Full width', css: 'width: 100% !important;' },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => apply({ customCss: p.css })}
                    className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 bg-gray-800 px-3 py-2 flex items-center gap-2">
        <div className="flex-1 text-[10px] text-gray-500">
          {isSaving ? '⏳ Saving...' : unsavedChanges > 0 ? `● ${unsavedChanges} unsaved change${unsavedChanges !== 1 ? 's' : ''}` : '✓ All changes saved'}
        </div>
        <button
          onClick={reset}
          className="text-[10px] px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => saveToSlot()}
          disabled={isSaving}
          className="text-[10px] px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-medium flex items-center gap-1 transition-colors"
        >
          <Save className="w-3 h-3" />
          Commit
        </button>
      </div>
    </div>
  );
}
