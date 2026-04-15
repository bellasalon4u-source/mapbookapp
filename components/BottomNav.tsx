'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUnreadMessagesCount, subscribeToChatStore } from '../services/chatStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../services/i18n';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    const loadUnread = () => {
      setUnreadMessages(getUnreadMessagesCount());
    };

    loadUnread();
    return subscribeToChatStore(loadUnread);
  }, []);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

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

      addAdvertisement:
        language === 'ES'
          ? 'Añadir anuncio'
          : language === 'RU'
          ? 'Добавить рекламу'
          : language === 'CZ'
          ? 'Přidat reklamu'
          : language === 'DE'
          ? 'Werbung hinzufügen'
          : language === 'PL'
          ? 'Dodaj reklamę'
          : 'Add advertisement',

      addService:
        language === 'ES'
          ? 'Añadir servicio'
          : language === 'RU'
          ? 'Добавить объявление'
          : language === 'CZ'
          ? 'Přidat službu'
          : language === 'DE'
          ? 'Service hinzufügen'
          : language === 'PL'
          ? 'Dodaj usługę'
          : 'Add service',

      addDeal:
        language === 'ES'
          ? 'Oferta del día'
          : language === 'RU'
          ? 'Скидка дня'
          : language === 'CZ'
          ? 'Sleva dne'
          : language === 'DE'
          ? 'Tagesrabatt'
          : language === 'PL'
          ? 'Zniżka dnia'
          : 'Deal of the day',

      addAdvertisementShort:
        language === 'ES'
          ? 'Реклама'
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
          ? 'Объявление'
          : language === 'RU'
          ? 'Объявление'
          : language === 'CZ'
          ? 'Služba'
          : language === 'DE'
          ? 'Anzeige'
          : language === 'PL'
          ? 'Usługa'
          : 'Listing',

      addDealShort:
        language === 'ES'
          ? 'Скидка'
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

  const isHome = pathname === '/';
  const isMessages = pathname.startsWith('/messages');
  const isBookings = pathname.startsWith('/bookings');
  const isProfile = pathname.startsWith('/profile');
  const isAdd =
    pathname.startsWith('/add') ||
    pathname.startsWith('/profile/promotions/new') ||
    pathname.startsWith('/profile/deals/new');

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
            background: 'rgba(20,20,20,0.18)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 14px calc(94px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                border: '2px solid #111111',
                borderRadius: 28,
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
                    minHeight: 118,
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
                      fontSize: 26,
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
                    minHeight: 118,
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
                      fontSize: 26,
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
                    minHeight: 118,
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
                      fontSize: 26,
                      lineHeight: 1,
                      color: '#ffffff',
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
                  height: 50,
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
          borderTop: '2px solid #111111',
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
}
