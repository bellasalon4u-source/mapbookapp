'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getAppRegionSettings,
  updateAppRegionSettings,
  type AppCurrency,
} from '../../../services/appRegionStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type PageTextShape = {
  title: string;
  subtitle: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
  chineseYuan: string;
  swedishKrona: string;
  danishKrone: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Currency',
    subtitle: 'Choose app currency',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
    chineseYuan: 'Chinese Yuan',
    swedishKrona: 'Swedish Krona',
    danishKrone: 'Danish Krone',
  },
  ES: {
    title: 'Moneda',
    subtitle: 'Elige la moneda de la aplicación',
    britishPound: 'Libra esterlina',
    euro: 'Euro',
    usDollar: 'Dólar estadounidense',
    polishZloty: 'Zloty polaco',
    czechKoruna: 'Corona checa',
    ukrainianHryvnia: 'Grivna ucraniana',
    uaeDirham: 'Dirham de EAU',
    chineseYuan: 'Yuan chino',
    swedishKrona: 'Corona sueca',
    danishKrone: 'Corona danesa',
  },
  RU: {
    title: 'Валюта',
    subtitle: 'Выберите валюту приложения',
    britishPound: 'Британский фунт',
    euro: 'Евро',
    usDollar: 'Доллар США',
    polishZloty: 'Польский злотый',
    czechKoruna: 'Чешская крона',
    ukrainianHryvnia: 'Украинская гривна',
    uaeDirham: 'Дирхам ОАЭ',
    chineseYuan: 'Китайский юань',
    swedishKrona: 'Шведская крона',
    danishKrone: 'Датская крона',
  },
  UA: {
    title: 'Валюта',
    subtitle: 'Оберіть валюту застосунку',
    britishPound: 'Британський фунт',
    euro: 'Євро',
    usDollar: 'Долар США',
    polishZloty: 'Польський злотий',
    czechKoruna: 'Чеська крона',
    ukrainianHryvnia: 'Українська гривня',
    uaeDirham: 'Дирхам ОАЕ',
    chineseYuan: 'Китайський юань',
    swedishKrona: 'Шведська крона',
    danishKrone: 'Данська крона',
  },
  CZ: {
    title: 'Měna',
    subtitle: 'Vyberte měnu aplikace',
    britishPound: 'Britská libra',
    euro: 'Euro',
    usDollar: 'Americký dolar',
    polishZloty: 'Polský zlotý',
    czechKoruna: 'Česká koruna',
    ukrainianHryvnia: 'Ukrajinská hřivna',
    uaeDirham: 'Dirham SAE',
    chineseYuan: 'Čínský jüan',
    swedishKrona: 'Švédská koruna',
    danishKrone: 'Dánská koruna',
  },
  DE: {
    title: 'Währung',
    subtitle: 'Wähle die App-Währung',
    britishPound: 'Britisches Pfund',
    euro: 'Euro',
    usDollar: 'US-Dollar',
    polishZloty: 'Polnischer Zloty',
    czechKoruna: 'Tschechische Krone',
    ukrainianHryvnia: 'Ukrainische Hrywnja',
    uaeDirham: 'VAE-Dirham',
    chineseYuan: 'Chinesischer Yuan',
    swedishKrona: 'Schwedische Krone',
    danishKrone: 'Dänische Krone',
  },
  IT: {
    title: 'Valuta',
    subtitle: 'Scegli la valuta dell’app',
    britishPound: 'Sterlina britannica',
    euro: 'Euro',
    usDollar: 'Dollaro USA',
    polishZloty: 'Zloty polacco',
    czechKoruna: 'Corona ceca',
    ukrainianHryvnia: 'Grivnia ucraina',
    uaeDirham: 'Dirham EAU',
    chineseYuan: 'Yuan cinese',
    swedishKrona: 'Corona svedese',
    danishKrone: 'Corona danese',
  },
  FR: {
    title: 'Devise',
    subtitle: 'Choisissez la devise de l’application',
    britishPound: 'Livre sterling',
    euro: 'Euro',
    usDollar: 'Dollar américain',
    polishZloty: 'Zloty polonais',
    czechKoruna: 'Couronne tchèque',
    ukrainianHryvnia: 'Hryvnia ukrainienne',
    uaeDirham: 'Dirham EAU',
    chineseYuan: 'Yuan chinois',
    swedishKrona: 'Couronne suédoise',
    danishKrone: 'Couronne danoise',
  },
  AR: {
    title: 'العملة',
    subtitle: 'اختر عملة التطبيق',
    britishPound: 'الجنيه البريطاني',
    euro: 'اليورو',
    usDollar: 'الدولار الأمريكي',
    polishZloty: 'الزلوتي البولندي',
    czechKoruna: 'الكرونة التشيكية',
    ukrainianHryvnia: 'الهريفنيا الأوكرانية',
    uaeDirham: 'الدرهم الإماراتي',
    chineseYuan: 'اليوان الصيني',
    swedishKrona: 'الكرونة السويدية',
    danishKrone: 'الكرونة الدنماركية',
  },
  PL: {
    title: 'Waluta',
    subtitle: 'Wybierz walutę aplikacji',
    britishPound: 'Funt brytyjski',
    euro: 'Euro',
    usDollar: 'Dolar amerykański',
    polishZloty: 'Złoty polski',
    czechKoruna: 'Korona czeska',
    ukrainianHryvnia: 'Hrywna ukraińska',
    uaeDirham: 'Dirham ZEA',
    chineseYuan: 'Juan chiński',
    swedishKrona: 'Korona szwedzka',
    danishKrone: 'Korona duńska',
  },
};

