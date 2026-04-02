'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type PaymentMethod = 'cash' | 'card' | 'wallet';

type Master = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  city?: string;
  rating?: number;
  availableNow?: boolean;
  availableToday?: boolean;
  isAvailableToday?: boolean;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  paymentMethods?: PaymentMethod[];
  description?: string;
  price?: string;
  subcategory?: string;
  hours?: string;
  isVerifiedPro?: boolean;
  startingPrice?: string | number;
};

type RealMapProps = {
  masters: Master[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  onMasterSelect?: (master: Master) => void;
  onMapBackgroundClick?: () => void;
  fullScreen?: boolean;
};

const CATEGORY_STYLES: Record<
  string,
  {
    border: string;
    tagBg: string;
    tagText: string;
  }
> = {
  beauty: { border: '#efb3c4', tagBg: '#fde8ef', tagText: '#b84f73' },
  wellness: { border: '#abdcb3', tagBg: '#e9f8ec', tagText: '#348d4e' },
  home: { border: '#e5cfaa', tagBg: '#f9efdd', tagText: '#9e7343' },
  repairs: { border: '#a9c4ef', tagBg: '#e8f0ff', tagText: '#315ea6' },
  tech: { border: '#bcc6d2', tagBg: '#eef2f7', tagText: '#445365' },
  pets: { border: '#b7dcae', tagBg: '#ebf7e8', tagText: '#3b8240' },
  auto: { border: '#f0c28f', tagBg: '#fdeedc', tagText: '#ae651d' },
  moving: { border: '#c3bdf0', tagBg: '#efedff', tagText: '#6658bf' },
  activities: { border: '#e7b2c8', tagBg: '#fcecf3', tagText: '#ab5176' },
  events: { border: '#efb3b3', tagBg: '#fdecec', tagText: '#b04a4a' },
  creative: { border: '#cbbcf0', tagBg: '#f1ecff', tagText: '#7459b6' },
};

function getCoords(master: Master, index: number) {
  const lat = master.lat ?? master.latitude;
  const lng = master.lng ?? master.longitude;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return [lat, lng] as [number, number];
  }

  const fallback: [number, number][] = [
    [51.5074, -0.1278],
    [51.5134, -0.0915],
    [51.5007, -0.1246],
    [51.5202, -0.1028],
    [51.4955, -0.1722],
    [51.5308, -0.1238],
    [51.5098, -0.118],
    [51.5159, -0.1426],
  ];

  return fallback[index % fallback.length];
}

function inferCategory(master: Master): string {
  if (master.category && typeof master.category === 'string') {
    return master.category.toLowerCase();
  }
  return 'beauty';
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    beauty: 'Beauty',
    wellness: 'Wellness',
    home: 'Home',
    repairs: 'Repairs',
    tech: 'Tech',
    pets: 'Pets',
    auto: 'Auto',
    moving: 'Moving',
    activities: 'Activities',
    events: 'Events',
    creative: 'Creative',
  };

  return map[category] || 'Beauty';
}

function isAvailableToday(master: Master) {
  return (
    master.availableNow === true ||
    master.availableToday === true ||
    master.isAvailableToday === true
  );
}

function getStartingPrice(master: Master) {
  if (
    master.startingPrice !== undefined &&
    master.startingPrice !== null &&
    master.startingPrice !== ''
  ) {
    return typeof master.startingPrice === 'number'
      ? `From £${master.startingPrice}`
      : String(master.startingPrice).startsWith('From')
      ? String(master.startingPrice)
      : `From ${master.startingPrice}`;
  }

  if (master.price) {
    const raw = String(master.price).trim();
    if (!raw) return 'From £45';
    if (raw.toLowerCase().includes('from')) return raw;
    if (raw.includes('£')) return `From ${raw}`;
    return `From £${raw}`;
  }

  return 'From £45';
}

