'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

const categories = [
  { id: 'beauty', label: 'Beauty', icon: '✦' },
  { id: 'wellness', label: 'Wellness', icon: '✦' },
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
];

export default function HomePage() {
  const router = useRouter();
  const masters = getAllMasters();

  const featuredMaster = masters[0];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('satellite');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedMasterOpen, setSelectedMasterOpen] = useState(true);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [routeMode, setRouteMode] = useState<'drive' | 'transit' | 'walk'>('drive');

  const nearbyCount = useMemo(() => masters.length || 82, [masters.length]);

  const etaText =
    routeMode === 'drive' ? '12 min' : routeMode === 'transit' ? '24 min' : '38 min';

  if (!featuredMaster) {
    return <main style={{ padding: 24 }}>No providers found</main>;
  }

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
          filter:
            mapMode === 'satellite'
              ? 'contrast(1.02) saturate(0.82) brightness(0.94)'
              : 'none',
        }}
      >
        <RealMap masters={masters} fullScreen />
      </div>

      {mapMode === 'satellite' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background:
              'linear-gradient(180deg, rgba(252,248,242,0.10) 0%, rgba(252,248,242,0.00) 24%, rgba(252,248,242,0.10) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div style={{ padding: '16px 14px 0' }}>
          <div
            style={{
              pointerEvents: 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.96)',
              border: '1px solid #e7ddd0',
              borderRadius: 28,
              padding: '10px 10px 10px 14px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 22, color: '#6f655b' }}>🔎</span>
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
            </div>

            <button
              onClick={() => setVerifiedOnly((prev) => !prev)}
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                border: 'none',
                background: verifiedOnly ? '#2f9c47' : '#f4ede3',
                color: verifiedOnly ? '#fff' : '#5f564d',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              ✓
            </button>

            <button
              onClick={() => router.push('/profile')}
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                border: 'none',
                background: '#f4ede3',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <img
                src={
                  featuredMaster.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
                }
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
            {categories.map((category) => {
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    borderRadius: 999,
                    border: active ? '1px solid #e0d4c4' : '1px solid rgba(255,255,255,0.5)',
                    background: active ? 'rgba(255,248,239,0.98)' : 'rgba(255,255,255,0.94)',
                    color: '#2a231d',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 22px rgba(0,0,0,0.09)',
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 12,
              pointerEvents: 'auto',
            }}
          >
            <button
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                border: 'none',
                background: 'rgba(255,255,255,0.96)',
                borderRadius: 22,
                padding: '14px 18px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
                color: '#1d1712',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 800 }}>
                ✓ {nearbyCount} verified providers nearby
              </span>
              <span style={{ fontSize: 15, color: '#2f9c47', fontWeight: 700 }}>
                Available now
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 14,
            top: 190,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setMapMode((prev) => (prev === 'map' ? 'satellite' : 'map'))}
            style={floatingButtonStyle}
          >
            {mapMode === 'satellite' ? '◫' : '◩'}
          </button>

          <button
            onClick={() => setRouteSheetOpen((prev) => !prev)}
            style={floatingButtonStyle}
          >
            ➤
          </button>

          <button style={floatingButtonStyle}>◎</button>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '43%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 22,
          }}
        >
          <div
            style={{
              width: 150,
              height: 6,
              background: '#2f91d8',
              borderRadius: 999,
              transform: 'rotate(-25deg)',
              boxShadow: '0 0 0 3px rgba(47,145,216,0.12)',
            }}
          />
        </div>

        {selectedMasterOpen && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '38%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              zIndex: 25,
            }}
          >
            <div
              style={{
                background: 'rgba(255,248,239,0.98)',
                border: '1px solid #e5dacc',
                borderRadius: 24,
                padding: 12,
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 12,
                alignItems: 'center',
                minWidth: 280,
                boxShadow: '0 16px 34px rgba(0,0,0,0.14)',
              }}
            >
              <img
                src={featuredMaster.avatar}
                alt={featuredMaster.name}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  borderRadius: 999,
                  border: '4px solid #fff',
                  display: 'block',
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#1d1712',
                    lineHeight: 1.2,
                  }}
                >
                  {featuredMaster.name}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      background: '#f0e3ce',
                      color: '#7c5d26',
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Top rated
                  </span>

                  <span style={{ fontSize: 14, fontWeight: 800 }}>
                    ★ {featuredMaster.rating.toFixed(1)}
                  </span>

                  <span style={{ color: '#2f9c47', fontSize: 16, fontWeight: 900 }}>✓</span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() => router.push(`/master/${featuredMaster.id}`)}
                    style={miniCardSecondaryButton}
                  >
                    View
                  </button>
                  <button
                    onClick={() => setRouteSheetOpen(true)}
                    style={miniCardPrimaryButton}
                  >
                    Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {routeSheetOpen && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 104,
              pointerEvents: 'auto',
              zIndex: 30,
            }}
          >
            <div
              style={{
                background: 'rgba(255,248,239,0.98)',
                border: '1px solid #e7ddd0',
                borderRadius: 30,
                padding: 14,
                boxShadow: '0 18px 38px rgba(0,0,0,0.16)',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 6,
                  borderRadius: 999,
                  background: '#d8cec1',
                  margin: '0 auto 12px',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '54px 1fr',
                    gap: 12,
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <img
                    src={featuredMaster.avatar}
                    alt={featuredMaster.name}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 999,
                      objectFit: 'cover',
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#1d1712',
                        lineHeight: 1.2,
                      }}
                    >
                      {featuredMaster.name}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        color: '#6d645c',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      21 Soho Square, London
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f3eadf',
                    borderRadius: 999,
                    padding: '10px 14px',
                    fontWeight: 800,
                    fontSize: 17,
                    color: '#231b15',
                  }}
                >
                  {etaText}
                </div>

                <button
                  style={{
                    border: 'none',
                    background: '#0f8cab',
                    color: '#fff',
                    borderRadius: 20,
                    padding: '14px 22px',
                    fontWeight: 800,
                    fontSize: 18,
                    boxShadow: '0 12px 24px rgba(15,140,171,0.24)',
                  }}
                >
                  Start
                </button>
              </div>

              <div
                style={{
                  marginTop: 14,
                  background: '#fff',
                  borderRadius: 22,
                  border: '1px solid #ebe1d6',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  overflow: 'hidden',
                }}
              >
                {[
                  { key: 'drive', label: 'Drive', eta: '12 min', icon: '🚗' },
                  { key: 'transit', label: 'Transit', eta: '24 min', icon: '🚌' },
                  { key: 'walk', label: 'Walk', eta: '38 min', icon: '🚶' },
                ].map((mode, index) => {
                  const active = routeMode === mode.key;

                  return (
                    <button
                      key={mode.key}
                      onClick={() => setRouteMode(mode.key as 'drive' | 'transit' | 'walk')}
                      style={{
                        border: 'none',
                        background: active ? '#f6efe4' : '#fff',
                        padding: '14px 10px',
                        borderLeft: index === 0 ? 'none' : '1px solid #eee3d7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{mode.icon}</span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: '#1d1712',
                        }}
                      >
                        {mode.label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: active ? '#0f8cab' : '#7b7168',
                          fontWeight: 700,
                        }}
                      >
                        {mode.eta}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      color: '#7a7066',
                      fontWeight: 700,
                    }}
                  >
                    Route mode
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#1d1712',
                    }}
                  >
                    {routeMode === 'drive'
                      ? 'Drive'
                      : routeMode === 'transit'
                      ? 'Transit'
                      : 'Walk'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setRouteSheetOpen(false)}
                    style={{
                      border: 'none',
                      background: '#f5ede2',
                      color: '#5e554d',
                      borderRadius: 16,
                      padding: '12px 16px',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    Minimize
                  </button>

                  <button
                    onClick={() => {
                      setRouteSheetOpen(false);
                      setSelectedMasterOpen(false);
                    }}
                    style={{
                      border: 'none',
                      background: '#f5ede2',
                      color: '#5e554d',
                      borderRadius: 16,
                      padding: '12px 16px',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
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
            zIndex: 35,
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
              onClick={() => router.push('/bookings')}
              style={bottomTabStyle}
            >
              <span style={{ fontSize: 22 }}>📅</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Bookings</span>
            </button>

            <button
              onClick={() => router.push('/add')}
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
              onClick={() => router.push('/favorites')}
              style={bottomTabStyle}
            >
              <span style={{ fontSize: 22 }}>♥</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Saved</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-top.leaflet-left {
          top: 240px !important;
          left: 10px !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08) !important;
          overflow: hidden;
          border-radius: 18px !important;
        }

        .leaflet-control-zoom a {
          width: 46px !important;
          height: 46px !important;
          line-height: 46px !important;
          font-size: 24px !important;
        }

        .leaflet-bottom.leaflet-right,
        .leaflet-bottom.leaflet-left {
          bottom: 110px !important;
        }
      `}</style>
    </main>
  );
}

const floatingButtonStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 999,
  border: '1px solid #e6dacb',
  background: 'rgba(255,255,255,0.96)',
  fontSize: 24,
  color: '#4b443c',
  boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
};

const bottomTabStyle: React.CSSProperties = {
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
};

const miniCardPrimaryButton: React.CSSProperties = {
  border: 'none',
  background: '#0f8cab',
  color: '#fff',
  borderRadius: 14,
  padding: '10px 14px',
  fontWeight: 800,
  fontSize: 14,
};

const miniCardSecondaryButton: React.CSSProperties = {
  border: '1px solid #dfd4c7',
  background: '#fff',
  color: '#2a231d',
  borderRadius: 14,
  padding: '10px 14px',
  fontWeight: 800,
  fontSize: 14,
};
