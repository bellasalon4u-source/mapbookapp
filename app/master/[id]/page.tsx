'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMasterById } from '../../../services/masters';
import { getListings } from '../../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

const pageTexts = {
  EN: {
    notFound: 'Master not found',
    gallery: 'Gallery',
    bookNow: 'Book now',
    availableNow: 'Available now',
    offlineNow: 'Offline now',
    from: 'from',
    trustedByClients: 'Trusted by clients',
    verifiedReviews: 'verified reviews',
    startingPrice: 'Starting price',
    priceList: 'Price list',
    premiumService: 'Premium service with professional result',
    book: 'Book',
    close: 'Close',
  },
  ES: {
    notFound: 'Professional not found',
    gallery: 'Gallery',
    bookNow: 'Book now',
    availableNow: 'Available now',
    offlineNow: 'Offline now',
    from: 'from',
    trustedByClients: 'Trusted by clients',
    verifiedReviews: 'verified reviews',
    startingPrice: 'Starting price',
    priceList: 'Price list',
    premiumService: 'Premium service with professional result',
    book: 'Book',
    close: 'Close',
  },
  RU: {
    notFound: 'Мастер не найден',
    gallery: 'Галерея',
    bookNow: 'Забронировать',
    availableNow: 'Доступен сейчас',
    offlineNow: 'Сейчас не в сети',
    from: 'от',
    trustedByClients: 'Клиенты доверяют',
    verifiedReviews: 'проверенных отзывов',
    startingPrice: 'Стартовая цена',
    priceList: 'Прайс-лист',
    premiumService: 'Премиум услуга с профессиональным результатом',
    book: 'Бронь',
    close: 'Закрыть',
  },
  CZ: {
    notFound: 'Specialista nenalezen',
    gallery: 'Galerie',
    bookNow: 'Rezervovat',
    availableNow: 'Dostupný nyní',
    offlineNow: 'Nyní offline',
    from: 'od',
    trustedByClients: 'Klienti důvěřují',
    verifiedReviews: 'ověřených recenzí',
    startingPrice: 'Počáteční cena',
    priceList: 'Ceník',
    premiumService: 'Prémiová služba s profesionálním výsledkem',
    book: 'Rezervovat',
    close: 'Zavřít',
  },
  DE: {
    notFound: 'Anbieter nicht gefunden',
    gallery: 'Galerie',
    bookNow: 'Jetzt buchen',
    availableNow: 'Jetzt verfügbar',
    offlineNow: 'Jetzt offline',
    from: 'ab',
    trustedByClients: 'Von Kunden geschätzt',
    verifiedReviews: 'verifizierte Bewertungen',
    startingPrice: 'Startpreis',
    priceList: 'Preisliste',
    premiumService: 'Premium-Service mit professionellem Ergebnis',
    book: 'Buchen',
    close: 'Schließen',
  },
  PL: {
    notFound: 'Specjalista nie znaleziony',
    gallery: 'Galeria',
    bookNow: 'Zarezerwuj',
    availableNow: 'Dostępny teraz',
    offlineNow: 'Teraz offline',
    from: 'od',
    trustedByClients: 'Klienci ufają',
    verifiedReviews: 'zweryfikowanych opinii',
    startingPrice: 'Cena początkowa',
    priceList: 'Cennik',
    premiumService: 'Usługa premium z profesjonalnym efektem',
    book: 'Rezerwuj',
    close: 'Zamknij',
  },
} as const;

function getTexts(language: AppLanguage) {
  return pageTexts[language as keyof typeof pageTexts] || pageTexts.EN;
}

function normalizeListingToMasterPageShape(id: string) {
  const listing = getListings().find((item) => String(item.id) === id);
  if (!listing) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80';

  const gallery =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : [fallbackImage, fallbackImage, fallbackImage];

  const numericPrice = Number(String(listing.price).replace(/[^\d.]/g, '')) || 45;

  return {
    id: listing.id,
    name: listing.title,
    title: listing.subcategory || listing.category || 'Service',
    city: listing.location || 'Selected region',
    rating: 4.8,
    reviews: 12,
    availableNow: listing.availableToday,
    priceFrom: numericPrice,
    description:
      listing.description || 'Premium service with professional result.',
    cover: gallery[0] || fallbackImage,
    avatar: gallery[0] || fallbackImage,
    gallery:
      gallery.length >= 3
        ? gallery
        : [gallery[0] || fallbackImage, gallery[1] || gallery[0] || fallbackImage, gallery[2] || gallery[0] || fallbackImage],
    services: [
      {
        slug: 'main-service',
        title: listing.title,
        duration: listing.hours || 'Flexible time',
        price: numericPrice,
        image: gallery[0] || fallbackImage,
      },
    ],
  };
}

