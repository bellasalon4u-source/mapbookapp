'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

type DateStatus = 'available' | 'partial' | 'full';

type CalendarDay = {
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  status: DateStatus;
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateStatus(date: Date): DateStatus {
  const day = date.getDate();
  if (day % 5 === 0) return 'full';
  if (day % 2 === 0) return 'partial';
  return 'available';
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      iso: formatIso(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      status: getDateStatus(date),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({
      iso: formatIso(date),
      dayNumber: day,
      isCurrentMonth: true,
      status: getDateStatus(date),
    });
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - (startWeekday + daysInMonth) + 1;
    const date = new Date(year, month + 1, nextDay);
    days.push({
      iso: formatIso(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      status: getDateStatus(date),
    });
  }

  return days;
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';

  const today = new Date();
  const minYear = today.getFullYear();
  const maxYear = today.getFullYear() + 1;

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const service =
    master.services.find((item) => item.slug === serviceSlug) || master.services[0];

  const calendarDays = buildCalendarDays(selectedYear, selectedMonth);

  function goPrevMonth() {
    if (selectedYear === minYear && selectedMonth === 0) return;

    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  }

  function goNextMonth() {
    if (selectedYear === maxYear && selectedMonth === 11) return;

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  }

  function statusStyles(status: DateStatus, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      return {
        bg: '#f8f4ee',
        color: '#b3aba2',
        border: '1px solid #eee4d8',
      };
    }

    if (status === 'available') {
      return { bg: '#dff1e3', color: '#248345', border: '1px solid #cfe8d4' };
    }

    if (status === 'partial') {
      return { bg: '#ede7df', color: '#7c7368', border: '1px solid #e1d8cc' };
    }

    return { bg: '#f7e0e0', color: '#d13e3e', border: '1px solid #efcaca' };
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <button
              onClick={goPrevMonth}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #ddd2c6',
                background: '#fff',
                fontSize: 22,
              }}
            >
              ‹
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {monthNames[selectedMonth]} {selectedYear}
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1px solid #ddd2c6',
                    background: '#fff',
                    fontSize: 14,
                  }}
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1px solid #ddd2c6',
                    background: '#fff',
                    fontSize: 14,
                  }}
                >
                  {Array.from({ length: maxYear - minYear + 1 }).map((_, index) => {
                    const year = minYear + index;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              onClick={goNextMonth}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #ddd2c6',
                background: '#fff',
                fontSize: 22,
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
              marginBottom: 10,
            }}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#7a7066',
                  fontWeight: 700,
                  paddingBottom: 4,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
            }}
          >
            {calendarDays.map((day) => {
              const styles = statusStyles(day.status, day.isCurrentMonth);
              const disabled = !day.isCurrentMonth || day.status === 'full';

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
                    border: styles.border,
                    background: styles.bg,
                    color: styles.color,
                    borderRadius: 16,
                    minHeight: 54,
                    fontWeight: 800,
                    fontSize: 17,
                    opacity: disabled ? 0.8 : 1,
                  }}
                >
                  {day.dayNumber}
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
