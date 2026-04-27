'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getWalletState,
  subscribeToWalletStore,
  type WalletState,
} from '../../services/walletStore';

type TransactionType = 'income' | 'payment';
type TransactionStatus = 'completed' | 'pending';
type TransactionFilter = 'all' | 'income' | 'payment';
type DateFilter = 'today' | '7days' | '30days' | 'all' | 'custom';

type WalletTextShape = {
  title: string;
  subtitle: string;
  available: string;
  appAccount: string;
  appAccountHint: string;
  topUp: string;
  withdraw: string;
  qrCode: string;
  transactions: string;
  income: string;
  payments: string;
  all: string;
  today: string;
  sevenDays: string;
  thirtyDays: string;
  allTime: string;
  customPeriod: string;
  from: string;
  to: string;
  noTransactions: string;
  noTransactionsHint: string;
  pending: string;
  completed: string;
  bookingDeposit: string;
  servicePayment: string;
  promotionPayment: string;
  platformFee: string;
  payoutRequest: string;
  yesterday: string;
  comingSoon: string;
  statementHint: string;
};

type TransactionItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  daysAgo: number;
  icon: string;
  bg: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
  softOrange: '#fff0da',
  bg: '#ffffff',
  border: '#050505',
  muted: '#6c7686',
};

