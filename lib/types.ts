export type Category =
  | 'Hair'
  | 'Beauty'
  | 'Massage'
  | 'Nails'
  | 'Brows'
  | 'Makeup'
  | 'Wellness';

export type Service = {
  id: string;
  title: string;
  priceFrom: number;
  duration: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

export type Master = {
  id: string;
  name: string;
  title: string;
  city: string;
  category: Category;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  availableNow: boolean;
  lat: number;
  lng: number;
  avatar: string;
  gallery: string[];
  description: string;
  services: Service[];
  reviews: Review[];
};
