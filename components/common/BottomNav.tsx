'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUnreadMessagesCount, subscribeToChatStore } from '../../services/chatStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type BottomNavProps = {
  active?: 'home' | 'messages' | 'add' | 'bookings' | 'profile';
};

export default function BottomNav({ active }: BottomNavProps) {
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
          : language === 'UA'
          ? 'Головна'
          : language === 'CZ'
          ? 'Domů'
          : language === 'DE'
          ? 'Start'
          : language === 'IT'
          ? 'Home'
          : language === 'FR'
          ? 'Accueil'
          : language === 'AR'
          ? 'الرئيسية'
          : language === 'PL'
          ? 'Start'
          : 'Home',

      messages:
        language === 'ES'
          ? 'Mensajes'
          : language === 'RU'
          ? 'Сообщения'
          : language === 'UA'
          ? 'Повідомлення'
          : language === 'CZ'
          ? 'Zprávy'
          : language === 'DE'
          ? 'Nachrichten'
          : language === 'IT'
          ? 'Messaggi'
          : language === 'FR'
          ? 'Messages'
          : language === 'AR'
          ? 'الرسائل'
          : language === 'PL'
          ? 'Wiadomości'
          : 'Messages',

      add:
        language === 'ES'
          ? 'Añadir'
          : language === 'RU'
          ? 'Добавить'
          : language === 'UA'
          ? 'Додати'
          : language === 'CZ'
          ? 'Přidat'
          : language === 'DE'
          ? 'Hinzufügen'
          : language === 'IT'
          ? 'Aggiungi'
          : language === 'FR'
          ? 'Ajouter'
          : language === 'AR'
          ? 'إضافة'
          : language === 'PL'
          ? 'Dodaj'
          : 'Add',

      bookings:
        language === 'ES'
          ? 'Reservas'
          : language === 'RU'
          ? 'Брони'
          : language === 'UA'
          ? 'Броні'
          : language === 'CZ'
          ? 'Rezervace'
          : language === 'DE'
          ? 'Buchungen'
          : language === 'IT'
          ? 'Prenotazioni'
          : language === 'FR'
          ? 'Réservations'
          : language === 'AR'
          ? 'الحجوزات'
          : language === 'PL'
          ? 'Rezerwacje'
          : 'Bookings',

      profile:
        language === 'ES'
          ? 'Perfil'
          : language === 'RU'
          ? 'Профиль'
          : language === 'UA'
          ? 'Профіль'
          : language === 'CZ'
          ? 'Profil'
          : language === 'DE'
          ? 'Profil'
          : language === 'IT'
          ? 'Profilo'
          : language === 'FR'
          ? 'Profil'
          : language === 'AR'
          ? 'الملف'
          : language === 'PL'
          ? 'Profil'
          : 'Profile',

      addAdvertisementShort:
        language === 'ES'
          ? 'Publicidad'
          : language === 'RU'
          ? 'Реклама'
          : language === 'UA'
          ? 'Реклама'
          : language === 'CZ'
          ? 'Reklama'
          : language === 'DE'
          ? 'Werbung'
          : language === 'IT'
          ? 'Pubblicità'
          : language === 'FR'
          ? 'Pub'
          : language === 'AR'
          ? 'إعلان'
          : language === 'PL'
          ? 'Reklama'
          : 'Ad',

      addServiceShort:
        language === 'ES'
          ? 'Servicio'
          : language === 'RU'
          ? 'Услуга'
          : language === 'UA'
          ? 'Послуга'
          : language === 'CZ'
          ? 'Služba'
          : language === 'DE'
          ? 'Service'
          : language === 'IT'
          ? 'Servizio'
          : language === 'FR'
          ? 'Service'
          : language === 'AR'
          ? 'خدمة'
          : language === 'PL'
          ? 'Usługa'
          : 'Service',

      addDealShort:
        language === 'ES'
          ? 'Descuento'
          : language === 'RU'
          ? 'Скидка'
          : language === 'UA'
          ? 'Знижка'
          : language === 'CZ'
          ? 'Sleva'
          : language === 'DE'
          ? 'Rabatt'
          : language === 'IT'
          ? 'Sconto'
          : language === 'FR'
          ? 'Réduc.'
          : language === 'AR'
          ? 'خصم'
          : language === 'PL'
          ? 'Zniżka'
          : 'Deal',

      close:
        language === 'ES'
          ? 'Cerrar'
          : language === 'RU'
          ? 'Закрыть'
          : language === 'UA'
          ? 'Закрити'
          : language === 'CZ'
          ? 'Zavřít'
          : language === 'DE'
          ? 'Schließen'
          : language === 'IT'
          ? 'Chiudi'
          : language === 'FR'
          ? 'Fermer'
          : language === 'AR'
          ? 'إغلاق'
          : language === 'PL'
          ? 'Zamknij'
          : 'Close',
    };
  }, [language]);

  const isHome = active === 'home' || pathname === '/';
  const isMessages = active === 'messages' || pathname.startsWith('/messages');
  const isBookings =
    active === 'bookings' ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/profile/bookings');
  const isProfile = active === 'profile' || pathname.startsWith('/profile');
  const isAdd =
    active === 'add' ||
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
            background: 'rgba(20,20,20,0.16)',
            zIndex: 120,
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
                border: '3px solid #111111',
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
                }}
              >
                <button
                  type="button"
                  onClick={handleGoToAdvertisement}
                  style={{
                    minHeight: 112,
                    border: 'none',
                    borderRight: '3px solid #111111',
                    background: '#f1dc4c',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 34, lineHeight: 1 }}>📣</span>
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
                    minHeight: 112,
                    border: 'none',
                    borderRight: '3px solid #111111',
                    background: '#4acb39',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 42,
                      lineHeight: 1,
                      color: '#ffffff',
                      fontWeight: 900,
                    }}
                  >
                    +
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
                    minHeight: 112,
                    border: 'none',
                    background: '#ff5252',
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      minWidth: 42,
                      height: 34,
                      padding: '0 10px',
                      borderRadius: 999,
                      border: '3px solid #111111',
                      background: '#ffffff',
                      color: '#b13a3a',
                      fontSize: 18,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    £1
                  </span>

                  <span
                    style={{
                      fontSize: 38,
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
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAddMenu}
                style={{
                  width: '100%',
                  height: 56,
                  border: 'none',
                  borderTop: '3px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 16,
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
              color: isHome ? '#45c63d' : '#6e7b8a',
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
              color: isMessages ? '#45c63d' : '#6e7b8a',
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
            onClick={() => router.push('/profile/bookings')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isBookings ? '#45c63d' : '#6e7b8a',
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
              color: isProfile ? '#45c63d' : '#6e7b8a',
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
