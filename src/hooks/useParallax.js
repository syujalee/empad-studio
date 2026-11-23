import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion.js';
import { subscribeToScroll } from '../lib/scroll-frame.js';

const SPEED = 0.12;

// Slow background drift relative to the parent section, same formula as the legacy site.
export function useParallax() {
  const ref = useRef(null);

  useEffect(() => {
    const background = ref.current;
    const update = () => {
      if (prefersReducedMotion()) {
        background.style.transform = '';
        return;
      }
      const section = background.parentElement;
      const scrollTop = window.scrollY;
      const inView = scrollTop + window.innerHeight > section.offsetTop
        && scrollTop < section.offsetTop + section.offsetHeight;
      if (inView) background.style.transform = `translate3d(0, ${(scrollTop - section.offsetTop) * SPEED}px, 0)`;
    };
    return subscribeToScroll(update);
  }, []);

  return ref;
}
