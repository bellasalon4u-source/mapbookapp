'use client';

type TopCategoriesBarProps = {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
};

const items = [
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'wellness', label: 'Wellness', icon: '🍃' },
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'repairs', label: 'Repairs', icon: '🛠️' },
  { id: 'tech', label: 'Tech', icon: '📱' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
  { id: 'auto', label: 'Auto', icon: '🚗' },
  { id: 'moving', label: 'Moving', icon: '📦' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'activities', label: 'Activities', icon: '🎨' },
  { id: 'creative', label: 'Creative', icon: '🎬' },
];

export default function TopCategoriesBar({
  activeCategory,
  onSelectCategory,
}: TopCategoriesBarProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 1fr',
        alignItems: 'start',
        gap: 8,
        padding: '0 10px',
      }}
    >
      <div
        style={{
          position: 'sticky',
          left: 0,
          zIndex: 3,
          background: '#f5f3ef',
          paddingLeft: 2,
        }}
      >
        <button
          onClick={() => onSelectCategory('more')}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            minWidth: 64,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#f6efe1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#253140',
              fontWeight: 900,
            }}
          >
            ⋮
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#253140',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            More
          </div>

          <div
            style={{
              width: 42,
              height: 6,
              borderRadius: 999,
              background: 'transparent',
            }}
          />
        </button>
      </div>

      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            minWidth: 'max-content',
            paddingRight: 10,
          }}
        >
          {items.map((item) => {
            const active = activeCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 72,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: active ? '#f6efe1' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 800 : 700,
                    color: '#253140',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    width: 42,
                    height: 6,
                    borderRadius: 999,
                    background: active ? '#eb7d96' : 'transparent',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
