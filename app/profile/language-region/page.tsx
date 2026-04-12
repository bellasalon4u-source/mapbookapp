'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '../../../services/appRegionStore';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'PLN' | 'CZK' | 'UAH' | 'AED';

type StoredLocation = {
  source: 'current' | 'region';
  label: string;
  lat: number | null;
  lng: number | null;
};

const pageTexts = {
  EN: {
    title: 'Language & region',
    subtitle: 'App language, country, currency and location mode',
    save: 'Save',
    languageSection: 'Languages available in app',
    regionSection: 'Countries / regions',
    currencySection: 'Currency',
    locationSection: 'Location',
    useCurrentLocation: 'Use current location',
    currentLocationHint: 'Use your device GPS for search and map results',
    useRegionLocation: 'Use selected region',
    regionLocationHint: 'Search near the selected country or region center',
    locationLoading: 'Getting current location...',
    locationSuccess: 'Current location selected',
    locationError: 'Unable to get current location',
    saved: 'Settings saved',
    selected: 'Selected',
    languageApp: 'App language',
    overview: 'Current setup',
    livePreview: 'Live preview',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
    londonEurope: 'London · Europe',
    madridEurope: 'Madrid · Europe',
    pragueEurope: 'Prague · Europe',
    berlinEurope: 'Berlin · Europe',
    warsawEurope: 'Warsaw · Europe',
    kyivEurope: 'Kyiv · Europe',
    newYorkNA: 'New York · North America',
    dubaiME: 'Dubai · Middle East',
  },
  ES: {
    title: 'Idioma y región',
    subtitle: 'Idioma de la app, país, moneda y modo de ubicación',
    save: 'Guardar',
    languageSection: 'Idiomas disponibles en la app',
    regionSection: 'Países / regiones',
    currencySection: 'Moneda',
    locationSection: 'Ubicación',
    useCurrentLocation: 'Usar ubicación actual',
    currentLocationHint: 'Usa el GPS del dispositivo para búsqueda y mapa',
    useRegionLocation: 'Usar región seleccionada',
    regionLocationHint: 'Buscar cerca del centro del país o región seleccionados',
    locationLoading: 'Obteniendo ubicación actual...',
    locationSuccess: 'Ubicación actual seleccionada',
    locationError: 'No se pudo obtener la ubicación',
    saved: 'Ajustes guardados',
    selected: 'Seleccionado',
    languageApp: 'Idioma de la app',
    overview: 'Configuración actual',
    livePreview: 'Vista previa',
    britishPound: 'Libra esterlina',
    euro: 'Euro',
    usDollar: 'Dólar estadounidense',
    polishZloty: 'Zloty polaco',
    czechKoruna: 'Corona checa',
    ukrainianHryvnia: 'Grivna ucraniana',
    uaeDirham: 'Dirham de EAU',
    londonEurope: 'Londres · Europa',
    madridEurope: 'Madrid · Europa',
    pragueEurope: 'Praga · Europa',
    berlinEurope: 'Berlín · Europa',
    warsawEurope: 'Varsovia · Europa',
    kyivEurope: 'Kyiv · Europa',
    newYorkNA: 'Nueva York · Norteamérica',
    dubaiME: 'Dubái · Oriente Medio',
  },
  RU: {
    title: 'Язык и регион',
    subtitle: 'Язык приложения, страна, валюта и режим локации',
    save: 'Сохранить',
    languageSection: 'Языки приложения',
    regionSection: 'Страны / регионы',
    currencySection: 'Валюта',
    locationSection: 'Локация',
    useCurrentLocation: 'Использовать текущую локацию',
    currentLocationHint: 'Использовать GPS телефона для поиска и карты',
    useRegionLocation: 'Использовать выбранный регион',
    regionLocationHint: 'Искать рядом с центром выбранной страны или региона',
    locationLoading: 'Определяем текущую локацию...',
    locationSuccess: 'Текущая локация выбрана',
    locationError: 'Не удалось определить локацию',
    saved: 'Настройки сохранены',
    selected: 'Выбрано',
    languageApp: 'Язык приложения',
    overview: 'Текущая конфигурация',
    livePreview: 'Предпросмотр',
    britishPound: 'Британский фунт',
    euro: 'Евро',
    usDollar: 'Доллар США',
    polishZloty: 'Польский злотый',
    czechKoruna: 'Чешская крона',
    ukrainianHryvnia: 'Украинская гривна',
    uaeDirham: 'Дирхам ОАЭ',
    londonEurope: 'Лондон · Европа',
    madridEurope: 'Мадрид · Европа',
    pragueEurope: 'Прага · Европа',
    berlinEurope: 'Берлин · Европа',
    warsawEurope: 'Варшава · Европа',
    kyivEurope: 'Киев · Европа',
    newYorkNA: 'Нью-Йорк · Северная Америка',
    dubaiME: 'Дубай · Ближний Восток',
  },
  CZ: {
    title: 'Jazyk a region',
    subtitle: 'Jazyk aplikace, země, měna a režim polohy',
    save: 'Uložit',
    languageSection: 'Jazyky aplikace',
    regionSection: 'Země / regiony',
    currencySection: 'Měna',
    locationSection: 'Poloha',
    useCurrentLocation: 'Použít aktuální polohu',
    currentLocationHint: 'Použít GPS zařízení pro hledání a mapu',
    useRegionLocation: 'Použít vybraný region',
    regionLocationHint: 'Hledat poblíž středu vybrané země nebo regionu',
    locationLoading: 'Zjišťuji aktuální polohu...',
    locationSuccess: 'Aktuální poloha vybrána',
    locationError: 'Nepodařilo se zjistit polohu',
    saved: 'Nastavení uloženo',
    selected: 'Vybráno',
    languageApp: 'Jazyk aplikace',
    overview: 'Aktuální nastavení',
    livePreview: 'Náhled',
    britishPound: 'Britská libra',
    euro: 'Euro',
    usDollar: 'Americký dolar',
    polishZloty: 'Polský zlotý',
    czechKoruna: 'Česká koruna',
    ukrainianHryvnia: 'Ukrajinská hřivna',
    uaeDirham: 'Dirham SAE',
    londonEurope: 'Londýn · Evropa',
    madridEurope: 'Madrid · Evropa',
    pragueEurope: 'Praha · Evropa',
    berlinEurope: 'Berlín · Evropa',
    warsawEurope: 'Varšava · Evropa',
    kyivEurope: 'Kyjev · Evropa',
    newYorkNA: 'New York · Severní Amerika',
    dubaiME: 'Dubaj · Blízký východ',
  },
  DE: {
    title: 'Sprache & Region',
    subtitle: 'App-Sprache, Land, Währung und Standortmodus',
    save: 'Speichern',
    languageSection: 'Verfügbare App-Sprachen',
    regionSection: 'Länder / Regionen',
    currencySection: 'Währung',
    locationSection: 'Standort',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    currentLocationHint: 'GPS des Geräts für Suche und Karte verwenden',
    useRegionLocation: 'Ausgewählte Region verwenden',
    regionLocationHint: 'In der Nähe des Zentrums des gewählten Landes oder der Region suchen',
    locationLoading: 'Aktueller Standort wird ermittelt...',
    locationSuccess: 'Aktueller Standort ausgewählt',
    locationError: 'Standort konnte nicht ermittelt werden',
    saved: 'Einstellungen gespeichert',
    selected: 'Ausgewählt',
    languageApp: 'App-Sprache',
    overview: 'Aktuelle Konfiguration',
    livePreview: 'Vorschau',
    britishPound: 'Britisches Pfund',
    euro: 'Euro',
    usDollar: 'US-Dollar',
    polishZloty: 'Polnischer Zloty',
    czechKoruna: 'Tschechische Krone',
    ukrainianHryvnia: 'Ukrainische Hrywnja',
    uaeDirham: 'VAE-Dirham',
    londonEurope: 'London · Europa',
    madridEurope: 'Madrid · Europa',
    pragueEurope: 'Prag · Europa',
    berlinEurope: 'Berlin · Europa',
    warsawEurope: 'Warschau · Europa',
    kyivEurope: 'Kyjiw · Europa',
    newYorkNA: 'New York · Nordamerika',
    dubaiME: 'Dubai · Naher Osten',
  },
  PL: {
    title: 'Język i region',
    subtitle: 'Język aplikacji, kraj, waluta i tryb lokalizacji',
    save: 'Zapisz',
    languageSection: 'Języki aplikacji',
    regionSection: 'Kraje / regiony',
    currencySection: 'Waluta',
    locationSection: 'Lokalizacja',
    useCurrentLocation: 'Użyj bieżącej lokalizacji',
    currentLocationHint: 'Użyj GPS telefonu do wyszukiwania i mapy',
    useRegionLocation: 'Użyj wybranego regionu',
    regionLocationHint: 'Szukaj w pobliżu centrum wybranego kraju lub regionu',
    locationLoading: 'Pobieranie bieżącej lokalizacji...',
    locationSuccess: 'Wybrano bieżącą lokalizację',
    locationError: 'Nie udało się pobrać lokalizacji',
    saved: 'Ustawienia zapisane',
    selected: 'Wybrano',
    languageApp: 'Język aplikacji',
    overview: 'Aktualna konfiguracja',
    livePreview: 'Podgląd',
    britishPound: 'Funt brytyjski',
    euro: 'Euro',
    usDollar: 'Dolar amerykański',
    polishZloty: 'Złoty polski',
    czechKoruna: 'Korona czeska',
    ukrainianHryvnia: 'Hrywna ukraińska',
    uaeDirham: 'Dirham ZEA',
    londonEurope: 'Londyn · Europa',
    madridEurope: 'Madryt · Europa',
    pragueEurope: 'Praga · Europa',
    berlinEurope: 'Berlin · Europa',
    warsawEurope: 'Warszawa · Europa',
    kyivEurope: 'Kijów · Europa',
    newYorkNA: 'Nowy Jork · Ameryka Północna',
    dubaiME: 'Dubaj · Bliski Wschód',
  },
} as const;

