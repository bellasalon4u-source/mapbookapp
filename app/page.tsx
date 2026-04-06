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
      'отель для собак',
      'передержка собак',
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
      'почистить ковёр',
      'почистить ковер',
      'помыть ковёр',
    ],
  },
  {
    label: 'Phone repair',
    categoryId: 'tech',
    subcategory: 'Phone Repair',
    keywords: ['phone repair', 'fix phone', 'ремонт телефона', 'починить телефон'],
  },
  {
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: ['hair extensions', 'hairextensions', 'наращивание волос'],
  },
  {
    label: 'Massage',
    categoryId: 'wellness',
    subcategory: 'Massage',
    keywords: ['massage', 'массаж'],
  },
  {
    label: 'Moving',
    categoryId: 'moving',
    subcategory: 'Small Moves',
    keywords: ['moving', 'переезд', 'перевезти вещи'],
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

function getCategoryLabel(category?: string, language: AppLanguage = 'EN') {
  const normalized = String(category || '').toLowerCase();
  const found = categories.find((item) => item.id === normalized);

  if (!found) return 'Service';

  if (language === 'RU') {
    const map: Record<string, string> = {
      beauty: 'Красота',
      barber: 'Барбер',
      wellness: 'Велнес',
      home: 'Дом',
      repairs: 'Ремонт',
      tech: 'Техника',
      fashion: 'Мода',
      pets: 'Питомцы',
      auto: 'Авто',
      moving: 'Переезд',
      fitness: 'Фитнес',
      education: 'Обучение',
      events: 'События',
      activities: 'Активности',
      creative: 'Креатив',
    };
    return map[normalized] || found.shortLabel || found.label;
  }

  if (language === 'UA') {
    const map: Record<string, string> = {
      beauty: 'Краса',
      barber: 'Барбер',
      wellness: 'Велнес',
      home: 'Дім',
      repairs: 'Ремонт',
      tech: 'Техніка',
      fashion: 'Мода',
      pets: 'Улюбленці',
      auto: 'Авто',
      moving: 'Переїзд',
      fitness: 'Фітнес',
      education: 'Навчання',
      events: 'Події',
      activities: 'Активності',
      creative: 'Креатив',
    };
    return map[normalized] || found.shortLabel || found.label;
  }

  return found.shortLabel || found.label;
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
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [likedMasterIds, setLikedMasterIds] = useState<string[]>([]);
  const [likedFilterMode, setLikedFilterMode] = useState<'none' | 'category' | 'all'>('none');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [recenterToUserTrigger] = useState(0);

  const tr = t(language);

  useEffect(() => {
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
    const loadListings = () => setListings(getListings());
    loadListings();
    return subscribeToListingsStore(loadListings);
  }, []);

  useEffect(() => {
    const loadLiked = () => setLikedMasterIds(getLikedMasterIds());
    loadLiked();
    return subscribeToLikedMasters(loadLiked);
  }, []);

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

  useEffect(() => {
    setSelectedMaster(null);
  }, [activeCategory, activeSubcategory, search, likedFilterMode]);

  const mapKey = useMemo(() => {
    const ids = filteredMasters.map((item: any) => String(item.id)).join('|');
    return `${activeCategory}-${activeSubcategory}-${search}-${mapMode}-${likedFilterMode}-${ids}`;
  }, [activeCategory, activeSubcategory, search, mapMode, likedFilterMode, filteredMasters]);

  const borderGradient = getLanguageBorder(language);
  const currentCategoryLabel = getCategoryLabel(activeCategory, language);

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

    setActiveCategory(String(result.master.category || 'beauty'));
    setActiveSubcategory(result.master.subcategory || '');
    setLikedFilterMode('none');
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
                onClick={() => {
                  const nextLanguage: AppLanguage =
                    language === 'EN' ? 'UA' : language === 'UA' ? 'RU' : 'EN';

                  setLanguage(nextLanguage);
                  saveLanguage(nextLanguage);
                }}
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
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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
                  <div style={{ padding: '12px 6px', fontSize: 14, fontWeight: 800, color: '#74808c' }}>
                    {tr.noResultsFound}
                  </div>
                ) : (
                  <>
                    {smartResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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
                                {getCategoryLabel(item.categoryId, language)} • {item.subcategory}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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
                    )}

                    {subcategoryResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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
                                {getCategoryLabel(item.categoryId, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {proResults.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
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

        <section style={{ padding: '10px 0 0' }}>
          <TopCategoriesBar
            language={language}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setLikedFilterMode((prev) => (prev === 'category' ? 'none' : 'category'))}
              style={{
                border: likedFilterMode === 'category' ? '3px solid #ff2020' : '1px solid #dadada',
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
              }}
            >
              <span style={{ color: '#ff2020', fontSize: 18 }}>♥</span>
              <span>{currentCategoryLabel}</span>
              <span
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #e4e4e4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  background: '#fff',
                }}
              >
                {likedInCategoryCount}
              </span>
            </button>

            <button
              onClick={() => setLikedFilterMode((prev) => (prev === 'all' ? 'none' : 'all'))}
              style={{
                border: likedFilterMode === 'all' ? '3px solid #ff2020' : '1px solid #dadada',
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
              }}
            >
              <span style={{ color: '#ff2020', fontSize: 18 }}>♥</span>
              <span>{tr.allLiked}</span>
              <span
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #e4e4e4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
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
              }}
            >
              {filteredMasters.filter((item: any) => item.availableNow).length} {tr.prosAvailableNow}
            </div>
          </div>
        </section>

        <section style={{ padding: '8px 0 0' }}>
          <div style={{ background: '#ffffff', borderTop: '1px solid #e7e1d8', borderBottom: '1px solid #e7e1d8' }}>
            <div style={{ height: 520, position: 'relative', overflow: 'hidden' }}>
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
                onToggleLike={(master: any) => toggleLikedMaster(master.id)}
              />
            </div>
          </div>
        </section>

        <section style={{ padding: '12px 14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#223145' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            {popularServices.map((service) => (
              <button
                key={service.id}
                onClick={() => runQuickSearch(service.title)}
                style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ marginTop: 7, fontSize: 11, lineHeight: 1.2, fontWeight: 800, color: '#253140' }}>
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
