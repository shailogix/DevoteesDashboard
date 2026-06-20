import React, { createContext, useContext, useState, useEffect } from 'react';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'calendar' | 'custom';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
}

interface DashboardContextType {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { width: number; height: number }) => void;
  saveLayout: (name: string) => void;
  loadLayout: (layoutId: string) => void;
  isDesignMode: boolean;
  setDesignMode: (mode: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isDesignMode, setDesignMode] = useState(false);

  useEffect(() => {
    // Load saved layout from localStorage etc
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setWidgets(parsedLayout);
      } catch (error) {
        console.error('Failed to parse saved layout:', error);
      }
    } else {
      // Load default layout
      setWidgets([
        {
          id: 'stats-1',
          type: 'stats',
          title: 'Total Devotees',
          position: { x: 0, y: 0 },
          size: { width: 1, height: 1 },
          config: { metric: 'devotees', color: 'saffron' }
        },
        {
          id: 'stats-2',
          type: 'stats',
          title: 'Active Families',
          position: { x: 1, y: 0 },
          size: { width: 1, height: 1 },
          config: { metric: 'families', color: 'blue' }
        },
        {
          id: 'chart-1',
          type: 'chart',
          title: 'Attendance Overview',
          position: { x: 0, y: 1 },
          size: { width: 2, height: 2 },
          config: { chartType: 'line', dataSource: 'attendance' }
        }
      ]);
    }
  }, []);

  const addWidget = (widget: Omit<Widget, 'id'>) => {
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const moveWidget = (id: string, position: { x: number; y: number }) => {
    updateWidget(id, { position });
  };

  const resizeWidget = (id: string, size: { width: number; height: number }) => {
    updateWidget(id, { size });
  };

  const saveLayout = (name: string) => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    localStorage.setItem('dashboard-layout-name', name);
  };

  const loadLayout = (layoutId: string) => {
    // In a real app, this would load from the database
    const savedLayout = localStorage.getItem(layoutId);
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setWidgets(parsedLayout);
      } catch (error) {
        console.error('Failed to load layout:', error);
      }
    }
  };

  // Auto-save layout changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [widgets]);

  return (
    <DashboardContext.Provider value={{
      widgets,
      addWidget,
      updateWidget,
      removeWidget,
      moveWidget,
      resizeWidget,
      saveLayout,
      loadLayout,
      isDesignMode,
      setDesignMode
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
