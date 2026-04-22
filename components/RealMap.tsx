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

function getShareLabel(language: AppLanguage) {
  if (language === 'ES') return 'Compartir';
  if (language === 'RU') return 'Поделиться';
  if (language === 'UA') return 'Поділитися';
  if (language === 'CZ') return 'Sdílet';
  if (language === 'DE') return 'Teilen';
  if (language === 'IT') return 'Condividi';
  if (language === 'FR') return 'Partager';
  if (language === 'AR') return 'مشاركة';
  if (language === 'PL') return 'Udostępnij';
  return 'Share';
}

function getCopiedLabel(language: AppLanguage) {
  if (language === 'ES') return 'Enlace copiado';
  if (language === 'RU') return 'Ссылка скопирована';
  if (language === 'UA') return 'Посилання скопійовано';
  if (language === 'CZ') return 'Odkaz zkopírován';
  if (language === 'DE') return 'Link kopiert';
  if (language === 'IT') return 'Link copiato';
  if (language === 'FR') return 'Lien copié';
  if (language === 'AR') return 'تم نسخ الرابط';
  if (language === 'PL') return 'Skopiowano link';
  return 'Link copied';
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
  const trObj = t(language);
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: trObj.cash };
  if (normalized === 'card') return { icon: '💳', label: trObj.card };
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

function buildGenericPinIcon(): DivIcon {
  return L.divIcon({
    className: 'custom-generic-pin',
    html: `
      <div style="position:relative;width:42px;height:58px;">
        <div style="
          position:absolute;
          left:50%;
          top:16px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:12px solid transparent;
          border-right:12px solid transparent;
          border-top:20px solid #44c55a;
          filter:drop-shadow(0 4px 6px rgba(0,0,0,0.16));
        "></div>

        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:34px;
          height:34px;
          border-radius:999px;
          background:#44c55a;
          border:4px solid #ffffff;
          box-shadow:0 5px 12px rgba(0,0,0,0.14);
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <div style="
            width:12px;
            height:12px;
            border-radius:999px;
            background:#ffffff;
          "></div>
        </div>
      </div>
    `,
    iconSize: [42, 58],
    iconAnchor: [21, 53],
  });
}

