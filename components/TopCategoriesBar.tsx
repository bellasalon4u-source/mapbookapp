'use client';

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
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', UA: 'Ще', CZ: 'Více', DE: 'Mehr', PL: 'Więcej' },
    beauty: { EN: 'Beauty', ES: 'Beauty', RU: 'Красота', UA: 'Краса', CZ: 'Beauty', DE: 'Beauty', PL: 'Beauty' },
    barber: { EN: 'Barber', ES: 'Barber', RU: 'Барбер', UA: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber' },
    wellness: { EN: 'Wellness', ES: 'Wellness', RU: 'Велнес', UA: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness' },
    home: { EN: 'Home', ES: 'Home', RU: 'Дом', UA: 'Дім', CZ: 'Home', DE: 'Home', PL: 'Home' },
    repairs: { EN: 'Repairs', ES: 'Repairs', RU: 'Ремонт', UA: 'Ремонт', CZ: 'Repairs', DE: 'Repairs', PL: 'Repairs' },
    tech: { EN: 'Repairs', ES: 'Repairs', RU: 'Ремонт', UA: 'Ремонт', CZ: 'Repairs', DE: 'Repairs', PL: 'Repairs' },
    pets: { EN: 'Pets', ES: 'Pets', RU: 'Питомцы', UA: 'Тварини', CZ: 'Pets', DE: 'Pets', PL: 'Pets' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', UA: 'Фітнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness' },
    fashion: { EN: 'Fashion', ES: 'Fashion', RU: 'Мода', UA: 'Мода', CZ: 'Fashion', DE: 'Fashion', PL: 'Fashion' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', UA: 'Авто', CZ: 'Auto', DE: 'Auto', PL: 'Auto' },
    moving: { EN: 'Moving', ES: 'Moving', RU: 'Переезд', UA: 'Переїзд', CZ: 'Moving', DE: 'Moving', PL: 'Moving' },
    education: { EN: 'Education', ES: 'Education', RU: 'Обучение', UA: 'Освіта', CZ: 'Education', DE: 'Education', PL: 'Education' },
    events: { EN: 'Events', ES: 'Events', RU: 'События', UA: 'Події', CZ: 'Events', DE: 'Events', PL: 'Events' },
    activities: { EN: 'Activities', ES: 'Activities', RU: 'Активности', UA: 'Активності', CZ: 'Activities', DE: 'Activities', PL: 'Activities' },
    creative: { EN: 'Creative', ES: 'Creative', RU: 'Креатив', UA: 'Креатив', CZ: 'Creative', DE: 'Creative', PL: 'Creative' },
  };

  return map[String(category.id || '').toLowerCase()]?.[language] || category.shortLabel || category.label;
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
      return {
        border: '#c8102e',
        glow: 'rgba(200,16,46,0.16)',
      };
    case 'RU':
      return {
        border: '#0039a6',
        glow: 'rgba(0,57,166,0.16)',
      };
    case 'CZ':
      return {
        border: '#d7141a',
        glow: 'rgba(215,20,26,0.16)',
      };
    case 'DE':
      return {
        border: '#ffce00',
        glow: 'rgba(255,206,0,0.18)',
      };
    case 'PL':
      return {
        border: '#dc143c',
        glow: 'rgba(220,20,60,0.16)',
      };
    case 'UA':
      return {
        border: '#0057b7',
        glow: 'rgba(0,87,183,0.16)',
      };
    case 'ES':
      return {
        border: '#c60b1e',
        glow: 'rgba(198,11,30,0.16)',
      };
    case 'FR':
      return {
        border: '#0055a4',
        glow: 'rgba(0,85,164,0.16)',
      };
    case 'IT':
      return {
        border: '#009246',
        glow: 'rgba(0,146,70,0.16)',
      };
    case 'AR':
      return {
        border: '#007a3d',
        glow: 'rgba(0,122,61,0.16)',
      };
    default:
      return {
        border: '#ef7db1',
        glow: 'rgba(239,125,177,0.14)',
      };
  }
}

export default function TopCategoriesBar({
  activeCategory,
  language,
  onSelectCategory,
}: TopCategoriesBarProps) {
  const visibleCategories = [
    { id: 'more', label: 'More', shortLabel: 'More' },
    ...categories.slice(0, 7),
  ];

  const accent = getLanguageAccent(language);

  return (
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
          const isActive = activeCategory === categoryId;
          const label = getCategoryLabel(category, language);
          const visual = getCategoryVisual(category);

          return (
            <button
              key={categoryId}
              onClick={() => onSelectCategory(categoryId === 'more' ? 'beauty' : categoryId)}
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
                  border: isActive ? `1.8px solid ${accent.border}` : '1.2px solid #cfc8be',
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
  );
}
