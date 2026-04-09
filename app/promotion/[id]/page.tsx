'use client';

import { useRouter } from 'next/navigation';

export default function SponsoredOfferPage() {
  const router = useRouter();

  const sponsoredOffer = {
    id: 'keratin-hair-extensions',
    title: 'Keratin Hair Extensions',
    subtitle: '20% off this week',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    views: 192,
    category: 'Beauty',
    description:
      'Get a professional keratin hair extensions service with a personalised consultation, colour match and natural blend finish. Perfect for clients who want extra length, volume and a seamless result.',
    included: [
      'Personal consultation',
      'Colour matching',
      'Keratin extension application',
      'Blend cut and styling',
      'Aftercare advice',
    ],
    oldPrice: '£150',
    newPrice: '£120',
    validUntil: '20 April',
    area: 'Camden, London',
    address: '24 Camden High Street, London',
    distance: '1.2 miles away',
    providerName: 'Camden Brows Bar',
    providerRole: 'Brows & Lashes',
    providerImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sponsoredOffer.title,
          text: `${sponsoredOffer.title} — ${sponsoredOffer.subtitle}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied');
      }
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  const SectionCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 28,
        padding: 22,
        border: '1px solid #efe7db',
        boxShadow: '0 2px 10px rgba(44, 26, 12, 0.04)',
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#1f1f1f',
          margin: 0,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        padding: '24px 16px 120px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
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
              border: 'none',
              background: '#ffffff',
              color: '#222222',
              borderRadius: 999,
              padding: '18px 24px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(44, 26, 12, 0.05)',
            }}
          >
            ← Back
          </button>

          <div
            style={{
              background: '#ffffff',
              color: '#ff4fa0',
              borderRadius: 999,
              padding: '16px 22px',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(44, 26, 12, 0.05)',
            }}
          >
            Sponsored
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 34,
            overflow: 'hidden',
            border: '1px solid #efe7db',
            boxShadow: '0 6px 18px rgba(44, 26, 12, 0.06)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={sponsoredOffer.image}
              alt={sponsoredOffer.title}
              style={{
                width: '100%',
                height: 360,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                background: '#ffffff',
                color: '#ff4fa0',
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Sponsored
            </div>
          </div>

          <div style={{ padding: 26 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.05,
                fontWeight: 900,
                color: '#20202a',
              }}
            >
              {sponsoredOffer.title}
            </h1>

            <p
              style={{
                marginTop: 12,
                marginBottom: 18,
                fontSize: 22,
                lineHeight: 1.3,
                color: '#6b7280',
                fontWeight: 700,
              }}
            >
              {sponsoredOffer.subtitle}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  background: '#fff5fa',
                  color: '#ff4fa0',
                  border: '1px solid #f8d7e8',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Views: {sponsoredOffer.views}
              </div>

              <div
                style={{
                  background: '#f8f7f4',
                  color: '#48505e',
                  border: '1px solid #e9e4db',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Category: {sponsoredOffer.category}
              </div>

              <div
                style={{
                  background: '#f1fbf4',
                  color: '#228b50',
                  border: '1px solid #d9efdf',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Save £30
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #efe7db',
                borderRadius: 28,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <img
                src={sponsoredOffer.providerImage}
                alt={sponsoredOffer.providerName}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#20202a',
                    marginBottom: 4,
                  }}
                >
                  {sponsoredOffer.providerName}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    color: '#6b7280',
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {sponsoredOffer.providerRole}
                </div>

                <div
                  style={{
                    fontSize: 16,
                    color: '#8b7355',
                    fontWeight: 700,
                  }}
                >
                  ★ {sponsoredOffer.rating}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 14,
              }}
            >
              <button
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: '1px solid #e7dfd3',
                  background: '#ffffff',
                  color: '#243041',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Open profile
              </button>

              <button
                onClick={handleShare}
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: '1px solid #e7dfd3',
                  background: '#ffffff',
                  color: '#243041',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Share
              </button>

              <button
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: 'none',
                  background: '#ff4fa0',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(255, 79, 160, 0.25)',
                }}
              >
                Book now
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 18,
          }}
        >
          <SectionCard title="About this offer">
            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                color: '#4b5563',
                fontWeight: 500,
              }}
            >
              {sponsoredOffer.description}
            </p>
          </SectionCard>

          <SectionCard title="What’s included">
            <div style={{ display: 'grid', gap: 12 }}>
              {sponsoredOffer.included.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 18,
                    color: '#374151',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#f1fbf4',
                      color: '#228b50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pricing">
            <div style={{ display: 'grid', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  fontSize: 18,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 600 }}>Old price</span>
                <span
                  style={{
                    color: '#9ca3af',
                    fontWeight: 700,
                    textDecoration: 'line-through',
                  }}
                >
                  {sponsoredOffer.oldPrice}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  fontSize: 22,
                }}
              >
                <span style={{ color: '#20202a', fontWeight: 800 }}>Now</span>
                <span style={{ color: '#ff4fa0', fontWeight: 900 }}>
                  {sponsoredOffer.newPrice}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  fontSize: 18,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 600 }}>You save</span>
                <span style={{ color: '#228b50', fontWeight: 800 }}>£30</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  fontSize: 18,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 600 }}>Valid until</span>
                <span style={{ color: '#20202a', fontWeight: 800 }}>
                  {sponsoredOffer.validUntil}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Location">
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#9ca3af',
                    fontWeight: 700,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Area
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#20202a',
                    fontWeight: 800,
                  }}
                >
                  {sponsoredOffer.area}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#9ca3af',
                    fontWeight: 700,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Address
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#20202a',
                    fontWeight: 700,
                  }}
                >
                  {sponsoredOffer.address}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#9ca3af',
                    fontWeight: 700,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Distance
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#20202a',
                    fontWeight: 700,
                  }}
                >
                  {sponsoredOffer.distance}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
