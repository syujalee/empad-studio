import { Fragment } from 'react';
import { BOOKING_STEPS } from '../data/booking.js';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';

export function Booking() {
  return (
    <section id="booking" aria-labelledby="booking-title" className="section">
      <ParallaxBackground image="/assets/background/bg_6.webp" className="section-bg" />
      <div className="tempered-glass w-full px-12 py-14">
        <SectionHeading id="booking-title" tag="HOW TO BOOK" title="Cara" accent="Reservasi" center />
        {/* Horizontal stepper on desktop, vertical on mobile */}
        <div className="mt-12 flex items-start justify-between gap-3 mobile:flex-col mobile:items-center">
          {BOOKING_STEPS.map((step, index) => (
            <Fragment key={step.title}>
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="mt-7 h-[2px] flex-1 bg-[linear-gradient(90deg,var(--color-gold),rgba(212,175,55,0.2))] mobile:m-0 mobile:h-10 mobile:w-[2px] mobile:flex-[0_0_40px] mobile:bg-[linear-gradient(180deg,var(--color-gold),rgba(212,175,55,0.2))]"
                />
              )}
              <Reveal className="flex-1 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[50%] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-dark))] font-heading text-[1.4rem] font-bold text-[#121212]">
                  {index + 1}
                </div>
                <h3 className="mb-1.5 text-[1rem]">{step.title}</h3>
                <p className="mx-auto max-w-[180px] text-[0.82rem] text-muted">{step.description}</p>
              </Reveal>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
