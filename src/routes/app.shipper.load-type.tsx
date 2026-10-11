import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Box, Boxes, Snowflake, Sofa, ShieldCheck, Weight } from "lucide-react";

import { appCopy } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { cargoTypeLabels, shipperCopy, type CargoType } from "@/data/shipper-demo";

export const Route = createFileRoute("/app/shipper/load-type")({ component: LoadTypeScreen });

const icons = [Box, Snowflake, ShieldCheck, Weight, Boxes, Sofa];

function LoadTypeScreen() {
  const { language } = useAppLanguage();
  const t = shipperCopy[language];
  const labels = cargoTypeLabels[language];

  return (
    <main className="ts-app-page" lang={language}>
      <div className="ts-app-frame ts-flow-frame">
        <header className="ts-flow-header">
          <Link to="/app/home" search={{ role: "shipper" }} className="ts-back-link" aria-label="Back"><ArrowLeft size={21} /></Link>
          <span className="ts-flow-step">{t.steps[0]} · 1 / 4</span>
        </header>
        <div className="ts-progress-track"><span style={{ width: "25%" }} /></div>
        <section className="ts-flow-content">
          <span className="ts-login-role">{appCopy[language].roleShipper}</span>
          <h1>{t.heading}</h1>
          <div className="ts-cargo-options">
            {cargoTypeLabels.en.map((type, index) => {
              const Icon = icons[index];
              const selectedType: CargoType = type;
              return <Link className="ts-cargo-card" key={type} to="/app/shipper/new/$step" params={{ step: "size" }} search={{ loadType: selectedType }}>
                <span className="ts-cargo-icon"><Icon size={22} aria-hidden="true" /></span>
                <span className="ts-role-copy"><strong>{labels[index]}</strong><small>{t.typeDescription[index]}</small></span>
                <span className="ts-cargo-chevron" aria-hidden="true">›</span>
              </Link>;
            })}
          </div>
        </section>
        <p className="ts-app-footnote">{t.useBooking}</p>
      </div>
    </main>
  );
}