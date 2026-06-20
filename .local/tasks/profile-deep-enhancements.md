# Profile Deep Enhancements

## What & Why
Devotee profiles need three major upgrades: (1) any name anywhere in the app should be clickable and navigate to that devotee's profile; (2) profile pictures and sensitive documents (PAN, Aadhaar, etc.) should be uploadable and stored locally within the app, accessible only to admins and developers; (3) the profile page should display family members as small photo+name tile icons directly below the name, each clickable to open that member's profile.

## Done looks like
- **Click-to-profile everywhere** — Devotee names in the Families page, Attendance table, Volunteering table, Groups entries, and any other table/list that currently shows a name as plain text are now clickable links navigating to `/devotees/:id`; the existing clickable names in Donations and Mentors pages are not broken
- **Profile picture upload** — The profile page hero section has a camera/upload icon overlay on the avatar; clicking it opens a file picker that accepts images; the selected image is stored as a base64 data URL in the devotee record in the in-memory store; it persists for the session and displays immediately; the Add/Edit Devotee form also has a profile picture uploader
- **Document storage** — A new "Documents" tab appears on the profile page (visible only when the logged-in role is admin or dev mode is active); users can upload PAN card, Aadhaar, and other custom-named documents; each document stores: type label, filename, base64 content, upload date; documents can be replaced (overwrite same type) or deleted; documents are never visible to standard users
- **Family member tiles** — Directly below the devotee's name+ID on the profile hero, small rounded tiles appear showing each family member's avatar photo and first name; clicking any tile navigates to that member's profile page; the tiles are horizontally scrollable if there are many members
- **Document add button on profile page** — A clearly labelled "Add Document" button opens a dialog with fields for document type (dropdown: PAN, Aadhaar, Passport, other) and file upload; on save it appends to the devotee's document list

## Out of scope
- Cloud document storage or encryption at rest (in-memory, session-only)
- Document preview rendering (show filename + type badge, no inline PDF viewer)
- Audit trail for document access

## Tasks
1. **In-memory document store** — Add a `documents` map in MemoryStorage keyed by devotee ID; each entry is an array of `{ id, type, filename, base64, uploadedAt }`; add API routes `GET /api/devotees/:id/documents`, `POST /api/devotees/:id/documents`, `DELETE /api/devotees/:id/documents/:docId`; routes require dev mode token or admin role
2. **Profile picture upload** — Add `profileImage` (base64 string) support to the devotee update route; add a clickable avatar overlay with camera icon on `DevoteeProfilePage` that triggers a file input and PATCHes the devotee record; mirror the uploader in `DevoteeForm` (add/edit)
3. **Family member tiles** — On `DevoteeProfilePage`, fetch all devotees in the same `familyId` (excluding self); render them as small horizontal tile cards (avatar + first name) below the name; each tile is a `Link` to `/devotees/:id`; horizontally scroll if more than 5
4. **Documents tab on profile** — Add a "Documents" tab to `DevoteeProfilePage` that fetches from the documents API; show a list of uploaded documents with type badge, filename, upload date, replace button, delete button; include an "Add Document" button that opens a dialog for type selection and file upload; hide the entire tab from non-admin, non-dev-mode users
5. **Click-to-profile audit** — Update Families page (head of family name), Attendance page (devotee name cells), Volunteering page (devotee name cells), and GroupEntriesList (member name cells) to wrap names in a `Link` or `onClick` that navigates to `/devotees/:id`

## Relevant files
- `client/src/pages/DevoteeProfilePage.tsx`
- `client/src/components/Devotees/DevoteeForm.tsx`
- `client/src/pages/Devotees.tsx`
- `client/src/components/Devotees/DevoteeList.tsx`
- `client/src/components/Devotees/GroupEntriesList.tsx`
- `client/src/pages/Families.tsx`
- `client/src/pages/Attendance.tsx`
- `client/src/pages/Volunteering.tsx`
- `server/memoryStorage.ts`
- `server/routes.ts`
- `shared/schema.ts`
