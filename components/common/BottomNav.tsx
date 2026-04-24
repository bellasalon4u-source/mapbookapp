'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type BottomNavProps = {
  active?: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
};

type NavItem = {
  key: 'home' | 'messages' | 'add' | 'bookings' | 'profile';
  label: string;
  href: string;
  accent?: boolean;
  badge?: number;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={active ? '#55c75f' : '#222222'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        stroke={active ? '#55c75f' : '#222222'}
        strokeWidth="1.9"
      />
      <path d="M8 3V8" stroke={active ? '#55c75f' : '#222222'} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={active ? '#55c75f' : '#222222'} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={active ? '#55c75f' : '#222222'} strokeWidth="1.9" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={active ? '#55c75f' : '#222222'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke={active ? '#55c75f' : '#222222'} strokeWidth="1.9" />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={active ? '#55c75f' : '#222222'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

const items: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'messages', label: 'Messages', href: '/messages', badge: 2 },
  { key: 'add', label: 'Add', href: '#', accent: true },
  { key: 'bookings', label: 'Bookings', href: '/bookings' },
  { key: 'profile', label: 'Profile', href: '/account' },
];

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/account') return pathname === '/account' || pathname?.startsWith('/profile');
    return pathname?.startsWith(href);
  };

  const openRoute = (href: string) => {
    setAddMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 18,
          transform: 'translateX(-50%)',
          width: 'calc(100% - 34px)',
          maxWidth: 398,
          zIndex: 1200,
        }}
      >
        <div
          style={{
            background: '#f7f4ef',
            border: '1.6px solid #171717',
            borderRadius: 30,
            boxShadow: '0 8px 18px rgba(15,23,42,0.08)',
            padding: '11px 12px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'end',
            gap: 2,
          }}
        >
          {items.map((item) => {
            const isActive = getIsActive(item.key, item.href);

            if (item.accent) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setAddMenuOpen(true)}
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
                      width: 66,
                      height: 66,
                      borderRadius: '50%',
                      background: '#55c75f',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 500,
                      lineHeight: 1,
                      boxShadow: '0 8px 16px rgba(85,199,95,0.22)',
                      transform: 'translateY(-15px)',
                    }}
                  >
                    +
                  </span>

                  <span
                    style={{
                      marginTop: -12,
                      fontSize: 11,
                      fontWeight: 800,
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
                type="button"
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
                  gap: 5,
                  position: 'relative',
                  minHeight: 62,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.key === 'home' && <HomeIcon active={isActive} />}
                  {item.key === 'messages' && <MessageIcon active={isActive} />}
                  {item.key === 'bookings' && <CalendarIcon active={isActive} />}
                  {item.key === 'profile' && <ProfileIcon active={isActive} />}
                </span>

                {typeof item.badge === 'number' ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: '20%',
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
                      boxShadow: '0 2px 5px rgba(255,63,127,0.24)',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 900 : 800,
                    color: isActive ? '#55c75f' : '#222222',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {addMenuOpen ? (
        <div
          onClick={() => setAddMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.28)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 14px calc(106px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 398,
              borderRadius: 28,
              border: '2px solid #111111',
              background: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 18px 40px rgba(0,0,0,0.24)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
              }}
            >
              <button
                type="button"
                onClick={() => openRoute('/profile/promotions/new')}
                style={{
                  minHeight: 116,
                  border: 'none',
                  borderRight: '2px solid #111111',
                  background: '#ffe44d',
                  color: '#17130f',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 34, lineHeight: 1 }}>📣</span>
                <span>Реклама</span>
              </button>

              <button
                type="button"
                onClick={() => openRoute('/add')}
                style={{
                  minHeight: 116,
                  border: 'none',
                  borderRight: '2px solid #111111',
                  background: '#45c63d',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 0.9 }}>+</span>
                <span>Услуга</span>
              </button>

              <button
                type="button"
                onClick={() => openRoute('/profile/deals/new')}
                style={{
                  minHeight: 116,
                  border: 'none',
                  background: '#ff4f55',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 10,
                    height: 28,
                    minWidth: 42,
                    padding: '0 8px',
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    color: '#ff4f55',
                    fontSize: 13,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  £1
                </span>
                <span style={{ fontSize: 42, lineHeight: 0.9 }}>%</span>
                <span>Скидка</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                height: 62,
                border: 'none',
                borderTop: '2px solid #111111',
                background: '#ffffff',
                color: '#17130f',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              × Закрыть
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
