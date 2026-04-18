'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';
import {
  getWalletState,
  subscribeToWalletStore,
  type WalletState,
} from '../../services/walletStore';

type TopUpTexts = {
  title: string;
  subtitle: string;
  back: string;
  amount: string;
  amountPlaceholder: string;
  quickAmounts: string;
  generate: string;
  regenerate: string;
  paymentCode: string;
  paymentCodeHint: string;
  summary: string;
  topUpAmount: string;
  platformFee: string;
  receiver: string;
  totalFlow: string;
  feeHint: string;
  walletBalance: string;
  scanInstruction: string;
  readyToScan: string;
};

const texts: Record<string, TopUpTexts> = {
  EN: {
    title: 'Quick top up',
    subtitle: 'Create a payment barcode for instant balance transfer',
    back: 'Back',
    amount: 'Amount',
    amountPlaceholder: 'Enter amount',
    quickAmounts: 'Quick amounts',
    generate: 'Generate barcode',
    regenerate: 'Regenerate barcode',
    paymentCode: 'Payment barcode',
    paymentCodeHint: 'Show this barcode to the buyer for fast balance transfer.',
    summary: 'Transaction summary',
    topUpAmount: 'Top up amount',
    platformFee: 'Platform fee',
    receiver: 'Receiver',
    totalFlow: 'Total payment flow',
    feeHint: 'Fee is 0.5% of the entered amount.',
    walletBalance: 'Current balance',
    scanInstruction: 'Buyer scans the code and transfers the amount to your app balance.',
    readyToScan: 'Ready to scan',
  },
  ES: {
    title: 'Recarga rápida',
    subtitle: 'Crea un código de pago para transferir saldo al instante',
    back: 'Atrás',
    amount: 'Cantidad',
    amountPlaceholder: 'Introduce la cantidad',
    quickAmounts: 'Cantidades rápidas',
    generate: 'Generar código',
    regenerate: 'Generar de nuevo',
    paymentCode: 'Código de pago',
    paymentCodeHint: 'Muestra este código al comprador para una transferencia rápida.',
    summary: 'Resumen de la transacción',
    topUpAmount: 'Importe de recarga',
    platformFee: 'Comisión de la plataforma',
    receiver: 'Receptor',
    totalFlow: 'Flujo total de pago',
    feeHint: 'La comisión es 0,5% del importe introducido.',
    walletBalance: 'Saldo actual',
    scanInstruction: 'El comprador escanea el código y transfiere el importe a tu saldo en la app.',
    readyToScan: 'Listo para escanear',
  },
  RU: {
    title: 'Быстрое пополнение',
    subtitle: 'Создайте платёжный код для мгновенного пополнения баланса',
    back: 'Назад',
    amount: 'Сумма',
    amountPlaceholder: 'Введите сумму',
    quickAmounts: 'Быстрые суммы',
    generate: 'Сгенерировать код',
    regenerate: 'Сгенерировать заново',
    paymentCode: 'Платёжный код',
    paymentCodeHint: 'Покажите этот код покупателю для быстрого перевода на баланс.',
    summary: 'Сводка транзакции',
    topUpAmount: 'Сумма пополнения',
    platformFee: 'Комиссия платформы',
    receiver: 'Получатель',
    totalFlow: 'Общий платёжный поток',
    feeHint: 'Комиссия составляет 0.5% от введённой суммы.',
    walletBalance: 'Текущий баланс',
    scanInstruction: 'Покупатель сканирует код и переводит сумму на ваш баланс в приложении.',
    readyToScan: 'Готово к сканированию',
  },
  CZ: {
    title: 'Rychlé dobití',
    subtitle: 'Vytvořte platební kód pro okamžité dobití zůstatku',
    back: 'Zpět',
    amount: 'Částka',
    amountPlaceholder: 'Zadejte částku',
    quickAmounts: 'Rychlé částky',
    generate: 'Vygenerovat kód',
    regenerate: 'Vygenerovat znovu',
    paymentCode: 'Platební kód',
    paymentCodeHint: 'Ukažte tento kód zákazníkovi pro rychlý převod na zůstatek.',
    summary: 'Souhrn transakce',
    topUpAmount: 'Částka dobití',
    platformFee: 'Poplatek platformy',
    receiver: 'Příjemce',
    totalFlow: 'Celkový platební tok',
    feeHint: 'Poplatek je 0,5 % ze zadané částky.',
    walletBalance: 'Aktuální zůstatek',
    scanInstruction: 'Kupující naskenuje kód a pošle částku na váš zůstatek v aplikaci.',
    readyToScan: 'Připraveno ke skenování',
  },
  DE: {
    title: 'Schnell aufladen',
    subtitle: 'Erstelle einen Zahlungscode für sofortige Guthabenaufladung',
    back: 'Zurück',
    amount: 'Betrag',
    amountPlaceholder: 'Betrag eingeben',
    quickAmounts: 'Schnellbeträge',
    generate: 'Code generieren',
    regenerate: 'Code neu generieren',
    paymentCode: 'Zahlungscode',
    paymentCodeHint: 'Zeige diesen Code dem Käufer für eine schnelle Guthabenüberweisung.',
    summary: 'Transaktionsübersicht',
    topUpAmount: 'Aufladebetrag',
    platformFee: 'Plattformgebühr',
    receiver: 'Empfänger',
    totalFlow: 'Gesamter Zahlungsfluss',
    feeHint: 'Die Gebühr beträgt 0,5 % des eingegebenen Betrags.',
    walletBalance: 'Aktuelles Guthaben',
    scanInstruction: 'Der Käufer scannt den Code und überweist den Betrag auf dein App-Guthaben.',
    readyToScan: 'Bereit zum Scannen',
  },
  PL: {
    title: 'Szybkie doładowanie',
    subtitle: 'Utwórz kod płatności do natychmiastowego zasilenia salda',
    back: 'Wstecz',
    amount: 'Kwota',
    amountPlaceholder: 'Wpisz kwotę',
    quickAmounts: 'Szybkie kwoty',
    generate: 'Wygeneruj kod',
    regenerate: 'Wygeneruj ponownie',
    paymentCode: 'Kod płatności',
    paymentCodeHint: 'Pokaż ten kod kupującemu do szybkiego przelewu na saldo.',
    summary: 'Podsumowanie transakcji',
    topUpAmount: 'Kwota doładowania',
    platformFee: 'Prowizja platformy',
    receiver: 'Odbiorca',
    totalFlow: 'Cały przepływ płatności',
    feeHint: 'Prowizja wynosi 0,5% wpisanej kwoty.',
    walletBalance: 'Aktualne saldo',
    scanInstruction: 'Kupujący skanuje kod i przesyła kwotę na Twoje saldo w aplikacji.',
    readyToScan: 'Gotowe do skanowania',
  },
  UA: {
    title: 'Швидке поповнення',
    subtitle: 'Створіть платіжний код для миттєвого поповнення балансу',
    back: 'Назад',
    amount: 'Сума',
    amountPlaceholder: 'Введіть суму',
    quickAmounts: 'Швидкі суми',
    generate: 'Згенерувати код',
    regenerate: 'Згенерувати знову',
    paymentCode: 'Платіжний код',
    paymentCodeHint: 'Покажіть цей код покупцю для швидкого переказу на баланс.',
    summary: 'Підсумок транзакції',
    topUpAmount: 'Сума поповнення',
    platformFee: 'Комісія платформи',
    receiver: 'Отримувач',
    totalFlow: 'Загальний платіжний потік',
    feeHint: 'Комісія становить 0.5% від введеної суми.',
    walletBalance: 'Поточний баланс',
    scanInstruction: 'Покупець сканує код і переказує суму на ваш баланс у застосунку.',
    readyToScan: 'Готово до сканування',
  },
};

