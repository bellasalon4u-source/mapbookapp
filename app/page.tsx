'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories } from '../services/categories';
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

function getLanguageBorder(language: string) {
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

  return '#ff4f93';
}

function getCategoryLabel(category?: string) {
  const normalized = String(category || '').toLowerCase();
  if (!normalized) return 'Service';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizePaymentMethods(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return ['cash', 'card'];
}

function paymentBadge(method: string) {
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: 'Cash' };
  if (normalized === 'card') return { icon: '💳', label: 'Card' };
  if (normalized === 'wallet') return { icon: '📱', label: 'Wallet' };

  return { icon: '•', label: String(method) };
}

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [language, setLanguage] = useState('EN');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [likedMasterIds, setLikedMasterIds] = useState<string[]>([]);
  const [likedFilterMode, setLikedFilterMode] = useState<'none' | 'category' | 'all'>('none');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [recenterToUserTrigger, setRecenterToUserTrigger] = useState(0);

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
        String(master.description || '').toLowerCase().includes(q);

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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services, categories or professionals..."
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
              <span>All liked</span>
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
              {filteredMasters.filter((item: any) => item.availableNow).length} pros available now
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
                  title="Map style"
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
                  title="My location"
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
                  title="Clear selection"
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
                    <span>Available</span>
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
                    <span>Unavailable</span>
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
                            const item = paymentBadge(method);

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
                                {item.label === 'Cash' || item.label === 'Card' ? null : (
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
                        <span>Verified Pro</span>
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
                        {selectedMaster.availableNow ? 'Available now' : 'Unavailable today'}
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
                          From £{String(selectedMaster.price).replace(/[^\d.]/g, '') || '45'}
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
                      View
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
                      Route
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
                      Book now
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
              Popular Services
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
