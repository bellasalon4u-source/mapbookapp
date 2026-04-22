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

      explore:
        language === 'ES'
          ? 'Explorar'
          : language === 'RU'
          ? 'Обзор'
          : language === 'UA'
          ? 'Огляд'
          : language === 'CZ'
          ? 'Objevovat'
          : language === 'DE'
          ? 'Entdecken'
          : language === 'IT'
          ? 'Esplora'
          : language === 'FR'
          ? 'Explorer'
          : language === 'AR'
          ? 'استكشاف'
          : language === 'PL'
          ? 'Odkrywaj'
          : 'Explore',

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
    };
  }, [language]);

  const isHome = active === 'home' || pathname === '/';
  const isMessages = active === 'messages' || pathname.startsWith('/messages');
  const isBookings =
    active === 'bookings' ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/profile/bookings');
  const isProfile = active === 'profile' || pathname.startsWith('/profile');
  const isExplore = active === 'add' || pathname.startsWith('/add');

  const activeColor = '#45c63d';
  const inactiveColor = '#2b2f36';

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        background: 'transparent',
        padding: '0 12px calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: '#f7f4ee',
          border: '1.5px solid #e6e0d8',
          borderRadius: 28,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          alignItems: 'end',
          padding: '10px 6px 8px',
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
            color: isHome ? activeColor : inactiveColor,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: 31, lineHeight: 1 }}>⌂</span>
          <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.home}</span>
        </button>

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
            color: isBookings ? activeColor : inactiveColor,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>▤</span>
          <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.bookings}</span>
        </button>

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
            color: isExplore ? activeColor : inactiveColor,
            cursor: 'pointer',
            padding: '0',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              background: activeColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 900,
              boxShadow: '0 8px 18px rgba(69,198,61,0.28)',
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, marginTop: 1 }}>{navText.explore}</span>
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
            color: isMessages ? activeColor : inactiveColor,
            cursor: 'pointer',
            padding: '4px 0',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>⌁</span>

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
                  border: '2px solid #f7f4ee',
                }}
              >
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            ) : null}
          </div>

          <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.messages}</span>
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
            color: isProfile ? activeColor : inactiveColor,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>◯</span>
          <span style={{ fontSize: 11, fontWeight: 800 }}>{navText.profile}</span>
        </button>
      </div>
    </nav>
  );
}
