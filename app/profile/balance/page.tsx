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
    available: 'Available',
    pending: 'Pending confirmation',
    refunds: 'Refund credits',
    topUp: 'Top up',
    payWithBalance: 'Pay with balance',
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
  },
  ES: {
    title: 'Saldo MapBook',
    available: 'Disponible',
    pending: 'Pendiente de confirmación',
    refunds: 'Créditos de reembolso',
    topUp: 'Recargar',
    payWithBalance: 'Pagar con saldo',
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
  },
  RU: {
    title: 'Баланс MapBook',
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
  },
  CZ: {
    title: 'Zůstatek MapBook',
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
  },
  DE: {
    title: 'MapBook Guthaben',
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
  },
  PL: {
    title: 'Saldo MapBook',
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
  },
} as const;

type FilterKey = 'all' | 'incoming' | 'outgoing' | 'pending';

function formatMoney(value: number) {
  return `£${Math.abs(value).toFixed(2)}`;
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

  const getStatusStyle = (tx: WalletTransaction) => {
    if (tx.status === 'pending') {
      return 'bg-[#fff1df] text-[#c67610]';
    }

    if (tx.status === 'credited') {
      return 'bg-[#e8f5ea] text-[#2d8a55]';
    }

    if (tx.status === 'failed') {
      return 'bg-[#fdeaea] text-[#c94d4d]';
    }

    return 'bg-[#f2ede7] text-[#5c5046]';
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-[#2d8a55]' : 'text-[#1d1712]';
  };

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </button>

          <h1 className="text-xl font-bold text-[#1d1712]">{text.title}</h1>

          <button
            type="button"
            onClick={() => router.push('/profile/payments')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ⚙️
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] bg-[#2f241c] p-5 text-white shadow-sm">
          <div className="text-sm text-[#dacdbf]">{text.available}</div>
          <div className="mt-2 text-5xl font-extrabold">£{wallet.availableBalance.toFixed(2)}</div>

          <div className="mt-5 rounded-[22px] border border-[#4d3f34] bg-[#34281f] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#d9cdbd]">{text.pending}</span>
              <span className="font-bold">£{wallet.pendingBalance.toFixed(2)}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-[#d9cdbd]">{text.refunds}</span>
              <span className="font-bold">£{wallet.refundCredits.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <button
            type="button"
            className="rounded-[24px] bg-white px-3 py-4 text-center shadow-sm"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5eee4] text-2xl">
              +
            </div>
            <div className="mt-3 text-sm font-bold text-[#1d1712]">{text.topUp}</div>
          </button>

          <button
            type="button"
            className="rounded-[24px] bg-white px-3 py-4 text-center shadow-sm"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5eee4] text-xl">
              💳
            </div>
            <div className="mt-3 text-sm font-bold text-[#1d1712]">{text.payWithBalance}</div>
          </button>

          <button
            type="button"
            className="rounded-[24px] bg-white px-3 py-4 text-center shadow-sm"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5eee4] text-xl">
              ↗
            </div>
            <div className="mt-3 text-sm font-bold text-[#1d1712]">{text.withdraw}</div>
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.howItWorks}</div>
          <p className="mt-2 text-sm leading-6 text-[#6f6458]">{text.howItWorksText}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#1d1712]">{text.recent}</h2>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === 'all'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.all}
          </button>

          <button
            type="button"
            onClick={() => setFilter('incoming')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === 'incoming'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.incoming}
          </button>

          <button
            type="button"
            onClick={() => setFilter('outgoing')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === 'outgoing'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.outgoing}
          </button>

          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === 'pending'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.waiting}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-extrabold text-[#1d1712]">{tx.title}</div>
                  {tx.subtitle && (
                    <div className="mt-1 text-sm text-[#6f6458]">{tx.subtitle}</div>
                  )}
                  <div className="mt-2 text-xs text-[#8a7d70]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-base font-extrabold ${getAmountColor(tx.amount)}`}>
                    {tx.amount >= 0 ? '+' : '-'} {formatMoney(tx.amount)}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(tx)}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/profile/payments')}
          className="mt-6 w-full rounded-[28px] border border-[#efe4d7] bg-white px-5 py-4 text-left shadow-sm"
        >
          <div className="text-sm font-extrabold text-[#1d1712]">{text.paymentMethods}</div>
          <div className="mt-1 text-xs leading-5 text-[#7a7065]">{text.paymentMethodsSub}</div>
        </button>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
