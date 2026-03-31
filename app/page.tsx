'use client';

import { useState } from 'react';
import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

type ReminderOption = '1 hour before' | '3 hours before' | '1 day before' | '2 days before';

type BookingItem = {
  id: string;
  master: string;
  service: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending';
  reminder: ReminderOption;
};

export default function HomePage() {
  const masters = getAllMasters();

  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 'b1',
      master: 'Bella Keratin Studio',
      service: 'Keratin Bonds',
      date: '2026-04-24',
      time: '12:00',
      status: 'Confirmed',
      reminder: '1 hour before',
    },
    {
      id: 'b2',
      master: 'Camden Brows Bar',
      service: 'Brow Lamination',
      date: '2026-04-27',
      time: '15:30',
      status: 'Pending',
      reminder: '1 day before',
    },
  ]);

  function updateReminder(id: string, reminder: ReminderOption) {
    setBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reminder } : item))
    );
  }

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
        <h1 style={{ fontSize: 52, margin: 0, fontWeight: 800 }}>MapBook</h1>

        <p style={{ fontSize: 20, color: '#6f655b', marginTop: 14 }}>
          Find beauty and wellness services near you
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search services, masters, area..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 46px',
                borderRadius: 16,
                border: '1px solid #d8cfc3',
                fontSize: 16,
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 18,
                color: '#786d61',
              }}
            >
              🔍
            </span>
          </div>

          <button
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid #d8cfc3',
              background: '#fff',
              minWidth: 56,
              fontSize: 20,
            }}
          >
            ♥
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {[
            'Wellness',
            'Beauty',
            'Sport',
            'Food',
            'Education',
            'Transport',
            'Repair',
            'Cleaning',
            'Pets',
            'Other',
          ].map((item) => (
            <span
              key={item}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: '#fff',
                border: '1px solid #e6ddd1',
                fontWeight: 700,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Map view</h2>
          <div style={{ marginTop: 12 }}>
            <RealMap masters={masters} />
          </div>
        </section>

        <section style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>My bookings</h2>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e4d8ca',
                  borderRadius: 24,
                  padding: 16,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{booking.service}</div>
                    <div style={{ marginTop: 8, fontSize: 16, color: '#746b62' }}>
                      {booking.master}
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        booking.status === 'Confirmed' ? '#dff1e3' : '#f6ead7',
                      color:
                        booking.status === 'Confirmed' ? '#248345' : '#9a6a21',
                      borderRadius: 999,
                      padding: '8px 12px',
                      fontWeight: 800,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {booking.status}
                  </div>
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
                      background: '#faf6f0',
                      borderRadius: 18,
                      padding: 12,
                    }}
                  >
                    <div style={{ color: '#7a7066', fontSize: 14, fontWeight: 700 }}>
                      Date
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>
                      {booking.date}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#faf6f0',
                      borderRadius: 18,
                      padding: 12,
                    }}
                  >
                    <div style={{ color: '#7a7066', fontSize: 14, fontWeight: 700 }}>
                      Time
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>
                      {booking.time}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 15,
                      color: '#6c645c',
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Reminder
                  </div>

                  <select
                    value={booking.reminder}
                    onChange={(e) =>
                      updateReminder(booking.id, e.target.value as ReminderOption)
                    }
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 16,
                      border: '1px solid #ddd2c6',
                      background: '#fff',
                      fontSize: 16,
                    }}
                  >
                    <option>1 hour before</option>
                    <option>3 hours before</option>
                    <option>1 day before</option>
                    <option>2 days before</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
