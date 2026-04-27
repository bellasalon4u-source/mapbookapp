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
  profileActive: string;
  verified: string;
  trustScore: string;
  excellentLevel: string;
  balance: string;
  available: string;
  topUp: string;
  myQrCode: string;
  editProfile: string;
  quickActions: string;
  bookings: string;
  bookingsHint: string;
  myListings: string;
  myListingsHint: string;
  priceList: string;
  priceListHint: string;
  clients: string;
  clientsHint: string;
  bonusesSaved: string;
  promotions: string;
  promotionsHint: string;
  invite: string;
  inviteHint: string;
  savedMasters: string;
  savedMastersHint: string;
  savedPlaces: string;
  savedPlacesHint: string;
  settings: string;
  payments: string;
  notifications: string;
  languageRegion: string;
  accountSettings: string;
  legal: string;
  help: string;
  open: string;
};

type MainAction = {
  id: string;
  title: string;
  hint: string;
  route: string;
  icon: string;
  bg: string;
};

type ListAction = {
  id: string;
  title: string;
  hint?: string;
  route: string;
  icon: string;
  bg: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  cream: '#fff4dc',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
  softOrange: '#fff0da',
  bg: '#ffffff',
  border: '#050505',
  muted: '#657080',
};

const profileTexts: Record<AppLanguage, ProfileTextShape> = {
  EN: {
    title: 'Profile',
    subtitle: 'Your account, listings, bookings and settings',
    profileActive: 'Profile active',
    verified: 'Verified',
    trustScore: 'Trust Score',
    excellentLevel: 'Excellent level',
    balance: 'Balance',
    available: 'Available',
    topUp: 'Top up balance',
    myQrCode: 'My QR code',
    editProfile: 'Edit profile',
    quickActions: 'My work hub',
    bookings: 'My bookings',
    bookingsHint: 'All your bookings',
    myListings: 'My services',
    myListingsHint: 'Manage your offers',
    priceList: 'Price list',
    priceListHint: 'Services and prices',
    clients: 'My clients',
    clientsHint: 'Orders and requests',
    bonusesSaved: 'My saved space',
    promotions: 'Promotions',
    promotionsHint: 'Discounts and bonuses',
    invite: 'Invite friends',
    inviteHint: 'Get rewards',
    savedMasters: 'Saved masters',
    savedMastersHint: 'Your specialists',
    savedPlaces: 'Saved places',
    savedPlacesHint: 'Favourite locations',
    settings: 'Settings',
    payments: 'Payment methods',
    notifications: 'Notifications',
    languageRegion: 'Language & region',
    accountSettings: 'Account settings',
    legal: 'Legal information',
    help: 'Help Centre',
    open: 'Open',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Ваш аккаунт, объявления, бронирования и настройки',
    profileActive: 'Профиль активен',
    verified: 'Проверено',
    trustScore: 'Trust Score',
    excellentLevel: 'Отличный уровень',
    balance: 'Баланс',
    available: 'Доступно',
    topUp: 'Пополнить баланс',
    myQrCode: 'Мой QR-код',
    editProfile: 'Редактировать',
    quickActions: 'Рабочий кабинет',
    bookings: 'Мои бронирования',
    bookingsHint: 'Все ваши брони',
    myListings: 'Мои услуги',
    myListingsHint: 'Управление предложениями',
    priceList: 'Прайс-лист',
    priceListHint: 'Услуги и цены',
    clients: 'Мои клиенты',
    clientsHint: 'Заказы и заявки',
    bonusesSaved: 'Мои сохранения',
    promotions: 'Промоакции',
    promotionsHint: 'Скидки и бонусы',
    invite: 'Пригласить друзей',
    inviteHint: 'Получайте бонусы',
    savedMasters: 'Сохранённые мастера',
    savedMastersHint: 'Ваши специалисты',
    savedPlaces: 'Сохранённые места',
    savedPlacesHint: 'Любимые локации',
    settings: 'Настройки',
    payments: 'Способы оплаты',
    notifications: 'Уведомления',
    languageRegion: 'Язык и регион',
    accountSettings: 'Настройки аккаунта',
    legal: 'Юридическая информация',
    help: 'Центр помощи',
    open: 'Открыть',
  },
  UA: {
    title: 'Профіль',
    subtitle: 'Ваш акаунт, оголошення, бронювання і налаштування',
    profileActive: 'Профіль активний',
    verified: 'Перевірено',
    trustScore: 'Trust Score',
    excellentLevel: 'Відмінний рівень',
    balance: 'Баланс',
    available: 'Доступно',
    topUp: 'Поповнити баланс',
    myQrCode: 'Мій QR-код',
    editProfile: 'Редагувати',
    quickActions: 'Робочий кабінет',
    bookings: 'Мої бронювання',
    bookingsHint: 'Усі ваші броні',
    myListings: 'Мої послуги',
    myListingsHint: 'Керування пропозиціями',
    priceList: 'Прайс-лист',
    priceListHint: 'Послуги та ціни',
    clients: 'Мої клієнти',
    clientsHint: 'Замовлення і заявки',
    bonusesSaved: 'Мої збереження',
    promotions: 'Промоакції',
    promotionsHint: 'Знижки і бонуси',
    invite: 'Запросити друзів',
    inviteHint: 'Отримуйте бонуси',
    savedMasters: 'Збережені майстри',
    savedMastersHint: 'Ваші спеціалісти',
    savedPlaces: 'Збережені місця',
    savedPlacesHint: 'Улюблені локації',
    settings: 'Налаштування',
    payments: 'Способи оплати',
    notifications: 'Сповіщення',
    languageRegion: 'Мова та регіон',
    accountSettings: 'Налаштування акаунта',
    legal: 'Юридична інформація',
    help: 'Центр допомоги',
    open: 'Відкрити',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Tu cuenta, anuncios, reservas y ajustes',
    profileActive: 'Perfil activo',
    verified: 'Verificado',
    trustScore: 'Trust Score',
    excellentLevel: 'Nivel excelente',
    balance: 'Saldo',
    available: 'Disponible',
    topUp: 'Recargar saldo',
    myQrCode: 'Mi QR',
    editProfile: 'Editar perfil',
    quickActions: 'Mi centro de trabajo',
    bookings: 'Mis reservas',
    bookingsHint: 'Todas tus reservas',
    myListings: 'Mis servicios',
    myListingsHint: 'Gestiona tus ofertas',
    priceList: 'Lista de precios',
    priceListHint: 'Servicios y precios',
    clients: 'Mis clientes',
    clientsHint: 'Pedidos y solicitudes',
    bonusesSaved: 'Mis guardados',
    promotions: 'Promociones',
    promotionsHint: 'Descuentos y bonos',
    invite: 'Invitar amigos',
    inviteHint: 'Recibe recompensas',
    savedMasters: 'Especialistas guardados',
    savedMastersHint: 'Tus especialistas',
    savedPlaces: 'Lugares guardados',
    savedPlacesHint: 'Ubicaciones favoritas',
    settings: 'Ajustes',
    payments: 'Métodos de pago',
    notifications: 'Notificaciones',
    languageRegion: 'Idioma y región',
    accountSettings: 'Ajustes de cuenta',
    legal: 'Información legal',
    help: 'Centro de ayuda',
    open: 'Abrir',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Váš účet, inzeráty, rezervace a nastavení',
    profileActive: 'Profil aktivní',
    verified: 'Ověřeno',
    trustScore: 'Trust Score',
    excellentLevel: 'Výborná úroveň',
    balance: 'Zůstatek',
    available: 'Dostupné',
    topUp: 'Dobít zůstatek',
    myQrCode: 'Můj QR kód',
    editProfile: 'Upravit profil',
    quickActions: 'Pracovní centrum',
    bookings: 'Moje rezervace',
    bookingsHint: 'Všechny rezervace',
    myListings: 'Moje služby',
    myListingsHint: 'Správa nabídek',
    priceList: 'Ceník',
    priceListHint: 'Služby a ceny',
    clients: 'Moji klienti',
    clientsHint: 'Objednávky a poptávky',
    bonusesSaved: 'Moje uložené',
    promotions: 'Promo akce',
    promotionsHint: 'Slevy a bonusy',
    invite: 'Pozvat přátele',
    inviteHint: 'Získejte odměny',
    savedMasters: 'Uložení specialisté',
    savedMastersHint: 'Vaši specialisté',
    savedPlaces: 'Uložená místa',
    savedPlacesHint: 'Oblíbené lokace',
    settings: 'Nastavení',
    payments: 'Platební metody',
    notifications: 'Oznámení',
    languageRegion: 'Jazyk a region',
    accountSettings: 'Nastavení účtu',
    legal: 'Právní informace',
    help: 'Centrum pomoci',
    open: 'Otevřít',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Dein Konto, Anzeigen, Buchungen und Einstellungen',
    profileActive: 'Profil aktiv',
    verified: 'Verifiziert',
    trustScore: 'Trust Score',
    excellentLevel: 'Sehr gutes Level',
    balance: 'Guthaben',
    available: 'Verfügbar',
    topUp: 'Guthaben aufladen',
    myQrCode: 'Mein QR-Code',
    editProfile: 'Profil bearbeiten',
    quickActions: 'Arbeitsbereich',
    bookings: 'Meine Buchungen',
    bookingsHint: 'Alle Buchungen',
    myListings: 'Meine Services',
    myListingsHint: 'Angebote verwalten',
    priceList: 'Preisliste',
    priceListHint: 'Services und Preise',
    clients: 'Meine Kunden',
    clientsHint: 'Aufträge und Anfragen',
    bonusesSaved: 'Meine Favoriten',
    promotions: 'Aktionen',
    promotionsHint: 'Rabatte und Boni',
    invite: 'Freunde einladen',
    inviteHint: 'Prämien erhalten',
    savedMasters: 'Gespeicherte Profis',
    savedMastersHint: 'Deine Spezialisten',
    savedPlaces: 'Gespeicherte Orte',
    savedPlacesHint: 'Lieblingsorte',
    settings: 'Einstellungen',
    payments: 'Zahlungsmethoden',
    notifications: 'Benachrichtigungen',
    languageRegion: 'Sprache & Region',
    accountSettings: 'Kontoeinstellungen',
    legal: 'Rechtliche Informationen',
    help: 'Hilfezentrum',
    open: 'Öffnen',
  },
  IT: {
    title: 'Profilo',
    subtitle: 'Il tuo account, annunci, prenotazioni e impostazioni',
    profileActive: 'Profilo attivo',
    verified: 'Verificato',
    trustScore: 'Trust Score',
    excellentLevel: 'Livello eccellente',
    balance: 'Saldo',
    available: 'Disponibile',
    topUp: 'Ricarica saldo',
    myQrCode: 'Il mio QR',
    editProfile: 'Modifica profilo',
    quickActions: 'Area lavoro',
    bookings: 'Le mie prenotazioni',
    bookingsHint: 'Tutte le prenotazioni',
    myListings: 'I miei servizi',
    myListingsHint: 'Gestisci offerte',
    priceList: 'Listino prezzi',
    priceListHint: 'Servizi e prezzi',
    clients: 'I miei clienti',
    clientsHint: 'Ordini e richieste',
    bonusesSaved: 'I miei salvati',
    promotions: 'Promozioni',
    promotionsHint: 'Sconti e bonus',
    invite: 'Invita amici',
    inviteHint: 'Ottieni premi',
    savedMasters: 'Professionisti salvati',
    savedMastersHint: 'I tuoi specialisti',
    savedPlaces: 'Luoghi salvati',
    savedPlacesHint: 'Luoghi preferiti',
    settings: 'Impostazioni',
    payments: 'Metodi di pagamento',
    notifications: 'Notifiche',
    languageRegion: 'Lingua e regione',
    accountSettings: 'Impostazioni account',
    legal: 'Informazioni legali',
    help: 'Centro assistenza',
    open: 'Apri',
  },
  FR: {
    title: 'Profil',
    subtitle: 'Votre compte, annonces, réservations et paramètres',
    profileActive: 'Profil actif',
    verified: 'Vérifié',
    trustScore: 'Trust Score',
    excellentLevel: 'Excellent niveau',
    balance: 'Solde',
    available: 'Disponible',
    topUp: 'Recharger le solde',
    myQrCode: 'Mon QR code',
    editProfile: 'Modifier',
    quickActions: 'Espace pro',
    bookings: 'Mes réservations',
    bookingsHint: 'Toutes vos réservations',
    myListings: 'Mes services',
    myListingsHint: 'Gérer vos offres',
    priceList: 'Liste de prix',
    priceListHint: 'Services et prix',
    clients: 'Mes clients',
    clientsHint: 'Commandes et demandes',
    bonusesSaved: 'Mes favoris',
    promotions: 'Promotions',
    promotionsHint: 'Réductions et bonus',
    invite: 'Inviter des amis',
    inviteHint: 'Obtenir des récompenses',
    savedMasters: 'Pros enregistrés',
    savedMastersHint: 'Vos spécialistes',
    savedPlaces: 'Lieux enregistrés',
    savedPlacesHint: 'Lieux favoris',
    settings: 'Paramètres',
    payments: 'Moyens de paiement',
    notifications: 'Notifications',
    languageRegion: 'Langue et région',
    accountSettings: 'Paramètres du compte',
    legal: 'Informations légales',
    help: 'Centre d’aide',
    open: 'Ouvrir',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Twoje konto, ogłoszenia, rezerwacje i ustawienia',
    profileActive: 'Profil aktywny',
    verified: 'Zweryfikowano',
    trustScore: 'Trust Score',
    excellentLevel: 'Świetny poziom',
    balance: 'Saldo',
    available: 'Dostępne',
    topUp: 'Doładuj saldo',
    myQrCode: 'Mój kod QR',
    editProfile: 'Edytuj profil',
    quickActions: 'Panel pracy',
    bookings: 'Moje rezerwacje',
    bookingsHint: 'Wszystkie rezerwacje',
    myListings: 'Moje usługi',
    myListingsHint: 'Zarządzaj ofertami',
    priceList: 'Cennik',
    priceListHint: 'Usługi i ceny',
    clients: 'Moi klienci',
    clientsHint: 'Zamówienia i zapytania',
    bonusesSaved: 'Moje zapisane',
    promotions: 'Promocje',
    promotionsHint: 'Zniżki i bonusy',
    invite: 'Zaproś znajomych',
    inviteHint: 'Otrzymuj nagrody',
    savedMasters: 'Zapisani specjaliści',
    savedMastersHint: 'Twoi specjaliści',
    savedPlaces: 'Zapisane miejsca',
    savedPlacesHint: 'Ulubione miejsca',
    settings: 'Ustawienia',
    payments: 'Metody płatności',
    notifications: 'Powiadomienia',
    languageRegion: 'Język i region',
    accountSettings: 'Ustawienia konta',
    legal: 'Informacje prawne',
    help: 'Centrum pomocy',
    open: 'Otwórz',
  },
  AR: {
    title: 'الملف الشخصي',
    subtitle: 'حسابك، الإعلانات، الحجوزات والإعدادات',
    profileActive: 'الملف نشط',
    verified: 'موثّق',
    trustScore: 'Trust Score',
    excellentLevel: 'مستوى ممتاز',
    balance: 'الرصيد',
    available: 'متاح',
    topUp: 'شحن الرصيد',
    myQrCode: 'رمز QR الخاص بي',
    editProfile: 'تعديل الملف',
    quickActions: 'مركز العمل',
    bookings: 'حجوزاتي',
    bookingsHint: 'كل الحجوزات',
    myListings: 'خدماتي',
    myListingsHint: 'إدارة العروض',
    priceList: 'قائمة الأسعار',
    priceListHint: 'الخدمات والأسعار',
    clients: 'عملائي',
    clientsHint: 'الطلبات والرسائل',
    bonusesSaved: 'محفوظاتي',
    promotions: 'العروض',
    promotionsHint: 'خصومات ومكافآت',
    invite: 'دعوة الأصدقاء',
    inviteHint: 'احصل على مكافآت',
    savedMasters: 'المختصون المحفوظون',
    savedMastersHint: 'مختصوك',
    savedPlaces: 'الأماكن المحفوظة',
    savedPlacesHint: 'المواقع المفضلة',
    settings: 'الإعدادات',
    payments: 'طرق الدفع',
    notifications: 'الإشعارات',
    languageRegion: 'اللغة والمنطقة',
    accountSettings: 'إعدادات الحساب',
    legal: 'معلومات قانونية',
    help: 'مركز المساعدة',
    open: 'فتح',
  },
};

