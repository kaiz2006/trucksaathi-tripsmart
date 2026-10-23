export const IMPACT_CONFIG = {
  // TODO: Replace illustrative fuel and emissions assumptions with sourced figures.
  platformFee: 1500,
  emptyTruckCo2KgPerKm: 0.82,
  marginalFuelCostPerKm: 18,
  sharedOrReturnDiscount: 0.25,
  reeferPremium: 0.25,
  averageSpeedKmh: 45,
  maximumDrivingHoursPerDay: 9,
  roadDistanceFactor: 1.25,
} as const;

export type Coordinates = { lat: number; lon: number };
export type TemperatureRange = { minC: number; maxC: number };
export type MatchLoad = {
  id: string;
  pickup: string;
  pickupCoordinates: Coordinates;
  dropoff: string;
  dropoffCoordinates: Coordinates;
  pickupStart: string;
  pickupEnd: string;
  weightKg: number;
  cargoType: string;
  refrigeratedRequired: boolean;
  temperatureRange?: TemperatureRange;
  sharedLoad?: boolean;
  preferredArrival?: string;
  returnLegKm?: number;
};
export type TruckAvailability = {
  id: string;
  truckType: string;
  truckRegistration?: string;
  driverName?: string;
  currentCity: string;
  currentCoordinates: Coordinates;
  headingTo?: string;
  headingCoordinates?: Coordinates;
  returningFrom?: string;
  returningCoordinates?: Coordinates;
  availableFrom: string;
  availableUntil: string;
  radiusKm: number;
  preferredDestinations: string[];
  avoidedDestinations: string[];
  freeCapacityKg: number;
  refrigerated: boolean;
  supportedTemperature?: TemperatureRange;
  minimumRatePerKm: number;
  sharedLoadsAccepted: boolean;
  rating: number;
  capacityKg: number;
};
export type RankedMatch = {
  availability: TruckAvailability;
  score: number;
  price: number;
  dedicatedPrice: number;
  detourKm: number;
  estimatedTravelHours: number;
  explanation: string;
};

const BASE_RATE_PER_KM: Record<string, number> = {
  "Mini truck": 22,
  LCV: 28,
  Container: 38,
  "Open body": 32,
  "Multi-axle": 42,
  Refrigerated: 48,
};

export function haversineKm(
  from: Coordinates,
  to: Coordinates,
  roadFactor = IMPACT_CONFIG.roadDistanceFactor,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lon - from.lon);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * roadFactor;
}

function overlaps(fromA: string, toA: string, fromB: string, toB: string): boolean {
  return (
    new Date(fromA).getTime() <= new Date(toB).getTime() &&
    new Date(fromB).getTime() <= new Date(toA).getTime()
  );
}

function temperatureFits(load: MatchLoad, truck: TruckAvailability): boolean {
  if (!load.refrigeratedRequired) return true;
  if (!truck.refrigerated || !load.temperatureRange) return truck.refrigerated;
  return Boolean(
    truck.supportedTemperature &&
    truck.supportedTemperature.minC <= load.temperatureRange.minC &&
    truck.supportedTemperature.maxC >= load.temperatureRange.maxC,
  );
}

function routeDetourKm(load: MatchLoad, truck: TruckAvailability): number {
  if (!truck.headingCoordinates || !truck.returningCoordinates) return 0;
  const existingJourney = haversineKm(truck.headingCoordinates, truck.returningCoordinates);
  const viaLoad =
    haversineKm(truck.headingCoordinates, load.pickupCoordinates) +
    haversineKm(load.pickupCoordinates, load.dropoffCoordinates) +
    haversineKm(load.dropoffCoordinates, truck.returningCoordinates);
  return Math.max(0, viaLoad - existingJourney);
}

function routeExplanation(load: MatchLoad, truck: TruckAvailability, detourKm: number): string {
  if (truck.returningFrom?.toLowerCase() === load.dropoff.toLowerCase())
    return `This truck is already returning toward ${load.dropoff} with available space.`;
  if (truck.headingTo?.toLowerCase() === load.dropoff.toLowerCase())
    return `This truck is already heading to ${load.dropoff}; your load adds about ${Math.round(detourKm)} km.`;
  if (detourKm <= 80)
    return `Your load fits along this truck's planned journey with a short detour.`;
  return `The pickup is within the truck's operating range and fits its available dates.`;
}

