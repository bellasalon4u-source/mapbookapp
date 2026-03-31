'use client';

import { useState } from 'react';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

const categories = [
  { id: 'wellness', label: 'Wellness', icon: '✦' },
  { id: 'beauty', label: 'Beauty', icon: '◉' },
  { id: 'sport', label: 'Sport', icon: '●' },
  { id: 'food', label: 'Food', icon: '◆' },
  { id: 'education', label: 'Education', icon: '■' },
  { id: 'transport', label: 'Transport', icon: '▲' },
  { id: 'repair', label: 'Repair', icon: '⬢' },
  { id: 'cleaning', label: 'Cleaning', icon: '⬣' },
  { id: 'pets', label: 'Pets', icon: '✿' },
  { id: 'other', label: 'Other', icon: '…' },
];

export default function HomePage() {
  const masters = getAllMasters();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('wellness');

  return (
    <main
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#f7f3ec',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <RealMap masters={masters} fullScreen />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '18px 14px 0',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.96)',
              border: '1px solid #e5dbcf',
              borderRadius: 24,
              minHeight: 60,
              padding: '0 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: 24, color: '#5f564d' }}>🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 18,
                color: '#2b241d',
                minWidth: 0,
              }}
            />

            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 'none',
                background: '#f4ede3',
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              🎤
            </button>

            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 'none',
                background: '#f4ede3',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🖼️
            </button>

            <button
              style={{
                minWidth: 46,
                height: 36,
                borderRadius: 999,
                border: 'none',
                background: '#f4ede3',
                fontSize: 14,
                fontWeight: 800,
                color: '#2b241d',
                padding: '0 10px',
                flexShrink: 0,
              }}
            >
              EN
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
              pointerEvents: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                minWidth: 52,
                height: 52,
                borderRadius: 999,
                border: '1px solid #ded4c8',
                background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                fontSize: 24,
                color: '#2a231d',
                flexShrink: 0,
              }}
            >
              ⋮
            </button>

            {categories.slice(0, 4).map((category) => {
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: active ? '1px solid #d7cfbf' : '1px solid #e5dbcf',
                    background: active ? '#fff7eb' : 'rgba(255,255,255,0.98)',
                    color: '#2a231d',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f3ede4',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {category.icon}
                  </span>

                  <span style={{ fontSize: 16, fontWeight: 800 }}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 92,
              bottom: 112,
              width: 220,
              background: 'rgba(255,248,239,0.98)',
              border: '1px solid #e4d9cc',
              borderRadius: 28,
              boxShadow: '0 16px 38px rgba(0,0,0,0.12)',
              padding: 14,
              pointerEvents: 'auto',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                border: '1px solid #e7ddd0',
                borderRadius: 18,
                padding: '12px 14px',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 20, color: '#6c645c' }}>🔍</span>
              <span style={{ color: '#746b62', fontSize: 16 }}>Search here</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categories.map((category) => {
                const active = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: active ? '1px solid #d7cfbf' : '1px solid transparent',
                      background: active ? '#fff' : 'transparent',
                      borderRadius: 18,
                      padding: '10px 10px',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3ede4',
                        color: '#2a231d',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {category.icon}
                    </span>

                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: '#231c16',
                      }}
                    >
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 14,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 430,
              background: 'rgba(255,248,239,0.98)',
              border: '1px solid #e4d9cc',
              borderRadius: 30,
              padding: '14px 16px',
              boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'end',
              gap: 10,
            }}
          >
            <button
              style={{
                border: 'none',
                background: '#fff',
                borderRadius: 22,
                minHeight: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#221b15',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>📅</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Bookings</span>
            </button>

            <button
              style={{
                width: 94,
                height: 94,
                marginTop: -34,
                borderRadius: 999,
                border: '4px solid #efe6d9',
                background: 'linear-gradient(180deg, #6bbfd0 0%, #4aa9be 100%)',
                color: '#fff',
                boxShadow: '0 14px 28px rgba(65,145,163,0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 42, lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 14, fontWeight: 800, marginTop: -2 }}>Add</span>
            </button>

            <button
              style={{
                border: 'none',
                background: '#fff',
                borderRadius: 22,
                minHeight: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#221b15',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>♥</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Saved</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-top.leaflet-left {
          top: 150px !important;
          left: 10px !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08) !important;
          overflow: hidden;
          border-radius: 16px !important;
        }

        .leaflet-control-zoom a {
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-size: 24px !important;
        }

        .leaflet-bottom.leaflet-right,
        .leaflet-bottom.leaflet-left {
          bottom: 112px !important;
        }
      `}</style>
    </main>
  );
}
