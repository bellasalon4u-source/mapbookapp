'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function RealMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [51.5074, -0.1278],
      zoom: 12,
      zoomControl: true,
    });

    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([51.5074, -0.1278]).addTo(map);
    marker.bindPopup(
      '<b>Bella Keratin Studio</b><br/>Hair Extensions Specialist'
    );

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  return
}
