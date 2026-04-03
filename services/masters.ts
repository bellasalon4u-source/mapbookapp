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
  category: string;
  city: string;
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
  paymentMethods?: string[];
  serviceModes?: string[];
  hours?: string;
};

const masters: MasterItem[] = [
  {
    id: 'bella-keratin-studio',
    name: 'Bella Keratin Studio',
    title: 'Hair Extensions Specialist',
    category: 'beauty',
    city: 'London',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 45,
    availableNow: true,
    reviews: 82,
    description:
      'Luxury hair extensions, keratin bonds, tape-ins and nano ring services in London.',
    address: '21 Soho Square, London',
    phone: '+44 7700 123456',
    email: 'bella@mapbook.app',
    social: '@bellakeratinstudio',
    lat: 51.5074,
    lng: -0.1278,
    paymentMethods: ['cash', 'card'],
    serviceModes: ['at_client'],
    hours: 'By appointment',
    gallery: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'keratin-bonds',
        title: 'Keratin Bonds',
        duration: '2h 30m',
        price: 180,
        image:
          'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1200&auto=format&fit=crop',
        description: 'Premium keratin bond installation for natural long-lasting result.',
      },
      {
        slug: 'tape-in-extensions',
        title: 'Tape-In Extensions',
        duration: '1h 45m',
        price: 150,
        image:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
        description: 'Soft seamless tape-in method with natural blend.',
      },
      {
        slug: 'nano-rings',
        title: 'Nano Ring Extensions',
        duration: '2h',
        price: 220,
        image:
          'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?q=80&w=1200&auto=format&fit=crop',
        description: 'Discrete nano ring technique for fine hair.',
      },
    ],
  },
  {
    id: 'nadia-wellness',
    name: 'Nadia Wellness',
    title: 'Massage Therapist',
    category: 'wellness',
    city: 'London',
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
    serviceModes: ['at_client', 'at_my_place'],
    hours: '10:00 - 20:00',
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
    id: 'camden-brows-bar',
    name: 'Camden Brows Bar',
    title: 'Brow Specialist',
    category: 'beauty',
    city: 'London',
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
    serviceModes: ['at_my_place'],
    hours: '11:00 - 19:00',
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
      {
        slug: 'lamination-and-tint',
        title: 'Lamination + Tint',
        duration: '60m',
        price: 58,
        image:
          'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'sparkle-home-care',
    name: 'Sparkle Home Care',
    title: 'Home Cleaning Specialist',
    category: 'home',
    city: 'London',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    priceFrom: 35,
    availableNow: true,
    reviews: 47,
    description: 'Professional home cleaning, deep cleaning and regular weekly visits.',
    address: '42 Paddington Street, London',
    phone: '+44 7700 111333',
    email: 'sparkle@mapbook.app',
    social: '@sparklehomecare',
    lat: 51.5159,
    lng: -0.1426,
    paymentMethods: ['cash', 'card'],
    serviceModes: ['at_client'],
    hours: '08:00 - 18:00',
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'home-cleaning',
        title: 'Home Cleaning',
        duration: '2h',
        price: 35,
        image:
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'deep-cleaning',
        title: 'Deep Cleaning',
        duration: '4h',
        price: 90,
        image:
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'fixgo-repairs',
    name: 'FixGo Repairs',
    title: 'Handyman & Repairs',
    category: 'repairs',
    city: 'London',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    priceFrom: 40,
    availableNow: true,
    reviews: 39,
    description: 'Fast home repairs, furniture assembly and small handyman jobs.',
    address: '17 Baker Street, London',
    phone: '+44 7700 222444',
    email: 'fixgo@mapbook.app',
    social: '@fixgorepairs',
    lat: 51.5202,
    lng: -0.1588,
    paymentMethods: ['cash', 'card'],
    serviceModes: ['at_client'],
    hours: '09:00 - 19:00',
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'handyman-visit',
        title: 'Handyman Visit',
        duration: '1h 30m',
        price: 40,
        image:
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'furniture-assembly',
        title: 'Furniture Assembly',
        duration: '2h',
        price: 65,
        image:
          'https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'quickfix-tech',
    name: 'QuickFix Tech',
    title: 'Phone & Laptop Repair',
    category: 'tech',
    city: 'London',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    priceFrom: 50,
    availableNow: true,
    reviews: 53,
    description: 'Phone screen repair, battery replacement and laptop diagnostics.',
    address: '55 Oxford Street, London',
    phone: '+44 7700 333555',
    email: 'quickfix@mapbook.app',
    social: '@quickfixtech',
    lat: 51.5144,
    lng: -0.1455,
    paymentMethods: ['card', 'wallet'],
    serviceModes: ['at_client', 'at_my_place'],
    hours: '10:00 - 20:00',
    gallery: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'phone-screen-repair',
        title: 'Phone Screen Repair',
        duration: '1h',
        price: 70,
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'laptop-diagnostics',
        title: 'Laptop Diagnostics',
        duration: '45m',
        price: 50,
        image:
          'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'happy-paws-london',
    name: 'Happy Paws London',
    title: 'Dog Walker & Pet Sitter',
    category: 'pets',
    city: 'London',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 22,
    availableNow: true,
    reviews: 71,
    description: 'Reliable dog walking, pet sitting and home visits across London.',
    address: '9 Notting Hill Gate, London',
    phone: '+44 7700 444666',
    email: 'happypaws@mapbook.app',
    social: '@happypawslondon',
    lat: 51.5098,
    lng: -0.1969,
    paymentMethods: ['cash', 'card'],
    serviceModes: ['at_client'],
    hours: '07:00 - 21:00',
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'dog-walking',
        title: 'Dog Walking',
        duration: '45m',
        price: 22,
        image:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'pet-sitting',
        title: 'Pet Sitting',
        duration: '2h',
        price: 40,
        image:
          'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1200&auto=format&fit=crop',
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
