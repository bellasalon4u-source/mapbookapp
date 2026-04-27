'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
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
  active?: 'home' | 'clients' | 'bookings' | 'add' | 'messages' | 'profile';
  onAddClick?: () => void;
};

type NavKey = 'home' | 'messages' | 'add' | 'bookings' | 'profile' | 'clients';

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

const publicItems: NavItem[] = [
  {
    key: 'home',
    href: '/',
    label: {
      EN: 'Home',
      ES: 'Inicio',
      RU: 'Главная',
      UA: 'Головна',
      CZ: 'Domů',
      DE: 'Home',
      IT: 'Home',
      FR: 'Accueil',
      AR: 'الرئيسية',
      PL: 'Home',
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
      RU: 'Брони',
      UA: 'Броні',
      CZ: 'Rezervace',
      DE: 'Buchungen',
      IT: 'Prenot.',
      FR: 'Réserv.',
      AR: 'حجوزات',
      PL: 'Rezerw.',
    },
  },
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
];

const profileItems: NavItem[] = [
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
    href: '/profile/bookings',
    label: {
      EN: 'My bookings',
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

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.blue : BRAND.black;

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2.4" stroke={color} strokeWidth="1.9" />
      <path d="M8 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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

function ClientsIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="7" width="14" height="11" rx="2.4" stroke={color} strokeWidth="1.9" />
      <path
        d="M9 7V5.8C9 4.8 9.8 4 10.8 4H13.2C14.2 4 15 4.8 15 5.8V7"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIcon({ itemKey, active }: { itemKey: NavKey; active: boolean }) {
  if (itemKey === 'home') return <HomeIcon active={active} />;
  if (itemKey === 'bookings') return <CalendarIcon active={active} />;
  if (itemKey === 'messages') return <MessageIcon active={active} />;
  if (itemKey === 'profile') return <ProfileIcon active={active} />;
  if (itemKey === 'clients') return <ClientsIcon active={active} />;
  return null;
}

function NavShellShape() {
  return (
    <svg
      viewBox="0 0 384 98"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        filter: 'drop-shadow(0 10px 24px rgba(15,23,42,0.08))',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <path
        d="
          M 30 24
          H 136
          C 143 24 148 20 151 14
          C 158 -1 172 -10 192 -10
          C 212 -10 226 -1 233 14
          C 236 20 241 24 248 24
          H 354
          C 370 24 382 37 382 53
          V 68
          C 382 84 369 96 354 96
          H 30
          C 14 96 2 84 2 68
          V 53
          C 2 37 14 24 30 24
          Z
        "
        fill={BRAND.cream}
        stroke={BRAND.border}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BottomNav({ active: activeProp, onAddClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [profileNavVisible, setProfileNavVisible] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const isProfileArea =
    pathname === '/profile' ||
    pathname?.startsWith('/profile/') ||
    activeProp === 'profile' ||
    activeProp === 'clients';

  const showProfileNavTemporarily = useCallback(() => {
    if (!isProfileArea) return;

    setProfileNavVisible(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setProfileNavVisible(false);
    }, 3000);
  }, [isProfileArea]);

  useEffect(() => {
    if (!isProfileArea) {
      setProfileNavVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      return;
    }

    showProfileNavTemporarily();

    window.addEventListener('scroll', showProfileNavTemporarily, { passive: true });
    window.addEventListener('touchstart', showProfileNavTemporarily, { passive: true });
    window.addEventListener('focus', showProfileNavTemporarily);
    window.addEventListener('pageshow', showProfileNavTemporarily);

    return () => {
      window.removeEventListener('scroll', showProfileNavTemporarily);
      window.removeEventListener('touchstart', showProfileNavTemporarily);
      window.removeEventListener('focus', showProfileNavTemporarily);
      window.removeEventListener('pageshow', showProfileNavTemporarily);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [pathname, isProfileArea, showProfileNavTemporarily]);

  useEffect(() => {
    if (addMenuOpen) {
      setProfileNavVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      return;
    }

    if (isProfileArea) {
      showProfileNavTemporarily();
    }
  }, [addMenuOpen, isProfileArea, showProfileNavTemporarily]);

  const addText = useMemo(() => getAddText(language), [language]);
  const items = isProfileArea ? profileItems : publicItems;
  const shouldShowNav = !isProfileArea || profileNavVisible || addMenuOpen;

  const getIsActive = (key: NavKey, href: string) => {
    if (addMenuOpen && key === 'add') return true;

    if (activeProp) {
      if (activeProp === 'add') return key === 'add';
      if (activeProp === 'clients') return key === 'clients';
      if (activeProp === 'bookings') return key === 'bookings';
      return activeProp === key;
    }

    if (key === 'home') return pathname === '/';
    if (key === 'profile') return pathname === '/profile' || pathname?.startsWith('/profile/');
    if (key === 'clients') return pathname === '/profile/clients';
    if (key === 'messages') return pathname === '/messages' || pathname?.startsWith('/messages/');

    if (key === 'bookings') {
      return (
        pathname === '/bookings' ||
        pathname?.startsWith('/bookings/') ||
        pathname === '/profile/bookings' ||
        pathname?.startsWith('/profile/bookings/')
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

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }

    setAddMenuOpen(true);
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
            background: 'rgba(17,17,17,0.38)',
            zIndex: 1190,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 22px 124px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 390,
              background: '#ffffff',
              border: `3px solid ${BRAND.border}`,
              borderRadius: 28,
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
                <span style={{ fontSize: 34 }}>📣</span>
                <span>{addText.ad}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={addTileStyle('#41c83f', '#ffffff', true)}
              >
                <span style={{ fontSize: 40, lineHeight: 1 }}>+</span>
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
                    top: 12,
                    right: 12,
                    minWidth: 42,
                    height: 30,
                    borderRadius: 999,
                    border: `3px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: '#ff4b52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  £1
                </span>
                <span style={{ fontSize: 40, lineHeight: 1 }}>%</span>
                <span>{addText.deal}</span>
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
                color: BRAND.black,
                fontSize: 19,
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
          bottom: 'calc(18px + env(safe-area-inset-bottom))',
          transform: shouldShowNav
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(132px)',
          opacity: shouldShowNav ? 1 : 0,
          width: 'calc(100% - 44px)',
          maxWidth: 384,
          zIndex: 1200,
          pointerEvents: shouldShowNav ? 'auto' : 'none',
          transition: 'transform 0.34s ease, opacity 0.22s ease',
        }}
      >
        <div style={{ position: 'relative', height: 98 }}>
          <NavShellShape />

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 24,
              height: 72,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              alignItems: 'center',
              padding: '7px 8px 6px',
              boxSizing: 'border-box',
              zIndex: 3,
            }}
          >
            {items.map((item) => {
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
                      justifyContent: 'center',
                      gap: 2,
                      position: 'relative',
                      zIndex: 5,
                      height: 88,
                      minWidth: 0,
                      overflow: 'visible',
                      transform: 'translateY(-18px)',
                    }}
                  >
                    <span
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: '50%',
                        background: BRAND.green,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 46,
                        fontWeight: 700,
                        lineHeight: 1,
                        boxShadow: '0 12px 28px rgba(85,199,95,0.34)',
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>

                    <span
                      title={label}
                      style={{
                        marginTop: -12,
                        width: '100%',
                        maxWidth: 78,
                        display: 'block',
                        textAlign: 'center',
                        fontSize: language === 'RU' || language === 'UA' ? 10.5 : 12,
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
                    height: 68,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    position: 'relative',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      height: 30,
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
                        top: 2,
                        right: '17%',
                        minWidth: 22,
                        height: 22,
                        padding: '0 5px',
                        borderRadius: 999,
                        background: BRAND.pink,
                        color: '#ffffff',
                        fontSize: 11,
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
                      maxWidth: isProfileArea ? 72 : 66,
                      display: 'block',
                      textAlign: 'center',
                      fontSize:
                        language === 'RU' ||
                        language === 'UA' ||
                        language === 'DE' ||
                        language === 'IT' ||
                        language === 'FR'
                          ? 10.5
                          : 12,
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
    minHeight: 112,
    border: 'none',
    borderRight: withRightBorder ? `3px solid ${BRAND.border}` : 'none',
    background: bg,
    color,
    fontSize: 17,
    fontWeight: 900,
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  };
}
