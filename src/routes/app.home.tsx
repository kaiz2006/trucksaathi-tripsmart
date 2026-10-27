import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  House,
  UserRound,
  TrendingUp,
  Truck,
  Package,
  Clock,
  Building2,
  Zap,
} from "lucide-react";

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

        {/* Quick Stats */}
        <section className="ts-home-stats">
          <div className="ts-stat-card">
            <div className="ts-stat-icon">
              <TrendingUp size={20} />
            </div>
            <div>
              <strong>{role === "shipper" ? "28" : "156"}</strong>
              <small>
                {role === "shipper"
                  ? language === "en"
                    ? "Bookings"
                    : "बुकिंग"
                  : language === "en"
                    ? "Trips"
                    : "यात्राएं"}
              </small>
            </div>
          </div>
          <div className="ts-stat-card">
            <div className="ts-stat-icon">
              <Truck size={20} />
            </div>
            <div>
              <strong>{role === "shipper" ? "4.9" : "4.8"}</strong>
              <small>{language === "en" ? "Rating" : "रेटिंग"}</small>
            </div>
          </div>
          <div className="ts-stat-card">
            <div className="ts-stat-icon">
              <Package size={20} />
            </div>
            <div>
              <strong>{role === "shipper" ? "₹4.2L" : "₹18.5K"}</strong>
              <small>{language === "en" ? "This Month" : "इस महीने"}</small>
            </div>
          </div>
        </section>

        {/* Enterprise Banner */}
        <section className="ts-enterprise-banner">
          <div className="ts-enterprise-content">
            <Building2 size={24} />
            <div>
              <h3>{language === "en" ? "Enterprise Solutions" : "एंटरप्राइज़ समाधान"}</h3>
              <p>
                {language === "en"
                  ? "Bulk booking, API access, dedicated support"
                  : "बल्क बुकिंग, API एक्सेस, समर्पित सहायता"}
              </p>
            </div>
            <Zap size={20} className="ts-enterprise-icon" />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="ts-recent-activity">
          <h3>{language === "en" ? "Recent Activity" : "हाल की गतिविधि"}</h3>
          <div className="ts-activity-item">
            <div className="ts-activity-icon">
              <Clock size={18} />
            </div>
            <div className="ts-activity-content">
              <strong>{role === "shipper" ? "Load to Delhi" : "Delhi → Ludhiana"}</strong>
              <small>{language === "en" ? "2 hours ago" : "2 घंटे पहले"}</small>
            </div>
            <span className="ts-activity-status ts-status-success">
              {language === "en" ? "Completed" : "पूर्ण"}
            </span>
          </div>
          <div className="ts-activity-item">
            <div className="ts-activity-icon">
              <Truck size={18} />
            </div>
            <div className="ts-activity-content">
              <strong>{role === "shipper" ? "Load to Jaipur" : "Jaipur → Delhi"}</strong>
              <small>{language === "en" ? "Yesterday" : "कल"}</small>
            </div>
            <span className="ts-activity-status ts-status-success">
              {language === "en" ? "Completed" : "पूर्ण"}
            </span>
          </div>
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