type PageText = {
  title: string;
  subtitle: string;
  save: string;
  languageSection: string;
  regionSection: string;
  currencySection: string;
  locationSection: string;
  useCurrentLocation: string;
  currentLocationHint: string;
  useRegionLocation: string;
  regionLocationHint: string;
  locationLoading: string;
  locationSuccess: string;
  locationError: string;
  saved: string;
  selected: string;
  languageApp: string;
  overview: string;
  livePreview: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
  londonEurope: string;
  madridEurope: string;
  pragueEurope: string;
  berlinEurope: string;
  warsawEurope: string;
  kyivEurope: string;
  newYorkNA: string;
  dubaiME: string;
};

const languageOptions: { value: AppLanguage; label: string; flag: string }[] = [
  { value: 'EN', label: 'English', flag: '🇬🇧' },
  { value: 'ES', label: 'Español', flag: '🇪🇸' },
  { value: 'RU', label: 'Русский', flag: '🇷🇺' },
  { value: 'CZ', label: 'Čeština', flag: '🇨🇿' },
  { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'PL', label: 'Polski', flag: '🇵🇱' },
];

function getRegionOptions(text: PageText) {
  return [
    {
      value: 'United Kingdom',
      label: 'United Kingdom',
      subtitle: text.londonEurope,
      flag: '🇬🇧',
      lat: 51.5074,
      lng: -0.1278,
      currency: 'GBP' as CurrencyCode,
    },
    {
      value: 'Spain',
      label: 'Spain',
      subtitle: text.madridEurope,
      flag: '🇪🇸',
      lat: 40.4168,
      lng: -3.7038,
      currency: 'EUR' as CurrencyCode,
    },
    {
      value: 'Czech Republic',
      label: 'Czech Republic',
      subtitle: text.pragueEurope,
      flag: '🇨🇿',
      lat: 50.0755,
      lng: 14.4378,
      currency: 'CZK' as CurrencyCode,
    },
    {
      value: 'Germany',
      label: 'Germany',
      subtitle: text.berlinEurope,
      flag: '🇩🇪',
      lat: 52.52,
      lng: 13.405,
      currency: 'EUR' as CurrencyCode,
    },
    {
      value: 'Poland',
      label: 'Poland',
      subtitle: text.warsawEurope,
      flag: '🇵🇱',
      lat: 52.2297,
      lng: 21.0122,
      currency: 'PLN' as CurrencyCode,
    },
    {
      value: 'Ukraine',
      label: 'Ukraine',
      subtitle: text.kyivEurope,
      flag: '🇺🇦',
      lat: 50.4501,
      lng: 30.5234,
      currency: 'UAH' as CurrencyCode,
    },
    {
      value: 'United States',
      label: 'United States',
      subtitle: text.newYorkNA,
      flag: '🇺🇸',
      lat: 40.7128,
      lng: -74.006,
      currency: 'USD' as CurrencyCode,
    },
    {
      value: 'United Arab Emirates',
      label: 'United Arab Emirates',
      subtitle: text.dubaiME,
      flag: '🇦🇪',
      lat: 25.2048,
      lng: 55.2708,
      currency: 'AED' as CurrencyCode,
    },
  ] as const;
}

