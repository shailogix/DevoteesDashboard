import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, Upload, Table, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";

const ENTITIES = [
  { key: "devotees", label: "Devotees", icon: "Users" },
  { key: "families", label: "Families", icon: "Building" },
  { key: "events", label: "Events", icon: "Calendar" },
  { key: "attendance", label: "Attendance", icon: "CheckCircle" },
  { key: "donations", label: "Donations", icon: "Heart" },
  { key: "volunteering", label: "Volunteering", icon: "HandHeart" },
  { key: "mentors", label: "Mentors", icon: "GraduationCap" },
  { key: "groups", label: "Groups", icon: "Users" },
  { key: "mandals", label: "Mandals", icon: "MapPin" },
  { key: "sabha_locations", label: "Sabha Locations", icon: "MapPin" },
  { key: "group_memberships", label: "Group Memberships", icon: "Link" },
  { key: "dev_macros", label: "Dev Macros", icon: "Zap" },
  { key: "page_registry", label: "Page Registry", icon: "Layers" },
  { key: "schema_registry", label: "Schema Registry", icon: "Table" },
  { key: "route_registry", label: "Route Registry", icon: "Terminal" },
  { key: "audit_log", label: "Audit Log", icon: "Activity" },
  { key: "users", label: "Users", icon: "Shield" },
];

function jsonToCsv(data: any[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function csvToJson(csvText: string): any[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: any = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function CsvExportImport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState("devotees");
  const [importCsv, setImportCsv] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  const { data: entityData = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/export/entity", selectedEntity],
    queryFn: () => fetch(`/api/admin/export/entity?table=${selectedEntity}`, { credentials: "include" }).then(r => r.json()),
    enabled: activeTab === "export",
  });

  const importMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/import/entity", { table: selectedEntity, rows: data }),
    onSuccess: (res: any) => {
      toast({ title: `Imported ${res.imported || 0} rows` });
      setImportCsv("");
      setImportPreview([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/export/entity", selectedEntity] });
    },
    onError: (err: any) => toast({ title: "Import failed", description: err.message, variant: "destructive" }),
  });

  const handleExportCsv = () => {
    const csv = jsonToCsv(entityData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedEntity}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${selectedEntity} exported to CSV` });
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(entityData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedEntity}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${selectedEntity} exported to JSON` });
  };

  const handlePreviewImport = () => {
    if (!importCsv.trim()) return;
    try {
      const rows = csvToJson(importCsv);
      setImportPreview(rows);
      toast({ title: `Preview: ${rows.length} rows parsed` });
    } catch (e: any) {
      toast({ title: "Failed to parse CSV", description: e.message, variant: "destructive" });
    }
  };

  const handleImport = () => {
    if (importPreview.length === 0) return;
    importMutation.mutate(importPreview);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              {ENTITIES.map(e => <SelectItem key={e.key} value={e.key}>{e.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={activeTab === "export" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("export")}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button variant={activeTab === "import" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("import")}>
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
          </div>
        </div>

        {activeTab === "export" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Table className="w-4 h-4" /> Export {selectedEntity}</CardTitle>
              <CardDescription>{entityData.length} records available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Button size="sm" onClick={handleExportCsv} disabled={entityData.length === 0}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportJson} disabled={entityData.length === 0}>
                  <FileJson className="w-4 h-4 mr-1" /> JSON
                </Button>
              </div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <ScrollArea className="h-72">
                  <div className="space-y-1">
                    {entityData.slice(0, 50).map((row, idx) => (
                      <div key={idx} className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded border-b last:border-0">
                        {JSON.stringify(row, null, 2).slice(0, 200)}...
                      </div>
                    ))}
                    {entityData.length > 50 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        + {entityData.length - 50} more rows
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "import" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Import into {selectedEntity}</CardTitle>
              <CardDescription>Paste CSV data below. First row must be headers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={importCsv}
                onChange={e => setImportCsv(e.target.value)}
                placeholder="first_name,last_name,email,phone\nRamesh,Patel,ramesh@test.com,9876543210\nSita,Sharma,sita@test.com,9876543211"
                className="min-h-[160px] font-mono text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handlePreviewImport} disabled={!importCsv.trim()}>
                  <AlertTriangle className="w-4 h-4 mr-1" /> Preview
                </Button>
                <Button size="sm" onClick={handleImport} disabled={importPreview.length === 0 || importMutation.isPending}>
                  {importMutation.isPending ? "Importing..." : <><CheckCircle className="w-4 h-4 mr-1" /> Import {importPreview.length} Rows</>}
                </Button>
              </div>
              {importPreview.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Preview: {importPreview.length} rows parsed. First row: {Object.keys(importPreview[0]).join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Supported Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline">CSV</Badge>
                <span className="text-muted-foreground">Comma-separated with headers</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">JSON</Badge>
                <span className="text-muted-foreground">Array of objects</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>Export first to see the expected format</li>
              <li>CSV headers should match column names</li>
              <li>JSON uses the same format as the API</li>
              <li>Auto-increment IDs (serial) are generated automatically</li>
              <li>Dates should be in ISO format (YYYY-MM-DD)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