function createCirclePin({
  available,
  selected,
}: {
  available: boolean;
  selected: boolean;
}) {
  const size = selected ? 36 : 30;
  const fill = available ? '#32c255' : '#f05d62';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${fill};
        border:4px solid #1e232a;
        box-shadow:0 6px 14px rgba(0,0,0,0.18);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function PaymentBadges({ methods }: { methods?: PaymentMethod[] }) {
  const list = methods && methods.length > 0 ? methods : ['cash', 'card'];

  const items = list.map((method) => {
    if (method === 'cash') return { key: 'cash', icon: '💵', label: 'Cash' };
    if (method === 'card') return { key: 'card', icon: '💳', label: 'Card' };
    return { key: 'wallet', icon: '👛', label: 'Wallet' };
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            border: '1px solid #e6dfd5',
            background: '#fff',
            borderRadius: 999,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: '#2a2f36',
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function FavoriteButton({
  masterId,
  size = 22,
}: {
  masterId: string | number;
  size?: number;
}) {
  const storageKey = 'mapbook-favorites';
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const ids = raw ? JSON.parse(raw) : [];
      setIsFavorite(Array.isArray(ids) && ids.includes(String(masterId)));
    } catch {
      setIsFavorite(false);
    }
  }, [masterId]);

  const toggleFavorite = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    try {
      const raw = localStorage.getItem(storageKey);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const normalized = String(masterId);

      let next: string[];
      if (ids.includes(normalized)) {
        next = ids.filter((id) => id !== normalized);
        setIsFavorite(false);
      } else {
        next = [...ids, normalized];
        setIsFavorite(true);
      }

      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event('favorites-updated'));
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      onTouchEnd={toggleFavorite}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        fontSize: size,
        lineHeight: 1,
        color: isFavorite ? '#e15386' : '#6f6f73',
      }}
      aria-label="Favorite"
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  );
}

function MapClickHandler({
  onMapBackgroundClick,
}: {
  onMapBackgroundClick?: () => void;
}) {
  useMapEvents({
    click() {
      onMapBackgroundClick?.();
    },
  });

  return null;
}

function MapBridge({
  selectedPosition,
  onPointChange,
}: {
  selectedPosition: [number, number] | null;
  onPointChange: (point: { x: number; y: number } | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const updatePoint = () => {
      if (!selectedPosition) {
        onPointChange(null);
        return;
      }

      const p = map.latLngToContainerPoint(selectedPosition);
      onPointChange({ x: p.x, y: p.y });
    };

    updatePoint();
    map.on('move zoom resize', updatePoint);

    return () => {
      map.off('move zoom resize', updatePoint);
    };
  }, [map, selectedPosition, onPointChange]);

  return null;
}

