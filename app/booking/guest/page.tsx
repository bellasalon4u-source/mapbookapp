'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  paymentMethod: string;
  status: 'reserved';
  createdAt: string;
};

type PendingBooking = {
  masterId?: string;
  masterName?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  avatar?: string;
};

type PaymentMethod = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    title: 'Bank card',
    subtitle: 'Visa / Mastercard',
    icon: '💳',
  },
  {
    id: 'google-pay',
    title: 'Google Pay',
    subtitle: 'Fast mobile payment',
    icon: 'G',
  },
  {
    id: 'apple-pay',
    title: 'Apple Pay',
    subtitle: 'Fast wallet payment',
    icon: '',
  },
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Pay with PayPal account',
    icon: '🅿️',
  },
  {
    id: 'crypto',
    title: 'Crypto wallet',
    subtitle: 'USDT / USDC',
    icon: '₿',
  },
  {
    id: 'swift',
    title: 'SWIFT / bank transfer',
    subtitle: 'Manual bank transfer',
    icon: '🏦',
  },
];

function readPendingBooking(): PendingBooking | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('olamep_pending_guest_booking');
    if (!raw) return null;
    return JSON.parse(raw) as PendingBooking;
  } catch {
    return null;
  }
}

function saveGuestBooking(booking: GuestBooking) {
  if (typeof window === 'undefined') return;

  try {
    const current = JSON.parse(
      window.localStorage.getItem('olamep_guest_bookings') || '[]'
    ) as GuestBooking[];

    window.localStorage.setItem(
      'olamep_guest_bookings',
      JSON.stringify([booking, ...current])
    );
  } catch {
    window.localStorage.setItem('olamep_guest_bookings', JSON.stringify([booking]));
  }
}

export default function GuestBookingPage() {
  const router = useRouter();

  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = readPendingBooking();

    if (saved) {
      setPending(saved);
      return;
    }

    setPending({
      masterId: 'guest',
      masterName: 'Professional',
      category: 'Service',
      subcategory: '',
      price: '45',
      avatar: '',
    });
  }, []);

  const canContinueToPayment = useMemo(() => {
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

  const selectedPaymentMethod =
    PAYMENT_METHODS.find((method) => method.id === selectedPayment) || PAYMENT_METHODS[0];

  const handleOpenPayment = () => {
    if (!canContinueToPayment) return;
    setPaymentSheetOpen(true);
  };

  const handleConfirmPayment = () => {
    const booking: GuestBooking = {
      id: `guest_booking_${Date.now()}`,
      masterId: pending?.masterId || 'guest',
      masterName,
      category,
      subcategory,
      price,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      depositAmount: 1,
      depositStatus: 'frozen',
      paymentMethod: selectedPaymentMethod.id,
      status: 'reserved',
      createdAt: new Date().toISOString(),
    };

    saveGuestBooking(booking);
    setPaymentSheetOpen(false);
    setSuccess(true);

    window.setTimeout(() => {
      router.push('/bookings');
    }, 1400);
  };

  return (
    <>
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
              Guest users can pay only by external payment methods. Olamep internal
              balance is available only after full registration.
            </div>

            <button
              type="button"
              disabled={!canContinueToPayment}
              onClick={handleOpenPayment}
              style={{
                marginTop: 16,
                width: '100%',
                minHeight: 58,
                borderRadius: 22,
                border: '2.5px solid #111111',
                background: canContinueToPayment ? '#55c75f' : '#d8dce2',
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 900,
                cursor: canContinueToPayment ? 'pointer' : 'not-allowed',
                boxShadow: canContinueToPayment
                  ? '0 8px 18px rgba(85,199,95,0.28)'
                  : 'none',
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

      {paymentSheetOpen ? (
        <div
          onClick={() => setPaymentSheetOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.38)',
            zIndex: 5000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              borderRadius: 30,
              border: '3px solid #111111',
              background: '#ffffff',
              padding: 18,
              boxSizing: 'border-box',
              boxShadow: '0 -14px 34px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 46px',
                gap: 12,
                alignItems: 'start',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: '#071b46',
                    lineHeight: 1.05,
                  }}
                >
                  Choose payment method
                </div>

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#657080',
                    lineHeight: 1.35,
                  }}
                >
                  Select how you want to freeze £1 for this booking.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentSheetOpen(false)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#071b46',
                  fontSize: 23,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gap: 10,
              }}
            >
              {PAYMENT_METHODS.map((method) => {
                const active = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    style={{
                      width: '100%',
                      minHeight: 74,
                      borderRadius: 20,
                      border: '2px solid #111111',
                      background: active ? '#eef4ff' : '#ffffff',
                      padding: '12px 14px',
                      display: 'grid',
                      gridTemplateColumns: '42px 1fr 28px',
                      gap: 12,
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        border: '2px solid #111111',
                        background: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 22,
                        fontWeight: 900,
                        color: '#071b46',
                      }}
                    >
                      {method.icon}
                    </span>

                    <span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#071b46',
                        }}
                      >
                        {method.title}
                      </span>
                      <span
                        style={{
                          marginTop: 3,
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#657080',
                        }}
                      >
                        {method.subtitle}
                      </span>
                    </span>

                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: active ? '#55c75f' : '#ffffff',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 13,
                        fontWeight: 900,
                      }}
                    >
                      {active ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#fff7d8',
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#657080',
                  }}
                >
                  Selected method
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#071b46',
                  }}
                >
                  {selectedPaymentMethod.title}
                </div>
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#071b46',
                }}
              >
                £1
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              style={{
                marginTop: 14,
                width: '100%',
                minHeight: 58,
                borderRadius: 22,
                border: '2.5px solid #111111',
                background: '#071b46',
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Confirm payment · £1
            </button>

            <button
              type="button"
              onClick={() => setPaymentSheetOpen(false)}
              style={{
                marginTop: 10,
                width: '100%',
                minHeight: 52,
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#ffffff',
                color: '#071b46',
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
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
