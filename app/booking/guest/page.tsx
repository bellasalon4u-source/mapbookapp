'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type GuestBooking = {
  id: string;
  masterId: string;
  masterName: string;
  category: string;
  subcategory: string;
  price: string;
  firstName: string;
  lastName: string;
  phone: string;
  depositAmount: number;
  depositStatus: 'frozen';
  status: 'reserved';
  createdAt: string;
};

function readPendingBooking() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('olamep_pending_guest_booking');
    if (!raw) return null;
    return JSON.parse(raw) as {
      masterId?: string;
      masterName?: string;
      category?: string;
      subcategory?: string;
      price?: string;
      avatar?: string;
    };
  } catch {
    return null;
  }
}

function saveGuestBooking(booking: GuestBooking) {
  if (typeof window === 'undefined') return;

  const current = JSON.parse(
    window.localStorage.getItem('olamep_guest_bookings') || '[]'
  ) as GuestBooking[];

  window.localStorage.setItem(
    'olamep_guest_bookings',
    JSON.stringify([booking, ...current])
  );
}

export default function GuestBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pending, setPending] = useState<ReturnType<typeof readPendingBooking>>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [success, setSuccess] = useState(false);

  const masterIdFromUrl = searchParams.get('masterId') || '';

  useEffect(() => {
    const saved = readPendingBooking();

    if (saved) {
      setPending(saved);
      return;
    }

    setPending({
      masterId: masterIdFromUrl,
      masterName: 'Professional',
      category: 'Service',
      subcategory: '',
      price: '45',
      avatar: '',
    });
  }, [masterIdFromUrl]);

  const canPay = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      phone.trim().length >= 6 &&
      accepted
    );
  }, [firstName, lastName, phone, accepted]);

  const masterName = pending?.masterName || 'Professional';
  const category = pending?.category || 'Service';
  const subcategory = pending?.subcategory || '';
  const price = pending?.price || '45';

  const handlePayAndReserve = () => {
    if (!canPay) return;

    const booking: GuestBooking = {
      id: `guest_booking_${Date.now()}`,
      masterId: pending?.masterId || masterIdFromUrl || 'unknown',
      masterName,
      category,
      subcategory,
      price,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      depositAmount: 1,
      depositStatus: 'frozen',
      status: 'reserved',
      createdAt: new Date().toISOString(),
    };

    saveGuestBooking(booking);
    setSuccess(true);

    window.setTimeout(() => {
      router.push('/bookings');
    }, 1200);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef4ff 0%, #ffffff 45%, #fff1f4 100%)',
        fontFamily: 'Arial, sans-serif',
        color: '#071b46',
        padding: '18px 16px 40px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr',
            gap: 14,
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2.5px solid #111111',
              background: '#ffffff',
              color: '#071b46',
              fontSize: 28,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              Reserve booking
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                fontWeight: 800,
                color: '#657080',
                lineHeight: 1.35,
              }}
            >
              Quick booking without full account
            </div>
          </div>
        </header>

        <section
          style={{
            borderRadius: 30,
            border: '3px solid #111111',
            background: '#ffffff',
            padding: 18,
            boxShadow: '0 12px 26px rgba(17,17,17,0.08)',
          }}
        >
          <div
            style={{
              borderRadius: 24,
              border: '2px solid #111111',
              background: '#fff7d8',
              padding: 14,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#657080',
                marginBottom: 6,
              }}
            >
              You are booking
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#071b46',
                lineHeight: 1.15,
              }}
            >
              {masterName}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                fontWeight: 800,
                color: '#657080',
              }}
            >
              {category}
              {subcategory ? ` · ${subcategory}` : ''}
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                From £{String(price).replace(/[^\d.]/g, '') || '45'}
              </span>

              <span
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#dcffe8',
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#008f3a',
                }}
              >
                £1 reserve hold
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#657080' }}>
                First name *
              </span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Alex"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#657080' }}>
                Last name *
              </span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Smith"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#657080' }}>
                Contact phone *
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+44 7000 000000"
                inputMode="tel"
                style={inputStyle}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setAccepted((prev) => !prev)}
            style={{
              marginTop: 16,
              width: '100%',
              borderRadius: 20,
              border: '2px solid #111111',
              background: accepted ? '#dcffe8' : '#ffffff',
              padding: 14,
              display: 'grid',
              gridTemplateColumns: '30px 1fr',
              gap: 10,
              alignItems: 'center',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: '2px solid #111111',
                background: accepted ? '#55c75f' : '#ffffff',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              {accepted ? '✓' : ''}
            </span>

            <span
              style={{
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#071b46',
              }}
            >
              I understand that £1 will be frozen to reserve this booking. The full
              account can be completed later.
            </span>
          </button>

          <div
            style={{
              marginTop: 16,
              borderRadius: 20,
              border: '2px solid #111111',
              background: '#eef4ff',
              padding: 14,
              fontSize: 13,
              lineHeight: 1.4,
              fontWeight: 800,
              color: '#071b46',
            }}
          >
            This keeps the booking serious, reduces spam, and lets Olamep keep payment
            control without forcing a long registration first.
          </div>

          <button
            type="button"
            disabled={!canPay}
            onClick={handlePayAndReserve}
            style={{
              marginTop: 16,
              width: '100%',
              minHeight: 58,
              borderRadius: 22,
              border: '2.5px solid #111111',
              background: canPay ? '#55c75f' : '#d8dce2',
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 900,
              cursor: canPay ? 'pointer' : 'not-allowed',
              boxShadow: canPay ? '0 8px 18px rgba(85,199,95,0.28)' : 'none',
            }}
          >
            Pay £1 & reserve
          </button>

          {success ? (
            <div
              style={{
                marginTop: 14,
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#dcffe8',
                color: '#008f3a',
                padding: 14,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              ✓ £1 frozen. Booking reserved.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  height: 58,
  borderRadius: 20,
  border: '2px solid #111111',
  background: '#ffffff',
  color: '#071b46',
  fontSize: 16,
  fontWeight: 800,
  padding: '0 14px',
  outline: 'none',
  boxSizing: 'border-box',
} as const;
