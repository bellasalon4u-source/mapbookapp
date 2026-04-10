'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

const CURRENCY_STORAGE_KEY = 'mapbook_currency';
const LOCATION_STORAGE_KEY = 'mapbook_location_pref';

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
    save: 'Save',
    languageSection: 'Languages available in app',
    regionSection: 'Countries/regions',
    currencySection: 'Currency',
    locationSection: 'Location',
    useCurrentLocation: 'Use current location',
    currentLocationHint: 'Use your device GPS for search and map results',
    useRegionLocation: 'Use selected region',
    regionLocationHint: 'Search near the selected country/region center',
    locationLoading: 'Getting current location...',
    locationSuccess: 'Current location selected',
    locationError: 'Unable to get current location',
    saved: 'Settings saved',
    selected: 'Selected',
  },
  ES: {
    title: 'Idioma y región',
    save: 'Guardar',
    languageSection: 'Idiomas disponibles en la app',
    regionSection: 'Países/regiones',
    currencySection: 'Moneda',
    locationSection: 'Ubicación',
    useCurrentLocation: 'Usar ubicación actual',
    currentLocationHint: 'Usa el GPS del dispositivo para búsqueda y mapa',
    useRegionLocation: 'Usar región seleccionada',
    regionLocationHint: 'Buscar cerca del centro del país/región seleccionado',
    locationLoading: 'Obteniendo ubicación actual...',
    locationSuccess: 'Ubicación actual seleccionada',
    locationError: 'No se pudo obtener la ubicación',
    saved: 'Ajustes guardados',
    selected: 'Seleccionado',
  },
  RU: {
    title: 'Язык и регион',
    save: 'Сохранить',
    languageSection: 'Языки приложения',
    regionSection: 'Страны/регионы',
    currencySection: 'Валюта',
    locationSection: 'Локация',
    useCurrentLocation: 'Использовать текущую локацию',
    currentLocationHint: 'Использовать GPS телефона для поиска и карты',
    useRegionLocation: 'Использовать выбранный регион',
    regionLocationHint: 'Искать рядом с центром выбранной страны/региона',
    locationLoading: 'Определяем текущую локацию...',
    locationSuccess: 'Текущая локация выбрана',
    locationError: 'Не удалось определить локацию',
    saved: 'Настройки сохранены',
    selected: 'Выбрано',
  },
  CZ: {
    title: 'Jazyk a region',
    save: 'Uložit',
    languageSection: 'Jazyky aplikace',
    regionSection: 'Země/regiony',
    currencySection: 'Měna',
    locationSection: 'Poloha',
    useCurrentLocation: 'Použít aktuální polohu',
    currentLocationHint: 'Použít GPS zařízení pro hledání a mapu',
    useRegionLocation: 'Použít vybraný region',
    regionLocationHint: 'Hledat poblíž středu vybrané země/regionu',
    locationLoading: 'Zjišťuji aktuální polohu...',
    locationSuccess: 'Aktuální poloha vybrána',
    locationError: 'Nepodařilo se zjistit polohu',
    saved: 'Nastavení uloženo',
    selected: 'Vybráno',
  },
  DE: {
    title: 'Sprache & Region',
    save: 'Speichern',
    languageSection: 'Verfügbare App-Sprachen',
    regionSection: 'Länder/Regionen',
    currencySection: 'Währung',
    locationSection: 'Standort',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    currentLocationHint: 'GPS des Geräts für Suche und Karte verwenden',
    useRegionLocation: 'Ausgewählte Region verwenden',
    regionLocationHint: 'In der Nähe des Zentrums der gewählten Region suchen',
    locationLoading: 'Aktueller Standort wird ermittelt...',
    locationSuccess: 'Aktueller Standort ausgewählt',
    locationError: 'Standort konnte nicht ermittelt werden',
    saved: 'Einstellungen gespeichert',
    selected: 'Ausgewählt',
  },
  PL: {
    title: 'Język i region',
    save: 'Zapisz',
    languageSection: 'Języki aplikacji',
    regionSection: 'Kraje/regiony',
    currencySection: 'Waluta',
    locationSection: 'Lokalizacja',
    useCurrentLocation: 'Użyj bieżącej lokalizacji',
    currentLocationHint: 'Użyj GPS telefonu do wyszukiwania i mapy',
    useRegionLocation: 'Użyj wybranego regionu',
    regionLocationHint: 'Szukaj w pobliżu centrum wybranego kraju/regionu',
    locationLoading: 'Pobieranie bieżącej lokalizacji...',
    locationSuccess: 'Wybrano bieżącą lokalizację',
    locationError: 'Nie udało się pobrać lokalizacji',
    saved: 'Ustawienia zapisane',
    selected: 'Wybrano',
  },
} as const;

const languageOptions: { value: AppLanguage; label: string; subtitle: string; flag: string }[] = [
  { value: 'EN', label: 'English', subtitle: 'App language', flag: '🇬🇧' },
  { value: 'ES', label: 'Español', subtitle: 'Idioma de la app', flag: '🇪🇸' },
  { value: 'RU', label: 'Русский', subtitle: 'Язык приложения', flag: '🇷🇺' },
  { value: 'CZ', label: 'Čeština', subtitle: 'Jazyk aplikace', flag: '🇨🇿' },
  { value: 'DE', label: 'Deutsch', subtitle: 'App-Sprache', flag: '🇩🇪' },
  { value: 'PL', label: 'Polski', subtitle: 'Język aplikacji', flag: '🇵🇱' },
];

