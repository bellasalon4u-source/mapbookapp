'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getMasterById } from '../../../services/masters';

type Props = {
  params: {
    id: string;
  };
};

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export default function BookingPage({ params }: Props) {
  const master = useMemo(() => getMasterById(params.id), [params.id]);

  const [selectedDate, setSelectedDate] = useState('');
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
            <label
              style={{
                display: 'block',
                fontSize: 14,
                color: '#786d61',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Select date from calendar
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />

            {selectedDate && (
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-block',
                  background: '#2f241c',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '10px 14px',
                  fontWeight: 800,
                }}
              >
                {formatDate(selectedDate)}
              </div>
            )}
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
            <label
              style={{
                display: 'block',
                fontSize: 14,
                color: '#786d61',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Select time
            </label>

            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 18,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />

            {selectedTime && (
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-block',
                  background: '#e52323',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '10px 14px',
                  fontWeight: 800,
                }}
              >
                {selectedTime}
              </div>
            )}
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
                {selectedDate ? formatDate(selectedDate) : 'Not selected'}
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
