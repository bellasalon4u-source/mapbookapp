export const categories = [
  'Hair',
  'Beauty',
  'Massage',
  'Nails',
  'Brows',
  'Makeup',
  'Wellness',
];

export const masters = [
  {
    id: 'bella-keratin-studio',
    name: 'Bella Keratin Studio',
    title: 'Hair Extensions Specialist',
    city: 'London',
    rating: 4.9,
    priceFrom: 45,
    availableNow: true,
    lat: 51.5074,
    lng: -0.1278,
    avatar:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    description:
      'Premium hair extensions, keratin bonds and luxury beauty appointments in central London.',
    reviewCount: 128,
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Keratin Extensions', duration: '2h 30m', priceFrom: 45 },
      { id: 's2', title: 'Nano Rings', duration: '2h', priceFrom: 55 },
      { id: 's3', title: 'Consultation', duration: '30m', priceFrom: 20 },
    ],
    reviews: [
      { id: 'r1', author: 'Emily', rating: 5, text: 'Amazing result and very professional.' },
      { id: 'r2', author: 'Sophie', rating: 5, text: 'Beautiful finish and strong long-lasting bonds.' },
    ],
  },
  {
    id: 'mila-beauty-room',
    name: 'Mila Beauty Room',
    title: 'Lash & Brow Artist',
    city: 'London',
    rating: 4.8,
    priceFrom: 35,
    availableNow: true,
    lat: 51.5154,
    lng: -0.0721,
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    description:
      'Brows, lashes and soft glam appointments near Liverpool Street.',
    reviewCount: 86,
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Brow Styling', duration: '45m', priceFrom: 35 },
      { id: 's2', title: 'Lash Lift', duration: '1h', priceFrom: 50 },
      { id: 's3', title: 'Soft Glam Makeup', duration: '1h 20m', priceFrom: 65 },
    ],
    reviews: [
      { id: 'r1', author: 'Olivia', rating: 5, text: 'Perfect brows, very precise work.' },
      { id: 'r2', author: 'Amelia', rating: 4, text: 'Lovely salon and nice atmosphere.' },
    ],
  },
  {
    id: 'nadia-wellness',
    name: 'Nadia Wellness',
    title: 'Massage Therapist',
    city: 'London',
    rating: 4.7,
    priceFrom: 60,
    availableNow: false,
    lat: 51.5033,
    lng: -0.1195,
    avatar:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    description:
      'Relaxing body massage and wellness treatments near Waterloo.',
    reviewCount: 64,
    gallery: [
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Deep Tissue Massage', duration: '1h', priceFrom: 60 },
      { id: 's2', title: 'Relax Massage', duration: '1h 15m', priceFrom: 70 },
      { id: 's3', title: 'Back & Neck Massage', duration: '40m', priceFrom: 45 },
    ],
    reviews: [
      { id: 'r1', author: 'Grace', rating: 5, text: 'Very relaxing and professional.' },
      { id: 'r2', author: 'Lily', rating: 4, text: 'Felt much better after the session.' },
    ],
  },
  {
    id: 'sofia-nails-lounge',
    name: 'Sofia Nails Lounge',
    title: 'Nail Technician',
    city: 'London',
    rating: 4.9,
    priceFrom: 30,
    availableNow: true,
    lat: 51.5231,
    lng: -0.1586,
    avatar:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop',
    description:
      'Modern manicure, BIAB and gel nail appointments near Baker Street.',
    reviewCount: 112,
    gallery: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Gel Manicure', duration: '1h', priceFrom: 30 },
      { id: 's2', title: 'BIAB Overlay', duration: '1h 20m', priceFrom: 42 },
      { id: 's3', title: 'Nail Art', duration: '30m', priceFrom: 15 },
    ],
    reviews: [
      { id: 'r1', author: 'Chloe', rating: 5, text: 'Beautiful nails and clean studio.' },
      { id: 'r2', author: 'Jessica', rating: 5, text: 'Exactly what I wanted.' },
    ],
  },
  {
    id: 'victoria-glam-studio',
    name: 'Victoria Glam Studio',
    title: 'Makeup Artist',
    city: 'London',
    rating: 4.8,
    priceFrom: 70,
    availableNow: true,
    lat: 51.4952,
    lng: -0.146,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
    description:
      'Luxury event makeup and bridal styling near Victoria.',
    reviewCount: 73,
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Soft Glam Makeup', duration: '1h 15m', priceFrom: 70 },
      { id: 's2', title: 'Bridal Trial', duration: '1h 30m', priceFrom: 90 },
      { id: 's3', title: 'Evening Makeup', duration: '1h', priceFrom: 75 },
    ],
    reviews: [
      { id: 'r1', author: 'Ella', rating: 5, text: 'Stunning makeup and lovely energy.' },
      { id: 'r2', author: 'Mia', rating: 4, text: 'Very beautiful final look.' },
    ],
  },
  {
    id: 'camden-brows-bar',
    name: 'Camden Brows Bar',
    title: 'Brow Specialist',
    city: 'London',
    rating: 4.6,
    priceFrom: 28,
    availableNow: false,
    lat: 51.538,
    lng: -0.1426,
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    description:
      'Natural brow shaping, lamination and tinting in Camden.',
    reviewCount: 58,
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      { id: 's1', title: 'Brow Shape', duration: '30m', priceFrom: 28 },
      { id: 's2', title: 'Brow Lamination', duration: '50m', priceFrom: 48 },
      { id: 's3', title: 'Tint + Shape', duration: '40m', priceFrom: 36 },
    ],
    reviews: [
      { id: 'r1', author: 'Ruby', rating: 5, text: 'Brows looked clean and natural.' },
      { id: 'r2', author: 'Eva', rating: 4, text: 'Very nice specialist.' },
    ],
  },
];
