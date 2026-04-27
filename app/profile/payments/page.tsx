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

type LocalCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
};

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
  addCard: string;
  saveCard: string;
  cancel: string;
  cardBrand: string;
  last4: string;
  expiry: string;
  cardHolder: string;
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
  primaryHint: string;
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
    cardsHint: 'Add several cards and choose one primary card for payments',
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
    addCard: 'Add card',
    saveCard: 'Save card',
    cancel: 'Cancel',
    cardBrand: 'Card brand',
    last4: 'Last 4 digits',
    expiry: 'Expiry',
    cardHolder: 'Card holder',
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
    addHint: 'Real card saving will later be connected through Stripe.',
    primaryHint: 'Only one card can be primary at the same time.',
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
    cardsHint: 'Добавляйте несколько карт и выбирайте одну основную для оплаты',
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
    addCard: 'Добавить карту',
    saveCard: 'Сохранить карту',
    cancel: 'Отмена',
    cardBrand: 'Тип карты',
    last4: 'Последние 4 цифры',
    expiry: 'Срок',
    cardHolder: 'Владелец карты',
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
    addHint: 'Настоящее сохранение карт позже подключим через Stripe.',
    primaryHint: 'Одновременно основной может быть только одна карта.',
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
    cardsHint: 'Додавайте кілька карток і вибирайте одну основну',
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
    addCard: 'Додати картку',
    saveCard: 'Зберегти картку',
    cancel: 'Скасувати',
    cardBrand: 'Тип картки',
    last4: 'Останні 4 цифри',
    expiry: 'Термін',
    cardHolder: 'Власник картки',
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
    addHint: 'Справжнє збереження карток пізніше підключимо через Stripe.',
    primaryHint: 'Одночасно основною може бути тільки одна картка.',
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
    cardsHint: 'Añade varias tarjetas y elige una principal',
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
    addCard: 'Añadir tarjeta',
    saveCard: 'Guardar tarjeta',
    cancel: 'Cancelar',
    cardBrand: 'Marca',
    last4: 'Últimos 4 dígitos',
    expiry: 'Caducidad',
    cardHolder: 'Titular',
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
    addHint: 'El guardado real de tarjetas se conectará después con Stripe.',
    primaryHint: 'Solo una tarjeta puede ser principal al mismo tiempo.',
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
    cardsHint: 'Přidejte více karet a jednu nastavte jako hlavní',
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
    addCard: 'Přidat kartu',
    saveCard: 'Uložit kartu',
    cancel: 'Zrušit',
    cardBrand: 'Typ karty',
    last4: 'Poslední 4 čísla',
    expiry: 'Platnost',
    cardHolder: 'Držitel karty',
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
    addHint: 'Skutečné ukládání karet později připojíme přes Stripe.',
    primaryHint: 'Hlavní může být současně pouze jedna karta.',
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
    cardsHint: 'Füge mehrere Karten hinzu und wähle eine Hauptkarte',
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
    addCard: 'Karte hinzufügen',
    saveCard: 'Karte speichern',
    cancel: 'Abbrechen',
    cardBrand: 'Kartentyp',
    last4: 'Letzte 4 Ziffern',
    expiry: 'Ablauf',
    cardHolder: 'Karteninhaber',
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
    addHint: 'Echtes Speichern von Karten wird später über Stripe verbunden.',
    primaryHint: 'Nur eine Karte kann gleichzeitig primär sein.',
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
    cardsHint: 'Aggiungi più carte e scegli una principale',
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
    addCard: 'Aggiungi carta',
    saveCard: 'Salva carta',
    cancel: 'Annulla',
    cardBrand: 'Tipo carta',
    last4: 'Ultime 4 cifre',
    expiry: 'Scadenza',
    cardHolder: 'Titolare',
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
    addHint: 'Il salvataggio reale delle carte sarà collegato più tardi con Stripe.',
    primaryHint: 'Solo una carta può essere principale allo stesso tempo.',
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
    cardsHint: 'Ajoutez plusieurs cartes et choisissez une principale',
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
    addCard: 'Ajouter carte',
    saveCard: 'Enregistrer carte',
    cancel: 'Annuler',
    cardBrand: 'Type de carte',
    last4: '4 derniers chiffres',
    expiry: 'Expiration',
    cardHolder: 'Titulaire',
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
    addHint: 'L’enregistrement réel des cartes sera connecté plus tard avec Stripe.',
    primaryHint: 'Une seule carte peut être principale à la fois.',
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
    cardsHint: 'Dodaj kilka kart i wybierz jedną główną',
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
    addCard: 'Dodaj kartę',
    saveCard: 'Zapisz kartę',
    cancel: 'Anuluj',
    cardBrand: 'Typ karty',
    last4: 'Ostatnie 4 cyfry',
    expiry: 'Ważność',
    cardHolder: 'Właściciel karty',
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
    addHint: 'Prawdziwe zapisywanie kart podłączymy później przez Stripe.',
    primaryHint: 'Tylko jedna karta może być główna jednocześnie.',
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
    cardsHint: 'أضف عدة بطاقات واختر بطاقة رئيسية واحدة',
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
    addCard: 'إضافة بطاقة',
    saveCard: 'حفظ البطاقة',
    cancel: 'إلغاء',
    cardBrand: 'نوع البطاقة',
    last4: 'آخر 4 أرقام',
    expiry: 'الصلاحية',
    cardHolder: 'صاحب البطاقة',
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
    addHint: 'سيتم ربط حفظ البطاقات الحقيقي لاحقاً عبر Stripe.',
    primaryHint: 'يمكن أن تكون بطاقة واحدة فقط رئيسية في نفس الوقت.',
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
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}

