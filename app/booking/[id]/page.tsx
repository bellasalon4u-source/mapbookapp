'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getMasterById } from '../../../services/masters';

type Props = {
  params: {
    id: string;
  };
};

const dates = [
  'Mon 25',
  'Tue 26',
  'Wed 27',
  'Thu 28',
  'Fri 29',
  'Sat 30',
];

const times = ['09:00', '10:30', '12:00', '14:00', '16:30', '18:00'];

export default function BookingPage({ params }: Props) {
  const master = useMemo(() => getMasterById(params.id), [params.id]);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState('10:30');
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
          <a
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
          </a>
        </div>
      </main>
    );
  }

  const isValid =
    selectedDate.trim() !== '' &&
    selectedTime.trim() !== '' &&
    fullName.trim() !== '' &&
    phone.trim() !== '' &&
    email.trim() !== '';

  const confirmHref = isValid ? '/booking-success' : '#';

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
            }}
          >
            ←
          </Link>

          <div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Book appointment</div>
            <div style={{ color: '#786d61', marginTop: 4 }}>{master.name}</div>
          </div>
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
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Choose date</h2>

          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              marginTop: 16,
              paddingBottom: 8,
            }}
          >
            {dates.map((date) => {
              const active = selectedDate === date;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    minWidth: 92,
                    borderRadius: 24,
                    padding: '18px 16px',
                    border: active ? '1px solid #2f241c' : '1px solid #eadfd2',
                    background: active ? '#2f241c' : '#fff',
                    color: active ? '#fff' : '#4e463d',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {date.split(' ')[0]}
                  <br />
                  {date.split(' ')[1]}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Choose time</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              marginTop: 16,
            }}
          >
            {times.map((time) => {
              const active = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  style={{
                    borderRadius: 22,
                    padding: '18px 10px',
                    border: active ? '1px solid #e52323' : '1px solid #eadfd2',
                    background: active ? '#e52323' : '#fff',
                    color: active ? '#fff' : '#4e463d',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {time}
                </button>
              );
            })}
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
              <strong style={{ color: '#1d1712' }}>{master.services[0]?.title || 'Appointment'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Date</span>
              <strong style={{ color: '#1d1712' }}>{selectedDate}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Time</span>
              <strong style={{ color: '#1d1712' }}>{selectedTime}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Secure booking fee</span>
              <strong style={{ color: '#1d1712' }}>£5</strong>
            </div>
          </div>
        </section>
      </div>

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

          <a
            href={confirmHref}
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
              pointerEvents: 'auto',
            }}
          >
            Confirm booking
          </a>
        </div>
      </div>
    </main>
  );
}
