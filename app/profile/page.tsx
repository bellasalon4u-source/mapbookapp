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
  rating: string;
  balanceTitle: string;
  topUp: string;
  bonusTitle: string;
  bonusHint: string;
  admin: string;
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
  accountSettings: string;
  accountSettingsHint: string;
  legal: string;
  legalHint: string;
  help: string;
  helpHint: string;
  faq: string;
  faqHint: string;
};

type ProfileSection = {
  id: string;
  title: string;
  items: ProfileItem[];
};

type ProfileItem = {
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
  red: '#f10016',
  yellow: '#ffd629',
  black: '#050505',
  white: '#ffffff',
  muted: '#697482',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softYellow: '#fff0b8',
  softPink: '#ffe5ef',
  softViolet: '#eee8ff',
  softOrange: '#fff0da',
};

const profileTexts: Partial<Record<AppLanguage, ProfileTextShape>> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, wallet, services and settings',
    edit: 'Edit',
    rating: 'rating',
    balanceTitle: 'Olamep Balance',
    topUp: 'Top up',
    bonusTitle: 'Olamep Bonuses',
    bonusHint: 'Cashback • Referrals • Rewards',
    admin: 'admin',
    workHub: 'My work hub',
    buyerHub: 'Buyer space',
    rewardsHub: 'Bonuses and connection',
    accountHub: 'Account settings',
    helpHub: 'Help and information',
    myServices: 'My services',
    myServicesHint: 'Manage services, descriptions and photos',
    priceList: 'Price list',
    priceListHint: 'Prices, packages and special offers',
    clients: 'My clients',
    clientsHint: 'Client base, requests and notes',
    platformOffers: 'Platform offers',
    platformOffersHint: 'News, tools and business opportunities',
    bookings: 'My bookings',
    bookingsHint: 'All your appointments and requests',
    savedMasters: 'Saved masters',
    savedMastersHint: 'Your favourite specialists',
    savedPlaces: 'Saved places',
    savedPlacesHint: 'Favourite locations and addresses',
    promotions: 'Promotions',
    promotionsHint: 'Discounts, gifts and bonus offers',
    invite: 'Invite friends',
    inviteHint: 'Share Olamep and get bonuses',
    notifications: 'Notifications',
    notificationsHint: 'Messages, bookings and system alerts',
    payments: 'Payment methods',
    paymentsHint: 'Cards, wallets, bank transfer and crypto',
    languageRegion: 'Language & region',
    languageRegionHint: 'Country, language and currency',
    accountSettings: 'Account settings',
    accountSettingsHint: 'Profile, security and login details',
    legal: 'Legal information',
    legalHint: 'Terms, privacy and platform rules',
    help: 'Help Centre',
    helpHint: 'Support, instructions and contact',
    faq: 'FAQ and guide',
    faqHint: 'How Olamep works step by step',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, счёт, услуги и настройки',
    edit: 'Изменить',
    rating: 'рейтинг',
    balanceTitle: 'Баланс Olamep',
    topUp: 'Пополнить',
    bonusTitle: 'Бонусы Olamep',
    bonusHint: 'Кэшбэк • Рефералы • Бонусы',
    admin: 'админ',
    workHub: 'Мой рабочий блок',
    buyerHub: 'Покупатель',
    rewardsHub: 'Бонусы и связь',
    accountHub: 'Настройки аккаунта',
    helpHub: 'Помощь и информация',
    myServices: 'Мои услуги',
    myServicesHint: 'Управляйте услугами, описаниями и фото',
    priceList: 'Прайс-лист',
    priceListHint: 'Цены, пакеты и специальные предложения',
    clients: 'Мои клиенты',
    clientsHint: 'База клиентов, заявки и заметки',
    platformOffers: 'Предложения платформы',
    platformOffersHint: 'Новости, инструменты и возможности для бизнеса',
    bookings: 'Мои бронирования',
    bookingsHint: 'Все ваши записи и заявки',
    savedMasters: 'Сохранённые мастера',
    savedMastersHint: 'Ваши любимые специалисты',
    savedPlaces: 'Сохранённые места',
    savedPlacesHint: 'Любимые локации и адреса',
    promotions: 'Промоакции',
    promotionsHint: 'Скидки, подарки и бонусные предложения',
    invite: 'Пригласить друзей',
    inviteHint: 'Делитесь Olamep и получайте бонусы',
    notifications: 'Уведомления',
    notificationsHint: 'Сообщения, брони и системные оповещения',
    payments: 'Способы оплаты',
    paymentsHint: 'Карты, кошельки, банк, SWIFT и крипта',
    languageRegion: 'Язык и регион',
    languageRegionHint: 'Страна, язык и валюта',
    accountSettings: 'Настройки аккаунта',
    accountSettingsHint: 'Профиль, безопасность и вход',
    legal: 'Юридическая информация',
    legalHint: 'Правила, privacy и условия платформы',
    help: 'Центр помощи',
    helpHint: 'Поддержка, инструкции и связь',
    faq: 'FAQ и инструкция',
    faqHint: 'Как пользоваться Olamep шаг за шагом',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, рахунок, послуги та налаштування',
    edit: 'Змінити',
    rating: 'рейтинг',
    balanceTitle: 'Баланс Olamep',
    topUp: 'Поповнити',
    bonusTitle: 'Бонуси Olamep',
    bonusHint: 'Кешбек • Реферали • Бонуси',
    admin: 'адмін',
    workHub: 'Мій робочий блок',
    buyerHub: 'Покупець',
    rewardsHub: 'Бонуси і зв’язок',
    accountHub: 'Налаштування акаунта',
    helpHub: 'Допомога та інформація',
    myServices: 'Мої послуги',
    myServicesHint: 'Керуйте послугами, описами та фото',
    priceList: 'Прайс-лист',
    priceListHint: 'Ціни, пакети і спеціальні пропозиції',
    clients: 'Мої клієнти',
    clientsHint: 'База клієнтів, заявки і нотатки',
    platformOffers: 'Пропозиції платформи',
    platformOffersHint: 'Новини, інструменти і можливості для бізнесу',
    bookings: 'Мої бронювання',
    bookingsHint: 'Усі ваші записи і заявки',
    savedMasters: 'Збережені майстри',
    savedMastersHint: 'Ваші улюблені спеціалісти',
    savedPlaces: 'Збережені місця',
    savedPlacesHint: 'Улюблені локації та адреси',
    promotions: 'Промоакції',
    promotionsHint: 'Знижки, подарунки і бонусні пропозиції',
    invite: 'Запросити друзів',
    inviteHint: 'Діліться Olamep і отримуйте бонуси',
    notifications: 'Сповіщення',
    notificationsHint: 'Повідомлення, броні та системні сповіщення',
    payments: 'Способи оплати',
    paymentsHint: 'Картки, гаманці, банк, SWIFT і крипта',
    languageRegion: 'Мова і регіон',
    languageRegionHint: 'Країна, мова і валюта',
    accountSettings: 'Налаштування акаунта',
    accountSettingsHint: 'Профіль, безпека і вхід',
    legal: 'Юридична інформація',
    legalHint: 'Правила, privacy і умови платформи',
    help: 'Центр допомоги',
    helpHint: 'Підтримка, інструкції і зв’язок',
    faq: 'FAQ та інструкція',
    faqHint: 'Як користуватися Olamep крок за кроком',
  },
};

