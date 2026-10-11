import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle, Phone, Share2, Thermometer, Truck } from "lucide-react";

import { LiveRouteMap } from "@/components/trucksaathi/live-route-map";
import { appCopy } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { workflowCopy } from "@/data/app-copy";
import { apiPatch, apiPost } from "@/lib/api-client";

export const Route = createFileRoute("/app/track/$tripId")({ component: TrackingScreen });

function TrackingScreen() {
  const { tripId } = Route.useParams();
  const { language } = useAppLanguage();
  const copy = workflowCopy[language];
  const timeline = copy.currentStatus;
  const [elapsed, setElapsed] = useState(0);
  const [pickupOtp, setPickupOtp] = useState("");
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [pickupVerified, setPickupVerified] = useState(false);
  const [deliveryVerified, setDeliveryVerified] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");
  const [temperatureRequired, setTemperatureRequired] = useState(false);
  const [trip, setTrip] = useState<{ progress?: number; details_json?: { pickup?: string; dropoff?: string; cargoType?: string; route?: string }; pickup_otp?: string; delivery_otp?: string } | null>(null);
  const duration = 75;
  const progress = Math.min(100, (elapsed / duration) * 100);
  const statusIndex = Math.min(timeline.length - 1, Math.floor(progress / 25));
  const etaMinutes = Math.max(0, Math.ceil((duration - elapsed) * 1.8));
  const temperature = 4.2 + Math.sin(elapsed / 9) * 0.4;
  const delivered = statusIndex === timeline.length - 1;
  const t = appCopy[language];

  useEffect(() => {
    async function loadTrip() {
      try {
        const response = await fetch(`http://localhost:3001/api/trips/${encodeURIComponent(tripId)}`);
        if (!response.ok) return;
        const payload = await response.json() as { progress?: number; details_json?: { pickup?: string; dropoff?: string; cargoType?: string; route?: string }; pickup_otp?: string; delivery_otp?: string };
        setTrip(payload);
        if (payload.progress != null) setElapsed(Math.round((Number(payload.progress) / 100) * duration));
        setPickupOtp(String(payload.pickup_otp ?? "1234"));
        setDeliveryOtp(String(payload.delivery_otp ?? "5678"));
      } catch {
        setNotice(language === "en" ? "Could not load the live trip. Showing the local demo state." : "लाइव ट्रिप लोड नहीं हुई। स्थानीय डेमो दिखाया जा रहा है।");
      }
    }
    void loadTrip();
    try {
      const draft = sessionStorage.getItem("trucksaathi.shipper.draft");
      setTemperatureRequired(Boolean(draft && (JSON.parse(draft) as { loadType?: string }).loadType === "Temperature Sensitive Cargo"));
    } catch { setTemperatureRequired(false); }
  }, [duration, language, tripId]);

  useEffect(() => {
    if (delivered) return;
    const timer = window.setInterval(() => setElapsed((current) => {
      const next = Math.min(duration, current + 1);
      if (next % 10 === 0 || next === duration) void apiPatch(`/trips/${encodeURIComponent(tripId)}/tracking`, { progress: (next / duration) * 100 });
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [delivered, tripId]);

  const arrival = useMemo(() => new Date(Date.now() + etaMinutes * 60_000).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }), [etaMinutes]);

  function speedUp() {
    setElapsed(duration);
    void apiPatch(`/trips/${encodeURIComponent(tripId)}/tracking`, { progress: 100 });
  }
  async function verifyOtp(kind: "pickup" | "delivery") {
    const verifiedValue = kind === "pickup" ? pickupOtp : deliveryOtp;
    if (!/^\d{4}$/.test(verifiedValue)) return;
    try {
      await apiPost(`/trips/${encodeURIComponent(tripId)}/events`, { eventType: `${kind}_otp_verified`, details: { code: verifiedValue } });
      if (kind === "pickup") setPickupVerified(true);
      else { setDeliveryVerified(true); speedUp(); }
    } catch { setNotice(language === "en" ? "Trip service is unavailable." : "यात्रा सेवा उपलब्ध नहीं है।"); }
  }
  async function shareTracking() {
    const trackingUrl = `${window.location.origin}/app/track/${tripId}`;
    try { await navigator.clipboard.writeText(trackingUrl); setNotice("Tracking link copied"); } catch { setNotice(trackingUrl); }
  }

  return <main className="ts-track-page" lang={language}><div className="ts-track-map-wrap"><LiveRouteMap progress={progress} /><Link to="/app/activity" search={{ role: "shipper" }} className="ts-map-back" aria-label={copy.trackingBack}><ArrowLeft size={20} /></Link><span className="ts-map-pill"><span className="ts-live-dot" />{timeline[statusIndex]}</span><button className="ts-speed-button" type="button" onClick={speedUp}>{copy.speedUp}</button></div>
    <section className="ts-track-sheet"><div className="ts-sheet-handle" /><header className="ts-track-title"><div><span className="ts-kicker">{t.welcome}</span><h1>{copy.destination}</h1></div><span className="ts-trip-code">{tripId}</span></header>
      <div className="ts-eta-row"><span>{copy.arrival}</span><strong>{delivered ? copy.delivered : arrival}</strong><small>{delivered ? copy.arrived : `${etaMinutes} ${copy.remaining}`}</small></div>
      <ol className="ts-trip-timeline">{timeline.map((label, index) => <li key={label} className={index < statusIndex ? "is-complete" : index === statusIndex ? "is-current" : ""}><span className="ts-timeline-dot">{index < statusIndex ? <Check size={12} /> : null}</span><span>{label}</span></li>)}</ol>
      <article className="ts-driver-card"><span className="ts-driver-avatar">MS</span><span className="ts-role-copy"><strong>{copy.driver} <span className="ts-driver-rating">4.9 ★</span></strong><small>{copy.vehicle}</small></span><a href="tel:+919876543210" className="ts-driver-action" aria-label={copy.callDriver}><Phone size={18} /></a><button type="button" className="ts-driver-action" aria-label={copy.chatDriver} onClick={() => setNotice(copy.demoChat)}><MessageCircle size={18} /></button></article>
      <button type="button" className="ts-share-button" onClick={shareTracking}><Share2 size={17} />{copy.shareTracking}</button>
      {notice && <p className="ts-inline-note" role="status">{notice}</p>}
      <div className="ts-otp-grid"><label>{copy.pickupOtp}<input className="ts-field-input" inputMode="numeric" maxLength={4} placeholder="1234" value={pickupOtp} onChange={(event) => setPickupOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label><button type="button" className="ts-secondary-button" disabled={pickupVerified || pickupOtp.length !== 4} onClick={() => { void verifyOtp("pickup"); }}>{pickupVerified ? copy.verified : copy.verify}</button><label>{copy.deliveryOtp}<input className="ts-field-input" inputMode="numeric" maxLength={4} placeholder="5678" value={deliveryOtp} onChange={(event) => setDeliveryOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label><button type="button" className="ts-secondary-button" disabled={deliveryVerified || deliveryOtp.length !== 4} onClick={() => { void verifyOtp("delivery"); }}>{deliveryVerified ? copy.verified : copy.verify}</button></div>
      <div className="ts-impact-summary"><h2>{copy.journeyImpact}</h2><div><span>{copy.journeyTime}</span><strong>{copy.estimatedJourneyValue}</strong></div><div><span>{copy.moneySaved}</span><strong>₹6,500</strong></div><div><span>{copy.carbonReduced}</span><strong>262 kg CO₂</strong></div></div>
      {temperatureRequired && <div className="ts-temperature"><Thermometer size={20} /><span><strong>{copy.temperature}</strong><small>{copy.target} 2–8°C</small></span><b>{temperature.toFixed(1)}°C · {copy.inRange}</b></div>}
      {delivered && <section className="ts-delivery-receipt"><span className="ts-confirm-icon"><Check size={24} /></span><h2>{copy.receipt}</h2><p>{copy.receiptRoute}</p><label htmlFor="ts-rating-comment">{copy.experience}</label><div className="ts-star-row" role="group" aria-label={copy.experience}>{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} aria-label={`${star} stars`} aria-pressed={rating === star} onClick={() => setRating(star)}>{star <= rating ? "★" : "☆"}</button>)}</div><textarea id="ts-rating-comment" className="ts-field-input" rows={3} placeholder={copy.comment} value={comment} onChange={(event) => setComment(event.target.value)} /><button type="button" className="ts-primary-button" disabled={!rating} onClick={() => { void apiPost("/ratings", { tripId, score: rating, comment }).then(() => setNotice(copy.thanksRating)).catch(() => setNotice(language === "en" ? "Rating could not be saved." : "रेटिंग सहेजी नहीं गई।")); }}>{copy.submitRating}</button><Link to="/app/activity" search={{ role: "shipper" }} className="ts-text-button">{copy.viewActivity}</Link></section>}
    </section></main>;
}