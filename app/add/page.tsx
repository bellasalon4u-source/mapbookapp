'use client';

export default function AddPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f5f7',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '4px solid #111',
            borderRadius: 36,
            padding: 24,
          }}
        >
          <h1
            style={{
              fontSize: 44,
              lineHeight: 1,
              fontWeight: 900,
              color: '#082567',
              marginBottom: 12,
            }}
          >
            Add service
          </h1>

          <p
            style={{
              color: '#6b7280',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            Create a strong listing for clients nearby
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '4px solid #111',
            borderRadius: 36,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#082567',
              marginBottom: 20,
            }}
          >
            Photos
          </div>

          <button
            style={{
              width: '100%',
              height: 220,
              borderRadius: 28,
              border: '3px dashed #b6bcc8',
              background: '#f8fafc',
              fontSize: 28,
              fontWeight: 800,
              color: '#082567',
            }}
          >
            + Add photo / video
          </button>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '4px solid #111',
            borderRadius: 36,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#082567',
              marginBottom: 20,
            }}
          >
            Price
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <div
              style={{
                border: '3px solid #111',
                borderRadius: 24,
                padding: 20,
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#6b7280',
                  marginBottom: 8,
                }}
              >
                FROM
              </div>

              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: '#ff2d6f',
                }}
              >
                £40
              </div>
            </div>

            <div
              style={{
                border: '3px solid #111',
                borderRadius: 24,
                padding: 20,
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#6b7280',
                  marginBottom: 8,
                }}
              >
                TO
              </div>

              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: '#22c55e',
                }}
              >
                £60
              </div>
            </div>
          </div>
        </div>

        <button
          style={{
            height: 86,
            borderRadius: 999,
            border: '4px solid #111',
            background: '#22c55e',
            color: '#fff',
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          Publish
        </button>
      </div>
    </main>
  );
}
