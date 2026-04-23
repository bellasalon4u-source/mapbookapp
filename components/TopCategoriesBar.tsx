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

function getCategoryImage(category: any) {
  const id = String(category?.id || '').toLowerCase();

  const directCandidates = [
    category?.image,
    category?.iconImage,
    category?.imageUrl,
    category?.iconUrl,
    category?.photo,
    category?.thumbnail,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  const fallbackMap: Record<string, string> = {
    more: 'https://img.icons8.com/fluency/240/four-squares.png',
    beauty: 'https://img.icons8.com/fluency/240/vanity.png',
    barber: 'https://img.icons8.com/fluency/240/barbershop.png',
    wellness: 'https://img.icons8.com/fluency/240/lotus.png',
    home: 'https://img.icons8.com/fluency/240/home.png',
    repairs: 'https://img.icons8.com/fluency/240/maintenance.png',
    tech: 'https://img.icons8.com/fluency/240/maintenance.png',
    pets: 'https://img.icons8.com/fluency/240/dog.png',
    fitness: 'https://img.icons8.com/fluency/240/dumbbell.png',
    fashion: 'https://img.icons8.com/fluency/240/handbag.png',
    auto: 'https://img.icons8.com/fluency/240/car.png',
    moving: 'https://img.icons8.com/fluency/240/cardboard-box.png',
    education: 'https://img.icons8.com/fluency/240/graduation-cap.png',
    events: 'https://img.icons8.com/fluency/240/confetti.png',
    activities: 'https://img.icons8.com/fluency/240/goal.png',
    creative: 'https://img.icons8.com/fluency/240/paint-palette.png',
  };

  return fallbackMap[id] || 'https://img.icons8.com/fluency/240/star.png';
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
          gap: 14,
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
          const imageSrc = getCategoryImage(category);

          return (
            <button
              key={categoryId}
              onClick={() => onSelectCategory(categoryId)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                minWidth: 90,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 24,
                  border: isActive ? '2px solid #ef7db1' : '1.5px solid #cfc8be',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 0 0 5px rgba(239,125,177,0.16), 0 2px 8px rgba(0,0,0,0.03)'
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={imageSrc}
                  alt={getCategoryLabel(category, language)}
                  style={{
                    width: '74%',
                    height: '74%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <span
                style={{
                  marginTop: 10,
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
