import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Truck, TruckIcon } from "lucide-react";

import { transporterCopy } from "@/data/transporter-demo";
import { useAppLanguage } from "@/components/trucksaathi/app-language";

export const Route = createFileRoute("/app/transporter/type")({ component: TransporterType });

function TransporterType() {
  const { language } = useAppLanguage();
  const t = transporterCopy[language];
  return <main className="ts-app-page" lang={language}><div className="ts-app-frame ts-flow-frame"><header className="ts-flow-header"><Link to="/app/home" search={{ role: "transporter" }} className="ts-back-link" aria-label={t.back}><ArrowLeft size={21} /></Link><span className="ts-flow-step">{t.role}</span></header><section className="ts-flow-content"><span className="ts-login-role">TruckSaathi</span><h1>{t.heading}</h1><p className="ts-flow-intro">{t.chooseSetup}</p><Link className="ts-choice-card" to="/app/transporter/availability/$mode" params={{ mode: "single" }}><span className="ts-cargo-icon"><Truck size={22} /></span><span className="ts-role-copy"><strong>{t.single}</strong><small>{t.singleDescription}</small></span><ArrowRight size={20} /></Link><Link className="ts-choice-card" to="/app/transporter/availability/$mode" params={{ mode: "fleet" }}><span className="ts-cargo-icon"><TruckIcon size={22} /></span><span className="ts-role-copy"><strong>{t.fleet}</strong><small>{t.fleetDescription}</small></span><ArrowRight size={20} /></Link></section></div></main>;
}