import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Database, RotateCcw, AlertTriangle, FileSpreadsheet, CheckCircle2, AlertCircle, Edit, Check } from "lucide-react";
import { format } from "date-fns";

export default function ImportData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [jsonText, setJsonText] = useState("");
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState<any>(null);
  
  // Double click cell editing states
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colName: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");

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
      
      setParsedRecords(parsed);
      toast({ title: "Parse Successful", description: `Loaded ${parsed.length} records. Please review validations below.` });
    } catch (err: any) {
      setError("Invalid JSON format. Check brackets, commas, and quotes.");
    }
  };

  // Perform validation checks on records in memory
  const getValidatedRecords = () => {
    const emailCounts: Record<string, number> = {};
    parsedRecords.forEach((r: any) => {
      if (r.email) {
        const email = r.email.toLowerCase().trim();
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      }
    });

    return parsedRecords.map((record: any, index: number) => {
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];

      if (!record.firstName) rowErrors.push("First Name is required");
      if (!record.lastName) rowErrors.push("Last Name is required");

      if (record.email && emailCounts[record.email.toLowerCase().trim()] > 1) {
        rowWarnings.push("Duplicate email inside import batch");
      }

      const phoneRegex = /^[0-9+() -]{8,20}$/;
      if (record.phone && !phoneRegex.test(record.phone)) {
        rowWarnings.push("Invalid phone format");
      }
      if (record.whatsappNumber && !phoneRegex.test(record.whatsappNumber)) {
        rowWarnings.push("Invalid WhatsApp format");
      }

      return {
        ...record,
        _index: index,
        _errors: rowErrors,
        _warnings: rowWarnings,
        _hasErrors: rowErrors.length > 0,
        _hasWarnings: rowWarnings.length > 0
      };
    });
  };

  const validatedRecords = getValidatedRecords();
  const hasCriticalErrors = validatedRecords.some(r => r._hasErrors);

  const handleCellDoubleClick = (rowIndex: number, colName: string, value: string) => {
    setEditingCell({ rowIndex, colName });
    setEditingValue(value || "");
  };

  const handleCellSave = (rowIndex: number, colName: string) => {
    const updated = [...parsedRecords];
    updated[rowIndex] = { ...updated[rowIndex], [colName]: editingValue };
    setParsedRecords(updated);
    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/import/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
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
    if (parsedRecords.length === 0 || hasCriticalErrors) return;
    importMutation.mutate({
      fileName: `CommunityImport_${format(new Date(), "yyyyMMdd_HHmmss")}.json`,
      records: parsedRecords,
    });
  };

  const rollbackMutation = useMutation({
    mutationFn: async (batchId: number) => {
      const res = await fetch(`/api/admin/import/rollback/${batchId}`, {
        method: "POST",
        credentials: "include",
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
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-transparent">
      <Header 
        title="Intelligent Data Import" 
        subtitle="Upload devotee spreadsheets (JSON) to smartly match, merge, and record community databases." 
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column Mapping Help */}
          <Card className="lg:col-span-1 border border-amber-200/50 shadow-sm bg-white/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-950 font-bold">
                <Database className="w-4 h-4 text-orange-600" /> Schema Mappings
              </CardTitle>
              <CardDescription>Match your import keys with devotee profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Smart matching matches existing records by <strong>email</strong>, <strong>phone</strong>, or <strong>first + last name</strong> combinations to update instead of creating duplicates.
              </p>
              
              <div className="space-y-2">
                <p className="font-bold text-amber-900">Available Target Columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {schemaColumns.map((col) => (
                    <Badge key={col} variant="secondary" className="font-mono text-[10px] bg-amber-50 border border-amber-100 text-amber-900">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/50 p-3 rounded-lg text-[11px] text-amber-800 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                <span>Columns like <strong>firstName</strong> and <strong>lastName</strong> are required. Duplicates inside the batch will be flagged in orange.</span>
              </div>
            </CardContent>
          </Card>

          {/* JSON Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-amber-200/50 shadow-sm bg-white/70 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-950 font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" /> Upload JSON Dataset
                </CardTitle>
                <CardDescription>Paste your devotee array directly into the input block below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full h-44 p-3 font-mono text-xs rounded-lg border border-amber-200 bg-white/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder='[\n  { "firstName": "Madhava", "lastName": "Das", "email": "madhava@das.org", "phone": "9876543210", "spiritualLevel": "Initiated" }\n]'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />

                {error && <p className="text-xs font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

                <div className="flex justify-end gap-3">
                  <Button onClick={handleParse} variant="outline" className="border-amber-200 hover:bg-amber-50 text-amber-950 text-xs">
                    Parse & Validate
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={parsedRecords.length === 0 || importMutation.isPending || hasCriticalErrors}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold shadow-sm"
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
                    <div className="p-3 bg-white border border-green-200 rounded-xl shadow-sm">
                      <p className="text-2xl font-black text-green-950">{importStatus.createdCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">New Profiles Created</p>
                    </div>
                    <div className="p-3 bg-white border border-green-200 rounded-xl shadow-sm">
                      <p className="text-2xl font-black text-green-950">{importStatus.updatedCount}</p>
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

        {/* Validation Spreadsheet Preview Grid */}
        {validatedRecords.length > 0 && (
          <Card className="border border-amber-200/50 shadow-sm bg-white/70 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-amber-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base text-amber-950 font-bold flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-orange-600" /> Spreadsheet Validation Grid
                  </CardTitle>
                  <CardDescription>Double-click any cell to correct data errors inline. Validations re-evaluate on save.</CardDescription>
                </div>
                {hasCriticalErrors && (
                  <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Critical Errors Found (Import Blocked)
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-amber-50/50">
                  <TableRow>
                    <TableHead className="w-[80px] font-bold text-amber-950">Row</TableHead>
                    <TableHead className="font-bold text-amber-950">First Name *</TableHead>
                    <TableHead className="font-bold text-amber-950">Last Name *</TableHead>
                    <TableHead className="font-bold text-amber-950">Email</TableHead>
                    <TableHead className="font-bold text-amber-950">Phone</TableHead>
                    <TableHead className="font-bold text-amber-950">WhatsApp</TableHead>
                    <TableHead className="font-bold text-amber-950">Spiritual Level</TableHead>
                    <TableHead className="w-[180px] font-bold text-amber-950 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatedRecords.map((record) => {
                    const rowClass = record._hasErrors 
                      ? "bg-red-50/70 hover:bg-red-100/50" 
                      : record._hasWarnings 
                        ? "bg-amber-50/40 hover:bg-amber-100/30" 
                        : "hover:bg-slate-50";

                    return (
                      <TableRow key={record._index} className={`${rowClass} transition-colors duration-200`}>
                        <TableCell className="font-mono text-xs text-muted-foreground">#{record._index + 1}</TableCell>
                        
                        {/* First Name Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "firstName", record.firstName)}
                          className={`cursor-pointer min-w-[120px] text-xs font-semibold ${!record.firstName ? "bg-red-100/40 border border-red-300" : ""}`}
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "firstName" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "firstName")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "firstName")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.firstName || <span className="text-red-500 italic">Missing</span>
                          )}
                        </TableCell>

                        {/* Last Name Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "lastName", record.lastName)}
                          className={`cursor-pointer min-w-[120px] text-xs font-semibold ${!record.lastName ? "bg-red-100/40 border border-red-300" : ""}`}
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "lastName" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "lastName")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "lastName")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.lastName || <span className="text-red-500 italic">Missing</span>
                          )}
                        </TableCell>

                        {/* Email Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "email", record.email)}
                          className={`cursor-pointer min-w-[150px] text-xs font-medium ${
                            record._warnings.some((w: string) => w.includes("Duplicate email")) 
                              ? "border border-orange-300 bg-orange-50/20" 
                              : ""
                          }`}
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "email" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "email")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "email")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.email || <span className="text-muted-foreground italic">None</span>
                          )}
                        </TableCell>

                        {/* Phone Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "phone", record.phone)}
                          className={`cursor-pointer min-w-[120px] text-xs ${
                            record._warnings.some((w: string) => w.includes("phone format")) 
                              ? "border border-yellow-300 bg-yellow-50/20" 
                              : ""
                          }`}
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "phone" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "phone")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "phone")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.phone || <span className="text-muted-foreground italic">None</span>
                          )}
                        </TableCell>

                        {/* WhatsApp Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "whatsappNumber", record.whatsappNumber)}
                          className={`cursor-pointer min-w-[120px] text-xs ${
                            record._warnings.some((w: string) => w.includes("WhatsApp")) 
                              ? "border border-yellow-300 bg-yellow-50/20" 
                              : ""
                          }`}
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "whatsappNumber" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "whatsappNumber")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "whatsappNumber")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.whatsappNumber || <span className="text-muted-foreground italic">None</span>
                          )}
                        </TableCell>

                        {/* Spiritual Level Cell */}
                        <TableCell 
                          onDoubleClick={() => handleCellDoubleClick(record._index, "spiritualLevel", record.spiritualLevel)}
                          className="cursor-pointer min-w-[110px] text-xs"
                        >
                          {editingCell?.rowIndex === record._index && editingCell?.colName === "spiritualLevel" ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(record._index, "spiritualLevel")}
                                className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCellSave(record._index, "spiritualLevel")}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            record.spiritualLevel || "Beginner"
                          )}
                        </TableCell>

                        {/* Status Column */}
                        <TableCell className="text-right whitespace-nowrap min-w-[150px]">
                          {record._errors.length > 0 ? (
                            <div className="flex flex-col items-end gap-0.5">
                              {record._errors.map((err: string, i: number) => (
                                <Badge key={i} variant="destructive" className="text-[9px] font-bold py-0 h-4">
                                  {err}
                                </Badge>
                              ))}
                            </div>
                          ) : record._warnings.length > 0 ? (
                            <div className="flex flex-col items-end gap-0.5">
                              {record._warnings.map((warn: string, i: number) => {
                                const varColor = warn.includes("Duplicate email") 
                                  ? "bg-orange-600 hover:bg-orange-600" 
                                  : "bg-yellow-600 hover:bg-yellow-600";
                                return (
                                  <Badge key={i} className={`text-[9px] text-white font-bold py-0 h-4 border-none ${varColor}`}>
                                    {warn}
                                  </Badge>
                                );
                              })}
                            </div>
                          ) : (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[9px] py-0 h-4 border-none flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Valid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
