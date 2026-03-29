import Link from 'next/link';
import { getAllMasters } from '../services/masters';
import { categories } from '../lib/data';

export default function HomePage() {
  const masters = getAllMasters();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        padding: '24px 16px 90px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 56,
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
            marginTop: 14,
            fontSize: 18,
            color: '#7a7065',
            lineHeight: 1.5,
          }}
        >
          Find beauty and wellness services near you
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 18,
            alignItems: 'stretch',
          }}
        >
          <input
            type="text"
            placeholder="Search services, masters, area..."
            style={{
              flex: 1,
              border: '1px solid #eadfce',
              borderRadius: 18,
              background: '#ffffff',
              padding: '14px 16px',
              fontSize: 16,
              outline: 'none',
            }}
          />

          <button
            style={{
              border: 'none',
              borderRadius: 18,
              background: '#2f241c',
              color: '#fff',
              padding: '0 16px',
              fontSize: 18,
              minWidth: 50,
            }}
          >
            🎤
          </button>

          <Link
            href="/favorites"
            style={{
              border: '1px solid #eadfce',
              borderRadius: 18,
              background: '#ffffff',
              color: '#2f241c',
              padding: '14px 16px',
              fontSize: 18,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50,
            }}
          >
            ♥
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 8,
            marginTop: 14,
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              style={{
                whiteSpace: 'nowrap',
                border: '1px solid #efe4d7',
                borderRadius: 999,
                background: '#ffffff',
                padding: '10px 16px',
                fontSize: 15,
                fontWeight: 700,
                color: '#4e463d',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: '#1d1712',
              }}
            >
              Map view
            </h2>

            <button
              style={{
                border: '1px solid #efe4d7',
                borderRadius: 999,
                background: '#ffffff',
                padding: '10px 16px',
                fontSize: 14,
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
              height: 360,
              overflow: 'hidden',
              borderRadius: 32,
              border: '1px solid #e8dccb',
              background:
                'radial-gradient(circle at 20% 20%, #f6eee3 0%, #eadfce 45%, #e2d4c0 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '8%',
                top: '16%',
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                filter: 'blur(20px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '12%',
                top: '28%',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                filter: 'blur(20px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '20%',
                bottom: '18%',
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                filter: 'blur(20px)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 24,
                top: 30,
                background: '#2f241c',
                color: '#fff',
                borderRadius: 999,
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
              }}
            >
              £45 · 4.9
            </div>

            <div
              style={{
                position: 'absolute',
                right: 28,
                top: 84,
                background: '#fff',
                color: '#2f241c',
                borderRadius: 999,
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
              }}
            >
              £65 · 4.8
            </div>

            <div
              style={{
                position: 'absolute',
                left: 62,
                bottom: 96,
                background: '#d92f2f',
                color: '#fff',
                borderRadius: 999,
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
              }}
            >
              Book now
            </div>

            <div
              style={{
                position: 'absolute',
                right: 24,
                bottom: 48,
                background: '#2f241c',
                color: '#fff',
                borderRadius: 999,
                padding: '10px 14px',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
              }}
            >
              £55 · 4.7
            </div>

            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 16,
                borderRadius: 28,
                border: '1px solid #efe4d7',
                background: 'rgba(255,255,255,0.96)',
                padding: 16,
                backdropFilter: 'blur(6px)',
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
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#1d1712',
                    }}
                  >
                    Bella Keratin Studio
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: 14,
                      color: '#7a7065',
                    }}
                  >
                    Hair Extensions Specialist • London
                  </p>
                </div>

                <div
                  style={{
                    borderRadius: 14,
                    background: '#edf7ee',
                    color: '#256b43',
                    padding: '8px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ● Available now
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#2f241c',
                  }}
                >
                  from £45
                </p>

                <Link
                  href="/master/bella-keratin-studio"
                  style={{
                    borderRadius: 16,
                    background: '#2f241c',
                    color: '#fff',
                    padding: '10px 16px',
                    fontSize: 14,
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
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
                fontSize: 14,
                fontWeight: 700,
                color: '#7a7065',
              }}
            >
              View all
            </button>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {masters.map((master) => (
              <Link
                key={master.id}
                href={`/master/${master.id}`}
                style={{
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 28,
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
                    height: 190,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 22
