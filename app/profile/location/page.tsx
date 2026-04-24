'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getAppRegionSettings,
  setCurrentLocation,
  setCustomLocation,
  setLocationMode,
  getEffectiveSearchLocation,
} from '../../../services/appRegionStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

const ManualLocationPickerMap = dynamic(
  () => import('../../../components/profile/ManualLocationPickerMap'),
  { ssr: false }
);

type PageTextShape = {
  title: string;
  subtitle: string;
  automatic: string;
  automaticHint: string;
  manual: string;
  manualHint: string;
  loading: string;
  success: string;
  error: string;
  mapHint: string;
  selectedPoint: string;
  notSelected: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Location',
    subtitle: 'Choose automatic or manual location',
    automatic: 'Automatic',
    automaticHint: 'Use your current device GPS location',
    manual: 'Manual',
    manualHint: 'Set your own point on the map',
    loading: 'Getting current location...',
    success: 'Current location selected',
    error: 'Unable to get current location',
    mapHint: 'Long press on the map to place your location',
    selectedPoint: 'Selected point',
    notSelected: 'Not selected yet',
  },
  ES: {
    title: 'Ubicación',
    subtitle: 'Elige ubicación automática o manual',
    automatic: 'Automática',
    automaticHint: 'Usar la ubicación GPS actual del dispositivo',
    manual: 'Manual',
    manualHint: 'Establece tu propio punto en el mapa',
    loading: 'Obteniendo ubicación actual...',
    success: 'Ubicación actual seleccionada',
    error: 'No se pudo obtener la ubicación',
    mapHint: 'Mantén pulsado en el mapa para colocar tu ubicación',
    selectedPoint: 'Punto seleccionado',
    notSelected: 'Aún no seleccionado',
  },
  RU: {
    title: 'Локация',
    subtitle: 'Выберите автоматическую или ручную локацию',
    automatic: 'Автоматически',
    automaticHint: 'Использовать текущую GPS-локацию устройства',
    manual: 'Вручную',
    manualHint: 'Поставить свою точку на карте',
    loading: 'Определяем текущую локацию...',
    success: 'Текущая локация выбрана',
    error: 'Не удалось определить локацию',
    mapHint: 'Долгим нажатием по карте поставьте свою локацию',
    selectedPoint: 'Выбранная точка',
    notSelected: 'Пока не выбрано',
  },
  UA: {
    title: 'Локація',
    subtitle: 'Оберіть автоматичну або ручну локацію',
    automatic: 'Автоматично',
    automaticHint: 'Використовувати поточну GPS-локацію пристрою',
    manual: 'Вручну',
    manualHint: 'Поставити свою точку на карті',
    loading: 'Визначаємо поточну локацію...',
    success: 'Поточну локацію вибрано',
    error: 'Не вдалося визначити локацію',
    mapHint: 'Довгим натисканням на карту встановіть свою локацію',
    selectedPoint: 'Обрана точка',
    notSelected: 'Ще не вибрано',
  },
  CZ: {
    title: 'Poloha',
    subtitle: 'Vyberte automatickou nebo ruční polohu',
    automatic: 'Automaticky',
    automaticHint: 'Použít aktuální GPS polohu zařízení',
    manual: 'Ručně',
    manualHint: 'Umístit vlastní bod na mapu',
    loading: 'Zjišťuji aktuální polohu...',
    success: 'Aktuální poloha vybrána',
    error: 'Nepodařilo se zjistit polohu',
    mapHint: 'Dlouhým stiskem na mapě umístěte svou polohu',
    selectedPoint: 'Vybraný bod',
    notSelected: 'Zatím nevybráno',
  },
  DE: {
    title: 'Standort',
    subtitle: 'Wähle automatischen oder manuellen Standort',
    automatic: 'Automatisch',
    automaticHint: 'Aktuelle GPS-Position des Geräts verwenden',
    manual: 'Manuell',
    manualHint: 'Eigenen Punkt auf der Karte setzen',
    loading: 'Aktueller Standort wird ermittelt...',
    success: 'Aktueller Standort ausgewählt',
    error: 'Standort konnte nicht ermittelt werden',
    mapHint: 'Setze deinen Standort mit langem Druck auf die Karte',
    selectedPoint: 'Ausgewählter Punkt',
    notSelected: 'Noch nicht ausgewählt',
  },
  IT: {
    title: 'Posizione',
    subtitle: 'Scegli posizione automatica o manuale',
    automatic: 'Automatica',
    automaticHint: 'Usa la posizione GPS attuale del dispositivo',
    manual: 'Manuale',
    manualHint: 'Imposta il tuo punto sulla mappa',
    loading: 'Recupero posizione attuale...',
    success: 'Posizione attuale selezionata',
    error: 'Impossibile ottenere la posizione',
    mapHint: 'Tieni premuto sulla mappa per impostare la tua posizione',
    selectedPoint: 'Punto selezionato',
    notSelected: 'Non ancora selezionato',
  },
  FR: {
    title: 'Localisation',
    subtitle: 'Choisissez une localisation automatique ou manuelle',
    automatic: 'Automatique',
    automaticHint: 'Utiliser la position GPS actuelle de l’appareil',
    manual: 'Manuelle',
    manualHint: 'Définir votre propre point sur la carte',
    loading: 'Récupération de la position actuelle...',
    success: 'Position actuelle sélectionnée',
    error: 'Impossible d’obtenir la position',
    mapHint: 'Faites un appui long sur la carte pour placer votre position',
    selectedPoint: 'Point sélectionné',
    notSelected: 'Pas encore sélectionné',
  },
  AR: {
    title: 'الموقع',
    subtitle: 'اختر موقعًا تلقائيًا أو يدويًا',
    automatic: 'تلقائي',
    automaticHint: 'استخدام موقع GPS الحالي للجهاز',
    manual: 'يدوي',
    manualHint: 'حدد نقطتك بنفسك على الخريطة',
    loading: 'جارٍ تحديد الموقع الحالي...',
    success: 'تم اختيار الموقع الحالي',
    error: 'تعذر تحديد الموقع',
    mapHint: 'اضغط مطولًا على الخريطة لتحديد موقعك',
    selectedPoint: 'النقطة المحددة',
    notSelected: 'لم يتم التحديد بعد',
  },
  PL: {
    title: 'Lokalizacja',
    subtitle: 'Wybierz lokalizację automatyczną lub ręczną',
    automatic: 'Automatycznie',
    automaticHint: 'Użyj bieżącej lokalizacji GPS urządzenia',
    manual: 'Ręcznie',
    manualHint: 'Ustaw własny punkt na mapie',
    loading: 'Pobieranie bieżącej lokalizacji...',
    success: 'Wybrano bieżącą lokalizację',
    error: 'Nie udało się pobrać lokalizacji',
    mapHint: 'Przytrzymaj na mapie, aby ustawić swoją lokalizację',
    selectedPoint: 'Wybrany punkt',
    notSelected: 'Jeszcze nie wybrano',
  },
};

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

