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
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const previewImages = master.gallery.slice(0, 3);
  const extraCount = Math.max(master.gallery.length - 3, 0);

  const openViewer = (index: number) => {
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  const closeEverything = () => {
    setGalleryOpen(false);
    setViewerOpen(false);
    setAvatarOpen(false);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? master.gallery.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === master.gallery.length - 1 ? 0 : prev + 1
    );
  };

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
            style={{
              width: '100%',
              height: 405,
              objectFit: 'cover',
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.16)',
              pointerEvents: 'none',
            }}
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
              border: '1px solid rgba(239,230,218,0.95)',
              background: 'rgba(255,255,255,0.96)',
              fontSize: 24,
              zIndex: 5,
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
              border: '1px solid rgba(239,230,218,0.95)',
              background: 'rgba(255,255,255,0.96)',
              fontSize: 22,
              zIndex: 5,
            }}
          >
            ⌂
          </button>

          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 112,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 4,
            }}
          >
            {previewImages.map((image, index) => {
              const isLast = index === 2 && extraCount > 0;

              return (
                <button
                  key={index}
                  onClick={() => openViewer(index)}
                  style={{
                    width: 78,
                    height: 78,
                    padding: 0,
                    border: '2px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#fff',
                    position: 'relative',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                  }}
                >
                  <img
                    src={image}
                    alt={`${master.name} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.32)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        padding: 8,
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 900,
                      }}
                    >
                      +{extraCount}
                    </div>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setGalleryOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.96)',
                color: '#1d1712',
                borderRadius: 18,
                padding: '12px 16px',
                fontWeight: 800,
                fontSize: 17,
                boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                width: 'fit-content',
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>📷</span>
              <span>Gallery</span>
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 86,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              alignItems: 'center',
              zIndex: 4,
            }}
          >
            <button
              onClick={() => setAvatarOpen(true)}
              style={{
                position: 'relative',
                padding: 0,
                border: 'none',
                background: 'transparent',
                borderRadius: 999,
              }}
            >
              <img
                src={master.avatar}
                alt={master.name}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 999,
                  border: '4px solid #fff',
                  display: 'block',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                }}
              />

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked((prev) => !prev);
                }}
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -2,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: '#fff',
                  border: '1px solid #e7ddd0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
                  color: liked ? '#d73737' : '#333',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {liked ? '♥' : '♡'}
              </span>
            </button>

            <div
              style={{
                background: '#efe3cf',
                color: '#5c4a34',
                borderRadius: 16,
                padding: '10px 14px',
                fontWeight: 800,
                minWidth: 72,
                textAlign: 'center',
                fontSize: 16,
                boxShadow: '0 8px 18px rgba(0,0,0,0.10)',
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>
          </div>

          <button
            onClick={() => router.push(`/booking/${master.id}`)}
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
              zIndex: 4,
              boxShadow: '0 12px 26px rgba(46,151,70,0.25)',
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

          <p
            style={{
              marginTop: 22,
              fontSize: 18,
              color: '#5d554d',
              lineHeight: 1.5,
            }}
          >
            {master.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginTop: 20,
            }}
          >
            <div
              style={{
                background: '#2f241c',
                color: '#fff',
                borderRadius: 26,
                padding: 22,
              }}
            >
              <div style={{ opacity: 0.9, fontSize: 16 }}>Reviews</div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>
                {master.reviews}
              </div>
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
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>
                £{master.priceFrom}
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: 28, fontSize: 30 }}>Price list</h2>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
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
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {service.title}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: '#746b62',
                      fontSize: 16,
                    }}
                  >
                    {service.duration}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: '#231b15',
                      fontSize: 17,
                      fontWeight: 700,
                    }}
                  >
                    from £{service.price}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/booking/${master.id}`)}
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
          onClick={() => setGalleryOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 200,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              margin: '0 auto',
              background: '#fcf8f2',
              borderRadius: 28,
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
                onClick={() => setGalleryOpen(false)}
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

              <div style={{ fontSize: 22, fontWeight: 800 }}>Gallery</div>

              <button
                onClick={() => {
                  closeEverything();
                  router.push('/');
                }}
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
                <button
                  key={index}
                  onClick={() => openViewer(index)}
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                  }}
                >
                  <img
                    src={image}
                    alt={`${master.name} ${index + 1}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                      borderRadius: 18,
                      display: 'block',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewerOpen && (
        <div
          onClick={() => setViewerOpen(false)}
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
                onClick={() => setViewerOpen(false)}
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
                onClick={() => {
                  closeEverything();
                  router.push('/');
                }}
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
                src={master.gallery[selectedImageIndex]}
                alt={`${master.name} ${selectedImageIndex + 1}`}
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

              {master.gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
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
                    onClick={nextImage}
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
              {selectedImageIndex + 1} / {master.gallery.length}
            </div>
          </div>
        </div>
      )}

      {avatarOpen && (
        <div
          onClick={() => setAvatarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 310,
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
                onClick={() => setAvatarOpen(false)}
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
                onClick={() => {
                  closeEverything();
                  router.push('/');
                }}
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
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 28,
                padding: 14,
              }}
            >
              <img
                src={master.avatar}
                alt={master.name}
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
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
