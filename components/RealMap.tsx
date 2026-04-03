'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L, { type DivIcon } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type PaymentMethod = 'cash' | 'card' | 'wallet' | string;

type MasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  price?: string | number;
  availableNow?: boolean;
  availableToday?: boolean;
  lat?: number;
  lng?: number;
  avatar?: string;
  description?: string;
  paymentMethods?: PaymentMethod[] | string;
};

type RealMapProps = {
  masters: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  onMasterSelect?: (master: MasterItem) => void;
  onMapBackgroundClick?: () => void;
};

type SelectedPointState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const londonCenter: [number, number] = [51.5074, -0.1278];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCategoryAccent(category?: string) {
  const normalized = String(category || '').toLowerCase();

  if (normalized === 'beauty') return '#ff6d9f';
  if (normalized === 'barber') return '#53aef7';
  if (normalized === 'wellness') return '#49c968';
  if (normalized === 'home') return '#ffc938';
  if (normalized === 'repairs') return '#3db0f7';
  if (normalized === 'tech') return '#9b67ff';
  if (normalized === 'pets') return '#ffa726';

  return '#ff6d9f';
}

function getCategoryLabel(category?: string) {
  const normalized = String(category || '').toLowerCase();
  if (!normalized) return 'Service';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getTileUrl(mode: 'map' | 'satellite' = 'map') {
  if (mode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  }
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function normalizePaymentMethods(value: MasterItem['paymentMethods']): PaymentMethod[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return ['cash', 'card'];
}

function paymentBadge(method: PaymentMethod) {
  const normalized = String(method).toLowerCase();

  if (normalized === 'cash') return { icon: '💵', label: 'Cash' };
  if (normalized === 'card') return { icon: '💳', label: 'Card' };
  if (normalized === 'wallet') return { icon: '📱', label: 'Wallet' };

  return { icon: '•', label: String(method) };
}

function buildMarkerIcon(master: MasterItem, isSelected: boolean): DivIcon {
  const accent = getCategoryAccent(master.category);
  const borderColor = master.availableNow ? '#39c95a' : '#ff6880';
  const avatar =
    master.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const outerRing = isSelected ? 6 : 5;
  const size = isSelected ? 76 : 70;
  const photoSize = isSelected ? 56 : 52;
  const dotSize = isSelected ? 16 : 14;

  return L.divIcon({
    className: 'custom-master-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 14}px;pointer-events:auto;">
        <div style="
          position:absolute;
          left:50%;
          top:${size - 7}px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:13px solid transparent;
          border-right:13px solid transparent;
          border-top:18px solid ${borderColor};
          filter:drop-shadow(0 4px 6px rgba(0,0,0,0.14));
        "></div>

        <div style="
          position:absolute;
          left:50%;
          top:0;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:#fff;
          border:${outerRing}px solid ${borderColor};
          box-shadow:0 6px 18px rgba(0,0,0,0.16);
          overflow:hidden;
          pointer-events:auto;
        ">
          <img
            src="${avatar}"
            alt="${master.name || master.title || 'Master'}"
            style="
              width:${photoSize}px;
              height:${photoSize}px;
              object-fit:cover;
              border-radius:999px;
              position:absolute;
              left:50%;
              top:50%;
              transform:translate(-50%,-50%);
              display:block;
              pointer-events:none;
            "
          />
        </div>

        <div style="
          position:absolute;
          right:1px;
          top:${size * 0.48}px;
          width:${dotSize + 10}px;
          height:${dotSize + 10}px;
          background:#fff;
          border:4px solid ${accent};
          border-radius:999px;
          box-shadow:0 4px 10px rgba(0,0,0,0.14);
          pointer-events:none;
        "></div>
      </div>
    `,
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size + 10],
  });
}

function MapEventsLayer({
  onBackgroundClick,
  selectedLatLng,
  onPointChange,
  ignoreNextMapClickRef,
}: {
  onBackgroundClick?: () => void;
  selectedLatLng?: [number, number] | null;
  onPointChange: (state: SelectedPointState | null) => void;
  ignoreNextMapClickRef: React.MutableRefObject<boolean>;
}) {
  const map = useMapEvents({
    click() {
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      onBackgroundClick?.();
    },
    move() {
      if (!selectedLatLng) {
        onPointChange(null);
        return;
      }

      const pt = map.latLngToContainerPoint(selectedLatLng);
      const size = map.getSize();
      onPointChange({
        x: pt.x,
        y: pt.y,
        width: size.x,
        height: size.y,
      });
    },
    zoom() {
      if (!selectedLatLng) {
        onPointChange(null);
        return;
      }

      const pt = map.latLngToContainerPoint(selectedLatLng);
      const size = map.getSize();
      onPointChange({
        x: pt.x,
        y: pt.y,
        width: size.x,
        height: size.y,
      });
    },
    resize() {
      if (!selectedLatLng) {
        onPointChange(null);
        return;
      }

      const pt = map.latLngToContainerPoint(selectedLatLng);
      const size = map.getSize();
      onPointChange({
        x: pt.x,
        y: pt.y,
        width: size.x,
        height: size.y,
      });
    },
  });

  useEffect(() => {
    if (!selectedLatLng) {
      onPointChange(null);
      return;
    }

    const pt = map.latLngToContainerPoint(selectedLatLng);
    const size = map.getSize();
    onPointChange({
      x: pt.x,
      y: pt.y,
      width: size.x,
      height: size.y,
    });
  }, [map, onPointChange, selectedLatLng]);

  return null;
}

function FitBoundsLayer({ masters }: { masters: MasterItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (!masters.length) {
      map.setView(londonCenter, 11);
      return;
    }

    if (masters.length === 1) {
      const item = masters[0];
      map.setView([item.lat || londonCenter[0], item.lng || londonCenter[1]], 11);
      return;
    }

    const bounds = L.latLngBounds(
      masters.map(
        (item) =>
          [item.lat || londonCenter[0], item.lng || londonCenter[1]] as [number, number]
      )
    );

    map.fitBounds(bounds.pad(0.22), {
      animate: true,
    });
  }, [map, masters]);

  return null;
}

export default function RealMap({
  masters,
  mapMode = 'map',
  selectedMasterId,
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<SelectedPointState | null>(null);
  const ignoreNextMapClickRef = useRef(false);

  const safeMasters = useMemo(() => {
    return (masters || []).map((item, index) => ({
      ...item,
      id: item.id ?? String(index),
      lat: typeof item.lat === 'number' ? item.lat : londonCenter[0],
      lng: typeof item.lng === 'number' ? item.lng : londonCenter[1],
      rating: item.rating ?? 4.7,
      price: item.price ?? '45',
      availableNow:
        typeof item.availableNow === 'boolean'
          ? item.availableNow
          : typeof item.availableToday === 'boolean'
          ? item.availableToday
          : true,
      avatar:
        item.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    }));
  }, [masters]);

  const selectedMaster = useMemo(() => {
    return safeMasters.find((item) => String(item.id) === String(selectedMasterId)) || null;
  }, [safeMasters, selectedMasterId]);

  const selectedLatLng = selectedMaster
    ? ([selectedMaster.lat as number, selectedMaster.lng as number] as [number, number])
    : null;

  const cardPosition = useMemo(() => {
    if (!selectedPoint) return null;

    const cardWidth = 330;
    const cardHeight = 180;

    const left = clamp(selectedPoint.x + 18, 10, selectedPoint.width - cardWidth - 10);
    const top = clamp(selectedPoint.y - 78, 8, selectedPoint.height - cardHeight - 18);

    return { left, top, cardWidth };
  }, [selectedPoint]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f3efe7',
      }}
    >
      <MapContainer
        center={londonCenter}
        zoom={11}
        style={{
          width: '100%',
          height: '100%',
        }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={getTileUrl(mapMode)}
        />

        <FitBoundsLayer masters={safeMasters} />

        <MapEventsLayer
          onBackgroundClick={onMapBackgroundClick}
          selectedLatLng={selectedLatLng}
          onPointChange={setSelectedPoint}
          ignoreNextMapClickRef={ignoreNextMapClickRef}
        />

        {safeMasters.map((master) => {
          const isSelected = String(master.id) === String(selectedMasterId);

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat as number, master.lng as number]}
              icon={buildMarkerIcon(master, isSelected)}
              eventHandlers={{
                mousedown: () => {
                  ignoreNextMapClickRef.current = true;
                },
                touchstart: () => {
                  ignoreNextMapClickRef.current = true;
                },
                click: (event) => {
                  ignoreNextMapClickRef.current = true;
                  if ('originalEvent' in event && event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent as Event);
                  }
                  onMasterSelect?.(master);

                  window.setTimeout(() => {
                    ignoreNextMapClickRef.current = false;
                  }, 250);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selectedMaster && cardPosition ? (
        <div
          style={{
            position: 'absolute',
            left: cardPosition.left,
            top: cardPosition.top,
            width: cardPosition.cardWidth,
            background: '#fff',
            borderRadius: 22,
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(230,223,213,0.95)',
            padding: 14,
            zIndex: 60,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '104px 1fr',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  position: 'relative',
                  width: 104,
                  height: 104,
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: '#eef2f5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <img
                  src={selectedMaster.avatar}
                  alt={selectedMaster.name || selectedMaster.title || 'Master'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <button
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: 'none',
                    background: '#fff',
                    color: '#ff6b8e',
                    fontSize: 16,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.14)',
                    cursor: 'pointer',
                  }}
                >
                  ♥
                </button>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {normalizePaymentMethods(selectedMaster.paymentMethods)
                  .slice(0, 3)
                  .map((method) => {
                    const item = paymentBadge(method);

                    return (
                      <div
                        key={`${selectedMaster.id}-${String(method)}`}
                        style={{
                          minWidth: 40,
                          height: 28,
                          padding: '0 8px',
                          borderRadius: 10,
                          border: '1px solid #ece3d8',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#44505f',
                        }}
                      >
                        <span>{item.icon}</span>
                        {item.label === 'Cash' || item.label === 'Card' ? null : (
                          <span>{item.label}</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: '#212836',
                  marginBottom: 8,
                }}
              >
                {selectedMaster.name || selectedMaster.title || 'Service Pro'}
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 999,
                  background: '#f3ebdf',
                  color: '#7d694f',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span>🏅</span>
                <span>Verified Pro</span>
              </div>

              <div
                style={{
                  marginTop: 9,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: '#ffe8f1',
                  color: getCategoryAccent(selectedMaster.category),
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {getCategoryLabel(selectedMaster.category)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: selectedMaster.availableNow ? '#31b14c' : '#de6a74',
                }}
              >
                {selectedMaster.availableNow ? 'Available now' : 'Unavailable today'}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  color: '#212836',
                  fontWeight: 900,
                }}
              >
                <div style={{ fontSize: 16 }}>★ {Number(selectedMaster.rating || 4.7).toFixed(1)}</div>
                <div style={{ fontSize: 16 }}>
                  From £{String(selectedMaster.price).replace(/[^\d.]/g, '') || '45'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <button
              style={{
                height: 52,
                borderRadius: 18,
                border: '2px solid #efbdd0',
                background: '#fff',
                color: '#25303d',
                fontSize: 17,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              View
            </button>

            <button
              style={{
                height: 52,
                borderRadius: 18,
                border: 'none',
                background: '#5dc1ee',
                color: '#fff',
                fontSize: 17,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(93,193,238,0.25)',
              }}
            >
              Route
            </button>

            <button
              style={{
                height: 52,
                borderRadius: 18,
                border: 'none',
                background: '#3bb54a',
                color: '#fff',
                fontSize: 17,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(59,181,74,0.24)',
              }}
            >
              Book now
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
