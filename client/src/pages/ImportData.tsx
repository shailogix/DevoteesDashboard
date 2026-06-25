import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Database, RotateCcw, AlertTriangle, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ImportData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [jsonText, setJsonText] = useState("");
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState<any>(null);

  // Simulated list of columns in Devotee schema
  const schemaColumns = [
    "firstName", "lastName", "email", "phone", "whatsappNumber",
    "address", "city", "state", "pincode", "occupation",
    "spiritualLevel"
  ];

  const handleParse = () => {
    try {
      setError("");
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setError("Input must be a JSON Array of records");
        return;
      }
      if (parsed.length === 0) {
        setError("JSON array is empty");
        return;
      }
      
      // Verify first record schema
      const first = parsed[0];
      const hasRequired = first.firstName && first.lastName;
      if (!hasRequired) {
        setError("Each record must contain 'firstName' and 'lastName'");
        return;
      }
      setParsedRecords(parsed);
      toast({ title: "Parse Successful", description: `Loaded ${parsed.length} records.` });
    } catch (err: any) {
      setError("Invalid JSON format. Check brackets and quotes.");
    }
  };

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/import/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Import request failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Import Batch #${data.batchId}: Created ${data.createdCount} and merged ${data.updatedCount} records.`,
      });
      setImportStatus(data);
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (err: any) => {
      toast({
        title: "Import Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (parsedRecords.length === 0) return;
    importMutation.mutate({
      fileName: `CommunityImport_${format(new Date(), "yyyyMMdd_HHmmss")}.json`,
      records: parsedRecords,
    });
  };

  const rollbackMutation = useMutation({
    mutationFn: async (batchId: number) => {
      const res = await fetch(`/api/admin/import/rollback/${batchId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Rollback request failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rollback Complete",
        description: data.message,
      });
      setImportStatus(null);
      setParsedRecords([]);
      setJsonText("");
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (err: any) => {
      toast({
        title: "Rollback Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <Header 
        title="Intelligent Data Import" 
        subtitle="Upload devotee spreadsheets (JSON) to smartly match, merge, and record community databases." 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column Mapping Help */}
          <Card className="lg:col-span-1 border border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Schema Mappings
              </CardTitle>
              <CardDescription>Match your import keys with devotee profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Smart matching matches existing records by <strong>email</strong>, <strong>phone</strong>, or <strong>first + last name</strong> combinations to update instead of creating duplicates.
              </p>
              
              <div className="space-y-1.5">
                <p className="font-bold text-foreground">Available Target Columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {schemaColumns.map((col) => (
                    <Badge key={col} variant="secondary" className="font-mono text-[10px]">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-amber-700 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Columns like <strong>firstName</strong> and <strong>lastName</strong> are required.</span>
              </div>
            </CardContent>
          </Card>

          {/* Code/Import Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" /> Upload JSON Dataset
                </CardTitle>
                <CardDescription>Paste your records array directly into the input below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full h-48 p-3 font-mono text-xs rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder='[\n  { "firstName": "Madhava", "lastName": "Das", "email": "madhava@das.org", "phone": "9876543210", "spiritualLevel": "Initiated" }\n]'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />

                {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

                <div className="flex justify-end gap-3">
                  <Button onClick={handleParse} variant="outline" className="text-xs">
                    Parse & Validate
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={parsedRecords.length === 0 || importMutation.isPending}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    {importMutation.isPending ? "Importing..." : `Import ${parsedRecords.length} Records`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rollback & Status Panel */}
            {importStatus && (
              <Card className="border border-green-600/30 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-base text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Import Summary (Batch #{importStatus.batchId})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-green-800">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-background border border-border/40 rounded-xl">
                      <p className="text-2xl font-black text-foreground">{importStatus.createdCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">New Profiles Created</p>
                    </div>
                    <div className="p-3 bg-background border border-border/40 rounded-xl">
                      <p className="text-2xl font-black text-foreground">{importStatus.updatedCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Profiles Merged/Updated</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-green-600/10">
                    <p className="text-xs text-muted-foreground">Made a mistake? You can instantly rollback this import session.</p>
                    <Button
                      onClick={() => rollbackMutation.mutate(importStatus.batchId)}
                      disabled={rollbackMutation.isPending}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {rollbackMutation.isPending ? "Rolling back..." : "Rollback Session"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
