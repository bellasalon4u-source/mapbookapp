'use client';

import { useMemo, useState } from 'react';
import { categories } from '../services/categories';
import type { AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory?: (subcategory: string) => void;
  onClearSubcategory?: () => void;
};

function getCategoryLabel(category: any, language: AppLanguage) {
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', UA: 'Ще', CZ: 'Více', DE: 'Mehr', PL: 'Więcej', IT: 'Altro', FR: 'Plus', AR: 'المزيد' },
    beauty: { EN: 'Beauty', ES: 'Belleza', RU: 'Красота', UA: 'Краса', CZ: 'Krása', DE: 'Beauty', PL: 'Uroda', IT: 'Beauty', FR: 'Beauté', AR: 'الجمال' },
    barber: { EN: 'Barber', ES: 'Barbero', RU: 'Барбер', UA: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber', IT: 'Barber', FR: 'Barbier', AR: 'حلاقة' },
    wellness: { EN: 'Wellness', ES: 'Bienestar', RU: 'Велнес', UA: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness', IT: 'Benessere', FR: 'Bien-être', AR: 'عافية' },
    home: { EN: 'Home', ES: 'Hogar', RU: 'Дом', UA: 'Дім', CZ: 'Domov', DE: 'Zuhause', PL: 'Dom', IT: 'Casa', FR: 'Maison', AR: 'المنزل' },
    repairs: { EN: 'Repairs', ES: 'Reparaciones', RU: 'Ремонт', UA: 'Ремонт', CZ: 'Opravy', DE: 'Reparaturen', PL: 'Naprawy', IT: 'Riparazioni', FR: 'Réparations', AR: 'إصلاحات' },
    tech: { EN: 'Tech', ES: 'Tecnología', RU: 'Техника', UA: 'Техніка', CZ: 'Technika', DE: 'Technik', PL: 'Technika', IT: 'Tech', FR: 'Tech', AR: 'تقنية' },
    pets: { EN: 'Pets', ES: 'Mascotas', RU: 'Питомцы', UA: 'Тварини', CZ: 'Mazlíčci', DE: 'Haustiere', PL: 'Zwierzęta', IT: 'Animali', FR: 'Animaux', AR: 'حيوانات' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', UA: 'Фітнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness', IT: 'Fitness', FR: 'Fitness', AR: 'لياقة' },
    fashion: { EN: 'Fashion', ES: 'Moda', RU: 'Мода', UA: 'Мода', CZ: 'Móda', DE: 'Mode', PL: 'Moda', IT: 'Moda', FR: 'Mode', AR: 'موضة' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', UA: 'Авто', CZ: 'Auto', DE: 'Auto', PL: 'Auto', IT: 'Auto', FR: 'Auto', AR: 'سيارات' },
    moving: { EN: 'Moving', ES: 'Mudanza', RU: 'Переезд', UA: 'Переїзд', CZ: 'Stěhování', DE: 'Umzug', PL: 'Przeprowadzka', IT: 'Trasloco', FR: 'Déménagement', AR: 'نقل' },
    education: { EN: 'Education', ES: 'Educación', RU: 'Обучение', UA: 'Освіта', CZ: 'Vzdělání', DE: 'Bildung', PL: 'Edukacja', IT: 'Formazione', FR: 'Éducation', AR: 'تعليم' },
    events: { EN: 'Events', ES: 'Eventos', RU: 'События', UA: 'Події', CZ: 'Události', DE: 'Events', PL: 'Wydarzenia', IT: 'Eventi', FR: 'Événements', AR: 'فعاليات' },
    activities: { EN: 'Activities', ES: 'Actividades', RU: 'Активности', UA: 'Активності', CZ: 'Aktivity', DE: 'Aktivitäten', PL: 'Aktywności', IT: 'Attività', FR: 'Activités', AR: 'أنشطة' },
    creative: { EN: 'Creative', ES: 'Creativo', RU: 'Креатив', UA: 'Креатив', CZ: 'Kreativa', DE: 'Kreativ', PL: 'Kreatywne', IT: 'Creativo', FR: 'Créatif', AR: 'إبداعي' },
  };

  return (
    map[String(category.id || '').toLowerCase()]?.[language] ||
    category.shortLabel ||
    category.label ||
    String(category.id || '')
  );
}

function getSubcategoryLabel(value: string, language: AppLanguage) {
  const dict: Record<string, Partial<Record<AppLanguage, string>>> = {
    Hair: { EN: 'Hair', RU: 'Волосы', UA: 'Волосся', ES: 'Cabello', CZ: 'Vlasy', DE: 'Haare', PL: 'Włosy', IT: 'Capelli', FR: 'Cheveux', AR: 'الشعر' },
    Nails: { EN: 'Nails', RU: 'Ногти', UA: 'Нігті', ES: 'Uñas', CZ: 'Nehty', DE: 'Nägel', PL: 'Paznokcie', IT: 'Unghie', FR: 'Ongles', AR: 'الأظافر' },
    Makeup: { EN: 'Makeup', RU: 'Макияж', UA: 'Макіяж', ES: 'Maquillaje', CZ: 'Make-up', DE: 'Make-up', PL: 'Makijaż', IT: 'Make-up', FR: 'Maquillage', AR: 'مكياج' },
    Massage: { EN: 'Massage', RU: 'Массаж', UA: 'Масаж', ES: 'Masaje', CZ: 'Masáž', DE: 'Massage', PL: 'Masaż', IT: 'Massaggio', FR: 'Massage', AR: 'مساج' },
    Cleaning: { EN: 'Cleaning', RU: 'Уборка', UA: 'Прибирання', ES: 'Limpieza', CZ: 'Úklid', DE: 'Reinigung', PL: 'Sprzątanie', IT: 'Pulizia', FR: 'Nettoyage', AR: 'تنظيف' },
    'Phone Repair': { EN: 'Phone Repair', RU: 'Ремонт телефона', UA: 'Ремонт телефону', ES: 'Reparación de teléfono', CZ: 'Oprava telefonu', DE: 'Handyreparatur', PL: 'Naprawa telefonu', IT: 'Riparazione telefono', FR: 'Réparation téléphone', AR: 'إصلاح الهاتف' },
    Grooming: { EN: 'Grooming', RU: 'Груминг', UA: 'Грумінг', ES: 'Peluquería', CZ: 'Grooming', DE: 'Grooming', PL: 'Grooming', IT: 'Toelettatura', FR: 'Toilettage', AR: 'تنظيف الحيوانات' },
  };

  return dict[value]?.[language] || value;
}

function getSheetTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      title: 'Все категории',
      subtitle: 'Выберите категорию или подкатегорию',
      all: 'Все',
      close: 'Закрыть',
    };
  }

  if (language === 'UA') {
    return {
      title: 'Усі категорії',
      subtitle: 'Оберіть категорію або підкатегорію',
      all: 'Усі',
      close: 'Закрити',
    };
  }

  if (language === 'CZ') {
    return {
      title: 'Všechny kategorie',
      subtitle: 'Vyberte kategorii nebo podkategorii',
      all: 'Vše',
      close: 'Zavřít',
    };
  }

  if (language === 'ES') {
    return {
      title: 'Todas las categorías',
      subtitle: 'Elige una categoría o subcategoría',
      all: 'Todo',
      close: 'Cerrar',
    };
  }

  if (language === 'DE') {
    return {
      title: 'Alle Kategorien',
      subtitle: 'Kategorie oder Unterkategorie wählen',
      all: 'Alle',
      close: 'Schließen',
    };
  }

  if (language === 'PL') {
    return {
      title: 'Wszystkie kategorie',
      subtitle: 'Wybierz kategorię lub podkategorię',
      all: 'Wszystko',
      close: 'Zamknij',
    };
  }

  return {
    title: 'All categories',
    subtitle: 'Choose category or subcategory',
    all: 'All',
    close: 'Close',
  };
}