function getText(language: AppLanguage): TopUpTexts {
  return texts[language] || texts.EN;
}

function formatMoney(value: number) {
  return `£${value.toFixed(2)}`;
}

function sanitizeAmount(value: string) {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function createBarcodeSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1000000007;
  }
  return Math.abs(hash).toString();
}

function buildBarcodeBars(seed: string) {
  const source = `${seed}314159265358979323846264338327950288419716939937510`;
  return source.split('').map((char, index) => {
    const value = Number(char);
    const width = 2 + (value % 4);
    const height = 54 + (value % 5) * 10 + (index % 3) * 4;
    return {
      width,
      height,
      gap: index % 2 === 0 ? 2 : 3,
    };
  });
}

export default function TopUpPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [amountInput, setAmountInput] = useState('25');
  const [barcodeSeed, setBarcodeSeed] = useState<string | null>(null);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      setProfile(getUserProfile());
    };

    const syncWallet = () => {
      setWallet(getWalletState());
    };

    syncLanguage();
    syncProfile();
    syncWallet();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    const unsubProfile = subscribeToUserProfile(syncProfile);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    return () => {
      unsubLanguage();
      unsubProfile();
      unsubWallet();
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const amount = useMemo(() => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
  }, [amountInput]);

  const fee = useMemo(() => {
    return amount * 0.005;
  }, [amount]);

  const totalFlow = useMemo(() => {
    return amount + fee;
  }, [amount, fee]);

  const barcodeValue = useMemo(() => {
    if (!barcodeSeed || amount <= 0) return null;
    return createBarcodeSeed(`${barcodeSeed}-${amount.toFixed(2)}-${profile.email}`);
  }, [barcodeSeed, amount, profile.email]);

  const bars = useMemo(() => {
    if (!barcodeValue) return [];
    return buildBarcodeBars(barcodeValue);
  }, [barcodeValue]);

  const canGenerate = amount > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setBarcodeSeed(`${Date.now()}`);
  };

  let x = 18;
  const svgBars = bars.map((bar, index) => {
    const rect = (
      <rect
        key={`${index}-${x}`}
        x={x}
        y={140 - bar.height}
        width={bar.width}
        height={bar.height}
        rx="1"
        fill="#111111"
      />
    );
    x += bar.width + bar.gap;
    return rect;
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#17130f',
        paddingBottom: 110,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.back}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 26,
              color: '#17130f',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {text.title}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff4db',
              fontSize: 22,
              color: '#17130f',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🏦
          </button>
        </div>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#2f241c',
                color: '#fff',
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  alignItems: 'end',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#d9cdbd',
                      fontWeight: 800,
                    }}
                  >
                    {text.walletBalance}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 32,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: '#fff',
                    }}
                  >
                    £{wallet.availableBalance.toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 38,
                    padding: '0 12px',
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚡ {text.readyToScan}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.amount}
            </div>

            <input
              value={amountInput}
              onChange={(e) => setAmountInput(sanitizeAmount(e.target.value))}
              inputMode="decimal"
              placeholder={text.amountPlaceholder}
              style={{
                width: '100%',
                height: 58,
                borderRadius: 22,
                border: '2px solid #111111',
                padding: '0 18px',
                fontSize: 20,
                fontWeight: 900,
                color: '#17130f',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />

            <div
              style={{
                marginTop: 14,
                fontSize: 14,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.quickAmounts}
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: 10,
              }}
            >
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(String(preset))}
                  style={{
                    minHeight: 48,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: Number(amountInput) === preset ? '#f4d84b' : '#fff',
                    color: '#17130f',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  £{preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{
                marginTop: 16,
                width: '100%',
                minHeight: 58,
                borderRadius: 22,
                border: '2px solid #111111',
                background: canGenerate ? '#f4d84b' : '#efe7bf',
                color: '#17130f',
                fontSize: 17,
                fontWeight: 900,
                cursor: canGenerate ? 'pointer' : 'not-allowed',
              }}
            >
              {barcodeValue ? text.regenerate : text.generate}
            </button>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.paymentCode}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#7b7268',
                lineHeight: 1.45,
                marginBottom: 14,
              }}
            >
              {text.paymentCodeHint}
            </div>

            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#fcfaf6',
                padding: 16,
              }}
            >
              {barcodeValue ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        minHeight: 38,
                        padding: '0 12px',
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: '#ecfdf3',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.readyToScan}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {formatMoney(amount)}
                    </div>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      overflow: 'hidden',
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      padding: 12,
                      boxSizing: 'border-box',
                    }}
                  >
                    <svg viewBox="0 0 240 150" width="100%" height="150" aria-label="barcode">
                      <rect x="0" y="0" width="240" height="150" fill="#ffffff" rx="16" />
                      {svgBars}
                    </svg>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      color: '#6f675f',
                      wordBreak: 'break-all',
                    }}
                  >
                    {barcodeValue}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    minHeight: 220,
                    borderRadius: 20,
                    border: '2px dashed #111111',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 20,
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#8b8176',
                    lineHeight: 1.5,
                  }}
                >
                  {text.scanInstruction}
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.summary}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                  {text.topUpAmount}
                </div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                  {formatMoney(amount)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#eef4ff',
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#6b7ba5' }}>
                  {text.platformFee}
                </div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: '#2563eb' }}>
                  {formatMoney(fee)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#ecfdf3',
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#5f7a69' }}>
                  {text.receiver}
                </div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                  {profile.fullName}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff4db',
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#8a6a1e' }}>
                  {text.totalFlow}
                </div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                  {formatMoney(totalFlow)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                lineHeight: 1.45,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.feeHint}
            </div>
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
