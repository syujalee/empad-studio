import { useEffect, useRef } from 'react';

const STAGGER_MS = 60;
const REVEAL_MS = 700;
let observer;

// One shared observer so elements entering together are staggered by their batch index, as before.
function getObserver() {
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      setTimeout(() => {
        element.dataset.reveal = 'visible';
        // Drop the reveal state once it has finished so the element's own transform/transition
        // rules apply again (fixes B-01/B-02 where reveal overrode them permanently).
        setTimeout(() => delete element.dataset.reveal, REVEAL_MS);
      }, index * STAGGER_MS);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  return observer;
}

// The state lives in a data attribute React does not own, so re-renders never reset it and the
// prerendered HTML stays visible until hydration.
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const revealObserver = getObserver();
    element.dataset.reveal = 'hidden';
    revealObserver.observe(element);
    return () => {
      revealObserver.unobserve(element);
      delete element.dataset.reveal;
    };
  }, []);

  return ref;
}
