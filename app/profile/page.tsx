'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../services/i18n';
import { getUserProfile, subscribeToUserProfile, type UserProfile } from '../services/userProfileStore';
import { getBookings, subscribeToBookingsStore } from '../services/bookingsStore';
import { getWalletState, subscribeToWalletStore } from '../services/walletStore';
import { getReferralState, subscribeToReferralStore } from '../services/referralStore';

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
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Referral free bookings',
    inviteButton: 'Invite',
    verified: 'Account verified',
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
    welcomeBonus: 'Bono de bienvenida',
    referralBookings: 'Reservas gratis por referidos',
    inviteButton: 'Invitar',
    verified: 'Cuenta verificada',
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
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Реферальные бронирования',
    inviteButton: 'Пригласить',
    verified: 'Аккаунт подтверждён',
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
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Doporučené rezervace zdarma',
    inviteButton: 'Pozvat',
    verified: 'Účet ověřen',
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
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Empfehlungsbuchungen gratis',
    inviteButton: 'Einladen',
    verified: 'Konto bestätigt',
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
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Rezerwacje z poleceń',
    inviteButton: 'Zaproś',
    verified: 'Konto potwierdzone',
  },
} as const;

type MenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  rightLabel?: string;
  danger?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [bookingsCount, setBookingsCount] = useState(0);
  const [savedMastersCount, setSavedMastersCount] = useState(getUserProfile().savedMastersCount);
  const [availableBalance, setAvailableBalance] = useState(getWalletState().availableBalance);
  const [welcomeBonus, setWelcomeBonus] = useState(getWalletState().welcomeBonus);
  const [referralFreeBookings, setReferralFreeBookings] = useState(
    getReferralState().freeBookingsAvailable
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
    };

    syncLanguage();
    syncProfile();
    syncBookings();
    syncWallet();
    syncReferral();

    window.addEventListener('focus', syncLanguage);

    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubBookings = subscribeToBookingsStore(syncBookings);
    const unsubWallet = subscribeToWalletStore(syncWallet);
    const unsubReferral = subscribeToReferralStore(syncReferral);

    return () => {
      window.removeEventListener('focus', syncLanguage);
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
      },
      {
        id: 'saved-masters',
        title: text.savedMasters,
        subtitle: text.savedMastersSub,
        href: '/profile/saved-masters',
        rightLabel: savedMastersCount > 0 ? String(savedMastersCount) : undefined,
      },
      {
        id: 'saved-places',
        title: text.savedPlaces,
        subtitle: text.savedPlacesSub,
        href: '/profile/saved-places',
      },
      {
        id: 'messages',
        title: text.messages,
        subtitle: text.messagesSub,
        href: '/messages',
      },
      {
        id: 'balance',
        title: text.balance,
        subtitle: text.balanceSub,
        href: '/profile/balance',
        rightLabel: `£${availableBalance.toFixed(2)}`,
      },
      {
        id: 'invite',
        title: text.inviteFriends,
        subtitle: text.inviteFriendsSub,
        href: '/profile/invite',
        rightLabel: referralFreeBookings > 0 ? `${referralFreeBookings}` : undefined,
      },
      {
        id: 'payments',
        title: text.paymentMethods,
        subtitle: text.paymentMethodsSub,
        href: '/profile/payments',
      },
      {
        id: 'notifications',
        title: text.notifications,
        subtitle: text.notificationsSub,
        href: '/profile/notifications',
      },
      {
        id: 'language-region',
        title: text.languageRegion,
        subtitle: `${profile.language} · ${profile.region}`,
        href: '/profile/language-region',
      },
      {
        id: 'help',
        title: text.help,
        subtitle: text.helpSub,
        href: '/profile/help',
      },
      {
        id: 'settings',
        title: text.accountSettings,
        subtitle: text.accountSettingsSub,
        href: '/profile/settings',
      },
      {
        id: 'logout',
        title: text.logout,
        danger: true,
        href: '/',
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
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1712]">{text.title}</h1>
            <p className="mt-1 text-sm text-[#7a7065]">{text.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/settings')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ⚙️
          </button>
        </div>

        {(welcomeBonus > 0 || referralFreeBookings > 0) && (
          <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-extrabold text-[#1d1712]">{text.bonusesTitle}</div>

                {welcomeBonus > 0 && (
                  <div className="mt-2 text-sm leading-6 text-[#6f6458]">
                    {text.welcomeBonus}: <span className="font-bold">£{welcomeBonus.toFixed(2)}</span>
                  </div>
                )}

                {referralFreeBookings > 0 && (
                  <div className="mt-1 text-sm leading-6 text-[#6f6458]">
                    {text.referralBookings}:{' '}
                    <span className="font-bold">{referralFreeBookings}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push('/profile/invite')}
                className="rounded-2xl bg-[#2f241c] px-4 py-3 text-sm font-bold text-white"
              >
                {text.inviteButton}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-[32px] border border-[#efe4d7] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="h-20 w-20 rounded-3xl object-cover"
            />

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-[#1d1712]">{profile.fullName}</h2>
              <p className="mt-1 truncate text-sm text-[#7a7065]">{profile.email}</p>
              <p className="mt-1 text-sm text-[#7a7065]">{profile.phone}</p>
              <p className="mt-1 text-sm text-[#7a7065]">{profile.city}</p>

              {profile.isVerified && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f4ecdf] px-3 py-2 text-xs font-bold text-[#4b4137]">
                  <span>🛡️</span>
                  <span>{text.verified}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/edit')}
            className="mt-5 w-full rounded-2xl bg-[#2f241c] px-4 py-4 text-sm font-bold text-white"
          >
            {text.editProfile}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile/bookings')}
            className="rounded-3xl bg-[#2f241c] p-4 text-left text-white"
          >
            <p className="text-xs text-[#d9cdbd]">{text.upcomingBookings}</p>
            <p className="mt-2 text-3xl font-bold">{bookingsCount}</p>
          </button>

          <button
            type="button"
            onClick={() => router.push('/profile/saved-masters')}
            className="rounded-3xl bg-[#f2e9dc] p-4 text-left text-[#241d17]"
          >
            <p className="text-xs text-[#6e5f51]">{text.savedMasters}</p>
            <p className="mt-2 text-3xl font-bold">{savedMastersCount}</p>
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#efe4d7] bg-white shadow-sm">
          {menuItems.map((item, index) => {
            const content = (
              <div
                className={`flex items-center justify-between gap-3 px-5 py-4 ${
                  index !== 0 ? 'border-t border-[#f3eadf]' : ''
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-sm font-bold ${
                      item.danger ? 'text-red-600' : 'text-[#1d1712]'
                    }`}
                  >
                    {item.title}
                  </div>

                  {item.subtitle && (
                    <div className="mt-1 text-xs leading-5 text-[#7a7065]">{item.subtitle}</div>
                  )}
                </div>

                {!item.danger && (
                  <div className="flex items-center gap-2">
                    {item.rightLabel && (
                      <span className="rounded-full bg-[#f5ede2] px-2.5 py-1 text-xs font-bold text-[#6e6154]">
                        {item.rightLabel}
                      </span>
                    )}
                    <span className="text-base text-[#8c7d70]">›</span>
                  </div>
                )}
              </div>
            );

            if (!item.href) {
              return (
                <div key={item.id}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={item.id} href={item.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
} вот текст .теперь дай готовое след задание чётко и правильно
