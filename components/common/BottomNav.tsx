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
  { key: 'bookings', label: 'Bookings', icon: '◫', href: '/bookings' },
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
        bottom: 16,
        transform: 'translateX(-50%)',
        width: 'calc(100% - 28px)',
        maxWidth: 402,
        zIndex: 1200,
      }}
    >
      <div
        style={{
          background: '#f7f4ef',
          border: '1.2px solid #ddd6cb',
          borderRadius: 24,
          boxShadow: '0 8px 28px rgba(15,23,42,0.10)',
          padding: '10px 12px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'end',
          gap: 8,
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
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#51c35d',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 42,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxShadow: '0 10px 24px rgba(79,193,90,0.30)',
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
                gap: 6,
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  color: isActive ? '#51c35d' : '#3f3f3f',
                  fontWeight: isActive ? 800 : 500,
                }}
              >
                {item.icon}
              </span>

              {typeof item.badge === 'number' ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '20%',
                    minWidth: 20,
                    height: 20,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#ff3f7f',
                    color: '#ffffff',
                    fontSize: 11,
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
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 700,
                  color: isActive ? '#51c35d' : '#303030',
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
