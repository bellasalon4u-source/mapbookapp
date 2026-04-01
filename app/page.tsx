'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories as appCategories } from '../services/categories';

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

function getMasterAvailability(master: any) {
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

function getCategoryLabel(categoryId: string) {
  const found = appCategories.find((c) => c.id === categoryId);
  return found?.shortLabel || found?.label || 'Beauty';
}

export default function HomePage() {
  const router = useRouter();
  const masters = getAllMasters();
  const featuredCategories = useMemo(() => getFeaturedCategories(), []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [language, setLanguage] = useState('EN');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);

  const featuredMaster = selectedMaster || masters[0];
  const featuredAvailability = getMasterAvailability(featuredMaster);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 110,
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
                src={masters[0]?.avatar}
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
                  onClick={() => setActiveCategory(category.id)}
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
              margin: '0 0 0',
              background: '#ffffff',
              borderTop: '1px solid #e7e1d8',
              borderBottom: '1px solid #e7e1d8',
            }}
          >
            <div
              style={{
                height: 350,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <RealMap
                masters={masters}
                mapMode={mapMode}
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
                    fontSize: 22,
                    color: '#3d454f',
                  }}
                  title="Map style"
                >
                  {mapMode === 'satellite' ? '🛰' : '◩'}
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

              {selectedMaster && (
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 12,
                    zIndex: 35,
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.97)',
                      border: '1px solid #ece4d9',
                      borderRadius: 18,
                      boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
                      padding: 12,
                      display: 'grid',
                      gridTemplateColumns: '64px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 999,
                        overflow: 'hidden',
                        border: '3px solid #fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      }}
                    >
                      <img
                        src={selectedMaster.avatar}
                        alt={selectedMaster.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: '#253140',
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedMaster.name}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#445161',
                        }}
                      >
                        <span>{getCategoryLabel(activeCategory)}</span>
                        <span>•</span>
                        <span
                          style={{
                            color: getMasterAvailability(selectedMaster).color,
                          }}
                        >
                          {getMasterAvailability(selectedMaster).text}
                        </span>
                        <span>★ {(selectedMaster.rating ?? 4.7).toFixed(1)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/master/${selectedMaster.id}`)
                      }
                      style={{
                        border: 'none',
                        background: '#3a983d',
                        color: '#fff',
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 800,
                        boxShadow: '0 6px 14px rgba(58,152,61,0.18)',
                      }}
                    >
                      VIEW
                    </button>
                  </div>
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.00) 70%, rgba(255,255,255,0.08) 100%)',
                }}
              />
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

        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: 14,
              boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
              border: '1px solid #ece7df',
              display: 'grid',
              gridTemplateColumns: '98px 1fr auto',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 98,
                height: 98,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#ddd',
              }}
            >
              <img
                src={featuredMaster?.avatar || masters[0]?.avatar}
                alt={featuredMaster?.name || 'Provider'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#253140',
                  lineHeight: 1.2,
                }}
              >
                {featuredMaster?.name || "Mike's Repairs"}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: '#43505e',
                  fontWeight: 700,
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span>{getCategoryLabel(activeCategory)}</span>
                <span>•</span>
                <span style={{ color: featuredAvailability.color }}>
                  {featuredAvailability.text}
                </span>
                <span>★ {(featuredMaster?.rating ?? 4.7).toFixed(1)}</span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: '1px solid #ebe6df',
                  fontSize: 13,
                  color: '#43505e',
                  fontWeight: 700,
                }}
              >
                {activeCategory === 'beauty'
                  ? 'Hair • Nails • Makeup'
                  : activeCategory === 'pets'
                  ? 'Grooming • Dog Walking • Pet Sitting'
                  : activeCategory === 'tech'
                  ? 'Phone Repair • Laptop Repair'
                  : 'Home Repairs • Appliance Repair'}
              </div>
            </div>

            <button
              onClick={() =>
                router.push(`/master/${featuredMaster?.id || masters[0]?.id}`)
              }
              style={{
                alignSelf: 'end',
                border: 'none',
                background: '#3a983d',
                color: '#fff',
                borderRadius: 10,
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: 800,
                boxShadow: '0 6px 16px rgba(58,152,61,0.20)',
              }}
            >
              VIEW ›
            </button>
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            alignItems: 'center',
            padding: '10px 8px 12px',
          }}
        >
          {[
            { label: 'Home', icon: '⌂', active: true, path: '/' },
            { label: 'Messages', icon: '✉', active: false, path: '/messages' },
            { label: 'Bookings', icon: '▤', active: false, path: '/bookings' },
            { label: 'Profile', icon: '◉', active: false, path: '/profile' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              style={{
                border: 'none',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                color: item.active ? '#1f5d99' : '#6e7b8a',
              }}
            >
              <span
                style={{
                  fontSize: 31,
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: item.active ? 800 : 700,
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
