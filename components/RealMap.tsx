'use client';

import { useEffect, useMemo } from 'react';
import L, { type DivIcon, type LatLngExpression } from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { t, type AppLanguage } from '../services/i18n';

type MasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  price?: string | number;
  availableNow?: boolean;
  availableToday?: boolean;
  lat?: number;
  lng?: number;
  avatar?: string;
  description?: string;
  paymentMethods?: string[] | string;
};

type RealMapProps = {
  masters: MasterItem[];
  mapMode?: 'map' | 'satellite';
  activeCategory?: string;
  selectedMasterId?: string | number | null;
  likedMasterIds?: string[];
  onToggleLike?: (id: string | number) => void;
  onSelectMaster?: (id: string | number) => void;
  language?: AppLanguage;
};

const LONDON_CENTER: LatLngExpression = [51.5074, -0.1278];

function MapBounds({ masters, selectedMasterId }: { masters: MasterItem[]; selectedMasterId?: string | number | null }) {
  const map = useMap();

  useEffect(() => {
    const validMasters = masters.filter(
      (master) => typeof master.lat === 'number' && typeof master.lng === 'number'
    );

    if (!validMasters.length) {
      map.setView(LONDON_CENTER, 11);
      return;
    }

    const selected = validMasters.find((m) => String(m.id) === String(selectedMasterId));

    if (selected && typeof selected.lat === 'number' && typeof selected.lng === 'number') {
      map.setView([selected.lat, selected.lng], 14, { animate: true });
      return;
    }

    if (validMasters.length === 1) {
      map.setView([validMasters[0].lat as number, validMasters[0].lng as number], 13, {
        animate: true,
      });
      return;
    }

    const bounds = L.latLngBounds(
      validMasters.map((master) => [master.lat as number, master.lng as number] as [number, number])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      animate: true,
    });
  }, [map, masters, selectedMasterId]);

  return null;
}

function createMarkerIcon(isSelected: boolean, isAvailable: boolean): DivIcon {
  const size = isSelected ? 26 : 22;
  const border = isSelected ? 4 : 3;
  const dotSize = isSelected ? 10 : 8;

  const background = isAvailable ? '#21c45d' : '#ef4444';
  const ring = isSelected ? '#111827' : '#ffffff';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${background};
        border:${border}px solid ${ring};
        box-sizing:border-box;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:${dotSize}px;
          height:${dotSize}px;
          border-radius:999px;
          background:#ffffff;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function getTileUrl(mapMode: 'map' | 'satellite') {
  if (mapMode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

export default function RealMap({
  masters,
  mapMode = 'map',
  activeCategory,
  selectedMasterId,
  likedMasterIds = [],
  onToggleLike,
  onSelectMaster,
  language = 'ru',
}: RealMapProps) {
  const validMasters = useMemo(() => {
    return masters.filter(
      (master) => typeof master.lat === 'number' && typeof master.lng === 'number'
    );
  }, [masters]);

  const filteredMasters = useMemo(() => {
    if (!activeCategory || activeCategory === 'all') return validMasters;

    return validMasters.filter((master) => {
      const category = (master.category || '').toLowerCase();
      const subcategory = (master.subcategory || '').toLowerCase();
      const target = activeCategory.toLowerCase();

      return category.includes(target) || subcategory.includes(target);
    });
  }, [validMasters, activeCategory]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={LONDON_CENTER}
        zoom={11}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={getTileUrl(mapMode)}
        />

        <MapBounds masters={filteredMasters} selectedMasterId={selectedMasterId} />

        {filteredMasters.map((master) => {
          const isSelected = String(master.id) === String(selectedMasterId);
          const isLiked = likedMasterIds.some((id) => String(id) === String(master.id));
          const isAvailable = Boolean(master.availableNow || master.availableToday);

          return (
            <Marker
              key={master.id}
              position={[master.lat as number, master.lng as number]}
              icon={createMarkerIcon(isSelected, isAvailable)}
              eventHandlers={{
                click: () => {
                  onSelectMaster?.(master.id);
                },
              }}
            >
              <CircleMarker
                center={[master.lat as number, master.lng as number]}
                radius={isSelected ? 16 : 13}
                pathOptions={{
                  color: isAvailable ? '#21c45d' : '#ef4444',
                  weight: 2,
                  fillOpacity: 0,
                }}
              />

              <Popup maxWidth={320}>
                <div
                  style={{
                    minWidth: 240,
                    fontFamily: 'inherit',
                  }}
                >
                  {master.avatar ? (
                    <img
                      src={master.avatar}
                      alt={master.name || master.title || 'master'}
                      style={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 12,
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          lineHeight: 1.1,
                          marginBottom: 6,
                        }}
                      >
                        {master.name || master.title || 'Specialist'}
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          opacity: 0.75,
                          marginBottom: 12,
                        }}
                      >
                        {master.subcategory || master.category || 'service'}
                        {master.city ? ` • ${master.city}` : ''}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleLike?.(master.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 22,
                        lineHeight: 1,
                      }}
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {typeof master.rating === 'number' ? (
                      <span
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          background: '#fce7f3',
                          color: '#be185d',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        ★ {master.rating.toFixed(1)}
                      </span>
                    ) : null}

                    <span
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: isAvailable ? '#dcfce7' : '#fee2e2',
                        color: isAvailable ? '#15803d' : '#b91c1c',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {isAvailable
                        ? t('availableNow', language) || 'Доступен сейчас'
                        : t('busy', language) || 'Недоступен'}
                    </span>

                    {master.price ? (
                      <span
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          background: '#f3f4f6',
                          color: '#111827',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {typeof master.price === 'number' ? `From £${master.price}` : master.price}
                      </span>
                    ) : null}
                  </div>

                  {master.description ? (
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: '#374151',
                      }}
                    >
                      {master.description}
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
