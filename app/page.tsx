'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories } from '../services/categories';
import { t, getSavedLanguage, type AppLanguage } from '../services/i18n';
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
import {
  getVisiblePromotionsForLocation,
  incrementPromotionViews,
  subscribeToPromotionsStore,
  type PromotionItem,
} from '../services/promotionsStore';
import {
  getEffectiveSearchLocation,
  subscribeToAppRegionSettings,
} from '../services/appRegionStore';
import { refreshLiveCurrencyRates } from '../services/currencyDisplay';
import BottomNav from '../components/BottomNav';
import TopCategoriesBar from '../components/TopCategoriesBar';

const RealMap = dynamic(() => import('../components/RealMap'), {
  ssr: false,
});

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
      subcategory: string;
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
    }
  | {
      type: 'master';
      id: string;
      label: string;
      categoryId: string;
      master: any;
    };

type SmartSearchResult = Extract<SearchResult, { type: 'smart' }>;
type CategorySearchResult = Extract<SearchResult, { type: 'category' }>;
type SubcategorySearchResult = Extract<SearchResult, { type: 'subcategory' }>;
type MasterSearchResult = Extract<SearchResult, { type: 'master' }>;

type DealFilterMode = 'none' | 'category' | 'all';

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
      'hotel para perros',
      'perро hotel',
      'отель для собак',
      'psí hotel',
      'hundehotel',
      'hotel dla psów',
    ],
  },
  {
    label: 'Carpet cleaning',
    categoryId: 'home',
    subcategory: 'Deep Cleaning',
    keywords: [
      'carpet cleaning',
      'clean carpet',
      'wash carpet',
      'limpiar alfombra',
      'alfombra limpieza',
      'почистить ковёр',
      'čištění koberce',
      'teppichreinigung',
      'czyszczenie dywanu',
    ],
  },
  {
    label: 'Phone repair',
    categoryId: 'tech',
    subcategory: 'Phone Repair',
    keywords: [
      'phone repair',
      'fix phone',
      'reparar telefono',
      'ремонт телефона',
      'oprava telefonu',
      'handy reparatur',
      'naprawa telefonu',
    ],
  },
  {
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: [
      'hair extensions',
      'hairextensions',
      'extensiones de cabello',
      'наращивание волос',
      'prodloužení vlasů',
      'haarverlängerung',
      'przedłużanie włosów',
    ],
  },
  {
    label: 'Massage',
    categoryId: 'wellness',
    subcategory: 'Massage',
    keywords: ['massage', 'masaje', 'массаж', 'masáž', 'massage de', 'masaż'],
  },
  {
    label: 'Moving',
    categoryId: 'moving',
    subcategory: 'Small Moves',
    keywords: [
      'moving',
      'move house',
      'mudanza',
      'переезд',
      'stěhování',
      'umzug',
      'przeprowadzka',
    ],
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
  if (language === 'ES') {
    return 'linear-gradient(90deg, #c60b1e 0%, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%, #c60b1e 100%)';
  }

  if (language === 'RU') {
    return 'linear-gradient(90deg, #ffffff 0%, #ffffff 33%, #2f6fff 33%, #2f6fff 66%, #ff5252 66%, #ff5252 100%)';
  }

  if (language === 'CZ') {
    return 'linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #11457e 50%, #11457e 75%, #d7141a 75%, #d7141a 100%)';
  }

  if (language === 'DE') {
    return 'linear-gradient(90deg, #000000 0%, #000000 33%, #dd0000 33%, #dd0000 66%, #ffce00 66%, #ffce00 100%)';
  }

  if (language === 'PL') {
    return 'linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #dc143c 50%, #dc143c 100%)';
  }

  if (language === 'UA') {
    return 'linear-gradient(90deg, #1f57d6 0%, #1f57d6 50%, #ffd84a 50%, #ffd84a 100%)';
  }

  return 'linear-gradient(90deg, #1f57d6 0%, #1f57d6 40%, #ffffff 40%, #ffffff 60%, #e53e4f 60%, #e53e4f 100%)';
}

