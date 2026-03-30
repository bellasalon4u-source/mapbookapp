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
  { lat: 51.4952, lng: -0.146 },
  { lat: 51.538, lng: -0.1426 },
];

export default function RealMap({
  masters,
  selectedMasterId,
  onSelectMaster,
}: RealMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

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

      layerGroupRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    }

    initMap();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function drawPins() {
      if (!mapReady || !leafletMapRef.current || !layerGroupRef.current) return;

      const L = (await import('leaflet')).default;
      const map = leafletMapRef.current;
      const layerGroup = layerGroupRef.current;

      layerGroup.clearLayers();

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
        const fillColor = master.availableNow ? '#12b347' : '#e52323';

        const point = L.circleMarker([master.lat, master.lng], {
          radius: isSelected ? 14 : 10,
          color: '#2f241c',
          weight: isSelected ? 4 : 3,
          fillColor,
          fillOpacity: 1,
        }).addTo(layerGroup);

        point.on('click', () => {
          if (onSelectMaster) onSelectMaster(master.id);
        });

        bounds.push([master.lat, master.lng]);
      });

      if (points.length > 1 && !selectedMasterId) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      if (selectedMasterId) {
        const active = points.find((item) => item.id === selectedMasterId);
        if (active) {
          map.flyTo([active.lat, active.lng], 13, {
            animate: true,
            duration: 0.6,
          });
        }
      }
    }

    drawPins();
  }, [mapReady, masters, selectedMasterId, onSelectMaster]);

  return (
    <div
      ref={mapRef}
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
