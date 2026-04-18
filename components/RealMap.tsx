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
  image?: string;
  images?: string[];
  description?: string;
  paymentMethods?: string[] | string;
  discountBadge?: string;
};

type RealMapProps = {
  masters: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  likedMasterIds?: string[];
  recenterToUserTrigger?: number;
  language?: AppLanguage;
  promotionBadgeTextByMasterId?: Record<string, string>;
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
  if (normalized === 'tech') return '#9b5cff';
  if (normalized === 'pets') return '#28c7d9';
  if (normalized === 'transport') return '#2f7df6';
  if (normalized === 'education') return '#7d52ff';
  if (normalized === 'fashion') return '#ff6fb5';
  if (normalized === 'auto') return '#44c067';
  if (normalized === 'moving') return '#ff9f1a';
  if (normalized === 'fitness') return '#ff5b5b';
  if (normalized === 'events') return '#9b5cff';
  if (normalized === 'activities') return '#00b8d9';
  if (normalized === 'creative') return '#ff7a59';

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
  if (language === 'IT') return 'Specialista';
  if (language === 'FR') return 'Spécialiste';
  if (language === 'AR') return 'متخصص';
  if (language === 'PL') return 'Specjalista';
  return 'Pro';
}

function getCurrentLocationLabel(language: AppLanguage) {
  if (language === 'ES') return 'Ubicación actual';
  if (language === 'RU') return 'Текущее местоположение';
  if (language === 'UA') return 'Поточне місцезнаходження';
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
    education: {
      EN: 'Education',
      ES: 'Educación',
      RU: 'Обучение',
      UA: 'Навчання',
      CZ: 'Vzdělání',
      DE: 'Bildung',
      IT: 'Educazione',
      FR: 'Éducation',
      AR: 'تعليم',
      PL: 'Edukacja',
    },
    events: {
      EN: 'Events',
      ES: 'Eventos',
      RU: 'События',
      UA: 'Події',
      CZ: 'Události',
      DE: 'Events',
      IT: 'Eventi',
      FR: 'Événements',
      AR: 'فعاليات',
      PL: 'Wydarzenia',
    },
    activities: {
      EN: 'Activities',
      ES: 'Actividades',
      RU: 'Активности',
      UA: 'Активності',
      CZ: 'Aktivity',
      DE: 'Aktivitäten',
      IT: 'Attività',
      FR: 'Activités',
      AR: 'أنشطة',
      PL: 'Aktywności',
    },
    creative: {
      EN: 'Creative',
      ES: 'Creativo',
      RU: 'Креатив',
      UA: 'Креатив',
      CZ: 'Kreativa',
      DE: 'Kreativ',
      IT: 'Creativo',
      FR: 'Créatif',
      AR: 'إبداعي',
      PL: 'Kreatywne',
    },
  };

  return (
    labels[normalized]?.[language] ||
    labels[normalized]?.EN ||
    category ||
    getFallbackServiceLabel(language)
  );
}

function getMarkerAlt(master: MasterItem, language: AppLanguage) {
  return master.name || master.title || getFallbackProLabel(language);
}

function getSelectedMasterName(master: MasterItem, language: AppLanguage) {
  return master.name || master.title || getFallbackProLabel(language);
}

function getVerifiedCardLabel(language: AppLanguage, trObj: ReturnType<typeof t>) {
  if (language === 'RU') return 'Проверений специалист';
  if (language === 'UA') return 'Перевірений спеціаліст';
  if (language === 'ES') return 'Profesional verificado';
  if (language === 'CZ') return 'Ověřený specialista';
  if (language === 'DE') return 'Verifizierter Profi';
  if (language === 'IT') return 'Specialista verificato';
  if (language === 'FR') return 'Spécialiste vérifié';
  if (language === 'AR') return 'متخصص موثّق';
  if (language === 'PL') return 'Zweryfikowany specjalista';
  return trObj.verifiedPro;
}

function getTileUrl(mode: 'map' | 'satellite' = 'map') {
  if (mode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  }

  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function normalizePaymentMethods(value: string[] | string | undefined): string[] {
  if (Array.isArray(value) && value.length > 0) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return ['cash', 'wallet', 'card'];
}

function paymentBadge(method: string, language: AppLanguage) {
  const tr = t(language);
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: tr.cash };
  if (normalized === 'card') return { icon: '💳', label: tr.card };
  if (normalized === 'wallet') return { icon: '📲', label: 'Google Wallet' };

  return { icon: '•', label: String(method) };
}

