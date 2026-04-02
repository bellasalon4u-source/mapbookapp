'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

function createCirclePin({
  available,
  selected,
}: {
  available: boolean;
  selected: boolean;
}) {
  const size = selected ? 40 : 34;
  const fill = available ? '#32c255' : '#f05d62';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${fill};
        border:5px solid #1e232a;
        box-shadow:0 8px 18px rgba(0,0,0,0.20);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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
  onMapReady,
  onPointChange,
}: {
  selectedPosition: [number, number] | null;
  onMapReady: (map: L.Map) => void;
  onPointChange: (point: { x: number; y: number } | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

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

function PaymentBadges({ methods }: { methods?: PaymentMethod[] }) {
  const list = methods && methods.length > 0 ? methods : ['cash', 'card'];

  const items = list.map((method) => {
    if (method === 'cash') return { key: 'cash', icon: '💵' };
    if (method === 'card') return { key: 'card', icon: '💳' };
    return { key: 'wallet', icon: '👛' };
  });

  return (
    <div
      style={{
        marginTop: 10,
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
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            lineHeight: 1,
            minWidth: 36,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}

function FloatingSelectedCard({
  master,
  point,
}: {
  master: Master;
  point: { x: number; y: number };
}) {
  const category = inferCategory(master);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.beauty;
  const available = isAvailableToday(master);

  const cardWidth = 288;
  const left = Math.max(12, Math.min(point.x - 120, 430 - cardWidth - 12));
  const top = Math.max(18, point.y - 156);

  const openProviderPage = () => {
    window.location.href = `/provider/${master.id}`;
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
        position: 'absolute',
        left,
        top,
        width: cardWidth,
        background: '#ffffff',
        border: `2px solid ${style.border}`,
        borderRadius: 26,
        boxShadow: '0 16px 30px rgba(0,0,0,0.18)',
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
          left: Math.max(34, Math.min(point.x - left - 10, cardWidth - 50)),
          bottom: -12,
          width: 24,
          height: 24,
          background: '#ffffff',
          borderRight: `2px solid ${style.border}`,
          borderBottom: `2px solid ${style.border}`,
          transform: 'rotate(45deg)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 22,
          top: -44,
          background: '#ffffff',
          border: `2px solid ${style.border}`,
          borderRadius: 16,
          padding: '8px 12px',
          fontSize: 15,
          fontWeight: 800,
          color: '#27313d',
          boxShadow: '0 10px 18px rgba(0,0,0,0.12)',
        }}
      >
        {getCategoryLabel(category)}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '72px 1fr',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            overflow: 'hidden',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            background: '#eee',
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

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#1f2430',
              lineHeight: 1.15,
            }}
          >
            {master.name || master.title || 'Provider'}
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: style.tagBg,
                color: style.tagText,
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {getCategoryLabel(category)}
            </span>

            <span
              style={{
                color: available ? '#2f9c47' : '#d65a5a',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {available ? 'Available today' : 'Unavailable today'}
            </span>

            <span
              style={{
                color: '#1f2430',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              ★ {(master.rating ?? 4.9).toFixed(1)}
            </span>
          </div>

          <PaymentBadges methods={master.paymentMethods} />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={openProviderPage}
          style={{
            border: `2px solid ${style.border}`,
            background: '#ffffff',
            color: '#2a2f36',
            borderRadius: 16,
            padding: '12px 18px',
            fontSize: 15,
            fontWeight: 800,
            flex: 1,
            cursor: 'pointer',
          }}
        >
          View
        </button>

        <button
          type="button"
          onClick={openRoute}
          style={{
            border: 'none',
            background: '#56b7de',
            color: '#fff',
            borderRadius: 16,
            padding: '12px 18px',
            fontSize: 15,
            fontWeight: 800,
            flex: 1,
            boxShadow: '0 8px 18px rgba(86,183,222,0.24)',
            cursor: 'pointer',
          }}
        >
          Route
        </button>
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
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [screenPoint, setScreenPoint] = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      ref={wrapperRef}
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
          onMapReady={setMapInstance}
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

      {selectedMaster && screenPoint && (
        <FloatingSelectedCard master={selectedMaster} point={screenPoint} />
      )}
    </div>
  );
}
