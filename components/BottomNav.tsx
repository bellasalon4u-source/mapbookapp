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
  onAddClick?: () => void;
};

type NavKey = 'home' | 'messages' | 'add' | 'bookings' | 'profile';

type NavItem = {
  key: NavKey;
  label: Record<AppLanguage, string>;
  href: string;
  accent?: boolean;
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

const items: NavItem[] = [
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
      PL: 'Start',
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
      DE: 'Buchung',
      IT: 'Prenota',
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

function getAddText(language: AppLanguage) {
  return addMenuTexts[language] || addMenuTexts.EN;
}

function getLabel(item: NavItem, language: AppLanguage) {
  return item.label[language] || item.label.EN;
}

function getActiveColor(key: NavKey) {
  if (key === 'bookings') return '#2578ff';
  if (key === 'messages') return '#55c75f';
  if (key === 'profile') return '#55c75f';
  if (key === 'add') return '#55c75f';
  return '#55c75f';
}

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? '#55c75f' : '#171717';

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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
  const color = active ? '#2578ff' : '#171717';

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2.4" stroke={color} strokeWidth="1.9" />
      <path d="M8 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16 3V8" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 10H20" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  const color = active ? '#55c75f' : '#171717';

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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
  const color = active ? '#55c75f' : '#171717';

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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

export default function BottomNav({ active: activeProp, onAddClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const addText = useMemo(() => getAddText(language), [language]);

  const getIsActive = (key: NavKey, href: string) => {
    if (addMenuOpen && key === 'add') return true;

    if (activeProp) {
      if (activeProp === 'clients') {
        return false;
      }

      return activeProp === key;
    }

    if (key === 'home') {
      return pathname === '/';
    }

    if (key === 'profile') {
      return pathname === '/profile' || pathname?.startsWith('/profile/');
    }

    if (key === 'messages') {
      return pathname === '/messages' || pathname?.startsWith('/messages/');
    }

    if (key === 'bookings') {
      return pathname === '/bookings' || pathname?.startsWith('/bookings/');
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
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'calc(18px + env(safe-area-inset-bottom))',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 34px)',
          maxWidth: 398,
          zIndex: 1200,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 96,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -25,
              transform: 'translateX(-50%)',
              width: 116,
              height: 64,
              borderTopLeftRadius: 999,
              borderTopRightRadius: 999,
              background: '#f7f4ef',
              borderTop: '2px solid #171717',
              borderLeft: '2px solid #171717',
              borderRight: '2px solid #171717',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f7f4ef',
              border: '2px solid #171717',
              borderRadius: 32,
              boxShadow: '0 10px 26px rgba(15,23,42,0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              alignItems: 'end',
              gap: 0,
              padding: '13px 8px 13px',
              boxSizing: 'border-box',
              zIndex: 2,
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
                      justifyContent: 'flex-end',
                      gap: 4,
                      position: 'relative',
                      zIndex: 5,
                      minHeight: 84,
                      minWidth: 0,
                      overflow: 'visible',
                    }}
                  >
                    <span
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: '50%',
                        background: '#55c75f',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 44,
                        fontWeight: 600,
                        lineHeight: 1,
                        boxShadow: '0 12px 28px rgba(85,199,95,0.34)',
                        transform: 'translateY(-22px)',
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>

                    <span
                      title={label}
                      style={{
                        marginTop: -22,
                        width: '100%',
                        maxWidth: 68,
                        minWidth: 0,
                        display: 'block',
                        textAlign: 'center',
                        fontSize: language === 'RU' || language === 'UA' ? 10.5 : 12,
                        fontWeight: 900,
                        color: isActive ? activeColor : '#171717',
                        lineHeight: 1,
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 5,
                    position: 'relative',
                    minHeight: 70,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                    }}
                  >
                    {item.key === 'home' && <HomeIcon active={isActive} />}
                    {item.key === 'bookings' && <CalendarIcon active={isActive} />}
                    {item.key === 'messages' && <MessageIcon active={isActive} />}
                    {item.key === 'profile' && <ProfileIcon active={isActive} />}
                  </span>

                  {badge > 0 ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: '18%',
                        minWidth: 24,
                        height: 24,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#ff4fa0',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxSizing: 'border-box',
                        boxShadow: '0 4px 10px rgba(255,79,160,0.28)',
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
                      minWidth: 0,
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
                      color: isActive ? activeColor : '#171717',
                      lineHeight: 1,
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
