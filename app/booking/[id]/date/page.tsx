'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

type DateStatus = 'free' | 'partial' | 'full';

type CalendarDay = {
  dayNumber: number;
  monthKey: string;
  monthLabel: string;
  weekday: string;
  status: DateStatus;
};

const calendarDays: CalendarDay[] = [
  { dayNumber: 24, monthKey: '2026-03', monthLabel: 'Mar', weekday: 'Tue', status: 'free' },
  { dayNumber: 27, monthKey: '2026-03', monthLabel: 'Mar', weekday: 'Fri', status: 'partial' },
  { dayNumber: 30, monthKey: '2026-03', monthLabel: 'Mar', weekday: 'Mon', status: 'free' },

  { dayNumber: 2, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Thu', status: 'partial' },
  { dayNumber: 5, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Sun', status: 'full' },
  { dayNumber: 8, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Wed', status: 'free' },
  { dayNumber: 12, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Sun', status: 'free' },
  { dayNumber: 15, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Wed', status: 'partial' },
  { dayNumber: 18, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Sat', status: 'free' },
  { dayNumber: 22, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Wed', status: 'full' },
  { dayNumber: 24, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Fri', status: 'free' },
  { dayNumber: 29, monthKey: '2026-04', monthLabel: 'Apr', weekday: 'Wed', status: 'partial' },

  { dayNumber: 3, monthKey: '2026-05', monthLabel: 'May', weekday: 'Sun', status: 'free' },
  { dayNumber: 6, monthKey: '2026-05', monthLabel: 'May', weekday: 'Wed', status: 'partial' },
  { dayNumber: 10, monthKey: '2026-05', monthLabel: 'May', weekday: 'Sun', status: 'free' },
  { dayNumber: 14, monthKey: '2026-05', monthLabel: 'May', weekday: 'Thu', status: 'partial' },
  { dayNumber: 19, monthKey: '2026-05', monthLabel: 'May', weekday: 'Tue', status: 'free' },
  { dayNumber: 23, monthKey: '2026-05', monthLabel: 'May', weekday: 'Sat', status: 'full' },
  { dayNumber: 28, monthKey: '2026-05', monthLabel: 'May', weekday: 'Thu', status: 'free' },
];

const monthLabels: Record<string, string> = {
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
};

const monthOrder = ['2026-03', '2026-04', '2026-05'];

function getStatusStyles(status: DateStatus, active: boolean) {
  if (active) {
    return {
      background: '#2e9746',
      color: '#fff',
      border: '2px solid #2e9746',
    };
  }

  if (status === 'free') {
    return {
      background: '#eff8f1',
      color: '#248345',
      border: '1px solid #cfe6d5',
    };
  }

  if (status === 'partial') {
    return {
      background: '#f8f1e5',
      color: '#9b6a18',
      border: '1px solid #ead8b5',
    };
  }

  return {
    background: '#f4dede',
    color: '#c94848',
    border: '1px solid #ebc4c4',
  };
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';

  const service =
    master?.services.find((item) => item.slug === serviceSlug) || master?.services[0] || null;

  const [activeMonthIndex, setActiveMonthIndex] = useState(1);
  const [selectedDayKey, setSelectedDayKey] = useState('');

  if (!master || !service) {
    return <main style={{ padding: 24 }}>Booking data not found</main>;
  }

  const activeMonthKey = monthOrder[activeMonthIndex];
  const activeMonthDays = calendarDays.filter((day) => day.monthKey === activeMonthKey);

  const selectedDay =
    calendarDays.find((day) => `${day.monthKey}-${day.dayNumber}` === selectedDayKey) || null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>Choose date</div>

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
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '84px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <img
            src={service.image}
            alt={service.title}
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              objectFit: 'cover',
            }}
          />

          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{service.title}</div>
            <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>{service.duration}</div>
            <div style={{ marginTop: 8, fontSize: 17, fontWeight: 800 }}>£{service.price}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              disabled={activeMonthIndex === 0}
              onClick={() => setActiveMonthIndex((prev) => Math.max(prev - 1, 0))}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background: activeMonthIndex === 0 ? '#f3eee7' : '#fff',
                color: activeMonthIndex === 0 ? '#b5aba0' : '#1d1712',
                fontSize: 22,
              }}
            >
              ‹
            </button>

            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {monthLabels[activeMonthKey]}
            </div>

            <button
              disabled={activeMonthIndex === monthOrder.length - 1}
              onClick={() =>
                setActiveMonthIndex((prev) => Math.min(prev + 1, monthOrder.length - 1))
              }
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background:
                  activeMonthIndex === monthOrder.length - 1 ? '#f3eee7' : '#fff',
                color:
                  activeMonthIndex === monthOrder.length - 1 ? '#b5aba0' : '#1d1712',
                fontSize: 22,
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {activeMonthDays.map((day) => {
              const key = `${day.monthKey}-${day.dayNumber}`;
              const active = selectedDayKey === key;
              const disabled = day.status === 'full';
              const styles = getStatusStyles(day.status, active);

              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedDayKey(key);
                  }}
                  style={{
                    borderRadius: 20,
                    padding: '14px 10px',
                    textAlign: 'center',
                    opacity: disabled ? 0.72 : 1,
                    ...styles,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{day.weekday}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                    {day.dayNumber}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                    {day.monthLabel}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              marginTop: 16,
              fontSize: 14,
              color: '#6d645c',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#eff8f1',
                  border: '1px solid #cfe6d5',
                  display: 'inline-block',
                }}
              />
              Free
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#f8f1e5',
                  border: '1px solid #ead8b5',
                  display: 'inline-block',
                }}
              />
              Partial
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#f4dede',
                  border: '1px solid #ebc4c4',
                  display: 'inline-block',
                }}
              />
              Full
            </div>
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
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>
              Selected date
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
              {selectedDay
                ? `${selectedDay.dayNumber} ${selectedDay.monthLabel}`
                : 'Not selected'}
            </div>
          </div>

          <button
            disabled={!selectedDay}
            onClick={() => {
              if (!selectedDay) return;

              router.push(
                `/booking/${master.id}/time?service=${service.slug}&date=${selectedDay.dayNumber}%20${selectedDay.monthLabel}`
              );
            }}
            style={{
              border: 'none',
              background: selectedDay ? '#2e9746' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Choose time
          </button>
        </div>
      </div>
    </main>
  );
}
