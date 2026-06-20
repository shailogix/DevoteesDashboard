# Devotee Management Studio — Full Build

## What & Why
Transform the existing Madhav Parivar web app into a fully-featured, offline-first Devotee Management Studio. The app should feel like professional desktop software: secure, self-contained, deeply configurable by a Developer role, and powerful enough for day-to-day admin use — all while running in the browser (local-first web app, PWA-ready).

Because Replit cannot build and package a native desktop binary, this implementation delivers every capability of the spec as a local-first progressive web application with full offline support via service workers and an in-browser SQLite database (via sql.js / wa-sqlite), so the exact same codebase can later be wrapped in Electron or Tauri with minimal changes.

## Done looks like

### Security & Auth
- First-launch setup screen: Admin enters a master passphrase; a derived key (Argon2/PBKDF2) is stored; never the raw secret.
- Login screen protects all views. Three roles enforced throughout: Developer, Admin, Standard User.
- All sensitive fields (contact info, donations, chat IDs) are encrypted with AES-256-GCM before being persisted.
- Developer Mode activates via a hidden shortcut + secret passphrase (default "DevelopZ", configurable). A visible banner shows when Developer Mode is active.

### Core Data (encrypted SQLite in-browser)
- Schemas for: Devotees (core fields + JSON extra fields column), Families, Events & Attendance, Donations/Seva, Messaging links (Telegram ID, WhatsApp number, preferences), Audit logs.
- All CRUD operations go through a repository/data-access layer that transparently encrypts/decrypts sensitive columns.

### Developer Mode — Configuration Studio
- Every page's layout is defined by a JSON config document stored in the DB (versioned).
- Developer can: edit text labels, icons, images on any component; add/remove/reorder sidebar tabs; configure devotee profile field layout; define custom fields (written to JSON column + schema metadata).
- All layout configs are stored as versioned snapshots; Developer can name, browse, and roll back to any prior snapshot.
- "Safe mode" loads a minimal default layout if the active config is invalid, with a rollback prompt.

### Dashboard Designer
- Drag-and-drop dashboard builder: metric cards (counts, sums), data tables, bar/line/pie charts.
- Pivot-like configuration UI: choose dimensions and measures, produce grouped/aggregated views from local data — fully client-side.

### Macros & Automation Engine
- Triggers: manual (button), scheduled (timer), basic data events (e.g., new devotee added).
- Actions: DB updates, CSV/PDF exports, dashboard refreshes, queuing outbound messages.
- Visual rule builder for Admin users; optional sandboxed script editor for Developer.
- All macros and versions stored in the encrypted config store.

### Messaging Integration (Telegram & WhatsApp)
- App functions fully offline; messaging features clearly separated and only active when configured.
- Outbound message preparation: select devotees → generate pre-filled Telegram deep links or WhatsApp wa.me URLs.
- Pluggable connector layer ready for a future relay service (chatbot/webhook support).

### Form Builder
- Developer-mode form builder: define data collection forms with fields mapped to devotee record fields (including custom fields).
- Internal forms: operator enters devotee ID, loads record, fills/updates responses inside the app.
- Forms can be exported as JSON definitions for future Telegram/WhatsApp relay use.

### Live Stream Widget
- Optional dashboard widget type: embeds a configurable web video/streaming URL.
- Configuration to enable/disable widget and change source URL.

### Versioning & Rollback
- Binary version vs. configuration version are separate concepts.
- Config snapshots stored in DB; Developer can name and roll back to any prior snapshot.
- Update-check mechanism: app can check for a new version and display a notification.

### ID Card Studio — Enhanced
- Retain and polish the existing ID Card Studio with the new security layer and custom fields.

### Existing Pages — Polished
- All existing pages (Devotees, Families, Attendance, Events, Analytics, Donations, Volunteering, Mentors, Dev Studio) are upgraded to match the new security, role, and encryption architecture.

## Out of scope
- Native binary compilation/packaging (Electron or Tauri build artifacts — can be added later as the codebase is structured for it).
- A live relay server for Telegram/WhatsApp bots (connector layer is prepared but the relay itself is a separate service).
- Cloud sync or multi-device sync.
- Code obfuscation of production bundles (beyond standard minification).
- OS-level keychain integration (encryption key derived from passphrase, stored encrypted in IndexedDB/localStorage as fallback).

## Tasks

1. **Security foundation & auth layer** — Implement first-launch passphrase setup, AES-256-GCM encryption helpers, PBKDF2/Argon2 key derivation, and a login screen. Gate all routes behind authentication. Enforce Developer/Admin/User role checks throughout the app.

2. **In-browser encrypted SQLite layer** — Integrate sql.js (WebAssembly SQLite) and implement the repository/data-access layer. Define schemas for all entities (Devotees, Families, Events, Attendance, Donations, Messaging links, Audit logs). Transparently encrypt/decrypt sensitive columns via the key from step 1.

3. **Developer Mode activation & config system** — Add hidden shortcut + passphrase to activate Developer Mode. Build the JSON-driven layout config system: versioned config documents stored in SQLite, a config snapshot browser (name, view, restore), and safe-mode fallback. Show a visible Developer Mode banner.

4. **Configuration Studio UI** — Build the in-app Developer Mode UI: sidebar tab manager (add/remove/reorder), devotee profile field layout editor, custom field definition system, text/icon/image label editor for any visible component.

5. **Dashboard Designer & pivot views** — Build the drag-and-drop dashboard builder (metric cards, tables, charts) and pivot-like configuration UI. All aggregation runs client-side from the SQLite data.

6. **Macros & Automation engine** — Implement the macro engine: triggers (manual, scheduled, data events), actions (DB updates, exports, message queuing), visual rule builder, and optional sandboxed script editor. Store macros in the encrypted config store.

7. **Messaging integration module** — Build the Telegram/WhatsApp outbound message preparation UI (select devotees → generate deep links/payloads). Implement the pluggable connector layer interface for future relay services. Manage messaging links (Telegram ID, WhatsApp number) per devotee.

8. **Form Builder** — Developer Mode form builder: define forms with field mappings to devotee/custom fields. Internal form-filling UI (load by devotee ID). JSON export for external use.

9. **Live stream dashboard widget** — Add the configurable stream/video embed widget type to the dashboard designer. Include enable/disable toggle and URL configuration.

10. **Polish existing pages & integrate encryption** — Migrate all existing pages (Devotees, Families, Events, Attendance, Donations, Volunteering, Mentors, Analytics, ID Card Studio, Dev Studio) onto the new encrypted SQLite layer and role-gated architecture. Ensure responsive design throughout.

## Relevant files
- `client/src/App.tsx`
- `client/src/pages`
- `server/routes.ts`
- `server/storage.ts`
- `shared/schema.ts`
- `client/src/components`
