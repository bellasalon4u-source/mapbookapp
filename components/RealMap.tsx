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

  return minDistance > 0.0065;
}

function isInsideLondonArea(items: MasterItem[]) {
  return items.every((item) => {
    return item.lat > 51.44 && item.lat < 51.57 && item.lng > -0.25 && item.lng < 0.04;
  });
}

function getCategoryColor(master: MasterItem, isSelected: boolean) {
  if (isSelected) return '#ff4f93';
  if (master.availableNow) return '#34c759';

  const category = String(master.category || '').toLowerCase();

  if (category === 'beauty') return '#ff4f93';
  if (category === 'barber') return '#111111';
  if (category === 'wellness') return '#f4c430';
  if (category === 'pets') return '#34c759';
  if (category === 'tech' || category === 'repairs') return '#3b82f6';

  return '#ff4f93';
}

function createMasterPin(master: MasterItem, isSelected: boolean, isLiked: boolean): DivIcon {
  const color = getCategoryColor(master, isSelected);
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const size = isSelected ? 46 : 40;
  const avatarSize = isSelected ? 32 : 27;
  const ring = master.availableNow ? '#34c759' : color;

  return L.divIcon({
    className: 'mapbook-master-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 16}px;">
        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:#ffffff;
          border:2.5px solid ${ring};
          box-shadow:0 5px 14px rgba(0,0,0,0.14);
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
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:13px solid ${ring};
          z-index:1;
          filter:drop-shadow(0 3px 4px rgba(0,0,0,0.12));
        "></div>

        ${
          isLiked
            ? `
          <div style="
            position:absolute;
            right:-2px;
            top:-2px;
            width:17px;
            height:17px;
            border-radius:999px;
            background:#ffffff;
            border:1.5px solid #111111;
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:3;
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
            bottom:11px;
            width:12px;
            height:12px;
            border-radius:999px;
            background:#34c759;
            border:2px solid #ffffff;
            z-index:3;
            box-shadow:0 2px 5px rgba(0,0,0,0.10);
          "></div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size + 12],
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

function MapUiBridge({
  onReady,
}: {
  onReady: (actions: { locateMe: () => void; toggleMapMode: () => void }) => void;
}) {
  const map = useMap();
  const [mode, setMode] = useState<'map' | 'satellite'>('map');

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
      if (layer instanceof L.TileLayer) layers.push(layer);
    });

    layers.forEach((layer) => map.removeLayer(layer));

    const tileLayer = L.tileLayer(nextUrl, {
      attribution:
        mode === 'satellite'
          ? '&copy; Esri'
          : '&copy; OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
  }, [map, mode]);

  return null;
}

export default function RealMap({
  masters = [],
  selectedMasterId = null,
  likedMasterIds = [],
  recenterToUserTrigger = 0,
  promotionBadgeTextByMasterId = {},
  onMasterSelect,
  onMapBackgroundClick,
  onToggleLike,
  onViewMaster,
  onBookMaster,
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

    const firstFive = filtered.slice(0, 5);

    if (firstFive.length < 4) return DEMO_MASTERS;
    if (!isInsideLondonArea(firstFive)) return DEMO_MASTERS;
    if (!hasGoodSpread(firstFive)) return DEMO_MASTERS;

    return filtered;
  }, [masters]);

  const selectedMaster = useMemo(() => {
    const controlledId =
      selectedMasterId !== null && selectedMasterId !== undefined
        ? String(selectedMasterId)
        : null;

    const finalId = controlledId || selectedLocalId;

    if (!finalId) return null;

    return (
      safeMasters.find((master) => String(master.id) === String(finalId)) || null
    );
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
        minZoom={9}
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
        <MapUiBridge onReady={setUiActions} />

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

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat, master.lng]}
              icon={createMasterPin(master, Boolean(isSelected), isLiked)}
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

      {selectedMaster ? (
        <div
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 10,
            zIndex: 800,
          }}
        >
          <div
            style={{
              borderRadius: 22,
              border: '1.6px solid #111111',
              background: '#ffffff',
              boxShadow: '0 14px 28px rgba(0,0,0,0.14)',
              padding: 10,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <img
                src={
                  selectedMaster.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
                }
                alt={selectedMaster.name || 'Master'}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  objectFit: 'cover',
                  display: 'block',
                  border: '1.5px solid #111111',
                }}
              />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {selectedMaster.availableNow ? (
                    <span
                      style={{
                        height: 22,
                        padding: '0 8px',
                        borderRadius: 999,
                        border: '1.4px solid #111111',
                        background: '#e9faee',
                        color: '#1f9d43',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      Available now
                    </span>
                  ) : null}

                  {promotionBadgeTextByMasterId[String(selectedMaster.id)] ? (
                    <span
                      style={{
                        height: 22,
                        padding: '0 8px',
                        borderRadius: 999,
                        border: '1.4px solid #111111',
                        background: '#fff5cf',
                        color: '#9a6a00',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      {promotionBadgeTextByMasterId[String(selectedMaster.id)]}
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.15,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedMaster.name || selectedMaster.title || 'Provider'}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6f675f',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedMaster.subcategory || selectedMaster.category || 'Service'} •{' '}
                  {selectedMaster.city || 'London'}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    ★ {typeof selectedMaster.rating === 'number' ? selectedMaster.rating.toFixed(1) : '4.8'}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {selectedMaster.price || '£35'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleLike?.(selectedMaster)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: '1.6px solid #111111',
                  background: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: likedMasterIds.includes(String(selectedMaster.id))
                    ? '#ff3b58'
                    : '#2d2d2d',
                  fontWeight: 900,
                }}
              >
                {likedMasterIds.includes(String(selectedMaster.id)) ? '♥' : '♡'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() => onViewMaster?.(selectedMaster)}
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: '1.6px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Open
              </button>

              <button
                type="button"
                onClick={() => onBookMaster?.(selectedMaster)}
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: '1.6px solid #111111',
                  background: '#31b44b',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Book
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
