'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

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
};

const addMenuTexts: Record<
  AppLanguage,
  {
    ad: string;
    service: string;
    deal: string;
    close: string;
    adSub: string;
    serviceSub: string;
    dealSub: string;
  }
> = {
  EN: {
    ad: 'Ad',
    service: 'Service',
    deal: 'Deal',
    close: 'Close',
    adSub: 'Create paid promotion',
    serviceSub: 'Add new service',
    dealSub: 'Create discount',
  },
  RU: {
    ad: 'Реклама',
    service: 'Услуга',
    deal: 'Скидка',
    close: 'Закрыть',
    adSub: 'Создать платную рекламу',
    serviceSub: 'Добавить новую услугу',
    dealSub: 'Создать скидку',
  },
  UA: {
    ad: 'Реклама',
    service: 'Послуга',
    deal: 'Знижка',
    close: 'Закрити',
    adSub: 'Створити платну рекламу',
    serviceSub: 'Додати нову послугу',
    dealSub: 'Створити знижку',
  },
  ES: {
    ad: 'Anuncio',
    service: 'Servicio',
    deal: 'Descuento',
    close: 'Cerrar',
    adSub: 'Crear promoción pagada',
    serviceSub: 'Añadir servicio',
    dealSub: 'Crear descuento',
  },
  CZ: {
    ad: 'Reklama',
    service: 'Služba',
    deal: 'Sleva',
    close: 'Zavřít',
    adSub: 'Vytvořit placenou reklamu',
    serviceSub: 'Přidat službu',
    dealSub: 'Vytvořit slevu',
  },
  DE: {
    ad: 'Anzeige',
    service: 'Service',
    deal: 'Rabatt',
    close: 'Schließen',
    adSub: 'Bezahlte Werbung erstellen',
    serviceSub: 'Service hinzufügen',
    dealSub: 'Rabatt erstellen',
  },
  IT: {
    ad: 'Pubblicità',
    service: 'Servizio',
    deal: 'Sconto',
    close: 'Chiudi',
    adSub: 'Crea promozione',
    serviceSub: 'Aggiungi servizio',
    dealSub: 'Crea sconto',
  },
  FR: {
    ad: 'Pub',
    service: 'Service',
    deal: 'Réduction',
    close: 'Fermer',
    adSub: 'Créer promotion payante',
    serviceSub: 'Ajouter service',
    dealSub: 'Créer réduction',
  },
  PL: {
    ad: 'Reklama',
    service: 'Usługa',
    deal: 'Zniżka',
    close: 'Zamknij',
    adSub: 'Utwórz płatną promocję',
    serviceSub: 'Dodaj usługę',
    dealSub: 'Utwórz zniżkę',
  },
  AR: {
    ad: 'إعلان',
    service: 'خدمة',
    deal: 'خصم',
    close: 'إغلاق',
    adSub: 'إنشاء إعلان مدفوع',
    serviceSub: 'إضافة خدمة',
    dealSub: 'إنشاء خصم',
  },
};

const publicItems: NavItem[] = [
  {
    key: 'home',
    href: '/',
    label: {
      EN: 'Home',
      RU: 'Главная',
      UA: 'Головна',
      ES: 'Inicio',
      CZ: 'Domů',
      DE: 'Home',
      IT: 'Home',
      FR: 'Accueil',
      PL: 'Start',
      AR: 'الرئيسية',
    },
  },
  {
    key: 'messages',
    href: '/messages',
    label: {
      EN: 'Messages',
      RU: 'Сообщения',
      UA: 'Повідомл.',
      ES: 'Mensajes',
      CZ: 'Zprávy',
      DE: 'Nachr.',
      IT: 'Messaggi',
      FR: 'Messages',
      PL: 'Wiadom.',
      AR: 'رسائل',
    },
  },
  {
    key: 'add',
    href: '/add',
    accent: true,
    label: {
      EN: 'Add',
      RU: 'Добавить',
      UA: 'Додати',
      ES: 'Añadir',
      CZ: 'Přidat',
      DE: 'Plus',
      IT: 'Aggiungi',
      FR: 'Ajouter',
      PL: 'Dodaj',
      AR: 'إضافة',
    },
  },
  {
    key: 'bookings',
    href: '/bookings',
    label: {
      EN: 'Bookings',
      RU: 'Брони',
      UA: 'Броні',
      ES: 'Reservas',
      CZ: 'Rezervace',
      DE: 'Buchung',
      IT: 'Prenota',
      FR: 'Réserv.',
      PL: 'Rezerw.',
      AR: 'حجوزات',
    },
  },
  {
    key: 'profile',
    href: '/profile',
    label: {
      EN: 'Profile',
      RU: 'Профиль',
      UA: 'Профіль',
      ES: 'Perfil',
      CZ: 'Profil',
      DE: 'Profil',
      IT: 'Profilo',
      FR: 'Profil',
      PL: 'Profil',
      AR: 'حسابي',
    },
  },
];

