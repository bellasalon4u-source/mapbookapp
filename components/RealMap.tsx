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

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

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
      map.flyTo([selectedMaster.lat, selectedMaster.lng], 12, {
        duration: 0.7,
      });
    }
  }, [map, selectedMaster]);

  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, {
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
      dot: '#ffffff',
      accent: '#f0629b',
    };
  }

  const category = String(master.category || '').toLowerCase();

  if (master.availableNow || master.availableToday) {
    return {
      ring: '#7bcf88',
      dot: '#ffffff',
      accent: '#7bcf88',
    };
  }

  if (category === 'beauty') {
    return {
      ring: '#ef7db1',
      dot: '#ffffff',
      accent: '#ef7db1',
    };
  }

  if (category === 'barber' || category === 'tech' || category === 'repairs') {
    return {
      ring: '#66a8ff',
      dot: '#ffffff',
      accent: '#66a8ff',
    };
  }

  if (category === 'pets') {
    return {
      ring: '#f0c24d',
      dot: '#ffffff',
      accent: '#f0c24d',
    };
  }

  return {
    ring: '#8ecf97',
    dot: '#ffffff',
    accent: '#8ecf97',
  };
}

function createMasterPin(master: MasterItem, isSelected: boolean) {
  const colors = getPinColors(master, isSelected);
  const avatar = master.avatar || 'https://via.placeholder.com/80x80.png?text=Pro';

  const size = isSelected ? 78 : 56;
  const innerSize = isSelected ? 56 : 40;
  const bubble = isSelected ? 28 : 22;
  const outline = isSelected ? 5 : 4;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 10}px;">
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
          right:${isSelected ? 1 : 0}px;
          bottom:${isSelected ? 6 : 8}px;
          width:${bubble}px;
          height:${bubble}px;
          border-radius:50%;
          background:${colors.dot};
          border:${outline}px solid ${colors.accent};
          box-shadow:0 4px 10px rgba(0,0,0,0.10);
        "></div>
      </div>
    `,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
    return masters.filter(
      (master) =>
        Number.isFinite(master.lat) &&
        Number.isFinite(master.lng)
    );
  }, [masters]);

  const selectedMaster = useMemo(() => {
    return (
      safeMasters.find((master) => String(master.id) === String(selectedMasterId)) || null
    );
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
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
          background: '#f2f2ef',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={tileUrl}
        />

        <ZoomControl position="topleft" />

        <MapEvents onMapBackgroundClick={onMapBackgroundClick} />
        <RecenterMap
          trigger={recenterToUserTrigger}
          selectedMaster={selectedMaster}
        />

        {safeMasters.map((master) => {
          const isSelected = String(master.id) === String(selectedMasterId);

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, isSelected)}
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
          margin-top: 14px !important;
          margin-left: 14px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
          overflow: hidden;
          border-radius: 14px !important;
        }

        .leaflet-control-zoom a {
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-size: 28px !important;
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
