export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
};

export type CryptoWallet = {
  id: string;
  coin: string;
  network: string;
  address: string;
  isDefault: boolean;
};

export type PaymentsState = {
  savedCards: SavedCard[];
  paypalEmail: string;
  googlePayEnabled: boolean;
  applePayEnabled: boolean;
  bankTransferEnabled: boolean;
  cryptoWallets: CryptoWallet[];
};

const STORAGE_KEY = 'mapbook_payments_state';

const defaultPaymentsState: PaymentsState = {
  savedCards: [
    {
      id: 'card_1',
      brand: 'Visa',
      last4: '4242',
      expiry: '09/26',
      holderName: 'Alex Carter',
      isDefault: true,
    },
    {
      id: 'card_2',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '03/27',
      holderName: 'Alex Carter',
      isDefault: false,
    },
  ],
  paypalEmail: 'alex@email.com',
  googlePayEnabled: true,
  applePayEnabled: true,
  bankTransferEnabled: true,
  cryptoWallets: [
    {
      id: 'wallet_1',
      coin: 'USDT',
      network: 'TRC-20',
      address: 'TQ2mMapBookExampleWallet0001',
      isDefault: true,
    },
    {
      id: 'wallet_2',
      coin: 'USDC',
      network: 'Polygon',
      address: '0xMapBookExampleWallet0002',
      isDefault: false,
    },
  ],
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadPaymentsState(): PaymentsState {
  if (!isBrowser()) return defaultPaymentsState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPaymentsState;

    const parsed = JSON.parse(raw) as PaymentsState;

    return {
      savedCards: Array.isArray(parsed.savedCards)
        ? parsed.savedCards
        : defaultPaymentsState.savedCards,
      paypalEmail:
        typeof parsed.paypalEmail === 'string'
          ? parsed.paypalEmail
          : defaultPaymentsState.paypalEmail,
      googlePayEnabled:
        typeof parsed.googlePayEnabled === 'boolean'
          ? parsed.googlePayEnabled
          : defaultPaymentsState.googlePayEnabled,
      applePayEnabled:
        typeof parsed.applePayEnabled === 'boolean'
          ? parsed.applePayEnabled
          : defaultPaymentsState.applePayEnabled,
      bankTransferEnabled:
        typeof parsed.bankTransferEnabled === 'boolean'
          ? parsed.bankTransferEnabled
          : defaultPaymentsState.bankTransferEnabled,
      cryptoWallets: Array.isArray(parsed.cryptoWallets)
        ? parsed.cryptoWallets
        : defaultPaymentsState.cryptoWallets,
    };
  } catch {
    return defaultPaymentsState;
  }
}

let paymentsState: PaymentsState = defaultPaymentsState;

if (isBrowser()) {
  paymentsState = loadPaymentsState();
}

function savePaymentsState() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentsState));
}

function emitChange() {
  savePaymentsState();
  listeners.forEach((listener) => listener());
}

export function getPaymentsState(): PaymentsState {
  return paymentsState;
}

export function subscribeToPaymentsStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPaymentsState(nextState: PaymentsState) {
  paymentsState = nextState;
  emitChange();
}

export function resetPaymentsState() {
  paymentsState = defaultPaymentsState;
  emitChange();
}

export function addSavedCard(card: SavedCard) {
  paymentsState = {
    ...paymentsState,
    savedCards: [...paymentsState.savedCards, card],
  };
  emitChange();
}

export function removeSavedCard(cardId: string) {
  paymentsState = {
    ...paymentsState,
    savedCards: paymentsState.savedCards.filter((card) => card.id !== cardId),
  };
  emitChange();
}

export function setDefaultCard(cardId: string) {
  paymentsState = {
    ...paymentsState,
    savedCards: paymentsState.savedCards.map((card) => ({
      ...card,
      isDefault: card.id === cardId,
    })),
  };
  emitChange();
}

export function updatePaypalEmail(email: string) {
  paymentsState = {
    ...paymentsState,
    paypalEmail: email,
  };
  emitChange();
}

export function toggleGooglePay(enabled: boolean) {
  paymentsState = {
    ...paymentsState,
    googlePayEnabled: enabled,
  };
  emitChange();
}

export function toggleApplePay(enabled: boolean) {
  paymentsState = {
    ...paymentsState,
    applePayEnabled: enabled,
  };
  emitChange();
}

export function toggleBankTransfer(enabled: boolean) {
  paymentsState = {
    ...paymentsState,
    bankTransferEnabled: enabled,
  };
  emitChange();
}

export function addCryptoWallet(wallet: CryptoWallet) {
  paymentsState = {
    ...paymentsState,
    cryptoWallets: [...paymentsState.cryptoWallets, wallet],
  };
  emitChange();
}

export function removeCryptoWallet(walletId: string) {
  paymentsState = {
    ...paymentsState,
    cryptoWallets: paymentsState.cryptoWallets.filter(
      (wallet) => wallet.id !== walletId
    ),
  };
  emitChange();
}

export function setDefaultCryptoWallet(walletId: string) {
  paymentsState = {
    ...paymentsState,
    cryptoWallets: paymentsState.cryptoWallets.map((wallet) => ({
      ...wallet,
      isDefault: wallet.id === walletId,
    })),
  };
  emitChange();
}
