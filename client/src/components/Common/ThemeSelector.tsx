import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="space-y-2">
      <Label className="flex items-center space-x-2 text-sm font-medium">
        <Palette className="w-4 h-4" />
        <span>Theme</span>
      </Label>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {themes.map((themeOption) => (
            <SelectItem key={themeOption.value} value={themeOption.value}>
              <div>
                <div className="font-medium">{themeOption.label}</div>
                <div className="text-xs text-muted-foreground">{themeOption.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