const walletTexts: Record<AppLanguage, WalletTextShape> = {
  EN: {
    title: 'App account',
    subtitle: 'Balance, top ups and activity inside Olamep',
    available: 'Available now',
    appAccount: 'Your Olamep balance',
    appAccountHint: 'Use it for bookings, ads, deals and secure payments.',
    topUp: 'Top up',
    withdraw: 'Withdraw',
    qrCode: 'QR code',
    transactions: 'Account activity',
    income: 'Income',
    payments: 'Payments',
    all: 'All',
    today: 'Today',
    sevenDays: '7 days',
    thirtyDays: '30 days',
    allTime: 'All time',
    customPeriod: 'Custom period',
    from: 'From',
    to: 'To',
    noTransactions: 'No transactions',
    noTransactionsHint: 'Change filters or make your first payment.',
    pending: 'Pending',
    completed: 'Completed',
    bookingDeposit: 'Booking deposit',
    servicePayment: 'Service payment',
    promotionPayment: 'Promotion payment',
    platformFee: 'Platform fee',
    payoutRequest: 'Payout request',
    yesterday: 'Yesterday',
    comingSoon: 'Coming soon',
    statementHint: 'Full statements, payout reports, refunds and invoices will appear here.',
  },
  RU: {
    title: 'Счёт приложения',
    subtitle: 'Баланс, пополнения и операции внутри Olamep',
    available: 'Доступно сейчас',
    appAccount: 'Ваш баланс Olamep',
    appAccountHint: 'Используйте его для бронирований, рекламы, скидок и безопасных платежей.',
    topUp: 'Пополнить',
    withdraw: 'Вывести',
    qrCode: 'QR-код',
    transactions: 'История счёта',
    income: 'Поступления',
    payments: 'Расходы',
    all: 'Все',
    today: 'Сегодня',
    sevenDays: '7 дней',
    thirtyDays: '30 дней',
    allTime: 'За всё время',
    customPeriod: 'Свой период',
    from: 'От',
    to: 'До',
    noTransactions: 'Нет операций',
    noTransactionsHint: 'Измените фильтр или сделайте первый платёж.',
    pending: 'В обработке',
    completed: 'Завершено',
    bookingDeposit: 'Депозит бронирования',
    servicePayment: 'Оплата услуги',
    promotionPayment: 'Оплата рекламы',
    platformFee: 'Комиссия платформы',
    payoutRequest: 'Заявка на вывод',
    yesterday: 'Вчера',
    comingSoon: 'Скоро',
    statementHint: 'Здесь появятся выписки, отчёты по выплатам, возвраты и инвойсы.',
  },
  UA: {
    title: 'Рахунок застосунку',
    subtitle: 'Баланс, поповнення та операції всередині Olamep',
    available: 'Доступно зараз',
    appAccount: 'Ваш баланс Olamep',
    appAccountHint: 'Використовуйте його для бронювань, реклами, знижок і безпечних платежів.',
    topUp: 'Поповнити',
    withdraw: 'Вивести',
    qrCode: 'QR-код',
    transactions: 'Історія рахунку',
    income: 'Надходження',
    payments: 'Витрати',
    all: 'Усі',
    today: 'Сьогодні',
    sevenDays: '7 днів',
    thirtyDays: '30 днів',
    allTime: 'За весь час',
    customPeriod: 'Свій період',
    from: 'Від',
    to: 'До',
    noTransactions: 'Немає операцій',
    noTransactionsHint: 'Змініть фільтр або зробіть перший платіж.',
    pending: 'В обробці',
    completed: 'Завершено',
    bookingDeposit: 'Депозит бронювання',
    servicePayment: 'Оплата послуги',
    promotionPayment: 'Оплата реклами',
    platformFee: 'Комісія платформи',
    payoutRequest: 'Заявка на вивід',
    yesterday: 'Вчора',
    comingSoon: 'Скоро',
    statementHint: 'Тут з’являться виписки, звіти по виплатах, повернення та інвойси.',
  },
  ES: {
    title: 'Cuenta de la app',
    subtitle: 'Saldo, recargas y actividad dentro de Olamep',
    available: 'Disponible ahora',
    appAccount: 'Tu saldo Olamep',
    appAccountHint: 'Úsalo para reservas, anuncios, ofertas y pagos seguros.',
    topUp: 'Recargar',
    withdraw: 'Retirar',
    qrCode: 'Código QR',
    transactions: 'Actividad de cuenta',
    income: 'Ingresos',
    payments: 'Pagos',
    all: 'Todo',
    today: 'Hoy',
    sevenDays: '7 días',
    thirtyDays: '30 días',
    allTime: 'Todo',
    customPeriod: 'Periodo',
    from: 'Desde',
    to: 'Hasta',
    noTransactions: 'Sin transacciones',
    noTransactionsHint: 'Cambia los filtros o realiza tu primer pago.',
    pending: 'Pendiente',
    completed: 'Completado',
    bookingDeposit: 'Depósito de reserva',
    servicePayment: 'Pago de servicio',
    promotionPayment: 'Pago de promoción',
    platformFee: 'Comisión de plataforma',
    payoutRequest: 'Solicitud de retiro',
    yesterday: 'Ayer',
    comingSoon: 'Próximamente',
    statementHint: 'Aquí aparecerán extractos, informes de pagos, reembolsos e invoices.',
  },
  CZ: {
    title: 'Účet aplikace',
    subtitle: 'Zůstatek, dobití a aktivita v Olamep',
    available: 'Dostupné nyní',
    appAccount: 'Váš zůstatek Olamep',
    appAccountHint: 'Použijte ho pro rezervace, reklamy, slevy a bezpečné platby.',
    topUp: 'Dobít',
    withdraw: 'Vybrat',
    qrCode: 'QR kód',
    transactions: 'Historie účtu',
    income: 'Příjmy',
    payments: 'Platby',
    all: 'Vše',
    today: 'Dnes',
    sevenDays: '7 dní',
    thirtyDays: '30 dní',
    allTime: 'Celkem',
    customPeriod: 'Vlastní období',
    from: 'Od',
    to: 'Do',
    noTransactions: 'Žádné transakce',
    noTransactionsHint: 'Změňte filtry nebo proveďte první platbu.',
    pending: 'Čeká',
    completed: 'Dokončeno',
    bookingDeposit: 'Rezervační záloha',
    servicePayment: 'Platba za službu',
    promotionPayment: 'Platba za reklamu',
    platformFee: 'Poplatek platformy',
    payoutRequest: 'Žádost o výplatu',
    yesterday: 'Včera',
    comingSoon: 'Brzy',
    statementHint: 'Zde se zobrazí výpisy, reporty výplat, vratky a faktury.',
  },
  DE: {
    title: 'App-Konto',
    subtitle: 'Guthaben, Aufladungen und Aktivität in Olamep',
    available: 'Jetzt verfügbar',
    appAccount: 'Dein Olamep-Guthaben',
    appAccountHint: 'Nutze es für Buchungen, Anzeigen, Deals und sichere Zahlungen.',
    topUp: 'Aufladen',
    withdraw: 'Auszahlen',
    qrCode: 'QR-Code',
    transactions: 'Kontoaktivität',
    income: 'Eingänge',
    payments: 'Zahlungen',
    all: 'Alle',
    today: 'Heute',
    sevenDays: '7 Tage',
    thirtyDays: '30 Tage',
    allTime: 'Gesamt',
    customPeriod: 'Zeitraum',
    from: 'Von',
    to: 'Bis',
    noTransactions: 'Keine Transaktionen',
    noTransactionsHint: 'Ändere Filter oder mache deine erste Zahlung.',
    pending: 'Ausstehend',
    completed: 'Abgeschlossen',
    bookingDeposit: 'Buchungsanzahlung',
    servicePayment: 'Servicezahlung',
    promotionPayment: 'Promozahlung',
    platformFee: 'Plattformgebühr',
    payoutRequest: 'Auszahlungsanfrage',
    yesterday: 'Gestern',
    comingSoon: 'Bald',
    statementHint: 'Hier erscheinen Kontoauszüge, Auszahlungsberichte, Rückerstattungen und Rechnungen.',
  },
  IT: {
    title: 'Account app',
    subtitle: 'Saldo, ricariche e attività dentro Olamep',
    available: 'Disponibile ora',
    appAccount: 'Il tuo saldo Olamep',
    appAccountHint: 'Usalo per prenotazioni, annunci, offerte e pagamenti sicuri.',
    topUp: 'Ricarica',
    withdraw: 'Preleva',
    qrCode: 'Codice QR',
    transactions: 'Attività account',
    income: 'Entrate',
    payments: 'Pagamenti',
    all: 'Tutto',
    today: 'Oggi',
    sevenDays: '7 giorni',
    thirtyDays: '30 giorni',
    allTime: 'Sempre',
    customPeriod: 'Periodo',
    from: 'Da',
    to: 'A',
    noTransactions: 'Nessuna transazione',
    noTransactionsHint: 'Cambia filtri o fai il primo pagamento.',
    pending: 'In attesa',
    completed: 'Completato',
    bookingDeposit: 'Deposito prenotazione',
    servicePayment: 'Pagamento servizio',
    promotionPayment: 'Pagamento promozione',
    platformFee: 'Commissione piattaforma',
    payoutRequest: 'Richiesta prelievo',
    yesterday: 'Ieri',
    comingSoon: 'Presto',
    statementHint: 'Qui appariranno estratti conto, report pagamenti, rimborsi e fatture.',
  },
  FR: {
    title: 'Compte app',
    subtitle: 'Solde, recharges et activité dans Olamep',
    available: 'Disponible maintenant',
    appAccount: 'Votre solde Olamep',
    appAccountHint: 'Utilisez-le pour les réservations, publicités, offres et paiements sécurisés.',
    topUp: 'Recharger',
    withdraw: 'Retirer',
    qrCode: 'QR code',
    transactions: 'Activité du compte',
    income: 'Revenus',
    payments: 'Paiements',
    all: 'Tout',
    today: 'Aujourd’hui',
    sevenDays: '7 jours',
    thirtyDays: '30 jours',
    allTime: 'Toujours',
    customPeriod: 'Période',
    from: 'Du',
    to: 'Au',
    noTransactions: 'Aucune transaction',
    noTransactionsHint: 'Changez les filtres ou effectuez votre premier paiement.',
    pending: 'En attente',
    completed: 'Terminé',
    bookingDeposit: 'Dépôt de réservation',
    servicePayment: 'Paiement du service',
    promotionPayment: 'Paiement promotion',
    platformFee: 'Frais plateforme',
    payoutRequest: 'Demande de retrait',
    yesterday: 'Hier',
    comingSoon: 'Bientôt',
    statementHint: 'Les relevés, rapports de paiement, remboursements et factures apparaîtront ici.',
  },
  PL: {
    title: 'Konto aplikacji',
    subtitle: 'Saldo, doładowania i aktywność w Olamep',
    available: 'Dostępne teraz',
    appAccount: 'Twoje saldo Olamep',
    appAccountHint: 'Używaj go do rezerwacji, reklam, ofert i bezpiecznych płatności.',
    topUp: 'Doładuj',
    withdraw: 'Wypłać',
    qrCode: 'Kod QR',
    transactions: 'Aktywność konta',
    income: 'Wpływy',
    payments: 'Wydatki',
    all: 'Wszystko',
    today: 'Dzisiaj',
    sevenDays: '7 dni',
    thirtyDays: '30 dni',
    allTime: 'Całość',
    customPeriod: 'Własny okres',
    from: 'Od',
    to: 'Do',
    noTransactions: 'Brak transakcji',
    noTransactionsHint: 'Zmień filtry albo wykonaj pierwszą płatność.',
    pending: 'Oczekuje',
    completed: 'Zakończono',
    bookingDeposit: 'Depozyt rezerwacji',
    servicePayment: 'Płatność za usługę',
    promotionPayment: 'Płatność za promocję',
    platformFee: 'Opłata platformy',
    payoutRequest: 'Wniosek o wypłatę',
    yesterday: 'Wczoraj',
    comingSoon: 'Wkrótce',
    statementHint: 'Tutaj pojawią się wyciągi, raporty wypłat, zwroty i faktury.',
  },
  AR: {
    title: 'حساب التطبيق',
    subtitle: 'الرصيد، الشحن والعمليات داخل Olamep',
    available: 'متاح الآن',
    appAccount: 'رصيدك في Olamep',
    appAccountHint: 'استخدمه للحجوزات والإعلانات والعروض والمدفوعات الآمنة.',
    topUp: 'شحن',
    withdraw: 'سحب',
    qrCode: 'رمز QR',
    transactions: 'نشاط الحساب',
    income: 'الدخل',
    payments: 'المدفوعات',
    all: 'الكل',
    today: 'اليوم',
    sevenDays: '7 أيام',
    thirtyDays: '30 يوم',
    allTime: 'كل الوقت',
    customPeriod: 'فترة مخصصة',
    from: 'من',
    to: 'إلى',
    noTransactions: 'لا توجد عمليات',
    noTransactionsHint: 'غيّر الفلاتر أو قم بأول عملية دفع.',
    pending: 'قيد المعالجة',
    completed: 'مكتمل',
    bookingDeposit: 'عربون الحجز',
    servicePayment: 'دفع الخدمة',
    promotionPayment: 'دفع الإعلان',
    platformFee: 'رسوم المنصة',
    payoutRequest: 'طلب سحب',
    yesterday: 'أمس',
    comingSoon: 'قريباً',
    statementHint: 'ستظهر هنا الكشوفات وتقارير السحب والاستردادات والفواتير.',
  },
};

