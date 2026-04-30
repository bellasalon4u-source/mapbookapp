'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const BRAND = {
  navy: '#071b46',
  green: '#24c45a',
  blue: '#0e73d8',
  yellow: '#ffd629',
  red: '#ff2456',
  pink: '#ff4f9a',
  border: '#050505',
  muted: '#6c7686',
  bg: '#ffffff',
  softGreen: '#dcffe8',
  softBlue: '#dcecff',
  softOrange: '#fff0da',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
};

type WalletTransaction = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  amount: number;
  status: string;
  createdAt: string;
};

type WalletState = {
  availableBalance: number;
  pendingBalance: number;
  refundCredits: number;
  welcomeBonus: number;
  referralCredits: number;
  transactions: WalletTransaction[];
};

const DEFAULT_WALLET: WalletState = {
  availableBalance: 24,
  pendingBalance: 10,
  refundCredits: 5,
  welcomeBonus: 5,
  referralCredits: 10,
  transactions: [],
};

function readWalletState(): WalletState {
  if (typeof window === 'undefined') return DEFAULT_WALLET;

  try {
    const raw = window.localStorage.getItem('mapbook_wallet_state');
    if (!raw) return DEFAULT_WALLET;

    const parsed = JSON.parse(raw) as Partial<WalletState>;

    return {
      availableBalance:
        typeof parsed.availableBalance === 'number'
          ? parsed.availableBalance
          : DEFAULT_WALLET.availableBalance,
      pendingBalance:
        typeof parsed.pendingBalance === 'number'
          ? parsed.pendingBalance
          : DEFAULT_WALLET.pendingBalance,
      refundCredits:
        typeof parsed.refundCredits === 'number'
          ? parsed.refundCredits
          : DEFAULT_WALLET.refundCredits,
      welcomeBonus:
        typeof parsed.welcomeBonus === 'number'
          ? parsed.welcomeBonus
          : DEFAULT_WALLET.welcomeBonus,
      referralCredits:
        typeof parsed.referralCredits === 'number'
          ? parsed.referralCredits
          : DEFAULT_WALLET.referralCredits,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : DEFAULT_WALLET.transactions,
    };
  } catch {
    return DEFAULT_WALLET;
  }
}

function saveWalletState(nextWallet: WalletState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('mapbook_wallet_state', JSON.stringify(nextWallet));
}

function formatMoney(value: number) {
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function AdminLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 38,
          height: 48,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 10px 22px rgba(14,115,216,0.22)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 31,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon,
  bg,
}: {
  title: string;
  value: string;
  hint: string;
  icon: string;
  bg: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 15,
        minHeight: 124,
        boxShadow: '0 8px 18px rgba(7,27,70,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 900,
          color: BRAND.muted,
        }}
      >
        <span style={{ fontSize: 24 }}>{icon}</span>
        {title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-0.8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: BRAND.muted,
        }}
      >
        {hint}
      </div>
    </div>
  );
}

function ActionButton({
  title,
  hint,
  icon,
  bg,
  onClick,
}: {
  title: string;
  hint: string;
  icon: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 78,
        borderRadius: 22,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 13,
        display: 'grid',
        gridTemplateColumns: '50px minmax(0, 1fr) 22px',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 7px 18px rgba(7,27,70,0.05)',
      }}
    >
      <span
        style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          border: `2px solid ${BRAND.border}`,
          background: bg,
          display: 'grid',
          placeItems: 'center',
          fontSize: 25,
        }}
      >
        {icon}
      </span>

      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 16,
            fontWeight: 900,
            color: BRAND.navy,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>

        <span
          style={{
            display: 'block',
            marginTop: 4,
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hint}
        </span>
      </span>

      <span
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.border,
          lineHeight: 1,
        }}
      >
        ›
      </span>
    </button>
  );
}

