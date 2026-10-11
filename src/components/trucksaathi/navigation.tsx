import { useState } from 'react';
import { ArrowUpRight, Menu, Route, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Copy } from './journey';
export const anchors = ['how-it-works', 'features', 'pricing', 'faq'];
export function Logo() { return <a href="#top" className="logo" aria-label="TruckSaathi"><span className="logo-symbol"><Route size={22}/></span><span>Truck<span className="logo-accent">Saathi</span><span className="logo-period">.</span></span></a>; }
export function DemoButton({ t, secondary = false }: { t: Copy; secondary?: boolean }) { return <Button variant={secondary ? 'roadOutline' : 'road'} asChild size="lg"><a href={secondary ? '#how-it-works' : '/app'}>{secondary ? t.seeHow : t.demo}{secondary ? <span className="play-symbol">▷</span> : <ArrowUpRight/>}</a></Button>; }
export function Navbar({ t, lang, toggleLanguage }: { t: Copy; lang: 'en' | 'hi'; toggleLanguage: () => void }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="nav-inner"><Logo/><nav className="desktop-nav" aria-label={lang === 'en' ? 'Main navigation' : 'मुख्य नेविगेशन'}>{t.nav.map((item, i) => <a href={`#${anchors[i]}`} key={item}>{item}</a>)}</nav><div className="nav-actions"><Button variant="navLanguage" onClick={toggleLanguage} aria-label={t.language}><span className={lang === 'en' ? 'language-active' : ''}>EN</span><span className="language-divider">/</span><span className={lang === 'hi' ? 'language-active' : ''}>हिं</span></Button><div className="nav-demo"><DemoButton t={t}/></div><Button variant="navLanguage" size="icon" className="mobile-menu-button" aria-label={t.menu} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</Button></div></div>{open && <nav className="mobile-nav">{t.nav.map((item, i) => <a href={`#${anchors[i]}`} key={item} onClick={() => setOpen(false)}>{item}<ArrowUpRight size={16}/></a>)}<a href="/app" onClick={() => setOpen(false)}>{t.demo}<ArrowUpRight size={16}/></a></nav>}</header>;
}
