import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Download, ZoomIn, ZoomOut, RotateCcw, Database } from "lucide-react";

interface SchemaField {
  name: string;
  type: string;
  notNull?: boolean;
  default?: string;
  unique?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  referencesTable?: string;
  referencesColumn?: string;
}

interface SchemaTable {
  name: string;
  label: string;
  fields: SchemaField[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface SchemaRelation {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

interface SchemaInfo {
  tables: SchemaTable[];
  relations: SchemaRelation[];
}

const SCHEMA_DATA: SchemaInfo = {
  tables: [
    {
      name: "users",
      label: "Users",
      fields: [
        { name: "id", type: "varchar", notNull: true, isPrimaryKey: true },
        { name: "role", type: "varchar", notNull: true, default: "user" },
        { name: "email", type: "varchar", unique: true },
        { name: "first_name", type: "varchar" },
        { name: "last_name", type: "varchar" },
        { name: "profile_image_url", type: "varchar" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 50, y: 50,
    },
    {
      name: "sessions",
      label: "Sessions",
      fields: [
        { name: "sid", type: "varchar", notNull: true, isPrimaryKey: true },
        { name: "sess", type: "jsonb", notNull: true },
        { name: "expire", type: "timestamp", notNull: true },
      ],
      x: 50, y: 320,
    },
    {
      name: "devotees",
      label: "Devotees",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "devotee_id", type: "varchar", notNull: true, unique: true },
        { name: "first_name", type: "varchar", notNull: true },
        { name: "last_name", type: "varchar", notNull: true },
        { name: "email", type: "varchar", unique: true },
        { name: "phone", type: "varchar" },
        { name: "city", type: "varchar" },
        { name: "mentor_id", type: "integer", isForeignKey: true, referencesTable: "mentors", referencesColumn: "id" },
        { name: "family_id", type: "integer", isForeignKey: true, referencesTable: "families", referencesColumn: "id" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 350, y: 50,
    },
    {
      name: "families",
      label: "Families",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "family_name", type: "varchar", notNull: true },
        { name: "head_of_family", type: "integer", isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "city", type: "varchar" },
        { name: "total_members", type: "integer" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 650, y: 50,
    },
    {
      name: "mentors",
      label: "Mentors",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "devotee_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "specialization", type: "varchar" },
        { name: "max_mentees", type: "integer" },
        { name: "current_mentees", type: "integer" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 50,
    },
    {
      name: "events",
      label: "Events",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "title", type: "varchar", notNull: true },
        { name: "event_type", type: "varchar", notNull: true },
        { name: "start_date", type: "timestamp", notNull: true },
        { name: "location", type: "varchar" },
        { name: "capacity", type: "integer" },
        { name: "status", type: "varchar", default: "planned" },
        { name: "is_archived", type: "boolean", default: "false" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 350, y: 380,
    },
    {
      name: "attendance",
      label: "Attendance",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "devotee_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "event_id", type: "integer", isForeignKey: true, referencesTable: "events", referencesColumn: "id" },
        { name: "attendance_date", type: "timestamp", notNull: true },
        { name: "status", type: "varchar", default: "present" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 50, y: 550,
    },
    {
      name: "donations",
      label: "Donations",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "devotee_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "amount", type: "decimal", notNull: true },
        { name: "donation_type", type: "varchar", notNull: true },
        { name: "donation_date", type: "timestamp", notNull: true },
        { name: "payment_method", type: "varchar" },
        { name: "status", type: "varchar", default: "received" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 350, y: 550,
    },
    {
      name: "volunteering",
      label: "Volunteering",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "devotee_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "activity_type", type: "varchar", notNull: true },
        { name: "start_date", type: "timestamp", notNull: true },
        { name: "hours_committed", type: "integer" },
        { name: "hours_completed", type: "integer" },
        { name: "status", type: "varchar", default: "active" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 650, y: 550,
    },
    {
      name: "groups",
      label: "Groups",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "group_name", type: "varchar", notNull: true },
        { name: "group_type", type: "varchar", notNull: true },
        { name: "capacity", type: "integer" },
        { name: "current_members", type: "integer", default: "0" },
        { name: "leader_id", type: "integer", isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 650, y: 380,
    },
    {
      name: "group_memberships",
      label: "Group Memberships",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "group_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "groups", referencesColumn: "id" },
        { name: "devotee_id", type: "integer", notNull: true, isForeignKey: true, referencesTable: "devotees", referencesColumn: "id" },
        { name: "role", type: "varchar", default: "member" },
        { name: "status", type: "varchar", default: "active" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 380,
    },
    {
      name: "mandals",
      label: "Mandals",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "name", type: "varchar", notNull: true },
        { name: "hindi_name", type: "varchar" },
        { name: "code", type: "varchar(2)", notNull: true, unique: true },
        { name: "description", type: "text" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 50, y: 720,
    },
    {
      name: "sabha_locations",
      label: "Sabha Locations",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "name", type: "varchar", notNull: true },
        { name: "address", type: "text" },
        { name: "city", type: "varchar" },
        { name: "state", type: "varchar" },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 350, y: 720,
    },
    {
      name: "dev_config",
      label: "Dev Config",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "key", type: "varchar(100)", notNull: true, unique: true },
        { name: "value", type: "jsonb", notNull: true },
        { name: "updated_at", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 50,
    },
    {
      name: "dev_macros",
      label: "Dev Macros",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "name", type: "varchar(255)", notNull: true },
        { name: "description", type: "text" },
        { name: "steps", type: "jsonb", notNull: true },
        { name: "run_count", type: "integer", default: "0" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 250,
    },
    {
      name: "audit_log",
      label: "Audit Log",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "action", type: "varchar(50)", notNull: true },
        { name: "entity", type: "varchar(50)", notNull: true },
        { name: "entity_id", type: "varchar(100)" },
        { name: "user_id", type: "varchar(100)", notNull: true },
        { name: "before_data", type: "jsonb" },
        { name: "after_data", type: "jsonb" },
        { name: "timestamp", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 550,
    },
    {
      name: "page_registry",
      label: "Page Registry",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "slug", type: "varchar(100)", notNull: true, unique: true },
        { name: "label", type: "varchar(255)", notNull: true },
        { name: "sections", type: "jsonb", notNull: true },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 650, y: 720,
    },
    {
      name: "schema_registry",
      label: "Schema Registry",
      fields: [
        { name: "id", type: "serial", notNull: true, isPrimaryKey: true },
        { name: "table_name", type: "varchar(100)", notNull: true, unique: true },
        { name: "label", type: "varchar(255)", notNull: true },
        { name: "fields", type: "jsonb", notNull: true },
        { name: "is_active", type: "boolean", default: "true" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
      x: 950, y: 720,
    },
  ],
  relations: [
    { from: "devotees", fromColumn: "mentor_id", to: "mentors", toColumn: "id", type: "many-to-one" },
    { from: "devotees", fromColumn: "family_id", to: "families", toColumn: "id", type: "many-to-one" },
    { from: "families", fromColumn: "head_of_family", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "attendance", fromColumn: "devotee_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "attendance", fromColumn: "event_id", to: "events", toColumn: "id", type: "many-to-one" },
    { from: "donations", fromColumn: "devotee_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "volunteering", fromColumn: "devotee_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "groups", fromColumn: "leader_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "group_memberships", fromColumn: "group_id", to: "groups", toColumn: "id", type: "many-to-one" },
    { from: "group_memberships", fromColumn: "devotee_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "mentors", fromColumn: "devotee_id", to: "devotees", toColumn: "id", type: "many-to-one" },
    { from: "dashboard_layouts", fromColumn: "user_id", to: "users", toColumn: "id", type: "many-to-one" },
    { from: "user_preferences", fromColumn: "user_id", to: "users", toColumn: "id", type: "one-to-one" },
  ],
};

const TABLE_WIDTH = 280;
const FIELD_HEIGHT = 22;
const HEADER_HEIGHT = 36;
const PADDING = 10;

function getTableHeight(table: SchemaTable) {
  return HEADER_HEIGHT + table.fields.length * FIELD_HEIGHT + PADDING * 2;
}

function getTableColor(name: string): string {
  const colors: Record<string, string> = {
    users: "#e8f4f8",
    sessions: "#f0e8f8",
    devotees: "#e8f8e8",
    families: "#f8f0e8",
    mentors: "#e8e8f8",
    events: "#f8e8e8",
    attendance: "#e8f8f0",
    donations: "#f0f8e8",
    volunteering: "#f8e8f0",
    groups: "#e8f0f8",
    group_memberships: "#f0e8f8",
    mandals: "#f8f8e8",
    sabha_locations: "#e8f8f8",
    dev_config: "#fff8e8",
    dev_macros: "#fff0e8",
    audit_log: "#f8e8e8",
    page_registry: "#e8f8ff",
    schema_registry: "#f0e8ff",
  };
  return colors[name] || "#f3f4f6";
}

function getTableBorderColor(name: string): string {
  const colors: Record<string, string> = {
    users: "#0891b2",
    devotees: "#16a34a",
    families: "#d97706",
    mentors: "#7c3aed",
    events: "#dc2626",
    attendance: "#059669",
    donations: "#65a30d",
    volunteering: "#c026d3",
    groups: "#2563eb",
    group_memberships: "#7c3aed",
    mandals: "#ca8a04",
    sabha_locations: "#0891b2",
    dev_config: "#ea580c",
    dev_macros: "#dc2626",
    audit_log: "#be123c",
    page_registry: "#0284c7",
    schema_registry: "#9333ea",
  };
  return colors[name] || "#6b7280";
}

export function SchemaVisualizer() {
  const [scale, setScale] = useState(1);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedTable, setHighlightedTable] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredTables = useMemo(() => {
    if (!searchTerm) return SCHEMA_DATA.tables;
    const term = searchTerm.toLowerCase();
    return SCHEMA_DATA.tables.filter(
      t =>
        t.label.toLowerCase().includes(term) ||
        t.fields.some(f => f.name.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const filteredTableNames = useMemo(() => new Set(filteredTables.map(t => t.name)), [filteredTables]);

  const filteredRelations = useMemo(() => {
    if (!searchTerm) return SCHEMA_DATA.relations;
    return SCHEMA_DATA.relations.filter(
      r => filteredTableNames.has(r.from) && filteredTableNames.has(r.to)
    );
  }, [filteredTableNames, searchTerm]);

  const svgWidth = 1300;
  const svgHeight = 900;

  const exportSvg = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "madhav-parivar-schema.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedTableData = SCHEMA_DATA.tables.find(t => t.name === selectedTable);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
      <div className="lg:col-span-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search tables or fields..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64 text-sm"
          />
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(1.5, s + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScale(1)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportSvg}>
              <Download className="w-4 h-4 mr-1" /> SVG
            </Button>
          </div>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
          <ScrollArea className="w-full h-full">
            <div className="inline-block">
              <svg
                ref={svgRef}
                width={svgWidth * scale}
                height={svgHeight * scale}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                className="block"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                  <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                  </marker>
                  <marker id="crow-foot" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                    <polyline points="0 0, 12 4, 0 8" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="0" y2="8" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                  </marker>
                </defs>

                {/* Relations */}
                {filteredRelations.map((rel, idx) => {
                  const fromTable = SCHEMA_DATA.tables.find(t => t.name === rel.from);
                  const toTable = SCHEMA_DATA.tables.find(t => t.name === rel.to);
                  if (!fromTable || !toTable) return null;

                  const fromX = (fromTable.x || 0) + TABLE_WIDTH;
                  const fromY = (fromTable.y || 0) + HEADER_HEIGHT / 2;
                  const toX = (toTable.x || 0);
                  const toY = (toTable.y || 0) + HEADER_HEIGHT / 2;

                  const isHighlighted = highlightedTable === rel.from || highlightedTable === rel.to || selectedTable === rel.from || selectedTable === rel.to;

                  return (
                    <g key={idx}>
                      <line
                        x1={fromX}
                        y1={fromY}
                        x2={toX}
                        y2={toY}
                        stroke={isHighlighted ? "#2563eb" : "#d1d5db"}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray={rel.type === "many-to-many" ? "5,3" : "none"}
                        markerEnd={isHighlighted ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                        onMouseEnter={() => setHighlightedTable(rel.from)}
                        onMouseLeave={() => setHighlightedTable(null)}
                        style={{ cursor: "pointer" }}
                      />
                      {/* Cardinality label */}
                      <text
                        x={(fromX + toX) / 2}
                        y={(fromY + toY) / 2 - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill={isHighlighted ? "#2563eb" : "#9ca3af"}
                        className="pointer-events-none"
                      >
                        {rel.type}
                      </text>
                    </g>
                  );
                })}

                {/* Tables */}
                {SCHEMA_DATA.tables.map((table) => {
                  const isFiltered = filteredTableNames.has(table.name);
                  const isDimmed = searchTerm && !isFiltered;
                  const isSelected = selectedTable === table.name;
                  const isHighlighted = highlightedTable === table.name;
                  const x = table.x || 0;
                  const y = table.y || 0;
                  const height = getTableHeight(table);
                  const bgColor = getTableColor(table.name);
                  const borderColor = isSelected || isHighlighted ? "#2563eb" : getTableBorderColor(table.name);
                  const opacity = isDimmed ? 0.3 : 1;

                  return (
                    <g
                      key={table.name}
                      transform={`translate(${x}, ${y})`}
                      opacity={opacity}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedTable(isSelected ? null : table.name)}
                    >
                      {/* Table background */}
                      <rect
                        width={TABLE_WIDTH}
                        height={height}
                        rx={6}
                        fill={bgColor}
                        stroke={borderColor}
                        strokeWidth={isSelected ? 3 : 2}
                        filter={isSelected ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "none"}
                      />

                      {/* Table header */}
                      <rect width={TABLE_WIDTH} height={HEADER_HEIGHT} rx={6} fill={borderColor} fillOpacity={0.15} />
                      <rect x={0} y={HEADER_HEIGHT - 6} width={TABLE_WIDTH} height={6} fill={borderColor} fillOpacity={0.15} />

                      <text
                        x={PADDING}
                        y={24}
                        fontSize="13"
                        fontWeight="600"
                        fill={borderColor}
                      >
                        {table.label}
                      </text>
                      <text
                        x={TABLE_WIDTH - PADDING}
                        y={24}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6b7280"
                        fontFamily="monospace"
                      >
                        {table.fields.length} cols
                      </text>

                      {/* Fields */}
                      {table.fields.map((field, idx) => (
                        <g key={field.name} transform={`translate(0, ${HEADER_HEIGHT + idx * FIELD_HEIGHT})`}>
                          <rect
                            x={0}
                            y={0}
                            width={TABLE_WIDTH}
                            height={FIELD_HEIGHT}
                            fill={idx % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)"}
                          />
                          <text
                            x={PADDING}
                            y={15}
                            fontSize="11"
                            fontFamily="monospace"
                            fill={field.isPrimaryKey ? "#dc2626" : field.isForeignKey ? "#2563eb" : "#374151"}
                            fontWeight={field.isPrimaryKey ? "600" : "400"}
                          >
                            {field.isPrimaryKey ? "🔑 " : ""}
                            {field.isForeignKey ? "🔗 " : ""}
                            {field.name}
                          </text>
                          <text
                            x={TABLE_WIDTH - PADDING}
                            y={15}
                            textAnchor="end"
                            fontSize="10"
                            fill="#6b7280"
                            fontFamily="monospace"
                          >
                            {field.type}
                            {field.notNull ? "*" : ""}
                            {field.unique ? "U" : ""}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar detail */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" /> Table Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTableData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: getTableBorderColor(selectedTableData.name) }} className="text-white">
                    {selectedTableData.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {selectedTableData.fields.map(f => (
                    <div key={f.name} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                      <span className="font-mono text-muted-foreground">
                        {f.isPrimaryKey ? "🔑 " : ""}{f.isForeignKey ? "🔗 " : ""}{f.name}
                      </span>
                      <span className="text-muted-foreground">{f.type}{f.notNull ? "*" : ""}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Primary Key: {selectedTableData.fields.find(f => f.isPrimaryKey)?.name}</p>
                  <p>Foreign Keys: {selectedTableData.fields.filter(f => f.isForeignKey).length}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Eye className="w-4 h-4 mb-2 inline" />
                <p>Click a table in the diagram to view its details.</p>
                <p className="mt-2 text-xs">
                  🔑 = Primary Key · 🔗 = Foreign Key · * = Not Null · U = Unique
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600" /> <span>Primary Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600" /> <span>Foreign Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-300" /> <span>One-to-Many</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-dashed border-gray-300" /> <span>Many-to-Many</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-400" /> <span>Config Tables</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
