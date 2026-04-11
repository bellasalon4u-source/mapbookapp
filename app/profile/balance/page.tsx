'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
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
    pending: 'Pending confirmation',
    refunds: 'Refund credits',
    topUp: 'Top up',
    payWithBalance: 'Pay balance',
    withdraw: 'Withdraw',
    howItWorks: 'How it works',
    howItWorksText:
      'Top up your balance to pay quickly for unlocks and bookings. Refunds come back to your balance.',
    recent: 'Recent transactions',
    all: 'All',
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    waiting: 'Pending',
    paymentMethods: 'Payment methods',
    paymentMethodsSub: 'Manage cards, PayPal and crypto wallets',
    instantWallet: 'Fast wallet payments',
    secureWallet: 'Protected by secure checkout',
    walletReady: 'Ready to use',
  },
  ES: {
    title: 'Saldo MapBook',
    subtitle: 'Billetera, recompensas, reembolsos e historial',
    available: 'Disponible',
    pending: 'Pendiente de confirmación',
    refunds: 'Créditos de reembolso',
    topUp: 'Recargar',
    payWithBalance: 'Pagar saldo',
    withdraw: 'Retirar',
    howItWorks: 'Cómo funciona',
    howItWorksText:
      'Recarga tu saldo para pagar rápidamente desbloqueos y reservas. Los reembolsos vuelven a tu saldo.',
    recent: 'Transacciones recientes',
    all: 'Todo',
    incoming: 'Entradas',
    outgoing: 'Salidas',
    waiting: 'Pendientes',
    paymentMethods: 'Métodos de pago',
    paymentMethodsSub: 'Gestiona tarjetas, PayPal y billeteras cripto',
    instantWallet: 'Pagos rápidos con saldo',
    secureWallet: 'Protegido por pago seguro',
    walletReady: 'Listo para usar',
  },
  RU: {
    title: 'Баланс MapBook',
    subtitle: 'Кошелёк, бонусы, возвраты и история операций',
    available: 'Доступно',
    pending: 'Ожидает подтверждения',
    refunds: 'Кредиты на возвраты',
    topUp: 'Пополнить',
    payWithBalance: 'Оплатить балансом',
    withdraw: 'Вывести',
    howItWorks: 'Как это работает',
    howItWorksText:
      'Пополняйте баланс, чтобы быстро оплачивать unlock и бронирования. Возвраты приходят обратно на баланс.',
    recent: 'Последние операции',
    all: 'Все',
    incoming: 'Поступления',
    outgoing: 'Списания',
    waiting: 'Ожидают',
    paymentMethods: 'Способы оплаты',
    paymentMethodsSub: 'Управляйте картами, PayPal и криптокошельками',
    instantWallet: 'Быстрые оплаты с баланса',
    secureWallet: 'Защищено безопасной оплатой',
    walletReady: 'Готово к использованию',
  },
  CZ: {
    title: 'Zůstatek MapBook',
    subtitle: 'Peněženka, bonusy, refundy a historie transakcí',
    available: 'Dostupné',
    pending: 'Čeká na potvrzení',
    refunds: 'Kredity na vrácení',
    topUp: 'Dobít',
    payWithBalance: 'Zaplatit zůstatkem',
    withdraw: 'Vybrat',
    howItWorks: 'Jak to funguje',
    howItWorksText:
      'Dobijte si zůstatek pro rychlé placení unlocků a rezervací. Refundy se vrací zpět na zůstatek.',
    recent: 'Poslední transakce',
    all: 'Vše',
    incoming: 'Příchozí',
    outgoing: 'Odchozí',
    waiting: 'Čekající',
    paymentMethods: 'Platební metody',
    paymentMethodsSub: 'Spravujte karty, PayPal a crypto peněženky',
    instantWallet: 'Rychlé platby ze zůstatku',
    secureWallet: 'Chráněno bezpečnou platbou',
    walletReady: 'Připraveno k použití',
  },
  DE: {
    title: 'MapBook Guthaben',
    subtitle: 'Wallet, Boni, Rückerstattungen und Verlauf',
    available: 'Verfügbar',
    pending: 'Wartet auf Bestätigung',
    refunds: 'Rückerstattungsguthaben',
    topUp: 'Aufladen',
    payWithBalance: 'Mit Guthaben zahlen',
    withdraw: 'Auszahlen',
    howItWorks: 'So funktioniert es',
    howItWorksText:
      'Lade dein Guthaben auf, um Unlocks und Buchungen schnell zu bezahlen. Rückerstattungen kommen zurück auf dein Guthaben.',
    recent: 'Letzte Transaktionen',
    all: 'Alle',
    incoming: 'Eingänge',
    outgoing: 'Ausgänge',
    waiting: 'Ausstehend',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsSub: 'Verwalte Karten, PayPal und Krypto-Wallets',
    instantWallet: 'Schnelle Wallet-Zahlungen',
    secureWallet: 'Durch sicheren Checkout geschützt',
    walletReady: 'Bereit zur Nutzung',
  },
  PL: {
    title: 'Saldo MapBook',
    subtitle: 'Portfel, bonusy, zwroty i historia operacji',
    available: 'Dostępne',
    pending: 'Oczekuje na potwierdzenie',
    refunds: 'Kredyty zwrotne',
    topUp: 'Doładuj',
    payWithBalance: 'Zapłać saldem',
    withdraw: 'Wypłać',
    howItWorks: 'Jak to działa',
    howItWorksText:
      'Doładuj saldo, aby szybko opłacać unlocki i rezerwacje. Zwroty wracają na saldo.',
    recent: 'Ostatnie operacje',
    all: 'Wszystkie',
    incoming: 'Wpływy',
    outgoing: 'Wydatki',
    waiting: 'Oczekujące',
    paymentMethods: 'Metody płatności',
    paymentMethodsSub: 'Zarządzaj kartami, PayPal i portfelami krypto',
    instantWallet: 'Szybkie płatności z salda',
    secureWallet: 'Chronione bezpieczną płatnością',
    walletReady: 'Gotowe do użycia',
  },
} as const;

