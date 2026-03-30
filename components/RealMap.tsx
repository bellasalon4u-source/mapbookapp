'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import('leaflet')).default;
      if (disposed || !containerRef.current) return;

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
      setIsReady(true);

      setTimeout(() => map.invalidateSize(), 250);
    }

    initMap();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function drawMarkers() {
      if (!isReady || !mapRef.current || !layerRef.current) return;

      const L = (await import('leaflet')).default;
      if (cancelled) return;

      const map = mapRef.current;
      const layer = layerRef.current;

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
        const fillColor = master.availableNow ? '#18c24f' : '#ef2b2b';
        const size = selected ? 28 : 22;
        const border = selected ? 4 : 3;

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:${size}px;
              height:${size}px;
              border-radius:999px;
              background:${fillColor};
              border:${border}px solid #2f241c;
              box-sizing:border-box;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
            "></div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([master.lat, master.lng], { icon });

        marker.on('click', () => {
          onSelectMaster?.(master.id);
        });

        marker.addTo(layer);
        bounds.push([master.lat, master.lng]);
      });

      if (points.length > 1) {
        if (selectedMasterId) {
          const active = points.find((item) => item.id === selectedMasterId);
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

      setTimeout(() => map.invalidateSize(), 100);
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [isReady, masters, selectedMasterId, onSelectMaster]);

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
