import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/contexts/DevModeContext';

export interface VisualOverride {
  text?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string;
  fontSize?: string;
  fontWeight?: string;
  opacity?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  hidden?: boolean;
  wordWrap?: "normal" | "nowrap";
  customCss?: string;
  imgSrc?: string;
  iconSvgPath?: string;
  display?: string;
  letterSpacing?: string;
  lineHeight?: string;
  textAlign?: string;
  boxShadow?: string;
  textDecoration?: string;
  textTransform?: string;
}

export interface RollbackSlot {
  index: number;
  name: string;
  savedAt: string;
  overrides: Record<string, VisualOverride>;
}

export type ElementType = 'image' | 'icon' | 'button' | 'input' | 'text' | 'heading' | 'link' | 'generic';

export interface ClickedElementInfo {
  el: HTMLElement;
  type: ElementType;
  veId: string;
  x: number;
  y: number;
  rect: DOMRect;
  existingText: string;
  existingImgSrc?: string;
}

interface VisualEditorContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  overrides: Record<string, VisualOverride>;
  setOverride: (elementId: string, override: Partial<VisualOverride>) => void;
  clearOverride: (elementId: string) => void;
  clearAllOverrides: () => void;
  saveToSlot: (name?: string) => Promise<void>;
  restoreSlot: (index: number) => Promise<void>;
  rollbackSlots: RollbackSlot[];
  unsavedChanges: number;
  isSaving: boolean;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  clickedElementInfo: ClickedElementInfo | null;
  setClickedElementInfo: (info: ClickedElementInfo | null) => void;
  autoSaveNow: (newOverrides?: Record<string, VisualOverride>) => Promise<void>;
}

const VisualEditorContext = createContext<VisualEditorContextType | undefined>(undefined);

let _idCounter = 0;
function generateVeId(): string {
  _idCounter++;
  return `ve-auto-${Date.now()}-${_idCounter}`;
}

function getDomPath(el: HTMLElement): string {
  const parts: string[] = [];
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.body) {
    const tag = cur.tagName.toLowerCase();
    const parentEl: HTMLElement | null = cur.parentElement;
    if (!parentEl) break;
    const sameTagSiblings = Array.from(parentEl.children).filter((c: any) => c.tagName === cur!.tagName);
    const idx = sameTagSiblings.indexOf(cur);
    parts.unshift(`${tag}[${idx}]`);
    cur = parentEl;
  }
  return parts.join('/');
}

export function detectElementType(el: HTMLElement): ElementType {
  const tag = el.tagName.toLowerCase();
  if (tag === 'img') return 'image';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'input';
  if (tag === 'a') return 'link';
  if (tag === 'button' || el.getAttribute('role') === 'button') return 'button';
  if (el.closest('button')) return 'button';

  const isSvgOrIcon =
    tag === 'svg' ||
    el instanceof SVGElement ||
    el.querySelector('svg') !== null ||
    el.closest('svg') !== null;
  if (isSvgOrIcon) return 'icon';

  if (['h1','h2','h3','h4','h5','h6'].includes(tag)) return 'heading';

  const textContent = Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent?.trim())
    .filter(Boolean)
    .join('');
  if (textContent.length > 0) return 'text';

  return 'generic';
}

function getOrCreateVeId(el: HTMLElement): string {
  if (el.dataset.veId) return el.dataset.veId;
  const testId = el.dataset.testid;
  if (testId) {
    const id = `testid-${testId}`;
    el.setAttribute('data-ve-id', id);
    return id;
  }
  const id = generateVeId();
  el.setAttribute('data-ve-id', id);
  return id;
}

function getElementText(el: HTMLElement): string {
  return Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent || '')
    .join('')
    .trim() || el.textContent?.trim() || '';
}

