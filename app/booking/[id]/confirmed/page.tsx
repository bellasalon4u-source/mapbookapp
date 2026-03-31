'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

export default function BookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  if (!master) {
    return <main style={{ padding: 24 }}>Booking not found</main>;
  }

  const service =
    master.services.find((item) => item.slug === serviceSlug) || master.services[0];

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
        <div style={{ textAlign: 'center', marginTop: 36 }}>
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
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '92px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <img
            src={service.image}
            alt={service.title}
            style={{
              width: 92,
              height: 92,
              objectFit: 'cover',
              borderRadius: 18,
            }}
          />

          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{service.title}</div>
            <div style={{ marginTop: 8, fontSize: 16, color: '#6e655d' }}>{service.duration}</div>
            <div style={{ marginTop: 8, fontSize: 16, color: '#2e9746', fontWeight: 700 }}>
              📅 {date}
            </div>
            <div style={{ marginTop: 6, fontSize: 16, color: '#2e9746', fontWeight: 700 }}>
              🕒 {time}
            </div>
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
