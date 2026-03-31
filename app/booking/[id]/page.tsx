'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

export default function BookingServicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlugFromQuery = searchParams.get('service') || '';

  const [selectedServiceSlug, setSelectedServiceSlug] = useState(serviceSlugFromQuery);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const selectedService =
    master.services.find((item) => item.slug === selectedServiceSlug) || null;

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

          <div style={{ fontSize: 30, fontWeight: 800 }}>Choose service</div>

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

        <h2 style={{ marginTop: 28, fontSize: 30 }}>Price list</h2>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {master.services.map((service) => {
            const active = selectedServiceSlug === service.slug;

            return (
              <button
                key={service.slug}
                onClick={() => setSelectedServiceSlug(service.slug)}
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
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    border: active ? '7px solid #2e9746' : '2px solid #d8cdc0',
                    background: '#fff',
                  }}
                />
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
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>Hold deposit</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>£5</div>
          </div>

          <button
            disabled={!selectedService}
            onClick={() => {
              if (!selectedService) return;
              router.push(`/booking/${master.id}/date?service=${selectedService.slug}`);
            }}
            style={{
              border: 'none',
              background: selectedService ? '#2e9746' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Choose date
          </button>
        </div>
      </div>
    </main>
  );
}