type CurrencyOption = {
  value: AppCurrency;
  symbol: string;
  title: string;
  subtitle: string;
};

function getCurrencyOptions(text: PageTextShape): CurrencyOption[] {
  return [
    { value: 'GBP', symbol: '£', title: 'GBP', subtitle: text.britishPound },
    { value: 'EUR', symbol: '€', title: 'EUR', subtitle: text.euro },
    { value: 'USD', symbol: '$', title: 'USD', subtitle: text.usDollar },
    { value: 'PLN', symbol: 'zł', title: 'PLN', subtitle: text.polishZloty },
    { value: 'CZK', symbol: 'Kč', title: 'CZK', subtitle: text.czechKoruna },
    { value: 'UAH', symbol: '₴', title: 'UAH', subtitle: text.ukrainianHryvnia },
    { value: 'AED', symbol: 'AED', title: 'AED', subtitle: text.uaeDirham },
    { value: 'CNY', symbol: 'CN¥', title: 'CNY', subtitle: text.chineseYuan },
    { value: 'SEK', symbol: 'SEK', title: 'SEK', subtitle: text.swedishKrona },
    { value: 'DKK', symbol: 'DKK', title: 'DKK', subtitle: text.danishKrone },
  ];
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: '2px solid #111111',
        background: checked ? '#35c94a' : '#ffffff',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {checked ? '✓' : ''}
    </div>
  );
}

export default function CurrencyPage() {
  const router = useRouter();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedCurrency, setSelectedCurrency] = useState<AppCurrency>(
    getAppRegionSettings().currency
  );

  const text = pageTexts[language] || pageTexts.EN;
  const currencyOptions = useMemo(() => getCurrencyOptions(text), [text]);

  useEffect(() => {
    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubscribe();

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const closePage = () => {
    router.back();
  };

  const applyCurrency = (nextCurrency: AppCurrency) => {
    setSelectedCurrency(nextCurrency);

    updateAppRegionSettings({
      currency: nextCurrency,
    });

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      router.back();
    }, 450);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f4ef',
        padding: '16px 14px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 52px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {text.title}
            </h1>

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
            onClick={closePage}
            aria-label="Close"
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 28,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 26,
            padding: 14,
            border: '2px solid #111111',
            display: 'grid',
            gap: 10,
          }}
        >
          {currencyOptions.map((option) => {
            const checked = selectedCurrency === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => applyCurrency(option.value)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '62px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  background: checked ? '#f7f1e7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 18,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {option.symbol}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {option.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#7c746a',
                      fontWeight: 700,
                    }}
                  >
                    {option.subtitle}
                  </div>
                </div>

                <CheckMark checked={checked} />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
