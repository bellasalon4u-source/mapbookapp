'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

type FilterType = 'newest' | 'highest' | 'photos';

type ReviewItem = {
  id: number;
  name: string;
  rating: number;
  date: string;
  timestamp: number;
  text: string;
  photos?: string[];
};

const demoReviews: ReviewItem[] = [
  {
    id: 1,
    name: 'Sophie',
    rating: 5,
    date: '12 Mar 2026',
    timestamp: 20260312,
    text: 'Absolutely amazing result. The keratin bonds look very natural and feel super comfortable. One of the best experiences I have had in London. The consultation was clear, the placement was very neat, and the final blend looked premium.',
    photos: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 2,
    name: 'Amelia',
    rating: 5,
    date: '04 Mar 2026',
    timestamp: 20260304,
    text: 'Very professional, clean and attentive to details. The color match was perfect and the hair feels luxurious. I also liked the atmosphere in the studio and the aftercare advice.',
    photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 3,
    name: 'Mia',
    rating: 4,
    date: '26 Feb 2026',
    timestamp: 20260226,
    text: 'Really beautiful work and friendly atmosphere. I would definitely come back again for tape-ins. The result was soft and natural, and the whole process felt very calm and professional.',
  },
  {
    id: 4,
    name: 'Olivia',
    rating: 5,
    date: '19 Feb 2026',
    timestamp: 20260219,
    text: 'My favorite master so far. The result looks expensive and natural, exactly what I wanted. The placement was comfortable and the finish was super clean.',
    photos: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 5,
    name: 'Emily',
    rating: 5,
    date: '11 Feb 2026',
    timestamp: 20260211,
    text: 'Great communication, beautiful studio and very high quality service. I highly recommend. The hair matched perfectly and the final look was exactly as discussed.',
  },
];

