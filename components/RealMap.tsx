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

const CATEGORY_THEMES: Record<
  string,
  {
    pin: string;
    soft: string;
    border: string;
    tagBg: string;
    tagText: string;
    buttonBg: string;
    buttonText: string;
  }
> = {
  beauty: {
    pin: '#ea6f92',
    soft: '#fff6f8',
    border: '#f1a7bb',
    tagBg: '#fde8ef',
    tagText: '#b94b70',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  wellness: {
    pin: '#51b36b',
    soft: '#f4fbf5',
    border: '#9bd6aa',
    tagBg: '#e7f7eb',
    tagText: '#2f8b47',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  home: {
    pin: '#d7b47b',
    soft: '#fffaf3',
    border: '#e7cfaa',
    tagBg: '#f9efdd',
    tagText: '#9b7040',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  repairs: {
    pin: '#2f67b8',
    soft: '#f5f9ff',
    border: '#9dbcf0',
    tagBg: '#e7f0ff',
    tagText: '#29559a',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  tech: {
    pin: '#4e5e73',
    soft: '#f7f9fc',
    border: '#b8c3d1',
    tagBg: '#edf2f8',
    tagText: '#415167',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  pets: {
    pin: '#58a95a',
    soft: '#f5fbf4',
    border: '#a7d8a6',
    tagBg: '#e9f7e7',
    tagText: '#2f7f35',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  auto: {
    pin: '#d9822b',
    soft: '#fff8f2',
    border: '#f1c18f',
    tagBg: '#fdecd9',
    tagText: '#a45d18',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  moving: {
    pin: '#6c63c9',
    soft: '#f8f7ff',
    border: '#b5b1ec',
    tagBg: '#ecebff',
    tagText: '#584eb9',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  activities: {
    pin: '#c9658e',
    soft: '#fff7fb',
    border: '#ecb4cb',
    tagBg: '#fcebf3',
    tagText: '#a94772',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  events: {
    pin: '#cf5d62',
    soft: '#fff8f8',
    border: '#efb0b3',
    tagBg: '#fdeaea',
    tagText: '#ae4448',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
  },
  creative: {
    pin: '#8d68d1',
    soft: '#faf8ff',
    border: '#cdbbf0',
    tagBg: '#f1ebff',
    tagText: '#7452b3',
    buttonBg: '#ffffff',
    buttonText: '#2a2f36',
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

function createPinIcon({
  category,
  available,
  selected,
}: {
  category: string;
  available: boolean;
  selected: boolean;
}) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.beauty;
  const size = selected ? 34 : 30;
  const stroke = selected ? 5 : 4;
  const ring = available ? '#2fbb52' : '#ef5a5a';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${theme.pin};
        border:${stroke}px solid #20242b;
        box-shadow:0 6px 14px rgba(0,0,0,0.18);
      ">
        <div style="
          position:absolute;
          right:-2px;
          bottom:-2px;
          width:12px;
          height:12px;
          border-radius:999px;
          background:${ring};
          border:2px solid #ffffff;
        "></div>
      </div>
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
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.beauty;
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

  const cardWidth = 270;
  const left = Math.max(12, Math.min(point.x - 70, map.getSize().x - cardWidth - 12));
  const top = Math.max(12, point.y - 126);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: cardWidth,
        background: '#ffffff',
        border: `2px solid ${theme.border}`,
        borderRadius: 24,
        boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
        padding: 12,
        zIndex: 900,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          position: 'absolute',
          left: 78,
          bottom: -12,
          width: 22,
          height: 22,
          background: '#ffffff',
          borderRight: `2px solid ${theme.border}`,
          borderBottom: `2px solid ${theme.border}`,
          transform: 'rotate(45deg)',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 18,
            overflow: 'hidden',
            border: `3px solid ${theme.soft}`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            position: 'relative',
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
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 18,
              height: 18,
              borderRadius: 999,
              background: available ? '#2fbb52' : '#ef5a5a',
              border: '3px solid #fff',
            }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
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
                background: theme.tagBg,
                color: theme.tagText,
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
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#3f4b59',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <span style={{ color: '#e3b341' }}>★</span>
            <span>{(master.rating ?? 4.8).toFixed(1)}</span>
          </div>
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
            border: `2px solid ${theme.border}`,
            background: theme.buttonBg,
            color: theme.buttonText,
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
            background: '#57b7de',
            color: '#fff',
            borderRadius: 16,
            padding: '12px 18px',
            fontSize: 15,
            fontWeight: 800,
            flex: 1,
            boxShadow: '0 8px 18px rgba(87,183,222,0.24)',
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
          const category = inferCategory(master);
          const available = isAvailableToday(master);
          const selected = String(selectedMasterId) === String(master.id);

          return (
            <Marker
              key={String(master.id)}
              position={coords}
              icon={createPinIcon({ category, available, selected })}
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