function buildSelectedMarkerIcon(
  master: MasterItem,
  language: AppLanguage,
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

  const size = 66;
  const photoSize = 46;
  const likeBadgeSize = 24;
  const statusBadgeSize = 16;
  const rightBadgeOffset = hasDiscount ? 42 : 4;

  return L.divIcon({
    className: 'custom-selected-master-pin',
    html: `
      <div style="position:relative;width:${hasDiscount ? size + 50 : size}px;height:${size + 18}px;">
        <div style="
          position:absolute;
          left:${size / 2}px;
          top:${size - 5}px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:12px solid transparent;
          border-right:12px solid transparent;
          border-top:18px solid ${accent};
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
          border:5px solid ${accent};
          box-shadow:0 7px 16px rgba(0,0,0,0.16);
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
            top:${size * 0.46}px;
            min-width:52px;
            height:30px;
            padding:0 10px;
            background:linear-gradient(180deg,#ffe66d 0%,#ffd12d 100%);
            border:3px solid #111111;
            border-radius:999px;
            box-shadow:0 5px 10px rgba(0,0,0,0.18);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#2a2115;
            font-size:14px;
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
            font-size:${isLiked ? 15 : 0}px;
            font-weight:900;
            line-height:1;
            cursor:pointer;
          "
        >
          ${isLiked ? '♥' : ''}
        </div>

        <div style="
          position:absolute;
          right:${hasDiscount ? 86 : likeBadgeSize + 18}px;
          top:${size * 0.52}px;
          width:${statusBadgeSize + 8}px;
          height:${statusBadgeSize + 8}px;
          background:#fff;
          border:4px solid ${availabilityColor};
          border-radius:999px;
          box-shadow:0 4px 10px rgba(0,0,0,0.12);
        "></div>
      </div>
    `,
    iconSize: [hasDiscount ? size + 50 : size, size + 18],
    iconAnchor: [size / 2, size + 8],
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
  selectedMasterId,
}: {
  masters: MasterItem[];
  focusLocation: [number, number];
  selectedMasterId?: string | number | null;
}) {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize();
    }, 80);

    const selected =
      selectedMasterId !== null && selectedMasterId !== undefined
        ? masters.find((item) => String(item.id) === String(selectedMasterId))
        : null;

    if (selected && typeof selected.lat === 'number' && typeof selected.lng === 'number') {
      map.setView([selected.lat, selected.lng], 12, { animate: true });
      return () => window.clearTimeout(id);
    }

    const validPoints: [number, number][] = masters
      .filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number')
      .map((item) => [item.lat as number, item.lng as number]);

    if (validPoints.length === 0) {
      map.setView(focusLocation, 11, { animate: true });
      return () => window.clearTimeout(id);
    }

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 11, { animate: true });
      return () => window.clearTimeout(id);
    }

    const bounds = L.latLngBounds(validPoints);
    map.fitBounds(bounds.pad(0.18), { animate: true });

    return () => window.clearTimeout(id);
  }, [map, masters, focusLocation, selectedMasterId]);

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
    map.setView(targetLocation, 13, { animate: true });
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

  const trObj = t(language);

  useEffect(() => {
    const next = getEffectiveSearchLocation();
    setFocusLocation([next.lat || londonCenter[0], next.lng || londonCenter[1]]);
  }, [language, recenterToUserTrigger]);

  const safeMasters = useMemo(() => {
    return (masters || []).map((item, index) => ({
      ...item,
      id: item.id ?? String(index),
      lat: typeof item.lat === 'number' ? item.lat : undefined,
      lng: typeof item.lng === 'number' ? item.lng : undefined,
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
  }, [masters, promotionBadgeTextByMasterId]);

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

  const shareMaster = async (master: MasterItem) => {
    if (typeof window === 'undefined') return;

    const lat = typeof master.lat === 'number' ? master.lat : focusLocation[0];
    const lng = typeof master.lng === 'number' ? master.lng : focusLocation[1];
    const name = getSelectedMasterName(master, language);
    const shareUrl =
      window.location.origin +
      `/master/${master.id}?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
        String(lng)
      )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `${getShareLabel(language)}: ${name}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        window.alert(getCopiedLabel(language));
        return;
      }

      window.prompt(getShareLabel(language), shareUrl);
    } catch {
      // no-op
    }
  };

  const locationDot = useMemo<[number, number]>(() => {
    if (focusLocation) return focusLocation;
    if (currentDetectedLocation) return currentDetectedLocation;
    return londonCenter;
  }, [focusLocation, currentDetectedLocation]);

  const visibleMasters = useMemo(() => {
    return safeMasters.filter(
      (item) => typeof item.lat === 'number' && typeof item.lng === 'number'
    );
  }, [safeMasters]);

  const selectedIdString =
    selectedMasterId === null || selectedMasterId === undefined ? null : String(selectedMasterId);

  const selectedLikeState = selectedMaster
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
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={getTileUrl(mapMode)} />

        <UserLocationLayer language={language} onLocationFound={setCurrentDetectedLocation} />
        <FitBoundsLayer
          masters={visibleMasters}
          focusLocation={focusLocation}
          selectedMasterId={selectedMasterId}
        />
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

        {visibleMasters.map((master, index) => {
          const isSelected = String(master.id) === selectedIdString;
          const isLiked = likedMasterIds.includes(String(master.id));

          const icon =
            isSelected || index === 0
              ? buildSelectedMarkerIcon(master, language, isLiked, promotionBadgeTextByMasterId)
              : buildGenericPinIcon();

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat as number, master.lng as number]}
              icon={icon}
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
            bottom: 14,
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
                aria-label="Close"
              >
                ×
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  shareMaster(selectedMaster);
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
                  color: '#111111',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
                aria-label={getShareLabel(language)}
                title={getShareLabel(language)}
              >
                ↗
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
                  right: 52,
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
                aria-label="Favourite"
              >
                {selectedLikeState ? '♥' : '♡'}
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
            {getVerifiedCardLabel(language, trObj)}
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
              {selectedMaster.availableNow ? trObj.availableNow : trObj.unavailableToday}
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
            {formatPrice(selectedMaster.price, trObj)}
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
              {trObj.view}
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
              {trObj.route}
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
              {trObj.bookNow}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
