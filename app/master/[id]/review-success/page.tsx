'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

export default function ReviewSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        padding: 20,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #eadfd2',
            borderRadius: 32,
            padding: 24,
            boxShadow: '0 10px 28px rgba(0,0,0,0.05)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 999,
              background: '#35a24a',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 58,
              fontWeight: 900,
              boxShadow: '0 16px 30px rgba(53,162,74,0.25)',
            }}
          >
            ✓
          </div>

          <div
            style={{
              marginTop: 22,
              fontSize: 34,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            Review submitted
          </div>

          <p
            style={{
              marginTop: 14,
              fontSize: 18,
              lineHeight: 1.6,
              color: '#5d554d',
            }}
          >
            Thank you. Your review for <b>{master.name}</b> has been submitted successfully.
          </p>

          <div
            style={{
              marginTop: 22,
              background: '#fcfaf7',
              border: '1px solid #eadfd2',
              borderRadius: 24,
              padding: 16,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: 15,
                color: '#7a7066',
                fontWeight: 700,
              }}
            >
              Master
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {master.name}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 16,
                color: '#7a7066',
              }}
            >
              {master.title} • {master.city}
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push('/bookings')}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: 22,
                padding: '18px 20px',
                fontWeight: 900,
                fontSize: 20,
                background: '#35a24a',
                color: '#fff',
                boxShadow: '0 14px 28px rgba(53,162,74,0.22)',
              }}
            >
              Back to bookings
            </button>

            <button
              onClick={() => router.push(`/master/${master.id}/reviews`)}
              style={{
                width: '100%',
                border: '1px solid #dfd3c4',
                borderRadius: 22,
                padding: '18px 20px',
                fontWeight: 900,
                fontSize: 20,
                background: '#fff',
                color: '#1d1712',
              }}
            >
              View reviews
            </button>

            <button
              onClick={() => router.push('/')}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: 22,
                padding: '16px 20px',
                fontWeight: 800,
                fontSize: 18,
                background: '#f5eee4',
                color: '#5a5047',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