function getText(language: AppLanguage) {
  return profileTexts[language] || profileTexts.EN!;
}

function isOwnerProfile(profile: UserProfile) {
  return String(profile.email || '').trim().toLowerCase() === OWNER_EMAIL;
}

function shortName(name: string) {
  const clean = String(name || 'Olamep User').trim();
  if (clean.length <= 15) return clean;
  return `${clean.slice(0, 12)}...`;
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
      }}
    >
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
            background: BRAND.white,
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
        width: 28,
        height: 28,
        borderRadius: 999,
        background: BRAND.blue,
        color: BRAND.white,
        border: `2.5px solid ${BRAND.black}`,
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

function MiniIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        border: `2.5px solid ${BRAND.black}`,
        background: bg,
        display: 'grid',
        placeItems: 'center',
        fontSize: 26,
        boxShadow: '0 5px 0 rgba(0,0,0,0.07)',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

function SectionCard({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: ProfileItem[];
  onOpen: (route: string) => void;
}) {
  return (
    <section style={{ marginTop: 15 }}>
      <button
        type="button"
        onClick={() => {
          if (items[0]) onOpen(items[0].route);
        }}
        style={{
          width: '100%',
          borderRadius: 23,
          border: `2.8px solid ${BRAND.black}`,
          background: BRAND.white,
          padding: 0,
          overflow: 'hidden',
          textAlign: 'left',
          cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(7,27,70,0.04)',
        }}
      >
        <div
          style={{
            padding: '15px 15px 13px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 10,
            borderBottom: items.length > 0 ? `2.4px solid ${BRAND.black}` : 'none',
          }}
        >
          <div
            style={{
              fontSize: 23,
              lineHeight: 1.05,
              fontWeight: 900,
              color: BRAND.navy,
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </div>

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: `2.3px solid ${BRAND.black}`,
              background: BRAND.white,
              display: 'grid',
              placeItems: 'center',
              fontSize: 25,
              fontWeight: 900,
              color: BRAND.black,
            }}
          >
            ›
          </div>
        </div>

        <div>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                minHeight: 76,
                display: 'grid',
                gridTemplateColumns: '52px minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'center',
                padding: '12px 15px',
                borderTop: index === 0 ? 'none' : `2px solid ${BRAND.black}`,
                background: BRAND.white,
              }}
            >
              <MiniIcon icon={item.icon} bg={item.bg} />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: BRAND.navy,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 12.5,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: BRAND.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.hint}
                </div>
              </div>

              <div
                style={{
                  fontSize: 27,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.black,
                }}
              >
                ›
              </div>
            </div>
          ))}
        </div>
      </button>
    </section>
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

  const sections: ProfileSection[] = [
    {
      id: 'work',
      title: text.workHub,
      items: [
        {
          id: 'services',
          title: text.myServices,
          hint: text.myServicesHint,
          route: '/profile/listings',
          icon: '💼',
          bg: BRAND.softViolet,
        },
        {
          id: 'priceList',
          title: text.priceList,
          hint: text.priceListHint,
          route: '/profile/price-list',
          icon: '🏷️',
          bg: BRAND.softGreen,
        },
        {
          id: 'clients',
          title: text.clients,
          hint: text.clientsHint,
          route: '/profile/clients',
          icon: '👥',
          bg: BRAND.softBlue,
        },
        {
          id: 'platformOffers',
          title: text.platformOffers,
          hint: text.platformOffersHint,
          route: '/profile/platform-offers',
          icon: '📣',
          bg: BRAND.softYellow,
        },
      ],
    },
    {
      id: 'buyer',
      title: text.buyerHub,
      items: [
        {
          id: 'bookings',
          title: text.bookings,
          hint: text.bookingsHint,
          route: '/bookings',
          icon: '📅',
          bg: BRAND.softBlue,
        },
        {
          id: 'savedMasters',
          title: text.savedMasters,
          hint: text.savedMastersHint,
          route: '/profile/saved-masters',
          icon: '❤️',
          bg: BRAND.softPink,
        },
        {
          id: 'savedPlaces',
          title: text.savedPlaces,
          hint: text.savedPlacesHint,
          route: '/profile/saved-places',
          icon: '📍',
          bg: BRAND.softGreen,
        },
      ],
    },
    {
      id: 'rewards',
      title: text.rewardsHub,
      items: [
        {
          id: 'promotions',
          title: text.promotions,
          hint: text.promotionsHint,
          route: '/profile/promotions',
          icon: '🎁',
          bg: BRAND.softPink,
        },
        {
          id: 'invite',
          title: text.invite,
          hint: text.inviteHint,
          route: '/profile/invite',
          icon: '🎉',
          bg: BRAND.softViolet,
        },
        {
          id: 'notifications',
          title: text.notifications,
          hint: text.notificationsHint,
          route: '/profile/notifications',
          icon: '🔔',
          bg: BRAND.softYellow,
        },
      ],
    },
    {
      id: 'account',
      title: text.accountHub,
      items: [
        {
          id: 'payments',
          title: text.payments,
          hint: text.paymentsHint,
          route: '/profile/payments',
          icon: '💳',
          bg: BRAND.softBlue,
        },
        {
          id: 'languageRegion',
          title: text.languageRegion,
          hint: text.languageRegionHint,
          route: '/profile/language-region',
          icon: '🌍',
          bg: BRAND.softGreen,
        },
        {
          id: 'accountSettings',
          title: text.accountSettings,
          hint: text.accountSettingsHint,
          route: '/profile/settings',
          icon: '⚙️',
          bg: '#f2f4f7',
        },
      ],
    },
    {
      id: 'help',
      title: text.helpHub,
      items: [
        {
          id: 'legal',
          title: text.legal,
          hint: text.legalHint,
          route: '/profile/legal',
          icon: '⚖️',
          bg: BRAND.softViolet,
        },
        {
          id: 'helpCentre',
          title: text.help,
          hint: text.helpHint,
          route: '/profile/help',
          icon: '🛟',
          bg: BRAND.softPink,
        },
        {
          id: 'faq',
          title: text.faq,
          hint: text.faqHint,
          route: '/profile/faq',
          icon: '📘',
          bg: BRAND.softBlue,
        },
      ],
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.white,
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
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.7px solid ${BRAND.black}`,
              background: BRAND.white,
              color: BRAND.navy,
              fontSize: 25,
              fontWeight: 900,
              cursor: 'pointer',
            }}
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
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.7px solid ${BRAND.black}`,
              background: BRAND.white,
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 17 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 39,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.5px',
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
            border: `2.9px solid ${BRAND.black}`,
            background: BRAND.white,
            padding: 13,
            boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px minmax(0, 1fr) 24px',
              gap: 13,
              alignItems: 'start',
            }}
          >
            <div style={{ width: 100 }}>
              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                style={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 23,
                    objectFit: 'cover',
                    border: `2.8px solid ${BRAND.black}`,
                    display: 'block',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    right: -8,
                    bottom: -8,
                    width: 37,
                    height: 37,
                    borderRadius: 999,
                    border: `2.7px solid ${BRAND.black}`,
                    background: BRAND.white,
                    color: BRAND.navy,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 18,
                    boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
                  }}
                >
                  📷
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                style={{
                  marginTop: 12,
                  width: '100%',
                  minHeight: 34,
                  borderRadius: 999,
                  border: `2.5px solid ${BRAND.black}`,
                  background: BRAND.white,
                  color: BRAND.black,
                  fontSize: 13,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
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
                textAlign: 'left',
                cursor: 'pointer',
                minWidth: 0,
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
                    fontSize: 25,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: BRAND.navy,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {shortName(profile.fullName)}
                </div>

                {profile.isVerified ? <VerifiedBadge /> : null}

                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: '#00c733',
                    border: `2px solid ${BRAND.white}`,
                    boxShadow: '0 0 0 1.5px rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 7,
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
                  gap: 7,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    color: BRAND.yellow,
                    fontSize: 22,
                    letterSpacing: '1px',
                    lineHeight: 1,
                    textShadow: '0 1px 0 rgba(0,0,0,0.12)',
                  }}
                >
                  ★★★★★
                </span>

                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: BRAND.black,
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
                padding: 0,
                fontSize: 33,
                lineHeight: 1,
                fontWeight: 900,
                color: BRAND.black,
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              marginTop: 15,
              paddingTop: 13,
              borderTop: `2.5px solid ${BRAND.black}`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/wallet')}
              style={{
                minHeight: 116,
                borderRadius: 19,
                border: `2.8px solid ${BRAND.black}`,
                background: BRAND.blue,
                color: BRAND.white,
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 5px 0 rgba(0,0,0,0.10)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 11,
                  top: 32,
                  fontSize: 44,
                  opacity: 0.2,
                }}
              >
                💼
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {text.balanceTitle}
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontSize: 31,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                £{wallet.availableBalance.toFixed(2)}
              </div>

              <div
                onClick={(event) => {
                  event.stopPropagation();
                  router.push('/profile/top-up');
                }}
                style={{
                  marginTop: 11,
                  minHeight: 36,
                  borderRadius: 999,
                  background: BRAND.white,
                  color: BRAND.green,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '0 12px',
                  fontSize: 14,
                  fontWeight: 900,
                  border: `2.2px solid ${BRAND.white}`,
                  minWidth: 126,
                }}
              >
                <span
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: 999,
                    background: BRAND.green,
                    color: BRAND.white,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                    lineHeight: 1,
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
                minHeight: 116,
                borderRadius: 19,
                border: `2.8px solid ${BRAND.black}`,
                background: BRAND.red,
                color: BRAND.white,
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 5px 0 rgba(0,0,0,0.10)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {text.bonusTitle}
              </div>

              <div
                style={{
                  marginTop: 9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: BRAND.yellow,
                    color: BRAND.red,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                    border: `2px solid ${BRAND.yellow}`,
                  }}
                >
                  ★
                </span>

                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  1,240
                </span>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 10.8,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  color: BRAND.white,
                }}
              >
                {text.bonusHint}
              </div>

              <div
                style={{
                  marginTop: 9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: BRAND.yellow,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ↪ <span style={{ fontSize: 20 }}>|</span> 👥 <span style={{ fontSize: 20 }}>|</span> 🎁
              </div>
            </button>
          </div>
        </section>

        {sections.map((section) => (
          <SectionCard
            key={section.id}
            title={section.title}
            items={section.items}
            onOpen={(route) => router.push(route)}
          />
        ))}

        {isOwner ? (
          <button
            type="button"
            onClick={() => router.push('/admin')}
            style={{
              margin: '18px auto 0',
              display: 'block',
              border: 'none',
              background: 'transparent',
              color: BRAND.blue,
              fontSize: 13,
              fontWeight: 900,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {text.admin}
          </button>
        ) : null}
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
