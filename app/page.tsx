'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

export default function HomePage() {
  const masters = useMemo(() => getAllMasters(), []);
  const [selectedMasterId, setSelectedMasterId] = useState(masters[0]?.id || '');

  const selectedMaster =
    masters.find((master) => master.id === selectedMasterId) || masters[0];

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
          <input
            type="text"
            placeholder="Search services, masters, area..."
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid #d8cfc3',
              fontSize: 16,
            }}
          />
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
            }}
          >
            ♥
          </a>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {['Hair', 'Beauty', 'Massage', 'Nails', 'Brows', 'Makeup', 'Wellness'].map(
            (item) => (
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
            )
          )}
        </div>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Map view</h2>

          <div style={{ marginTop: 12 }}>
            <RealMap masters={masters} onSelectMaster={setSelectedMasterId} />
          </div>

          {selectedMaster && (
            <div
              style={{
                marginTop: 16,
                background: '#fff',
                borderRadius: 22,
                padding: 16,
                border: '1px solid #eadfd2',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedMaster.name}</div>
                  <div style={{ color: '#786d61', marginTop: 4 }}>
                    {selectedMaster.title} • {selectedMaster.city}
                  </div>
                </div>

                <div
                  style={{
                    background: selectedMaster.availableNow ? '#edf7ee' : '#f3ece2',
                    color: selectedMaster.availableNow ? '#256b43' : '#6d6257',
                    padding: '8px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    height: 'fit-content',
                  }}
                >
                  {selectedMaster.availableNow ? '● Available now' : 'Offline'}
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
                <div style={{ fontWeight: 800 }}>from £{selectedMaster.priceFrom}</div>
                <a
                  href={`/master/${selectedMaster.id}`}
                  style={{
                    background: '#2f241c',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: 14,
                    fontWeight: 800,
                  }}
                >
                  Open
                </a>
              </div>
            </div>
          )}
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Recommended</h2>

          <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
            {masters.map((master) => (
              <Link
                key={master.id}
                href={`/master/${master.id}`}
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 26,
                  background: '#fff',
                  border: '1px solid #eadfd2',
                  textDecoration: 'none',
                  color: '#1d1712',
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

                    <div
                      style={{
                        background: master.availableNow ? '#edf7ee' : '#f3ece2',
                        color: master.availableNow ? '#256b43' : '#6d6257',
                        padding: '10px 14px',
                        borderRadius: 999,
                        fontWeight: 700,
                      }}
                    >
                      {master.availableNow ? '● Available now' : 'Offline'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
