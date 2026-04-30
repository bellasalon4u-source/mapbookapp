'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../services/userProfileStore';
import {
  getWalletState,
  subscribeToWalletStore,
  type WalletState,
  type WalletTransaction,
} from '../services/walletStore';
import {
  getBookings,
  subscribeToBookingsStore,
  type BookingItem,
} from '../services/bookingsStore';
import {
  getListings,
  subscribeToListingsStore,
  type ListingItem,
} from '../services/listingsStore';
import {
  getPromotions,
  subscribeToPromotionsStore,
  type PromotionItem,
} from '../services/promotionsStore';

type AdminText = {
  title: string;
  subtitle: string;
  lockedTitle: string;
  lockedText: string;
  email: string;
  accessCode: string;
  unlock: string;
  wrongAccess: string;
  back: string;
  overview: string;
  revenue: string;
  walletBalance: string;
  bookings: string;
  listings: string;
  promotions: string;
  users: string;
  adminAccess: string;
  ownerAccount: string;
  paymentSecurity: string;
  paymentSecurityText: string;
  appManagement: string;
  appManagementText: string;
  recentTransactions: string;
  recentBookings: string;
  amount: string;
  status: string;
  date: string;
  client: string;
  service: string;
  price: string;
  openProfile: string;
  openWallet: string;
  openHome: string;
  noData: string;
  completed: string;
  pending: string;
  credited: string;
  failed: string;
};

const ADMIN_EMAIL = 'olamepcom@gmail.com';
const ADMIN_CODE = 'OLAMEP-OWNER-2026';
const SESSION_KEY = 'olamep_admin_access';

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  cream: '#fffdf8',
  softBlue: '#eaf4ff',
  softGreen: '#dcffe8',
  softYellow: '#fff4c7',
  softRed: '#ffe3ea',
  softViolet: '#f2edff',
  border: '#050505',
  muted: '#657080',
};

