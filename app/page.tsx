'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import BottomNav from '../components/common/BottomNav';
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

const searchAliases = [
  {
    label: 'Dog hotel',
    categoryId: 'pets',
    subcategory: 'Pet Sitting',
    keywords: ['dog hotel', 'hotel for dogs', 'pet hotel', 'dog boarding'],
  },
  {
    label: 'Carpet cleaning',
    categoryId: 'home',
    subcategory: 'Deep Cleaning',
    keywords: ['carpet cleaning', 'clean carpet', 'wash carpet'],
  },
  {
    label: 'Phone repair',
    categoryId: 'tech',
    subcategory: 'Phone Repair',
    keywords: ['phone repair', 'fix phone'],
  },
  {
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: ['hair extensions', 'hairextensions'],
  },
  {
    label: 'Massage',
    categoryId: 'wellness',
    subcategory: 'Massage',
    keywords: ['massage'],
  },
  {
    label: 'Moving',
    categoryId: 'moving',
    subcategory: 'Small Moves',
    keywords: ['moving', 'move house'],
  },
];

const tickerMessages: Record<AppLanguage, string[]> = {
  EN: ['Hot offers near you', 'New masters added today', 'Verified specialists', 'Instant booking'],
  ES: ['Ofertas cerca de ti', 'Nuevos especialistas hoy', 'Especialistas verificados', 'Reserva instantánea'],
  RU: ['Горячие предложения рядом', 'Новые мастера сегодня', 'Проверенные специалисты', 'Мгновенное бронирование'],
  UA: ['Гарячі пропозиції поруч', 'Нові майстри сьогодні', 'Перевірені спеціалісти', 'Миттєве бронювання'],
  CZ: ['Akční nabídky poblíž', 'Noví specialisté dnes', 'Ověření specialisté', 'Okamžitá rezervace'],
  DE: ['Angebote in deiner Nähe', 'Neue Profis heute', 'Verifizierte Spezialisten', 'Sofort buchen'],
  IT: ['Offerte vicino a te', 'Nuovi specialisti oggi', 'Specialisti verificati', 'Prenotazione immediata'],
  FR: ['Offres près de vous', 'Nouveaux pros aujourd’hui', 'Spécialistes vérifiés', 'Réservation instantanée'],
  AR: ['عروض قريبة منك', 'متخصصون جدد اليوم', 'متخصصون موثّقون', 'حجز فوري'],
  PL: ['Oferty blisko Ciebie', 'Nowi specjaliści dziś', 'Zweryfikowani specjaliści', 'Natychmiastowa rezerwacja'],
};

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
    [51.5330, -0.1640],
    [51.4980, -0.1830],
    [51.5400, -0.0450],
    [51.4840, -0.0200],
    [51.5202, -0.1028],
    [51.5159, -0.1426],
    [51.5098, -0.1180],
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

function getCurrencySymbolForLocation(label: string) {
  const lower = String(label || '').toLowerCase();

  if (lower.includes('prague') || lower.includes('czech')) return 'Kč';
  if (lower.includes('warsaw') || lower.includes('poland')) return 'zł';
  if (lower.includes('kyiv') || lower.includes('ukraine')) return '₴';
  if (lower.includes('madrid') || lower.includes('spain')) return '€';
  if (lower.includes('berlin') || lower.includes('germany')) return '€';

  return '£';
}

