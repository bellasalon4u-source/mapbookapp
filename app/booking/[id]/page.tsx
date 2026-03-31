'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

type DateStatus = 'available' | 'partial' | 'full';

type DayItem = {
  iso: string;
  label: number;
  weekday: string;
  status: DateStatus;
};

function buildMonthDays() {
  const today = new Date();
  const result: DayItem[] = [];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 35; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayNumber = date.getDate();
    let status: DateStatus = 'available';

    if (dayNumber % 5 === 0) status = 'full';
    else if (dayNumber % 2 === 0) status = 'partial';

    result.push({
      iso: date.toISOString().slice(0, 10),
      label: dayNumber,
      weekday: weekdays[date.getDay()],
      status,
    });
  }

  return result;
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';
  const monthDays = useMemo(() => buildMonthDays(), []);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const service =
    master.services.find((item) => item.slug === serviceSlug) || master.services[0];

  function statusStyles(status: DateStatus) {
    if (status === 'available') return { bg: '#dff1e3', color: '#248345' };
    if (status === 'partial') return { bg: '#ede7df', color: '#7c7368' };
    return { bg: '#f7e0e0', color: '#d13e3e' };
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 40,
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
            <div style={{ fontSize: 30, fontWeight: 800 }}>Choose date</div>
            <div style={{ marginTop: 8, color: '#7a7066' }}>{service.title}</div>
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
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Calendar</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 10,
            }}
          >
            {monthDays.map((day) => {
              const styles = statusStyles(day.status);
              const disabled = day.status === 'full';

              return (
                <button
                  key={day.iso}
                  disabled={disabled}
                  onClick={() =>
                    router.push(
                      `/booking/${master.id}/time?service=${service.slug}&date=${day.iso}`
                    )
                  }
                  style={{
                    border: 'none',
                    background: styles.bg,
                    color: styles.color,
                    borderRadius: 18,
                    minHeight: 64,
                    padding: 8,
                    fontWeight: 800,
                    opacity: disabled ? 0.95 : 1,
                  }}
                >
                  <div style={{ fontSize: 12 }}>{day.weekday}</div>
                  <div style={{ fontSize: 20, marginTop: 6 }}>{day.label}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 16, color: '#756b61', fontSize: 15 }}>
            <span>🟢 Free</span>
            <span>⚪ Partial</span>
            <span>🔴 Full</span>
          </div>
        </div>
      </div>
    </main>
  );
}
