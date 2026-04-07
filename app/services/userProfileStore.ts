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

function loadUserProfile(): UserProfile {
  if (!isBrowser()) return defaultUserProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUserProfile;

    const parsed = JSON.parse(raw) as UserProfile;

    return {
      id: typeof parsed.id === 'string' ? parsed.id : defaultUserProfile.id,
      fullName:
        typeof parsed.fullName === 'string'
          ? parsed.fullName
          : defaultUserProfile.fullName,
      email:
        typeof parsed.email === 'string' ? parsed.email : defaultUserProfile.email,
      phone:
        typeof parsed.phone === 'string' ? parsed.phone : defaultUserProfile.phone,
      avatar:
        typeof parsed.avatar === 'string'
          ? parsed.avatar
          : defaultUserProfile.avatar,
      city: typeof parsed.city === 'string' ? parsed.city : defaultUserProfile.city,
      bio: typeof parsed.bio === 'string' ? parsed.bio : defaultUserProfile.bio,
      language:
        typeof parsed.language === 'string'
          ? parsed.language
          : defaultUserProfile.language,
      region:
        typeof parsed.region === 'string'
          ? parsed.region
          : defaultUserProfile.region,
      isVerified:
        typeof parsed.isVerified === 'boolean'
          ? parsed.isVerified
          : defaultUserProfile.isVerified,
      upcomingBookingsCount:
        typeof parsed.upcomingBookingsCount === 'number'
          ? parsed.upcomingBookingsCount
          : defaultUserProfile.upcomingBookingsCount,
      savedMastersCount:
        typeof parsed.savedMastersCount === 'number'
          ? parsed.savedMastersCount
          : defaultUserProfile.savedMastersCount,
      notificationSettings: {
        messages:
          typeof parsed.notificationSettings?.messages === 'boolean'
            ? parsed.notificationSettings.messages
            : defaultUserProfile.notificationSettings.messages,
        bookings:
          typeof parsed.notificationSettings?.bookings === 'boolean'
            ? parsed.notificationSettings.bookings
            : defaultUserProfile.notificationSettings.bookings,
        reminders:
          typeof parsed.notificationSettings?.reminders === 'boolean'
            ? parsed.notificationSettings.reminders
            : defaultUserProfile.notificationSettings.reminders,
        promotions:
          typeof parsed.notificationSettings?.promotions === 'boolean'
            ? parsed.notificationSettings.promotions
            : defaultUserProfile.notificationSettings.promotions,
        system:
          typeof parsed.notificationSettings?.system === 'boolean'
            ? parsed.notificationSettings.system
            : defaultUserProfile.notificationSettings.system,
      },
    };
  } catch {
    return defaultUserProfile;
  }
}

let userProfileState: UserProfile = defaultUserProfile;

if (isBrowser()) {
  userProfileState = loadUserProfile();
}

function saveUserProfile() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfileState));
}

function emitChange() {
  saveUserProfile();
  listeners.forEach((listener) => listener());
}

export function getUserProfile(): UserProfile {
  return userProfileState;
}

export function subscribeToUserProfile(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUserProfile(nextProfile: UserProfile) {
  userProfileState = nextProfile;
  emitChange();
}

export function updateUserProfile(patch: Partial<UserProfile>) {
  userProfileState = {
    ...userProfileState,
    ...patch,
    notificationSettings: patch.notificationSettings
      ? {
          ...userProfileState.notificationSettings,
          ...patch.notificationSettings,
        }
      : userProfileState.notificationSettings,
  };

  emitChange();
}

export function resetUserProfile() {
  userProfileState = defaultUserProfile;
  emitChange();
}
