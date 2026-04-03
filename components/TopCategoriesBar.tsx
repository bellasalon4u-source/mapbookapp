'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { categories } from '../services/categories';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onClearSubcategory: () => void;
};

const topOrder = [
  'beauty',
  'barber',
  'wellness',
  'home',
  'repairs',
  'tech',
  'pets',
];

const iconSrcMap: Record<string, string> = {
  more: '/ui/categories/more.png',
  beauty: '/ui/categories/beauty.png',
  barber: '/ui/categories/barber.png',
  wellness: '/ui/categories/wellness.png',
  home: '/ui/categories/home.png',
  repairs: '/ui/categories/repairs.png',
  tech: '/ui/categories/tech.png',
  pets: '/ui/categories/pets.png',
};

const tileStyleMap: Record<
  string,
  { label: string; bg: string; shadow: string }
> = {
  beauty: {
    label: 'Beauty',
    bg: 'linear-gradient(180deg, #ff86b9 0%, #ff5f9f 100%)',
    shadow: '0 5px 12px rgba(255,95,159,0.20)',
  },
  barber: {
    label: 'Barber',
    bg: 'linear-gradient(180deg, #63bbff 0%, #3498f5 100%)',
    shadow: '0 5px 12px rgba(52,152,245,0.18)',
  },
  wellness: {
    label: 'Wellness',
    bg: 'linear-gradient(180deg, #73ea6f 0%, #44cf56 100%)',
    shadow: '0 5px 12px rgba(68,207,86,0.18)',
  },
  home: {
    label: 'Home',
    bg: 'linear-gradient(180deg, #ffd84a 0%, #ffbf26 100%)',
    shadow: '0 5px 12px rgba(255,191,38,0.18)',
  },
  repairs: {
    label: 'Repairs',
    bg: 'linear-gradient(180deg, #50c2ff 0%, #2797f4 100%)',
    shadow: '0 5px 12px rgba(39,151,244,0.18)',
  },
  tech: {
    label: 'Tech',
    bg: 'linear-gradient(180deg, #b56eff 0%, #8d50ff 100%)',
    shadow: '0 5px 12px rgba(141,80,255,0.18)',
  },
  pets: {
    label: 'Pets',
    bg: 'linear-gradient(180deg, #ffc338 0%, #ffa11f 100%)',
    shadow: '0 5px 12px rgba(255,161,31,0.18)',
  },
  more: {
    label: 'More',
    bg: 'linear-gradient(180deg, #173552 0%, #0f2238 100%)',
    shadow: '0 5px 12px rgba(15,34,56,0.20)',
  },
};

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>(activeCategory);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setExpandedCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!menuOpen) return;
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  const visibleTopItems = useMemo(() => {
    return topOrder
      .map((id) => categories.find((item) => item.id === id))
      .filter(Boolean) as typeof categories;
  }, []);

  const allOtherCategories = useMemo(() => {
    return categories.filter((item) => !topOrder.includes(item.id));
  }, []);

  const expanded = categories.find((item) => item.id === expandedCategory);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '54px 1fr',
          gap: 8,
          padding: '0 8px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'sticky',
            left: 0,
            background: '#f7f3eb',
            zIndex: 3,
            paddingTop: 1,
          }}
        >
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              width: 50,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 46,
                height: 64,
                borderRadius: 16,
                background: tileStyleMap.more.bg,
                boxShadow: tileStyleMap.more.shadow,
                border: '2px solid rgba(255,255,255,0.82)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={iconSrcMap.more}
                alt="More"
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
                fontSize: 11,
                fontWeight: 800,
                color: '#203040',
                lineHeight: 1,
              }}
            >
              More
            </div>
          </button>
        </div>

        <div
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: 3,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              minWidth: 'max-content',
              paddingRight: 8,
            }}
          >
            {visibleTopItems.map((item) => {
              const cfg = tileStyleMap[item.id];
              const isActive = activeCategory === item.id;
              const src = iconSrcMap[item.id];

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id);
                    onClearSubcategory();
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 66,
                  }}
                >
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 18,
                      background: cfg.bg,
                      boxShadow: cfg.shadow,
                      border: isActive
                        ? '3px solid rgba(255,255,255,0.95)'
                        : '2px solid rgba(255,255,255,0.82)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={src}
                      alt={cfg.label}
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
                      fontSize: 11,
                      fontWeight: 900,
                      color: '#fff',
                      background: 'rgba(0,0,0,0.26)',
                      padding: '4px 9px',
                      borderRadius: 999,
                      marginTop: -14,
                      lineHeight: 1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.30)',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                      maxWidth: 70,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {cfg.label}
                  </div>

                  <div
                    style={{
                      width: 40,
                      height: 5,
                      borderRadius: 999,
                      background: isActive ? '#43d94d' : 'transparent',
                      boxShadow: isActive
                        ? '0 4px 10px rgba(67,217,77,0.28)'
                        : 'none',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 148,
            left: 12,
            right: 12,
            maxWidth: 430,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(135px, 0.95fr) minmax(0, 1.45fr)',
            gap: 10,
            pointerEvents: 'auto',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: 18,
              padding: 10,
              boxShadow: '0 14px 30px rgba(0,0,0,0.15)',
              border: '1px solid rgba(226,218,205,0.95)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#233244',
                }}
              >
                Categories
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #e5ddd2',
                  background: '#fff',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                maxHeight: 420,
                overflowY: 'auto',
              }}
            >
              {categories.map((item) => {
                const active = expandedCategory === item.id;
                const src = iconSrcMap[item.id] || iconSrcMap.beauty;
                const cfg = tileStyleMap[item.id] || tileStyleMap.beauty;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setExpandedCategory(item.id);
                      onSelectCategory(item.id);
                      onClearSubcategory();
                    }}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: 14,
                      padding: '9px 9px',
                      background: active ? '#eef7ff' : '#f8f5ef',
                      color: '#243242',
                      boxShadow: active ? '0 6px 14px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: cfg.bg,
                      }}
                    >
                      <img
                        src={src}
                        alt={item.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                    <span>{item.shortLabel || item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.99)',
              backdropFilter: 'blur(10px)',
              borderRadius: 18,
              padding: 12,
              boxShadow: '0 14px 30px rgba(0,0,0,0.15)',
              border: '1px solid rgba(226,218,205,0.95)',
              minHeight: 220,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#233244',
                marginBottom: 10,
              }}
            >
              {expanded?.label || 'Subcategories'}
            </div>

            {expanded ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {expanded.subcategories.map((sub) => {
                  const active = activeSubcategory === sub;

                  return (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(expanded.id);
                        onSelectSubcategory(sub);
                        setMenuOpen(false);
                      }}
                      style={{
                        border: active
                          ? '2px solid #43d94d'
                          : '1px solid #eadfce',
                        background: active ? '#fffbea' : '#fff',
                        color: '#2a3442',
                        borderRadius: 999,
                        padding: '8px 11px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: active
                          ? '0 6px 14px rgba(67,217,77,0.12)'
                          : '0 4px 10px rgba(0,0,0,0.04)',
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {allOtherCategories.length > 0 && (
              <>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#6a7480',
                  }}
                >
                  More categories
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 7,
                  }}
                >
                  {allOtherCategories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setExpandedCategory(item.id);
                        onSelectCategory(item.id);
                        onClearSubcategory();
                      }}
                      style={{
                        border: '1px solid #eadfce',
                        background: '#fff',
                        color: '#243242',
                        borderRadius: 999,
                        padding: '7px 10px',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {item.shortLabel || item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
