# Mermaid World

Mermaid World is a web-based Mermaid editor built with Next.js for writing, previewing, sharing, and exporting diagrams.

## Features

- Live Mermaid editing with CodeMirror
- Real-time graph preview
- Export to `PNG`, `JPG`, `PDF`, and `SVG`
- Multi-draft workflow
- Snapshot history (manual and automatic)
- Shareable URL-based diagrams with compressed fallback for large content
- Customizable graph backgrounds
- Static export support with service worker caching

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Mermaid
- Material UI
- CodeMirror

## Quick Start

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create static production build in `out/`
- `npm run start` - Run Next.js production server

## Deployment

This project is configured for static export deployment.

- Canonical production base path: `/Mermaid-Retina`
- Compatibility path also generated: `/mermaid-retina`
- Output directory: `out/`

## VS Code Extension

Use Mermaid Retina in VS Code:

- [Mermaid Retina (VS Code Marketplace)](https://marketplace.visualstudio.com/items?itemName=NipunSGeeTH.mermaid-retina)

## Project Structure

- `components/MermaidWorkbench.tsx` - Main application orchestration
- `components/workbench/useMermaidPreview.ts` - Mermaid rendering and preview lifecycle
- `components/workbench/WorkbenchPanels.tsx` - Editor and preview panel UI
- `components/workbench/useSplitLayout.ts` - Responsive split layout and divider drag behavior
- `components/workbench/useWorkbenchPersistence.ts` - Local persistence for drafts/settings/history
- `scripts/duplicate-basepath-case.mjs` - Post-build base-path compatibility duplication
- `next.config.ts` - Next.js static export and base path configuration

## Notes

- Service worker is registered for improved asset caching.
- Local state is persisted for drafts, preferences, and snapshots.
