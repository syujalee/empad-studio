import { EXTERNAL_LINK_PROPS } from '../../lib/external-link.js';

const VARIANT_CLASS = { cta: 'btn-cta', outline: 'btn-outline' };

export function ButtonLink({ href, variant = 'cta', className = '', ...props }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      {...(external ? EXTERNAL_LINK_PROPS : {})}
      {...props}
    />
  );
}
