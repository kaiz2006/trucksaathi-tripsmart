import { Fragment, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  Snowflake,
  Truck,
} from "lucide-react";

import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { CityPickerMap } from "@/components/trucksaathi/city-picker-map";
import {
  northCities,
  roadDistanceKm,
  shipperCopy,
  shipperMatchCopy,
  type CargoType,
} from "@/data/shipper-demo";
import { apiPatch, apiPost } from "@/lib/api-client";

type Draft = {
  loadType: CargoType;
  preset: "Small" | "Medium" | "Large" | "Full truck";
  weight: string;
  description: string;
  dimensions: { length: string; width: string; height: string };
  temperature: string;
  tempMin: number;
  tempMax: number;
  cargoKind: string;
  insured: boolean;
  permit: string;
  bulkMode: string;
  loadingHelp: boolean;
  pickup: string;
  dropoff: string;
  pickupDate: string;
  deliveryDate: string;
  urgency: "Flexible" | "Urgent";
  bookingId: string;
  loadRecordId: string;
  selectedTruckId: string;
  selectedMatchId: string;
  matches: MatchOption[];
  tripId: string;
};

type MatchOption = {
  matchId: string;
  truckId: string;
  truckType: string;
  truckRegistration: string;
  driverName: string;
  capacityKg: number;
  rating: number;
  refrigerated: boolean;
  price: number;
  dedicatedPrice: number;
  explanation: string;
};

const initialDraft: Draft = {
  loadType: "General Cargo",
  preset: "Medium",
  weight: "1200",
  description: "Packaged goods",
  dimensions: { length: "", width: "", height: "" },
  temperature: "Chilled",
  tempMin: 2,
  tempMax: 8,
  cargoKind: "Dairy",
  insured: false,
  permit: "",
  bulkMode: "Loose",
  loadingHelp: false,
  pickup: "Ludhiana",
  dropoff: "Delhi",
  pickupDate: "",
  deliveryDate: "",
  urgency: "Flexible",
  bookingId: "",
  loadRecordId: "",
  selectedTruckId: "",
  selectedMatchId: "",
  matches: [],
  tripId: "",
};

export const Route = createFileRoute("/app/shipper/new/$step")({
  validateSearch: (search: Record<string, unknown>) => ({
    loadType: typeof search.loadType === "string" ? search.loadType : "General Cargo",
  }),
  component: ShipperJourney,
});

const stepOrder = ["size", "route", "schedule", "review", "matches", "confirmed"] as const;
type JourneyStep = (typeof stepOrder)[number];
const presets = ["Small", "Medium", "Large", "Full truck"] as const;
const presetWeights: Record<(typeof presets)[number], number> = {
  Small: 350,
  Medium: 1200,
  Large: 5000,
  "Full truck": 10000,
};

