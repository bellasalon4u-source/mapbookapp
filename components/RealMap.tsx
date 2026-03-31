'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MasterItem } from '../services/masters';

type RealMapProps = {
  masters: MasterItem[];
  fullScreen?: boolean;
};

type Point = MasterItem & {
  lat: number;
  lng: number;
};

type ScreenPoint = {
  id: string;
  x: number;
  y: number;
  availableNow?: boolean;
};

const fallbackCoords = [
  { lat: 51.5074, lng: -0.1278 },
  { lat: 51.5154, lng: -0.0721 },
  { lat: 51.5033, lng: -0.1195 },
  { lat: 51.5231, lng: -0.1586 },
  { lat: 51.4952, lng: -0.1460 },
  { lat: 51.5380, lng: -0.1426 },
];

export default function RealMap({
  masters,
  fullScreen = false,
}: RealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [screenPoints, setScreenPoints] = useState<ScreenPoint[]>([]);

  const points: Point[] = useMemo(() => {
    return masters.map((master, index) => ({
      ...master,
      lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
      lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
    }));
  }, [masters]);

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = (await import('leaflet')).default;
      if (disposed || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [51.5074, -0.1278],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      setReady(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    initMap();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || points.length === 0) return;

    const map = mapRef.current;
    const bounds = points.map((p) => [p.lat, p.lng]);

    if (bounds.length > 1) {
      map.fitBounds(bounds, {
        padding: fullScreen ? [90, 90] : [40, 40],
        maxZoom: 13,
      });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [ready, points, fullScreen]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = mapRef.current;

    const updatePositions = () => {
      const next = points.map((point) => {
        const projected = map.latLngToContainerPoint([point.lat, point.lng]);
        return {
          id: point.id,
          x: projected.x,
          y: projected.y,
          availableNow: point.availableNow,
        };
      });

      setScreenPoints(next);
    };

    updatePositions();

    map.on('zoomend', updatePositions);
    map.on('moveend', updatePositions);
    map.on('resize', updatePositions);

    setTimeout(updatePositions, 100);
    setTimeout(updatePositions, 400);

    window.addEventListener('resize', updatePositions);

    return () => {
      map.off('zoomend', updatePositions);
      map.off('moveend', updatePositions);
      map.off('resize', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [ready, points]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: fullScreen ? '100vh' : '420px',
        minHeight: fullScreen ? '100vh' : '420px',
        borderRadius: fullScreen ? 0 : 28,
        overflow: 'hidden',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {screenPoints.map((point) => (
          <div
            key={point.id}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
              width: 30,
              height: 30,
              borderRadius: 999,
              border: '4px solid #2f241c',
              background: point.availableNow ? '#22c55e' : '#ef4444',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              zIndex: 60,
            }}
          />
        ))}
      </div>
    </div>
  );
}
