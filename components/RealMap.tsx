'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L, { type DivIcon } from 'leaflet';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type MasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  availableToday?: boolean;
  availableNow?: boolean;
  lat: number;
  lng: number;
  avatar?: string;
  description?: string;
  price?: string | number;
  discountBadge?: string;
};

type RadiusSearchMode = 'near-me' | 'custom';

export type RadiusSearchConfig = {
  enabled: boolean;
  mode: RadiusSearchMode;
  label: string;
  center: [number, number];
  radiusKm: number;
};

type RealMapProps = {
  masters?: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  likedMasterIds?: string[];
  recenterToUserTrigger?: number;
  language?: string;
  promotionBadgeTextByMasterId?: Record<string, string>;
  radiusSearch?: RadiusSearchConfig | null;
  onRadiusSearchApply?: (config: RadiusSearchConfig) => void;
  onRadiusSearchClear?: () => void;
  onMasterSelect?: (master: MasterItem) => void;
  onMapBackgroundClick?: () => void;
  onToggleLike?: (master: MasterItem) => void;
  onViewMaster?: (master: MasterItem) => void;
  onBookMaster?: (master: MasterItem) => void;
};

const LONDON_CENTER: [number, number] = [51.5078, -0.1278];

const PLACE_COORDS: Record<string, [number, number]> = {
  london: [51.5078, -0.1278],
  londyn: [51.5078, -0.1278],
  лондон: [51.5078, -0.1278],

  paris: [48.8566, 2.3522],
  париж: [48.8566, 2.3522],

  prague: [50.0755, 14.4378],
  прага: [50.0755, 14.4378],
  praha: [50.0755, 14.4378],

  berlin: [52.52, 13.405],
  берлин: [52.52, 13.405],

  madrid: [40.4168, -3.7038],
  мадрид: [40.4168, -3.7038],

  warsaw: [52.2297, 21.0122],
  варшава: [52.2297, 21.0122],

  kyiv: [50.4501, 30.5234],
  kiev: [50.4501, 30.5234],
  киев: [50.4501, 30.5234],
  київ: [50.4501, 30.5234],
};

const DEMO_MASTERS: MasterItem[] = [
  {
    id: 'demo-1',
    name: 'Anna',
    category: 'beauty',
    subcategory: 'Hair',
    lat: 51.5238,
    lng: -0.165,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 4.8,
    price: '£45',
    city: 'Marylebone',
  },
  {
    id: 'demo-2',
    name: 'Mark',
    category: 'barber',
    subcategory: 'Fade',
    lat: 51.5105,
    lng: -0.146,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
    rating: 4.9,
    price: '£25',
    city: 'Soho',
  },
  {
    id: 'demo-3',
    name: 'Oksana',
    category: 'beauty',
    subcategory: 'Nails',
    lat: 51.5052,
    lng: -0.118,
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 4.7,
    price: '£35',
    city: 'Holborn',
  },
  {
    id: 'demo-4',
    name: 'David',
    category: 'pets',
    subcategory: 'Grooming',
    lat: 51.5195,
    lng: -0.091,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
    rating: 4.8,
    price: '£30',
    city: 'Shoreditch',
  },
  {
    id: 'demo-5',
    name: 'Mila',
    category: 'wellness',
    subcategory: 'Massage',
    lat: 51.4965,
    lng: -0.084,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 5,
    price: '£60',
    city: 'Bermondsey',
  },
];

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function normalizeCategory(value?: string) {
  return String(value || '').toLowerCase().trim();
}

function normalizePlace(value: string) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function kmToMiles(km: number) {
  const miles = Math.round(Number(km || 0) * 0.621371);
  return Number.isFinite(miles) ? miles : 0;
}

function getPlaceCoords(value: string): [number, number] | null {
  const normalized = normalizePlace(value);

  if (!normalized) return null;

  if (PLACE_COORDS[normalized]) {
    return PLACE_COORDS[normalized];
  }

  const partialKey = Object.keys(PLACE_COORDS).find((key) => normalized.includes(key));

  if (partialKey) {
    return PLACE_COORDS[partialKey];
  }

  return null;
}

