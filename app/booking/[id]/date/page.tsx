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

  { dayNumber: 2, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Tue', status: 'free' },
  { dayNumber: 6, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Sat', status: 'partial' },
  { dayNumber: 11, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Thu', status: 'free' },
  { dayNumber: 17, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Wed', status: 'full' },
  { dayNumber: 21, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Sun', status: 'free' },
  { dayNumber: 26, monthKey: '2026-06', monthLabel: 'Jun', weekday: 'Fri', status: 'partial' },

  { dayNumber: 1, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Wed', status: 'free' },
  { dayNumber: 5, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Sun', status: 'partial' },
  { dayNumber: 9, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Thu', status: 'free' },
  { dayNumber: 15, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Wed', status: 'full' },
  { dayNumber: 20, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Mon', status: 'free' },
  { dayNumber: 28, monthKey: '2026-07', monthLabel: 'Jul', weekday: 'Tue', status: 'partial' },
];

const monthLabels: Record<string, string> = {
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
  '2026-06': 'June 2026',
  '2026-07': 'July 2026',
};

const monthOrder = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];

function getStatusStyles(status: DateStatus, active: boolean) {
  if (active) {
    return {
      background: '#17a34a',
      color: '#ffffff',
      border: '2px solid #17a34a',
      boxShadow: '0 10px 22px rgba(23,163,74,0.25)',
    };
  }

  if (status === 'free') {
    return {
      background: '#dff8e7',
      color: '#15803d',
      border: '1px solid #9fe0b2',
    };
  }

  if (status === 'partial') {
    return {
      background: '#fff1bf',
      color: '#b77906',
      border: '1px solid #f3cf5f',
    };
  }

  return {
    background: '#ffd8dc',
    color: '#d62839',
    border: '1px solid #f2a7b0',
  };
}

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

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const servicesParam = searchParams.get('services') || '';

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master
    ? master.services.filter((service) => selectedServiceSlugs.includes(service.slug))
    : [];

  const [activeMonthIndex, setActiveMonthIndex] = useState(1);
  const [selectedDayKey, setSelectedDayKey] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!master || !selectedItems.length) {
    return <main style={{ padding: 24 }}>Booking data not found</main>;
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

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
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>Selected services</div>

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
                  <div style={{ marginTop: 4, color: '#746b62', fontSize: 14 }}>{item.duration}</div>
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
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px 42px',
              gap: 10,
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

            <div style={{ fontSize: 24, fontWeight: 800, textAlign: 'center' }}>
              {monthLabels[activeMonthKey]}
            </div>

            <button
              onClick={() => setPickerOpen((prev) => !prev)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background: '#fff',
                fontSize: 20,
              }}
            >
              📅
            </button>

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

          {pickerOpen && (
            <div
              style={{
                marginTop: 14,
                background: '#fffaf2',
                border: '1px solid #eadfce',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
                Choose month
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {monthOrder.map((monthKey, index) => {
                  const active = activeMonthIndex === index;

                  return (
                    <button
                      key={monthKey}
                      onClick={() => {
                        setActiveMonthIndex(index);
                        setPickerOpen(false);
                      }}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 18,
                        border: active ? '2px solid #17a34a' : '1px solid #e4d8ca',
                        background: active ? '#e6f8ec' : '#fff',
                        color: '#1d1712',
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {monthLabels[monthKey]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                    opacity: disabled ? 0.8 : 1,
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
                  background: '#dff8e7',
                  border: '1px solid #9fe0b2',
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
                  background: '#fff1bf',
                  border: '1px solid #f3cf5f',
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
                  background: '#ffd8dc',
                  border: '1px solid #f2a7b0',
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

              const servicesEncoded = encodeURIComponent(selectedServiceSlugs.join(','));
              router.push(
                `/booking/${master.id}/time?services=${servicesEncoded}&date=${selectedDay.dayNumber}%20${selectedDay.monthLabel}`
              );
            }}
            style={{
              border: 'none',
              background: selectedDay ? '#17a34a' : '#b7d9bf',
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
