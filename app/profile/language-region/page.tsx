'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
import {
  currencyMeta,
  currencyOptions,
  getAppRegionSettings,
  getEffectiveSearchLocation,
  regionOptions,
  setLocationMode,
  updateAppRegionSettings,
  type AppCurrency,
  type SearchLocationMode,
} from '../../../services/appRegionStore';

const LocationPickerMap = dynamic(
  () =>
    import('./LocationPickerMap').catch(() => ({
      default: function FallbackMap() {
        return (
          <div
            style={{
              height: 320,
              borderRadius: 22,
              background: '#f6f1e9',
              border: '1px solid #efe4d7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#6f6458',
              textAlign: 'center',
              padding: 16,
            }}
          >
            Map preview is unavailable right now
          </div>
        );
      },
    })),
  { ssr: false }
);

const pageTexts = {
  EN: {
    title: 'Language, currency & location',
    language: 'Language',
    region: 'Region',
    currency: 'Currency',
    searchLocation: 'Search location',
    useCurrentLocation: 'Use current location',
    useCustomLocation: 'Use custom point',
    customLat: 'Latitude',
    customLng: 'Longitude',
    customLabel: 'Location label',
    customLabelPlaceholder: 'For example: Madrid, Spain',
    preview: 'Current search point',
    saved: 'Settings saved',
    saveButton: 'Save',
    locationNotReady: 'Current location not detected yet',
    mapPickerTitle: 'Pick point on map',
    mapPickerHint: 'Tap anywhere on the map to change the search point',
  },
  ES: {
    title: 'Idioma, moneda y ubicación',
    language: 'Idioma',
    region: 'Región',
    currency: 'Moneda',
    searchLocation: 'Ubicación de búsqueda',
    useCurrentLocation: 'Usar ubicación actual',
    useCustomLocation: 'Usar punto personalizado',
    customLat: 'Latitud',
    customLng: 'Longitud',
    customLabel: 'Nombre de ubicación',
    customLabelPlaceholder: 'Por ejemplo: Madrid, España',
    preview: 'Punto de búsqueda actual',
    saved: 'Ajustes guardados',
    saveButton: 'Guardar',
    locationNotReady: 'La ubicación actual aún no está detectada',
    mapPickerTitle: 'Elegir punto en el mapa',
    mapPickerHint: 'Toca cualquier lugar del mapa para cambiar el punto de búsqueda',
  },
  RU: {
    title: 'Язык, валюта и локация',
    language: 'Язык',
    region: 'Регион',
    currency: 'Валюта',
    searchLocation: 'Локация для поиска',
    useCurrentLocation: 'Использовать текущую локацию',
    useCustomLocation: 'Использовать свою точку',
    customLat: 'Широта',
    customLng: 'Долгота',
    customLabel: 'Название точки',
    customLabelPlaceholder: 'Например: Madrid, Spain',
    preview: 'Текущая точка поиска',
    saved: 'Настройки сохранены',
    saveButton: 'Сохранить',
    locationNotReady: 'Текущая локация ещё не определена',
    mapPickerTitle: 'Выбор точки на карте',
    mapPickerHint: 'Тапни по карте, чтобы изменить точку поиска',
  },
  CZ: {
    title: 'Jazyk, měna a poloha',
    language: 'Jazyk',
    region: 'Region',
    currency: 'Měna',
    searchLocation: 'Poloha pro hledání',
    useCurrentLocation: 'Použít aktuální polohu',
    useCustomLocation: 'Použít vlastní bod',
    customLat: 'Zeměpisná šířka',
    customLng: 'Zeměpisná délka',
    customLabel: 'Název místa',
    customLabelPlaceholder: 'Například: Madrid, Spain',
    preview: 'Aktuální bod hledání',
    saved: 'Nastavení uloženo',
    saveButton: 'Uložit',
    locationNotReady: 'Aktuální poloha ještě není zjištěna',
    mapPickerTitle: 'Vyberte bod na mapě',
    mapPickerHint: 'Klepněte kamkoli na mapu a změňte bod hledání',
  },
  DE: {
    title: 'Sprache, Währung und Standort',
    language: 'Sprache',
    region: 'Region',
    currency: 'Währung',
    searchLocation: 'Suchstandort',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    useCustomLocation: 'Eigenen Punkt verwenden',
    customLat: 'Breitengrad',
    customLng: 'Längengrad',
    customLabel: 'Standortname',
    customLabelPlaceholder: 'Zum Beispiel: Madrid, Spain',
    preview: 'Aktueller Suchpunkt',
    saved: 'Einstellungen gespeichert',
    saveButton: 'Speichern',
    locationNotReady: 'Aktueller Standort wurde noch nicht erkannt',
    mapPickerTitle: 'Punkt auf der Karte wählen',
    mapPickerHint: 'Tippen Sie auf die Karte, um den Suchpunkt zu ändern',
  },
  PL: {
    title: 'Język, waluta i lokalizacja',
    language: 'Język',
    region: 'Region',
    currency: 'Waluta',
    searchLocation: 'Lokalizacja wyszukiwania',
    useCurrentLocation: 'Użyj bieżącej lokalizacji',
    useCustomLocation: 'Użyj własnego punktu',
    customLat: 'Szerokość geograficzna',
    customLng: 'Długość geograficzna',
    customLabel: 'Nazwa lokalizacji',
    customLabelPlaceholder: 'Na przykład: Madrid, Spain',
    preview: 'Aktualny punkt wyszukiwania',
    saved: 'Ustawienia zapisane',
    saveButton: 'Zapisz',
    locationNotReady: 'Bieżąca lokalizacja nie została jeszcze wykryta',
    mapPickerTitle: 'Wybierz punkt na mapie',
    mapPickerHint: 'Dotknij mapy, aby zmienić punkt wyszukiwania',
  },
} as const;

