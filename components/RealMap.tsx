'use client';

import { useEffect, useRef, useState } from 'react';

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

const fallbackCoords = [
  { lat: 51.5074, lng: -0.1278 },
  { lat: 51.5154, lng: -0.0721 },
  { lat: 51.5033, lng: -0.1195 },
  { lat: 51.5231, lng: -0.1586 },
  { lat: 51.4952, lng: -0.1460 },
  { lat: 51.5380, lng: -0.1426 },
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
  selectedMasterId,
  onSelectMaster,
}: RealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

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
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);

      mapRef.current = map;
      layerRef.current = layer;
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
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function drawMarkers() {
      if (!ready || !mapRef.current || !layerRef.current) return;

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
              city: 'London',
              avatar: 'https://via.placeholder.com/80',
              rating: 4.8,
              priceFrom: 40,
              availableNow: false,
              lat: coord.lat,
              lng: coord.lng,
            }));

      const bounds: [number, number][] = [];

      points.forEach((master) => {
        const isSelected = selectedMasterId === master.id;
        const radius = isSelected ? 14 : 11;

        const marker = L.circleMarker([master.lat, master.lng], {
          radius,
          color: '#2f241c',
          weight: isSelected ? 4 : 3,
          fillColor: master.availableNow ? '#18c24f' : '#ef2b2b',
          fillOpacity: 1,
        });

        const name = escapeHtml(master.name || 'Master');
        const title = escapeHtml(master.title || 'Service specialist');
        const city = escapeHtml(master.city || 'London');
        const avatar = escapeHtml(
          master.avatar || 'https://via.placeholder.com/80'
        );
        const rating = master.rating ?? 0;
        const priceFrom = master.priceFrom ?? 0;
        const statusText = master.availableNow ? 'Available now' : 'Not available now';
        const statusBg = master.availableNow ? '#edf7ee' : '#fdecec';
        const statusColor = master.availableNow ? '#1f8f45' : '#c53434';

        const popupHtml = `
          <div style="width:260px;font-family:Arial,sans-serif;color:#1d1712;">
            <div style="display:flex;gap:12px;align-items:center;">
              <img
                src="${avatar}"
                alt="${name}"
                style="width:56px;height:56px;border-radius:16px;object-fit:cover;display:block;"
              />
              <div style="flex:1;min-width:0;">
                <div style="font-size:18px;font-weight:800;line-height:1.2;">${name}</div>
                <div style="font-size:14px;color:#786d61;margin-top:4px;">${title} • ${city}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                  <span style="background:#2f241c;color:#fff;padding:6px 10px;border-radius:999px;font-size:13px;font-weight:800;">
                    from £${priceFrom}
                  </span>
                  <span style="background:#f2e9dc;color:#463b31;padding:6px 10px;border-radius:999px;font-size:13px;font-weight:800;">
                    ${rating} ★
                  </span>
                </div>
              </div>
            </div>

            <div style="margin-top:12px;">
              <span style="background:${statusBg};color:${statusColor};padding:8px 10px;border-radius:12px;font-size:13px;font-weight:700;display:inline-block;">
                ● ${statusText}
              </span>
            </div>

            <div style="display:flex;gap:8px;margin-top:14px;">
              <a
                href="/master/${master.id}"
                style="text-decoration:none;border:1px solid #d8cfc3;background:#fff;color:#2f241c;padding:10px 12px;border-radius:12px;font-weight:800;font-size:14px;"
              >
                Open
              </a>
              <a
                href="/booking/${master.id}"
                style="text-decoration:none;background:#e52323;color:#fff;padding:10px 12px;border-radius:12px;font-weight:800;font-size:14px;"
              >
                Book now
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          closeButton: false,
          autoPan: true,
          maxWidth: 290,
          offset: [0, -8],
        });

        marker.on('click', () => {
          onSelectMaster?.(master.id);
          marker.openPopup();
        });

        marker.addTo(layer);
        bounds.push([master.lat, master.lng]);
      });

      if (points.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (points.length === 1) {
        map.setView(bounds[0], 13);
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 120);
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [ready, masters, selectedMasterId, onSelectMaster]);

  return (
    <div
      ref={mapContainerRef}
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
