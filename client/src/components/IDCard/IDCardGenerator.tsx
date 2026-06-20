import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Type, 
  Image, 
  Layout,
  Download,
  Eye,
  Settings
} from "lucide-react";

interface IDCardGeneratorProps {
  devotees: any[];
  onGenerate: (settings: any) => void;
}

export function IDCardGenerator({ devotees, onGenerate }: IDCardGeneratorProps) {
  const [settings, setSettings] = useState({
    template: 'default',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontSize: 12,
    includePhoto: true,
    includeQR: true,
    includeAddress: true,
    orientation: 'portrait',
    cardSize: 'credit',
  });

  const templates = [
    { id: 'default', name: 'Default', description: 'Standard temple design' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
    { id: 'ornate', name: 'Ornate', description: 'Decorative borders' },
    { id: 'modern', name: 'Modern', description: 'Contemporary design' },
  ];

  const cardSizes = [
    { id: 'credit', name: 'Credit Card', dimensions: '85.6 × 53.98 mm' },
    { id: 'badge', name: 'Badge', dimensions: '90 × 60 mm' },
    { id: 'custom', name: 'Custom', dimensions: 'Custom size' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>ID Card Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Template</Label>
          <Select value={settings.template} onValueChange={(value) => setSettings({...settings, template: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground">{template.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Primary Color</span>
            </Label>
            <Input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Secondary Color</span>
            </Label>
            <Input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
              className="h-10"
            />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Font Size: {settings.fontSize}px</span>
          </Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) => setSettings({...settings, fontSize: value[0]})}
            max={20}
            min={8}
            step={1}
            className="w-full"
          />
        </div>

        {/* Card Size */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Layout className="w-4 h-4" />
            <span>Card Size</span>
          </Label>
          <Select value={settings.cardSize} onValueChange={(value) => setSettings({...settings, cardSize: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cardSizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{size.name}</span>
                    <span className="text-xs text-muted-foreground">{size.dimensions}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Include Options</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <Label htmlFor="include-photo">Include Photo</Label>
            </div>
            <Switch
              id="include-photo"
              checked={settings.includePhoto}
              onCheckedChange={(checked) => setSettings({...settings, includePhoto: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 flex items-center justify-center text-xs font-mono border">QR</span>
              <Label htmlFor="include-qr">Include QR Code</Label>
            </div>
            <Switch
              id="include-qr"
              checked={settings.includeQR}
              onCheckedChange={(checked) => setSettings({...settings, includeQR: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 flex items-center justify-center text-xs">📍</span>
              <Label htmlFor="include-address">Include Address</Label>
            </div>
            <Switch
              id="include-address"
              checked={settings.includeAddress}
              onCheckedChange={(checked) => setSettings({...settings, includeAddress: checked})}
            />
          </div>
        </div>

        {/* Orientation */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Orientation</Label>
          <Select value={settings.orientation} onValueChange={(value) => setSettings({...settings, orientation: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="font-medium text-sm">Generation Summary</div>
          <div className="text-sm text-muted-foreground">
            <div>Template: <Badge variant="outline">{templates.find(t => t.id === settings.template)?.name}</Badge></div>
            <div className="mt-1">Cards to generate: <Badge>{devotees?.length || 0}</Badge></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={() => onGenerate(settings)} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Generate ID Cards
          </Button>
          <Button variant="outline" onClick={() => onGenerate(settings)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}