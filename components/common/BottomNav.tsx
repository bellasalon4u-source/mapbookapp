'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
};

type NavKey = 'profile' | 'clients' | 'add' | 'bookings' | 'messages';

type NavItem = {
  key: NavKey;
  href: string;
};

const navLabels: Record<AppLanguage, Record<NavKey, string>> = {
  EN: {
    profile: 'Profile',
    clients: 'My clients',
    add: 'Add',
    bookings: 'My bookings',
    messages: 'Messages',
  },
  ES: {
    profile: 'Perfil',
    clients: 'Clientes',
    add: 'Añadir',
    bookings: 'Reservas',
    messages: 'Mensajes',
  },
  RU: {
    profile: 'Профиль',
    clients: 'Мои клиенты',
    add: 'Добавить',
    bookings: 'Мои брони',
    messages: 'Сообщения',
  },
  UA: {
    profile: 'Профіль',
    clients: 'Мої клієнти',
    add: 'Додати',
    bookings: 'Мої броні',
    messages: 'Повідомл.',
  },
  CZ: {
    profile: 'Profil',
    clients: 'Klienti',
    add: 'Přidat',
    bookings: 'Rezervace',
    messages: 'Zprávy',
  },
  DE: {
    profile: 'Profil',
    clients: 'Kunden',
    add: 'Plus',
    bookings: 'Buchung',
    messages: 'Nachr.',
  },
  IT: {
    profile: 'Profilo',
    clients: 'Clienti',
    add: 'Aggiungi',
    bookings: 'Prenota',
    messages: 'Messaggi',
  },
  FR: {
    profile: 'Profil',
    clients: 'Clients',
    add: 'Ajouter',
    bookings: 'Réserv.',
    messages: 'Messages',
  },
  AR: {
    profile: 'حسابي',
    clients: 'عملائي',
    add: 'إضافة',
    bookings: 'حجوزات',
    messages: 'رسائل',
  },
  PL: {
    profile: 'Profil',
    clients: 'Klienci',
    add: 'Dodaj',
    bookings: 'Rezerw.',
    messages: 'Wiadom.',
  },
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
  { key: 'profile', href: '/profile' },
  { key: 'clients', href: '/bookings/clients' },
  { key: 'add', href: '/add' },
  { key: 'bookings', href: '/bookings' },
  { key: 'messages', href: '/messages' },
];

function getLabel(language: AppLanguage, key: NavKey) {
  return navLabels[language]?.[key] || navLabels.EN[key];
}

function getAddText(language: AppLanguage) {
  return addMenuTexts[language] || addMenuTexts.EN;
}

