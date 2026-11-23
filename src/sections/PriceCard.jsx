import { buildWhatsAppUrl } from '../lib/whatsapp.js';
import { ButtonLink } from '../components/ui/ButtonLink.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';

export function PriceCard({ pkg }) {
  return (
    <Reveal className={`price-card ${pkg.featured ? 'featured' : ''}`.trim()}>
      {pkg.badge && (
        <div className="absolute -top-px right-6 rounded-[0_0_8px_8px] bg-gold px-4 py-1.5 text-[0.7rem] font-bold tracking-[0.5px] text-[#121212] uppercase">
          {pkg.badge}
        </div>
      )}
      <div className="mb-7">
        <h3 className="mb-3 font-heading text-[1.4rem] font-semibold">{pkg.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-[1rem] font-medium text-muted">Rp</span>
          <span className="font-heading text-[2.6rem] font-bold text-gold">{pkg.price}</span>
        </div>
        <p className="mt-1 text-[0.8rem] text-dim">{pkg.caption}</p>
      </div>
      <ul className="mb-7 flex-1">
        {pkg.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.04)] py-2 text-[0.88rem] text-muted before:text-[0.8rem] before:font-bold before:text-gold before:content-['✓']"
          >
            {feature}
          </li>
        ))}
      </ul>
      <ButtonLink href={buildWhatsAppUrl(pkg.whatsappMessage)} className="w-full text-center">
        {pkg.ctaLabel}
      </ButtonLink>
    </Reveal>
  );
}
