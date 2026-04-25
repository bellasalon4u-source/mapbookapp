export type CategoryKey =
  | 'more'
  | 'beauty'
  | 'barber'
  | 'wellness'
  | 'food'
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
  | 'creative'
  | 'other';

export type AppCategory = {
  id: CategoryKey;
  label: string;
  icon: string;
  image?: string;
  shortLabel?: string;
  subcategories: string[];
};

export const categories: AppCategory[] = [
  {
    id: 'more',
    label: 'More',
    icon: '⬜',
    image: '/ui/categories/more.png',
    subcategories: [],
  },
  {
    id: 'beauty',
    label: 'Beauty',
    icon: '🪞',
    image: '/ui/categories/beauty.png',
    subcategories: [
      'Hair',
      'Brows & Lashes',
      'Nails',
      'Makeup',
      'Skincare',
      'Aesthetics',
      'Piercing',
      'Tattoo',
      'Tattoo Removal',
      'Other',
    ],
  },
  {
    id: 'barber',
    label: 'Barber',
    icon: '💈',
    image: '/ui/categories/barber.png',
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
    image: '/ui/categories/wellness.png',
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
    id: 'food',
    label: 'Food & Restaurants',
    shortLabel: 'Food',
    icon: '🍽️',
    image: '/ui/categories/food.png',
    subcategories: [
      'Private Chef',
      'Chef at Home',
      'Restaurant Table Booking',
      'Bar Table Booking',
      'Catering',
      'Birthday Dinner',
      'Romantic Dinner',
      'Event Food',
      'Other',
    ],
  },
  {
    id: 'home',
    label: 'Home',
    icon: '🏡',
    image: '/ui/categories/home.png',
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
    image: '/ui/categories/repairs.png',
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
    image: '/ui/categories/tech.png',
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
    image: '/ui/categories/fashion.png',
    subcategories: [
      'Tailoring',
      'Alterations',
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
    image: '/ui/categories/pets.png',
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
    image: '/ui/categories/auto.png',
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
    image: '/ui/categories/moving.png',
    subcategories: [
      'Small Moves',
      'Van Help',
      'Furniture Delivery',
      'Courier',
      'Same-Day Delivery',
      'Heavy Transport',
      'Other',
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: '💪',
    image: '/ui/categories/fitness.png',
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
    image: '/ui/categories/education.png',
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
    image: '/ui/categories/events.png',
    subcategories: [
      'Photography',
      'Videography',
      'Decor',
      'DJ & Music',
      'Event Makeup',
      'Catering Help',
      'Private Chef',
      'Other',
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '🎨',
    image: '/ui/categories/activities.png',
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
    image: '/ui/categories/creative.png',
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
  {
    id: 'other',
    label: 'Other',
    icon: '✨',
    image: '/ui/categories/other.png',
    subcategories: [
      'Other Service',
      'Custom Request',
      'Not Listed',
    ],
  },
];
