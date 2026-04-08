'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '../services/categories';
import { t, type AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onClearSubcategory: () => void;
};

const horizontalOrder = [
  'beauty',
  'barber',
  'wellness',
  'home',
  'repairs',
  'tech',
  'pets',
  'fashion',
  'auto',
  'moving',
  'fitness',
  'education',
  'events',
  'activities',
  'creative',
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
  fashion: '/ui/categories/fashion.png',
  auto: '/ui/categories/auto.png',
  moving: '/ui/categories/moving.png',
  fitness: '/ui/categories/fitness.png',
  education: '/ui/categories/education.png',
  events: '/ui/categories/events.png',
  activities: '/ui/categories/activities.png',
  creative: '/ui/categories/creative.png',
};

const colorMap: Record<string, string> = {
  beauty: '#ff4f93',
  barber: '#2d98ff',
  wellness: '#32c957',
  home: '#ff9f1a',
  repairs: '#f4b400',
  tech: '#9b5cff',
  pets: '#28c7d9',
  fashion: '#43d94d',
  auto: '#43d94d',
  moving: '#43d94d',
  fitness: '#43d94d',
  education: '#7d52ff',
  events: '#43d94d',
  activities: '#43d94d',
  creative: '#43d94d',
  more: '#173552',
};

function translateCategoryLabel(categoryId: string, language: AppLanguage, fallback?: string) {
  const map: Record<string, Record<AppLanguage, string>> = {
    beauty: { EN: 'Beauty', ES: 'Belleza', RU: 'Красота', CZ: 'Krása', DE: 'Beauty', PL: 'Uroda' },
    barber: { EN: 'Barber', ES: 'Barbero', RU: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber' },
    wellness: { EN: 'Wellness', ES: 'Bienestar', RU: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness' },
    home: { EN: 'Home', ES: 'Hogar', RU: 'Дом', CZ: 'Domov', DE: 'Zuhause', PL: 'Dom' },
    repairs: { EN: 'Repairs', ES: 'Reparaciones', RU: 'Ремонт', CZ: 'Opravy', DE: 'Reparaturen', PL: 'Naprawy' },
    tech: { EN: 'Tech', ES: 'Tecnología', RU: 'Техника', CZ: 'Technika', DE: 'Technik', PL: 'Technika' },
    pets: { EN: 'Pets', ES: 'Mascotas', RU: 'Питомцы', CZ: 'Mazlíčci', DE: 'Haustiere', PL: 'Zwierzęta' },
    fashion: { EN: 'Fashion', ES: 'Moda', RU: 'Мода', CZ: 'Móda', DE: 'Mode', PL: 'Moda' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', CZ: 'Auto', DE: 'Auto', PL: 'Auto' },
    moving: { EN: 'Moving', ES: 'Mudanza', RU: 'Переезд', CZ: 'Stěhování', DE: 'Umzug', PL: 'Przeprowadzka' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness' },
    education: { EN: 'Education', ES: 'Educación', RU: 'Обучение', CZ: 'Vzdělání', DE: 'Bildung', PL: 'Edukacja' },
    events: { EN: 'Events', ES: 'Eventos', RU: 'События', CZ: 'Události', DE: 'Events', PL: 'Wydarzenia' },
    activities: { EN: 'Activities', ES: 'Actividades', RU: 'Активности', CZ: 'Aktivity', DE: 'Aktivitäten', PL: 'Aktywności' },
    creative: { EN: 'Creative', ES: 'Creativo', RU: 'Креатив', CZ: 'Kreativa', DE: 'Kreativ', PL: 'Kreatywne' },
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Record<AppLanguage, string>> = {
    Hair: { EN: 'Hair', ES: 'Cabello', RU: 'Волосы', CZ: 'Vlasy', DE: 'Haare', PL: 'Włosy' },
    'Brows & Lashes': { EN: 'Brows & Lashes', ES: 'Cejas y pestañas', RU: 'Брови и ресницы', CZ: 'Obočí a řasy', DE: 'Augenbrauen & Wimpern', PL: 'Brwi i rzęsy' },
    Nails: { EN: 'Nails', ES: 'Uñas', RU: 'Ногти', CZ: 'Nehty', DE: 'Nägel', PL: 'Paznokcie' },
    Makeup: { EN: 'Makeup', ES: 'Maquillaje', RU: 'Макияж', CZ: 'Make-up', DE: 'Make-up', PL: 'Makijaż' },
    Skincare: { EN: 'Skincare', ES: 'Cuidado de la piel', RU: 'Уход за кожей', CZ: 'Péče o pleť', DE: 'Hautpflege', PL: 'Pielęgnacja skóry' },
    Aesthetics: { EN: 'Aesthetics', ES: 'Estética', RU: 'Эстетика', CZ: 'Estetika', DE: 'Ästhetik', PL: 'Estetyka' },

    Haircut: { EN: 'Haircut', ES: 'Corte de pelo', RU: 'Стрижка', CZ: 'Střih', DE: 'Haarschnitt', PL: 'Strzyżenie' },
    'Beard Trim': { EN: 'Beard Trim', ES: 'Recorte de barba', RU: 'Подравнивание бороды', CZ: 'Úprava vousů', DE: 'Bart trimmen', PL: 'Przycinanie brody' },
    Shave: { EN: 'Shave', ES: 'Afeitado', RU: 'Бритьё', CZ: 'Holení', DE: 'Rasur', PL: 'Golenie' },
    Fade: { EN: 'Fade', ES: 'Fade', RU: 'Фейд', CZ: 'Fade', DE: 'Fade', PL: 'Fade' },
    'Kids Haircut': { EN: 'Kids Haircut', ES: 'Corte infantil', RU: 'Детская стрижка', CZ: 'Dětský střih', DE: 'Kinderhaarschnitt', PL: 'Strzyżenie dziecięce' },
    Styling: { EN: 'Styling', ES: 'Peinado', RU: 'Укладка', CZ: 'Styling', DE: 'Styling', PL: 'Stylizacja' },

    Massage: { EN: 'Massage', ES: 'Masaje', RU: 'Массаж', CZ: 'Masáž', DE: 'Massage', PL: 'Masaż' },
    Spa: { EN: 'Spa', ES: 'Spa', RU: 'Спа', CZ: 'Spa', DE: 'Spa', PL: 'Spa' },
    Relaxation: { EN: 'Relaxation', ES: 'Relajación', RU: 'Релакс', CZ: 'Relaxace', DE: 'Entspannung', PL: 'Relaks' },
    Recovery: { EN: 'Recovery', ES: 'Recuperación', RU: 'Восстановление', CZ: 'Regenerace', DE: 'Erholung', PL: 'Regeneracja' },
    'Holistic Care': { EN: 'Holistic Care', ES: 'Cuidado holístico', RU: 'Холистический уход', CZ: 'Holistická péče', DE: 'Ganzheitliche Pflege', PL: 'Opieka holistyczna' },
    'Therapy Support': { EN: 'Therapy Support', ES: 'Apoyo terapéutico', RU: 'Терапевтическая помощь', CZ: 'Terapeutická podpora', DE: 'Therapie-Unterstützung', PL: 'Wsparcie terapeutyczne' },

    Cleaning: { EN: 'Cleaning', ES: 'Limpieza', RU: 'Уборка', CZ: 'Úklid', DE: 'Reinigung', PL: 'Sprzątanie' },
    'Deep Cleaning': { EN: 'Deep Cleaning', ES: 'Limpieza profunda', RU: 'Глубокая уборка', CZ: 'Hloubkové čištění', DE: 'Tiefenreinigung', PL: 'Dogłębne czyszczenie' },
    'Garden Help': { EN: 'Garden Help', ES: 'Ayuda en jardín', RU: 'Помощь в саду', CZ: 'Pomoc na zahradě', DE: 'Gartenhilfe', PL: 'Pomoc w ogrodzie' },
    Handyman: { EN: 'Handyman', ES: 'Manitas', RU: 'Мастер на час', CZ: 'Hodinový manžel', DE: 'Handwerker', PL: 'Złota rączka' },
    'Furniture Assembly': { EN: 'Furniture Assembly', ES: 'Montaje de muebles', RU: 'Сборка мебели', CZ: 'Montáž nábytku', DE: 'Möbelmontage', PL: 'Montaż mebli' },
    'Home Help': { EN: 'Home Help', ES: 'Ayuda en casa', RU: 'Помощь по дому', CZ: 'Pomoc v domácnosti', DE: 'Haushaltshilfe', PL: 'Pomoc domowa' },

    Other: { EN: 'Other', ES: 'Otro', RU: 'Другое', CZ: 'Jiné', DE: 'Andere', PL: 'Inne' }
  };

  return dict[value]?.[language] || value;
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  language,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>(activeCategory);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setExpandedCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [menuOpen]);

  const tr = t(language);

  const visibleTopItems = useMemo(() => {
    return horizontalOrder
      .map((id) => categories.find((item) => item.id === id))
      .filter(Boolean) as typeof categories;
  }, []);

  const allOtherCategories = useMemo(() => {
    return categories.filter((item) => !horizontalOrder.includes(item.id));
  }, []);

  const expanded = categories.find((item) => item.id === expandedCategory);

  const overlay =
    mounted && menuOpen
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483647,
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.02)',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: 430,
                margin: '0 auto',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  top: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.72)',
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
                    {tr.allCategories}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: '#6f675f',
                      fontWeight: 700,
                    }}
                  >
                    {tr.chooseCategoryAndSubcategory}
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    border: '1px solid rgba(210,205,195,0.9)',
                    background: 'rgba(255,255,255,0.88)',
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
                  left: 10,
                  right: 10,
                  top: 118,
                  height: 'min(320px, 36vh)',
                  display: 'grid',
                  gridTemplateColumns: '34% 66%',
                  gap: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    height: '100%',
                    background: 'rgba(255,255,255,0.26)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.50)',
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
                    {tr.categories}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      paddingBottom: 4,
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
                            border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.58)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 16,
                            padding: '10px 8px',
                            background: active ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.44)',
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
                              color: '#111111',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 900,
                            }}
                          >
                            {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 0,
                    height: '100%',
                    background: 'rgba(255,255,255,0.26)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.50)',
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
                    {expanded
                      ? translateCategoryLabel(expanded.id, language, expanded.label)
                      : tr.services}
                  </div>

                  {expanded ? (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        paddingBottom: 4,
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
                              border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.58)',
                              background: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.52)',
                              color: active ? color : '#2a3442',
                              borderRadius: 999,
                              padding: '10px 14px',
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: active ? `0 6px 14px ${color}22` : '0 4px 10px rgba(0,0,0,0.04)',
                            }}
                          >
                            {translateSubcategory(sub, language)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {allOtherCategories.length > 0 ? (
                    <>
                      <div
                        style={{
                          marginTop: 18,
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#6a7480',
                        }}
                      >
                        {tr.extraCategories}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          paddingBottom: 4,
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
                                background: 'rgba(255,255,255,0.52)',
                                color: '#111111',
                                borderRadius: 999,
                                padding: '8px 11px',
                                fontSize: 11,
                                fontWeight: 900,
                                cursor: 'pointer',
                              }}
                            >
                              {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

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
                color: '#111111',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {tr.more}
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
                      border: isActive ? `2.5px solid ${color}` : '1.5px solid rgba(220,220,220,0.95)',
                      boxShadow: isActive ? `0 8px 20px ${color}22` : '0 5px 14px rgba(0,0,0,0.06)',
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
                      color: '#111111',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
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

      {overlay}
    </div>
  );
}
