'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [social, setSocial] = useState('');

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const service =
    master.services.find((item) => item.slug === serviceSlug) || master.services[0];

  const valid = firstName && lastName && phone && (email || social);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Your details</div>
            <div style={{ marginTop: 8, color: '#7a7066' }}>{service.title}</div>
          </div>

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
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 28,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6f655b' }}>
            {date} • {time}
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                border: '1px solid #ddd2c6',
                fontSize: 16,
              }}
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                border: '1px solid #ddd2c6',
                fontSize: 16,
              }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                border: '1px solid #ddd2c6',
                fontSize: 16,
              }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                border: '1px solid #ddd2c6',
                fontSize: 16,
              }}
            />
            <input
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              placeholder="Social / messenger"
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                border: '1px solid #ddd2c6',
                fontSize: 16,
              }}
            />
          </div>
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
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>Next step</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Hold deposit</div>
          </div>
          <button
            disabled={!valid}
            onClick={() =>
              router.push(
                `/booking/${master.id}/payment?service=${service.slug}&date=${date}&time=${time}&firstName=${encodeURIComponent(
                  firstName
                )}&lastName=${encodeURIComponent(lastName)}&phone=${encodeURIComponent(
                  phone
                )}&email=${encodeURIComponent(email)}&social=${encodeURIComponent(social)}`
              )
            }
            style={{
              border: 'none',
              background: valid ? '#2e9746' : '#b8d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
