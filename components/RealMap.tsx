'use client';

import { useEffect, useRef } from 'react';

type MasterPin = {
  id: string;
  name: string;
  title: string;
  lat: number;
  lng: number;
};

type RealMapProps = {
  masters: MasterPin[];
};

export default function RealMap({ masters }: RealMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

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

      masters.forEach((master) => {
        const point = L.circleMarker([master.lat, master.lng], {
          radius: 10,
          color: '#2f241c',
          weight: 3,
          fillColor: '#d92f2f',
          fillOpacity: 1,
        }).addTo(map);

        point.bindPopup(
          `<b>${master.name}</b><br/>${master.title}<br/><a href="/master/${master.id}">Open profile</a>`
        );
      });
    }

    initMap();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [masters]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '360px',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid #e4d5c2',
      }}
    />
  );
}
