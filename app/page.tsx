'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories as appCategories } from '../services/categories';
import {
  getUnreadMessagesCount,
  subscribeToChatStore,
} from '../services/chatStore';
import {
  getListings,
  subscribeToListingsStore,
  type ListingItem,
} from '../services/listingsStore';

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
    id: 'appliance-repair',
    title: 'Appliance Repair',
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

function getFeaturedCategories() {
  return ['beauty', 'wellness', 'home', 'repairs', 'tech', 'pets']
    .map((id) => appCategories.find((c) => c.id === id))
    .filter(Boolean);
}

function mapCategoryToId(category: string) {
  const normalized = (category || '').toLowerCase();

  const found = appCategories.find(
    (c) =>
      (c.id || '').toLowerCase() === normalized ||
      (c.label || '').toLowerCase() === normalized ||
      (c.shortLabel || '').toLowerCase() === normalized
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

  return {
    id: listing.id,
    name: listing.title,
    title: listing.title,
    category: mapCategoryToId(listing.category),
    city: listing.location || 'London',
    rating: 4.8,
    availableToday: listing.availableToday,
    availableNow: listing.availableToday,
    lat: coords[0],
    lng: coords[1],
    avatar:
      listing.photos?.[0] ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    source: 'listing',
    description: listing.description,
    price: listing.price,
    subcategory: listing.subcategory,
    paymentMethods: listing.paymentMethods,
    serviceModes: listing.serviceModes,
    hours: listing.hours,
  };
}

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();
  const featuredCategories = useMemo(() => getFeaturedCategories(), []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [language, setLanguage] = useState('EN');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [listings, setListings] = useState<ListingItem[]>([]);

  useEffect(() => {
    const loadUnread = () => {
      setUnreadMessages(getUnreadMessagesCount());
    };

    loadUnread();
    const unsubscribe = subscribeToChatStore(loadUnread);
    return unsubscribe;
  }, []);

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
      const categoryMatch = !activeCategory || master.category === activeCategory;

      const searchMatch =
        !q ||
        String(master.name || '')
          .toLowerCase()
          .includes(q) ||
        String(master.title || '')
          .toLowerCase()
          .includes(q) ||
        String(master.city || '')
          .toLowerCase()
          .includes(q) ||
        String(master.subcategory || '')
          .toLowerCase()
          .includes(q);

      return categoryMatch && searchMatch;
    });
  }, [allMasters, activeCategory, search]);

  const mapMasters = filteredMasters.length > 0 ? filteredMasters : allMasters;

  useEffect(() => {
    if (!selectedMaster) return;

    const exists = mapMasters.some(
      (item: any) => String(item.id) === String(selectedMaster.id)
    );

    if (!exists) {
      setSelectedMaster(null);
    }
  }, [mapMasters, selectedMaster]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 126,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: '#f5f3ef',
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
              borderRadius: 20,
              padding: '12px 12px 12px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              border: '1px solid #ece7df',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, color: '#9aa0a8' }}>🔎</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 17,
                  color: '#2b2f36',
                }}
              />
            </div>

            <button
              onClick={() =>
                setLanguage((prev) =>
                  prev === 'EN' ? 'RU' : prev === 'RU' ? 'UA' : 'EN'
                )
              }
              style={{
                border: 'none',
                background: '#f4efe7',
                color: '#3f3a33',
                borderRadius: 999,
                width: 52,
                height: 52,
                fontSize: 16,
                fontWeight: 800,
              }}
              title="Change language"
            >
              {language}
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

        <section style={{ padding: '14px 12px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 6,
              alignItems: 'start',
            }}
          >
            {featuredCategories.map((category: any) => {
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSelectedMaster(null);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '0 2px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: active ? '#f6efe1' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                    }}
                  >
                    <span>{category.icon}</span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 800 : 700,
                      color: '#253140',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      minHeight: 28,
                    }}
                  >
                    {category.shortLabel || category.label}
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      width: 42,
                      height: 4,
                      borderRadius: 999,
                      background: active ? '#eb7d96' : 'transparent',
                    }}
                  />
                </button>
              );
            })}

            <button
              onClick={() => router.push('/categories')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '0 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  color: '#30343b',
                  fontWeight: 900,
                }}
              >
                ⋮
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#253140',
                  textAlign: 'center',
                  minHeight: 28,
                }}
              >
                More
              </div>
              <div style={{ width: 42, height: 4 }} />
            </button>
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
                height: 430,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <RealMap
                masters={mapMasters}
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
                  }}
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: '14px 16px 0',
          }}
        >
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
                fontWeight: 800,
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
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '0.9 / 1',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#ddd',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
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
                    fontWeight: 700,
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

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(245,243,239,0.98)',
          borderTop: '1px solid #e3ddd5',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 92px 1fr 1fr',
            alignItems: 'end',
            padding: '10px 8px 12px',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#1f5d99',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>⌂</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>Home</span>
          </button>

          <button
            onClick={() => router.push('/messages')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>✉</span>

              {unreadMessages > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#e53935',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(229,57,53,0.35)',
                    border: '2px solid #f5f3ef',
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>

            <span style={{ fontSize: 12, fontWeight: 700 }}>Messages</span>
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              transform: 'translateY(-18px)',
            }}
          >
            <button
              onClick={() => router.push('/add')}
              style={{
                width: 78,
                height: 78,
                borderRadius: 999,
                border: '4px solid #4cab5d',
                background: '#ffffff',
                color: '#3f9a4f',
                boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
              title="Add service"
            >
              <span style={{ fontSize: 36, lineHeight: 1, fontWeight: 400 }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 800 }}>Add</span>
            </button>
          </div>

          <button
            onClick={() => router.push('/bookings')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>▤</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Bookings</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>◉</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Profile</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