function ShipperJourney() {
  const navigate = useNavigate();
  const { step } = Route.useParams();
  const { loadType } = Route.useSearch();
  const { language } = useAppLanguage();
  const t = shipperCopy[language];
  const matchCopy = shipperMatchCopy[language];
  const stepIndex = stepOrder.indexOf(step as JourneyStep);
  const currentStep: JourneyStep = stepIndex < 0 ? "size" : stepOrder[stepIndex];
  const initial = useMemo(() => ({ ...initialDraft, loadType: loadType as CargoType }), [loadType]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [activeCityField, setActiveCityField] = useState<"pickup" | "dropoff">("pickup");

  useEffect(() => {
    const saved = sessionStorage.getItem("trucksaathi.shipper.draft");
    if (saved) {
      try {
        setDraft({ ...initial, ...(JSON.parse(saved) as Partial<Draft>) });
      } catch {
        sessionStorage.removeItem("trucksaathi.shipper.draft");
      }
    }
    setLoaded(true);
  }, [initial]);

  const distance = useMemo(
    () => roadDistanceKm(draft.pickup, draft.dropoff),
    [draft.pickup, draft.dropoff],
  );
  const baseRates: Record<(typeof presets)[number], number> = {
    Small: 28,
    Medium: 34,
    Large: 42,
    "Full truck": 49,
  };
  const isTemperatureSensitive = draft.loadType === "Temperature Sensitive Cargo";
  const rate =
    (baseRates[draft.preset] ?? 34) *
    (isTemperatureSensitive ? 1.25 : 1) *
    (draft.urgency === "Flexible" ? 0.78 : 1);
  const matchedPrice = Math.round((distance * rate + 1500) / 500) * 500;
  const dedicatedPrice =
    Math.round(
      (distance * (baseRates[draft.preset] ?? 34) * (isTemperatureSensitive ? 1.25 : 1) + 1500) /
        500,
    ) * 500;
  const saved = Math.max(0, dedicatedPrice - matchedPrice);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (loaded) sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(next));
      return next;
    });
  }

  function updateDimension(key: keyof Draft["dimensions"], value: string) {
    const next = { ...draft, dimensions: { ...draft.dimensions, [key]: value } };
    setDraft(next);
    sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(next));
  }

  function selectMatch(match: MatchOption) {
    const next = { ...draft, selectedTruckId: match.truckId, selectedMatchId: match.matchId };
    setDraft(next);
    sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(next));
  }

  async function moveTo(nextStep: JourneyStep) {
    setError("");
    if (currentStep === "size" && !draft.description.trim()) {
      setError(t.descriptionError);
      return;
    }
    if (
      currentStep === "size" &&
      Object.values(draft.dimensions).some((dimension) => !dimension || Number(dimension) <= 0)
    ) {
      setError(t.dimensionsError);
      return;
    }
    if (
      currentStep === "route" &&
      (!draft.pickup || !draft.dropoff || draft.pickup === draft.dropoff)
    ) {
      setError(t.routeError);
      return;
    }
    if (
      currentStep === "schedule" &&
      (!draft.pickupDate || !draft.deliveryDate || draft.deliveryDate < draft.pickupDate)
    ) {
      setError(t.dateError);
      return;
    }
    if (currentStep === "review") {
      const pickupCity = northCities.find((city) => city.name === draft.pickup);
      const dropoffCity = northCities.find((city) => city.name === draft.dropoff);
      if (!pickupCity || !dropoffCity) {
        setError(t.routeError);
        return;
      }
      try {
        const created = await apiPost<{ id: string; bookingId: string }>("/loads", {
          cargoType: draft.loadType,
          description: draft.description,
          weightKg: Number(draft.weight),
          pickupCity: draft.pickup,
          dropoffCity: draft.dropoff,
          pickupStart: new Date(draft.pickupDate).toISOString(),
          pickupEnd: new Date(draft.pickupDate).toISOString(),
          refrigeratedRequired: isTemperatureSensitive,
          temperatureRange: isTemperatureSensitive
            ? draft.temperature === "Custom"
              ? { minC: draft.tempMin, maxC: draft.tempMax }
              : {
                  minC: draft.temperature === "Frozen" ? -25 : draft.temperature === "Cool" ? 8 : 2,
                  maxC:
                    draft.temperature === "Frozen" ? -18 : draft.temperature === "Cool" ? 15 : 8,
                }
            : undefined,
          details: {
            sharedLoad: draft.urgency === "Flexible" || Number(draft.weight) < 8000,
            dimensions: draft.dimensions,
            urgency: draft.urgency,
            returnLegKm: distance,
            insured: draft.insured,
            permit: draft.permit,
            bulkMode: draft.bulkMode,
            loadingHelp: draft.loadingHelp,
          },
        });
        const matches = await apiPost<
          {
            matchId: string;
            price: number;
            dedicatedPrice: number;
            explanation: string;
            availability: {
              truckId: string;
              truckType: string;
              truckRegistration: string;
              driverName: string;
              capacityKg: number;
              rating: number;
              refrigerated: boolean;
            };
          }[]
        >("/matches/load", {
          id: created.id,
          pickup: draft.pickup,
          pickupCoordinates: { lat: pickupCity.lat, lon: pickupCity.lon },
          dropoff: draft.dropoff,
          dropoffCoordinates: { lat: dropoffCity.lat, lon: dropoffCity.lon },
          pickupStart: new Date(draft.pickupDate).toISOString(),
          pickupEnd: new Date(draft.pickupDate).toISOString(),
          weightKg: Number(draft.weight),
          cargoType: draft.loadType,
          refrigeratedRequired: isTemperatureSensitive,
          temperatureRange: isTemperatureSensitive
            ? draft.temperature === "Custom"
              ? { minC: draft.tempMin, maxC: draft.tempMax }
              : {
                  minC: draft.temperature === "Frozen" ? -25 : draft.temperature === "Cool" ? 8 : 2,
                  maxC:
                    draft.temperature === "Frozen" ? -18 : draft.temperature === "Cool" ? 15 : 8,
                }
            : undefined,
          sharedLoad: draft.urgency === "Flexible" || Number(draft.weight) < 8000,
          returnLegKm: distance,
        });
        const matchOptions: MatchOption[] = matches.map((match) => ({
          matchId: match.matchId,
          truckId: match.availability.truckId,
          truckType: match.availability.truckType,
          truckRegistration: match.availability.truckRegistration,
          driverName: match.availability.driverName,
          capacityKg: match.availability.capacityKg,
          rating: match.availability.rating,
          refrigerated: match.availability.refrigerated,
          price: match.price,
          dedicatedPrice: match.dedicatedPrice,
          explanation: match.explanation,
        }));
        const nextDraft = {
          ...draft,
          bookingId: created.bookingId,
          loadRecordId: created.id,
          selectedTruckId: matchOptions[0]?.truckId ?? "",
          selectedMatchId: matchOptions[0]?.matchId ?? "",
          matches: matchOptions,
        };
        setDraft(nextDraft);
        sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(nextDraft));
      } catch {
        setError(
          language === "en"
            ? "We could not reach the matching service. Check that the API is running and try again."
            : "मिलान सेवा उपलब्ध नहीं है। API चल रही है या नहीं जाँचें और फिर कोशिश करें।",
        );
        return;
      }
    }
    void navigate({
      to: "/app/shipper/new/$step",
      params: { step: nextStep },
      search: { loadType: draft.loadType },
    });
  }

  async function confirmBooking() {
    if (!draft.loadRecordId) {
      setError(
        language === "en"
          ? "The booking draft is missing. Return to review and try again."
          : "बुकिंग ड्राफ़्ट नहीं मिला। जाँच के लिए वापस जाएँ।",
      );
      return;
    }
    try {
      const trip = await apiPost<{ id: string }>("/trips", {
        loadId: draft.loadRecordId,
        bookingId: draft.bookingId,
        matchId: draft.selectedMatchId || null,
        truckId: draft.selectedTruckId,
        details: { pickup: draft.pickup, dropoff: draft.dropoff, cargoType: draft.loadType },
      });
      await apiPatch(`/loads/${encodeURIComponent(draft.loadRecordId)}`, { status: "booked" });
      const nextDraft = { ...draft, tripId: trip.id };
      setDraft(nextDraft);
      sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(nextDraft));
      void navigate({
        to: "/app/shipper/new/$step",
        params: { step: "confirmed" },
        search: { loadType: draft.loadType },
      });
    } catch {
      setError(
        language === "en"
          ? "Booking could not be confirmed. Please try again."
          : "बुकिंग की पुष्टि नहीं हुई। फिर कोशिश करें।",
      );
    }
  }

  const completionStep = ["size", "route", "schedule", "review"].indexOf(currentStep);
  const progress =
    currentStep === "matches" || currentStep === "confirmed"
      ? 100
      : Math.max(25, (completionStep + 1) * 25);
  const previousStep = stepOrder[Math.max(0, stepIndex - 1)];

  if (!loaded)
    return (
      <main className="ts-app-page">
        <div className="ts-app-frame">
          <div className="ts-loading-bar" role="status" aria-label="Loading shipment draft" />
        </div>
      </main>
    );

  return (
    <main className="ts-app-page" lang={language}>
      <div className="ts-app-frame ts-flow-frame">
        <header className="ts-flow-header">
          {currentStep === "size" ? (
            <Link to="/app/shipper/load-type" className="ts-back-link" aria-label={t.back}>
              <ArrowLeft size={21} />
            </Link>
          ) : (
            <Link
              to="/app/shipper/new/$step"
              params={{ step: previousStep }}
              search={{ loadType: draft.loadType }}
              className="ts-back-link"
              aria-label={t.back}
            >
              <ArrowLeft size={21} />
            </Link>
          )}
          <span className="ts-flow-step">
            {currentStep === "matches"
              ? t.recommended
              : currentStep === "confirmed"
                ? t.confirmed
                : `${t.steps[completionStep] ?? t.steps[0]} · ${completionStep + 1} / 4`}
          </span>
        </header>
        <div className="ts-progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>

        {currentStep === "size" && (
          <>
            <section className="ts-flow-content">
              <span className="ts-login-role">{draft.loadType}</span>
              <h1>{t.sizeTitle}</h1>
              <p className="ts-flow-intro">{t.sizeIntro}</p>
              <fieldset className="ts-preset-grid">
                <legend>{t.weight}</legend>
                {presets.map((preset, index) => (
                  <button
                    type="button"
                    key={preset}
                    className={`ts-preset ${draft.preset === preset ? "is-selected" : ""}`}
                    onClick={() => {
                      update("preset", preset);
                      update("weight", String(presetWeights[preset]));
                    }}
                  >
                    <strong>{[t.small, t.medium, t.large, t.full][index]}</strong>
                    <small>
                      {[t.smallDetail, t.mediumDetail, t.largeDetail, t.fullDetail][index]}
                    </small>
                  </button>
                ))}
              </fieldset>
              <label className="ts-field-label" htmlFor="ts-weight">
                {t.weight} (kg)
              </label>
              <input
                className="ts-field-input"
                id="ts-weight"
                type="number"
                min="1"
                max="50000"
                value={draft.weight}
                onChange={(event) => update("weight", event.target.value)}
              />
              <label className="ts-field-label" htmlFor="ts-description">
                {t.description}
              </label>
              <input
                className="ts-field-input"
                id="ts-description"
                value={draft.description}
                placeholder={t.descriptionPlaceholder}
                maxLength={120}
                onChange={(event) => update("description", event.target.value)}
              />
              <fieldset className="ts-dimensions">
                <legend>{t.dimensions}</legend>
                {(["length", "width", "height"] as const).map((key) => (
                  <label key={key}>
                    {t[key]}
                    <input
                      className="ts-field-input"
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={draft.dimensions[key]}
                      onChange={(event) => updateDimension(key, event.target.value)}
                    />
                  </label>
                ))}
              </fieldset>
              {isTemperatureSensitive && (
                <div className="ts-form-group">
                  <span className="ts-field-label">{t.temperature}</span>
                  <div className="ts-chip-row">
                    {["Frozen", "Chilled", "Cool"].map((value, index) => (
                      <button
                        type="button"
                        key={value}
                        className={`ts-chip ${draft.temperature === value ? "is-selected" : ""}`}
                        onClick={() => update("temperature", value)}
                      >
                        {[t.frozen, t.chilled, t.cool][index]}
                      </button>
                    ))}
                  </div>
                  <label className="ts-field-label" htmlFor="ts-temp-min">
                    {t.customTemp}: {draft.tempMin}°C – {draft.tempMax}°C
                  </label>
                  <input
                    id="ts-temp-min"
                    type="range"
                    min="-25"
                    max={draft.tempMax}
                    value={draft.tempMin}
                    aria-label={`Minimum temperature ${draft.tempMin} degrees Celsius`}
                    onChange={(event) => {
                      const next = {
                        ...draft,
                        temperature: "Custom",
                        tempMin: Number(event.target.value),
                      };
                      setDraft(next);
                      sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(next));
                    }}
                  />
                  <input
                    id="ts-temp-max"
                    type="range"
                    min={draft.tempMin}
                    max="15"
                    value={draft.tempMax}
                    aria-label={`Maximum temperature ${draft.tempMax} degrees Celsius`}
                    onChange={(event) => {
                      const next = {
                        ...draft,
                        temperature: "Custom",
                        tempMax: Number(event.target.value),
                      };
                      setDraft(next);
                      sessionStorage.setItem("trucksaathi.shipper.draft", JSON.stringify(next));
                    }}
                  />
                  <label className="ts-field-label" htmlFor="ts-kind">
                    {t.cargoKind}
                  </label>
                  <select
                    className="ts-field-input"
                    id="ts-kind"
                    value={draft.cargoKind}
                    onChange={(event) => update("cargoKind", event.target.value)}
                  >
                    {t.cargoKinds.map((kind) => (
                      <option key={kind}>{kind}</option>
                    ))}
                  </select>
                  <span className="ts-inline-note">
                    <Snowflake size={15} />
                    {matchCopy.reeferOnly}
                  </span>
                </div>
              )}
              {draft.loadType === "Fragile & High-Value" && (
                <label className="ts-toggle-row">
                  <input
                    type="checkbox"
                    checked={draft.insured}
                    onChange={(event) => update("insured", event.target.checked)}
                  />
                  <ShieldCheck size={19} />
                  {t.insured}
                </label>
              )}
              {draft.loadType === "Heavy & Oversized" && (
                <label className="ts-field-label" htmlFor="ts-permit">
                  {t.permit}
                  <textarea
                    className="ts-field-input"
                    id="ts-permit"
                    value={draft.permit}
                    onChange={(event) => update("permit", event.target.value)}
                    rows={3}
                  />
                </label>
              )}
              {draft.loadType === "Bulk Material" && (
                <fieldset className="ts-form-group">
                  <legend>{t.bulkMode}</legend>
                  <div className="ts-chip-row">
                    {t.bulkModes.map((mode) => (
                      <button
                        type="button"
                        className={`ts-chip ${draft.bulkMode === mode ? "is-selected" : ""}`}
                        key={mode}
                        onClick={() => update("bulkMode", mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {draft.loadType === "Furniture & Household" && (
                <label className="ts-toggle-row">
                  <input
                    type="checkbox"
                    checked={draft.loadingHelp}
                    onChange={(event) => update("loadingHelp", event.target.checked)}
                  />
                  {t.loadingHelp}
                </label>
              )}
            </section>
            <StickyAction label={t.continue} error={error} onClick={() => moveTo("route")} />
          </>
        )}

        {currentStep === "route" && (
          <>
            <section className="ts-flow-content">
              <span className="ts-login-role">{t.steps[1]} · 2 / 4</span>
              <h1>{t.routeTitle}</h1>
              <p className="ts-flow-intro">{t.routeIntro}</p>
              <CityField
                label={t.pickup}
                value={draft.pickup}
                onChange={(value) => update("pickup", value)}
                onFocus={() => setActiveCityField("pickup")}
                id="ts-pickup"
                placeholder={t.addressPlaceholder}
              />
              <CityField
                label={t.dropoff}
                value={draft.dropoff}
                onChange={(value) => update("dropoff", value)}
                onFocus={() => setActiveCityField("dropoff")}
                id="ts-dropoff"
                placeholder={t.addressPlaceholder}
              />
              <p className="ts-inline-note">
                <MapPin size={16} />
                {t.mapPin}: {activeCityField === "pickup" ? t.pickup : t.dropoff}
              </p>
              <CityPickerMap
                selectedCities={[draft.pickup, draft.dropoff]}
                onSelect={(city) => update(activeCityField, city)}
              />
              <div className="ts-route-summary">
                <strong>
                  {draft.pickup} <ArrowRight size={15} /> {draft.dropoff}
                </strong>
                <span>
                  {distance.toLocaleString(language === "hi" ? "hi-IN" : "en-IN")} {t.distance}
                </span>
              </div>
            </section>
            <StickyAction label={t.continue} error={error} onClick={() => moveTo("schedule")} />
          </>
        )}

        {currentStep === "schedule" && (
          <>
            <section className="ts-flow-content">
              <span className="ts-login-role">{t.steps[2]} · 3 / 4</span>
              <h1>{t.scheduleTitle}</h1>
              <p className="ts-flow-intro">{t.scheduleIntro}</p>
              <label className="ts-field-label" htmlFor="ts-pickup-date">
                {t.pickupDate}
              </label>
              <input
                className="ts-field-input"
                id="ts-pickup-date"
                type="datetime-local"
                value={draft.pickupDate}
                onChange={(event) => update("pickupDate", event.target.value)}
              />
              <label className="ts-field-label" htmlFor="ts-delivery-date">
                {t.deliveryDate}
              </label>
              <input
                className="ts-field-input"
                id="ts-delivery-date"
                type="datetime-local"
                value={draft.deliveryDate}
                onChange={(event) => update("deliveryDate", event.target.value)}
              />
              <div className="ts-segmented" role="group" aria-label="Delivery flexibility">
                {(["Flexible", "Urgent"] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={draft.urgency === value ? "is-selected" : ""}
                    onClick={() => update("urgency", value)}
                  >
                    {value === "Flexible" ? t.flexible : t.urgent}
                  </button>
                ))}
              </div>
              <p className="ts-inline-note">
                <Clock3 size={17} />
                {draft.urgency === "Flexible" ? t.flexibleNote : t.urgentNote}
              </p>
            </section>
            <StickyAction label={t.continue} error={error} onClick={() => moveTo("review")} />
          </>
        )}

        {currentStep === "review" && (
          <>
            <section className="ts-flow-content">
              <span className="ts-login-role">{t.steps[3]} · 4 / 4</span>
              <h1>{t.reviewTitle}</h1>
              <div className="ts-review-block">
                <span>{t.cargo}</span>
                <strong>{draft.loadType}</strong>
                <p>
                  {draft.description} · {Number(draft.weight || 0).toLocaleString("en-IN")} kg
                </p>
                {isTemperatureSensitive && (
                  <p>
                    {t.reefer}: {draft.temperature} · {draft.cargoKind}
                  </p>
                )}
                {draft.insured && <p>{t.insurance}</p>}
                {draft.permit && (
                  <p>
                    {t.permitNote}: {draft.permit}
                  </p>
                )}
              </div>
              <div className="ts-review-block">
                <span>{t.route}</span>
                <strong>
                  {draft.pickup} → {draft.dropoff}
                </strong>
                <p>
                  {distance.toLocaleString("en-IN")} {t.distance}
                </p>
              </div>
              <div className="ts-review-block">
                <span>{t.deadline}</span>
                <strong>
                  {draft.deliveryDate ? new Date(draft.deliveryDate).toLocaleString("en-IN") : "—"}
                </strong>
                <p>{draft.urgency === "Flexible" ? t.flexible : t.urgent}</p>
              </div>
              <div className="ts-price-estimate">
                <span>{t.estimate}</span>
                <strong>
                  ₹{Math.max(0, matchedPrice - 2500).toLocaleString("en-IN")}–₹
                  {matchedPrice.toLocaleString("en-IN")}
                </strong>
                <small>{t.priceNote}</small>
              </div>
            </section>
            <StickyAction label={t.book} error={error} onClick={() => moveTo("matches")} />
          </>
        )}

        {currentStep === "matches" && (
          <>
            <section className="ts-flow-content">
              <span className="ts-matching-state">
                <span className="ts-live-dot" />
                {t.matching}
              </span>
              <h1>{t.recommended}</h1>
              {draft.matches.length > 0 ? (
                <div className="ts-match-options" role="radiogroup" aria-label={t.recommended}>
                  {draft.matches.map((match, index) => (
                    <Fragment key={match.matchId}>
                      {index === 1 && <h2 className="ts-subheading">{t.alternative}</h2>}
                      <MatchCard
                        language={language}
                        recommended={index === 0}
                        selected={draft.selectedMatchId === match.matchId}
                        onSelect={() => selectMatch(match)}
                        title={`${Math.round(match.capacityKg / 1000)}T ${match.truckType}`}
                        driver={`${match.driverName || match.truckRegistration} · ${match.rating.toFixed(1)} ★`}
                        eta={
                          index === 1
                            ? matchCopy.cheaperPickup
                            : index === 2
                              ? matchCopy.fasterPickup
                              : matchCopy.pickupEta
                        }
                        delivery={
                          index === 1
                            ? matchCopy.cheaperDelivery
                            : index === 2
                              ? matchCopy.fasterDelivery
                              : matchCopy.deliveryEta
                        }
                        price={match.price}
                        saved={Math.max(0, match.dedicatedPrice - match.price)}
                        route={`${draft.pickup} → ${draft.dropoff}`}
                        why={match.explanation}
                        reefer={match.refrigerated}
                      />
                    </Fragment>
                  ))}
                </div>
              ) : (
                <p className="ts-no-matches" role="status">
                  {matchCopy.noMatches}
                </p>
              )}
            </section>
            <StickyAction
              label={t.confirm}
              error={error}
              disabled={!draft.matches.length || !draft.selectedMatchId}
              onClick={() => {
                void confirmBooking();
              }}
            />
          </>
        )}

        {currentStep === "confirmed" && (
          <>
            <section className="ts-flow-content ts-confirmed-content">
              <span className="ts-confirm-icon">
                <Check size={30} />
              </span>
              <span className="ts-login-role">{t.confirmed}</span>
              <h1>{t.confirmed}</h1>
              <p className="ts-flow-intro">{matchCopy.confirmationBody}</p>
              <div className="ts-review-block">
                <span>{t.bookingId}</span>
                <strong>{draft.bookingId || "TS-0001842"}</strong>
                <p>
                  {draft.pickup} → {draft.dropoff} · {draft.loadType}
                </p>
              </div>
            </section>
            <div className="ts-sticky-action">
              <Link
                className="ts-primary-button"
                to="/app/track/$tripId"
                params={{ tripId: draft.bookingId || "TS-0001842" }}
              >
                {t.track}
                <ArrowRight size={19} />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function CityField({
  label,
  value,
  onChange,
  onFocus,
  id,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  id: string;
  placeholder: string;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  return (
    <label className="ts-city-field ts-field-label" htmlFor={id}>
      {label}
      <input
        className="ts-field-input"
        id={id}
        list="ts-north-cities"
        value={value}
        placeholder={placeholder}
        onFocus={onFocus}
        onChange={handleChange}
      />
      <datalist id="ts-north-cities">
        {northCities.map((city) => (
          <option key={city.name} value={city.name} />
        ))}
      </datalist>
    </label>
  );
}

function StickyAction({
  label,
  error,
  disabled,
  onClick,
}: {
  label: string;
  error?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="ts-sticky-action">
      {error && (
        <p className="ts-field-error" role="alert">
          {error}
        </p>
      )}
      <button className="ts-primary-button" type="button" onClick={onClick} disabled={disabled}>
        {label}
        <ArrowRight size={19} />
      </button>
    </div>
  );
}

function MatchCard({
  language,
  title,
  driver,
  eta,
  delivery,
  price,
  saved,
  route,
  why,
  recommended,
  reefer,
  selected,
  onSelect,
}: {
  language: "en" | "hi";
  title: string;
  driver: string;
  eta: string;
  delivery: string;
  price: number;
  saved?: number;
  route: string;
  why: string;
  recommended?: boolean;
  reefer?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = shipperCopy[language];
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  return (
    <article
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`ts-match-card ${recommended ? "is-recommended" : ""} ${selected ? "is-selected" : ""}`}
    >
      <div className="ts-match-heading">
        <div>
          <strong>{title}</strong>
          <span>{driver}</span>
        </div>
        {reefer && (
          <span className="ts-reefer-badge">
            <Snowflake size={13} />
            {t.reefer}
          </span>
        )}
      </div>
      <p className="ts-match-route">
        <MapPin size={15} />
        {route}
      </p>
      <div className="ts-match-times">
        <span>
          <small>{t.etaPickup}</small>
          {eta}
        </span>
        <span>
          <small>{t.etaDelivery}</small>
          {delivery}
        </span>
      </div>
      <div className="ts-match-price">
        <strong>₹{price.toLocaleString(locale)}</strong>
        {typeof saved === "number" && (
          <span>
            {t.save} ₹{saved.toLocaleString(locale)} {t.dedicated}
          </span>
        )}
      </div>
      <p className="ts-match-why">
        <strong>{t.why}</strong> {why}
      </p>
    </article>
  );
}
