# TruckSaathi

A bilingual, single-page landing experience for an Indian full-journey truck matching platform.

## Local development

```sh
bun install
bun run dev
```

The Vite development server prints its local address. Available commands: `bun run test`, `bun run lint`, and `bun run build` for deployment builds.

## Editing the landing page

- Theme colors, fonts, spacing and motion: `src/styles.css`.
- English and Hindi copy: `src/data/landing-copy.json`.
- Page composition: `src/routes/index.tsx`.
- Focused sections and interactions: `src/components/trucksaathi/`.
- Calculator constants: `CALCULATOR` in `interactive.tsx`. Saved empty km = trucks × trips per truck × 600 km × empty share × 60% recovery. Gross additional revenue = saved km × ₹35/km. Costs and ₹1,500 matching fees are excluded.

## Prototype boundaries

This is a landing page only. Demo-form submissions never leave the browser and are not stored. No fleet platform or backend is implemented. Industry statistics and comparative commission figures are illustrative pending sourcing. The fleet-owner quotation is a fictional persona, explicitly labeled on the page. Contact email and operational route coverage require real business details before launch. Journey metrics are sample data, not a live match.

All illustrations are inline SVG, without external image dependencies. Typography loads from Google Fonts with local system fallbacks. Navigation, calculator, language toggle, FAQ and demo form are keyboard accessible; animation respects reduced-motion preferences.
