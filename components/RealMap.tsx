'use client';

import { useEffect, useMemo, useRef } from 'react';
import L, { type DivIcon } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
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
  price?: string | number;
  availableNow?: boolean;
  availableToday?: boolean;
  lat?: number;
  lng?: number;
  avatar?: string;
  description?: string;
  paymentMethods?: string[] | string;
};

type RealMapProps = {
  masters: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  onMasterSelect?: (master: MasterItem) => void;
  onMapBackgroundClick?: () => void;
};

const londonCenter: [number, number] = [51.5074, -0.1278];

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

function getTileUrl(mode: 'map' | 'satellite' = 'map') {
  if (mode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  }
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
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
      <div style="position:relative;width:${size}px;height:${size + 14}px;">
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
        "></div>
      </div>
    `,
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size + 10],
  });
}

function MapEventsLayer({
  onBackgroundClick,
  ignoreNextMapClickRef,
}: {
  onBackgroundClick?: () => void;
  ignoreNextMapClickRef: React.MutableRefObject<boolean>;
}) {
  useMapEvents({
    click() {
      if (ignoreNextMapClickRef.current) {
        ignoreNextMapClickRef.current = false;
        return;
      }
      onBackgroundClick?.();
    },
  });

  return null;
}

function FitBoundsLayer({ masters }: { masters: MasterItem[] }) {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize();
    }, 80);

    if (!masters.length) {
      map.setView(londonCenter, 11);
      return () => window.clearTimeout(id);
    }

    if (masters.length === 1) {
      const item = masters[0];
      map.setView([item.lat || londonCenter[0], item.lng || londonCenter[1]], 11);
      return () => window.clearTimeout(id);
    }

    const bounds = L.latLngBounds(
      masters.map(
        (item) =>
          [item.lat || londonCenter[0], item.lng || londonCenter[1]] as [number, number]
      )
    );

    map.fitBounds(bounds.pad(0.22), { animate: true });

    return () => window.clearTimeout(id);
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f3efe7',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <MapContainer
        center={londonCenter}
        zoom={11}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={getTileUrl(mapMode)}
        />

        <FitBoundsLayer masters={safeMasters} />

        <MapEventsLayer
          onBackgroundClick={onMapBackgroundClick}
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
                click: (event) => {
                  ignoreNextMapClickRef.current = true;
                  if ('originalEvent' in event && event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent as Event);
                  }
                  onMasterSelect?.(master);
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
