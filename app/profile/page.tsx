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
} from '../services/userProfileStore';
import {
  getWalletState,
  subscribeToWalletStore,
  type WalletState,
} from '../services/walletStore';

type ProfileTextShape = {
  title: string;
  subtitle: string;
  verified: string;
  active: string;
  editProfile: string;
  quickTopUp: string;
  balanceAvailable: string;
  quickActions: string;
  activity: string;
  preferences: string;
  wallet: string;
  bookings: string;
  savedMasters: string;
  savedPlaces: string;
  promotions: string;
  invite: string;
  payments: string;
  notifications: string;
  languageRegion: string;
  settings: string;
  legal: string;
  help: string;
  open: string;
  walletReady: string;
  profileOverview: string;
};

const profileTexts: Record<string, ProfileTextShape> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, bookings, wallet and settings',
    verified: 'Verified',
    active: 'Profile active',
    editProfile: 'Edit profile',
    quickTopUp: 'Quick top up',
    balanceAvailable: 'Available balance',
    quickActions: 'Quick actions',
    activity: 'Activity',
    preferences: 'Preferences',
    wallet: 'Wallet',
    bookings: 'My bookings',
    savedMasters: 'Saved masters',
    savedPlaces: 'Saved places',
    promotions: 'Promotions',
    invite: 'Invite friends',
    payments: 'Payment methods',
    notifications: 'Notifications',
    languageRegion: 'Language & region',
    settings: 'Account settings',
    legal: 'Legal information',
    help: 'Help Centre',
    open: 'Open',
    walletReady: 'Wallet ready',
    profileOverview: 'Profile overview',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Tu cuenta, reservas, saldo y ajustes',
    verified: 'Verificado',
    active: 'Perfil activo',
    editProfile: 'Editar perfil',
    quickTopUp: 'Recarga rápida',
    balanceAvailable: 'Saldo disponible',
    quickActions: 'Acciones rápidas',
    activity: 'Actividad',
    preferences: 'Preferencias',
    wallet: 'Billetera',
    bookings: 'Mis reservas',
    savedMasters: 'Profesionales guardados',
    savedPlaces: 'Lugares guardados',
    promotions: 'Promociones',
    invite: 'Invitar amigos',
    payments: 'Métodos de pago',
    notifications: 'Notificaciones',
    languageRegion: 'Idioma y región',
    settings: 'Ajustes de cuenta',
    legal: 'Información legal',
    help: 'Centro de ayuda',
    open: 'Abrir',
    walletReady: 'Billetera lista',
    profileOverview: 'Resumen del perfil',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, бронирования, баланс и настройки',
    verified: 'Проверено',
    active: 'Профиль активен',
    editProfile: 'Редактировать профиль',
    quickTopUp: 'Быстрое пополнение',
    balanceAvailable: 'Доступный баланс',
    quickActions: 'Быстрые действия',
    activity: 'Активность',
    preferences: 'Предпочтения',
    wallet: 'Кошелёк',
    bookings: 'Мои бронирования',
    savedMasters: 'Сохранённые мастера',
    savedPlaces: 'Сохранённые места',
    promotions: 'Промоакции',
    invite: 'Пригласить друзей',
    payments: 'Способы оплаты',
    notifications: 'Уведомления',
    languageRegion: 'Язык и регион',
    settings: 'Настройки аккаунта',
    legal: 'Юридическая информация',
    help: 'Центр помощи',
    open: 'Открыть',
    walletReady: 'Кошелёк готов',
    profileOverview: 'Обзор профиля',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Váš účet, rezervace, zůstatek a nastavení',
    verified: 'Ověřeno',
    active: 'Profil aktivní',
    editProfile: 'Upravit profil',
    quickTopUp: 'Rychlé dobití',
    balanceAvailable: 'Dostupný zůstatek',
    quickActions: 'Rychlé akce',
    activity: 'Aktivita',
    preferences: 'Předvolby',
    wallet: 'Peněženka',
    bookings: 'Moje rezervace',
    savedMasters: 'Uložení specialisté',
    savedPlaces: 'Uložená místa',
    promotions: 'Promo akce',
    invite: 'Pozvat přátele',
    payments: 'Platební metody',
    notifications: 'Oznámení',
    languageRegion: 'Jazyk a region',
    settings: 'Nastavení účtu',
    legal: 'Právní informace',
    help: 'Centrum pomoci',
    open: 'Otevřít',
    walletReady: 'Peněženka připravena',
    profileOverview: 'Přehled profilu',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Dein Konto, Buchungen, Guthaben und Einstellungen',
    verified: 'Verifiziert',
    active: 'Profil aktiv',
    editProfile: 'Profil bearbeiten',
    quickTopUp: 'Schnell aufladen',
    balanceAvailable: 'Verfügbares Guthaben',
    quickActions: 'Schnellzugriff',
    activity: 'Aktivität',
    preferences: 'Einstellungen',
    wallet: 'Wallet',
    bookings: 'Meine Buchungen',
    savedMasters: 'Gespeicherte Profis',
    savedPlaces: 'Gespeicherte Orte',
    promotions: 'Aktionen',
    invite: 'Freunde einladen',
    payments: 'Zahlungsmethoden',
    notifications: 'Benachrichtigungen',
    languageRegion: 'Sprache & Region',
    settings: 'Kontoeinstellungen',
    legal: 'Rechtliche Informationen',
    help: 'Hilfezentrum',
    open: 'Öffnen',
    walletReady: 'Wallet bereit',
    profileOverview: 'Profilübersicht',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Twoje konto, rezerwacje, saldo i ustawienia',
    verified: 'Zweryfikowano',
    active: 'Profil aktywny',
    editProfile: 'Edytuj profil',
    quickTopUp: 'Szybkie doładowanie',
    balanceAvailable: 'Dostępne saldo',
    quickActions: 'Szybkie akcje',
    activity: 'Aktywność',
    preferences: 'Preferencje',
    wallet: 'Portfel',
    bookings: 'Moje rezerwacje',
    savedMasters: 'Zapisani specjaliści',
    savedPlaces: 'Zapisane miejsca',
    promotions: 'Promocje',
    invite: 'Zaproś znajomych',
    payments: 'Metody płatności',
    notifications: 'Powiadomienia',
    languageRegion: 'Język i region',
    settings: 'Ustawienia konta',
    legal: 'Informacje prawne',
    help: 'Centrum pomocy',
    open: 'Otwórz',
    walletReady: 'Portfel gotowy',
    profileOverview: 'Przegląd profilu',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, бронювання, баланс і налаштування',
    verified: 'Перевірено',
    active: 'Профіль активний',
    editProfile: 'Редагувати профіль',
    quickTopUp: 'Швидке поповнення',
    balanceAvailable: 'Доступний баланс',
    quickActions: 'Швидкі дії',
    activity: 'Активність',
    preferences: 'Налаштування',
    wallet: 'Гаманець',
    bookings: 'Мої бронювання',
    savedMasters: 'Збережені майстри',
    savedPlaces: 'Збережені місця',
    promotions: 'Промоакції',
    invite: 'Запросити друзів',
    payments: 'Способи оплати',
    notifications: 'Сповіщення',
    languageRegion: 'Мова та регіон',
    settings: 'Налаштування акаунта',
    legal: 'Юридична інформація',
    help: 'Центр допомоги',
    open: 'Відкрити',
    walletReady: 'Гаманець готовий',
    profileOverview: 'Огляд профілю',
  },
  IT: {
    title: 'Profilo',
    subtitle: 'Il tuo account, prenotazioni, saldo e impostazioni',
    verified: 'Verificato',
    active: 'Profilo attivo',
    editProfile: 'Modifica profilo',
    quickTopUp: 'Ricarica veloce',
    balanceAvailable: 'Saldo disponibile',
    quickActions: 'Azioni rapide',
    activity: 'Attività',
    preferences: 'Preferenze',
    wallet: 'Wallet',
    bookings: 'Le mie prenotazioni',
    savedMasters: 'Professionisti salvati',
    savedPlaces: 'Luoghi salvati',
    promotions: 'Promozioni',
    invite: 'Invita amici',
    payments: 'Metodi di pagamento',
    notifications: 'Notifiche',
    languageRegion: 'Lingua e regione',
    settings: 'Impostazioni account',
    legal: 'Informazioni legali',
    help: 'Centro assistenza',
    open: 'Apri',
    walletReady: 'Wallet pronto',
    profileOverview: 'Panoramica profilo',
  },
  FR: {
    title: 'Profil',
    subtitle: 'Votre compte, réservations, solde et paramètres',
    verified: 'Vérifié',
    active: 'Profil actif',
    editProfile: 'Modifier le profil',
    quickTopUp: 'Recharge rapide',
    balanceAvailable: 'Solde disponible',
    quickActions: 'Actions rapides',
    activity: 'Activité',
    preferences: 'Préférences',
    wallet: 'Portefeuille',
    bookings: 'Mes réservations',
    savedMasters: 'Professionnels enregistrés',
    savedPlaces: 'Lieux enregistrés',
    promotions: 'Promotions',
    invite: 'Inviter des amis',
    payments: 'Moyens de paiement',
    notifications: 'Notifications',
    languageRegion: 'Langue et région',
    settings: 'Paramètres du compte',
    legal: 'Informations légales',
    help: 'Centre d’aide',
    open: 'Ouvrir',
    walletReady: 'Portefeuille prêt',
    profileOverview: 'Vue du profil',
  },
  AR: {
    title: 'الملف الشخصي',
    subtitle: 'حسابك والحجوزات والرصيد والإعدادات',
    verified: 'موثّق',
    active: 'الملف نشط',
    editProfile: 'تعديل الملف',
    quickTopUp: 'شحن سريع',
    balanceAvailable: 'الرصيد المتاح',
    quickActions: 'إجراءات سريعة',
    activity: 'النشاط',
    preferences: 'التفضيلات',
    wallet: 'المحفظة',
    bookings: 'حجوزاتي',
    savedMasters: 'المختصون المحفوظون',
    savedPlaces: 'الأماكن المحفوظة',
    promotions: 'العروض',
    invite: 'دعوة الأصدقاء',
    payments: 'طرق الدفع',
    notifications: 'الإشعارات',
    languageRegion: 'اللغة والمنطقة',
    settings: 'إعدادات الحساب',
    legal: 'معلومات قانونية',
    help: 'مركز المساعدة',
    open: 'فتح',
    walletReady: 'المحفظة جاهزة',
    profileOverview: 'نظرة عامة',
  },
};