const regionOptions = [
  {
    value: 'United Kingdom',
    label: 'United Kingdom',
    subtitle: 'London · Europe',
    flag: '🇬🇧',
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    value: 'Spain',
    label: 'Spain',
    subtitle: 'Madrid · Europe',
    flag: '🇪🇸',
    lat: 40.4168,
    lng: -3.7038,
  },
  {
    value: 'Czech Republic',
    label: 'Czech Republic',
    subtitle: 'Prague · Europe',
    flag: '🇨🇿',
    lat: 50.0755,
    lng: 14.4378,
  },
  {
    value: 'Germany',
    label: 'Germany',
    subtitle: 'Berlin · Europe',
    flag: '🇩🇪',
    lat: 52.52,
    lng: 13.405,
  },
  {
    value: 'Poland',
    label: 'Poland',
    subtitle: 'Warsaw · Europe',
    flag: '🇵🇱',
    lat: 52.2297,
    lng: 21.0122,
  },
  {
    value: 'Ukraine',
    label: 'Ukraine',
    subtitle: 'Kyiv · Europe',
    flag: '🇺🇦',
    lat: 50.4501,
    lng: 30.5234,
  },
  {
    value: 'United Arab Emirates',
    label: 'United Arab Emirates',
    subtitle: 'Dubai · Middle East',
    flag: '🇦🇪',
    lat: 25.2048,
    lng: 55.2708,
  },
] as const;

const currencyOptions: {
  value: CurrencyCode;
  symbol: string;
  title: string;
  subtitle: string;
}[] = [
  { value: 'GBP', symbol: '£', title: 'GBP', subtitle: 'British Pound' },
  { value: 'EUR', symbol: '€', title: 'EUR', subtitle: 'Euro' },
  { value: 'USD', symbol: '$', title: 'USD', subtitle: 'US Dollar' },
  { value: 'PLN', symbol: 'zł', title: 'PLN', subtitle: 'Polish Zloty' },
  { value: 'CZK', symbol: 'Kč', title: 'CZK', subtitle: 'Czech Koruna' },
  { value: 'UAH', symbol: '₴', title: 'UAH', subtitle: 'Ukrainian Hryvnia' },
  { value: 'AED', symbol: 'AED', title: 'AED', subtitle: 'UAE Dirham' },
];

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'GBP';
  const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (
    value === 'GBP' ||
    value === 'EUR' ||
    value === 'USD' ||
    value === 'PLN' ||
    value === 'CZK' ||
    value === 'UAH' ||
    value === 'AED'
  ) {
    return value;
  }
  return 'GBP';
}

function saveStoredCurrency(currency: CurrencyCode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

function readStoredLocation(): StoredLocation | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredLocation;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      source: parsed.source === 'current' ? 'current' : 'region',
      label: String(parsed.label || ''),
      lat: typeof parsed.lat === 'number' ? parsed.lat : null,
      lng: typeof parsed.lng === 'number' ? parsed.lng : null,
    };
  } catch {
    return null;
  }
}

function saveStoredLocation(value: StoredLocation) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(value));
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

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedRegion, setSelectedRegion] = useState(getUserProfile().region);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(readStoredCurrency());
  const [selectedLocationMode, setSelectedLocationMode] = useState<'current' | 'region'>('region');
  const [selectedLocation, setSelectedLocation] = useState<StoredLocation | null>(readStoredLocation());
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguage = getSavedLanguage();
      setLanguage(nextLanguage);
      setSelectedLanguage(nextLanguage);
    };

    const syncProfile = () => {
      const nextProfile = getUserProfile();
      setProfile(nextProfile);
      setSelectedRegion(nextProfile.region);
    };

    syncLanguage();
    syncProfile();

    const storedLocation = readStoredLocation();
    if (storedLocation) {
      setSelectedLocation(storedLocation);
      setSelectedLocationMode(storedLocation.source);
    }

    setSelectedCurrency(readStoredCurrency());

    window.addEventListener('focus', syncLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubProfile();
    };
  }, []);

  const text = useMemo(
    () => pageTexts[language as keyof typeof pageTexts] || pageTexts.EN,
    [language]
  );

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
          label: text.locationSuccess,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocationMode('current');
        setSelectedLocation(nextLocation);
        setIsLocating(false);
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
    saveStoredCurrency(selectedCurrency);

    const finalLocation =
      selectedLocationMode === 'region'
        ? {
            source: 'region' as const,
            label: selectedRegionMeta.label,
            lat: selectedRegionMeta.lat,
            lng: selectedRegionMeta.lng,
          }
        : selectedLocation;

    if (finalLocation) {
      saveStoredLocation(finalLocation);
    }

    updateUserProfile({
      language: selectedLanguage,
      region: selectedRegion,
    });

    alert(text.saved);
    router.push('/profile');
  };

  return (
    <main
      className="min-h-screen px-4 py-5 pb-24"
      style={{ background: '#f7f3eb' }}
    >
      <div className="mx-auto max-w-md">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr auto',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: '1px solid #e8dfd2',
              background: '#fff',
              fontSize: 24,
              fontWeight: 900,
              color: '#17130f',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            ←
          </button>

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

          <button
            type="button"
            onClick={handleSave}
            style={{
              border: 'none',
              background: '#17130f',
              color: '#fff',
              borderRadius: 999,
              padding: '11px 16px',
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {text.save}
          </button>
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
