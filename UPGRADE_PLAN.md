# Madhav Parivar - Complete Upgrade Plan

## Vision

Transform the Madhav Parivar Devotional Management System into a **true low-code application builder** where the developer section (DevStudio/God Mode) can dynamically generate new frontend pages, backend database tables, and REST API routes without writing any code. The system must be fully interconnected — every data entity must relate to every other entity where logically appropriate.

---

## Phase 1: Persist Dev Configuration (Critical — Data Loss Fix)

### Problem
All developer configuration (macros, audit logs, visual overrides, rollback slots, feature flags, app info, navigation, theme, custom fields, snapshots, card themes, receipt templates, analytics dashboards) is stored in a **memory-only** `devConfig` object in `server/routes.ts`. Every server restart wipes all DevStudio settings.

### Solution
Create a dedicated `dev_config` table in PostgreSQL to store all developer configuration as JSON. Migrate all in-memory arrays/objects to this table.

#### New Database Schema

```sql
-- dev_config table (single-row configuration store)
CREATE TABLE dev_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- dev_macros table (persisted macros)
CREATE TABLE dev_macros (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- audit_log table (persisted audit trail)
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    user_id VARCHAR(100) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- visual_overrides table (persisted UI modifications)
CREATE TABLE visual_overrides (
    id SERIAL PRIMARY KEY,
    selector VARCHAR(500) NOT NULL,
    property VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- rollback_slots table (persisted rollback versions)
CREATE TABLE rollback_slots (
    id SERIAL PRIMARY KEY,
    slot_index INTEGER NOT NULL,
    name VARCHAR(255),
    overrides JSONB NOT NULL,
    saved_at TIMESTAMP DEFAULT NOW()
);

-- page_registry table (dynamic pages)
CREATE TABLE page_registry (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sections JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- schema_registry table (dynamic database tables)
CREATE TABLE schema_registry (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL,
    relations JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- route_registry table (dynamic API routes)
CREATE TABLE route_registry (
    id SERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    description TEXT,
    sql_query TEXT NOT NULL,
    parameters JSONB,
    required_role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- custom_fields table (extend entities with dynamic fields)
CREATE TABLE custom_fields (
    id SERIAL PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255),
    field_type VARCHAR(50) NOT NULL,
    options JSONB,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks
1. Create migration for all new tables
2. Replace `devConfig` in `server/routes.ts` with database-backed storage
3. Replace `macros` array with `dev_macros` table
4. Replace `auditLog` array with `audit_log` table
5. Replace `visualOverrides` with `visual_overrides` table
6. Replace `rollbackSlots` with `rollback_slots` table
7. Update `storage.ts` with new storage methods
8. Update `DevStudio.tsx` to use persisted data
9. Add auto-migration on startup to seed default dev_config

---

## Phase 2: Dynamic Application Builder

### Problem
The DevStudio is a powerful admin panel but cannot actually create new pages, tables, or API routes. Developers must edit code files directly.

### Solution
Build three dynamic systems that allow creating new app features from the DevStudio UI:

### 2A. Dynamic Page Generator

#### What it does
Allow creating new pages from the DevStudio without writing React code.

#### How it works
1. A "Page Builder" tab in DevStudio where you:
   - Name the page (e.g., "Mandal Directory")
   - Define the route (e.g., `/mandals`)
   - Choose sections:
     - **Data Table** (shows records from any table with columns, search, sort, pagination)
     - **Form** (create/edit records)
     - **Chart** (bar/line/pie charts from table data)
     - **Stats Cards** (count, sum, average from any table)
     - **Relation Cards** (show related records from linked tables)
     - **Custom HTML** (rich text with embedded variables)
   - Configure data source (which table to query)
   - Configure filters (which records to show)
   - Configure relations (link to other tables)
   - Set permissions (admin/user)

2. Store the page definition in `page_registry`

3. Create a generic `DynamicPage` component that reads the registry and renders the page based on the definition

4. Auto-register the route in the router

#### Implementation
```
New files:
- client/src/pages/DynamicPage.tsx — Generic renderer
- server/routes.ts — CRUD routes for page_registry
- server/storage.ts — storage methods for page_registry
```

#### Sections Detail
- **Data Table**: Render a TanStack table with columns, search, sorting, pagination, bulk actions. Configurable per column.
- **Form**: Render a dynamic form based on table schema. Auto-generate fields from `schema_registry`.
- **Chart**: Auto-generate Recharts charts from aggregated data.
- **Stats Cards**: Configurable count/sum/avg queries with icons.
- **Relation Cards**: Show related records using foreign keys (e.g., "Families in this Mandal").

### 2B. Dynamic Schema Builder

#### What it does
Allow creating new database tables from the DevStudio without writing SQL or Drizzle schema.

#### How it works
1. A "Schema Builder" tab in DevStudio where you:
   - Name the table (e.g., "sabha_centers")
   - Define fields (name, type, required, unique, default, label)
   - Define field types: text, number, date, boolean, select, multi-select, email, phone, url, json
   - Define relations (belongs to, has many, many-to-many)
   - Set display columns (which fields show in the list)
   - Auto-generate: validation schema, insert schema, API routes, frontend page

2. Store the definition in `schema_registry`

3. A `SchemaBuilder` utility that dynamically creates:
   - Drizzle table definition at runtime
   - CRUD API routes
   - Frontend page (via Page Builder)

4. Auto-generate a `zod` schema for validation

#### Implementation
```
New files:
- server/schemaBuilder.ts — Runtime table creation
- server/routeGenerator.ts — Auto-generate CRUD routes
- client/src/components/Dynamic/SchemaBuilder.tsx
- client/src/components/Dynamic/DynamicTable.tsx
- client/src/components/Dynamic/DynamicForm.tsx
```

### 2C. Dynamic API Route Generator

#### What it does
Allow creating custom REST API endpoints from the DevStudio.

#### How it works
1. A "API Builder" tab in DevStudio where you:
   - Name the route (e.g., "Get Top Donors")
   - Select HTTP method (GET, POST, PUT, DELETE)
   - Define path (e.g., `/api/analytics/top-donors`)
   - Write SQL query (with parameter interpolation)
   - Define parameters (body, query, path variables)
   - Set required role (admin/user)
   - Test the endpoint inline

2. Store the definition in `route_registry`

3. A `DynamicRouter` middleware that reads all active routes from the registry and registers them dynamically at startup

#### Implementation
```
New files:
- server/routeGenerator.ts — Dynamic route registration
- client/src/components/Dynamic/ApiBuilder.tsx
```

### 2D. Page Registry Auto-Routing

The app must auto-discover all pages in `page_registry` on startup and register them in the router. The sidebar must auto-populate from the registry.

---

## Phase 3: Complete Role-Based Access Control ✅ COMPLETE

### Problem
Anyone who logs in has full access. The `role` field is only displayed on the sidebar.

### Solution

1. **Create `requireAdmin` and `requireRole` middleware** ✅
   - `server/replitAuth.ts`: `requireAdmin` checks `req.user.role === "admin"` and returns 403
   - `requireRole(role)` generic middleware for any role
   - Session enrichment on every authenticated request: `user.role` and `user.isAdmin` populated from DB

2. **Protect all admin endpoints** ✅
   - All 65 `/api/admin/*` routes → `isAuthenticated, requireAdmin`
   - All `/api/dev-config/*` routes → `isAuthenticated, requireAdmin`
   - `/api/admin/activate` (GOD Mode) → `requireAdmin`
   - Removed old `requireGodModeToken` local middleware

3. **Protect DevStudio page** ✅
   - `AdminRoute` component in `App.tsx` redirects non-admin users to `/`
   - `/dev-studio` route wrapped with `AdminRoute`

4. **Feature-level permissions** ✅
   - `useAuth.ts` exposes `isAdmin`, `hasRole()`, `canSeePage()`, and `permissions`
   - Sidebar hides `analytics` and `id-cards` for non-admin users
   - Sidebar nav items filtered by `canSeePage()` for config-based permissions
   - Dev Mode button hidden for non-admin users

5. **First user admin elevation** ✅
   - `upsertUser()` in `replitAuth.ts`: first user auto-promoted to `admin` role
   - Admin users can promote/demote other users via `PATCH /api/users/:id/role`

### New API Routes
```
GET /api/users — List all users (admin only)
PATCH /api/users/:id/role — Change user role (admin only)
GET /api/users/me/permissions — Get my permissions (role, isAdmin, visiblePages, canEdit, canDelete)
```

### Files Modified
- `server/replitAuth.ts` — Session enrichment + middleware
- `server/routes.ts` — All admin endpoints protected
- `server/storage.ts` — User management interface
- `client/src/hooks/useAuth.ts` — RBAC helpers
- `client/src/App.tsx` — AdminRoute + DevStudio protection
- `client/src/components/Layout/Sidebar.tsx` — Role-based nav filtering
- `client/src/contexts/DevModeContext.tsx` — Admin-only dev mode check

---

## Phase 4: Complete Frontend Pages for All Entities ✅ COMPLETE

### What was done
Created full CRUD frontend pages for all entities that had backend tables but no UI:

1. **Mandals Page** (`/mandals`) ✅
   - Table view with all mandals (name, code, hindiName, description)
   - Search/filter by name, code, description
   - Create/Edit mandal dialog form
   - Delete mandal with confirmation dialog
   - View mandal dialog showing members, events, and locations stats
   - Backend API routes: GET/POST/PUT/DELETE /api/mandals/:id

2. **Sabha Locations Page** (`/sabha-locations`) ✅
   - Card grid view with all locations
   - Search/filter by name, address, city, state
   - Create/Edit location dialog form
   - Delete location with confirmation dialog
   - View location dialog showing upcoming events and mandal affiliation
   - Backend API routes: GET/POST/PUT/DELETE /api/sabha-locations/:id

3. **Groups Page** (`/groups`) ✅
   - Card grid view with all groups
   - Type badges (satsang, study, service, youth, other)
   - Member count with capacity indicator
   - Create/Edit group dialog with full form
   - Delete group with confirmation dialog
   - View group dialog showing members, location, and schedule

4. **Notifications Page** (`/notifications`) ✅
   - Full notification center with filter tabs (all/unread/pinned/info/warning/error)
   - Mark individual read, mark all read
   - Pin/unpin notifications
   - Delete notifications
   - Type-based color coding and icons
   - Real-time updates with 30-second polling

5. **Integration** ✅
   - All pages registered in `App.tsx` routes
   - All pages added to sidebar `DEFAULT_NAVIGATION`
   - Sidebar icons added to `ICON_MAP`
   - RBAC: new pages visible to all users
   - TypeScript errors fixed in existing GroupForm and DevoteeGroups
   - Frontend builds successfully (1.4MB JS bundle)

---

## Phase 5: Full Data Interconnectivity

### Problem
Some entities are siloed. Data should be interconnected at every level.

### Solution

1. **Devotee Profile** → Show all related data:
   - Family members (linked to families table)
   - Mentor details (linked to mentors table)
   - Attendance history (linked to events)
   - Donation history (linked to donations)
   - Volunteering records (linked to volunteering)
   - Group memberships (linked to groups)
   - Mandal affiliation (linked to mandals)
   - Documents (already exists)

2. **Event Page** ↔ Show all related:
   - Attendance list (who attended)
   - Donations collected at this event
   - Volunteering hours for this event
   - Location details (linked to sabha_locations)

3. **Family Page** ↔ Show all related:
   - All family members
   - Combined attendance
   - Combined donations
   - Family events

4. **Mandal Page** ↔ Show all related:
   - All members
   - All events organized
   - All sabha locations
   - Donation totals
   - Attendance totals

5. **Dashboard** ↔ Show interconnected summary:
   - Total devotees (by mandal, by city, by spiritual level)
   - Total families (by mandal)
   - Total donations (by purpose, by month, by mandal)
   - Total events (by type, by mandal, upcoming)
   - Top donors (linked to devotee profiles)
   - Top volunteers (linked to devotee profiles)
   - Most active families
   - Attendance trends (by event, by mandal)

6. **Cross-Entity Search**
   - A global search that finds results across all tables
   - "Ramesh" → shows devotee, family, donations, attendance

---

## Phase 6: Enhanced DevStudio Features

### 6.1. Schema Visualizer
- A visual diagram showing all tables and their relationships
- Interactive: click to edit, add relations
- Export as image

### 6.2. Query Builder
- A visual SQL builder for the API Route Generator
- Drag tables, join them visually
- Preview results
- Generate the endpoint automatically

### 6.3. Frontend Component Library
- A gallery of all available UI components
- Pre-built sections (hero, stats, data table, form, chart, cards)
- Drag to compose a page

### 6.4. Data Flow Editor
- Visual diagram showing frontend ↔ API ↔ Database
- Click on any arrow to see the exact query
- Edit the query inline

### 6.5. Import/Export Data
- Import CSV/Excel for any entity
- Export any entity to CSV/Excel
- Bulk import devotees with families
- Import from existing Excel templates

### 6.6. Auto-Generated API Documentation
- For every dynamic route, generate Swagger-like docs
- Interactive testing
- Copy curl commands

---

## Phase 7: Developer Quality of Life

### 7.1. Real-time Collaboration
- Show who else is editing in DevStudio
- Lock records during editing
- Activity feed (last 50 actions)

### 7.2. Backup & Restore
- Scheduled backups of all tables
- One-click restore to any previous state
- Export entire database as JSON

### 7.3. Performance Monitoring
- Query execution time tracking
- Slow query alerts
- Database size dashboard

### 7.4. Environment Management
- Toggle between dev/staging/production configs
- Feature flags per environment
- A/B testing for UI changes

---

## Technical Implementation Order

### Priority 1 (Week 1): Foundation
1. Create all new database tables
2. Migrate devConfig to database
3. Migrate macros, audit log, visual overrides, rollback slots
4. Test: verify all DevStudio settings survive restart

### Priority 2 (Week 2): Role-Based Access
1. Create `requireAdmin` middleware
2. Protect all admin endpoints
3. Add user management in DevStudio
4. Auto-promote first user to admin

### Priority 3 (Week 3-4): Dynamic Page Builder
1. Create `page_registry` table
2. Build `DynamicPage` renderer
3. Build Page Builder UI in DevStudio
4. Auto-register routes from registry
5. Build sidebar auto-population

### Priority 4 (Week 5-6): Dynamic Schema Builder
1. Create `schema_registry` table
2. Build Schema Builder UI
3. Build `SchemaBuilder` runtime table creator
4. Build `DynamicTable` and `DynamicForm` components
5. Auto-generate CRUD for new tables

### Priority 5 (Week 7-8): Dynamic API Route Generator
1. Create `route_registry` table
2. Build API Builder UI
3. Build `DynamicRouter` middleware
4. Test: create new endpoints dynamically

### Priority 6 (Week 9): Frontend Pages for All Entities
1. Mandals page
2. Sabha Locations page
3. Full Groups page
4. Cross-entity search

### Priority 7 (Week 10): Enhanced Dashboard
1. Fully interconnected dashboard
2. Global search
3. Mandal-level analytics

---

## Acceptance Criteria

### Must-Have
- [ ] DevStudio settings survive server restart
- [ ] New pages can be created from DevStudio without writing code
- [ ] New tables can be created from DevStudio without writing code
- [ ] New API routes can be created from DevStudio without writing code
- [ ] Admin role restricts access to DevStudio and all admin endpoints
- [ ] First user is auto-promoted to admin
- [ ] All entities have frontend pages
- [ ] All data is interconnected (click any entity to see related data)

### Nice-to-Have
- [ ] Schema visualizer
- [ ] Query builder
- [ ] Real-time collaboration
- [ ] Auto-generated API docs
- [ ] CSV/Excel import/export
- [ ] Performance monitoring

---

## Database Schema Summary

### Existing Tables
- users, sessions, devotees, families, mentors, events, attendance, donations, volunteering, groups, group_entries, mandals, sabha_locations, dashboard_layouts, user_preferences

### New Tables
- dev_config, dev_macros, audit_log, visual_overrides, rollback_slots, page_registry, schema_registry, route_registry, custom_fields

### Total: 24 tables

---

## Notes

- This is a major refactor. Each phase should be independently testable.
- The dynamic schema builder requires careful handling of Drizzle ORM runtime table creation.
- Consider using a lightweight ORM abstraction for dynamic tables.
- The Page Builder should use a JSON-based layout system for easy serialization.
- All changes must be backward-compatible — existing data and pages must continue working.
- The system should be designed so that future phases (e.g., multi-tenancy, mobile app) can be added.