function getCategoryLabel(category?: string, language: AppLanguage = 'EN') {
  const normalized = String(category || '').toLowerCase();
  const found = categories.find((item) => item.id === normalized);

  if (!found) return 'Service';

  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', CZ: 'Více', DE: 'Mehr', PL: 'Więcej', UA: 'Ще' },
    beauty: { EN: 'Beauty', ES: 'Belleza', RU: 'Красота', CZ: 'Krása', DE: 'Beauty', PL: 'Uroda', UA: 'Краса' },
    barber: { EN: 'Barber', ES: 'Barbero', RU: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber', UA: 'Барбер' },
    wellness: { EN: 'Wellness', ES: 'Bienestar', RU: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness', UA: 'Велнес' },
    home: { EN: 'Home', ES: 'Hogar', RU: 'Дом', CZ: 'Domov', DE: 'Zuhause', PL: 'Dom', UA: 'Дім' },
    repairs: { EN: 'Repairs', ES: 'Reparaciones', RU: 'Ремонт', CZ: 'Opravy', DE: 'Reparaturen', PL: 'Naprawy', UA: 'Ремонт' },
    tech: { EN: 'Tech', ES: 'Tecnología', RU: 'Техника', CZ: 'Technika', DE: 'Technik', PL: 'Technika', UA: 'Техніка' },
    pets: { EN: 'Pets', ES: 'Mascotas', RU: 'Питомцы', CZ: 'Mazlíčci', DE: 'Haustiere', PL: 'Zwierzęta', UA: 'Тварини' },
    fashion: { EN: 'Fashion', ES: 'Moda', RU: 'Мода', CZ: 'Móda', DE: 'Mode', PL: 'Moda', UA: 'Мода' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', CZ: 'Auto', DE: 'Auto', PL: 'Auto', UA: 'Авто' },
    moving: { EN: 'Moving', ES: 'Mudanza', RU: 'Переезд', CZ: 'Stěhování', DE: 'Umzug', PL: 'Przeprowadzka', UA: 'Переїзд' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness', UA: 'Фітнес' },
    education: { EN: 'Education', ES: 'Educación', RU: 'Обучение', CZ: 'Vzdělání', DE: 'Bildung', PL: 'Edukacja', UA: 'Освіта' },
    events: { EN: 'Events', ES: 'Eventos', RU: 'События', CZ: 'Události', DE: 'Events', PL: 'Wydarzenia', UA: 'Події' },
    activities: { EN: 'Activities', ES: 'Actividades', RU: 'Активности', CZ: 'Aktivity', DE: 'Aktivitäten', PL: 'Aktywności', UA: 'Активності' },
    creative: { EN: 'Creative', ES: 'Creativo', RU: 'Креатив', CZ: 'Kreativa', DE: 'Kreativ', PL: 'Kreatywne', UA: 'Креатив' },
  };

  return map[normalized]?.[language] || found.shortLabel || found.label;
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

function getTickerBackground(language: AppLanguage) {
  switch (language) {
    case 'EN':
      return 'linear-gradient(90deg, rgba(1,33,105,0.05) 0%, rgba(255,255,255,1) 36%, rgba(200,16,46,0.05) 100%)';
    case 'RU':
      return 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(0,57,166,0.05) 55%, rgba(213,43,30,0.05) 100%)';
    case 'CZ':
      return 'linear-gradient(90deg, rgba(17,69,126,0.05) 0%, rgba(255,255,255,1) 45%, rgba(215,20,26,0.05) 100%)';
    case 'DE':
      return 'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(221,0,0,0.03) 55%, rgba(255,206,0,0.05) 100%)';
    case 'PL':
      return 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(220,20,60,0.05) 100%)';
    case 'ES':
      return 'linear-gradient(90deg, rgba(198,0,43,0.04) 0%, rgba(255,204,0,0.07) 50%, rgba(198,0,43,0.04) 100%)';
    case 'UA':
      return 'linear-gradient(90deg, rgba(0,87,183,0.05) 0%, rgba(255,213,0,0.09) 100%)';
    case 'FR':
      return 'linear-gradient(90deg, rgba(0,85,164,0.05) 0%, rgba(255,255,255,1) 50%, rgba(239,65,53,0.05) 100%)';
    case 'IT':
      return 'linear-gradient(90deg, rgba(0,146,70,0.05) 0%, rgba(255,255,255,1) 50%, rgba(206,43,55,0.05) 100%)';
    default:
      return 'linear-gradient(90deg, #ffffff 0%, #fffdf9 100%)';
  }
}

function ActionCountButton({
  icon,
  title,
  count,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 54,
        border: '1.2px solid #cfc8be',
        borderRadius: 18,
        background: '#ffffff',
        color: '#151515',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 34px',
        alignItems: 'center',
        gap: 8,
        padding: '0 10px 0 12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </span>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {title}
        </span>
      </div>

      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          border: '1.4px solid #151515',
          background: '#ffffff',
          color: '#151515',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function BrightTicker({ language }: { language: AppLanguage }) {
  const logo = '/ui/logo/logo.png';
  const messages = tickerMessages[language] || tickerMessages.EN;

  return (
    <div
      style={{
        height: 34,
        borderTop: '1px solid #e8e1d7',
        borderBottom: '1px solid #e8e1d7',
        background: getTickerBackground(language),
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          marginRight: 12,
        }}
      >
        <img
          src={logo}
          alt="Olamep"
          style={{
            width: 58,
            height: 16,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <div
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            whiteSpace: 'nowrap',
            color: '#151515',
            fontSize: 11,
            fontWeight: 500,
            paddingLeft: '100%',
            animation: 'olamepTickerMove 18s linear infinite',
          }}
        >
          {messages.map((item, index) => (
            <span key={`${item}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span>{item}</span>
              <span style={{ color: '#f0cf22', fontSize: 8 }}>●</span>
            </span>
          ))}
          {messages.map((item, index) => (
            <span key={`${item}-repeat-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span>{item}</span>
              <span style={{ color: '#f0cf22', fontSize: 8 }}>●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromoCard({
  promo,
  onOpen,
}: {
  promo: PromotionItem;
  language: AppLanguage;
  onOpen: () => void;
}) {
  const anyPromo = promo as any;
  const discountBadge = extractPromotionDiscountBadge(promo);

  return (
    <button
      onClick={onOpen}
      style={{
        minWidth: 150,
        maxWidth: 150,
        border: '1.2px solid #cfc8be',
        borderRadius: 16,
        background: '#ffffff',
        overflow: 'hidden',
        flexShrink: 0,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={anyPromo.image}
          alt={anyPromo.title}
          style={{
            width: '100%',
            height: 92,
            objectFit: 'cover',
            display: 'block',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            background: '#ffffff',
            color: '#ff4f93',
            borderRadius: 999,
            padding: '4px 8px',
            fontSize: 9,
            fontWeight: 900,
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
          }}
        >
          Sponsored
        </div>
      </div>

      <div style={{ padding: '8px 10px 10px' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#151515',
            lineHeight: 1.2,
            minHeight: 30,
          }}
        >
          {anyPromo.title}
        </div>

        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: '#ff4f93',
            }}
          >
            {discountBadge}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#151515',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 12 }}>◉</span>
            <span>{anyPromo.views || 0}</span>
          </div>
        </div>
      </div>
    </button>
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
      { threshold: 0.7 }
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

  const searchedMasters = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return allMasters;

    return allMasters.filter((master: any) => {
      return (
        String(master.name || '').toLowerCase().includes(q) ||
        String(master.title || '').toLowerCase().includes(q) ||
        String(master.city || '').toLowerCase().includes(q) ||
        String(master.subcategory || '').toLowerCase().includes(q) ||
        String(master.description || '').toLowerCase().includes(q) ||
        String(master.category || '').toLowerCase().includes(q)
      );
    });
  }, [allMasters, search]);

  const categoryDealsCount = useMemo(() => {
    return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory)).length;
  }, [promotions, activeCategory]);

  const allDealsCount = promotions.length;

  const filteredPromotions = useMemo(() => {
    if (dealFilterMode === 'category') {
      return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory));
    }
    return promotions;
  }, [promotions, dealFilterMode, activeCategory]);

  const promotionMasters = useMemo(() => {
    if (dealFilterMode !== 'none') {
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
    }

    return [] as any[];
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
    return searchedMasters;
  }, [dealFilterMode, promotionMasters, searchedMasters]);

  useEffect(() => {
    setSelectedMaster(null);
  }, [activeCategory, activeSubcategory, search, likedFilterMode, dealFilterMode]);

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

  const currencySymbol = getCurrencySymbolForLocation(locationLabel);

  const displayLikedInCategoryCount = likedInCategoryCount > 0 ? likedInCategoryCount : 12;
  const displayCategoryDealsCount = categoryDealsCount > 0 ? categoryDealsCount : 7;
  const displayLikedAllCount = likedAllCount > 0 ? likedAllCount : 38;
  const displayAllDealsCount = allDealsCount > 0 ? allDealsCount : 16;

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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f4ef',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 128,
      }}
    >
      <style jsx global>{`
        @keyframes olamepTickerMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: '#f6f4ef',
        }}
      >
        <section style={{ padding: '10px 12px 0' }}>
          <div ref={searchWrapperRef} style={{ position: 'relative', zIndex: 1300 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 50px 50px 50px',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 50,
                  borderRadius: 20,
                  border: '1.2px solid #d8d2c8',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 14px',
                  minWidth: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, color: '#9ca3af' }}>⌕</span>

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
                    fontSize: 11,
                    color: '#2b2f36',
                    fontWeight: 600,
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
                      fontSize: 15,
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
                onClick={() => router.push('/profile/language')}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  border: '1.2px solid #d8d2c8',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 9,
                  fontWeight: 900,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1 }}>{languageFlag(language)}</span>
                <span>{language}</span>
              </button>

              <button
                onClick={() => router.push('/profile/currency')}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  border: '1.2px solid #d8d2c8',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 22,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                {currencySymbol}
              </button>

              <button
                onClick={() => router.push('/profile/location')}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  border: '1.2px solid #d8d2c8',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 19,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                ⌖
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <BrightTicker language={language} />
            </div>

            {searchOpen ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'rgba(255,255,255,0.98)',
                  border: '1.3px solid #d0c8bd',
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
                                border: '1.2px solid #d0c8bd',
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
                              border: '1.2px solid #f1c7d8',
                              background: '#fff7fb',
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
                                border: '1.2px solid #edd7df',
                                background: '#fff7fb',
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
                                border: '1.2px solid #d0c8bd',
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
                                border: '1.2px solid #d0c8bd',
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
                                border: '1.2px solid #d0c8bd',
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

        <section style={{ padding: '8px 0 0' }}>
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

        <section style={{ padding: '10px 12px 0' }}>
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
              icon={<span style={{ fontSize: 18, color: '#ff3b58', lineHeight: 1 }}>♥</span>}
              title="Favourite"
              count={displayLikedInCategoryCount}
            />

            <ActionCountButton
              onClick={() => {
                setLikedFilterMode('none');
                setDealFilterMode((prev) => (prev === 'category' ? 'none' : 'category'));
              }}
              icon={
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#f5d84e',
                    color: '#111111',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  %
                </span>
              }
              title="Hot offers"
              count={displayCategoryDealsCount}
            />

            <ActionCountButton
              onClick={() => {
                setDealFilterMode('none');
                setLikedFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
              }}
              icon={
                <span style={{ display: 'inline-flex', gap: 1, color: '#ff3b58' }}>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>♥</span>
                  <span style={{ fontSize: 12, lineHeight: 1 }}>♥</span>
                  <span style={{ fontSize: 11, lineHeight: 1 }}>♥</span>
                </span>
              }
              title="All favourite"
              count={displayLikedAllCount}
            />

            <ActionCountButton
              onClick={() => {
                setLikedFilterMode('none');
                setDealFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
              }}
              icon={
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#f5d84e',
                    color: '#111111',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  %
                </span>
              }
              title="All hot offers"
              count={displayAllDealsCount}
            />
          </div>
        </section>

        <section style={{ padding: '12px 12px 0' }}>
          <div
            style={{
              borderRadius: 26,
              overflow: 'hidden',
              border: '1.2px solid #d8d2c8',
              background: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ height: 438, position: 'relative', overflow: 'hidden' }}>
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

              <button
                onClick={() => router.push('/profile/location')}
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 92,
                  transform: 'translateX(-50%)',
                  border: '1.2px solid #d7d1c7',
                  background: '#ffffff',
                  borderRadius: 999,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#151515',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 20px rgba(15,23,42,0.10)',
                  cursor: 'pointer',
                  zIndex: 500,
                }}
              >
                <span style={{ color: '#2b7cf6', fontSize: 18, lineHeight: 1 }}>⌖</span>
                <span>My location</span>
              </button>
            </div>
          </div>
        </section>

        {filteredPromotions.length > 0 && (
          <section style={{ padding: '20px 0 0' }}>
            <div
              style={{
                background: '#f6f4ef',
                padding: '0 0 12px',
              }}
            >
              <div
                style={{
                  padding: '0 12px 0',
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
                    color: '#111111',
                  }}
                >
                  {language === 'ES' ? 'Ofertas cerca de ti' : 'Hot offers near you'}
                </h2>

                <button
                  onClick={() => router.push('/explore')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: '#ff4f93',
                    fontWeight: 900,
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {language === 'ES' ? 'Ver todo ›' : 'See all ›'}
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: '0 12px 4px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {filteredPromotions.slice(0, 8).map((promo) => (
                  <div
                    key={promo.id}
                    ref={(node) => {
                      promotionCardRefs.current[promo.id] = node;
                    }}
                    data-promo-id={promo.id}
                  >
                    <PromoCard
                      promo={promo}
                      language={language}
                      onOpen={() => openPromotionView(promo)}
                    />
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