export function calculateLoadPrice(
  load: MatchLoad,
  truck: TruckAvailability,
): { price: number; dedicatedPrice: number; distanceKm: number } {
  const distanceKm = haversineKm(load.pickupCoordinates, load.dropoffCoordinates);
  const baseRate = BASE_RATE_PER_KM[truck.truckType] ?? truck.minimumRatePerKm;
  const capacityShare = Math.min(1, load.weightKg / Math.max(1, truck.capacityKg));
  const priceFitRate = Math.max(baseRate, truck.minimumRatePerKm);
  const temperatureMultiplier = load.refrigeratedRequired ? 1 + IMPACT_CONFIG.reeferPremium : 1;
  const dedicatedPrice = Math.round(
    distanceKm * priceFitRate * Math.max(0.35, capacityShare) * temperatureMultiplier,
  );
  const journeyDiscount =
    load.sharedLoad || truck.sharedLoadsAccepted || Boolean(load.returnLegKm)
      ? 1 - IMPACT_CONFIG.sharedOrReturnDiscount
      : 1;
  return { price: Math.round(dedicatedPrice * journeyDiscount), dedicatedPrice, distanceKm };
}

export function estimateTripHours(distanceKm: number): number {
  const drivingHours = Math.max(0, distanceKm) / IMPACT_CONFIG.averageSpeedKmh;
  const drivingDays = Math.max(
    1,
    Math.ceil(drivingHours / IMPACT_CONFIG.maximumDrivingHoursPerDay),
  );
  return drivingHours + (drivingDays - 1) * 11;
}

export function matchLoadToTrucks(
  load: MatchLoad,
  availabilities: TruckAvailability[],
  limit = 3,
): RankedMatch[] {
  const matching = availabilities.flatMap((availability) => {
    if (
      !overlaps(
        load.pickupStart,
        load.pickupEnd,
        availability.availableFrom,
        availability.availableUntil,
      )
    )
      return [];
    if (
      haversineKm(load.pickupCoordinates, availability.currentCoordinates) > availability.radiusKm
    )
      return [];
    if (
      availability.avoidedDestinations.some(
        (city) => city.toLowerCase() === load.dropoff.toLowerCase(),
      )
    )
      return [];
    if (availability.freeCapacityKg < load.weightKg || !temperatureFits(load, availability))
      return [];
    if (load.sharedLoad && !availability.sharedLoadsAccepted) return [];

    const detourKm = routeDetourKm(load, availability);
    const price = calculateLoadPrice(load, availability);
    const travelHours = estimateTripHours(price.distanceKm);
    const lowDetourScore = Math.max(0, 1 - detourKm / Math.max(price.distanceKm, 1));
    const dateSpan =
      Math.abs(
        new Date(availability.availableFrom).getTime() - new Date(load.pickupStart).getTime(),
      ) / 86_400_000;
    const timeScore = Math.max(0, 1 - dateSpan / 14);
    const priceScore = Math.min(1, Math.max(0, price.price / Math.max(price.dedicatedPrice, 1)));
    const ratingScore = availability.rating / 5;
    const score = Math.round(
      (lowDetourScore * 0.35 + timeScore * 0.2 + priceScore * 0.25 + ratingScore * 0.2) * 100,
    );
    return [
      {
        availability,
        score,
        price: price.price,
        dedicatedPrice: price.dedicatedPrice,
        detourKm,
        estimatedTravelHours: travelHours,
        explanation: routeExplanation(load, availability, detourKm),
      },
    ];
  });
  return matching.sort((left, right) => right.score - left.score).slice(0, limit);
}

export function matchAvailabilityToLoads(
  availability: TruckAvailability,
  loads: MatchLoad[],
  limit = 20,
): MatchLoad[] {
  return loads
    .flatMap((load) => {
      if (
        !overlaps(
          load.pickupStart,
          load.pickupEnd,
          availability.availableFrom,
          availability.availableUntil,
        )
      )
        return [];
      if (
        haversineKm(load.pickupCoordinates, availability.currentCoordinates) > availability.radiusKm
      )
        return [];
      if (
        availability.avoidedDestinations.some(
          (city) => city.toLowerCase() === load.dropoff.toLowerCase(),
        )
      )
        return [];
      if (availability.freeCapacityKg < load.weightKg || !temperatureFits(load, availability))
        return [];
      if (load.sharedLoad && !availability.sharedLoadsAccepted) return [];
      return [load];
    })
    .sort((left, right) => {
      const leftDistance = haversineKm(availability.currentCoordinates, left.pickupCoordinates);
      const rightDistance = haversineKm(availability.currentCoordinates, right.pickupCoordinates);
      return leftDistance - rightDistance;
    })
    .slice(0, limit);
}

export function calculateTransporterNet(loadPrice: number, routeKm: number): number {
  return Math.round(
    loadPrice - IMPACT_CONFIG.platformFee - routeKm * IMPACT_CONFIG.marginalFuelCostPerKm,
  );
}

export function calculateImpact(
  dedicatedPrice: number,
  matchedPrice: number,
  emptyKmAvoided: number,
) {
  return {
    moneySaved: Math.max(0, dedicatedPrice - matchedPrice),
    emptyKmAvoided: Math.max(0, emptyKmAvoided),
    carbonReducedKg: Math.round(Math.max(0, emptyKmAvoided) * IMPACT_CONFIG.emptyTruckCo2KgPerKm),
  };
}