const languageOptions: { value: AppLanguage; label: string }[] = [
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
  { value: 'RU', label: 'Русский' },
  { value: 'CZ', label: 'Čeština' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'PL', label: 'Polski' },
];

function toInputNumber(value: number | null) {
  return value === null || Number.isNaN(value) ? '' : String(value);
}

export default function LanguageRegionPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedRegion, setSelectedRegion] = useState(getUserProfile().region);

  const initialRegionSettings = getAppRegionSettings();

  const [selectedCurrency, setSelectedCurrency] = useState<AppCurrency>(
    initialRegionSettings.currency
  );
  const [locationMode, setSelectedLocationMode] = useState<SearchLocationMode>(
    initialRegionSettings.locationMode
  );
  const [customLat, setCustomLat] = useState(toInputNumber(initialRegionSettings.customLocation.lat));
  const [customLng, setCustomLng] = useState(toInputNumber(initialRegionSettings.customLocation.lng));
  const [customLabel, setCustomLabel] = useState(initialRegionSettings.customLocation.label);

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

  const effectiveLocation = useMemo(() => getEffectiveSearchLocation(), [language]);

  const mapLat = useMemo(() => {
    const parsed = Number(customLat);
    return Number.isFinite(parsed) ? parsed : 51.5074;
  }, [customLat]);

  const mapLng = useMemo(() => {
    const parsed = Number(customLng);
    return Number.isFinite(parsed) ? parsed : -0.1278;
  }, [customLng]);

  const handleSave = () => {
    saveLanguage(selectedLanguage);

    updateUserProfile({
      language: selectedLanguage,
      region: selectedRegion,
    });

    const parsedLat = customLat.trim() === '' ? null : Number(customLat);
    const parsedLng = customLng.trim() === '' ? null : Number(customLng);

    updateAppRegionSettings({
      language: selectedLanguage,
      region: selectedRegion,
      currency: selectedCurrency,
      locationMode,
      customLocation: {
        lat: Number.isFinite(parsedLat as number) ? parsedLat : null,
        lng: Number.isFinite(parsedLng as number) ? parsedLng : null,
        label: customLabel.trim() || 'Custom point',
      },
    });

    setLocationMode(locationMode);

    alert(text.saved);
    router.push('/profile');
  };

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

          <h1 className="text-center text-xl font-bold text-[#1d1712]">
            {text.title}
          </h1>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#2f241c] px-4 py-2 text-sm font-bold text-white"
          >
            {text.saveButton}
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.language}</div>

          <div className="mt-4 space-y-3">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedLanguage(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  selectedLanguage === option.value
                    ? 'border-[#2f241c] bg-[#f8f1e7]'
                    : 'border-[#efe4d7] bg-[#fffdf9]'
                }`}
              >
                <span className="text-sm font-bold text-[#1d1712]">{option.label}</span>
                {selectedLanguage === option.value && (
                  <span className="text-sm font-bold text-[#2f241c]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.region}</div>

          <div className="mt-4 space-y-3">
            {regionOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedRegion(option)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  selectedRegion === option
                    ? 'border-[#2f241c] bg-[#f8f1e7]'
                    : 'border-[#efe4d7] bg-[#fffdf9]'
                }`}
              >
                <span className="text-sm font-bold text-[#1d1712]">{option}</span>
                {selectedRegion === option && (
                  <span className="text-sm font-bold text-[#2f241c]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.currency}</div>

          <div className="mt-4 space-y-3">
            {currencyOptions.map((code) => {
              const meta = currencyMeta[code];

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCurrency(code)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    selectedCurrency === code
                      ? 'border-[#2f241c] bg-[#f8f1e7]'
                      : 'border-[#efe4d7] bg-[#fffdf9]'
                  }`}
                >
                  <span className="text-sm font-bold text-[#1d1712]">
                    {meta.symbol} · {meta.code} · {meta.label}
                  </span>
                  {selectedCurrency === code && (
                    <span className="text-sm font-bold text-[#2f241c]">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">
            {text.searchLocation}
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setSelectedLocationMode('current')}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                locationMode === 'current'
                  ? 'border-[#2f241c] bg-[#f8f1e7]'
                  : 'border-[#efe4d7] bg-[#fffdf9]'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-[#1d1712]">
                  {text.useCurrentLocation}
                </div>
                <div className="mt-1 text-xs text-[#6f6458]">
                  {initialRegionSettings.currentLocation.lat === null ||
                  initialRegionSettings.currentLocation.lng === null
                    ? text.locationNotReady
                    : initialRegionSettings.currentLocation.label}
                </div>
              </div>
              {locationMode === 'current' && (
                <span className="text-sm font-bold text-[#2f241c]">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedLocationMode('custom')}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                locationMode === 'custom'
                  ? 'border-[#2f241c] bg-[#f8f1e7]'
                  : 'border-[#efe4d7] bg-[#fffdf9]'
              }`}
            >
              <span className="text-sm font-bold text-[#1d1712]">
                {text.useCustomLocation}
              </span>
              {locationMode === 'custom' && (
                <span className="text-sm font-bold text-[#2f241c]">✓</span>
              )}
            </button>
          </div>

          {locationMode === 'custom' && (
            <div className="mt-4 grid gap-4">
              <div>
                <div className="mb-2 text-sm font-bold text-[#1d1712]">
                  {text.mapPickerTitle}
                </div>
                <div className="mb-3 text-xs leading-5 text-[#6f6458]">
                  {text.mapPickerHint}
                </div>

                <div className="overflow-hidden rounded-[22px] border border-[#efe4d7]">
                  <LocationPickerMap
                    lat={mapLat}
                    lng={mapLng}
                    onPick={(lat: number, lng: number) => {
                      setCustomLat(String(Number(lat.toFixed(6))));
                      setCustomLng(String(Number(lng.toFixed(6))));
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-bold text-[#1d1712]">{text.customLat}</div>
                <input
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="51.5074"
                  className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm font-bold text-[#1d1712] outline-none"
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-bold text-[#1d1712]">{text.customLng}</div>
                <input
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="-0.1278"
                  className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm font-bold text-[#1d1712] outline-none"
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-bold text-[#1d1712]">{text.customLabel}</div>
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={text.customLabelPlaceholder}
                  className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm font-bold text-[#1d1712] outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.preview}</div>

          <div className="mt-3 text-sm leading-6 text-[#6f6458]">
            {profile.fullName} · {selectedLanguage} · {selectedRegion}
          </div>

          <div className="mt-2 text-sm leading-6 text-[#6f6458]">
            {currencyMeta[selectedCurrency].symbol} · {currencyMeta[selectedCurrency].code} ·{' '}
            {currencyMeta[selectedCurrency].label}
          </div>

          <div className="mt-2 text-sm leading-6 text-[#6f6458]">
            {locationMode === 'custom'
              ? customLabel || 'Custom point'
              : effectiveLocation.label}
          </div>

          <div className="mt-1 text-xs leading-5 text-[#8b7f73]">
            {locationMode === 'custom' ? customLat : effectiveLocation.lat},{' '}
            {locationMode === 'custom' ? customLng : effectiveLocation.lng}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
