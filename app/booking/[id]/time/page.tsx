'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

function buildTimeSlots(date: string) {
  const slots = ['09:00', '10:30', '12:00', '14:00', '15:30', '16:00', '16:30', '17:00'];

  return slots.map((time, index) => {
    const unavailable = !date || index % 3 === 0;
    return {
      time,
      available: !unavailable,
    };
  });
}

export default function BookingTimePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const [selectedTime, setSelectedTime] = useState('');

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const service =
    master.services.find((item) => item.slug === serviceSlug) || master.services[0];

  const timeSlots = buildTimeSlots(date);

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
            <div style={{ fontSize: 30, fontWeight: 800 }}>Choose time</div>
            <div style={{ marginTop: 8, color: '#7a7066' }}>{date}</div>
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
            borderRadius: 26,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '90px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <img
            src={service.image}
            alt={service.title}
            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 18 }}
          />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{service.title}</div>
            <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>{service.duration}</div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>£{service.price}</div>
          </div>
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
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Available time</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                style={{
                  border: selectedTime === slot.time ? '2px solid #1f6d35' : '1px solid #ddd2c6',
                  background: !slot.available
                    ? '#f7dede'
                    : selectedTime === slot.time
                    ? '#2e9746'
                    : '#e0f2e3',
                  color: !slot.available
                    ? '#cf3f3f'
                    : selectedTime === slot.time
                    ? '#fff'
                    : '#1f6d35',
                  borderRadius: 18,
                  padding: '16px 14px',
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {slot.time}
              </button>
            ))}
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
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>Selected date</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{date || 'Not selected'}</div>
          </div>
          <button
            disabled={!selectedTime}
            onClick={() =>
              router.push(
                `/booking/${master.id}/details?service=${service.slug}&date=${date}&time=${selectedTime}`
              )
            }
            style={{
              border: 'none',
              background: selectedTime ? '#2e9746' : '#b8d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
