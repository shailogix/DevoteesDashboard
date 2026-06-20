
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, QrCode, Edit, Trash2 } from "lucide-react";
import { Group, GroupEntry } from "@shared/schema";

interface GroupEntriesListProps {
  group: Group;
  onClose: () => void;
}

export function GroupEntriesList({ group, onClose }: GroupEntriesListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: entries = [], isLoading } = useQuery<GroupEntry[]>({
    queryKey: ["/api/group-entries", group.id],
  });

  const customFields = (group.customFields as any[]) || [];
  const visibleFields = customFields.slice(0, 5); // Show first 5 fields in table

  const filteredEntries = entries?.filter((entry: GroupEntry) => {
    const entryData = entry.entryData as any;
    return Object.values(entryData).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  const handleExportData = () => {
    // This would implement CSV/Excel export functionality
    console.log("Exporting data for group:", group.groupName);
  };

  const handleGenerateQR = (entry: GroupEntry) => {
    // This would implement QR code generation
    console.log("Generating QR for entry:", entry.uniqueMemberId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{group.groupName} Entries</h3>
          <p className="text-sm text-muted-foreground">
            {filteredEntries.length} entries found
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "No entries match your search." : "No entries found for this group."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                {visibleFields.map((field) => (
                  <TableHead key={field.id}>{field.name}</TableHead>
                ))}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry: GroupEntry) => {
                const entryData = entry.entryData as any;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      {entry.uniqueMemberId || 'N/A'}
                    </TableCell>
                    {visibleFields.map((field) => (
                      <TableCell key={field.id}>
                        {field.type === 'multiselect' && Array.isArray(entryData[field.id]) ? (
                          <div className="flex flex-wrap gap-1">
                            {entryData[field.id].slice(0, 2).map((item: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {entryData[field.id].length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{entryData[field.id].length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : field.type === 'boolean' ? (
                          <Badge variant={entryData[field.id] === 'yes' ? 'default' : 'secondary'}>
                            {entryData[field.id] === 'yes' ? 'Yes' : 'No'}
                          </Badge>
                        ) : field.type === 'date' && entryData[field.id] ? (
                          new Date(entryData[field.id]).toLocaleDateString()
                        ) : (
                          <span className="truncate max-w-32 block" title={entryData[field.id] || undefined}>
                            {entryData[field.id] || '-'}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant={entry.isActive ? 'default' : 'secondary'}>
                        {entry.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateQR(entry)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
