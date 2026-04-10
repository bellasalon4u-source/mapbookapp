import {
  currencyMeta,
  getAppRegionSettings,
  type AppCurrency,
} from './appRegionStore';

const baseCurrency: AppCurrency = 'GBP';
const CACHE_KEY = 'mapbook_live_currency_rates_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

type RatesCache = {
  base: AppCurrency;
  fetchedAt: number;
  rates: Record<string, number>;
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseNumericPrice(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value).replace(/[^\d.]/g, '').trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFallbackRates(): Record<AppCurrency, number> {
  return {
    GBP: 1,
    EUR: 1.17,
    USD: 1.29,
    PLN: 5.02,
    CZK: 29.45,
    UAH: 53.4,
    AED: 4.74,
    CNY: 9.34,
    SEK: 13.42,
    DKK: 8.73,
  };
}

function readRatesCache(): RatesCache | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RatesCache;

    if (
      !parsed ||
      parsed.base !== baseCurrency ||
      typeof parsed.fetchedAt !== 'number' ||
      !parsed.rates ||
      typeof parsed.rates !== 'object'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeRatesCache(rates: Record<string, number>) {
  if (!canUseStorage()) return;

  const payload: RatesCache = {
    base: baseCurrency,
    fetchedAt: Date.now(),
    rates,
  };

  window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

function getRatesSync(): Record<string, number> {
  const fallback = getFallbackRates();
  const cache = readRatesCache();

  if (!cache) return fallback;

  return {
    ...fallback,
    ...cache.rates,
    GBP: 1,
  };
}

export function getSelectedCurrency() {
  return getAppRegionSettings().currency || baseCurrency;
}

export function convertFromGBP(amountGBP: number, currency?: AppCurrency) {
  const targetCurrency = currency || getSelectedCurrency();
  const rates = getRatesSync();
  const rate = Number(rates[targetCurrency]) || 1;
  return amountGBP * rate;
}

export function formatCurrencyValue(amount: number, currency?: AppCurrency) {
  const targetCurrency = currency || getSelectedCurrency();
  const meta = currencyMeta[targetCurrency] || currencyMeta.GBP;

  if (meta.symbol.length <= 2 || meta.symbol === 'zł' || meta.symbol === 'Kč') {
    return `${meta.symbol}${amount.toFixed(0)}`;
  }

  return `${meta.symbol} ${amount.toFixed(0)}`;
}

export function formatDisplayPriceFromGBP(amountGBP: number, currency?: AppCurrency) {
  const converted = convertFromGBP(amountGBP, currency);
  return formatCurrencyValue(converted, currency);
}

export function formatDisplayPrice(
  rawValue: string | number | undefined,
  fallbackGBP = 45,
  withFrom = false,
  fromLabel = 'From'
) {
  const currency = getSelectedCurrency();
  const numeric = parseNumericPrice(rawValue);

  const baseAmount = numeric ?? fallbackGBP;
  const formatted = formatDisplayPriceFromGBP(baseAmount, currency);

  if (withFrom) {
    return `${fromLabel} ${formatted}`;
  }

  return formatted;
}

export function getBaseCurrencyCode() {
  return baseCurrency;
}

export function getLastRatesFetchTime() {
  const cache = readRatesCache();
  return cache?.fetchedAt || null;
}

export async function refreshLiveCurrencyRates(force = false) {
  const fallback = getFallbackRates();
  const cache = readRatesCache();

  if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      ok: true,
      source: 'cache' as const,
      rates: {
        ...fallback,
        ...cache.rates,
        GBP: 1,
      },
    };
  }

  try {
    const url =
      'https://api.frankfurter.dev/v2/rates?base=GBP&symbols=EUR,USD,PLN,CZK,UAH,AED,CNY,SEK,DKK';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Rates request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      base?: string;
      rates?: Record<string, number>;
    };

    const nextRates = {
      ...fallback,
      ...(data?.rates || {}),
      GBP: 1,
    };

    writeRatesCache(nextRates);

    return {
      ok: true,
      source: 'network' as const,
      rates: nextRates,
    };
  } catch (error) {
    const cachedRates = getRatesSync();

    return {
      ok: false,
      source: cache ? ('stale-cache' as const) : ('fallback' as const),
      rates: cachedRates,
      error,
    };
  }
}
