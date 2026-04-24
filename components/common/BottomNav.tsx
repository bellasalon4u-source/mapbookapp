'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type BottomNavProps = {
  active?: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
};

type NavItem = {
  key: 'home' | 'bookings' | 'add' | 'messages' | 'profile';
  label: string;
  href: string;
  badge?: number;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'messages', label: 'Messages', href: '/messages', badge: 2 },
  { key: 'add', label: 'Add', href: '/profile/promotions/new' },
  { key: 'bookings', label: 'Bookings', href: '/bookings' },
  { key: 'profile', label: 'Profile', href: '/account' },
];

function getLanguageAccent(language: AppLanguage) {
  if (language === 'RU') return '#1d5fd6';
  if (language === 'UA') return '#1d5fd6';
  if (language === 'CZ') return '#d7141a';
  if (language === 'PL') return '#dc143c';
  if (language === 'DE') return '#ffcc00';
  if (language === 'ES') return '#c60b1e';
  if (language === 'IT') return '#009246';
  if (language === 'FR') return '#0055a4';
  if (language === 'AR') return '#007a3d';
  return '#55c75f';
}

function HomeIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
      />
      <path
        d="M8 3V8"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M16 3V8"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M4 10H20"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ProfileIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
      />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={active ? color : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  const showTimerRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  const accentColor = getLanguageAccent(language);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const showTemporarily = () => {
      if (addMenuOpen) return;

      setHidden(false);

      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
      }

      showTimerRef.current = window.setTimeout(() => {
        setHidden(true);
      }, 2200);
    };

    const handleScroll = () => {
      if (addMenuOpen) return;

      const currentY = window.scrollY || 0;
      const diff = Math.abs(currentY - lastScrollYRef.current);

      if (diff < 5) return;

      showTemporarily();
      lastScrollYRef.current = currentY;
    };

    const handleWheel = () => {
      if (addMenuOpen) return;
      showTemporarily();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (addMenuOpen) return;

      const target = event.target as HTMLElement | null;

      const isMapTouch =
        target?.closest?.('.leaflet-container') ||
        target?.closest?.('.leaflet-pane') ||
        target?.closest?.('.leaflet-control-container');

      if (isMapTouch) {
        setHidden(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);

      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, [addMenuOpen]);

  useEffect(() => {
    if (addMenuOpen) {
      setHidden(false);
    }
  }, [addMenuOpen]);

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/account') return pathname === '/account' || pathname?.startsWith('/profile');
    if (key === 'add') return pathname?.startsWith('/profile/promotions/new') || pathname?.startsWith('/add');

    return pathname?.startsWith(href);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.key === 'add') {
      setAddMenuOpen(true);
      return;
    }

    router.push(item.href);
  };

  const handleCreateAd = () => {
    setAddMenuOpen(false);
    router.push('/profile/promotions/new');
  };

  const handleCreateService = () => {
    setAddMenuOpen(false);
    router.push('/add');
  };

  const handleCreateDeal = () => {
    setAddMenuOpen(false);
    router.push('/profile/deals/new');
  };

  return (
    <>
      {addMenuOpen ? (
        <div
          onClick={() => setAddMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.42)',
            zIndex: 1190,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 26px 158px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 390,
              background: '#ffffff',
              border: '3px solid #111111',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 44px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: '3px solid #111111',
              }}
            >
              <button
                type="button"
                onClick={handleCreateAd}
                style={{
                  minHeight: 128,
                  border: 'none',
                  borderRight: '3px solid #111111',
                  background: '#ffe44d',
                  color: '#17130f',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 34 }}>📣</span>
                <span>Реклама</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={{
                  minHeight: 128,
                  border: 'none',
                  borderRight: '3px solid #111111',
                  background: '#41c83f',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 40, lineHeight: 1 }}>+</span>
                <span>Услуга</span>
              </button>

              <button
                type="button"
                onClick={handleCreateDeal}
                style={{
                  minHeight: 128,
                  border: 'none',
                  background: '#ff4b52',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    minWidth: 48,
                    height: 34,
                    borderRadius: 999,
                    border: '3px solid #111111',
                    background: '#ffffff',
                    color: '#ff4b52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  £1
                </span>
                <span style={{ fontSize: 42, lineHeight: 1 }}>%</span>
                <span>Скидка</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                minHeight: 64,
                border: 'none',
                background: '#ffffff',
                color: '#17130f',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              × Закрыть
            </button>
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'calc(8px + env(safe-area-inset-bottom))',
          transform: hidden ? 'translate(-50%, 76px)' : 'translate(-50%, 0)',
          width: 'calc(100% - 64px)',
          maxWidth: 326,
          zIndex: 1200,
          opacity: hidden ? 0.96 : 1,
          pointerEvents: hidden ? 'none' : 'auto',
          transition: 'transform 240ms ease, opacity 180ms ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#fffefa',
            border: '2px solid #111111',
            borderRadius: 26,
            boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
            padding: '6px 8px 6px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'end',
            gap: 2,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -22,
              transform: 'translateX(-50%)',
              width: 86,
              height: 44,
              background: '#fffefa',
              border: '2px solid #111111',
              borderBottom: 'none',
              borderRadius: '80px 80px 0 0',
              zIndex: 0,
            }}
          />

          {navItems.map((item) => {
            const isActive = getIsActive(item.key, item.href);
            const isAdd = item.key === 'add';

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 3,
                  position: 'relative',
                  minHeight: 48,
                  zIndex: 2,
                }}
              >
                {isAdd ? (
                  <span
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: '#55c75f',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 34,
                      fontWeight: 600,
                      lineHeight: 1,
                      boxShadow: '0 8px 20px rgba(85,199,95,0.24)',
                      transform: 'translateY(-15px)',
                    }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    style={{
                      width: 38,
                      height: 34,
                      borderRadius: 14,
                      background: isActive ? `${accentColor}22` : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.key === 'home' && <HomeIcon active={isActive} color={accentColor} />}
                    {item.key === 'messages' && (
                      <MessageIcon active={isActive} color={accentColor} />
                    )}
                    {item.key === 'bookings' && (
                      <CalendarIcon active={isActive} color={accentColor} />
                    )}
                    {item.key === 'profile' && (
                      <ProfileIcon active={isActive} color={accentColor} />
                    )}
                  </span>
                )}

                {typeof item.badge === 'number' ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: '16%',
                      minWidth: 20,
                      height: 20,
                      padding: '0 5px',
                      borderRadius: 999,
                      background: '#ff4fa0',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 8px rgba(255,79,160,0.26)',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}

                <span
                  style={{
                    marginTop: isAdd ? -15 : 0,
                    fontSize: 11,
                    fontWeight: 900,
                    color: isActive ? accentColor : '#202020',
                    lineHeight: 1.05,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
