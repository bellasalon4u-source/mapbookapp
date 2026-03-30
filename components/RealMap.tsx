'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type MasterItem = {
  id: string;
  name: string;
  title: string;
  city?: string;
  avatar?: string;
  rating?: number;
  priceFrom?: number;
  availableNow?: boolean;
  lat?: number;
  lng?: number;
};

type RealMapProps = {
  masters: MasterItem[];
  selectedMasterId?: string;
  onSelectMaster?: (id: string) => void;
};

type Point = MasterItem & {
  lat: number;
  lng: number;
};

type ScreenPoint = {
  id: string;
  x: number;
  y: number;
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
        zoom: 12,
        zoomControl: true,
        tap: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
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

    if (selectedMasterId) {
      const active = points.find((p) => p.id === selectedMasterId);
      if (active) {
        map.setView([active.lat, active.lng], 13);
      }
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [ready, points, selectedMasterId]);

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
        {screenPoints.map((point) => {
          const master = points.find((m) => m.id === point.id);
          if (!master) return null;

          const selected = selectedMasterId === point.id;
          const dotSize = selected ? 30 : 24;

          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onSelectMaster?.(point.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectMaster?.(point.id);
              }}
              style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -50%)',
                width: 54,
                height: 54,
                border: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                pointerEvents: 'auto',
                zIndex: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: dotSize,
                  height: dotSize,
                  borderRadius: 999,
                  border: `${selected ? 4 : 3}px solid #2f241c`,
                  background: master.availableNow ? '#18c24f' : '#ef2b2b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
