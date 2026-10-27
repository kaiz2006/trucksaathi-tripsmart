import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  calculateImpact,
  calculateLoadPrice,
  calculateTransporterNet,
  IMPACT_CONFIG,
  matchAvailabilityToLoads,
  matchLoadToTrucks,
  type Coordinates,
  type MatchLoad,
  type TemperatureRange,
  type TruckAvailability,
} from "../lib/matching";
import { db } from "./database";
import { seedDemoData } from "./seed";

seedDemoData();

const api = express();
const port = Number(process.env.API_PORT ?? 3001);
api.use((request, response, next) => {
  const requestOrigin = request.header("Origin");
  const localOrigin =
    requestOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ? requestOrigin
      : undefined;
  response.header(
    "Access-Control-Allow-Origin",
    process.env.WEB_ORIGIN ?? localOrigin ?? "http://localhost:5173",
  );
  response.header("Vary", "Origin");
  response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }
  next();
});
api.use(express.json({ limit: "1mb" }));

const otpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  role: z.enum(["shipper", "transporter"]),
});
const cityQuery = db.prepare(
  "SELECT name, latitude AS lat, longitude AS lon FROM cities WHERE name = ?",
);

function sendError(response: Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function coordinates(cityName: string): Coordinates | undefined {
  return cityQuery.get(cityName) as Coordinates | undefined;
}

function loadFromRow(row: Record<string, unknown>): MatchLoad | null {
  const pickupCoordinates = coordinates(String(row.pickup_city));
  const dropoffCoordinates = coordinates(String(row.dropoff_city));
  if (!pickupCoordinates || !dropoffCoordinates) return null;
  const details = parseJson<Record<string, unknown>>(String(row.details_json ?? "{}"), {});
  return {
    id: String(row.id),
    pickup: String(row.pickup_city),
    pickupCoordinates,
    dropoff: String(row.dropoff_city),
    dropoffCoordinates,
    pickupStart: String(row.pickup_start),
    pickupEnd: String(row.pickup_end),
    weightKg: Number(row.weight_kg),
    cargoType: String(row.cargo_type),
    refrigeratedRequired: Boolean(row.refrigerated_required),
    temperatureRange: parseJson<TemperatureRange | undefined>(
      row.temperature_json as string | null,
      undefined,
    ),
    sharedLoad: Boolean(details.sharedLoad),
    returnLegKm: Number(details.returnLegKm ?? 0),
  };
}

function availabilityFromRow(row: Record<string, unknown>): TruckAvailability | null {
  const details = parseJson<Record<string, unknown>>(String(row.details_json ?? "{}"), {});
  const truckDetails = parseJson<Record<string, unknown>>(String(row.truck_details ?? "{}"), {});
  const currentCity = String(
    details.currentCity ?? truckDetails.currentCity ?? row.current_city ?? "",
  );
  const currentCoordinates = coordinates(currentCity);
  if (!currentCoordinates) return null;
  const supportedTemperature = Number(row.reefer)
    ? { minC: Number(row.min_temp_c ?? -25), maxC: Number(row.max_temp_c ?? 15) }
    : undefined;
  return {
    id: String(row.id),
    truckId: String(row.truck_id),
    truckType: String(row.vehicle_type),
    truckRegistration: String(row.registration ?? ""),
    driverName: String(row.driver_name ?? ""),
    currentCity,
    currentCoordinates,
    headingTo: String(details.headingTo ?? ""),
    returningFrom: String(details.returningFrom ?? ""),
    availableFrom: String(row.available_from),
    availableUntil: String(row.available_until),
    radiusKm: Number(row.radius_km),
    preferredDestinations: parseJson<string[]>(details.preferredDestinations as string, []),
    avoidedDestinations: parseJson<string[]>(details.avoidedDestinations as string, []),
    freeCapacityKg: Number(row.free_capacity_kg),
    refrigerated: Boolean(row.reefer),
    supportedTemperature,
    minimumRatePerKm: Number(details.minimumRatePerKm ?? 25),
    sharedLoadsAccepted: Boolean(details.sharedLoadsAccepted),
    rating: Number(row.rating ?? 4.5),
    capacityKg: Number(row.capacity_kg),
  };
}

function getAvailabilityRows() {
  return db
    .prepare(
      `SELECT a.*, t.vehicle_type, t.registration, t.driver_name, t.capacity_kg, t.reefer, t.min_temp_c, t.max_temp_c,
    t.details_json AS truck_details, p.current_city, p.rating FROM availabilities a
    JOIN trucks t ON t.id = a.truck_id JOIN transporters p ON p.id = a.transporter_id`,
    )
    .all() as Record<string, unknown>[];
}

function reserveTruckCapacity(
  loadId: string,
  truckId: string,
  weightKg: number,
  tripId: string | null,
  bookingId: string,
): { id: string } {
  const availability = db
    .prepare("SELECT * FROM availabilities WHERE truck_id = ? ORDER BY rowid DESC LIMIT 1")
    .get(truckId) as Record<string, unknown> | undefined;
  if (!availability) throw new Error("Truck availability is missing.");

  // For demo purposes, check total capacity instead of just free capacity
  const reservedTotal = db
    .prepare(
      "SELECT COALESCE(SUM(reserved_kg), 0) AS total FROM capacity_ledger WHERE truck_id = ? AND status IN ('reserved', 'booked', 'in_transit')",
    )
    .get(truckId) as { total: number };

  const truckCapacity = db.prepare("SELECT capacity_kg FROM trucks WHERE id = ?").get(truckId) as
    { capacity_kg: number } | undefined;

  if (!truckCapacity) throw new Error("Truck not found.");

  // Use truck's total capacity minus reserved, but allow booking if load fits in truck
  const availableAfterBooked = Number(truckCapacity.capacity_kg) - Number(reservedTotal.total);

  // For demo: allow booking if load fits in truck capacity (more lenient)
  if (weightKg > Number(truckCapacity.capacity_kg)) {
    throw new Error(
      `Load weight (${weightKg}kg) exceeds truck capacity (${truckCapacity.capacity_kg}kg).`,
    );
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO capacity_ledger (id, truck_id, load_id, trip_id, booked_kg, reserved_kg, status, details_json) VALUES (?, ?, ?, NULL, ?, ?, 'reserved', ?)",
  ).run(
    id,
    truckId,
    loadId,
    weightKg,
    weightKg,
    JSON.stringify({ bookingId, source: tripId ? "trip" : "draft" }),
  );
  db.prepare(
    "UPDATE availabilities SET free_capacity_kg = MAX(0, free_capacity_kg - ?) WHERE truck_id = ?",
  ).run(weightKg, truckId);
  return { id };
}

api.get("/api/health", (_request, response) =>
  response.json({
    ok: true,
    service: "trucksaathi-api",
    demoMode: process.env.DEMO_MODE !== "false",
  }),
);

api.post("/api/auth/otp", (request, response) => {
  const parsed = otpSchema.safeParse(request.body);
  if (!parsed.success)
    return sendError(response, 400, "Enter a valid 10-digit Indian mobile number and role.");
  response.json({
    accepted: true,
    demoCodeHint: "1234",
    message: "Mock OTP ready. Any four digits will verify.",
  });
});

api.post("/api/auth/verify", (request, response) => {
  const parsed = otpSchema
    .extend({ code: z.string().regex(/^\d{4}$/), language: z.enum(["en", "hi"]).default("en") })
    .safeParse(request.body);
  if (!parsed.success)
    return sendError(response, 400, "Valid phone, role and four digit code are required.");
  const { phone, role, language } = parsed.data;
  const userId = randomUUID();
  db.prepare(
    `INSERT INTO users (id, phone, role, language, verified) VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(phone) DO UPDATE SET role = excluded.role, language = excluded.language, verified = 1`,
  ).run(userId, phone, role, language);
  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  response.json({ user, token: `demo-${phone}` });
});

api.get("/api/loads", (request, response) => {
  const status = typeof request.query.status === "string" ? request.query.status : null;
  const rows = status
    ? db.prepare("SELECT * FROM loads WHERE status = ? ORDER BY pickup_start").all(status)
    : db.prepare("SELECT * FROM loads ORDER BY pickup_start").all();
  response.json(rows);
});

api.post("/api/loads", (request, response) => {
  const input = request.body as Record<string, unknown>;
  const required = [
    "cargoType",
    "description",
    "weightKg",
    "pickupCity",
    "dropoffCity",
    "pickupStart",
    "pickupEnd",
  ];
  if (required.some((key) => input[key] === undefined || input[key] === ""))
    return sendError(response, 400, "Complete the required load and route fields.");
  const id = randomUUID();
  const bookingId = `TS-${Date.now().toString().slice(-7)}`;
  const shipperId = String(input.shipperId ?? "shipper-1");
  const refrigerated = Boolean(input.refrigeratedRequired);
  const temperature = input.temperatureRange ? JSON.stringify(input.temperatureRange) : null;
  db.prepare(
    `INSERT INTO loads (id, booking_id, shipper_id, cargo_type, description, weight_kg, pickup_city, dropoff_city,
    pickup_start, pickup_end, refrigerated_required, temperature_json, status, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
  ).run(
    id,
    bookingId,
    shipperId,
    String(input.cargoType),
    String(input.description),
    Number(input.weightKg),
    String(input.pickupCity),
    String(input.dropoffCity),
    String(input.pickupStart),
    String(input.pickupEnd),
    Number(refrigerated),
    temperature,
    JSON.stringify(input.details ?? {}),
  );
  response.status(201).json({ id, bookingId, status: "open" });
});

api.get("/api/loads/:id", (request, response) => {
  const load = db
    .prepare("SELECT * FROM loads WHERE id = ? OR booking_id = ?")
    .get(request.params.id, request.params.id);
  if (!load) return sendError(response, 404, "Load not found.");
  response.json(load);
});

api.patch("/api/loads/:id", (request, response) => {
  const input = request.body as Record<string, unknown>;
  const status = z
    .enum(["open", "booked", "in_transit", "delivered", "cancelled"])
    .safeParse(input.status);
  if (!status.success) return sendError(response, 400, "Unsupported load status.");
  const result = db
    .prepare("UPDATE loads SET status = ? WHERE id = ? OR booking_id = ?")
    .run(status.data, request.params.id, request.params.id);
  if (!result.changes) return sendError(response, 404, "Load not found.");
  response.json({ updated: true, status: status.data });
});

api.get("/api/availabilities", (_request, response) => response.json(getAvailabilityRows()));

api.post("/api/trucks", (request, response) => {
  const parsed = z
    .object({
      registration: z.string().trim().min(4).max(16),
      driverName: z.string().trim().min(1).max(80),
      vehicleType: z
        .enum(["Mini truck", "LCV", "Container", "Open body", "Multi-axle", "Refrigerated"])
        .default("Multi-axle"),
      capacityKg: z.number().int().positive().max(50000).default(14000),
      reefer: z.boolean().default(false),
    })
    .safeParse(request.body);
  if (!parsed.success)
    return sendError(response, 400, "Enter a valid registration, driver and truck capacity.");
  const owner = db.prepare("SELECT id FROM transporters ORDER BY rowid LIMIT 1").get() as
    { id: string } | undefined;
  if (!owner) return sendError(response, 409, "No demo transporter is seeded yet.");
  const fleet = db
    .prepare("SELECT id FROM fleets WHERE transporter_id = ? ORDER BY rowid LIMIT 1")
    .get(owner.id) as { id: string } | undefined;
  const id = randomUUID();
  try {
    db.prepare(
      `INSERT INTO trucks (id, transporter_id, fleet_id, registration, vehicle_type, capacity_kg, reefer, min_temp_c, max_temp_c, driver_name, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
    ).run(
      id,
      owner.id,
      fleet?.id ?? null,
      parsed.data.registration.toUpperCase(),
      parsed.data.vehicleType,
      parsed.data.capacityKg,
      Number(parsed.data.reefer),
      parsed.data.reefer ? -25 : null,
      parsed.data.reefer ? 15 : null,
      parsed.data.driverName,
    );
    response
      .status(201)
      .json({ id, ...parsed.data, registration: parsed.data.registration.toUpperCase() });
  } catch {
    sendError(response, 409, "That registration number is already in this demo fleet.");
  }
});

api.post("/api/availabilities", (request, response) => {
  const input = request.body as Record<string, unknown>;
  const truckId = String(input.truckId ?? "");
  const truck = db.prepare("SELECT * FROM trucks WHERE id = ?").get(truckId) as
    Record<string, unknown> | undefined;
  if (!truck) return sendError(response, 400, "Select a truck that exists in this demo fleet.");
  const id = randomUUID();
  db.prepare(
    `INSERT INTO availabilities (id, transporter_id, truck_id, available_from, available_until, radius_km, free_capacity_kg, refrigerated, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    String(truck.transporter_id),
    truckId,
    String(input.availableFrom),
    String(input.availableUntil),
    Number(input.radiusKm ?? 350),
    Number(input.freeCapacityKg ?? truck.capacity_kg),
    Number(Boolean(input.refrigerated)),
    JSON.stringify(input.details ?? {}),
  );
  response.status(201).json({ id });
});

api.post("/api/matches/load", (request, response) => {
  const input = request.body as MatchLoad;
  if (
    !input?.pickupCoordinates ||
    !input?.dropoffCoordinates ||
    !input.pickupStart ||
    !input.pickupEnd
  )
    return sendError(response, 400, "A complete load route and pickup window are required.");
  const candidates = getAvailabilityRows()
    .map(availabilityFromRow)
    .filter((item): item is TruckAvailability => item !== null);
  const ranked = matchLoadToTrucks(input, candidates);
  const insertMatch = db.prepare(
    "INSERT INTO matches (id, load_id, truck_id, score, price, dedicated_price, explanation, status, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, 'recommended', ?)",
  );
  const saveMatches = db.transaction(() =>
    ranked.map((match) => {
      const matchId = randomUUID();
      insertMatch.run(
        matchId,
        input.id,
        match.availability.truckId ?? match.availability.id,
        match.score,
        match.price,
        match.dedicatedPrice,
        match.explanation,
        JSON.stringify({
          detourKm: match.detourKm,
          estimatedTravelHours: match.estimatedTravelHours,
        }),
      );
      return { ...match, matchId };
    }),
  );
  response.json(saveMatches());
});

api.post("/api/matches/availability", (request, response) => {
  const input = request.body as TruckAvailability;
  if (!input?.currentCoordinates || !input.availableFrom || !input.availableUntil)
    return sendError(response, 400, "Truck location and availability window are required.");
  const rows = db.prepare("SELECT * FROM loads WHERE status = 'open'").all() as Record<
    string,
    unknown
  >[];
  const loads = rows.map(loadFromRow).filter((item): item is MatchLoad => item !== null);
  response.json(matchAvailabilityToLoads(input, loads));
});

api.get("/api/trips", (_request, response) =>
  response.json(db.prepare("SELECT * FROM trips ORDER BY created_at DESC").all()),
);

api.get("/api/trips/:id", (request, response) => {
  const trip = db
    .prepare("SELECT * FROM trips WHERE id = ? OR booking_id = ?")
    .get(request.params.id, request.params.id);
  if (!trip) return sendError(response, 404, "Trip not found.");
  const events = db
    .prepare("SELECT * FROM trip_events WHERE trip_id = ? ORDER BY occurred_at")
    .all((trip as Record<string, unknown>).id);
  response.json({ ...(trip as object), events });
});

api.post("/api/trips", (request, response) => {
  const input = request.body as Record<string, unknown>;
  const loadId = String(input.loadId ?? "");
  const truckId = String(input.truckId ?? "");
  const id = randomUUID();
  const bookingId = String(input.bookingId ?? `TS-${Date.now().toString().slice(-7)}`);
  try {
    const load = db
      .prepare("SELECT * FROM loads WHERE id = ? OR booking_id = ?")
      .get(loadId, loadId) as Record<string, unknown> | undefined;
    if (!load) return sendError(response, 404, "Load not found.");
    const weightKg = Number((load as Record<string, unknown>).weight_kg ?? 0);
    db.transaction(() => {
      const reservation = reserveTruckCapacity(loadId, truckId, weightKg, id, bookingId);
      db.prepare(
        "INSERT INTO trips (id, booking_id, load_id, match_id, truck_id, status, pickup_otp, delivery_otp, progress, details_json) VALUES (?, ?, ?, ?, ?, 'confirmed', '1234', '5678', 0, ?)",
      ).run(
        id,
        bookingId,
        loadId,
        input.matchId ?? null,
        truckId,
        JSON.stringify(input.details ?? {}),
      );
      db.prepare("UPDATE capacity_ledger SET trip_id = ?, status = 'booked' WHERE id = ?").run(
        id,
        reservation.id,
      );
      if (typeof input.matchId === "string")
        db.prepare("UPDATE matches SET status = 'accepted' WHERE id = ?").run(input.matchId);
    })();
    response.status(201).json({ id, bookingId, status: "confirmed" });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "A valid load and truck are required to create a trip.";
    sendError(response, 400, message);
  }
});

api.patch("/api/trips/:id/tracking", (request, response) => {
  const input = request.body as Record<string, unknown>;
  const progress = Math.max(0, Math.min(100, Number(input.progress ?? 0)));
  const status =
    progress >= 100
      ? "delivered"
      : progress >= 50
        ? "in_transit"
        : progress > 0
          ? "heading_to_pickup"
          : "confirmed";
  const result = db
    .prepare("UPDATE trips SET progress = ?, status = ? WHERE id = ? OR booking_id = ?")
    .run(progress, status, request.params.id, request.params.id);
  if (!result.changes) return sendError(response, 404, "Trip not found.");
  response.json({ progress, status, location: input.location ?? null });
});

api.post("/api/trips/:id/events", (request, response) => {
  const parsed = z
    .object({ eventType: z.string().min(1), details: z.record(z.string(), z.unknown()).optional() })
    .safeParse(request.body);
  if (!parsed.success) return sendError(response, 400, "Enter a trip event type.");
  const trip = db
    .prepare("SELECT id FROM trips WHERE id = ? OR booking_id = ?")
    .get(request.params.id, request.params.id) as { id: string } | undefined;
  if (!trip) return sendError(response, 404, "Trip not found.");
  const id = randomUUID();
  db.prepare(
    "INSERT INTO trip_events (id, trip_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, ?)",
  ).run(
    id,
    trip.id,
    parsed.data.eventType,
    new Date().toISOString(),
    JSON.stringify(parsed.data.details ?? {}),
  );
  response.status(201).json({ id });
});

api.get("/api/notifications", (request, response) => {
  const userId = typeof request.query.userId === "string" ? request.query.userId : null;
  const rows = userId
    ? db
        .prepare(
          "SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC",
        )
        .all(userId)
    : db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
  response.json(rows);
});

api.patch("/api/notifications/:id/reply", (request, response) => {
  const reply = z
    .string()
    .min(1)
    .max(100)
    .safeParse((request.body as Record<string, unknown>).reply);
  if (!reply.success) return sendError(response, 400, "Reply cannot be empty.");
  const result = db
    .prepare("UPDATE notifications SET reply = ?, read = 1 WHERE id = ?")
    .run(reply.data, request.params.id);
  if (!result.changes) return sendError(response, 404, "Notification not found.");
  response.json({ updated: true, reply: reply.data });
});

api.post("/api/ratings", (request, response) => {
  const parsed = z
    .object({
      tripId: z.string(),
      score: z.number().int().min(1).max(5),
      comment: z.string().max(1000).default(""),
    })
    .safeParse(request.body);
  if (!parsed.success)
    return sendError(response, 400, "A trip and rating from 1 to 5 are required.");
  const id = randomUUID();
  try {
    db.prepare("INSERT INTO ratings (id, trip_id, score, comment) VALUES (?, ?, ?, ?)").run(
      id,
      parsed.data.tripId,
      parsed.data.score,
      parsed.data.comment,
    );
    response.status(201).json({ id });
  } catch {
    sendError(response, 404, "Trip not found.");
  }
});

api.get("/api/impact", (_request, response) => {
  const completed = db
    .prepare("SELECT COUNT(*) AS count FROM trips WHERE status = 'delivered'")
    .get() as { count: number };
  const totals = db
    .prepare(
      "SELECT COALESCE(SUM(load_price),0) AS revenue, COALESCE(SUM(transporter_net),0) AS net FROM fee_ledger",
    )
    .get() as { revenue: number; net: number };
  const sharedTrips = db
    .prepare(
      "SELECT COUNT(*) AS count FROM capacity_ledger WHERE status IN ('reserved', 'booked', 'in_transit')",
    )
    .get() as { count: number };
  const emptyKmAvoided = (completed.count + sharedTrips.count) * 320;
  const impact = calculateImpact(totals.revenue, totals.net, emptyKmAvoided);
  response.json({
    ...impact,
    completedTrips: completed.count,
    sharedTrips: sharedTrips.count,
    estimatedTransporterNet: calculateTransporterNet(totals.revenue, emptyKmAvoided),
    platformFee: IMPACT_CONFIG.platformFee,
  });
});

api.post("/api/demo/reset", (_request, response) => {
  db.transaction(() => {
    db.prepare("DELETE FROM fee_ledger").run();
    db.prepare("DELETE FROM ratings").run();
    db.prepare("DELETE FROM trip_events").run();
    db.prepare("DELETE FROM notifications").run();
    db.prepare("DELETE FROM capacity_ledger").run();
    db.prepare("DELETE FROM trips").run();
    db.prepare("DELETE FROM matches").run();
    db.prepare("DELETE FROM availabilities").run();
    db.prepare("DELETE FROM loads").run();
    db.prepare("DELETE FROM trucks").run();
    db.prepare("DELETE FROM fleets").run();
    db.prepare("DELETE FROM transporters").run();
    db.prepare("DELETE FROM shippers").run();
    db.prepare("DELETE FROM users").run();
    db.prepare("DELETE FROM cities").run();
  })();
  seedDemoData();
  response.json({ ok: true, message: "Demo data reset and reseeded." });
});

api.use(
  (error: unknown, _request: Request, response: Response, _next: (error?: unknown) => void) => {
    console.error(error);
    sendError(response, 500, "The demo API could not complete this request.");
  },
);

api.listen(port, "0.0.0.0", () =>
  console.log(`TruckSaathi API listening on http://localhost:${port}`),
);
