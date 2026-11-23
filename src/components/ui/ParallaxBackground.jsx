import { useParallax } from '../../hooks/useParallax.js';

export function ParallaxBackground({ image, className = '', children }) {
  const ref = useParallax();
  return (
    <div
      ref={ref}
      className={`parallax-bg ${className}`.trim()}
      style={{ backgroundImage: `url('${image}')` }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