function getRadiusLabels(language?: string) {
  const lang = String(language || '').toUpperCase();

  if (lang === 'RU') {
    return {
      button: 'Радиус',
      title: 'Радиус поиска',
      nearMe: 'Рядом со мной',
      custom: 'Свой вариант',
      placeholder: 'Например: Париж, Лондон, Прага',
      usePlace: 'Место поиска',
      from: 'от выбранного места',
      apply: 'Показать результаты',
      clear: 'Сбросить',
      km: 'км',
      unknown: 'Пока не нашли город. Введите London, Paris, Prague, Berlin, Madrid, Warsaw или Kyiv.',
    };
  }

  if (lang === 'UA') {
    return {
      button: 'Радіус',
      title: 'Радіус пошуку',
      nearMe: 'Поруч зі мною',
      custom: 'Свій варіант',
      placeholder: 'Наприклад: Париж, Лондон, Прага',
      usePlace: 'Місце пошуку',
      from: 'від вибраного місця',
      apply: 'Показати результати',
      clear: 'Скинути',
      km: 'км',
      unknown: 'Поки не знайшли місто. Введіть London, Paris, Prague, Berlin, Madrid, Warsaw або Kyiv.',
    };
  }

  return {
    button: 'Radius',
    title: 'Search radius',
    nearMe: 'Near me',
    custom: 'Custom place',
    placeholder: 'Example: Paris, London, Prague',
    usePlace: 'Search place',
    from: 'from selected place',
    apply: 'Show results',
    clear: 'Clear',
    km: 'km',
    unknown: 'City not found yet. Try London, Paris, Prague, Berlin, Madrid, Warsaw or Kyiv.',
  };
}

function getCategoryColor(master: MasterItem, isSelected: boolean) {
  if (isSelected) return '#ff4f93';

  const promoBadge = master.discountBadge;
  if (promoBadge) return '#f4c430';

  if (master.availableNow) return '#34c759';

  const category = normalizeCategory(master.category);

  if (category === 'beauty') return '#ff4f93';
  if (category === 'barber') return '#111111';
  if (category === 'wellness') return '#f4c430';
  if (category === 'pets') return '#34c759';
  if (category === 'tech' || category === 'repairs') return '#3b82f6';

  return '#ff4f93';
}

