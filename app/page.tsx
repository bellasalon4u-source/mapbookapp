"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function HomePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || !mapRef.current) return;

    const existingScript = document.getElementById("google-maps-script");

    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const center = { lat: 51.5074, lng: -0.1278 };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
      });

      new window.google.maps.Marker({
        position: center,
        map,
        title: "MapBook London",
      });
    };

    if (existingScript) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.body.appendChild(script);
  }, []);

  return (
    <main style={{ minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>MapBook</h1>
        <p style={{ marginBottom: 16 }}>Service booking map app</p>
      </div>

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "75vh",
          borderTop: "1px solid #ddd",
        }}
      />
    </main>
  );
}
