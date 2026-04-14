'use client';

import { useRouter } from 'next/navigation';

export default function NewPromotionPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '24px 16px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            border: '1px solid #e8dfd2',
            background: '#fff',
            fontSize: 26,
            fontWeight: 900,
            color: '#17130f',
            boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
            cursor: 'pointer',
            marginBottom: 18,
          }}
        >
          ←
        </button>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: 22,
            border: '1px solid #eee5d9',
            boxShadow: '0 12px 28px rgba(0,0,0,0.04)',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            New promotion
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 15,
              lineHeight: 1.5,
              color: '#6f675f',
              fontWeight: 700,
            }}
          >
            This page is temporarily restored as a safe placeholder so production build can pass.
          </p>
        </div>
      </div>
    </main>
  );
}
