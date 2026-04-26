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
  clients: string;
  addService: string;
  messages: string;
  savedMasters: string;
  savedPlaces: string;
  promotions: string;
  deals: string;
  invite: string;
  payments: string;
  notifications: string;
  languageRegion: string;
  settings: string;
  legal: string;
  help: string;
  open: string;
  walletReady: string;
  profileStatus: string;
  totalBalance: string;
  verifiedAccount: string;
  manage: string;
};

type ProfileCard = {
  id: string;
  title: string;
  route: string;
  icon: string;
  subtitle?: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'red' | 'neutral';
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  cream: '#fffefa',
  bg: '#ffffff',
  soft: '#f8fbff',
  border: '#111111',
  muted: '#657080',
};

const profileTexts: Record<AppLanguage, ProfileTextShape> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, bookings, wallet and settings',
    verified: 'Verified',
    active: 'Profile active',
    editProfile: 'Edit profile',
    quickTopUp: 'Top up',
    balanceAvailable: 'Available balance',
    quickActions: 'Quick actions',
    activity: 'Activity',
    preferences: 'Preferences',
    wallet: 'Wallet',
    bookings: 'My bookings',
    clients: 'My clients',
    addService: 'Add service',
    messages: 'Messages',
    savedMasters: 'Saved masters',
    savedPlaces: 'Saved places',
    promotions: 'Promotions',
    deals: 'Deals of the day',
    invite: 'Invite friends',
    payments: 'Payment methods',
    notifications: 'Notifications',
    languageRegion: 'Language & region',
    settings: 'Account settings',
    legal: 'Legal information',
    help: 'Help Centre',
    open: 'Open',
    walletReady: 'Wallet ready',
    profileStatus: 'Profile status',
    totalBalance: 'Total balance',
    verifiedAccount: 'Verified account',
    manage: 'Manage',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Tu cuenta, reservas, saldo y ajustes',
    verified: 'Verificado',
    active: 'Perfil activo',
    editProfile: 'Editar perfil',
    quickTopUp: 'Recargar',
    balanceAvailable: 'Saldo disponible',
    quickActions: 'Acciones rápidas',
    activity: 'Actividad',
    preferences: 'Preferencias',
    wallet: 'Billetera',
    bookings: 'Mis reservas',
    clients: 'Mis clientes',
    addService: 'Añadir servicio',
    messages: 'Mensajes',
    savedMasters: 'Profesionales guardados',
    savedPlaces: 'Lugares guardados',
    promotions: 'Promociones',
    deals: 'Ofertas del día',
    invite: 'Invitar amigos',
    payments: 'Métodos de pago',
    notifications: 'Notificaciones',
    languageRegion: 'Idioma y región',
    settings: 'Ajustes de cuenta',
    legal: 'Información legal',
    help: 'Centro de ayuda',
    open: 'Abrir',
    walletReady: 'Billetera lista',
    profileStatus: 'Estado del perfil',
    totalBalance: 'Saldo total',
    verifiedAccount: 'Cuenta verificada',
    manage: 'Gestionar',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, бронирования, баланс и настройки',
    verified: 'Проверено',
    active: 'Профиль активен',
    editProfile: 'Редактировать',
    quickTopUp: 'Пополнить',
    balanceAvailable: 'Доступный баланс',
    quickActions: 'Быстрые действия',
    activity: 'Активность',
    preferences: 'Настройки',
    wallet: 'Кошелёк',
    bookings: 'Мои бронирования',
    clients: 'Мои клиенты',
    addService: 'Добавить услугу',
    messages: 'Сообщения',
    savedMasters: 'Сохранённые мастера',
    savedPlaces: 'Сохранённые места',
    promotions: 'Реклама',
    deals: 'Скидка дня',
    invite: 'Пригласить друзей',
    payments: 'Способы оплаты',
    notifications: 'Уведомления',
    languageRegion: 'Язык и регион',
    settings: 'Настройки аккаунта',
    legal: 'Юридическая информация',
    help: 'Центр помощи',
    open: 'Открыть',
    walletReady: 'Кошелёк готов',
    profileStatus: 'Статус профиля',
    totalBalance: 'Общий баланс',
    verifiedAccount: 'Проверенный аккаунт',
    manage: 'Управлять',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, бронювання, баланс і налаштування',
    verified: 'Перевірено',
    active: 'Профіль активний',
    editProfile: 'Редагувати',
    quickTopUp: 'Поповнити',
    balanceAvailable: 'Доступний баланс',
    quickActions: 'Швидкі дії',
    activity: 'Активність',
    preferences: 'Налаштування',
    wallet: 'Гаманець',
    bookings: 'Мої бронювання',
    clients: 'Мої клієнти',
    addService: 'Додати послугу',
    messages: 'Повідомлення',
    savedMasters: 'Збережені майстри',
    savedPlaces: 'Збережені місця',
    promotions: 'Реклама',
    deals: 'Знижка дня',
    invite: 'Запросити друзів',
    payments: 'Способи оплати',
    notifications: 'Сповіщення',
    languageRegion: 'Мова та регіон',
    settings: 'Налаштування акаунта',
    legal: 'Юридична інформація',
    help: 'Центр допомоги',
    open: 'Відкрити',
    walletReady: 'Гаманець готовий',
    profileStatus: 'Статус профілю',
    totalBalance: 'Загальний баланс',
    verifiedAccount: 'Перевірений акаунт',
    manage: 'Керувати',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Váš účet, rezervace, zůstatek a nastavení',
    verified: 'Ověřeno',
    active: 'Profil aktivní',
    editProfile: 'Upravit',
    quickTopUp: 'Dobít',
    balanceAvailable: 'Dostupný zůstatek',
    quickActions: 'Rychlé akce',
    activity: 'Aktivita',
    preferences: 'Předvolby',
    wallet: 'Peněženka',
    bookings: 'Moje rezervace',
    clients: 'Moji klienti',
    addService: 'Přidat službu',
    messages: 'Zprávy',
    savedMasters: 'Uložení specialisté',
    savedPlaces: 'Uložená místa',
    promotions: 'Reklama',
    deals: 'Sleva dne',
    invite: 'Pozvat přátele',
    payments: 'Platební metody',
    notifications: 'Oznámení',
    languageRegion: 'Jazyk a region',
    settings: 'Nastavení účtu',
    legal: 'Právní informace',
    help: 'Centrum pomoci',
    open: 'Otevřít',
    walletReady: 'Peněženka připravena',
    profileStatus: 'Stav profilu',
    totalBalance: 'Celkový zůstatek',
    verifiedAccount: 'Ověřený účet',
    manage: 'Spravovat',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Dein Konto, Buchungen, Guthaben und Einstellungen',
    verified: 'Verifiziert',
    active: 'Profil aktiv',
    editProfile: 'Bearbeiten',
    quickTopUp: 'Aufladen',
    balanceAvailable: 'Verfügbares Guthaben',
    quickActions: 'Schnellzugriff',
    activity: 'Aktivität',
    preferences: 'Einstellungen',
    wallet: 'Wallet',
    bookings: 'Meine Buchungen',
    clients: 'Meine Kunden',
    addService: 'Service hinzufügen',
    messages: 'Nachrichten',
    savedMasters: 'Gespeicherte Profis',
    savedPlaces: 'Gespeicherte Orte',
    promotions: 'Werbung',
    deals: 'Deal des Tages',
    invite: 'Freunde einladen',
    payments: 'Zahlungsmethoden',
    notifications: 'Benachrichtigungen',
    languageRegion: 'Sprache & Region',
    settings: 'Kontoeinstellungen',
    legal: 'Rechtliche Informationen',
    help: 'Hilfezentrum',
    open: 'Öffnen',
    walletReady: 'Wallet bereit',
    profileStatus: 'Profilstatus',
    totalBalance: 'Gesamtguthaben',
    verifiedAccount: 'Verifiziertes Konto',
    manage: 'Verwalten',
  },
  IT: {
    title: 'Profilo',
    subtitle: 'Il tuo account, prenotazioni, saldo e impostazioni',
    verified: 'Verificato',
    active: 'Profilo attivo',
    editProfile: 'Modifica',
    quickTopUp: 'Ricarica',
    balanceAvailable: 'Saldo disponibile',
    quickActions: 'Azioni rapide',
    activity: 'Attività',
    preferences: 'Preferenze',
    wallet: 'Wallet',
    bookings: 'Le mie prenotazioni',
    clients: 'I miei clienti',
    addService: 'Aggiungi servizio',
    messages: 'Messaggi',
    savedMasters: 'Professionisti salvati',
    savedPlaces: 'Luoghi salvati',
    promotions: 'Pubblicità',
    deals: 'Offerta del giorno',
    invite: 'Invita amici',
    payments: 'Metodi di pagamento',
    notifications: 'Notifiche',
    languageRegion: 'Lingua e regione',
    settings: 'Impostazioni account',
    legal: 'Informazioni legali',
    help: 'Centro assistenza',
    open: 'Apri',
    walletReady: 'Wallet pronto',
    profileStatus: 'Stato profilo',
    totalBalance: 'Saldo totale',
    verifiedAccount: 'Account verificato',
    manage: 'Gestisci',
  },
  FR: {
    title: 'Profil',
    subtitle: 'Votre compte, réservations, solde et paramètres',
    verified: 'Vérifié',
    active: 'Profil actif',
    editProfile: 'Modifier',
    quickTopUp: 'Recharger',
    balanceAvailable: 'Solde disponible',
    quickActions: 'Actions rapides',
    activity: 'Activité',
    preferences: 'Préférences',
    wallet: 'Portefeuille',
    bookings: 'Mes réservations',
    clients: 'Mes clients',
    addService: 'Ajouter un service',
    messages: 'Messages',
    savedMasters: 'Professionnels enregistrés',
    savedPlaces: 'Lieux enregistrés',
    promotions: 'Publicité',
    deals: 'Offre du jour',
    invite: 'Inviter des amis',
    payments: 'Moyens de paiement',
    notifications: 'Notifications',
    languageRegion: 'Langue et région',
    settings: 'Paramètres du compte',
    legal: 'Informations légales',
    help: 'Centre d’aide',
    open: 'Ouvrir',
    walletReady: 'Portefeuille prêt',
    profileStatus: 'Statut du profil',
    totalBalance: 'Solde total',
    verifiedAccount: 'Compte vérifié',
    manage: 'Gérer',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Twoje konto, rezerwacje, saldo i ustawienia',
    verified: 'Zweryfikowano',
    active: 'Profil aktywny',
    editProfile: 'Edytuj',
    quickTopUp: 'Doładuj',
    balanceAvailable: 'Dostępne saldo',
    quickActions: 'Szybkie akcje',
    activity: 'Aktywność',
    preferences: 'Preferencje',
    wallet: 'Portfel',
    bookings: 'Moje rezerwacje',
    clients: 'Moi klienci',
    addService: 'Dodaj usługę',
    messages: 'Wiadomości',
    savedMasters: 'Zapisani specjaliści',
    savedPlaces: 'Zapisane miejsca',
    promotions: 'Reklama',
    deals: 'Oferta dnia',
    invite: 'Zaproś znajomych',
    payments: 'Metody płatności',
    notifications: 'Powiadomienia',
    languageRegion: 'Język i region',
    settings: 'Ustawienia konta',
    legal: 'Informacje prawne',
    help: 'Centrum pomocy',
    open: 'Otwórz',
    walletReady: 'Portfel gotowy',
    profileStatus: 'Status profilu',
    totalBalance: 'Całkowite saldo',
    verifiedAccount: 'Zweryfikowane konto',
    manage: 'Zarządzaj',
  },
  AR: {
    title: 'الملف الشخصي',
    subtitle: 'حسابك والحجوزات والرصيد والإعدادات',
    verified: 'موثّق',
    active: 'الملف نشط',
    editProfile: 'تعديل',
    quickTopUp: 'شحن',
    balanceAvailable: 'الرصيد المتاح',
    quickActions: 'إجراءات سريعة',
    activity: 'النشاط',
    preferences: 'التفضيلات',
    wallet: 'المحفظة',
    bookings: 'حجوزاتي',
    clients: 'عملائي',
    addService: 'إضافة خدمة',
    messages: 'الرسائل',
    savedMasters: 'المختصون المحفوظون',
    savedPlaces: 'الأماكن المحفوظة',
    promotions: 'الإعلانات',
    deals: 'عرض اليوم',
    invite: 'دعوة الأصدقاء',
    payments: 'طرق الدفع',
    notifications: 'الإشعارات',
    languageRegion: 'اللغة والمنطقة',
    settings: 'إعدادات الحساب',
    legal: 'معلومات قانونية',
    help: 'مركز المساعدة',
    open: 'فتح',
    walletReady: 'المحفظة جاهزة',
    profileStatus: 'حالة الملف',
    totalBalance: 'الرصيد الكلي',
    verifiedAccount: 'حساب موثّق',
    manage: 'إدارة',
  },
};