const adminTexts: Record<AppLanguage, AdminText> = {
  EN: {
    title: 'Owner Admin',
    subtitle: 'Private control panel for Olamep owner',
    lockedTitle: 'Admin access',
    lockedText: 'This page is hidden from normal users. Use the owner email or access code.',
    email: 'Owner email',
    accessCode: 'Access code',
    unlock: 'Unlock admin',
    wrongAccess: 'Wrong email or code',
    back: 'Back',
    overview: 'Overview',
    revenue: 'Revenue',
    walletBalance: 'Wallet balance',
    bookings: 'Bookings',
    listings: 'Services',
    promotions: 'Promotions',
    users: 'Users',
    adminAccess: 'Admin access',
    ownerAccount: 'Owner account',
    paymentSecurity: 'Payment security',
    paymentSecurityText:
      'Card data should never be stored inside the app. Real payments must be handled by Stripe/PayPal/bank provider. Admin sees balances and transaction history only.',
    appManagement: 'App management',
    appManagementText:
      'From here you can monitor money, bookings, services, promotions and owner account data.',
    recentTransactions: 'Recent transactions',
    recentBookings: 'Recent bookings',
    amount: 'Amount',
    status: 'Status',
    date: 'Date',
    client: 'Client',
    service: 'Service',
    price: 'Price',
    openProfile: 'Open profile',
    openWallet: 'Open wallet',
    openHome: 'Open app',
    noData: 'No data yet',
    completed: 'Completed',
    pending: 'Pending',
    credited: 'Credited',
    failed: 'Failed',
  },
  RU: {
    title: 'Админ владельца',
    subtitle: 'Закрытая панель управления Olamep',
    lockedTitle: 'Доступ в админку',
    lockedText:
      'Эта страница скрыта от обычных пользователей. Вход только по почте владельца или коду доступа.',
    email: 'Почта владельца',
    accessCode: 'Код доступа',
    unlock: 'Открыть админку',
    wrongAccess: 'Неверная почта или код',
    back: 'Назад',
    overview: 'Обзор',
    revenue: 'Выручка',
    walletBalance: 'Баланс кошелька',
    bookings: 'Брони',
    listings: 'Услуги',
    promotions: 'Реклама',
    users: 'Пользователи',
    adminAccess: 'Доступ администратора',
    ownerAccount: 'Аккаунт владельца',
    paymentSecurity: 'Безопасность платежей',
    paymentSecurityText:
      'Данные карт нельзя хранить внутри приложения. Реальные платежи должны идти через Stripe/PayPal/банк. В админке показываем только баланс и историю операций.',
    appManagement: 'Управление приложением',
    appManagementText:
      'Здесь можно контролировать деньги, брони, услуги, рекламу и данные аккаунта владельца.',
    recentTransactions: 'Последние операции',
    recentBookings: 'Последние брони',
    amount: 'Сумма',
    status: 'Статус',
    date: 'Дата',
    client: 'Клиент',
    service: 'Услуга',
    price: 'Цена',
    openProfile: 'Открыть профиль',
    openWallet: 'Открыть кошелёк',
    openHome: 'Открыть приложение',
    noData: 'Пока нет данных',
    completed: 'Завершено',
    pending: 'Ожидает',
    credited: 'Зачислено',
    failed: 'Ошибка',
  },
  UA: {
    title: 'Адмін власника',
    subtitle: 'Закрита панель керування Olamep',
    lockedTitle: 'Доступ в адмінку',
    lockedText:
      'Ця сторінка прихована від звичайних користувачів. Вхід тільки через пошту власника або код доступу.',
    email: 'Пошта власника',
    accessCode: 'Код доступу',
    unlock: 'Відкрити адмінку',
    wrongAccess: 'Невірна пошта або код',
    back: 'Назад',
    overview: 'Огляд',
    revenue: 'Виручка',
    walletBalance: 'Баланс гаманця',
    bookings: 'Бронювання',
    listings: 'Послуги',
    promotions: 'Реклама',
    users: 'Користувачі',
    adminAccess: 'Доступ адміністратора',
    ownerAccount: 'Акаунт власника',
    paymentSecurity: 'Безпека платежів',
    paymentSecurityText:
      'Дані карт не можна зберігати всередині додатку. Реальні платежі мають проходити через Stripe/PayPal/банк. В адмінці показуємо тільки баланс та історію операцій.',
    appManagement: 'Керування додатком',
    appManagementText:
      'Тут можна контролювати гроші, бронювання, послуги, рекламу та дані акаунта власника.',
    recentTransactions: 'Останні операції',
    recentBookings: 'Останні бронювання',
    amount: 'Сума',
    status: 'Статус',
    date: 'Дата',
    client: 'Клієнт',
    service: 'Послуга',
    price: 'Ціна',
    openProfile: 'Відкрити профіль',
    openWallet: 'Відкрити гаманець',
    openHome: 'Відкрити додаток',
    noData: 'Поки немає даних',
    completed: 'Завершено',
    pending: 'Очікує',
    credited: 'Зараховано',
    failed: 'Помилка',
  },
  ES: {
    title: 'Admin del propietario',
    subtitle: 'Panel privado de control de Olamep',
    lockedTitle: 'Acceso admin',
    lockedText: 'Página oculta para usuarios normales. Usa el email del propietario o el código.',
    email: 'Email del propietario',
    accessCode: 'Código de acceso',
    unlock: 'Abrir admin',
    wrongAccess: 'Email o código incorrecto',
    back: 'Atrás',
    overview: 'Resumen',
    revenue: 'Ingresos',
    walletBalance: 'Saldo',
    bookings: 'Reservas',
    listings: 'Servicios',
    promotions: 'Promociones',
    users: 'Usuarios',
    adminAccess: 'Acceso administrador',
    ownerAccount: 'Cuenta del propietario',
    paymentSecurity: 'Seguridad de pagos',
    paymentSecurityText:
      'Los datos de tarjetas no deben guardarse dentro de la app. Los pagos reales deben procesarse con Stripe/PayPal/banco.',
    appManagement: 'Gestión de la app',
    appManagementText:
      'Aquí puedes controlar dinero, reservas, servicios, promociones y cuenta del propietario.',
    recentTransactions: 'Transacciones recientes',
    recentBookings: 'Reservas recientes',
    amount: 'Importe',
    status: 'Estado',
    date: 'Fecha',
    client: 'Cliente',
    service: 'Servicio',
    price: 'Precio',
    openProfile: 'Abrir perfil',
    openWallet: 'Abrir wallet',
    openHome: 'Abrir app',
    noData: 'Sin datos',
    completed: 'Completado',
    pending: 'Pendiente',
    credited: 'Acreditado',
    failed: 'Error',
  },
  CZ: {
    title: 'Admin vlastníka',
    subtitle: 'Soukromý ovládací panel Olamep',
    lockedTitle: 'Admin přístup',
    lockedText: 'Stránka je skrytá pro běžné uživatele. Použijte e-mail vlastníka nebo kód.',
    email: 'E-mail vlastníka',
    accessCode: 'Přístupový kód',
    unlock: 'Otevřít admin',
    wrongAccess: 'Špatný e-mail nebo kód',
    back: 'Zpět',
    overview: 'Přehled',
    revenue: 'Příjem',
    walletBalance: 'Zůstatek',
    bookings: 'Rezervace',
    listings: 'Služby',
    promotions: 'Reklamy',
    users: 'Uživatelé',
    adminAccess: 'Admin přístup',
    ownerAccount: 'Účet vlastníka',
    paymentSecurity: 'Bezpečnost plateb',
    paymentSecurityText:
      'Údaje o kartách se nesmí ukládat v aplikaci. Reálné platby musí zpracovat Stripe/PayPal/banka.',
    appManagement: 'Správa aplikace',
    appManagementText:
      'Zde lze sledovat peníze, rezervace, služby, reklamy a účet vlastníka.',
    recentTransactions: 'Poslední transakce',
    recentBookings: 'Poslední rezervace',
    amount: 'Částka',
    status: 'Stav',
    date: 'Datum',
    client: 'Klient',
    service: 'Služba',
    price: 'Cena',
    openProfile: 'Otevřít profil',
    openWallet: 'Otevřít peněženku',
    openHome: 'Otevřít app',
    noData: 'Zatím žádná data',
    completed: 'Dokončeno',
    pending: 'Čeká',
    credited: 'Připsáno',
    failed: 'Chyba',
  },
  DE: {
    title: 'Owner Admin',
    subtitle: 'Privates Olamep Kontrollpanel',
    lockedTitle: 'Admin-Zugang',
    lockedText: 'Diese Seite ist für normale Nutzer versteckt. Nutze Owner-E-Mail oder Code.',
    email: 'Owner E-Mail',
    accessCode: 'Zugangscode',
    unlock: 'Admin öffnen',
    wrongAccess: 'Falsche E-Mail oder Code',
    back: 'Zurück',
    overview: 'Übersicht',
    revenue: 'Umsatz',
    walletBalance: 'Wallet Guthaben',
    bookings: 'Buchungen',
    listings: 'Services',
    promotions: 'Promotions',
    users: 'Nutzer',
    adminAccess: 'Admin-Zugang',
    ownerAccount: 'Owner Konto',
    paymentSecurity: 'Zahlungssicherheit',
    paymentSecurityText:
      'Kartendaten dürfen nicht in der App gespeichert werden. Echte Zahlungen laufen über Stripe/PayPal/Bank.',
    appManagement: 'App-Verwaltung',
    appManagementText:
      'Hier kontrollierst du Geld, Buchungen, Services, Promotions und Owner-Daten.',
    recentTransactions: 'Letzte Transaktionen',
    recentBookings: 'Letzte Buchungen',
    amount: 'Betrag',
    status: 'Status',
    date: 'Datum',
    client: 'Kunde',
    service: 'Service',
    price: 'Preis',
    openProfile: 'Profil öffnen',
    openWallet: 'Wallet öffnen',
    openHome: 'App öffnen',
    noData: 'Noch keine Daten',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    credited: 'Gutgeschrieben',
    failed: 'Fehler',
  },
  IT: {
    title: 'Admin proprietario',
    subtitle: 'Pannello privato Olamep',
    lockedTitle: 'Accesso admin',
    lockedText: 'Pagina nascosta agli utenti normali. Usa email proprietario o codice.',
    email: 'Email proprietario',
    accessCode: 'Codice accesso',
    unlock: 'Apri admin',
    wrongAccess: 'Email o codice errato',
    back: 'Indietro',
    overview: 'Panoramica',
    revenue: 'Ricavi',
    walletBalance: 'Saldo wallet',
    bookings: 'Prenotazioni',
    listings: 'Servizi',
    promotions: 'Promozioni',
    users: 'Utenti',
    adminAccess: 'Accesso admin',
    ownerAccount: 'Account proprietario',
    paymentSecurity: 'Sicurezza pagamenti',
    paymentSecurityText:
      'I dati delle carte non devono essere salvati nell’app. I pagamenti reali devono passare da Stripe/PayPal/banca.',
    appManagement: 'Gestione app',
    appManagementText:
      'Qui controlli denaro, prenotazioni, servizi, promozioni e account proprietario.',
    recentTransactions: 'Transazioni recenti',
    recentBookings: 'Prenotazioni recenti',
    amount: 'Importo',
    status: 'Stato',
    date: 'Data',
    client: 'Cliente',
    service: 'Servizio',
    price: 'Prezzo',
    openProfile: 'Apri profilo',
    openWallet: 'Apri wallet',
    openHome: 'Apri app',
    noData: 'Nessun dato',
    completed: 'Completato',
    pending: 'In attesa',
    credited: 'Accreditato',
    failed: 'Errore',
  },
  FR: {
    title: 'Admin propriétaire',
    subtitle: 'Panneau privé Olamep',
    lockedTitle: 'Accès admin',
    lockedText: 'Page cachée aux utilisateurs normaux. Utilisez l’e-mail propriétaire ou le code.',
    email: 'E-mail propriétaire',
    accessCode: 'Code accès',
    unlock: 'Ouvrir admin',
    wrongAccess: 'E-mail ou code incorrect',
    back: 'Retour',
    overview: 'Vue globale',
    revenue: 'Revenus',
    walletBalance: 'Solde wallet',
    bookings: 'Réservations',
    listings: 'Services',
    promotions: 'Promotions',
    users: 'Utilisateurs',
    adminAccess: 'Accès admin',
    ownerAccount: 'Compte propriétaire',
    paymentSecurity: 'Sécurité paiements',
    paymentSecurityText:
      'Les données de carte ne doivent pas être stockées dans l’app. Les paiements réels passent par Stripe/PayPal/banque.',
    appManagement: 'Gestion app',
    appManagementText:
      'Ici vous contrôlez argent, réservations, services, promotions et compte propriétaire.',
    recentTransactions: 'Transactions récentes',
    recentBookings: 'Réservations récentes',
    amount: 'Montant',
    status: 'Statut',
    date: 'Date',
    client: 'Client',
    service: 'Service',
    price: 'Prix',
    openProfile: 'Ouvrir profil',
    openWallet: 'Ouvrir wallet',
    openHome: 'Ouvrir app',
    noData: 'Pas encore de données',
    completed: 'Terminé',
    pending: 'En attente',
    credited: 'Crédité',
    failed: 'Erreur',
  },
  PL: {
    title: 'Admin właściciela',
    subtitle: 'Prywatny panel Olamep',
    lockedTitle: 'Dostęp admin',
    lockedText: 'Strona ukryta dla zwykłych użytkowników. Użyj e-maila właściciela lub kodu.',
    email: 'E-mail właściciela',
    accessCode: 'Kod dostępu',
    unlock: 'Otwórz admin',
    wrongAccess: 'Zły e-mail lub kod',
    back: 'Wstecz',
    overview: 'Przegląd',
    revenue: 'Przychód',
    walletBalance: 'Saldo',
    bookings: 'Rezerwacje',
    listings: 'Usługi',
    promotions: 'Promocje',
    users: 'Użytkownicy',
    adminAccess: 'Dostęp admina',
    ownerAccount: 'Konto właściciela',
    paymentSecurity: 'Bezpieczeństwo płatności',
    paymentSecurityText:
      'Dane kart nie mogą być przechowywane w aplikacji. Prawdziwe płatności powinny iść przez Stripe/PayPal/bank.',
    appManagement: 'Zarządzanie aplikacją',
    appManagementText:
      'Tutaj kontrolujesz pieniądze, rezerwacje, usługi, promocje i konto właściciela.',
    recentTransactions: 'Ostatnie transakcje',
    recentBookings: 'Ostatnie rezerwacje',
    amount: 'Kwota',
    status: 'Status',
    date: 'Data',
    client: 'Klient',
    service: 'Usługa',
    price: 'Cena',
    openProfile: 'Otwórz profil',
    openWallet: 'Otwórz portfel',
    openHome: 'Otwórz app',
    noData: 'Brak danych',
    completed: 'Zakończone',
    pending: 'Oczekuje',
    credited: 'Dodano',
    failed: 'Błąd',
  },
  AR: {
    title: 'إدارة المالك',
    subtitle: 'لوحة تحكم خاصة لتطبيق Olamep',
    lockedTitle: 'دخول الإدارة',
    lockedText: 'هذه الصفحة مخفية عن المستخدمين. استخدم بريد المالك أو كود الدخول.',
    email: 'بريد المالك',
    accessCode: 'كود الدخول',
    unlock: 'فتح الإدارة',
    wrongAccess: 'البريد أو الكود غير صحيح',
    back: 'رجوع',
    overview: 'نظرة عامة',
    revenue: 'الإيراد',
    walletBalance: 'رصيد المحفظة',
    bookings: 'الحجوزات',
    listings: 'الخدمات',
    promotions: 'الإعلانات',
    users: 'المستخدمون',
    adminAccess: 'دخول الإدارة',
    ownerAccount: 'حساب المالك',
    paymentSecurity: 'أمان المدفوعات',
    paymentSecurityText:
      'لا يجب حفظ بيانات البطاقات داخل التطبيق. المدفوعات الحقيقية يجب أن تتم عبر Stripe/PayPal/البنك.',
    appManagement: 'إدارة التطبيق',
    appManagementText:
      'هنا يمكنك متابعة الأموال والحجوزات والخدمات والإعلانات وحساب المالك.',
    recentTransactions: 'آخر العمليات',
    recentBookings: 'آخر الحجوزات',
    amount: 'المبلغ',
    status: 'الحالة',
    date: 'التاريخ',
    client: 'العميل',
    service: 'الخدمة',
    price: 'السعر',
    openProfile: 'فتح الملف',
    openWallet: 'فتح المحفظة',
    openHome: 'فتح التطبيق',
    noData: 'لا توجد بيانات بعد',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    credited: 'تم الإيداع',
    failed: 'خطأ',
  },
};

