# Full App Masterpiece + GOD Mode Power-Up

  ## What & Why
  Transform the app into the most capable self-contained offline management system possible by combining three major tracks: polished production-quality pages, a deeply powered GOD Mode Developer Studio with 15+ capabilities, and a live in-place visual editor that makes every element of every page editable without touching code.

  ## Done looks like

  ### Track A — GOD Mode Power Panels (Dev Studio tabs)
  - API Console: test any of 40+ endpoints live, see status + timing + JSON response
  - Query Console: filter any entity with expressions, see results, export CSV
  - Feature Flags: module toggles (Donations, ID Cards, Volunteering, Analytics, Groups) that control sidebar visibility
  - Seed Manager: live record counts, Reset & Reseed, Add N test records
  - Performance Monitor: fetch-intercepted timing chart, cache hit/miss, rolling request log
  - Component Map: visual tree of every page's architecture with source file paths
  - Formula Engine: define computed fields (Age, Attendance Rate, Loyalty Score) bindable to any element
  - Rule Engine: if-this-then-that visual rule builder that auto-updates record flags
  - Report Builder: visual printable report designer with field selection, grouping, print/export
  - Custom Form Builder: drag-and-drop form creator bound to any data table
  - Scheduled Actions: cron-based recurring triggers (archive events, generate summaries)
  - Command Palette (Ctrl+K): fuzzy search over all actions, records, and navigation
  - Keyboard Shortcut Designer: map any action to any key combination
  - Encryption Field Manager: per-field AES-256 at-rest encryption toggle
  - Change Broadcast Log: tamper-evident signed audit export

  ### Track B — In-Place Visual Editor
  - GOD Mode active → subtle blue border on hover of every registered element
  - Floating context toolbar per element type (text, button, icon, image, card, widget)
  - Text/Labels: contenteditable inline editing, font size, bold/italic
  - Buttons: label, icon swap (full Lucide picker), bg color, text color
  - Icons: searchable 1000+ icon picker, resize, color
  - Images: replace (file upload or URL), remove, drag-corner resize
  - Cards/Sections: bg color picker, bg image upload, border toggle, shadow slider
  - Navigation items: inline drag-to-reorder, rename, hide/show
  - Dashboard widgets: drag-resize handle, drag-to-reorder, rename header
  - Field Linker: bind any widget slot to any entity column with aggregation (sum/count/avg/latest)
  - Conditional Visibility Rules: per-element show/hide conditions based on data
  - Multi-View Mode: switch any list page between Table / Card Grid / Kanban / Calendar / Timeline views

  ### Track C — 5-Session Rollback System
  - Every Save writes to a circular buffer of 5 slots (slot 6 overwrites slot 1)
  - Rollback panel in Dev Studio: timeline of 5 saves with timestamps + diff summary
  - Click any slot to restore entire app visual state instantly
  - "Save Page" floating button shows unsaved change count, triggers save to buffer
  - Visual Override Store persists all edits to devConfig backend and reloads on startup

  ### Track D — Dynamic Page & Element Creation
  - Element Palette: collapsible left panel in GOD Mode with draggable elements (Charts, Metric Cards, Tables, Forms, Buttons, Icons, Text Blocks, Dividers)
  - Drag any element onto any page at any position, bind data immediately via Field Linker
  - New Page Wizard: name, URL slug, layout template (blank/dashboard/list/form) → page appears in nav instantly
  - Navigation items for new pages auto-added and reorderable
  - Conditional display rules per element per page

  ### Track E — Table & Excel Integration
  - Import Excel (.xlsx) or CSV: preview columns, name table, set relationships to existing tables
  - Field-to-Page Binding: drag imported columns onto page elements after import
  - Export any table (built-in or imported) as Excel/CSV with applied filters
  - Table Relationship Designer: visual ERD diagram to draw joins between table columns
  - Imported tables appear in Query Console, Field Linker, and Formula Engine

  ### Track F — Additional Powers
  - Smart Global Search (Ctrl+K): full-text across all entities simultaneously
  - Data Version History: last 10 states per record, field-level restore
  - Plugin Slot System: named page slots that accept installable mini-components
  - Print & ID Template Designer: drag-and-drop certificate/ID card canvas with data binding
  - Scheduled Actions: offline cron triggers for recurring maintenance tasks

  ### All main pages polished
  - Dashboard: Quick Actions row (Mark Attendance, Record Donation, Add Event)
  - Devotees: column sort, inline status toggle, global search, history view
  - Families: member avatar chips, family tree visualization
  - Mentors: Mentees tab with attendance rates per mentee
  - Analytics: time-range filter actually slices data, multi-view support
  - Attendance: hover-visible delete button, event filter
  - Events: attendee count badge per event
  - Donations: running total bar, donor tier badges
  - All 8 themes correct including Matrix/Iron Man dark modes
  - DevMode banner no longer overlaps content (shifts layout by banner height)

  ## Out of scope
  - Real multi-user authentication over network
  - Cloud sync or remote database
  - Mobile native app
  - Electron packaging (separate future task)

  ## Tasks

  1. **Backend: Routes, Query Engine, Visual Overrides, Feature Flags, Excel Import** — Add PATCH aliases for all entities. Add single-record GETs. Add /api/families/:id/members. Add /api/admin/query (entity + filter expression). Add /api/dev-config/visual-overrides GET/PATCH. Add /api/dev-config/feature-flags GET/PATCH. Add /api/admin/rollback-slots GET/POST (5-slot circular buffer). Add /api/admin/import/excel (multer + xlsx parsing, stores as named in-memory table). Add /api/admin/tables GET/POST for custom imported tables. Add /api/admin/formulas GET/POST. Add /api/admin/rules GET/POST/run.

  2. **GOD Mode: API Console + Query Console + Formula Engine** — API Console panel with endpoint picker, method, params, body, send, response viewer. Query Console with entity picker, filter expression, results table, CSV export. Formula Engine tab: define computed fields with expressions, preview results, save formulas that become bindable in Field Linker.

  3. **GOD Mode: Feature Flags + Seed Manager + Performance Monitor + Command Palette** — Feature Flags panel with module toggles wired to sidebar. Seed Manager with live counts, reset, and add-N controls. Performance Monitor with fetch interceptor, timing chart, cache stats. Command Palette (Ctrl+K) global overlay searching all actions, records, nav routes.

  4. **GOD Mode: Rule Engine + Report Builder + Scheduled Actions + Encryption Manager** — Rule Engine: visual if-then builder with entity/field/condition/action selectors. Report Builder: field picker, grouping, print layout preview. Scheduled Actions: cron expression builder with action selector. Encryption Field Manager: per-entity per-field toggle for AES-256 marking.

  5. **In-Place Visual Editor: Overlay System + Element Registration** — VisualEditorOverlay component, global hover tracker, useEditableElement hook, VisualOverrideContext, floating context toolbar rendering per element type. Only active in GOD Mode. All existing pages instrument their key elements with the hook.

  6. **In-Place Visual Editor: All Editor Types + Field Linker + Conditional Rules** — Text contenteditable editor. Color picker popover (fg + bg + image bg). Icon picker modal. Image manager (upload/URL/remove/resize). Card/section editor. Nav inline drag-and-drop. Widget resize + reorder. Field Linker panel with entity/column/aggregation selector. Conditional visibility rule builder per element.

  7. **5-Slot Rollback + Save System + New Page Creator** — Circular 5-slot save buffer in devConfig. Rollback timeline panel in Dev Studio showing diffs per slot. Floating "Save Page" button with unsaved count. "Reset Page" button. New Page Wizard (name, slug, layout) that registers route in App.tsx config and adds nav item. Dynamic route renderer for wizard-created pages.

  8. **Element Palette + Data Binding + Multi-View Mode** — Collapsible element palette panel in GOD Mode (Charts, Cards, Tables, Forms, Buttons, Icons). Drag-to-place on any page with live Field Linker on drop. Multi-View Mode switcher on list pages (Table/Card/Kanban/Calendar/Timeline). Data Version History panel per record (last 10 states, field-level restore).

  9. **Excel/Table Import + Relationship Designer + Global Search** — File upload for .xlsx/.csv with column preview and table naming. Field-to-page binding flow after import. ERD-style relationship diagram with drag-to-connect. Imported tables integrated into Query Console and Field Linker. Smart Global Search (Ctrl+K) full-text across all entities with ranked results.

  10. **Polish all main pages + Theme fixes + DevMode banner** — All per-page enhancements. Fix Matrix/Iron Man CSS vars. Fix DevMode banner overlap. Wire Analytics time filter. Fix Data Browser PUT/PATCH. Donor tier badges. Family tree. Mentees tab. Smart search on all list pages.

  ## Relevant files
  - `server/routes.ts`
  - `server/memoryStorage.ts`
  - `client/src/pages/DevStudio.tsx`
  - `client/src/contexts/DevModeContext.tsx`
  - `client/src/contexts/ThemeContext.tsx`
  - `client/src/App.tsx`
  - `client/src/index.css`
  - `client/src/pages/Analytics.tsx`
  - `client/src/pages/Mentors.tsx`
  - `client/src/pages/Donations.tsx`
  - `client/src/pages/Events.tsx`
  - `client/src/pages/Families.tsx`
  - `client/src/pages/Settings.tsx`
  - `client/src/pages/Dashboard.tsx`
  - `client/src/pages/Attendance.tsx`
  - `client/src/pages/Devotees.tsx`
  