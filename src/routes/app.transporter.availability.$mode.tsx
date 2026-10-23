import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Plus, Snowflake, Truck } from "lucide-react";

import {
  demoFleet,
  suggestedDestinations,
  transporterCopy,
  type DemoTruck,
} from "@/data/transporter-demo";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { northCities } from "@/data/shipper-demo";
import { apiPost } from "@/lib/api-client";

export const Route = createFileRoute("/app/transporter/availability/$mode")({
  beforeLoad: ({ params }) => {
    if (params.mode === "fleet") {
      throw redirect({
        to: "/app/transporter/availability/$mode",
        params: { mode: "single" },
      });
    }
  },
  component: AvailabilityWizard,
});

function AvailabilityWizard() {
  const navigate = useNavigate();
  const { mode } = Route.useParams();
  const { language } = useAppLanguage();
  const isFleet = mode === "fleet";
  const t = transporterCopy[language];
  const [step, setStep] = useState(0);
  const [trucks, setTrucks] = useState(demoFleet);
  const [selected, setSelected] = useState<string[]>(
    isFleet ? ["truck-1", "truck-2"] : ["truck-1"],
  );
  const [dates, setDates] = useState({ from: "2026-10-12", to: "2026-10-16" });
  const [city, setCity] = useState("Ludhiana");
  const [radius, setRadius] = useState(350);
  const [preferred, setPreferred] = useState<string[]>(["Delhi"]);
  const [avoided, setAvoided] = useState<string[]>([]);
  const [overrideRanges, setOverrideRanges] = useState(false);
  const [rangesByTruck, setRangesByTruck] = useState<
    Record<string, { city: string; radius: number }>
  >({});
  const [capacityPercent, setCapacityPercent] = useState(50);
  const [reefer, setReefer] = useState(false);
  const [capacityByTruck, setCapacityByTruck] = useState<Record<string, number>>({});
  const [reeferByTruck, setReeferByTruck] = useState<Record<string, boolean>>({});
  const [headingTo, setHeadingTo] = useState("Delhi");
  const [returningFrom, setReturningFrom] = useState("Delhi");
  const [vehicleType, setVehicleType] = useState("Multi-axle");
  const [capacity, setCapacity] = useState(14);
  const [minimumRate, setMinimumRate] = useState(25);
  const [sharedLoads, setSharedLoads] = useState(true);
  const [pickupWindow, setPickupWindow] = useState("Morning");
  const [addOpen, setAddOpen] = useState(false);
  const [newRegistration, setNewRegistration] = useState("");
  const [newDriver, setNewDriver] = useState("");
  const [error, setError] = useState("");
  const totalSteps = isFleet ? 6 : 6;
  const current = t.steps[step] ?? t.steps[0];
  const selectedTrucks = useMemo(
    () => trucks.filter((truck) => selected.includes(truck.id)),
    [selected, trucks],
  );

  function toggleChip(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(
      values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    );
  }

  async function addTruck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newRegistration.trim()) return;
    try {
      const created = await apiPost<{
        id: string;
        registration: string;
        driverName: string;
        vehicleType: string;
        capacityKg: number;
        reefer: boolean;
      }>("/trucks", {
        registration: newRegistration,
        driverName: newDriver || "Driver to be assigned",
        vehicleType: vehicleType,
        capacityKg: capacity * 1000,
        reefer,
      });
      const truck: DemoTruck = {
        id: created.id,
        registration: created.registration,
        type: created.vehicleType,
        capacity: created.capacityKg / 1000,
        reefer: created.reefer,
        driver: created.driverName,
      };
      setTrucks((currentTrucks) => [...currentTrucks, truck]);
      setSelected((currentSelected) => [...currentSelected, truck.id]);
      setNewRegistration("");
      setNewDriver("");
      setAddOpen(false);
      setError("");
    } catch {
      setError(
        language === "en"
          ? "That truck could not be added. Check the registration and retry."
          : "ट्रक नहीं जुड़ पाया। रजिस्ट्रेशन जाँचकर फिर कोशिश करें।",
      );
    }
  }

  async function continueFlow() {
    if (step === 0 && (!dates.from || !dates.to || dates.to < dates.from)) {
      setError(t.dateRequired);
      return;
    }
    if (step === 1 && !city) {
      setError(t.cityRequired);
      return;
    }
    if (step === totalSteps - 1 && selected.length === 0) {
      setError(t.trucksRequired);
      return;
    }
    setError("");
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      const currentCity = northCities.find((item) => item.name === city);
      if (!currentCity) {
        setError(t.cityRequired);
        return;
      }
      try {
        const records = await Promise.all(
          selectedTrucks.map((truck) => {
            const range =
              isFleet && overrideRanges
                ? (rangesByTruck[truck.id] ?? { city, radius })
                : { city, radius };
            const truckCity = northCities.find((item) => item.name === range.city);
            if (!truckCity) throw new Error("Choose a valid city for each selected truck.");
            return apiPost<{ id: string }>("/availabilities", {
              truckId: truck.id,
              availableFrom: new Date(`${dates.from}T00:00:00`).toISOString(),
              availableUntil: new Date(`${dates.to}T23:59:00`).toISOString(),
              radiusKm: range.radius,
              freeCapacityKg: Math.round(
                (truck.capacity *
                  1000 *
                  (isFleet ? (capacityByTruck[truck.id] ?? capacityPercent) : capacityPercent)) /
                  100,
              ),
              refrigerated: isFleet ? (reeferByTruck[truck.id] ?? truck.reefer) : reefer,
              details: {
                currentCity: range.city,
                headingTo,
                returningFrom,
                preferredDestinations: preferred,
                avoidedDestinations: avoided,
                minimumRatePerKm: minimumRate,
                sharedLoadsAccepted: sharedLoads,
                pickupWindow,
                rating: 4.7,
              },
            });
          }),
        );
        const availability = {
          mode,
          selected,
          availabilityIds: records.map((record) => record.id),
          dates,
          city,
          coordinates: { lat: currentCity.lat, lon: currentCity.lon },
          radius,
          preferred,
          avoided,
          rangesByTruck,
          overrideRanges,
          capacityPercent,
          capacityByTruck,
          reefer,
          reeferByTruck,
          headingTo,
          returningFrom,
          vehicleType,
          capacity,
          minimumRate,
          sharedLoads,
          pickupWindow,
        };
        sessionStorage.setItem(
          "trucksaathi.transporter.availability",
          JSON.stringify(availability),
        );
        void navigate({ to: "/app/transporter/offers" });
      } catch {
        setError(
          language === "en"
            ? "Availability could not be saved. Check that the API is running and retry."
            : "उपलब्धता सहेजी नहीं गई। API चल रही है या नहीं जाँचें और फिर कोशिश करें।",
        );
      }
    }
  }

  return (
    <main className="ts-app-page" lang={language}>
      <div className="ts-app-frame ts-flow-frame">
        <header className="ts-flow-header">
          <Link
            to="/app/home"
            search={{ role: "transporter", phone: undefined }}
            className="ts-back-link"
            aria-label={t.back}
          >
            <ArrowLeft size={21} />
          </Link>
          <span className="ts-flow-step">
            {current} · {step + 1} / {totalSteps}
          </span>
        </header>
        <div className="ts-progress-track">
          <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
        {step === 0 && (
          <section className="ts-flow-content">
            <h1>{t.dates}</h1>
            <label className="ts-field-label" htmlFor="ts-available-from">
              {t.from}
            </label>
            <input
              className="ts-field-input"
              id="ts-available-from"
              type="date"
              value={dates.from}
              onChange={(event) => setDates({ ...dates, from: event.target.value })}
            />
            <label className="ts-field-label" htmlFor="ts-available-to">
              {t.to}
            </label>
            <input
              className="ts-field-input"
              id="ts-available-to"
              type="date"
              value={dates.to}
              min={dates.from}
              onChange={(event) => setDates({ ...dates, to: event.target.value })}
            />
            {isFleet && (
              <label className="ts-toggle-row">
                <input type="checkbox" defaultChecked />
                {t.applyDates}
              </label>
            )}
          </section>
        )}
        {step === 1 && (
          <section className="ts-flow-content">
            <span className="ts-login-role">
              {t.steps[1]} · {step + 1} / {totalSteps}
            </span>
            <h1>{t.range}</h1>
            <label className="ts-field-label" htmlFor="ts-current-city">
              {t.currentCity}
            </label>
            <input
              className="ts-field-input"
              id="ts-current-city"
              list="ts-transporter-cities"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <datalist id="ts-transporter-cities">
              {suggestedDestinations.map((destination) => (
                <option key={destination} />
              ))}
            </datalist>
            <label className="ts-field-label" htmlFor="ts-radius">
              {t.radius}: {radius} km
            </label>
            <input
              id="ts-radius"
              type="range"
              min="25"
              max="800"
              step="25"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
            <ChipSelector
              label={t.preferred}
              values={suggestedDestinations}
              selected={preferred}
              onToggle={(value) => toggleChip(value, preferred, setPreferred)}
            />
            <ChipSelector
              label={t.avoid}
              values={suggestedDestinations}
              selected={avoided}
              onToggle={(value) => toggleChip(value, avoided, setAvoided)}
            />
            {isFleet && (
              <label className="ts-toggle-row">
                <input
                  type="checkbox"
                  checked={overrideRanges}
                  onChange={(event) => setOverrideRanges(event.target.checked)}
                />
                {t.overrideRange}
              </label>
            )}
            {isFleet && overrideRanges && (
              <TruckRangeOverrides
                trucks={selectedTrucks}
                ranges={rangesByTruck}
                fallbackCity={city}
                fallbackRadius={radius}
                cityLabel={t.currentCity}
                radiusLabel={t.radius}
                onChange={(truckId, field, value) =>
                  setRangesByTruck((currentValues) => ({
                    ...currentValues,
                    [truckId]: { ...(currentValues[truckId] ?? { city, radius }), [field]: value },
                  }))
                }
              />
            )}
          </section>
        )}
        {step === 2 && (
          <section className="ts-flow-content">
            <span className="ts-login-role">
              {t.steps[2]} · {step + 1} / {totalSteps}
            </span>
            <h1>{t.space}</h1>
            <label className="ts-field-label" htmlFor="ts-space">
              {t.percent}: {capacityPercent}%
            </label>
            <input
              id="ts-space"
              type="range"
              min="10"
              max="100"
              step="5"
              value={capacityPercent}
              onChange={(event) => setCapacityPercent(Number(event.target.value))}
            />
            <div className="ts-capacity-readout">
              {Math.round(((selectedTrucks[0]?.capacity ?? capacity) * capacityPercent) / 100)} t{" "}
              <small>{t.tons}</small>
            </div>
            {isFleet &&
              selectedTrucks.map((truck) => (
                <label className="ts-range-row" key={truck.id}>
                  {truck.registration} · {capacityByTruck[truck.id] ?? capacityPercent}%
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={capacityByTruck[truck.id] ?? capacityPercent}
                    aria-label={`${t.space} ${truck.registration}`}
                    onChange={(event) =>
                      setCapacityByTruck((currentValues) => ({
                        ...currentValues,
                        [truck.id]: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              ))}
          </section>
        )}
        {step === 3 && (
          <section className="ts-flow-content">
            <span className="ts-login-role">
              {t.steps[3]} · {step + 1} / {totalSteps}
            </span>
            <h1>{t.reefer}?</h1>
            <div className="ts-choice-grid">
              <button
                type="button"
                className={`ts-preset ${reefer ? "is-selected" : ""}`}
                onClick={() => setReefer(true)}
              >
                <Snowflake size={20} />
                <strong>{t.yes}</strong>
              </button>
              <button
                type="button"
                className={`ts-preset ${!reefer ? "is-selected" : ""}`}
                onClick={() => setReefer(false)}
              >
                <Truck size={20} />
                <strong>{t.no}</strong>
              </button>
            </div>
            {isFleet &&
              selectedTrucks.map((truck) => (
                <label className="ts-toggle-row" key={truck.id}>
                  <input
                    type="checkbox"
                    checked={reeferByTruck[truck.id] ?? truck.reefer}
                    onChange={(event) =>
                      setReeferByTruck((currentValues) => ({
                        ...currentValues,
                        [truck.id]: event.target.checked,
                      }))
                    }
                  />
                  {truck.registration} · {(reeferByTruck[truck.id] ?? truck.reefer) ? t.yes : t.no}
                </label>
              ))}
          </section>
        )}
        {step === 4 && (
          <section className="ts-flow-content">
            <span className="ts-login-role">
              {t.steps[4]} · {step + 1} / {totalSteps}
            </span>
            <h1>{t.extra}</h1>
            <label className="ts-field-label" htmlFor="ts-heading">
              {t.headingTo}
            </label>
            <input
              className="ts-field-input"
              id="ts-heading"
              list="ts-transporter-cities"
              value={headingTo}
              onChange={(event) => setHeadingTo(event.target.value)}
            />
            <label className="ts-field-label" htmlFor="ts-return">
              {t.returningFrom}
            </label>
            <input
              className="ts-field-input"
              id="ts-return"
              list="ts-transporter-cities"
              value={returningFrom}
              onChange={(event) => setReturningFrom(event.target.value)}
            />
            <label className="ts-field-label" htmlFor="ts-vehicle">
              {t.vehicle}
            </label>
            <select
              className="ts-field-input"
              id="ts-vehicle"
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              {t.vehicleOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <label className="ts-field-label" htmlFor="ts-capacity">
              {t.capacity}
            </label>
            <input
              className="ts-field-input"
              id="ts-capacity"
              type="number"
              min="1"
              max="50"
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
            <label className="ts-field-label" htmlFor="ts-rate">
              {t.minimumRate}: ₹{minimumRate}
            </label>
            <input
              id="ts-rate"
              type="range"
              min="10"
              max="100"
              value={minimumRate}
              onChange={(event) => setMinimumRate(Number(event.target.value))}
            />
            <label className="ts-toggle-row">
              <input
                type="checkbox"
                checked={sharedLoads}
                onChange={(event) => setSharedLoads(event.target.checked)}
              />
              {t.shared}
            </label>
            <label className="ts-field-label" htmlFor="ts-pickup-window">
              {t.pickupWindow}
            </label>
            <select
              className="ts-field-input"
              id="ts-pickup-window"
              value={pickupWindow}
              onChange={(event) => setPickupWindow(event.target.value)}
            >
              {t.pickupWindows.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </section>
        )}
        {step === 5 && (
          <section className="ts-flow-content">
            <h1>{isFleet ? t.selectTrucks : t.review}</h1>
            {isFleet && (
              <button
                type="button"
                className="ts-secondary-button"
                onClick={() => setAddOpen(!addOpen)}
              >
                <Plus size={17} />
                {t.addTruck}
              </button>
            )}
            {addOpen && (
              <form className="ts-inline-form" onSubmit={addTruck}>
                <label className="ts-field-label" htmlFor="ts-registration">
                  {t.registration}
                </label>
                <input
                  className="ts-field-input"
                  id="ts-registration"
                  value={newRegistration}
                  onChange={(event) => setNewRegistration(event.target.value)}
                  required
                  maxLength={16}
                />
                <label className="ts-field-label" htmlFor="ts-driver">
                  {t.driver}
                </label>
                <input
                  className="ts-field-input"
                  id="ts-driver"
                  value={newDriver}
                  onChange={(event) => setNewDriver(event.target.value)}
                />
                <button className="ts-secondary-button" type="submit">
                  {t.saveTruck}
                </button>
              </form>
            )}
            {isFleet ? (
              trucks.map((truck) => (
                <button
                  key={truck.id}
                  type="button"
                  className={`ts-truck-select ${selected.includes(truck.id) ? "is-selected" : ""}`}
                  onClick={() => toggleChip(truck.id, selected, setSelected)}
                >
                  <span className="ts-truck-check">
                    {selected.includes(truck.id) && <Check size={16} />}
                  </span>
                  <span className="ts-role-copy">
                    <strong>{truck.registration}</strong>
                    <small>
                      {truck.type} · {truck.capacity} t · {truck.reefer ? t.reeferYes : t.reeferNo}{" "}
                      · {truck.driver}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <div className="ts-review-block">
                <span>{t.vehicle}</span>
                <strong>
                  {vehicleType} · {capacity} t
                </strong>
                <p>
                  {city} · {radius} km radius · {capacityPercent}% space available ·{" "}
                  {reefer ? t.reeferYes : t.reeferNo}
                </p>
                <p>
                  {dates.from} – {dates.to} · {pickupWindow}
                </p>
              </div>
            )}
          </section>
        )}
        <div className="ts-sticky-action">
          {error && (
            <p className="ts-field-error" role="alert">
              {error}
            </p>
          )}
          <button className="ts-primary-button" type="button" onClick={continueFlow}>
            {step === totalSteps - 1 ? t.findLoads : t.continue}
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </main>
  );
}

function ChipSelector({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="ts-form-group">
      <legend>{label}</legend>
      <div className="ts-chip-row">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            className={`ts-chip ${selected.includes(value) ? "is-selected" : ""}`}
            aria-pressed={selected.includes(value)}
            onClick={() => onToggle(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function TruckRangeOverrides({
  trucks,
  ranges,
  fallbackCity,
  fallbackRadius,
  cityLabel,
  radiusLabel,
  onChange,
}: {
  trucks: DemoTruck[];
  ranges: Record<string, { city: string; radius: number }>;
  fallbackCity: string;
  fallbackRadius: number;
  cityLabel: string;
  radiusLabel: string;
  onChange: (truckId: string, field: "city" | "radius", value: string | number) => void;
}) {
  return (
    <div className="ts-truck-range-overrides">
      {trucks.map((truck) => {
        const range = ranges[truck.id] ?? { city: fallbackCity, radius: fallbackRadius };
        const listId = `cities-${truck.id}`;
        return (
          <fieldset className="ts-form-group" key={truck.id}>
            <legend>{truck.registration}</legend>
            <label className="ts-field-label" htmlFor={`city-${truck.id}`}>
              {cityLabel}
            </label>
            <input
              className="ts-field-input"
              id={`city-${truck.id}`}
              list={listId}
              value={range.city}
              onChange={(event) => onChange(truck.id, "city", event.target.value)}
            />
            <datalist id={listId}>
              {suggestedDestinations.map((destination) => (
                <option key={destination} value={destination} />
              ))}
            </datalist>
            <label className="ts-field-label" htmlFor={`radius-${truck.id}`}>
              {radiusLabel}: {range.radius} km
            </label>
            <input
              id={`radius-${truck.id}`}
              type="range"
              min="25"
              max="800"
              step="25"
              value={range.radius}
              onChange={(event) => onChange(truck.id, "radius", Number(event.target.value))}
            />
          </fieldset>
        );
      })}
    </div>
  );
}
