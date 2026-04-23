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
    beauty: { EN: 'Beauty', ES: 'Beauty', RU: 'Beauty', UA: 'Beauty', CZ: 'Beauty', DE: 'Beauty', PL: 'Beauty' },
    barber: { EN: 'Barber', ES: 'Barber', RU: 'Barber', UA: 'Barber', CZ: 'Barber', DE: 'Barber', PL: 'Barber' },
    wellness: { EN: 'Wellness', ES: 'Wellness', RU: 'Wellness', UA: 'Wellness', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness' },
    home: { EN: 'Home', ES: 'Home', RU: 'Home', UA: 'Home', CZ: 'Home', DE: 'Home', PL: 'Home' },
    repairs: { EN: 'Repairs', ES: 'Repairs', RU: 'Repairs', UA: 'Repairs', CZ: 'Repairs', DE: 'Repairs', PL: 'Repairs' },
    tech: { EN: 'Repairs', ES: 'Repairs', RU: 'Repairs', UA: 'Repairs', CZ: 'Repairs', DE: 'Repairs', PL: 'Repairs' },
    pets: { EN: 'Pets', ES: 'Pets', RU: 'Pets', UA: 'Pets', CZ: 'Pets', DE: 'Pets', PL: 'Pets' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Fitness', UA: 'Fitness', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness' },
    fashion: { EN: 'Fashion', ES: 'Fashion', RU: 'Fashion', UA: 'Fashion', CZ: 'Fashion', DE: 'Fashion', PL: 'Fashion' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Auto', UA: 'Auto', CZ: 'Auto', DE: 'Auto', PL: 'Auto' },
    moving: { EN: 'Moving', ES: 'Moving', RU: 'Moving', UA: 'Moving', CZ: 'Moving', DE: 'Moving', PL: 'Moving' },
    education: { EN: 'Education', ES: 'Education', RU: 'Education', UA: 'Education', CZ: 'Education', DE: 'Education', PL: 'Education' },
    events: { EN: 'Events', ES: 'Events', RU: 'Events', UA: 'Events', CZ: 'Events', DE: 'Events', PL: 'Events' },
    activities: { EN: 'Activities', ES: 'Activities', RU: 'Activities', UA: 'Activities', CZ: 'Activities', DE: 'Activities', PL: 'Activities' },
    creative: { EN: 'Creative', ES: 'Creative', RU: 'Creative', UA: 'Creative', CZ: 'Creative', DE: 'Creative', PL: 'Creative' },
  };

  return map[String(category.id || '').toLowerCase()]?.[language] || category.shortLabel || category.label;
}

function getCategoryEmoji(categoryId: string) {
  const id = String(categoryId || '').toLowerCase();

  if (id === 'more') return '🟩🟦🟥🟨';
  if (id === 'beauty') return '🪞';
  if (id === 'barber') return '💈';
  if (id === 'wellness') return '🪷';
  if (id === 'home') return '🏠';
  if (id === 'repairs' || id === 'tech') return '🛠️';
  if (id === 'pets') return '🐶';
  if (id === 'fitness') return '🏋️';
  if (id === 'fashion') return '👜';
  if (id === 'auto') return '🚗';
  if (id === 'moving') return '📦';
  if (id === 'education') return '🎓';
  if (id === 'events') return '🎉';
  if (id === 'activities') return '🎯';
  if (id === 'creative') return '🎨';

  return '✨';
}

export default function TopCategoriesBar({
  activeCategory,
  language,
  onSelectCategory,
}: TopCategoriesBarProps) {
  const visibleCategories = categories.slice(0, 8);

  return (
    <div style={{ padding: '0 12px' }}>
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 2px 2px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleCategories.map((category) => {
          const isActive = activeCategory === String(category.id);

          return (
            <button
              key={String(category.id)}
              onClick={() => onSelectCategory(String(category.id))}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                minWidth: 76,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  border: isActive ? '1.5px solid #ef7db1' : '1.2px solid #ddd8d2',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 0 0 3px rgba(239,125,177,0.18), 0 2px 10px rgba(0,0,0,0.03)'
                    : '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    lineHeight: 1,
                  }}
                >
                  {getCategoryEmoji(String(category.id))}
                </span>
              </div>

              <span
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 900 : 700,
                  color: '#1f2937',
                  textAlign: 'center',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                }}
              >
                {getCategoryLabel(category, language)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
