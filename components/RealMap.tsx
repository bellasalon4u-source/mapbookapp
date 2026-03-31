'use client';

import { useEffect, useRef } from 'react';
import type { MasterItem } from '../services/masters';

type RealMapProps = {
  masters: MasterItem[];
  fullScreen?: boolean;
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
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([51.5074, -0.1278], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function drawMarkers() {
      if (!mapRef.current) return;

      const L = await import('leaflet');
      if (cancelled) return;

      const map = mapRef.current;

      markersRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      const preparedMasters = masters.map((master, index) => ({
        ...master,
        lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
        lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
      }));

      preparedMasters.forEach((master) => {
        const markerHtml = `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: ${master.availableNow ? '#22c55e' : '#ef4444'};
            border: 4px solid #2a231d;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          "></div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([master.lat, master.lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: Arial, sans-serif; min-width: 180px;">
            <div style="font-size: 16px; font-weight: 800; color: #1d1712;">
              ${master.name}
            </div>
            <div style="margin-top: 4px; color: #6f655b; font-size: 14px;">
              ${master.title} • ${master.city}
            </div>
            <div style="margin-top: 8px; font-weight: 700; color: #1d1712;">
              from £${master.priceFrom}
            </div>
          </div>
        `);

        markersRef.current.push(marker);
      });

      if (preparedMasters.length > 0) {
        const bounds = L.latLngBounds(
          preparedMasters.map((master) => [master.lat, master.lng])
        );

        map.fitBounds(bounds, {
          padding: fullScreen ? [90, 90] : [40, 40],
          maxZoom: 13,
        });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [masters, fullScreen]);

  return (
    <div
      style={{
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
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
