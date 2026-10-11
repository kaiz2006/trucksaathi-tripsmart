import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, MessageCircle, PackageCheck, Truck } from "lucide-react";

import { AppTabs } from "@/components/trucksaathi/app-tabs";
import { getAppRole, workflowCopy } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { apiPatch } from "@/lib/api-client";

export const Route = createFileRoute("/app/notifications")({
  validateSearch: (search: Record<string, unknown>) => ({ role: getAppRole(search) }),
  component: NotificationsScreen,
});

const initialMessages = [
  { id: "notification-1", kind: "match", time: "10:42 AM", title: "Truck found for your load", message: "Ludhiana → Delhi · 8 t general cargo. Manpreet Singh can pick up today at 4:30 PM.", unread: true, actions: ["View match", "Not now"] },
  { id: "notification-2", kind: "return", time: "9:18 AM", title: "Return load available", message: "Delhi → Ludhiana, 8 t, ₹14,000. This fills your return trip and avoids 320 empty km.", unread: true, actions: ["YES, accept", "Decline"] },
  { id: "notification-3", kind: "trip", time: "Yesterday", title: "Shipment delivered", message: "Your shipment TS-1796 arrived in Jaipur. Rate your experience.", unread: false, actions: ["Rate trip"] },
  { id: "notification-4", kind: "match", time: "8 Oct", title: "A reefer truck is available", message: "Delhi → Jaipur · 4 t temperature-sensitive goods · 2–8°C supported.", unread: false, actions: ["View details"] },
];
const hindiMessages = [
  { id: "notification-1", kind: "match", time: "10:42 AM", title: "आपके लोड के लिए ट्रक मिला", message: "लुधियाना → दिल्ली · 8 टन सामान्य माल। मनप्रीत सिंह आज शाम 4:30 बजे पिकअप कर सकते हैं।", unread: true, actions: ["मिलान देखें", "अभी नहीं"] },
  { id: "notification-2", kind: "return", time: "9:18 AM", title: "वापसी का लोड उपलब्ध", message: "दिल्ली → लुधियाना, 8 टन, ₹14,000। इससे वापसी यात्रा भरेगी और 320 खाली किमी बचेंगे।", unread: true, actions: ["हाँ, स्वीकारें", "मना करें"] },
  { id: "notification-3", kind: "trip", time: "कल", title: "शिपमेंट डिलीवर हुआ", message: "आपका शिपमेंट TS-1796 जयपुर पहुँच गया। अपना अनुभव बताएँ।", unread: false, actions: ["रेटिंग दें"] },
  { id: "notification-4", kind: "match", time: "8 Oct", title: "रेफर ट्रक उपलब्ध है", message: "दिल्ली → जयपुर · 4 टन तापमान-संवेदनशील माल · 2–8°C सुविधा।", unread: false, actions: ["विवरण देखें"] },
];

function NotificationsScreen() {
  const { role } = Route.useSearch();
  const { language } = useAppLanguage();
  const copy = workflowCopy[language];
  const [messages, setMessages] = useState(language === "hi" ? hindiMessages : initialMessages);
  const [replies, setReplies] = useState<Record<string, string>>({});
  function reply(id: string, value: string) {
    setReplies((current) => ({ ...current, [id]: value }));
    setMessages((current) => current.map((message) => message.id === id ? { ...message, unread: false } : message));
    void apiPatch(`/notifications/${encodeURIComponent(id)}/reply`, { reply: value });
  }
  return <main className="ts-app-page" lang={language}><div className="ts-app-frame ts-workspace-frame"><header className="ts-app-header"><Link to="/app/home" search={{ role }} className="ts-brand"><span className="ts-brand-mark"><Bell size={18} /></span><span>TruckSaathi<span className="ts-brand-period">.</span></span></Link><span className="ts-language">{copy.whatsappDemo}</span></header><section className="ts-workspace-welcome ts-list-welcome"><span className="ts-kicker">{copy.inbox}</span><h1>{copy.inboxTitle}</h1><p>{copy.inboxIntro}</p></section><section className="ts-message-list">{messages.map((message) => { const Icon = message.kind === "return" ? Truck : message.kind === "trip" ? PackageCheck : MessageCircle; return <article className={`ts-message ${message.unread ? "is-unread" : ""}`} key={message.id}><div className="ts-message-icon"><Icon size={18} /></div><div className="ts-message-body"><div className="ts-message-heading"><strong>{message.title}</strong><time>{message.time}</time></div><p>{message.message}</p>{replies[message.id] ? <span className="ts-message-reply" role="status"><Check size={13} />{language === "en" ? "Reply sent:" : "जवाब भेजा:"} {replies[message.id]}</span> : <div className="ts-quick-replies">{message.actions.map((action) => <button type="button" key={action} onClick={() => reply(message.id, action)}>{action}</button>)}</div>}</div></article>; })}</section><AppTabs role={role} active="notifications" /></div></main>;
}