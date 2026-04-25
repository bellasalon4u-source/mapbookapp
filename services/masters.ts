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
  {
    id: 'chef-at-home-london',
    name: 'Chef at Home London',
    title: 'Private Chef',
    city: 'London',
    category: 'food',
    subcategory: 'Chef at Home',
    avatar:
      'https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 95,
    availableNow: true,
    reviews: 41,
    description:
      'Private chef for dinners, family events and special evenings at your home.',
    address: 'Mayfair, London',
    phone: '+44 7700 909555',
    email: 'chefathome@olamep.app',
    social: '@chefathomelondon',
    lat: 51.5094,
    lng: -0.1476,
    paymentMethods: ['cash', 'card', 'wallet'],
    gallery: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'private-dinner',
        title: 'Private Dinner at Home',
        duration: '3h',
        price: 95,
        image:
          'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1200&auto=format&fit=crop',
        description: 'Personal chef dinner for small groups at home.',
      },
      {
        slug: 'family-chef-visit',
        title: 'Family Chef Visit',
        duration: '2h 30m',
        price: 120,
        image:
          'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'event-chef',
        title: 'Event Chef',
        duration: '4h',
        price: 180,
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'soho-table-booking',
    name: 'Soho Table Booking',
    title: 'Restaurant & Bar Reservations',
    city: 'London',
    category: 'food',
    subcategory: 'Restaurant & Bar Table',
    avatar:
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    priceFrom: 10,
    availableNow: true,
    reviews: 88,
    description:
      'Book a table in restaurants and bars. Fast confirmation for dinner, drinks and events.',
    address: 'Soho, London',
    phone: '+44 7700 121212',
    email: 'tables@olamep.app',
    social: '@sohotablebooking',
    lat: 51.5129,
    lng: -0.1344,
    paymentMethods: ['card', 'wallet'],
    gallery: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'restaurant-table',
        title: 'Restaurant Table Booking',
        duration: 'Instant',
        price: 10,
        image:
          'https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'bar-table',
        title: 'Bar Table Booking',
        duration: 'Instant',
        price: 10,
        image:
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'group-table',
        title: 'Group Table Reservation',
        duration: 'Instant',
        price: 20,
        image:
          'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'ink-room-camden',
    name: 'Ink Room Camden',
    title: 'Tattoo Artist',
    city: 'London',
    category: 'beauty',
    subcategory: 'Tattoo',
    avatar:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1590246814883-7f5e67e1a35b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    priceFrom: 70,
    availableNow: false,
    reviews: 103,
    description:
      'Custom tattoo work, small tattoos, fine line designs and consultations in Camden.',
    address: 'Camden Town, London',
    phone: '+44 7700 131313',
    email: 'inkroom@olamep.app',
    social: '@inkroomcamden',
    lat: 51.5416,
    lng: -0.1432,
    paymentMethods: ['cash', 'card', 'wallet'],
    gallery: [
      'https://images.unsplash.com/photo-1590246814883-7f5e67e1a35b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'small-tattoo',
        title: 'Small Tattoo',
        duration: '1h',
        price: 70,
        image:
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'fine-line-tattoo',
        title: 'Fine Line Tattoo',
        duration: '1h 30m',
        price: 110,
        image:
          'https://images.unsplash.com/photo-1590246814883-7f5e67e1a35b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'tattoo-consultation',
        title: 'Tattoo Consultation',
        duration: '30m',
        price: 25,
        image:
          'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'piercing-studio-soho',
    name: 'Piercing Studio Soho',
    title: 'Piercing Specialist',
    city: 'London',
    category: 'beauty',
    subcategory: 'Piercing',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    priceFrom: 35,
    availableNow: true,
    reviews: 79,
    description:
      'Ear, nose and body piercing with sterile tools and aftercare guidance.',
    address: 'Soho, London',
    phone: '+44 7700 141414',
    email: 'piercing@olamep.app',
    social: '@piercingstudiosoho',
    lat: 51.5135,
    lng: -0.1361,
    paymentMethods: ['cash', 'card'],
    gallery: [
      'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'ear-piercing',
        title: 'Ear Piercing',
        duration: '30m',
        price: 35,
        image:
          'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'nose-piercing',
        title: 'Nose Piercing',
        duration: '30m',
        price: 45,
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'piercing-aftercare',
        title: 'Piercing Aftercare',
        duration: '20m',
        price: 20,
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'tattoo-removal-clinic',
    name: 'Tattoo Removal Clinic',
    title: 'Tattoo Removal',
    city: 'London',
    category: 'beauty',
    subcategory: 'Tattoo Removal',
    avatar:
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800&auto=format&fit=crop',
    cover:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    priceFrom: 85,
    availableNow: false,
    reviews: 36,
    description:
      'Tattoo removal consultations and treatment sessions with professional aftercare.',
    address: 'Harley Street, London',
    phone: '+44 7700 151515',
    email: 'removal@olamep.app',
    social: '@tattooremovalclinic',
    lat: 51.5201,
    lng: -0.1478,
    paymentMethods: ['card', 'wallet'],
    gallery: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581093458791-9d15482442f6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200&auto=format&fit=crop',
    ],
    services: [
      {
        slug: 'tattoo-removal-consultation',
        title: 'Tattoo Removal Consultation',
        duration: '30m',
        price: 35,
        image:
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'small-tattoo-removal',
        title: 'Small Tattoo Removal',
        duration: '45m',
        price: 85,
        image:
          'https://images.unsplash.com/photo-1581093458791-9d15482442f6?q=80&w=1200&auto=format&fit=crop',
      },
      {
        slug: 'large-tattoo-removal',
        title: 'Large Tattoo Removal',
        duration: '1h',
        price: 140,
        image:
          'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200&auto=format&fit=crop',
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
