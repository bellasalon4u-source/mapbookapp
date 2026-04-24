'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getAppRegionSettings,
  updateAppRegionSettings,
  type AppCurrency,
  type SearchLocationMode,
} from '../../../services/appRegionStore';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

type PageTextShape = {
  title: string;
  subtitle: string;
  languageSection: string;
  currencySection: string;
  locationSection: string;
  useCurrentLocation: string;
  currentLocationHint: string;
  useRegionLocation: string;
  regionLocationHint: string;
  locationLoading: string;
  locationSuccess: string;
  locationError: string;
  selected: string;
  currentSetup: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Language & region',
    subtitle: 'Choose app language, currency and location mode',
    languageSection: 'Language',
    currencySection: 'Currency',
    locationSection: 'Location',
    useCurrentLocation: 'Use current location',
    currentLocationHint: 'Use your device GPS for search and map results',
    useRegionLocation: 'Use selected region',
    regionLocationHint: 'Search near your selected regional center',
    locationLoading: 'Getting current location...',
    locationSuccess: 'Current location selected',
    locationError: 'Unable to get current location',
    selected: 'Selected',
    currentSetup: 'Current setup',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
  },
  ES: {
    title: 'Idioma y región',
    subtitle: 'Elige idioma, moneda y modo de ubicación',
    languageSection: 'Idioma',
    currencySection: 'Moneda',
    locationSection: 'Ubicación',
    useCurrentLocation: 'Usar ubicación actual',
    currentLocationHint: 'Usa el GPS del dispositivo para búsqueda y mapa',
    useRegionLocation: 'Usar región seleccionada',
    regionLocationHint: 'Buscar cerca del centro regional seleccionado',
    locationLoading: 'Obteniendo ubicación actual...',
    locationSuccess: 'Ubicación actual seleccionada',
    locationError: 'No se pudo obtener la ubicación',
    selected: 'Seleccionado',
    currentSetup: 'Configuración actual',
    britishPound: 'Libra esterlina',
    euro: 'Euro',
    usDollar: 'Dólar estadounidense',
    polishZloty: 'Zloty polaco',
    czechKoruna: 'Corona checa',
    ukrainianHryvnia: 'Grivna ucraniana',
    uaeDirham: 'Dirham de EAU',
  },
  RU: {
    title: 'Язык и регион',
    subtitle: 'Выберите язык приложения, валюту и режим локации',
    languageSection: 'Язык',
    currencySection: 'Валюта',
    locationSection: 'Локация',
    useCurrentLocation: 'Использовать текущую локацию',
    currentLocationHint: 'Использовать GPS телефона для поиска и карты',
    useRegionLocation: 'Использовать выбранный регион',
    regionLocationHint: 'Искать рядом с центром выбранного региона',
    locationLoading: 'Определяем текущую локацию...',
    locationSuccess: 'Текущая локация выбрана',
    locationError: 'Не удалось определить локацию',
    selected: 'Выбрано',
    currentSetup: 'Текущая настройка',
    britishPound: 'Британский фунт',
    euro: 'Евро',
    usDollar: 'Доллар США',
    polishZloty: 'Польский злотый',
    czechKoruna: 'Чешская крона',
    ukrainianHryvnia: 'Украинская гривна',
    uaeDirham: 'Дирхам ОАЭ',
  },
  UA: {
    title: 'Мова і регіон',
    subtitle: 'Оберіть мову застосунку, валюту та режим локації',
    languageSection: 'Мова',
    currencySection: 'Валюта',
    locationSection: 'Локація',
    useCurrentLocation: 'Використовувати поточну локацію',
    currentLocationHint: 'Використовувати GPS телефону для пошуку та карти',
    useRegionLocation: 'Використовувати вибраний регіон',
    regionLocationHint: 'Шукати поруч із центром вибраного регіону',
    locationLoading: 'Визначаємо поточну локацію...',
    locationSuccess: 'Поточну локацію вибрано',
    locationError: 'Не вдалося визначити локацію',
    selected: 'Вибрано',
    currentSetup: 'Поточне налаштування',
    britishPound: 'Британський фунт',
    euro: 'Євро',
    usDollar: 'Долар США',
    polishZloty: 'Польський злотий',
    czechKoruna: 'Чеська крона',
    ukrainianHryvnia: 'Українська гривня',
    uaeDirham: 'Дирхам ОАЕ',
  },
  CZ: {
    title: 'Jazyk a region',
    subtitle: 'Vyberte jazyk aplikace, měnu a režim polohy',
    languageSection: 'Jazyk',
    currencySection: 'Měna',
    locationSection: 'Poloha',
    useCurrentLocation: 'Použít aktuální polohu',
    currentLocationHint: 'Použít GPS zařízení pro hledání a mapu',
    useRegionLocation: 'Použít vybraný region',
    regionLocationHint: 'Hledat poblíž středu vybraného regionu',
    locationLoading: 'Zjišťuji aktuální polohu...',
    locationSuccess: 'Aktuální poloha vybrána',
    locationError: 'Nepodařilo se zjistit polohu',
    selected: 'Vybráno',
    currentSetup: 'Aktuální nastavení',
    britishPound: 'Britská libra',
    euro: 'Euro',
    usDollar: 'Americký dolar',
    polishZloty: 'Polský zlotý',
    czechKoruna: 'Česká koruna',
    ukrainianHryvnia: 'Ukrajinská hřivna',
    uaeDirham: 'Dirham SAE',
  },
  DE: {
    title: 'Sprache & Region',
    subtitle: 'Wähle App-Sprache, Währung und Standortmodus',
    languageSection: 'Sprache',
    currencySection: 'Währung',
    locationSection: 'Standort',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    currentLocationHint: 'GPS des Geräts für Suche und Karte verwenden',
    useRegionLocation: 'Ausgewählte Region verwenden',
    regionLocationHint: 'In der Nähe des gewählten Regionalzentrums suchen',
    locationLoading: 'Aktueller Standort wird ermittelt...',
    locationSuccess: 'Aktueller Standort ausgewählt',
    locationError: 'Standort konnte nicht ermittelt werden',
    selected: 'Ausgewählt',
    currentSetup: 'Aktuelle Einstellung',
    britishPound: 'Britisches Pfund',
    euro: 'Euro',
    usDollar: 'US-Dollar',
    polishZloty: 'Polnischer Zloty',
    czechKoruna: 'Tschechische Krone',
    ukrainianHryvnia: 'Ukrainische Hrywnja',
    uaeDirham: 'VAE-Dirham',
  },
  IT: {
    title: 'Lingua e regione',
    subtitle: 'Scegli lingua app, valuta e modalità posizione',
    languageSection: 'Lingua',
    currencySection: 'Valuta',
    locationSection: 'Posizione',
    useCurrentLocation: 'Usa posizione attuale',
    currentLocationHint: 'Usa il GPS del dispositivo per ricerca e mappa',
    useRegionLocation: 'Usa regione selezionata',
    regionLocationHint: 'Cerca vicino al centro regionale selezionato',
    locationLoading: 'Recupero posizione attuale...',
    locationSuccess: 'Posizione attuale selezionata',
    locationError: 'Impossibile ottenere la posizione',
    selected: 'Selezionato',
    currentSetup: 'Configurazione attuale',
    britishPound: 'Sterlina britannica',
    euro: 'Euro',
    usDollar: 'Dollaro USA',
    polishZloty: 'Zloty polacco',
    czechKoruna: 'Corona ceca',
    ukrainianHryvnia: 'Grivnia ucraina',
    uaeDirham: 'Dirham EAU',
  },
  FR: {
    title: 'Langue et région',
    subtitle: 'Choisissez la langue, la devise et le mode de localisation',
    languageSection: 'Langue',
    currencySection: 'Devise',
    locationSection: 'Localisation',
    useCurrentLocation: 'Utiliser la position actuelle',
    currentLocationHint: 'Utiliser le GPS de votre appareil pour la recherche et la carte',
    useRegionLocation: 'Utiliser la région sélectionnée',
    regionLocationHint: 'Rechercher près du centre régional sélectionné',
    locationLoading: 'Récupération de la position actuelle...',
    locationSuccess: 'Position actuelle sélectionnée',
    locationError: 'Impossible d’obtenir la position',
    selected: 'Sélectionné',
    currentSetup: 'Réglage actuel',
    britishPound: 'Livre sterling',
    euro: 'Euro',
    usDollar: 'Dollar américain',
    polishZloty: 'Zloty polonais',
    czechKoruna: 'Couronne tchèque',
    ukrainianHryvnia: 'Hryvnia ukrainienne',
    uaeDirham: 'Dirham EAU',
  },
  AR: {
    title: 'اللغة والمنطقة',
    subtitle: 'اختر لغة التطبيق والعملة ووضع الموقع',
    languageSection: 'اللغة',
    currencySection: 'العملة',
    locationSection: 'الموقع',
    useCurrentLocation: 'استخدام الموقع الحالي',
    currentLocationHint: 'استخدام GPS الجهاز للبحث والخريطة',
    useRegionLocation: 'استخدام المنطقة المحددة',
    regionLocationHint: 'البحث قرب مركز المنطقة المحددة',
    locationLoading: 'جارٍ تحديد الموقع الحالي...',
    locationSuccess: 'تم اختيار الموقع الحالي',
    locationError: 'تعذر تحديد الموقع',
    selected: 'تم الاختيار',
    currentSetup: 'الإعداد الحالي',
    britishPound: 'الجنيه البريطاني',
    euro: 'اليورو',
    usDollar: 'الدولار الأمريكي',
    polishZloty: 'الزلوتي البولندي',
    czechKoruna: 'الكرونة التشيكية',
    ukrainianHryvnia: 'الهريفنيا الأوكرانية',
    uaeDirham: 'الدرهم الإماراتي',
  },
  PL: {
    title: 'Język i region',
    subtitle: 'Wybierz język aplikacji, walutę i tryb lokalizacji',
    languageSection: 'Język',
    currencySection: 'Waluta',
    locationSection: 'Lokalizacja',
    useCurrentLocation: 'Użyj bieżącej lokalizacji',
    currentLocationHint: 'Użyj GPS telefonu do wyszukiwania i mapy',
    useRegionLocation: 'Użyj wybranego regionu',
    regionLocationHint: 'Szukaj w pobliżu środka wybranego regionu',
    locationLoading: 'Pobieranie bieżącej lokalizacji...',
    locationSuccess: 'Wybrano bieżącą lokalizację',
    locationError: 'Nie udało się pobrać lokalizacji',
    selected: 'Wybrano',
    currentSetup: 'Bieżące ustawienie',
    britishPound: 'Funt brytyjski',
    euro: 'Euro',
    usDollar: 'Dolar amerykański',
    polishZloty: 'Złoty polski',
    czechKoruna: 'Korona czeska',
    ukrainianHryvnia: 'Hrywna ukraińska',
    uaeDirham: 'Dirham ZEA',
  },
};

