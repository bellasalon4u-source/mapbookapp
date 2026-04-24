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
  href: string;
  badge?: number;
};

type BottomNavTexts = {
  home: string;
  messages: string;
  add: string;
  bookings: string;
  profile: string;
  ad: string;
  service: string;
  deal: string;
  close: string;
};

const bottomNavTexts: Record<AppLanguage, BottomNavTexts> = {
  EN: {
    home: 'Home',
    messages: 'Messages',
    add: 'Add',
    bookings: 'Bookings',
    profile: 'Profile',
    ad: 'Ad',
    service: 'Service',
    deal: 'Deal',
    close: 'Close',
  },
  ES: {
    home: 'Inicio',
    messages: 'Mensajes',
    add: 'Añadir',
    bookings: 'Reservas',
    profile: 'Perfil',
    ad: 'Anuncio',
    service: 'Servicio',
    deal: 'Oferta',
    close: 'Cerrar',
  },
  RU: {
    home: 'Главная',
    messages: 'Сообщения',
    add: 'Добавить',
    bookings: 'Брони',
    profile: 'Профиль',
    ad: 'Реклама',
    service: 'Услуга',
    deal: 'Скидка',
    close: 'Закрыть',
  },
  UA: {
    home: 'Головна',
    messages: 'Повідомлення',
    add: 'Додати',
    bookings: 'Броні',
    profile: 'Профіль',
    ad: 'Реклама',
    service: 'Послуга',
    deal: 'Знижка',
    close: 'Закрити',
  },
  CZ: {
    home: 'Domů',
    messages: 'Zprávy',
    add: 'Přidat',
    bookings: 'Rezervace',
    profile: 'Profil',
    ad: 'Reklama',
    service: 'Služba',
    deal: 'Sleva',
    close: 'Zavřít',
  },
  DE: {
    home: 'Home',
    messages: 'Nachrichten',
    add: 'Hinzufügen',
    bookings: 'Buchungen',
    profile: 'Profil',
    ad: 'Anzeige',
    service: 'Service',
    deal: 'Rabatt',
    close: 'Schließen',
  },
  IT: {
    home: 'Home',
    messages: 'Messaggi',
    add: 'Aggiungi',
    bookings: 'Prenotazioni',
    profile: 'Profilo',
    ad: 'Annuncio',
    service: 'Servizio',
    deal: 'Sconto',
    close: 'Chiudi',
  },
  FR: {
    home: 'Accueil',
    messages: 'Messages',
    add: 'Ajouter',
    bookings: 'Réservations',
    profile: 'Profil',
    ad: 'Pub',
    service: 'Service',
    deal: 'Réduction',
    close: 'Fermer',
  },
  AR: {
    home: 'الرئيسية',
    messages: 'رسائل',
    add: 'إضافة',
    bookings: 'حجوزات',
    profile: 'الملف',
    ad: 'إعلان',
    service: 'خدمة',
    deal: 'خصم',
    close: 'إغلاق',
  },
  PL: {
    home: 'Start',
    messages: 'Wiadomości',
    add: 'Dodaj',
    bookings: 'Rezerwacje',
    profile: 'Profil',
    ad: 'Reklama',
    service: 'Usługa',
    deal: 'Zniżka',
    close: 'Zamknij',
  },
};

const navItems: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'messages', href: '/messages', badge: 2 },
  { key: 'add', href: '/profile/promotions/new' },
  { key: 'bookings', href: '/bookings' },
  { key: 'profile', href: '/profile' },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7H18C19.1046 7 20 7.89543 20 9V14C20 15.1046 19.1046 16 18 16H11L7 19V16H6C4.89543 16 4 15.1046 4 14V9C4 7.89543 4.89543 7 6 7Z"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
      />
      <path
        d="M8 3V8"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M16 3V8"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M4 10H20"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
      />
      <path
        d="M5.5 19C6.5 15.8 8.8 14.5 12 14.5C15.2 14.5 17.5 15.8 18.5 19"
        stroke={active ? '#55c75f' : '#202020'}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav({ active: activeProp }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);

  const text = bottomNavTexts[language] || bottomNavTexts.EN;

  const showNavForMoment = () => {
    setNavVisible(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      if (!addMenuOpen) {
        setNavVisible(false);
      }
    }, 2200);
  };

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

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

  const getIsActive = (key: BottomNavProps['active'], href: string) => {
    if (activeProp) return activeProp === key;

    if (href === '/') return pathname === '/';
    if (href === '/profile') return pathname === '/profile' || pathname?.startsWith('/profile');
    if (key === 'add') {
      return pathname?.startsWith('/profile/promotions/new') || pathname?.startsWith('/add');
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

  const getLabel = (key: NavItem['key']) => {
    if (key === 'home') return text.home;
    if (key === 'messages') return text.messages;
    if (key === 'add') return text.add;
    if (key === 'bookings') return text.bookings;
    return text.profile;
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
            padding: '0 26px 150px',
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
                  minHeight: 122,
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
                <span>{text.ad}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateService}
                style={{
                  minHeight: 122,
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
                <span>{text.service}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateDeal}
                style={{
                  minHeight: 122,
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
                    top: 14,
                    right: 14,
                    minWidth: 46,
                    height: 32,
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
                <span style={{ fontSize: 42, lineHeight: 1 }}>%</span>
                <span>{text.deal}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                minHeight: 62,
                border: 'none',
                background: '#ffffff',
                color: '#17130f',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              × {text.close}
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
            ? 'calc(16px + env(safe-area-inset-bottom))'
            : 'calc(-82px + env(safe-area-inset-bottom))',
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
            padding: '12px 10px 11px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 88px 1fr 1fr',
            alignItems: 'end',
            gap: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -24,
              transform: 'translateX(-50%)',
              width: 92,
              height: 50,
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

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item)}
                style={{
                  width: '100%',
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
                  minHeight: isAdd ? 70 : 60,
                  zIndex: 2,
                }}
              >
                {isAdd ? (
                  <span
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: '#55c75f',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 500,
                      lineHeight: 1,
                      boxShadow: '0 10px 22px rgba(85,199,95,0.24)',
                      transform: 'translateY(-20px)',
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
                      height: 32,
                      minWidth: 32,
                    }}
                  >
                    {item.key === 'home' && <HomeIcon active={isActive} />}
                    {item.key === 'messages' && <MessageIcon active={isActive} />}
                    {item.key === 'bookings' && <CalendarIcon active={isActive} />}
                    {item.key === 'profile' && <ProfileIcon active={isActive} />}
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
                    marginTop: isAdd ? -18 : 0,
                    width: '100%',
                    padding: '0 2px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: isActive ? '#55c75f' : '#202020',
                    lineHeight: 1.05,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {getLabel(item.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
