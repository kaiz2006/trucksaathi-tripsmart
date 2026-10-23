import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ClipboardList, House, UserRound } from "lucide-react";

import { getAppRole } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";

export const Route = createFileRoute("/app/home")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: getAppRole(search),
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  component: WorkspaceHome,
});

function WorkspaceHome() {
  const { role } = Route.useSearch();
  const { t, language } = useAppLanguage();

  return (
    <main className="ts-app-page" lang={language} id="main-content">
      <div className="ts-app-frame ts-workspace-frame">
        <header className="ts-app-header">
          <Link to="/app" className="ts-brand" aria-label="TruckSaathi app home">
            <span className="ts-brand-mark">
              <House size={19} aria-hidden="true" />
            </span>
            <span>
              TruckSaathi<span className="ts-brand-period">.</span>
            </span>
          </Link>
          <Link
            to="/app/profile"
            search={{ role }}
            className="ts-profile-button"
            aria-label={t.profileTab}
          >
            <UserRound size={20} />
          </Link>
        </header>
        <section className="ts-workspace-welcome">
          <span className="ts-kicker">
            <span className="ts-live-dot" />
            {t.welcome}
          </span>
          <h1>{role === "shipper" ? t.startTitleShipper : t.startTitleTransporter}</h1>
          <p>{t.startDescription}</p>
        </section>
        {role === "shipper" ? (
          <Link className="ts-primary-button ts-workspace-action" to="/app/shipper/load-type">
            {t.primaryShipper}
            <Bell size={19} aria-hidden="true" />
          </Link>
        ) : (
          <Link
            className="ts-primary-button ts-workspace-action"
            to="/app/transporter/availability/$mode"
            params={{ mode: "single" }}
          >
            {t.primaryTransporter}
            <Bell size={19} aria-hidden="true" />
          </Link>
        )}
        <nav className="ts-bottom-tabs" aria-label="Main navigation">
          <Link to="/app/home" search={{ role, phone: undefined }} className="is-active">
            <House size={19} />
            <span>{t.homeTab}</span>
          </Link>
          <Link to="/app/activity" search={{ role, phone: undefined }}>
            <ClipboardList size={19} />
            <span>{t.activityTab}</span>
          </Link>
          <Link to="/app/notifications" search={{ role, phone: undefined }}>
            <Bell size={19} />
            <span>{t.notificationsTab}</span>
          </Link>
          <Link to="/app/profile" search={{ role, phone: undefined }}>
            <UserRound size={19} />
            <span>{t.profileTab}</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
