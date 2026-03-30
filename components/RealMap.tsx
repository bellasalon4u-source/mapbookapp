'use client';

import { useEffect, useRef } from 'react';

type MasterPin = {
  id: string;
  name: string;
  title: string;
  lat?: number;
  lng?: number;
};

type RealMapProps = {
  masters: MasterPin[];
  onSelectMaster?: (id: string) => void;
};

const fallbackCoords = [
  { lat: 51.5074, lng: -0.1278 },
  { lat: 51.5154, lng: -0.0721 },
  { lat: 51.5033, lng: -0.1195 },
  { lat: 51.5231, lng: -0.1586 },
  { lat: 51.4952, lng: -0.146 },
  { lat: 51.538, lng: -0.1426 },
];

export default function RealMap({ masters, onSelectMaster }: RealMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapRef.current || leafletMapRef.current) return;

      const L = (await import('leaflet')).default;

      if (!mounted || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [51.5074, -0.1278],
        zoom: 12,
        zoomControl: true,
      });

      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const points =
        masters && masters.length > 0
          ? masters.map((master, index) => ({
              ...master,
              lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
              lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
            }))
          : fallbackCoords.map((coord, index) => ({
              id: `fallback-${index}`,
              name: `Master ${index + 1}`,
              title: 'Beauty specialist',
              lat: coord.lat,
              lng: coord.lng,
            }));

      const bounds: [number, number][] = [];

      points.forEach((master, index) => {
        const fillColors = ['#d92f2f', '#2f7d4a', '#6f42c1', '#ff8c42', '#0f6efd', '#c2185b'];
        const fillColor = fillColors[index % fillColors.length];

        const point = L.circleMarker([master.lat, master.lng], {
          radius: 10,
          color: '#2f241c',
          weight: 3,
          fillColor,
          fillOpacity: 1,
        }).addTo(map);

        point.on('click', () => {
          if (onSelectMaster) {
            onSelectMaster(master.id);
          }
        });

        bounds.push([master.lat, master.lng]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [masters, onSelectMaster]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '360px',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid #e4d5c2',
      }}
    />
  );
}
