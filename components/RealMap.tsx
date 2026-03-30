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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [51.5074, -0.1278],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    setupMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderMarkers() {
      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;

      if (!map || !markersLayer) return;

      const L = (await import('leaflet')).default;
      if (cancelled) return;

      markersLayer.clearLayers();

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
        const isSelected = selectedMasterId === master.id;
        const fillColor = master.availableNow ? '#16c251' : '#ef2b2b';

        const marker = L.circleMarker([master.lat, master.lng], {
          radius: isSelected ? 14 : 10,
          color: '#2f241c',
          weight: isSelected ? 4 : 3,
          fillColor,
          fillOpacity: 1,
        });

        marker.on('click', () => {
          if (onSelectMaster) {
            onSelectMaster(master.id);
          }
        });

        marker.addTo(markersLayer);
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

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    renderMarkers();

    return () => {
      cancelled = true;
    };
  }, [masters, selectedMasterId, onSelectMaster]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '420px',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid #e4d5c2',
        position: 'relative',
      }}
    />
  );
}