function getText(language: AppLanguage) {
  return adminTexts[language] || adminTexts.EN;
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function statusLabel(status: string, text: AdminText) {
  if (status === 'completed') return text.completed;
  if (status === 'pending') return text.pending;
  if (status === 'credited') return text.credited;
  if (status === 'failed') return text.failed;
  return status || '—';
}

function statusColor(status: string) {
  if (status === 'completed' || status === 'credited' || status === 'upcoming') return BRAND.green;
  if (status === 'pending') return '#b87500';
  if (status === 'failed' || status === 'cancelled') return BRAND.red;
  return BRAND.blue;
}

function readAdminSession() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SESSION_KEY) === 'true';
}

function saveAdminSession(value: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, value ? 'true' : 'false');
}

export default function AdminPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [code, setCode] = useState('');
  const [access, setAccess] = useState(false);
  const [error, setError] = useState('');

  const text = useMemo(() => getText(language), [language]);

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncProfile = () => setProfile(getUserProfile());
    const syncWallet = () => setWallet(getWalletState());
    const syncBookings = () => setBookings(getBookings());
    const syncListings = () => setListings(getListings());
    const syncPromotions = () => setPromotions(getPromotions());

    syncLanguage();
    syncProfile();
    syncWallet();
    syncBookings();
    syncListings();
    syncPromotions();

    setAccess(readAdminSession());

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);
    const unsubBookings = subscribeToBookingsStore(syncBookings);
    const unsubListings = subscribeToListingsStore(syncListings);
    const unsubPromotions = subscribeToPromotionsStore(syncPromotions);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncProfile);
    window.addEventListener('pageshow', syncWallet);
    window.addEventListener('pageshow', syncBookings);
    window.addEventListener('pageshow', syncListings);
    window.addEventListener('pageshow', syncPromotions);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubWallet();
      unsubBookings();
      unsubListings();
      unsubPromotions();

      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncProfile);
      window.removeEventListener('pageshow', syncWallet);
      window.removeEventListener('pageshow', syncBookings);
      window.removeEventListener('pageshow', syncListings);
      window.removeEventListener('pageshow', syncPromotions);
    };
  }, []);

  const totalRevenue = useMemo(() => {
    return wallet.transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [wallet.transactions]);

  const recentTransactions = useMemo(() => {
    return wallet.transactions.slice(0, 8);
  }, [wallet.transactions]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const left = new Date(a.dateTime || '').getTime() || 0;
        const right = new Date(b.dateTime || '').getTime() || 0;
        return right - left;
      })
      .slice(0, 6);
  }, [bookings]);

  const unlockAdmin = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedProfileEmail = profile.email.trim().toLowerCase();
    const normalizedCode = code.trim();

    const emailOk = normalizedEmail === ADMIN_EMAIL || normalizedProfileEmail === ADMIN_EMAIL;
    const codeOk = normalizedCode === ADMIN_CODE;

    if (!emailOk && !codeOk) {
      setError(text.wrongAccess);
      return;
    }

    setError('');
    setAccess(true);
    saveAdminSession(true);
  };

  if (!access) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #eef4ff 0%, #ffffff 45%, #fff4f7 100%)',
          color: BRAND.navy,
          fontFamily: 'Arial, sans-serif',
          padding: '18px 14px',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              style={circleButtonStyle}
            >
              ←
            </button>

            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: BRAND.navy }}>
                Olamep
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: BRAND.muted }}>
                {text.adminAccess}
              </div>
            </div>
          </header>

          <section
            style={{
              marginTop: 26,
              borderRadius: 30,
              border: `3px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 18,
              boxShadow: '0 16px 38px rgba(7,27,70,0.12)',
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 26,
                border: `3px solid ${BRAND.border}`,
                background: BRAND.softViolet,
                display: 'grid',
                placeItems: 'center',
                fontSize: 36,
                marginBottom: 16,
              }}
            >
              🔐
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-1px',
                color: BRAND.navy,
              }}
            >
              {text.lockedTitle}
            </h1>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: 14,
                lineHeight: 1.4,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.lockedText}
            </p>

            <label style={fieldStyle}>
              <span>{text.email}</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={ADMIN_EMAIL}
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              <span>{text.accessCode}</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="OLAMEP-OWNER-2026"
                type="password"
                style={inputStyle}
              />
            </label>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  border: `2px solid ${BRAND.red}`,
                  background: BRAND.softRed,
                  color: BRAND.red,
                  padding: 10,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={unlockAdmin}
              style={{
                marginTop: 14,
                width: '100%',
                minHeight: 56,
                borderRadius: 20,
                border: `3px solid ${BRAND.border}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 17,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 0 rgba(0,0,0,0.10)',
              }}
            >
              {text.unlock}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef4ff 0%, #ffffff 42%, #fff4f7 100%)',
        color: BRAND.navy,
        fontFamily: 'Arial, sans-serif',
        paddingBottom: 40,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 40px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            style={circleButtonStyle}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: BRAND.navy }}>
              Olamep
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>
              {text.ownerAccount}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              saveAdminSession(false);
              setAccess(false);
            }}
            style={circleButtonStyle}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 18 }}>
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

        <section style={ownerCardStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.fullName}
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                objectFit: 'cover',
                border: `2.5px solid ${BRAND.border}`,
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: BRAND.navy,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.muted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 28,
                  padding: '0 10px',
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.softGreen,
                  color: '#008f3a',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                ● {text.adminAccess}
              </div>
            </div>
          </div>
        </section>

        <SectionTitle title={text.overview} />

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <StatCard title={text.revenue} value={money(totalRevenue)} icon="💰" bg={BRAND.softGreen} />
          <StatCard
            title={text.walletBalance}
            value={money(wallet.availableBalance)}
            icon="💼"
            bg={BRAND.softYellow}
          />
          <StatCard title={text.bookings} value={String(bookings.length)} icon="📅" bg={BRAND.softBlue} />
          <StatCard title={text.listings} value={String(listings.length)} icon="💼" bg={BRAND.softViolet} />
          <StatCard title={text.promotions} value={String(promotions.length)} icon="🎁" bg={BRAND.softRed} />
          <StatCard title={text.users} value="1" icon="👤" bg={BRAND.softGreen} />
        </section>

        <section
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
          }}
        >
          <NavButton label={text.openHome} onClick={() => router.push('/')} />
          <NavButton label={text.openProfile} onClick={() => router.push('/profile')} />
          <NavButton label={text.openWallet} onClick={() => router.push('/profile/wallet')} />
        </section>

        <InfoCard title={text.paymentSecurity} body={text.paymentSecurityText} icon="🛡️" />
        <InfoCard title={text.appManagement} body={text.appManagementText} icon="⚙️" />

        <SectionTitle title={text.recentTransactions} />

        <section style={listPanelStyle}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} text={text} />
            ))
          ) : (
            <EmptyRow text={text.noData} />
          )}
        </section>

        <SectionTitle title={text.recentBookings} />

        <section style={listPanelStyle}>
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} text={text} />
            ))
          ) : (
            <EmptyRow text={text.noData} />
          )}
        </section>
      </div>
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

