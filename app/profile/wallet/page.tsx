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

type WalletTextShape = {
  title: string;
  subtitle: string;
  balance: string;
  available: string;
  appAccount: string;
  appAccountHint: string;
  topUp: string;
  withdraw: string;
  qrCode: string;
  transactions: string;
  income: string;
  outcome: string;
  pending: string;
  completed: string;
  bookingDeposit: string;
  servicePayment: string;
  promotionPayment: string;
  platformFee: string;
  today: string;
  yesterday: string;
  comingSoon: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  cream: '#fff7ee',
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
    balance: 'Balance',
    available: 'Available now',
    appAccount: 'Your Olamep balance',
    appAccountHint: 'Use it for bookings, ads, deals and secure payments.',
    topUp: 'Top up',
    withdraw: 'Withdraw',
    qrCode: 'QR code',
    transactions: 'Account activity',
    income: 'Income',
    outcome: 'Payment',
    pending: 'Pending',
    completed: 'Completed',
    bookingDeposit: 'Booking deposit',
    servicePayment: 'Service payment',
    promotionPayment: 'Promotion payment',
    platformFee: 'Platform fee',
    today: 'Today',
    yesterday: 'Yesterday',
    comingSoon: 'Coming soon',
  },
  RU: {
    title: 'Счёт приложения',
    subtitle: 'Баланс, пополнения и операции внутри Olamep',
    balance: 'Баланс',
    available: 'Доступно сейчас',
    appAccount: 'Ваш баланс Olamep',
    appAccountHint: 'Используйте его для бронирований, рекламы, скидок и безопасных платежей.',
    topUp: 'Пополнить',
    withdraw: 'Вывести',
    qrCode: 'QR-код',
    transactions: 'История счёта',
    income: 'Поступление',
    outcome: 'Платёж',
    pending: 'В обработке',
    completed: 'Завершено',
    bookingDeposit: 'Депозит бронирования',
    servicePayment: 'Оплата услуги',
    promotionPayment: 'Оплата рекламы',
    platformFee: 'Комиссия платформы',
    today: 'Сегодня',
    yesterday: 'Вчера',
    comingSoon: 'Скоро',
  },
  UA: {
    title: 'Рахунок застосунку',
    subtitle: 'Баланс, поповнення та операції всередині Olamep',
    balance: 'Баланс',
    available: 'Доступно зараз',
    appAccount: 'Ваш баланс Olamep',
    appAccountHint: 'Використовуйте його для бронювань, реклами, знижок і безпечних платежів.',
    topUp: 'Поповнити',
    withdraw: 'Вивести',
    qrCode: 'QR-код',
    transactions: 'Історія рахунку',
    income: 'Надходження',
    outcome: 'Платіж',
    pending: 'В обробці',
    completed: 'Завершено',
    bookingDeposit: 'Депозит бронювання',
    servicePayment: 'Оплата послуги',
    promotionPayment: 'Оплата реклами',
    platformFee: 'Комісія платформи',
    today: 'Сьогодні',
    yesterday: 'Вчора',
    comingSoon: 'Скоро',
  },
  ES: {
    title: 'Cuenta de la app',
    subtitle: 'Saldo, recargas y actividad dentro de Olamep',
    balance: 'Saldo',
    available: 'Disponible ahora',
    appAccount: 'Tu saldo Olamep',
    appAccountHint: 'Úsalo para reservas, anuncios, ofertas y pagos seguros.',
    topUp: 'Recargar',
    withdraw: 'Retirar',
    qrCode: 'Código QR',
    transactions: 'Actividad de cuenta',
    income: 'Ingreso',
    outcome: 'Pago',
    pending: 'Pendiente',
    completed: 'Completado',
    bookingDeposit: 'Depósito de reserva',
    servicePayment: 'Pago de servicio',
    promotionPayment: 'Pago de promoción',
    platformFee: 'Comisión de plataforma',
    today: 'Hoy',
    yesterday: 'Ayer',
    comingSoon: 'Próximamente',
  },
  CZ: {
    title: 'Účet aplikace',
    subtitle: 'Zůstatek, dobití a aktivita v Olamep',
    balance: 'Zůstatek',
    available: 'Dostupné nyní',
    appAccount: 'Váš zůstatek Olamep',
    appAccountHint: 'Použijte ho pro rezervace, reklamy, slevy a bezpečné platby.',
    topUp: 'Dobít',
    withdraw: 'Vybrat',
    qrCode: 'QR kód',
    transactions: 'Historie účtu',
    income: 'Příjem',
    outcome: 'Platba',
    pending: 'Čeká',
    completed: 'Dokončeno',
    bookingDeposit: 'Rezervační záloha',
    servicePayment: 'Platba za službu',
    promotionPayment: 'Platba za reklamu',
    platformFee: 'Poplatek platformy',
    today: 'Dnes',
    yesterday: 'Včera',
    comingSoon: 'Brzy',
  },
  DE: {
    title: 'App-Konto',
    subtitle: 'Guthaben, Aufladungen und Aktivität in Olamep',
    balance: 'Guthaben',
    available: 'Jetzt verfügbar',
    appAccount: 'Dein Olamep-Guthaben',
    appAccountHint: 'Nutze es für Buchungen, Anzeigen, Deals und sichere Zahlungen.',
    topUp: 'Aufladen',
    withdraw: 'Auszahlen',
    qrCode: 'QR-Code',
    transactions: 'Kontoaktivität',
    income: 'Eingang',
    outcome: 'Zahlung',
    pending: 'Ausstehend',
    completed: 'Abgeschlossen',
    bookingDeposit: 'Buchungsanzahlung',
    servicePayment: 'Servicezahlung',
    promotionPayment: 'Promozahlung',
    platformFee: 'Plattformgebühr',
    today: 'Heute',
    yesterday: 'Gestern',
    comingSoon: 'Bald',
  },
  IT: {
    title: 'Account app',
    subtitle: 'Saldo, ricariche e attività dentro Olamep',
    balance: 'Saldo',
    available: 'Disponibile ora',
    appAccount: 'Il tuo saldo Olamep',
    appAccountHint: 'Usalo per prenotazioni, annunci, offerte e pagamenti sicuri.',
    topUp: 'Ricarica',
    withdraw: 'Preleva',
    qrCode: 'Codice QR',
    transactions: 'Attività account',
    income: 'Entrata',
    outcome: 'Pagamento',
    pending: 'In attesa',
    completed: 'Completato',
    bookingDeposit: 'Deposito prenotazione',
    servicePayment: 'Pagamento servizio',
    promotionPayment: 'Pagamento promozione',
    platformFee: 'Commissione piattaforma',
    today: 'Oggi',
    yesterday: 'Ieri',
    comingSoon: 'Presto',
  },
  FR: {
    title: 'Compte app',
    subtitle: 'Solde, recharges et activité dans Olamep',
    balance: 'Solde',
    available: 'Disponible maintenant',
    appAccount: 'Votre solde Olamep',
    appAccountHint: 'Utilisez-le pour les réservations, publicités, offres et paiements sécurisés.',
    topUp: 'Recharger',
    withdraw: 'Retirer',
    qrCode: 'QR code',
    transactions: 'Activité du compte',
    income: 'Revenu',
    outcome: 'Paiement',
    pending: 'En attente',
    completed: 'Terminé',
    bookingDeposit: 'Dépôt de réservation',
    servicePayment: 'Paiement du service',
    promotionPayment: 'Paiement promotion',
    platformFee: 'Frais plateforme',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    comingSoon: 'Bientôt',
  },
  PL: {
    title: 'Konto aplikacji',
    subtitle: 'Saldo, doładowania i aktywność w Olamep',
    balance: 'Saldo',
    available: 'Dostępne teraz',
    appAccount: 'Twoje saldo Olamep',
    appAccountHint: 'Używaj go do rezerwacji, reklam, ofert i bezpiecznych płatności.',
    topUp: 'Doładuj',
    withdraw: 'Wypłać',
    qrCode: 'Kod QR',
    transactions: 'Aktywność konta',
    income: 'Wpływ',
    outcome: 'Płatność',
    pending: 'Oczekuje',
    completed: 'Zakończono',
    bookingDeposit: 'Depozyt rezerwacji',
    servicePayment: 'Płatność za usługę',
    promotionPayment: 'Płatność za promocję',
    platformFee: 'Opłata platformy',
    today: 'Dzisiaj',
    yesterday: 'Wczoraj',
    comingSoon: 'Wkrótce',
  },
  AR: {
    title: 'حساب التطبيق',
    subtitle: 'الرصيد، الشحن والعمليات داخل Olamep',
    balance: 'الرصيد',
    available: 'متاح الآن',
    appAccount: 'رصيدك في Olamep',
    appAccountHint: 'استخدمه للحجوزات والإعلانات والعروض والمدفوعات الآمنة.',
    topUp: 'شحن',
    withdraw: 'سحب',
    qrCode: 'رمز QR',
    transactions: 'نشاط الحساب',
    income: 'دخل',
    outcome: 'دفع',
    pending: 'قيد المعالجة',
    completed: 'مكتمل',
    bookingDeposit: 'عربون الحجز',
    servicePayment: 'دفع الخدمة',
    promotionPayment: 'دفع الإعلان',
    platformFee: 'رسوم المنصة',
    today: 'اليوم',
    yesterday: 'أمس',
    comingSoon: 'قريباً',
  },
};