function getText(language: AppLanguage) {
  return walletTexts[language] || walletTexts.EN;
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatSignedAmount(amount: number) {
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix} £${Math.abs(amount).toFixed(2)}`;
}

function WalletIcon() {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 24,
        border: `3px solid ${BRAND.border}`,
        background: 'linear-gradient(135deg, #dcecff 0%, #dcffe8 45%, #fff0da 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34,
        boxShadow: '0 6px 0 rgba(0,0,0,0.08)',
      }}
    >
      💼
    </div>
  );
}

function SmallIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <span
      style={{
        width: 52,
        height: 52,
        borderRadius: 17,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 25,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}

export default function WalletPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [fromDate, setFromDate] = useState(getDateDaysAgo(30));
  const [toDate, setToDate] = useState(getDateDaysAgo(0));

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncWallet = () => setWallet(getWalletState());

    syncLanguage();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncWallet);
    window.addEventListener('storage', syncWallet);

    return () => {
      unsubLanguage();
      unsubWallet();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncWallet);
      window.removeEventListener('storage', syncWallet);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const transactions: TransactionItem[] = useMemo(
    () => [
      {
        id: 'topup',
        title: text.topUp,
        subtitle: text.today,
        amount: 25,
        type: 'income',
        status: 'completed',
        date: getDateDaysAgo(0),
        daysAgo: 0,
        icon: '＋',
        bg: BRAND.softGreen,
      },
      {
        id: 'service',
        title: text.servicePayment,
        subtitle: text.today,
        amount: 12,
        type: 'income',
        status: 'pending',
        date: getDateDaysAgo(0),
        daysAgo: 0,
        icon: '💼',
        bg: BRAND.softBlue,
      },
      {
        id: 'booking',
        title: text.bookingDeposit,
        subtitle: text.today,
        amount: -5,
        type: 'payment',
        status: 'completed',
        date: getDateDaysAgo(0),
        daysAgo: 0,
        icon: '📅',
        bg: BRAND.softBlue,
      },
      {
        id: 'promotion',
        title: text.promotionPayment,
        subtitle: text.yesterday,
        amount: -1,
        type: 'payment',
        status: 'completed',
        date: getDateDaysAgo(1),
        daysAgo: 1,
        icon: '📣',
        bg: BRAND.softPink,
      },
      {
        id: 'fee',
        title: text.platformFee,
        subtitle: text.yesterday,
        amount: -0.5,
        type: 'payment',
        status: 'completed',
        date: getDateDaysAgo(1),
        daysAgo: 1,
        icon: '🛡️',
        bg: BRAND.softViolet,
      },
      {
        id: 'payout',
        title: text.payoutRequest,
        subtitle: text.thirtyDays,
        amount: -18,
        type: 'payment',
        status: 'pending',
        date: getDateDaysAgo(12),
        daysAgo: 12,
        icon: '↗',
        bg: BRAND.softOrange,
      },
      {
        id: 'old-income',
        title: text.servicePayment,
        subtitle: text.allTime,
        amount: 38,
        type: 'income',
        status: 'completed',
        date: getDateDaysAgo(55),
        daysAgo: 55,
        icon: '💼',
        bg: BRAND.softGreen,
      },
    ],
    [text],
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const typeMatch = transactionFilter === 'all' || item.type === transactionFilter;

      let dateMatch = true;

      if (dateFilter === 'today') {
        dateMatch = item.daysAgo === 0;
      }

      if (dateFilter === '7days') {
        dateMatch = item.daysAgo <= 7;
      }

      if (dateFilter === '30days') {
        dateMatch = item.daysAgo <= 30;
      }

      if (dateFilter === 'custom') {
        dateMatch = item.date >= fromDate && item.date <= toDate;
      }

      return typeMatch && dateMatch;
    });
  }, [transactions, transactionFilter, dateFilter, fromDate, toDate]);

  const transactionFilterOptions: { id: TransactionFilter; label: string }[] = [
    { id: 'all', label: text.all },
    { id: 'income', label: text.income },
    { id: 'payment', label: text.payments },
  ];

  const dateFilterOptions: { id: DateFilter; label: string }[] = [
    { id: 'today', label: text.today },
    { id: '7days', label: text.sevenDays },
    { id: '30days', label: text.thirtyDays },
    { id: 'all', label: text.allTime },
    { id: 'custom', label: text.customPeriod },
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
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 27,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-0.8px',
                color: BRAND.navy,
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: 13,
                lineHeight: 1.2,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="Close"
            style={{
              width: 54,
              height: 54,
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

        <section
          style={{
            marginTop: 20,
            borderRadius: 30,
            border: `3px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 12px 28px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              borderRadius: 25,
              border: `2.5px solid ${BRAND.border}`,
              background:
                'linear-gradient(135deg, #ffffff 0%, #dcecff 38%, #dcffe8 72%, #fff0da 100%)',
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '72px minmax(0, 1fr)',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <WalletIcon />

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: BRAND.blue }}>
                  {text.appAccount}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 42,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: BRAND.navy,
                    letterSpacing: '-1.4px',
                  }}
                >
                  £{wallet.availableBalance.toFixed(2)}
                </div>

                <div style={{ marginTop: 7, fontSize: 13, fontWeight: 900, color: BRAND.muted }}>
                  {text.available}
                </div>
              </div>
            </div>

            <p
              style={{
                margin: '16px 0 0',
                fontSize: 14,
                lineHeight: 1.35,
                fontWeight: 800,
                color: BRAND.navy,
              }}
            >
              {text.appAccountHint}
            </p>
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 9,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/profile/top-up')}
              style={{
                minHeight: 76,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
              }}
            >
              ＋
              <br />
              {text.topUp}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/withdraw')}
              style={{
                minHeight: 76,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.yellow,
                color: BRAND.navy,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
              }}
            >
              ↗
              <br />
              {text.withdraw}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/qr-code')}
              style={{
                minHeight: 76,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
              }}
            >
              ▦
              <br />
              {text.qrCode}
            </button>
          </div>
        </section>

        <section style={{ marginTop: 22 }}>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: 25,
              lineHeight: 1,
              fontWeight: 900,
              color: BRAND.navy,
              letterSpacing: '-0.7px',
            }}
          >
            {text.transactions}
          </h2>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {transactionFilterOptions.map((item) => {
              const active = transactionFilter === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTransactionFilter(item.id)}
                  style={{
                    minHeight: 38,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: `2.5px solid ${BRAND.border}`,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
            {dateFilterOptions.map((item) => {
              const active = dateFilter === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDateFilter(item.id)}
                  style={{
                    minHeight: 36,
                    padding: '0 12px',
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    background: active ? BRAND.yellow : BRAND.softBlue,
                    color: BRAND.navy,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {dateFilter === 'custom' ? (
            <div
              style={{
                marginBottom: 12,
                borderRadius: 22,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softOrange,
                padding: 12,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                  {text.from}
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value);
                    setDateFilter('custom');
                  }}
                  style={{
                    width: '100%',
                    minHeight: 44,
                    borderRadius: 15,
                    border: `2.5px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: BRAND.navy,
                    fontSize: 13,
                    fontWeight: 900,
                    padding: '0 9px',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                  {text.to}
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value);
                    setDateFilter('custom');
                  }}
                  style={{
                    width: '100%',
                    minHeight: 44,
                    borderRadius: 15,
                    border: `2.5px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: BRAND.navy,
                    fontSize: 13,
                    fontWeight: 900,
                    padding: '0 9px',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
            </div>
          ) : null}

          <div
            style={{
              borderRadius: 26,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
            }}
          >
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    minHeight: 88,
                    display: 'grid',
                    gridTemplateColumns: '52px minmax(0, 1fr) auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px',
                    borderTop: index === 0 ? 'none' : `2px solid ${BRAND.border}`,
                    boxSizing: 'border-box',
                  }}
                >
                  <SmallIcon icon={item.icon} bg={item.bg} />

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

                    <div
                      style={{
                        marginTop: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.2,
                          fontWeight: 800,
                          color: BRAND.muted,
                        }}
                      >
                        {item.date}
                      </span>

                      <span
                        style={{
                          minHeight: 24,
                          padding: '0 9px',
                          borderRadius: 999,
                          border: `2px solid ${BRAND.border}`,
                          background:
                            item.status === 'completed' ? BRAND.softGreen : BRAND.softOrange,
                          color: item.status === 'completed' ? '#11883d' : '#b47b00',
                          fontSize: 11,
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.status === 'completed' ? text.completed : text.pending}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: item.amount >= 0 ? BRAND.green : BRAND.pink,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatSignedAmount(item.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 36 }}>🧾</div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 18,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {text.noTransactions}
                </div>
                <p
                  style={{
                    margin: '7px auto 0',
                    maxWidth: 260,
                    fontSize: 13,
                    lineHeight: 1.35,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  {text.noTransactionsHint}
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softViolet,
            padding: 15,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>
            🧾 {text.comingSoon}
          </div>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.statementHint}
          </p>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
