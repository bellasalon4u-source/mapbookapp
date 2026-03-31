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
  gallery?: string[];
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
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getGallery(master: MasterItem) {
  const gallery = Array.isArray(master.gallery) ? master.gallery.filter(Boolean) : [];
  if (gallery.length >= 3) return gallery.slice(0, 3);

  const avatar = master.avatar || 'https://via.placeholder.com/300x200';
  return [avatar, avatar, avatar];
}

function buildPopupHtml(master: MasterItem) {
  const name = escapeHtml(master.name || 'Master');
  const title = escapeHtml(master.title || 'Service specialist');
  const city = escapeHtml(master.city || 'London');
  const rating = Number(master.rating ?? 0).toFixed(1);
  const priceFrom = master.priceFrom ?? 0;
  const available = !!master.availableNow;

  const [mainImage, thumb1, thumb2] = getGallery(master).map((img) =>
    escapeHtml(img)
  );

  const statusColor = available ? '#2f8f48' : '#c53b3b';
  const statusDot = available ? '#2f8f48' : '#c53b3b';
  const statusText = available ? 'Available now' : 'Not available now';

  return `
    <div class="mapbook-popup-card">
      <button class="mapbook-like-btn" data-master-like="${escapeHtml(master.id)}" type="button">♡</button>

      <div class="mapbook-popup-left">
        <div class="mapbook-main-image-wrap">
          <img class="mapbook-main-image" src="${mainImage}" alt="${name}" />
          <div class="mapbook-gallery-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <img class="mapbook-thumb" src="${thumb1}" alt="${name}" />
        <img class="mapbook-thumb" src="${thumb2}" alt="${name}" />
      </div>

      <div class="mapbook-popup-right">
        <div class="mapbook-master-name">${name}</div>
        <div class="mapbook-master-subtitle">${title} • ${city}</div>

        <div class="mapbook-pills-row">
          <div class="mapbook-price-pill">from £${priceFrom}</div>
          <div class="mapbook-rating-pill">${rating}<span class="mapbook-star">★</span></div>
        </div>

        <div class="mapbook-status-row" style="color:${statusColor};">
          <span class="mapbook-status-dot" style="background:${statusDot};"></span>
          ${statusText}
        </div>

        <div class="mapbook-bottom-buttons">
          <a class="mapbook-open-btn" href="/master/${escapeHtml(master.id)}">▶ Open</a>
          <a class="mapbook-book-btn" href="/booking/${escapeHtml(master.id)}">Book now ›</a>
        </div>
      </div>
    </div>
  `;
}

