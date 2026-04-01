'use client';

import { useMemo } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
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
    text.includes('makeup')
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

  if (
    text.includes('car') ||
    text.includes('auto') ||
    text.includes('driver') ||
    text.includes('detailing')
  ) {
    return 'auto';
  }

  if (
    text.includes('moving') ||
    text.includes('delivery') ||
    text.includes('courier') ||
    text.includes('van')
  ) {
    return 'moving';
  }

  if (
    text.includes('fitness') ||
    text.includes('yoga') ||
    text.includes('pilates') ||
    text.includes('trainer')
  ) {
    return 'fitness';
  }

  if (
    text.includes('tutor') ||
    text.includes('education') ||
    text.includes('lesson') ||
    text.includes('language')
  ) {
    return 'education';
  }

  if (
    text.includes('event') ||
    text.includes('photo') ||
    text.includes('video') ||
    text.includes('dj')
  ) {
    return 'events';
  }

  if (
    text.includes('activity') ||
    text.includes('tour') ||
    text.includes('workshop')
  ) {
    return 'activities';
  }

  if (
    text.includes('design') ||
    text.includes('creative') ||
    text.includes('branding') ||
    text.includes('content')
  ) {
    return 'creative';
  }

  return 'beauty';
}

function isAvailable(master: Master) {
  return (
    master.availableNow === true ||
    master.availableToday === true ||
    master.isAvailableToday === true
  );
}

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

function pinIcon(color: string, selected: boolean) {
  const size = selected ? 36 : 30;
  const border = selected ? 5 : 4;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:${border}px solid #1e2229;
        box-shadow:0 4px 10px rgba(0,0,0,0.18);
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
          const available = isAvailable(master);
          const selected = selectedMasterId === master.id;

          return (
            <Marker
              key={String(master.id)}
              position={coords}
              icon={pinIcon(available ? '#2fbb52' : '#ef5a5a', selected)}
              eventHandlers={{
                click: () => {
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
