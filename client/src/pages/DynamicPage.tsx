import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Database,
  FileText,
  BarChart3,
  LayoutGrid,
  Link2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PageSection {
  type: "table" | "form" | "chart" | "stats" | "relations" | "html";
  title?: string;
  config?: Record<string, any>;
}

interface PageRegistryEntry {
  id: number;
  slug: string;
  label: string;
  description?: string;
  icon?: string;
  sections: PageSection[];
  dataSource?: string;
  filters?: any;
  permissions?: any;
}

// ─── Dynamic Section Renderers ────────────────────────────────────────────────

function DataTableSection({ config, data }: { config: any; data: any[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const columns = config?.columns || (data.length > 0 ? Object.keys(data[0]) : []);
  const filtered = data.filter((row) =>
    columns.some((col: string) =>
      String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      })
    : filtered;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {config?.actions?.includes("create") && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: string) => (
                <TableHead
                  key={col}
                  className="cursor-pointer"
                  onClick={() => {
                    if (sortKey === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
                    else { setSortKey(col); setSortDir("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {sortKey === col && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.slice(0, config?.limit || 50).map((row: any, idx: number) => (
              <TableRow key={idx}>
                {columns.map((col: string) => (
                  <TableCell key={col}>{String(row[col] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ChartSection({ config, data }: { config: any; data: any[] }) {
  const chartType = config?.chartType || "bar";
  const xKey = config?.xKey || (data.length > 0 ? Object.keys(data[0])[0] : "x");
  const yKey = config?.yKey || (data.length > 0 ? Object.keys(data[0])[1] : "y");
  const colors = config?.colors || ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];

  const chartData = data.slice(0, 20).map((d: any) => ({
    name: String(d[xKey] ?? "").slice(0, 20),
    value: Number(d[yKey]) || 0,
  }));

  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={colors[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatsSection({ config, data }: { config: any; data: any[] }) {
  const stats = config?.stats || [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat: any, idx: number) => {
        const value = stat.type === "count"
          ? data.length
          : stat.type === "sum"
          ? data.reduce((sum: number, row: any) => sum + (Number(row[stat.field]) || 0), 0)
          : stat.type === "avg"
          ? data.length > 0
            ? data.reduce((sum: number, row: any) => sum + (Number(row[stat.field]) || 0), 0) / data.length
            : 0
          : 0;

        return (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function HTMLSection({ config }: { config: any }) {
  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: config?.html || "" }}
    />
  );
}

function FormSection({ config }: { config: any }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Form mode for {config?.entity || "records"}. Use the Data Table section to view records.
      </p>
    </div>
  );
}

function RelationsSection({ config }: { config: any }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Related {config?.relatedEntity || "records"} will appear here.
      </p>
    </div>
  );
}

// ─── Main Dynamic Page Renderer ─────────────────────────────────────────────

function SectionRenderer({ section, data }: { section: PageSection; data: any[] }) {
  switch (section.type) {
    case "table":
      return <DataTableSection config={section.config} data={data} />;
    case "chart":
      return <ChartSection config={section.config} data={data} />;
    case "stats":
      return <StatsSection config={section.config} data={data} />;
    case "html":
      return <HTMLSection config={section.config} />;
    case "form":
      return <FormSection config={section.config} />;
    case "relations":
      return <RelationsSection config={section.config} />;
    default:
      return <div className="text-muted-foreground">Unknown section type: {section.type}</div>;
  }
}

const SECTION_ICONS: Record<string, any> = {
  table: Database,
  chart: BarChart3,
  stats: LayoutGrid,
  html: FileText,
  form: FileText,
  relations: Link2,
};

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug || "";
  const { toast } = useToast();

  const { data: page, isLoading: pageLoading } = useQuery<PageRegistryEntry>({
    queryKey: ["/api/admin/page-registry", slug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/page-registry`);
      const pages = await res.json();
      return pages.find((p: PageRegistryEntry) => p.slug === slug);
    },
  });

  const dataSource = page?.dataSource || page?.sections?.find((s: any) => s.config?.entity)?.config?.entity;

  const { data: rawData, isLoading: dataLoading } = useQuery<any[]>({
    queryKey: [`/api/${dataSource}`, page?.id],
    enabled: !!dataSource && !!page,
  });

  const data = rawData || [];

  if (pageLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6">
        <Header title="Page Not Found" />
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold">Dynamic page not found</h2>
          <p className="text-muted-foreground mt-2">No page registered with slug: /{slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-auto">
      <Header
        title={page.label}
        subtitle={page.description || "Dynamic page"}
      />

      <div className="space-y-6">
        {page.sections?.map((section: PageSection, idx: number) => {
          const Icon = SECTION_ICONS[section.type] || FileText;
          return (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {section.title || section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading && section.type !== "html" ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <SectionRenderer section={section} data={data} />
                )}
              </CardContent>
            </Card>
          );
        })}

        {(!page.sections || page.sections.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This page has no sections configured yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Go to Dev Studio → Page Builder to add sections.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
