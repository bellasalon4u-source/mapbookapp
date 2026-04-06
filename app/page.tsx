'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories } from '../services/categories';
import { t, getSavedLanguage, saveLanguage, type AppLanguage } from '../services/i18n';
import {
  getListings,
  subscribeToListingsStore,
  type ListingItem,
} from '../services/listingsStore';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
  toggleLikedMaster,
} from '../services/likedMastersStore';
import BottomNav from '../components/BottomNav';
import TopCategoriesBar from '../components/TopCategoriesBar';

const RealMap = dynamic(() => import('../components/RealMap'), {
  ssr: false,
});

const popularServices = [
  {
    id: 'hair-styling',
    title: 'Hair Styling',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'phone-repair',
    title: 'Phone Repair',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'home-cleaning',
    title: 'Home Cleaning',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'dog-walking',
    title: 'Dog Walking',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
  },
];

const popularSearches = [
  'Dog hotel',
  'Carpet cleaning',
  'Phone repair',
  'Hair extensions',
  'Massage',
  'Moving help',
];

type SearchResult =
  | {
      type: 'smart';
      id: string;
      label: string;
      categoryId: string;
      categoryLabel: string;
      subcategory: string;
      matchText: string;
    }
  | {
      type: 'category';
      id: string;
      label: string;
      categoryId: string;
    }
  | {
      type: 'subcategory';
      id: string;
      label: string;
      categoryId: string;
      categoryLabel: string;
    }
  | {
      type: 'master';
      id: string;
      label: string;
      categoryId: string;
      master: any;
    }
  | {
      type: 'listing';
      id: string;
      label: string;
      categoryId: string;
      listingMaster: any;
    };