export function VisualEditorProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, VisualOverride>>({});
  const [rollbackSlots, setRollbackSlots] = useState<RollbackSlot[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [clickedElementInfo, setClickedElementInfo] = useState<ClickedElementInfo | null>(null);
  const baselineRef = useRef<Record<string, VisualOverride>>({});
  const overridesRef = useRef<Record<string, VisualOverride>>({});
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: serverData } = useQuery<any>({
    queryKey: ['/api/admin/visual-overrides'],
    refetchOnWindowFocus: false,
  });

  const { data: slotsData } = useQuery<any>({
    queryKey: ['/api/admin/rollback-slots'],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (serverData && typeof serverData === 'object') {
      setOverrides(serverData);
      overridesRef.current = serverData;
      baselineRef.current = JSON.parse(JSON.stringify(serverData));
      setUnsavedChanges(0);
    }
  }, [serverData]);

  useEffect(() => {
    if (slotsData?.slots) setRollbackSlots(slotsData.slots);
  }, [slotsData]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    setSelectedElementId(null);
    setClickedElementInfo(null);
  }, []);

  const autoSaveNow = useCallback(async (newOverrides?: Record<string, VisualOverride>) => {
    const toSave = newOverrides ?? overridesRef.current;
    try {
      await adminFetch('/api/admin/visual-overrides', {
        method: 'PATCH',
        body: JSON.stringify(toSave),
      });
      baselineRef.current = JSON.parse(JSON.stringify(toSave));
      setUnsavedChanges(0);
    } catch {}
  }, []);

  const setOverride = useCallback((elementId: string, override: Partial<VisualOverride>) => {
    setOverrides(prev => {
      const updated = {
        ...prev,
        [elementId]: { ...(prev[elementId] || {}), ...override },
      };
      overridesRef.current = updated;
      const baseline = baselineRef.current;
      const changed = Object.keys(updated).filter(
        k => JSON.stringify(updated[k]) !== JSON.stringify(baseline[k])
      ).length;
      setUnsavedChanges(changed);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveNow(updated);
      }, 800);

      return updated;
    });
  }, [autoSaveNow]);

  const clearOverride = useCallback((elementId: string) => {
    setOverrides(prev => {
      const updated = { ...prev };
      delete updated[elementId];
      overridesRef.current = updated;
      const baseline = baselineRef.current;
      const changed = Object.keys(updated).filter(
        k => JSON.stringify(updated[k]) !== JSON.stringify(baseline[k])
      ).length;
      setUnsavedChanges(changed);
      return updated;
    });
  }, []);

  const clearAllOverrides = useCallback(async () => {
    setOverrides({});
    overridesRef.current = {};
    setUnsavedChanges(0);
    try {
      await adminFetch('/api/admin/visual-overrides', { method: 'DELETE' });
    } catch {}
  }, []);

  const saveToSlot = useCallback(async (name?: string) => {
    setIsSaving(true);
    try {
      await adminFetch('/api/admin/visual-overrides', {
        method: 'PATCH',
        body: JSON.stringify(overridesRef.current),
      });
      const slotRes = await adminFetch('/api/admin/rollback-slots', {
        method: 'POST',
        body: JSON.stringify({ name: name || `Save ${new Date().toLocaleString()}` }),
      });
      if (slotRes.ok) {
        const slot = await slotRes.json();
        setRollbackSlots(prev => {
          const updated = [...prev];
          const existing = updated.findIndex(s => s.index === slot.index);
          if (existing >= 0) updated[existing] = slot;
          else updated.push(slot);
          return updated.sort((a, b) => a.index - b.index);
        });
      }
      baselineRef.current = JSON.parse(JSON.stringify(overridesRef.current));
      setUnsavedChanges(0);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const restoreSlot = useCallback(async (index: number) => {
    setIsSaving(true);
    try {
      const res = await adminFetch(`/api/admin/rollback-slots/${index}/restore`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.overrides) {
          setOverrides(data.overrides);
          overridesRef.current = data.overrides;
          baselineRef.current = JSON.parse(JSON.stringify(data.overrides));
          setUnsavedChanges(0);
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Global click interceptor in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Don't intercept clicks on the editor panel itself
      if (target.closest('[data-god-editor-panel]')) return;

      e.preventDefault();
      e.stopPropagation();

      let el = target;

      // Walk up slightly to get a meaningful container (not just a text node wrapper)
      const svgParent = el.closest('svg');
      if (svgParent) {
        const iconWrapper = svgParent.parentElement as HTMLElement | null;
        el = iconWrapper ?? el;
      }

      const type = detectElementType(el);
      const veId = getOrCreateVeId(el);

      setSelectedElementId(veId);
      setClickedElementInfo({
        el,
        type,
        veId,
        x: e.clientX,
        y: e.clientY,
        rect: el.getBoundingClientRect(),
        existingText: getElementText(el),
        existingImgSrc: el.tagName === 'IMG' ? (el as HTMLImageElement).src : undefined,
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isEditMode]);

  // DOM mutation applier — applies text/image overrides after React renders
  useEffect(() => {
    function applyContentOverrides() {
      Object.entries(overridesRef.current).forEach(([id, override]) => {
        const el = document.querySelector(`[data-ve-id="${id}"]`) as HTMLElement | null;
        if (!el) return;

        if (override.text !== undefined) {
          const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
          const hasChildren = Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
          if (textNodes.length > 0) {
            textNodes[0].textContent = override.text;
            textNodes.slice(1).forEach(n => n.textContent = '');
          } else if (!hasChildren) {
            el.textContent = override.text;
          } else {
            // Prepend a text node
            const textNode = document.createTextNode(override.text);
            el.insertBefore(textNode, el.firstChild);
          }
        }

        if (override.imgSrc && el.tagName === 'IMG') {
          (el as HTMLImageElement).src = override.imgSrc;
        }
      });
    }

    const observer = new MutationObserver(applyContentOverrides);
    observer.observe(document.body, { childList: true, subtree: true });
    applyContentOverrides();

    return () => observer.disconnect();
  }, [overrides]);

  return (
    <VisualEditorContext.Provider value={{
      isEditMode, toggleEditMode,
      overrides, setOverride, clearOverride, clearAllOverrides,
      saveToSlot, restoreSlot, rollbackSlots,
      unsavedChanges, isSaving,
      selectedElementId, setSelectedElementId,
      clickedElementInfo, setClickedElementInfo,
      autoSaveNow,
    }}>
      {children}
      <VisualEditorStyles overrides={overrides} />
    </VisualEditorContext.Provider>
  );
}

function VisualEditorStyles({ overrides }: { overrides: Record<string, VisualOverride> }) {
  const css = Object.entries(overrides)
    .filter(([, o]) => !o.hidden)
    .map(([id, o]) => {
      const parts: string[] = [];
      if (o.bgColor) parts.push(`background-color: ${o.bgColor} !important;`);
      if (o.textColor) parts.push(`color: ${o.textColor} !important;`);
      if (o.borderColor) parts.push(`border-color: ${o.borderColor} !important;`);
      if (o.fontSize) parts.push(`font-size: ${o.fontSize} !important;`);
      if (o.fontWeight) parts.push(`font-weight: ${o.fontWeight} !important;`);
      if (o.opacity) parts.push(`opacity: ${o.opacity} !important;`);
      if (o.borderRadius) parts.push(`border-radius: ${o.borderRadius} !important;`);
      if (o.padding) parts.push(`padding: ${o.padding} !important;`);
      if (o.margin) parts.push(`margin: ${o.margin} !important;`);
      if (o.width) parts.push(`width: ${o.width} !important;`);
      if (o.height) parts.push(`height: ${o.height} !important;`);
      if (o.letterSpacing) parts.push(`letter-spacing: ${o.letterSpacing} !important;`);
      if (o.lineHeight) parts.push(`line-height: ${o.lineHeight} !important;`);
      if (o.textAlign) parts.push(`text-align: ${o.textAlign} !important;`);
      if (o.boxShadow) parts.push(`box-shadow: ${o.boxShadow} !important;`);
      if (o.textDecoration) parts.push(`text-decoration: ${o.textDecoration} !important;`);
      if (o.textTransform) parts.push(`text-transform: ${o.textTransform} !important;`);
      if (o.display) parts.push(`display: ${o.display} !important;`);
      if (o.wordWrap) parts.push(`white-space: ${o.wordWrap === "normal" ? "normal" : "nowrap"} !important; word-break: ${o.wordWrap === "normal" ? "break-word" : "normal"} !important;`);
      if (o.customCss) parts.push(o.customCss);
      return parts.length ? `[data-ve-id="${id}"] { ${parts.join(' ')} }` : '';
    })
    .filter(Boolean)
    .join('\n');

  const hiddenCss = Object.entries(overrides)
    .filter(([, o]) => o.hidden)
    .map(([id]) => `[data-ve-id="${id}"] { display: none !important; }`)
    .join('\n');

  return <style>{css + '\n' + hiddenCss}</style>;
}

export function useVisualEditor() {
  const ctx = useContext(VisualEditorContext);
  if (!ctx) throw new Error('useVisualEditor must be used within VisualEditorProvider');
  return ctx;
}

export function useEditableElement(elementId: string) {
  const { isEditMode, overrides, setSelectedElementId, selectedElementId } = useVisualEditor();
  const override = overrides[elementId];
  const isSelected = selectedElementId === elementId;

  const editProps = isEditMode ? {
    'data-ve-id': elementId,
    style: {
      outline: isSelected ? '2px solid #3b82f6' : undefined,
      outlineOffset: isSelected ? '2px' : undefined,
      cursor: 'crosshair',
      position: 'relative' as const,
    } as React.CSSProperties,
  } : { 'data-ve-id': elementId };

  return { editProps, override, isSelected, isEditMode };
}