const languageOptions: { value: AppLanguage; label: string; flag: string }[] = [
  { value: 'EN', label: 'English', flag: '🇬🇧' },
  { value: 'ES', label: 'Español', flag: '🇪🇸' },
  { value: 'RU', label: 'Русский', flag: '🇷🇺' },
  { value: 'UA', label: 'Українська', flag: '🇺🇦' },
  { value: 'CZ', label: 'Čeština', flag: '🇨🇿' },
  { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { value: 'FR', label: 'Français', flag: '🇫🇷' },
  { value: 'AR', label: 'العربية', flag: '🇸🇦' },
  { value: 'PL', label: 'Polski', flag: '🇵🇱' },
];

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
  ];
}

function getCurrentLocationLabel(language: AppLanguage) {
  if (language === 'ES') return 'Ubicación actual';
  if (language === 'RU') return 'Текущее местоположение';
  if (language === 'UA') return 'Поточна локація';
  if (language === 'CZ') return 'Aktuální poloha';
  if (language === 'DE') return 'Aktueller Standort';
  if (language === 'IT') return 'Posizione attuale';
  if (language === 'FR') return 'Position actuelle';
  if (language === 'AR') return 'الموقع الحالي';
  if (language === 'PL') return 'Bieżąca lokalizacja';
  return 'Current location';
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: '2px solid #111111',
        background: checked ? '#2ea44f' : '#ffffff',
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 900,
        color: '#17130f',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 14,
        border: '2px solid #111111',
      }}
    >
      {children}
    </div>
  );
}

