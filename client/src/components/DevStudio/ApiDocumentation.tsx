import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Search, Terminal, Lock, Globe } from "lucide-react";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: string;
  params?: string[];
  body?: string;
  response?: string;
  group: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Auth
  { method: "GET", path: "/api/auth/user", description: "Get current authenticated user", auth: "Required", group: "Auth" },
  { method: "GET", path: "/api/login", description: "Initiate Replit Auth login flow", auth: "None", group: "Auth" },
  { method: "GET", path: "/api/callback", description: "OAuth callback handler", auth: "None", group: "Auth" },
  { method: "GET", path: "/api/logout", description: "Log out and redirect", auth: "Required", group: "Auth" },

  // Users
  { method: "GET", path: "/api/users", description: "List all users (admin only)", auth: "Admin", group: "Users" },
  { method: "GET", path: "/api/users/me/permissions", description: "Get current user permissions", auth: "Required", group: "Users" },
  { method: "PATCH", path: "/api/users/:id/role", description: "Change user role (admin only)", auth: "Admin", params: ["id: string"], body: '{ "role": "admin|manager|user|volunteer" }', group: "Users" },

  // Devotees
  { method: "GET", path: "/api/devotees", description: "List all devotees", auth: "None", group: "Devotees" },
  { method: "GET", path: "/api/devotees/:id", description: "Get devotee by ID", auth: "Required", params: ["id: number"], group: "Devotees" },
  { method: "POST", path: "/api/devotees", description: "Create new devotee", auth: "Required", body: "{ firstName, lastName, email, phone, city... }", group: "Devotees" },
  { method: "PATCH", path: "/api/devotees/:id", description: "Update devotee", auth: "Required", params: ["id: number"], group: "Devotees" },
  { method: "DELETE", path: "/api/devotees/:id", description: "Delete devotee", auth: "Required", params: ["id: number"], group: "Devotees" },
  { method: "GET", path: "/api/devotees/:id/relations", description: "Get all related data for devotee", auth: "Required", params: ["id: number"], group: "Devotees" },
  { method: "GET", path: "/api/devotees/:id/documents", description: "Get devotee documents", auth: "Required", params: ["id: number"], group: "Devotees" },
  { method: "POST", path: "/api/devotees/:id/documents", description: "Upload document for devotee", auth: "Required", params: ["id: number"], group: "Devotees" },

  // Families
  { method: "GET", path: "/api/families", description: "List all families", auth: "Required", group: "Families" },
  { method: "GET", path: "/api/families/:id", description: "Get family by ID", auth: "Required", params: ["id: number"], group: "Families" },
  { method: "POST", path: "/api/families", description: "Create new family", auth: "Required", group: "Families" },
  { method: "PATCH", path: "/api/families/:id", description: "Update family", auth: "Required", params: ["id: number"], group: "Families" },
  { method: "DELETE", path: "/api/families/:id", description: "Delete family", auth: "Required", params: ["id: number"], group: "Families" },
  { method: "GET", path: "/api/families/:id/members", description: "Get family members", auth: "Required", params: ["id: number"], group: "Families" },
  { method: "GET", path: "/api/families/:id/stats", description: "Get family statistics", auth: "Required", params: ["id: number"], group: "Families" },

  // Events
  { method: "GET", path: "/api/events", description: "List all events", auth: "Required", group: "Events" },
  { method: "GET", path: "/api/events/:id", description: "Get event by ID", auth: "Required", params: ["id: number"], group: "Events" },
  { method: "POST", path: "/api/events", description: "Create new event", auth: "Required", group: "Events" },
  { method: "PATCH", path: "/api/events/:id", description: "Update event", auth: "Required", params: ["id: number"], group: "Events" },
  { method: "DELETE", path: "/api/events/:id", description: "Delete event", auth: "Required", params: ["id: number"], group: "Events" },
  { method: "GET", path: "/api/events/:id/attendance", description: "Get event attendance", auth: "Required", params: ["id: number"], group: "Events" },
  { method: "GET", path: "/api/events/upcoming", description: "Get upcoming events", auth: "Required", group: "Events" },
  { method: "POST", path: "/api/events/:id/archive", description: "Archive event", auth: "Required", params: ["id: number"], group: "Events" },

  // Attendance
  { method: "GET", path: "/api/attendance", description: "List all attendance records", auth: "Required", group: "Attendance" },
  { method: "POST", path: "/api/attendance", description: "Record attendance", auth: "Required", group: "Attendance" },
  { method: "GET", path: "/api/attendance/devotee/:id", description: "Get devotee attendance", auth: "Required", params: ["id: number"], group: "Attendance" },
  { method: "GET", path: "/api/attendance/event/:id", description: "Get event attendance", auth: "Required", params: ["id: number"], group: "Attendance" },

  // Donations
  { method: "GET", path: "/api/donations", description: "List all donations", auth: "Required", group: "Donations" },
  { method: "GET", path: "/api/donations/:id", description: "Get donation by ID", auth: "Required", params: ["id: number"], group: "Donations" },
  { method: "POST", path: "/api/donations", description: "Create donation record", auth: "Required", group: "Donations" },
  { method: "GET", path: "/api/donations/devotee/:id", description: "Get devotee donations", auth: "Required", params: ["id: number"], group: "Donations" },
  { method: "GET", path: "/api/donations/stats", description: "Get donation statistics", auth: "Required", group: "Donations" },

  // Volunteering
  { method: "GET", path: "/api/volunteering", description: "List all volunteering records", auth: "Required", group: "Volunteering" },
  { method: "POST", path: "/api/volunteering", description: "Create volunteering record", auth: "Required", group: "Volunteering" },
  { method: "GET", path: "/api/volunteering/devotee/:id", description: "Get devotee volunteering", auth: "Required", params: ["id: number"], group: "Volunteering" },
  { method: "GET", path: "/api/volunteering/stats", description: "Get volunteering stats", auth: "Required", group: "Volunteering" },

  // Mentors
  { method: "GET", path: "/api/mentors", description: "List all mentors", auth: "Required", group: "Mentors" },
  { method: "GET", path: "/api/mentors/:id", description: "Get mentor by ID", auth: "Required", params: ["id: number"], group: "Mentors" },
  { method: "POST", path: "/api/mentors", description: "Create mentor", auth: "Required", group: "Mentors" },
  { method: "DELETE", path: "/api/mentors/:id", description: "Delete mentor", auth: "Required", params: ["id: number"], group: "Mentors" },

  // Groups
  { method: "GET", path: "/api/groups", description: "List all groups", auth: "Required", group: "Groups" },
  { method: "GET", path: "/api/groups/:id", description: "Get group by ID", auth: "Required", params: ["id: number"], group: "Groups" },
  { method: "POST", path: "/api/groups", description: "Create group", auth: "Required", group: "Groups" },
  { method: "PATCH", path: "/api/groups/:id", description: "Update group", auth: "Required", params: ["id: number"], group: "Groups" },
  { method: "DELETE", path: "/api/groups/:id", description: "Delete group", auth: "Required", params: ["id: number"], group: "Groups" },
  { method: "GET", path: "/api/groups/:id/members", description: "Get group members", auth: "Required", params: ["id: number"], group: "Groups" },

  // Mandals
  { method: "GET", path: "/api/mandals", description: "List all mandals", auth: "Required", group: "Mandals" },
  { method: "GET", path: "/api/mandals/:id", description: "Get mandal by ID", auth: "Required", params: ["id: number"], group: "Mandals" },
  { method: "POST", path: "/api/mandals", description: "Create mandal", auth: "Required", group: "Mandals" },
  { method: "PATCH", path: "/api/mandals/:id", description: "Update mandal", auth: "Required", params: ["id: number"], group: "Mandals" },
  { method: "DELETE", path: "/api/mandals/:id", description: "Delete mandal", auth: "Required", params: ["id: number"], group: "Mandals" },
  { method: "GET", path: "/api/mandals/:id/stats", description: "Get mandal statistics", auth: "Required", params: ["id: number"], group: "Mandals" },

  // Sabha Locations
  { method: "GET", path: "/api/sabha-locations", description: "List all sabha locations", auth: "Required", group: "Sabha Locations" },
  { method: "GET", path: "/api/sabha-locations/:id", description: "Get location by ID", auth: "Required", params: ["id: number"], group: "Sabha Locations" },
  { method: "POST", path: "/api/sabha-locations", description: "Create location", auth: "Required", group: "Sabha Locations" },
  { method: "PATCH", path: "/api/sabha-locations/:id", description: "Update location", auth: "Required", params: ["id: number"], group: "Sabha Locations" },
  { method: "DELETE", path: "/api/sabha-locations/:id", description: "Delete location", auth: "Required", params: ["id: number"], group: "Sabha Locations" },

  // Analytics
  { method: "GET", path: "/api/stats", description: "Get overall statistics", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/dashboard", description: "Get dashboard analytics data", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/donations", description: "Get donation analytics", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/devotees", description: "Get devotee analytics", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/events", description: "Get event analytics", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/top-donors", description: "Get top donors", auth: "Required", group: "Analytics" },
  { method: "GET", path: "/api/analytics/top-volunteers", description: "Get top volunteers", auth: "Required", group: "Analytics" },

  // Search
  { method: "GET", path: "/api/search", description: "Global search across all entities", auth: "Required", params: ["q: string"], group: "Search" },
  { method: "GET", path: "/api/search/suggestions", description: "Get search suggestions", auth: "Required", params: ["q: string"], group: "Search" },

  // Admin
  { method: "GET", path: "/api/admin/seed/counts", description: "Get entity counts", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/seed/reset", description: "Reset all data to demo", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/seed/:entity", description: "Add seed data for entity", auth: "Admin", params: ["entity: string", "count: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/export/data", description: "Export all data as JSON", auth: "Admin", group: "Admin" },
  { method: "GET", path: "/api/admin/export/entity", description: "Export single entity", auth: "Admin", params: ["table: string"], group: "Admin" },
  { method: "POST", path: "/api/admin/import/entity", description: "Import CSV/JSON to entity", auth: "Admin", params: ["table: string", "rows: array"], group: "Admin" },
  { method: "GET", path: "/api/admin/feature-flags", description: "Get all feature flags", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/feature-flags", description: "Update feature flags", auth: "Admin", group: "Admin" },
  { method: "GET", path: "/api/admin/rollback-slots", description: "Get rollback slots", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/rollback-slots", description: "Save rollback slot", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/rollback-slots/:id/restore", description: "Restore rollback slot", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/audit-log", description: "Get audit log entries", auth: "Admin", group: "Admin" },
  { method: "GET", path: "/api/admin/visual-overrides", description: "Get visual overrides", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/visual-overrides", description: "Add visual override", auth: "Admin", group: "Admin" },
  { method: "GET", path: "/api/admin/dev-config", description: "Get dev configuration", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/dev-config", description: "Update dev config", auth: "Admin", group: "Admin" },
  { method: "GET", path: "/api/admin/macros", description: "Get macros", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/macros", description: "Create macro", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/macros/:id/run", description: "Run macro", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/page-registry", description: "Get page registry", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/page-registry", description: "Create page", auth: "Admin", group: "Admin" },
  { method: "DELETE", path: "/api/admin/page-registry/:id", description: "Delete page", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/schema-registry", description: "Get schema registry", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/schema-registry", description: "Create schema", auth: "Admin", group: "Admin" },
  { method: "DELETE", path: "/api/admin/schema-registry/:id", description: "Delete schema", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/route-registry", description: "Get route registry", auth: "Admin", group: "Admin" },
  { method: "POST", path: "/api/admin/route-registry", description: "Create route", auth: "Admin", group: "Admin" },
  { method: "DELETE", path: "/api/admin/route-registry/:id", description: "Delete route", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "GET", path: "/api/admin/relations/devotee/:id", description: "Get devotee relations", auth: "Admin", params: ["id: number"], group: "Admin" },
  { method: "POST", path: "/api/admin/activate", description: "Activate GOD mode", auth: "Admin", body: '{ "password": "DevelopZ" }', group: "Admin" },

  // Notifications
  { method: "GET", path: "/api/notifications", description: "Get user notifications", auth: "Required", group: "Notifications" },
  { method: "POST", path: "/api/notifications", description: "Create notification", auth: "Required", group: "Notifications" },
  { method: "PATCH", path: "/api/notifications/:id/read", description: "Mark notification read", auth: "Required", params: ["id: number"], group: "Notifications" },
  { method: "PATCH", path: "/api/notifications/:id/pin", description: "Pin/unpin notification", auth: "Required", params: ["id: number"], group: "Notifications" },
  { method: "DELETE", path: "/api/notifications/:id", description: "Delete notification", auth: "Required", params: ["id: number"], group: "Notifications" },

  // Dynamic
  { method: "GET", path: "/api/dynamic/:path", description: "Execute dynamic route", auth: "Varies", params: ["path: string"], group: "Dynamic" },

  // Dashboard
  { method: "GET", path: "/api/dashboard/layout", description: "Get dashboard layout", auth: "Required", group: "Dashboard" },
  { method: "POST", path: "/api/dashboard/layout", description: "Save dashboard layout", auth: "Required", group: "Dashboard" },
  { method: "GET", path: "/api/user/preferences", description: "Get user preferences", auth: "Required", group: "Dashboard" },
  { method: "POST", path: "/api/user/preferences", description: "Save user preferences", auth: "Required", group: "Dashboard" },
];

const GROUPS = Array.from(new Set(API_ENDPOINTS.map(e => e.group)));

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700 border-green-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PATCH: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PUT: "bg-orange-100 text-orange-700 border-orange-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

const AUTH_COLORS: Record<string, string> = {
  None: "bg-gray-100 text-gray-600",
  Required: "bg-blue-50 text-blue-600",
  Admin: "bg-red-50 text-red-600",
  Varies: "bg-purple-50 text-purple-600",
};

function CurlGenerator({ endpoint }: { endpoint: ApiEndpoint }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-app.replit.dev";
  const curl = `curl -X ${endpoint.method} \\
  ${endpoint.auth !== "None" ? "-H \"Cookie: session=...\" \\\n  " : ""}${endpoint.method !== "GET" && endpoint.body ? `-H "Content-Type: application/json" \\
  -d '${endpoint.body}' \\
  ` : ""}${baseUrl}${endpoint.path}`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curl.replace(/\\\n\s*/g, " "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 bg-muted rounded-lg p-3 font-mono text-xs text-muted-foreground relative">
      <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-6 text-xs" onClick={copyCurl}>
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </Button>
      <pre className="whitespace-pre-wrap pr-12">{curl}</pre>
    </div>
  );
}

export function ApiDocumentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const filtered = API_ENDPOINTS.filter(ep => {
    const matchesSearch = !searchTerm ||
      ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "All" || ep.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const grouped = filtered.reduce((acc, ep) => {
    if (!acc[ep.group]) acc[ep.group] = [];
    acc[ep.group].push(ep);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints by path, method, or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Groups</SelectItem>
              {GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline">{filtered.length} endpoints</Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, endpoints]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{group}</h3>
                <div className="space-y-2">
                  {endpoints.map((ep, idx) => {
                    const key = `${ep.method}-${ep.path}-${idx}`;
                    const isExpanded = expandedEndpoint === key;
                    return (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-colors ${isExpanded ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`${METHOD_COLORS[ep.method] || "bg-gray-100"} text-[10px] font-mono min-w-[52px] justify-center`}>
                              {ep.method}
                            </Badge>
                            <code className="text-sm font-mono text-foreground flex-1">{ep.path}</code>
                            <Badge className={`${AUTH_COLORS[ep.auth] || "bg-gray-100"} text-[10px]`}>
                              {ep.auth === "Required" ? <Lock className="w-3 h-3 mr-1" /> : ep.auth === "None" ? <Globe className="w-3 h-3 mr-1" /> : null}
                              {ep.auth}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-16">{ep.description}</p>
                          {isExpanded && (
                            <div className="mt-3 ml-16 space-y-2">
                              {ep.params && (
                                <div className="text-xs">
                                  <span className="font-semibold">Parameters:</span>
                                  <div className="font-mono text-muted-foreground mt-1">{ep.params.join(", ")}</div>
                                </div>
                              )}
                              {ep.body && (
                                <div className="text-xs">
                                  <span className="font-semibold">Body:</span>
                                  <pre className="font-mono text-muted-foreground mt-1 bg-muted p-2 rounded">{ep.body}</pre>
                                </div>
                              )}
                              <div className="text-xs">
                                <span className="font-semibold">Example Request:</span>
                                <CurlGenerator endpoint={ep} />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Terminal className="w-4 h-4" /> API Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-muted-foreground mb-1">Total Endpoints</div>
                <div className="text-2xl font-bold">{API_ENDPOINTS.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">By Method</div>
                <div className="space-y-1">
                  {["GET", "POST", "PATCH", "DELETE", "PUT"].map(m => {
                    const count = API_ENDPOINTS.filter(e => e.method === m).length;
                    return count > 0 ? (
                      <div key={m} className="flex items-center justify-between">
                        <Badge variant="outline" className={`${METHOD_COLORS[m]} text-[10px] min-w-[52px] justify-center`}>{m}</Badge>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">By Auth</div>
                <div className="space-y-1">
                  {["None", "Required", "Admin", "Varies"].map(a => {
                    const count = API_ENDPOINTS.filter(e => e.auth === a).length;
                    return count > 0 ? (
                      <div key={a} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{a}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-muted-foreground mb-1">Groups</div>
                <div className="space-y-1">
                  {GROUPS.map(g => {
                    const count = API_ENDPOINTS.filter(e => e.group === g).length;
                    return (
                      <div key={g} className="flex items-center justify-between cursor-pointer hover:text-primary" onClick={() => setSelectedGroup(g)}>
                        <span>{g}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
