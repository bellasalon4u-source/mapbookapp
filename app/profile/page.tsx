'use client';

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
} from '../../services/userProfileStore';
import {
  getWalletState,
  subscribeToWalletStore,
  type WalletState,
} from '../../services/walletStore';

type ProfileTextShape = {
  title: string;
  subtitle: string;
  edit: string;
  verified: string;
  rating: string;
  olamepBalance: string;
  topUp: string;
  olamepBonuses: string;
  bonusHint: string;
  workHub: string;
  buyerHub: string;
  bonusesAndContact: string;
  accountSettings: string;
  helpInfo: string;
  admin: string;
  adminHint: string;
  myServices: string;
  myServicesHint: string;
  priceList: string;
  priceListHint: string;
  clients: string;
  clientsHint: string;
  platformOffers: string;
  platformOffersHint: string;
  bookings: string;
  bookingsHint: string;
  savedMasters: string;
  savedMastersHint: string;
  savedPlaces: string;
  savedPlacesHint: string;
  promotions: string;
  promotionsHint: string;
  invite: string;
  inviteHint: string;
  notifications: string;
  notificationsHint: string;
  payments: string;
  paymentsHint: string;
  languageRegion: string;
  languageRegionHint: string;
  profileSettings: string;
  profileSettingsHint: string;
  legal: string;
  legalHint: string;
  help: string;
  helpHint: string;
  faq: string;
  faqHint: string;
};

type ListAction = {
  id: string;
  title: string;
  hint: string;
  route: string;
  icon: string;
  bg: string;
};

const OWNER_EMAIL = 'olamepcom@gmail.com';

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff0000',
  yellow: '#ffd629',
  orange: '#ff8a00',
  pink: '#ff2456',
  cream: '#fff7ee',
  white: '#ffffff',
  border: '#050505',
  muted: '#657080',
};

