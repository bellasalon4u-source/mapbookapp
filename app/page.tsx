'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

export default function HomePage() {
  const router = useRouter();
  const masters = useMemo(() => getAllMasters(), []);
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const selectedMaster = masters.find((master) => master.id === selectedMasterId);

  function toggleLike(id: string) {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '24px 16px 100px',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ fontSize: 52, margin: 0, fontWeight: 800 }}>MapBook</h1>

        <p style={{ fontSize: 20, color: '#6f655b', marginTop: 14 }}>
          Find beauty and wellness services near you
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search services, masters, area..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 46px',
                borderRadius: 16,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 18,
                color: '#786d61',
              }}
            >
              🔍
            </span>
          </div>

          <a
            href="/favorites"
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid #d8cfc3',
              background: '#fff',
              textDecoration: 'none',
              color: '#1d1712',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 56,
            }}
          >
            ♥
          </a>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {[
            'Wellness',
            'Beauty',
            'Sport',
            'Food',
            'Education',
            'Transport',
            'Repair',
            'Cleaning',
            'Pets',
            'Other',
          ].map((item) => (
            <span
              key={item}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: '#fff',
                border: '1px solid #e6ddd1',
                fontWeight: 700,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Map view</h2>

          <div style={{ marginTop: 12, position: 'relative' }}>
            <RealMap
              masters={masters}
              selectedMasterId={selectedMasterId}
              onSelectMaster={setSelectedMasterId}
            />

            {selectedMaster && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 12,
                  background: '#ffffff',
                  borderRadius: 24,
                  border: '1px solid #eadfd2',
                  padding: 14,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.14)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <img
                    src={selectedMaster.avatar}
                    alt={selectedMaster.name}
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 18,
                      objectFit: 'cover',
                      flexShrink: 0,
                      display: 'block',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        lineHeight: 1.2,
                      }}
                    >
                      {selectedMaster.name}
                    </div>

                    <div
                      style={{
                        color: '#786d61',
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    >
                      {selectedMaster.title}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginTop: 8,
                      }}
                    >
                      <span
                        style={{
                          background: '#2f241c',
                          color: '#fff',
                          padding: '7px 10px',
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        from £{selectedMaster.priceFrom}
                      </span>

                      <span
                        style={{
                          background: '#f2e9dc',
                          color: '#463b31',
                          padding: '7px 10px',
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {selectedMaster.rating} ★
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleLike(selectedMaster.id)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: '1px solid #eadfd2',
                      background: '#fff',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {likedIds.includes(selectedMaster.id) ? '♥' : '♡'}
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <div
                    style={{
                      background: selectedMaster.availableNow ? '#edf7ee' : '#fdecec',
                      color: selectedMaster.availableNow ? '#1f8f45' : '#c53434',
                      padding: '10px 12px',
                      borderRadius: 14,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {selectedMaster.availableNow ? '● Available now' : '● Not available now'}
                  </div>

                  <button
                    onClick={() => router.push(`/master/${selectedMaster.id}`)}
                    style={{
                      border: 'none',
                      background: '#e52323',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Recommended</h2>

          <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
            {masters.map((master) => (
              <div
                key={master.id}
                onClick={() => router.push(`/master/${master.id}`)}
                style={{
                  overflow: 'hidden',
                  borderRadius: 26,
                  background: '#fff',
                  border: '1px solid #eadfd2',
                  color: '#1d1712',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    height: 180,
                    background:
                      'linear-gradient(135deg, #b77288 0%, #d8aab7 50%, #e8cbd2 100%)',
                  }}
                />

                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{master.name}</div>
                      <div style={{ color: '#786d61', marginTop: 4 }}>
                        {master.title} • {master.city}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f2e9dc',
                        color: '#463b31',
                        padding: '8px 10px',
                        borderRadius: 12,
                        fontWeight: 800,
                        height: 'fit-content',
                      }}
                    >
                      {master.rating} ★
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        background: '#2f241c',
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: 999,
                        fontWeight: 800,
                      }}
                    >
                      from £{master.priceFrom}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(master.id);
                      }}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        border: '1px solid #eadfd2',
                        background: '#fff',
                        fontSize: 22,
                      }}
                    >
                      {likedIds.includes(master.id) ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
