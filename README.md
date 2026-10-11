# TruckSaathi TripSmart

A bilingual English/Hindi truck booking and capacity-matching demo. The public landing page lives at `/`; the shipper and transporter platform lives at `/app`.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm. Install dependencies, create the demo database, then start both the API and web app:

```sh
npm install
npm run seed
npm run dev
```

Open the Vite URL printed by the command (normally `http://localhost:5173`). The Express API listens on `http://localhost:3001`; `GET /api/health` checks it. The first API start seeds the SQLite database automatically if it is empty. `npm run seed` is safe to repeat and does not overwrite a database that already contains users.

Other commands: `npm test`, `npm run lint`, `npm run build`. Database location defaults to `data/trucksaathi.sqlite`; override it with `TRUCKSAATHI_DB`. `API_PORT` and `WEB_ORIGIN` may also be overridden.

## Three-minute demo

1. Open `/app`, switch English/Hindi, and compare the Shipper and Transporter roles and seeded impact figures.
2. Choose **Shipper / Business Owner**, enter a valid 10-digit Indian mobile number, then any four-digit OTP (the hint is `1234`).
3. Choose **General Cargo**, keep the sample 1,200 kg cargo, set pickup to Ludhiana and drop-off to Delhi, then choose pickup/delivery times.
4. Review the estimated price, submit to see ranked truck matches, and confirm the booking. The local API creates a load, saves match records, and creates a trip; open tracking to watch the truck progress. Use **Speed up demo** to finish immediately.
5. Return to `/app`, choose **Transporter / Truck Operator**, log in with any valid demo phone and four-digit code, choose single truck or fleet, configure availability, then accept or decline a sample return-load offer.
6. Visit Activity, Notifications, and Profile using the bottom tabs; try inbox quick replies and switch the interface language in Profile.

## Project structure

- Landing page: `src/routes/index.tsx`, `src/components/trucksaathi/`, `src/data/landing-copy.json`.
- App routes: `src/routes/app*.tsx`; shared controls and language state: `src/components/trucksaathi/`.
- Matching, Haversine road-distance estimation, price and impact calculations: `src/lib/matching.ts`; tests: `src/test/matching.test.ts`.
- API and SQLite schema/seed: `src/api/`; API base URL client: `src/lib/api-client.ts`.
- Landing tokens: `src/styles.css`; app rules: `src/styles/app.css`.

## Mocked parts

- OTP/SMS/WhatsApp, driver calls and chat, payment and escrow, identity/company verification, map routing, live GPS, temperature readings, and push notifications are simulated. OpenStreetMap tiles are real and require no key; road distance uses Haversine distance multiplied by 1.25, not a routing service.
- Live tracking advances a demo marker in the browser; the speed-up control completes the route. OTP entry accepts any four digits in the UI. API mutations persist demo booking, trip, event, availability, rating, notification, and fee records to SQLite.
- Seed cities, trucks, matches, ratings, sample impact numbers and emission/fuel constants are illustrative. `IMPACT_CONFIG` in `src/lib/matching.ts` has a TODO to replace fuel and emission assumptions with sourced figures.
- The booking UI includes seeded North India city autocomplete and route distance; tapping its map-pin control focuses pickup selection. No geocoding or turn-by-turn routing is provided.
