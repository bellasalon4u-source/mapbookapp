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

/**
 * Новый ключ специально, чтобы старые тестовые миллионы больше не подтягивались.
 * Старый ключ был: mapbook_wallet_state
 */
const STORAGE_KEY = 'olamep_wallet_state_v2';

const defaultWalletState: WalletState = {
  availableBalance: 0,
  pendingBalance: 0,
  refundCredits: 0,
  welcomeBonus: 0,
  referralCredits: 0,
  transactions: [],
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalizeWalletState(value?: Partial<WalletState> | null): WalletState {
  return {
    availableBalance:
      typeof value?.availableBalance === 'number' && Number.isFinite(value.availableBalance)
        ? value.availableBalance
        : defaultWalletState.availableBalance,
    pendingBalance:
      typeof value?.pendingBalance === 'number' && Number.isFinite(value.pendingBalance)
        ? value.pendingBalance
        : defaultWalletState.pendingBalance,
    refundCredits:
      typeof value?.refundCredits === 'number' && Number.isFinite(value.refundCredits)
        ? value.refundCredits
        : defaultWalletState.refundCredits,
    welcomeBonus:
      typeof value?.welcomeBonus === 'number' && Number.isFinite(value.welcomeBonus)
        ? value.welcomeBonus
        : defaultWalletState.welcomeBonus,
    referralCredits:
      typeof value?.referralCredits === 'number' && Number.isFinite(value.referralCredits)
        ? value.referralCredits
        : defaultWalletState.referralCredits,
    transactions: Array.isArray(value?.transactions)
      ? value.transactions
      : defaultWalletState.transactions,
  };
}

function loadWalletState(): WalletState {
  if (!isBrowser()) return defaultWalletState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWalletState;

    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return normalizeWalletState(parsed);
  } catch {
    return defaultWalletState;
  }
}

let walletState: WalletState = defaultWalletState;
let storageSyncInitialized = false;

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

function syncFromStorage() {
  if (!isBrowser()) return;
  walletState = loadWalletState();
  listeners.forEach((listener) => listener());
}

function setupStorageSync() {
  if (!isBrowser()) return;
  if (storageSyncInitialized) return;

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    syncFromStorage();
  };

  const handleFocus = () => {
    syncFromStorage();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('pageshow', handleFocus);

  storageSyncInitialized = true;
}

setupStorageSync();

export function getWalletState(): WalletState {
  if (isBrowser()) {
    walletState = loadWalletState();
  }

  return walletState;
}

export function subscribeToWalletStore(listener: () => void) {
  setupStorageSync();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setWalletState(nextState: WalletState) {
  walletState = normalizeWalletState(nextState);
  emitChange();
}

export function resetWalletState() {
  walletState = normalizeWalletState(defaultWalletState);
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
    subtitle: 'Бонус за приглашение',
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
  if (!Number.isFinite(amount) || amount <= 0) return;

  const transaction: WalletTransaction = {
    id: `tx_topup_${Date.now()}`,
    type: 'top_up',
    title: 'Пополнение баланса',
    subtitle: 'Olamep Balance',
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
  if (!Number.isFinite(amount) || amount <= 0) return false;
  if (amount > walletState.availableBalance) return false;

  const transaction: WalletTransaction = {
    id: `tx_withdraw_${Date.now()}`,
    type: 'withdrawal',
    title: 'Вывод средств',
    subtitle: 'Olamep Balance',
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

export function receiveClientPayment(amount: number, subtitle = 'Платёж клиента') {
  if (!Number.isFinite(amount) || amount <= 0) return false;

  const transaction: WalletTransaction = {
    id: `tx_client_payment_${Date.now()}`,
    type: 'client_payment',
    title: 'Платёж от клиента',
    subtitle,
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
  return true;
}
