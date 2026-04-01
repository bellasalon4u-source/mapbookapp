'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const tags = [
    'Clean studio',
    'Good communication',
    'Natural result',
    'Fast service',
    'Worth the price',
    'Would come back',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const addDemoPhoto = () => {
    const demoPool = [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
    ];

    const nextPhoto = demoPool[photos.length % demoPool.length];
    if (photos.length < 4) {
      setPhotos((prev) => [...prev, nextPhoto]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = rating > 0 && reviewText.trim().length >= 12;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        padding: 20,
        paddingBottom: 120,
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

          <div style={{ fontSize: 28, fontWeight: 900 }}>Leave review</div>

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
            border: '1px solid #eadfd2',
            borderRadius: 28,
            padding: 18,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '88px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{
                width: 88,
                height: 88,
                borderRadius: 20,
                objectFit: 'cover',
              }}
            />

            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{master.name}</div>
              <div style={{ marginTop: 6, color: '#7a7066', fontSize: 17 }}>
                {master.title} • {master.city}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#eef8f0',
                  color: '#1f7d39',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <span>✔</span>
                <span>Verified visit</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: '#fff',
            border: '1px solid #eadfd2',
            borderRadius: 28,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>Your rating</div>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hovered || rating);

              return (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 38,
                    color: active ? '#b0831a' : '#d9cfbf',
                    lineHeight: 1,
                  }}
                >
                  ★
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 10,
              textAlign: 'center',
              color: '#7a7066',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {rating === 0
              ? 'Tap to rate'
              : rating === 5
              ? 'Excellent'
              : rating === 4
              ? 'Very good'
              : rating === 3
              ? 'Good'
              : rating === 2
              ? 'Not great'
              : 'Poor'}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: '#fff',
            border: '1px solid #eadfd2',
            borderRadius: 28,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>What stood out?</div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '12px 14px',
                    fontWeight: 800,
                    fontSize: 14,
                    background: active ? '#35a24a' : '#f7f2ea',
                    color: active ? '#fff' : '#3b3129',
                    boxShadow: active ? 'none' : 'inset 0 0 0 1px #e7ddd0',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: '#fff',
            border: '1px solid #eadfd2',
            borderRadius: 28,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>Write your review</div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell others about your experience..."
            style={{
              marginTop: 14,
              width: '100%',
              minHeight: 150,
              resize: 'vertical',
              borderRadius: 20,
              border: '1px solid #e7ddd0',
              background: '#fcfaf7',
              padding: 16,
              fontSize: 17,
              lineHeight: 1.5,
              color: '#2a231d',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <div
            style={{
              marginTop: 10,
              textAlign: 'right',
              color: '#8a8178',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {reviewText.trim().length} characters
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: '#fff',
            border: '1px solid #eadfd2',
            borderRadius: 28,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>Add photos</div>

          <div style={{ marginTop: 8, color: '#7a7066', fontSize: 15 }}>
            Up to 4 photos
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                }}
              >
                <img
                  src={photo}
                  alt={`Review upload ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 130,
                    borderRadius: 18,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <button
                  onClick={() => removePhoto(index)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: 'none',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <button
                onClick={addDemoPhoto}
                style={{
                  minHeight: 130,
                  borderRadius: 18,
                  border: '2px dashed #d8ccbc',
                  background: '#fcfaf7',
                  color: '#7a7066',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                + Add photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(252,248,242,0.96)',
          borderTop: '1px solid #eadfd2',
          padding: '14px 20px 18px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <button
            disabled={!canSubmit}
            onClick={() => router.push(`/master/${master.id}/reviews`)}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 22,
              padding: '18px 20px',
              fontWeight: 900,
              fontSize: 20,
              background: canSubmit ? '#35a24a' : '#cfe7d4',
              color: '#fff',
              boxShadow: canSubmit
                ? '0 14px 28px rgba(53,162,74,0.25)'
                : 'none',
            }}
          >
            Submit review
          </button>
        </div>
      </div>
    </main>
  );
}