function createMasterPin(
  master: MasterItem,
  isSelected: boolean,
  isLiked: boolean,
  promotionBadgeText?: string
): DivIcon {
  const color = getCategoryColor(master, isSelected);
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const hasPromotionBadge = Boolean(promotionBadgeText || master.discountBadge);
  const badgeText = promotionBadgeText || master.discountBadge || '';

  const size = isSelected ? 48 : 42;
  const ring = hasPromotionBadge ? '#f4c430' : master.availableNow ? '#34c759' : color;

  return L.divIcon({
    className: 'mapbook-master-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 22}px;">
        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:#ffffff;
          border:3px solid ${ring};
          box-shadow:0 6px 15px rgba(0,0,0,0.16);
          overflow:hidden;
          z-index:2;
        ">
          <img
            src="${avatar}"
            alt=""
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              display:block;
            "
          />
        </div>

        <div style="
          position:absolute;
          left:50%;
          top:${size - 1}px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:9px solid transparent;
          border-right:9px solid transparent;
          border-top:15px solid ${ring};
          z-index:1;
          filter:drop-shadow(0 3px 4px rgba(0,0,0,0.14));
        "></div>

        ${
          hasPromotionBadge
            ? `
          <div style="
            position:absolute;
            left:50%;
            bottom:-2px;
            transform:translateX(-50%);
            min-width:34px;
            height:18px;
            border-radius:999px;
            background:#ffe44d;
            border:1.5px solid #111111;
            color:#111111;
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:4;
            padding:0 6px;
            font-size:9px;
            font-weight:900;
            white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.14);
          ">
            ${badgeText}
          </div>
        `
            : ''
        }

        ${
          isLiked
            ? `
          <div style="
            position:absolute;
            right:-3px;
            top:-3px;
            width:18px;
            height:18px;
            border-radius:999px;
            background:#ffffff;
            border:1.5px solid #111111;
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:5;
            box-shadow:0 2px 6px rgba(0,0,0,0.14);
          ">
            <span style="font-size:10px;line-height:1;color:#ff3b58;">♥</span>
          </div>
        `
            : ''
        }

        ${
          master.availableNow
            ? `
          <div style="
            position:absolute;
            left:-1px;
            bottom:14px;
            width:12px;
            height:12px;
            border-radius:999px;
            background:#34c759;
            border:2px solid #ffffff;
            z-index:4;
            box-shadow:0 2px 5px rgba(0,0,0,0.10);
          "></div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [size, size + 22],
    iconAnchor: [size / 2, size + 14],
    popupAnchor: [0, -(size + 10)],
  });
}

function createRadiusCenterIcon(label: string): DivIcon {
  return L.divIcon({
    className: 'olamep-radius-center-pin',
    html: `
      <div style="
        position:relative;
        width:34px;
        height:34px;
        border-radius:999px;
        background:#ffffff;
        border:3px solid #0e73d8;
        box-shadow:0 8px 18px rgba(14,115,216,0.26);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:12px;
          height:12px;
          border-radius:999px;
          background:#0e73d8;
          border:3px solid #dcecff;
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function MapEvents({ onMapBackgroundClick }: { onMapBackgroundClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapBackgroundClick?.();
    },
  });

  return null;
}

function ChangeView({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    const lat = Number(center[0]);
    const lng = Number(center[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.flyTo([lat, lng], zoom ?? map.getZoom(), { duration: 0.65 });
  }, [map, center, zoom]);

  return null;
}

function FitMapToRadius({ config }: { config: RadiusSearchConfig | null }) {
  const map = useMap();
  const previousKeyRef = useRef('');

  useEffect(() => {
    if (!config?.enabled) return;

    const lat = Number(config.center?.[0]);
    const lng = Number(config.center?.[1]);
    const radiusKm = Number(config.radiusKm);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm)) {
      return;
    }

    const safeRadiusKm = Math.max(1, Math.min(500, radiusKm));
    const key = `${lat}:${lng}:${safeRadiusKm}`;

    if (previousKeyRef.current === key) return;
    previousKeyRef.current = key;

    try {
      const bounds = L.latLng(lat, lng).toBounds(safeRadiusKm * 2000);

      window.setTimeout(() => {
        map.fitBounds(bounds, {
          paddingTopLeft: [28, 28],
          paddingBottomRight: [28, 185],
          maxZoom: safeRadiusKm <= 3 ? 13 : safeRadiusKm <= 10 ? 12 : 9,
          animate: true,
        });
      }, 50);
    } catch {
      map.flyTo([lat, lng], safeRadiusKm <= 10 ? 11 : 8, {
        duration: 0.55,
      });
    }
  }, [map, config]);

  return null;
}

function FitMapToResults({
  masters,
  userLocation,
  selectedMasterId,
  disabled,
}: {
  masters: MasterItem[];
  userLocation: [number, number] | null;
  selectedMasterId?: string | number | null;
  disabled?: boolean;
}) {
  const map = useMap();
  const previousKeyRef = useRef('');

  useEffect(() => {
    if (disabled) return;

    const validMasters = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    const key = [
      validMasters.map((master) => `${master.id}:${master.lat}:${master.lng}`).join('|'),
      userLocation ? `${userLocation[0]}:${userLocation[1]}` : 'no-user',
      selectedMasterId ? String(selectedMasterId) : 'no-selected',
    ].join('::');

    if (previousKeyRef.current === key) return;
    previousKeyRef.current = key;

    if (selectedMasterId) {
      const selected = validMasters.find(
        (master) => String(master.id) === String(selectedMasterId)
      );

      if (selected) {
        map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), {
          duration: 0.55,
        });
        return;
      }
    }

    if (validMasters.length === 0) {
      if (userLocation) {
        map.flyTo(userLocation, 13, { duration: 0.55 });
      }
      return;
    }

    if (validMasters.length === 1) {
      const only = validMasters[0];

      if (userLocation) {
        const bounds = L.latLngBounds([
          [only.lat, only.lng],
          userLocation,
        ]);

        map.fitBounds(bounds, {
          paddingTopLeft: [42, 42],
          paddingBottomRight: [42, 150],
          maxZoom: 14,
          animate: true,
        });
        return;
      }

      map.flyTo([only.lat, only.lng], 14, { duration: 0.55 });
      return;
    }

    const points: [number, number][] = validMasters.map((master) => [
      master.lat,
      master.lng,
    ]);

    if (userLocation) {
      points.push(userLocation);
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      paddingTopLeft: [42, 42],
      paddingBottomRight: [42, 150],
      maxZoom: 14,
      animate: true,
    });
  }, [map, masters, userLocation, selectedMasterId, disabled]);

  return null;
}

