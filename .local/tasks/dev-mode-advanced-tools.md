# Dev Mode Advanced Tools

## What & Why
Dev Mode needs three powerful new capabilities: (1) a Dynamic Field Manager so developers can add/remove custom fields from any data table in the system at runtime, with changes reflecting synchronously across all pages that use that table; (2) a universal Text Editor so any displayed text string in the app can be changed from Dev Mode without touching code; (3) a Database Relation Manager so developers can visually define relationships between tables (e.g. link a custom group to a devotee field). These tools give the developer full control over the app's data model and UI copy without redeployment.

## Done looks like

### Dynamic Field Manager
- A "Field Manager" tab in Dev Studio lists every data entity (Devotees, Families, Events, Donations, Volunteering, Groups) with its current fields
- Clicking an entity shows its field list; a "Add Field" button opens a dialog to define: field name, display label, type (text/number/date/boolean/select), required flag, default value, and for select-type, a list of options
- "Remove Field" shows a warning popup listing every page and component that uses that field (e.g. "This field is used on: Devotees List table column, Add Devotee form, DevoteeProfilePage Details tab"); the user must confirm before deletion
- Added fields immediately appear as columns in the relevant list page and as inputs in the relevant form; removed fields disappear from all surfaces simultaneously
- Custom field definitions are stored in `devConfig.customFields` per entity in the in-memory dev config

### Universal Text Editor
- A "Text Editor" tab in Dev Studio shows a searchable tree of all overridable text strings in the app, organized by page (Dashboard, Devotees, Families, etc.) and component
- Clicking any text string opens an inline edit box; saving stores the override in `devConfig.textOverrides`
- The app reads `textOverrides` and substitutes matching strings at render time via a `useAppText(key)` hook
- A "Reset to Default" button per string reverts it; a "Reset All" button clears all text overrides
- List items (dropdown options, nav labels, status values) each appear individually and can be edited, with the option to add new list items or delete existing ones — changes reflect everywhere that list is used

### Database Relation Manager
- A "Relations" tab in Dev Studio shows a simple table of defined relations: source entity, source field, target entity, target field, relation type (one-to-one, one-to-many)
- An "Add Relation" button opens a dialog to define a new relation using dropdowns for entity and field selection
- Defined relations are stored in `devConfig.relations`; they cause the relevant form fields to render as a searchable picker (instead of plain text input) pointing to the related entity's records
- A "Remove Relation" button removes the relation; affected forms revert to plain text inputs
- Existing hard-coded relations (devotee → family, devotee → mentor) are pre-populated as read-only entries in the relations list for visibility

## Out of scope
- Actual SQL schema migrations (all changes are in-memory only, session-persistent via devConfig)
- Import/export of field definitions or relations as JSON (future enhancement)
- Visual entity-relationship diagram (text-based list only)

## Tasks
1. **devConfig schema extensions** — Extend the server-side `devConfig` object with `customFields: Record<entityName, FieldDefinition[]>`, `textOverrides: Record<textKey, string>`, and `relations: RelationDefinition[]`; add API endpoints for CRUD on each; all endpoints require the GOD Mode token
2. **Dynamic Field Manager UI** — Build the "Field Manager" tab in Dev Studio: entity selector, field list with type badges, Add Field dialog, Remove Field confirmation with dependency impact list; connect to the new API
3. **Field injection into forms and tables** — Create a `useEntityFields(entityName)` hook that merges hardcoded fields with `devConfig.customFields` for that entity; update DevoteeForm, DevoteeList, FamiliesPage table, and EventsPage table to render extra fields returned by this hook
4. **Universal Text Editor UI** — Build the "Text Editor" tab; create a `useAppText(key, defaultValue)` hook that checks `devConfig.textOverrides` before returning the default; replace key user-facing string literals across Dashboard, Sidebar nav labels, page headings, status values, and dropdown options with `useAppText` calls; build the Dev Studio tree/search UI
5. **Database Relation Manager UI** — Build the "Relations" tab in Dev Studio; update `GroupEntryForm` and `DevoteeForm` to consult `devConfig.relations` when deciding whether a field renders as a plain input or a searchable entity picker

## Relevant files
- `client/src/pages/DevStudio.tsx`
- `server/memoryStorage.ts`
- `server/routes.ts`
- `client/src/components/Devotees/DevoteeForm.tsx`
- `client/src/components/Devotees/DevoteeList.tsx`
- `client/src/pages/Families.tsx`
- `client/src/pages/Events.tsx`
- `client/src/components/Layout/Sidebar.tsx`
