import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

const databasePath = resolve(process.env.TRUCKSAATHI_DB ?? "data/trucksaathi.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, phone TEXT NOT NULL UNIQUE, role TEXT NOT NULL CHECK(role IN ('shipper','transporter')),
    language TEXT NOT NULL DEFAULT 'en', verified INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS shippers (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), company_name TEXT NOT NULL,
    city TEXT NOT NULL, rating REAL NOT NULL DEFAULT 5, verified INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS transporters (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), owner_name TEXT NOT NULL,
    current_city TEXT NOT NULL, rating REAL NOT NULL DEFAULT 4.7, verified INTEGER NOT NULL DEFAULT 1, fleet_owner INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS fleets (
    id TEXT PRIMARY KEY, transporter_id TEXT NOT NULL REFERENCES transporters(id), name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS trucks (
    id TEXT PRIMARY KEY, transporter_id TEXT NOT NULL REFERENCES transporters(id), fleet_id TEXT REFERENCES fleets(id),
    registration TEXT NOT NULL UNIQUE, vehicle_type TEXT NOT NULL, capacity_kg INTEGER NOT NULL, reefer INTEGER NOT NULL DEFAULT 0,
    min_temp_c REAL, max_temp_c REAL, driver_name TEXT NOT NULL, details_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, latitude REAL NOT NULL, longitude REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS loads (
    id TEXT PRIMARY KEY, booking_id TEXT UNIQUE, shipper_id TEXT NOT NULL REFERENCES shippers(id), cargo_type TEXT NOT NULL,
    description TEXT NOT NULL, weight_kg INTEGER NOT NULL, pickup_city TEXT NOT NULL, dropoff_city TEXT NOT NULL,
    pickup_start TEXT NOT NULL, pickup_end TEXT NOT NULL, refrigerated_required INTEGER NOT NULL DEFAULT 0,
    temperature_json TEXT, status TEXT NOT NULL DEFAULT 'open', details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS availabilities (
    id TEXT PRIMARY KEY, transporter_id TEXT NOT NULL REFERENCES transporters(id), truck_id TEXT NOT NULL REFERENCES trucks(id),
    available_from TEXT NOT NULL, available_until TEXT NOT NULL, radius_km INTEGER NOT NULL, free_capacity_kg INTEGER NOT NULL,
    refrigerated INTEGER NOT NULL DEFAULT 0, details_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS capacity_ledger (
    id TEXT PRIMARY KEY, truck_id TEXT NOT NULL REFERENCES trucks(id), load_id TEXT REFERENCES loads(id), trip_id TEXT REFERENCES trips(id),
    booked_kg INTEGER NOT NULL DEFAULT 0, reserved_kg INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'reserved',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, details_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY, load_id TEXT NOT NULL REFERENCES loads(id), truck_id TEXT NOT NULL REFERENCES trucks(id),
    score INTEGER NOT NULL, price INTEGER NOT NULL, dedicated_price INTEGER NOT NULL, explanation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'recommended', details_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, load_id TEXT NOT NULL REFERENCES loads(id), match_id TEXT REFERENCES matches(id),
    truck_id TEXT NOT NULL REFERENCES trucks(id), status TEXT NOT NULL, pickup_otp TEXT NOT NULL, delivery_otp TEXT NOT NULL,
    progress REAL NOT NULL DEFAULT 0, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS trip_events (
    id TEXT PRIMARY KEY, trip_id TEXT NOT NULL REFERENCES trips(id), event_type TEXT NOT NULL, occurred_at TEXT NOT NULL,
    details_json TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), title TEXT NOT NULL, message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'mock-whatsapp', read INTEGER NOT NULL DEFAULT 0, reply TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY, trip_id TEXT NOT NULL REFERENCES trips(id), author_id TEXT REFERENCES users(id),
    target_id TEXT REFERENCES users(id), score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5), comment TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS fee_ledger (
    id TEXT PRIMARY KEY, match_id TEXT REFERENCES matches(id), trip_id TEXT REFERENCES trips(id),
    load_price INTEGER NOT NULL, platform_fee INTEGER NOT NULL, marginal_fuel_cost INTEGER NOT NULL, transporter_net INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_loads_status_dates ON loads(status, pickup_start, pickup_end);
  CREATE INDEX IF NOT EXISTS idx_availabilities_dates ON availabilities(available_from, available_until);
  CREATE INDEX IF NOT EXISTS idx_capacity_ledger_truck ON capacity_ledger(truck_id, status, created_at);
  CREATE INDEX IF NOT EXISTS idx_trips_booking ON trips(booking_id);
`);