function getCategoryVisual(category: any): { type: 'image' | 'emoji'; value: string } | null {
  const id = String(category?.id || '').toLowerCase();

  const localImageMap: Record<string, string> = {
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

  if (localImageMap[id]) {
    return { type: 'image', value: localImageMap[id] };
  }

  const candidates = [
    category?.image,
    category?.iconImage,
    category?.imageUrl,
    category?.iconUrl,
    category?.photo,
    category?.thumbnail,
    category?.src,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return { type: 'image', value };
    }
  }

  if (typeof category?.icon === 'string' && category.icon.trim()) {
    return { type: 'emoji', value: category.icon };
  }

  return null;
}

function getLanguageAccent(language: AppLanguage) {
  switch (language) {
    case 'EN':
      return { border: '#c8102e', glow: 'rgba(200,16,46,0.15)' };
    case 'RU':
      return { border: '#0039a6', glow: 'rgba(0,57,166,0.15)' };
    case 'CZ':
      return { border: '#d7141a', glow: 'rgba(215,20,26,0.15)' };
    case 'DE':
      return { border: '#ffce00', glow: 'rgba(255,206,0,0.17)' };
    case 'PL':
      return { border: '#dc143c', glow: 'rgba(220,20,60,0.15)' };
    case 'UA':
      return { border: '#0057b7', glow: 'rgba(0,87,183,0.15)' };
    case 'ES':
      return { border: '#c60b1e', glow: 'rgba(198,11,30,0.15)' };
    case 'FR':
      return { border: '#0055a4', glow: 'rgba(0,85,164,0.15)' };
    case 'IT':
      return { border: '#009246', glow: 'rgba(0,146,70,0.15)' };
    case 'AR':
      return { border: '#007a3d', glow: 'rgba(0,122,61,0.15)' };
    default:
      return { border: '#ef7db1', glow: 'rgba(239,125,177,0.14)' };
  }
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  language,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((item: any) => String(item.id).toLowerCase() !== 'more');
  }, []);

  const visibleCategories = useMemo(() => {
    return [{ id: 'more', label: 'More', shortLabel: 'More' }, ...filteredCategories.slice(0, 7)];
  }, [filteredCategories]);

  const accent = getLanguageAccent(language);
  const sheetText = getSheetTexts(language);

  const selectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    onClearSubcategory?.();
    setSheetOpen(false);
  };

  const selectSubcategory = (categoryId: string, subcategory: string) => {
    onSelectCategory(categoryId);
    onSelectSubcategory?.(subcategory);
    setSheetOpen(false);
  };

  return (
    <>
      <div style={{ padding: '0 12px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '0 1px 2px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {visibleCategories.map((category: any) => {
            const categoryId = String(category.id);
            const isMore = categoryId === 'more';
            const isActive = !isMore && activeCategory === categoryId;
            const label = getCategoryLabel(category, language);
            const visual = getCategoryVisual(category);

            return (
              <button
                key={categoryId}
                type="button"
                onClick={() => {
                  if (isMore) {
                    setSheetOpen(true);
                    return;
                  }

                  selectCategory(categoryId);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  minWidth: 74,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 22,
                    border: isActive
                      ? `1.8px solid ${accent.border}`
                      : '1.2px solid #cfc8be',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive
                      ? `0 0 0 4px ${accent.glow}, 0 2px 8px rgba(0,0,0,0.03)`
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {visual?.type === 'image' ? (
                    <img
                      src={visual.value}
                      alt={label}
                      style={{
                        width: '76%',
                        height: '76%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : visual?.type === 'emoji' ? (
                    <span
                      style={{
                        fontSize: 38,
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {visual.value}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '0 8px',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: isActive ? 900 : 700,
                    color: '#1f2937',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sheetOpen ? (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(17,17,17,0.38)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 12px calc(18px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              maxHeight: '78vh',
              background: '#fffefa',
              border: '2px solid #111111',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                padding: '18px 18px 14px',
                borderBottom: '1.5px solid #eee7dc',
                display: 'grid',
                gridTemplateColumns: '1fr 42px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.1,
                  }}
                >
                  {sheetText.title}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#756b61',
                  }}
                >
                  {sheetText.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: '1.6px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 14,
                overflowY: 'auto',
                maxHeight: 'calc(78vh - 90px)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                }}
              >
                {filteredCategories.map((category: any) => {
                  const categoryId = String(category.id);
                  const label = getCategoryLabel(category, language);
                  const visual = getCategoryVisual(category);
                  const isActiveCategory = activeCategory === categoryId;

                  return (
                    <div
                      key={categoryId}
                      style={{
                        border: '1.5px solid #111111',
                        borderRadius: 22,
                        background: '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => selectCategory(categoryId)}
                        style={{
                          width: '100%',
                          minHeight: 74,
                          border: 'none',
                          background: isActiveCategory ? accent.glow : '#ffffff',
                          padding: 12,
                          display: 'grid',
                          gridTemplateColumns: '54px 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 17,
                            border: isActiveCategory
                              ? `1.8px solid ${accent.border}`
                              : '1.2px solid #cfc8be',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {visual?.type === 'image' ? (
                            <img
                              src={visual.value}
                              alt={label}
                              style={{
                                width: '76%',
                                height: '76%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : visual?.type === 'emoji' ? (
                            <span style={{ fontSize: 30 }}>{visual.value}</span>
                          ) : (
                            <span style={{ fontSize: 22 }}>□</span>
                          )}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#17130f',
                            }}
                          >
                            {label}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#756b61',
                            }}
                          >
                            {sheetText.all}
                          </div>
                        </div>

                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            border: '1.5px solid #111111',
                            background: isActiveCategory ? accent.border : '#ffffff',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 900,
                          }}
                        >
                          {isActiveCategory && !activeSubcategory ? '✓' : ''}
                        </div>
                      </button>

                      {Array.isArray(category.subcategories) && category.subcategories.length > 0 ? (
                        <div
                          style={{
                            borderTop: '1.2px solid #eee7dc',
                            padding: '10px 12px 12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          {category.subcategories.map((subcategory: string) => {
                            const isActiveSub =
                              isActiveCategory && activeSubcategory === subcategory;

                            return (
                              <button
                                key={`${categoryId}-${subcategory}`}
                                type="button"
                                onClick={() => selectSubcategory(categoryId, subcategory)}
                                style={{
                                  minHeight: 36,
                                  borderRadius: 999,
                                  border: isActiveSub
                                    ? `1.6px solid ${accent.border}`
                                    : '1.2px solid #d8d2c8',
                                  background: isActiveSub ? accent.glow : '#fffefa',
                                  color: '#17130f',
                                  padding: '0 12px',
                                  fontSize: 12,
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                }}
                              >
                                {getSubcategoryLabel(subcategory, language)}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
