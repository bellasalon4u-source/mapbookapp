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

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const servicesParam = searchParams.get('services') || '';
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

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master.services.filter((service) =>
    selectedServiceSlugs.includes(service.slug)
  );

  if (!selectedItems.length) {
    return <main style={{ padding: 24 }}>Selected services not found</main>;
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
          <div style={{ fontSize: 22, fontWeight: 800 }}>Selected procedures</div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
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
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 14,
                  }}
                />

                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ marginTop: 4, color: '#746b62', fontSize: 14 }}>
                    {item.duration}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800 }}>£{item.price}</div>
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
            Date: {date}
            <br />
            Time: {time}
            <br />
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
                `/booking/${master.id}/confirmed?services=${encodeURIComponent(
                  selectedServiceSlugs.join(',')
                )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
                  time
                )}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
                  lastName
                )}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(
                  email
                )}&social=${encodeURIComponent(social)}`
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
