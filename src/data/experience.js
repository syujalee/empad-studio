export const EXPERIENCE_FEATURES = [
  { icon: 'studio', title: 'Studio Luas', description: 'Area studio nyaman & spacious' },
  { icon: 'lighting', title: 'Premium Lighting', description: 'Godox SK400II professional setup' },
  { icon: 'aircon', title: 'AC Dingin', description: 'Suhu ruangan selalu nyaman' },
  { icon: 'layers', title: 'Multi Background', description: 'Berbagai pilihan warna backdrop' },
];

const STUDIO_PHOTO_SIZE = { width: 1600, height: 1200 };

export const EXPERIENCE_GALLERY = {
  main: { src: '/assets/studio/studio-4.jpg', alt: 'Professional lighting setup', ...STUDIO_PHOTO_SIZE },
  thumbs: [
    { src: '/assets/studio/studio-3.jpg', alt: 'Studio interior', ...STUDIO_PHOTO_SIZE },
    { src: '/assets/studio/studio-2.jpg', alt: 'Lounge area Studio Empad', ...STUDIO_PHOTO_SIZE },
    { src: '/assets/studio/studio-1.jpg', alt: 'Backdrop rolls', ...STUDIO_PHOTO_SIZE },
  ],
};
