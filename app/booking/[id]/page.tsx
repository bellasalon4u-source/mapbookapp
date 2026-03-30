'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getMasterById } from '../../../services/masters';

type Props = {
  params: {
    id: string;
  };
};

type DayState = 'free' | 'partial' | 'full';
type SlotState = 'free' | 'busy';

type CalendarDay = {
  id: string;
  dayNumber: number;
  weekDay: string;
  monthLabel: string;
  state: DayState;
  slots: { time: string; state: SlotState }[];
};

const calendarDays: CalendarDay[] = [
  {
    id: '2026-03-26',
    dayNumber: 26,
    weekDay: 'Thu',
    monthLabel: 'Mar',
    state: 'full',
    slots: [
      { time: '09:00', state: 'busy' },
      { time: '10:30', state: 'busy' },
      { time: '12:00', state: 'busy' },
      { time: '14:00', state: 'busy' },
      { time: '16:30', state: 'busy' },
      { time: '18:00', state: 'busy' },
    ],
  },
  {
    id: '2026-03-27',
    dayNumber: 27,
    weekDay: 'Fri',
    monthLabel: 'Mar',
    state: 'partial',
    slots: [
      { time: '09:00', state: 'busy' },
      { time: '10:30', state: 'free' },
      { time: '12:00', state: 'busy' },
      { time: '14:00', state: 'free' },
      { time: '16:30', state: 'free' },
      { time: '18:00', state: 'busy' },
    ],
  },
  {
    id: '2026-03-28',
    dayNumber: 28,
    weekDay: 'Sat',
    monthLabel: 'Mar',
    state: 'free',
    slots: [
      { time: '09:00', state: 'free' },
      { time: '10:30', state: 'free' },
      { time: '12:00', state: 'free' },
      { time: '14:00', state: 'free' },
      { time: '16:30', state: 'free' },
      { time: '18:00', state: 'free' },
    ],
  },
  {
    id: '2026-03-29',
    dayNumber: 29,
    weekDay: 'Sun',
    monthLabel: 'Mar',
    state: 'partial',
    slots: [
      { time: '09:00', state: 'busy' },
      { time: '10:30', state: 'busy' },
      { time: '12:00', state: 'free' },
      { time: '14:00', state: 'free' },
      { time: '16:30', state: 'busy' },
      { time: '18:00', state: 'free' },
    ],
  },
  {
    id: '2026-03-30',
    dayNumber: 30,
    weekDay: 'Mon',
    monthLabel: 'Mar',
    state: 'free',
    slots: [
      { time: '09:00', state: 'free' },
      { time: '10:30', state: 'free' },
      { time: '12:00', state: 'free' },
      { time: '14:00', state: 'busy' },
      { time: '16:30', state: 'free' },
      { time: '18:00', state: 'free' },
    ],
  },
  {
    id: '2026-03-31',
    dayNumber: 31,
    weekDay: 'Tue',
    monthLabel: 'Mar',
    state: 'full',
    slots: [
      { time: '09:00', state: 'busy' },
      { time: '10:30', state: 'busy' },
      { time: '12:00', state: 'busy' },
      { time: '14:00', state: 'busy' },
      { time: '16:30', state: 'busy' },
      { time: '18:00', state: 'busy' },
    ],
  },
];

function dayColors(state: DayState, active: boolean) {
  if (active) {
    return {
      background: '#2f241c',
      color: '#ffffff',
      border: '1px solid #2f241c',
    };
  }

  if (state === 'free') {
    return {
      background: '#edf7ee',
      color: '#256b43',
      border: '1px solid #cfe8d3',
    };
  }

  if (state === 'partial') {
    return {
      background: '#f3f1ec',
      color: '#6d6257',
      border: '1px solid #ddd5c9',
    };
  }

  return {
    background: '#fdecec',
    color: '#c53434',
    border: '1px solid #f1caca',
  };
}

function slotColors(active: boolean, state: SlotState) {
  if (active) {
    return {
      background: '#e52323',
      color: '#ffffff',
      border: '1px solid #e52323',
    };
  }

  if (state === 'busy') {
    return {
      background: '#fdecec',
      color: '#c53434',
      border: '1px solid #f1caca',
    };
  }

  return {
    background: '#ffffff',
    color: '#4e463d',
    border: '1px solid #eadfd2',
  };
}

