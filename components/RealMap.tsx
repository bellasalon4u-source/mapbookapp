'use client';

import { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import('leaflet')).default;
      if (destroyed || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [51.5074, -0.1278],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);

      mapRef.current = map;
      layerRef.current = layer;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    init();

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function redraw() {
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      const L = (await import('leaflet')).default;
      if (cancelled) return;

      layer.clearLayers();

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
              availableNow: false,
              lat: coord.lat,
              lng: coord.lng,
            }));

      const bounds: [number, number][] = [];

      points.forEach((master) => {
        const selected = selectedMasterId === master.id;
        const marker = L.circleMarker([master.lat, master.lng], {
          radius: selected ? 14 : 10,
          color: '#2f241c',
          weight: selected ? 4 : 3,
          fillColor: master.availableNow ? '#16c251' : '#ef2b2b',
          fillOpacity: 1,
        });

        marker.on('click', () => {
          onSelectMaster?.(master.id);
        });

        marker.addTo(layer);
        bounds.push([master.lat, master.lng]);
      });

      if (points.length > 1) {
        if (selectedMasterId) {
          const active = points.find((x) => x.id === selectedMasterId);
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

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    redraw();

    return () => {
      cancelled = true;
    };
  }, [masters, selectedMasterId, onSelectMaster]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '420px',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid #e4d5c2',
      }}
    />
  );
}
