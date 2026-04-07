'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type AppLanguage = string;

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

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

function FitToMarkers({
  masters,
  selectedMasterId,
}: {
  masters: MasterItem[];
  selectedMasterId?: string | number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!masters.length) {
      map.setView(LONDON_CENTER, 11);
      return;
    }

    const selected = masters.find((m) => String(m.id) === String(selectedMasterId));

    if (
      selected &&
      typeof selected.lat === 'number' &&
      typeof selected.lng === 'number'
    ) {
      map.setView([selected.lat, selected.lng], 14, { animate: true });
      return;
    }

    if (masters.length === 1) {
      const first = masters[0];
      if (typeof first.lat === 'number' && typeof first.lng === 'number') {
        map.setView([first.lat, first.lng], 13, { animate: true });
      }
      return;
    }

    const bounds = L.latLngBounds(
      masters.map((m) => [m.lat as number, m.lng as number] as [number, number])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      animate: true,
    });
  }, [map, masters, selectedMasterId]);

  return null;
}

function createPinIcon(isSelected: boolean, isAvailable: boolean) {
  const size = isSelected ? 28 : 22;
  const border = isSelected ? 4 : 3;
  const background = isAvailable ? '#22c55e' : '#ef4444';
  const ring = isSelected ? '#111827' : '#ffffff';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${background};
        border:${border}px solid ${ring};
        box-sizing:border-box;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:8px;
          height:8px;
          border-radius:9999px;
          background:#ffffff;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getTileUrl(mapMode: 'map' | 'satellite') {
  if (mapMode === 'satellite') {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function getName(master: MasterItem) {
  return master.name || master.title || 'Specialist';
}

function getCategory(master: MasterItem) {
  return master.subcategory || master.category || 'service';
}

function getAvailabilityLabel(master: MasterItem, language?: string) {
  const isAvailable = Boolean(master.availableNow || master.availableToday);

  if (language === 'ru') {
    return isAvailable ? 'Доступен сейчас' : 'Сейчас занят';
  }

  return isAvailable ? 'Available now' : 'Busy now';
}

function getPriceLabel(price?: string | number, language?: string) {
  if (price === undefined || price === null || price === '') return null;

  if (typeof price === 'number') {
    return language === 'ru' ? `От £${price}` : `From £${price}`;
  }

  return String(price);
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
      (master) =>
        typeof master.lat === 'number' &&
        typeof master.lng === 'number'
    );
  }, [masters]);

  const filteredMasters = useMemo(() => {
    if (!activeCategory || activeCategory === 'all') {
      return validMasters;
    }

    const target = activeCategory.toLowerCase();

    return validMasters.filter((master) => {
      const category = (master.category || '').toLowerCase();
      const subcategory = (master.subcategory || '').toLowerCase();

      return category.includes(target) || subcategory.includes(target);
    });
  }, [validMasters, activeCategory]);

  const selectedMaster = useMemo(() => {
    return (
      filteredMasters.find((m) => String(m.id) === String(selectedMasterId)) ||
      filteredMasters[0] ||
      null
    );
  }, [filteredMasters, selectedMasterId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        overflow: 'hidden',
        borderRadius: 24,
      }}
    >
      <MapContainer
        center={LONDON_CENTER}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={getTileUrl(mapMode)}
        />

        <FitToMarkers
          masters={filteredMasters}
          selectedMasterId={selectedMasterId}
        />

        {filteredMasters.map((master) => {
          const isSelected = String(master.id) === String(selectedMasterId);
          const isAvailable = Boolean(master.availableNow || master.availableToday);

          return (
            <Marker
              key={String(master.id)}
              position={[master.lat as number, master.lng as number]}
              icon={createPinIcon(isSelected, isAvailable)}
              eventHandlers={{
                click: () => {
                  if (onSelectMaster) {
                    onSelectMaster(master.id);
                  }
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selectedMaster ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 1000,
            background: '#ffffff',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          }}
        >
          {selectedMaster.avatar ? (
            <img
              src={selectedMaster.avatar}
              alt={getName(selectedMaster)}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#e5e7eb',
              }}
            />
          )}

          <div style={{ padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: '#0f172a',
                    marginBottom: 10,
                  }}
                >
                  {getName(selectedMaster)}
                </div>

                <div
                  style={{
                    fontSize: 16,
                    color: '#6b7280',
                    marginBottom: 16,
                  }}
                >
                  {getCategory(selectedMaster)}
                  {selectedMaster.city ? ` • ${selectedMaster.city}` : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onToggleLike) {
                    onToggleLike(selectedMaster.id);
                  }
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 28,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                {likedMasterIds.some(
                  (id) => String(id) === String(selectedMaster.id)
                )
                  ? '❤️'
                  : '🤍'}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 18,
              }}
            >
              {typeof selectedMaster.rating === 'number' ? (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: 9999,
                    background: '#fce7f3',
                    color: '#db2777',
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  ★ {selectedMaster.rating.toFixed(1)}
                </div>
              ) : null}

              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 9999,
                  background: selectedMaster.availableNow || selectedMaster.availableToday
                    ? '#dcfce7'
                    : '#fee2e2',
                  color: selectedMaster.availableNow || selectedMaster.availableToday
                    ? '#15803d'
                    : '#b91c1c',
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {getAvailabilityLabel(selectedMaster, language)}
              </div>

              {getPriceLabel(selectedMaster.price, language) ? (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: 9999,
                    background: '#f3f4f6',
                    color: '#374151',
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {getPriceLabel(selectedMaster.price, language)}
                </div>
              ) : null}
            </div>

            {selectedMaster.description ? (
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: '#374151',
                }}
              >
                {selectedMaster.description}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
