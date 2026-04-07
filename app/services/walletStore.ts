export type WalletTransactionType =
  | 'welcome_bonus'
  | 'referral_bonus'
  | 'booking_unlock'
  | 'booking_deposit'
  | 'refund'
  | 'top_up'
  | 'withdrawal'
  | 'client_payment';

export type WalletTransactionStatus =
  | 'completed'
  | 'pending'
  | 'credited'
  | 'failed';

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  title: string;
  subtitle?: string;
  amount: number;
  status: WalletTransactionStatus;
  createdAt: string;
};

export type WalletState = {
  availableBalance: number;
  pendingBalance: number;
  refundCredits: number;
  welcomeBonus: number;
  referralCredits: number;
  transactions: WalletTransaction[];
};

const STORAGE_KEY = 'mapbook_wallet_state';

const defaultWalletState: WalletState = {
  availableBalance: 24,
  pendingBalance: 10,
  refundCredits: 5,
  welcomeBonus: 5,
  referralCredits: 10,
  transactions: [
    {
      id: 'tx_1',
      type: 'booking_unlock',
      title: 'Разблокировка профиля',
      subtitle: 'MapBook',
      amount: -5,
      status: 'completed',
      createdAt: '2026-04-12T14:32:00.000Z',
    },
    {
      id: 'tx_2',
      type: 'refund',
      title: 'Возврат средств',
      subtitle: 'Отмена бронирования',
      amount: 5,
      status: 'credited',
      createdAt: '2026-04-12T10:15:00.000Z',
    },
    {
      id: 'tx_3',
      type: 'booking_deposit',
      title: 'Депозит за бронирование',
      subtitle: 'Массаж, 15 мая в 16:00',
      amount: -15,
      status: 'completed',
      createdAt: '2026-04-11T18:20:00.000Z',
    },
    {
      id: 'tx_4',
      type: 'client_payment',
      title: 'Платёж от клиента',
      subtitle: 'Услуга выполнена',
      amount: 40,
      status: 'credited',
      createdAt: '2026-04-10T12:45:00.000Z',
    },
    {
      id: 'tx_5',
      type: 'withdrawal',
      title: 'Вывод средств',
      subtitle: 'На карту •••• 4242',
      amount: -30,
      status: 'completed',
      createdAt: '2026-04-08T09:30:00.000Z',
    },
  ],
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadWalletState(): WalletState {
  if (!isBrowser()) return defaultWalletState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWalletState;

    const parsed = JSON.parse(raw) as WalletState;

    return {
      availableBalance:
        typeof parsed.availableBalance === 'number'
          ? parsed.availableBalance
          : defaultWalletState.availableBalance,
      pendingBalance:
        typeof parsed.pendingBalance === 'number'
          ? parsed.pendingBalance
          : defaultWalletState.pendingBalance,
      refundCredits:
        typeof parsed.refundCredits === 'number'
          ? parsed.refundCredits
          : defaultWalletState.refundCredits,
      welcomeBonus:
        typeof parsed.welcomeBonus === 'number'
          ? parsed.welcomeBonus
          : defaultWalletState.welcomeBonus,
      referralCredits:
        typeof parsed.referralCredits === 'number'
          ? parsed.referralCredits
          : defaultWalletState.referralCredits,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : defaultWalletState.transactions,
    };
  } catch {
    return defaultWalletState;
  }
}

let walletState: WalletState = defaultWalletState;

if (isBrowser()) {
  walletState = loadWalletState();
}

function saveWalletState() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(walletState));
}

function emitChange() {
  saveWalletState();
  listeners.forEach((listener) => listener());
}

export function getWalletState(): WalletState {
  return walletState;
}

export function subscribeToWalletStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setWalletState(nextState: WalletState) {
  walletState = nextState;
  emitChange();
}

export function resetWalletState() {
  walletState = defaultWalletState;
  emitChange();
}

export function addWalletTransaction(transaction: WalletTransaction) {
  walletState = {
    ...walletState,
    transactions: [transaction, ...walletState.transactions],
  };
  emitChange();
}

export function addReferralCredit() {
  const transaction: WalletTransaction = {
    id: `tx_referral_${Date.now()}`,
    type: 'referral_bonus',
    title: 'Реферальный бонус',
    subtitle: '1 бесплатное бронирование',
    amount: 5,
    status: 'credited',
    createdAt: new Date().toISOString(),
  };

  walletState = {
    ...walletState,
    referralCredits: walletState.referralCredits + 5,
    transactions: [transaction, ...walletState.transactions],
  };

  emitChange();
}

export function useWelcomeBonus() {
  if (walletState.welcomeBonus < 5) return false;

  const transaction: WalletTransaction = {
    id: `tx_welcome_${Date.now()}`,
    type: 'welcome_bonus',
    title: 'Welcome Bonus использован',
    subtitle: 'Первое бронирование бесплатно',
    amount: -5,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  walletState = {
    ...walletState,
    welcomeBonus: Math.max(0, walletState.welcomeBonus - 5),
    transactions: [transaction, ...walletState.transactions],
  };

  emitChange();
  return true;
}

export function topUpWallet(amount: number) {
  if (amount <= 0) return;

  const transaction: WalletTransaction = {
    id: `tx_topup_${Date.now()}`,
    type: 'top_up',
    title: 'Пополнение баланса',
    subtitle: 'MapBook Balance',
    amount,
    status: 'credited',
    createdAt: new Date().toISOString(),
  };

  walletState = {
    ...walletState,
    availableBalance: walletState.availableBalance + amount,
    transactions: [transaction, ...walletState.transactions],
  };

  emitChange();
}

export function withdrawFromWallet(amount: number) {
  if (amount <= 0) return false;
  if (amount > walletState.availableBalance) return false;

  const transaction: WalletTransaction = {
    id: `tx_withdraw_${Date.now()}`,
    type: 'withdrawal',
    title: 'Вывод средств',
    subtitle: 'MapBook Balance',
    amount: -amount,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  walletState = {
    ...walletState,
    availableBalance: walletState.availableBalance - amount,
    transactions: [transaction, ...walletState.transactions],
  };

  emitChange();
  return true;
}

export function spendReferralCredit() {
  if (walletState.referralCredits < 5) return false;

  const transaction: WalletTransaction = {
    id: `tx_referral_spend_${Date.now()}`,
    type: 'booking_unlock',
    title: 'Бесплатное бронирование использовано',
    subtitle: 'Реферальный бонус',
    amount: -5,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  walletState = {
    ...walletState,
    referralCredits: walletState.referralCredits - 5,
    transactions: [transaction, ...walletState.transactions],
  };

  emitChange();
  return true;
}
