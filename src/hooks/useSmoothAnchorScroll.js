import { useEffect } from 'react';
import { prefersReducedMotion } from '../lib/motion.js';

// Delegated handler for every in-page "#section" link, matching the legacy scrollIntoView behaviour.
export function useSmoothAnchorScroll() {
  useEffect(() => {
    const handleClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
