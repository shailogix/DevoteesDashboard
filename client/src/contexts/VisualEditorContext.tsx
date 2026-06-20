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
  hidden?: boolean;
  wordWrap?: "normal" | "nowrap";
  customCss?: string;
}

export interface RollbackSlot {
  index: number;
  name: string;
  savedAt: string;
  overrides: Record<string, VisualOverride>;
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
}

const VisualEditorContext = createContext<VisualEditorContextType | undefined>(undefined);

export function VisualEditorProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, VisualOverride>>({});
  const [rollbackSlots, setRollbackSlots] = useState<RollbackSlot[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const baselineRef = useRef<Record<string, VisualOverride>>({});

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
      baselineRef.current = JSON.parse(JSON.stringify(serverData));
      setUnsavedChanges(0);
    }
  }, [serverData]);

  useEffect(() => {
    if (slotsData?.slots) {
      setRollbackSlots(slotsData.slots);
    }
  }, [slotsData]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    setSelectedElementId(null);
  }, []);

  const setOverride = useCallback((elementId: string, override: Partial<VisualOverride>) => {
    setOverrides(prev => {
      const updated = {
        ...prev,
        [elementId]: { ...(prev[elementId] || {}), ...override },
      };
      const baseline = baselineRef.current;
      const changed = Object.keys(updated).filter(
        k => JSON.stringify(updated[k]) !== JSON.stringify(baseline[k])
      ).length;
      setUnsavedChanges(changed);
      return updated;
    });
  }, []);

  const clearOverride = useCallback((elementId: string) => {
    setOverrides(prev => {
      const updated = { ...prev };
      delete updated[elementId];
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
        body: JSON.stringify(overrides),
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
      baselineRef.current = JSON.parse(JSON.stringify(overrides));
      setUnsavedChanges(0);
    } finally {
      setIsSaving(false);
    }
  }, [overrides]);

  const restoreSlot = useCallback(async (index: number) => {
    setIsSaving(true);
    try {
      const res = await adminFetch(`/api/admin/rollback-slots/${index}/restore`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.overrides) {
          setOverrides(data.overrides);
          baselineRef.current = JSON.parse(JSON.stringify(data.overrides));
          setUnsavedChanges(0);
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <VisualEditorContext.Provider value={{
      isEditMode, toggleEditMode,
      overrides, setOverride, clearOverride, clearAllOverrides,
      saveToSlot, restoreSlot, rollbackSlots,
      unsavedChanges, isSaving,
      selectedElementId, setSelectedElementId,
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
    onClick: (e: React.MouseEvent) => {
      if (isEditMode) {
        e.stopPropagation();
        setSelectedElementId(isSelected ? null : elementId);
      }
    },
    style: {
      outline: isSelected ? '2px solid #3b82f6' : undefined,
      outlineOffset: isSelected ? '2px' : undefined,
      cursor: 'pointer',
      position: 'relative' as const,
    } as React.CSSProperties,
    className: isEditMode ? 've-editable' : '',
  } : { 'data-ve-id': elementId };

  return { editProps, override, isSelected, isEditMode };
}
