'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TabType = 'upcoming' | 'completed' | 'cancelled';

const bookings = [
  {
    id: 1,
    service: 'Keratin Bonds',
    master: 'Bella Keratin Studio',
    date: '24 Apr 2026',
    time: '12:00',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'pending',
    reviewStatus: 'locked',
  },
  {
    id: 2,
    service: 'Brow Lamination',
    master: 'Camden Brows Bar',
    date: '27 Apr 2026',
    time: '15:30',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'confirmed',
    reviewStatus: 'locked',
  },
  {
    id: 3,
    service: 'Hair Coloring',
    master: 'Olga Beauty Studio',
    date: '20 Apr 2026',
    time: '16:00',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'completed',
    reviewStatus: 'available',
  },
  {
    id: 4,
    service: 'Tape-In Extensions',
    master: 'Bella Keratin Studio',
    date: '18 Apr 2026',
    time: '11:00',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'completed',
    reviewStatus: 'submitted',
  },
  {
    id: 5,
    service: 'Nano Ring Extensions',
    master: 'Luxury Hair London',
    date: '15 Apr 2026',
    time: '13:00',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'cancelled_by_client',
    reviewStatus: 'locked',
  },
  {
    id: 6,
    service: 'Hair Botox',
    master: 'Silk Hair Salon',
    date: '12 Apr 2026',
    time: '10:00',
    image: 'https://images.unsplash.com/photo-1522336284037-91f7da073525?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'cancelled_by_seller',
    reviewStatus: 'locked',
  },
  {
    id: 7,
    service: 'Facial Massage',
    master: 'Glow Studio',
    date: '10 Apr 2026',
    time: '15:00',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
    bookingStatus: 'no_show',
    reviewStatus: 'locked',
  },
];

export default function BookingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('upcoming');

  const upcomingItems = bookings.filter(
    (item) => item.bookingStatus === 'pending' || item.bookingStatus === 'confirmed'
  );

  const completedItems = bookings.filter(
    (item) => item.bookingStatus === 'completed'
  );

  const cancelledItems = bookings.filter(
    (item) =>
      item.bookingStatus === 'cancelled_by_client' ||
      item.bookingStatus === 'cancelled_by_seller' ||
      item.bookingStatus === 'no_show'
  );

  const currentItems =
    tab === 'upcoming'
      ? upcomingItems
      : tab === 'completed'
      ? completedItems
      : cancelledItems;

  const getStatusBadge = (bookingStatus: string, reviewStatus: string) => {
    if (bookingStatus === 'pending') {
      return {
        text: 'Pending',
        bg: '#f4e3bf',
        color: '#9a6a15',
      };
    }

    if (bookingStatus === 'confirmed') {
      return {
        text: 'Confirmed',
        bg: '#dceedd',
        color: '#1f7d39',
      };
    }

    if (bookingStatus === 'completed' && reviewStatus === 'submitted') {
      return {
        text: 'Reviewed',
        bg: '#dceedd',
        color: '#1f7d39',
      };
    }

    if (bookingStatus === 'completed') {
      return {
        text: 'Completed',
        bg: '#dceedd',
        color: '#1f7d39',
      };
    }

    if (bookingStatus === 'cancelled_by_client') {
      return {
        text: 'Cancelled by you',
        bg: '#f3dfdf',
        color: '#b14545',
      };
    }

    if (bookingStatus === 'cancelled_by_seller') {
      return {
        text: 'Cancelled by seller',
        bg: '#f3dfdf',
        color: '#b14545',
      };
    }

    return {
      text: 'No-show',
      bg: '#f3dfdf',
      color: '#b14545',
    };
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8f8f8',
        fontFamily: 'Arial, sans-serif',
        color: '#151515',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: 'none',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 30, fontWeight: 800 }}>My bookings</div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: 'none',
              background: '#fff',
              fontSize: 22,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: '#eeeeee',
            borderRadius: 999,
            padding: 6,
            gap: 6,
            marginBottom: 20,
          }}
        >
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as TabType)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 8px',
                fontWeight: 800,
                fontSize: 16,
                background: tab === item.key ? '#fff' : 'transparent',
                color: '#1d1d1d',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {currentItems.map((item) => {
            const badge = getStatusBadge(item.bookingStatus, item.reviewStatus);

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 24,
                  padding: 16,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: 999,
                      padding: '8px 14px',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {badge.text}
                  </div>

                  <button
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 24,
                      color: '#666',
                    }}
                  >
                    ⋯
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '92px 1fr',
                    gap: 14,
                    marginTop: 14,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.service}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 18,
                      objectFit: 'cover',
                    }}
                  />

                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{item.service}</div>
                    <div style={{ marginTop: 6, color: '#6a6a6a', fontSize: 17 }}>
                      {item.master}
                    </div>
                    <div style={{ marginTop: 8, color: '#454545', fontSize: 16 }}>
                      {item.date} • {item.time}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <button
                    style={{
                      flex: '1 1 160px',
                      borderRadius: 16,
                      padding: '14px 16px',
                      background: '#fff',
                      color: '#16803a',
                      border: '2px solid #16803a',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    Open booking
                  </button>

                  {item.bookingStatus === 'pending' && (
                    <button
                      style={{
                        flex: '1 1 160px',
                        borderRadius: 16,
                        padding: '14px 16px',
                        background: '#fff3f3',
                        color: '#c33d3d',
                        border: '2px solid #efcaca',
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      Cancel booking
                    </button>
                  )}

                  {item.bookingStatus === 'confirmed' && (
                    <>
                      <button
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#eef8f0',
                          color: '#16803a',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        Write seller
                      </button>

                      <button
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#eef8f0',
                          color: '#16803a',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        Call seller
                      </button>

                      <button
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#fff3f3',
                          color: '#c33d3d',
                          border: '2px solid #efcaca',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        Cancel booking
                      </button>
                    </>
                  )}

                  {item.bookingStatus === 'completed' && item.reviewStatus === 'available' && (
                    <button
                      style={{
                        flex: '1 1 160px',
                        borderRadius: 16,
                        padding: '14px 16px',
                        background: '#0f8b3f',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      Leave review
                    </button>
                  )}

                  {item.bookingStatus === 'completed' && item.reviewStatus === 'submitted' && (
                    <button
                      style={{
                        flex: '1 1 160px',
                        borderRadius: 16,
                        padding: '14px 16px',
                        background: '#eef8f0',
                        color: '#16803a',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      View review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
