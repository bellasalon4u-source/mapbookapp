'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

function getLanguageAccent(language: AppLanguage) {
  if (language === 'RU') return { primary: '#ffffff', secondary: '#1d4ed8', third: '#ef4444' };
  if (language === 'UA') return { primary: '#1d4ed8', secondary: '#facc15', third: '#1d4ed8' };
  if (language === 'CZ') return { primary: '#1d4ed8', secondary: '#ef4444', third: '#ffffff' };
  if (language === 'DE') return { primary: '#111111', secondary: '#ef4444', third: '#facc15' };
  if (language === 'PL') return { primary: '#ffffff', secondary: '#ef4444', third: '#ef4444' };
  if (language === 'ES') return { primary: '#ef4444', secondary: '#facc15', third: '#ef4444' };
  if (language === 'FR') return { primary: '#1d4ed8', secondary: '#ffffff', third: '#ef4444' };
  if (language === 'IT') return { primary: '#16a34a', secondary: '#ffffff', third: '#ef4444' };
  if (language === 'AR') return { primary: '#111111', secondary: '#16a34a', third: '#ef4444' };

  return { primary: '#1d4ed8', secondary: '#ef4444', third: '#1d4ed8' };
}

function activeGradient(language: AppLanguage) {
  const accent = getLanguageAccent(language);

  return `linear-gradient(135deg, ${accent.primary} 0%, ${accent.primary} 33%, ${accent.secondary} 33%, ${accent.secondary} 66%, ${accent.third} 66%, ${accent.third} 100%)`;
}

function activeColor(language: AppLanguage) {
  const accent = getLanguageAccent(language);
  return accent.third === '#ffffff' ? accent.secondary : accent.third;
}

function iconStroke(active: boolean, language: AppLanguage) {
  return active ? activeColor(language) : '#202020';
}

function HomeIcon({ active, language }: { active: boolean; language: AppLanguage }) {
  const color = iconStroke(active, language);

  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({ active, language }: { active: boolean; language: AppLanguage }) {
  const color = iconStroke(active, language);

  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active, language }: { active: boolean; language: AppLanguage }) {
  const color = iconStroke(active, language);

  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2" stroke={color} strokeWidth="1.9" />
      <path d="M8 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}

function ProfileIcon({ active, language }: { active: boolean; language: AppLanguage }) {
  const color = iconStroke(active, language);

  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth="1.9" />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'messages', label: 'Messages', href: '/messages', badge: 2 },
  { key: 'add', label: 'Add', href: '/profile/promotions/new' },
  { key: 'bookings', label: 'Bookings', href: '/bookings' },
  { key: 'profile', label: 'Profile', href: '/account' },
];

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [hidden, setHidden] = useState(false);

  const lastScrollYRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);

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
    if (typeof window === 'undefined') return;

    const showSoon = () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
      }

      showTimerRef.current = window.setTimeout(() => {
        setHidden(false);
      }, 650);
    };

    const handleScroll = () => {
      if (addMenuOpen) return;

      const currentY = window.scrollY || 0;
      const diff = currentY - lastScrollYRef.current;

      if (Math.abs(diff) < 6) return;

      if (diff > 0) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollYRef.current = currentY;
      showSoon();
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

    const handlePointerUp = () => {
      if (addMenuOpen) return;
      showSoon();
    };

    const handleWheel = (event: WheelEvent) => {
      if (addMenuOpen) return;

      if (event.deltaY > 0) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      showSoon();
    };

    lastScrollYRef.current = window.scrollY || 0;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('touchend', handlePointerUp, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);

      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, [addMenuOpen]);

  const accent = useMemo(() => {
    return {
      gradient: activeGradient(language),
      color: activeColor(language),
    };
  }, [language]);

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/account') return pathname === '/account' || pathname?.startsWith('/profile');
    if (key === 'add') return pathname?.startsWith('/profile/promotions/new') || pathname?.startsWith('/add');
    return pathname?.startsWith(href);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.key === 'add') {
      setHidden(false);
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
            padding: '0 26px 132px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 382,
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
                  minHeight: 118,
                  border: 'none',
                  borderRight: '3px solid #111111',
                  background: '#ffe44d',
                  color: '#17130f',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 32 }}>📣</span>
                <span>Реклама</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={{
                  minHeight: 118,
                  border: 'none',
                  borderRight: '3px solid #111111',
                  background: '#41c83f',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 38, lineHeight: 1 }}>+</span>
                <span>Услуга</span>
              </button>

              <button
                type="button"
                onClick={handleCreateDeal}
                style={{
                  minHeight: 118,
                  border: 'none',
                  background: '#ff4b52',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    minWidth: 44,
                    height: 31,
                    borderRadius: 999,
                    border: '3px solid #111111',
                    background: '#ffffff',
                    color: '#ff4b52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 900,
                  }}
                >
                  £1
                </span>
                <span style={{ fontSize: 40, lineHeight: 1 }}>%</span>
                <span>Скидка</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                minHeight: 58,
                border: 'none',
                background: '#ffffff',
                color: '#17130f',
                fontSize: 19,
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
          bottom: 'calc(14px + env(safe-area-inset-bottom))',
          transform: hidden ? 'translate(-50%, 92px)' : 'translate(-50%, 0)',
          width: 'calc(100% - 54px)',
          maxWidth: 342,
          zIndex: 1200,
          opacity: hidden ? 0.04 : 1,
          pointerEvents: hidden ? 'none' : 'auto',
          transition: 'transform 220ms ease, opacity 180ms ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#fffefa',
            border: '2px solid #111111',
            borderRadius: 24,
            boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
            padding: '7px 9px 7px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'end',
            gap: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -20,
              transform: 'translateX(-50%)',
              width: 80,
              height: 43,
              background: '#fffefa',
              border: '2px solid #111111',
              borderBottom: 'none',
              borderRadius: '70px 70px 0 0',
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
                  minHeight: 51,
                  zIndex: 2,
                }}
              >
                {isAdd ? (
                  <span
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: '50%',
                      background: '#55c75f',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                      fontWeight: 500,
                      lineHeight: 1,
                      boxShadow: '0 9px 20px rgba(85,199,95,0.25)',
                      transform: 'translateY(-17px)',
                    }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    style={{
                      width: 38,
                      height: 31,
                      borderRadius: 15,
                      background: isActive ? accent.gradient : 'transparent',
                      border: isActive ? '1.5px solid #111111' : '1.5px solid transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 4px 10px rgba(17,17,17,0.10)' : 'none',
                    }}
                  >
                    {item.key === 'home' && <HomeIcon active={isActive} language={language} />}
                    {item.key === 'messages' && <MessageIcon active={isActive} language={language} />}
                    {item.key === 'bookings' && <CalendarIcon active={isActive} language={language} />}
                    {item.key === 'profile' && <ProfileIcon active={isActive} language={language} />}
                  </span>
                )}

                {typeof item.badge === 'number' ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: '13%',
                      minWidth: 20,
                      height: 20,
                      padding: '0 6px',
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
                    marginTop: isAdd ? -16 : 0,
                    fontSize: 11,
                    fontWeight: 900,
                    color: isActive ? accent.color : '#202020',
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
