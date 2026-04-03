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
  'more',
];

const displayConfig: Record<
  string,
  { label: string; icon: string; bg: string; color: string; shadow: string }
> = {
  beauty: {
    label: 'Beauty',
    icon: '🪞',
    bg: 'linear-gradient(180deg, #ff80b5 0%, #ff5fa0 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(255,95,160,0.22)',
  },
  barber: {
    label: 'Barber',
    icon: '🧔',
    bg: 'linear-gradient(180deg, #5cb7ff 0%, #3297f4 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(50,151,244,0.20)',
  },
  wellness: {
    label: 'Wellness',
    icon: '🪷',
    bg: 'linear-gradient(180deg, #6be86a 0%, #3ccf56 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(60,207,86,0.20)',
  },
  home: {
    label: 'Home',
    icon: '🏡',
    bg: 'linear-gradient(180deg, #ffd84c 0%, #ffbf26 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(255,191,38,0.22)',
  },
  repairs: {
    label: 'Repairs',
    icon: '🛠️',
    bg: 'linear-gradient(180deg, #4abfff 0%, #2196f3 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(33,150,243,0.20)',
  },
  tech: {
    label: 'Tech',
    icon: '🖥️',
    bg: 'linear-gradient(180deg, #b46cff 0%, #8a4dff 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(138,77,255,0.20)',
  },
  pets: {
    label: 'Pets',
    icon: '🐾',
    bg: 'linear-gradient(180deg, #ffbd2f 0%, #ff9f1f 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(255,159,31,0.22)',
  },
  more: {
    label: 'More',
    icon: '⋮',
    bg: 'linear-gradient(180deg, #173552 0%, #0f2238 100%)',
    color: '#ffffff',
    shadow: '0 6px 14px rgba(15,34,56,0.22)',
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
    return topOrder.map((id) => {
      if (id === 'more') {
        return {
          id: 'more',
          label: 'More',
          icon: '⋮',
          subcategories: [],
        };
      }

      return categories.find((item) => item.id === id)!;
    });
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
          gridTemplateColumns: '64px 1fr',
          gap: 8,
          padding: '0 10px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'sticky',
            left: 0,
            background: '#f7f3eb',
            zIndex: 3,
            paddingTop: 2,
          }}
        >
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              width: 58,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 54,
                height: 74,
                borderRadius: 18,
                background: displayConfig.more.bg,
                color: displayConfig.more.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                boxShadow: displayConfig.more.shadow,
                border: '2px solid rgba(255,255,255,0.75)',
              }}
            >
              ⋮
            </div>

            <div
              style={{
                fontSize: 12,
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
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              minWidth: 'max-content',
              paddingRight: 10,
            }}
          >
            {visibleTopItems
              .filter((item) => item.id !== 'more')
              .map((item) => {
                const cfg = displayConfig[item.id];
                const isActive = activeCategory === item.id;

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
                      gap: 6,
                      minWidth: 76,
                    }}
                  >
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 22,
                        background: cfg.bg,
                        color: cfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        boxShadow: cfg.shadow,
                        border: isActive
                          ? '3px solid rgba(255,255,255,0.92)'
                          : '2px solid rgba(255,255,255,0.75)',
                        transform: isActive ? 'translateY(-1px)' : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {cfg.icon}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#ffffff',
                        background: 'rgba(0,0,0,0.28)',
                        padding: '5px 10px',
                        borderRadius: 999,
                        marginTop: -16,
                        lineHeight: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                        maxWidth: 78,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cfg.label}
                    </div>

                    <div
                      style={{
                        width: 46,
                        height: 6,
                        borderRadius: 999,
                        background: isActive ? '#43d94d' : 'transparent',
                        boxShadow: isActive
                          ? '0 4px 10px rgba(67,217,77,0.30)'
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
            position: 'absolute',
            top: 8,
            left: 10,
            right: 10,
            display: 'grid',
            gridTemplateColumns: '155px 1fr',
            gap: 10,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 12,
              boxShadow: '0 14px 30px rgba(0,0,0,0.16)',
              border: '1px solid rgba(226,218,205,0.95)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#233244',
                }}
              >
                Categories
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  border: '1px solid #e5ddd2',
                  background: '#fff',
                  fontSize: 16,
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
                gap: 8,
                maxHeight: 340,
                overflowY: 'auto',
              }}
            >
              {categories.map((item) => {
                const active = expandedCategory === item.id;
                const cfg = displayConfig[item.id] || displayConfig.beauty;

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
                      borderRadius: 16,
                      padding: '10px 10px',
                      background: active ? cfg.bg : '#f8f5ef',
                      color: active ? '#fff' : '#243242',
                      boxShadow: active ? cfg.shadow : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>
                      {cfg.icon}
                    </span>
                    <span>{item.shortLabel || item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 14,
              boxShadow: '0 14px 30px rgba(0,0,0,0.16)',
              border: '1px solid rgba(226,218,205,0.95)',
              minHeight: 170,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: '#233244',
                marginBottom: 12,
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
                        padding: '9px 12px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: active
                          ? '0 6px 14px rgba(67,217,77,0.14)'
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
                    marginTop: 18,
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#6a7480',
                  }}
                >
                  More categories
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
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
                        padding: '8px 12px',
                        fontSize: 12,
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
