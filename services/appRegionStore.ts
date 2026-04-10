export type AppCurrency =
  | 'GBP'
  | 'EUR'
  | 'USD'
  | 'PLN'
  | 'CZK'
  | 'UAH'
  | 'AED'
  | 'CNY'
  | 'SEK'
  | 'DKK';

export type SearchLocationMode = 'current' | 'custom';

export type AppRegionSettings = {
  language: 'EN' | 'ES' | 'RU' | 'CZ' | 'DE' | 'PL';
  region: string;
  currency: AppCurrency;
  locationMode: SearchLocationMode;
  currentLocation: {
    lat: number | null;
    lng: number | null;
    label: string;
  };
  customLocation: {
    lat: number | null;
    lng: number | null;
    label: string;
  };
};

type RegionListener = () => void;

const STORAGE_KEY = 'mapbook_region_settings';

const listeners = new Set<RegionListener>();

const defaultSettings: AppRegionSettings = {
  language: 'EN',
  region: 'United Kingdom',
  currency: 'GBP',
  locationMode: 'current',
  currentLocation: {
    lat: null,
    lng: null,
    label: 'Current location',
  },
  customLocation: {
    lat: 51.5074,
    lng: -0.1278,
    label: 'London, United Kingdom',
  },
};

export const currencyMeta: Record<
  AppCurrency,
  {
    code: AppCurrency;
    symbol: string;
    label: string;
  }
> = {
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar' },
  PLN: { code: 'PLN', symbol: 'zł', label: 'Polish Zloty' },
  CZK: { code: 'CZK', symbol: 'Kč', label: 'Czech Koruna' },
  UAH: { code: 'UAH', symbol: '₴', label: 'Ukrainian Hryvnia' },
  AED: { code: 'AED', symbol: 'AED', label: 'UAE Dirham' },
  CNY: { code: 'CNY', symbol: 'CN¥', label: 'Chinese Yuan' },
  SEK: { code: 'SEK', symbol: 'SEK', label: 'Swedish Krona' },
  DKK: { code: 'DKK', symbol: 'DKK', label: 'Danish Krone' },
};

export const regionOptions = [
  'United Kingdom',
  'Spain',
  'Czech Republic',
  'Germany',
  'Poland',
  'Ukraine',
  'United States',
  'United Arab Emirates',
] as const;

export const currencyOptions: AppCurrency[] = [
  'GBP',
  'EUR',
  'USD',
  'PLN',
  'CZK',
  'UAH',
  'AED',
  'CNY',
  'SEK',
  'DKK',
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function normalizeSettings(
  value: Partial<AppRegionSettings> | null | undefined
): AppRegionSettings {
  const language =
    value?.language === 'EN' ||
    value?.language === 'ES' ||
    value?.language === 'RU' ||
    value?.language === 'CZ' ||
    value?.language === 'DE' ||
    value?.language === 'PL'
      ? value.language
      : defaultSettings.language;

  const currency =
    value?.currency && currencyOptions.includes(value.currency)
      ? value.currency
      : defaultSettings.currency;

  const locationMode =
    value?.locationMode === 'current' || value?.locationMode === 'custom'
      ? value.locationMode
      : defaultSettings.locationMode;

  return {
    language,
    region: String(value?.region || defaultSettings.region),
    currency,
    locationMode,
    currentLocation: {
      lat:
        typeof value?.currentLocation?.lat === 'number'
          ? value.currentLocation.lat
          : defaultSettings.currentLocation.lat,
      lng:
        typeof value?.currentLocation?.lng === 'number'
          ? value.currentLocation.lng
          : defaultSettings.currentLocation.lng,
      label: String(
        value?.currentLocation?.label || defaultSettings.currentLocation.label
      ),
    },
    customLocation: {
      lat:
        typeof value?.customLocation?.lat === 'number'
          ? value.customLocation.lat
          : defaultSettings.customLocation.lat,
      lng:
        typeof value?.customLocation?.lng === 'number'
          ? value.customLocation.lng
          : defaultSettings.customLocation.lng,
      label: String(
        value?.customLocation?.label || defaultSettings.customLocation.label
      ),
    },
  };
}

function readStore(): AppRegionSettings {
  if (!canUseStorage()) {
    return defaultSettings;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppRegionSettings>;
    return normalizeSettings(parsed);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
}

function writeStore(next: AppRegionSettings) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
}

export function getAppRegionSettings() {
  return readStore();
}

export function updateAppRegionSettings(
  updates: Partial<AppRegionSettings>
) {
  const current = readStore();

  const next = normalizeSettings({
    ...current,
    ...updates,
    currentLocation: {
      ...current.currentLocation,
      ...(updates.currentLocation || {}),
    },
    customLocation: {
      ...current.customLocation,
      ...(updates.customLocation || {}),
    },
  });

  writeStore(next);
}

export function setCurrentLocation(lat: number, lng: number, label = 'Current location') {
  const current = readStore();

  writeStore({
    ...current,
    currentLocation: {
      lat,
      lng,
      label,
    },
  });
}

export function setCustomLocation(lat: number, lng: number, label: string) {
  const current = readStore();

  writeStore({
    ...current,
    customLocation: {
      lat,
      lng,
      label,
    },
    locationMode: 'custom',
  });
}

export function setLocationMode(mode: SearchLocationMode) {
  const current = readStore();

  writeStore({
    ...current,
    locationMode: mode,
  });
}

export function getEffectiveSearchLocation() {
  const settings = readStore();

  if (
    settings.locationMode === 'custom' &&
    typeof settings.customLocation.lat === 'number' &&
    typeof settings.customLocation.lng === 'number'
  ) {
    return {
      lat: settings.customLocation.lat,
      lng: settings.customLocation.lng,
      label: settings.customLocation.label,
      mode: 'custom' as const,
    };
  }

  if (
    typeof settings.currentLocation.lat === 'number' &&
    typeof settings.currentLocation.lng === 'number'
  ) {
    return {
      lat: settings.currentLocation.lat,
      lng: settings.currentLocation.lng,
      label: settings.currentLocation.label,
      mode: 'current' as const,
    };
  }

  return {
    lat: defaultSettings.customLocation.lat as number,
    lng: defaultSettings.customLocation.lng as number,
    label: defaultSettings.customLocation.label,
    mode: 'fallback' as const,
  };
}

export function formatCurrencyAmount(
  amount: number,
  currency: AppCurrency
) {
  const meta = currencyMeta[currency] || currencyMeta.GBP;

  if (!Number.isFinite(amount)) {
    return `${meta.symbol}0`;
  }

  if (meta.symbol.length === 1 || meta.symbol === 'zł' || meta.symbol === 'Kč') {
    return `${meta.symbol}${amount.toFixed(0)}`;
  }

  return `${meta.symbol} ${amount.toFixed(0)}`;
}

export function subscribeToAppRegionSettings(listener: RegionListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
