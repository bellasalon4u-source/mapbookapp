'use client';

import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type ManualLocationPickerMapProps = {
  center: [number, number];
  marker: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
};

function createPinIcon() {
  return L.divIcon({
    className: 'manual-location-pin',
    html: `
      <div style="position:relative;width:34px;height:46px;">
        <div style="
          position:absolute;
          left:50%;
          top:24px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:16px solid #ff4f93;
        "></div>
        <div style="
          position:absolute;
          top:0;
          left:50%;
          transform:translateX(-50%);
          width:34px;
          height:34px;
          border-radius:999px;
          background:#ff4f93;
          border:3px solid #111111;
          box-shadow:0 6px 12px rgba(0,0,0,0.18);
        "></div>
        <div style="
          position:absolute;
          top:9px;
          left:50%;
          transform:translateX(-50%);
          width:10px;
          height:10px;
          border-radius:999px;
          background:#ffffff;
        "></div>
      </div>
    `,
    iconSize: [34, 46],
    iconAnchor: [17, 42],
  });
}

function LongPressLayer({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    contextmenu(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function ManualLocationPickerMap({
  center,
  marker,
  onPick,
}: ManualLocationPickerMapProps) {
  const icon = useMemo(() => createPinIcon(), []);

  return (
    <div
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        border: '2px solid #111111',
        background: '#ffffff',
        height: 360,
      }}
    >
      <MapContainer
        center={marker || center}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LongPressLayer onPick={onPick} />

        {marker ? <Marker position={marker} icon={icon} /> : null}
      </MapContainer>
    </div>
  );
}
