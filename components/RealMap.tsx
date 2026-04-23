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
    availableNow: false,
    lat: 51.5231,
    lng: -0.1586,
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-2',
    name: 'Mark',
    category: 'barber',
    availableNow: true,
    lat: 51.5148,
    lng: -0.1322,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-3',
    name: 'Nadia',
    category: 'wellness',
    availableNow: false,
    lat: 51.5033,
    lng: -0.1195,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-4',
    name: 'Green Home',
    category: 'home',
    availableNow: true,
    lat: 51.5206,
    lng: -0.155,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'demo-5',
    name: 'Happy Paws',
    category: 'pets',
    availableNow: true,
    lat: 51.5362,
    lng: -0.1035,
    avatar:
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=300&q=80',
  },
];

function MapEvents({
  onMapBackgroundClick,
}: {
  onMapBackgroundClick?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = () => onMapBackgroundClick?.();
    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapBackgroundClick]);

  return null;
}

function RecenterMap({
  trigger,
  selectedMaster,
}: {
  trigger?: number;
  selectedMaster?: MasterItem | null;
}) {
  const map = useMap();
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    if (
      selectedMaster &&
      Number.isFinite(selectedMaster.lat) &&
      Number.isFinite(selectedMaster.lng)
    ) {
      map.flyTo([selectedMaster.lat, selectedMaster.lng], 11.8, {
        duration: 0.55,
      });
    }
  }, [map, selectedMaster]);

  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {
            duration: 0.75,
          });
        },
        () => {
          map.flyTo(LONDON_CENTER, 11, { duration: 0.75 });
        }
      );
      return;
    }

    map.flyTo(LONDON_CENTER, 11, { duration: 0.75 });
  }, [map, trigger]);

  return null;
}

function getPinAccent(master: MasterItem, isSelected: boolean) {
  if (isSelected) return '#ef6aa8';
  if (master.availableNow) return '#68c96a';

  const category = String(master.category || '').toLowerCase();

  if (category === 'beauty') return '#ef7db1';
  if (category === 'barber' || category === 'tech' || category === 'repairs') return '#5a97f2';
  if (category === 'wellness' || category === 'home') return '#f0c84f';
  if (category === 'pets') return '#68c96a';

  return '#68c96a';
}

function createMasterPin(master: MasterItem, isSelected: boolean, isLiked: boolean) {
  const accent = getPinAccent(master, isSelected);
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const pinWidth = isSelected ? 76 : 58;
  const pinHeight = isSelected ? 96 : 74;
  const avatarSize = isSelected ? 44 : 34;
  const avatarBorder = isSelected ? 4 : 3;
  const bubbleSize = isSelected ? 20 : 17;
  const heartSize = isSelected ? 18 : 16;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${pinWidth}px;height:${pinHeight}px;">
        ${
          isLiked
            ? `
          <div style="
            position:absolute;
            left:${isSelected ? 4 : 2}px;
            top:${isSelected ? 10 : 8}px;
            width:${heartSize}px;
            height:${heartSize}px;
            border-radius:999px;
            background:#ffffff;
            border:2px solid ${accent};
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow:0 2px 6px rgba(0,0,0,0.10);
            z-index:3;
            font-size:${isSelected ? 11 : 10}px;
            line-height:1;
            color:#ff4f93;
            font-weight:700;
          ">♥</div>
        `
            : ''
        }

        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${pinWidth}px;
          height:${pinHeight}px;
          filter:drop-shadow(0 6px 10px rgba(0,0,0,0.14));
        ">
          <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" style="display:block">
            <path
              d="M40 96
                 C40 96, 72 63, 72 38
                 C72 18, 58 6, 40 6
                 C22 6, 8 18, 8 38
                 C8 63, 40 96, 40 96Z"
              fill="${accent}"
            />
          </svg>
        </div>

        <div style="
          position:absolute;
          left:50%;
          top:${isSelected ? 11 : 10}px;
          transform:translateX(-50%);
          width:${avatarSize}px;
          height:${avatarSize}px;
          border-radius:999px;
          overflow:hidden;
          border:${avatarBorder}px solid #ffffff;
          background:#ffffff;
          z-index:2;
          box-shadow:0 2px 6px rgba(0,0,0,0.08);
        ">
          <img
            src="${avatar}"
            alt=""
            style="width:100%;height:100%;object-fit:cover;display:block;"
          />
        </div>

        <div style="
          position:absolute;
          right:${isSelected ? 6 : 5}px;
          bottom:${isSelected ? 14 : 11}px;
          width:${bubbleSize}px;
          height:${bubbleSize}px;
          border-radius:999px;
          background:#ffffff;
          border:${isSelected ? 3 : 2.5}px solid ${accent};
          z-index:2;
          box-shadow:0 2px 5px rgba(0,0,0,0.10);
        "></div>
      </div>
    `,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight - 4],
    popupAnchor: [0, -pinHeight + 8],
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

function averageCenter(items: MasterItem[]): [number, number] {
  if (!items.length) return LONDON_CENTER;

  const lat = items.reduce((sum, item) => sum + item.lat, 0) / items.length;
  const lng = items.reduce((sum, item) => sum + item.lng, 0) / items.length;

  return [lat, lng];
}

export default function RealMap({
  masters = [],
  mapMode = 'map',
  selectedMasterId = null,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  onMasterSelect,
  onMapBackgroundClick,
  onToggleLike,
}: RealMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const safeMasters = useMemo(() => {
    const filtered = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    return filtered.length > 0 ? filtered.slice(0, 12) : DEMO_MASTERS;
  }, [masters]);

  const selectedMaster = useMemo(() => {
    if (selectedMasterId === null || selectedMasterId === undefined) return null;

    return (
      safeMasters.find((master) => String(master.id) === String(selectedMasterId)) || null
    );
  }, [safeMasters, selectedMasterId]);

  const mapCenter = useMemo(() => {
    if (selectedMaster) return [selectedMaster.lat, selectedMaster.lng] as [number, number];
    return averageCenter(safeMasters);
  }, [safeMasters, selectedMaster]);

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
        center={mapCenter}
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
        <RecenterMap trigger={recenterToUserTrigger} selectedMaster={selectedMaster} />

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
                contextmenu: () => {
                  onToggleLike?.(master);
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
