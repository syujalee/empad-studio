import { EXPERIENCE_FEATURES, EXPERIENCE_GALLERY } from '../data/experience.js';
import { AirConIcon, LayersIcon, LightingIcon, StudioIcon } from '../components/ui/icons.jsx';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';

const FEATURE_ICONS = { studio: StudioIcon, lighting: LightingIcon, aircon: AirConIcon, layers: LayersIcon };

export function Experience() {
  const { main, thumbs } = EXPERIENCE_GALLERY;
  return (
    <section id="experience" aria-labelledby="experience-title" className="section">
      <ParallaxBackground image="/assets/background/bg_2.webp" className="section-bg" />
      <div className="tempered-glass w-full p-12">
        <div className="grid grid-cols-[1fr_1fr] items-center gap-16 tablet:grid-cols-[1fr] tablet:gap-10">
          <div>
            <SectionHeading id="experience-title" tag="THE EXPERIENCE" title="Lebih dari Sekadar" accent="Studio Foto." lineBreak />
            <Reveal as="p" className="mb-9 text-[1rem] leading-[1.8] text-muted">
              Di EMPAD, kami menciptakan pengalaman yang tak terlupakan. Setiap detail dirancang untuk kenyamanan Anda — dari pencahayaan profesional hingga suasana yang hangat dan eksklusif.
            </Reveal>
            <div className="grid grid-cols-[1fr_1fr] gap-5 mobile:grid-cols-[1fr]">
              {EXPERIENCE_FEATURES.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <Reveal key={feature.title} className="flex items-start gap-[14px]">
                    <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-[10px] bg-[rgba(212,175,55,0.1)] text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="mb-0.5 text-[0.9rem] font-semibold">{feature.title}</h3>
                      <p className="text-[0.78rem] text-muted">{feature.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Reveal className="group aspect-[16/10] overflow-hidden rounded-card">
              <img
                {...main}
                loading="lazy"
                className="h-full w-full object-cover [transition:transform_0.6s_ease] group-hover:[transform:scale(1.03)]"
              />
            </Reveal>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-3">
              {thumbs.map((thumb) => (
                <Reveal
                  key={thumb.src}
                  as="img"
                  {...thumb}
                  loading="lazy"
                  className="aspect-square w-full rounded-sm object-cover transition-all hover:[transform:scale(1.05)] hover:opacity-85"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
