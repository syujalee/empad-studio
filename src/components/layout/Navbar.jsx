import { useCallback, useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '../../data/navigation.js';
import { WHATSAPP_MESSAGES } from '../../data/whatsapp-messages.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useScrolled } from '../../hooks/useScrolled.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';
import { ButtonLink } from '../ui/ButtonLink.jsx';

const DRAWER_ID = 'primary-navigation';

export function Navbar() {
  const scrolled = useScrolled(60);
  const isDrawerLayout = useMediaQuery('(max-width: 768px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeMenuAndRefocus = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);
  useEscapeKey(closeMenuAndRefocus, menuOpen);

  // Drawer: move focus into it on open and close it on any press outside the drawer/toggle.
  useEffect(() => {
    if (!menuOpen) return undefined;
    drawerRef.current.querySelector('a')?.focus({ preventScroll: true });
    const handlePointerDown = (event) => {
      if (drawerRef.current.contains(event.target) || toggleRef.current.contains(event.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpen]);

  return (
    <header>
      <nav
        id="navbar"
        aria-label="Navigasi utama"
        className={`fixed top-0 right-0 left-0 z-[1000] transition-all ${scrolled ? 'border-b border-[rgba(255,255,255,0.05)] bg-[rgba(18,18,18,0.3)] backdrop-blur-[8px]' : ''}`}
      >
        <div className="mx-auto flex h-nav max-w-[1200px] items-center justify-between px-6">
          <a href="#hero" className="flex items-center gap-[10px] font-heading text-[1.3rem] font-bold tracking-[2px]">
            <img src="/assets/logo/logo.jpg" alt="EMPAD Studio" width="40" height="40" className="rounded-[50%] object-cover" />
            <span>EMPAD</span>
          </a>
          {/* Off-screen drawer links stay out of the tab order and accessibility tree until opened (B-06). */}
          <ul
            id={DRAWER_ID}
            ref={drawerRef}
            className={`nav-drawer ${menuOpen ? 'is-open' : ''}`.trim()}
            inert={isDrawerLayout && !menuOpen}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="nav-link" onClick={closeMenu}>{link.label}</a>
              </li>
            ))}
          </ul>
          <ButtonLink href={buildWhatsAppUrl(WHATSAPP_MESSAGES.navbar)} className="px-6 py-2.5 text-[0.8rem] mobile:hidden">
            Book Now
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className={`hamburger ${menuOpen ? 'is-open' : ''}`}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls={DRAWER_ID}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>
    </header>
  );
}
