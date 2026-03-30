'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type MasterPin = {
  id: string;
  name: string;
  title: string;
  lat?: number;
  lng?: number;
  availableNow?: boolean;
};

type RealMapProps = {
  masters: MasterPin[];
  selectedMasterId?: string;
  onSelectMaster?: (id: string) => void;
};

type Point = {
  id: string;
  name: string;
  title: string;
  lat: number;
  lng: number;
  availableNow?: boolean;
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
  selectedMasterId,
  onSelectMaster,
}: RealMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [screenPoints, setScreenPoints] = useState<ScreenPoint[]>([]);

  const points: Point[] = useMemo(() => {
    if (masters && masters.length > 0) {
      return masters.map((master, index) => ({
        ...master,
        lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
        lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
      })) as Point[];
    }

    return fallbackCoords.map((coord, index) => ({
      id: `fallback-${index}`,
      name: `Master ${index + 1}`,
      title: 'Beauty specialist',
      availableNow: false,
      lat: coord.lat,
      lng: coord.lng,
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
        zoom: 12,
        zoomControl: true,
        tap: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      setIsReady(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
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
    if (!isReady || !mapRef.current) return;

    const map = mapRef.current;
    const bounds = points.map((p) => [p.lat, p.lng]);

    if (points.length > 1) {
      if (selectedMasterId) {
        const active = points.find((p) => p.id === selectedMasterId);
        if (active) {
          map.flyTo([active.lat, active.lng], 13, {
            animate: true,
            duration: 0.6,
          });
        }
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    }
  }, [isReady, points, selectedMasterId]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !wrapperRef.current) return;

    const map = mapRef.current;

    const updatePositions = () => {
      if (!wrapperRef.current) return;

      const next: ScreenPoint[] = points.map((point) => {
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

    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);
    map.on('load', updatePositions);

    setTimeout(updatePositions, 120);
    window.addEventListener('resize', updatePositions);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
      map.off('load', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [isReady, points]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid #e4d5c2',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {screenPoints.map((point) => {
          const selected = selectedMasterId === point.id;
          const size = selected ? 30 : 24;

          return (
            <button
              key={point.id}
              onClick={() => onSelectMaster?.(point.id)}
              style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -50%)',
                width: size,
                height: size,
                borderRadius: 999,
                border: `${selected ? 4 : 3}px solid #2f241c`,
                background: point.availableNow ? '#18c24f' : '#ef2b2b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                pointerEvents: 'auto',
                padding: 0,
                margin: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
