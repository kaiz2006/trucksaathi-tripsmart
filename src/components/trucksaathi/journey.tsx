import { ArrowDown, ArrowUpRight, Check, CircleCheck, Truck } from 'lucide-react';
import copy from '@/data/landing-copy.json';
export type Copy = typeof copy.en;

export function RouteMap({ t }: { t: Copy }) {
  return <div className="route-map" aria-hidden="true">
    <svg viewBox="0 0 700 650" className="network-map">
      <defs><pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" className="map-grid-line"/><circle cx="0" cy="0" r="1" className="map-grid-dot"/></pattern></defs>
      <rect width="700" height="650" fill="url(#map-grid)"/>
      <path className="map-region" d="M172 46 243 39 264 66 327 46 365 81 398 105 385 151 438 176 449 229 488 258 509 314 543 342 529 401 586 429 567 488 520 499 481 557 420 588 371 572 329 609 291 580 265 524 210 499 189 446 147 405 175 359 150 306 189 257 162 208 188 158 151 107Z"/>
      <g className="map-roads"><path d="M120 180 258 201 343 173 506 128"/><path d="M110 324 287 274 410 316 590 284"/><path d="M166 472 351 404 510 469 620 430"/><path d="M254 95 287 274 351 404 325 587"/><path d="M413 139 372 249 410 316 437 551"/><path d="M156 400 260 358 343 173 399 60"/><path d="M287 274 427 232 543 342"/></g>
      <path className="map-route-back" d="M258 201C235 269 318 282 351 404"/>
      <path className="map-route-forward" d="M258 201C339 219 322 332 351 404"/>
      <g className="map-city"><circle cx="258" cy="201" r="8"/><circle cx="351" cy="404" r="8"/></g>
      <g className="map-secondary-city"><circle cx="343" cy="173" r="3"/><circle cx="287" cy="274" r="3"/><circle cx="230" cy="484" r="3"/></g>
      <text x="154" y="189" className="map-city-label">{t.ludhiana}</text><text x="370" y="425" className="map-city-label">{t.delhi}</text>
      <text x="357" y="166" className="map-small-label">{t.chandigarh}</text><text x="298" y="279" className="map-small-label">{t.ambala}</text><text x="178" y="507" className="map-small-label">{t.jaipur}</text>
      <g transform="translate(312 300) rotate(65)" className="map-truck"><rect x="-14" y="-8" width="28" height="16" rx="3"/><path d="M5-8V8M-8-11v3M8-11v3M-8 8v3M8 8v3"/></g>
    </svg>
    <div className="map-coordinate"><span className="status-dot"/>{t.north}</div>
  </div>;
}

export function JourneyPlan({ t }: { t: Copy }) {
  return <div className="journey-plan">
    <div className="journey-heading"><span><Truck size={17}/>{t.journey}</span><span className="optimized"><span className="status-dot"/>{t.optimized}</span></div>
    <div className="journey-stops"><div><span className="stop-dot"/><strong>{t.ludhiana}</strong><small>{t.outbound}</small></div><ArrowDown size={18}/><div><span className="stop-dot end"/><strong>{t.delhi}</strong><small>{t.return}</small></div><ArrowDown size={18}/><div><span className="stop-dot"/><strong>{t.ludhiana}</strong><small>{t.journeyKm}</small></div></div>
    <div className="journey-metrics"><div><span>{t.loaded}</span><strong>620 <small>{t.km}</small></strong></div><div><span>{t.utilization}</span><strong>100<small>%</small><ArrowUpRight size={16}/></strong></div></div>
    <div className="loaded-bar"><span/></div>
    <div className="journey-earning"><span>{t.extra}</span><strong>₹18,500 <ArrowUpRight size={17}/></strong></div>
    <div className="journey-confirmed"><CircleCheck size={14}/>{t.matched}</div>
  </div>;
}

export function TruckIllustration() {
  return <svg className="truck-illustration" viewBox="0 0 320 160" aria-hidden="true"><path className="truck-ground" d="M8 137H312"/><rect className="truck-box" x="30" y="35" width="174" height="90" rx="3"/><path className="truck-cab" d="M208 67H255L286 98V125H208Z"/><path className="truck-window" d="M219 76H252L272 98H219Z"/><path className="truck-detail" d="M45 48v60m15-60v60m15-60v60m15-60v60m15-60v60m15-60v60m15-60v60m15-60v60m15-60v60m15-60v60"/><circle className="truck-wheel" cx="80" cy="127" r="17"/><circle className="truck-wheel" cx="170" cy="127" r="17"/><circle className="truck-wheel" cx="255" cy="127" r="17"/><g className="truck-hub"><circle cx="80" cy="127" r="6"/><circle cx="170" cy="127" r="6"/><circle cx="255" cy="127" r="6"/></g><path className="truck-speed" d="M5 70H22M0 87H22M9 104H22"/></svg>;
}
