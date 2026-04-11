'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getPaymentsState,
  subscribeToPaymentsStore,
  type PaymentsState,
} from '../../services/paymentsStore';

const paymentTexts = {
  EN: {
    title: 'Payment methods',
    subtitle: 'Manage cards, wallets and checkout options',
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
    available: 'Available',
    verified: 'Verified',
    addNew: 'Add new',
    edit: 'Edit',
    remove: 'Remove',
    setPrimary: 'Set primary',
    connected: 'Connected',
    notConnected: 'Not connected',
    lastUsed: 'Last used',
    secure: 'Protected by MapBook secure checkout',
    instantCheckout: 'Instant checkout ready',
    payoutReady: 'Ready for payouts',
    verificationNeeded: 'Verification recommended',
    bankAvailable: 'Business and manual transfer available',
    trusted: 'Trusted payments',
    trustedSub: 'Your checkout methods are ready and protected',
    paymentOverview: 'Payment overview',
    checkoutReady: 'Checkout ready',
    walletReady: 'Wallet ready',
    fastProtected: 'Fast and protected',
    sectionActions: 'Quick actions',
    manageAll: 'Manage all methods',
  },
  ES: {
    title: 'Métodos de pago',
    subtitle: 'Administra tarjetas, billeteras y opciones de pago',
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
    available: 'Disponible',
    verified: 'Verificado',
    addNew: 'Añadir',
    edit: 'Editar',
    remove: 'Eliminar',
    setPrimary: 'Hacer principal',
    connected: 'Conectado',
    notConnected: 'No conectado',
    lastUsed: 'Último uso',
    secure: 'Protegido por el pago seguro de MapBook',
    instantCheckout: 'Pago instantáneo listo',
    payoutReady: 'Listo para pagos',
    verificationNeeded: 'Se recomienda verificación',
    bankAvailable: 'Transferencia manual y pagos para empresas disponibles',
    trusted: 'Pagos seguros',
    trustedSub: 'Tus métodos de pago están listos y protegidos',
    paymentOverview: 'Resumen de pagos',
    checkoutReady: 'Checkout listo',
    walletReady: 'Billetera lista',
    fastProtected: 'Rápido y protegido',
    sectionActions: 'Acciones rápidas',
    manageAll: 'Gestionar todos los métodos',
  },
  RU: {
    title: 'Способы оплаты',
    subtitle: 'Управляйте картами, кошельками и вариантами оплаты',
    cards: 'Сохранённые карты',
    cardsHint: 'Основная карта, безопасная оплата и платёжные методы',
    paypal: 'PayPal',
    paypalHint: 'Подключённый аккаунт для быстрого checkout',
    mobilePayments: 'Apple Pay и Google Pay',
    mobileHint: 'Быстрая оплата на поддерживаемых устройствах',
    crypto: 'Криптокошельки',
    cryptoHint: 'Получение и оплата через подключённые кошельки',
    bank: 'Банковский перевод',
    bankHint: 'Ручной перевод и business payments',
    defaultLabel: 'Основная',
    enabled: 'Включено',
    disabled: 'Выключено',
    available: 'Доступно',
    verified: 'Проверено',
    addNew: 'Добавить',
    edit: 'Изменить',
    remove: 'Удалить',
    setPrimary: 'Сделать основной',
    connected: 'Подключено',
    notConnected: 'Не подключено',
    lastUsed: 'Последнее использование',
    secure: 'Защищено безопасной оплатой MapBook',
    instantCheckout: 'Готово к быстрой оплате',
    payoutReady: 'Готово к выплатам',
    verificationNeeded: 'Рекомендуется верификация',
    bankAvailable: 'Доступны business и manual transfer',
    trusted: 'Надёжные платежи',
    trustedSub: 'Ваши способы оплаты готовы и защищены',
    paymentOverview: 'Обзор платежей',
    checkoutReady: 'Checkout готов',
    walletReady: 'Кошелёк готов',
    fastProtected: 'Быстро и защищённо',
    sectionActions: 'Быстрые действия',
    manageAll: 'Управлять всеми способами',
  },
  CZ: {
    title: 'Platební metody',
    subtitle: 'Spravujte karty, peněženky a možnosti platby',
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
    available: 'Dostupné',
    verified: 'Ověřeno',
    addNew: 'Přidat',
    edit: 'Upravit',
    remove: 'Odstranit',
    setPrimary: 'Nastavit jako hlavní',
    connected: 'Připojeno',
    notConnected: 'Nepřipojeno',
    lastUsed: 'Naposledy použito',
    secure: 'Chráněno bezpečnou platbou MapBook',
    instantCheckout: 'Rychlá platba připravena',
    payoutReady: 'Připraveno pro výplaty',
    verificationNeeded: 'Doporučena verifikace',
    bankAvailable: 'Dostupný ruční a firemní převod',
    trusted: 'Důvěryhodné platby',
    trustedSub: 'Vaše platební metody jsou připravené a chráněné',
    paymentOverview: 'Přehled plateb',
    checkoutReady: 'Checkout připraven',
    walletReady: 'Peněženka připravena',
    fastProtected: 'Rychlé a chráněné',
    sectionActions: 'Rychlé akce',
    manageAll: 'Spravovat všechny metody',
  },
  DE: {
    title: 'Zahlungsmethoden',
    subtitle: 'Verwalte Karten, Wallets und Zahlungsoptionen',
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
    available: 'Verfügbar',
    verified: 'Verifiziert',
    addNew: 'Hinzufügen',
    edit: 'Bearbeiten',
    remove: 'Entfernen',
    setPrimary: 'Als primär setzen',
    connected: 'Verbunden',
    notConnected: 'Nicht verbunden',
    lastUsed: 'Zuletzt verwendet',
    secure: 'Durch MapBook Secure Checkout geschützt',
    instantCheckout: 'Sofort-Checkout bereit',
    payoutReady: 'Bereit für Auszahlungen',
    verificationNeeded: 'Verifizierung empfohlen',
    bankAvailable: 'Manuelle und Business-Überweisung verfügbar',
    trusted: 'Sichere Zahlungen',
    trustedSub: 'Deine Zahlungsmethoden sind bereit und geschützt',
    paymentOverview: 'Zahlungsübersicht',
    checkoutReady: 'Checkout bereit',
    walletReady: 'Wallet bereit',
    fastProtected: 'Schnell und geschützt',
    sectionActions: 'Schnellaktionen',
    manageAll: 'Alle Methoden verwalten',
  },
  PL: {
    title: 'Metody płatności',
    subtitle: 'Zarządzaj kartami, portfelami i opcjami płatności',
    cards: 'Zapisane karty',
    cardsHint: 'Karta główna, bezpieczna płatność i metody rozliczeń',
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
    available: 'Dostępne',
    verified: 'Zweryfikowano',
    addNew: 'Dodaj',
    edit: 'Edytuj',
    remove: 'Usuń',
    setPrimary: 'Ustaw jako główną',
    connected: 'Połączono',
    notConnected: 'Nie połączono',
    lastUsed: 'Ostatnio użyto',
    secure: 'Chronione przez bezpieczną płatność MapBook',
    instantCheckout: 'Gotowe do szybkiej płatności',
    payoutReady: 'Gotowe do wypłat',
    verificationNeeded: 'Zalecana weryfikacja',
    bankAvailable: 'Dostępny przelew ręczny i firmowy',
    trusted: 'Bezpieczne płatności',
    trustedSub: 'Twoje metody płatności są gotowe i chronione',
    paymentOverview: 'Przegląd płatności',
    checkoutReady: 'Checkout gotowy',
    walletReady: 'Portfel gotowy',
    fastProtected: 'Szybko i bezpiecznie',
    sectionActions: 'Szybkie akcje',
    manageAll: 'Zarządzaj wszystkimi metodami',
  },
} as const;

function badgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange' | 'neutral') {
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (kind === 'orange') return { background: '#fff5e8', color: '#d68612' };
  return { background: '#f4efe8', color: '#6d6258' };
}

function sectionCardStyle(): React.CSSProperties {
  return {
    borderRadius: 30,
    border: '1px solid #efe4d7',
    background: '#fff',
    padding: 18,
    boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
  };
}

export default function PaymentsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [payments, setPayments] = useState<PaymentsState>(getPaymentsState());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncPayments = () => {
      setPayments(getPaymentsState());
    };

    syncLanguage();
    syncPayments();

    window.addEventListener('focus', syncLanguage);
    const unsubPayments = subscribeToPaymentsStore(syncPayments);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubPayments();
    };
  }, []);

  const text = useMemo(
    () => paymentTexts[language as keyof typeof paymentTexts] || paymentTexts.EN,
    [language]
  );

  const totalMethods =
    (payments.savedCards?.length || 0) +
    (payments.paypalEmail ? 1 : 0) +
    (payments.applePayEnabled ? 1 : 0) +
    (payments.googlePayEnabled ? 1 : 0) +
    (payments.cryptoWallets?.length || 0) +
    (payments.bankTransferEnabled ? 1 : 0);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#17130f' }}>{text.title}</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            border: '1px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff9f5 100%)',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>{text.trusted}</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.trustedSub}
              </div>
            </div>

            <div
              style={{
                minWidth: 82,
                borderRadius: 20,
                background: '#fff1f7',
                color: '#ff4fa0',
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{totalMethods}</div>
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900 }}>{text.available}</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span
              style={{
                ...badgeStyle('green'),
                borderRadius: 999,
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.secure}
            </span>
            <span
              style={{
                ...badgeStyle('blue'),
                borderRadius: 999,
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.instantCheckout}
            </span>
            <span
              style={{
                ...badgeStyle('orange'),
                borderRadius: 999,
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.fastProtected}
            </span>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              style={{
                height: 52,
                borderRadius: 18,
                border: '1px solid #f1d9e6',
                background: '#fff1f7',
                color: '#ff4fa0',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.addNew}
            </button>

            <button
              type="button"
              style={{
                height: 52,
                borderRadius: 18,
                border: '1px solid #efe4d7',
                background: '#fff',
                color: '#17130f',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.manageAll}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, ...sectionCardStyle() }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>{text.cards}</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.cardsHint}
              </div>
            </div>

            <button
              type="button"
              style={{
                border: 'none',
                borderRadius: 18,
                background: '#fff1f7',
                color: '#ff4fa0',
                minHeight: 48,
                padding: '0 16px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.addNew}
            </button>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {payments.savedCards.map((card, index) => (
              <div
                key={card.id}
                style={{
                  borderRadius: 26,
                  background:
                    index === 0
                      ? 'linear-gradient(180deg, #2f241c 0%, #1f1712 100%)'
                      : '#fff',
                  color: index === 0 ? '#fff' : '#17130f',
                  border: index === 0 ? 'none' : '1px solid #efe4d7',
                  padding: 16,
                  boxShadow:
                    index === 0
                      ? '0 14px 28px rgba(31,23,18,0.18)'
                      : '0 8px 22px rgba(44,23,10,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        opacity: index === 0 ? 0.86 : 1,
                      }}
                    >
                      {card.brand}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 24,
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
                        fontWeight: 700,
                        color: index === 0 ? '#d9cfc2' : '#7b7268',
                      }}
                    >
                      {card.expiry} · {card.holderName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {card.isDefault && (
                      <span
                        style={{
                          ...badgeStyle(index === 0 ? 'green' : 'pink'),
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                          alignSelf: 'flex-end',
                        }}
                      >
                        {text.defaultLabel}
                      </span>
                    )}

                    <span
                      style={{
                        ...badgeStyle(index === 0 ? 'blue' : 'green'),
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                        alignSelf: 'flex-end',
                      }}
                    >
                      {text.verified}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      height: 46,
                      borderRadius: 16,
                      border:
                        index === 0
                          ? '1px solid rgba(255,255,255,0.12)'
                          : '1px solid #efe4d7',
                      background: index === 0 ? 'rgba(255,255,255,0.08)' : '#fcfaf6',
                      color: index === 0 ? '#fff' : '#17130f',
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.edit}
                  </button>

                  <button
                    type="button"
                    style={{
                      height: 46,
                      borderRadius: 16,
                      border:
                        index === 0
                          ? '1px solid rgba(255,255,255,0.12)'
                          : '1px solid #efe4d7',
                      background: index === 0 ? 'rgba(255,255,255,0.08)' : '#fcfaf6',
                      color: index === 0 ? '#fff' : '#17130f',
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.setPrimary}
                  </button>

                  <button
                    type="button"
                    style={{
                      height: 46,
                      borderRadius: 16,
                      border:
                        index === 0
                          ? '1px solid rgba(255,255,255,0.12)'
                          : '1px solid #f2d6d6',
                      background: index === 0 ? 'rgba(255,255,255,0.08)' : '#fff5f5',
                      color: index === 0 ? '#fff' : '#ef4444',
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.remove}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 20,
              background: '#eef9f1',
              padding: '14px 16px',
              fontSize: 14,
              color: '#2f6f46',
              fontWeight: 800,
            }}
          >
            {text.secure}
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <div style={sectionCardStyle()}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>{text.paypal}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.55,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.paypalHint}
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 24,
                background: '#fcfaf6',
                border: '1px solid #efe4d7',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                    {payments.paypalEmail}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: '#7b7268',
                      fontWeight: 700,
                    }}
                  >
                    {text.lastUsed}: PayPal
                  </div>
                </div>

                <span
                  style={{
                    ...badgeStyle('blue'),
                    borderRadius: 999,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text.connected}
                </span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  style={{
                    height: 48,
                    borderRadius: 16,
                    border: '1px solid #efe4d7',
                    background: '#fff',
                    color: '#17130f',
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
                    height: 48,
                    borderRadius: 16,
                    border: '1px solid #efe4d7',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.setPrimary}
                </button>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                {text.mobilePayments}
              </div>
              <span
                style={{
                  ...badgeStyle('green'),
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.instantCheckout}
              </span>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.mobileHint}
            </div>

            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {[
                { name: 'Apple Pay', enabled: payments.applePayEnabled, accent: 'green' as const },
                { name: 'Google Pay', enabled: payments.googlePayEnabled, accent: 'blue' as const },
              ].map((item) => (
                <div
                  key={item.name}
                  style={{
                    borderRadius: 22,
                    border: '1px solid #efe4d7',
                    background: '#fcfaf6',
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                      {item.name}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: '#7b7268',
                        fontWeight: 700,
                      }}
                    >
                      {text.instantCheckout}
                    </div>
                  </div>

                  <span
                    style={{
                      ...badgeStyle(item.enabled ? item.accent : 'neutral'),
                      borderRadius: 999,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.enabled ? text.enabled : text.disabled}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>{text.crypto}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.55,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.cryptoHint}
            </div>

            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {payments.cryptoWallets.map((wallet, index) => (
                <div
                  key={wallet.id}
                  style={{
                    borderRadius: 22,
                    border: '1px solid #efe4d7',
                    background: '#fcfaf6',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'start',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                        {wallet.coin} · {wallet.network}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: '#7b7268',
                          fontWeight: 700,
                          wordBreak: 'break-all',
                        }}
                      >
                        {wallet.address}
                      </div>
                    </div>

                    {wallet.isDefault ? (
                      <span
                        style={{
                          ...badgeStyle('pink'),
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {text.defaultLabel}
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 16,
                        border: '1px solid #efe4d7',
                        background: '#fff',
                        color: '#17130f',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {index === 0 ? text.setPrimary : text.edit}
                    </button>

                    <button
                      type="button"
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 16,
                        border: '1px solid #f2d6d6',
                        background: '#fff5f5',
                        color: '#ef4444',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 12,
                borderRadius: 18,
                background: '#eef4ff',
                padding: '12px 14px',
                fontSize: 13,
                color: '#2f5dc4',
                fontWeight: 800,
              }}
            >
              {text.payoutReady}
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>{text.bank}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  {text.bankHint}
                </div>
              </div>

              <span
                style={{
                  ...badgeStyle(payments.bankTransferEnabled ? 'green' : 'neutral'),
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                {payments.bankTransferEnabled ? text.enabled : text.disabled}
              </span>
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 22,
                background: '#fcfaf6',
                border: '1px solid #efe4d7',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                {text.bankAvailable}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.verificationNeeded}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
