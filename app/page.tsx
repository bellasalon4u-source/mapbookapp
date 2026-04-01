'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';

const RealMap = dynamic(() => import('../components/RealMap'), {
  ssr: false,
});

const categories = [
  { id: 'beauty', label: 'Beauty', icon: '✦' },
  { id: 'wellness', label: 'Wellness', icon: '✦' },
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
];

function getCategoryLabel(master: any, activeCategory: string) {
  if (master?.category && typeof master.category === 'string') {
    return master.category.charAt(0).toUpperCase() + master.category.slice(1);
  }

  if (master?.title) {
    const title = String(master.title).toLowerCase();
    if (
      title.includes('hair') ||
      title.includes('beauty') ||
      title.includes('brow') ||
      title.includes('lashes') ||
      title.includes('nails')
    ) {
      return 'Beauty';
    }
    if (
      title.includes('massage') ||
      title.includes('spa') ||
      title.includes('wellness')
    ) {
      return 'Wellness';
    }
    if (title.includes('pet') || title.includes('dog') || title.includes('cat')) {
      return 'Pets';
    }
    if (title.includes('clean') || title.includes('repair') || title.includes('home')) {
      return 'Home';
    }
  }

  const match = categories.find((item) => item.id === activeCategory);
  return match?.label ?? 'Beauty';
}

function getAvailability(master: any) {
  const isAvailable =
    master?.availableNow === true ||
    master?.availableToday === true ||
    master?.isAvailableToday === true;

  return {
    isAvailable,
    text: isAvailable ? 'Available today' : 'Unavailable today',
    color: isAvailable ? '#2f9c47' : '#d65a5a',
  };
}

