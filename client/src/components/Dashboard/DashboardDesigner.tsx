import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/contexts/DashboardContext";
import { DraggableWidget } from "./DraggableWidget";
import { StatsCard } from "./StatsCard";
import { AttendanceChart } from "./AttendanceChart";
import { RecentActivities } from "./RecentActivities";
import { 
  Plus, 
  Save, 
  Layout, 
  BarChart3, 
  Users, 
  Calendar, 
  Heart,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

const widgetTypes = [
  { value: 'stats', label: 'Statistics Card', icon: BarChart3, description: 'Display key metrics' },
  { value: 'chart', label: 'Chart Widget', icon: BarChart3, description: 'Various chart types' },
  { value: 'list', label: 'List Widget', icon: Users, description: 'Display data in lists' },
  { value: 'calendar', label: 'Calendar Widget', icon: Calendar, description: 'Show events and dates' },
  { value: 'custom', label: 'Custom Widget', icon: Settings, description: 'Custom content' },
];

export function DashboardDesigner() {
  const { 
    widgets, 
    addWidget, 
    isDesignMode, 
    setDesignMode, 
    saveLayout 
  } = useDashboard();
  
  const [layoutName, setLayoutName] = useState("");
  const [selectedWidgetType, setSelectedWidgetType] = useState("");

  const handleAddWidget = () => {
    if (!selectedWidgetType) return;

    const newWidget = {
      type: selectedWidgetType as any,
      title: `New ${selectedWidgetType} Widget`,
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
      config: {}
    };

    addWidget(newWidget);
    setSelectedWidgetType("");
  };

  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName);
      setLayoutName("");
    }
  };

  const renderWidget = (widget: any) => {
    const key = `widget-${widget.id}`;
    
    switch (widget.type) {
      case 'stats':
        return (
          <DraggableWidget key={key} id={widget.id} title={widget.title} type={widget.type}>
            <StatsCard
              title="Sample Metric"
              value="1,234"
              change={{ value: "+12%", trend: "up" }}
              icon={Users}
              color="from-primary to-secondary"
            />
          </DraggableWidget>
        );
      case 'chart':
        return (
          <DraggableWidget key={key} id={widget.id} title={widget.title} type={widget.type} className="col-span-2">
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart widget preview</p>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'list':
        return (
          <DraggableWidget key={key} id={widget.id} title={widget.title} type={widget.type}>
            <RecentActivities />
          </DraggableWidget>
        );
      default:
        return (
          <DraggableWidget key={key} id={widget.id} title={widget.title} type={widget.type}>
            <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Widget content</p>
            </div>
          </DraggableWidget>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Designer Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layout className="w-5 h-5" />
            <span>Dashboard Designer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Design Mode Toggle */}
            <div className="space-y-2">
              <Label>Design Mode</Label>
              <Button
                variant={isDesignMode ? "default" : "outline"}
                onClick={() => setDesignMode(!isDesignMode)}
                className="w-full"
              >
                {isDesignMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Exit Design
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Enter Design
                  </>
                )}
              </Button>
            </div>

            {/* Add Widget */}
            <div className="space-y-2">
              <Label>Add Widget</Label>
              <div className="flex space-x-2">
                <Select value={selectedWidgetType} onValueChange={setSelectedWidgetType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddWidget}
                  disabled={!selectedWidgetType}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Save Layout */}
            <div className="space-y-2">
              <Label>Save Layout</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Layout name"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                />
                <Button
                  onClick={handleSaveLayout}
                  disabled={!layoutName.trim()}
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Widget Count */}
            <div className="space-y-2">
              <Label>Widgets</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {widgets.length}
                </Badge>
                <span className="text-sm text-muted-foreground">Total widgets</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Mode Instructions */}
      {isDesignMode && (
        <Card className="border-dashed border-2 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <Layout className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Design Mode Active</h3>
              <p className="text-muted-foreground">
                Drag widgets to rearrange them. Use the controls in widget headers to configure or remove them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(renderWidget)}
      </div>

      {/* Widget Library */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.value}
                  className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedWidgetType(type.value)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardDesigner;
