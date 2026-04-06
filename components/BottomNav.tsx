'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getUnreadMessagesCount,
  subscribeToChatStore,
} from '../services/chatStore';
import { getSavedLanguage, t } from '../services/i18n';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [language, setLanguage] = useState(getSavedLanguage());

  useEffect(() => {
    const loadUnread = () => {
      setUnreadMessages(getUnreadMessagesCount());
    };

    loadUnread();
    const unsubscribe = subscribeToChatStore(loadUnread);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    const interval = window.setInterval(syncLanguage, 500);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
      window.clearInterval(interval);
    };
  }, []);

  const tr = t(language);

  const navText = {
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

    addService:
      language === 'ES'
        ? 'Añadir servicio'
        : language === 'RU'
        ? 'Добавить услугу'
        : language === 'CZ'
        ? 'Přidat službu'
        : language === 'DE'
        ? 'Service hinzufügen'
        : language === 'PL'
        ? 'Dodaj usługę'
        : 'Add service',
  };

  const isHome = pathname === '/';
  const isMessages = pathname.startsWith('/messages');
  const isBookings = pathname.startsWith('/bookings');
  const isProfile = pathname.startsWith('/profile');
  const isAdd = pathname.startsWith('/add');

  return (
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
            onClick={() => router.push('/add')}
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
            title={navText.addService}
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
  );
}
