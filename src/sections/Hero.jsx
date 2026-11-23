import { WHATSAPP_MESSAGES } from '../data/whatsapp-messages.js';
import { buildWhatsAppUrl } from '../lib/whatsapp.js';
import { ButtonLink } from '../components/ui/ButtonLink.jsx';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex h-[100vh] min-h-[600px] items-center justify-center overflow-hidden">
      <ParallaxBackground image="/assets/background/bg_1.webp">
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(12,12,12,0.15)_0%,rgba(12,12,12,0.5)_60%,#121212_100%)]" />
      </ParallaxBackground>
      <div className="relative z-[2] animate-[fadeUp_1.2s_ease-out] px-6 text-center">
        <div className="hero-glass">
          <p className="mb-5 text-[0.75rem] font-semibold tracking-[4px] text-gold">SELF &amp; PHOTO STUDIO</p>
          <h1 id="hero-title" className="mb-5 font-heading text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.1] font-semibold mobile:text-[clamp(2rem,9vw,3.5rem)]">
            Timeless Moments,<br /><em className="text-gold">Crafted Beautifully.</em>
          </h1>
          <p className="mx-auto mb-9 max-w-[480px] text-[1.05rem] text-muted phone:text-[0.92rem]">
            Abadikan setiap momen berharga dengan sentuhan profesional di studio premium kami.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mobile:flex-col mobile:items-center">
            <ButtonLink href="#pricelist" className="btn-lg">Lihat Pricelist</ButtonLink>
            <ButtonLink href={buildWhatsAppUrl(WHATSAPP_MESSAGES.hero)} variant="outline" className="btn-lg">
              Reservasi Sekarang
            </ButtonLink>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-[2] flex [transform:translateX(-50%)] flex-col items-center gap-2" aria-hidden="true">
        <span className="text-[0.7rem] tracking-[3px] text-dim uppercase">Scroll</span>
        <div className="h-10 w-px animate-[scrollPulse_2s_ease-in-out_infinite] bg-[linear-gradient(to_bottom,var(--color-gold),transparent)]" />
      </div>
    </section>
  );
}