const searchAliases = [
  {
    label: 'Dog hotel',
    categoryId: 'pets',
    subcategory: 'Pet Sitting',
    keywords: [
      'dog hotel',
      'hotel for dogs',
      'pet hotel',
      'dog boarding',
      'boarding for dogs',
      'pet boarding',
      'отель для собак',
      'гостиница для собак',
      'передержка собак',
      'передержка собаки',
      'где оставить собаку',
      'where to leave dog',
    ],
  },
  {
    label: 'Dog walking',
    categoryId: 'pets',
    subcategory: 'Dog Walking',
    keywords: [
      'dog walking',
      'dog walker',
      'walk my dog',
      'выгул собак',
      'выгулять собаку',
      'гулять с собакой',
    ],
  },
  {
    label: 'Pet taxi',
    categoryId: 'pets',
    subcategory: 'Pet Taxi',
    keywords: [
      'pet taxi',
      'taxi for dog',
      'taxi for cat',
      'зоотакси',
      'такси для животных',
      'перевезти собаку',
      'перевезти кота',
    ],
  },
  {
    label: 'Pet grooming',
    categoryId: 'pets',
    subcategory: 'Grooming',
    keywords: [
      'pet grooming',
      'dog grooming',
      'cat grooming',
      'груминг',
      'подстричь собаку',
      'помыть собаку',
    ],
  },
  {
    label: 'Carpet cleaning',
    categoryId: 'home',
    subcategory: 'Deep Cleaning',
    keywords: [
      'clean carpet',
      'wash carpet',
      'carpet cleaning',
      'rug cleaning',
      'помыть ковёр',
      'почистить ковёр',
      'почистить ковер',
      'чистка ковра',
      'химчистка ковра',
    ],
  },
  {
    label: 'Sofa cleaning',
    categoryId: 'home',
    subcategory: 'Deep Cleaning',
    keywords: [
      'clean sofa',
      'wash sofa',
      'sofa cleaning',
      'couch cleaning',
      'почистить диван',
      'помыть диван',
      'чистка дивана',
      'химчистка дивана',
    ],
  },
  {
    label: 'Home cleaning',
    categoryId: 'home',
    subcategory: 'Cleaning',
    keywords: [
      'home cleaning',
      'house cleaning',
      'apartment cleaning',
      'clean house',
      'уборка',
      'уборка квартиры',
      'уборка дома',
      'cleaner',
    ],
  },
  {
    label: 'Furniture assembly',
    categoryId: 'home',
    subcategory: 'Furniture Assembly',
    keywords: [
      'assemble furniture',
      'furniture assembly',
      'ikea assembly',
      'собрать мебель',
      'сборка мебели',
    ],
  },
  {
    label: 'Handyman',
    categoryId: 'home',
    subcategory: 'Handyman',
    keywords: [
      'handyman',
      'fix at home',
      'small home repair',
      'муж на час',
      'мелкий ремонт дома',
    ],
  },
  {
    label: 'Phone repair',
    categoryId: 'tech',
    subcategory: 'Phone Repair',
    keywords: [
      'phone repair',
      'repair phone',
      'fix phone',
      'broken phone',
      'ремонт телефона',
      'починить телефон',
      'замена экрана',
      'экран телефона',
    ],
  },
  {
    label: 'Laptop repair',
    categoryId: 'tech',
    subcategory: 'Laptop Repair',
    keywords: [
      'laptop repair',
      'repair laptop',
      'fix laptop',
      'ремонт ноутбука',
      'починить ноутбук',
    ],
  },
  {
    label: 'Computer repair',
    categoryId: 'tech',
    subcategory: 'Computer Repair',
    keywords: [
      'computer repair',
      'pc repair',
      'repair computer',
      'ремонт компьютера',
      'починить компьютер',
    ],
  },
  {
    label: 'TV setup',
    categoryId: 'tech',
    subcategory: 'TV Setup',
    keywords: [
      'tv setup',
      'install tv',
      'set up television',
      'настроить телевизор',
      'подключить телевизор',
    ],
  },
  {
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: [
      'hair extensions',
      'hairextensions',
      'extensions',
      'наращивание волос',
      'волосы',
      'hair stylist',
      'парикмахер',
    ],
  },
  {
    label: 'Brows & Lashes',
    categoryId: 'beauty',
    subcategory: 'Brows & Lashes',
    keywords: [
      'lashes',
      'brows',
      'eyelashes',
      'ресницы',
      'брови',
      'lash artist',
      'ламинирование ресниц',
    ],
  },
  {
    label: 'Nails',
    categoryId: 'beauty',
    subcategory: 'Nails',
    keywords: [
      'nails',
      'manicure',
      'pedicure',
      'маникюр',
      'педикюр',
      'ногти',
    ],
  },
  {
    label: 'Massage',
    categoryId: 'wellness',
    subcategory: 'Massage',
    keywords: [
      'massage',
      'spa massage',
      'массаж',
      'расслабляющий массаж',
      'лечебный массаж',
    ],
  },
  {
    label: 'Spa',
    categoryId: 'wellness',
    subcategory: 'Spa',
    keywords: ['spa', 'спа', 'spa day', 'relax spa'],
  },
  {
    label: 'Personal training',
    categoryId: 'fitness',
    subcategory: 'Personal Training',
    keywords: [
      'personal trainer',
      'personal training',
      'fitness coach',
      'персональный тренер',
      'фитнес тренер',
      'тренер',
    ],
  },
  {
    label: 'Yoga',
    categoryId: 'fitness',
    subcategory: 'Yoga',
    keywords: ['yoga', 'йога'],
  },
  {
    label: 'Moving',
    categoryId: 'moving',
    subcategory: 'Small Moves',
    keywords: [
      'moving',
      'move house',
      'small move',
      'переезд',
      'перевезти вещи',
      'перевозка вещей',
      'перевезти шкаф',
    ],
  },
  {
    label: 'Van help',
    categoryId: 'moving',
    subcategory: 'Van Help',
    keywords: [
      'van help',
      'man with van',
      'van',
      'нужен бус',
      'грузовой фургон',
      'машина для переезда',
    ],
  },
  {
    label: 'Courier',
    categoryId: 'moving',
    subcategory: 'Courier',
    keywords: ['courier', 'delivery today', 'same day delivery', 'курьер', 'доставка сегодня'],
  },
  {
    label: 'Car wash',
    categoryId: 'auto',
    subcategory: 'Car Wash',
    keywords: ['car wash', 'wash car', 'помыть машину', 'мойка машины', 'автомойка'],
  },
  {
    label: 'Detailing',
    categoryId: 'auto',
    subcategory: 'Detailing',
    keywords: ['detailing', 'car detailing', 'детейлинг', 'полировка авто', 'химчистка авто'],
  },
  {
    label: 'Tyre help',
    categoryId: 'auto',
    subcategory: 'Tyre Help',
    keywords: ['tyre', 'flat tyre', 'wheel help', 'шина', 'колесо', 'прокол колеса', 'накачать шины'],
  },
];

