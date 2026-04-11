'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../services/userProfileStore';
import {
  getBookings,
  subscribeToBookingsStore,
} from '../services/bookingsStore';
import {
  getWalletState,
  subscribeToWalletStore,
} from '../services/walletStore';
import {
  getReferralState,
  subscribeToReferralStore,
} from '../services/referralStore';

const profileTexts = {
  EN: {
    title: 'Profile',
    subtitle: 'Manage your account, bookings and settings',
    editProfile: 'Edit profile',
    upcomingBookings: 'Upcoming bookings',
    savedMasters: 'Saved masters',
    myBookings: 'My bookings',
    myBookingsSub: 'Upcoming, completed and cancelled',
    savedMastersSub: 'Professionals you liked',
    savedPlaces: 'Saved places',
    savedPlacesSub: 'Favourite locations on the map',
    messages: 'Messages',
    messagesSub: 'Your chats with professionals',
    balance: 'MapBook Balance',
    balanceSub: 'Top up, withdraw and history',
    inviteFriends: 'Invite friends',
    inviteFriendsSub: '1 friend = 1 free booking',
    paymentMethods: 'Payment methods',
    paymentMethodsSub: 'Cards, PayPal, Google Pay and crypto',
    notifications: 'Notifications',
    notificationsSub: 'Push, messages and bookings',
    languageRegion: 'Language & region',
    help: 'Help Centre',
    helpSub: 'FAQ, support and useful articles',
    accountSettings: 'Account settings',
    accountSettingsSub: 'Personal data, privacy and security',
    logout: 'Log out',
    bonusesTitle: 'Your bonuses',
    bonusesSubtitle: 'Invite friends, earn rewards and use free bookings',
    welcomeBonus: 'Welcome bonus',
    referralBookings: 'Free bookings',
    referralProgress: 'Friends paid',
    inviteButton: 'Invite',
    verified: 'Verified account',
    availableNow: 'Available now',
    quickAccess: 'Quick access',
    profileCardTitle: 'Your profile',
    memberSince: 'MapBook member',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Administra tu cuenta, reservas y ajustes',
    editProfile: 'Editar perfil',
    upcomingBookings: 'Próximas reservas',
    savedMasters: 'Profesionales guardados',
    myBookings: 'Mis reservas',
    myBookingsSub: 'Próximas, completadas y canceladas',
    savedMastersSub: 'Profesionales que te gustaron',
    savedPlaces: 'Lugares guardados',
    savedPlacesSub: 'Ubicaciones favoritas en el mapa',
    messages: 'Mensajes',
    messagesSub: 'Tus chats con profesionales',
    balance: 'Saldo MapBook',
    balanceSub: 'Recargar, retirar e historial',
    inviteFriends: 'Invitar amigos',
    inviteFriendsSub: '1 amigo = 1 reserva gratis',
    paymentMethods: 'Métodos de pago',
    paymentMethodsSub: 'Tarjetas, PayPal, Google Pay y cripto',
    notifications: 'Notificaciones',
    notificationsSub: 'Push, mensajes y reservas',
    languageRegion: 'Idioma y región',
    help: 'Centro de ayuda',
    helpSub: 'FAQ, soporte y artículos útiles',
    accountSettings: 'Configuración de la cuenta',
    accountSettingsSub: 'Datos personales, privacidad y seguridad',
    logout: 'Cerrar sesión',
    bonusesTitle: 'Tus bonos',
    bonusesSubtitle: 'Invita amigos, gana recompensas y usa reservas gratis',
    welcomeBonus: 'Bono de bienvenida',
    referralBookings: 'Reservas gratis',
    referralProgress: 'Amigos pagaron',
    inviteButton: 'Invitar',
    verified: 'Cuenta verificada',
    availableNow: 'Disponible ahora',
    quickAccess: 'Acceso rápido',
    profileCardTitle: 'Tu perfil',
    memberSince: 'Miembro de MapBook',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Управляйте аккаунтом, бронированиями и настройками',
    editProfile: 'Редактировать профиль',
    upcomingBookings: 'Предстоящие бронирования',
    savedMasters: 'Сохранённые мастера',
    myBookings: 'Мои бронирования',
    myBookingsSub: 'Предстоящие, завершённые и отменённые',
    savedMastersSub: 'Мастера, которые вам понравились',
    savedPlaces: 'Сохранённые места',
    savedPlacesSub: 'Любимые локации на карте',
    messages: 'Сообщения',
    messagesSub: 'Ваши чаты с мастерами',
    balance: 'Баланс MapBook',
    balanceSub: 'Пополнение, вывод и история операций',
    inviteFriends: 'Пригласить друзей',
    inviteFriendsSub: '1 друг = 1 бесплатное бронирование',
    paymentMethods: 'Способы оплаты',
    paymentMethodsSub: 'Карты, PayPal, Google Pay и крипта',
    notifications: 'Уведомления',
    notificationsSub: 'Push, сообщения и бронирования',
    languageRegion: 'Язык и регион',
    help: 'Центр помощи',
    helpSub: 'FAQ, поддержка и полезные статьи',
    accountSettings: 'Настройки аккаунта',
    accountSettingsSub: 'Личные данные, приватность и безопасность',
    logout: 'Выйти',
    bonusesTitle: 'Ваши бонусы',
    bonusesSubtitle: 'Приглашайте друзей, получайте бонусы и бесплатные бронирования',
    welcomeBonus: 'Приветственный бонус',
    referralBookings: 'Бесплатные бронирования',
    referralProgress: 'Друзей оплатили',
    inviteButton: 'Пригласить',
    verified: 'Аккаунт подтверждён',
    availableNow: 'Доступно сейчас',
    quickAccess: 'Быстрый доступ',
    profileCardTitle: 'Ваш профиль',
    memberSince: 'Пользователь MapBook',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Spravujte svůj účet, rezervace a nastavení',
    editProfile: 'Upravit profil',
    upcomingBookings: 'Nadcházející rezervace',
    savedMasters: 'Uložení specialisté',
    myBookings: 'Moje rezervace',
    myBookingsSub: 'Nadcházející, dokončené a zrušené',
    savedMastersSub: 'Specialisté, kteří se vám líbí',
    savedPlaces: 'Uložená místa',
    savedPlacesSub: 'Oblíbené lokace na mapě',
    messages: 'Zprávy',
    messagesSub: 'Vaše chaty se specialisty',
    balance: 'Zůstatek MapBook',
    balanceSub: 'Dobití, výběr a historie',
    inviteFriends: 'Pozvat přátele',
    inviteFriendsSub: '1 přítel = 1 rezervace zdarma',
    paymentMethods: 'Platební metody',
    paymentMethodsSub: 'Karty, PayPal, Google Pay a crypto',
    notifications: 'Oznámení',
    notificationsSub: 'Push, zprávy a rezervace',
    languageRegion: 'Jazyk a region',
    help: 'Centrum pomoci',
    helpSub: 'FAQ, podpora a užitečné články',
    accountSettings: 'Nastavení účtu',
    accountSettingsSub: 'Osobní údaje, soukromí a bezpečnost',
    logout: 'Odhlásit se',
    bonusesTitle: 'Vaše bonusy',
    bonusesSubtitle: 'Pozvěte přátele, získejte odměny a rezervace zdarma',
    welcomeBonus: 'Uvítací bonus',
    referralBookings: 'Rezervace zdarma',
    referralProgress: 'Přátelé zaplatili',
    inviteButton: 'Pozvat',
    verified: 'Účet ověřen',
    availableNow: 'Dostupné nyní',
    quickAccess: 'Rychlý přístup',
    profileCardTitle: 'Váš profil',
    memberSince: 'Člen MapBook',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Verwalte dein Konto, Buchungen und Einstellungen',
    editProfile: 'Profil bearbeiten',
    upcomingBookings: 'Bevorstehende Buchungen',
    savedMasters: 'Gespeicherte Profis',
    myBookings: 'Meine Buchungen',
    myBookingsSub: 'Bevorstehend, abgeschlossen und storniert',
    savedMastersSub: 'Profis, die dir gefallen haben',
    savedPlaces: 'Gespeicherte Orte',
    savedPlacesSub: 'Lieblingsorte auf der Karte',
    messages: 'Nachrichten',
    messagesSub: 'Deine Chats mit Profis',
    balance: 'MapBook Guthaben',
    balanceSub: 'Aufladen, auszahlen und Verlauf',
    inviteFriends: 'Freunde einladen',
    inviteFriendsSub: '1 Freund = 1 kostenlose Buchung',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsSub: 'Karten, PayPal, Google Pay und Krypto',
    notifications: 'Benachrichtigungen',
    notificationsSub: 'Push, Nachrichten und Buchungen',
    languageRegion: 'Sprache & Region',
    help: 'Hilfezentrum',
    helpSub: 'FAQ, Support und nützliche Artikel',
    accountSettings: 'Kontoeinstellungen',
    accountSettingsSub: 'Persönliche Daten, Datenschutz und Sicherheit',
    logout: 'Abmelden',
    bonusesTitle: 'Deine Boni',
    bonusesSubtitle: 'Lade Freunde ein, sammle Belohnungen und kostenlose Buchungen',
    welcomeBonus: 'Willkommensbonus',
    referralBookings: 'Kostenlose Buchungen',
    referralProgress: 'Freunde bezahlt',
    inviteButton: 'Einladen',
    verified: 'Konto bestätigt',
    availableNow: 'Jetzt verfügbar',
    quickAccess: 'Schnellzugriff',
    profileCardTitle: 'Dein Profil',
    memberSince: 'MapBook Mitglied',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Zarządzaj kontem, rezerwacjami i ustawieniami',
    editProfile: 'Edytuj profil',
    upcomingBookings: 'Nadchodzące rezerwacje',
    savedMasters: 'Zapisani specjaliści',
    myBookings: 'Moje rezerwacje',
    myBookingsSub: 'Nadchodzące, zakończone i anulowane',
    savedMastersSub: 'Specjaliści, którzy Ci się spodobali',
    savedPlaces: 'Zapisane miejsca',
    savedPlacesSub: 'Ulubione lokalizacje na mapie',
    messages: 'Wiadomości',
    messagesSub: 'Twoje czaty ze specjalistami',
    balance: 'Saldo MapBook',
    balanceSub: 'Doładowanie, wypłata i historia',
    inviteFriends: 'Zaproś znajomych',
    inviteFriendsSub: '1 znajomy = 1 darmowa rezerwacja',
    paymentMethods: 'Metody płatności',
    paymentMethodsSub: 'Karty, PayPal, Google Pay i krypto',
    notifications: 'Powiadomienia',
    notificationsSub: 'Push, wiadomości i rezerwacje',
    languageRegion: 'Język i region',
    help: 'Centrum pomocy',
    helpSub: 'FAQ, wsparcie i przydatne artykuły',
    accountSettings: 'Ustawienia konta',
    accountSettingsSub: 'Dane osobowe, prywatność i bezpieczeństwo',
    logout: 'Wyloguj się',
    bonusesTitle: 'Twoje bonusy',
    bonusesSubtitle: 'Zapraszaj znajomych, odbieraj bonusy i darmowe rezerwacje',
    welcomeBonus: 'Bonus powitalny',
    referralBookings: 'Darmowe rezerwacje',
    referralProgress: 'Znajomi zapłacili',
    inviteButton: 'Zaproś',
    verified: 'Konto potwierdzone',
    availableNow: 'Dostępne teraz',
    quickAccess: 'Szybki dostęp',
    profileCardTitle: 'Twój profil',
    memberSince: 'Użytkownik MapBook',
  },
} as const;

type MenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  rightLabel?: string;
  danger?: boolean;
  icon: string;
  accent?: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'neutral' | 'danger';
};

function getAccentStyles(
  accent: MenuItem['accent'] = 'neutral',
  filled = false
): React.CSSProperties {
  if (accent === 'pink') {
    return filled
      ? { background: '#ff4fa0', color: '#fff' }
      : { background: '#fff1f7', color: '#ff4fa0' };
  }

  if (accent === 'green') {
    return filled
      ? { background: '#2fa35a', color: '#fff' }
      : { background: '#eef9f1', color: '#2fa35a' };
  }

  if (accent === 'blue') {
    return filled
      ? { background: '#2f7cf6', color: '#fff' }
      : { background: '#eef4ff', color: '#2f7cf6' };
  }

  if (accent === 'violet') {
    return filled
      ? { background: '#7a5af8', color: '#fff' }
      : { background: '#f3efff', color: '#7a5af8' };
  }

  if (accent === 'orange') {
    return filled
      ? { background: '#f59e0b', color: '#fff' }
      : { background: '#fff6e8', color: '#d97706' };
  }

  if (accent === 'danger') {
    return filled
      ? { background: '#ef4444', color: '#fff' }
      : { background: '#fff1f1', color: '#ef4444' };
  }

  return filled
    ? { background: '#2f241c', color: '#fff' }
    : { background: '#f6efe6', color: '#5f5247' };
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [bookingsCount, setBookingsCount] = useState(0);
  const [savedMastersCount, setSavedMastersCount] = useState(
    getUserProfile().savedMastersCount
  );
  const [availableBalance, setAvailableBalance] = useState(
    getWalletState().availableBalance
  );
  const [welcomeBonus, setWelcomeBonus] = useState(
    getWalletState().welcomeBonus
  );
  const [referralFreeBookings, setReferralFreeBookings] = useState(
    getReferralState().freeBookingsAvailable
  );
  const [paidFriendsCount, setPaidFriendsCount] = useState(
    getReferralState().completedReferralsCount || 0
  );

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      const next = getUserProfile();
      setProfile(next);
      setSavedMastersCount(next.savedMastersCount);
    };

    const syncBookings = () => {
      const all = getBookings();
      const nextCount = all.filter(
        (booking) => booking.status === 'upcoming' || booking.status === 'pending'
      ).length;
      setBookingsCount(nextCount);
    };

    const syncWallet = () => {
      const wallet = getWalletState();
      setAvailableBalance(wallet.availableBalance);
      setWelcomeBonus(wallet.welcomeBonus);
    };

    const syncReferral = () => {
      const referral = getReferralState();
      setReferralFreeBookings(referral.freeBookingsAvailable);
      setPaidFriendsCount(referral.completedReferralsCount || 0);
    };

    syncLanguage();
    syncProfile();
    syncBookings();
    syncWallet();
    syncReferral();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubBookings = subscribeToBookingsStore(syncBookings);
    const unsubWallet = subscribeToWalletStore(syncWallet);
    const unsubReferral = subscribeToReferralStore(syncReferral);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubBookings();
      unsubWallet();
      unsubReferral();
    };
  }, []);

  const text = profileTexts[language as keyof typeof profileTexts] || profileTexts.EN;

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        id: 'bookings',
        title: text.myBookings,
        subtitle: text.myBookingsSub,
        href: '/profile/bookings',
        icon: '📅',
        accent: 'green',
      },
      {
        id: 'saved-masters',
        title: text.savedMasters,
        subtitle: text.savedMastersSub,
        href: '/profile/saved-masters',
        rightLabel: savedMastersCount > 0 ? String(savedMastersCount) : undefined,
        icon: '❤️',
        accent: 'pink',
      },
      {
        id: 'saved-places',
        title: text.savedPlaces,
        subtitle: text.savedPlacesSub,
        href: '/profile/saved-places',
        icon: '📍',
        accent: 'orange',
      },
      {
        id: 'messages',
        title: text.messages,
        subtitle: text.messagesSub,
        href: '/messages',
        icon: '✉️',
        accent: 'blue',
      },
      {
        id: 'balance',
        title: text.balance,
        subtitle: text.balanceSub,
        href: '/profile/balance',
        rightLabel: `£${availableBalance.toFixed(2)}`,
        icon: '💳',
        accent: 'violet',
      },
      {
        id: 'invite',
        title: text.inviteFriends,
        subtitle: text.inviteFriendsSub,
        href: '/profile/invite',
        rightLabel: referralFreeBookings > 0 ? `${referralFreeBookings}` : undefined,
        icon: '🎁',
        accent: 'pink',
      },
      {
        id: 'payments',
        title: text.paymentMethods,
        subtitle: text.paymentMethodsSub,
        href: '/profile/payments',
        icon: '💼',
        accent: 'blue',
      },
      {
        id: 'notifications',
        title: text.notifications,
        subtitle: text.notificationsSub,
        href: '/profile/notifications',
        icon: '🔔',
        accent: 'orange',
      },
      {
        id: 'language-region',
        title: text.languageRegion,
        subtitle: `${profile.language} · ${profile.region}`,
        href: '/profile/language-region',
        icon: '🌍',
        accent: 'green',
      },
      {
        id: 'help',
        title: text.help,
        subtitle: text.helpSub,
        href: '/profile/help',
        icon: '❓',
        accent: 'violet',
      },
      {
        id: 'settings',
        title: text.accountSettings,
        subtitle: text.accountSettingsSub,
        href: '/profile/settings',
        icon: '⚙️',
        accent: 'neutral',
      },
      {
        id: 'logout',
        title: text.logout,
        danger: true,
        href: '/',
        icon: '⎋',
        accent: 'danger',
      },
    ],
    [
      availableBalance,
      profile.language,
      profile.region,
      referralFreeBookings,
      savedMastersCount,
      text.accountSettings,
      text.accountSettingsSub,
      text.balance,
      text.balanceSub,
      text.help,
      text.helpSub,
      text.inviteFriends,
      text.inviteFriendsSub,
      text.languageRegion,
      text.logout,
      text.messages,
      text.messagesSub,
      text.myBookings,
      text.myBookingsSub,
      text.notifications,
      text.notificationsSub,
      text.paymentMethods,
      text.paymentMethodsSub,
      text.savedMasters,
      text.savedMastersSub,
      text.savedPlaces,
      text.savedPlacesSub,
    ]
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 14,
            alignItems: 'start',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 999,
                background: '#fff',
                border: '1px solid #efe4d7',
                boxShadow: '0 8px 20px rgba(44, 23, 10, 0.04)',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14 }}>👤</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#6f6458',
                  letterSpacing: 0.3,
                }}
              >
                {text.profileCardTitle}
              </span>
            </div>

            <h1
              style={{
                fontSize: 40,
                lineHeight: 1.02,
                fontWeight: 900,
                color: '#17130f',
                margin: 0,
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                marginTop: 8,
                fontSize: 15,
                lineHeight: 1.55,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/settings')}
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 24,
              color: '#241c16',
              boxShadow: '0 10px 24px rgba(44, 23, 10, 0.06)',
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
        </div>

        {(welcomeBonus > 0 || referralFreeBookings > 0 || paidFriendsCount > 0) && (
          <div
            style={{
              marginTop: 18,
              borderRadius: 30,
              border: '1px solid #f0e3d7',
              background: 'linear-gradient(180deg, #ffffff 0%, #fff8f5 100%)',
              padding: 18,
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.bonusesTitle}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  {text.bonusesSubtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/profile/invite')}
                style={{
                  ...getAccentStyles('pink', true),
                  border: 'none',
                  borderRadius: 18,
                  minHeight: 52,
                  padding: '0 18px',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 12px 24px rgba(255,79,160,0.22)',
                }}
              >
                {text.inviteButton}
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              <div
                style={{
                  borderRadius: 22,
                  padding: 14,
                  ...getAccentStyles('orange', false),
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>🎉</div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.3,
                    fontWeight: 800,
                    opacity: 0.88,
                    minHeight: 30,
                  }}
                >
                  {text.welcomeBonus}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  £{welcomeBonus.toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  padding: 14,
                  ...getAccentStyles('green', false),
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.3,
                    fontWeight: 800,
                    opacity: 0.88,
                    minHeight: 30,
                  }}
                >
                  {text.referralProgress}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  {paidFriendsCount}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  padding: 14,
                  ...getAccentStyles('pink', false),
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>🎁</div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.3,
                    fontWeight: 800,
                    opacity: 0.88,
                    minHeight: 30,
                  }}
                >
                  {text.referralBookings}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  {referralFreeBookings}
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 18,
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
              gridTemplateColumns: '88px 1fr',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={profile.avatar}
                alt={profile.fullName}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 28,
                  objectFit: 'cover',
                  display: 'block',
                  boxShadow: '0 12px 26px rgba(44, 23, 10, 0.12)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -4,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: '#2fa35a',
                  border: '3px solid #fff',
                  boxShadow: '0 6px 14px rgba(47,163,90,0.22)',
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.1,
                  }}
                >
                  {profile.fullName}
                </h2>

                <span
                  style={{
                    ...getAccentStyles('green', false),
                    borderRadius: 999,
                    padding: '7px 10px',
                    fontSize: 11,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text.availableNow}
                </span>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: '#73695f',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  color: '#73695f',
                  fontWeight: 700,
                }}
              >
                {profile.phone}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  color: '#73695f',
                  fontWeight: 700,
                }}
              >
                {profile.city}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {profile.isVerified && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: 999,
                      padding: '9px 12px',
                      ...getAccentStyles('green', false),
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    <span>🛡️</span>
                    <span>{text.verified}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 999,
                    padding: '9px 12px',
                    ...getAccentStyles('blue', false),
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  <span>✨</span>
                  <span>{text.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/edit')}
            style={{
              marginTop: 18,
              width: '100%',
              border: 'none',
              borderRadius: 22,
              padding: '17px 18px',
              background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 14px 28px rgba(31,23,18,0.20)',
            }}
          >
            {text.editProfile}
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.quickAccess}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/bookings')}
              style={{
                border: 'none',
                borderRadius: 28,
                padding: 18,
                textAlign: 'left',
                background: 'linear-gradient(180deg, #2d241d 0%, #1f1712 100%)',
                color: '#fff',
                boxShadow: '0 12px 26px rgba(31,23,18,0.16)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>📅</div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.35,
                  color: '#dbcfc1',
                  fontWeight: 800,
                  minHeight: 34,
                }}
              >
                {text.upcomingBookings}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 40,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {bookingsCount}
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/saved-masters')}
              style={{
                border: '1px solid #efe4d7',
                borderRadius: 28,
                padding: 18,
                textAlign: 'left',
                background: '#fff',
                color: '#17130f',
                boxShadow: '0 12px 26px rgba(44, 23, 10, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>❤️</div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.35,
                  color: '#7a7167',
                  fontWeight: 800,
                  minHeight: 34,
                }}
              >
                {text.savedMasters}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 40,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#17130f',
                }}
              >
                {savedMastersCount}
              </div>
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          {menuItems.map((item, index) => {
            const accentStyles = getAccentStyles(item.accent, false);

            const content = (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '16px 18px',
                  borderTop: index !== 0 ? '1px solid #f4eadf' : 'none',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    ...accentStyles,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: item.danger ? '#ef4444' : '#17130f',
                    }}
                  >
                    {item.title}
                  </div>

                  {item.subtitle ? (
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
                  ) : null}
                </div>

                {!item.danger ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {item.rightLabel ? (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: '7px 10px',
                          ...getAccentStyles(item.accent, false),
                          fontSize: 12,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.rightLabel}
                      </span>
                    ) : null}

                    <span
                      style={{
                        fontSize: 20,
                        color: '#938475',
                        fontWeight: 900,
                      }}
                    >
                      ›
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 20,
                      color: '#ef4444',
                      fontWeight: 900,
                    }}
                  >
                    ›
                  </span>
                )}
              </div>
            );

            if (!item.href) {
              return <div key={item.id}>{content}</div>;
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                }}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