function getText(language: AppLanguage) {
  return profileTexts[language] || profileTexts.EN;
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

function BlueVerifiedBadge() {
  return (
    <span
      aria-label="Verified"
      style={{
        width: 26,
        height: 26,
        borderRadius: 999,
        background: BRAND.blue,
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        border: `2px solid ${BRAND.border}`,
        boxShadow: '0 3px 0 rgba(0,0,0,0.10)',
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function RealisticIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 29,
        boxShadow: '0 5px 0 rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

function QrIcon() {
  return (
    <span
      style={{
        width: 31,
        height: 31,
        borderRadius: 8,
        background: '#ffffff',
        border: `2px solid ${BRAND.border}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 3,
        padding: 4,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {[0, 1, 2, 3].map((item) => (
        <span
          key={item}
          style={{
            borderRadius: 2,
            background: BRAND.border,
          }}
        />
      ))}
    </span>
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

  const mainActions: MainAction[] = [
    {
      id: 'bookings',
      title: text.bookings,
      hint: text.bookingsHint,
      route: '/profile/bookings',
      icon: '📅',
      bg: BRAND.softBlue,
    },
    {
      id: 'listings',
      title: text.myListings,
      hint: text.myListingsHint,
      route: '/profile/listings',
      icon: '💼',
      bg: BRAND.softGreen,
    },
    {
      id: 'priceList',
      title: text.priceList,
      hint: text.priceListHint,
      route: '/profile/price-list',
      icon: '📋',
      bg: BRAND.softOrange,
    },
    {
      id: 'clients',
      title: text.clients,
      hint: text.clientsHint,
      route: '/profile/clients',
      icon: '🤝',
      bg: BRAND.softPink,
    },
  ];

  const bonusActions: ListAction[] = [
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
  ];

  const settingActions: ListAction[] = [
    {
      id: 'payments',
      title: text.payments,
      route: '/profile/payments',
      icon: '💳',
      bg: BRAND.softBlue,
    },
    {
      id: 'notifications',
      title: text.notifications,
      route: '/profile/notifications',
      icon: '🔔',
      bg: BRAND.cream,
    },
    {
      id: 'languageRegion',
      title: text.languageRegion,
      route: '/profile/language-region',
      icon: '🌍',
      bg: BRAND.softGreen,
    },
    {
      id: 'settings',
      title: text.accountSettings,
      route: '/profile/settings',
      icon: '⚙️',
      bg: '#f2f4f7',
    },
    {
      id: 'legal',
      title: text.legal,
      route: '/profile/legal',
      icon: '⚖️',
      bg: BRAND.softViolet,
    },
    {
      id: 'help',
      title: text.help,
      route: '/profile/help',
      icon: '🛟',
      bg: BRAND.softPink,
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
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
              border: `2.5px solid ${BRAND.border}`,
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
            aria-label="Close"
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
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
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 13,
            boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/profile/edit')}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: '86px minmax(0, 1fr) 28px',
              gap: 13,
              alignItems: 'center',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'relative', width: 86, height: 86 }}>
              <img
                src={profile.avatar}
                alt={profile.fullName}
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 24,
                  objectFit: 'cover',
                  border: `2.5px solid ${BRAND.border}`,
                  display: 'block',
                }}
              />

              <span
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -6,
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
                  boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
                }}
              >
                📷
              </span>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
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

                {profile.isVerified ? <BlueVerifiedBadge /> : null}
              </div>

              <div
                style={{
                  marginTop: 5,
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
                  marginTop: 9,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 30,
                  padding: '0 11px',
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.softGreen,
                  color: '#008f3a',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: BRAND.green,
                  }}
                />
                {text.profileActive}
              </div>
            </div>

            <div
              style={{
                fontSize: 31,
                fontWeight: 900,
                color: BRAND.border,
                lineHeight: 1,
              }}
            >
              ›
            </div>
          </button>

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
            <div
              style={{
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 12,
                minHeight: 98,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  color: BRAND.blue,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                🛡️ {text.trustScore}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: BRAND.navy,
                }}
              >
                82
                <span style={{ fontSize: 16, color: '#111111' }}> / 100</span>
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 12,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.excellentLevel}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softOrange,
                padding: 12,
                minHeight: 98,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#8b7355',
                }}
              >
                💼 {text.balance}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 29,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: BRAND.navy,
                }}
              >
                £{wallet.availableBalance.toFixed(2)}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 12,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.available}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => router.push('/profile/top-up')}
              style={{
                width: '100%',
                minHeight: 64,
                borderRadius: 20,
                border: `3px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: `0 5px 0 ${BRAND.border}`,
                display: 'grid',
                gridTemplateColumns: '42px 1fr 34px',
                alignItems: 'center',
                gap: 10,
                padding: '9px 13px',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  background:
                    'linear-gradient(135deg, #dcecff 0%, #dcffe8 48%, #fff0da 100%)',
                  border: `2.5px solid ${BRAND.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <QrIcon />
              </span>

              <span
                style={{
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {text.topUp}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: 1.15,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  QR / card / wallet
                </span>
              </span>

              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: BRAND.yellow,
                  border: `2px solid ${BRAND.border}`,
                  color: BRAND.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 900,
                  boxSizing: 'border-box',
                }}
              >
                →
              </span>
            </button>
          </div>
        </section>

        <SectionTitle title={text.quickActions} />

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {mainActions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.route)}
              style={{
                minHeight: 154,
                borderRadius: 22,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                display: 'grid',
                alignContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <RealisticIcon icon={item.icon} bg={item.bg} />

                <span
                  style={{
                    fontSize: 29,
                    fontWeight: 900,
                    color: BRAND.border,
                    lineHeight: 1,
                  }}
                >
                  ›
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    lineHeight: 1.25,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  {item.hint}
                </div>
              </div>
            </button>
          ))}
        </section>

        <SectionTitle title={text.bonusesSaved} />

        <ListSection items={bonusActions} openText={text.open} router={router} />

        <SectionTitle title={text.settings} />

        <ListSection items={settingActions} openText={text.open} router={router} />
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2
      style={{
        margin: '22px 0 10px',
        fontSize: 24,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '-0.6px',
        color: BRAND.navy,
      }}
    >
      {title}
    </h2>
  );
}

function ListSection({
  items,
  openText,
  router,
}: {
  items: ListAction[];
  openText: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section
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
          onClick={() => router.push(item.route)}
          style={{
            width: '100%',
            minHeight: 82,
            display: 'grid',
            gridTemplateColumns: '58px minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
            padding: '12px 13px',
            border: 'none',
            borderTop: index === 0 ? 'none' : `2px solid ${BRAND.border}`,
            background: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <RealisticIcon icon={item.icon} bg={item.bg} />

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.15,
                fontWeight: 900,
                color: BRAND.navy,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </div>

            {item.hint ? (
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
            ) : null}
          </div>

          <span
            style={{
              minHeight: 34,
              padding: '0 12px',
              borderRadius: 999,
              background: '#f4faff',
              color: BRAND.blue,
              fontSize: 12,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {openText}
          </span>
        </button>
      ))}
    </section>
  );
}
