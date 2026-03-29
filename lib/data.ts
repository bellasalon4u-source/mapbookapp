import { Master } from './types';

export const categories = [
  'Hair',
  'Beauty',
  'Massage',
  'Nails',
  'Brows',
  'Makeup',
  'Wellness',
] as const;

export const masters: Master[] = [
  {
    id: 'bella-keratin-studio',
    name: 'Bella Keratin Studio',
    title: 'Hair Extensions Specialist',
    city: 'London',
    category: 'Hair',
    rating: 4.9,
    reviewCount: 128,
    priceFrom: 45,
    availableNow: true,
    lat: 51.5074,
    lng: -0.1278,
    avatar:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    ],
    description:
      'Luxury hair extension specialist focused on natural blends, secure long-wear bonds and premium client care.',
    services: [
      { id: '1', title: 'Keratin K-Tips', priceFrom: 120, duration: '2.5 h' },
      { id: '2', title: 'Nano Rings Refit', priceFrom: 85, duration: '1.5 h' },
      { id: '3', title: 'Tape-In Install', priceFrom: 95, duration: '1.5 h' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Olivia',
        rating: 5,
        text: 'Absolutely beautiful result. Very clean work and natural blend.',
      },
      {
        id: '2',
        author: 'Emma',
        rating: 4.9,
        text: 'Fast, аккуратно, and the extensions held perfectly.',
      },
    ],
  },
];
