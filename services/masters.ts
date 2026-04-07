export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type ServiceItem = {
  slug: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  description?: string;
};

export type MasterItem = {
  id: string;
  name: string;
  title: string;
  city: string;
  category: string;
  subcategory?: string;
  avatar: string;
  cover: string;
  rating: number;
  priceFrom: number;
  availableNow: boolean;
  reviews: number;
  description: string;
  address: string;
  phone: string;
  email: string;
  social: string;
  lat: number;
  lng: number;
  gallery: string[];
  services: ServiceItem[];
  paymentMethods?: PaymentMethod[];
};

const masters: MasterItem[] = [
  {
    id: 'camden-brows-bar',
    name: 'Camden Brows Bar',
    title: 'Brow Specialist',
    city: 'London',
    category: 'beauty',
    subcategory: 'Brows & Lashes',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    priceFrom: 28,
    availableNow: false,
    reviews: 58,
    description: 'Natural brow shaping, lamination and tinting in Camden.',
    address: '8 Camden High Street, London',
    phone: '+44 7700 888222',
    email: 'camdenbrows@mapbook.app',
    social: '@camdenbrowsbar',
    lat: 51.5231,
    lng: -0.1586,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'brow-shape',
        title: 'Brow Shape',
        duration: '30m',
        price: 28,
        image:
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'brow-lamination',
        title: 'Brow Lamination',
        duration: '45m',
        price: 48,
        image:
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'brow-tint',
        title: 'Brow Tint',
        duration: '20m',
        price: 20,
        image:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'soho-barber-club',
    name: 'Soho Barber Club',
    title: 'Barber',
    city: 'London',
    category: 'barber',
    subcategory: 'Haircut',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 22,
    availableNow: true,
    reviews: 96,
    description: 'Modern barber cuts, beard trims and premium grooming in Soho.',
    address: '11 Greek Street, London',
    phone: '+44 7700 222333',
    email: 'soho@mapbook.app',
    social: '@sohobarberclub',
    lat: 51.5148,
    lng: -0.1322,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'mens-haircut',
        title: 'Men’s Haircut',
        duration: '45m',
        price: 22,
        image:
          'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'fade-cut',
        title: 'Fade Cut',
        duration: '50m',
        price: 28,
        image:
          'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'beard-trim',
        title: 'Beard Trim',
        duration: '25m',
        price: 16,
        image:
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'nadia-wellness',
    name: 'Nadia Wellness',
    title: 'Massage Therapist',
    city: 'London',
    category: 'wellness',
    subcategory: 'Massage',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    priceFrom: 60,
    availableNow: false,
    reviews: 64,
    description: 'Relaxing body massage and wellness treatments near Waterloo.',
    address: '14 Waterloo Road, London',
    phone: '+44 7700 555111',
    email: 'nadia@mapbook.app',
    social: '@nadiawellness',
    lat: 51.5033,
    lng: -0.1195,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'relaxing-body-massage',
        title: 'Relaxing Body Massage',
        duration: '60m',
        price: 60,
        image:
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'deep-tissue-massage',
        title: 'Deep Tissue Massage',
        duration: '75m',
        price: 85,
        image:
          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'wellness-session',
        title: 'Wellness Session',
        duration: '45m',
        price: 70,
        image:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'green-home-care',
    name: 'Green Home Care',
    title: 'Home Cleaning',
    city: 'London',
    category: 'home',
    subcategory: 'Cleaning',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 35,
    availableNow: true,
    reviews: 73,
    description: 'Reliable home cleaning, deep cleaning and home help across London.',
    address: '27 Baker Street, London',
    phone: '+44 7700 909101',
    email: 'greenhome@mapbook.app',
    social: '@greenhomecare',
    lat: 51.5206,
    lng: -0.155,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'standard-cleaning',
        title: 'Standard Cleaning',
        duration: '2h',
        price: 35,
        image:
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'deep-cleaning',
        title: 'Deep Cleaning',
        duration: '3h',
        price: 60,
        image:
          'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'fixmate-repairs',
    name: 'FixMate Repairs',
    title: 'Appliance Repair',
    city: 'London',
    category: 'repairs',
    subcategory: 'Appliance Repair',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    priceFrom: 50,
    availableNow: true,
    reviews: 69,
    description: 'Fast appliance and home repair services with same-day response.',
    address: '40 Marylebone Lane, London',
    phone: '+44 7700 444777',
    email: 'fixmate@mapbook.app',
    social: '@fixmaterepairs',
    lat: 51.5169,
    lng: -0.149,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'appliance-diagnostics',
        title: 'Appliance Diagnostics',
        duration: '45m',
        price: 50,
        image:
          'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'washer-repair',
        title: 'Washer Repair',
        duration: '1h 30m',
        price: 90,
        image:
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'smart-tech-london',
    name: 'Smart Tech London',
    title: 'Device Repair',
    city: 'London',
    category: 'tech',
    subcategory: 'Phone Repair',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    rating: 4.5,
    priceFrom: 40,
    availableNow: false,
    reviews: 54,
    description: 'Phone, laptop and smart device repair in central London.',
    address: '95 Oxford Street, London',
    phone: '+44 7700 333666',
    email: 'smarttech@mapbook.app',
    social: '@smarttechlondon',
    lat: 51.5152,
    lng: -0.141,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'phone-screen-repair',
        title: 'Phone Screen Repair',
        duration: '45m',
        price: 40,
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'laptop-checkup',
        title: 'Laptop Checkup',
        duration: '1h',
        price: 55,
        image:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'happy-paws-care',
    name: 'Happy Paws Care',
    title: 'Dog Walker',
    city: 'London',
    category: 'pets',
    subcategory: 'Dog Walking',
    avatar:
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 18,
    availableNow: true,
    reviews: 47,
    description: 'Dog walking, pet sitting and caring home visits in London.',
    address: '10 Islington Green, London',
    phone: '+44 7700 111202',
    email: 'happypaws@mapbook.app',
    social: '@happypawscare',
    lat: 51.5362,
    lng: -0.1035,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'dog-walking',
        title: 'Dog Walking',
        duration: '30m',
        price: 18,
        image:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'pet-sitting',
        title: 'Pet Sitting',
        duration: '1h',
        price: 22,
        image:
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
];

export function getAllMasters() {
  return masters;
}

export function getMasterById(id: string) {
  return masters.find((master) => master.id === id) || null;
}
