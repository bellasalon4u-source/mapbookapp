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
  { key: 'beauty', label: 'Beauty', icon: '✂️' },
  { key: 'wellness', label: 'Wellness', icon: '🧘' },
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'repairs', label: 'Repairs', icon: '🔧' },
  { key: 'tech', label: 'Tech', icon: '💻' },
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
        padding: '4px 0 2px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 14,
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
                minWidth: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  background: active ? '#f7efdf' : 'transparent',
                  border: active ? '1px solid #f1dfbf' : '1px solid transparent',
                  boxShadow: active ? '0 6px 16px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 31,
                  transition: 'all 0.18s ease',
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: active ? 800 : 700,
                  color: '#243042',
                  lineHeight: 1.1,
                  textAlign: 'center',
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  width: active ? 38 : 0,
                  height: 5,
                  borderRadius: 999,
                  background: '#ea7e9b',
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
