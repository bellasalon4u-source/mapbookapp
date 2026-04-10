import {
  currencyMeta,
  getAppRegionSettings,
  type AppCurrency,
} from './appRegionStore';

const baseCurrency: AppCurrency = 'GBP';

/**
 * Временные локальные курсы от GBP.
 * Потом заменим на live API без ломки остального приложения.
 */
const ratesFromGBP: Record<AppCurrency, number> = {
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

export function getSelectedCurrency() {
  return getAppRegionSettings().currency || baseCurrency;
}

export function convertFromGBP(amountGBP: number, currency?: AppCurrency) {
  const targetCurrency = currency || getSelectedCurrency();
  const rate = ratesFromGBP[targetCurrency] || 1;
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