function getText(language: AppLanguage) {
  return walletTexts[language] || walletTexts.EN;
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

  const transactions = [
    {
      id: 'topup',
      title: text.topUp,
      subtitle: text.today,
      amount: '+ £25.00',
      status: text.completed,
      icon: '＋',
      bg: BRAND.softGreen,
      color: BRAND.green,
    },
    {
      id: 'booking',
      title: text.bookingDeposit,
      subtitle: text.today,
      amount: '- £5.00',
      status: text.completed,
      icon: '📅',
      bg: BRAND.softBlue,
      color: BRAND.blue,
    },
    {
      id: 'promotion',
      title: text.promotionPayment,
      subtitle: text.yesterday,
      amount: '- £1.00',
      status: text.completed,
      icon: '📣',
      bg: BRAND.softPink,
      color: BRAND.pink,
    },
    {
      id: 'fee',
      title: text.platformFee,
      subtitle: text.yesterday,
      amount: '- £0.50',
      status: text.completed,
      icon: '🛡️',
      bg: BRAND.softViolet,
      color: BRAND.navy,
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
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: BRAND.blue,
                  }}
                >
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

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 13,
                    fontWeight: 900,
                    color: BRAND.muted,
                  }}
                >
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

          <div
            style={{
              borderRadius: 26,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
            }}
          >
            {transactions.map((item, index) => (
              <div
                key={item.id}
                style={{
                  minHeight: 86,
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
                      marginTop: 5,
                      fontSize: 12.5,
                      lineHeight: 1.2,
                      fontWeight: 800,
                      color: BRAND.muted,
                    }}
                  >
                    {item.subtitle} · {item.status}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: item.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.amount}
                </div>
              </div>
            ))}
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
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: BRAND.navy,
            }}
          >
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
            Full statements, payout reports, refunds and invoices will appear here.
          </p>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