function getCategoryLabel(category?: string, language: AppLanguage = 'EN') {
  const normalized = String(category || '').toLowerCase();
  const found = categories.find((item) => item.id === normalized);

  if (!found) return 'Service';

  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    beauty: {
      EN: 'Beauty',
      ES: 'Belleza',
      RU: 'Красота',
      CZ: 'Krása',
      DE: 'Beauty',
      PL: 'Uroda',
      UA: 'Краса',
    },
    barber: {
      EN: 'Barber',
      ES: 'Barbero',
      RU: 'Барбер',
      CZ: 'Barber',
      DE: 'Barber',
      PL: 'Barber',
      UA: 'Барбер',
    },
    wellness: {
      EN: 'Wellness',
      ES: 'Bienestar',
      RU: 'Велнес',
      CZ: 'Wellness',
      DE: 'Wellness',
      PL: 'Wellness',
      UA: 'Велнес',
    },
    home: {
      EN: 'Home',
      ES: 'Hogar',
      RU: 'Дом',
      CZ: 'Domov',
      DE: 'Zuhause',
      PL: 'Dom',
      UA: 'Дім',
    },
    repairs: {
      EN: 'Repairs',
      ES: 'Reparaciones',
      RU: 'Ремонт',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      PL: 'Naprawy',
      UA: 'Ремонт',
    },
    tech: {
      EN: 'Tech',
      ES: 'Tecnología',
      RU: 'Техника',
      CZ: 'Technika',
      DE: 'Technik',
      PL: 'Technika',
      UA: 'Техніка',
    },
    pets: {
      EN: 'Pets',
      ES: 'Mascotas',
      RU: 'Питомцы',
      CZ: 'Mazlíčci',
      DE: 'Haustiere',
      PL: 'Zwierzęta',
      UA: 'Улюбленці',
    },
    fashion: {
      EN: 'Fashion',
      ES: 'Moda',
      RU: 'Мода',
      CZ: 'Móda',
      DE: 'Mode',
      PL: 'Moda',
      UA: 'Мода',
    },
    auto: {
      EN: 'Auto',
      ES: 'Auto',
      RU: 'Авто',
      CZ: 'Auto',
      DE: 'Auto',
      PL: 'Auto',
      UA: 'Авто',
    },
    moving: {
      EN: 'Moving',
      ES: 'Mudanza',
      RU: 'Переезд',
      CZ: 'Stěhování',
      DE: 'Umzug',
      PL: 'Przeprowadzka',
      UA: 'Переїзд',
    },
    fitness: {
      EN: 'Fitness',
      ES: 'Fitness',
      RU: 'Фитнес',
      CZ: 'Fitness',
      DE: 'Fitness',
      PL: 'Fitness',
      UA: 'Фітнес',
    },
    education: {
      EN: 'Education',
      ES: 'Educación',
      RU: 'Обучение',
      CZ: 'Vzdělání',
      DE: 'Bildung',
      PL: 'Edukacja',
      UA: 'Освіта',
    },
    events: {
      EN: 'Events',
      ES: 'Eventos',
      RU: 'События',
      CZ: 'Události',
      DE: 'Events',
      PL: 'Wydarzenia',
      UA: 'Події',
    },
    activities: {
      EN: 'Activities',
      ES: 'Actividades',
      RU: 'Активности',
      CZ: 'Aktivity',
      DE: 'Aktivitäten',
      PL: 'Aktywności',
      UA: 'Активності',
    },
    creative: {
      EN: 'Creative',
      ES: 'Creativo',
      RU: 'Креатив',
      CZ: 'Kreativa',
      DE: 'Kreativ',
      PL: 'Kreatywne',
      UA: 'Креатив',
    },
  };

  return map[normalized]?.[language] || found.shortLabel || found.label;
}

function normalizeText(value: string) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreTextMatch(query: string, target: string) {
  const q = normalizeText(query);
  const tValue = normalizeText(target);

  if (!q || !tValue) return 0;
  if (tValue === q) return 120;
  if (tValue.startsWith(q)) return 90;
  if (tValue.includes(q)) return 70;

  return 0;
}

function saveRecentSearch(value: string) {
  if (typeof window === 'undefined') return;
  const trimmed = value.trim();
  if (!trimmed) return;

  const key = 'mapbook_recent_searches';
  const current = JSON.parse(window.localStorage.getItem(key) || '[]') as string[];
  const next = [
    trimmed,
    ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 6);
  window.localStorage.setItem(key, JSON.stringify(next));
}

