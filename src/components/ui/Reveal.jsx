import { useReveal } from '../../hooks/useReveal.js';

// Wraps an element in the scroll-reveal animation without changing its markup.
export function Reveal({ as: Tag = 'div', ...props }) {
  const ref = useReveal();
  return <Tag ref={ref} {...props} />;
}
