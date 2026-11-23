import { WHATSAPP_NUMBER } from '../config/site.js';

// Single source for every wa.me link; encodeURIComponent matches the legacy hand-encoded URLs.
export function buildWhatsAppUrl(message) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
