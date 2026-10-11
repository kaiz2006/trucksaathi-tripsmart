import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Truck } from "lucide-react";

import { LiveRouteMap } from "@/components/trucksaathi/live-route-map";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { workflowCopy } from "@/data/app-copy";

export const Route = createFileRoute("/app/trips/$tripId")({ component: ActiveTripScreen });

function ActiveTripScreen() {
  const { tripId } = Route.useParams();
  const { language } = useAppLanguage();
  const copy = workflowCopy[language];
  const [elapsed, setElapsed] = useState(14);
  const progress = Math.min(100, (elapsed / 75) * 100);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((current) => Math.min(75, current + 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <main className="ts-track-page" lang={language}><div className="ts-track-map-wrap"><LiveRouteMap progress={progress} /><Link to="/app/activity" search={{ role: "transporter" }} className="ts-map-back" aria-label={copy.trackingBack}><ArrowLeft size={20} /></Link><span className="ts-map-pill"><span className="ts-live-dot" />{copy.activeTrip}</span></div><section className="ts-track-sheet"><div className="ts-sheet-handle" /><span className="ts-kicker">{copy.activeTrip} · {tripId}</span><h1 className="ts-trip-heading">{copy.currentLeg}</h1><div className="ts-trip-timeline-mini"><span className="is-done">Delhi · {copy.currentStatus[2]}</span><span className="is-active">Ludhiana · {copy.currentStatus[3]}</span><span>{copy.nextLeg} · {copy.available}</span></div><article className="ts-active-trip-next"><span className="ts-truck-icon"><Truck size={19} /></span><span><small>{copy.nextLeg}</small><strong>{copy.nextRoute}</strong><small>{copy.nextDetails}</small></span><span className="ts-next-amount">+₹18,500</span></article><div className="ts-impact-summary"><h2>{copy.earningsImpact}</h2><div><span>{copy.earningsSoFar}</span><strong>₹22,500</strong></div><div><span>{copy.extraEmpty}</span><strong>+₹18,500</strong></div><div><span>{copy.emptyKm}</span><strong>320 km</strong></div></div><Link className="ts-primary-button" to="/app/track/$tripId" params={{ tripId }}>{copy.openTracking}<ArrowRight size={18} /></Link></section></main>;
}