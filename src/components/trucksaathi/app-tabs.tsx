import { Bell, ClipboardList, House, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { appCopy, type AppRole } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";

export function AppTabs({
  role,
  active,
}: {
  role: AppRole;
  active: "home" | "activity" | "notifications" | "profile";
}) {
  const { language } = useAppLanguage();
  const t = appCopy[language];
  const tabs = [
    { id: "home", label: t.homeTab, icon: House, to: "/app/home" as const },
    { id: "activity", label: t.activityTab, icon: ClipboardList, to: "/app/activity" as const },
    {
      id: "notifications",
      label: t.notificationsTab,
      icon: Bell,
      to: "/app/notifications" as const,
    },
    { id: "profile", label: t.profileTab, icon: UserRound, to: "/app/profile" as const },
  ];
  return (
    <nav className="ts-bottom-tabs" aria-label="Main navigation">
      {tabs.map(({ id, label, icon: Icon, to }) => (
        <Link
          key={id}
          to={to}
          search={{ role }}
          className={active === id ? "is-active" : ""}
          aria-current={active === id ? "page" : undefined}
        >
          <Icon size={19} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