function getCurrencyOptions(text: PageText) {
  return [
    { value: 'GBP', symbol: '£', title: 'GBP', subtitle: text.britishPound },
    { value: 'EUR', symbol: '€', title: 'EUR', subtitle: text.euro },
    { value: 'USD', symbol: '$', title: 'USD', subtitle: text.usDollar },
    { value: 'PLN', symbol: 'zł', title: 'PLN', subtitle: text.polishZloty },
    { value: 'CZK', symbol: 'Kč', title: 'CZK', subtitle: text.czechKoruna },
    { value: 'UAH', symbol: '₴', title: 'UAH', subtitle: text.ukrainianHryvnia },
    { value: 'AED', symbol: 'AED', title: 'AED', subtitle: text.uaeDirham },
  ] as const;
}

function getCurrentLocationLabel(language: AppLanguage) {
  if (language === 'ES') return 'Ubicación actual';
  if (language === 'RU') return 'Текущее местоположение';
  if (language === 'CZ') return 'Aktuální poloha';
  if (language === 'DE') return 'Aktueller Standort';
  if (language === 'PL') return 'Bieżąca lokalizacja';
  return 'Current location';
}

function formatCoords(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return '';
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        border: checked ? '2px solid #111111' : '2px solid #d8d3c8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: '#fff',
      }}
    >
      {checked ? (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: '#111111',
          }}
        />
      ) : null}
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

