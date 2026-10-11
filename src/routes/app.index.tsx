import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Languages, Leaf, Route as RouteIcon, Truck } from "lucide-react";

import { useAppLanguage } from "@/components/trucksaathi/app-language";
import { appCopy } from "@/data/app-copy";

export const Route = createFileRoute("/app/")({ component: AppEntry });

function AppEntry() {
	const { language, setLanguage } = useAppLanguage();
	const [impact, setImpact] = useState({ saved: 1847500, carbon: 24860, kilometres: 172430 });
	const t = appCopy[language];

	useEffect(() => {
		const demoRole = new URLSearchParams(window.location.search).get("demo");
		if (demoRole === "shipper" || demoRole === "transporter") {
			sessionStorage.setItem("trucksaathi.demo.role", demoRole);
			window.location.assign(`/app/login?role=${demoRole}`);
		}
	}, []);

	useEffect(() => {
		const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (motionReduced) return;
		const interval = window.setInterval(() => {
			setImpact((current) => ({ saved: current.saved + 250, carbon: current.carbon + 4, kilometres: current.kilometres + 28 }));
		}, 5000);
		return () => window.clearInterval(interval);
	}, []);

	const formatIndian = (value: number) => new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN").format(value);

	return (
		<main className="ts-app-page" lang={language}>
			<div className="ts-app-frame">
				<header className="ts-app-header">
					<Link to="/" className="ts-brand" aria-label="TruckSaathi landing page">
						<span className="ts-brand-mark"><RouteIcon size={20} aria-hidden="true" /></span>
						<span>TruckSaathi<span className="ts-brand-period">.</span></span>
					</Link>
					<div className="ts-language" aria-label={t.language}>
						<Languages size={17} aria-hidden="true" />
						<button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
						<span aria-hidden="true">/</span>
						<button type="button" onClick={() => setLanguage("hi")} aria-pressed={language === "hi"}>हिं</button>
					</div>
				</header>
				<section className="ts-app-intro" aria-labelledby="ts-home-title">
					<span className="ts-kicker"><span className="ts-live-dot" />{t.tagline}</span>
					<h1 id="ts-home-title">{t.homeTitle}</h1>
					<p>{t.homeIntro}</p>
				</section>
				<section className="ts-impact" aria-labelledby="ts-impact-title" aria-live="polite">
					<h2 id="ts-impact-title">{t.impactTitle}</h2>
					<div className="ts-impact-grid">
						<div className="ts-impact-item"><span>{t.moneySaved}</span><strong>₹{formatIndian(impact.saved)}</strong></div>
						<div className="ts-impact-item"><span>{t.carbonReduced}</span><strong>{formatIndian(impact.carbon)} <small>kg CO₂</small></strong></div>
						<div className="ts-impact-item"><span>{t.emptyKmAvoided}</span><strong>{formatIndian(impact.kilometres)} <small>km</small></strong></div>
					</div>
				</section>
				<section className="ts-role-list" aria-label={t.homeTitle}>
					<Link className="ts-role-card ts-role-primary" to="/app/login" search={{ role: "shipper" }}>
						<span className="ts-role-icon"><RouteIcon size={23} aria-hidden="true" /></span>
						<span className="ts-role-copy"><strong>{t.shipperRole}</strong><small>{t.shipperDescription}</small></span>
						<ArrowRight size={21} aria-hidden="true" />
					</Link>
					<Link className="ts-role-card" to="/app/login" search={{ role: "transporter" }}>
						<span className="ts-role-icon"><Truck size={23} aria-hidden="true" /></span>
						<span className="ts-role-copy"><strong>{t.transporterRole}</strong><small>{t.transporterDescription}</small></span>
						<ArrowRight size={21} aria-hidden="true" />
					</Link>
				</section>
				<div className="ts-role-list" aria-label="Quick demo access">
					<Link className="ts-role-card" to="/app?demo=shipper">Shipper demo</Link>
					<Link className="ts-role-card" to="/app?demo=transporter">Transporter demo</Link>
				</div>
				<footer className="ts-app-footnote"><Leaf size={15} aria-hidden="true" />{t.impactTitle}</footer>
			</div>
		</main>
	);
}