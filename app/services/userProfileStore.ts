export type NotificationSettings = {
  messages: boolean;
  bookings: boolean;
  reminders: boolean;
  promotions: boolean;
  system: boolean;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  bio: string;
  language: string;
  region: string;
  isVerified: boolean;
  upcomingBookingsCount: number;
  savedMastersCount: number;
  notificationSettings: NotificationSettings;
};

const STORAGE_KEY = 'mapbook_user_profile';

const defaultUserProfile: UserProfile = {
  id: 'user_1',
  fullName: 'Alex Carter',
  email: 'alex@email.com',
  phone: '+44 7700 123456',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  city: 'London, UK',
  bio: 'Люблю удобные сервисы, красоту и быстрые бронирования.',
  language: 'Русский',
  region: 'United Kingdom',
  isVerified: true,
  upcomingBookingsCount: 3,
  savedMastersCount: 8,
  notificationSettings: {
    messages: true,
    bookings: true,
    reminders: true,
    promotions: false,
    system: true,
  },
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalizeNotificationSettings(
  value?: Partial<NotificationSettings> | null
): NotificationSettings {
  return {
    messages:
      typeof value?.messages === 'boolean'
        ? value.messages
        : defaultUserProfile.notificationSettings.messages,
    bookings:
      typeof value?.bookings === 'boolean'
        ? value.bookings
        : defaultUserProfile.notificationSettings.bookings,
    reminders:
      typeof value?.reminders === 'boolean'
        ? value.reminders
        : defaultUserProfile.notificationSettings.reminders,
    promotions:
      typeof value?.promotions === 'boolean'
        ? value.promotions
        : defaultUserProfile.notificationSettings.promotions,
    system:
      typeof value?.system === 'boolean'
        ? value.system
        : defaultUserProfile.notificationSettings.system,
  };
}

function normalizeUserProfile(value?: Partial<UserProfile> | null): UserProfile {
  return {
    id: typeof value?.id === 'string' && value.id.trim() ? value.id : defaultUserProfile.id,
    fullName:
      typeof value?.fullName === 'string' && value.fullName.trim()
        ? value.fullName.trim()
        : defaultUserProfile.fullName,
    email:
      typeof value?.email === 'string' && value.email.trim()
        ? value.email.trim()
        : defaultUserProfile.email,
    phone:
      typeof value?.phone === 'string' && value.phone.trim()
        ? value.phone.trim()
        : defaultUserProfile.phone,
    avatar:
      typeof value?.avatar === 'string' && value.avatar.trim()
        ? value.avatar.trim()
        : defaultUserProfile.avatar,
    city:
      typeof value?.city === 'string' && value.city.trim()
        ? value.city.trim()
        : defaultUserProfile.city,
    bio: typeof value?.bio === 'string' ? value.bio : defaultUserProfile.bio,
    language:
      typeof value?.language === 'string' && value.language.trim()
        ? value.language.trim()
        : defaultUserProfile.language,
    region:
      typeof value?.region === 'string' && value.region.trim()
        ? value.region.trim()
        : defaultUserProfile.region,
    isVerified:
      typeof value?.isVerified === 'boolean'
        ? value.isVerified
        : defaultUserProfile.isVerified,
    upcomingBookingsCount:
      typeof value?.upcomingBookingsCount === 'number'
        ? value.upcomingBookingsCount
        : defaultUserProfile.upcomingBookingsCount,
    savedMastersCount:
      typeof value?.savedMastersCount === 'number'
        ? value.savedMastersCount
        : defaultUserProfile.savedMastersCount,
    notificationSettings: normalizeNotificationSettings(value?.notificationSettings),
  };
}

function loadUserProfile(): UserProfile {
  if (!isBrowser()) return defaultUserProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUserProfile;

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return normalizeUserProfile(parsed);
  } catch {
    return defaultUserProfile;
  }
}

let userProfileState: UserProfile = defaultUserProfile;
let storageSyncInitialized = false;

if (isBrowser()) {
  userProfileState = loadUserProfile();
}

function saveUserProfile() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfileState));
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function syncFromStorage() {
  if (!isBrowser()) return;
  userProfileState = loadUserProfile();
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

export function getUserProfile(): UserProfile {
  if (isBrowser()) {
    userProfileState = loadUserProfile();
  }

  return userProfileState;
}

export function subscribeToUserProfile(listener: () => void) {
  setupStorageSync();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUserProfile(nextProfile: UserProfile) {
  userProfileState = normalizeUserProfile(nextProfile);
  saveUserProfile();
  emitChange();
}

export function updateUserProfile(patch: Partial<UserProfile>) {
  userProfileState = normalizeUserProfile({
    ...userProfileState,
    ...patch,
    notificationSettings: patch.notificationSettings
      ? {
          ...userProfileState.notificationSettings,
          ...patch.notificationSettings,
        }
      : userProfileState.notificationSettings,
  });

  saveUserProfile();
  emitChange();
}

export function resetUserProfile() {
  userProfileState = normalizeUserProfile(defaultUserProfile);
  saveUserProfile();
  emitChange();
}