export default function LanguageRegionPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());

  const initialRegionSettings = getAppRegionSettings();

  const [selectedRegion, setSelectedRegion] = useState(initialRegionSettings.region);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    initialRegionSettings.currency as CurrencyCode
  );
  const [selectedLocationMode, setSelectedLocationMode] = useState<'current' | 'region'>(
    initialRegionSettings.locationMode === 'current' ? 'current' : 'region'
  );
  const [selectedLocation, setSelectedLocation] = useState<StoredLocation>({
    source: initialRegionSettings.locationMode === 'current' ? 'current' : 'region',
    label:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.label
        : initialRegionSettings.customLocation.label,
    lat:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.lat
        : initialRegionSettings.customLocation.lat,
    lng:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.lng
        : initialRegionSettings.customLocation.lng,
  });

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
    };
  }, []);

  useEffect(() => {
    saveLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const text: PageText = useMemo(
    () => (pageTexts[language as keyof typeof pageTexts] || pageTexts.EN) as PageText,
    [language]
  );

  const regionOptions = useMemo(() => getRegionOptions(text), [text]);
  const currencyOptions = useMemo(() => getCurrencyOptions(text), [text]);

  const selectedRegionMeta =
    regionOptions.find((item) => item.value === selectedRegion) || regionOptions[0];

  const locationSummary = useMemo(() => {
    if (selectedLocation?.label) {
      const coords = formatCoords(selectedLocation.lat, selectedLocation.lng);
      return coords ? `${selectedLocation.label} · ${coords}` : selectedLocation.label;
    }

    return `${selectedRegionMeta.label} · ${selectedRegionMeta.subtitle}`;
  }, [selectedLocation, selectedRegionMeta]);

  const handleUseRegionLocation = () => {
    const nextLocation: StoredLocation = {
      source: 'region',
      label: selectedRegionMeta.label,
      lat: selectedRegionMeta.lat,
      lng: selectedRegionMeta.lng,
    };

    setSelectedLocationMode('region');
    setSelectedLocation(nextLocation);
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert(text.locationError);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: StoredLocation = {
          source: 'current',
          label: getCurrentLocationLabel(selectedLanguage),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocationMode('current');
        setSelectedLocation(nextLocation);
        setIsLocating(false);
        alert(text.locationSuccess);
      },
      () => {
        setIsLocating(false);
        alert(text.locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = () => {
    saveLanguage(selectedLanguage);

    const regionLocation = {
      lat: selectedRegionMeta.lat,
      lng: selectedRegionMeta.lng,
      label: selectedRegionMeta.label,
    };

    const currentLocation =
      selectedLocationMode === 'current'
        ? {
            lat: selectedLocation?.lat ?? null,
            lng: selectedLocation?.lng ?? null,
            label: selectedLocation?.label || getCurrentLocationLabel(selectedLanguage),
          }
        : {
            lat: initialRegionSettings.currentLocation.lat,
            lng: initialRegionSettings.currentLocation.lng,
            label:
              initialRegionSettings.currentLocation.label ||
              getCurrentLocationLabel(selectedLanguage),
          };

    updateAppRegionSettings({
      language: selectedLanguage,
      region: selectedRegion,
      currency: selectedCurrency,
      locationMode: selectedLocationMode === 'current' ? 'current' : 'custom',
      currentLocation,
      customLocation: regionLocation,
    });

    updateUserProfile({
      language: selectedLanguage,
      region: selectedRegion,
    });

    alert((pageTexts[selectedLanguage as keyof typeof pageTexts] || pageTexts.EN).saved);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr auto',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e8dfd2',
              background: '#fff',
              fontSize: 26,
              fontWeight: 900,
              color: '#17130f',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
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
              }}
            >
              {text.title}
            </h1>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{
              border: 'none',
              background: '#17130f',
              color: '#fff',
              borderRadius: 999,
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(23,19,15,0.18)',
            }}
          >
            {text.save}
          </button>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            borderRadius: 30,
            padding: 18,
            border: '1px solid #eee5d9',
            boxShadow: '0 12px 28px rgba(0,0,0,0.04)',
            marginBottom: 14,
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
            {text.overview}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800, marginBottom: 4 }}>
                {text.languageApp}
              </div>
              <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                {languageOptions.find((item) => item.value === selectedLanguage)?.flag}{' '}
                {languageOptions.find((item) => item.value === selectedLanguage)?.label}
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800, marginBottom: 4 }}>
                {text.selected}
              </div>
              <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                {selectedRegion} · {selectedCurrency}
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800, marginBottom: 4 }}>
                {text.livePreview}
              </div>
              <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                {locationSummary}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: 18,
            border: '1px solid #eee5d9',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            marginBottom: 14,
          }}
        >
          <SectionTitle>{text.languageSection}</SectionTitle>

          <div>
            {languageOptions.map((option, index) => {
              const checked = selectedLanguage === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedLanguage(option.value)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 4px',
                    background: checked ? '#faf6ef' : 'transparent',
                    border: 'none',
                    borderBottom:
                      index !== languageOptions.length - 1 ? '1px solid #eee7dc' : 'none',
                    textAlign: 'left',
                    borderRadius: 18,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 24 }}>{option.flag}</div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                      {text.languageApp}
                    </div>
                  </div>

                  <Radio checked={checked} />
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: 18,
            border: '1px solid #eee5d9',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            marginBottom: 14,
          }}
        >
          <SectionTitle>{text.regionSection}</SectionTitle>

          <div>
            {regionOptions.map((option, index) => {
              const checked = selectedRegion === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(option.value);

                    if (selectedCurrency === selectedRegionMeta.currency) {
                      setSelectedCurrency(option.currency);
                    }

                    if (selectedLocationMode === 'region') {
                      setSelectedLocation({
                        source: 'region',
                        label: option.label,
                        lat: option.lat,
                        lng: option.lng,
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 4px',
                    background: checked ? '#faf6ef' : 'transparent',
                    border: 'none',
                    borderBottom:
                      index !== regionOptions.length - 1 ? '1px solid #eee7dc' : 'none',
                    textAlign: 'left',
                    borderRadius: 18,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 24 }}>{option.flag}</div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                      {option.subtitle}
                    </div>
                  </div>

                  <Radio checked={checked} />
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: 18,
            border: '1px solid #eee5d9',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            marginBottom: 14,
          }}
        >
          <SectionTitle>{text.currencySection}</SectionTitle>

          <div>
            {currencyOptions.map((option, index) => {
              const checked = selectedCurrency === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedCurrency(option.value)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '62px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 4px',
                    background: checked ? '#faf6ef' : 'transparent',
                    border: 'none',
                    borderBottom:
                      index !== currencyOptions.length - 1 ? '1px solid #eee7dc' : 'none',
                    textAlign: 'left',
                    borderRadius: 18,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {option.symbol}
                  </div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                      {option.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                      {option.subtitle}
                    </div>
                  </div>

                  <Radio checked={checked} />
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: 18,
            border: '1px solid #eee5d9',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            marginBottom: 14,
          }}
        >
          <SectionTitle>{text.locationSection}</SectionTitle>

          <div
            style={{
              borderBottom: '1px solid #eee7dc',
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '34px 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '14px 4px',
                background: selectedLocationMode === 'current' ? '#faf6ef' : 'transparent',
                border: 'none',
                textAlign: 'left',
                borderRadius: 18,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 24 }}>📍</div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                  {isLocating ? text.locationLoading : text.useCurrentLocation}
                </div>
                <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                  {text.currentLocationHint}
                </div>
              </div>

              <Radio checked={selectedLocationMode === 'current'} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleUseRegionLocation}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '34px 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '14px 4px',
              background: selectedLocationMode === 'region' ? '#faf6ef' : 'transparent',
              border: 'none',
              textAlign: 'left',
              borderRadius: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 24 }}>🗺️</div>

            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                {text.useRegionLocation}
              </div>
              <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                {text.regionLocationHint}
              </div>
            </div>

            <Radio checked={selectedLocationMode === 'region'} />
          </button>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              background: '#f8f4ec',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800, marginBottom: 4 }}>
              {text.selected}
            </div>
            <div style={{ fontSize: 14, color: '#17130f', fontWeight: 900 }}>
              {locationSummary}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '14px 16px',
            border: '1px solid #eee5d9',
            color: '#6d6459',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {profile.fullName} · {selectedLanguage} · {selectedRegion} · {selectedCurrency}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
