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

function getCategoryLabel(category: { id: string; shortLabel?: string; label: string }, language: AppLanguage) {
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

function getCategoryImagePath(id: string) {
  if (id === 'more') return '/ui/categories/more.png';
  return `/ui/categories/${id}.png`;
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

  return (
    <div style={{ padding: '0 12px' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 1px 2px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleCategories.map((category) => {
          const categoryId = String(category.id);
          const isActive = activeCategory === categoryId;
          const label = getCategoryLabel(category, language);
          const imageSrc = getCategoryImagePath(categoryId);

          return (
            <button
              key={categoryId}
              onClick={() => onSelectCategory(categoryId)}
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
                  border: isActive ? '1.8px solid #ef7db1' : '1.2px solid #cfc8be',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(239,125,177,0.14), 0 2px 8px rgba(0,0,0,0.03)'
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={imageSrc}
                  alt={label}
                  style={{
                    width: '72%',
                    height: '72%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <span
                style={{
                  marginTop: 7,
                  fontSize: 12,
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
