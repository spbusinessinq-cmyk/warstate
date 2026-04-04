# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### WARSTATE (`artifacts/warstate`)
- **Type**: react-vite
- **Preview path**: `/`
- **Description**: Battlefield status monitor and report generator for 10 active conflict theaters
- **Key features**:
  - 10 conflict theater grids (Iran, Ukraine, Gaza, Lebanon, Syria, Yemen, Sudan, Myanmar, Eastern DRC, Taiwan)
  - Theater search/filter, sector stress bars, force comparison ledger
  - Live refresh with posture/confidence cycling
  - Report generation with modal viewer
  - Export to PDF (jspdf), TXT, JSON; copy brief to clipboard; print
  - Overview panel: Executive Overview + Escalation Drivers (numbered) + Watch Next (3-column cards)
  - Indicators panel: category-prefix extraction for rich source-style display
  - Sources panel: category/detail split rendering (e.g. "OFFICIAL / STATE: ...")
- **Data model** (`src/data/theaters.ts`):
  - `Theater` interface has `escalationDrivers: string[]` and `watchNext: string[]`
  - All 10 theaters have rich multi-sentence `statusLine`, `overview`, `escalationDrivers`, `watchNext`, structured `indicators` (with category prefixes), and 6-item categorized `sources`
  - Sectors are theater-specific (5 dimensions per theater)
  - `POSTURE_MAP` and `CONFIDENCE_MAP` updated to match new theater data
- **Design language**: `#020304` black bg, `#1a2830` steel borders, `#265c42` active border, `#5ec998` active text, `#4caf87` accent, `#1c6348` bar fill, `#374a56` opposing bar, monospace throughout
- **Dependencies**: jspdf (lazy-loaded on PDF export), wouter, tailwindcss

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