type FilterKey = 'all' | 'incoming' | 'outgoing' | 'pending';

function formatMoney(value: number) {
  return `£${Math.abs(value).toFixed(2)}`;
}

function getStatusStyle(tx: WalletTransaction) {
  if (tx.status === 'pending') {
    return {
      background: '#fff5e8',
      color: '#d68612',
    };
  }

  if (tx.status === 'credited') {
    return {
      background: '#eef9f1',
      color: '#2fa35a',
    };
  }

  if (tx.status === 'failed') {
    return {
      background: '#fff1f1',
      color: '#ef4444',
    };
  }

  return {
    background: '#f4efe8',
    color: '#5c5046',
  };
}

function getAmountColor(amount: number) {
  return amount >= 0 ? '#2fa35a' : '#17130f';
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

    window.addEventListener('focus', syncLanguage);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    return () => {
      window.removeEventListener('focus', syncLanguage);
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
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
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
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 22,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 32,
            background: 'linear-gradient(180deg, #2f241c 0%, #1f1712 100%)',
            padding: 20,
            color: '#fff',
            boxShadow: '0 14px 28px rgba(31,23,18,0.18)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: '#dacdbf',
              fontWeight: 800,
            }}
          >
            {text.available}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 48,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            £{wallet.availableBalance.toFixed(2)}
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 900,
              color: '#f6ede4',
            }}
          >
            <span>⚡</span>
            <span>{text.walletReady}</span>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.3,
                  color: '#d9cdbd',
                  fontWeight: 800,
                }}
              >
                {text.pending}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                £{wallet.pendingBalance.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.3,
                  color: '#d9cdbd',
                  fontWeight: 800,
                }}
              >
                {text.refunds}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                £{wallet.refundCredits.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          <button
            type="button"
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 26,
              padding: 14,
              background: '#fff',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.04)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                background: '#fff1f7',
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
              }}
            >
              {text.topUp}
            </div>
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 26,
              padding: 14,
              background: '#fff',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.04)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                background: '#eef4ff',
                color: '#2f7cf6',
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
              }}
            >
              {text.payWithBalance}
            </div>
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 26,
              padding: 14,
              background: '#fff',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.04)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                background: '#eef9f1',
                color: '#2fa35a',
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
              }}
            >
              {text.withdraw}
            </div>
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.howItWorks}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.7,
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
                padding: '10px 12px',
                background: '#eef9f1',
                color: '#2fa35a',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.instantWallet}
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '10px 12px',
                background: '#eef4ff',
                color: '#2f7cf6',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.secureWallet}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.recent}
          </div>
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
                  border: active ? 'none' : '1px solid #efe4d7',
                  borderRadius: 999,
                  padding: '12px 16px',
                  background: active ? '#ff4fa0' : '#fff',
                  color: active ? '#fff' : '#3a2d24',
                  fontSize: 14,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: active ? '0 10px 20px rgba(255,79,160,0.18)' : 'none',
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

            return (
              <div
                key={tx.id}
                style={{
                  borderRadius: 28,
                  border: '1px solid #efe4d7',
                  background: '#fff',
                  padding: 16,
                  boxShadow: '0 10px 24px rgba(44, 23, 10, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: '#17130f',
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
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: getAmountColor(tx.amount),
                      }}
                    >
                      {tx.amount >= 0 ? '+' : '-'} {formatMoney(tx.amount)}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <span
                        style={{
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 900,
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

        <button
          type="button"
          onClick={() => router.push('/profile/payments')}
          style={{
            marginTop: 18,
            width: '100%',
            border: '1px solid #efe4d7',
            borderRadius: 30,
            background: '#fff',
            padding: '18px 18px',
            textAlign: 'left',
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
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
                background: '#eef4ff',
                color: '#2f7cf6',
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
                color: '#938475',
                fontWeight: 900,
              }}
            >
              ›
            </span>
          </div>
        </button>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
