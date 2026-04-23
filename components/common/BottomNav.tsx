'use client';

import { usePathname, useRouter } from 'next/navigation';

type BottomNavProps = {
  active?: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
};

const items = [
  { key: 'home', label: 'Home', icon: '⌂', href: '/' },
  { key: 'bookings', label: 'Bookings', icon: '◫', href: '/bookings' },
  { key: 'add', label: 'Add', icon: '+', href: '/profile/promotions/new', accent: true },
  { key: 'messages', label: 'Messages', icon: '◌', href: '/messages', badge: 2 },
  { key: 'profile', label: 'Profile', icon: '◎', href: '/account' },
] as const;

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/account') return pathname === '/account' || pathname === '/profile';
    return pathname?.startsWith(href);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 14,
        transform: 'translateX(-50%)',
        width: 'calc(100% - 28px)',
        maxWidth: 402,
        zIndex: 1200,
      }}
    >
      <div
        style={{
          background: '#f7f4ef',
          border: '1.2px solid #e2ddd7',
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
          const active = getIsActive(item.key, item.href);

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
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: '#4fc15a',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxShadow: '0 8px 18px rgba(79,193,90,0.35)',
                    transform: 'translateY(-12px)',
                  }}
                >
                  +
                </span>
                <span
                  style={{
                    marginTop: -8,
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
                  color: active ? '#4fc15a' : '#5b5b5b',
                  fontWeight: active ? 800 : 500,
                }}
              >
                {item.icon}
              </span>

              {item.badge ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '24%',
                    minWidth: 18,
                    height: 18,
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
                  fontSize: 12,
                  fontWeight: active ? 800 : 700,
                  color: active ? '#4fc15a' : '#303030',
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