function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: string;
  icon: string;
  bg: string;
}) {
  return (
    <div
      style={{
        minHeight: 124,
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 12,
        boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          border: `2.5px solid ${BRAND.border}`,
          background: bg,
          display: 'grid',
          placeItems: 'center',
          fontSize: 23,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1,
            fontWeight: 900,
            color: BRAND.navy,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            lineHeight: 1.2,
            fontWeight: 900,
            color: BRAND.muted,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 52,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        color: BRAND.navy,
        fontSize: 12,
        lineHeight: 1.15,
        fontWeight: 900,
        cursor: 'pointer',
        padding: '0 8px',
      }}
    >
      {label}
    </button>
  );
}

function InfoCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: string;
}) {
  return (
    <section
      style={{
        marginTop: 14,
        borderRadius: 26,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 14,
        boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr',
          gap: 11,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softBlue,
            display: 'grid',
            placeItems: 'center',
            fontSize: 24,
          }}
        >
          {icon}
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>
            {title}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12.5,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  text,
}: {
  transaction: WalletTransaction;
  text: AdminText;
}) {
  const positive = transaction.amount >= 0;

  return (
    <div style={rowStyle}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: BRAND.navy,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.title}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.subtitle || text.amount} · {formatDate(transaction.createdAt)}
        </div>

        <div
          style={{
            marginTop: 7,
            display: 'inline-flex',
            minHeight: 24,
            alignItems: 'center',
            padding: '0 8px',
            borderRadius: 999,
            border: `1.8px solid ${statusColor(transaction.status)}`,
            background: '#ffffff',
            color: statusColor(transaction.status),
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {statusLabel(transaction.status, text)}
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: positive ? BRAND.green : BRAND.red,
          textAlign: 'right',
        }}
      >
        {positive ? '+' : ''}
        {money(transaction.amount)}
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  text,
}: {
  booking: BookingItem;
  text: AdminText;
}) {
  return (
    <div style={rowStyle}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: BRAND.navy,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {booking.masterName || text.client}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {booking.serviceName || text.service} · {formatDate(booking.dateTime)}
        </div>

        <div
          style={{
            marginTop: 7,
            display: 'inline-flex',
            minHeight: 24,
            alignItems: 'center',
            padding: '0 8px',
            borderRadius: 999,
            border: `1.8px solid ${statusColor(booking.status)}`,
            background: '#ffffff',
            color: statusColor(booking.status),
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {booking.status}
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: BRAND.navy,
          textAlign: 'right',
        }}
      >
        {money(Number(booking.price || 0))}
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: 72,
        display: 'grid',
        placeItems: 'center',
        fontSize: 14,
        fontWeight: 900,
        color: BRAND.muted,
      }}
    >
      {text}
    </div>
  );
}

const circleButtonStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 24,
  fontWeight: 900,
  cursor: 'pointer',
};

const fieldStyle: React.CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  boxSizing: 'border-box',
  borderRadius: 18,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 15,
  fontWeight: 900,
  padding: '0 13px',
};

const ownerCardStyle: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 14,
  boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
};

const listPanelStyle: React.CSSProperties = {
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
};

const rowStyle: React.CSSProperties = {
  minHeight: 82,
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 12,
  alignItems: 'center',
  padding: '12px 13px',
  borderBottom: `2px solid ${BRAND.border}`,
  background: '#ffffff',
};