function stars(count: number) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export default function ReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const [filter, setFilter] = useState<FilterType>('newest');
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [photoViewer, setPhotoViewer] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const reviews = useMemo(() => {
    let list = [...demoReviews];

    if (filter === 'newest') {
      list.sort((a, b) => b.timestamp - a.timestamp);
    }

    if (filter === 'highest') {
      list.sort((a, b) => b.rating - a.rating || b.timestamp - a.timestamp);
    }

    if (filter === 'photos') {
      list = list.filter((review) => review.photos && review.photos.length > 0);
      list.sort((a, b) => b.timestamp - a.timestamp);
    }

    return list;
  }, [filter]);

  const openPhoto = (images: string[], index: number) => {
    setPhotoViewer({ images, index });
  };

  const prevPhoto = () => {
    if (!photoViewer) return;
    setPhotoViewer({
      images: photoViewer.images,
      index:
        photoViewer.index === 0
          ? photoViewer.images.length - 1
          : photoViewer.index - 1,
    });
  };

  const nextPhoto = () => {
    if (!photoViewer) return;
    setPhotoViewer({
      images: photoViewer.images,
      index:
        photoViewer.index === photoViewer.images.length - 1
          ? 0
          : photoViewer.index + 1,
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
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
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 30, fontWeight: 900 }}>Reviews</div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
              background: '#fff',
              fontSize: 22,
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #eadfD2',
            borderRadius: 30,
            padding: 22,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 18, color: '#6f655b' }}>{master.name}</div>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>
              {master.rating.toFixed(1)}
            </div>

            <div
              style={{
                background: '#efe3cf',
                color: '#7a5b22',
                borderRadius: 20,
                padding: '14px 18px',
                fontWeight: 900,
                fontSize: 20,
                minWidth: 104,
                textAlign: 'center',
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>
          </div>

          <div style={{ marginTop: 14, color: '#7a7066', fontSize: 17 }}>
            Based on {master.reviews} reviews
          </div>

          <div
            style={{
              marginTop: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
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
                  gridTemplateColumns: '42px 1fr 34px',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>{row.label}</div>

                <div
                  style={{
                    height: 14,
                    background: '#eee5db',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: row.width,
                      height: '100%',
                      background: '#35a24a',
                      borderRadius: 999,
                    }}
                  />
                </div>

                <div style={{ color: '#6f655b', fontWeight: 800, fontSize: 16 }}>
                  {row.value}
                </div>
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
            paddingBottom: 2,
          }}
        >
          {[
            { key: 'newest', label: 'Newest' },
            { key: 'highest', label: 'Highest rated' },
            { key: 'photos', label: 'With photos' },
          ].map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as FilterType)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '14px 22px',
                  fontWeight: 800,
                  fontSize: 15,
                  whiteSpace: 'nowrap',
                  background: active ? '#35a24a' : '#fff',
                  color: active ? '#fff' : '#2b231d',
                  boxShadow: active ? 'none' : 'inset 0 0 0 1px #e5d9cb',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => setSelectedReview(review)}
              style={{
                background: '#fff',
                border: '1px solid #eadfd2',
                borderRadius: 28,
                padding: 20,
                textAlign: 'left',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    {review.name}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: '#7a7066',
                      fontSize: 14,
                    }}
                  >
                    {review.date}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f6efe5',
                    color: '#7b5a20',
                    borderRadius: 16,
                    padding: '10px 14px',
                    fontWeight: 900,
                    fontSize: 15,
                  }}
                >
                  {review.rating}.0 ★
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  color: '#b0831a',
                  fontSize: 22,
                  letterSpacing: 2,
                }}
              >
                {stars(review.rating)}
              </div>

              <p
                style={{
                  marginTop: 14,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: '#4f473f',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}
              >
                {review.text}
              </p>

              {review.photos && review.photos.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns:
                      review.photos.length === 1 ? '1fr' : '1fr 1fr',
                    gap: 12,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {review.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => openPhoto(review.photos!, index)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${review.name} photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 130,
                          borderRadius: 18,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedReview && (
        <div
          onClick={() => setSelectedReview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.70)',
            zIndex: 200,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              margin: '40px auto',
              background: '#fcf8f2',
              borderRadius: 30,
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setSelectedReview(null)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1px solid #e3d9cc',
                  background: '#fff',
                  fontSize: 24,
                }}
              >
                ✕
              </button>

              <div style={{ fontSize: 22, fontWeight: 900 }}>Full review</div>

              <button
                onClick={() => router.push('/')}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1px solid #e3d9cc',
                  background: '#fff',
                  fontSize: 22,
                }}
              >
                ⌂
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    {selectedReview.name}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: '#7a7066',
                      fontSize: 14,
                    }}
                  >
                    {selectedReview.date}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f6efe5',
                    color: '#7b5a20',
                    borderRadius: 14,
                    padding: '8px 12px',
                    fontWeight: 900,
                    fontSize: 15,
                  }}
                >
                  {selectedReview.rating}.0 ★
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#b0831a',
                  fontSize: 22,
                  letterSpacing: 2,
                }}
              >
                {stars(selectedReview.rating)}
              </div>

              <p
                style={{
                  marginTop: 14,
                  fontSize: 18,
                  lineHeight: 1.65,
                  color: '#4f473f',
                }}
              >
                {selectedReview.text}
              </p>

              {selectedReview.photos && selectedReview.photos.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  {selectedReview.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => openPhoto(selectedReview.photos!, index)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${selectedReview.name} full photo ${index + 1}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 18,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {photoViewer && (
        <div
          onClick={() => setPhotoViewer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -8,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <button
                onClick={() => setPhotoViewer(null)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 28,
                }}
              >
                ✕
              </button>

              <button
                onClick={() => router.push('/')}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 22,
                }}
              >
                ⌂
              </button>
            </div>

            <div
              style={{
                marginTop: 56,
                position: 'relative',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 28,
                padding: 14,
              }}
            >
              <img
                src={photoViewer.images[photoViewer.index]}
                alt="Review photo"
                style={{
                  width: '100%',
                  maxWidth: 380,
                  height: 'auto',
                  maxHeight: '78vh',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: 24,
                  display: 'block',
                  margin: '0 auto',
                }}
              />

              {photoViewer.images.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      border: 'none',
                      background: 'rgba(0,0,0,0.42)',
                      color: '#fff',
                      fontSize: 28,
                    }}
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextPhoto}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      border: 'none',
                      background: 'rgba(0,0,0,0.42)',
                      color: '#fff',
                      fontSize: 28,
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div
              style={{
                marginTop: 14,
                textAlign: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {photoViewer.index + 1} / {photoViewer.images.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
