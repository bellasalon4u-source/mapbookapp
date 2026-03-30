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

export default function RealMap({ masters }: RealMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [screenPoints, setScreenPoints] = useState<ScreenPoint[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const points: Point[] = useMemo(() => {
    return masters.map((master, index) => ({
      ...master,
      lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
      lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
    }));
  }, [masters]);

  const selectedMaster = points.find((item) => item.id === selectedId) || null;

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

    if (selectedId) {
      const active = points.find((p) => p.id === selectedId);
      if (active) {
        map.flyTo([active.lat, active.lng], 13, {
          animate: true,
          duration: 0.5,
        });
      }
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [ready, points, selectedId]);

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

    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);

    setTimeout(updatePositions, 100);
    setTimeout(updatePositions, 400);

    window.addEventListener('resize', updatePositions);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [ready, points]);

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
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {screenPoints.map((point) => {
          const master = points.find((m) => m.id === point.id);
          if (!master) return null;

          const selected = selectedId === point.id;
          const dotSize = selected ? 30 : 24;
          const hitSize = 52;

          return (
            <button
              key={point.id}
              type="button"
              onClick={() => setSelectedId(point.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setSelectedId(point.id);
              }}
              style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -50%)',
                width: hitSize,
                height: hitSize,
                border: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                pointerEvents: 'auto',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
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

      {selectedMaster && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            background: '#ffffff',
            borderRadius: 24,
            border: '1px solid #eadfd2',
            padding: 14,
            boxShadow: '0 12px 24px rgba(0,0,0,0.14)',
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <img
              src={selectedMaster.avatar || 'https://via.placeholder.com/80'}
              alt={selectedMaster.name}
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                objectFit: 'cover',
                flexShrink: 0,
                display: 'block',
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {selectedMaster.name}
              </div>

              <div
                style={{
                  color: '#786d61',
                  marginTop: 4,
                  fontSize: 14,
                }}
              >
                {selectedMaster.title}
                {selectedMaster.city ? ` • ${selectedMaster.city}` : ''}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    background: '#2f241c',
                    color: '#fff',
                    padding: '7px 10px',
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  from £{selectedMaster.priceFrom ?? 0}
                </span>

                <span
                  style={{
                    background: '#f2e9dc',
                    color: '#463b31',
                    padding: '7px 10px',
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {selectedMaster.rating ?? 0} ★
                </span>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: '1px solid #eadfd2',
                background: '#fff',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              ♡
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              marginTop: 14,
            }}
          >
            <div
              style={{
                background: selectedMaster.availableNow ? '#edf7ee' : '#fdecec',
                color: selectedMaster.availableNow ? '#1f8f45' : '#c53434',
                padding: '10px 12px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {selectedMaster.availableNow ? '● Available now' : '● Not available now'}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={`/master/${selectedMaster.id}`}
                style={{
                  textDecoration: 'none',
                  border: '1px solid #d8cfc3',
                  background: '#fff',
                  color: '#2f241c',
                  padding: '12px 14px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                Open
              </a>

              <a
                href={`/booking/${selectedMaster.id}`}
                style={{
                  textDecoration: 'none',
                  background: '#e52323',
                  color: '#fff',
                  padding: '12px 14px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                Book now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
