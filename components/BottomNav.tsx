'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getUnreadMessagesCount,
  subscribeToChatStore,
} from '../services/chatStore';
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
        language === 'ES' ? 'Inicio' :
        language === 'RU' ? 'Главная' :
        language === 'CZ' ? 'Domů' :
        language === 'DE' ? 'Start' :
        language === 'PL' ? 'Start' :
        'Home',

      messages:
        language === 'ES' ? 'Mensajes' :
        language === 'RU' ? 'Сообщения' :
        language === 'CZ' ? 'Zprávy' :
        language === 'DE' ? 'Nachrichten' :
        language === 'PL' ? 'Wiadomości' :
        'Messages',

      add:
        language === 'ES' ? 'Añadir' :
        language === 'RU' ? 'Добавить' :
        language === 'CZ' ? 'Přidat' :
        language === 'DE' ? 'Hinzufügen' :
        language === 'PL' ? 'Dodaj' :
        'Add',

      bookings:
        language === 'ES' ? 'Reservas' :
        language === 'RU' ? 'Брони' :
        language === 'CZ' ? 'Rezervace' :
        language === 'DE' ? 'Buchungen' :
        language === 'PL' ? 'Rezerwacje' :
        'Bookings',

      profile:
        language === 'ES' ? 'Perfil' :
        language === 'RU' ? 'Профиль' :
        language === 'CZ' ? 'Profil' :
        language === 'DE' ? 'Profil' :
        language === 'PL' ? 'Profil' :
        'Profile',

      addService:
        language === 'ES' ? 'Añadir servicio' :
        language === 'RU' ? 'Добавить услугу' :
        language === 'CZ' ? 'Přidat službu' :
        language === 'DE' ? 'Service hinzufügen' :
        language === 'PL' ? 'Dodaj usługę' :
        'Add service',

      addPromotion:
        language === 'ES' ? 'Añadir promoción' :
        language === 'RU' ? 'Добавить рекламу' :
        language === 'CZ' ? 'Přidat reklamu' :
        language === 'DE' ? 'Werbung hinzufügen' :
        language === 'PL' ? 'Dodaj reklamę' :
        'Add promotion',

      chooseAdd:
        language === 'ES' ? '¿Qué quieres añadir?' :
        language === 'RU' ? 'Что вы хотите добавить?' :
        language === 'CZ' ? 'Co chcete přidat?' :
        language === 'DE' ? 'Was möchten Sie hinzufügen?' :
        language === 'PL' ? 'Co chcesz dodać?' :
        'What do you want to add?',

      chooseAddSubtitle:
        language === 'ES' ? 'Elige lo que quieres crear' :
        language === 'RU' ? 'Выберите, что хотите создать' :
        language === 'CZ' ? 'Vyberte, co chcete vytvořit' :
        language === 'DE' ? 'Wählen Sie aus, was Sie erstellen möchten' :
        language === 'PL' ? 'Wybierz, co chcesz utworzyć' :
        'Choose what you want to create',

      serviceDescription:
        language === 'ES' ? 'Publica un nuevo servicio para clientes' :
        language === 'RU' ? 'Разместите новую услугу для клиентов' :
        language === 'CZ' ? 'Přidejte novou službu pro klienty' :
        language === 'DE' ? 'Neue Dienstleistung für Kunden hinzufügen' :
        language === 'PL' ? 'Dodaj nową usługę dla klientów' :
        'Add a new service for clients',

      promotionDescription:
        language === 'ES' ? 'Promociona tu servicio y consigue más visitas' :
        language === 'RU' ? 'Продвигайте услугу и получайте больше просмотров' :
        language === 'CZ' ? 'Propagujte službu a získejte více zobrazení' :
        language === 'DE' ? 'Bewerben Sie Ihre Dienstleistung und erhalten Sie mehr Aufrufe' :
        language === 'PL' ? 'Promuj usługę i zdobądź więcej wyświetleń' :
        'Promote your service and get more views',

      cancel:
        language === 'ES' ? 'Cancelar' :
        language === 'RU' ? 'Отмена' :
        language === 'CZ' ? 'Zrušit' :
        language === 'DE' ? 'Abbrechen' :
        language === 'PL' ? 'Anuluj' :
        'Cancel',
    };
  }, [language]);

  const isHome = pathname === '/';
  const isMessages = pathname.startsWith('/messages');
  const isBookings = pathname.startsWith('/bookings');
  const isProfile = pathname.startsWith('/profile');
  const isAdd = pathname.startsWith('/add') || pathname.startsWith('/profile/promotions');

  const handleOpenAddMenu = () => setShowAddMenu(true);
  const handleCloseAddMenu = () => setShowAddMenu(false);

  const handleGoToService = () => {
    setShowAddMenu(false);
    router.push('/add');
  };

  const handleGoToPromotion = () => {
    setShowAddMenu(false);
    router.push('/profile/promotions');
  };

  return (
    <>
      {showAddMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 20, 20, 0.35)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={handleCloseAddMenu}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              background: '#ffffff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: '14px 14px 22px',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.16)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 5,
                borderRadius: 999,
                background: '#e6e0d8',
                margin: '0 auto 16px',
              }}
            />

            <div
              style={{
                textAlign: 'center',
                fontSize: 30,
                fontWeight: 900,
                color: '#1f2430',
                marginBottom: 8,
              }}
            >
              {navText.chooseAdd}
            </div>

            <div
              style={{
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 600,
                color: '#7b848f',
                marginBottom: 18,
              }}
            >
              {navText.chooseAddSubtitle}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <button
                onClick={handleGoToService}
                style={{
                  border: '1px solid #dce9dd',
                  background: '#fcfffc',
                  borderRadius: 24,
                  padding: '22px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: '#eef8ef',
                    color: '#3f9a4f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  ☐
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#1f2430',
                    lineHeight: 1.25,
                    marginBottom: 10,
                  }}
                >
                  {navText.addService}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#7b848f',
                    lineHeight: 1.45,
                  }}
                >
                  {navText.serviceDescription}
                </div>
              </button>

              <button
                onClick={handleGoToPromotion}
                style={{
                  border: '1px solid #f2dbe5',
                  background: '#fffdfd',
                  borderRadius: 24,
                  padding: '22px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: '#fff0f7',
                    color: '#ff4fa0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  📣
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#1f2430',
                    lineHeight: 1.25,
                    marginBottom: 10,
                  }}
                >
                  {navText.addPromotion}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#7b848f',
                    lineHeight: 1.45,
                  }}
                >
                  {navText.promotionDescription}
                </div>
              </button>
            </div>

            <button
              onClick={handleCloseAddMenu}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 18,
                border: '1px solid #e7dfd2',
                background: '#ffffff',
                color: '#1f2430',
                fontSize: 19,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {navText.cancel}
            </button>
          </div>
        </div>
      )}

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(245,243,239,0.98)',
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
            padding: '10px 8px 12px',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isHome ? '#1f5d99' : '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>⌂</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{navText.home}</span>
          </button>

          <button
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
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>✉</span>

              {unreadMessages > 0 && (
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
                    border: '2px solid #f5f3ef',
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
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
              onClick={handleOpenAddMenu}
              style={{
                width: 78,
                height: 78,
                borderRadius: 999,
                border: '4px solid #4cab5d',
                background: isAdd ? '#4cab5d' : '#ffffff',
                color: isAdd ? '#ffffff' : '#3f9a4f',
                boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
              title={navText.add}
            >
              <span style={{ fontSize: 36, lineHeight: 1, fontWeight: 400 }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.add}</span>
            </button>
          </div>

          <button
            onClick={() => router.push('/bookings')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isBookings ? '#1f5d99' : '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>▤</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{navText.bookings}</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: isProfile ? '#1f5d99' : '#6e7b8a',
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
