export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  acceptedTerms: boolean;
  marketingConsent: boolean;
  createdAt: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
};

const STORAGE_KEY = 'olamep_auth_state';

const defaultAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalizeAuthState(value?: Partial<AuthState> | null): AuthState {
  const user = value?.user;

  if (!value?.isLoggedIn || !user) {
    return defaultAuthState;
  }

  return {
    isLoggedIn: true,
    user: {
      id: typeof user.id === 'string' && user.id.trim() ? user.id : `user_${Date.now()}`,
      email:
        typeof user.email === 'string' && user.email.trim()
          ? user.email.trim().toLowerCase()
          : '',
      fullName:
        typeof user.fullName === 'string' && user.fullName.trim()
          ? user.fullName.trim()
          : 'Olamep user',
      acceptedTerms: user.acceptedTerms === true,
      marketingConsent: user.marketingConsent === true,
      createdAt:
        typeof user.createdAt === 'string' && user.createdAt.trim()
          ? user.createdAt
          : new Date().toISOString(),
    },
  };
}

function loadAuthState(): AuthState {
  if (!isBrowser()) return defaultAuthState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAuthState;

    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return normalizeAuthState(parsed);
  } catch {
    return defaultAuthState;
  }
}

let authState: AuthState = defaultAuthState;
let storageSyncInitialized = false;

if (isBrowser()) {
  authState = loadAuthState();
}

function saveAuthState() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function syncFromStorage() {
  if (!isBrowser()) return;
  authState = loadAuthState();
  emitChange();
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

export function getAuthState(): AuthState {
  if (isBrowser()) {
    authState = loadAuthState();
  }

  return authState;
}

export function isAuthenticated() {
  return getAuthState().isLoggedIn;
}

export function getCurrentUser() {
  return getAuthState().user;
}

export function subscribeToAuthStore(listener: () => void) {
  setupStorageSync();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function createAccount({
  email,
  password,
  fullName,
  acceptedTerms,
  marketingConsent,
}: {
  email: string;
  password: string;
  fullName?: string;
  acceptedTerms: boolean;
  marketingConsent: boolean;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return {
      ok: false,
      error: 'Введите корректный email.',
    };
  }

  if (normalizedPassword.length < 6) {
    return {
      ok: false,
      error: 'Пароль должен быть минимум 6 символов.',
    };
  }

  if (!acceptedTerms) {
    return {
      ok: false,
      error: 'Нужно принять Terms & Conditions и Privacy Policy.',
    };
  }

  authState = {
    isLoggedIn: true,
    user: {
      id: `user_${Date.now()}`,
      email: normalizedEmail,
      fullName:
        typeof fullName === 'string' && fullName.trim()
          ? fullName.trim()
          : normalizedEmail.split('@')[0],
      acceptedTerms: true,
      marketingConsent,
      createdAt: new Date().toISOString(),
    },
  };

  saveAuthState();
  emitChange();

  return {
    ok: true,
    error: '',
  };
}

export function loginWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return {
      ok: false,
      error: 'Введите корректный email.',
    };
  }

  if (normalizedPassword.length < 6) {
    return {
      ok: false,
      error: 'Пароль должен быть минимум 6 символов.',
    };
  }

  authState = {
    isLoggedIn: true,
    user: {
      id: `user_${Date.now()}`,
      email: normalizedEmail,
      fullName: normalizedEmail.split('@')[0],
      acceptedTerms: true,
      marketingConsent: false,
      createdAt: new Date().toISOString(),
    },
  };

  saveAuthState();
  emitChange();

  return {
    ok: true,
    error: '',
  };
}

export function logout() {
  authState = defaultAuthState;

  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  emitChange();
}
