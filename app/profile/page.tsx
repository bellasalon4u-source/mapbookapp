'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type ProfileTextShape = {
  title: string;
  subtitle: string;
  edit: string;
  rating: string;
  olamepBalance: string;
  topUp: string;
  olamepBonuses: string;
  bonusHint: string;
  workHub: string;
  buyerHub: string;
  rewardsHub: string;
  accountHub: string;
  helpHub: string;
  myServices: string;
  myServicesHint: string;
  priceList: string;
  priceListHint: string;
  clients: string;
  clientsHint: string;
  platformOffers: string;
  platformOffersHint: string;
  myBookings: string;
  myBookingsHint: string;
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
  accountSettings: string;
  accountSettingsHint: string;
  legal: string;
  legalHint: string;
  help: string;
  helpHint: string;
};

type SectionItem = {
  id: string;
  title: string;
  hint: string;
  route: string;
  icon: string;
  bg: string;
};

type SafeProfile = {
  fullName: string;
  email: string;
  avatar: string;
};

type SafeWallet = {
  availableBalance: number;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#19c65a',
  red: '#f00018',
  yellow: '#ffd629',
  border: '#050505',
  muted: '#667080',
  bg: '#ffffff',
};

const fallbackAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="34" fill="#dcecff"/>
      <circle cx="80" cy="61" r="31" fill="#0e73d8"/>
      <path d="M31 142c7-35 31-53 49-53s42 18 49 53" fill="#19c65a"/>
      <text x="80" y="151" font-size="18" text-anchor="middle" font-family="Arial" font-weight="900" fill="#071b46">Olamep</text>
    </svg>
  `);

const profileTexts: Partial<Record<AppLanguage, ProfileTextShape>> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, wallet, services and settings',
    edit: 'Edit',
    rating: 'rating',
    olamepBalance: 'Olamep balance',
    topUp: 'Top up',
    olamepBonuses: 'Olamep bonuses',
    bonusHint: 'Cashback • Referrals • Rewards',
    workHub: 'My work hub',
    buyerHub: 'Buyer area',
    rewardsHub: 'Bonuses & contact',
    accountHub: 'Account settings',
    helpHub: 'Help & information',
    myServices: 'My services',
    myServicesHint: 'Manage your offers, photos and descriptions',
    priceList: 'Price list',
    priceListHint: 'Prices, packages and special offers',
    clients: 'My clients',
    clientsHint: 'Client base, requests and booking history',
    platformOffers: 'Platform offers',
    platformOffersHint: 'News, opportunities and useful tools',
    myBookings: 'My bookings',
    myBookingsHint: 'All your bookings and appointment status',
    savedMasters: 'Saved masters',
    savedMastersHint: 'Your favourite specialists',
    savedPlaces: 'Saved places',
    savedPlacesHint: 'Favourite locations and addresses',
    promotions: 'Promotions',
    promotionsHint: 'Discounts, coupons and bonus offers',
    invite: 'Invite friends',
    inviteHint: 'Referral bonuses and invite code',
    notifications: 'Notifications',
    notificationsHint: 'Messages, booking alerts and updates',
    payments: 'Payment methods',
    paymentsHint: 'Cards, wallets and payout methods',
    languageRegion: 'Language & region',
    languageRegionHint: 'Country, language and currency',
    accountSettings: 'Account settings',
    accountSettingsHint: 'Profile, privacy and login details',
    legal: 'Legal information',
    legalHint: 'Terms, privacy, safety and platform rules',
    help: 'Help centre',
    helpHint: 'FAQ, guide and support centre',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, счёт, услуги и настройки',
    edit: 'Изменить',
    rating: 'рейтинг',
    olamepBalance: 'Баланс Olamep',
    topUp: 'Пополнить',
    olamepBonuses: 'Бонусы Olamep',
    bonusHint: 'Кэшбэк • Рефералы • Бонусы',
    workHub: 'Мой рабочий блок',
    buyerHub: 'Покупатель',
    rewardsHub: 'Бонусы и связь',
    accountHub: 'Настройки аккаунта',
    helpHub: 'Помощь и информация',
    myServices: 'Мои услуги',
    myServicesHint: 'Управляйте услугами, фото и описаниями',
    priceList: 'Прайс-лист',
    priceListHint: 'Цены, пакеты и специальные предложения',
    clients: 'Мои клиенты',
    clientsHint: 'База клиентов, заявки и история броней',
    platformOffers: 'Предложения платформы',
    platformOffersHint: 'Новости, возможности и полезные инструменты',
    myBookings: 'Мои бронирования',
    myBookingsHint: 'Все ваши брони и статус записи',
    savedMasters: 'Сохранённые мастера',
    savedMastersHint: 'Ваши любимые специалисты',
    savedPlaces: 'Сохранённые места',
    savedPlacesHint: 'Любимые локации и адреса',
    promotions: 'Промоакции',
    promotionsHint: 'Скидки, купоны и бонусные предложения',
    invite: 'Пригласить друзей',
    inviteHint: 'Реферальные бонусы и invite code',
    notifications: 'Уведомления',
    notificationsHint: 'Сообщения, брони и важные обновления',
    payments: 'Способы оплаты',
    paymentsHint: 'Карты, кошельки и способы выплат',
    languageRegion: 'Язык и регион',
    languageRegionHint: 'Страна, язык и валюта',
    accountSettings: 'Настройки аккаунта',
    accountSettingsHint: 'Профиль, приватность и вход',
    legal: 'Юридическая информация',
    legalHint: 'Условия, приватность, безопасность и правила',
    help: 'Центр помощи',
    helpHint: 'FAQ, инструкция и поддержка',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, рахунок, послуги та налаштування',
    edit: 'Змінити',
    rating: 'рейтинг',
    olamepBalance: 'Баланс Olamep',
    topUp: 'Поповнити',
    olamepBonuses: 'Бонуси Olamep',
    bonusHint: 'Кешбек • Реферали • Бонуси',
    workHub: 'Мій робочий блок',
    buyerHub: 'Покупець',
    rewardsHub: 'Бонуси та звʼязок',
    accountHub: 'Налаштування акаунта',
    helpHub: 'Допомога та інформація',
    myServices: 'Мої послуги',
    myServicesHint: 'Керуйте послугами, фото та описами',
    priceList: 'Прайс-лист',
    priceListHint: 'Ціни, пакети та спеціальні пропозиції',
    clients: 'Мої клієнти',
    clientsHint: 'База клієнтів, заявки та історія бронювань',
    platformOffers: 'Пропозиції платформи',
    platformOffersHint: 'Новини, можливості та корисні інструменти',
    myBookings: 'Мої бронювання',
    myBookingsHint: 'Усі ваші бронювання та статус запису',
    savedMasters: 'Збережені майстри',
    savedMastersHint: 'Ваші улюблені спеціалісти',
    savedPlaces: 'Збережені місця',
    savedPlacesHint: 'Улюблені локації та адреси',
    promotions: 'Промоакції',
    promotionsHint: 'Знижки, купони та бонусні пропозиції',
    invite: 'Запросити друзів',
    inviteHint: 'Реферальні бонуси та invite code',
    notifications: 'Сповіщення',
    notificationsHint: 'Повідомлення, бронювання та оновлення',
    payments: 'Способи оплати',
    paymentsHint: 'Картки, гаманці та способи виплат',
    languageRegion: 'Мова та регіон',
    languageRegionHint: 'Країна, мова та валюта',
    accountSettings: 'Налаштування акаунта',
    accountSettingsHint: 'Профіль, приватність та вхід',
    legal: 'Юридична інформація',
    legalHint: 'Умови, приватність, безпека та правила',
    help: 'Центр допомоги',
    helpHint: 'FAQ, інструкція та підтримка',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Váš účet, peněženka, služby a nastavení',
    edit: 'Upravit',
    rating: 'hodnocení',
    olamepBalance: 'Olamep zůstatek',
    topUp: 'Dobít',
    olamepBonuses: 'Olamep bonusy',
    bonusHint: 'Cashback • Doporučení • Odměny',
    workHub: 'Moje pracovní zóna',
    buyerHub: 'Zóna zákazníka',
    rewardsHub: 'Bonusy a kontakt',
    accountHub: 'Nastavení účtu',
    helpHub: 'Pomoc a informace',
    myServices: 'Moje služby',
    myServicesHint: 'Správa nabídek, fotek a popisů',
    priceList: 'Ceník',
    priceListHint: 'Ceny, balíčky a speciální nabídky',
    clients: 'Moji klienti',
    clientsHint: 'Klienti, požadavky a historie rezervací',
    platformOffers: 'Nabídky platformy',
    platformOffersHint: 'Novinky, možnosti a užitečné nástroje',
    myBookings: 'Moje rezervace',
    myBookingsHint: 'Všechny rezervace a jejich stav',
    savedMasters: 'Uložení specialisté',
    savedMastersHint: 'Vaši oblíbení specialisté',
    savedPlaces: 'Uložená místa',
    savedPlacesHint: 'Oblíbené lokace a adresy',
    promotions: 'Akce',
    promotionsHint: 'Slevy, kupóny a bonusové nabídky',
    invite: 'Pozvat přátele',
    inviteHint: 'Referral bonusy a pozvánky',
    notifications: 'Oznámení',
    notificationsHint: 'Zprávy, rezervace a aktualizace',
    payments: 'Platební metody',
    paymentsHint: 'Karty, peněženky a výplaty',
    languageRegion: 'Jazyk a region',
    languageRegionHint: 'Země, jazyk a měna',
    accountSettings: 'Nastavení účtu',
    accountSettingsHint: 'Profil, soukromí a přihlášení',
    legal: 'Právní informace',
    legalHint: 'Podmínky, soukromí a pravidla',
    help: 'Centrum pomoci',
    helpHint: 'FAQ, průvodce a podpora',
  },
};

function getText(language: AppLanguage) {
  return profileTexts[language] || profileTexts.EN!;
}

function readSafeProfile(): SafeProfile {
  if (typeof window === 'undefined') {
    return {
      fullName: 'Olamep user',
      email: 'user@olamep.com',
      avatar: fallbackAvatar,
    };
  }

  try {
    const raw =
      window.localStorage.getItem('olamep_user_profile') ||
      window.localStorage.getItem('mapbook_user_profile') ||
      window.localStorage.getItem('userProfile');

    if (!raw) {
      return {
        fullName: 'Olamep user',
        email: 'user@olamep.com',
        avatar: fallbackAvatar,
      };
    }

    const parsed = JSON.parse(raw) as Partial<SafeProfile>;

    return {
      fullName:
        typeof parsed.fullName === 'string' && parsed.fullName.trim()
          ? parsed.fullName
          : 'Olamep user',
      email:
        typeof parsed.email === 'string' && parsed.email.trim()
          ? parsed.email
          : 'user@olamep.com',
      avatar:
        typeof parsed.avatar === 'string' && parsed.avatar.trim()
          ? parsed.avatar
          : fallbackAvatar,
    };
  } catch {
    return {
      fullName: 'Olamep user',
      email: 'user@olamep.com',
      avatar: fallbackAvatar,
    };
  }
}

function readSafeWallet(): SafeWallet {
  if (typeof window === 'undefined') {
    return { availableBalance: 0 };
  }

  try {
    const raw =
      window.localStorage.getItem('olamep_wallet_state') ||
      window.localStorage.getItem('mapbook_wallet_state') ||
      window.localStorage.getItem('walletState');

    if (!raw) {
      return { availableBalance: 0 };
    }

    const parsed = JSON.parse(raw) as Partial<SafeWallet>;
    const balance = Number(parsed.availableBalance);

    return {
      availableBalance: Number.isFinite(balance) ? balance : 0,
    };
  } catch {
    return { availableBalance: 0 };
  }
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
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
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
          fontSize: 29,
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

function SmallAdminLogoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Olamep admin"
      style={{
        margin: '24px auto 0',
        width: 52,
        height: 52,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
      }}
    >
      <span
        style={{
          width: 29,
          height: 35,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          display: 'block',
          boxShadow: '0 6px 14px rgba(14,115,216,0.22)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 7,
            top: 7,
            width: 15,
            height: 15,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </span>
    </button>
  );
}

function SectionIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 17,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 27,
        boxShadow: '0 5px 0 rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN' as AppLanguage);
  const [profile, setProfile] = useState<SafeProfile>({
    fullName: 'Olamep user',
    email: 'user@olamep.com',
    avatar: fallbackAvatar,
  });
  const [wallet, setWallet] = useState<SafeWallet>({ availableBalance: 0 });

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncProfile = () => setProfile(readSafeProfile());
    const syncWallet = () => setWallet(readSafeWallet());

    syncLanguage();
    syncProfile();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('pageshow', syncProfile);
    window.addEventListener('pageshow', syncWallet);
    window.addEventListener('storage', syncProfile);
    window.addEventListener('storage', syncWallet);

    return () => {
      unsubLanguage();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('pageshow', syncProfile);
      window.removeEventListener('pageshow', syncWallet);
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('storage', syncWallet);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const workItems: SectionItem[] = [
    {
      id: 'services',
      title: text.myServices,
      hint: text.myServicesHint,
      route: '/profile/listings',
      icon: '💼',
      bg: '#d9fff0',
    },
    {
      id: 'price',
      title: text.priceList,
      hint: text.priceListHint,
      route: '/profile/price-list',
      icon: '🏷️',
      bg: '#fff0c9',
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
      id: 'offers',
      title: text.platformOffers,
      hint: text.platformOffersHint,
      route: '/profile/promotions',
      icon: '📣',
      bg: '#fff0c9',
    },
  ];

  const buyerItems: SectionItem[] = [
    {
      id: 'bookings',
      title: text.myBookings,
      hint: text.myBookingsHint,
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
      bg: '#ffe9f2',
    },
    {
      id: 'savedPlaces',
      title: text.savedPlaces,
      hint: text.savedPlacesHint,
      route: '/profile/saved-places',
      icon: '📍',
      bg: '#dcffe8',
    },
  ];

  const rewardItems: SectionItem[] = [
    {
      id: 'promotions',
      title: text.promotions,
      hint: text.promotionsHint,
      route: '/profile/promotions',
      icon: '🎁',
      bg: '#ffe9f2',
    },
    {
      id: 'invite',
      title: text.invite,
      hint: text.inviteHint,
      route: '/profile/invite',
      icon: '🎉',
      bg: '#f2edff',
    },
    {
      id: 'notifications',
      title: text.notifications,
      hint: text.notificationsHint,
      route: '/profile/notifications',
      icon: '🔔',
      bg: '#fff0c9',
    },
  ];

  const accountItems: SectionItem[] = [
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
      bg: '#dcffe8',
    },
    {
      id: 'settings',
      title: text.accountSettings,
      hint: text.accountSettingsHint,
      route: '/profile/settings',
      icon: '⚙️',
      bg: '#f2f4f7',
    },
  ];

  const helpItems: SectionItem[] = [
    {
      id: 'legal',
      title: text.legal,
      hint: text.legalHint,
      route: '/profile/legal',
      icon: '⚖️',
      bg: '#f2edff',
    },
    {
      id: 'help',
      title: text.help,
      hint: text.helpHint,
      route: '/profile/help',
      icon: '🛟',
      bg: '#ffe9f2',
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 132,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 132px' }}>
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
            style={circleButtonStyle}
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
            style={circleButtonStyle}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 18 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 39,
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
            marginTop: 18,
            borderRadius: 28,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 13,
            boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '104px minmax(0, 1fr) 24px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', width: 104 }}>
              <img
                src={profile.avatar}
                alt={profile.fullName}
                style={{
                  width: 91,
                  height: 91,
                  borderRadius: 23,
                  objectFit: 'cover',
                  border: `2.5px solid ${BRAND.border}`,
                  display: 'block',
                  background: '#dcecff',
                }}
              />

              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                aria-label={text.edit}
                style={{
                  position: 'absolute',
                  right: 4,
                  bottom: 21,
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.navy,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
                }}
              >
                📷
              </button>

              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                style={{
                  marginTop: 8,
                  minHeight: 34,
                  width: 91,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.border,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
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
                    boxShadow: '0 0 0 3px rgba(25,198,90,0.16)',
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
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: BRAND.yellow, fontSize: 20, letterSpacing: 1 }}>
                  ★★★★★
                </span>
                <span
                  style={{
                    color: BRAND.border,
                    fontSize: 15,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  4.9 {text.rating}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              aria-label={text.edit}
              style={{
                border: 'none',
                background: 'transparent',
                color: BRAND.border,
                fontSize: 32,
                fontWeight: 900,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: `2px solid ${BRAND.border}`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/wallet')}
              style={{
                minHeight: 122,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.blue,
                color: '#ffffff',
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 11,
                  top: 23,
                  fontSize: 43,
                  opacity: 0.22,
                }}
              >
                💼
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#ffffff',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {text.olamepBalance}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 31,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#ffffff',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                £{wallet.availableBalance.toFixed(2)}
              </div>

              <div
                style={{
                  marginTop: 12,
                  minHeight: 34,
                  borderRadius: 999,
                  background: BRAND.green,
                  border: '2px solid #ffffff',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '0 12px',
                  position: 'relative',
                  zIndex: 1,
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
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  +
                </span>
                {text.topUp}
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/bonuses')}
              style={{
                minHeight: 122,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.red,
                color: '#ffffff',
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                {text.olamepBonuses}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: BRAND.yellow,
                    color: BRAND.red,
                    border: `2px solid ${BRAND.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  ★
                </span>

                <span
                  style={{
                    fontSize: 31,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  1,240
                </span>
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 11.5,
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {text.bonusHint}
              </div>

              <div
                style={{
                  marginTop: 7,
                  color: BRAND.yellow,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                <span>↪</span>
                <span>👥</span>
                <span>🎁</span>
              </div>
            </button>
          </div>
        </section>

        <ProfileSection
          title={text.workHub}
          items={workItems}
          onOpen={(route) => router.push(route)}
        />

        <ProfileSection
          title={text.buyerHub}
          items={buyerItems}
          onOpen={(route) => router.push(route)}
        />

        <ProfileSection
          title={text.rewardsHub}
          items={rewardItems}
          onOpen={(route) => router.push(route)}
        />

        <ProfileSection
          title={text.accountHub}
          items={accountItems}
          onOpen={(route) => router.push(route)}
        />

        <ProfileSection
          title={text.helpHub}
          items={helpItems}
          onOpen={(route) => router.push(route)}
        />

        <SmallAdminLogoButton onClick={() => router.push('/admin')} />
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

function ProfileSection({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: SectionItem[];
  onOpen: (route: string) => void;
}) {
  return (
    <section style={{ marginTop: 21 }}>
      <h2
        style={{
          margin: '0 0 10px',
          fontSize: 25,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '-0.7px',
          color: BRAND.navy,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          borderRadius: 24,
          border: `2.5px solid ${BRAND.border}`,
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.route)}
            style={{
              width: '100%',
              minHeight: 88,
              display: 'grid',
              gridTemplateColumns: '54px minmax(0,1fr) 28px',
              gap: 13,
              alignItems: 'center',
              padding: '13px 15px',
              border: 'none',
              borderTop: index === 0 ? 'none' : `2px solid ${BRAND.border}`,
              background: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <SectionIcon icon={item.icon} bg={item.bg} />

            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 18,
                  lineHeight: 1.12,
                  fontWeight: 900,
                  color: BRAND.navy,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </span>

              <span
                style={{
                  marginTop: 5,
                  display: 'block',
                  fontSize: 12.5,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: BRAND.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.hint}
              </span>
            </span>

            <span
              style={{
                color: BRAND.border,
                fontSize: 31,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ›
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

const circleButtonStyle = {
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
