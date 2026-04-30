'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L, { type DivIcon } from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';
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
  discountBadge?: string;
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
    subcategory: 'Hair',
    lat: 51.5238,
    lng: -0.165,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 4.8,
    price: '£45',
    city: 'Marylebone',
  },
  {
    id: 'demo-2',
    name: 'Mark',
    category: 'barber',
    subcategory: 'Fade',
    lat: 51.5105,
    lng: -0.146,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
    rating: 4.9,
    price: '£25',
    city: 'Soho',
  },
  {
    id: 'demo-3',
    name: 'Oksana',
    category: 'beauty',
    subcategory: 'Nails',
    lat: 51.5052,
    lng: -0.118,
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 4.7,
    price: '£35',
    city: 'Holborn',
  },
  {
    id: 'demo-4',
    name: 'David',
    category: 'pets',
    subcategory: 'Grooming',
    lat: 51.5195,
    lng: -0.091,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    availableNow: true,
    rating: 4.8,
    price: '£30',
    city: 'Shoreditch',
  },
  {
    id: 'demo-5',
    name: 'Mila',
    category: 'wellness',
    subcategory: 'Massage',
    lat: 51.4965,
    lng: -0.084,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    availableNow: false,
    rating: 5,
    price: '£60',
    city: 'Bermondsey',
  },
];

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function normalizeCategory(value?: string) {
  return String(value || '').toLowerCase().trim();
}

function getCategoryColor(master: MasterItem, isSelected: boolean) {
  if (isSelected) return '#ff4f93';

  const promoBadge = master.discountBadge;
  if (promoBadge) return '#f4c430';

  if (master.availableNow) return '#34c759';

  const category = normalizeCategory(master.category);

  if (category === 'beauty') return '#ff4f93';
  if (category === 'barber') return '#111111';
  if (category === 'wellness') return '#f4c430';
  if (category === 'pets') return '#34c759';
  if (category === 'tech' || category === 'repairs') return '#3b82f6';

  return '#ff4f93';
}

