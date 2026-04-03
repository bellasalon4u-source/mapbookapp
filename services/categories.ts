export type CategoryKey =
  | 'beauty'
  | 'barber'
  | 'wellness'
  | 'home'
  | 'repairs'
  | 'tech'
  | 'fashion'
  | 'pets'
  | 'auto'
  | 'moving'
  | 'fitness'
  | 'education'
  | 'events'
  | 'activities'
  | 'creative';

export type AppCategory = {
  id: CategoryKey;
  label: string;
  icon: string;
  shortLabel?: string;
  subcategories: string[];
};

export const categories: AppCategory[] = [
  {
    id: 'beauty',
    label: 'Beauty',
    icon: '🪞',
    subcategories: [
      'Hair',
      'Brows & Lashes',
      'Nails',
      'Makeup',
      'Skincare',
      'Aesthetics',
      'Other',
    ],
  },
  {
    id: 'barber',
    label: 'Barber',
    icon: '🧔',
    subcategories: [
      'Haircut',
      'Beard Trim',
      'Shave',
      'Fade',
      'Kids Haircut',
      'Styling',
      'Other',
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: '🪷',
    subcategories: [
      'Massage',
      'Spa',
      'Relaxation',
      'Recovery',
      'Holistic Care',
      'Therapy Support',
      'Other',
    ],
  },
  {
    id: 'home',
    label: 'Home',
    icon: '🏡',
    subcategories: [
      'Cleaning',
      'Deep Cleaning',
      'Garden Help',
      'Handyman',
      'Furniture Assembly',
      'Home Help',
      'Other',
    ],
  },
  {
    id: 'repairs',
    label: 'Repairs',
    icon: '🛠️',
    subcategories: [
      'Home Repairs',
      'Appliance Repair',
      'Furniture Repair',
      'Shoe Repair',
      'Clothing Repair',
      'Watch Repair',
      'Other',
    ],
  },
  {
    id: 'tech',
    label: 'Tech',
    icon: '🖥️',
    subcategories: [
      'Phone Repair',
      'Computer Repair',
      'Laptop Repair',
      'Tablet Repair',
      'TV Setup',
      'Smart Device Help',
      'Other',
    ],
  },
  {
    id: 'fashion',
    label: 'Fashion & Tailoring',
    shortLabel: 'Fashion',
    icon: '👗',
    subcategories: [
      'Tailoring',
      'Clothing Alterations',
      'Custom Sewing',
      'Shoe Care',
      'Bag Repair',
      'Other',
    ],
  },
  {
    id: 'pets',
    label: 'Pets',
    icon: '🐾',
    subcategories: [
      'Grooming',
      'Dog Walking',
      'Pet Sitting',
      'Pet Taxi',
      'Pet Delivery',
      'Training',
      'Home Visits',
      'Accessories & Gifts',
      'Other',
    ],
  },
  {
    id: 'auto',
    label: 'Auto',
    icon: '🚗',
    subcategories: [
      'Car Wash',
      'Detailing',
      'Tyre Help',
      'Battery Help',
      'Diagnostics',
      'Driver Service',
      'Other',
    ],
  },
  {
    id: 'moving',
    label: 'Moving & Delivery',
    shortLabel: 'Moving',
    icon: '📦',
    subcategories: [
      'Small Moves',
      'Van Help',
      'Furniture Delivery',
      'Courier',
      'Same-Day Delivery',
      'Heavy Item Transport',
      'Other',
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: '💪',
    subcategories: [
      'Personal Training',
      'Yoga',
      'Pilates',
      'Stretching',
      'Dance Fitness',
      'Outdoor Training',
      'Other',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: '🎓',
    subcategories: [
      'Languages',
      'Tutoring',
      'Music Lessons',
      'Kids Learning',
      'Exam Prep',
      'Skill Coaching',
      'Other',
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: '🎉',
    subcategories: [
      'Photography',
      'Videography',
      'Decor',
      'DJ & Music',
      'Makeup for Events',
      'Catering Help',
      'Other',
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '🎨',
    subcategories: [
      'Tours',
      'Workshops',
      'Kids Activities',
      'Art Classes',
      'Dance Classes',
      'Outdoor Activities',
      'Other',
    ],
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: '🎬',
    subcategories: [
      'Graphic Design',
      'Content Creation',
      'Photo Editing',
      'Video Editing',
      'Branding',
      'Social Media Help',
      'Other',
    ],
  },
];