export default function LanguageRegionPage() {
  const router = useRouter();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  const initialSettings = getAppRegionSettings();

  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedCurrency, setSelectedCurrency] = useState<AppCurrency>(initialSettings.currency);
  const [selectedLocationMode, setSelectedLocationMode] = useState<SearchLocationMode>(
    initialSettings.locationMode
  );
  const [currentLocationLabel, setCurrentLocationLabel] = useState(
    initialSettings.currentLocation.label || getCurrentLocationLabel(getSavedLanguage())
  );
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
      setSelectedLanguage(nextLanguage);
    });

    const syncProfile = () => {
      setProfile(getUserProfile());
    };

    const unsubProfile = subscribeToUserProfile(syncProfile);

    return () => {
      unsubLanguage();
      unsubProfile();

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const text = pageTexts[language] || pageTexts.EN;
  const currencyOptions = useMemo(() => getCurrencyOptions(text), [text]);

  const closeAfterLanguageSelect = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
        return;
      }

      router.push('/');
    }, 650);
  };

  const applyLanguage = (nextLanguage: AppLanguage) => {
    setSelectedLanguage(nextLanguage);
    setLanguage(nextLanguage);

    saveLanguage(nextLanguage);

    updateAppRegionSettings({
      language: nextLanguage,
    });

    updateUserProfile({
      language: nextLanguage,
    });

    closeAfterLanguageSelect();
  };

  const applyCurrency = (nextCurrency: AppCurrency) => {
    setSelectedCurrency(nextCurrency);

    updateAppRegionSettings({
      currency: nextCurrency,
    });
  };

  const applyLocationMode = (mode: SearchLocationMode) => {
    setSelectedLocationMode(mode);

    updateAppRegionSettings({
      locationMode: mode,
    });
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert(text.locationError);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const label = getCurrentLocationLabel(selectedLanguage);

        setCurrentLocationLabel(label);
        setSelectedLocationMode('current');
        setIsLocating(false);

        updateAppRegionSettings({
          locationMode: 'current',
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label,
          },
        });

        alert((pageTexts[selectedLanguage] || pageTexts.EN).locationSuccess);
      },
      () => {
        setIsLocating(false);
        alert((pageTexts[selectedLanguage] || pageTexts.EN).locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleUseRegionLocation = () => {
    applyLocationMode('custom');
  };

  const currentLanguageMeta =
    languageOptions.find((item) => item.value === selectedLanguage) || languageOptions[0];
  const currentCurrencyMeta =
    currencyOptions.find((item) => item.value === selectedCurrency) || currencyOptions[0];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '16px 14px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 24,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

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
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <SectionTitle>{text.currentSetup}</SectionTitle>

            <div style={{ display: 'grid', gap: 10 }}>
              <div
                style={{
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                  {text.languageSection}
                </div>
                <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                  {currentLanguageMeta.flag} {currentLanguageMeta.label}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                  {text.currencySection}
                </div>
                <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                  {currentCurrencyMeta.symbol} {currentCurrencyMeta.title}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                  {text.locationSection}
                </div>
                <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                  {selectedLocationMode === 'current'
                    ? currentLocationLabel
                    : text.useRegionLocation}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.languageSection}</SectionTitle>

            <div style={{ display: 'grid', gap: 8 }}>
              {languageOptions.map((option) => {
                const checked = selectedLanguage === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => applyLanguage(option.value)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '34px 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 12px',
                      background: checked ? '#f7f1e7' : '#fff',
                      border: '2px solid #111111',
                      textAlign: 'left',
                      borderRadius: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{option.flag}</div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {option.label}
                    </div>

                    <CheckMark checked={checked} />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.currencySection}</SectionTitle>

            <div style={{ display: 'grid', gap: 8 }}>
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
                      padding: '12px 12px',
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
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                        {option.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#7c746a', fontWeight: 700 }}>
                        {option.subtitle}
                      </div>
                    </div>

                    <CheckMark checked={checked} />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.locationSection}</SectionTitle>

            <div style={{ display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  background: selectedLocationMode === 'current' ? '#f7f1e7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 18,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 22 }}>📍</div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                    {isLocating ? text.locationLoading : text.useCurrentLocation}
                  </div>
                  <div style={{ fontSize: 12, color: '#7c746a', fontWeight: 700, marginTop: 4 }}>
                    {text.currentLocationHint}
                  </div>
                </div>

                <CheckMark checked={selectedLocationMode === 'current'} />
              </button>

              <button
                type="button"
                onClick={handleUseRegionLocation}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  background: selectedLocationMode === 'custom' ? '#f7f1e7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 18,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 22 }}>🗺️</div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                    {text.useRegionLocation}
                  </div>
                  <div style={{ fontSize: 12, color: '#7c746a', fontWeight: 700, marginTop: 4 }}>
                    {text.regionLocationHint}
                  </div>
                </div>

                <CheckMark checked={selectedLocationMode === 'custom'} />
              </button>
            </div>
          </Card>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '12px 14px',
              border: '2px solid #111111',
              color: '#6d6459',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {profile.fullName} · {selectedLanguage} · {selectedCurrency}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
