'use client';

import { usePathname, useRouter } from 'next/navigation';

type BottomNavProps = {
  active?: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
};

type NavItem = {
  key: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
  label: string;
  icon: string;
  href: string;
  accent?: boolean;
  badge?: number;
};

const items: NavItem[] = [
  { key: 'home', label: 'Home', icon: '⌂', href: '/' },
  { key: 'bookings', label: 'Bookings', icon: '⌑', href: '/bookings' },
  { key: 'add', label: 'Add', icon: '+', href: '/profile/promotions/new', accent: true },
  { key: 'messages', label: 'Messages', icon: '◌', href: '/messages', badge: 2 },
  { key: 'profile', label: 'Profile', icon: '◎', href: '/account' },
];

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/account') return pathname === '/account' || pathname?.startsWith('/profile');
    return pathname?.startsWith(href);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 14,
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 404,
        zIndex: 1200,
      }}
    >
      <div
        style={{
          background: '#f7f4ef',
          border: '1.2px solid #ddd6cb',
          borderRadius: 26,
          boxShadow: '0 8px 26px rgba(15,23,42,0.10)',
          padding: '10px 10px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'end',
          gap: 4,
        }}
      >
        {items.map((item) => {
          const isActive = getIsActive(item.key, item.href);

          if (item.accent) {
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: '#55c75f',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxShadow: '0 10px 22px rgba(85,199,95,0.28)',
                    transform: 'translateY(-14px)',
                  }}
                >
                  +
                </span>

                <span
                  style={{
                    marginTop: -10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#202020',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
                position: 'relative',
                minHeight: 62,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  color: isActive ? '#55c75f' : '#4a4a4a',
                  fontWeight: isActive ? 800 : 500,
                }}
              >
                {item.icon}
              </span>

              {typeof item.badge === 'number' ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: '18%',
                    minWidth: 19,
                    height: 19,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#ff3f7f',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(255,63,127,0.35)',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}

              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 700,
                  color: isActive ? '#55c75f' : '#303030',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