const texts: Partial<Record<AppLanguage, ProfileTextShape>> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, wallet, services and settings',
    edit: 'Edit',
    verified: 'Verified',
    rating: 'rating',
    olamepBalance: 'Olamep Balance',
    topUp: 'Top up',
    olamepBonuses: 'Olamep Bonuses',
    bonusHint: 'Cashback • Referrals • Rewards',
    workHub: 'My work hub',
    buyerHub: 'Buyer area',
    bonusesAndContact: 'Bonuses & contact',
    accountSettings: 'Account settings',
    helpInfo: 'Help & information',
    admin: 'admin',
    adminHint: 'Owner Admin Panel',
    myServices: 'My services',
    myServicesHint: 'Manage services, descriptions and photos',
    priceList: 'Price list',
    priceListHint: 'Prices, packages and special offers',
    clients: 'My clients',
    clientsHint: 'Client base, history and notes',
    platformOffers: 'Platform offers',
    platformOffersHint: 'News, opportunities and recommendations',
    bookings: 'My bookings',
    bookingsHint: 'Your appointments and booking history',
    savedMasters: 'Saved masters',
    savedMastersHint: 'Specialists you liked',
    savedPlaces: 'Saved places',
    savedPlacesHint: 'Favourite locations',
    promotions: 'Promotions',
    promotionsHint: 'Discounts, bonuses and special deals',
    invite: 'Invite friends',
    inviteHint: 'Get rewards for referrals',
    notifications: 'Notifications',
    notificationsHint: 'Booking, chat and account alerts',
    payments: 'Payment methods',
    paymentsHint: 'Cards, wallets and payout methods',
    languageRegion: 'Language & region',
    languageRegionHint: 'Country, language and currency',
    profileSettings: 'Profile settings',
    profileSettingsHint: 'Account details and security',
    legal: 'Legal information',
    legalHint: 'Terms, privacy and platform rules',
    help: 'Help Centre',
    helpHint: 'Support and instructions',
    faq: 'FAQ & guide',
    faqHint: 'How to use Olamep',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, счёт, услуги и настройки',
    edit: 'Изменить',
    verified: 'Проверено',
    rating: 'рейтинг',
    olamepBalance: 'Баланс Olamep',
    topUp: 'Пополнить',
    olamepBonuses: 'Бонусы Olamep',
    bonusHint: 'Кэшбэк • Рефералы • Бонусы',
    workHub: 'Мой рабочий блок',
    buyerHub: 'Покупатель',
    bonusesAndContact: 'Бонусы и связь',
    accountSettings: 'Настройки аккаунта',
    helpInfo: 'Помощь и информация',
    admin: 'админ',
    adminHint: 'Owner Admin Panel',
    myServices: 'Мои услуги',
    myServicesHint: 'Управляйте услугами, описаниями и фото',
    priceList: 'Прайс-лист',
    priceListHint: 'Цены, пакеты и специальные предложения',
    clients: 'Мои клиенты',
    clientsHint: 'База клиентов, история и заметки',
    platformOffers: 'Предложения платформы',
    platformOffersHint: 'Новости, возможности и рекомендации',
    bookings: 'Мои бронирования',
    bookingsHint: 'Ваши записи и история броней',
    savedMasters: 'Сохранённые мастера',
    savedMastersHint: 'Специалисты, которые вам понравились',
    savedPlaces: 'Сохранённые места',
    savedPlacesHint: 'Любимые локации',
    promotions: 'Промоакции',
    promotionsHint: 'Скидки, бонусы и спецпредложения',
    invite: 'Пригласить друзей',
    inviteHint: 'Получайте бонусы за рекомендации',
    notifications: 'Уведомления',
    notificationsHint: 'Брони, чат и аккаунт',
    payments: 'Способы оплаты',
    paymentsHint: 'Карты, кошельки и выплаты',
    languageRegion: 'Язык и регион',
    languageRegionHint: 'Страна, язык и валюта',
    profileSettings: 'Настройки профиля',
    profileSettingsHint: 'Данные аккаунта и безопасность',
    legal: 'Юридическая информация',
    legalHint: 'Правила, приватность и условия',
    help: 'Центр помощи',
    helpHint: 'Поддержка и инструкции',
    faq: 'FAQ и инструкция',
    faqHint: 'Как пользоваться Olamep',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, рахунок, послуги та налаштування',
    edit: 'Змінити',
    verified: 'Перевірено',
    rating: 'рейтинг',
    olamepBalance: 'Баланс Olamep',
    topUp: 'Поповнити',
    olamepBonuses: 'Бонуси Olamep',
    bonusHint: 'Кешбек • Реферали • Бонуси',
    workHub: 'Мій робочий блок',
    buyerHub: 'Покупець',
    bonusesAndContact: 'Бонуси і звʼязок',
    accountSettings: 'Налаштування акаунта',
    helpInfo: 'Допомога та інформація',
    admin: 'адмін',
    adminHint: 'Owner Admin Panel',
    myServices: 'Мої послуги',
    myServicesHint: 'Керуйте послугами, описами та фото',
    priceList: 'Прайс-лист',
    priceListHint: 'Ціни, пакети та спеціальні пропозиції',
    clients: 'Мої клієнти',
    clientsHint: 'База клієнтів, історія і нотатки',
    platformOffers: 'Пропозиції платформи',
    platformOffersHint: 'Новини, можливості та рекомендації',
    bookings: 'Мої бронювання',
    bookingsHint: 'Ваші записи та історія бронювань',
    savedMasters: 'Збережені майстри',
    savedMastersHint: 'Спеціалісти, які вам сподобались',
    savedPlaces: 'Збережені місця',
    savedPlacesHint: 'Улюблені локації',
    promotions: 'Промоакції',
    promotionsHint: 'Знижки, бонуси та спецпропозиції',
    invite: 'Запросити друзів',
    inviteHint: 'Отримуйте бонуси за рекомендації',
    notifications: 'Сповіщення',
    notificationsHint: 'Бронювання, чат і акаунт',
    payments: 'Способи оплати',
    paymentsHint: 'Картки, гаманці та виплати',
    languageRegion: 'Мова та регіон',
    languageRegionHint: 'Країна, мова і валюта',
    profileSettings: 'Налаштування профілю',
    profileSettingsHint: 'Дані акаунта і безпека',
    legal: 'Юридична інформація',
    legalHint: 'Правила, приватність та умови',
    help: 'Центр допомоги',
    helpHint: 'Підтримка та інструкції',
    faq: 'FAQ та інструкція',
    faqHint: 'Як користуватись Olamep',
  },
};

function getText(language: AppLanguage) {
  return texts[language] || texts.EN!;
}

function isOwnerProfile(profile: UserProfile) {
  return String(profile.email || '').trim().toLowerCase() === OWNER_EMAIL;
}

function OlamepLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <div
        style={{
          width: 34,
          height: 42,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff2456 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 17,
            height: 17,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span
      style={{
        width: 27,
        height: 27,
        borderRadius: 999,
        background: BRAND.blue,
        color: '#ffffff',
        border: `2.5px solid ${BRAND.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function IconBox({ icon, bg }: { icon: string; bg: string }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        boxShadow: '0 5px 0 rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncProfile = () => setProfile(getUserProfile());
    const syncWallet = () => setWallet(getWalletState());

    syncLanguage();
    syncProfile();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncProfile);
    window.addEventListener('pageshow', syncWallet);
    window.addEventListener('storage', syncProfile);
    window.addEventListener('storage', syncWallet);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubWallet();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncProfile);
      window.removeEventListener('pageshow', syncWallet);
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('storage', syncWallet);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);
  const isOwner = useMemo(() => isOwnerProfile(profile), [profile]);

  const workActions: ListAction[] = [
    {
      id: 'services',
      title: text.myServices,
      hint: text.myServicesHint,
      route: '/profile/listings',
      icon: '💼',
      bg: '#d8ffdf',
    },
    {
      id: 'price',
      title: text.priceList,
      hint: text.priceListHint,
      route: '/profile/price-list',
      icon: '🏷️',
      bg: '#fff0b8',
    },
    {
      id: 'clients',
      title: text.clients,
      hint: text.clientsHint,
      route: '/profile/clients',
      icon: '👥',
      bg: '#dcecff',
    },
    {
      id: 'platform',
      title: text.platformOffers,
      hint: text.platformOffersHint,
      route: '/profile/platform-offers',
      icon: '📣',
      bg: '#fff0b8',
    },
  ];

  const buyerActions: ListAction[] = [
    {
      id: 'bookings',
      title: text.bookings,
      hint: text.bookingsHint,
      route: '/bookings',
      icon: '📅',
      bg: '#dcecff',
    },
    {
      id: 'savedMasters',
      title: text.savedMasters,
      hint: text.savedMastersHint,
      route: '/profile/saved-masters',
      icon: '❤️',
      bg: '#ffe1ec',
    },
    {
      id: 'savedPlaces',
      title: text.savedPlaces,
      hint: text.savedPlacesHint,
      route: '/profile/saved-places',
      icon: '📍',
      bg: '#d8ffdf',
    },
  ];

  const bonusActions: ListAction[] = [
    {
      id: 'promotions',
      title: text.promotions,
      hint: text.promotionsHint,
      route: '/profile/promotions',
      icon: '🎁',
      bg: '#ffe1ec',
    },
    {
      id: 'invite',
      title: text.invite,
      hint: text.inviteHint,
      route: '/profile/invite',
      icon: '🎉',
      bg: '#f0e6ff',
    },
    {
      id: 'notifications',
      title: text.notifications,
      hint: text.notificationsHint,
      route: '/profile/notifications',
      icon: '🔔',
      bg: '#fff0b8',
    },
  ];

  const settingsActions: ListAction[] = [
    {
      id: 'payments',
      title: text.payments,
      hint: text.paymentsHint,
      route: '/profile/payments',
      icon: '💳',
      bg: '#dcecff',
    },
    {
      id: 'language',
      title: text.languageRegion,
      hint: text.languageRegionHint,
      route: '/profile/language-region',
      icon: '🌍',
      bg: '#d8ffdf',
    },
    {
      id: 'settings',
      title: text.profileSettings,
      hint: text.profileSettingsHint,
      route: '/profile/settings',
      icon: '⚙️',
      bg: '#f1f4f8',
    },
  ];

  const helpActions: ListAction[] = [
    {
      id: 'legal',
      title: text.legal,
      hint: text.legalHint,
      route: '/profile/legal',
      icon: '⚖️',
      bg: '#f0e6ff',
    },
    {
      id: 'help',
      title: text.help,
      hint: text.helpHint,
      route: '/profile/help',
      icon: '🛟',
      bg: '#ffe1ec',
    },
    {
      id: 'faq',
      title: text.faq,
      hint: text.faqHint,
      route: '/profile/faq',
      icon: '❓',
      bg: '#fff0b8',
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: BRAND.navy,
        paddingBottom: 136,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 142px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={roundButtonStyle}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Close"
            style={roundButtonStyle}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: BRAND.navy,
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            marginTop: 17,
            borderRadius: 28,
            border: `3px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 13,
            boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px minmax(0, 1fr) 22px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ width: 100 }}>
              <div style={{ position: 'relative', width: 92, height: 92 }}>
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 24,
                    objectFit: 'cover',
                    border: `3px solid ${BRAND.border}`,
                    display: 'block',
                  }}
                />

                <button
                  type="button"
                  onClick={() => router.push('/profile/edit')}
                  style={{
                    position: 'absolute',
                    right: -7,
                    bottom: -7,
                    width: 35,
                    height: 35,
                    borderRadius: 999,
                    border: `3px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: BRAND.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                  }}
                >
                  📷
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                style={{
                  marginTop: 13,
                  width: 100,
                  height: 34,
                  borderRadius: 999,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.border,
                  fontSize: 13,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                ✎ {text.edit}
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                minWidth: 0,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 25,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: BRAND.navy,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile.fullName}
                </div>

                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: BRAND.green,
                    boxShadow: '0 0 0 3px rgba(36,196,90,0.18)',
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  fontWeight: 800,
                  color: BRAND.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: BRAND.yellow, fontSize: 20, letterSpacing: 1 }}>★★★★★</span>
                <span
                  style={{
                    color: BRAND.border,
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  4.9 {text.rating}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              style={{
                border: 'none',
                background: 'transparent',
                color: BRAND.border,
                fontSize: 34,
                fontWeight: 900,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              borderTop: `3px solid ${BRAND.border}`,
              paddingTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/wallet')}
              style={{
                minHeight: 124,
                borderRadius: 20,
                border: `3px solid ${BRAND.border}`,
                background: BRAND.blue,
                color: '#ffffff',
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900 }}>{text.olamepBalance}</div>

              <div style={{ marginTop: 9, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                £{wallet.availableBalance.toFixed(2)}
              </div>

              <div
                style={{
                  marginTop: 13,
                  height: 38,
                  borderRadius: 999,
                  background: BRAND.green,
                  color: '#ffffff',
                  border: `2.5px solid ${BRAND.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '0 13px',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: '#ffffff',
                    color: BRAND.green,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  +
                </span>
                {text.topUp}
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 42,
                  fontSize: 50,
                  opacity: 0.18,
                }}
              >
                💼
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/bonuses')}
              style={{
                minHeight: 124,
                borderRadius: 20,
                border: `3px solid ${BRAND.border}`,
                background: BRAND.red,
                color: '#ffffff',
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900 }}>{text.olamepBonuses}</div>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: BRAND.yellow,
                    color: BRAND.red,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2.5px solid ${BRAND.border}`,
                    fontSize: 21,
                    fontWeight: 900,
                  }}
                >
                  ★
                </span>

                <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>1,240</span>
              </div>

              <div style={{ marginTop: 7, fontSize: 11.5, fontWeight: 900 }}>
                {text.bonusHint}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  color: BRAND.yellow,
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                <span>↻</span>
                <span>👥</span>
                <span>🎁</span>
              </div>
            </button>
          </div>
        </section>

        {isOwner ? (
          <button
            type="button"
            onClick={() => router.push('/admin')}
            style={{
              margin: '12px auto 0',
              border: 'none',
              background: 'transparent',
              color: BRAND.navy,
              fontSize: 12,
              fontWeight: 900,
              textDecoration: 'underline',
              display: 'block',
              cursor: 'pointer',
            }}
          >
            {text.admin}
          </button>
        ) : null}

        <ProfileSection title={text.workHub} items={workActions} router={router} />
        <ProfileSection title={text.buyerHub} items={buyerActions} router={router} />
        <ProfileSection title={text.bonusesAndContact} items={bonusActions} router={router} />
        <ProfileSection title={text.accountSettings} items={settingsActions} router={router} />
        <ProfileSection title={text.helpInfo} items={helpActions} router={router} />
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

const roundButtonStyle = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 25,
  fontWeight: 900,
  cursor: 'pointer',
} as const;

function ProfileSection({
  title,
  items,
  router,
}: {
  title: string;
  items: ListAction[];
  router: { push: (href: string) => void };
}) {
  return (
    <>
      <h2
        style={{
          margin: '21px 0 10px',
          fontSize: 26,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '-0.7px',
          color: BRAND.navy,
        }}
      >
        {title}
      </h2>

      <section
        style={{
          borderRadius: 24,
          border: `3px solid ${BRAND.border}`,
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(item.route)}
            style={{
              width: '100%',
              minHeight: 86,
              display: 'grid',
              gridTemplateColumns: '56px minmax(0, 1fr) 22px',
              gap: 13,
              alignItems: 'center',
              padding: '13px 14px',
              border: 'none',
              borderTop: index === 0 ? 'none' : `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <IconBox icon={item.icon} bg={item.bg} />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 17,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12.5,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {item.hint}
              </div>
            </div>

            <span
              style={{
                color: BRAND.border,
                fontSize: 31,
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              ›
            </span>
          </button>
        ))}
      </section>
    </>
  );
}
