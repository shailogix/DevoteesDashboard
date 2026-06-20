# Fix All Non-Working Buttons & Features

## What & Why
Several buttons and features across the app are stubs (console.log, empty onClick, alert() placeholders) that give users a broken experience. Every button must do something real and contextually useful. This task identifies and fully implements all stubs.

## Done looks like
- **Dashboard – Group actions**: "Add Group" opens a real group creation dialog (the existing GroupFieldWizard); "Edit Group" opens the group edit form; "WhatsApp" and "Telegram" buttons open the respective group links in a new tab (or show a dialog to enter/save the group link if not yet configured); "Send Bulk Message" opens a compose dialog with a text area and a confirmation before simulating sending (shows a toast confirming how many members were messaged)
- **ID Card Studio – Download**: The "Download" button generates a real downloadable PNG of the displayed ID card using the browser's `html-to-image` or `canvas` approach; shows a progress toast during generation and a success toast on completion; the file is named `ID_<devoteeId>.png`
- **ID Card Studio – Preview button**: Opens a full-screen modal preview of the rendered ID card with a close button
- **GroupEntriesList – Export**: The "Export" button downloads a real CSV file of all entries for that group with proper column headers matching the group's custom fields; filename is `<GroupName>_entries.csv`
- **GroupEntriesList – Generate QR**: Opens a dialog showing a scannable QR code image (generated via a QR library) for each entry's `qrIdentifier`; the dialog has a "Download QR" button to save the image
- No button in the app triggers a console.log or alert() as its primary action

## Out of scope
- Real WhatsApp/Telegram API integration (just link opening)
- Mass email sending infrastructure
- QR scanning / attendance via QR (future feature)

## Tasks
1. **Dashboard group action stubs** — Replace `console.log` and `alert()` handlers in Dashboard with real dialogs: Add Group dialog (reuse GroupFieldWizard), Edit Group dialog, WhatsApp/Telegram link-open + group link management dialog, Bulk Message compose dialog with member count and send confirmation toast
2. **ID Card download** — Install `html-to-image` package; in IDCardGenerator implement `handleDownload` to render the card element to a PNG blob and trigger browser download; implement the Preview button to show the rendered card in a full-screen Dialog
3. **Group entries export & QR** — In GroupEntriesList, implement `handleExport` to build a CSV string from `entryData` JSONB and trigger download; install `qrcode.react` and implement `handleGenerateQR` to render a QR code in a Dialog with a download button

## Relevant files
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/IDCardGenerator.tsx`
- `client/src/components/IDCard/IDCardGenerator.tsx`
- `client/src/components/Devotees/GroupEntriesList.tsx`
