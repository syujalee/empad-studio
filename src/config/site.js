// Business constants shared by the UI, the WhatsApp helper and the prerendered <head>.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/+$/, '');

export const SITE_NAME = 'EMPAD Studio';

export const WHATSAPP_NUMBER = '6282177432116';
export const WHATSAPP_DISPLAY = '+62 821-7743-2116';

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/empad.studio',
  tiktok: 'https://tiktok.com/@empad.studio',
};

export const OPENING_HOURS = { opens: '11:00', closes: '21:00', label: '11.00 — 21.00 WIB', note: '(Setiap Hari)' };

export const MAP = {
  url: 'https://maps.app.goo.gl/MZpA2ghCywWycLoZ6',
  embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.872100549993!2d104.83181019999999!3d-3.381414099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e3bed2b42bfbca5%3A0xa6560e08db754430!2sSTUDIO%20EMPAD!5e0!3m2!1sen!2sid!4v1779195564467!5m2!1sen!2sid',
  // Taken from the !3d (lat) / !2d (lng) parameters of the embed URL above.
  latitude: -3.381414099999998,
  longitude: 104.83181019999999,
};
