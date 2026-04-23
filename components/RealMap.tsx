'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, CircleMarker } from 'react-leaflet';
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
    lat: 51.5238,
    lng: -0.165,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
  },
  {
    id: 'demo-2',
    name: 'Mark',
    category: 'barber',
    lat: 51.5105,
    lng: -0.146,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
  },
  {
    id: 'demo-3',
    name: 'Oksana',
    category: 'beauty',
    lat: 51.5052,
    lng: -0.118,
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
  },
  {
    id: 'demo-4',
    name: 'David',
    category: 'pets',
    lat: 51.5195,
    lng: -0.091,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
  },
  {
    id: 'demo-5',
    name: 'Mila',
    category: 'wellness',
    lat: 51.4965,
    lng: -0.084,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
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
  onUserLocationChange,
}: {
  trigger?: number;
  onUserLocationChange?: (coords: [number, number]) => void;
}) {
  const map = useMap();
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          onUserLocationChange?.(coords);
        },
        () => {
          onUserLocationChange?.(LONDON_CENTER);
        }
      );
    } else {
      onUserLocationChange?.(LONDON_CENTER);
    }
  }, [onUserLocationChange]);

  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          map.flyTo(coords, 13, { duration: 0.8 });
          onUserLocationChange?.(coords);
        },
        () => {
          map.flyTo(LONDON_CENTER, 11, { duration: 0.8 });
          onUserLocationChange?.(LONDON_CENTER);
        }
      );
      return;
    }

    map.flyTo(LONDON_CENTER, 11, { duration: 0.8 });
    onUserLocationChange?.(LONDON_CENTER);
  }, [map, trigger, onUserLocationChange]);

  return null;
}

function getPinColors(master: MasterItem, isSelected: boolean) {
  if (isSelected) {
    return {
      ring: '#ef7db1',
      bubble: '#ffffff',
      bubbleBorder: '#ef7db1',
    };
  }

  if (master.availableNow) {
    return {
      ring: '#63d46c',
      bubble: '#ffffff',
      bubbleBorder: '#63d46c',
    };
  }

  const category = String(master.category || '').toLowerCase();

  if (category === 'beauty') {
    return {
      ring: '#ef7db1',
      bubble: '#ffffff',
      bubbleBorder: '#ef7db1',
    };
  }

  if (category === 'barber' || category === 'tech' || category === 'repairs') {
    return {
      ring: '#5c98ff',
      bubble: '#ffffff',
      bubbleBorder: '#5c98ff',
    };
  }

  if (category === 'pets') {
    return {
      ring: '#63d46c',
      bubble: '#ffffff',
      bubbleBorder: '#63d46c',
    };
  }

  if (category === 'wellness' || category === 'home') {
    return {
      ring: '#f1c84c',
      bubble: '#ffffff',
      bubbleBorder: '#f1c84c',
    };
  }

  return {
    ring: '#63d46c',
    bubble: '#ffffff',
    bubbleBorder: '#63d46c',
  };
}

function createMasterPin(master: MasterItem, isSelected: boolean, isLiked: boolean) {
  const colors = getPinColors(master, isSelected);
  const avatar = master.avatar || 'https://via.placeholder.com/80x80.png?text=Pro';

  const pinWidth = isSelected ? 66 : 54;
  const pinHeight = isSelected ? 86 : 72;
  const avatarSize = isSelected ? 44 : 34;
  const whiteBorder = isSelected ? 4 : 3;
  const smallBubble = isSelected ? 17 : 14;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${pinWidth}px;height:${pinHeight}px;">
        ${
          isLiked
            ? `<div style="
                position:absolute;
                left:6px;
                top:4px;
                width:18px;
                height:18px;
                border-radius:999px;
                background:#ffffff;
                border:1.5px solid #f2b6ca;
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 2px 6px rgba(0,0,0,0.12);
                z-index:3;
              ">
                <span style="font-size:11px;line-height:1;color:#ff4f93;">♥</span>
              </div>`
            : ''
        }

        <div style="
          position:absolute;
          left:50%;
          top:8px;
          transform:translateX(-50%);
          width:${pinWidth}px;
          height:${pinHeight - 6}px;
          background:${colors.ring};
          border-radius:${isSelected ? '34px 34px 34px 6px' : '30px 30px 30px 6px'};
          transform-origin:center;
          clip-path:polygon(50% 100%, 11% 58%, 11% 22%, 22% 11%, 50% 6%, 78% 11%, 89% 22%, 89% 58%);
          box-shadow:0 6px 14px rgba(0,0,0,0.16);
        "></div>

        <div style="
          position:absolute;
          left:50%;
          top:${isSelected ? 13 : 12}px;
          transform:translateX(-50%);
          width:${avatarSize + whiteBorder * 2}px;
          height:${avatarSize + whiteBorder * 2}px;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:2;
        ">
          <div style="
            width:${avatarSize}px;
            height:${avatarSize}px;
            border-radius:50%;
            overflow:hidden;
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
          right:${isSelected ? 5 : 4}px;
          bottom:${isSelected ? 12 : 10}px;
          width:${smallBubble}px;
          height:${smallBubble}px;
          border-radius:50%;
          background:${colors.bubble};
          border:3px solid ${colors.bubbleBorder};
          z-index:2;
          box-shadow:0 3px 8px rgba(0,0,0,0.10);
        "></div>
      </div>
    `,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight - 4],
    popupAnchor: [0, -pinHeight + 10],
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

  return minDistance > 0.014;
}

function isInsideLondonArea(items: MasterItem[]) {
  return items.every((item) => {
    return item.lat > 51.44 && item.lat < 51.56 && item.lng > -0.24 && item.lng < 0.03;
  });
}

export default function RealMap({
  masters = [],
  mapMode = 'map',
  selectedMasterId = null,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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

    return null;
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
        zoom={12}
        minZoom={9}
        maxZoom={17}
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
        <RecenterMap
          trigger={recenterToUserTrigger}
          onUserLocationChange={(coords) => setUserLocation(coords)}
        />

        {userLocation ? (
          <>
            <CircleMarker
              center={userLocation}
              radius={18}
              pathOptions={{
                color: 'transparent',
                fillColor: '#2b7cf6',
                fillOpacity: 0.12,
              }}
            />
            <CircleMarker
              center={userLocation}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
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

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, Boolean(isSelected), isLiked)}
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
