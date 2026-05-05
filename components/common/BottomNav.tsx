'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import {
  getUnreadMessagesCount,
  subscribeToChatStore,
} from '../../services/chatStore';

type BottomNavProps = {
  active?: 'clients' | 'bookings' | 'add' | 'messages' | 'profile';
  onAddClick?: () => void;
};

type NavKey = 'messages' | 'add' | 'bookings' | 'profile' | 'clients';

type NavItem = {
  key: NavKey;
  label: Record<AppLanguage, string>;
  href: string;
  accent?: boolean;
};

const BRAND = {
  green: '#55c75f',
  blue: '#2578ff',
  black: '#171717',
  cream: '#fffdf8',
  border: '#111111',
  pink: '#ff4fa0',
};

const addMenuTexts: Record<
  AppLanguage,
  {
    ad: string;
    service: string;
    deal: string;
    close: string;
  }
> = {
  EN: { ad: 'Ad', service: 'Service', deal: 'Deal', close: 'Close' },
  ES: { ad: 'Anuncio', service: 'Servicio', deal: 'Descuento', close: 'Cerrar' },
  RU: { ad: 'Реклама', service: 'Услуга', deal: 'Скидка', close: 'Закрыть' },
  UA: { ad: 'Реклама', service: 'Послуга', deal: 'Знижка', close: 'Закрити' },
  CZ: { ad: 'Reklama', service: 'Služba', deal: 'Sleva', close: 'Zavřít' },
  DE: { ad: 'Anzeige', service: 'Service', deal: 'Rabatt', close: 'Schließen' },
  IT: { ad: 'Pubblicità', service: 'Servizio', deal: 'Sconto', close: 'Chiudi' },
  FR: { ad: 'Pub', service: 'Service', deal: 'Réduction', close: 'Fermer' },
  AR: { ad: 'إعلان', service: 'خدمة', deal: 'خصم', close: 'إغلاق' },
  PL: { ad: 'Reklama', service: 'Usługa', deal: 'Zniżka', close: 'Zamknij' },
};

const navItems: NavItem[] = [
  {
    key: 'profile',
    href: '/profile',
    label: {
      EN: 'Profile',
      ES: 'Perfil',
      RU: 'Профиль',
      UA: 'Профіль',
      CZ: 'Profil',
      DE: 'Profil',
      IT: 'Profilo',
      FR: 'Profil',
      AR: 'حسابي',
      PL: 'Profil',
    },
  },
  {
    key: 'clients',
    href: '/profile/clients',
    label: {
      EN: 'My clients',
      ES: 'Clientes',
      RU: 'Мои клие...',
      UA: 'Мої кліє...',
      CZ: 'Klienti',
      DE: 'Kunden',
      IT: 'Clienti',
      FR: 'Clients',
      AR: 'عملائي',
      PL: 'Klienci',
    },
  },
  {
    key: 'add',
    href: '/add',
    accent: true,
    label: {
      EN: 'Add',
      ES: 'Añadir',
      RU: 'Добавить',
      UA: 'Додати',
      CZ: 'Přidat',
      DE: 'Plus',
      IT: 'Aggiungi',
      FR: 'Ajouter',
      AR: 'إضافة',
      PL: 'Dodaj',
    },
  },
  {
    key: 'bookings',
    href: '/bookings',
    label: {
      EN: 'Bookings',
      ES: 'Reservas',
      RU: 'Мои брони',
      UA: 'Мої броні',
      CZ: 'Rezervace',
      DE: 'Buchungen',
      IT: 'Prenot.',
      FR: 'Réserv.',
      AR: 'حجوزاتي',
      PL: 'Rezerw.',
    },
  },
  {
    key: 'messages',
    href: '/messages',
    label: {
      EN: 'Messages',
      ES: 'Mensajes',
      RU: 'Сообщения',
      UA: 'Повідомл.',
      CZ: 'Zprávy',
      DE: 'Nachr.',
      IT: 'Messaggi',
      FR: 'Messages',
      AR: 'رسائل',
      PL: 'Wiadom.',
    },
  },
];

function getAddText(language: AppLanguage) {
  return addMenuTexts[language] || addMenuTexts.EN;
}

function getLabel(item: NavItem, language: AppLanguage) {
  return item.label[language] || item.label.EN;
}

function getActiveColor(key: NavKey) {
  if (key === 'bookings') return BRAND.blue;
  return BRAND.green;
}

function CalendarIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.blue : BRAND.black;

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2.4" stroke={color} strokeWidth="2" />
      <path d="M8 3V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 10H20" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth="2" />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClientsIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="7" width="14" height="11" rx="2.4" stroke={color} strokeWidth="2" />
      <path
        d="M9 7V5.8C9 4.8 9.8 4 10.8 4H13.2C14.2 4 15 4.8 15 5.8V7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIcon({ itemKey, active }: { itemKey: NavKey; active: boolean }) {
  if (itemKey === 'bookings') return <CalendarIcon active={active} />;
  if (itemKey === 'messages') return <MessageIcon active={active} />;
  if (itemKey === 'profile') return <ProfileIcon active={active} />;
  if (itemKey === 'clients') return <ClientsIcon active={active} />;
  return null;
}

export default function BottomNav({ active: activeProp, onAddClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldAutoHide =
    pathname === '/profile' ||
    pathname?.startsWith('/profile/') ||
    pathname === '/bookings' ||
    pathname?.startsWith('/bookings/') ||
    pathname?.startsWith('/booking/') ||
    pathname === '/messages' ||
    pathname?.startsWith('/messages/');

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
    const syncUnread = () => {
      try {
        setUnreadMessagesCount(getUnreadMessagesCount());
      } catch {
        setUnreadMessagesCount(0);
      }
    };

    syncUnread();

    const unsubscribe = subscribeToChatStore(syncUnread);

    window.addEventListener('focus', syncUnread);
    window.addEventListener('pageshow', syncUnread);
    window.addEventListener('storage', syncUnread);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', syncUnread);
      window.removeEventListener('pageshow', syncUnread);
      window.removeEventListener('storage', syncUnread);
    };
  }, []);

  const showNavTemporarily = () => {
    setNavVisible(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (shouldAutoHide && !addMenuOpen) {
      hideTimerRef.current = setTimeout(() => {
        setNavVisible(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!shouldAutoHide) {
      setNavVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      return;
    }

    showNavTemporarily();

    window.addEventListener('scroll', showNavTemporarily, { passive: true });
    window.addEventListener('touchstart', showNavTemporarily, { passive: true });
    window.addEventListener('focus', showNavTemporarily);
    window.addEventListener('pageshow', showNavTemporarily);

    return () => {
      window.removeEventListener('scroll', showNavTemporarily);
      window.removeEventListener('touchstart', showNavTemporarily);
      window.removeEventListener('focus', showNavTemporarily);
      window.removeEventListener('pageshow', showNavTemporarily);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [pathname, shouldAutoHide, addMenuOpen]);

  useEffect(() => {
    if (addMenuOpen) {
      setNavVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    } else if (shouldAutoHide) {
      showNavTemporarily();
    }
  }, [addMenuOpen, shouldAutoHide]);

  const addText = useMemo(() => getAddText(language), [language]);

  const shouldShowNav = navVisible || addMenuOpen || !shouldAutoHide;

  const getIsActive = (key: NavKey, href: string) => {
    if (addMenuOpen && key === 'add') return true;

    if (activeProp) {
      return activeProp === key;
    }

    if (key === 'profile') return pathname === '/profile';
    if (key === 'clients') return pathname === '/profile/clients';
    if (key === 'messages') return pathname === '/messages' || pathname?.startsWith('/messages/');

    if (key === 'bookings') {
      return (
        pathname === '/bookings' ||
        pathname?.startsWith('/bookings/') ||
        pathname === '/profile/bookings' ||
        pathname?.startsWith('/profile/bookings/') ||
        pathname?.startsWith('/booking/')
      );
    }

    if (key === 'add') {
      return (
        pathname === '/add' ||
        pathname?.startsWith('/add/') ||
        pathname?.startsWith('/profile/promotions/new') ||
        pathname?.startsWith('/profile/deals/new')
      );
    }

    return pathname?.startsWith(href);
  };

  const openAddRoute = (nextPath: string) => {
    setAddMenuOpen(false);
    router.push(nextPath);
  };

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }

    setAddMenuOpen(true);
  };

  const handleCreateAd = () => {
    openAddRoute('/profile/promotions/new');
  };

  const handleCreateService = () => {
    openAddRoute('/add');
  };

  const handleCreateDeal = () => {
    openAddRoute('/profile/deals/new');
  };

  return (
    <>
      {addMenuOpen ? (
        <div
          onClick={() => setAddMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.38)',
            zIndex: 1190,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 22px 108px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 370,
              background: '#ffffff',
              border: `3px solid ${BRAND.border}`,
              borderRadius: 26,
              overflow: 'hidden',
              boxShadow: '0 20px 44px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: `3px solid ${BRAND.border}`,
              }}
            >
              <button
                type="button"
                onClick={handleCreateAd}
                style={addTileStyle('#ffe44d', BRAND.black, true)}
              >
                <span style={{ fontSize: 32 }}>📣</span>
                <span>{addText.ad}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={addTileStyle('#41c83f', '#ffffff', true)}
              >
                <span style={{ fontSize: 38, lineHeight: 1 }}>+</span>
                <span>{addText.service}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateDeal}
                style={addTileStyle('#ff4b52', '#ffffff', false)}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    minWidth: 38,
                    height: 28,
                    borderRadius: 999,
                    border: `3px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: '#ff4b52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  £1
                </span>
                <span style={{ fontSize: 38, lineHeight: 1 }}>%</span>
                <span>{addText.deal}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                minHeight: 54,
                border: 'none',
                background: '#ffffff',
                color: BRAND.black,
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              × {addText.close}
            </button>
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'calc(16px + env(safe-area-inset-bottom))',
          transform: shouldShowNav
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(118px)',
          opacity: shouldShowNav ? 1 : 0,
          width: 'calc(100% - 54px)',
          maxWidth: 360,
          zIndex: 1200,
          pointerEvents: shouldShowNav ? 'auto' : 'none',
          transition: 'transform 0.34s ease, opacity 0.22s ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 76,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: BRAND.cream,
              border: `3px solid ${BRAND.border}`,
              borderRadius: 32,
              boxShadow: '0 12px 26px rgba(17,17,17,0.10)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              alignItems: 'center',
              padding: '9px 8px 6px',
              boxSizing: 'border-box',
              zIndex: 2,
              overflow: 'visible',
            }}
          >
            {navItems.map((item) => {
              const isActive = getIsActive(item.key, item.href);
              const label = getLabel(item, language);
              const activeColor = getActiveColor(item.key);
              const badge =
                item.key === 'messages' && unreadMessagesCount > 0 ? unreadMessagesCount : 0;

              if (item.accent) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={handleAddClick}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      position: 'relative',
                      zIndex: 20,
                      height: 76,
                      minWidth: 0,
                      overflow: 'visible',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: -29,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        background: BRAND.cream,
                        border: `3px solid ${BRAND.border}`,
                        boxSizing: 'border-box',
                        zIndex: 21,
                        boxShadow: '0 8px 20px rgba(17,17,17,0.08)',
                      }}
                    />

                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 92,
                        height: 35,
                        background: BRAND.cream,
                        zIndex: 22,
                        pointerEvents: 'none',
                      }}
                    />

                    <span
                      style={{
                        position: 'relative',
                        zIndex: 30,
                        width: 62,
                        height: 62,
                        borderRadius: '50%',
                        background: BRAND.green,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        fontWeight: 900,
                        lineHeight: 1,
                        border: '3px solid #ffffff',
                        boxShadow: '0 12px 24px rgba(85,199,95,0.34)',
                        transform: 'translateY(-22px)',
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>

                    <span
                      title={label}
                      style={{
                        position: 'relative',
                        zIndex: 31,
                        marginTop: -19,
                        width: '100%',
                        maxWidth: 72,
                        display: 'block',
                        textAlign: 'center',
                        fontSize: language === 'RU' || language === 'UA' ? 10 : 11,
                        fontWeight: 900,
                        color: isActive ? activeColor : BRAND.black,
                        lineHeight: 1.05,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
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
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    position: 'relative',
                    minWidth: 0,
                    zIndex: 8,
                  }}
                >
                  <span
                    style={{
                      height: 28,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <NavIcon itemKey={item.key} active={isActive} />
                  </span>

                  {badge > 0 ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: -1,
                        right: '14%',
                        minWidth: 21,
                        height: 21,
                        padding: '0 5px',
                        borderRadius: 999,
                        background: BRAND.pink,
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}

                  <span
                    title={label}
                    style={{
                      width: '100%',
                      maxWidth: 66,
                      display: 'block',
                      textAlign: 'center',
                      fontSize:
                        language === 'RU' ||
                        language === 'UA' ||
                        language === 'DE' ||
                        language === 'IT' ||
                        language === 'FR'
                          ? 10
                          : 11,
                      fontWeight: 900,
                      color: isActive ? activeColor : BRAND.black,
                      lineHeight: 1.05,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function addTileStyle(bg: string, color: string, withRightBorder: boolean): CSSProperties {
  return {
    minHeight: 104,
    border: 'none',
    borderRight: withRightBorder ? `3px solid ${BRAND.border}` : 'none',
    background: bg,
    color,
    fontSize: 16,
    fontWeight: 900,
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  };
}
