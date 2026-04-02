'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById, getAllMasters } from '../../../services/masters';
import { getListings } from '../../../services/listingsStore';

type ListingLike = {
  id: string | number;
  title?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  description?: string;
  price?: string;
  hours?: string;
  availableToday?: boolean;
  photos?: string[];
  paymentMethods?: string[];
  serviceModes?: string[];
};

function listingToMasterShape(listing: ListingLike, index: number) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
  ];

  const gallery =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : [
          fallbackImages[index % fallbackImages.length],
          fallbackImages[(index + 1) % fallbackImages.length],
          fallbackImages[(index + 2) % fallbackImages.length],
        ];

  const numericPrice = Number(String(listing.price || '').replace(/[^\d.]/g, ''));
  const priceFrom = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 45;

  return {
    id: listing.id,
    name: listing.title || 'Provider',
    title: listing.subcategory || 'Service provider',
    city: listing.location || 'London',
    avatar: gallery[0],
    services: [
      {
        slug: 'main-service',
        title: listing.subcategory || listing.title || 'Main service',
        duration: listing.hours || '1h',
        price: priceFrom,
        image: gallery[0],
      },
      {
        slug: 'premium-service',
        title: 'Premium option',
        duration: '2h',
        price: priceFrom + 20,
        image: gallery[1] || gallery[0],
      },
    ],
  };
}

export default function BookingServicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = String(params.id);

  const allMasters = getAllMasters() as any[];
  const listings = getListings() as ListingLike[];

  const master = useMemo(() => {
    const builtInMaster = getMasterById(id);
    if (builtInMaster) return builtInMaster;

    const listingIndex = listings.findIndex((item) => String(item.id) === id);
    if (listingIndex !== -1) {
      return listingToMasterShape(listings[listingIndex], listingIndex);
    }

    const fallbackMaster = allMasters.find((item: any) => String(item.id) === id);
    if (fallbackMaster) return fallbackMaster;

    return null;
  }, [id, listings, allMasters]);

  const preselectedService = searchParams.get('service') || '';
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (!master) return;
    if (!preselectedService) return;

    const exists = master.services.some(
      (service: any) => service.slug === preselectedService
    );

    if (exists) {
      setSelectedServices([preselectedService]);
    }
  }, [master, preselectedService]);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const toggleService = (slug: string) => {
    setSelectedServices((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const selectedItems = master.services.filter((service: any) =>
    selectedServices.includes(service.slug)
  );

  const totalPrice = selectedItems.reduce(
    (sum: number, item: any) => sum + item.price,
    0
  );

  const parseDurationToMinutes = (value: string) => {
    const hourMatch = value.match(/(\d+)\s*h/i);
    const minuteMatch = value.match(/(\d+)\s*m/i);

    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

    return hours * 60 + minutes;
  };

  const totalMinutes = selectedItems.reduce(
    (sum: number, item: any) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 130,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>Choose services</div>

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
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '84px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <img
            src={master.avatar}
            alt={master.name}
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              objectFit: 'cover',
            }}
          />

          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{master.name}</div>
            <div style={{ marginTop: 8, color: '#746b62', fontSize: 17 }}>
              {master.title} • {master.city}
            </div>
          </div>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 30 }}>Services</h2>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {master.services.map((service: any) => {
            const active = selectedServices.includes(service.slug);

            return (
              <button
                key={service.slug}
                onClick={() => toggleService(service.slug)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: '#fff',
                  border: active ? '2px solid #2e9746' : '1px solid #e4d8ca',
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
                  <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>
                    {service.duration}
                  </div>
                  <div style={{ marginTop: 8, color: '#231b15', fontSize: 17, fontWeight: 700 }}>
                    from £{service.price}
                  </div>
                </div>

                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: active ? 'none' : '2px solid #d8cdc0',
                    background: active ? '#2e9746' : '#fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {active ? '✓' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #e6ddd1',
          padding: '14px 16px',
        }}
      >
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>
                Total duration
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                {selectedItems.length ? formatMinutes(totalMinutes) : '0m'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>
                Total price
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                £{totalPrice}
              </div>
            </div>
          </div>

          <button
            disabled={!selectedItems.length}
            onClick={() => {
              if (!selectedItems.length) return;

              const servicesParam = encodeURIComponent(selectedServices.join(','));
              router.push(`/booking/${master.id}/date?services=${servicesParam}`);
            }}
            style={{
              width: '100%',
              border: 'none',
              background: selectedItems.length ? '#2e9746' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
