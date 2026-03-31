'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

export default function MasterPage() {
  const params = useParams();
  const router = useRouter();
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const [liked, setLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const firstService = master.services[0];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={master.cover}
            alt={master.name}
            style={{ width: '100%', height: 405, objectFit: 'cover', display: 'block' }}
          />

          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute',
              top: 20,
              left: 16,
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #efe6da',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 24,
            }}
          >
            ←
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              position: 'absolute',
              top: 20,
              right: 16,
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #efe6da',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 22,
            }}
          >
            ⌂
          </button>

          <button
            onClick={() => setGalleryOpen(true)}
            style={{
              position: 'absolute',
              left: 16,
              bottom: 20,
              border: 'none',
              background: 'rgba(33,33,33,0.68)',
              color: '#fff',
              borderRadius: 16,
              padding: '10px 14px',
              fontWeight: 700,
            }}
          >
            🖼 Gallery
          </button>

          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 84,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{
                width: 58,
                height: 58,
                objectFit: 'cover',
                borderRadius: 999,
                border: '3px solid #fff',
              }}
            />

            <div
              style={{
                background: '#efe3cf',
                color: '#5c4a34',
                borderRadius: 16,
                padding: '10px 12px',
                fontWeight: 800,
                minWidth: 58,
                textAlign: 'center',
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>

            <button
              onClick={() => setLiked((prev) => !prev)}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '1px solid #efe6da',
                background: 'rgba(255,255,255,0.95)',
                fontSize: 24,
                color: liked ? '#d73737' : '#333',
              }}
            >
              {liked ? '♥' : '♡'}
            </button>
          </div>

          <button
            onClick={() =>
              router.push(`/booking/${master.id}?service=${firstService.slug}`)
            }
            style={{
              position: 'absolute',
              right: 16,
              bottom: 28,
              border: 'none',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 28px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Book now
          </button>
        </div>

        <section style={{ padding: 24 }}>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{master.name}</div>
          <div style={{ marginTop: 10, fontSize: 18, color: '#7a7066' }}>
            {master.title} • {master.city}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 18,
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: '#f2ebe1',
                color: '#7d756c',
                borderRadius: 999,
                padding: '12px 18px',
                fontWeight: 700,
              }}
            >
              {master.availableNow ? 'Available now' : 'Offline now'}
            </div>

            <div
              style={{
                background: '#3a2b20',
                color: '#fff',
                borderRadius: 999,
                padding: '12px 20px',
                fontWeight: 800,
              }}
            >
              from £{master.priceFrom}
            </div>
          </div>

          <p style={{ marginTop: 22, fontSize: 18, color: '#5d554d', lineHeight: 1.5 }}>
            {master.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            <div
              style={{
                background: '#2f241c',
                color: '#fff',
                borderRadius: 26,
                padding: 22,
              }}
            >
              <div style={{ opacity: 0.9, fontSize: 16 }}>Reviews</div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>{master.reviews}</div>
            </div>

            <div
              style={{
                background: '#efe7dc',
                color: '#231b15',
                borderRadius: 26,
                padding: 22,
              }}
            >
              <div style={{ opacity: 0.7, fontSize: 16 }}>Starting price</div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>£{master.priceFrom}</div>
            </div>
          </div>

          <h2 style={{ marginTop: 28, fontSize: 30 }}>Price list</h2>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {master.services.map((service) => (
              <div
                key={service.slug}
                style={{
                  background: '#fff',
                  border: '1px solid #e4d8ca',
                  borderRadius: 24,
                  padding: 12,
                  display: 'grid',
                  gridTemplateColumns: '96px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: 'cover',
                    borderRadius: 18,
                  }}
                />

                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{service.title}</div>
                  <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>{service.duration}</div>
                  <div style={{ marginTop: 8, color: '#231b15', fontSize: 17, fontWeight: 700 }}>
                    from £{service.price}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/booking/${master.id}?service=${service.slug}`)}
                  style={{
                    border: 'none',
                    background: '#2e9746',
                    color: '#fff',
                    borderRadius: 18,
                    padding: '14px 18px',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {galleryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 200,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div style={{ maxWidth: 420, margin: '0 auto', background: '#fcf8f2', borderRadius: 24, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setGalleryOpen(false)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1px solid #e3d9cc',
                  background: '#fff',
                  fontSize: 22,
                }}
              >
                ←
              </button>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Gallery</div>
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

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}
            >
              {master.gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${master.name} ${index + 1}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 16,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