function MapUiBridge({
  initialMode,
  onReady,
}: {
  initialMode: 'map' | 'satellite';
  onReady: (actions: { locateMe: () => void; toggleMapMode: () => void }) => void;
}) {
  const map = useMap();
  const [mode, setMode] = useState<'map' | 'satellite'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    onReady({
      locateMe: () => {
        if (!navigator.geolocation) {
          map.flyTo(LONDON_CENTER, 13, { duration: 0.7 });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            map.flyTo([position.coords.latitude, position.coords.longitude], 14, {
              duration: 0.7,
            });
          },
          () => {
            map.flyTo(LONDON_CENTER, 13, { duration: 0.7 });
          }
        );
      },
      toggleMapMode: () => {
        setMode((prev) => (prev === 'map' ? 'satellite' : 'map'));
      },
    });
  }, [map, onReady]);

  useEffect(() => {
    const nextUrl =
      mode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const layers: L.TileLayer[] = [];

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        layers.push(layer);
      }
    });

    layers.forEach((layer) => map.removeLayer(layer));

    const tileLayer = L.tileLayer(nextUrl, {
      attribution:
        mode === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
  }, [map, mode]);

  return null;
}

function RadiusSearchSheet({
  open,
  language,
  userLocation,
  value,
  onChange,
  onApply,
  onClear,
  onClose,
}: {
  open: boolean;
  language?: string;
  userLocation: [number, number] | null;
  value: {
    mode: RadiusSearchMode;
    place: string;
    radiusKm: number;
    error: string;
  };
  onChange: (
    next: Partial<{
      mode: RadiusSearchMode;
      place: string;
      radiusKm: number;
      error: string;
    }>
  ) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const labels = getRadiusLabels(language);

  if (!open) return null;

  const activeCenter =
    value.mode === 'near-me'
      ? userLocation || LONDON_CENTER
      : getPlaceCoords(value.place) || null;

  const miles = kmToMiles(value.radiusKm);

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2500,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          border: '2.8px solid #111111',
          borderBottom: 'none',
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 -16px 38px rgba(0,0,0,0.2)',
          padding: '9px 14px calc(18px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 5,
            borderRadius: 999,
            background: '#d6dbe2',
            margin: '0 auto 11px',
            border: '1px solid rgba(17,17,17,0.12)',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 38px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 21,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-0.4px',
                color: '#071b46',
              }}
            >
              {labels.title}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 800,
                color: '#667080',
              }}
            >
              {value.radiusKm} {labels.km} / {miles} mi {labels.from}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#ffffff',
              color: '#071b46',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: 13,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            borderRadius: 18,
            border: '2px solid #111111',
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => onChange({ mode: 'near-me', error: '' })}
            style={{
              minHeight: 47,
              border: 'none',
              borderRight: '2px solid #111111',
              background: value.mode === 'near-me' ? '#071b46' : '#ffffff',
              color: value.mode === 'near-me' ? '#ffffff' : '#071b46',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ⌖ {labels.nearMe}
          </button>

          <button
            type="button"
            onClick={() => onChange({ mode: 'custom', error: '' })}
            style={{
              minHeight: 47,
              border: 'none',
              background: value.mode === 'custom' ? '#071b46' : '#ffffff',
              color: value.mode === 'custom' ? '#ffffff' : '#071b46',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            📍 {labels.custom}
          </button>
        </div>

        {value.mode === 'custom' ? (
          <label
            style={{
              marginTop: 12,
              display: 'grid',
              gap: 6,
              fontSize: 12,
              fontWeight: 900,
              color: '#667080',
            }}
          >
            <span>{labels.usePlace}</span>

            <div
              style={{
                minHeight: 48,
                borderRadius: 16,
                border: '2px solid #111111',
                background: '#ffffff',
                display: 'grid',
                gridTemplateColumns: '36px 1fr 34px',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  color: '#071b46',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                ⌕
              </span>

              <input
                value={value.place}
                onChange={(event) =>
                  onChange({
                    place: event.target.value,
                    error: '',
                  })
                }
                placeholder={labels.placeholder}
                style={{
                  width: '100%',
                  height: 48,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#071b46',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              />

              {value.place ? (
                <button
                  type="button"
                  onClick={() => onChange({ place: '', error: '' })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              ) : (
                <span />
              )}
            </div>
          </label>
        ) : null}

        <div
          style={{
            marginTop: 17,
            textAlign: 'center',
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 900,
            color: '#071b46',
          }}
        >
          {value.radiusKm} {labels.km} / {miles} mi
        </div>

        <div
          style={{
            marginTop: 13,
            display: 'grid',
            gridTemplateColumns: '40px 1fr 52px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: '#071b46',
            }}
          >
            0 {labels.km}
          </span>

          <input
            type="range"
            min="0"
            max="500"
            step="1"
            value={value.radiusKm}
            onChange={(event) =>
              onChange({
                radiusKm: Number(event.target.value),
                error: '',
              })
            }
            style={{
              width: '100%',
              accentColor: '#55c75f',
              cursor: 'pointer',
            }}
          />

          <span
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: '#071b46',
              textAlign: 'right',
            }}
          >
            500 {labels.km}
          </span>
        </div>

        <div
          aria-hidden="true"
          style={{
            margin: '6px 50px 0',
            height: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            gap: 0,
          }}
        >
          {Array.from({ length: 11 }).map((_, index) => (
            <span
              key={index}
              style={{
                width: 1,
                height: index % 5 === 0 ? 10 : 6,
                background: '#c8ced7',
                justifySelf: 'center',
              }}
            />
          ))}
        </div>

        {value.error ? (
          <div
            style={{
              marginTop: 10,
              borderRadius: 14,
              border: '1.8px solid #111111',
              background: '#fff4c7',
              padding: '9px 10px',
              fontSize: 11.5,
              lineHeight: 1.3,
              fontWeight: 800,
              color: '#071b46',
            }}
          >
            {value.error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onApply}
          disabled={value.mode === 'custom' && !activeCenter}
          style={{
            marginTop: 15,
            width: '100%',
            minHeight: 52,
            borderRadius: 17,
            border: '2.5px solid #111111',
            background: value.mode === 'custom' && !activeCenter ? '#d8dce2' : '#55c75f',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 900,
            cursor: value.mode === 'custom' && !activeCenter ? 'not-allowed' : 'pointer',
            boxShadow:
              value.mode === 'custom' && !activeCenter
                ? 'none'
                : '0 8px 18px rgba(85,199,95,0.28)',
          }}
        >
          {labels.apply}
        </button>

        <button
          type="button"
          onClick={onClear}
          style={{
            marginTop: 9,
            width: '100%',
            minHeight: 42,
            borderRadius: 15,
            border: 'none',
            background: 'transparent',
            color: '#071b46',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {labels.clear}
        </button>
      </div>
    </div>
  );
}

export default function RealMap({
  masters = [],
  mapMode = 'map',
  selectedMasterId = null,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  language,
  promotionBadgeTextByMasterId = {},
  radiusSearch = null,
  onRadiusSearchApply,
  onRadiusSearchClear,
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(null);
  const [radiusSheetOpen, setRadiusSheetOpen] = useState(false);
  const [draftRadius, setDraftRadius] = useState<{
    mode: RadiusSearchMode;
    place: string;
    radiusKm: number;
    error: string;
  }>({
    mode: 'near-me',
    place: '',
    radiusKm: 10,
    error: '',
  });
  const [localRadiusSearch, setLocalRadiusSearch] = useState<RadiusSearchConfig | null>(null);

  const [uiActions, setUiActions] = useState<{
    locateMe: () => void;
    toggleMapMode: () => void;
  } | null>(null);

  const prevRecenterTrigger = useRef(recenterToUserTrigger);
  const labels = getRadiusLabels(language);
  const activeRadiusSearch = radiusSearch || localRadiusSearch;

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(LONDON_CENTER);
      setMapCenter(LONDON_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(coords);
        setMapCenter(coords);
      },
      () => {
        setUserLocation(LONDON_CENTER);
        setMapCenter(LONDON_CENTER);
      }
    );
  }, []);

  useEffect(() => {
    if (prevRecenterTrigger.current === recenterToUserTrigger) return;
    prevRecenterTrigger.current = recenterToUserTrigger;

    if (!navigator.geolocation) {
      setMapCenter(LONDON_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(coords);
        setMapCenter(coords);
      },
      () => {
        setMapCenter(LONDON_CENTER);
      }
    );
  }, [recenterToUserTrigger]);

  useEffect(() => {
    if (!radiusSearch) return;

    setDraftRadius({
      mode: radiusSearch.mode,
      place: radiusSearch.mode === 'custom' ? radiusSearch.label : '',
      radiusKm: radiusSearch.radiusKm,
      error: '',
    });
  }, [radiusSearch]);

  const safeMasters = useMemo(() => {
    const filtered = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    if (masters.length === 0) {
      return DEMO_MASTERS;
    }

    return filtered;
  }, [masters]);

  useEffect(() => {
    if (!selectedLocalId) return;

    const exists = safeMasters.some((master) => String(master.id) === selectedLocalId);

    if (!exists) {
      setSelectedLocalId(null);
    }
  }, [safeMasters, selectedLocalId]);

  const selectedMaster = useMemo(() => {
    const controlledId =
      selectedMasterId !== null && selectedMasterId !== undefined
        ? String(selectedMasterId)
        : null;

    const finalId = controlledId || selectedLocalId;

    if (!finalId) return null;

    return safeMasters.find((master) => String(master.id) === String(finalId)) || null;
  }, [safeMasters, selectedLocalId, selectedMasterId]);

  const handleSelectMaster = (master: MasterItem) => {
    setSelectedLocalId(String(master.id));
    onMasterSelect?.(master);
  };

  const applyRadiusSearch = () => {
    const radiusKm = Math.max(1, Math.min(500, Number(draftRadius.radiusKm) || 1));

    if (draftRadius.mode === 'near-me') {
      const center = userLocation || LONDON_CENTER;

      const config: RadiusSearchConfig = {
        enabled: true,
        mode: 'near-me',
        label: labels.nearMe,
        center,
        radiusKm,
      };

      setLocalRadiusSearch(config);
      setMapCenter(center);
      setRadiusSheetOpen(false);
      onRadiusSearchApply?.(config);
      return;
    }

    const customCenter = getPlaceCoords(draftRadius.place);

    if (!customCenter) {
      setDraftRadius((prev) => ({
        ...prev,
        error: labels.unknown,
      }));
      return;
    }

    const cleanPlace = draftRadius.place.trim() || labels.custom;

    const config: RadiusSearchConfig = {
      enabled: true,
      mode: 'custom',
      label: cleanPlace,
      center: customCenter,
      radiusKm,
    };

    setLocalRadiusSearch(config);
    setMapCenter(customCenter);
    setRadiusSheetOpen(false);
    onRadiusSearchApply?.(config);
  };

  const clearRadiusSearch = () => {
    setLocalRadiusSearch(null);
    setDraftRadius({
      mode: 'near-me',
      place: '',
      radiusKm: 10,
      error: '',
    });
    setRadiusSheetOpen(false);
    onRadiusSearchClear?.();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <MapContainer
        center={mapCenter || LONDON_CENTER}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
          background: '#f2f2ef',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="topleft" />

        <MapEvents
          onMapBackgroundClick={() => {
            setSelectedLocalId(null);
            onMapBackgroundClick?.();
          }}
        />

        <ChangeView center={mapCenter} />

        <FitMapToResults
          masters={safeMasters}
          userLocation={userLocation}
          selectedMasterId={selectedMaster?.id ?? null}
          disabled={Boolean(activeRadiusSearch?.enabled)}
        />

        <FitMapToRadius config={activeRadiusSearch?.enabled ? activeRadiusSearch : null} />

        <MapUiBridge initialMode={mapMode} onReady={setUiActions} />

        {activeRadiusSearch?.enabled ? (
          <>
            <Circle
              center={activeRadiusSearch.center}
              radius={Math.max(1, activeRadiusSearch.radiusKm) * 1000}
              pathOptions={{
                color: '#0e73d8',
                weight: 2,
                opacity: 0.8,
                fillColor: '#0e73d8',
                fillOpacity: 0.14,
              }}
            />

            <Marker
              position={activeRadiusSearch.center}
              icon={createRadiusCenterIcon(
                `${activeRadiusSearch.label} • ${activeRadiusSearch.radiusKm} ${labels.km}`
              )}
            />
          </>
        ) : null}

        {userLocation ? (
          <>
            <CircleMarker
              center={userLocation}
              radius={14}
              pathOptions={{
                color: 'transparent',
                fillColor: '#2b7cf6',
                fillOpacity: 0.12,
              }}
            />
            <CircleMarker
              center={userLocation}
              radius={5.5}
              pathOptions={{
                color: '#ffffff',
                weight: 2.2,
                fillColor: '#2b7cf6',
                fillOpacity: 1,
              }}
            />
          </>
        ) : null}

        {safeMasters.map((master) => {
          const isSelected =
            selectedMaster && String(master.id) === String(selectedMaster.id);
          const isLiked = likedMasterIds.includes(String(master.id));
          const promoBadge = promotionBadgeTextByMasterId[String(master.id)];

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, Boolean(isSelected), isLiked, promoBadge)}
              eventHandlers={{
                click: () => {
                  handleSelectMaster(master);
                },
              }}
            />
          );
        })}
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 700,
        }}
      >
        <button
          type="button"
          onClick={() => uiActions?.locateMe()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: '1.4px solid #111111',
            background: '#ffffff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            color: '#2b7cf6',
            fontWeight: 900,
          }}
        >
          ◎
        </button>

        <button
          type="button"
          onClick={() => uiActions?.toggleMapMode()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: '1.4px solid #111111',
            background: '#ffffff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: '#111111',
            fontWeight: 900,
          }}
        >
          ◫
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setRadiusSheetOpen(true);
          }}
          style={{
            minWidth: 42,
            height: 42,
            borderRadius: 999,
            border: activeRadiusSearch?.enabled ? '2px solid #111111' : '1.4px solid #111111',
            background: activeRadiusSearch?.enabled ? '#55c75f' : '#ffffff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 17,
            color: activeRadiusSearch?.enabled ? '#ffffff' : '#071b46',
            fontWeight: 900,
            padding: 0,
            position: 'relative',
          }}
          aria-label={labels.button}
          title={labels.button}
        >
          ⌖
          {activeRadiusSearch?.enabled ? (
            <span
              style={{
                position: 'absolute',
                right: -6,
                top: -6,
                minWidth: 22,
                height: 22,
                padding: '0 5px',
                borderRadius: 999,
                border: '1.5px solid #111111',
                background: '#ffffff',
                color: '#071b46',
                fontSize: 9,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {activeRadiusSearch.radiusKm}
            </span>
          ) : null}
        </button>
      </div>

      <RadiusSearchSheet
        open={radiusSheetOpen}
        language={language}
        userLocation={userLocation}
        value={draftRadius}
        onChange={(next) => {
          setDraftRadius((prev) => ({
            ...prev,
            ...next,
          }));
        }}
        onApply={applyRadiusSearch}
        onClear={clearRadiusSearch}
        onClose={() => setRadiusSheetOpen(false)}
      />

      <style jsx global>{`
        .leaflet-container {
          font-family: Arial, sans-serif;
        }

        .leaflet-control-zoom {
          border: none !important;
          margin-top: 12px !important;
          margin-left: 12px !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1) !important;
          overflow: hidden;
          border-radius: 14px !important;
        }

        .leaflet-control-zoom a {
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 26px !important;
          color: #111111 !important;
          border: none !important;
          background: #ffffff !important;
        }

        .leaflet-control-zoom a:first-child {
          border-bottom: 1px solid #ece7df !important;
        }

        .leaflet-control-attribution {
          display: none !important;
        }

        .mapbook-master-pin,
        .olamep-radius-center-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