export default function MasterPage() {
  const params = useParams();
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [liked, setLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => unsubscribe();
  }, []);

  const text = useMemo(() => getTexts(language), [language]);

  const master = useMemo(() => {
    const id = String(params.id);
    return getMasterById(id) || normalizeListingToMasterPageShape(id);
  }, [params.id]);

  if (!master) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f4ee',
          padding: 24,
          color: '#17130f',
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {text.notFound}
      </main>
    );
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
        background: '#f7f4ee',
        color: '#17130f',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={master.cover}
            alt={master.name}
            style={{
              width: '100%',
              height: 420,
              objectFit: 'cover',
              display: 'block',
            }}
          />

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              position: 'absolute',
              top: 18,
              left: 16,
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1.5px solid #1d1d1d',
              background: 'rgba(255,255,255,0.96)',
              fontSize: 26,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              position: 'absolute',
              top: 18,
              right: 16,
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1.5px solid #1d1d1d',
              background: 'rgba(255,255,255,0.96)',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ⌂
          </button>

          <div
            style={{
              position: 'absolute',
              top: 110,
              left: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {previewImages.map((image, index) => {
              const isLast = index === 2 && extraCount > 0;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => openViewer(index)}
                  style={{
                    width: 80,
                    height: 80,
                    padding: 0,
                    border: '2px solid #ffffff',
                    borderRadius: 18,
                    overflow: 'hidden',
                    background: '#fff',
                    position: 'relative',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={image}
                    alt={`${master.name}-${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {isLast ? (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.34)',
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
                  ) : null}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                width: 'fit-content',
                border: '1.5px solid #1d1d1d',
                background: '#fff',
                color: '#17130f',
                borderRadius: 18,
                padding: '12px 16px',
                fontWeight: 900,
                fontSize: 17,
                boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 22 }}>📷</span>
              <span>{text.gallery}</span>
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 92,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              style={{
                position: 'relative',
                padding: 0,
                border: 'none',
                background: 'transparent',
                borderRadius: 999,
                cursor: 'pointer',
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
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: '#fff',
                  border: '1.5px solid #1d1d1d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
                  color: liked ? '#d73737' : '#333',
                  fontSize: 16,
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
                border: '1.5px solid #1d1d1d',
                borderRadius: 16,
                padding: '10px 14px',
                fontWeight: 900,
                minWidth: 76,
                textAlign: 'center',
                fontSize: 16,
                boxShadow: '0 8px 18px rgba(0,0,0,0.10)',
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/booking/${master.id}`)}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 26,
              border: '1.5px solid #1d1d1d',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 28px',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 12px 26px rgba(46,151,70,0.25)',
            }}
          >
            {text.bookNow}
          </button>
        </div>

        <section style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            {master.name}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 18,
              color: '#7a7066',
              fontWeight: 700,
            }}
          >
            {master.title} • {master.city}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginTop: 18,
            }}
          >
            <div
              style={{
                background: master.availableNow ? '#dff2e3' : '#f2ebe1',
                color: master.availableNow ? '#1d7a38' : '#7d756c',
                border: '1.5px solid #1d1d1d',
                borderRadius: 999,
                padding: '12px 18px',
                fontWeight: 900,
                fontSize: 15,
              }}
            >
              {master.availableNow ? text.availableNow : text.offlineNow}
            </div>

            <div
              style={{
                background: '#3a2b20',
                color: '#fff',
                border: '1.5px solid #1d1d1d',
                borderRadius: 999,
                padding: '12px 20px',
                fontWeight: 900,
                fontSize: 17,
              }}
            >
              {text.from} £{master.priceFrom}
            </div>
          </div>

          <p
            style={{
              marginTop: 22,
              fontSize: 18,
              color: '#5d554d',
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            {master.description}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/master/${master.id}/reviews`)}
            style={{
              width: '100%',
              marginTop: 22,
              border: '1.5px solid #1d1d1d',
              background: '#fffdf9',
              borderRadius: 24,
              padding: '18px 18px 20px',
              boxShadow: '0 8px 22px rgba(0,0,0,0.04)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: 15,
                color: '#7a7066',
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.trustedByClients}
            </div>

            <div
              style={{
                height: 1,
                background: '#eee4d7',
                marginBottom: 16,
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.15fr auto 0.95fr',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      color: '#b0831a',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    ★
                  </span>

                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: '#231b15',
                      lineHeight: 1,
                    }}
                  >
                    {master.rating.toFixed(1)}
                  </span>

                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: '#35a24a',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                </div>

                <div
                  style={{
                    color: '#2d9b47',
                    fontWeight: 900,
                    fontSize: 16,
                    lineHeight: 1.2,
                  }}
                >
                  {master.reviews} {text.verifiedReviews}
                </div>
              </div>

              <div
                style={{
                  width: 1,
                  height: 68,
                  background: '#e8dfd4',
                  justifySelf: 'center',
                }}
              />

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 15,
                    color: '#7a7066',
                    fontWeight: 800,
                  }}
                >
                  {text.startingPrice}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 40,
                    fontWeight: 900,
                    color: '#231b15',
                    lineHeight: 1,
                  }}
                >
                  £{master.priceFrom}
                </div>
              </div>
            </div>
          </button>

          <h2
            style={{
              marginTop: 28,
              fontSize: 30,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            {text.priceList}
          </h2>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {master.services.map((service: any) => (
              <div
                key={service.slug}
                style={{
                  background: '#fff',
                  border: '1.5px solid #1d1d1d',
                  borderRadius: 26,
                  padding: 14,
                  boxShadow: '0 8px 22px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '94px 1fr',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: 94,
                      height: 94,
                      objectFit: 'cover',
                      borderRadius: 20,
                      display: 'block',
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        lineHeight: 1.2,
                      }}
                    >
                      {service.title}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        color: '#7b7168',
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {service.duration}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#f7f1e7',
                        color: '#231b15',
                        border: '1.5px solid #1d1d1d',
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    >
                      <span style={{ color: '#7a7066', fontWeight: 800 }}>
                        {text.from}
                      </span>
                      <span>£{service.price}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      color: '#7b7168',
                      fontSize: 15,
                      lineHeight: 1.35,
                      fontWeight: 700,
                    }}
                  >
                    {text.premiumService}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/booking/${master.id}?service=${service.slug}`)
                    }
                    style={{
                      border: '1.5px solid #1d1d1d',
                      background: '#2e9746',
                      color: '#fff',
                      borderRadius: 18,
                      padding: '14px 20px',
                      fontWeight: 900,
                      fontSize: 16,
                      minWidth: 96,
                      boxShadow: '0 10px 22px rgba(46,151,70,0.18)',
                      cursor: 'pointer',
                    }}
                  >
                    {text.book}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {galleryOpen ? (
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
                type="button"
                onClick={() => setGalleryOpen(false)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1.5px solid #1d1d1d',
                  background: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>

              <div style={{ fontSize: 22, fontWeight: 900 }}>{text.gallery}</div>

              <button
                type="button"
                onClick={() => {
                  closeEverything();
                  router.push('/');
                }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '1.5px solid #1d1d1d',
                  background: '#fff',
                  fontSize: 22,
                  cursor: 'pointer',
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
              {master.gallery.map((image: string, index: number) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => openViewer(index)}
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={image}
                    alt={`${master.name}-${index + 1}`}
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
      ) : null}

      {viewerOpen ? (
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
                type="button"
                onClick={() => setViewerOpen(false)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 28,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>

              <button
                type="button"
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
                  cursor: 'pointer',
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
                alt={`${master.name}-${selectedImageIndex + 1}`}
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

              {master.gallery.length > 1 ? (
                <>
                  <button
                    type="button"
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
                      cursor: 'pointer',
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
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
                      cursor: 'pointer',
                    }}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 14,
                textAlign: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {selectedImageIndex + 1} / {master.gallery.length}
            </div>
          </div>
        </div>
      ) : null}

      {avatarOpen ? (
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
                type="button"
                onClick={() => setAvatarOpen(false)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 28,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>

              <button
                type="button"
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
                  cursor: 'pointer',
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
      ) : null}
    </main>
  );
}
