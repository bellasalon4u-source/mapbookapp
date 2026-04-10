'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
};

const markerIcon = L.divIcon({
  className: 'custom-location-picker-marker',
  html: `
    <div style="position:relative;width:34px;height:46px;">
      <div style="
        position:absolute;
        left:50%;
        top:0;
        transform:translateX(-50%);
        width:30px;
        height:30px;
        border-radius:999px;
        background:#ff4f93;
        border:3px solid #ffffff;
        box-shadow:0 6px 16px rgba(0,0,0,0.22);
      "></div>
      <div style="
        position:absolute;
        left:50%;
        top:24px;
        transform:translateX(-50%);
        width:0;
        height:0;
        border-left:10px solid transparent;
        border-right:10px solid transparent;
        border-top:18px solid #ff4f93;
      "></div>
    </div>
  `,
  iconSize: [34, 46],
  iconAnchor: [17, 42],
});

function PickerEvents({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize();
    }, 80);

    return () => window.clearTimeout(id);
  }, [map]);

  return null;
}

export default function LocationPickerMap({ lat, lng, onPick }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={5}
      style={{ width: '100%', height: 320 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PickerEvents onPick={onPick} />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
