'use client';

import { useEffect, useRef, useState } from 'react';
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
  { lat: 51.4952, lng: -0.146 },
  { lat: 51.538, lng: -0.1426 },
];

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default function RealMap({
  masters,
  fullScreen = false,
}: RealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let isCancelled = false;

    async function initMap() {
      const L = await import('leaflet');
      if (isCancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([51.5074, -0.1278], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMounted]);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    async function drawMarkers() {
      const L = await import('leaflet');
      const map = mapRef.current;
      const layer = markersLayerRef.current;

      layer.clearLayers();

      const preparedMasters = masters.map((master, index) => ({
        ...master,
        lat: master.lat ?? fallbackCoords[index % fallbackCoords.length].lat,
        lng: master.lng ?? fallbackCoords[index % fallbackCoords.length].lng,
      }));

      preparedMasters.forEach((master) => {
        const color = master.availableNow ? '#22c55e' : '#ef4444';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 999px;
              background: ${color};
              border: 4px solid #2a231d;
              box-shadow: 0 4px 10px rgba(0,0,0,0.18);
            "></div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const popupHtml = `
          <div style="min-width:220px;font-family:Arial,sans-serif;">
            <div style="font-size:18px;font-weight:800;color:#1d1712;">
              ${escapeHtml(master.name)}
            </div>
            <div style="margin-top:6px;font-size:14px;color:#6f655b;">
              ${escapeHtml(master.title)} • ${escapeHtml(master.city)}
            </div>
            <div style="margin-top:10px;font-size:14px;font-weight:700;color:#248345;">
              ${master.availableNow ? 'Available now' : 'Not available now'}
            </div>
            <div style="margin-top:10px;font-size:15px;font-weight:800;color:#1d1712;">
              from £${master.priceFrom}
            </div>
          </div>
        `;

        L.marker([master.lat, master.lng], { icon })
          .addTo(layer)
          .bindPopup(popupHtml);
      });

      if (preparedMasters.length > 0) {
        const bounds = L.latLngBounds(
          preparedMasters.map((master) => [master.lat, master.lng])
        );
        map.fitBounds(bounds, {
          padding: fullScreen ? [80, 80] : [40, 40],
          maxZoom: 13,
        });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    drawMarkers();
  }, [masters, fullScreen]);

  return (
    <div
      style={{
        width: '100%',
        height: fullScreen ? '100vh' : 420,
        minHeight: fullScreen ? '100vh' : 420,
        borderRadius: fullScreen ? 0 : 28,
        overflow: 'hidden',
        position: 'relative',
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