export default function AdminWalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletState>(() => readWalletState());
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');

  const stats = useMemo(() => {
    const available = wallet.availableBalance;
    const pending = wallet.pendingBalance;
    const gross = available + pending;
    const platformRevenue = gross * 0.12;
    const qrPayments = wallet.transactions.filter(
      (item) =>
        item.type === 'client_payment' ||
        item.title.toLowerCase().includes('qr') ||
        item.subtitle?.toLowerCase().includes('qr')
    );

    return {
      available,
      pending,
      gross,
      platformRevenue,
      qrPaymentsCount: qrPayments.length,
      qrPaymentsTotal: qrPayments.reduce((sum, item) => sum + Math.max(0, item.amount), 0),
    };
  }, [wallet]);

  const sortedTransactions = useMemo(() => {
    return [...wallet.transactions].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [wallet.transactions]);

  const withdraw = () => {
    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage('Введите правильную сумму для вывода.');
      return;
    }

    if (amount > wallet.availableBalance) {
      setMessage('Недостаточно средств на доступном балансе.');
      return;
    }

    const transaction: WalletTransaction = {
      id: `tx_admin_withdraw_${Date.now()}`,
      type: 'withdrawal',
      title: 'Вывод средств владельцем',
      subtitle: 'Admin wallet',
      amount: -amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const nextWallet: WalletState = {
      ...wallet,
      availableBalance: wallet.availableBalance - amount,
      transactions: [transaction, ...wallet.transactions],
    };

    saveWalletState(nextWallet);
    setWallet(nextWallet);
    setWithdrawAmount('');
    setMessage('Вывод создан и записан в историю операций.');
  };

  const addTestQrPayment = () => {
    const amount = 25;

    const transaction: WalletTransaction = {
      id: `tx_admin_qr_test_${Date.now()}`,
      type: 'client_payment',
      title: 'Тестовый QR-платёж',
      subtitle: 'Admin wallet test',
      amount,
      status: 'credited',
      createdAt: new Date().toISOString(),
    };

    const nextWallet: WalletState = {
      ...wallet,
      availableBalance: wallet.availableBalance + amount,
      transactions: [transaction, ...wallet.transactions],
    };

    saveWalletState(nextWallet);
    setWallet(nextWallet);
    setMessage('Тестовый QR-платёж £25 добавлен на баланс.');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        fontFamily: 'Arial, sans-serif',
        padding: '18px 14px 120px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
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
            onClick={() => router.push('/admin')}
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
            <AdminLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 20 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.4px',
            }}
          >
            Кошелёк владельца
          </h1>

          <p
            style={{
              margin: '9px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            Деньги платформы, QR-платежи, вывод средств и история операций.
          </p>
        </section>

        <section
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <MetricCard
            title="Доступно"
            value={formatMoney(stats.available)}
            hint="Деньги на балансе сайта"
            icon="💼"
            bg={BRAND.softOrange}
          />

          <MetricCard
            title="В ожидании"
            value={formatMoney(stats.pending)}
            hint="Платежи ожидают подтверждения"
            icon="⏳"
            bg={BRAND.softBlue}
          />

          <MetricCard
            title="Оборот"
            value={formatMoney(stats.gross)}
            hint="Доступно + в ожидании"
            icon="📊"
            bg={BRAND.softGreen}
          />

          <MetricCard
            title="Доход"
            value={formatMoney(stats.platformRevenue)}
            hint="Примерный доход платформы"
            icon="👑"
            bg={BRAND.softPink}
          />
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 23,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            QR-платежи
          </h2>

          <div
            style={{
              marginTop: 13,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                Количество QR
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {stats.qrPaymentsCount}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.softGreen,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                Сумма QR
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {formatMoney(stats.qrPaymentsTotal)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gap: 10,
            }}
          >
            <ActionButton
              title="Создать тестовый QR-платёж"
              hint="Добавит £25 на баланс для проверки"
              icon="▦"
              bg={BRAND.softGreen}
              onClick={addTestQrPayment}
            />

            <ActionButton
              title="Вернуться к QR на карте"
              hint="Открыть главную и создать QR-платёж"
              icon="🗺️"
              bg={BRAND.softBlue}
              onClick={() => router.push('/')}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 23,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            Вывод средств
          </h2>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            В реальном приложении вывод будет идти через Stripe Connect / банковский payout.
            Сейчас это рабочий прототип для учёта баланса.
          </p>

          <div
            style={{
              marginTop: 13,
              display: 'grid',
              gridTemplateColumns: '1fr 120px',
              gap: 10,
            }}
          >
            <input
              type="number"
              inputMode="decimal"
              value={withdrawAmount}
              onChange={(event) => {
                setWithdrawAmount(event.target.value);
                setMessage('');
              }}
              placeholder="100"
              style={{
                minHeight: 54,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
                color: BRAND.navy,
                outline: 'none',
                minWidth: 0,
              }}
            />

            <button
              type="button"
              onClick={withdraw}
              style={{
                minHeight: 54,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              }}
            >
              Вывести
            </button>
          </div>

          {message ? (
            <div
              style={{
                marginTop: 12,
                borderRadius: 18,
                border: `2px solid ${BRAND.border}`,
                background: message.includes('Недостаточно') || message.includes('Введите')
                  ? BRAND.softPink
                  : BRAND.softGreen,
                color: message.includes('Недостаточно') || message.includes('Введите')
                  ? BRAND.red
                  : '#008f3a',
                padding: 11,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              {message}
            </div>
          ) : null}
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 23,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            История операций
          </h2>

          <div
            style={{
              marginTop: 13,
              display: 'grid',
              gap: 10,
            }}
          >
            {sortedTransactions.length > 0 ? (
              sortedTransactions.slice(0, 12).map((item) => {
                const positive = item.amount >= 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 20,
                      border: `2px solid ${BRAND.border}`,
                      background: positive ? '#f6fff8' : '#fff8f0',
                      padding: 12,
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
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
                        {item.title}
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
                        {item.subtitle || item.type} • {formatDate(item.createdAt)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: positive ? '#008f3a' : BRAND.red,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {positive ? '+' : '-'}
                      {formatMoney(Math.abs(item.amount))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  borderRadius: 20,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.softBlue,
                  padding: 14,
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.navy,
                }}
              >
                История пока пустая. Когда появятся QR-платежи, пополнения или выводы,
                они будут отображаться здесь.
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 22,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softOrange,
            padding: 13,
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 800,
            color: BRAND.navy,
          }}
        >
          Важно: это front-end прототип. Для настоящих денег нужно подключить backend,
          роли администратора, Stripe/Supabase permissions и серверную проверку каждого платежа.
        </section>
      </div>
    </main>
  );
}
