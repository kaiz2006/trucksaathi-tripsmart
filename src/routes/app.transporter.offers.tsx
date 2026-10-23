import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Snowflake, Truck } from "lucide-react";

import { AppTabs } from "@/components/trucksaathi/app-tabs";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { demoFleet } from "@/data/transporter-demo";
import { transporterCopy } from "@/data/transporter-demo";

export const Route = createFileRoute("/app/transporter/offers")({ component: OffersScreen });

type Offer = {
  id: string;
  route: string;
  weight: string;
  cargo: string;
  pickup: string;
  price: number;
  fill: number;
  emptyKm: number;
  reefer?: boolean;
};
const offersByTruck: { truckId: string; offers: Offer[] }[] = [
  {
    truckId: "truck-1",
    offers: [
      {
        id: "load-1",
        route: "Delhi → Ludhiana",
        weight: "8 t",
        cargo: "General Cargo",
        pickup: "12 Oct · 8 AM–12 PM",
        price: 14000,
        fill: 18500,
        emptyKm: 320,
      },
      {
        id: "load-2",
        route: "Ambala → Jalandhar",
        weight: "4 t",
        cargo: "Furniture & Household",
        pickup: "12 Oct · 1 PM–5 PM",
        price: 9800,
        fill: 8200,
        emptyKm: 205,
      },
    ],
  },
  {
    truckId: "truck-2",
    offers: [
      {
        id: "load-3",
        route: "Delhi → Ludhiana",
        weight: "6 t",
        cargo: "Temperature Sensitive Cargo",
        pickup: "13 Oct · 6 AM–10 AM",
        price: 18200,
        fill: 22400,
        emptyKm: 320,
        reefer: true,
      },
    ],
  },
  { truckId: "truck-3", offers: [] },
];

function OffersScreen() {
  const navigate = useNavigate();
  const { language } = useAppLanguage();
  const t = transporterCopy[language];
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "declined">>({});
  const [showAll, setShowAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[] | undefined>();

  useEffect(() => {
    try {
      const selected = JSON.parse(
        sessionStorage.getItem("trucksaathi.transporter.availability") ?? "{}",
      ).selected;
      setSelectedIds(Array.isArray(selected) ? selected : undefined);
    } catch {
      setSelectedIds(undefined);
    }
  }, []);

  const trucks = demoFleet.filter((truck) => !selectedIds || selectedIds.includes(truck.id));

  function decide(id: string, choice: "accepted" | "declined") {
    setDecisions((current) => ({ ...current, [id]: choice }));
    if (choice === "accepted") {
      void navigate({ to: "/app/activity", search: { role: "transporter" } });
    }
  }

  return (
    <main className="ts-app-page" lang={language} id="main-content">
      <div className="ts-app-frame ts-flow-frame">
        <header className="ts-flow-header">
          <Link
            to="/app/home"
            search={{ role: "transporter", phone: undefined }}
            className="ts-back-link"
            aria-label={language === "en" ? "Back" : "वापस"}
          >
            <ArrowLeft size={21} />
          </Link>
          <span className="ts-flow-step">{t.match}</span>
        </header>
        <section className="ts-flow-content">
          <span className="ts-login-role">{t.match}</span>
          <h1>{t.offerTitle}</h1>
          <p className="ts-flow-intro">{t.offerSubtitle}</p>
          {offersByTruck
            .filter(
              ({ truckId, offers }) =>
                trucks.some((truck) => truck.id === truckId) && (showAll || offers.length === 0),
            )
            .map(({ truckId, offers }) => {
              const truck = trucks.find((item) => item.id === truckId);
              if (!truck) return null;

              return (
                <section
                  className={`ts-truck-offer-group ${offers.length === 0 ? "is-unmatched" : ""}`}
                  key={truckId}
                >
                  <div className="ts-truck-group-heading">
                    <span className="ts-truck-icon">
                      <Truck size={19} />
                    </span>
                    <span className="ts-role-copy">
                      <strong>{truck.registration}</strong>
                      <small>
                        {truck.type} · {truck.capacity} t · {truck.driver}
                      </small>
                    </span>
                    <span className="ts-truck-match-count">
                      {offers.length
                        ? `${offers.length} ${offers.length === 1 ? t.matchSingle : t.match}`
                        : t.noMatch}
                    </span>
                  </div>
                  {offers.map((offer) => {
                    const state = decisions[offer.id];
                    const net = offer.price - 1500;

                    return (
                      <article
                        className={`ts-offer-card ${state ? `is-${state}` : ""}`}
                        key={offer.id}
                      >
                        <div className="ts-offer-route">
                          <MapPin size={16} />
                          <strong>{offer.route}</strong>
                          {offer.reefer && (
                            <span className="ts-reefer-badge">
                              <Snowflake size={12} />
                              {t.reefer}
                            </span>
                          )}
                        </div>
                        <div className="ts-offer-facts">
                          <span>
                            <small>{t.weight}</small>
                            {offer.weight}
                          </span>
                          <span>
                            <small>{t.cargoType}</small>
                            {offer.cargo}
                          </span>
                          <span>
                            <small>{t.pickupWindowLabel}</small>
                            {offer.pickup}
                          </span>
                        </div>
                        <div className="ts-offer-earnings">
                          <span>
                            <small>{t.price}</small>
                            <strong>
                              ₹{offer.price.toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}
                            </strong>
                          </span>
                          <span>
                            <small>{t.fee}</small>
                            <strong>₹1,500</strong>
                          </span>
                          <span>
                            <small>{t.netAfterFee}</small>
                            <strong>
                              ₹{net.toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}
                            </strong>
                          </span>
                        </div>
                        <p className="ts-return-fill">
                          ↩ {t.returnFill}: +₹
                          {offer.fill.toLocaleString(language === "hi" ? "hi-IN" : "en-IN")},{" "}
                          {offer.emptyKm} {t.emptyKm}
                        </p>
                        {state ? (
                          <p className="ts-decision-status" role="status">
                            {state === "accepted" ? t.accepted : t.declined}
                          </p>
                        ) : (
                          <div className="ts-offer-actions">
                            <button
                              type="button"
                              className="ts-primary-button"
                              onClick={() => decide(offer.id, "accepted")}
                            >
                              {t.accept}
                            </button>
                            <button
                              type="button"
                              className="ts-secondary-button"
                              onClick={() => decide(offer.id, "declined")}
                            >
                              {t.decline}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </section>
              );
            })}
        </section>
        <button
          type="button"
          className="ts-secondary-button ts-unmatched-toggle"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? t.yourTrucks : t.otherDestinations}
        </button>
        <AppTabs active="home" role="transporter" />
      </div>
    </main>
  );
}