function CompactMapCard({
  master,
  point,
  onOpenBigCard,
}: {
  master: Master;
  point: { x: number; y: number };
  onOpenBigCard: () => void;
}) {
  const category = inferCategory(master);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.beauty;
  const available = isAvailableToday(master);
  const startingPrice = getStartingPrice(master);

  const cardWidth = 290;
  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 390;

  const left = Math.max(10, Math.min(point.x - 115, viewportWidth - cardWidth - 10));
  const top = Math.max(12, point.y - 108);

  const openRoute = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    const lat = master.lat ?? master.latitude;
    const lng = master.lng ?? master.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openBooking = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    window.location.href = `/booking/${master.id}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: cardWidth,
        background: '#ffffff',
        border: `1.5px solid ${style.border}`,
        borderRadius: 20,
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
        padding: 12,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div
        style={{
          position: 'absolute',
          left: Math.max(42, Math.min(point.x - left - 8, cardWidth - 48)),
          bottom: -9,
          width: 18,
          height: 18,
          background: '#ffffff',
          borderRight: `1.5px solid ${style.border}`,
          borderBottom: `1.5px solid ${style.border}`,
          transform: 'rotate(45deg)',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr auto',
          gap: 10,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            overflow: 'hidden',
            border: '3px solid #fff',
            boxShadow: '0 5px 14px rgba(0,0,0,0.10)',
            background: '#eee',
            gridRow: '1 / span 4',
          }}
        >
          <img
            src={
              master.avatar ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
            }
            alt={master.name || 'Master'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#1f2430',
            lineHeight: 1.15,
            alignSelf: 'center',
          }}
        >
          {master.name || master.title || 'Provider'}
        </div>

        <div style={{ paddingTop: 1 }}>
          <FavoriteButton masterId={master.id} size={24} />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#f6f0e4',
              color: '#6a5132',
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            🏅 Verified Pro
          </div>
        </div>

        <div />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: style.tagBg,
              color: style.tagText,
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {getCategoryLabel(category)}
          </span>

          <span
            style={{
              color: available ? '#2f9c47' : '#d65a5a',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {available ? 'Available today' : 'Unavailable today'}
          </span>
        </div>

        <div />

        <div
          style={{
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: '#1f2430',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            ★ {(master.rating ?? 4.9).toFixed(1)}
          </span>

          <span
            style={{
              color: '#3c3128',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            {startingPrice}
          </span>
        </div>

        <div />

        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <PaymentBadges methods={master.paymentMethods} />
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.1fr',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={onOpenBigCard}
          style={{
            border: `2px solid ${style.border}`,
            background: '#ffffff',
            color: '#2a2f36',
            borderRadius: 16,
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          View
        </button>

        <button
          type="button"
          onClick={openRoute}
          onTouchEnd={openRoute}
          style={{
            border: 'none',
            background: '#56b7de',
            color: '#fff',
            borderRadius: 16,
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 800,
            boxShadow: '0 8px 18px rgba(86,183,222,0.18)',
            cursor: 'pointer',
          }}
        >
          Route
        </button>

        <button
          type="button"
          onClick={openBooking}
          onTouchEnd={openBooking}
          style={{
            border: 'none',
            background: '#3aa44b',
            color: '#fff',
            borderRadius: 16,
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 800,
            boxShadow: '0 8px 18px rgba(58,164,75,0.18)',
            cursor: 'pointer',
          }}
        >
          Book now
        </button>
      </div>
    </div>
  );
}

function BigMasterCard({
  master,
  onClose,
}: {
  master: Master;
  onClose: () => void;
}) {
  const category = inferCategory(master);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.beauty;
  const available = isAvailableToday(master);
  const startingPrice = getStartingPrice(master);

  const openBooking = () => {
    window.location.href = `/booking/${master.id}`;
  };

  const openRoute = () => {
    const lat = master.lat ?? master.latitude;
    const lng = master.lng ?? master.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,18,24,0.46)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#fff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: '0 -12px 30px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'relative',
            height: 240,
            overflow: 'hidden',
            background: '#eee',
          }}
        >
          <img
            src={
              master.avatar ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80'
            }
            alt={master.name || 'Master'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 42,
              height: 42,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <div
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              background: '#f5ead6',
              color: '#4a3627',
              borderRadius: 999,
              padding: '10px 16px',
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            {(master.rating ?? 4.9).toFixed(1)} ★
          </div>

          <div
            style={{
              position: 'absolute',
              left: 14,
              bottom: 14,
              background: '#35a548',
              color: '#fff',
              borderRadius: 18,
              padding: '14px 18px',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Book now
          </div>
        </div>

        <div style={{ padding: 22 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#161a24',
              lineHeight: 1.1,
            }}
          >
            {master.name || master.title || 'Provider'}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: '#f6f0e4',
                color: '#6a5132',
                borderRadius: 999,
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              🏅 Verified Pro
            </span>

            <span
              style={{
                background: style.tagBg,
                color: style.tagText,
                borderRadius: 999,
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {getCategoryLabel(category)}
            </span>

            <span
              style={{
                color: available ? '#2f9c47' : '#d65a5a',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              {available ? 'Available today' : 'Unavailable today'}
            </span>
          </div>

          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              lineHeight: 1.6,
              color: '#5f6572',
            }}
          >
            {master.description ||
              'Luxury hair extensions, keratin bonds, tape-ins and nano ring services in London.'}
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <div
              style={{
                border: '1px solid #e8e1d8',
                borderRadius: 24,
                padding: 20,
                background: '#fcfbf8',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#8a8f99',
                  marginBottom: 8,
                }}
              >
                Price
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#161a24',
                }}
              >
                {startingPrice}
              </div>
            </div>

            <div
              style={{
                border: '1px solid #e8e1d8',
                borderRadius: 24,
                padding: 20,
                background: '#fcfbf8',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#8a8f99',
                  marginBottom: 8,
                }}
              >
                Location
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#161a24',
                }}
              >
                {master.city || 'London'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: '#161a24',
                marginBottom: 12,
              }}
            >
              Payment methods
            </div>
            <PaymentBadges methods={master.paymentMethods} />
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: '#161a24',
                marginBottom: 12,
              }}
            >
              Service format
            </div>
            <div
              style={{
                display: 'inline-flex',
                background: '#eaf6eb',
                color: '#2f9150',
                borderRadius: 999,
                padding: '10px 16px',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              At client
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: '#161a24',
                marginBottom: 10,
              }}
            >
              Working hours
            </div>
            <div
              style={{
                fontSize: 18,
                color: '#5f6572',
                lineHeight: 1.6,
              }}
            >
              {master.hours || 'By appointment'}
            </div>
          </div>

          <div
            style={{
              marginTop: 30,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              paddingBottom: 26,
            }}
          >
            <button
              type="button"
              onClick={openRoute}
              style={{
                border: '2px solid #dac7cf',
                background: '#fff',
                color: '#1f2430',
                borderRadius: 18,
                padding: '16px 18px',
                fontSize: 18,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Route
            </button>

            <button
              type="button"
              onClick={openBooking}
              style={{
                border: 'none',
                background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
                color: '#fff',
                borderRadius: 18,
                padding: '16px 18px',
                fontSize: 18,
                fontWeight: 800,
                boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
                cursor: 'pointer',
              }}
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealMap({
  masters,
  mapMode = 'map',
  selectedMasterId,
  onMasterSelect,
  onMapBackgroundClick,
  fullScreen,
}: RealMapProps) {
  const [screenPoint, setScreenPoint] = useState<{ x: number; y: number } | null>(null);
  const [showBigCard, setShowBigCard] = useState(false);

  const safeMasters = Array.isArray(masters) ? masters : [];

  const center = useMemo<[number, number]>(() => {
    if (safeMasters.length > 0) {
      return getCoords(safeMasters[0], 0);
    }
    return [51.5074, -0.1278];
  }, [safeMasters]);

  const tileUrl =
    mapMode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution =
    mapMode === 'satellite'
      ? '&copy; Esri'
      : '&copy; OpenStreetMap contributors';

  const selectedMaster =
    safeMasters.find((m) => String(m.id) === String(selectedMasterId)) || null;

  const selectedPosition = selectedMaster
    ? getCoords(
        selectedMaster,
        safeMasters.findIndex((m) => String(m.id) === String(selectedMaster.id))
      )
    : null;

  useEffect(() => {
    setShowBigCard(false);
  }, [selectedMasterId]);

  return (
    <div
      style={{
        width: '100%',
        height: fullScreen ? '100vh' : '100%',
        position: 'relative',
      }}
    >
      <MapContainer
        center={center}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapClickHandler onMapBackgroundClick={onMapBackgroundClick} />
        <MapBridge
          selectedPosition={selectedPosition}
          onPointChange={setScreenPoint}
        />

        {safeMasters.map((master, index) => {
          const coords = getCoords(master, index);
          const available = isAvailableToday(master);
          const selected = String(selectedMasterId) === String(master.id);

          return (
            <Marker
              key={String(master.id)}
              position={coords}
              icon={createCirclePin({ available, selected })}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: (e) => {
                  if ((e as any)?.originalEvent?.stopPropagation) {
                    (e as any).originalEvent.stopPropagation();
                  }
                  onMasterSelect?.(master);
                },
                mousedown: (e) => {
                  if ((e as any)?.originalEvent?.stopPropagation) {
                    (e as any).originalEvent.stopPropagation();
                  }
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selectedMaster && screenPoint && !showBigCard && (
        <CompactMapCard
          master={selectedMaster}
          point={screenPoint}
          onOpenBigCard={() => setShowBigCard(true)}
        />
      )}

      {selectedMaster && showBigCard && (
        <BigMasterCard
          master={selectedMaster}
          onClose={() => setShowBigCard(false)}
        />
      )}
    </div>
  );
}