function getText(language: AppLanguage): ProfileTextShape {
  return profileTexts[language] || profileTexts.EN;
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function accentStyles(accent: ProfileCard['accent']) {
  if (accent === 'pink') return { background: '#fff0f6', color: BRAND.pink };
  if (accent === 'green') return { background: '#dcffe8', color: '#008f3a' };
  if (accent === 'blue') return { background: '#dcecff', color: BRAND.blue };
  if (accent === 'violet') return { background: '#f3efff', color: '#7a5af8' };
  if (accent === 'orange') return { background: '#fff0da', color: '#b87500' };
  if (accent === 'red') return { background: '#ffe0e8', color: BRAND.red };
  return { background: '#f3f4f6', color: '#4b5563' };
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
        }}
      >
        Olamep
      </div>
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

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('focus', syncProfile);
    window.addEventListener('focus', syncWallet);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('pageshow', syncProfile);
    window.addEventListener('pageshow', syncWallet);
    window.addEventListener('storage', syncLanguage);
    window.addEventListener('storage', syncProfile);
    window.addEventListener('storage', syncWallet);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubWallet();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('focus', syncProfile);
      window.removeEventListener('focus', syncWallet);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('pageshow', syncProfile);
      window.removeEventListener('pageshow', syncWallet);
      window.removeEventListener('storage', syncLanguage);
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('storage', syncWallet);
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
      route: '/bookings',
      icon: '📅',
      subtitle: text.manage,
      accent: 'blue',
    },
    {
      id: 'clients',
      title: text.clients,
      route: '/profile/clients',
      icon: '👥',
      subtitle: text.manage,
      accent: 'red',
    },
    {
      id: 'messages',
      title: text.messages,
      route: '/messages',
      icon: '💬',
      subtitle: text.open,
      accent: 'violet',
    },
  ];

  const activityCards: ProfileCard[] = [
    {
      id: 'addService',
      title: text.addService,
      route: '/add',
      icon: '➕',
      accent: 'green',
    },
    {
      id: 'promotions',
      title: text.promotions,
      route: '/profile/promotions',
      icon: '📣',
      accent: 'pink',
    },
    {
      id: 'deals',
      title: text.deals,
      route: '/profile/deals/new',
      icon: '🔥',
      accent: 'red',
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
    {
      id: 'invite',
      title: text.invite,
      route: '/profile/invite',
      icon: '🎁',
      accent: 'violet',
    },
  ];

  const preferenceCards: ProfileCard[] = [
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
      icon: '🛟',
      accent: 'pink',
    },
  ];

  const availableBalance = Number(wallet.availableBalance || 0);
  const avatar =
    profile.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 130,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 140px' }}>
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
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
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
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: '-1.2px',
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
            marginTop: 16,
            borderRadius: 28,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <SummaryCard
              title={text.profileStatus}
              value={profile.isVerified ? text.verifiedAccount : text.active}
              bg={profile.isVerified ? '#dcecff' : '#dcffe8'}
              color={profile.isVerified ? BRAND.blue : BRAND.green}
              accent={profile.isVerified ? BRAND.blue : BRAND.green}
              icon={profile.isVerified ? '✓' : '●'}
            />

            <SummaryCard
              title={text.totalBalance}
              value={money(availableBalance)}
              bg="#fff0da"
              color={BRAND.navy}
              accent="#8b7355"
              icon="£"
            />
          </div>

          <div
            style={{
              marginTop: 11,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/edit')}
              style={{
                minHeight: 50,
                borderRadius: 18,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.green,
                color: '#ffffff',
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.editProfile}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/top-up')}
              style={{
                minHeight: 50,
                borderRadius: 18,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.yellow,
                color: '#17130f',
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🏦 {text.quickTopUp}
            </button>
          </div>
        </section>

        <section
          style={{
            marginTop: 14,
            borderRadius: 28,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.soft,
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '78px minmax(0, 1fr)',
              gap: 13,
              alignItems: 'center',
            }}
          >
            <img
              src={avatar}
              alt={profile.fullName}
              style={{
                width: 78,
                height: 78,
                borderRadius: 24,
                objectFit: 'cover',
                display: 'block',
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                  wordBreak: 'break-word',
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: BRAND.muted,
                  fontWeight: 800,
                  wordBreak: 'break-word',
                }}
              >
                {profile.email}
              </div>

              <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                <StatusPill label={text.active} bg="#dcffe8" color="#008f3a" />
                {profile.isVerified ? (
                  <StatusPill label={text.verified} bg="#dcecff" color={BRAND.blue} />
                ) : null}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 13,
              borderRadius: 20,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 13,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>
                {text.balanceAvailable}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {money(availableBalance)}
              </div>
            </div>

            <div
              style={{
                minHeight: 38,
                padding: '0 12px',
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.yellow,
                color: '#17130f',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              ⚡ {text.walletReady}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <SectionTitle title={text.quickActions} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {quickCards.map((card) => (
              <QuickCard
                key={card.id}
                card={card}
                onClick={() => router.push(card.route)}
              />
            ))}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <SectionTitle title={text.activity} />

          <MenuList
            cards={activityCards}
            openLabel={text.open}
            onOpen={(route) => router.push(route)}
          />
        </section>

        <section style={{ marginTop: 16 }}>
          <SectionTitle title={text.preferences} />

          <MenuList
            cards={preferenceCards}
            openLabel={text.open}
            onOpen={(route) => router.push(route)}
          />
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

function SummaryCard({
  title,
  value,
  bg,
  color,
  accent,
  icon,
}: {
  title: string;
  value: string;
  bg: string;
  color: string;
  accent: string;
  icon: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        padding: '12px 13px',
        minHeight: 82,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: accent }}>{title}</div>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 19,
          lineHeight: 1.1,
          fontWeight: 900,
          color,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        minHeight: 30,
        padding: '0 10px',
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 20,
        lineHeight: 1.1,
        fontWeight: 900,
        color: BRAND.navy,
        marginBottom: 10,
      }}
    >
      {title}
    </div>
  );
}

function QuickCard({ card, onClick }: { card: ProfileCard; onClick: () => void }) {
  const accent = accentStyles(card.accent);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `2px solid ${BRAND.border}`,
        borderRadius: 24,
        background: '#ffffff',
        padding: 12,
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: 124,
        boxShadow: '0 8px 20px rgba(7,27,70,0.06)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 15,
          border: `2px solid ${BRAND.border}`,
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
          marginTop: 11,
          fontSize: 15,
          fontWeight: 900,
          color: BRAND.navy,
          lineHeight: 1.18,
        }}
      >
        {card.title}
      </div>

      {card.subtitle ? (
        <div
          style={{
            marginTop: 5,
            fontSize: 11.5,
            color: BRAND.muted,
            fontWeight: 800,
            lineHeight: 1.3,
          }}
        >
          {card.subtitle}
        </div>
      ) : null}
    </button>
  );
}

function MenuList({
  cards,
  openLabel,
  onOpen,
}: {
  cards: ProfileCard[];
  openLabel: string;
  onOpen: (route: string) => void;
}) {
  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 24,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
      }}
    >
      {cards.map((card, index) => {
        const accent = accentStyles(card.accent);

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpen(card.route)}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '44px minmax(0, 1fr) auto',
              gap: 12,
              alignItems: 'center',
              padding: '13px 14px',
              textAlign: 'left',
              border: 'none',
              borderTop: index !== 0 ? `2px solid ${BRAND.border}` : 'none',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 15,
                border: `2px solid ${BRAND.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                background: accent.background,
                color: accent.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            <div
              style={{
                minWidth: 0,
                fontSize: 14.5,
                fontWeight: 900,
                color: BRAND.navy,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {card.title}
            </div>

            <span
              style={{
                minHeight: 32,
                padding: '0 10px',
                borderRadius: 999,
                background: BRAND.soft,
                color: BRAND.blue,
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: 11.5,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {openLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
