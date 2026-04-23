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

function getCategoryVisual(category: any) {
  const id = String(category?.id || '').toLowerCase();

  const visualMap: Record<string, string> = {
    more: '🟩🟦🟥🟨',
    beauty: '🪞',
    barber: '💈',
    wellness: '🪷',
    home: '🏠',
    repairs: '🛠️',
    tech: '🛠️',
    pets: '🐶',
    fitness: '🏋️',
    fashion: '👜',
    auto: '🚗',
    moving: '📦',
    education: '🎓',
    events: '🎉',
    activities: '🎯',
    creative: '🎨',
  };

  return visualMap[id] || '✨';
}

export default function TopCategoriesBar({
  activeCategory,
  language,
  onSelectCategory,
}: TopCategoriesBarProps) {
  const visibleCategories = categories.slice(0, 8);

  return (
    <div style={{ padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 2px 2px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleCategories.map((category) => {
          const categoryId = String(category.id);
          const isActive = activeCategory === categoryId;

          return (
            <button
              key={categoryId}
              onClick={() => onSelectCategory(categoryId)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                minWidth: 102,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 102,
                  height: 102,
                  borderRadius: 26,
                  border: isActive ? '2px solid #ef7db1' : '1.6px solid #cfc8be',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 0 0 5px rgba(239,125,177,0.16), 0 2px 8px rgba(0,0,0,0.03)'
                    : '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <span
                  style={{
                    fontSize: 54,
                    lineHeight: 1,
                  }}
                >
                  {getCategoryVisual(category)}
                </span>
              </div>

              <span
                style={{
                  marginTop: 10,
                  fontSize: 15,
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
