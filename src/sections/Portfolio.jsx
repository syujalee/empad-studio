import { useCallback, useEffect, useRef, useState } from 'react';
import { PORTFOLIO_FILTERS, PORTFOLIO_ITEMS } from '../data/portfolio.js';
import { prefersReducedMotion } from '../lib/motion.js';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Lightbox } from './Lightbox.jsx';

const itemClass = 'group relative aspect-square cursor-pointer overflow-hidden rounded-card';
const mediaClass = 'h-full w-full object-cover [transition:transform_0.5s_ease] group-hover:[transform:scale(1.05)]';

function ItemOverlay({ label }) {
  return (
    <div className="absolute inset-0 flex items-end bg-[linear-gradient(0deg,rgba(12,12,12,0.7)_0%,transparent_50%)] p-5 opacity-0 transition-all group-hover:opacity-100">
      <span className="font-heading text-[1.2rem] font-semibold text-gold">{label}</span>
    </div>
  );
}

function filterButtonClass(active) {
  const base = 'min-h-11 rounded-pill border px-6 py-2.5 text-[0.82rem] transition-all';
  // Active state wins over hover, as in the legacy cascade.
  return active
    ? `${base} border-gold bg-gold font-semibold text-[#121212]`
    : `${base} border-[rgba(255,255,255,0.08)] font-medium text-muted hover:border-[rgba(212,175,55,0.3)] hover:text-foreground`;
}

function ImageItem({ item, hidden, animated, onOpen }) {
  const open = (event) => onOpen(item, event.currentTarget);
  return (
    <Reveal
      role="button"
      tabIndex={0}
      aria-label={`Lihat foto: ${item.alt}`}
      className={`${itemClass} ${hidden ? 'hidden' : ''} ${animated ? 'filter-animate' : ''}`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(event);
      }}
    >
      <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" className={mediaClass} />
      <ItemOverlay label={item.label} />
    </Reveal>
  );
}

const isTouchOnly = () => window.matchMedia('(hover: none)').matches;

function playPreview(video) {
  video.muted = true;
  // Rejections (e.g. play interrupted by pause) are expected for a decorative preview.
  video.play()?.catch(() => {});
}

function stopPreview(video) {
  video.pause();
  video.currentTime = 0;
}

// Hover preview on pointer devices; on touch screens (no hover) it plays while in view (B-03).
function VideoItem({ item, hidden, animated }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isTouchOnly() || prefersReducedMotion()) return undefined;
    const video = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) playPreview(video);
      else video.pause();
    }, { threshold: 0.5 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <Reveal
      className={`${itemClass} ${hidden ? 'hidden' : ''} ${animated ? 'filter-animate' : ''}`}
      onMouseEnter={() => !isTouchOnly() && playPreview(videoRef.current)}
      onMouseLeave={() => !isTouchOnly() && stopPreview(videoRef.current)}
    >
      <video ref={videoRef} src={item.src} width={item.width} height={item.height} muted loop playsInline className={mediaClass} />
      <ItemOverlay label={item.label} />
    </Reveal>
  );
}

export function Portfolio() {
  const [filter, setFilter] = useState('all');
  const [filtered, setFiltered] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const isVisible = (item) => filter === 'all' || item.category === filter;

  const openLightbox = (item, opener) => {
    const images = PORTFOLIO_ITEMS.filter((entry) => entry.type === 'image' && isVisible(entry));
    setLightbox({ images, index: images.indexOf(item), opener });
  };
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const navigateLightbox = useCallback((step) => {
    setLightbox((current) => ({ ...current, index: (current.index + step + current.images.length) % current.images.length }));
  }, []);

  return (
    <>
      <section id="portfolio" aria-labelledby="portfolio-title" className="section">
        <ParallaxBackground image="/assets/background/bg_5.webp" className="section-bg" />
        <div className="tempered-glass w-full px-12 py-14">
          <SectionHeading id="portfolio-title" tag="OUR WORKS" title="Portfolio" accent="Showcase" center />
          <div className="mb-10 flex flex-wrap justify-center gap-3" role="group" aria-label="Filter portfolio">
            {PORTFOLIO_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                className={filterButtonClass(filter === value)}
                onClick={() => {
                  setFilter(value);
                  setFiltered(true);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[repeat(3,1fr)] gap-5 tablet:grid-cols-[repeat(2,1fr)] mobile:grid-cols-[1fr]">
            {PORTFOLIO_ITEMS.map((item) => {
              const shared = { item, hidden: !isVisible(item), animated: filtered };
              return item.type === 'video'
                ? <VideoItem key={item.src} {...shared} />
                : <ImageItem key={item.src} {...shared} onOpen={openLightbox} />;
            })}
          </div>
        </div>
      </section>
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          returnFocusTo={lightbox.opener}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}
