import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  Star,
  Sun,
  Truck,
  UserRound,
} from "lucide-react";

import { AppTabs } from "@/components/trucksaathi/app-tabs";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { useAppTheme } from "@/components/trucksaathi/app-theme";
import { appCopy, getAppRole, workflowCopy } from "@/data/app-copy";

export const Route = createFileRoute("/app/profile")({
  validateSearch: (search: Record<string, unknown>) => ({ role: getAppRole(search) }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const navigate = useNavigate();
  const { role } = Route.useSearch();
  const { language, setLanguage } = useAppLanguage();
  const { theme, setTheme } = useAppTheme();
  const t = appCopy[language];
  const copy = workflowCopy[language];

  return (
    <main className="ts-app-page" lang={language} id="main-content">
      <div className="ts-app-frame ts-workspace-frame">
        <header className="ts-app-header">
          <Link to="/app/home" search={{ role, phone: undefined }} className="ts-brand">
            <span className="ts-brand-mark">
              <UserRound size={18} />
            </span>
            <span>
              TruckSaathi<span className="ts-brand-period">.</span>
            </span>
          </Link>
          <Languages size={20} />
        </header>
        <section className="ts-profile-summary">
          <span className="ts-profile-avatar">{role === "shipper" ? "SK" : "MS"}</span>
          <div>
            <h1>{role === "shipper" ? "Sharma Foods & Exports" : copy.driver}</h1>
            <p>+91 98765 43210</p>
          </div>
          <BadgeCheck className="ts-verified-icon" size={22} />
        </section>
        <div className="ts-profile-rating">
          <Star size={17} fill="currentColor" />
          <strong>4.9</strong>
          <span>· 28 completed journeys</span>
        </div>
        <section className="ts-profile-details">
          <div className="ts-profile-row">
            <span>
              <UserRound size={18} />
              {role === "shipper" ? copy.profileTitle : copy.driverTitle}
            </span>
            <strong>
              {role === "shipper" ? "Sharma Foods & Exports" : t.roleTransporter}
              <ChevronRight size={17} />
            </strong>
          </div>
          <div className="ts-profile-row">
            <span>
              <BadgeCheck size={18} />
              {copy.verifiedProfile}
            </span>
            <strong className="ts-good-status">
              {copy.verifiedProfile}
              <ChevronRight size={17} />
            </strong>
          </div>
          <button
            className="ts-profile-row ts-profile-action"
            type="button"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          >
            <span>
              <Languages size={18} />
              {t.language}
            </span>
            <strong>
              {language === "en" ? copy.languageEnglish : copy.languageHindi}
              <ChevronRight size={17} />
            </strong>
          </button>
          <button
            className="ts-profile-row ts-profile-action"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {t.theme}
            </span>
            <strong>
              {theme === "dark" ? t.switchToLight : t.switchToDark}
              <ChevronRight size={17} />
            </strong>
          </button>
          <Link className="ts-profile-row" to="/app/activity" search={{ role, phone: undefined }}>
            <span>
              <Truck size={18} />
              {role === "shipper" ? t.activityTab : copy.fleetLabel}
            </span>
            <strong>
              {role === "shipper" ? "3" : language === "en" ? "5 trucks" : "5 ट्रक"}
              <ChevronRight size={17} />
            </strong>
          </Link>
        </section>
        <button
          className="ts-role-switch"
          type="button"
          onClick={() => {
            const nextRole = role === "shipper" ? "transporter" : "shipper";
            void navigate({ to: "/app/home", search: { role: nextRole, phone: undefined } });
          }}
        >
          <LogOut size={17} />
          {copy.switchRole}
          <ChevronRight size={17} />
        </button>
        <button
          className="ts-role-switch"
          type="button"
          onClick={async () => {
            try {
              await fetch("http://localhost:3001/api/demo/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              sessionStorage.removeItem("trucksaathi.demo.role");
              void navigate({ to: "/app" });
            } catch {
              sessionStorage.removeItem("trucksaathi.demo.role");
              void navigate({ to: "/app" });
            }
          }}
        >
          <LogOut size={17} />
          Reset demo data
          <ChevronRight size={17} />
        </button>
        <AppTabs role={role} active="profile" />
      </div>
    </main>
  );
}