function readRecentSearches() {
  if (typeof window === 'undefined') return [] as string[];
  return JSON.parse(window.localStorage.getItem('mapbook_recent_searches') || '[]') as string[];
}

function languageFlag(language: AppLanguage) {
  if (language === 'ES') return '🇪🇸';
  if (language === 'RU') return '🇷🇺';
  if (language === 'CZ') return '🇨🇿';
  if (language === 'DE') return '🇩🇪';
  if (language === 'PL') return '🇵🇱';
  if (language === 'UA') return '🇺🇦';
  if (language === 'IT') return '🇮🇹';
  if (language === 'FR') return '🇫🇷';
  if (language === 'AR') return '🇦🇪';
  return '🇬🇧';
}

function findPromotionMaster(promo: PromotionItem, masters: any[]) {
  const anyPromo = promo as any;
  const normalizedCategory = String(anyPromo.categoryId || '').toLowerCase().trim();
  const normalizedTitle = normalizeText(anyPromo.title);
  const normalizedSubtitle = normalizeText(anyPromo.subtitle || '');
  const words = `${normalizedTitle} ${normalizedSubtitle}`
    .split(' ')
    .filter((word) => word.length > 2);

  const exactByMasterId = masters.find(
    (master: any) =>
      String(master.id) === String(anyPromo.masterId) ||
      String(master.id) === String(anyPromo.listingId)
  );

  if (exactByMasterId) return exactByMasterId;

  const scoreMaster = (master: any) => {
    const haystack = normalizeText(
      [
        master.name || '',
        master.title || '',
        master.subcategory || '',
        master.description || '',
        master.category || '',
        master.city || '',
      ].join(' ')
    );

    let score = 0;

    if (normalizedTitle && haystack.includes(normalizedTitle)) score += 120;
    if (normalizedSubtitle && haystack.includes(normalizedSubtitle)) score += 80;

    words.forEach((word) => {
      if (haystack.includes(word)) score += 18;
    });

    if (
      normalizedCategory &&
      String(master.category || '').toLowerCase().trim() === normalizedCategory
    ) {
      score += 35;
    }

    return score;
  };

  const best = masters
    .map((master: any) => ({ master, score: scoreMaster(master) }))
    .sort((a, b) => b.score - a.score)[0];

  if (best && best.score > 0) return best.master;

  return null;
}

function isPromotionInCategory(promo: PromotionItem, categoryId: string) {
  return String((promo as any).categoryId || '')
    .toLowerCase()
    .trim() === String(categoryId || '').toLowerCase().trim();
}

function extractPromotionDiscountBadge(promo: PromotionItem) {
  const anyPromo = promo as any;

  const rawCandidates = [
    anyPromo.discountBadge,
    anyPromo.badgeText,
    anyPromo.discountText,
    anyPromo.discountLabel,
    anyPromo.discount,
  ];

  for (const candidate of rawCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      const value = candidate.trim();
      if (value.includes('%')) {
        return value.startsWith('-') ? value : `-${value.replace(/^-/, '')}`;
      }
      if (value.toUpperCase() === 'SALE') return 'SALE';
    }
  }

  const numericCandidates = [
    anyPromo.discountPercent,
    anyPromo.discount_percentage,
    anyPromo.percentOff,
    anyPromo.salePercent,
  ];

  for (const candidate of numericCandidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return `-${candidate}%`;
    }

    if (typeof candidate === 'string' && candidate.trim()) {
      const parsed = Number(candidate.replace('%', '').trim());
      if (Number.isFinite(parsed)) {
        return `-${parsed}%`;
      }
    }
  }

  const subtitle = String(anyPromo.subtitle || '');
  const title = String(anyPromo.title || '');
  const combined = `${title} ${subtitle}`;
  const match = combined.match(/(\d{1,2})\s?%/);

  if (match) {
    return `-${match[1]}%`;
  }

  return 'SALE';
}