function getActiveColor(key: NavKey) {
  if (key === 'clients') return '#f1b900';
  if (key === 'bookings') return '#2578ff';
  if (key === 'messages') return '#55c75f';
  if (key === 'add') return '#55c75f';
  return '#55c75f';
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? '#55c75f' : '#202020';

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
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
  const color = active ? '#f1b900' : '#202020';

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="7" width="16" height="12" rx="2.4" stroke={color} strokeWidth="1.9" />
      <path
        d="M9 7V5.8C9 4.8 9.8 4 10.8 4H13.2C14.2 4 15 4.8 15 5.8V7"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path d="M8 12H16" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const color = active ? '#2578ff' : '#202020';

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2" stroke={color} strokeWidth="1.9" />
      <path d="M8 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  const color = active ? '#55c75f' : '#202020';

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);

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

  const labels = useMemo(() => {
    return navLabels[language] || navLabels.EN;
  }, [language]);

  const addText = useMemo(() => getAddText(language), [language]);

  const showNavForMoment = () => {
    setNavVisible(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      if (!addMenuOpen) {
        setNavVisible(false);
      }
    }, 4200);
  };

  useEffect(() => {
    showNavForMoment();

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = Math.abs(currentY - lastScrollYRef.current);

      if (diff > 8) {
        showNavForMoment();
      }

      lastScrollYRef.current = currentY;
    };

    const handleTouchStart = () => {
      showNavForMoment();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [addMenuOpen]);

  const getIsActive = (key: NavKey, href: string) => {
    if (addMenuOpen && key === 'add') return true;

    if (activeProp) {
      return activeProp === key;
    }

    if (key === 'clients') {
      return pathname === '/bookings/clients' || pathname?.startsWith('/bookings/clients/');
    }

    if (key === 'bookings') {
      return pathname === '/bookings' || pathname?.startsWith('/bookings/');
    }

    if (key === 'profile') {
      return pathname === '/profile' || pathname?.startsWith('/profile/');
    }

    if (key === 'messages') {
      return pathname === '/messages' || pathname?.startsWith('/messages/');
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

  const handleNavClick = (item: NavItem) => {
    setNavVisible(true);

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
            padding: '0 22px 128px',
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
                  minHeight: 112,
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
                <span style={{ fontSize: 34 }}>📣</span>
                <span>{addText.ad}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={{
                  minHeight: 112,
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
                <span style={{ fontSize: 40, lineHeight: 1 }}>+</span>
                <span>{addText.service}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateDeal}
                style={{
                  minHeight: 112,
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
                    top: 12,
                    right: 12,
                    minWidth: 42,
                    height: 30,
                    borderRadius: 999,
                    border: '3px solid #111111',
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
                color: '#17130f',
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
        onClick={() => setNavVisible(true)}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: navVisible
            ? 'calc(10px + env(safe-area-inset-bottom))'
            : 'calc(-72px + env(safe-area-inset-bottom))',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 46px)',
          maxWidth: 364,
          zIndex: 1200,
          transition: 'bottom 260ms ease, opacity 260ms ease',
          opacity: navVisible ? 1 : 0.82,
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#fffefa',
            border: '2px solid #111111',
            borderRadius: 26,
            boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
            padding: '9px 9px 8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            alignItems: 'end',
            gap: 0,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -20,
              transform: 'translateX(-50%)',
              width: 78,
              height: 44,
              background: '#fffefa',
              border: '2px solid #111111',
              borderBottom: 'none',
              borderRadius: '76px 76px 0 0',
              zIndex: 0,
            }}
          />

          {navItems.map((item) => {
            const isActive = getIsActive(item.key, item.href);
            const isAdd = item.key === 'add';
            const label = labels[item.key] || getLabel(language, item.key);
            const activeColor = getActiveColor(item.key);
            const badge =
              item.key === 'messages' && unreadMessagesCount > 0 ? unreadMessagesCount : 0;

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
                  gap: 4,
                  position: 'relative',
                  minHeight: 58,
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  zIndex: 2,
                  overflow: 'visible',
                }}
              >
                {isAdd ? (
                  <span
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: isActive ? '#41c83f' : '#55c75f',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 38,
                      fontWeight: 500,
                      lineHeight: 1,
                      boxShadow: isActive
                        ? '0 10px 24px rgba(65,200,63,0.36)'
                        : '0 10px 22px rgba(85,199,95,0.24)',
                      transform: 'translateY(-17px)',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 31,
                      width: 31,
                      flexShrink: 0,
                    }}
                  >
                    {item.key === 'profile' && <ProfileIcon active={isActive} />}
                    {item.key === 'clients' && <ClientsIcon active={isActive} />}
                    {item.key === 'bookings' && <CalendarIcon active={isActive} />}
                    {item.key === 'messages' && <MessageIcon active={isActive} />}
                  </span>
                )}

                {badge > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 5,
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
                    {badge > 99 ? '99+' : badge}
                  </span>
                ) : null}

                <span
                  title={label}
                  style={{
                    marginTop: isAdd ? -17 : 0,
                    width: '100%',
                    maxWidth: 62,
                    minWidth: 0,
                    display: 'block',
                    textAlign: 'center',
                    fontSize:
                      language === 'UA' ||
                      language === 'DE' ||
                      language === 'IT' ||
                      language === 'CZ' ||
                      language === 'FR'
                        ? 10.2
                        : 11,
                    fontWeight: 900,
                    color: isActive ? activeColor : '#202020',
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
    </>
  );
}
