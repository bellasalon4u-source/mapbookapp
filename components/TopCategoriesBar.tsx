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
  transport: '/ui/categories/transport.png',
  education: '/ui/categories/education.png',
};

const colorMap: Record<string, string> = {
  beauty: '#ff4f93',
  barber: '#2d98ff',
  wellness: '#32c957',
  home: '#ff9f1a',
  repairs: '#f4b400',
  tech: '#9b5cff',
  pets: '#28c7d9',
  transport: '#2f7df6',
  education: '#7d52ff',
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
        zIndex: 120,
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
                background: '#fff',
                boxShadow: '0 8px 18px rgba(15,34,56,0.12)',
                border: '1.5px solid rgba(220,220,220,0.95)',
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
                color: colorMap.more,
                lineHeight: 1,
                whiteSpace: 'nowrap',
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
            inset: 0,
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              maxWidth: 430,
              margin: '0 auto',
              height: '100vh',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(247,243,235,0.06)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                pointerEvents: 'auto',
                position: 'absolute',
                zIndex: 3,
                left: 10,
                right: 10,
                top: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                padding: '16px 18px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#233244',
                    lineHeight: 1.1,
                  }}
                >
                  All categories
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: '#6f675f',
                    fontWeight: 700,
                  }}
                >
                  Choose category and subcategory
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1px solid rgba(210,205,195,0.9)',
                  background: 'rgba(255,255,255,0.78)',
                  fontSize: 24,
                  cursor: 'pointer',
                  flexShrink: 0,
                  color: '#263545',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                position: 'absolute',
                zIndex: 3,
                left: 10,
                right: 10,
                top: 118,
                bottom: 104,
                display: 'grid',
                gridTemplateColumns: '36% 64%',
                gap: 10,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  pointerEvents: 'auto',
                  minHeight: 0,
                  height: '100%',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 22,
                  border: '1px solid rgba(255,255,255,0.45)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: 10,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#233244',
                    marginBottom: 10,
                    paddingLeft: 4,
                  }}
                >
                  Categories
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    paddingBottom: 8,
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
                          border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.55)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          borderRadius: 16,
                          padding: '10px 8px',
                          background: active ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.40)',
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
                            width: 34,
                            height: 34,
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
                  pointerEvents: 'auto',
                  minHeight: 0,
                  height: '100%',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 22,
                  border: '1px solid rgba(255,255,255,0.45)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: 14,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: 18,
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
                      gap: 10,
                      paddingBottom: 8,
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
                            border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.55)',
                            background: active ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.46)',
                            color: active ? color : '#2a3442',
                            borderRadius: 999,
                            padding: '10px 14px',
                            fontSize: 13,
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
                        marginTop: 18,
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#6a7480',
                      }}
                    >
                      Extra categories
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingBottom: 8,
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
                              background: 'rgba(255,255,255,0.46)',
                              color,
                              borderRadius: 999,
                              padding: '8px 11px',
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
          </div>
        </div>
      )}
    </div>
  );
}