function formatPrice(value: string | number | undefined, trObj: ReturnType<typeof t>) {
  return formatDisplayPrice(value, 45, true, trObj.from);
}

function getPromotionBadgeText(
  master: MasterItem,
  promotionBadgeTextByMasterId?: Record<string, string>
) {
  const fromMap = promotionBadgeTextByMasterId?.[String(master.id)];
  if (typeof fromMap === 'string' && fromMap.trim()) return fromMap.trim();

  if (typeof master.discountBadge === 'string' && master.discountBadge.trim()) {
    return master.discountBadge.trim();
  }

  return '';
}

function getCardGallery(master: MasterItem) {
  const avatar =
    master.avatar ||
    master.image ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80';

  const galleryPool = Array.isArray(master.images) ? master.images.filter(Boolean) : [];
  const filteredGallery = galleryPool.filter((image) => image !== avatar);

  const firstGallery =
    filteredGallery[0] ||
    master.image ||
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80';

  const secondGallery =
    filteredGallery[1] ||
    filteredGallery[0] ||
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80';

  return [avatar, firstGallery, secondGallery];
}

function buildMarkerIcon(
  master: MasterItem,
  language: AppLanguage,
  isSelected: boolean,
  isLiked: boolean,
  promotionBadgeTextByMasterId?: Record<string, string>
): DivIcon {
  const accent = getCategoryAccent(master.category);
  const availabilityColor = master.availableNow ? '#2ed14f' : '#ff2d2d';
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const discountText = getPromotionBadgeText(master, promotionBadgeTextByMasterId);
  const hasDiscount = Boolean(discountText);

  const outerRing = isSelected ? 6 : 5;
  const size = isSelected ? 78 : 72;
  const photoSize = isSelected ? 58 : 54;
  const likeBadgeSize = isSelected ? 30 : 28;
  const statusBadgeSize = isSelected ? 20 : 18;
  const rightBadgeOffset = hasDiscount ? 44 : 4;

  return L.divIcon({
    className: 'custom-master-pin',
    html: `
      <div style="position:relative;width:${hasDiscount ? size + 52 : size}px;height:${size + 22}px;">
        <div style="
          position:absolute;
          left:${size / 2}px;
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
          left:${size / 2}px;
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

        ${
          hasDiscount
            ? `
          <div style="
            position:absolute;
            right:0;
            top:${size * 0.50}px;
            min-width:58px;
            height:34px;
            padding:0 12px;
            background:linear-gradient(180deg,#ffe66d 0%,#ffd12d 100%);
            border:3px solid #111111;
            border-radius:999px;
            box-shadow:0 6px 12px rgba(0,0,0,0.18);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#2a2115;
            font-size:16px;
            font-weight:900;
            line-height:1;
            white-space:nowrap;
          ">
            ${discountText}
          </div>
        `
            : ''
        }

        <div
          class="pin-like-badge"
          style="
            position:absolute;
            right:${rightBadgeOffset}px;
            top:${size * 0.60}px;
            width:${likeBadgeSize + 10}px;
            height:${likeBadgeSize + 10}px;
            background:#ffffff;
            border:4px solid ${accent};
            border-radius:999px;
            box-shadow:0 4px 10px rgba(0,0,0,0.14);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#ff295f;
            font-size:${isLiked ? 17 : 0}px;
            font-weight:900;
            line-height:1;
            cursor:pointer;
          "
        >
          ${isLiked ? '♥' : ''}
        </div>

        <div style="
          position:absolute;
          right:${hasDiscount ? 94 : likeBadgeSize + 20}px;
          top:${size * 0.52}px;
          width:${statusBadgeSize + 10}px;
          height:${statusBadgeSize + 10}px;
          background:#fff;
          border:4px solid ${availabilityColor};
          border-radius:999px;
          box-shadow:0 4px 10px rgba(0,0,0,0.12);
        "></div>
      </div>
    `,
    iconSize: [hasDiscount ? size + 52 : size, size + 22],
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
  promotionBadgeTextByMasterId = {},
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

  const [currentDetectedLocation, setCurrentDetectedLocation] = useState<[number, number] | null>(
    null
  );
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
      discountBadge:
        typeof item.discountBadge === 'string'
          ? item.discountBadge
          : promotionBadgeTextByMasterId[String(item.id)] || '',
    }));
  }, [masters, focusLocation, promotionBadgeTextByMasterId]);

  const selectedMaster = useMemo(() => {
    if (selectedMasterId === null || selectedMasterId === undefined) return null;
    return safeMasters.find((item) => String(item.id) === String(selectedMasterId)) || null;
  }, [safeMasters, selectedMasterId]);

  const selectedGallery = useMemo(() => {
    if (!selectedMaster) return [];
    return getCardGallery(selectedMaster);
  }, [selectedMaster]);

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
        dragging
        touchZoom
        doubleClickZoom
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
        zoomControl
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={getTileUrl(mapMode)}
        />

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
              icon={buildMarkerIcon(
                master,
                language,
                isSelected,
                isLiked,
                promotionBadgeTextByMasterId
              )}
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
            background: '#ffffff',
            borderRadius: 34,
            border: '3px solid #111111',
            boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
            padding: 14,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.45fr 1fr 1fr',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <img
              src={selectedGallery[0]}
              alt={`${getSelectedMasterName(selectedMaster, language)} avatar`}
              style={{
                width: '100%',
                height: 104,
                objectFit: 'cover',
                borderRadius: 20,
                border: `3px solid ${getCategoryAccent(selectedMaster.category)}`,
                display: 'block',
              }}
            />

            <img
              src={selectedGallery[1]}
              alt={`${getSelectedMasterName(selectedMaster, language)} gallery 1`}
              style={{
                width: '100%',
                height: 104,
                objectFit: 'cover',
                borderRadius: 20,
                border: '3px solid #111111',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 104,
              }}
            >
              <img
                src={selectedGallery[2]}
                alt={`${getSelectedMasterName(selectedMaster, language)} gallery 2`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 20,
                  border: '3px solid #111111',
                  display: 'block',
                }}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMapBackgroundClick?.();
                }}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: '3px solid #111111',
                  background: '#f6f0e8',
                  color: '#6b7480',
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                ×
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLike?.(selectedMaster);
                }}
                style={{
                  position: 'absolute',
                  top: 54,
                  right: 6,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: '3px solid #111111',
                  background: '#ffffff',
                  color: '#ff2b63',
                  fontSize: 21,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ♥
              </button>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              marginBottom: 10,
              borderRadius: 999,
              border: '3px solid #111111',
              background: '#ffe44d',
              color: '#17130f',
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 900,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxSizing: 'border-box',
            }}
          >
            {getVerifiedCardLabel(language, tr)}
          </div>

          <div
            style={{
              marginBottom: 8,
              fontSize: 16,
              fontWeight: 900,
              color: '#1a2233',
              lineHeight: 1.15,
            }}
          >
            {getSelectedMasterName(selectedMaster, language)}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#1f2430',
              }}
            >
              ★ {selectedMaster.rating || 4.8}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: selectedMaster.availableNow ? '#23a33f' : '#d56688',
              }}
            >
              {selectedMaster.availableNow ? tr.availableNow : tr.unavailableToday}
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#1f2430',
              }}
            >
              {getCategoryBadgeLabel(selectedMaster.category, language)}
            </div>

            {getPromotionBadgeText(selectedMaster, promotionBadgeTextByMasterId) ? (
              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#ffd12d',
                  color: '#1f2430',
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {getPromotionBadgeText(selectedMaster, promotionBadgeTextByMasterId)}
              </div>
            ) : null}
          </div>

          {selectedMaster.description ? (
            <div
              style={{
                marginBottom: 12,
                fontSize: 14,
                lineHeight: 1.45,
                color: '#4d5865',
                fontWeight: 700,
              }}
            >
              {selectedMaster.description}
            </div>
          ) : null}

          <div
            style={{
              marginBottom: 10,
              fontSize: 15,
              fontWeight: 900,
              color: '#1f2430',
            }}
          >
            {formatPrice(selectedMaster.price, tr)}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              marginBottom: 10,
            }}
          >
            {normalizePaymentMethods(selectedMaster.paymentMethods)
              .slice(0, 3)
              .map((method) => {
                const badge = paymentBadge(method, language);

                return (
                  <div
                    key={method}
                    style={{
                      border: '3px solid #111111',
                      background: '#ffffff',
                      borderRadius: 999,
                      padding: '10px 8px',
                      fontSize: 11,
                      fontWeight: 900,
                      color: '#2b3745',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textAlign: 'center',
                      minHeight: 46,
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>{badge.icon}</span>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.15fr',
              gap: 8,
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
                border: '3px solid #111111',
                background: '#ffffff',
                color: '#1d2331',
                borderRadius: 22,
                padding: '14px 8px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
                border: '3px solid #111111',
                background: '#69b8eb',
                color: '#ffffff',
                borderRadius: 22,
                padding: '14px 8px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
                border: '3px solid #111111',
                background: '#45c63d',
                color: '#ffffff',
                borderRadius: 22,
                padding: '14px 8px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
