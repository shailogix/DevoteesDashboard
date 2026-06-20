import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, Settings } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

interface DraggableWidgetProps {
  id: string;
  title: string;
  type: string;
  children: React.ReactNode;
  className?: string;
}

export function DraggableWidget({ id, title, type, children, className = "" }: DraggableWidgetProps) {
  const { isDesignMode, removeWidget } = useDashboard();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg ${
        isDragging ? 'opacity-50' : ''
      } ${isDesignMode ? 'cursor-move border-2 border-dashed border-primary/50' : ''} ${className}`}
      draggable={isDesignMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {type}
            </Badge>
          </div>
          
          {isDesignMode && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => removeWidget(id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="cursor-move text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
