'use client';

import { useRouter } from 'next/navigation';

export default function AddPage() {
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>Add</div>

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

        <div
          style={{
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>Add new listing</div>
          <div style={{ marginTop: 12, color: '#6f655b', lineHeight: 1.6 }}>
            Here we will later add:
            <br />
            service
            <br />
            master
            <br />
            salon chair / workspace
          </div>
        </div>
      </div>
    </main>
  );
}
