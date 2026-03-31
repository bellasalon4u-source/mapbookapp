'use client';

import RealMap from '../components/RealMap';
import { getAllMasters } from '../services/masters';

export default function HomePage() {
  const masters = getAllMasters();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '24px 16px 100px',
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
      </div>
    </main>
  );
}
