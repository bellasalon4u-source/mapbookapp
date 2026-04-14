'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import L, { type DivIcon } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  CircleMarker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { t, type AppLanguage } from '../services/i18n';
import {
  getEffectiveSearchLocation,
  setCurrentLocation,
} from '../services/appRegionStore';
import { formatDisplayPrice } from '../services/currencyDisplay';

type MasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  price?: string | number;
  availableNow?: boolean;
  availableToday?: boolean;
  lat?: number;
  lng?: number;
  avatar?: string;
  description?: string;
  paymentMethods?: string[] | string;
};

type RealMapProps = {
  masters: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  likedMasterIds?: string[];
  recenterToUserTrigger?: number;
  language?: AppLanguage;
  onMasterSelect?: (master: MasterItem) => void;
  onMapBackgroundClick?: () => void;
  onToggleLike?: (master: MasterItem) => void;
  onViewMaster?: (master: MasterItem) => void;
  onBookMaster?: (master: MasterItem) => void;
};

const londonCenter: [number, number] = [51.5074, -0.1278];

function getCategoryAccent(category?: string) {
  const normalized = String(category || '').toLowerCase();

  if (normalized === 'beauty') return '#ff4f93';
  if (normalized === 'barber') return '#2d98ff';
  if (normalized === 'wellness') return '#32c957';
  if (normalized === 'home') return '#ff9f1a';
  if (normalized === 'repairs') return '#f4b400';
  if (normalized === 'tech') return '#35cbe0';
  if (normalized === 'pets') return '#29c7d8';
  if (normalized === 'transport') return '#2f7df6';
  if (normalized === 'education') return '#7d52ff';
  if (normalized === 'fashion') return '#ff7ab8';
  if (normalized === 'auto') return '#61cf5a';
  if (normalized === 'moving') return '#61cf5a';
  if (normalized === 'fitness') return '#61cf5a';

  return '#ff4f93';
}

function getFallbackServiceLabel(language: AppLanguage) {
  if (language === 'ES') return 'Servicio';
  if (language === 'RU') return 'Услуга';
  if (language === 'UA') return 'Послуга';
  if (language === 'CZ') return 'Služba';
  if (language === 'DE') return 'Service';
  if (language === 'IT') return 'Servizio';
  if (language === 'FR') return 'Service';
  if (language === 'AR') return 'خدمة';
  if (language === 'PL') return 'Usługa';
  return 'Service';
}

