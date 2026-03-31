'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

function parseDurationToMinutes(value: string) {
  const hourMatch = value.match(/(\d+)\s*h/);
  const minuteMatch = value.match(/(\d+)\s*m/);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function BookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  if (!master) {
    return <main style={{ padding: 24 }}>Booking not found</main>;
  }

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master.services.filter((service) =>
    selectedServiceSlugs.includes(service.slug)
  );

  if (!selectedItems.length) {
    return <main style={{ padding: 24 }}>Selected procedures not found</main>;
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              background: '#2e9746',
              color: '#fff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 900,
            }}
          >
            ✓
          </div>

          <h1 style={{ fontSize: 38, marginTop: 24, marginBottom: 0 }}>Booking sent</h1>
          <p style={{ color: '#6f655b', fontSize: 18, marginTop: 14, lineHeight: 1.5 }}>
            Your £5 hold deposit is ready.
            <br />
            The seller can now review and confirm your appointment.
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>Selected procedures</div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 18,
                  background: '#faf6ef',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 16,
                  }}
                />

                <div>
                  <div style={{ fontSize: 19, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ marginTop: 6, color: '#6e655d' }}>{item.duration}</div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>£{item.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 700 }}>Total duration</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatMinutes(totalMinutes)}
              </div>
            </div>

            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 700 }}>Total price</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                £{totalPrice}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, color: '#2e9746', fontWeight: 800, fontSize: 18 }}>
            📅 {date}
          </div>
          <div style={{ marginTop: 8, color: '#2e9746', fontWeight: 800, fontSize: 18 }}>
            🕒 {time}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{master.name}</div>
          <div style={{ marginTop: 10, color: '#6e655d', lineHeight: 1.7 }}>
            Address: {master.address}
            <br />
            Phone: {master.phone}
            <br />
            Email: {master.email}
            <br />
            Social: {master.social}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          <button
            style={{
              border: 'none',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Write to seller
          </button>

          <button
            style={{
              border: 'none',
              background: '#dbeedc',
              color: '#24693b',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Call seller
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              border: '1px solid #d9d0c4',
              background: '#fff',
              color: '#2b231d',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </main>
  );
}