function getCurrencySymbolForLocation(label: string) {
  const lower = String(label || '').toLowerCase();

  if (lower.includes('prague') || lower.includes('czech')) return 'Kč';
  if (lower.includes('warsaw') || lower.includes('poland')) return 'zł';
  if (lower.includes('kyiv') || lower.includes('ukraine')) return '₴';
  if (lower.includes('madrid') || lower.includes('spain')) return '€';
  if (lower.includes('berlin') || lower.includes('germany')) return '€';

  return '£';
}

function ActionCountButton({
  icon,
  title,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 60,
        border: '2px solid #111111',
        borderRadius: 22,
        background: '#ffffff',
        color: '#111111',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 38px',
        alignItems: 'center',
        gap: 8,
        padding: '0 10px 0 12px',
        boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
      </div>

      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: '2px solid #111111',
          background: '#ffffff',
          color: '#111111',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function BrandMark() {
  return (
    <div
      style={{
        position: 'relative',
        width: 46,
        height: 46,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50% 50% 50% 6px',
          transform: 'rotate(45deg)',
          background:
            'linear-gradient(135deg, #ff4d6d 0%, #ffb548 34%, #36c96a 64%, #2f73ff 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 9,
          top: 9,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#ffffff',
          border: '2px solid #111111',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 19,
          top: 19,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#111111',
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const promotionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const seenPromotionIdsRef = useRef<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [mapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [likedMasterIds, setLikedMasterIds] = useState<string[]>([]);
  const [likedFilterMode, setLikedFilterMode] = useState<'none' | 'category' | 'all'>('none');
  const [dealFilterMode, setDealFilterMode] = useState<DealFilterMode>('none');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [recenterToUserTrigger] = useState(0);
  const [searchLocation, setSearchLocation] = useState(getEffectiveSearchLocation());
  const [locationLabel, setLocationLabel] = useState(getEffectiveSearchLocation().label);
  const [regionVersion, setRegionVersion] = useState(0);
  const [currencyVersion, setCurrencyVersion] = useState(0);

  const tr = t(language);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const syncAppContext = () => {
      setLanguage(getSavedLanguage());

      const effective = getEffectiveSearchLocation();
      setSearchLocation(effective);
      setLocationLabel(effective.label);

      setRegionVersion((prev) => prev + 1);
    };

    syncAppContext();

    window.addEventListener('focus', syncAppContext);
    window.addEventListener('storage', syncAppContext);

    const unsubscribe = subscribeToAppRegionSettings(syncAppContext);

    return () => {
      window.removeEventListener('focus', syncAppContext);
      window.removeEventListener('storage', syncAppContext);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshLiveCurrencyRates().finally(() => {
      setCurrencyVersion((prev) => prev + 1);
    });
  }, []);

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
    const loadListings = () => setListings(getListings());
    loadListings();
    return subscribeToListingsStore(loadListings);
  }, []);

  useEffect(() => {
    const loadLiked = () => setLikedMasterIds(getLikedMasterIds().map(String));
    loadLiked();
    return subscribeToLikedMasters(loadLiked);
  }, []);

  useEffect(() => {
    const loadPromotions = () => {
      setPromotions(
        getVisiblePromotionsForLocation(
          searchLocation.lat,
          searchLocation.lng,
          undefined,
          language
        )
      );
    };

    loadPromotions();
    const unsubscribe = subscribeToPromotionsStore(loadPromotions);

    return () => {
      unsubscribe();
    };
  }, [searchLocation.lat, searchLocation.lng, language, regionVersion, currencyVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (promotions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          const promoId = element.dataset.promoId;

          if (!promoId) return;
          if (seenPromotionIdsRef.current.has(promoId)) return;

          seenPromotionIdsRef.current.add(promoId);
          incrementPromotionViews(promoId);
        });
      },
      {
        threshold: 0.7,
      }
    );

    promotions.forEach((promo) => {
      const node = promotionCardRefs.current[promo.id];
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [promotions]);

  const listingMasters = useMemo(() => {
    return listings.map((item, index) => listingToMaster(item, index));
  }, [listings]);

  const allMasters = useMemo(() => {
    return [...listingMasters, ...baseMasters];
  }, [listingMasters, baseMasters]);

  const smartResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SmartSearchResult[];

    return searchAliases
      .map((item) => ({
        item,
        score: Math.max(...item.keywords.map((keyword) => scoreTextMatch(q, keyword))),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => ({
        type: 'smart' as const,
        id: `smart-${item.categoryId}-${item.subcategory}-${item.label}`,
        label: item.label,
        categoryId: item.categoryId,
        subcategory: item.subcategory,
      }));
  }, [search]);

  const categoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as CategorySearchResult[];

    return categories
      .map((item) => ({
        item,
        score: Math.max(
          scoreTextMatch(q, item.label),
          scoreTextMatch(q, item.shortLabel || ''),
          scoreTextMatch(q, item.id)
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => ({
        type: 'category' as const,
        id: `category-${item.id}`,
        label: getCategoryLabel(item.id, language),
        categoryId: item.id,
      }));
  }, [search, language]);

  const subcategoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SubcategorySearchResult[];

    return categories
      .flatMap((item) =>
        item.subcategories.map((sub) => ({
          sub,
          categoryId: item.id,
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
      }));
  }, [search]);

  const proResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as MasterSearchResult[];

    return allMasters
      .map((master: any) => {
        const score =
          scoreTextMatch(q, String(master.name || master.title || '')) * 1.5 +
          scoreTextMatch(q, String(master.subcategory || '')) * 1.3 +
          scoreTextMatch(q, String(master.description || '')) * 1.2 +
          scoreTextMatch(q, String(master.city || '')) +
          scoreTextMatch(q, String(master.category || ''));

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

  const filteredMasters = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allMasters.filter((master: any) => {
      const masterCategory = String(master.category || '').toLowerCase().trim();
      const masterSubcategory = String(master.subcategory || '').toLowerCase().trim();

      const categoryMatch = likedFilterMode === 'all' ? true : masterCategory === activeCategory;

      const subcategoryMatch =
        likedFilterMode === 'all'
          ? true
          : !activeSubcategory || masterSubcategory === activeSubcategory.toLowerCase().trim();

      const searchMatch =
        !q ||
        String(master.name || '').toLowerCase().includes(q) ||
        String(master.title || '').toLowerCase().includes(q) ||
        String(master.city || '').toLowerCase().includes(q) ||
        String(master.subcategory || '').toLowerCase().includes(q) ||
        String(master.description || '').toLowerCase().includes(q) ||
        String(master.category || '').toLowerCase().includes(q);

      const likedMatch =
        likedFilterMode === 'none' ? true : likedMasterIds.includes(String(master.id));

      return categoryMatch && subcategoryMatch && searchMatch && likedMatch;
    });
  }, [allMasters, activeCategory, activeSubcategory, search, likedMasterIds, likedFilterMode]);

  const categoryDealsCount = useMemo(() => {
    return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory)).length;
  }, [promotions, activeCategory]);

  const allDealsCount = promotions.length;

  const filteredPromotions = useMemo(() => {
    if (dealFilterMode === 'category') {
      return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory));
    }

    if (dealFilterMode === 'all') {
      return promotions;
    }

    return promotions;
  }, [promotions, dealFilterMode, activeCategory]);

  const promotionMasters = useMemo(() => {
    if (dealFilterMode === 'none') return [] as any[];

    const sourcePromotions =
      dealFilterMode === 'category'
        ? promotions.filter((promo) => isPromotionInCategory(promo, activeCategory))
        : promotions;

    const uniqueMasters = new Map<string, any>();

    sourcePromotions.forEach((promo) => {
      const matchedMaster = findPromotionMaster(promo, allMasters);
      if (!matchedMaster) return;

      const masterId = String(matchedMaster.id);
      const discountBadge = extractPromotionDiscountBadge(promo);

      uniqueMasters.set(masterId, {
        ...matchedMaster,
        discountBadge,
      });
    });

    return Array.from(uniqueMasters.values());
  }, [dealFilterMode, promotions, activeCategory, allMasters]);

  const promotionBadgeTextByMasterId = useMemo(() => {
    const entries = promotionMasters.map((master) => [
      String(master.id),
      String(master.discountBadge || 'SALE'),
    ]);
    return Object.fromEntries(entries);
  }, [promotionMasters]);

  const mapMasters = useMemo(() => {
    if (dealFilterMode !== 'none') return promotionMasters;
    return filteredMasters;
  }, [dealFilterMode, promotionMasters, filteredMasters]);

  useEffect(() => {
    setSelectedMaster(null);
  }, [activeCategory, activeSubcategory, search, likedFilterMode, dealFilterMode]);

  const currentCategoryLabel = getCategoryLabel(activeCategory, language);
  const borderGradient = getLanguageBorder(language);
  const currencySymbol = getCurrencySymbolForLocation(locationLabel);

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
    proResults.length > 0;

  const selectSearchResult = (result: SearchResult) => {
    if (result.type === 'smart') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory(result.subcategory);
      setLikedFilterMode('none');
      setDealFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'category') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory('');
      setLikedFilterMode('none');
      setDealFilterMode('none');
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
      setDealFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    setActiveCategory(String(result.master.category || 'beauty'));
    setActiveSubcategory(result.master.subcategory || '');
    setLikedFilterMode('none');
    setDealFilterMode('none');
    setSelectedMaster(result.master);
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

  const openPromotionView = (promo: PromotionItem) => {
    incrementPromotionViews(promo.id);
    router.push(`/promotion/${promo.id}`);
  };

  const openPromotionBooking = (promo: PromotionItem) => {
    incrementPromotionViews(promo.id);

    const matchedMaster = findPromotionMaster(promo, allMasters);

    if (matchedMaster) {
      router.push(`/booking/${matchedMaster.id}`);
      return;
    }

    setActiveCategory(String((promo as any).categoryId || 'beauty'));
    setActiveSubcategory('');
    setLikedFilterMode('none');
    setDealFilterMode('none');
    setSearch((promo as any).title || '');
    setSearchOpen(false);
    saveRecentSearch((promo as any).title || '');
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
        <section style={{ padding: '10px 12px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '2px 4px 8px',
            }}
          >
            <BrandMark />
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#0d2465',
                letterSpacing: '-0.03em',
              }}
            >
              Olamep
            </div>
          </div>

          <div ref={searchWrapperRef} style={{ position: 'relative', zIndex: 1300 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 56,
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 14px',
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, color: '#111111' }}>⌕</span>
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
                        proResults[0];

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
                    fontSize: 14,
                    color: '#2b2f36',
                    fontWeight: 700,
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
                onClick={() => router.push('/profile/language-region')}
                style={{
                  width: 58,
                  height: 56,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 12,
                  fontWeight: 900,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{languageFlag(language)}</span>
                <span>{language}</span>
              </button>

              <button
                onClick={() => router.push('/profile/language-region')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 26,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {currencySymbol}
              </button>

              <button
                onClick={() => router.push('/profile/language-region')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                ⌖
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
                  border: '2px solid #111111',
                  borderRadius: 22,
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
                                border: '2px solid #111111',
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
                              border: '2px solid #111111',
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
                    {smartResults.length > 0 && (
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
                                border: '2px solid #111111',
                                background: '#fff6f9',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)} • {item.subcategory}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryResults.length > 0 && (
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
                                border: '2px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {subcategoryResults.length > 0 && (
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
                                border: '2px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {proResults.length > 0 && (
                      <div>
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
                                border: '2px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ padding: '6px 0 0' }}>
          <TopCategoriesBar
            language={language}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectCategory={(category) => {
              setActiveCategory(category);
              setLikedFilterMode('none');
              setDealFilterMode('none');
            }}
            onSelectSubcategory={(subcategory) => {
              setActiveSubcategory(subcategory);
            }}
            onClearSubcategory={() => {
              setActiveSubcategory('');
            }}
          />
        </section>

        <section style={{ padding: '6px 12px 0' }}>
          <div
            style={{
              border: '2px solid #111111',
              borderRadius: 28,
              background: '#fff',
              padding: 10,
              boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <ActionCountButton
                onClick={() => {
                  setDealFilterMode('none');
                  setLikedFilterMode((prev) => (prev === 'category' ? 'none' : 'category'));
                }}
                icon={
                  <span style={{ fontSize: 24, color: '#ff3b58', lineHeight: 1 }}>
                    ♥
                  </span>
                }
                title="Favourite"
                count={likedInCategoryCount}
              />

              <ActionCountButton
                onClick={() => {
                  setLikedFilterMode('none');
                  setDealFilterMode((prev) => (prev === 'category' ? 'none' : 'category'));
                }}
                icon={
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#ffd84a',
                      color: '#111111',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    %
                  </span>
                }
                title="Hot offers"
                count={categoryDealsCount}
              />

              <ActionCountButton
                onClick={() => {
                  setDealFilterMode('none');
                  setLikedFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
                }}
                icon={
                  <span style={{ display: 'inline-flex', gap: 2, color: '#ff3b58' }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>♥</span>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>♥</span>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>♥</span>
                  </span>
                }
                title="All favourite"
                count={likedAllCount}
              />

              <ActionCountButton
                onClick={() => {
                  setLikedFilterMode('none');
                  setDealFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
                }}
                icon={
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#ffd84a',
                      color: '#111111',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    %
                  </span>
                }
                title="All hot offers"
                count={allDealsCount}
              />
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
            <div style={{ height: 500, position: 'relative', overflow: 'hidden' }}>
              <RealMap
                masters={mapMasters}
                mapMode={mapMode}
                activeCategory={activeCategory}
                selectedMasterId={selectedMaster?.id ?? null}
                likedMasterIds={likedMasterIds}
                recenterToUserTrigger={recenterToUserTrigger}
                language={language}
                promotionBadgeTextByMasterId={promotionBadgeTextByMasterId}
                onMasterSelect={(master) => {
                  setSelectedMaster(master);
                }}
                onMapBackgroundClick={() => {
                  setSelectedMaster(null);
                }}
                onToggleLike={(master) => {
                  toggleLikedMaster(String(master.id));
                }}
                onViewMaster={(master) => {
                  router.push(`/master/${master.id}`);
                }}
                onBookMaster={(master) => {
                  router.push(`/booking/${master.id}`);
                }}
              />
            </div>
          </div>
        </section>

        {filteredPromotions.length > 0 && (
          <section style={{ padding: '12px 0 0' }}>
            <div
              style={{
                background: '#ece7dd',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                padding: '0 0 12px',
              }}
            >
              <div
                style={{
                  padding: '12px 14px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#21324a',
                  }}
                >
                  {language === 'ES'
                    ? `Ofertas cerca de ${locationLabel}`
                    : `Hot offers near ${locationLabel}`}
                </h2>

                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 24,
                    color: '#8d918f',
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ›
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: '0 14px 6px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {filteredPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    ref={(node) => {
                      promotionCardRefs.current[promo.id] = node;
                    }}
                    data-promo-id={promo.id}
                    style={{
                      minWidth: 300,
                      maxWidth: 300,
                      borderRadius: 30,
                      border: '2px solid #111111',
                      background: '#fff',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => openPromotionView(promo)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={(promo as any).image}
                          alt={(promo as any).title}
                          style={{
                            width: '100%',
                            height: 190,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        <div
                          style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: '#fff',
                            color: '#ff4f93',
                            borderRadius: 999,
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          Sponsored
                        </div>
                      </div>

                      <div style={{ padding: '14px 16px 8px' }}>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 900,
                            color: '#1f2430',
                            lineHeight: 1.2,
                          }}
                        >
                          {(promo as any).title}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#6b7280',
                            lineHeight: 1.45,
                          }}
                        >
                          {(promo as any).subtitle ||
                            (language === 'ES'
                              ? 'Oferta especial cerca de ti'
                              : 'Special offer near you')}
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#ff4f93',
                          }}
                        >
                          {language === 'ES'
                            ? `Vistas: ${(promo as any).views}`
                            : `Views: ${(promo as any).views}`}
                        </div>
                      </div>
                    </button>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        padding: '0 16px 16px',
                      }}
                    >
                      <button
                        onClick={() => openPromotionView(promo)}
                        style={{
                          height: 50,
                          borderRadius: 18,
                          border: '2px solid #111111',
                          background: '#1f4da8',
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {language === 'ES' ? 'Abrir' : 'Open'}
                      </button>

                      <button
                        onClick={() => openPromotionBooking(promo)}
                        style={{
                          height: 50,
                          borderRadius: 18,
                          border: '2px solid #111111',
                          background: '#ff5252',
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {language === 'ES' ? 'Reservar' : 'Book'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