function createMasterPin(
  master: MasterItem,
  isSelected: boolean,
  isLiked: boolean,
  promotionBadgeText?: string
): DivIcon {
  const color = getCategoryColor(master, isSelected);
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const hasPromotionBadge = Boolean(promotionBadgeText || master.discountBadge);
  const badgeText = promotionBadgeText || master.discountBadge || '';

  const size = isSelected ? 48 : 42;
  const ring = hasPromotionBadge ? '#f4c430' : master.availableNow ? '#34c759' : color;

  return L.divIcon({
    className: 'mapbook-master-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 22}px;">
        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:#ffffff;
          border:3px solid ${ring};
          box-shadow:0 6px 15px rgba(0,0,0,0.16);
          overflow:hidden;
          z-index:2;
        ">
          <img
            src="${avatar}"
            alt=""
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              display:block;
            "
          />
        </div>

        <div style="
          position:absolute;
          left:50%;
          top:${size - 1}px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:9px solid transparent;
          border-right:9px solid transparent;
          border-top:15px solid ${ring};
          z-index:1;
          filter:drop-shadow(0 3px 4px rgba(0,0,0,0.14));
        "></div>

        ${
          hasPromotionBadge
            ? `
          <div style="
            position:absolute;
            left:50%;
            bottom:-2px;
            transform:translateX(-50%);
            min-width:34px;
            height:18px;
            border-radius:999px;
            background:#ffe44d;
            border:1.5px solid #111111;
            color:#111111;
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:4;
            padding:0 6px;
            font-size:9px;
            font-weight:900;
            white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.14);
          ">
            ${badgeText}
          </div>
        `
            : ''
        }

        ${
          isLiked
            ? `
          <div style="
            position:absolute;
            right:-3px;
            top:-3px;
            width:18px;
            height:18px;
            border-radius:999px;
            background:#ffffff;
            border:1.5px solid #111111;
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:5;
            box-shadow:0 2px 6px rgba(0,0,0,0.14);
          ">
            <span style="font-size:10px;line-height:1;color:#ff3b58;">♥</span>
          </div>
        `
            : ''
        }

        ${
          master.availableNow
            ? `
          <div style="
            position:absolute;
            left:-1px;
            bottom:14px;
            width:12px;
            height:12px;
            border-radius:999px;
            background:#34c759;
            border:2px solid #ffffff;
            z-index:4;
            box-shadow:0 2px 5px rgba(0,0,0,0.10);
          "></div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [size, size + 22],
    iconAnchor: [size / 2, size + 14],
    popupAnchor: [0, -(size + 10)],
  });
}

function MapEvents({ onMapBackgroundClick }: { onMapBackgroundClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapBackgroundClick?.();
    },
  });

  return null;
}

function ChangeView({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.65 });
  }, [map, center, zoom]);

  return null;
}

function FitMapToResults({
  masters,
  userLocation,
  selectedMasterId,
}: {
  masters: MasterItem[];
  userLocation: [number, number] | null;
  selectedMasterId?: string | number | null;
}) {
  const map = useMap();
  const previousKeyRef = useRef('');

  useEffect(() => {
    const validMasters = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    const key = [
      validMasters.map((master) => `${master.id}:${master.lat}:${master.lng}`).join('|'),
      userLocation ? `${userLocation[0]}:${userLocation[1]}` : 'no-user',
      selectedMasterId ? String(selectedMasterId) : 'no-selected',
    ].join('::');

    if (previousKeyRef.current === key) return;
    previousKeyRef.current = key;

    if (selectedMasterId) {
      const selected = validMasters.find(
        (master) => String(master.id) === String(selectedMasterId)
      );

      if (selected) {
        map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), {
          duration: 0.55,
        });
        return;
      }
    }

    if (validMasters.length === 0) {
      if (userLocation) {
        map.flyTo(userLocation, 13, { duration: 0.55 });
      }
      return;
    }

    if (validMasters.length === 1) {
      const only = validMasters[0];

      if (userLocation) {
        const bounds = L.latLngBounds([
          [only.lat, only.lng],
          userLocation,
        ]);

        map.fitBounds(bounds, {
          paddingTopLeft: [42, 42],
          paddingBottomRight: [42, 150],
          maxZoom: 14,
          animate: true,
          duration: 0.55,
        });
        return;
      }

      map.flyTo([only.lat, only.lng], 14, { duration: 0.55 });
      return;
    }

    const points: [number, number][] = validMasters.map((master) => [
      master.lat,
      master.lng,
    ]);

    if (userLocation) {
      points.push(userLocation);
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      paddingTopLeft: [42, 42],
      paddingBottomRight: [42, 150],
      maxZoom: 14,
      animate: true,
      duration: 0.55,
    });
  }, [map, masters, userLocation, selectedMasterId]);

  return null;
}

function MapUiBridge({
  initialMode,
  onReady,
}: {
  initialMode: 'map' | 'satellite';
  onReady: (actions: { locateMe: () => void; toggleMapMode: () => void }) => void;
}) {
  const map = useMap();
  const [mode, setMode] = useState<'map' | 'satellite'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    onReady({
      locateMe: () => {
        if (!navigator.geolocation) {
          map.flyTo(LONDON_CENTER, 13, { duration: 0.7 });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            map.flyTo([position.coords.latitude, position.coords.longitude], 14, {
              duration: 0.7,
            });
          },
          () => {
            map.flyTo(LONDON_CENTER, 13, { duration: 0.7 });
          }
        );
      },
      toggleMapMode: () => {
        setMode((prev) => (prev === 'map' ? 'satellite' : 'map'));
      },
    });
  }, [map, onReady]);

  useEffect(() => {
    const nextUrl =
      mode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const layers: L.TileLayer[] = [];

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        layers.push(layer);
      }
    });

    layers.forEach((layer) => map.removeLayer(layer));

    const tileLayer = L.tileLayer(nextUrl, {
      attribution:
        mode === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
  }, [map, mode]);

  return null;
}

export default function RealMap({
  masters = [],
  mapMode = 'map',
  selectedMasterId = null,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  promotionBadgeTextByMasterId = {},
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(null);
  const [uiActions, setUiActions] = useState<{
    locateMe: () => void;
    toggleMapMode: () => void;
  } | null>(null);

  const prevRecenterTrigger = useRef(recenterToUserTrigger);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(LONDON_CENTER);
      setMapCenter(LONDON_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(coords);
        setMapCenter(coords);
      },
      () => {
        setUserLocation(LONDON_CENTER);
        setMapCenter(LONDON_CENTER);
      }
    );
  }, []);

  useEffect(() => {
    if (prevRecenterTrigger.current === recenterToUserTrigger) return;
    prevRecenterTrigger.current = recenterToUserTrigger;

    if (!navigator.geolocation) {
      setMapCenter(LONDON_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(coords);
        setMapCenter(coords);
      },
      () => {
        setMapCenter(LONDON_CENTER);
      }
    );
  }, [recenterToUserTrigger]);

  const safeMasters = useMemo(() => {
    const filtered = masters.filter(
      (master) => Number.isFinite(master.lat) && Number.isFinite(master.lng)
    );

    if (masters.length === 0) {
      return DEMO_MASTERS;
    }

    return filtered;
  }, [masters]);

  useEffect(() => {
    if (!selectedLocalId) return;

    const exists = safeMasters.some((master) => String(master.id) === selectedLocalId);

    if (!exists) {
      setSelectedLocalId(null);
    }
  }, [safeMasters, selectedLocalId]);

  const selectedMaster = useMemo(() => {
    const controlledId =
      selectedMasterId !== null && selectedMasterId !== undefined
        ? String(selectedMasterId)
        : null;

    const finalId = controlledId || selectedLocalId;

    if (!finalId) return null;

    return safeMasters.find((master) => String(master.id) === String(finalId)) || null;
  }, [safeMasters, selectedLocalId, selectedMasterId]);

  const handleSelectMaster = (master: MasterItem) => {
    setSelectedLocalId(String(master.id));
    onMasterSelect?.(master);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <MapContainer
        center={mapCenter || LONDON_CENTER}
        zoom={13}
        minZoom={8}
        maxZoom={18}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
          background: '#f2f2ef',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="topleft" />

        <MapEvents
          onMapBackgroundClick={() => {
            setSelectedLocalId(null);
            onMapBackgroundClick?.();
          }}
        />

        <ChangeView center={mapCenter} />

        <FitMapToResults
          masters={safeMasters}
          userLocation={userLocation}
          selectedMasterId={selectedMaster?.id ?? null}
        />

        <MapUiBridge initialMode={mapMode} onReady={setUiActions} />

        {userLocation ? (
          <>
            <CircleMarker
              center={userLocation}
              radius={14}
              pathOptions={{
                color: 'transparent',
                fillColor: '#2b7cf6',
                fillOpacity: 0.12,
              }}
            />
            <CircleMarker
              center={userLocation}
              radius={5.5}
              pathOptions={{
                color: '#ffffff',
                weight: 2.2,
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
          const promoBadge = promotionBadgeTextByMasterId[String(master.id)];

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, Boolean(isSelected), isLiked, promoBadge)}
              eventHandlers={{
                click: () => {
                  handleSelectMaster(master);
                },
              }}
            />
          );
        })}
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 700,
        }}
      >
        <button
          type="button"
          onClick={() => uiActions?.locateMe()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: '1.4px solid #111111',
            background: '#ffffff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            color: '#2b7cf6',
            fontWeight: 900,
          }}
        >
          ◎
        </button>

        <button
          type="button"
          onClick={() => uiActions?.toggleMapMode()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: '1.4px solid #111111',
            background: '#ffffff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: '#111111',
            fontWeight: 900,
          }}
        >
          ◫
        </button>
      </div>

      <style jsx global>{`
        .leaflet-container {
          font-family: Arial, sans-serif;
        }

        .leaflet-control-zoom {
          border: none !important;
          margin-top: 12px !important;
          margin-left: 12px !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1) !important;
          overflow: hidden;
          border-radius: 14px !important;
        }

        .leaflet-control-zoom a {
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 26px !important;
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

        .mapbook-master-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
