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

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [language, setLanguage] = useState('EN');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);

  useEffect(() => {
    const loadListings = () => {
      setListings(getListings());
    };

    loadListings();
    const unsubscribe = subscribeToListingsStore(loadListings);
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
      const masterCategory = String(master.category || '')
        .toLowerCase()
        .trim();

      const masterSubcategory = String(master.subcategory || '')
        .toLowerCase()
        .trim();

      const categoryMatch = masterCategory === activeCategory;

      const subcategoryMatch =
        !activeSubcategory ||
        masterSubcategory === activeSubcategory.toLowerCase().trim();

      const searchMatch =
        !q ||
        String(master.name || '').toLowerCase().includes(q) ||
        String(master.title || '').toLowerCase().includes(q) ||
        String(master.city || '').toLowerCase().includes(q) ||
        String(master.subcategory || '').toLowerCase().includes(q) ||
        String(master.description || '').toLowerCase().includes(q);

      return categoryMatch && subcategoryMatch && searchMatch;
    });
  }, [allMasters, activeCategory, activeSubcategory, search]);

  useEffect(() => {
    setSelectedMaster(null);
  }, [activeCategory, activeSubcategory, search]);

  const mapKey = useMemo(() => {
    const ids = filteredMasters.map((item: any) => String(item.id)).join('|');
    return `${activeCategory}-${activeSubcategory}-${search}-${mapMode}-${ids}`;
  }, [activeCategory, activeSubcategory, search, mapMode, filteredMasters]);

  const borderGradient = getLanguageBorder(language);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 126,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: '#f7f3eb',
          borderTop: '6px solid transparent',
          borderImage: `${borderGradient} 1`,
          boxShadow: '0 0 0 1px rgba(226,218,205,0.35)',
        }}
      >
        <section style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 10,
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: 22,
              padding: '12px 12px 12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid #ece7df',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, color: '#2f8df5' }}>🔎</span>
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
                  fontSize: 16,
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
                minWidth: 82,
                height: 52,
                padding: '0 14px',
                fontSize: 16,
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
              title="Change language"
            >
              <span style={{ fontSize: 24 }}>
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
                width: 52,
                height: 52,
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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

        <section style={{ padding: '14px 0 0' }}>
          <TopCategoriesBar
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectCategory={(category) => {
              setActiveCategory(category);
            }}
            onSelectSubcategory={(subcategory) => {
              setActiveSubcategory(subcategory);
            }}
            onClearSubcategory={() => {
              setActiveSubcategory('');
            }}
          />
        </section>

        <section style={{ padding: '10px 16px 0' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                border: '1px solid #eadfce',
                background: '#fff',
                color: '#2a3442',
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 900,
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
              }}
            >
              {categories.find((item) => item.id === activeCategory)?.label || activeCategory}
            </div>

            {activeSubcategory ? (
              <button
                onClick={() => setActiveSubcategory('')}
                style={{
                  border: '1px solid #efcf68',
                  background: '#ffe55c',
                  color: '#2a2f36',
                  borderRadius: 999,
                  padding: '10px 14px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 6px 14px rgba(255,214,64,0.25)',
                }}
              >
                <span>{activeSubcategory}</span>
                <span style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
              </button>
            ) : null}

            <button
              onClick={() => {
                setSearch('');
                setActiveSubcategory('');
                setSelectedMaster(null);
              }}
              style={{
                border: '1px dashed #d8cfbf',
                background: '#fff',
                color: '#5d6672',
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>

            <div
              style={{
                marginLeft: 'auto',
                border: '1px solid #d9ecd7',
                background: '#eefbe9',
                color: '#2f9c47',
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(47,156,71,0.10)',
              }}
            >
              {filteredMasters.filter((item: any) => item.availableNow).length} pros available now
            </div>
          </div>
        </section>

        <section style={{ padding: '10px 0 0' }}>
          <div
            style={{
              background: '#ffffff',
              borderTop: '1px solid #e7e1d8',
              borderBottom: '1px solid #e7e1d8',
            }}
          >
            <div
              style={{
                height: 470,
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
                onMasterSelect={(master: any) => setSelectedMaster(master)}
                onMapBackgroundClick={() => setSelectedMaster(null)}
              />

              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  zIndex: 30,
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
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 20,
                    color: '#3d454f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Map style"
                >
                  {mapMode === 'satellite' ? '🛰' : '⌖'}
                </button>

                <button
                  onClick={() => setSelectedMaster(null)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    border: '1px solid #e5ddd1',
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 20,
                    color: '#3d454f',
                    cursor: 'pointer',
                  }}
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 14,
                  background: 'rgba(255,255,255,0.96)',
                  borderRadius: 18,
                  padding: '14px 16px',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
                  zIndex: 20,
                  minWidth: 138,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#2c3542',
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
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
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#2c3542',
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: '#fff',
                      border: '4px solid #ff5c70',
                      display: 'inline-block',
                    }}
                  />
                  <span>Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
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
                fontSize: 26,
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
                    boxShadow: '0 5px 14px rgba(0,0,0,0.08)',
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
                    marginTop: 8,
                    fontSize: 12,
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
