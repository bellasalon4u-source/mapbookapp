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
  getPaymentsState,
  subscribeToPaymentsStore,
  type PaymentsState,
} from '../../services/paymentsStore';

type PaymentTextShape = {
  title: string;
  subtitle: string;
  trusted: string;
  trustedSub: string;
  totalMethods: string;
  secure: string;
  instantCheckout: string;
  readyLabel: string;
  cards: string;
  cardsHint: string;
  paypal: string;
  paypalHint: string;
  mobilePayments: string;
  mobileHint: string;
  crypto: string;
  cryptoHint: string;
  bank: string;
  bankHint: string;
  defaultLabel: string;
  enabled: string;
  disabled: string;
  verified: string;
  addNew: string;
  edit: string;
  remove: string;
  setPrimary: string;
  connected: string;
  notConnected: string;
  lastUsed: string;
  payoutReady: string;
  verificationNeeded: string;
  bankAvailable: string;
  comingSoon: string;
  addHint: string;
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

const paymentTexts: Record<AppLanguage, PaymentTextShape> = {
  EN: {
    title: 'Payment methods',
    subtitle: 'Manage cards, wallets and checkout options',
    trusted: 'Trusted payments',
    trustedSub: 'Your checkout methods are ready and protected inside Olamep.',
    totalMethods: 'Total methods',
    secure: 'Olamep secure checkout',
    instantCheckout: 'Instant checkout ready',
    readyLabel: 'Ready to pay',
    cards: 'Saved cards',
    cardsHint: 'Primary card, secure checkout and billing methods',
    paypal: 'PayPal',
    paypalHint: 'Connected account for fast checkout',
    mobilePayments: 'Apple Pay & Google Pay',
    mobileHint: 'Express checkout on supported devices',
    crypto: 'Crypto wallets',
    cryptoHint: 'Receive or pay with connected crypto wallets',
    bank: 'Bank transfer',
    bankHint: 'Manual transfer and business payments',
    defaultLabel: 'Primary',
    enabled: 'Enabled',
    disabled: 'Disabled',
    verified: 'Verified',
    addNew: 'Add new',
    edit: 'Edit',
    remove: 'Remove',
    setPrimary: 'Set primary',
    connected: 'Connected',
    notConnected: 'Not connected',
    lastUsed: 'Last used',
    payoutReady: 'Ready for payouts',
    verificationNeeded: 'Verification recommended',
    bankAvailable: 'Business and manual transfer available',
    comingSoon: 'Coming soon',
    addHint: 'Adding new real payment methods will be connected to Stripe later.',
  },
  RU: {
    title: 'Способы оплаты',
    subtitle: 'Управляйте картами, кошельками и оплатой',
    trusted: 'Надёжные платежи',
    trustedSub: 'Ваши способы оплаты готовы и защищены внутри Olamep.',
    totalMethods: 'Всего способов',
    secure: 'Безопасная оплата Olamep',
    instantCheckout: 'Быстрая оплата готова',
    readyLabel: 'Готово к оплате',
    cards: 'Сохранённые карты',
    cardsHint: 'Основная карта, безопасная оплата и платёжные методы',
    paypal: 'PayPal',
    paypalHint: 'Подключённый аккаунт для быстрой оплаты',
    mobilePayments: 'Apple Pay и Google Pay',
    mobileHint: 'Быстрая оплата на поддерживаемых устройствах',
    crypto: 'Криптокошельки',
    cryptoHint: 'Получение и оплата через подключённые кошельки',
    bank: 'Банковский перевод',
    bankHint: 'Ручной перевод и бизнес-платежи',
    defaultLabel: 'Основная',
    enabled: 'Включено',
    disabled: 'Выключено',
    verified: 'Проверено',
    addNew: 'Добавить',
    edit: 'Изменить',
    remove: 'Удалить',
    setPrimary: 'Сделать основной',
    connected: 'Подключено',
    notConnected: 'Не подключено',
    lastUsed: 'Последнее использование',
    payoutReady: 'Готово к выплатам',
    verificationNeeded: 'Рекомендуется верификация',
    bankAvailable: 'Доступны ручной и бизнес-перевод',
    comingSoon: 'Скоро',
    addHint: 'Добавление настоящих способов оплаты позже подключим через Stripe.',
  },
  UA: {
    title: 'Способи оплати',
    subtitle: 'Керуйте картками, гаманцями та оплатою',
    trusted: 'Надійні платежі',
    trustedSub: 'Ваші способи оплати готові та захищені всередині Olamep.',
    totalMethods: 'Усього способів',
    secure: 'Безпечна оплата Olamep',
    instantCheckout: 'Швидка оплата готова',
    readyLabel: 'Готово до оплати',
    cards: 'Збережені картки',
    cardsHint: 'Основна картка, безпечна оплата та платіжні методи',
    paypal: 'PayPal',
    paypalHint: 'Підключений акаунт для швидкої оплати',
    mobilePayments: 'Apple Pay і Google Pay',
    mobileHint: 'Швидка оплата на підтримуваних пристроях',
    crypto: 'Криптогаманці',
    cryptoHint: 'Отримання та оплата через підключені гаманці',
    bank: 'Банківський переказ',
    bankHint: 'Ручний переказ і бізнес-платежі',
    defaultLabel: 'Основна',
    enabled: 'Увімкнено',
    disabled: 'Вимкнено',
    verified: 'Перевірено',
    addNew: 'Додати',
    edit: 'Змінити',
    remove: 'Видалити',
    setPrimary: 'Зробити основною',
    connected: 'Підключено',
    notConnected: 'Не підключено',
    lastUsed: 'Останнє використання',
    payoutReady: 'Готово до виплат',
    verificationNeeded: 'Рекомендована верифікація',
    bankAvailable: 'Доступний ручний і бізнес-переказ',
    comingSoon: 'Скоро',
    addHint: 'Додавання справжніх способів оплати пізніше підключимо через Stripe.',
  },
  ES: {
    title: 'Métodos de pago',
    subtitle: 'Administra tarjetas, billeteras y opciones de pago',
    trusted: 'Pagos seguros',
    trustedSub: 'Tus métodos de pago están listos y protegidos dentro de Olamep.',
    totalMethods: 'Total métodos',
    secure: 'Pago seguro Olamep',
    instantCheckout: 'Pago instantáneo listo',
    readyLabel: 'Listo para pagar',
    cards: 'Tarjetas guardadas',
    cardsHint: 'Tarjeta principal, pago seguro y métodos de facturación',
    paypal: 'PayPal',
    paypalHint: 'Cuenta conectada para pago rápido',
    mobilePayments: 'Apple Pay y Google Pay',
    mobileHint: 'Pago exprés en dispositivos compatibles',
    crypto: 'Billeteras cripto',
    cryptoHint: 'Recibe o paga con billeteras conectadas',
    bank: 'Transferencia bancaria',
    bankHint: 'Transferencia manual y pagos de empresa',
    defaultLabel: 'Principal',
    enabled: 'Activo',
    disabled: 'Desactivado',
    verified: 'Verificado',
    addNew: 'Añadir',
    edit: 'Editar',
    remove: 'Eliminar',
    setPrimary: 'Hacer principal',
    connected: 'Conectado',
    notConnected: 'No conectado',
    lastUsed: 'Último uso',
    payoutReady: 'Listo para pagos',
    verificationNeeded: 'Se recomienda verificación',
    bankAvailable: 'Transferencia manual y pagos para empresas disponibles',
    comingSoon: 'Próximamente',
    addHint: 'Los métodos reales se conectarán más tarde con Stripe.',
  },
  CZ: {
    title: 'Platební metody',
    subtitle: 'Spravujte karty, peněženky a možnosti platby',
    trusted: 'Důvěryhodné platby',
    trustedSub: 'Vaše platební metody jsou připravené a chráněné v Olamep.',
    totalMethods: 'Celkem metod',
    secure: 'Bezpečná platba Olamep',
    instantCheckout: 'Rychlá platba připravena',
    readyLabel: 'Připraveno k platbě',
    cards: 'Uložené karty',
    cardsHint: 'Hlavní karta, bezpečná platba a platební metody',
    paypal: 'PayPal',
    paypalHint: 'Připojený účet pro rychlou platbu',
    mobilePayments: 'Apple Pay a Google Pay',
    mobileHint: 'Rychlá platba na podporovaných zařízeních',
    crypto: 'Crypto peněženky',
    cryptoHint: 'Platby a příjem přes připojené peněženky',
    bank: 'Bankovní převod',
    bankHint: 'Ruční převod a firemní platby',
    defaultLabel: 'Hlavní',
    enabled: 'Zapnuto',
    disabled: 'Vypnuto',
    verified: 'Ověřeno',
    addNew: 'Přidat',
    edit: 'Upravit',
    remove: 'Odstranit',
    setPrimary: 'Nastavit jako hlavní',
    connected: 'Připojeno',
    notConnected: 'Nepřipojeno',
    lastUsed: 'Naposledy použito',
    payoutReady: 'Připraveno pro výplaty',
    verificationNeeded: 'Doporučena verifikace',
    bankAvailable: 'Dostupný ruční a firemní převod',
    comingSoon: 'Brzy',
    addHint: 'Skutečné platební metody později připojíme přes Stripe.',
  },
  DE: {
    title: 'Zahlungsmethoden',
    subtitle: 'Verwalte Karten, Wallets und Zahlungsoptionen',
    trusted: 'Sichere Zahlungen',
    trustedSub: 'Deine Zahlungsmethoden sind in Olamep bereit und geschützt.',
    totalMethods: 'Methoden gesamt',
    secure: 'Olamep Secure Checkout',
    instantCheckout: 'Sofort-Checkout bereit',
    readyLabel: 'Bereit zum Bezahlen',
    cards: 'Gespeicherte Karten',
    cardsHint: 'Primäre Karte, sicherer Checkout und Abrechnungsmethoden',
    paypal: 'PayPal',
    paypalHint: 'Verbundenes Konto für schnellen Checkout',
    mobilePayments: 'Apple Pay und Google Pay',
    mobileHint: 'Express-Checkout auf unterstützten Geräten',
    crypto: 'Krypto-Wallets',
    cryptoHint: 'Zahlen oder empfangen mit verbundenen Wallets',
    bank: 'Banküberweisung',
    bankHint: 'Manuelle Überweisung und Geschäftszahlungen',
    defaultLabel: 'Primär',
    enabled: 'Aktiv',
    disabled: 'Inaktiv',
    verified: 'Verifiziert',
    addNew: 'Hinzufügen',
    edit: 'Bearbeiten',
    remove: 'Entfernen',
    setPrimary: 'Als primär setzen',
    connected: 'Verbunden',
    notConnected: 'Nicht verbunden',
    lastUsed: 'Zuletzt verwendet',
    payoutReady: 'Bereit für Auszahlungen',
    verificationNeeded: 'Verifizierung empfohlen',
    bankAvailable: 'Manuelle und Business-Überweisung verfügbar',
    comingSoon: 'Bald',
    addHint: 'Echte Zahlungsmethoden werden später über Stripe verbunden.',
  },
  IT: {
    title: 'Metodi di pagamento',
    subtitle: 'Gestisci carte, wallet e opzioni di pagamento',
    trusted: 'Pagamenti sicuri',
    trustedSub: 'I tuoi metodi di pagamento sono pronti e protetti in Olamep.',
    totalMethods: 'Metodi totali',
    secure: 'Checkout sicuro Olamep',
    instantCheckout: 'Checkout rapido pronto',
    readyLabel: 'Pronto a pagare',
    cards: 'Carte salvate',
    cardsHint: 'Carta principale, checkout sicuro e metodi di fatturazione',
    paypal: 'PayPal',
    paypalHint: 'Account collegato per checkout rapido',
    mobilePayments: 'Apple Pay e Google Pay',
    mobileHint: 'Checkout express sui dispositivi supportati',
    crypto: 'Wallet crypto',
    cryptoHint: 'Ricevi o paga con wallet collegati',
    bank: 'Bonifico bancario',
    bankHint: 'Bonifico manuale e pagamenti business',
    defaultLabel: 'Principale',
    enabled: 'Attivo',
    disabled: 'Disattivo',
    verified: 'Verificato',
    addNew: 'Aggiungi',
    edit: 'Modifica',
    remove: 'Rimuovi',
    setPrimary: 'Imposta principale',
    connected: 'Collegato',
    notConnected: 'Non collegato',
    lastUsed: 'Ultimo uso',
    payoutReady: 'Pronto per pagamenti',
    verificationNeeded: 'Verifica consigliata',
    bankAvailable: 'Bonifico manuale e business disponibile',
    comingSoon: 'Presto',
    addHint: 'I metodi reali saranno collegati più tardi con Stripe.',
  },
  FR: {
    title: 'Moyens de paiement',
    subtitle: 'Gérez cartes, wallets et options de paiement',
    trusted: 'Paiements sécurisés',
    trustedSub: 'Vos moyens de paiement sont prêts et protégés dans Olamep.',
    totalMethods: 'Moyens total',
    secure: 'Paiement sécurisé Olamep',
    instantCheckout: 'Paiement instantané prêt',
    readyLabel: 'Prêt à payer',
    cards: 'Cartes enregistrées',
    cardsHint: 'Carte principale, paiement sécurisé et facturation',
    paypal: 'PayPal',
    paypalHint: 'Compte connecté pour paiement rapide',
    mobilePayments: 'Apple Pay et Google Pay',
    mobileHint: 'Paiement express sur appareils compatibles',
    crypto: 'Wallets crypto',
    cryptoHint: 'Recevoir ou payer avec wallets connectés',
    bank: 'Virement bancaire',
    bankHint: 'Virement manuel et paiements business',
    defaultLabel: 'Principale',
    enabled: 'Activé',
    disabled: 'Désactivé',
    verified: 'Vérifié',
    addNew: 'Ajouter',
    edit: 'Modifier',
    remove: 'Supprimer',
    setPrimary: 'Définir principal',
    connected: 'Connecté',
    notConnected: 'Non connecté',
    lastUsed: 'Dernière utilisation',
    payoutReady: 'Prêt pour paiements',
    verificationNeeded: 'Vérification recommandée',
    bankAvailable: 'Virement manuel et business disponible',
    comingSoon: 'Bientôt',
    addHint: 'Les vrais moyens de paiement seront connectés plus tard avec Stripe.',
  },
  PL: {
    title: 'Metody płatności',
    subtitle: 'Zarządzaj kartami, portfelami i płatnościami',
    trusted: 'Bezpieczne płatności',
    trustedSub: 'Twoje metody płatności są gotowe i chronione w Olamep.',
    totalMethods: 'Łącznie metod',
    secure: 'Bezpieczna płatność Olamep',
    instantCheckout: 'Szybka płatność gotowa',
    readyLabel: 'Gotowe do płatności',
    cards: 'Zapisane karty',
    cardsHint: 'Karta główna, bezpieczna płatność i rozliczenia',
    paypal: 'PayPal',
    paypalHint: 'Połączone konto do szybkiej płatności',
    mobilePayments: 'Apple Pay i Google Pay',
    mobileHint: 'Szybka płatność na obsługiwanych urządzeniach',
    crypto: 'Portfele krypto',
    cryptoHint: 'Płatności i wypłaty przez połączone portfele',
    bank: 'Przelew bankowy',
    bankHint: 'Przelew ręczny i płatności firmowe',
    defaultLabel: 'Główna',
    enabled: 'Włączone',
    disabled: 'Wyłączone',
    verified: 'Zweryfikowano',
    addNew: 'Dodaj',
    edit: 'Edytuj',
    remove: 'Usuń',
    setPrimary: 'Ustaw jako główną',
    connected: 'Połączono',
    notConnected: 'Nie połączono',
    lastUsed: 'Ostatnio użyto',
    payoutReady: 'Gotowe do wypłat',
    verificationNeeded: 'Zalecana weryfikacja',
    bankAvailable: 'Dostępny przelew ręczny i firmowy',
    comingSoon: 'Wkrótce',
    addHint: 'Prawdziwe metody płatności podłączymy później przez Stripe.',
  },
  AR: {
    title: 'طرق الدفع',
    subtitle: 'إدارة البطاقات والمحافظ وخيارات الدفع',
    trusted: 'مدفوعات آمنة',
    trustedSub: 'طرق الدفع الخاصة بك جاهزة ومحمية داخل Olamep.',
    totalMethods: 'إجمالي الطرق',
    secure: 'دفع آمن عبر Olamep',
    instantCheckout: 'الدفع السريع جاهز',
    readyLabel: 'جاهز للدفع',
    cards: 'البطاقات المحفوظة',
    cardsHint: 'البطاقة الرئيسية والدفع الآمن وطرق الفوترة',
    paypal: 'PayPal',
    paypalHint: 'حساب متصل للدفع السريع',
    mobilePayments: 'Apple Pay و Google Pay',
    mobileHint: 'دفع سريع على الأجهزة المدعومة',
    crypto: 'محافظ كريبتو',
    cryptoHint: 'استلام أو دفع عبر المحافظ المتصلة',
    bank: 'تحويل بنكي',
    bankHint: 'تحويل يدوي ومدفوعات تجارية',
    defaultLabel: 'رئيسية',
    enabled: 'مفعل',
    disabled: 'معطل',
    verified: 'موثق',
    addNew: 'إضافة',
    edit: 'تعديل',
    remove: 'حذف',
    setPrimary: 'تعيين كرئيسي',
    connected: 'متصل',
    notConnected: 'غير متصل',
    lastUsed: 'آخر استخدام',
    payoutReady: 'جاهز للسحب',
    verificationNeeded: 'يوصى بالتحقق',
    bankAvailable: 'التحويل اليدوي والتجاري متاح',
    comingSoon: 'قريباً',
    addHint: 'سيتم ربط طرق الدفع الحقيقية لاحقاً عبر Stripe.',
  },
};

function getText(language: AppLanguage) {
  return paymentTexts[language] || paymentTexts.EN;
}

function getBadgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange' | 'neutral') {
  if (kind === 'green') return { background: BRAND.softGreen, color: '#11883d' };
  if (kind === 'blue') return { background: BRAND.softBlue, color: BRAND.blue };
  if (kind === 'pink') return { background: BRAND.softPink, color: BRAND.pink };
  if (kind === 'orange') return { background: BRAND.softOrange, color: '#b47b00' };
  return { background: '#f2f4f7', color: BRAND.muted };
}