function ApplePayIcon() {
  return (
    <span
      style={{
        width: 74,
        height: 42,
        borderRadius: 13,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        color: '#050505',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 900,
        letterSpacing: '-0.5px',
      }}
    >
      Pay
    </span>
  );
}

function GooglePayIcon() {
  return (
    <span
      style={{
        width: 82,
        height: 42,
        borderRadius: 13,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        color: '#050505',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: '-0.3px',
      }}
    >
      G Pay
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

function FieldInput({
  value,
  placeholder,
  onChange,
  maxLength,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: '100%',
        minHeight: 44,
        borderRadius: 15,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        color: BRAND.navy,
        fontSize: 14,
        fontWeight: 900,
        padding: '0 10px',
        boxSizing: 'border-box',
        outline: 'none',
      }}
    />
  );
}

export default function PaymentsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [payments, setPayments] = useState<PaymentsState>(getPaymentsState());
  const [localCards, setLocalCards] = useState<LocalCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardLast4, setCardLast4] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncPayments = () => {
      const nextPayments = getPaymentsState();
      setPayments(nextPayments);

      const cards = (nextPayments.savedCards || []).map((card) => ({
        id: card.id,
        brand: card.brand,
        last4: card.last4,
        expiry: card.expiry,
        holderName: card.holderName,
        isDefault: card.isDefault,
      }));

      setLocalCards(cards);
    };

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
  const cryptoWallets = payments.cryptoWallets || [];

  const totalMethods =
    localCards.length +
    (payments.paypalEmail ? 1 : 0) +
    (payments.googlePayEnabled ? 1 : 0) +
    (payments.applePayEnabled ? 1 : 0) +
    cryptoWallets.length +
    (payments.bankTransferEnabled ? 1 : 0);

  const setPrimaryCard = (id: string) => {
    setLocalCards((cards) =>
      cards.map((card) => ({
        ...card,
        isDefault: card.id === id,
      })),
    );
  };

  const removeCard = (id: string) => {
    setLocalCards((cards) => {
      const nextCards = cards.filter((card) => card.id !== id);

      if (!nextCards.some((card) => card.isDefault) && nextCards.length > 0) {
        return nextCards.map((card, index) => ({
          ...card,
          isDefault: index === 0,
        }));
      }

      return nextCards;
    });
  };

  const addCard = () => {
    const cleanLast4 = cardLast4.replace(/\D/g, '').slice(0, 4);

    if (!cleanLast4 || cleanLast4.length < 4) {
      return;
    }

    const newCard: LocalCard = {
      id: `local-card-${Date.now()}`,
      brand: cardBrand || 'Card',
      last4: cleanLast4,
      expiry: cardExpiry || 'MM/YY',
      holderName: cardHolder || 'Card holder',
      isDefault: localCards.length === 0,
    };

    setLocalCards((cards) => [...cards, newCard]);
    setCardBrand('Visa');
    setCardLast4('');
    setCardExpiry('');
    setCardHolder('');
    setShowAddCard(false);
  };

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
              {text.primaryHint}
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

          <button
            type="button"
            onClick={() => setShowAddCard((value) => !value)}
            style={{
              marginTop: 10,
              width: '100%',
              minHeight: 54,
              borderRadius: 18,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
            }}
          >
            ＋ {text.addCard}
          </button>

          {showAddCard ? (
            <div
              style={{
                marginTop: 12,
                borderRadius: 24,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 13,
                display: 'grid',
                gap: 10,
              }}
            >
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900 }}>{text.cardBrand}</span>
                <FieldInput value={cardBrand} placeholder="Visa" onChange={setCardBrand} />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900 }}>{text.last4}</span>
                <FieldInput
                  value={cardLast4}
                  placeholder="4242"
                  maxLength={4}
                  onChange={(value) => setCardLast4(value.replace(/\D/g, '').slice(0, 4))}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{text.expiry}</span>
                  <FieldInput value={cardExpiry} placeholder="09/27" onChange={setCardExpiry} />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{text.cardHolder}</span>
                  <FieldInput value={cardHolder} placeholder="Alex Carter" onChange={setCardHolder} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={addCard}
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
                  {text.saveCard}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  style={{
                    minHeight: 48,
                    borderRadius: 17,
                    border: `2.5px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: BRAND.navy,
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.cancel}
                </button>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            {localCards.map((card) => (
              <article
                key={card.id}
                style={{
                  borderRadius: 26,
                  border: `2.5px solid ${BRAND.border}`,
                  background: card.isDefault
                    ? 'linear-gradient(135deg, #071b46 0%, #0e73d8 100%)'
                    : '#ffffff',
                  color: card.isDefault ? '#ffffff' : BRAND.navy,
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
                        opacity: card.isDefault ? 0.95 : 1,
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
                        color: card.isDefault ? '#dcecff' : BRAND.muted,
                      }}
                    >
                      {card.expiry} · {card.holderName}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 7, justifyItems: 'end' }}>
                    {card.isDefault ? (
                      <StatusBadge kind="green">{text.defaultLabel}</StatusBadge>
                    ) : null}

                    <StatusBadge kind={card.isDefault ? 'blue' : 'pink'}>{text.verified}</StatusBadge>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 15,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                  }}
                >
                  {!card.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setPrimaryCard(card.id)}
                      style={{
                        minHeight: 44,
                        borderRadius: 15,
                        border: `2px solid ${BRAND.border}`,
                        background: BRAND.yellow,
                        color: BRAND.navy,
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.setPrimary}
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={{
                        minHeight: 44,
                        borderRadius: 15,
                        border: `2px solid ${BRAND.border}`,
                        background: 'rgba(255,255,255,0.14)',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'default',
                      }}
                    >
                      ✓ {text.defaultLabel}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    style={{
                      minHeight: 44,
                      borderRadius: 15,
                      border: `2px solid ${BRAND.border}`,
                      background: card.isDefault ? 'rgba(255,255,255,0.14)' : BRAND.softPink,
                      color: card.isDefault ? '#ffffff' : BRAND.pink,
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <SectionTitle title={text.mobilePayments} subtitle={text.mobileHint} />

          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {[
              {
                name: 'Apple Pay',
                enabled: payments.applePayEnabled,
                logo: <ApplePayIcon />,
                bg: BRAND.softGreen,
              },
              {
                name: 'Google Pay',
                enabled: payments.googlePayEnabled,
                logo: <GooglePayIcon />,
                bg: BRAND.softBlue,
              },
            ].map((item) => (
              <article
                key={item.name}
                style={{
                  borderRadius: 24,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 13,
                  display: 'grid',
                  gridTemplateColumns: '92px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 92,
                    height: 62,
                    borderRadius: 18,
                    border: `2.5px solid ${BRAND.border}`,
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.logo}
                </div>

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
          </article>
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
