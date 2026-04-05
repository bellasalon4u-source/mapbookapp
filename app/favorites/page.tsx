'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { getAllMasters } from '../../services/masters';
import { getListings, type ListingItem } from '../../services/listingsStore';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
  toggleLikedMaster,
} from '../../services/likedMastersStore';
import { categories } from '../../services/categories';

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
    paymentMethods: listing.paymentMethods,
  };
}

function getCategoryAccent(category?: string) {
  const normalized = String(category || '').toLowerCase();

  if (normalized === 'beauty') return '#ff6d9f';
  if (normalized === 'barber') return '#53aef7';
  if (normalized === 'wellness') return '#49c968';
  if (normalized === 'home') return '#ffc938';
  if (normalized === 'repairs') return '#3db0f7';
  if (normalized === 'tech') return '#9b67ff';
  if (normalized === 'pets') return '#ffa726';
  if (normalized === 'transport') return '#2f7df6';
  if (normalized === 'education') return '#7d52ff';

  return '#ff6d9f';
}

function getCategoryLabel(category?: string) {
  const normalized = String(category || '').toLowerCase();
  if (!normalized) return 'Service';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function FavoritesPage() {
  const router = useRouter();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);

  useEffect(() => {
    const loadLiked = () => {
      setLikedIds(getLikedMasterIds());
    };

    loadLiked();
    const unsubscribe = subscribeToLikedMasters(loadLiked);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setListings(getListings());
  }, []);

  const baseMasters = getAllMasters();

  const listingMasters = useMemo(() => {
    return listings.map((item, index) => listingToMaster(item, index));
  }, [listings]);

  const allMasters = useMemo(() => {
    return [...listingMasters, ...baseMasters];
  }, [listingMasters, baseMasters]);

  const likedMasters = useMemo(() => {
    return allMasters.filter((master: any) => likedIds.includes(String(master.id)));
  }, [allMasters, likedIds]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '20px 16px 110px',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              Liked pins
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                color: '#7a7065',
                fontSize: 15,
              }}
            >
              Your saved masters and services
            </p>
          </div>

          <Link
            href="/profile"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              background: '#fff',
              border: '1px solid #efe4d7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#241c16',
              fontSize: 24,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            ←
          </Link>
        </div>

        {likedMasters.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #efe4d7',
              borderRadius: 30,
              padding: 26,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 46, color: '#ff2020' }}>♥</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              No liked pins yet
            </div>
            <div
              style={{
                marginTop: 8,
                color: '#7a7065',
                fontSize: 15,
                lineHeight: 1.5,
              }}
            >
              Tap hearts on the map to save masters here.
            </div>

            <button
              onClick={() => router.push('/')}
              style={{
                marginTop: 18,
                border: 'none',
                background: '#2e9746',
                color: '#fff',
                borderRadius: 20,
                padding: '16px 22px',
                fontWeight: 800,
                fontSize: 16,
                boxShadow: '0 10px 22px rgba(46,151,70,0.18)',
                cursor: 'pointer',
              }}
            >
              Go to map
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {likedMasters.map((master: any) => (
              <div
                key={String(master.id)}
                style={{
                  background: '#fff',
                  border: '1px solid #efe4d7',
                  borderRadius: 28,
                  padding: 14,
                  boxShadow: '0 8px 22px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    gap: 14,
                    alignItems: 'start',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={master.avatar}
                      alt={master.name || master.title || 'Master'}
                      style={{
                        width: 110,
                        height: 110,
                        objectFit: 'cover',
                        borderRadius: 22,
                        display: 'block',
                      }}
                    />

                    <button
                      onClick={() => toggleLikedMaster(master.id)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        border: 'none',
                        background: '#fff',
                        color: '#ff2020',
                        fontSize: 16,
                        fontWeight: 900,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
                        cursor: 'pointer',
                      }}
                    >
                      ♥
                    </button>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        lineHeight: 1.1,
                      }}
                    >
                      {master.name || master.title || 'Service Pro'}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: '#ffe8f1',
                          color: getCategoryAccent(master.category),
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        {getCategoryLabel(master.category)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        color: master.availableNow ? '#31b14c' : '#de6a74',
                        fontSize: 15,
                        fontWeight: 900,
                      }}
                    >
                      {master.availableNow ? 'Available now' : 'Unavailable today'}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        fontWeight: 900,
                        color: '#212836',
                      }}
                    >
                      <div style={{ fontSize: 16 }}>
                        ★ {Number(master.rating || 4.7).toFixed(1)}
                      </div>
                      <div style={{ fontSize: 16 }}>
                        From £{String(master.price).replace(/[^\d.]/g, '') || '45'}
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
                    onClick={() => router.push(`/master/${master.id}`)}
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
                      const lat = master?.lat;
                      const lng = master?.lng;

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
                    onClick={() => router.push(`/booking/${master.id}`)}
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
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