function getFallbackProLabel(language: AppLanguage) {
  if (language === 'ES') return 'Profesional';
  if (language === 'RU') return 'Специалист';
  if (language === 'UA') return 'Спеціаліст';
  if (language === 'CZ') return 'Profesionál';
  if (language === 'DE') return 'Profi';
  if (language === 'IT') return 'Professionista';
  if (language === 'FR') return 'Professionnel';
  if (language === 'AR') return 'محترف';
  if (language === 'PL') return 'Specjalista';
  return 'Pro';
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

function getCategoryBadgeLabel(category?: string, language: AppLanguage = 'EN') {
  const normalized = String(category || '').toLowerCase();

  const labels: Record<string, Partial<Record<AppLanguage, string>>> = {
    beauty: {
      EN: 'Beauty',
      ES: 'Belleza',
      RU: 'Красота',
      UA: 'Краса',
      CZ: 'Krása',
      DE: 'Beauty',
      IT: 'Bellezza',
      FR: 'Beauté',
      AR: 'الجمال',
      PL: 'Uroda',
    },
    barber: {
      EN: 'Barber',
      ES: 'Barbero',
      RU: 'Барбер',
      UA: 'Барбер',
      CZ: 'Barber',
      DE: 'Barber',
      IT: 'Barber',
      FR: 'Barbier',
      AR: 'حلاق',
      PL: 'Barber',
    },
    wellness: {
      EN: 'Wellness',
      ES: 'Bienestar',
      RU: 'Велнес',
      UA: 'Велнес',
      CZ: 'Wellness',
      DE: 'Wellness',
      IT: 'Benessere',
      FR: 'Bien-être',
      AR: 'العافية',
      PL: 'Wellness',
    },
    home: {
      EN: 'Home',
      ES: 'Hogar',
      RU: 'Дом',
      UA: 'Дім',
      CZ: 'Domov',
      DE: 'Zuhause',
      IT: 'Casa',
      FR: 'Maison',
      AR: 'المنزل',
      PL: 'Dom',
    },
    repairs: {
      EN: 'Repairs',
      ES: 'Reparaciones',
      RU: 'Ремонт',
      UA: 'Ремонт',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      IT: 'Riparazioni',
      FR: 'Réparations',
      AR: 'إصلاحات',
      PL: 'Naprawy',
    },
    tech: {
      EN: 'Tech',
      ES: 'Tecnología',
      RU: 'Техника',
      UA: 'Техніка',
      CZ: 'Technika',
      DE: 'Technik',
      IT: 'Tecnologia',
      FR: 'Tech',
      AR: 'تقنية',
      PL: 'Technika',
    },
    pets: {
      EN: 'Pets',
      ES: 'Mascotas',
      RU: 'Питомцы',
      UA: 'Тварини',
      CZ: 'Mazlíčci',
      DE: 'Haustiere',
      IT: 'Animali',
      FR: 'Animaux',
      AR: 'حيوانات',
      PL: 'Zwierzęta',
    },
    fashion: {
      EN: 'Fashion',
      ES: 'Moda',
      RU: 'Мода',
      UA: 'Мода',
      CZ: 'Móda',
      DE: 'Mode',
      IT: 'Moda',
      FR: 'Mode',
      AR: 'موضة',
      PL: 'Moda',
    },
    auto: {
      EN: 'Auto',
      ES: 'Auto',
      RU: 'Авто',
      UA: 'Авто',
      CZ: 'Auto',
      DE: 'Auto',
      IT: 'Auto',
      FR: 'Auto',
      AR: 'سيارات',
      PL: 'Auto',
    },
    moving: {
      EN: 'Moving',
      ES: 'Mudanza',
      RU: 'Переезд',
      UA: 'Переїзд',
      CZ: 'Stěhování',
      DE: 'Umzug',
      IT: 'Trasloco',
      FR: 'Déménagement',
      AR: 'نقل',
      PL: 'Przeprowadzka',
    },
    fitness: {
      EN: 'Fitness',
      ES: 'Fitness',
      RU: 'Фитнес',
      UA: 'Фітнес',
      CZ: 'Fitness',
      DE: 'Fitness',
      IT: 'Fitness',
      FR: 'Fitness',
      AR: 'لياقة',
      PL: 'Fitness',
    },
  };

  return labels[normalized]?.[language] || category || getFallbackServiceLabel(language);
}

function getMarkerAlt(master: MasterItem, language: AppLanguage) {
  return master.name || master.title || getFallbackProLabel(language);
}

function getSelectedMasterName(master: MasterItem, language: AppLanguage) {
  return master.name || master.title || getFallbackProLabel(language);
}

function getTileUrl(mode: 'map' | 'satellite' = 'map') {
  if (mode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  }

  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function normalizePaymentMethods(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return ['cash', 'card'];
}

function paymentBadge(method: string, language: AppLanguage) {
  const tr = t(language);
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: tr.cash };
  if (normalized === 'card') return { icon: '💳', label: tr.card };
  if (normalized === 'wallet') return { icon: '📱', label: tr.wallet };

  return { icon: '•', label: String(method) };
}

function formatPrice(value: string | number | undefined, trObj: ReturnType<typeof t>) {
  return formatDisplayPrice(value, 45, true, trObj.from);
}

function buildMarkerIcon(
  master: MasterItem,
  language: AppLanguage,
  isSelected: boolean,
  isLiked: boolean
): DivIcon {
  const accent = getCategoryAccent(master.category);
  const availabilityColor = master.availableNow ? '#2ed14f' : '#ff2d2d';
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const outerRing = isSelected ? 6 : 5;
  const size = isSelected ? 78 : 72;
  const photoSize = isSelected ? 58 : 54;
  const likeBadgeSize = isSelected ? 30 : 28;
  const statusBadgeSize = isSelected ? 20 : 18;

  return L.divIcon({
    className: 'custom-master-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 18}px;">
        <div style="
          position:absolute;
          left:50%;
          top:${size - 4}px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:14px solid transparent;
          border-right:14px solid transparent;
          border-top:19px solid ${accent};
          filter:drop-shadow(0 5px 8px rgba(0,0,0,0.16));
        "></div>

        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:#fff;
          border:${outerRing}px solid ${accent};
          box-shadow:0 7px 18px rgba(0,0,0,0.16);
          overflow:hidden;
        ">
          <img
            src="${avatar}"
            alt="${getMarkerAlt(master, language)}"
            style="
              width:${photoSize}px;
              height:${photoSize}px;
              object-fit:cover;
              border-radius:999px;
              position:absolute;
              left:50%;
              top:50%;
              transform:translate(-50%,-50%);
              display:block;
            "
          />
        </div>

        <div
          class="pin-like-badge"
          style="
            position:absolute;
            right:2px;
            top:${size * 0.56}px;
            width:${likeBadgeSize + 10}px;
            height:${likeBadgeSize + 10}px;
            background:#fff;
            border:4px solid ${accent};
            border-radius:999px;
            box-shadow:0 4px 10px rgba(0,0,0,0.14);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#ff2020;
            font-size:${isLiked ? 16 : 0}px;
            font-weight:900;
            line-height:1;
            cursor:pointer;
          "
        >
          ${isLiked ? '♥' : ''}
        </div>

        <div style="
          position:absolute;
          right:${isLiked ? likeBadgeSize + 20 : 4}px;
          top:${size * 0.46}px;
          width:${statusBadgeSize + 10}px;
          height:${statusBadgeSize + 10}px;
          background:#fff;
          border:4px solid ${availabilityColor};
          border-radius:999px;
          box-shadow:0 4px 10px rgba(0,0,0,0.12);
        "></div>
      </div>
    `,
    iconSize: [size, size + 18],
    iconAnchor: [size / 2, size + 12],
  });
}

function MapEventsLayer({
  onBackgroundClick,
  ignoreNextMapClickRef,
}: {
  onBackgroundClick?: () => void;
  ignoreNextMapClickRef: MutableRefObject<boolean>;
}) {
  useMapEvents({
    click() {
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      onBackgroundClick?.();
    },
  });

  return null;
}

function FitBoundsLayer({
  masters,
  focusLocation,
}: {
  masters: MasterItem[];
  focusLocation: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize();
    }, 80);

    const points: [number, number][] = masters.map((item) => [
      item.lat || focusLocation[0],
      item.lng || focusLocation[1],
    ]);

    points.push(focusLocation);

    if (!points.length) {
      map.setView(focusLocation, 11);
      return () => window.clearTimeout(id);
    }

    if (points.length === 1) {
      map.setView(points[0], 11);
      return () => window.clearTimeout(id);
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.22), { animate: true });

    return () => window.clearTimeout(id);
  }, [map, masters, focusLocation]);

  return null;
}

function UserLocationLayer({
  language,
  onLocationFound,
}: {
  language: AppLanguage;
  onLocationFound: (coords: [number, number] | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;

    map.locate({
      setView: false,
      maxZoom: 14,
      enableHighAccuracy: true,
    });

    const handleFound = (event: L.LocationEvent) => {
      if (cancelled) return;

      const coords: [number, number] = [event.latlng.lat, event.latlng.lng];
      setCurrentLocation(coords[0], coords[1], getCurrentLocationLabel(language));
      onLocationFound(coords);
    };

    const handleError = () => {
      if (cancelled) return;
      onLocationFound(null);
    };

    map.on('locationfound', handleFound);
    map.on('locationerror', handleError);

    return () => {
      cancelled = true;
      map.off('locationfound', handleFound);
      map.off('locationerror', handleError);
    };
  }, [map, language, onLocationFound]);

  return null;
}

function RecenterToUserLayer({
  targetLocation,
  recenterToUserTrigger = 0,
}: {
  targetLocation: [number, number];
  recenterToUserTrigger?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!recenterToUserTrigger) return;
    map.setView(targetLocation, 14, { animate: true });
  }, [map, targetLocation, recenterToUserTrigger]);

  return null;
}

export default function RealMap({
  masters,
  mapMode = 'map',
  selectedMasterId,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  language = 'EN',
  onMasterSelect,
  onMapBackgroundClick,
  onToggleLike,
  onViewMaster,
  onBookMaster,
}: RealMapProps) {
  const ignoreNextMapClickRef = useRef(false);
  const effectiveLocation = getEffectiveSearchLocation();
  const initialFocusLocation: [number, number] = [
    effectiveLocation.lat || londonCenter[0],
    effectiveLocation.lng || londonCenter[1],
  ];

  const [currentDetectedLocation, setCurrentDetectedLocation] = useState<[number, number] | null>(null);
  const [focusLocation, setFocusLocation] = useState<[number, number]>(initialFocusLocation);

  const tr = t(language);

  useEffect(() => {
    const next = getEffectiveSearchLocation();
    setFocusLocation([next.lat || londonCenter[0], next.lng || londonCenter[1]]);
  }, [language, recenterToUserTrigger]);

  const safeMasters = useMemo(() => {
    return (masters || []).map((item, index) => ({
      ...item,
      id: item.id ?? String(index),
      lat: typeof item.lat === 'number' ? item.lat : focusLocation[0],
      lng: typeof item.lng === 'number' ? item.lng : focusLocation[1],
      rating: item.rating ?? 4.7,
      price: item.price ?? '45',
      availableNow:
        typeof item.availableNow === 'boolean'
          ? item.availableNow
          : typeof item.availableToday === 'boolean'
          ? item.availableToday
          : true,
      avatar:
        item.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    }));
  }, [masters, focusLocation]);

  const selectedMaster = useMemo(() => {
    if (selectedMasterId === null || selectedMasterId === undefined) return null;
    return safeMasters.find((item) => String(item.id) === String(selectedMasterId)) || null;
  }, [safeMasters, selectedMasterId]);

  const openRoute = (master: MasterItem) => {
    if (typeof window === 'undefined') return;
    const lat = typeof master.lat === 'number' ? master.lat : focusLocation[0];
    const lng = typeof master.lng === 'number' ? master.lng : focusLocation[1];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const locationDot = useMemo<[number, number]>(() => {
    if (focusLocation) return focusLocation;
    if (currentDetectedLocation) return currentDetectedLocation;
    return londonCenter;
  }, [focusLocation, currentDetectedLocation]);

  const selectedAccent = getCategoryAccent(selectedMaster?.category);
  const selectedIsLiked = selectedMaster
    ? likedMasterIds.includes(String(selectedMaster.id))
    : false;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f3efe7',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <MapContainer
        center={focusLocation}
        zoom={11}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
        zoomControl={true}
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={getTileUrl(mapMode)} />

        <UserLocationLayer language={language} onLocationFound={setCurrentDetectedLocation} />
        <FitBoundsLayer masters={safeMasters} focusLocation={focusLocation} />
        <RecenterToUserLayer
          targetLocation={focusLocation}
          recenterToUserTrigger={recenterToUserTrigger}
        />

        <MapEventsLayer
          onBackgroundClick={onMapBackgroundClick}
          ignoreNextMapClickRef={ignoreNextMapClickRef}
        />

        <>
          <CircleMarker
            center={locationDot}
            radius={16}
            pathOptions={{
              color: 'rgba(46,128,255,0.18)',
              fillColor: 'rgba(46,128,255,0.18)',
              fillOpacity: 1,
              weight: 0,
            }}
          />
          <CircleMarker
            center={locationDot}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#2f8df5',
              fillOpacity: 1,
              weight: 3,
            }}
          />
        </>

        {safeMasters.map((master) => {
          const isSelected = String(master.id) === String(selectedMasterId);
          const isLiked = likedMasterIds.includes(String(master.id));

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat as number, master.lng as number]}
              icon={buildMarkerIcon(master, language, isSelected, isLiked)}
              eventHandlers={{
                mousedown: () => {
                  ignoreNextMapClickRef.current = true;
                },
                click: (event) => {
                  ignoreNextMapClickRef.current = true;

                  const target = event.originalEvent?.target as HTMLElement | null;
                  const clickedLike = target?.closest('.pin-like-badge');

                  if (event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent as Event);
                  }

                  if (clickedLike) {
                    onToggleLike?.(master);
                    return;
                  }

                  onMasterSelect?.(master);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selectedMaster ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 16,
            zIndex: 1200,
            background: '#fffdfb',
            borderRadius: 30,
            border: '2.5px solid #111111',
            boxShadow: '0 16px 34px rgba(0,0,0,0.18)',
            padding: 14,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '98px 1fr auto',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `2.5px solid ${selectedAccent}`,
                  background: '#fff',
                  boxShadow: `0 8px 18px ${selectedAccent}33`,
                }}
              >
                <img
                  src={selectedMaster.avatar}
                  alt={getSelectedMasterName(selectedMaster, language)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLike?.(selectedMaster);
                }}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: '2.5px solid #111111',
                  background: selectedIsLiked ? '#ffedf5' : '#ffffff',
                  color: '#ff2a63',
                  fontSize: 20,
                  fontWeight: 900,
                  boxShadow: '0 6px 14px rgba(0,0,0,0.14)',
                  cursor: 'pointer',
                }}
              >
                ♥
              </button>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#1b2430',
                  lineHeight: 1.15,
                  marginBottom: 10,
                }}
              >
                {getSelectedMasterName(selectedMaster, language)}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 999,
                    background: '#efe6d8',
                    border: '2px solid #111111',
                    color: '#6d5a43',
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  🏅 {tr.verifiedPro}
                </div>

                <div
                  style={{
                    borderRadius: 999,
                    background: `${selectedAccent}22`,
                    border: `2px solid ${selectedAccent}`,
                    color: selectedAccent,
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {getCategoryBadgeLabel(selectedMaster.category, language)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: selectedMaster.availableNow ? '#1f9e42' : '#d94b78',
                  }}
                >
                  {selectedMaster.availableNow ? tr.availableNow : tr.unavailableToday}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#1b2430',
                  }}
                >
                  ★ {selectedMaster.rating || 4.8}
                </div>
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#1b2430',
                  marginBottom: 10,
                }}
              >
                {formatPrice(selectedMaster.price, tr)}
              </div>

              {selectedMaster.description ? (
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: '#4b5663',
                    fontWeight: 700,
                  }}
                >
                  {selectedMaster.description}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMapBackgroundClick?.();
              }}
              style={{
                border: '2.5px solid #111111',
                background: '#f2ede6',
                color: '#6b7480',
                width: 46,
                height: 46,
                borderRadius: 999,
                fontSize: 28,
                lineHeight: 1,
                cursor: 'pointer',
                flexShrink: 0,
                fontWeight: 900,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {normalizePaymentMethods(selectedMaster.paymentMethods).map((method) => {
              const badge = paymentBadge(method, language);

              return (
                <div
                  key={method}
                  style={{
                    border: '2px solid #111111',
                    background: '#ffffff',
                    borderRadius: 18,
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#1f2d3d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    minWidth: 86,
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  }}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewMaster?.(selectedMaster);
              }}
              style={{
                border: '2.5px solid #111111',
                background: '#ffffff',
                color: '#1f2430',
                borderRadius: 20,
                padding: '14px 10px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {tr.view}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openRoute(selectedMaster);
              }}
              style={{
                border: '2.5px solid #111111',
                background: '#65b9ea',
                color: '#ffffff',
                borderRadius: 20,
                padding: '14px 10px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)',
              }}
            >
              {tr.route}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookMaster?.(selectedMaster);
              }}
              style={{
                border: '2.5px solid #111111',
                background: '#46c545',
                color: '#ffffff',
                borderRadius: 20,
                padding: '14px 10px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.14)',
              }}
            >
              {tr.bookNow}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
