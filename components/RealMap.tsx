'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from 'react-leaflet';
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
  onMasterSelect?: (master: MasterItem) => void;
  onMapBackgroundClick?: () => void;
  onToggleLike?: (master: MasterItem) => void;
  onViewMaster?: (master: MasterItem) => void;
  onBookMaster?: (master: MasterItem) => void;
};

const LONDON_CENTER: [number, number] = [51.5078, -0.1278];

const DEMO_MASTERS: MasterItem[] = [
  {
    id: 'demo-1',
    name: 'Anna',
    category: 'beauty',
    lat: 51.536,
    lng: -0.186,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-2',
    name: 'Mark',
    category: 'barber',
    lat: 51.493,
    lng: -0.183,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-3',
    name: 'Oksana',
    category: 'beauty',
    lat: 51.507,
    lng: -0.112,
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-4',
    name: 'David',
    category: 'pets',
    lat: 51.539,
    lng: -0.052,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-5',
    name: 'Mila',
    category: 'wellness',
    lat: 51.487,
    lng: -0.028,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  },
];

function MapEvents({
  onMapBackgroundClick,
}: {
  onMapBackgroundClick?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = () => {
      onMapBackgroundClick?.();
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapBackgroundClick]);

  return null;
}

function RecenterMap({
  trigger,
}: {
  trigger?: number;
}) {
  const map = useMap();
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {
            duration: 0.8,
          });
        },
        () => {
          map.flyTo(LONDON_CENTER, 11, { duration: 0.8 });
        }
      );
      return;
    }

    map.flyTo(LONDON_CENTER, 11, { duration: 0.8 });
  }, [map, trigger]);

  return null;
}

function getPinColors(master: MasterItem, isSelected: boolean) {
  if (isSelected) {
    return {
      ring: '#f0629b',
      accent: '#f0629b',
      bubble: '#ffffff',
    };
  }

  const category = String(master.category || '').toLowerCase();

  if (category === 'beauty') {
    return {
      ring: '#ef7db1',
      accent: '#ef7db1',
      bubble: '#ffffff',
    };
  }

  if (category === 'barber' || category === 'tech' || category === 'repairs') {
    return {
      ring: '#4f93ff',
      accent: '#4f93ff',
      bubble: '#ffffff',
    };
  }

  if (category === 'pets') {
    return {
      ring: '#79be76',
      accent: '#79be76',
      bubble: '#ffffff',
    };
  }

  if (category === 'wellness' || category === 'home') {
    return {
      ring: '#f0bf48',
      accent: '#f0bf48',
      bubble: '#ffffff',
    };
  }

  return {
    ring: '#79be76',
    accent: '#79be76',
    bubble: '#ffffff',
  };
}

function createMasterPin(master: MasterItem, isSelected: boolean) {
  const colors = getPinColors(master, isSelected);
  const avatar = master.avatar || 'https://via.placeholder.com/80x80.png?text=Pro';

  const size = isSelected ? 98 : 62;
  const innerSize = isSelected ? 64 : 40;
  const bubble = isSelected ? 30 : 22;
  const outline = isSelected ? 5 : 4;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 16}px;">
        <div style="
          position:absolute;
          left:50%;
          top:${isSelected ? 8 : 6}px;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${colors.ring};
          box-shadow:0 6px 14px rgba(0,0,0,0.18);
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <div style="
            width:${innerSize}px;
            height:${innerSize}px;
            border-radius:50%;
            overflow:hidden;
            border:${outline}px solid #ffffff;
            background:#ffffff;
          ">
            <img
              src="${avatar}"
              alt=""
              style="width:100%;height:100%;object-fit:cover;display:block;"
            />
          </div>
        </div>

        <div style="
          position:absolute;
          right:${isSelected ? 4 : 1}px;
          bottom:${isSelected ? 10 : 8}px;
          width:${bubble}px;
          height:${bubble}px;
          border-radius:50%;
          background:${colors.bubble};
          border:${outline}px solid ${colors.accent};
          box-shadow:0 4px 10px rgba(0,0,0,0.10);
        "></div>
      </div>
    `,
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function distance(a: MasterItem, b: MasterItem) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

function hasGoodSpread(items: MasterItem[]) {
  if (items.length < 4) return false;

  let minDistance = Infinity;

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      minDistance = Math.min(minDistance, distance(items[i], items[j]));
    }
  }

  return minDistance > 0.02;
}

function isInsideLondonArea(items: MasterItem[]) {
  return items.every((item) => {
    return item.lat > 51.44 && item.lat < 51.56 && item.lng > -0.24 && item.lng < 0.02;
  });
}

export default function RealMap({
  masters = [],
  mapMode = 'map',
  selectedMasterId = null,
  recenterToUserTrigger = 0,
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const safeMasters = useMemo(() => {
    const filtered = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    const firstFive = filtered.slice(0, 5);

    if (firstFive.length < 4) return DEMO_MASTERS;
    if (!isInsideLondonArea(firstFive)) return DEMO_MASTERS;
    if (!hasGoodSpread(firstFive)) return DEMO_MASTERS;

    return firstFive;
  }, [masters]);

  const selectedMaster = useMemo(() => {
    if (selectedMasterId !== null && selectedMasterId !== undefined) {
      const found =
        safeMasters.find((master) => String(master.id) === String(selectedMasterId)) || null;

      if (found) return found;
    }

    return safeMasters[2] || null;
  }, [safeMasters, selectedMasterId]);

  const tileUrl =
    mapMode === 'satellite'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={LONDON_CENTER}
        zoom={11}
        minZoom={9}
        maxZoom={16}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
          background: '#f2f2ef',
        }}
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={tileUrl} />

        <ZoomControl position="topleft" />

        <MapEvents onMapBackgroundClick={onMapBackgroundClick} />
        <RecenterMap trigger={recenterToUserTrigger} />

        {safeMasters.map((master) => {
          const isSelected =
            selectedMaster && String(master.id) === String(selectedMaster.id);

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, Boolean(isSelected))}
              eventHandlers={{
                click: () => {
                  onMasterSelect?.(master);
                },
              }}
            />
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          font-family: Arial, sans-serif;
        }

        .leaflet-control-zoom {
          border: none !important;
          margin-top: 16px !important;
          margin-left: 16px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
          overflow: hidden;
          border-radius: 14px !important;
        }

        .leaflet-control-zoom a {
          width: 42px !important;
          height: 42px !important;
          line-height: 42px !important;
          font-size: 30px !important;
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
      `}</style>
    </div>
  );
}
