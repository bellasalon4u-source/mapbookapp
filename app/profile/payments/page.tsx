'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getPaymentsState,
  subscribeToPaymentsStore,
  type PaymentsState,
} from '../../services/paymentsStore';

const paymentTexts = {
  EN: {
    title: 'Payment methods',
    cards: 'Saved cards',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay & Google Pay',
    crypto: 'Crypto wallets',
    bank: 'Bank transfer',
    defaultLabel: 'Default',
    enabled: 'Enabled',
    disabled: 'Disabled',
    available: 'Available',
  },
  ES: {
    title: 'Métodos de pago',
    cards: 'Tarjetas guardadas',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay y Google Pay',
    crypto: 'Billeteras cripto',
    bank: 'Transferencia bancaria',
    defaultLabel: 'Principal',
    enabled: 'Activo',
    disabled: 'Desactivado',
    available: 'Disponible',
  },
  RU: {
    title: 'Способы оплаты',
    cards: 'Сохранённые карты',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay и Google Pay',
    crypto: 'Криптокошельки',
    bank: 'Банковский перевод',
    defaultLabel: 'Основная',
    enabled: 'Включено',
    disabled: 'Выключено',
    available: 'Доступно',
  },
  CZ: {
    title: 'Platební metody',
    cards: 'Uložené karty',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay a Google Pay',
    crypto: 'Crypto peněženky',
    bank: 'Bankovní převod',
    defaultLabel: 'Hlavní',
    enabled: 'Zapnuto',
    disabled: 'Vypnuto',
    available: 'Dostupné',
  },
  DE: {
    title: 'Zahlungsmethoden',
    cards: 'Gespeicherte Karten',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay und Google Pay',
    crypto: 'Krypto-Wallets',
    bank: 'Banküberweisung',
    defaultLabel: 'Standard',
    enabled: 'Aktiv',
    disabled: 'Inaktiv',
    available: 'Verfügbar',
  },
  PL: {
    title: 'Metody płatności',
    cards: 'Zapisane karty',
    paypal: 'PayPal',
    mobilePayments: 'Apple Pay i Google Pay',
    crypto: 'Portfele krypto',
    bank: 'Przelew bankowy',
    defaultLabel: 'Domyślna',
    enabled: 'Włączone',
    disabled: 'Wyłączone',
    available: 'Dostępne',
  },
} as const;

export default function PaymentsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [payments, setPayments] = useState<PaymentsState>(getPaymentsState());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncPayments = () => {
      setPayments(getPaymentsState());
    };

    syncLanguage();
    syncPayments();

    window.addEventListener('focus', syncLanguage);
    const unsubPayments = subscribeToPaymentsStore(syncPayments);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubPayments();
    };
  }, []);

  const text = useMemo(
    () => paymentTexts[language as keyof typeof paymentTexts] || paymentTexts.EN,
    [language]
  );

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

          <div className="h-11 w-11" />
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.cards}</div>

          <div className="mt-4 space-y-3">
            {payments.savedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6ef] px-4 py-3"
              >
                <div>
                  <div className="text-sm font-bold text-[#1d1712]">
                    {card.brand} •••• {card.last4}
                  </div>
                  <div className="mt-1 text-xs text-[#7a7065]">
                    {card.expiry} · {card.holderName}
                  </div>
                </div>

                {card.isDefault && (
                  <span className="rounded-full bg-[#e8f5ea] px-3 py-1 text-xs font-bold text-[#2d8a55]">
                    {text.defaultLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.paypal}</div>

          <div className="mt-4 rounded-2xl bg-[#faf6ef] px-4 py-3">
            <div className="text-sm font-bold text-[#1d1712]">{payments.paypalEmail}</div>
            <div className="mt-1 text-xs text-[#7a7065]">{text.available}</div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.mobilePayments}</div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#faf6ef] px-4 py-3">
              <div className="text-sm font-bold text-[#1d1712]">Apple Pay</div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  payments.applePayEnabled
                    ? 'bg-[#e8f5ea] text-[#2d8a55]'
                    : 'bg-[#f2ede7] text-[#5c5046]'
                }`}
              >
                {payments.applePayEnabled ? text.enabled : text.disabled}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#faf6ef] px-4 py-3">
              <div className="text-sm font-bold text-[#1d1712]">Google Pay</div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  payments.googlePayEnabled
                    ? 'bg-[#e8f5ea] text-[#2d8a55]'
                    : 'bg-[#f2ede7] text-[#5c5046]'
                }`}
              >
                {payments.googlePayEnabled ? text.enabled : text.disabled}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.crypto}</div>

          <div className="mt-4 space-y-3">
            {payments.cryptoWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6ef] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#1d1712]">
                    {wallet.coin} · {wallet.network}
                  </div>
                  <div className="mt-1 truncate text-xs text-[#7a7065]">{wallet.address}</div>
                </div>

                {wallet.isDefault && (
                  <span className="rounded-full bg-[#e8f5ea] px-3 py-1 text-xs font-bold text-[#2d8a55]">
                    {text.defaultLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-extrabold text-[#1d1712]">{text.bank}</div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                payments.bankTransferEnabled
                  ? 'bg-[#e8f5ea] text-[#2d8a55]'
                  : 'bg-[#f2ede7] text-[#5c5046]'
              }`}
            >
              {payments.bankTransferEnabled ? text.enabled : text.disabled}
            </span>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
