import { useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, ChevronDown, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Copy } from './journey';

// Adjustable illustrative assumptions. This calculates GROSS added revenue, not profit.
export const CALCULATOR = { tripKm: 600, returnRevenuePerKm: 35, recoveredEmptyShare: 0.6 };
export function estimateSavings(trucks: number, trips: number, emptyShare: number) {
  const km = Math.round(trucks * trips * CALCULATOR.tripKm * emptyShare / 100 * CALCULATOR.recoveredEmptyShare);
  return { km, revenue: km * CALCULATOR.returnRevenuePerKm };
}
export function Calculator({ t, lang }: { t: Copy; lang: 'en' | 'hi' }) {
  const [trucks, setTrucks] = useState(10), [trips, setTrips] = useState(4), [empty, setEmpty] = useState(40);
  const result = estimateSavings(trucks, trips, empty);
  const format = (v: number) => v.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN');
  const controls = [{ label: t.trucks, value: trucks, min: 1, max: 50, step: 1, change: setTrucks, suffix: '' }, { label: t.trips, value: trips, min: 1, max: 15, step: 1, change: setTrips, suffix: '' }, { label: t.empty, value: empty, min: 10, max: 80, step: 5, change: setEmpty, suffix: '%' }];
  return <section className="calculator-section section" id="calculator"><div className="container"><div className="section-heading"><span className="eyebrow">{t.calcLabel}</span><h2>{t.calcTitle}</h2><p>{t.calcIntro}</p></div><div className="calculator-tool"><div className="calculator-inputs">{controls.map((control, i) => <div className="slider-field" key={i}><div className="slider-label"><label htmlFor={`range-${i}`}>{control.label}</label><output htmlFor={`range-${i}`}>{control.value}{control.suffix}</output></div><input id={`range-${i}`} type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={e => control.change(Number(e.target.value))}/><div className="slider-limits"><span>{control.min}{control.suffix}</span><span>{control.max}{control.suffix}</span></div></div>)}</div><div className="calculator-result" aria-live="polite" aria-atomic="true"><span className="result-label"><span className="status-dot"/>{t.monthly}</span><div className="result-number">₹{format(result.revenue)}<ArrowUpRight/></div><div className="result-divider"/><div className="result-detail"><span>{t.saved}</span><strong>{format(result.km)} <small>{t.km}</small></strong></div><div className="result-detail"><span>{t.yearly}</span><strong>₹{format(result.revenue * 12)}</strong></div><Button variant="road" size="lg" asChild><a href="/app">{t.calcCta}<ArrowUpRight/></a></Button></div></div><p className="calculator-note">{t.calcNote}</p></div></section>;
}
export function FAQ({ t }: { t: Copy }) {
  const [active, setActive] = useState<number | null>(0);
  return <section className="section faq-section" id="faq"><div className="container faq-layout"><div className="section-heading"><span className="eyebrow">{t.faqLabel}</span><h2>{t.faqTitle}</h2></div><div className="faq-list">{t.faqs.map((item, i) => <div className={`faq-item ${active === i ? 'is-open' : ''}`} key={i}><h3><Button variant="faq" onClick={() => setActive(active === i ? null : i)} aria-expanded={active === i} aria-controls={`faq-panel-${i}`} id={`faq-toggle-${i}`}>{item.q}<Plus size={18}/></Button></h3><div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-toggle-${i}`} hidden={active !== i}><p>{item.a}</p></div></div>)}</div></div></section>;
}
export function CTA({ t }: { t: Copy }) {
  const [success, setSuccess] = useState(false);
  return <section className="cta-section section" id="request-demo"><div className="container cta-layout"><div className="section-heading"><span className="eyebrow">{t.ctaLabel}</span><h2>{t.ctaTitle}</h2><p>{t.ctaBody}</p><div className="cta-route-decoration" aria-hidden="true"><Truck/><span/><CheckCheck/></div></div>{success ? <div className="form-success" role="status"><span className="success-icon"><Check/></span><h3>{t.successTitle}</h3><p>{t.successBody}</p><Button variant="roadOutline" onClick={() => setSuccess(false)}>{t.again}</Button></div> : <form className="demo-form" onSubmit={e => { e.preventDefault(); setSuccess(true); }}><div className="form-grid"><label>{t.name}<input required name="name" autoComplete="name" placeholder={t.namePlaceholder} maxLength={80}/></label><label>{t.phone}<input required name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t.phonePlaceholder} pattern="[6-9][0-9]{9}" minLength={10} maxLength={10}/></label><label>{t.fleet}<span className="select-wrap"><select name="fleet" defaultValue="" required><option value="" disabled>{t.selectFleet}</option>{t.fleetOptions.map((x, i) => <option key={i} value={i}>{x}</option>)}</select><ChevronDown size={16}/></span></label><label>{t.city}<input name="city" autoComplete="address-level2" required placeholder={t.cityPlaceholder} maxLength={80}/></label></div><Button variant="road" size="lg" type="submit">{t.demo}<ArrowUpRight/></Button><p className="form-note">{t.formNote}</p></form>}</div></section>;
}
