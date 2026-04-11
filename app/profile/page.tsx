'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../services/userProfileStore';
import { getWalletState, subscribeToWalletStore, type WalletState } from '../services/walletStore';
import {
  getBookings,
  subscribeToBookingsStore,
  type BookingItem,
} from '../services/bookingsStore';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
} from '../../services/likedMastersStore';

const profileTexts = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, activity and quick actions',
    verified: 'Verified',
    secure: 'Secure account',
    editProfile: 'Edit profile',
    editProfileSub: 'Photo, bio, contacts and personal details',
    myBookings: 'My bookings',
    myBookingsSub: 'Upcoming, completed and cancelled bookings',
    savedMasters: 'Saved masters',
    savedMastersSub: 'Professionals you liked and saved',
    savedPlaces: 'Saved places',
    savedPlacesSub: 'Favourite map locations and routes',
    balance: 'Balance',
    balanceSub: 'Wallet, refunds and transactions',
    payments: 'Payment methods',
    paymentsSub: 'Cards, PayPal, wallets and payouts',
    notifications: 'Notifications',
    notificationsSub: 'Messages, bookings and reminders',
    help: 'Help Centre',
    helpSub: 'Answers, support and useful guides',
    legal: 'Legal information',
    legalSub: 'Policies, rules and payment terms',
    settings: 'Account settings',
    settingsSub: 'Privacy, security and account actions',
    languageRegion: 'Language & region',
    languageRegionSub: 'Language, country, currency and location',
    overview: 'Overview',
    bookingsCount: 'Bookings',
    savedCount: 'Saved',
    walletReady: 'Wallet ready',
    open: 'Open',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Tu cuenta, actividad y accesos rápidos',
    verified: 'Verificado',
    secure: 'Cuenta segura',
    editProfile: 'Editar perfil',
    editProfileSub: 'Foto, bio, contactos y datos personales',
    myBookings: 'Mis reservas',
    myBookingsSub: 'Reservas próximas, completadas y canceladas',
    savedMasters: 'Profesionales guardados',
    savedMastersSub: 'Profesionales que te gustaron y guardaste',
    savedPlaces: 'Lugares guardados',
    savedPlacesSub: 'Ubicaciones favoritas del mapa y rutas',
    balance: 'Saldo',
    balanceSub: 'Billetera, reembolsos y transacciones',
    payments: 'Métodos de pago',
    paymentsSub: 'Tarjetas, PayPal, billeteras y pagos',
    notifications: 'Notificaciones',
    notificationsSub: 'Mensajes, reservas y recordatorios',
    help: 'Centro de ayuda',
    helpSub: 'Respuestas, soporte y guías útiles',
    legal: 'Información legal',
    legalSub: 'Políticas, reglas y términos de pago',
    settings: 'Configuración de la cuenta',
    settingsSub: 'Privacidad, seguridad y acciones de cuenta',
    languageRegion: 'Idioma y región',
    languageRegionSub: 'Idioma, país, moneda y ubicación',
    overview: 'Resumen',
    bookingsCount: 'Reservas',
    savedCount: 'Guardados',
    walletReady: 'Billetera lista',
    open: 'Abrir',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, активность и быстрые действия',
    verified: 'Проверено',
    secure: 'Аккаунт защищён',
    editProfile: 'Редактировать профиль',
    editProfileSub: 'Фото, bio, контакты и личные данные',
    myBookings: 'Мои бронирования',
    myBookingsSub: 'Предстоящие, завершённые и отменённые записи',
    savedMasters: 'Сохранённые мастера',
    savedMastersSub: 'Мастера, которые вам понравились и сохранены',
    savedPlaces: 'Сохранённые места',
    savedPlacesSub: 'Любимые локации на карте и маршруты',
    balance: 'Баланс',
    balanceSub: 'Кошелёк, возвраты и транзакции',
    payments: 'Способы оплаты',
    paymentsSub: 'Карты, PayPal, кошельки и выплаты',
    notifications: 'Уведомления',
    notificationsSub: 'Сообщения, бронирования и напоминания',
    help: 'Центр помощи',
    helpSub: 'Ответы, поддержка и полезные гайды',
    legal: 'Юридическая информация',
    legalSub: 'Политики, правила и условия оплаты',
    settings: 'Настройки аккаунта',
    settingsSub: 'Приватность, безопасность и действия аккаунта',
    languageRegion: 'Язык и регион',
    languageRegionSub: 'Язык, страна, валюта и локация',
    overview: 'Обзор',
    bookingsCount: 'Бронирования',
    savedCount: 'Сохранено',
    walletReady: 'Кошелёк готов',
    open: 'Открыть',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Váš účet, aktivita a rychlé akce',
    verified: 'Ověřeno',
    secure: 'Bezpečný účet',
    editProfile: 'Upravit profil',
    editProfileSub: 'Fotka, bio, kontakty a osobní údaje',
    myBookings: 'Moje rezervace',
    myBookingsSub: 'Nadcházející, dokončené a zrušené rezervace',
    savedMasters: 'Uložení specialisté',
    savedMastersSub: 'Specialisté, které jste si oblíbili',
    savedPlaces: 'Uložená místa',
    savedPlacesSub: 'Oblíbená místa na mapě a trasy',
    balance: 'Zůstatek',
    balanceSub: 'Peněženka, refundy a transakce',
    payments: 'Platební metody',
    paymentsSub: 'Karty, PayPal, peněženky a výplaty',
    notifications: 'Oznámení',
    notificationsSub: 'Zprávy, rezervace a připomínky',
    help: 'Centrum pomoci',
    helpSub: 'Odpovědi, podpora a užitečné návody',
    legal: 'Právní informace',
    legalSub: 'Zásady, pravidla a platební podmínky',
    settings: 'Nastavení účtu',
    settingsSub: 'Soukromí, zabezpečení a akce účtu',
    languageRegion: 'Jazyk a region',
    languageRegionSub: 'Jazyk, země, měna a poloha',
    overview: 'Přehled',
    bookingsCount: 'Rezervace',
    savedCount: 'Uloženo',
    walletReady: 'Peněženka připravena',
    open: 'Otevřít',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Dein Konto, Aktivität und Schnellzugriffe',
    verified: 'Verifiziert',
    secure: 'Geschütztes Konto',
    editProfile: 'Profil bearbeiten',
    editProfileSub: 'Foto, Bio, Kontakte und persönliche Daten',
    myBookings: 'Meine Buchungen',
    myBookingsSub: 'Bevorstehende, abgeschlossene und stornierte Buchungen',
    savedMasters: 'Gespeicherte Profis',
    savedMastersSub: 'Profis, die dir gefallen und die du gespeichert hast',
    savedPlaces: 'Gespeicherte Orte',
    savedPlacesSub: 'Lieblingsorte auf der Karte und Routen',
    balance: 'Guthaben',
    balanceSub: 'Wallet, Rückerstattungen und Transaktionen',
    payments: 'Zahlungsmethoden',
    paymentsSub: 'Karten, PayPal, Wallets und Auszahlungen',
    notifications: 'Benachrichtigungen',
    notificationsSub: 'Nachrichten, Buchungen und Erinnerungen',
    help: 'Hilfezentrum',
    helpSub: 'Antworten, Support und nützliche Guides',
    legal: 'Rechtliche Informationen',
    legalSub: 'Richtlinien, Regeln und Zahlungsbedingungen',
    settings: 'Kontoeinstellungen',
    settingsSub: 'Datenschutz, Sicherheit und Kontoaktionen',
    languageRegion: 'Sprache & Region',
    languageRegionSub: 'Sprache, Land, Währung und Standort',
    overview: 'Übersicht',
    bookingsCount: 'Buchungen',
    savedCount: 'Gespeichert',
    walletReady: 'Wallet bereit',
    open: 'Öffnen',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Twoje konto, aktywność i szybkie działania',
    verified: 'Zweryfikowano',
    secure: 'Bezpieczne konto',
    editProfile: 'Edytuj profil',
    editProfileSub: 'Zdjęcie, bio, kontakty i dane osobowe',
    myBookings: 'Moje rezerwacje',
    myBookingsSub: 'Nadchodzące, zakończone i anulowane rezerwacje',
    savedMasters: 'Zapisani specjaliści',
    savedMastersSub: 'Specjaliści, których polubiłeś i zapisałeś',
    savedPlaces: 'Zapisane miejsca',
    savedPlacesSub: 'Ulubione miejsca na mapie i trasy',
    balance: 'Saldo',
    balanceSub: 'Portfel, zwroty i transakcje',
    payments: 'Metody płatności',
    paymentsSub: 'Karty, PayPal, portfele i wypłaty',
    notifications: 'Powiadomienia',
    notificationsSub: 'Wiadomości, rezerwacje i przypomnienia',
    help: 'Centrum pomocy',
    helpSub: 'Odpowiedzi, wsparcie i przydatne poradniki',
    legal: 'Informacje prawne',
    legalSub: 'Polityki, zasady i warunki płatności',
    settings: 'Ustawienia konta',
    settingsSub: 'Prywatność, bezpieczeństwo i działania konta',
    languageRegion: 'Język i region',
    languageRegionSub: 'Język, kraj, waluta i lokalizacja',
    overview: 'Przegląd',
    bookingsCount: 'Rezerwacje',
    savedCount: 'Zapisane',
    walletReady: 'Portfel gotowy',
    open: 'Otwórz',
  },
} as const;

type ProfileCardItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange';
  onClick: () => void;
};

function accentStyles(accent: ProfileCardItem['accent']) {
  if (accent === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (accent === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (accent === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (accent === 'violet') return { background: '#f3efff', color: '#7a5af8' };
  return { background: '#fff5e8', color: '#d68612' };
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [likedIds, setLikedIds] = useState<(string | number)[]>(getLikedMasterIds());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncProfile = () => setProfile(getUserProfile());
    const syncWallet = () => setWallet(getWalletState());
    const syncBookings = () => setBookings(getBookings());
    const syncLiked = () => setLikedIds(getLikedMasterIds());

    syncLanguage();
    syncProfile();
    syncWallet();
    syncBookings();
    syncLiked();

    window.addEventListener('focus', syncLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);
    const unsubBookings = subscribeToBookingsStore(syncBookings);
    const unsubLiked = subscribeToLikedMasters(syncLiked);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubProfile();
      unsubWallet();
      unsubBookings();
      unsubLiked();
    };
  }, []);

  const text = useMemo(
    () => profileTexts[language as keyof typeof profileTexts] || profileTexts.EN,
    [language]
  );

  const upcomingCount = useMemo(
    () => bookings.filter((item) => item.status === 'upcoming' || item.status === 'pending').length,
    [bookings]
  );

  const cards: ProfileCardItem[] = [
    {
      id: 'edit',
      title: text.editProfile,
      subtitle: text.editProfileSub,
      icon: '👤',
      accent: 'blue',
      onClick: () => router.push('/profile/edit'),
    },
    {
      id: 'bookings',
      title: text.myBookings,
      subtitle: text.myBookingsSub,
      icon: '📅',
      accent: 'green',
      onClick: () => router.push('/profile/bookings'),
    },
    {
      id: 'saved-masters',
      title: text.savedMasters,
      subtitle: text.savedMastersSub,
      icon: '❤️',
      accent: 'pink',
      onClick: () => router.push('/profile/saved-masters'),
    },
    {
      id: 'saved-places',
      title: text.savedPlaces,
      subtitle: text.savedPlacesSub,
      icon: '📍',
      accent: 'orange',
      onClick: () => router.push('/profile/saved-places'),
    },
    {
      id: 'balance',
      title: text.balance,
      subtitle: text.balanceSub,
      icon: '💼',
      accent: 'violet',
      onClick: () => router.push('/profile/balance'),
    },
    {
      id: 'payments',
      title: text.payments,
      subtitle: text.paymentsSub,
      icon: '💳',
      accent: 'green',
      onClick: () => router.push('/profile/payments'),
    },
    {
      id: 'notifications',
      title: text.notifications,
      subtitle: text.notificationsSub,
      icon: '🔔',
      accent: 'pink',
      onClick: () => router.push('/profile/notifications'),
    },
    {
      id: 'help',
      title: text.help,
      subtitle: text.helpSub,
      icon: '❓',
      accent: 'orange',
      onClick: () => router.push('/profile/help'),
    },
    {
      id: 'legal',
      title: text.legal,
      subtitle: text.legalSub,
      icon: '⚖️',
      accent: 'blue',
      onClick: () => router.push('/profile/legal'),
    },
    {
      id: 'language-region',
      title: text.languageRegion,
      subtitle: text.languageRegionSub,
      icon: '🌍',
      accent: 'violet',
      onClick: () => router.push('/profile/language-region'),
    },
    {
      id: 'settings',
      title: text.settings,
      subtitle: text.settingsSub,
      icon: '⚙️',
      accent: 'green',
      onClick: () => router.push('/profile/settings'),
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.title}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: '#7b7268',
              fontWeight: 700,
            }}
          >
            {text.subtitle}
          </div>
        </div>

        <div
          style={{
            borderRadius: 32,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '84px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.fullName}
              style={{
                width: 84,
                height: 84,
                borderRadius: 28,
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 10px 22px rgba(44, 23, 10, 0.10)',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#7b7268',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    borderRadius: 999,
                    padding: '8px 12px',
                    background: '#eef9f1',
                    color: '#2fa35a',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {text.secure}
                </span>

                {profile.isVerified ? (
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '8px 12px',
                      background: '#eef4ff',
                      color: '#2f7cf6',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {text.verified}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            padding: 16,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.overview}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.bookingsCount}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {upcomingCount}
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.savedCount}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {likedIds.length}
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.walletReady}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                £{wallet.availableBalance.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gap: 12,
          }}
        >
          {cards.map((item) => {
            const accent = accentStyles(item.accent);

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  border: '1px solid #efe4d7',
                  borderRadius: 30,
                  background: '#fff',
                  padding: 16,
                  textAlign: 'left',
                  boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    ...accent,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: '#7b7268',
                      fontWeight: 700,
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 18,
                    color: '#938475',
                    fontWeight: 900,
                  }}
                >
                  {text.open}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