export default function HomePage() {
  const router = useRouter();
  const masters = getAllMasters();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [routeMode, setRouteMode] = useState<'drive' | 'transit' | 'walk'>('drive');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);

  const profileMaster = masters[0];

  useEffect(() => {
    const shouldReset =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('mapbook_reset_home')
        : null;

    if (shouldReset === '1') {
      setSelectedMaster(null);
      setRouteSheetOpen(false);
      sessionStorage.removeItem('mapbook_reset_home');
    }
  }, []);

  const nearbyCount = useMemo(() => masters.length || 82, [masters.length]);

  const etaText =
    routeMode === 'drive' ? '12 min' : routeMode === 'transit' ? '24 min' : '38 min';

  if (!profileMaster) {
    return <main style={{ padding: 24 }}>No providers found</main>;
  }

  const selectedCategory = selectedMaster
    ? getCategoryLabel(selectedMaster, activeCategory)
    : null;

  const selectedAvailability = selectedMaster
    ? getAvailability(selectedMaster)
    : null;

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
        <RealMap
          masters={masters}
          fullScreen
          mapMode={mapMode}
          selectedMasterId={selectedMaster?.id ?? null}
          onMasterSelect={(master: any) => {
            setSelectedMaster(master);
            setRouteSheetOpen(false);
          }}
          onMapBackgroundClick={() => {
            setSelectedMaster(null);
            setRouteSheetOpen(false);
            setMenuOpen(false);
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
          background:
            mapMode === 'satellite'
              ? 'linear-gradient(180deg, rgba(16,15,13,0.10) 0%, rgba(16,15,13,0.00) 26%, rgba(16,15,13,0.05) 100%)'
              : 'linear-gradient(180deg, rgba(252,248,242,0.04) 0%, rgba(252,248,242,0.00) 30%, rgba(252,248,242,0.04) 100%)',
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
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(231,221,208,0.95)',
              borderRadius: 30,
              padding: '10px 10px 10px 14px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.10)',
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
                width: 48,
                height: 48,
                borderRadius: 999,
                border: 'none',
                background: verifiedOnly ? '#ece4d7' : '#f4ede3',
                color: verifiedOnly ? '#5a524a' : '#7d7368',
                fontSize: 21,
                fontWeight: 800,
              }}
            >
              ✓
            </button>

            <button
              onClick={() => router.push('/profile')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.95)',
                background: '#f4ede3',
                overflow: 'hidden',
                padding: 0,
                boxShadow: '0 8px 18px rgba(0,0,0,0.10)',
              }}
            >
              <img
                src={profileMaster.avatar}
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
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                minWidth: 54,
                height: 54,
                borderRadius: 999,
                border: '1px solid rgba(223,212,199,0.95)',
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
                fontSize: 24,
                color: '#2a231d',
                flexShrink: 0,
              }}
            >
              ⋮
            </button>

            {categories.slice(0, 3).map((category) => {
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 20px',
                    borderRadius: 999,
                    border: active
                      ? '1px solid rgba(224,212,196,0.98)'
                      : '1px solid rgba(255,255,255,0.70)',
                    background: active
                      ? 'rgba(255,248,239,0.98)'
                      : 'rgba(255,255,255,0.94)',
                    color: '#2a231d',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
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

          {menuOpen && (
            <div
              style={{
                marginTop: 10,
                width: 235,
                background: 'rgba(255,248,239,0.97)',
                backdropFilter: 'blur(12px)',
                border: '1px solid #e4d9cc',
                borderRadius: 26,
                boxShadow: '0 18px 38px rgba(0,0,0,0.14)',
                padding: 14,
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#8b7f73',
                  marginBottom: 6,
                  paddingLeft: 6,
                }}
              >
                All categories
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((category) => (
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
                      border: 'none',
                      background: activeCategory === category.id ? '#fff' : 'transparent',
                      borderRadius: 18,
                      padding: '13px 12px',
                      textAlign: 'left',
                      fontWeight: 800,
                      fontSize: 16,
                      color: '#231c16',
                    }}
                  >
                    <span style={{ width: 22, textAlign: 'center' }}>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 24,
                padding: '14px 18px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.09)',
                color: '#1d1712',
                border: '1px solid rgba(231,221,208,0.92)',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 900 }}>
                ✓ {nearbyCount} verified providers nearby
              </span>
              <span style={{ fontSize: 15, color: '#2f9c47', fontWeight: 800 }}>
                Available now
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 14,
            top: 220,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setMapMode((prev) => (prev === 'map' ? 'satellite' : 'map'))}
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              border: '1px solid rgba(230,218,203,0.98)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 24,
              color: '#4b443c',
              boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
              backdropFilter: 'blur(10px)',
            }}
            title="Map style"
          >
            {mapMode === 'satellite' ? '🛰' : '◩'}
          </button>

          <button
            onClick={() => {
              if (selectedMaster) {
                setRouteSheetOpen((prev) => !prev);
              }
            }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              border: '1px solid rgba(230,218,203,0.98)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 24,
              color: '#4b443c',
              boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
              backdropFilter: 'blur(10px)',
            }}
            title="Route"
          >
            ➤
          </button>

          <button
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              border: '1px solid rgba(230,218,203,0.98)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 24,
              color: '#4b443c',
              boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
              backdropFilter: 'blur(10px)',
            }}
            title="My location"
          >
            ◎
          </button>
        </div>

        {selectedMaster && (
          <>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '36%',
                transform: 'translate(-10%, -50%)',
                pointerEvents: 'none',
                zIndex: 26,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 92,
                  height: 52,
                  padding: '0 18px',
                  background: '#f7f0e4',
                  border: '1px solid #b9a993',
                  borderRadius: 14,
                  boxShadow: '0 8px 18px rgba(0,0,0,0.10)',
                  color: '#2b241d',
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                {selectedCategory}
                <span
                  style={{
                    position: 'absolute',
                    left: 24,
                    bottom: -7,
                    width: 14,
                    height: 14,
                    background: '#f7f0e4',
                    borderRight: '1px solid #b9a993',
                    borderBottom: '1px solid #b9a993',
                    transform: 'rotate(45deg)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '43%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 25,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  background: 'rgba(255,248,239,0.97)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229,218,204,0.96)',
                  borderRadius: 28,
                  padding: '16px 16px 12px',
                  display: 'grid',
                  gridTemplateColumns: '82px 1fr auto',
                  gap: 14,
                  alignItems: 'start',
                  minWidth: 320,
                  boxShadow: '0 18px 38px rgba(0,0,0,0.16)',
                }}
              >
                <div style={{ position: 'relative', paddingTop: 8 }}>
                  <img
                    src={selectedMaster.avatar}
                    alt={selectedMaster.name}
                    style={{
                      width: 78,
                      height: 78,
                      objectFit: 'cover',
                      borderRadius: 999,
                      border: '4px solid #fff',
                      display: 'block',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 2,
                      bottom: 2,
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: selectedAvailability?.isAvailable ? '#2fbb52' : '#e84d4d',
                      border: '3px solid #fff',
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: '#1d1712',
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedMaster.name}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        color: selectedAvailability?.color,
                        fontSize: 15,
                        fontWeight: 800,
                      }}
                    >
                      {selectedAvailability?.text}
                    </span>

                    <span
                      style={{
                        color: '#2b241d',
                        fontSize: 15,
                        fontWeight: 900,
                      }}
                    >
                      ★ {(selectedMaster.rating ?? 4.9).toFixed(1)}
                    </span>

                    <span
                      style={{
                        color: '#2f9c47',
                        fontSize: 17,
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      gap: 10,
                    }}
                  >
                    <button
                      onClick={() => {
                        sessionStorage.setItem('mapbook_reset_home', '1');
                        router.push(`/master/${selectedMaster.id}`);
                      }}
                      style={{
                        border: '1px solid #ddd2c4',
                        background: '#fff',
                        color: '#2a231d',
                        borderRadius: 16,
                        padding: '12px 20px',
                        fontWeight: 900,
                        fontSize: 15,
                        boxShadow: '0 3px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      View
                    </button>

                    <button
                      onClick={() => setRouteSheetOpen(true)}
                      style={{
                        border: 'none',
                        background: '#2ea6c7',
                        color: '#fff',
                        borderRadius: 16,
                        padding: '12px 22px',
                        fontWeight: 900,
                        fontSize: 15,
                        boxShadow: '0 10px 20px rgba(46,166,199,0.18)',
                      }}
                    >
                      Route
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: '1px solid #ece2d7',
                      fontSize: 13,
                      color: '#81766c',
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>Green = available today</span>
                    <span>•</span>
                    <span style={{ color: '#b95a5a' }}>Red = unavailable today</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedMaster(null);
                    setRouteSheetOpen(false);
                  }}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: '1px solid #e3d9cc',
                    background: '#fff',
                    fontSize: 22,
                    color: '#6a5f56',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </>
        )}

        {routeSheetOpen && selectedMaster && (
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
                position: 'relative',
                background: 'rgba(255,248,239,0.98)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(231,221,208,0.98)',
                borderRadius: 30,
                padding: 14,
                boxShadow: '0 18px 38px rgba(0,0,0,0.16)',
              }}
            >
              <button
                onClick={() => setRouteSheetOpen(false)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: '1px solid #e3d9cc',
                  background: '#fff',
                  fontSize: 20,
                  color: '#5f564d',
                }}
              >
                ✕
              </button>

              <div
                style={{
                  width: 54,
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
                  paddingRight: 50,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    gap: 12,
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <img
                    src={selectedMaster.avatar}
                    alt={selectedMaster.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      objectFit: 'cover',
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#1d1712',
                        lineHeight: 1.2,
                      }}
                    >
                      {selectedMaster.name}
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
                    fontWeight: 900,
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
                    fontWeight: 900,
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
                  borderRadius: 24,
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
                          fontWeight: 900,
                          color: '#1d1712',
                        }}
                      >
                        {mode.label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: active ? '#0f8cab' : '#7b7168',
                          fontWeight: 800,
                        }}
                      >
                        {mode.eta}
                      </span>
                    </button>
                  );
                })}
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
              background: 'rgba(255,248,239,0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(228,217,204,0.98)',
              borderRadius: 32,
              padding: '14px 16px',
              boxShadow: '0 16px 34px rgba(0,0,0,0.14)',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'end',
              gap: 10,
              minHeight: 98,
            }}
          >
            <button
              onClick={() => router.push('/bookings')}
              style={{
                border: 'none',
                background: '#fff',
                borderRadius: 24,
                minHeight: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#221b15',
                boxShadow: '0 6px 14px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>📅</span>
              <span style={{ fontSize: 16, fontWeight: 900 }}>Bookings</span>
            </button>

            <button
              onClick={() => router.push('/add')}
              style={{
                width: 96,
                height: 96,
                marginTop: -36,
                borderRadius: 999,
                border: '4px solid #efe6d9',
                background: 'linear-gradient(180deg, #78c9dc 0%, #4aa9be 100%)',
                color: '#fff',
                boxShadow: '0 16px 30px rgba(65,145,163,0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 42, lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 14, fontWeight: 900, marginTop: -2 }}>Add</span>
            </button>

            <button
              onClick={() => router.push('/favorites')}
              style={{
                border: 'none',
                background: '#fff',
                borderRadius: 24,
                minHeight: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#221b15',
                boxShadow: '0 6px 14px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 22 }}>♥</span>
              <span style={{ fontSize: 16, fontWeight: 900 }}>Saved</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-top.leaflet-left {
          top: 220px !important;
          left: 10px !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.10) !important;
          overflow: hidden;
          border-radius: 18px !important;
        }

        .leaflet-control-zoom a {
          width: 48px !important;
          height: 48px !important;
          line-height: 48px !important;
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
