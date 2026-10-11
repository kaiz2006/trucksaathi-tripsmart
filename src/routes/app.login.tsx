import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Route as RouteIcon } from "lucide-react";

import { appCopy, getAppRole } from "@/data/app-copy";
import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { apiPost } from "@/lib/api-client";

export const Route = createFileRoute("/app/login")({
  validateSearch: (search: Record<string, unknown>) => ({ role: getAppRole(search) }),
  component: MockLogin,
});

function MockLogin() {
  const { role } = Route.useSearch();
  const { language, setLanguage } = useAppLanguage();
  const [phone, setPhone] = useState("9876500010");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const t = appCopy[language];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPhone = sessionStorage.getItem("trucksaathi.demo.phone");
    if (storedPhone) {
      setPhone(storedPhone);
      setSent(true);
    }
  }, []);

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t.phoneError);
      return;
    }
    setError("");
    try {
      await apiPost("/auth/otp", { phone, role });
    } catch {
      setError(language === "en" ? "The demo service is unavailable. Start the app with npm run dev." : "डेमो सेवा उपलब्ध नहीं है। npm run dev से ऐप शुरू करें।");
      return;
    }
    sessionStorage.setItem("trucksaathi.phone", phone);
    sessionStorage.setItem("trucksaathi.demo.phone", phone);
    setSent(true);
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loginPhone = phone || sessionStorage.getItem("trucksaathi.phone") || "";
    if (!/^\d{4}$/.test(code)) {
      setError(t.otpError);
      return;
    }
    setError("");
    try {
      await apiPost("/auth/verify", { phone: loginPhone, role, code, language });
    } catch {
      setError(language === "en" ? "Could not verify with the demo service. Please retry." : "डेमो सेवा से वेरिफाई नहीं हुआ। फिर कोशिश करें।");
      return;
    }
    sessionStorage.setItem("trucksaathi.auth.role", role);
    sessionStorage.setItem("trucksaathi.auth.phone", loginPhone);
    window.location.assign(`/app/home?role=${role}&phone=${encodeURIComponent(loginPhone)}`);
  }

  return (
    <main className="ts-app-page" lang={language}>
      <div className="ts-app-frame ts-login-frame">
        <header className="ts-app-header">
          <Link to="/app" className="ts-back-link" aria-label={language === "en" ? "Back" : "वापस"}><ArrowLeft size={21} /></Link>
          <Link to="/" className="ts-brand" aria-label="TruckSaathi landing page">
            <span className="ts-brand-mark"><RouteIcon size={20} aria-hidden="true" /></span>
            <span>TruckSaathi<span className="ts-brand-period">.</span></span>
          </Link>
          <div className="ts-language" aria-label={t.language}>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => setLanguage("hi")} aria-pressed={language === "hi"}>हिं</button>
          </div>
        </header>

        <section className="ts-login-content">
          <span className="ts-login-role">{role === "shipper" ? t.roleShipper : t.roleTransporter}</span>
          <h1>{sent ? t.otpTitle : t.loginTitle}</h1>
          <p>{sent ? t.otpIntro : t.loginIntro}</p>

          {!sent ? (
            <form className="ts-login-form" onSubmit={submitPhone} noValidate>
              <label htmlFor="ts-phone">{t.phoneLabel}</label>
              <input id="ts-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t.phonePlaceholder} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} aria-invalid={Boolean(error)} aria-describedby={error ? "ts-login-error" : undefined} />
              {error && <p className="ts-field-error" id="ts-login-error" role="alert">{error}</p>}
              <button className="ts-primary-button" type="submit">{t.sendCode}<ArrowRight size={19} /></button>
            </form>
          ) : (
            <form className="ts-login-form" onSubmit={submitCode} noValidate>
              <label htmlFor="ts-otp">{t.otpLabel}</label>
              <input id="ts-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} placeholder="••••" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-invalid={Boolean(error)} aria-describedby="ts-otp-hint" />
              <span className="ts-otp-hint" id="ts-otp-hint">{t.otpHint}</span>
              {error && <p className="ts-field-error" role="alert">{error}</p>}
              <button className="ts-primary-button" type="submit">{t.verify}<ArrowRight size={19} /></button>
              <button className="ts-text-button" type="button" onClick={() => { setSent(false); setError(""); }}>{t.phoneLabel}</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}