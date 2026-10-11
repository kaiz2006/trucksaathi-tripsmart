import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import { db } from "./database";
import { northCities } from "../data/shipper-demo";
import { demoFleet } from "../data/transporter-demo";

const companyNames = ["Sharma Foods & Exports", "Punjab Agro Traders", "Northstar Pharma", "Fresh Basket Co.", "Mahalaxmi Textiles"];
const transporterNames = ["Manpreet Singh", "Gurpreet Kaur", "Sukhdev Kumar", "Jasmeet Gill", "Amandeep Gill", "Ramesh Yadav", "Baldev Sharma", "Iqbal Khan", "Harpreet Brar", "Rajesh Kumar"];
const cargoKinds = ["General Cargo", "Temperature Sensitive Cargo", "Fragile & High-Value", "Heavy & Oversized", "Bulk Material", "Furniture & Household"];

export function seedDemoData() {
  const existing = db.prepare("SELECT COUNT(*) AS total FROM users").get() as { total: number };
  if (existing.total > 0) return;

  const insertCity = db.prepare("INSERT OR IGNORE INTO cities (id, name, latitude, longitude) VALUES (?, ?, ?, ?)");
  const insertUser = db.prepare("INSERT INTO users (id, phone, role, language, verified) VALUES (?, ?, ?, 'en', 1)");
  const insertShipper = db.prepare("INSERT INTO shippers (id, user_id, company_name, city, rating, verified) VALUES (?, ?, ?, ?, ?, 1)");
  const insertTransporter = db.prepare("INSERT INTO transporters (id, user_id, owner_name, current_city, rating, verified, fleet_owner) VALUES (?, ?, ?, ?, ?, 1, ?)");
  const insertFleet = db.prepare("INSERT INTO fleets (id, transporter_id, name) VALUES (?, ?, ?)");
  const insertTruck = db.prepare("INSERT INTO trucks (id, transporter_id, fleet_id, registration, vehicle_type, capacity_kg, reefer, min_temp_c, max_temp_c, driver_name, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertLoad = db.prepare("INSERT INTO loads (id, booking_id, shipper_id, cargo_type, description, weight_kg, pickup_city, dropoff_city, pickup_start, pickup_end, refrigerated_required, temperature_json, status, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertAvailability = db.prepare("INSERT INTO availabilities (id, transporter_id, truck_id, available_from, available_until, radius_km, free_capacity_kg, refrigerated, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertCapacityLedger = db.prepare("INSERT INTO capacity_ledger (id, truck_id, load_id, trip_id, booked_kg, reserved_kg, status, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertTrip = db.prepare("INSERT INTO trips (id, booking_id, load_id, match_id, truck_id, status, pickup_otp, delivery_otp, progress, details_json) VALUES (?, ?, ?, ?, ?, ?, '1234', '5678', ?, ?)");
  const insertEvent = db.prepare("INSERT INTO trip_events (id, trip_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, '{}')");
  const insertRating = db.prepare("INSERT INTO ratings (id, trip_id, author_id, target_id, score, comment) VALUES (?, ?, ?, ?, ?, ?)");
  const insertNotification = db.prepare("INSERT INTO notifications (id, user_id, title, message, channel, read) VALUES (?, ?, ?, ?, 'mock-whatsapp', ?)");
  const insertLedger = db.prepare("INSERT INTO fee_ledger (id, match_id, trip_id, load_price, platform_fee, marginal_fuel_cost, transporter_net) VALUES (?, ?, ?, ?, 1500, ?, ?)");

  const seed = db.transaction(() => {
    northCities.forEach((city, index) => insertCity.run(index + 1, city.name, city.lat, city.lon));
    for (let index = 0; index < companyNames.length; index += 1) {
      const userId = `shipper-user-${index + 1}`;
      const shipperId = `shipper-${index + 1}`;
      insertUser.run(userId, `98765000${String(index + 10).slice(-2)}`, "shipper");
      insertShipper.run(shipperId, userId, companyNames[index], northCities[index].name, 4.5 + (index % 5) / 10);
    }
    for (let index = 0; index < transporterNames.length; index += 1) {
      const userId = `transporter-user-${index + 1}`;
      const transporterId = `transporter-${index + 1}`;
      const fleetOwner = index >= 5 ? 1 : 0;
      insertUser.run(userId, `98765100${String(index + 10).slice(-2)}`, "transporter");
      insertTransporter.run(transporterId, userId, transporterNames[index], northCities[(index * 3) % northCities.length].name, 4.5 + (index % 5) / 10, fleetOwner);
      if (fleetOwner) insertFleet.run(`fleet-${index - 4}`, transporterId, `${transporterNames[index].split(" ")[0]} Transport`);
    }
    const truckRows = [...demoFleet];
    for (let index = 0; index < 8; index += 1) {
      truckRows.push({ id: `truck-seed-${index + 6}`, registration: `PB 10 ${String.fromCharCode(65 + index)}${String.fromCharCode(75 + index)} ${4100 + index}`, type: index % 3 === 0 ? "Refrigerated" : "Multi-axle", capacity: 9 + (index % 4) * 3, reefer: index % 3 === 0, driver: transporterNames[index + 2] });
    }
    for (let index = 0; index < truckRows.length; index += 1) {
      const truck = truckRows[index];
      const transporterIndex = index % transporterNames.length;
      const fleetId = transporterIndex >= 5 ? `fleet-${transporterIndex - 4}` : null;
      const vehicleType = truck.type === "Open body" ? "Open body" : truck.type;
      insertTruck.run(truck.id, `transporter-${transporterIndex + 1}`, fleetId, truck.registration, vehicleType, truck.capacity * 1000, Number(truck.reefer), truck.reefer ? -25 : null, truck.reefer ? 15 : null, truck.driver, JSON.stringify({ currentCity: northCities[(index * 2) % northCities.length].name }));
      const current = northCities[(index * 2) % northCities.length];
      const partialCapacity = Math.max(3500, Math.round((truck.capacity * 1000) * (index % 3 === 0 ? 0.6 : 0.75)));
      insertAvailability.run(`availability-${index + 1}`, `transporter-${transporterIndex + 1}`, truck.id, "2026-10-11T00:00:00.000Z", "2026-11-30T23:59:00.000Z", 450, partialCapacity, Number(truck.reefer), JSON.stringify({ currentCity: current.name, headingTo: index === 0 ? "Ludhiana" : "Delhi", returningFrom: index === 0 ? "Delhi" : "Ludhiana", preferredDestinations: ["Delhi", "Ludhiana"], avoidedDestinations: [], minimumRatePerKm: 24, sharedLoadsAccepted: true, rating: 4.7 }));
      if (index % 4 === 0) insertCapacityLedger.run(`capacity-ledger-${index + 1}`, truck.id, null, null, partialCapacity * 0.35, partialCapacity * 0.35, "reserved", JSON.stringify({ partialBooking: true, note: "Demo shared return leg" }));
    }
    for (let index = 0; index < 40; index += 1) {
      const pickupIndex = (index * 3) % northCities.length;
      let dropIndex = (index * 7 + 1) % northCities.length;
      if (dropIndex === pickupIndex) dropIndex = (dropIndex + 1) % northCities.length;
      const cargoType = cargoKinds[index % cargoKinds.length];
      const date = new Date(Date.UTC(2026, 9, 12 + (index % 24), 8 + (index % 6), 0)).toISOString();
      const end = new Date(Date.parse(date) + 6 * 60 * 60 * 1000).toISOString();
      const loadId = `load-${String(index + 1).padStart(3, "0")}`;
      const bookingId = index < 8 ? `TS-${String(1842 - index).padStart(4, "0")}` : null;
      insertLoad.run(loadId, bookingId, `shipper-${(index % companyNames.length) + 1}`, cargoType, `${cargoType} shipment ${index + 1}`, 1500 + (index % 9) * 1000, northCities[pickupIndex].name, northCities[dropIndex].name, date, end, Number(cargoType === "Temperature Sensitive Cargo"), cargoType === "Temperature Sensitive Cargo" ? JSON.stringify({ minC: 2, maxC: 8 }) : null, index < 8 ? "booked" : "open", JSON.stringify({ sharedLoad: index % 2 === 0, returnLegKm: 180 + (index % 5) * 40 }));
      if (index < 10) {
        const truck = truckRows[index % truckRows.length];
        const tripId = `trip-${String(index + 1).padStart(3, "0")}`;
        const status = index < 3 ? "in_transit" : "delivered";
        insertTrip.run(tripId, bookingId ?? `TS-${String(1700 + index)}`, loadId, null, truck.id, status, 0, JSON.stringify({ pickup: northCities[pickupIndex].name, dropoff: northCities[dropIndex].name, progress: index < 3 ? 42 : 100 }));
        for (const [eventIndex, event] of ["confirmed", "loaded", status].entries()) insertEvent.run(`event-${index}-${eventIndex}`, tripId, event, new Date(Date.UTC(2026, 9, 11 + eventIndex, 8 + eventIndex)).toISOString());
        if (index >= 3) {
          insertRating.run(`rating-${index}`, tripId, `shipper-user-${(index % companyNames.length) + 1}`, `transporter-user-${(index % transporterNames.length) + 1}`, 4 + (index % 2), "Reliable driver and smooth delivery.");
          insertLedger.run(`ledger-${index}`, null, tripId, 18500 + index * 100, 5400, 11600 + index * 100);
        }
      }
    }
    for (let index = 0; index < 4; index += 1) insertNotification.run(`notification-${index + 1}`, `transporter-user-${(index % 5) + 1}`, ["Truck found for your load", "Return load available: Delhi → Ludhiana, 8 t, ₹14,000. Reply YES to accept", "Shipment delivered", "A reefer truck is available"][index], "Your TruckSaathi journey has a new update.", Number(index < 2));
  });
  seed();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  seedDemoData();
  console.log("TruckSaathi demo database seeded.");
  db.close();
}