function mapCategoryToId(category: string) {
  const normalized = (category || '').toLowerCase().trim();

  const found = categories.find(
    (item) =>
      item.id.toLowerCase() === normalized ||
      item.label.toLowerCase() === normalized ||
      (item.shortLabel || '').toLowerCase() === normalized
  );

  return found?.id || normalized || 'beauty';
}

function listingToMaster(listing: ListingItem, index: number) {
  const fallbackCoords: [number, number][] = [
    [51.5074, -0.1278],
    [51.5134, -0.0915],
    [51.5007, -0.1246],
    [51.5202, -0.1028],
    [51.4955, -0.1722],
    [51.5308, -0.1238],
    [51.5098, -0.118],
    [51.5159, -0.1426],
  ];

  const coords = fallbackCoords[index % fallbackCoords.length];
  const categoryId = mapCategoryToId(listing.category);

  return {
    id: listing.id,
    name: listing.title,
    title: listing.title,
    category: categoryId,
    subcategory: listing.subcategory || '',
    city: listing.location || 'London',
    rating: 4.8,
    availableToday: listing.availableToday,
    availableNow: listing.availableToday,
    lat: coords[0],
    lng: coords[1],
    avatar:
      listing.photos?.[0] ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    description: listing.description,
    price: listing.price,
    paymentMethods: listing.paymentMethods as ('cash' | 'card' | 'wallet')[],
    hours: listing.hours,
  };
}

function getLanguageBorder(language: AppLanguage) {
  if (language === 'UA') {
    return 'linear-gradient(90deg, #1f7cff 0%, #1f7cff 50%, #ffd338 50%, #ffd338 100%)';
  }

  if (language === 'RU') {
    return 'linear-gradient(90deg, #ffffff 0%, #ffffff 33%, #2f6fff 33%, #2f6fff 66%, #ff5252 66%, #ff5252 100%)';
  }

  return 'linear-gradient(90deg, #1f57d6 0%, #1f57d6 40%, #ffffff 40%, #ffffff 60%, #e53e4f 60%, #e53e4f 100%)';
}

function getCategoryAccent(category?: string) {
  const normalized = String(category || '').toLowerCase();

  if (normalized === 'beauty') return '#ff4f93';
  if (normalized === 'barber') return '#2d98ff';
  if (normalized === 'wellness') return '#32c957';
  if (normalized === 'home') return '#ff9f1a';
  if (normalized === 'repairs') return '#f4b400';
  if (normalized === 'tech') return '#9b5cff';
  if (normalized === 'pets') return '#28c7d9';
  if (normalized === 'fashion') return '#43d94d';
  if (normalized === 'auto') return '#43d94d';
  if (normalized === 'moving') return '#43d94d';
  if (normalized === 'fitness') return '#43d94d';
  if (normalized === 'events') return '#43d94d';
  if (normalized === 'activities') return '#43d94d';
  if (normalized === 'creative') return '#43d94d';
  if (normalized === 'education') return '#7d52ff';

  return '#ff4f93';
}

function getCategoryLabel(category?: string) {
  const normalized = String(category || '').toLowerCase();
  if (!normalized) return 'Service';

  const found = categories.find((item) => item.id === normalized);
  return found?.shortLabel || found?.label || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizePaymentMethods(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return ['cash', 'card'];
}

function paymentBadge(method: string, language: AppLanguage) {
  const tr = t(language);
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: tr.cash };
  if (normalized === 'card') return { icon: '💳', label: tr.card };
  if (normalized === 'wallet') return { icon: '📱', label: tr.wallet };

  return { icon: '•', label: String(method) };
}

