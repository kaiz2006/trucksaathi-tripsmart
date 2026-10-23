import { describe, expect, it } from "vitest";

import {
  calculateImpact,
  calculateLoadPrice,
  calculateTransporterNet,
  estimateTripHours,
  matchAvailabilityToLoads,
  matchLoadToTrucks,
  type MatchLoad,
  type TruckAvailability,
} from "@/lib/matching";

const load: MatchLoad = {
  id: "load-ludhiana-delhi",
  pickup: "Ludhiana",
  pickupCoordinates: { lat: 30.9, lon: 75.8573 },
  dropoff: "Delhi",
  dropoffCoordinates: { lat: 28.6139, lon: 77.209 },
  pickupStart: "2026-10-12T08:00:00Z",
  pickupEnd: "2026-10-12T14:00:00Z",
  weightKg: 8000,
  cargoType: "General Cargo",
  refrigeratedRequired: false,
  returnLegKm: 300,
};

const availability: TruckAvailability = {
  id: "truck-returning",
  truckType: "Multi-axle",
  currentCity: "Delhi",
  currentCoordinates: { lat: 28.6139, lon: 77.209 },
  headingTo: "Delhi",
  headingCoordinates: { lat: 30.9, lon: 75.8573 },
  returningFrom: "Delhi",
  returningCoordinates: { lat: 28.6139, lon: 77.209 },
  availableFrom: "2026-10-12T00:00:00Z",
  availableUntil: "2026-10-14T00:00:00Z",
  radiusKm: 400,
  preferredDestinations: ["Ludhiana"],
  avoidedDestinations: [],
  freeCapacityKg: 9000,
  refrigerated: false,
  minimumRatePerKm: 25,
  sharedLoadsAccepted: true,
  rating: 4.8,
  capacityKg: 14000,
};

describe("TruckSaathi matching", () => {
  it("matches a truck on a return journey and explains the route fit", () => {
    const matches = matchLoadToTrucks(load, [availability]);
    expect(matches).toHaveLength(1);
    expect(matches[0].explanation).toContain("returning toward Delhi");
    expect(matches[0].score).toBeGreaterThan(60);
  });

  it("excludes trucks outside availability, range, capacity, avoid list, or reefer requirements", () => {
    const unsuitable = [
      { ...availability, id: "date", availableUntil: "2026-10-11T00:00:00Z" },
      { ...availability, id: "range", radiusKm: 5 },
      { ...availability, id: "space", freeCapacityKg: 2000 },
      { ...availability, id: "avoid", avoidedDestinations: ["Delhi"] },
    ];
    expect(matchLoadToTrucks(load, unsuitable)).toHaveLength(0);
    expect(
      matchLoadToTrucks(
        { ...load, refrigeratedRequired: true, temperatureRange: { minC: 2, maxC: 8 } },
        [availability],
      ),
    ).toHaveLength(0);
  });

  it("supports reverse matching from availability to loads", () => {
    expect(matchAvailabilityToLoads(availability, [load])).toEqual([load]);
    expect(
      matchAvailabilityToLoads({ ...availability, avoidedDestinations: ["Delhi"] }, [load]),
    ).toHaveLength(0);
  });

  it("prices shared/return loads with capacity share and reefer premium", () => {
    const dry = calculateLoadPrice(load, availability);
    const reefer = calculateLoadPrice(
      { ...load, refrigeratedRequired: true },
      {
        ...availability,
        truckType: "Refrigerated",
        refrigerated: true,
        supportedTemperature: { minC: 2, maxC: 8 },
      },
    );
    expect(dry.price).toBeLessThan(dry.dedicatedPrice);
    expect(reefer.dedicatedPrice).toBeGreaterThan(dry.dedicatedPrice);
  });

  it("calculates fee-adjusted earnings and shipper impact", () => {
    expect(calculateTransporterNet(14000, 300)).toBe(7100);
    expect(calculateImpact(30000, 24000, 320)).toEqual({
      moneySaved: 6000,
      emptyKmAvoided: 320,
      carbonReducedKg: 262,
    });
  });

  it("adds a rest period when driving exceeds the daily limit", () => {
    expect(estimateTripHours(45 * 9)).toBe(9);
    expect(estimateTripHours(45 * 10)).toBe(21);
  });
});
