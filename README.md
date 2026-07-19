# The Gaskins

> A private creator command center. Editorial, sophisticated, minimalist — a digital concierge rather than a SaaS app.

**The Gaskins** is the brand command center for a single creator. It is built as a four-module dashboard on Astro + Tailwind CSS, styled in a "Quiet Luxury" aesthetic (deep onyx, brushed champagne gold, Playfair Display serif over Inter sans). There is **no authentication layer** — the app routes directly to the home dashboard.

## Modules

| # | Module | Route | Purpose |
|---|--------|-------|---------|
| I | **The Welcome Concierge** | `/` | Hero typographical header, dynamic greeting, and an "At a Glance" matrix that pulls the next three filming tasks directly from the schedule. Minimalist metric slats. |
| II | **The Vault** | `/vault` | Masonry grid of curated inspiration references in minimal glassmorphism containers — each card holds the title, outbound profile link, and a strategic strategy note. Capsule tag filters (All / Reels / Hooks / Aesthetics). |
| III | **The War Room** | `/war-room` | Three-column Kanban — *Raw Ideas*, *In Refinement*, *Ready to Film*. Cream digital stationery cards against the dark backdrop, with drag-and-drop. |
| IV | **The Itinerary** | `/itinerary` | Clean monthly calendar with exactly four core shoots across two weeks (starting Wed Jul 22, 2026). Clicking a date opens a Preact island drawer with the shoot brief and a **reactive status selector** (Pending / Filmed / Edited) — changing status updates the drawer and the calendar cell indicator live, no page reload. |

## Interactive Engine

The Itinerary's drawer is a **Preact client island** (`src/components/ItineraryDrawer.tsx`, hydrated via `client:load`). It owns clean frontend local state for each shoot's status. The static Astro-rendered calendar calls into the island through a tiny bridge (`window.__itinerary__.open(day)`), so the calendar grid stays static HTML while the island handles all reactivity. Status changes propagate back to the matching calendar cell's indicator color in real time.

## Design System

- **Background:** `#0e0e10` → `#1a1a1d` onyx scale, hairline grain texture overlay
- **Text:** `#f5f5f7` off-white, muted gray secondary
- **Accent:** `#d4af37` / `#c5a059` brushed champagne gold for interactive elements
- **Typography:** Playfair Display (display serif), Cormorant Garamond (serif body), Inter (sans/eyebrows), JetBrains Mono (numerals/credits)
- **Motion:** Subtle fade-rise entrances, gold-underline reveals on hover, view transitions between modules

All tokens live in `src/styles/global.css` as Tailwind v4 `@theme` custom properties.

## Architecture

```
src/
├── config/
│   └── site.ts            # Single source of truth for all content & sample data
├── layouts/
│   └── DashboardLayout.astro   # Persistent shell: sidebar + canvas + view transitions
├── components/
│   ├── Sidebar.astro           # Luxury nav rail with monogram crest
│   └── VaultCard.astro         # Inspiration card with placeholder thumbnail
├── pages/
│   ├── index.astro            # I  · Welcome Concierge
│   ├── vault.astro            # II · The Vault
│   ├── war-room.astro         # III · The War Room
│   └── itinerary.astro        # IV · The Itinerary
└── styles/
    └── global.css            # Tailwind v4 theme + editorial utilities
```

### Why Astro

Astro's islands architecture ships zero JavaScript by default — only the small inline scripts powering the Vault filter, Kanban drag-and-drop, and Itinerary drawer are sent to the client. The `<ClientRouter />` view-transition component keeps the sidebar persistent across navigations, so the Itinerary drawer and other interactive states survive route changes without a full reload.

## Getting Started

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # produce static build in dist/
npm run preview  # preview the production build
```

## Data Layer

All copy and sample content is centralized in [`src/config/site.ts`](src/config/site.ts). Components iterate over exported arrays — to change any headline, card, memo, or shoot, edit that one file. No content is hardcoded inside views.

## License

Private project. © 2026 The Gaskins.
