'use client';

import { useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type MasterLike = {
  id?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  location?: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
  };
};

type RealMapProps = {
  masters: MasterLike[];
  fullScreen?: boolean;
  mapMode?: 'map' | 'satellite';
  selectedMasterId?: string | null;
  onMasterSelect?: (master: any) => void;
  onMapBackgroundClick?: () => void;
};

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

function getCoords(master: any): [number, number] | null {
  const lat =
    master?.lat ??
    master?.latitude ??
    master?.location?.lat ??
    master?.location?.latitude;

  const lng =
    master?.lng ??
    master?.longitude ??
    master?.location?.lng ??
    master?.location?.longitude;

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return [lat, lng];
}

export default function RealMap({
  masters,
  fullScreen = false,
  mapMode = 'map',
  selectedMasterId = null,
  onMasterSelect,
  onMapBackgroundClick,
}: RealMapProps) {
  const validMasters = useMemo(
    () => masters.filter((master) => getCoords(master)),
    [masters]
  );

  const center = useMemo<[number, number]>(() => {
    if (!validMasters.length) return [51.5074, -0.1278];

    const coords = validMasters
      .map((master) => getCoords(master))
      .filter(Boolean) as [number, number][];

    const avgLat = coords.reduce((sum, item) => sum + item[0], 0) / coords.length;
    const avgLng = coords.reduce((sum, item) => sum + item[1], 0) / coords.length;

    return [avgLat, avgLng];
  }, [validMasters]);

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
        scrollWheelZoom
        zoomControl
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url={tileUrl} attribution={attribution} />

        <MapClickHandler onMapBackgroundClick={onMapBackgroundClick} />

        {validMasters.map((master: any) => {
          const coords = getCoords(master);
          if (!coords) return null;

          const selected = master.id === selectedMasterId;

          return (
            <CircleMarker
              key={master.id ?? `${coords[0]}-${coords[1]}`}
              center={coords}
              radius={selected ? 18 : 15}
              stroke
              bubblingMouseEvents={false}
              pathOptions={{
                color: '#1f1f1f',
                weight: 4,
                fillColor: selected ? '#2fbb52' : '#e84d4d',
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => {
                  onMasterSelect?.(master);
                },
                mousedown: () => {
                  onMasterSelect?.(master);
                },
                touchstart: () => {
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
