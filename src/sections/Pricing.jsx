import { PRICE_PACKAGES } from '../data/pricing.js';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { AddOns } from './AddOns.jsx';
import { PriceCard } from './PriceCard.jsx';

export function Pricing() {
  return (
    <section id="pricelist" aria-labelledby="pricelist-title" className="section">
      <ParallaxBackground image="/assets/background/bg_3.webp" className="section-bg" />
      <SectionHeading id="pricelist-title" tag="PACKAGES" title="Premium" accent="Pricelist" center />
      <p className="mb-12 text-center text-[1rem] text-muted">Pilih paket yang sesuai dengan kebutuhan Anda</p>
      <div className="mb-12 grid grid-cols-[repeat(3,1fr)] gap-6 tablet:grid-cols-[1fr]">
        {PRICE_PACKAGES.map((pkg) => <PriceCard key={pkg.name} pkg={pkg} />)}
      </div>
      <AddOns />
    </section>
  );
}
