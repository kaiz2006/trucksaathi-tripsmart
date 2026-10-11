## Architecture
- Keep the public landing page at `/` and the bilingual booking platform under `/app`.
- Keep theme roles in `src/styles.css` and app-specific layout rules in `src/styles/app.css`.
- Keep matching, distance, pricing and impact calculations in `src/lib/matching.ts`; keep demo data in `src/data` and API persistence in `src/api`.
- External integrations are mocked; local demo records use SQLite and can be reset with the seed command after removing the database file.
