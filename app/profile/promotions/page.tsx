'use client';

export default function PromotionsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f5f7',
        padding: 24,
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
            background: '#fff',
            border: '4px solid #111',
            borderRadius: 36,
            padding: 24,
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#082567',
              marginBottom: 12,
            }}
          >
            Promotions
          </h1>

          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#6b7280',
            }}
          >
            Manage your advertisements and deals
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            border: '4px solid #111',
            borderRadius: 36,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#082567',
              marginBottom: 12,
            }}
          >
            Active ads
          </div>

          <div
            style={{
              border: '3px solid #111',
              borderRadius: 24,
              padding: 20,
              background: '#fff8cc',
              fontSize: 18,
              fontWeight: 700,
              color: '#082567',
            }}
          >
            No active advertisements yet.
          </div>
        </div>
      </div>
    </main>
  );
}
