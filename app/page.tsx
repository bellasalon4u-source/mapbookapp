import Link from 'next/link';
import { getAllMasters } from '../services/masters';

export default function HomePage() {
  const masters = getAllMasters();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '24px 16px 90px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#1d1712',
            margin: 0,
            lineHeight: 1,
          }}
        >
          MapBook
        </h1>

        <p
          style={{
            marginTop: '14px',
            fontSize: '18px',
            color: '#7a7065',
            lineHeight: 1.5,
          }}
        >
          Find beauty and wellness services near you
        </p>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '18px',
            alignItems: 'stretch',
          }}
        >
          <input
            type="text"
            placeholder="Search services, masters, area..."
            style={{
              flex: 1,
              border: '1px solid #eadfce',
              borderRadius: '18px',
              background: '#ffffff',
              padding: '14px 16px',
              fontSize: '16px',
              outline: 'none',
            }}
          />

          <button
            style={{
              border: 'none',
              borderRadius: '18px',
              background: '#2f241c',
              color: '#fff',
              padding: '0 16px',
              fontSize: '18px',
              minWidth: '50px',
            }}
          >
            🎤
          </button>

          <Link
            href="/favorites"
            style={{
              border: '1px solid #eadfce',
              borderRadius: '18px',
              background: '#ffffff',
              color: '#2f241c',
              padding: '14px 16px',
              fontSize: '18px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '50px',
            }}
          >
            ♥
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '14px',
          }}
        >
          {['Hair', 'Beauty', 'Massage', 'Nails', 'Brows', 'Makeup', 'Wellness'].map((category) => (
            <button
              key={category}
              style={{
                border: '1px solid #efe4d7',
                borderRadius: '999px',
                background: '#ffffff',
                padding: '10px 16px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#4e463d',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 800,
                color: '#1d1712',
              }}
            >
              Map view
            </h2>

            <button
              style={{
                border: '1px solid #efe4d7',
                borderRadius: '999px',
                background: '#ffffff',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#4e463d',
              }}
            >
              Filters
            </button>
          </div>

          <div
            style={{
              position: 'relative',
              height: '360px',
              overflow: 'hidden',
              borderRadius: '32px',
              border: '1px solid #e8dccb',
              background:
                'radial-gradient(circle at 20% 20%, #f6eee3 0%, #eadfce 45%, #e2d4c0 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '24px',
                top: '30px',
                background: '#2f241c',
                color: '#fff',
                borderRadius: '999px',
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              £45 · 4.9
            </div>

            <div
              style={{
                position: 'absolute',
                right: '28px',
                top: '84px',
                background: '#fff',
                color: '#2f241c',
                borderRadius: '999px',
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              £65 · 4.8
            </div>

            <div
              style={{
                position: 'absolute',
                left: '62px',
                bottom: '96px',
                background: '#d92f2f',
                color: '#fff',
                borderRadius: '999px',
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              Book now
            </div>

            <div
              style={{
                position: 'absolute',
                right: '24px',
                bottom: '48px',
                background: '#2f241c',
                color: '#fff',
                borderRadius: '999px',
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              £55 · 4.7
            </div>

            <div
              style={{
                position: 'absolute',
                left: '16px',
                right: '16px',
                bottom: '16px',
                borderRadius: '28px',
                border: '1px solid #efe4d7',
                background: 'rgba(255,255,255,0.96)',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#1d1712',
                    }}
                  >
                    Bella Keratin Studio
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '14px',
                      color: '#7a7065',
                    }}
                  >
                    Hair Extensions Specialist • London
                  </p>
                </div>

                <div
                  style={{
                    borderRadius: '14px',
                    background: '#edf7ee',
                    color: '#256b43',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ● Available now
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#2f241c',
                  }}
                >
                  from £45
                </p>

                <Link
                  href="/master/bella-keratin-studio"
                  style={{
                    borderRadius: '16px',
                    background: '#2f241c',
                    color: '#fff',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 800,
                color: '#1d1712',
              }}
            >
              Recommended
            </h2>

            <button
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontWeight: 700,
                color: '#7a7065',
              }}
            >
              View all
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {masters.map((master) => (
              <Link
                key={master.id}
                href={`/master/${master.id}`}
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: '28px',
                  border: '1px solid #efe4d7',
                  background: '#fff',
                  textDecoration: 'none',
                }}
              >
                <img
                  src={master.avatar}
                  alt={master.name}
                  style={{
                    width: '100%',
