'use client';

type CategoryKey =
  | 'beauty'
  | 'wellness'
  | 'home'
  | 'repairs'
  | 'tech'
  | 'pets'
  | 'more';

type TopCategoriesBarProps = {
  activeCategory: string;
  onSelectCategory: (category: CategoryKey) => void;
};

const categories: {
  key: CategoryKey;
  label: string;
  icon: string;
}[] = [
  { key: 'beauty', label: 'Beauty', icon: '💄' },
  { key: 'wellness', label: 'Wellness', icon: '🍃' },
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'repairs', label: 'Repairs', icon: '🛠️' },
  { key: 'tech', label: 'Tech', icon: '📱' },
  { key: 'pets', label: 'Pets', icon: '🐾' },
  { key: 'more', label: 'More', icon: '⋯' },
];

export default function TopCategoriesBar({
  activeCategory,
  onSelectCategory,
}: TopCategoriesBarProps) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        padding: '0 0 6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '0 16px',
          minWidth: 'max-content',
          alignItems: 'flex-start',
        }}
      >
        {categories.map((item) => {
          const active = activeCategory === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectCategory(item.key)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                minWidth: item.key === 'more' ? 44 : 72,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: active ? '#f7efdf' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: item.key === 'more' ? 30 : 31,
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#253140',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  minHeight: 14,
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  width: active ? 40 : 0,
                  height: 5,
                  borderRadius: 999,
                  background: '#eb7d96',
                  transition: 'all 0.18s ease',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
