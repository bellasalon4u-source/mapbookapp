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

type DisplayCategory = {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  image: string;
  isMore?: boolean;
};

function getCategoryLabel(category: DisplayCategory, language: AppLanguage) {
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', UA: 'Ще', CZ: 'Více', DE: 'Mehr', PL: 'Więcej' },
    beauty: { EN: 'Beauty', ES: 'Beauty', RU: 'Красота', UA: 'Краса', CZ: 'Beauty', DE: 'Beauty', PL: 'Beauty' },
    barber: { EN: 'Barber', ES: 'Barber', RU: 'Барбер', UA: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber' },
    wellness: { EN: 'Wellness', ES: 'Wellness', RU: 'Велнес', UA: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness' },
    home: { EN: 'Home', ES: 'Home', RU: 'Дом', UA: 'Дім', CZ: 'Home', DE: 'Home', PL: 'Home' },
    repairs: { EN: 'Repairs', ES: 'Repairs', RU: 'Ремонт', UA: 'Ремонт', CZ: 'Repairs', DE: 'Repairs', PL: 'Repairs' },
    pets: { EN: 'Pets', ES: 'Pets', RU: 'Питомцы', UA: 'Тварини', CZ: 'Pets', DE: 'Pets', PL: 'Pets' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', UA: 'Фітнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness' },
  };

  return map[String(category.id || '').toLowerCase()]?.[language] || category.shortLabel || category.label;
}

function getDisplayCategories(): DisplayCategory[] {
  const byId = new Map(categories.map((item) => [item.id, item]));

  const orderedIds = ['beauty', 'barber', 'wellness', 'home', 'repairs', 'pets', 'fitness'];

  const result: DisplayCategory[] = [
    {
      id: 'more',
      label: 'More',
      image: '/ui/categories/more.png',
      isMore: true,
    },
  ];

  orderedIds.forEach((id) => {
    const item = byId.get(id as any);
    if (!item) return;

    result.push({
      id: item.id,
      label: item.label,
      shortLabel: item.shortLabel,
      icon: item.icon,
      image: `/ui/categories/${item.id}.png`,
    });
  });

  return result;
}

export default function TopCategoriesBar({
  activeCategory,
  language,
  onSelectCategory,
}: TopCategoriesBarProps) {
  const visibleCategories = getDisplayCategories();

  return (
    <div style={{ padding: '0 12px' }}>
      <div
        style={{
          display: 'flex',
          gap: 10,
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
          const isActive = !category.isMore && activeCategory === categoryId;
          const label = getCategoryLabel(category, language);

          return (
            <button
              key={categoryId}
              onClick={() => {
                if (category.isMore) return;
                onSelectCategory(categoryId);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: category.isMore ? 'default' : 'pointer',
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
                  src={category.image}
                  alt={label}
                  style={{
                    width: '76%',
                    height: '76%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <span
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: isActive ? 900 : 700,
                  color: '#1f2937',
                  textAlign: 'center',
                  lineHeight: 1.15,
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
