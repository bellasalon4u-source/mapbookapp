'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

export default function HomePage() {
  const router = useRouter();
  const masters = useMemo(() => getAllMasters(), []);

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

          <div style={{ marginTop: 12 }}>
            <RealMap masters={masters} />
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
                      type="button"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        border: '1px solid #eadfd2',
                        background: '#fff',
                        fontSize: 22,
                      }}
                    >
                      ♡
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
