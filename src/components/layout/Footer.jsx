import { MAP, OPENING_HOURS, SOCIAL_LINKS, WHATSAPP_DISPLAY } from '../../config/site.js';
import { NAV_LINKS } from '../../data/navigation.js';
import { EXTERNAL_LINK_PROPS } from '../../lib/external-link.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';
import { InstagramIcon, TikTokIcon } from '../ui/icons.jsx';
import { ParallaxBackground } from '../ui/ParallaxBackground.jsx';
import { Reveal } from '../ui/Reveal.jsx';

const SOCIALS = [
  { href: SOCIAL_LINKS.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: SOCIAL_LINKS.tiktok, label: 'TikTok', Icon: TikTokIcon },
];

const headingClass = 'mb-4 font-heading text-[1.1rem]';
const goldLinkClass = 'inline-block text-gold transition-all hover:text-gold-light';

export function Footer() {
  return (
    <footer className="footer relative overflow-hidden border-t border-[rgba(255,255,255,0.04)] bg-[#0d0d0d] px-6 pt-16 pb-6">
      <ParallaxBackground image="/assets/background/bg_7.webp" className="pointer-events-none opacity-70" />
      <div className="relative z-[2] mx-auto mb-12 grid max-w-[1200px] grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-10 tablet:grid-cols-[1fr_1fr] mobile:grid-cols-[1fr] mobile:gap-8">
        <Reveal>
          <img src="/assets/logo/logo.jpg" alt="EMPAD" width="60" height="60" className="mb-3 rounded-[50%]" />
          <p className="mb-5 text-[0.88rem] text-muted">Premium Self &amp; Photo Studio</p>
          <div className="flex gap-3">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-[50%] border border-[rgba(255,255,255,0.08)] transition-all hover:border-gold hover:text-gold"
                {...EXTERNAL_LINK_PROPS}
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </Reveal>
        <Reveal as="nav" aria-label="Navigasi footer">
          <h2 className={headingClass}>Navigasi</h2>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="block py-[5px] text-[0.85rem] text-muted transition-all hover:text-gold">
              {link.label}
            </a>
          ))}
        </Reveal>
        <Reveal>
          <h2 className={headingClass}>Jam Operasional</h2>
          <p className="text-[0.85rem] text-muted">{OPENING_HOURS.label}</p>
          <p className="text-[0.85rem] text-muted">{OPENING_HOURS.note}</p>
          <h2 className={`${headingClass} mt-5`}>Kontak</h2>
          <a href={buildWhatsAppUrl()} className={`${goldLinkClass} mt-1 text-[0.9rem] font-medium`} {...EXTERNAL_LINK_PROPS}>
            {WHATSAPP_DISPLAY}
          </a>
        </Reveal>
        <Reveal>
          <h2 className={headingClass}>Lokasi</h2>
          <div>
            <iframe
              src={MAP.embedUrl}
              width="100%"
              height="180"
              style={{ border: 0, borderRadius: 12 }}
              allowFullScreen
              loading="lazy"
              title="Lokasi Studio Empad"
            />
          </div>
          <a href={MAP.url} className={`${goldLinkClass} mt-2.5 text-[0.82rem]`} {...EXTERNAL_LINK_PROPS}>
            Buka di Google Maps →
          </a>
        </Reveal>
      </div>
      <div className="relative z-[2] border-t border-[rgba(255,255,255,0.04)] pt-6 text-center">
        <p className="text-[0.78rem] text-dim">&copy; 2026 EMPAD Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
