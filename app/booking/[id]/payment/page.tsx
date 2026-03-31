'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const phone = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const social = searchParams.get('social') || '';

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
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
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
              background: '#fff',
              fontSize: 24,
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Hold deposit</div>
            <div style={{ marginTop: 8, color: '#7a7066' }}>£5 hold deposit</div>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
              background: '#fff',
              fontSize: 22,
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 28,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{service.title}</div>
          <div style={{ marginTop: 10, color: '#6f655b', fontSize: 16 }}>
            {date} • {time}
          </div>

          <div
            style={{
              marginTop: 18,
              background: '#e0f2e3',
              color: '#1f6d35',
              borderRadius: 22,
              padding: 18,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            £5 will be temporarily held on your card.
            <br />
            You will only be charged after the seller confirms your appointment.
          </div>

          <div
            style={{
              marginTop: 18,
              background: '#f8f4ee',
              color: '#5e554d',
              borderRadius: 22,
              padding: 18,
              lineHeight: 1.6,
            }}
          >
            Customer: {firstName} {lastName}
            <br />
            Phone: {phone}
            <br />
            Email: {email || '—'}
            <br />
            Social: {social || '—'}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #e6ddd1',
          padding: '14px 16px',
        }}
      >
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>Secure booking fee</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>£5</div>
          </div>
          <button
            onClick={() =>
              router.push(
                `/booking/${master.id}/confirmed?service=${service.slug}&date=${date}&time=${time}&firstName=${encodeURIComponent(
                  firstName
                )}&lastName=${encodeURIComponent(lastName)}&phone=${encodeURIComponent(
                  phone
                )}&email=${encodeURIComponent(email)}&social=${encodeURIComponent(social)}`
              )
            }
            style={{
              border: 'none',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Hold £5 deposit
          </button>
        </div>
      </div>
    </main>
  );
}
