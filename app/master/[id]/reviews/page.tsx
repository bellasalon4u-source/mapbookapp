'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

const demoReviews = [
  {
    id: 1,
    name: 'Sophie',
    rating: 5,
    date: '12 Mar 2026',
    text: 'Absolutely amazing result. The keratin bonds look very natural and feel super comfortable. One of the best experiences I have had in London.',
  },
  {
    id: 2,
    name: 'Amelia',
    rating: 5,
    date: '04 Mar 2026',
    text: 'Very professional, clean and attentive to details. The color match was perfect and the hair feels luxurious.',
  },
  {
    id: 3,
    name: 'Mia',
    rating: 4,
    date: '26 Feb 2026',
    text: 'Really beautiful work and friendly atmosphere. I would definitely come back again for tape-ins.',
  },
  {
    id: 4,
    name: 'Olivia',
    rating: 5,
    date: '19 Feb 2026',
    text: 'My favorite master so far. The result looks expensive and natural, exactly what I wanted.',
  },
  {
    id: 5,
    name: 'Emily',
    rating: 5,
    date: '11 Feb 2026',
    text: 'Great communication, beautiful studio and very high quality service. I highly recommend.',
  },
];

function stars(count: number) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export default function ReviewsPage() {
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>Reviews</div>

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
            borderRadius: 28,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 18, color: '#6f655b' }}>{master.name}</div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 900 }}>{master.rating.toFixed(1)}</div>

            <div
              style={{
                background: '#efe3cf',
                color: '#5c4a34',
                borderRadius: 18,
                padding: '12px 16px',
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>
          </div>

          <div style={{ marginTop: 8, color: '#7a7066', fontSize: 17 }}>
            Based on {master.reviews} reviews
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '5★', value: 64, width: '88%' },
              { label: '4★', value: 12, width: '36%' },
              { label: '3★', value: 4, width: '16%' },
              { label: '2★', value: 1, width: '8%' },
              { label: '1★', value: 1, width: '8%' },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 38px',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 700 }}>{row.label}</div>
                <div
                  style={{
                    height: 10,
                    background: '#f1e8dd',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: row.width,
                      height: '100%',
                      background: '#2e9746',
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div style={{ color: '#6f655b', fontWeight: 700 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 16,
            overflowX: 'auto',
          }}
        >
          {['Newest', 'Highest rated', 'With photos'].map((tab, index) => (
            <button
              key={tab}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 16px',
                fontWeight: 800,
                fontSize: 15,
                whiteSpace: 'nowrap',
                background: index === 0 ? '#2e9746' : '#fff',
                color: index === 0 ? '#fff' : '#2b231d',
                borderColor: '#e5d9cb',
                boxShadow: index === 0 ? 'none' : 'inset 0 0 0 1px #e5d9cb',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {demoReviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: '#fff',
                border: '1px solid #e4d8ca',
                borderRadius: 24,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{review.name}</div>
                  <div style={{ marginTop: 6, color: '#7a7066', fontSize: 14 }}>{review.date}</div>
                </div>

                <div
                  style={{
                    background: '#f6efe5',
                    color: '#7b5a20',
                    borderRadius: 14,
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {review.rating}.0 ★
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#a5781d',
                  fontSize: 18,
                  letterSpacing: 1,
                }}
              >
                {stars(review.rating)}
              </div>

              <p
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: '#4f473f',
                }}
              >
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