type ProfileCard = {
  id: string;
  title: string;
  route: string;
  icon: string;
  subtitle?: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'neutral';
};

function getText(language: AppLanguage): ProfileTextShape {
  return profileTexts[language] || profileTexts.EN;
}

function accentStyles(accent: ProfileCard['accent']) {
  if (accent === 'pink') return { background: '#fff0f6', color: '#ff4fa0' };
  if (accent === 'green') return { background: '#ecfdf3', color: '#15803d' };
  if (accent === 'blue') return { background: '#eef4ff', color: '#2563eb' };
  if (accent === 'violet') return { background: '#f3efff', color: '#7a5af8' };
  if (accent === 'orange') return { background: '#fff4db', color: '#b7791f' };
  return { background: '#f3f4f6', color: '#4b5563' };
}

const greenActionButtonStyle = {
  minHeight: 54,
  borderRadius: 999,
  border: '2px solid #111111',
  background: '#31b44b',
  color: '#fff',
  padding: '0 20px',
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
} as const;

const yellowTopUpButtonStyle = {
  minHeight: 54,
  borderRadius: 999,
  border: '2px solid #111111',
  background: '#f4d84b',
  color: '#17130f',
  padding: '0 16px',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
} as const;

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      setProfile(getUserProfile());
    };

    const syncWallet = () => {
      setWallet(getWalletState());
    };

    syncLanguage();
    syncProfile();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubWallet();
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const quickCards: ProfileCard[] = [
    {
      id: 'wallet',
      title: text.wallet,
      route: '/profile/balance',
      icon: '💼',
      subtitle: text.balanceAvailable,
      accent: 'green',
    },
    {
      id: 'bookings',
      title: text.bookings,
      route: '/profile/bookings',
      icon: '📅',
      accent: 'blue',
    },
    {
      id: 'savedMasters',
      title: text.savedMasters,
      route: '/profile/saved-masters',
      icon: '❤️',
      accent: 'pink',
    },
    {
      id: 'savedPlaces',
      title: text.savedPlaces,
      route: '/profile/saved-places',
      icon: '📍',
      accent: 'orange',
    },
  ];

  const activityCards: ProfileCard[] = [
    {
      id: 'promotions',
      title: text.promotions,
      route: '/profile/promotions',
      icon: '🎉',
      accent: 'pink',
    },
    {
      id: 'invite',
      title: text.invite,
      route: '/profile/invite',
      icon: '🎁',
      accent: 'violet',
    },
    {
      id: 'payments',
      title: text.payments,
      route: '/profile/payments',
      icon: '💳',
      accent: 'blue',
    },
    {
      id: 'notifications',
      title: text.notifications,
      route: '/profile/notifications',
      icon: '🔔',
      accent: 'orange',
    },
  ];

  const preferenceCards: ProfileCard[] = [
    {
      id: 'languageRegion',
      title: text.languageRegion,
      route: '/profile/language-region',
      icon: '🌍',
      accent: 'green',
    },
    {
      id: 'settings',
      title: text.settings,
      route: '/profile/settings',
      icon: '⚙️',
      accent: 'neutral',
    },
    {
      id: 'legal',
      title: text.legal,
      route: '/profile/legal',
      icon: '⚖️',
      accent: 'violet',
    },
    {
      id: 'help',
      title: text.help,
      route: '/profile/help',
      icon: '💬',
      accent: 'pink',
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#17130f',
        paddingBottom: 110,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {text.title}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              style={greenActionButtonStyle}
            >
              {text.editProfile}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/balance')}
              style={yellowTopUpButtonStyle}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>🏦</span>
              <span>{text.quickTopUp}</span>
            </button>
          </div>
        </div>

        <section>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#2f241c',
                color: '#fff',
                padding: 18,
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
                    borderRadius: 24,
                    objectFit: 'cover',
                    display: 'block',
                    border: '2px solid #111111',
                    background: '#fff',
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#fff',
                      lineHeight: 1.1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {profile.fullName}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: '#ddd2c6',
                      fontWeight: 700,
                      wordBreak: 'break-word',
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
                        border: '2px solid #111111',
                        background: '#ecfdf3',
                        color: '#15803d',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.active}
                    </span>

                    {profile.isVerified ? (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: '8px 12px',
                          border: '2px solid #111111',
                          background: '#eef4ff',
                          color: '#2563eb',
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

              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  alignItems: 'end',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#d9cdbd',
                      fontWeight: 800,
                    }}
                  >
                    {text.balanceAvailable}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 32,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: '#fff',
                    }}
                  >
                    £{wallet.availableBalance.toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 38,
                    padding: '0 12px',
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚡ {text.walletReady}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.quickActions}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {quickCards.map((card) => {
              const accent = accentStyles(card.accent);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => router.push(card.route)}
                  style={{
                    border: '2px solid #111111',
                    borderRadius: 28,
                    background: '#fff',
                    padding: 16,
                    textAlign: 'left',
                    cursor: 'pointer',
                    minHeight: 150,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      background: accent.background,
                      color: accent.color,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                      lineHeight: 1.25,
                    }}
                  >
                    {card.title}
                  </div>

                  {card.subtitle ? (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: '#7b7268',
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {card.subtitle}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.activity}
          </div>

          <div
            style={{
              overflow: 'hidden',
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
            }}
          >
            {activityCards.map((card, index) => {
              const accent = accentStyles(card.accent);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => router.push(card.route)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '16px 18px',
                    textAlign: 'left',
                    border: 'none',
                    borderTop: index !== 0 ? '2px solid #111111' : 'none',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      background: accent.background,
                      color: accent.color,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {card.title}
                  </div>

                  <span
                    style={{
                      fontSize: 16,
                      color: '#17130f',
                      fontWeight: 900,
                    }}
                  >
                    {text.open}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.preferences}
          </div>

          <div
            style={{
              overflow: 'hidden',
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
            }}
          >
            {preferenceCards.map((card, index) => {
              const accent = accentStyles(card.accent);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => router.push(card.route)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '16px 18px',
                    textAlign: 'left',
                    border: 'none',
                    borderTop: index !== 0 ? '2px solid #111111' : 'none',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      background: accent.background,
                      color: accent.color,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {card.title}
                  </div>

                  <span
                    style={{
                      fontSize: 16,
                      color: '#17130f',
                      fontWeight: 900,
                    }}
                  >
                    {text.open}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
