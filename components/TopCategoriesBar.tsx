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

const colorMap: Record<string, string> = {
  beauty: '#ff4f93',
  barber: '#2d98ff',
  wellness: '#32c957',
  home: '#ff9f1a',
  repairs: '#f4b400',
  tech: '#9b5cff',
  pets: '#28c7d9',
  more: '#173552',
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
          gridTemplateColumns: '64px 1fr',
          gap: 10,
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
              width: 56,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 52,
                height: 72,
                borderRadius: 18,
                background: 'linear-gradient(180deg, #173552 0%, #0f2238 100%)',
                boxShadow: '0 8px 18px rgba(15,34,56,0.20)',
                border: '2px solid rgba(255,255,255,0.92)',
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
                fontWeight: 900,
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
            paddingBottom: 6,
            paddingRight: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              minWidth: 'max-content',
              paddingRight: 20,
              alignItems: 'flex-start',
            }}
          >
            {visibleTopItems.map((item) => {
              const isActive = activeCategory === item.id;
              const src = iconSrcMap[item.id];
              const color = colorMap[item.id] || '#43d94d';

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
                    gap: 8,
                    minWidth: 78,
                    flexShrink: 0,
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: isActive ? 78 : 72,
                      height: isActive ? 78 : 72,
                      borderRadius: 20,
                      background: '#fff',
                      border: isActive
                        ? `2.5px solid ${color}`
                        : '1.5px solid rgba(220,220,220,0.95)',
                      boxShadow: isActive
                        ? `0 8px 20px ${color}22`
                        : '0 5px 14px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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

                  <div
                    style={{
                      fontSize: isActive ? 12 : 11,
                      fontWeight: 900,
                      color,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.shortLabel || item.label}
                  </div>

                  <div
                    style={{
                      width: isActive ? 46 : 0,
                      height: 6,
                      borderRadius: 999,
                      background: isActive ? color : 'transparent',
                      boxShadow: isActive ? `0 5px 12px ${color}55` : 'none',
                      transition: 'all 0.18s ease',
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
            top: 150,
            left: 0,
            right: 0,
            padding: '0 8px',
            display: 'grid',
            gridTemplateColumns: '42% 58%',
            gap: 8,
            pointerEvents: 'auto',
            zIndex: 9999,
            boxSizing: 'border-box',
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
              minWidth: 0,
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
                  flexShrink: 0,
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
                maxHeight: 460,
                overflowY: 'auto',
              }}
            >
              {categories.map((item) => {
                const active = expandedCategory === item.id;
                const src = iconSrcMap[item.id] || iconSrcMap.beauty;
                const color = colorMap[item.id] || '#43d94d';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setExpandedCategory(item.id);
                      onSelectCategory(item.id);
                      onClearSubcategory();
                    }}
                    style={{
                      border: active ? `2px solid ${color}` : '1px solid #ebe2d5',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: 14,
                      padding: '9px 9px',
                      background: '#fff',
                      color: '#243242',
                      boxShadow: active ? `0 6px 14px ${color}22` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 800,
                      fontSize: 12,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#fff',
                        border: `1.5px solid ${color}`,
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
                    <span
                      style={{
                        color,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 900,
                      }}
                    >
                      {item.shortLabel || item.label}
                    </span>
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
              padding: 14,
              boxShadow: '0 14px 30px rgba(0,0,0,0.15)',
              border: '1px solid rgba(226,218,205,0.95)',
              minHeight: 250,
              minWidth: 0,
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
                  const color = colorMap[expanded.id] || '#43d94d';

                  return (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(expanded.id);
                        onSelectSubcategory(sub);
                        setMenuOpen(false);
                      }}
                      style={{
                        border: active ? `2px solid ${color}` : '1px solid #eadfce',
                        background: '#fff',
                        color: active ? color : '#2a3442',
                        borderRadius: 999,
                        padding: '8px 11px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: active
                          ? `0 6px 14px ${color}22`
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
                  {allOtherCategories.map((item) => {
                    const color = colorMap[item.id] || '#43d94d';

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setExpandedCategory(item.id);
                          onSelectCategory(item.id);
                          onClearSubcategory();
                        }}
                        style={{
                          border: `1px solid ${color}55`,
                          background: '#fff',
                          color,
                          borderRadius: 999,
                          padding: '7px 10px',
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {item.shortLabel || item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
