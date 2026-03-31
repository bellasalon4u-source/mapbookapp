'use client';

import { useRouter } from 'next/navigation';

const bookings = [
  {
    id: '1',
    master: 'Bella Keratin Studio',
    service: 'Keratin Bonds',
    date: '2026-04-24',
    time: '12:00',
    status: 'Confirmed',
  },
  {
    id: '2',
    master: 'Camden Brows Bar',
    service: 'Brow Lamination',
    date: '2026-04-27',
    time: '15:30',
    status: 'Pending',
  },
];

export default function BookingsPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>My bookings</div>

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                background: '#fff',
                border: '1px solid #e4d8ca',
                borderRadius: 24,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800 }}>{booking.service}</div>
              <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>
                {booking.master}
              </div>
              <div style={{ marginTop: 12, fontWeight: 700 }}>
                {booking.date} • {booking.time}
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: booking.status === 'Confirmed' ? '#dff1e3' : '#f6ead7',
                  color: booking.status === 'Confirmed' ? '#248345' : '#9a6a21',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {booking.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