export default function RealMap({
  masters,
  selectedMasterId,
  onSelectMaster,
}: RealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const styleAddedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (styleAddedRef.current) return;

    const style = document.createElement('style');
    style.setAttribute('data-mapbook-popup-style', 'true');
    style.innerHTML = `
      .leaflet-popup-content-wrapper {
        padding: 0 !important;
        border-radius: 28px !important;
        overflow: hidden !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .leaflet-popup-content {
        margin: 0 !important;
        width: 560px !important;
        max-width: calc(100vw - 60px) !important;
      }

      .leaflet-popup-tip {
        background: #f8f6f2 !important;
        box-shadow: none !important;
      }

      .mapbook-popup-card {
        position: relative;
        display: grid;
        grid-template-columns: 150px 1fr;
        gap: 18px;
        background: #f8f6f2;
        border: 1px solid #e8dfd2;
        border-radius: 28px;
        padding: 20px;
        box-shadow: 0 14px 34px rgba(31, 25, 19, 0.18);
        font-family: Arial, sans-serif;
        color: #1f1812;
      }

      .mapbook-like-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 50px;
        height: 50px;
        border-radius: 999px;
        border: 1px solid #e7ddd0;
        background: rgba(244, 239, 232, 0.86);
        color: #4f453d;
        font-size: 28px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mapbook-like-btn.active {
        color: #d83434;
      }

      .mapbook-popup-left {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .mapbook-main-image-wrap {
        position: relative;
      }

      .mapbook-main-image,
      .mapbook-thumb {
        width: 100%;
        object-fit: cover;
        display: block;
      }

      .mapbook-main-image {
        height: 150px;
        border-radius: 18px;
      }

      .mapbook-thumb {
        height: 84px;
        border-radius: 14px;
      }

      .mapbook-gallery-dots {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
      }

      .mapbook-gallery-dots span {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: rgba(255,255,255,0.95);
      }

      .mapbook-popup-right {
        min-width: 0;
        padding-right: 54px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .mapbook-master-name {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.15;
        margin-top: 2px;
      }

      .mapbook-master-subtitle {
        color: #786d61;
        font-size: 15px;
        margin-top: 6px;
      }

      .mapbook-pills-row {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .mapbook-price-pill {
        background: #3c2d21;
        color: #fff;
        border-radius: 999px;
        padding: 11px 18px;
        font-size: 17px;
        font-weight: 800;
      }

      .mapbook-rating-pill {
        background: #efe3cf;
        color: #5c4a34;
        border-radius: 999px;
        padding: 11px 18px;
        font-size: 17px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .mapbook-star {
        color: #d3a32d;
      }

      .mapbook-status-row {
        margin-top: 16px;
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mapbook-status-dot {
        width: 13px;
        height: 13px;
        border-radius: 999px;
        display: inline-block;
      }

      .mapbook-bottom-buttons {
        margin-top: 24px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .mapbook-open-btn,
      .mapbook-book-btn {
        text-decoration: none;
        border-radius: 18px;
        padding: 15px 22px;
        font-size: 18px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 150px;
      }

      .mapbook-open-btn {
        background: linear-gradient(180deg, #a8d9e7 0%, #7fc5d8 100%);
        color: #fff;
      }

      .mapbook-book-btn {
        background: linear-gradient(180deg, #48ac57 0%, #379944 100%);
        color: #fff;
      }

      @media (max-width: 640px) {
        .leaflet-popup-content {
          width: 320px !important;
          max-width: calc(100vw - 36px) !important;
        }

        .mapbook-popup-card {
          grid-template-columns: 110px 1fr;
          gap: 14px;
          padding: 16px;
          border-radius: 24px;
        }

        .mapbook-main-image {
          height: 118px;
          border-radius: 16px;
        }

        .mapbook-thumb {
          height: 62px;
          border-radius: 12px;
        }

        .mapbook-master-name {
          font-size: 18px;
          padding-right: 8px;
        }

        .mapbook-master-subtitle {
          font-size: 13px;
        }

        .mapbook-price-pill,
        .mapbook-rating-pill {
          font-size: 14px;
          padding: 10px 14px;
        }

        .mapbook-open-btn,
        .mapbook-book-btn {
          min-width: 112px;
          padding: 13px 16px;
          font-size: 15px;
          border-radius: 16px;
        }

        .mapbook-like-btn {
          width: 42px;
          height: 42px;
          font-size: 24px;
        }
      }
    `;
    document.head.appendChild(style);
    styleAddedRef.current = true;
  }, []);

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
              avatar: 'https://via.placeholder.com/300x200',
              rating: 4.8,
              priceFrom: 40,
              availableNow: false,
              gallery: ['https://via.placeholder.com/300x200'],
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

        marker.bindPopup(buildPopupHtml(master), {
          closeButton: false,
          autoPan: true,
          maxWidth: 580,
          offset: [0, -10],
          className: 'mapbook-popup-shell',
        });

        marker.on('click', () => {
          onSelectMaster?.(master.id);
          marker.openPopup();
        });

        marker.on('popupopen', () => {
          setTimeout(() => {
            const likeBtn = document.querySelector(
              `[data-master-like="${master.id}"]`
            ) as HTMLButtonElement | null;

            if (likeBtn) {
              likeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                likeBtn.classList.toggle('active');
                likeBtn.textContent = likeBtn.classList.contains('active') ? '♥' : '♡';
              };
            }
          }, 30);
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
