'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUnreadMessagesCount, subscribeToChatStore } from '../services/chatStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../services/i18n';

type BottomNavProps = {
  active?: 'home' | 'messages' | 'add' | 'bookings' | 'profile';
};

export default function BottomNav({ active }: BottomNavProps = {}) {
  const router = useRouter();
  const pathname = usePathname();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    const syncUnread = () => {
      setUnreadMessages(getUnreadMessagesCount());
    };

    syncUnread();
    return subscribeToChatStore(syncUnread);
  }, []);

  useEffect(() => {
    setShowAddMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!showAddMenu) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAddMenu]);

  const navText = useMemo(() => {
    return {
      home:
        language === 'ES'
          ? 'Inicio'
          : language === 'RU'
          ? 'Главная'
          : language === 'CZ'
          ? 'Domů'
          : language === 'DE'
          ? 'Start'
          : language === 'PL'
          ? 'Start'
          : 'Home',

      messages:
        language === 'ES'
          ? 'Mensajes'
          : language === 'RU'
          ? 'Сообщения'
          : language === 'CZ'
          ? 'Zprávy'
          : language === 'DE'
          ? 'Nachrichten'
          : language === 'PL'
          ? 'Wiadomości'
          : 'Messages',

      add:
        language === 'ES'
          ? 'Añadir'
          : language === 'RU'
          ? 'Добавить'
          : language === 'CZ'
          ? 'Přidat'
          : language === 'DE'
          ? 'Hinzufügen'
          : language === 'PL'
          ? 'Dodaj'
          : 'Add',

      bookings:
        language === 'ES'
          ? 'Reservas'
          : language === 'RU'
          ? 'Брони'
          : language === 'CZ'
          ? 'Rezervace'
          : language === 'DE'
          ? 'Buchungen'
          : language === 'PL'
          ? 'Rezerwacje'
          : 'Bookings',

      profile:
        language === 'ES'
          ? 'Perfil'
          : language === 'RU'
          ? 'Профиль'
          : language === 'CZ'
          ? 'Profil'
          : language === 'DE'
          ? 'Profil'
          : language === 'PL'
          ? 'Profil'
          : 'Profile',

      addAdvertisementShort:
        language === 'ES'
          ? 'Publicidad'
          : language === 'RU'
          ? 'Реклама'
          : language === 'CZ'
          ? 'Reklama'
          : language === 'DE'
          ? 'Werbung'
          : language === 'PL'
          ? 'Reklama'
          : 'Ad',

      addServiceShort:
        language === 'ES'
          ? 'Servicio'
          : language === 'RU'
          ? 'Услуга'
          : language === 'CZ'
          ? 'Služba'
          : language === 'DE'
          ? 'Service'
          : language === 'PL'
          ? 'Usługa'
          : 'Service',

      addDealShort:
        language === 'ES'
          ? 'Descuento'
          : language === 'RU'
          ? 'Скидка'
          : language === 'CZ'
          ? 'Sleva'
          : language === 'DE'
          ? 'Rabatt'
          : language === 'PL'
          ? 'Zniżka'
          : 'Deal',

      close:
        language === 'ES'
          ? 'Cerrar'
          : language === 'RU'
          ? 'Закрыть'
          : language === 'CZ'
          ? 'Zavřít'
          : language === 'DE'
          ? 'Schließen'
          : language === 'PL'
          ? 'Zamknij'
          : 'Close',
    };
  }, [language]);

  const detectedHome = pathname === '/';
  const detectedMessages = pathname.startsWith('/messages');
  const detectedBookings = pathname.startsWith('/bookings') || pathname.startsWith('/booking');
  const detectedProfile = pathname.startsWith('/profile');
  const detectedAdd =
    pathname.startsWith('/add') ||
    pathname.startsWith('/profile/promotions/new') ||
    pathname.startsWith('/profile/deals/new');

  const isHome = active ? active === 'home' : detectedHome;
  const isMessages = active ? active === 'messages' : detectedMessages;
  const isBookings = active ? active === 'bookings' : detectedBookings;
  const isProfile = active ? active === 'profile' : detectedProfile;
  const isAdd = active ? active === 'add' : detectedAdd;

  const handleOpenAddMenu = () => setShowAddMenu(true);
  const handleCloseAddMenu = () => setShowAddMenu(false);

  const handleGoToAdvertisement = () => {
    setShowAddMenu(false);
    router.push('/profile/promotions/new');
  };

  const handleGoToService = () => {
    setShowAddMenu(false);
    router.push('/add');
  };

  const handleGoToDeal = () => {
    setShowAddMenu(false);
    router.push('/profile/deals/new');
  };

  return (
    <>
      {showAddMenu ? (
        <div
          onClick={handleCloseAddMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,20,20,0.22)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 14px calc(92px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                border: '2px solid #111111',
                borderRadius: 24,
                background: '#ffffff',
                boxShadow: '0 18px 34px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 0,
                }}
              >
                <button
                  type="button"
                  onClick={handleGoToAdvertisement}
                  style={{
                    minHeight: 114,
                    border: 'none',
                    borderRight: '2px solid #111111',
                    background: '#ffe44d',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 30,
                      lineHeight: 1,
                      color: '#c69212',
                    }}
                  >
                    📣
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.15,
                      fontWeight: 900,
                      color: '#17130f',
                      textAlign: 'center',
                    }}
                  >
                    {navText.addAdvertisementShort}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToService}
                  style={{
                    minHeight: 114,
                    border: 'none',
                    borderRight: '2px solid #111111',
                    background: '#45c63d',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 30,
                      lineHeight: 1,
                      color: '#ffffff',
                    }}
                  >
                    ✚
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.15,
                      fontWeight: 900,
                      color: '#ffffff',
                      textAlign: 'center',
                    }}
                  >
                    {navText.addServiceShort}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToDeal}
                  style={{
                    minHeight: 114,
                    border: 'none',
                    background: '#ff4f4f',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: 30,
                      lineHeight: 1,
                      color: '#ffffff',
                      fontWeight: 900,
                    }}
                  >
                    %
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.15,
                      fontWeight: 900,
                      color: '#ffffff',
                      textAlign: 'center',
                    }}
                  >
                    {navText.addDealShort}
                  </span>

                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      border: '2px solid #111111',
                      borderRadius: 999,
                      background: '#ffffff',
                      color: '#ff4f4f',
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '4px 7px',
                      lineHeight: 1,
                    }}
                  >
                    £1
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAddMenu}
                style={{
                  width: '100%',
                  height: 48,
                  border: 'none',
                  borderTop: '2px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✕ {navText.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(247,244,238,0.98)',
          borderTop: '1px solid #e3ddd5',
          backdropFilter: 'blur(10px)',
          zIndex: 80,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 92px 1fr 1fr',
            alignItems: 'end',
            padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isHome ? '#1f5d99' : '#6e7b8a',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>⌂</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{navText.home}</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/messages')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isMessages ? '#1f5d99' : '#6e7b8a',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>✉</span>

              {unreadMessages > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#e53935',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(229,57,53,0.35)',
                    border: '2px solid #f7f4ee',
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              ) : null}
            </div>

            <span style={{ fontSize: 12, fontWeight: 700 }}>{navText.messages}</span>
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              transform: 'translateY(-18px)',
            }}
          >
            <button
              type="button"
              onClick={handleOpenAddMenu}
              style={{
                width: 78,
                height: 78,
                borderRadius: 999,
                border: '4px solid #45c63d',
                background: isAdd ? '#45c63d' : '#ffffff',
                color: isAdd ? '#ffffff' : '#45c63d',
                boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: 'pointer',
              }}
              title={navText.add}
            >
              <span style={{ fontSize: 36, lineHeight: 1, fontWeight: 400 }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.add}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push('/bookings')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isBookings ? '#1f5d99' : '#6e7b8a',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>▤</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{navText.bookings}</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isProfile ? '#1f5d99' : '#6e7b8a',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>◉</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{navText.profile}</span>
          </button>
        </div>
      </nav>
    </>
  );
} и какой комит /*<<<analysis to=container.exec 《凤凰大参考json code  тәшки{"cmd":["bash","-lc","cat > /tmp/check_bottomnav.tsx <<'EOF'\n'use client';\n\nimport { useEffect, useMemo, useState } from 'react';\nimport { usePathname, useRouter } from 'next/navigation';\nimport { getUnreadMessagesCount, subscribeToChatStore } from '../services/chatStore';\nimport {\n  getSavedLanguage,\n  subscribeToLanguageChange,\n  type AppLanguage,\n} from '../services/i18n';\n\ntype BottomNavProps = {\n  active?: 'home' | 'messages' | 'add' | 'bookings' | 'profile';\n};\n\nexport default function BottomNav({ active }: BottomNavProps = {}) {\n  const router = useRouter();\n  const pathname = usePathname();\n\n  const [unreadMessages, setUnreadMessages] = useState(0);\n  const [language, setLanguage] = useState<AppLanguage>('EN');\n  const [showAddMenu, setShowAddMenu] = useState(false);\n\n  useEffect(() => {\n    setLanguage(getSavedLanguage());\n\n    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {\n      setLanguage(nextLanguage);\n    });\n\n    return () => {\n      unsubLanguage();\n    };\n  }, []);\n\n  useEffect(() => {\n    const syncUnread = () => {\n      setUnreadMessages(getUnreadMessagesCount());\n    };\n\n    syncUnread();\n    return subscribeToChatStore(syncUnread);\n  }, []);\n\n  useEffect(() => {\n    setShowAddMenu(false);\n  }, [pathname]);\n\n  useEffect(() => {\n    if (!showAddMenu) return;\n\n    const previousOverflow = document.body.style.overflow;\n    document.body.style.overflow = 'hidden';\n\n    return () => {\n      document.body.style.overflow = previousOverflow;\n    };\n  }, [showAddMenu]);\n\n  const navText = useMemo(() => {\n    return {\n      home:\n        language === 'ES'\n          ? 'Inicio'\n          : language === 'RU'\n          ? 'Главная'\n          : language === 'CZ'\n          ? 'Domů'\n          : language === 'DE'\n          ? 'Start'\n          : language === 'PL'\n          ? 'Start'\n          : 'Home',\n\n      messages:\n        language === 'ES'\n          ? 'Mensajes'\n          : language === 'RU'\n          ? 'Сообщения'\n          : language === 'CZ'\n          ? 'Zprávy'\n          : language === 'DE'\n          ? 'Nachrichten'\n          : language === 'PL'\n          ? 'Wiadomości'\n          : 'Messages',\n\n      add:\n        language === 'ES'\n          ? 'Añadir'\n          : language === 'RU'\n          ? 'Добавить'\n          : language === 'CZ'\n          ? 'Přidat'\n          : language === 'DE'\n          ? 'Hinzufügen'\n          : language === 'PL'\n          ? 'Dodaj'\n          : 'Add',\n\n      bookings:\n        language === 'ES'\n          ? 'Reservas'\n          : language === 'RU'\n          ? 'Брони'\n          : language === 'CZ'\n          ? 'Rezervace'\n          : language === 'DE'\n          ? 'Buchungen'\n          : language === 'PL'\n          ? 'Rezerwacje'\n          : 'Bookings',\n\n      profile:\n        language === 'ES'\n          ? 'Perfil'\n          : language === 'RU'\n          ? 'Профиль'\n          : language === 'CZ'\n          ? 'Profil'\n          : language === 'DE'\n          ? 'Profil'\n          : language === 'PL'\n          ? 'Profil'\n          : 'Profile',\n\n      addAdvertisementShort:\n        language === 'ES'\n          ? 'Publicidad'\n          : language === 'RU'\n          ? 'Реклама'\n          : language === 'CZ'\n          ? 'Reklama'\n          : language === 'DE'\n          ? 'Werbung'\n          : language === 'PL'\n          ? 'Reklama'\n          : 'Ad',\n\n      addServiceShort:\n        language === 'ES'\n          ? 'Servicio'\n          : language === 'RU'\n          ? 'Услуга'\n          : language === 'CZ'\n          ? 'Služba'\n          : language === 'DE'\n          ? 'Service'\n          : language === 'PL'\n          ? 'Usługa'\n          : 'Service',\n\n      addDealShort:\n        language === 'ES'\n          ? 'Descuento'\n          : language === 'RU'\n          ? 'Скидка'\n          : language === 'CZ'\n          ? 'Sleva'\n          : language === 'DE'\n          ? 'Rabatt'\n          : language === 'PL'\n          ? 'Zniżka'\n          : 'Deal',\n\n      close:\n        language === 'ES'\n          ? 'Cerrar'\n          : language === 'RU'\n          ? 'Закрыть'\n          : language === 'CZ'\n          ? 'Zavřít'\n          : language === 'DE'\n          ? 'Schließen'\n          : language === 'PL'\n          ? 'Zamknij'\n          : 'Close',\n    };\n  }, [language]);\n\n  const detectedHome = pathname === '/';\n  const detectedMessages = pathname.startsWith('/messages');\n  const detectedBookings = pathname.startsWith('/bookings') || pathname.startsWith('/booking');\n  const detectedProfile = pathname.startsWith('/profile');\n  const detectedAdd =\n    pathname.startsWith('/add') ||\n    pathname.startsWith('/profile/promotions/new') ||\n    pathname.startsWith('/profile/deals/new');\n\n  const isHome = active ? active === 'home' : detectedHome;\n  const isMessages = active ? active === 'messages' : detectedMessages;\n  const isBookings = active ? active === 'bookings' : detectedBookings;\n  const isProfile = active ? active === 'profile' : detectedProfile;\n  const isAdd = active ? active === 'add' : detectedAdd;\n\n  const handleOpenAddMenu = () => setShowAddMenu(true);\n  const handleCloseAddMenu = () => setShowAddMenu(false);\n\n  const handleGoToAdvertisement = () => {\n    setShowAddMenu(false);\n    router.push('/profile/promotions/new');\n  };\n\n  const handleGoToService = () => {\n    setShowAddMenu(false);\n    router.push('/add');\n  };\n\n  const handleGoToDeal = () => {\n    setShowAddMenu(false);\n    router.push('/profile/deals/new');\n  };\n\n  return null;\n}\nEOF\nnode -e \"console.log('ok')\""]}
