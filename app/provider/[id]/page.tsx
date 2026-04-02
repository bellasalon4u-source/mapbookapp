'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllMasters } from '../../../services/masters';
import { getListings } from '../../../services/listingsStore';
import BottomNav from '../../../components/BottomNav';

function mapCategoryLabel(category?: string) {
  const value = (category || '').toLowerCase();

  const map: Record<string, string> = {
    beauty: 'Beauty',
    wellness: 'Wellness',
    home: 'Home',
    repairs: 'Repairs',
    tech: 'Tech',
    pets: 'Pets',
    auto: 'Auto',
    moving: 'Moving',
    activities: 'Activities',
    events: 'Events',
    creative: 'Creative',
  };

  return map[value] || category || 'Service';
}

function listingToProvider(listing: any, index: number) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
  ];

  return {
    id: listing.id,
    name: listing.title || 'Provider',
    category: listing.category || 'beauty',
    subcategory: listing.subcategory || '',
    rating: 4.8,
    availableToday: !!listing.availableToday,
    city: listing.location || 'London',
    description: listing.description || '',
    price: listing.price || '',
    hours: listing.hours || '',
    avatar: listing.photos?.[0] || fallbackImages[index % fallbackImages.length],
    paymentMethods: listing.paymentMethods || [],
    serviceModes: listing.serviceModes || [],
    contact: listing.contact || {},
  };
}

export default function ProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = String(params?.id || '');

  const baseMasters = getAllMasters() as any[];
  const listings = getListings();

  const listingProviders = listings.map((item, index) => listingToProvider(item, index));
  const allProviders: any[] = [...listingProviders, ...baseMasters];

  const provider = useMemo<any | undefined>(() => {
    return allProviders.find((item: any) => String(item.id) === providerId);
  }, [allProviders, providerId]);

  if (!provider) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f5f3ef',
          fontFamily: 'Arial, sans-serif',
          paddingBottom: 120,
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: 24 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 30,
              marginBottom: 20,
            }}
          >
            ←
          </button>

          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 24,
              border: '1px solid #e8e1d8',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
              Provider not found
            </div>
            <div style={{ fontSize: 16, color: '#6c7480' }}>
              This provider page is not available.
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    );
  }

  const paymentBadges =
    provider.paymentMethods && provider.paymentMethods.length > 0
      ? provider.paymentMethods
      : ['cash', 'card'];

  const serviceModes =
    provider.serviceModes && provider.serviceModes.length > 0
      ? provider.serviceModes
      : ['at_client'];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <section style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push('/')}
              style={{
                border: 'none',
                background: '#fff',
                width: 44,
                height: 44,
                borderRadius: 999,
                fontSize: 24,
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              }}
            >
              ←
            </button>

            <div style={{ fontSize: 26, fontWeight: 800 }}>Provider</div>
          </div>
        </section>

        <section style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              overflow: 'hidden',
              border: '1px solid #e8e1d8',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                height: 240,
                background: '#ddd',
              }}
            >
              <img
                src={provider.avatar}
                alt={provider.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>
                {provider.name || 'Provider'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    background: '#fce8ef',
                    color: '#b84f73',
                    borderRadius: 999,
                    padding: '7px 12px',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {mapCategoryLabel(provider.category)}
                </span>

                {provider.subcategory ? (
                  <span
                    style={{
                      background: '#eef2f7',
                      color: '#425162',
                      borderRadius: 999,
                      padding: '7px 12px',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {provider.subcategory}
                  </span>
                ) : null}

                <span
                  style={{
                    color: provider.availableToday ? '#2f9c47' : '#d65a5a',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {provider.availableToday ? 'Available today' : 'Unavailable today'}
                </span>

                <span
                  style={{
                    color: '#1f2430',
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  ★ {(provider.rating ?? 4.8).toFixed(1)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 16,
                  color: '#5f6874',
                  lineHeight: 1.5,
                }}
              >
                {provider.description || 'Professional service provider.'}
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: '#faf8f4',
                    border: '1px solid #ebe4da',
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, color: '#7a8490', marginBottom: 6 }}>
                    Price
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {provider.price || 'On request'}
                  </div>
                </div>

                <div
                  style={{
                    background: '#faf8f4',
                    border: '1px solid #ebe4da',
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, color: '#7a8490', marginBottom: 6 }}>
                    Location
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {provider.city || 'London'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                  Payment methods
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {paymentBadges.map((method: string) => (
                    <div
                      key={method}
                      style={{
                        border: '1px solid #e6dfd5',
                        background: '#fff',
                        borderRadius: 999,
                        padding: '9px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {method === 'cash' ? '💵' : method === 'card' ? '💳' : '👛'}
                      </span>
                      <span>
                        {method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'E-money'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                  Service format
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {serviceModes.map((mode: string) => (
                    <div
                      key={mode}
                      style={{
                        background: '#eef6ee',
                        color: '#2f8f43',
                        borderRadius: 999,
                        padding: '9px 14px',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {mode === 'at_client'
                        ? 'At client'
                        : mode === 'at_my_place'
                        ? 'At my place'
                        : 'Online'}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                  Working hours
                </div>
                <div style={{ fontSize: 16, color: '#5f6874' }}>
                  {provider.hours || 'By appointment'}
                </div>
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <button
                  onClick={() => router.push('/messages')}
                  style={{
                    border: '2px solid #d7c8cf',
                    background: '#fff',
                    color: '#1f2430',
                    borderRadius: 18,
                    padding: '16px 18px',
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  Message
                </button>

                <button
                  onClick={() => router.push('/bookings')}
                  style={{
                    border: 'none',
                    background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
                    color: '#fff',
                    borderRadius: 18,
                    padding: '16px 18px',
                    fontSize: 17,
                    fontWeight: 800,
                    boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
                  }}
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
