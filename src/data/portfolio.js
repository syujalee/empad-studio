export const PORTFOLIO_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'studio', label: 'Studio' },
];

const PORTRAIT_SIZE = { width: 1080, height: 1350 };

export const PORTFOLIO_ITEMS = [
  { type: 'image', category: 'engagement', label: 'Engagement', src: '/assets/portfolio/portfolio-5.webp', alt: 'Elegant bridal portrait', ...PORTRAIT_SIZE },
  { type: 'image', category: 'engagement', label: 'Engagement', src: '/assets/portfolio/portfolio-4.webp', alt: 'Portrait with blue flowers', ...PORTRAIT_SIZE },
  { type: 'image', category: 'engagement', label: 'Engagement', src: '/assets/portfolio/portfolio-2.webp', alt: 'Wedding couple portrait', ...PORTRAIT_SIZE },
  { type: 'image', category: 'engagement', label: 'Engagement', src: '/assets/portfolio/portfolio-3.webp', alt: 'Personal portrait with flowers', ...PORTRAIT_SIZE },
  { type: 'image', category: 'engagement', label: 'Engagement', src: '/assets/portfolio/portfolio-1.webp', alt: 'Engagement photography collage', ...PORTRAIT_SIZE },
  { type: 'video', category: 'studio', label: 'BTS Studio', src: '/assets/portfolio/portfolio-video-1.mp4', width: 720, height: 900 },
];