function normalizeText(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function scoreTextMatch(query: string, target: string) {
  const q = normalizeText(query);
  const tValue = normalizeText(target);
  if (!q || !tValue) return 0;

  if (tValue === q) return 120;
  if (tValue.startsWith(q)) return 90;
  if (tValue.includes(q)) return 70;

  const qWords = tokenize(q);
  const tWords = tokenize(tValue);

  let score = 0;

  for (const word of qWords) {
    if (tValue.includes(word)) score += 14;
    if (tWords.some((item) => item.startsWith(word))) score += 10;
  }

  return score;
}

function saveRecentSearch(value: string) {
  if (typeof window === 'undefined') return;
  const trimmed = value.trim();
  if (!trimmed) return;

  const key = 'mapbook_recent_searches';
  const current = JSON.parse(window.localStorage.getItem(key) || '[]') as string[];
  const next = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
  window.localStorage.setItem(key, JSON.stringify(next));
}

function readRecentSearches() {
  if (typeof window === 'undefined') return [] as string[];
  return JSON.parse(window.localStorage.getItem('mapbook_recent_searches') || '[]') as string[];
}

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [likedMasterIds, setLikedMasterIds] = useState<string[]>([]);
  const [likedFilterMode, setLikedFilterMode] = useState<'none' | 'category' | 'all'>('none');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [recenterToUserTrigger, setRecenterToUserTrigger] = useState(0);

  const tr = t(language);

  useEffect(() => {
    setLanguage(getSavedLanguage());
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!searchWrapperRef.current) return;
      if (searchWrapperRef.current.contains(event.target as Node)) return;
      setSearchOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  useEffect(() => {
    const loadListings = () => {
      setListings(getListings());
    };

    loadListings();
    const unsubscribe = subscribeToListingsStore(loadListings);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadLiked = () => {
      setLikedMasterIds(getLikedMasterIds());
    };

    loadLiked();
    const unsubscribe = subscribeToLikedMasters(loadLiked);
    return unsubscribe;
  }, []);

  const listingMasters = useMemo(() => {
    return listings.map((item, index) => listingToMaster(item, index));
  }, [listings]);

  const allMasters = useMemo(() => {
    return [...listingMasters, ...baseMasters];
  }, [listingMasters, baseMasters]);

  const smartResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SearchResult[];

    return searchAliases
      .map((item) => {
        const bestKeywordScore = Math.max(
          ...item.keywords.map((keyword) => scoreTextMatch(q, keyword))
        );

        return {
          item,
          score: bestKeywordScore,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => ({
        type: 'smart' as const,
        id: `smart-${item.categoryId}-${item.subcategory}-${item.label}`,
        label: item.label,
        categoryId: item.categoryId,
        categoryLabel: getCategoryLabel(item.categoryId),
        subcategory: item.subcategory,
        matchText: item.label,
      }));
  }, [search]);

  const categoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SearchResult[];

    return categories
      .map((item) => {
        const score = Math.max(
          scoreTextMatch(q, item.label),
          scoreTextMatch(q, item.shortLabel || ''),
          scoreTextMatch(q, item.id)
        );

        return { item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => ({
        type: 'category' as const,
        id: `category-${item.id}`,
        label: item.shortLabel || item.label,
        categoryId: item.id,
      }));
  }, [search]);

  const subcategoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SearchResult[];

    return categories
      .flatMap((item) =>
        item.subcategories.map((sub) => ({
          sub,
          categoryId: item.id,
          categoryLabel: item.shortLabel || item.label,
          score: scoreTextMatch(q, sub),
        }))
      )
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => ({
        type: 'subcategory' as const,
        id: `subcategory-${item.categoryId}-${item.sub}`,
        label: item.sub,
        categoryId: item.categoryId,
        categoryLabel: item.categoryLabel,
      }));
  }, [search]);

  const proResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SearchResult[];

    return allMasters
      .map((master: any) => {
        const description = String(master.description || '');
        const title = String(master.name || master.title || '');
        const category = String(master.category || '');
        const subcategory = String(master.subcategory || '');
        const city = String(master.city || '');

        const score =
          scoreTextMatch(q, title) * 1.5 +
          scoreTextMatch(q, subcategory) * 1.3 +
          scoreTextMatch(q, description) * 1.2 +
          scoreTextMatch(q, city) +
          scoreTextMatch(q, category);

        return { master, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ master }) => ({
        type: 'master' as const,
        id: `master-${master.id}`,
        label: master.name || master.title || 'Pro',
        categoryId: String(master.category || 'beauty'),
        master,
      }));
  }, [search, allMasters]);

  const listingResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SearchResult[];

    return listingMasters
      .map((master: any) => {
        const description = String(master.description || '');
        const title = String(master.title || master.name || '');
        const category = String(master.category || '');
        const subcategory = String(master.subcategory || '');
        const city = String(master.city || '');

        const score =
          scoreTextMatch(q, title) * 1.5 +
          scoreTextMatch(q, subcategory) * 1.3 +
          scoreTextMatch(q, description) * 1.2 +
          scoreTextMatch(q, city) +
          scoreTextMatch(q, category);

        return { master, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ master }) => ({
        type: 'listing' as const,
        id: `listing-${master.id}`,
        label: master.title || 'Listing',
        categoryId: String(master.category || 'beauty'),
        listingMaster: master,
      }));
  }, [search, listingMasters]);

  const filteredMasters = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allMasters.filter((master: any) => {
      const masterCategory = String(master.category || '').toLowerCase().trim();
      const masterSubcategory = String(master.subcategory || '').toLowerCase().trim();

      const categoryMatch =
        likedFilterMode === 'all' ? true : masterCategory === activeCategory;

      const subcategoryMatch =
        likedFilterMode === 'all'
          ? true
          : !activeSubcategory ||
            masterSubcategory === activeSubcategory.toLowerCase().trim();

      const searchMatch =
        !q ||
        String(master.name || '').toLowerCase().includes(q) ||
        String(master.title || '').toLowerCase().includes(q) ||
        String(master.city || '').toLowerCase().includes(q) ||
        String(master.subcategory || '').toLowerCase().includes(q) ||
        String(master.description || '').toLowerCase().includes(q) ||
        String(master.category || '').toLowerCase().includes(q);

      const likedMatch =
        likedFilterMode === 'none'
          ? true
          : likedMasterIds.includes(String(master.id));

      return categoryMatch && subcategoryMatch && searchMatch && likedMatch;
    });
  }, [
    allMasters,
    activeCategory,
    activeSubcategory,
    search,
    likedMasterIds,
    likedFilterMode,
  ]);

  useEffect(() => {
    setSelectedMaster(null);
  }, [activeCategory, activeSubcategory, search, likedFilterMode]);

  const mapKey = useMemo(() => {
    const ids = filteredMasters.map((item: any) => String(item.id)).join('|');
    return `${activeCategory}-${activeSubcategory}-${search}-${mapMode}-${likedFilterMode}-${ids}`;
  }, [activeCategory, activeSubcategory, search, mapMode, likedFilterMode, filteredMasters]);

  const borderGradient = getLanguageBorder(language);
  const currentCategoryLabel =
    categories.find((item) => item.id === activeCategory)?.label || activeCategory;

  const likedInCategoryCount = allMasters.filter(
    (master: any) =>
      String(master.category || '').toLowerCase().trim() === activeCategory &&
      likedMasterIds.includes(String(master.id))
  ).length;

  const likedAllCount = likedMasterIds.length;

  const hasAnyResults =
    smartResults.length > 0 ||
    categoryResults.length > 0 ||
    subcategoryResults.length > 0 ||
    proResults.length > 0 ||
    listingResults.length > 0;

  const selectSearchResult = (result: SearchResult) => {
    if (result.type === 'smart') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory(result.subcategory);
      setLikedFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.matchText);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'category') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory('');
      setLikedFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'subcategory') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory(result.label);
      setLikedFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'master') {
      setActiveCategory(String(result.master.category || 'beauty'));
      setActiveSubcategory(result.master.subcategory || '');
      setLikedFilterMode('none');
      setSelectedMaster(result.master);
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    setActiveCategory(String(result.listingMaster.category || 'beauty'));
    setActiveSubcategory(result.listingMaster.subcategory || '');
    setLikedFilterMode('none');
    setSelectedMaster(result.listingMaster);
    setSearch(result.label);
    setSearchOpen(false);
    saveRecentSearch(result.label);
    setRecentSearches(readRecentSearches());
  };

  const runQuickSearch = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
    saveRecentSearch(value);
    setRecentSearches(readRecentSearches());
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 118,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: '#f7f3eb',
          borderTop: '5px solid transparent',
          borderImage: `${borderGradient} 1`,
          boxShadow: '0 0 0 1px rgba(226,218,205,0.35)',
        }}
      >
        <section style={{ padding: '12px 14px 0' }}>
          <div ref={searchWrapperRef} style={{ position: 'relative', zIndex: 1300 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 8,
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: 20,
                padding: '10px 10px 10px 14px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.07)',
                border: '1px solid #ece7df',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, color: '#2f8df5' }}>🔎</span>
                <input
                  value={search}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const first =
                        smartResults[0] ||
                        subcategoryResults[0] ||
                        categoryResults[0] ||
                        proResults[0] ||
                        listingResults[0];

                      if (first) {
                        selectSearchResult(first);
                      } else if (search.trim()) {
                        saveRecentSearch(search);
                        setRecentSearches(readRecentSearches());
                        setSearchOpen(false);
                      }
                    }
                  }}
                  placeholder={tr.searchPlaceholder}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 15,
                    color: '#2b2f36',
                  }}
                />

                {search ? (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSearchOpen(false);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 18,
                      color: '#85909c',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              <button
                onClick={() =>
                  setLanguage((prev) =>
                    prev === 'EN' ? 'UA' : prev === 'UA' ? 'RU' : 'EN'
                  )
                }
                style={{
                  border: 'none',
                  background: '#fff',
                  color: '#1f2430',
                  borderRadius: 999,
                  minWidth: 74,
                  height: 46,
                  padding: '0 12px',
                  fontSize: 15,
                  fontWeight: 800,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
                title="Change language"
              >
                <span style={{ fontSize: 20 }}>
                  {language === 'EN' ? '🇬🇧' : language === 'UA' ? '🇺🇦' : '🇷🇺'}
                </span>
                <span>{language}</span>
              </button>

              <button
                onClick={() => router.push('/profile')}
                style={{
                  border: '2px solid #fff',
                  background: '#f4efe7',
                  borderRadius: 999,
                  width: 46,
                  height: 46,
                  padding: 0,
                  overflow: 'hidden',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={baseMasters[0]?.avatar}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </button>
            </div>

            {searchOpen ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid #ece4d8',
                  borderRadius: 20,
                  boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
                  padding: 12,
                  maxHeight: 380,
                  overflowY: 'auto',
                }}
              >
                {!search.trim() ? (
                  <>
                    {recentSearches.length > 0 ? (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.recentSearches}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {recentSearches.map((item) => (
                            <button
                              key={item}
                              onClick={() => runQuickSearch(item)}
                              style={{
                                border: '1px solid #e7ddd0',
                                background: '#fff',
                                borderRadius: 999,
                                padding: '8px 12px',
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#2a3442',
                                cursor: 'pointer',
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: '#6c7480',
                          marginBottom: 8,
                        }}
                      >
                        {tr.popularSearches}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {popularSearches.map((item) => (
                          <button
                            key={item}
                            onClick={() => runQuickSearch(item)}
                            style={{
                              border: '1px solid #e7ddd0',
                              background: '#fff8f8',
                              borderRadius: 999,
                              padding: '8px 12px',
                              fontSize: 13,
                              fontWeight: 900,
                              color: '#ff4f93',
                              cursor: 'pointer',
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : !hasAnyResults ? (
                  <div
                    style={{
                      padding: '12px 6px',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#74808c',
                    }}
                  >
                    {tr.noResultsFound}
                  </div>
                ) : (
                  <>
                    {smartResults.length > 0 ? (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.smartMatches}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {smartResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: 'none',
                                background: '#fff6f9',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {item.categoryLabel} • {item.subcategory}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {categoryResults.length > 0 ? (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.categories}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {categoryResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: 'none',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {subcategoryResults.length > 0 ? (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.services}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {subcategoryResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: 'none',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {item.categoryLabel}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {proResults.length > 0 ? (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.pros}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {proResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: 'none',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {listingResults.length > 0 ? (
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.listings}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {listingResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: 'none',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ padding: '10px 0 0' }}>
          <TopCategoriesBar
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectCategory={(category) => {
              setActiveCategory(category);
              setLikedFilterMode('none');
            }}
            onSelectSubcategory={(subcategory) => {
              setActiveSubcategory(subcategory);
            }}
            onClearSubcategory={() => {
              setActiveSubcategory('');
            }}
          />
        </section>

        <section style={{ padding: '8px 14px 0' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              onClick={() =>
                setLikedFilterMode((prev) => (prev === 'category' ? 'none' : 'category'))
              }
              style={{
                border:
                  likedFilterMode === 'category'
                    ? '3px solid #ff2020'
                    : '1px solid #dadada',
                background: '#fff',
                color: '#1f2430',
                borderRadius: 999,
                padding: likedFilterMode === 'category' ? '12px 16px' : '10px 14px',
                fontSize: likedFilterMode === 'category' ? 16 : 15,
                fontWeight: likedFilterMode === 'category' ? 900 : 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow:
                  likedFilterMode === 'category'
                    ? '0 6px 18px rgba(255,32,32,0.18)'
                    : '0 3px 8px rgba(0,0,0,0.04)',
                transform: likedFilterMode === 'category' ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ color: '#ff2020', fontSize: 18 }}>♥</span>
              <span>{currentCategoryLabel}</span>
              <span
                style={{
                  marginLeft: 2,
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #e4e4e4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#1f2430',
                  background: '#fff',
                }}
              >
                {likedInCategoryCount}
              </span>
            </button>

            <button
              onClick={() =>
                setLikedFilterMode((prev) => (prev === 'all' ? 'none' : 'all'))
              }
              style={{
                border:
                  likedFilterMode === 'all'
                    ? '3px solid #ff2020'
                    : '1px solid #dadada',
                background: '#fff',
                color: '#1f2430',
                borderRadius: 999,
                padding: likedFilterMode === 'all' ? '12px 16px' : '10px 14px',
                fontSize: likedFilterMode === 'all' ? 16 : 15,
                fontWeight: likedFilterMode === 'all' ? 900 : 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow:
                  likedFilterMode === 'all'
                    ? '0 6px 18px rgba(255,32,32,0.18)'
                    : '0 3px 8px rgba(0,0,0,0.04)',
                transform: likedFilterMode === 'all' ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ color: '#ff2020', fontSize: 18 }}>♥</span>
              <span>{tr.allLiked}</span>
              <span
                style={{
                  marginLeft: 2,
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #e4e4e4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#1f2430',
                  background: '#fff',
                }}
              >
                {likedAllCount}
              </span>
            </button>

            <div
              style={{
                marginLeft: 'auto',
                border: '1px solid #d9ecd7',
                background: '#eefbe9',
                color: '#2f9c47',
                borderRadius: 999,
                padding: '9px 13px',
                fontSize: 13,
                fontWeight: 900,
                boxShadow: '0 3px 10px rgba(47,156,71,0.08)',
              }}
            >
              {filteredMasters.filter((item: any) => item.availableNow).length} {tr.prosAvailableNow}
            </div>
          </div>
        </section>

        <section style={{ padding: '8px 0 0' }}>
          <div
            style={{
              background: '#ffffff',
              borderTop: '1px solid #e7e1d8',
              borderBottom: '1px solid #e7e1d8',
            }}
          >
            <div
              style={{
                height: 520,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <RealMap
                key={mapKey}
                masters={filteredMasters}
                mapMode={mapMode}
                activeCategory={activeCategory}
                selectedMasterId={selectedMaster?.id ?? null}
                likedMasterIds={likedMasterIds}
                recenterToUserTrigger={recenterToUserTrigger}
                onMasterSelect={(master: any) => setSelectedMaster(master)}
                onMapBackgroundClick={() => setSelectedMaster(null)}
                onToggleLike={(master: any) => {
                  toggleLikedMaster(master.id);
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  zIndex: 1000,
                  pointerEvents: 'auto',
                }}
              >
                <button
                  onClick={() =>
                    setMapMode((prev) =>
                      prev === 'map' ? 'satellite' : 'map'
                    )
                  }
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    border: '1px solid #e5ddd1',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 18,
                    color: '#3d454f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={tr.mapStyle}
                >
                  {mapMode === 'satellite' ? '🗺️' : '🛰️'}
                </button>

                <button
                  onClick={() => setRecenterToUserTrigger((prev) => prev + 1)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    border: '1px solid #e5ddd1',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 20,
                    color: '#3d454f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={tr.myLocation}
                >
                  ⌖
                </button>

                <button
                  onClick={() => setSelectedMaster(null)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    border: '1px solid #e5ddd1',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 18,
                    color: '#3d454f',
                    cursor: 'pointer',
                  }}
                  title={tr.clearSelection}
                >
                  ✕
                </button>
              </div>

              {!selectedMaster ? (
                <div
                  style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    background: 'rgba(255,255,255,0.96)',
                    borderRadius: 16,
                    padding: '12px 14px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
                    zIndex: 20,
                    minWidth: 128,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#2c3542',
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: '#fff',
                        border: '4px solid #31c64a',
                        display: 'inline-block',
                      }}
                    />
                    <span>{tr.available}</span>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#2c3542',
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: '#fff',
                        border: '4px solid #ff5c70',
                        display: 'inline-block',
                      }}
                    />
                    <span>{tr.unavailable}</span>
                  </div>
                </div>
              ) : null}

              {selectedMaster ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 24,
                    background: '#fff',
                    borderRadius: 22,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                    border: '1px solid rgba(230,223,213,0.95)',
                    padding: 14,
                    zIndex: 1001,
                    pointerEvents: 'auto',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '104px 1fr',
                      gap: 14,
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          position: 'relative',
                          width: 104,
                          height: 104,
                          borderRadius: 20,
                          overflow: 'hidden',
                          background: '#eef2f5',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                      >
                        <img
                          src={selectedMaster.avatar}
                          alt={selectedMaster.name || selectedMaster.title || 'Master'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        <button
                          onClick={() => toggleLikedMaster(selectedMaster.id)}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            border: 'none',
                            background: '#fff',
                            color: '#ff2020',
                            fontSize: 16,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.14)',
                            cursor: 'pointer',
                          }}
                        >
                          {likedMasterIds.includes(String(selectedMaster.id)) ? '♥' : '♡'}
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {normalizePaymentMethods(selectedMaster.paymentMethods)
                          .slice(0, 3)
                          .map((method) => {
                            const item = paymentBadge(method, language);

                            return (
                              <div
                                key={`${selectedMaster.id}-${String(method)}`}
                                style={{
                                  minWidth: 40,
                                  height: 28,
                                  padding: '0 8px',
                                  borderRadius: 10,
                                  border: '1px solid #ece3d8',
                                  background: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: '#44505f',
                                }}
                              >
                                <span>{item.icon}</span>
                                {item.label === tr.cash || item.label === tr.card ? null : (
                                  <span>{item.label}</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 18,
                          lineHeight: 1.1,
                          fontWeight: 900,
                          color: '#212836',
                          marginBottom: 8,
                        }}
                      >
                        {selectedMaster.name || selectedMaster.title || 'Service Pro'}
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 12px',
                          borderRadius: 999,
                          background: '#f3ebdf',
                          color: '#7d694f',
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        <span>🏅</span>
                        <span>{tr.verifiedPro}</span>
                      </div>

                      <div
                        style={{
                          marginTop: 9,
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: '#ffe8f1',
                          color: getCategoryAccent(selectedMaster.category),
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        {getCategoryLabel(selectedMaster.category)}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          fontWeight: 900,
                          color: selectedMaster.availableNow ? '#31b14c' : '#de6a74',
                        }}
                      >
                        {selectedMaster.availableNow ? tr.availableNow : tr.unavailableToday}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                          color: '#212836',
                          fontWeight: 900,
                        }}
                      >
                        <div style={{ fontSize: 16 }}>
                          ★ {Number(selectedMaster.rating || 4.7).toFixed(1)}
                        </div>
                        <div style={{ fontSize: 16 }}>
                          {tr.from} £{String(selectedMaster.price).replace(/[^\d.]/g, '') || '45'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <button
                      onClick={() => router.push(`/master/${selectedMaster.id}`)}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: '2px solid #efbdd0',
                        background: '#fff',
                        color: '#25303d',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {tr.view}
                    </button>

                    <button
                      onClick={() => {
                        const lat = selectedMaster?.lat;
                        const lng = selectedMaster?.lng;

                        if (typeof lat === 'number' && typeof lng === 'number') {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                            '_blank'
                          );
                        }
                      }}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: 'none',
                        background: '#5dc1ee',
                        color: '#fff',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(93,193,238,0.25)',
                      }}
                    >
                      {tr.route}
                    </button>

                    <button
                      onClick={() => router.push(`/booking/${selectedMaster.id}`)}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: 'none',
                        background: '#3bb54a',
                        color: '#fff',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(59,181,74,0.24)',
                      }}
                    >
                      {tr.bookNow}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section style={{ padding: '12px 14px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 900,
                color: '#223145',
              }}
            >
              {tr.popularServices}
            </h2>

            <button
              onClick={() => router.push('/services')}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 24,
                color: '#9aa0a8',
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {popularServices.map((service) => (
              <button
                key={service.id}
                onClick={() => runQuickSearch(service.title)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '0.9 / 1',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#ddd',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                  }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 11,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: '#253140',
                  }}
                >
                  {service.title}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
