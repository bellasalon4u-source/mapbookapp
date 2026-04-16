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
  type WalletTransaction,
} from '../../services/walletStore';

const balanceTexts = {
  EN: {
    title: 'MapBook Balance',
    subtitle: 'Wallet, rewards, refunds and transaction history',
    available: 'Available',
    pending: 'Pending',
    refunds: 'Refunds',
    topUp: 'Top up',
    payWithBalance: 'Pay',
    withdraw: 'Withdraw',
    howItWorksText:
      'Top up your balance to pay quickly for unlocks and bookings. Refunds return back to your balance automatically.',
    recent: 'Recent transactions',
    all: 'All',
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    waiting: 'Pending',
    paymentMethods: 'Payment methods',
    paymentMethodsSub: 'Cards, PayPal and crypto wallets',
    instantWallet: 'Fast wallet payments',
    secureWallet: 'Secure checkout',
    walletReady: 'Wallet ready',
    walletOverview: 'Wallet overview',
    rewardsReady: 'Rewards ready',
    totalActivity: 'Total activity',
    protected: 'Protected',
    quickActions: 'Quick actions',
    balanceCardHint: 'Available for payments and bookings',
  },
  ES: {
    title: 'Saldo MapBook',
    subtitle: 'Billetera, recompensas, reembolsos e historial',
    available: 'Disponible',
    pending: 'Pendiente',
    refunds: 'Reembolsos',
    topUp: 'Recargar',
    payWithBalance: 'Pagar',
    withdraw: 'Retirar',
    howItWorksText:
      'Recarga tu saldo para pagar rápidamente desbloqueos y reservas. Los reembolsos vuelven automáticamente a tu saldo.',
    recent: 'Transacciones recientes',
    all: 'Todo',
    incoming: 'Entradas',
    outgoing: 'Salidas',
    waiting: 'Pendientes',
    paymentMethods: 'Métodos de pago',
    paymentMethodsSub: 'Tarjetas, PayPal y billeteras cripto',
    instantWallet: 'Pagos rápidos',
    secureWallet: 'Pago seguro',
    walletReady: 'Billetera lista',
    walletOverview: 'Resumen de billetera',
    rewardsReady: 'Recompensas listas',
    totalActivity: 'Actividad total',
    protected: 'Protegido',
    quickActions: 'Acciones rápidas',
    balanceCardHint: 'Disponible para pagos y reservas',
  },
  RU: {
    title: 'Баланс MapBook',
    subtitle: 'Кошелёк, бонусы, возвраты и история операций',
    available: 'Доступно',
    pending: 'В ожидании',
    refunds: 'Возвраты',
    topUp: 'Пополнить',
    payWithBalance: 'Оплатить',
    withdraw: 'Вывести',
    howItWorksText:
      'Пополняйте баланс для быстрой оплаты unlock и бронирований. Возвраты автоматически возвращаются обратно на баланс.',
    recent: 'Последние операции',
    all: 'Все',
    incoming: 'Поступления',
    outgoing: 'Списания',
    waiting: 'Ожидают',
    paymentMethods: 'Способы оплаты',
    paymentMethodsSub: 'Карты, PayPal и криптокошельки',
    instantWallet: 'Быстрые оплаты',
    secureWallet: 'Безопасная оплата',
    walletReady: 'Кошелёк готов',
    walletOverview: 'Обзор кошелька',
    rewardsReady: 'Бонусы готовы',
    totalActivity: 'Общая активность',
    protected: 'Защищено',
    quickActions: 'Быстрые действия',
    balanceCardHint: 'Доступно для оплат и бронирований',
  },
  CZ: {
    title: 'Zůstatek MapBook',
    subtitle: 'Peněženka, bonusy, refundy a historie transakcí',
    available: 'Dostupné',
    pending: 'Čeká',
    refunds: 'Refundy',
    topUp: 'Dobít',
    payWithBalance: 'Zaplatit',
    withdraw: 'Vybrat',
    howItWorksText:
      'Dobijte si zůstatek pro rychlé placení unlocků a rezervací. Refundy se automaticky vrací zpět na zůstatek.',
    recent: 'Poslední transakce',
    all: 'Vše',
    incoming: 'Příchozí',
    outgoing: 'Odchozí',
    waiting: 'Čekající',
    paymentMethods: 'Platební metody',
    paymentMethodsSub: 'Karty, PayPal a crypto peněženky',
    instantWallet: 'Rychlé platby',
    secureWallet: 'Bezpečná platba',
    walletReady: 'Peněženka připravena',
    walletOverview: 'Přehled peněženky',
    rewardsReady: 'Bonusy připraveny',
    totalActivity: 'Celková aktivita',
    protected: 'Chráněno',
    quickActions: 'Rychlé akce',
    balanceCardHint: 'Dostupné pro platby a rezervace',
  },
  DE: {
    title: 'MapBook Guthaben',
    subtitle: 'Wallet, Boni, Rückerstattungen und Verlauf',
    available: 'Verfügbar',
    pending: 'Ausstehend',
    refunds: 'Rückerstattungen',
    topUp: 'Aufladen',
    payWithBalance: 'Bezahlen',
    withdraw: 'Auszahlen',
    howItWorksText:
      'Lade dein Guthaben auf, um Unlocks und Buchungen schnell zu bezahlen. Rückerstattungen kommen automatisch zurück auf dein Guthaben.',
    recent: 'Letzte Transaktionen',
    all: 'Alle',
    incoming: 'Eingänge',
    outgoing: 'Ausgänge',
    waiting: 'Ausstehend',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsSub: 'Karten, PayPal und Krypto-Wallets',
    instantWallet: 'Schnelle Zahlungen',
    secureWallet: 'Sicherer Checkout',
    walletReady: 'Wallet bereit',
    walletOverview: 'Wallet-Übersicht',
    rewardsReady: 'Boni bereit',
    totalActivity: 'Gesamtaktivität',
    protected: 'Geschützt',
    quickActions: 'Schnellaktionen',
    balanceCardHint: 'Verfügbar für Zahlungen und Buchungen',
  },
  PL: {
    title: 'Saldo MapBook',
    subtitle: 'Portfel, bonusy, zwroty i historia operacji',
    available: 'Dostępne',
    pending: 'Oczekujące',
    refunds: 'Zwroty',
    topUp: 'Doładuj',
    payWithBalance: 'Zapłać',
    withdraw: 'Wypłać',
    howItWorksText:
      'Doładuj saldo, aby szybko opłacać unlocki i rezerwacje. Zwroty automatycznie wracają na saldo.',
    recent: 'Ostatnie operacje',
    all: 'Wszystkie',
    incoming: 'Wpływy',
    outgoing: 'Wydatki',
    waiting: 'Oczekujące',
    paymentMethods: 'Metody płatności',
    paymentMethodsSub: 'Karty, PayPal i portfele krypto',
    instantWallet: 'Szybkie płatności',
    secureWallet: 'Bezpieczna płatność',
    walletReady: 'Portfel gotowy',
    walletOverview: 'Przegląd portfela',
    rewardsReady: 'Bonusy gotowe',
    totalActivity: 'Całkowita aktywność',
    protected: 'Chronione',
    quickActions: 'Szybkie akcje',
    balanceCardHint: 'Dostępne do płatności i rezerwacji',
  },
} as const;

