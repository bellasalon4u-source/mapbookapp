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
    soft: string;
    tagBg: string;
    tagText: string;
  }
> = {
  beauty: {
    border: '#efb3c4',
    soft: '#fff7fa',
    tagBg: '#fde8ef',
    tagText: '#b84f73',
  },
  wellness: {
    border: '#abdcb3',
    soft: '#f5fcf6',
    tagBg: '#e9f8ec',
    tagText: '#348d4e',
  },
  home: {
    border: '#e5cfaa',
    soft: '#fffaf3',
    tagBg: '#f9efdd',
    tagText: '#9e7343',
  },
  repairs: {
    border: '#a9c4ef',
    soft: '#f6f9ff',
    tagBg: '#e8f0ff',
    tagText: '#315ea6',
  },
  tech: {
    border: '#bcc6d2',
    soft: '#f8fafc',
    tagBg: '#eef2f7',
    tagText: '#445365',
  },
  pets: {
    border: '#b7dcae',
    soft: '#f7fcf5',
    tagBg: '#ebf7e8',
    tagText: '#3b8240',
  },
  auto: {
    border: '#f0c28f',
    soft: '#fff9f3',
    tagBg: '#fdeedc',
    tagText: '#ae651d',
  },
  moving: {
    border: '#c3bdf0',
    soft: '#faf9ff',
    tagBg: '#efedff',
    tagText: '#6658bf',
  },
  activities: {
    border: '#e7b2c8',
    soft: '#fff8fb',
    tagBg: '#fcecf3',
    tagText: '#ab5176',
  },
  events: {
    border: '#efb3b3',
    soft: '#fff9f9',
    tagBg: '#fdecec',
    tagText: '#b04a4a',
  },
  creative: {
    border: '#cbbcf0',
    soft: '#fbf9ff',
    tagBg: '#f1ecff',
    tagText: '#7459b6',
  },
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
  ];

  return fallback[index % fallback.length];
}

function inferCategory(master: Master): string {
  if (master.category && typeof master.category === 'string') {
    return master.category.toLowerCase();
  }

  const text = `${master.title || ''} ${master.name || ''}`.toLowerCase();

  if (
    text.includes('hair') ||
    text.includes('beauty') ||
    text.includes('brow') ||
    text.includes('lash') ||
    text.includes('nail') ||
    text.includes('makeup') ||
    text.includes('keratin')
  ) {
    return 'beauty';
  }

  if (
    text.includes('massage') ||
    text.includes('spa') ||
    text.includes('wellness') ||
    text.includes('recovery')
  ) {
    return 'wellness';
  }

  if (
    text.includes('clean') ||
    text.includes('handyman') ||
    text.includes('home')
  ) {
    return 'home';
  }

  if (
    text.includes('repair') ||
    text.includes('appliance') ||
    text.includes('shoe repair') ||
    text.includes('watch repair')
  ) {
    return 'repairs';
  }

  if (
    text.includes('phone') ||
    text.includes('laptop') ||
    text.includes('computer') ||
    text.includes('tablet') ||
    text.includes('tech') ||
    text.includes('tv')
  ) {
    return 'tech';
  }

  if (
    text.includes('pet') ||
    text.includes('dog') ||
    text.includes('cat') ||
    text.includes('grooming') ||
    text.includes('walker')
  ) {
    return 'pets';
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

function PaymentBadges({ methods }: { methods?: PaymentMethod[] }) {
  const list = methods && methods.length > 0 ? methods : ['cash', 'card'];

  const items = list.map((method) => {
    if (method === 'cash') return { key: 'cash', icon: '💵', label: 'Cash' };
    if (method === 'card') return { key: 'card', icon: '💳', label: 'Card' };
    return { key: 'wallet', icon: '👛', label: 'E-money' };
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
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: '#354150',
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingSelectedCard({
  master,
  position,
}: {
  master: Master;
  position: [number, number];
}) {
  const map = useMap();
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  const category = inferCategory(master);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.beauty;
  const available = isAvailableToday(master);

  useEffect(() => {
    const update = () => {
      const p = map.latLngToContainerPoint(position);
      setPoint({ x: p.x, y: p.y });
    };

    update();
    map.on('move zoom resize', update);

    return () => {
      map.off('move zoom resize', update);
    };
  }, [map, position]);

  if (!point) return null;

  const mapSize = map.getSize();
  const cardWidth = 288;
  const desiredLeft = point.x - 120;
  const left = Math.max(12, Math.min(desiredLeft, mapSize.x - cardWidth - 12));
  const top = Math.max(14, point.y - 156);

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
        zIndex: 900,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
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
          gridTemplateColumns: '72px 1fr auto',
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
            position: 'relative',
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
          style={{
            border: `2px solid ${style.border}`,
            background: '#ffffff',
            color: '#2a2f36',
            borderRadius: 16,
            padding: '12px 18px',
            fontSize: 15,
            fontWeight: 800,
            flex: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          View
        </button>

        <button
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
          }}
          onClick={(e) => e.stopPropagation()}
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
  activeCategory,
  selectedMasterId,
  onMasterSelect,
  onMapBackgroundClick,
  fullScreen,
}: RealMapProps) {
  const filteredMasters = useMemo(() => {
    if (!activeCategory) return masters;
    return masters.filter((master) => inferCategory(master) === activeCategory);
  }, [masters, activeCategory]);

  const center = useMemo<[number, number]>(() => {
    if (filteredMasters.length > 0) {
      return getCoords(filteredMasters[0], 0);
    }
    return [51.5074, -0.1278];
  }, [filteredMasters]);

  const tileUrl =
    mapMode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution =
    mapMode === 'satellite'
      ? '&copy; Esri'
      : '&copy; OpenStreetMap contributors';

  const selectedMaster =
    filteredMasters.find((m) => String(m.id) === String(selectedMasterId)) || null;

  const selectedPosition = selectedMaster
    ? getCoords(
        selectedMaster,
        filteredMasters.findIndex((m) => String(m.id) === String(selectedMaster.id))
      )
    : null;

  return (
    <div
      style={{
        width: '100%',
        height: fullScreen ? '100vh' : '100%',
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

        {filteredMasters.map((master, index) => {
          const coords = getCoords(master, index);
          const available = isAvailableToday(master);
          const selected = String(selectedMasterId) === String(master.id);

          return (
            <Marker
              key={String(master.id)}
              position={coords}
              icon={createCirclePin({ available, selected })}
              eventHandlers={{
                click: () => {
                  onMasterSelect?.(master);
                },
              }}
            />
          );
        })}

        {selectedMaster && selectedPosition && (
          <FloatingSelectedCard
            master={selectedMaster}
            position={selectedPosition}
          />
        )}
      </MapContainer>
    </div>
  );
}