function StatusBadge({
  children,
  kind,
}: {
  children: string;
  kind: 'green' | 'blue' | 'pink' | 'orange' | 'neutral';
}) {
  const style = getBadgeStyle(kind);

  return (
    <span
      style={{
        minHeight: 28,
        padding: '0 10px',
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: style.background,
        color: style.color,
        fontSize: 11,
        fontWeight: 900,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function SmallIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <span
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 20,
          lineHeight: 1.1,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: 13,
          lineHeight: 1.35,
          fontWeight: 800,
          color: BRAND.muted,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [payments, setPayments] = useState<PaymentsState>(getPaymentsState());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncPayments = () => setPayments(getPaymentsState());

    syncLanguage();
    syncPayments();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    const unsubPayments = subscribeToPaymentsStore(syncPayments);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncPayments);
    window.addEventListener('storage', syncPayments);

    return () => {
      unsubLanguage();
      unsubPayments();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncPayments);
      window.removeEventListener('storage', syncPayments);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const savedCards = payments.savedCards || [];
  const cryptoWallets = payments.cryptoWallets || [];

  const totalMethods =
    savedCards.length +
    (payments.paypalEmail ? 1 : 0) +
    (payments.googlePayEnabled ? 1 : 0) +
    (payments.applePayEnabled ? 1 : 0) +
    cryptoWallets.length +
    (payments.bankTransferEnabled ? 1 : 0);

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
            background:
              'linear-gradient(135deg, #ffffff 0%, #dcecff 38%, #dcffe8 72%, #fff0da 100%)',
            padding: 15,
            boxShadow: '0 12px 28px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 96px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.trusted}
              </div>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.trustedSub}
              </p>
            </div>

            <div
              style={{
                minHeight: 82,
                borderRadius: 22,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 10,
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {totalMethods}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                {text.totalMethods}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <StatusBadge kind="green">{text.secure}</StatusBadge>
            <StatusBadge kind="blue">{text.instantCheckout}</StatusBadge>
            <StatusBadge kind="orange">{text.readyLabel}</StatusBadge>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 20,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: '13px 14px',
              boxShadow: '0 5px 0 rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.25,
                fontWeight: 900,
                color: BRAND.navy,
              }}
            >
              ＋ {text.addNew} — {text.comingSoon}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 13,
                lineHeight: 1.3,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.addHint}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.cards} subtitle={text.cardsHint} />

          <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
            {savedCards.map((card, index) => (
              <article
                key={card.id}
                style={{
                  borderRadius: 26,
                  border: `2.5px solid ${BRAND.border}`,
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, #071b46 0%, #0e73d8 100%)'
                      : '#ffffff',
                  color: index === 0 ? '#ffffff' : BRAND.navy,
                  padding: 14,
                  boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        opacity: index === 0 ? 0.95 : 1,
                      }}
                    >
                      {card.brand}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 25,
                        lineHeight: 1,
                        fontWeight: 900,
                        letterSpacing: 1.2,
                      }}
                    >
                      •••• {card.last4}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontWeight: 800,
                        color: index === 0 ? '#dcecff' : BRAND.muted,
                      }}
                    >
                      {card.expiry} · {card.holderName}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 7, justifyItems: 'end' }}>
                    {card.isDefault ? (
                      <StatusBadge kind={index === 0 ? 'green' : 'orange'}>
                        {text.defaultLabel}
                      </StatusBadge>
                    ) : null}

                    <StatusBadge kind={index === 0 ? 'blue' : 'pink'}>{text.verified}</StatusBadge>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 15,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                  }}
                >
                  {[text.edit, text.setPrimary, text.remove].map((label, actionIndex) => (
                    <button
                      key={label}
                      type="button"
                      style={{
                        minHeight: 44,
                        borderRadius: 15,
                        border: `2px solid ${BRAND.border}`,
                        background:
                          index === 0
                            ? 'rgba(255,255,255,0.14)'
                            : actionIndex === 2
                              ? BRAND.softPink
                              : '#ffffff',
                        color: index === 0 ? '#ffffff' : actionIndex === 2 ? BRAND.pink : BRAND.navy,
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.paypal} subtitle={text.paypalHint} />

          <article
            style={{
              marginTop: 10,
              borderRadius: 26,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 13,
              boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '58px minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <SmallIcon icon="P" bg={BRAND.softBlue} />

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
                  {payments.paypalEmail || text.notConnected}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  {text.lastUsed}: PayPal
                </div>
              </div>

              <StatusBadge kind={payments.paypalEmail ? 'blue' : 'neutral'}>
                {payments.paypalEmail ? text.connected : text.notConnected}
              </StatusBadge>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 9,
              }}
            >
              <button
                type="button"
                style={{
                  minHeight: 48,
                  borderRadius: 17,
                  border: `2.5px solid ${BRAND.border}`,
                  background: BRAND.navy,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.edit}
              </button>

              <button
                type="button"
                style={{
                  minHeight: 48,
                  borderRadius: 17,
                  border: `2.5px solid ${BRAND.border}`,
                  background: BRAND.yellow,
                  color: BRAND.navy,
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.setPrimary}
              </button>
            </div>
          </article>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.mobilePayments} subtitle={text.mobileHint} />

          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {[
              { name: 'Apple Pay', enabled: payments.applePayEnabled, icon: '', bg: BRAND.softGreen },
              { name: 'Google Pay', enabled: payments.googlePayEnabled, icon: 'G', bg: BRAND.softBlue },
            ].map((item) => (
              <article
                key={item.name}
                style={{
                  borderRadius: 24,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 13,
                  display: 'grid',
                  gridTemplateColumns: '58px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <SmallIcon icon={item.icon} bg={item.bg} />

                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      fontWeight: 800,
                      color: BRAND.muted,
                    }}
                  >
                    {text.instantCheckout}
                  </div>
                </div>

                <StatusBadge kind={item.enabled ? 'green' : 'neutral'}>
                  {item.enabled ? text.enabled : text.disabled}
                </StatusBadge>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.crypto} subtitle={text.cryptoHint} />

          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {cryptoWallets.map((wallet) => (
              <article
                key={wallet.id}
                style={{
                  borderRadius: 24,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 13,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '58px minmax(0, 1fr) auto',
                    gap: 12,
                    alignItems: 'start',
                  }}
                >
                  <SmallIcon icon="₿" bg={BRAND.softOrange} />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {wallet.coin} · {wallet.network}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12.5,
                        lineHeight: 1.25,
                        fontWeight: 800,
                        color: BRAND.muted,
                        wordBreak: 'break-all',
                      }}
                    >
                      {wallet.address}
                    </div>
                  </div>

                  {wallet.isDefault ? (
                    <StatusBadge kind="pink">{text.defaultLabel}</StatusBadge>
                  ) : null}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 9,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      border: `2px solid ${BRAND.border}`,
                      background: '#ffffff',
                      color: BRAND.navy,
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {wallet.isDefault ? text.edit : text.setPrimary}
                  </button>

                  <button
                    type="button"
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      border: `2px solid ${BRAND.border}`,
                      background: BRAND.softPink,
                      color: BRAND.pink,
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.remove}
                  </button>
                </div>
              </article>
            ))}

            <div
              style={{
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 13,
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 900,
                color: BRAND.blue,
              }}
            >
              {text.payoutReady}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.bank} subtitle={text.bankHint} />

          <article
            style={{
              marginTop: 10,
              borderRadius: 26,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 13,
              display: 'grid',
              gridTemplateColumns: '58px minmax(0, 1fr) auto',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <SmallIcon icon="🏦" bg={BRAND.softViolet} />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.bankAvailable}
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
                {text.verificationNeeded}
              </div>
            </div>

            <StatusBadge kind={payments.bankTransferEnabled ? 'green' : 'neutral'}>
              {payments.bankTransferEnabled ? text.enabled : text.disabled}
            </StatusBadge>
          </article>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