type FilterKey = 'all' | 'incoming' | 'outgoing' | 'pending';

function formatMoney(value: number) {
  return `£${Math.abs(value).toFixed(2)}`;
}

function formatSignedMoney(value: number) {
  return `${value >= 0 ? '+' : '-'} ${formatMoney(value)}`;
}

function getStatusStyle(tx: WalletTransaction) {
  if (tx.status === 'pending') {
    return { background: '#fff4db', color: '#b7791f' };
  }
  if (tx.status === 'credited') {
    return { background: '#ecfdf3', color: '#15803d' };
  }
  if (tx.status === 'failed') {
    return { background: '#fff1f2', color: '#dc2626' };
  }
  return { background: '#f3f4f6', color: '#374151' };
}

function getAmountColor(amount: number) {
  return amount >= 0 ? '#15803d' : '#17130f';
}

function getTransactionIcon(tx: WalletTransaction) {
  if (tx.amount > 0) {
    return { icon: '↘', bg: '#ecfdf3', color: '#15803d' };
  }
  if (tx.status === 'pending') {
    return { icon: '⏳', bg: '#fff4db', color: '#b7791f' };
  }
  if (tx.status === 'failed') {
    return { icon: '✕', bg: '#fff1f2', color: '#dc2626' };
  }
  return { icon: '↗', bg: '#eef4ff', color: '#2563eb' };
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function BalancePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncWallet = () => {
      setWallet(getWalletState());
    };

    syncLanguage();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    const unsubWallet = subscribeToWalletStore(syncWallet);

    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubLanguage();
      unsubWallet();
    };
  }, []);

  const text = useMemo(
    () => balanceTexts[language as keyof typeof balanceTexts] || balanceTexts.EN,
    [language]
  );

  const filteredTransactions = useMemo(() => {
    const items = wallet.transactions || [];

    if (filter === 'incoming') {
      return items.filter((item) => item.amount > 0);
    }

    if (filter === 'outgoing') {
      return items.filter((item) => item.amount < 0);
    }

    if (filter === 'pending') {
      return items.filter((item) => item.status === 'pending');
    }

    return items;
  }, [filter, wallet.transactions]);

  const totalActivity = useMemo(() => {
    return (wallet.transactions || []).reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }, [wallet.transactions]);

  const summaryCards = [
    {
      label: text.available,
      value: `£${wallet.availableBalance.toFixed(2)}`,
      bg: '#ffffff',
      color: '#17130f',
    },
    {
      label: text.pending,
      value: `£${wallet.pendingBalance.toFixed(2)}`,
      bg: '#eef4ff',
      color: '#2563eb',
    },
    {
      label: text.refunds,
      value: `£${wallet.refundCredits.toFixed(2)}`,
      bg: '#ecfdf3',
      color: '#15803d',
    },
    {
      label: text.totalActivity,
      value: `£${totalActivity.toFixed(2)}`,
      bg: '#fff4db',
      color: '#b7791f',
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '20px 16px 120px',
        fontFamily: 'Arial, sans-serif',
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
              border: '2px solid #111111',
              background: '#fff',
              color: '#17130f',
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {text.title}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/payments')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              color: '#17130f',
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
        </div>

        <section style={{ marginTop: 18 }}>
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
                borderRadius: 26,
                border: '2px solid #111111',
                background: '#2f241c',
                color: '#fff',
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#d9cdbd',
                }}
              >
                {text.available}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 40,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                £{wallet.availableBalance.toFixed(2)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: '#e7ddd1',
                  fontWeight: 700,
                }}
              >
                {text.balanceCardHint}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 38,
                  padding: '0 12px',
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#17130f',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span>⚡</span>
                <span>{text.walletReady}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {summaryCards.map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: item.bg,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#7b7268',
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 24,
                      fontWeight: 900,
                      color: item.color,
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 16,
            }}
          >
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
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              <button
                type="button"
                style={{
                  border: '2px solid #111111',
                  borderRadius: 24,
                  padding: 14,
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
                    background: '#fff0f6',
                    color: '#ff4fa0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    margin: '0 auto',
                  }}
                >
                  +
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.2,
                  }}
                >
                  {text.topUp}
                </div>
              </button>

              <button
                type="button"
                style={{
                  border: '2px solid #111111',
                  borderRadius: 24,
                  padding: 14,
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
                    background: '#eef4ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    margin: '0 auto',
                  }}
                >
                  💳
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.2,
                  }}
                >
                  {text.payWithBalance}
                </div>
              </button>

              <button
                type="button"
                style={{
                  border: '2px solid #111111',
                  borderRadius: 24,
                  padding: 14,
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
                    background: '#ecfdf3',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    margin: '0 auto',
                  }}
                >
                  ↗
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.2,
                  }}
                >
                  {text.withdraw}
                </div>
              </button>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
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
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.walletOverview}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.6,
                color: '#756b62',
                fontWeight: 700,
              }}
            >
              {text.howItWorksText}
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  padding: '10px 12px',
                  background: '#ecfdf3',
                  color: '#15803d',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.instantWallet}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  padding: '10px 12px',
                  background: '#eef4ff',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.secureWallet}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  padding: '10px 12px',
                  background: '#fff4db',
                  color: '#b7791f',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.rewardsReady}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  padding: '10px 12px',
                  background: '#fff0f6',
                  color: '#ff4fa0',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.protected}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.recent}
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 2,
            }}
          >
            {[
              { key: 'all' as FilterKey, label: text.all },
              { key: 'incoming' as FilterKey, label: text.incoming },
              { key: 'outgoing' as FilterKey, label: text.outgoing },
              { key: 'pending' as FilterKey, label: text.waiting },
            ].map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  style={{
                    border: '2px solid #111111',
                    borderRadius: 999,
                    padding: '11px 16px',
                    background: active ? '#17130f' : '#fff',
                    color: active ? '#fff' : '#17130f',
                    fontSize: 14,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gap: 12,
            }}
          >
            {filteredTransactions.map((tx) => {
              const statusStyle = getStatusStyle(tx);
              const txIcon = getTransactionIcon(tx);

              return (
                <div
                  key={tx.id}
                  style={{
                    borderRadius: 28,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '46px 1fr auto',
                      gap: 14,
                      alignItems: 'start',
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 16,
                        border: '2px solid #111111',
                        background: txIcon.bg,
                        color: txIcon.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 900,
                      }}
                    >
                      {txIcon.icon}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#17130f',
                          lineHeight: 1.25,
                        }}
                      >
                        {tx.title}
                      </div>

                      {tx.subtitle ? (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 14,
                            lineHeight: 1.5,
                            color: '#756b62',
                            fontWeight: 700,
                          }}
                        >
                          {tx.subtitle}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#8a7d70',
                          fontWeight: 700,
                        }}
                      >
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: getAmountColor(tx.amount),
                          lineHeight: 1.1,
                        }}
                      >
                        {formatSignedMoney(tx.amount)}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <span
                          style={{
                            borderRadius: 999,
                            border: '2px solid #111111',
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 900,
                            display: 'inline-block',
                            ...statusStyle,
                          }}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={() => router.push('/profile/payments')}
            style={{
              width: '100%',
              border: '2px solid #111111',
              borderRadius: 30,
              background: '#fff',
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  border: '2px solid #111111',
                  background: '#eef4ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                💼
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.paymentMethods}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  {text.paymentMethodsSub}
                </div>
              </div>

              <span
                style={{
                  fontSize: 20,
                  color: '#17130f',
                  fontWeight: 900,
                }}
              >
                ›
              </span>
            </div>
          </button>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