export default function LocationPage() {
  const router = useRouter();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const settings = getAppRegionSettings();
  const effectiveLocation = getEffectiveSearchLocation();

  const [mode, setMode] = useState<'current' | 'custom'>(settings.locationMode);
  const [isLocating, setIsLocating] = useState(false);
  const [manualMarker, setManualMarker] = useState<[number, number] | null>(
    typeof settings.customLocation.lat === 'number' &&
      typeof settings.customLocation.lng === 'number'
      ? [settings.customLocation.lat, settings.customLocation.lng]
      : null
  );

  const text = pageTexts[language] || pageTexts.EN;

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

  const center = useMemo<[number, number]>(() => {
    if (manualMarker) return manualMarker;
    return [effectiveLocation.lat, effectiveLocation.lng];
  }, [manualMarker, effectiveLocation.lat, effectiveLocation.lng]);

  const closePage = () => {
    router.back();
  };

  const closeAfterSelection = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      router.back();
    }, 550);
  };

  const handleAutomatic = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert(text.error);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const label = getCurrentLocationLabel(language);

        setCurrentLocation(lat, lng, label);
        setLocationMode('current');
        setMode('current');
        setIsLocating(false);

        closeAfterSelection();
      },
      () => {
        setIsLocating(false);
        alert(text.error);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleManualMode = () => {
    setLocationMode('custom');
    setMode('custom');
  };

  const handlePickManualLocation = (lat: number, lng: number) => {
    const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    setCustomLocation(lat, lng, label);
    setLocationMode('custom');
    setManualMarker([lat, lng]);
    setMode('custom');

    closeAfterSelection();
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
          <button
            type="button"
            onClick={handleAutomatic}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '34px 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '14px 12px',
              background: mode === 'current' ? '#f7f1e7' : '#fff',
              border: '2px solid #111111',
              textAlign: 'left',
              borderRadius: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 22 }}>📍</div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                {isLocating ? text.loading : text.automatic}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#7c746a',
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {text.automaticHint}
              </div>
            </div>

            <CheckMark checked={mode === 'current'} />
          </button>

          <button
            type="button"
            onClick={handleManualMode}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '34px 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '14px 12px',
              background: mode === 'custom' ? '#f7f1e7' : '#fff',
              border: '2px solid #111111',
              textAlign: 'left',
              borderRadius: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 22 }}>🗺️</div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                {text.manual}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#7c746a',
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {text.manualHint}
              </div>
            </div>

            <CheckMark checked={mode === 'custom'} />
          </button>
        </div>

        {mode === 'custom' ? (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                marginBottom: 10,
                fontSize: 13,
                color: '#6f675f',
                fontWeight: 800,
              }}
            >
              {text.mapHint}
            </div>

            <ManualLocationPickerMap
              center={center}
              marker={manualMarker}
              onPick={handlePickManualLocation}
            />

            <div
              style={{
                marginTop: 12,
                background: '#ffffff',
                borderRadius: 20,
                padding: '12px 14px',
                border: '2px solid #111111',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#8b8277',
                  fontWeight: 900,
                  marginBottom: 6,
                }}
              >
                {text.selectedPoint}
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {manualMarker
                  ? `${manualMarker[0].toFixed(5)}, ${manualMarker[1].toFixed(5)}`
                  : text.notSelected}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
