import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import copy from "@/data/landing-copy.json";
import { Navbar } from "@/components/trucksaathi/navigation";
import {
  Hero,
  StatStrip,
  HowItWorks,
  Comparison,
  Features,
  Pricing,
  Testimonial,
  Footer,
} from "@/components/trucksaathi/sections";
import { Calculator, FAQ, CTA } from "@/components/trucksaathi/interactive";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruckSaathi — Never drive home empty again" },
      {
        name: "description",
        content:
          "TruckSaathi plans full multi-leg journeys for Indian truck fleet owners. Match return loads, reduce empty kilometres, and earn both ways. ₹1,500 per successful match.",
      },
      { property: "og:title", content: "TruckSaathi — Never drive home empty again" },
      {
        property: "og:description",
        content:
          "Your truck’s full journey, planned. More loaded kilometres. More profit. Built for Indian fleets with 5–20 trucks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Index() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const t = copy[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".section .section-heading, .step, .feature-card").forEach((el) => {
      el.classList.add("scroll-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div id="top" className={`landing-page language-${lang}`}>
      <Navbar t={t} lang={lang} toggleLanguage={() => setLang(lang === "en" ? "hi" : "en")} />
      <main>
        <Hero t={t} />
        <StatStrip t={t} />
        <HowItWorks t={t} />
        <Comparison t={t} />
        <Features t={t} />
        <Calculator t={t} lang={lang} />
        <Pricing t={t} />
        <Testimonial t={t} />
        <FAQ t={t} />
        <CTA t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}
