import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, MapPin, Truck } from "lucide-react";

import { AppTabs } from "@/components/trucksaathi/app-tabs";
import { appCopy, getAppRole } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { workflowCopy } from "@/data/app-copy";

export const Route = createFileRoute("/app/activity")({
  validateSearch: (search: Record<string, unknown>) => ({ role: getAppRole(search) }),
  component: ActivityScreen,
});

const activities = [
  { id: "TS-1842", role: "shipper", route: "Ludhiana → Delhi", cargo: "General Cargo · 8 t", date: "Today · 8:00 AM", status: "In transit", active: true, amount: "₹24,000" },
  { id: "TS-1796", role: "shipper", route: "Delhi → Jaipur", cargo: "Temperature Sensitive · 4 t", date: "Yesterday · 6:30 AM", status: "Delivered", active: false, amount: "₹18,500" },
  { id: "TS-1702", role: "shipper", route: "Amritsar → Delhi", cargo: "Fragile & High-Value · 2 t", date: "8 Oct · 9:00 AM", status: "Delivered", active: false, amount: "₹21,000" },
  { id: "TS-1680", role: "transporter", route: "Delhi → Ludhiana", cargo: "Return load · 8 t", date: "Today · 8:00 AM", status: "In transit", active: true, amount: "+₹18,500" },
  { id: "TS-1655", role: "transporter", route: "Jaipur → Delhi", cargo: "Packaged produce · 6 t", date: "Yesterday · 5:00 AM", status: "Delivered", active: false, amount: "+₹14,200" },
];

function ActivityScreen() {
  const { role } = Route.useSearch();
  const { language } = useAppLanguage();
  const copy = workflowCopy[language];
  const title = role === "shipper" ? copy.activityTitleShipper : copy.activityTitleTransporter;
  const [draftActivity, setDraftActivity] = useState<(typeof activities)[number] | null>(null);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("trucksaathi.shipper.draft");
      if (!saved) return;
      const draft = JSON.parse(saved) as { bookingId?: string; pickup?: string; dropoff?: string; weight?: string; loadType?: string };
      if (!draft.bookingId) return;
      setDraftActivity({ id: draft.bookingId, role: "shipper", route: `${draft.pickup ?? ""} → ${draft.dropoff ?? ""}`, cargo: `${draft.loadType ?? "General Cargo"} · ${Number(draft.weight ?? 0) / 1000} t`, date: "Today · Booking created", status: "Confirmed", active: true, amount: "Pending" });
    } catch { setDraftActivity(null); }
  }, []);
  const items = [...(draftActivity && role === "shipper" ? [draftActivity] : []), ...activities.filter((item) => item.role === role)];
  return <main className="ts-app-page" lang={language}><div className="ts-app-frame ts-workspace-frame"><header className="ts-app-header"><Link to="/app/home" search={{ role }} className="ts-brand"><span className="ts-brand-mark"><Truck size={18} /></span><span>TruckSaathi<span className="ts-brand-period">.</span></span></Link><span className="ts-profile-button"><Clock3 size={19} /></span></header><section className="ts-workspace-welcome ts-list-welcome"><span className="ts-kicker">{role === "shipper" ? appCopy[language].roleShipper : appCopy[language].roleTransporter}</span><h1>{title}</h1><p>{copy.activityIntro}</p></section><section className="ts-activity-list" aria-label={title}>{items.map((item) => <article className="ts-activity-item" key={item.id}><div className="ts-activity-route"><span className={`ts-activity-status ${item.active ? "is-active" : ""}`}>{item.active ? <Clock3 size={13} /> : <Check size={13} />}{item.status}</span><strong>{item.route}</strong><span className="ts-activity-meta"><MapPin size={13} />{item.cargo}</span><span className="ts-activity-meta">{item.date}</span></div><div className="ts-activity-bottom"><span className="ts-activity-id">{item.id}</span><strong>{item.amount}</strong><Link to={role === "shipper" ? "/app/track/$tripId" : "/app/trips/$tripId"} params={{ tripId: item.id }} aria-label={`${copy.upcomingCompleted}: ${item.route}`}><ArrowRight size={19} /></Link></div></article>)}</section><AppTabs role={role} active="activity" /></div></main>;
}