import Link from 'next/link';
import RealMap from '../components/RealMap';

export default function HomePage() {
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
          <input
            type="text"
            placeholder="Search services, masters, area..."
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid #d8cfc3',
              fontSize: 16,
              background: '#fff',
            }}
          />
          <a
            href="/favorites"
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid #d8cfc3',
              background: '#fff',
              textDecoration: 'none',
              color: '#1d1712',
              fontWeight: 700,
            }}
          >
            ♥
          </a>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {['Hair', 'Beauty', 'Massage', 'Nails', 'Brows', 'Makeup', 'Wellness'].map(
            (item) => (
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
            )
          )}
        </div>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Map view</h2>

          <div style={{ marginTop: 12 }}>
            <RealMap />
          </div>

          <div
            style={{
              marginTop: 16,
              background: '#fff',
              borderRadius: 22,
              padding: 16,
              border: '1px solid #eadfd2',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>Bella Keratin Studio</div>
                <div style={{ color: '#786d61', marginTop: 4 }}>
                  Hair Extensions Specialist • London
                </div>
              </div>

              <div
                style={{
                  background: '#edf7ee',
                  color: '#256b43',
                  padding: '8px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  height: 'fit-content',
                }}
              >
                ● Available now
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 14,
              }}
            >
              <div style={{ fontWeight: 800 }}>from £45</div>
              <a
                href="/master/bella-keratin-studio"
                style={{
                  background: '#2f241c',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: 14,
                  fontWeight: 800,
                }}
              >
                Open
              </a>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 34, margin: 0, fontWeight: 800 }}>Recommended</h2>

          <div
            style={{
              marginTop: 14,
              background: '#fff',
              borderRadius: 26,
              overflow: 'hidden',
              border: '1px solid #eadfd2',
            }}
          >
            <div
              style={{
                height: 180,
                background:
                  'linear-gradient(135deg, #b77288 0%, #d8aab7 50%, #e8cbd2 100%)',
              }}
            />

            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>Bella Keratin Studio</div>
                  <div style={{ color: '#786d61', marginTop: 4 }}>
                    Hair Extensions Specialist • London
                  </div>
                </div>

                <div
                  style={{
                    background: '#f2e9dc',
                    color: '#463b31',
                    padding: '8px 10px',
                    borderRadius: 12,
                    fontWeight: 800,
                    height: 'fit-content',
                  }}
                >
                  4.9 ★
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    background: '#2f241c',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 999,
                    fontWeight: 800,
                  }}
                >
                  from £45
                </div>

                <div
                  style={{
                    background: '#edf7ee',
                    color: '#256b43',
                    padding: '10px 14px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  ● Available now
                </div>
              </div>

              <a
                href="/master/bella-keratin-studio"
                style={{
                  display: 'inline-block',
                  marginTop: 16,
                  background: '#d92f2f',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '12px 18px',
                  borderRadius: 14,
                  fontWeight: 800,
                }}
              >
                View master
              </a>
            </div>
          </div>
        </section>

        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: '1px solid #efe5d8',
            background: '#fffdf9',
          }}
        >
          <div
            style={{
              maxWidth: 420,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              textAlign: 'center',
              padding: '14px 16px',
              fontSize: 14,
            }}
          >
            <Link
              href="/"
              style={{ color: '#1d1712', fontWeight: 800, textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link
              href="/messages"
              style={{ color: '#7a7065', textDecoration: 'none' }}
            >
              Messages
            </Link>
            <Link
              href="/profile"
              style={{ color: '#7a7065', textDecoration: 'none' }}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
