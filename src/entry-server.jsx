import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';
import { MAP, OPENING_HOURS, SITE_NAME, SITE_URL, SOCIAL_LINKS, WHATSAPP_NUMBER } from './config/site.js';

export function render() {
  return renderToString(<StrictMode><App /></StrictMode>);
}

const OG_IMAGE = { path: '/assets/background/bg_1.png', width: 1672, height: 941 };

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function buildStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    description: 'Studio Empad - Premium Self & Photo Studio. Wisuda, Family, Engagement Photography.',
    ...(SITE_URL && { url: `${SITE_URL}/`, image: `${SITE_URL}/assets/logo/logo.jpg`, logo: `${SITE_URL}/assets/logo/logo.jpg` }),
    telephone: `+${WHATSAPP_NUMBER}`,
    priceRange: 'Rp50.000 - Rp600.000',
    geo: { '@type': 'GeoCoordinates', latitude: MAP.latitude, longitude: MAP.longitude },
    hasMap: MAP.url,
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: OPENING_HOURS.opens,
      closes: OPENING_HOURS.closes,
    }],
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok],
  };
}

// URL-dependent tags are emitted only when VITE_SITE_URL is known; absolute URLs cannot be guessed.
export function renderHead() {
  const tags = [];
  if (SITE_URL) {
    const pageUrl = escapeAttribute(`${SITE_URL}/`);
    const imageUrl = escapeAttribute(`${SITE_URL}${OG_IMAGE.path}`);
    tags.push(
      `<link rel="canonical" href="${pageUrl}"/>`,
      `<meta property="og:url" content="${pageUrl}"/>`,
      `<meta property="og:image" content="${imageUrl}"/>`,
      `<meta property="og:image:width" content="${OG_IMAGE.width}"/>`,
      `<meta property="og:image:height" content="${OG_IMAGE.height}"/>`,
      `<meta name="twitter:image" content="${imageUrl}"/>`,
    );
  }
  const json = JSON.stringify(buildStructuredData()).replace(/</g, '\u003c');
  tags.push(`<script type="application/ld+json">${json}</script>`);
  return tags.join('\n    ');
}

export { SITE_URL };
