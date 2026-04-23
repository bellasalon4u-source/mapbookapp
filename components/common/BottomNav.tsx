'use client';

import { usePathname, useRouter } from 'next/navigation';

type BottomNavProps = {
  active?: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
};

type NavItem = {
  key: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
  label: string;
  href: string;
  accent?: boolean;
  badge?: number;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={active ? '#55c75f' : '#2c2c2c'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        stroke={active ? '#55c75f' : '#2c2c2c'}
        strokeWidth="1.9"
      />
      <path d="M8 3V8" stroke={active ? '#55c75f' : '#2c2c2c'} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={active ? '#55c75f' : '#2c2c2c'} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={active ? '#55c75f' : '#2c2c2c'} strokeWidth="1.9" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={active ? '#55c75f' : '#2c2c2c'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11.5" r="0.9" fill={active ? '#55c75f' : '#2c2c2c'} />
      <circle cx="12" cy="11.5" r="0.9" fill={active ? '#55c75f' : '#2c2c2c'} />
      <circle cx="15" cy="11.5" r="0.9" fill={active ? '#55c75f' : '#2c2c2c'} />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke={active ? '#55c75f' : '#2c2c2c'} strokeWidth="1.9" />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={active ? '#55c75f' : '#2c2c2c'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="9" stroke={active ? '#55c75f' : '#2c2c2c'} strokeWidth="1.5" />
    </svg>
  );
}

const items: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'bookings', label: 'Bookings', href: '/bookings' },
  { key: 'add', label: 'Add', href: '/profile/promotions/new', accent: true },
  { key: 'messages', label: 'Messages', href: '/messages', badge: 2 },
  { key: 'profile', label: 'Profile', href: '/account' },
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
        maxWidth: 398,
        zIndex: 1200,
      }}
    >
      <div
        style={{
          background: '#f7f4ef',
          border: '1.2px solid #171717',
          borderRadius: 28,
          boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
          padding: '12px 12px 14px',
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
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: '#55c75f',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 42,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxShadow: '0 10px 22px rgba(85,199,95,0.24)',
                    transform: 'translateY(-14px)',
                    border: '1.2px solid rgba(0,0,0,0.10)',
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
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.key === 'home' && <HomeIcon active={isActive} />}
                {item.key === 'bookings' && <CalendarIcon active={isActive} />}
                {item.key === 'messages' && <MessageIcon active={isActive} />}
                {item.key === 'profile' && <ProfileIcon active={isActive} />}
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
                    boxShadow: '0 2px 6px rgba(255,63,127,0.30)',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}

              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 700,
                  color: isActive ? '#55c75f' : '#2c2c2c',
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