const profileItems: NavItem[] = [
  {
    key: 'profile',
    href: '/profile',
    label: {
      EN: 'Profile',
      RU: 'Профиль',
      UA: 'Профіль',
      ES: 'Perfil',
      CZ: 'Profil',
      DE: 'Profil',
      IT: 'Profilo',
      FR: 'Profil',
      PL: 'Profil',
      AR: 'حسابي',
    },
  },
  {
    key: 'clients',
    href: '/profile/clients',
    label: {
      EN: 'My clients',
      RU: 'Мои клиенты',
      UA: 'Мої клієнти',
      ES: 'Clientes',
      CZ: 'Klienti',
      DE: 'Kunden',
      IT: 'Clienti',
      FR: 'Clients',
      PL: 'Klienci',
      AR: 'عملائي',
    },
  },
  {
    key: 'add',
    href: '/add',
    accent: true,
    label: {
      EN: 'Add',
      RU: 'Добавить',
      UA: 'Додати',
      ES: 'Añadir',
      CZ: 'Přidat',
      DE: 'Plus',
      IT: 'Aggiungi',
      FR: 'Ajouter',
      PL: 'Dodaj',
      AR: 'إضافة',
    },
  },
  {
    key: 'bookings',
    href: '/profile/bookings',
    label: {
      EN: 'My bookings',
      RU: 'Мои брони',
      UA: 'Мої броні',
      ES: 'Reservas',
      CZ: 'Rezervace',
      DE: 'Buchungen',
      IT: 'Prenot.',
      FR: 'Réserv.',
      PL: 'Rezerw.',
      AR: 'حجوزاتي',
    },
  },
  {
    key: 'messages',
    href: '/messages',
    label: {
      EN: 'Messages',
      RU: 'Сообщения',
      UA: 'Повідомл.',
      ES: 'Mensajes',
      CZ: 'Zprávy',
      DE: 'Nachr.',
      IT: 'Messaggi',
      FR: 'Messages',
      PL: 'Wiadom.',
      AR: 'رسائل',
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
  const color = active ? BRAND.blue : BRAND.black;

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
  const color = active ? BRAND.green : BRAND.black;

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
  const color = active ? BRAND.green : BRAND.black;

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

function ClientsIcon({ active }: { active: boolean }) {
  const color = active ? BRAND.green : BRAND.black;

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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

export default function BottomNav({ active: activeProp, onAddClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addText = useMemo(() => getAddText(language), [language]);

  const isProfileArea =
    pathname === '/profile' ||
    pathname?.startsWith('/profile/') ||
    activeProp === 'profile' ||
    activeProp === 'clients';

  const items = isProfileArea ? profileItems : publicItems;

  const getIsActive = (key: NavKey, href: string) => {
    if (addMenuOpen && key === 'add') return true;

    if (activeProp) {
      if (activeProp === 'add') return key === 'add';
      if (activeProp === 'clients') return key === 'clients';
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
              border: `3px solid ${BRAND.border}`,
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 44px rgba(0,0,0,0.22)',
            }}
          >
            <AddMenuButton
              icon="📣"
              title={addText.ad}
              subtitle={addText.adSub}
              bg="#ffe44d"
              borderBottom
              onClick={handleCreateAd}
            />

            <AddMenuButton
              icon="+"
              title={addText.service}
              subtitle={addText.serviceSub}
              bg="#41c83f"
              color="#ffffff"
              borderBottom
              onClick={handleCreateService}
            />

            <AddMenuButton
              icon="%"
              title={addText.deal}
              subtitle={addText.dealSub}
              bg="#ff4b52"
              color="#ffffff"
              onClick={handleCreateDeal}
            />

            <button
              type="button"
              onClick={() => setAddMenuOpen(false)}
              style={{
                width: '100%',
                minHeight: 58,
                border: 'none',
                borderTop: `3px solid ${BRAND.border}`,
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
          transform: 'translateX(-50%)',
          width: 'calc(100% - 34px)',
          maxWidth: 398,
          zIndex: 1200,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ position: 'relative', height: 96 }}>
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
              background: BRAND.cream,
              borderTop: `2px solid ${BRAND.border}`,
              borderLeft: `2px solid ${BRAND.border}`,
              borderRight: `2px solid ${BRAND.border}`,
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: BRAND.cream,
              border: `2px solid ${BRAND.border}`,
              borderRadius: 32,
              boxShadow: '0 10px 26px rgba(15,23,42,0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              alignItems: 'end',
              padding: '13px 8px 13px',
              boxSizing: 'border-box',
              zIndex: 2,
            }}
          >
            {items.map((item) => {
              const isActive = getIsActive(item.key, item.href);
              const label = getLabel(item, language);
              const activeColor = getActiveColor(item.key);

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
                        background: BRAND.green,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 44,
                        fontWeight: 700,
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
                        color: isActive ? activeColor : BRAND.black,
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
                    <NavIcon itemKey={item.key} active={isActive} />
                  </span>

                  <span
                    title={label}
                    style={{
                      width: '100%',
                      maxWidth: isProfileArea ? 72 : 66,
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
                      color: isActive ? activeColor : BRAND.black,
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

function AddMenuButton({
  icon,
  title,
  subtitle,
  bg,
  color = BRAND.black,
  borderBottom = false,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  bg: string;
  color?: string;
  borderBottom?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 88,
        border: 'none',
        borderBottom: borderBottom ? `3px solid ${BRAND.border}` : 'none',
        background: bg,
        color,
        padding: '14px 16px',
        display: 'grid',
        gridTemplateColumns: '54px 1fr',
        gap: 12,
        alignItems: 'center',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          border: `3px solid ${BRAND.border}`,
          background: '#ffffff',
          color: BRAND.black,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: icon === '+' ? 35 : 27,
          fontWeight: 900,
          boxSizing: 'border-box',
        }}
      >
        {icon}
      </span>

      <span>
        <span
          style={{
            display: 'block',
            fontSize: 18,
            lineHeight: 1.05,
            fontWeight: 900,
          }}
        >
          {title}
        </span>

        <span
          style={{
            display: 'block',
            marginTop: 5,
            fontSize: 12,
            lineHeight: 1.2,
            fontWeight: 800,
            opacity: 0.86,
          }}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}