export default function BookingPage({ params }: Props) {
  const master = useMemo(() => getMasterById(params.id), [params.id]);
  const firstSelectableDay =
    calendarDays.find((day) => day.state !== 'full') || calendarDays[0];

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(firstSelectableDay.id);
  const [selectedTime, setSelectedTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!master) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#fcf8f2',
          padding: '24px 16px',
          fontFamily: 'Arial, sans-serif',
          color: '#1d1712',
        }}
      >
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Master not found</h1>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 16,
              textDecoration: 'none',
              background: '#2f241c',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const selectedDay =
    calendarDays.find((day) => day.id === selectedDayId) || firstSelectableDay;

  const isValid =
    selectedDayId.trim() !== '' &&
    selectedTime.trim() !== '' &&
    fullName.trim() !== '' &&
    phone.trim() !== '' &&
    email.trim() !== '';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '24px 16px 120px',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href={`/master/${master.id}`}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: '#1d1712',
                border: '1px solid #e6ddd1',
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ←
            </Link>

            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>Book appointment</div>
              <div style={{ color: '#786d61', marginTop: 4 }}>{master.name}</div>
            </div>
          </div>

          <Link
            href="/"
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#1d1712',
              border: '1px solid #e6ddd1',
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ⌂
          </Link>
        </div>

        <div
          style={{
            marginTop: 20,
            background: '#fff',
            borderRadius: 26,
            border: '1px solid #eadfd2',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <img
            src={master.avatar}
            alt={master.name}
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              objectFit: 'cover',
              display: 'block',
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{master.name}</div>
            <div style={{ color: '#786d61', marginTop: 4 }}>
              {master.title} • {master.city}
            </div>
          </div>

          <div
            style={{
              background: '#f2e9dc',
              color: '#463b31',
              padding: '10px 12px',
              borderRadius: 14,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {master.rating} ★
          </div>
        </div>

        <section style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>📅</span>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Choose date</h2>
          </div>

          <div
            style={{
              marginTop: 16,
              background: '#fff',
              borderRadius: 26,
              border: '1px solid #eadfd2',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 14, color: '#786d61', fontWeight: 700 }}>
              Tap calendar to view available dates
            </div>

            <button
              onClick={() => setCalendarOpen(true)}
              style={{
                width: '100%',
                marginTop: 14,
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 800,
                color: '#1d1712',
              }}
            >
              <span>
                {selectedDay.weekDay} {selectedDay.dayNumber} {selectedDay.monthLabel}
              </span>
              <span style={{ fontSize: 20 }}>⌄</span>
            </button>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                fontSize: 13,
                color: '#786d61',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: '#edf7ee',
                    border: '1px solid #cfe8d3',
                    display: 'inline-block',
                  }}
                />
                Free
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: '#f3f1ec',
                    border: '1px solid #ddd5c9',
                    display: 'inline-block',
                  }}
                />
                Partial
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: '#fdecec',
                    border: '1px solid #f1caca',
                    display: 'inline-block',
                  }}
                />
                Full
              </span>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🕒</span>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Choose time</h2>
          </div>

          <div
            style={{
              marginTop: 16,
              background: '#fff',
              borderRadius: 26,
              border: '1px solid #eadfd2',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 14, color: '#786d61', fontWeight: 700 }}>
              Red = busy, light = free
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                marginTop: 16,
              }}
            >
              {selectedDay.slots.map((slot) => {
                const active = selectedTime === slot.time;
                const busy = slot.state === 'busy';
                const colors = slotColors(active, slot.state);

                return (
                  <button
                    key={slot.time}
                    disabled={busy}
                    onClick={() => setSelectedTime(slot.time)}
                    style={{
                      borderRadius: 22,
                      padding: '18px 10px',
                      fontWeight: 800,
                      fontSize: 16,
                      opacity: busy ? 0.95 : 1,
                      ...colors,
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Your details</h2>

          <div
            style={{
              marginTop: 16,
              background: '#fff',
              borderRadius: 26,
              border: '1px solid #eadfd2',
              padding: 16,
            }}
          >
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: 28,
            background: '#fff',
            borderRadius: 26,
            border: '1px solid #eadfd2',
            padding: 16,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Booking summary</h2>

          <div style={{ marginTop: 16, display: 'grid', gap: 12, color: '#5f564d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Service</span>
              <strong style={{ color: '#1d1712' }}>
                {master.services[0]?.title || 'Appointment'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Date</span>
              <strong style={{ color: '#1d1712' }}>
                {selectedDay.weekDay} {selectedDay.dayNumber} {selectedDay.monthLabel}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Time</span>
              <strong style={{ color: '#1d1712' }}>
                {selectedTime || 'Not selected'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Secure booking fee</span>
              <strong style={{ color: '#1d1712' }}>£5</strong>
            </div>
          </div>
        </section>
      </div>

      {calendarOpen && (
        <div
          onClick={() => setCalendarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#fff',
              borderRadius: 28,
              padding: 20,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800 }}>Select available date</div>
              <button
                onClick={() => setCalendarOpen(false)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: '1px solid #e6ddd1',
                  background: '#fff',
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, textAlign: 'center' }}>Mar ’26</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 8,
                marginTop: 18,
                color: '#7b7268',
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 10,
                marginTop: 16,
              }}
            >
              <div />
              <div />
              <div />
              {calendarDays.map((day) => {
                const active = selectedDayId === day.id;
                const colors = dayColors(day.state, active);
                const disabled = day.state === 'full';

                return (
                  <button
                    key={day.id}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedDayId(day.id);
                      setSelectedTime('');
                      setCalendarOpen(false);
                    }}
                    style={{
                      height: 64,
                      borderRadius: 18,
                      fontWeight: 800,
                      fontSize: 24,
                      ...colors,
                    }}
                  >
                    {day.dayNumber}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1712' }}>
                {selectedDay.weekDay} {selectedDay.dayNumber} {selectedDay.monthLabel}
              </div>

              <div
                style={{
                  background: '#f2f2f2',
                  color: '#1d1712',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                {selectedTime || 'Choose time below'}
              </div>
            </div>

            <button
              onClick={() => setCalendarOpen(false)}
              style={{
                width: '100%',
                marginTop: 18,
                background: '#2f36d3',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px 18px',
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fffdf9',
          borderTop: '1px solid #eadfd2',
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div style={{ color: '#786d61', fontWeight: 700, fontSize: 14 }}>To confirm</div>
            <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginTop: 6 }}>£5</div>
          </div>

          <Link
            href={isValid ? '/booking-success' : '#'}
            onClick={(e) => {
              if (!isValid) e.preventDefault();
            }}
            style={{
              minWidth: 220,
              textAlign: 'center',
              textDecoration: 'none',
              padding: '22px 20px',
              borderRadius: 22,
              background: isValid ? '#e52323' : '#efc3c3',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Confirm booking
          </Link>
        </div>
      </div>
    </main>
  );
}
