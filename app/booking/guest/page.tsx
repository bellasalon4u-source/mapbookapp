'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { addBooking } from '../../../services/bookingsStore';

type BookingMode = 'quick' | 'full';

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
  note: string;
  selectedDate: string;
  selectedTime: string;
  depositAmount: number;
  depositStatus: 'frozen';
  paymentMethod: string;
  bookingMode: BookingMode;
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
  location?: string;
  areaLabel?: string;
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

const BUSY_TIMES = ['11:00', '13:30', '16:00'];

const MORNING_TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const DAY_TIMES = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const EVENING_TIMES = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

const BRAND = {
  navy: '#071b46',
  green: '#24c45a',
  blue: '#0e73d8',
  red: '#ff2456',
  yellow: '#ffd629',
  border: '#111111',
  muted: '#657080',
};

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

  const current = JSON.parse(
    window.localStorage.getItem('olamep_guest_bookings') || '[]'
  ) as GuestBooking[];

  window.localStorage.setItem(
    'olamep_guest_bookings',
    JSON.stringify([booking, ...current])
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = getDaysInMonth(year, month);

  const cells: Array<{ day: number; currentMonth: boolean; date: Date }> = [];

  const prevMonthDays = getDaysInMonth(year, month - 1);

  for (let i = firstWeekDay - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    cells.push({
      day,
      currentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  while (cells.length < 42) {
    const day = cells.length - firstWeekDay - daysInMonth + 1;
    cells.push({
      day,
      currentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  return cells;
}

function isSameDate(a: Date | null, b: Date) {
  if (!a) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
}

function formatDate(date: Date | null) {
  if (!date) return 'Not selected';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));
}

function createBookingDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(date);

  next.setHours(hours || 0, minutes || 0, 0, 0);

  return next;
}

function cleanPrice(value: string) {
  const parsed = Number(String(value || '').replace(/[^\d.]/g, ''));

  if (!Number.isFinite(parsed) || parsed <= 0) return 45;

  return parsed;
}

function inputStyle(): CSSProperties {
  return {
    width: '100%',
    height: 58,
    borderRadius: 20,
    border: '2px solid #d8dde8',
    background: '#ffffff',
    color: BRAND.navy,
    fontSize: 16,
    fontWeight: 800,
    padding: '0 14px',
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function textareaStyle(): CSSProperties {
  return {
    width: '100%',
    minHeight: 120,
    borderRadius: 20,
    border: '2px solid #d8dde8',
    background: '#ffffff',
    color: BRAND.navy,
    fontSize: 16,
    fontWeight: 800,
    padding: '16px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
    fontFamily: 'Arial, sans-serif',
  };
}

export default function GuestBookingPage() {
  const router = useRouter();

  const [pending, setPending] = useState<PendingBooking | null>(null);

  const today = useMemo(() => new Date(), []);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<'date' | 'time' | 'details'>('date');

  const [bookingMode, setBookingMode] = useState<BookingMode>('quick');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
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
      location: 'London',
      areaLabel: 'London',
    });
  }, []);

  const masterName = pending?.masterName || 'Professional';
  const category = pending?.category || 'Service';
  const subcategory = pending?.subcategory || '';
  const price = pending?.price || '45';
  const avatar =
    pending?.avatar ||
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80';

  const numericPrice = cleanPrice(price);

  const selectedPaymentMethod =
    PAYMENT_METHODS.find((method) => method.id === selectedPayment) || PAYMENT_METHODS[0];

  const calendarDays = useMemo(
    () => getCalendarDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  const canContinueToDetails = Boolean(selectedDate && selectedTime);

  const canOpenPayment = useMemo(() => {
    return (
      canContinueToDetails &&
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      phone.trim().length >= 6 &&
      accepted
    );
  }, [accepted, canContinueToDetails, firstName, lastName, phone]);

  const selectedDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    return createBookingDateTime(selectedDate, selectedTime);
  }, [selectedDate, selectedTime]);

  const handlePrevMonth = () => {
    const next = new Date(calendarYear, calendarMonth - 1, 1);
    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
  };

  const handleNextMonth = () => {
    const next = new Date(calendarYear, calendarMonth + 1, 1);
    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
  };

  const handleSelectDate = (date: Date) => {
    if (isPastDate(date)) return;

    setSelectedDate(date);
    setSelectedTime('');
    setStep('date');
  };

  const handleChooseTime = () => {
    if (!selectedDate) return;
    setStep('time');
  };

  const handleContinueToDetails = () => {
    if (!canContinueToDetails) return;
    setStep('details');
  };

  const handleOpenPayment = () => {
    if (!canOpenPayment) return;
    setPaymentSheetOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedDateTime) return;

    const bookingId = `guest_booking_${Date.now()}`;

    const guestBooking: GuestBooking = {
      id: bookingId,
      masterId: pending?.masterId || 'guest',
      masterName,
      category,
      subcategory,
      price,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      note: note.trim(),
      selectedDate: selectedDateTime.toISOString(),
      selectedTime,
      depositAmount: 1,
      depositStatus: 'frozen',
      paymentMethod: selectedPaymentMethod.id,
      bookingMode,
      status: 'reserved',
      createdAt: new Date().toISOString(),
    };

    saveGuestBooking(guestBooking);

    addBooking({
      id: bookingId,
      masterId: pending?.masterId || 'guest',
      masterName,
      masterAvatar: avatar,
      serviceName: subcategory || category || 'Service',
      category,
      location: pending?.location || pending?.areaLabel || 'London',
      areaLabel: pending?.areaLabel || pending?.location || 'London',
      exactAddress: '',
      dateLabel: `${formatDate(selectedDate)} ${selectedTime}`,
      dateTime: selectedDateTime.toISOString(),
      price: numericPrice,
      status: 'pending',
      unlockFeePaid: true,
      bookingConfirmedByMaster: false,
      clientPaid: true,
      paymentReceivedByPlatform: true,
      promotionPaidByMaster: false,
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('olamep_pending_guest_booking');
    }

    setPaymentSheetOpen(false);
    setSuccess(true);

    window.setTimeout(() => {
      router.push('/bookings');
    }, 900);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #eef4ff 0%, #ffffff 45%, #fff1f4 100%)',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          padding: '18px 16px 118px',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr 54px',
              gap: 12,
              alignItems: 'center',
              marginBottom: 22,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (step === 'details') {
                  setStep('time');
                  return;
                }

                if (step === 'time') {
                  setStep('date');
                  return;
                }

                router.back();
              }}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: 'none',
                background: 'transparent',
                color: BRAND.navy,
                fontSize: 34,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 46,
                  height: 56,
                  borderRadius: '50% 50% 58% 58%',
                  background:
                    'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
                  position: 'relative',
                  boxShadow: '0 8px 22px rgba(14,115,216,0.22)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: '#ffffff',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: 18,
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: BRAND.navy,
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: BRAND.navy,
                  letterSpacing: '-1.2px',
                }}
              >
                Olamep
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: `3px solid ${BRAND.green}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 27,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              💬
            </button>
          </header>

          <section style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 44,
                lineHeight: 0.95,
                fontWeight: 900,
                letterSpacing: '-1.7px',
                color: BRAND.navy,
              }}
            >
              {step === 'date'
                ? 'Choose date'
                : step === 'time'
                ? 'Choose time'
                : 'Booking details'}
            </h1>

            <p
              style={{
                margin: '14px 0 0',
                fontSize: 20,
                lineHeight: 1.25,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {step === 'date'
                ? 'Select the best date for your appointment'
                : step === 'time'
                ? 'Select available time for your appointment'
                : 'Add your details and hold the booking'}
            </p>
          </section>

          <ServiceSummaryCard
            avatar={avatar}
            masterName={masterName}
            category={category}
            subcategory={subcategory}
            price={numericPrice}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />

          {step === 'date' ? (
            <section
              style={{
                marginTop: 18,
                borderRadius: 30,
                border: `3px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 16,
                boxShadow: '0 14px 28px rgba(7,27,70,0.06)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '58px 1fr 58px',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  style={roundButtonStyle}
                >
                  ‹
                </button>

                <div
                  style={{
                    height: 58,
                    borderRadius: 18,
                    border: '2px solid #d8dde8',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {formatMonthTitle(calendarYear, calendarMonth)}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={roundButtonStyle}
                >
                  ›
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 7,
                }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div
                    key={day}
                    style={{
                      height: 32,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      fontWeight: 900,
                      color: BRAND.muted,
                    }}
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((cell) => {
                  const selected = isSameDate(selectedDate, cell.date);
                  const disabled = !cell.currentMonth || isPastDate(cell.date);

                  return (
                    <button
                      key={cell.date.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDate(cell.date)}
                      style={{
                        minHeight: 62,
                        borderRadius: 18,
                        border: selected
                          ? `3px solid ${BRAND.blue}`
                          : '2px solid #e5e7eb',
                        background: selected
                          ? '#eef6ff'
                          : disabled
                          ? '#f4f4f5'
                          : '#ffffff',
                        color: selected
                          ? BRAND.blue
                          : disabled
                          ? '#c8cdd5'
                          : BRAND.navy,
                        fontSize: 22,
                        fontWeight: 900,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        boxShadow: selected ? '0 0 0 4px rgba(14,115,216,0.08)' : 'none',
                      }}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 'time' ? (
            <section
              style={{
                marginTop: 18,
                borderRadius: 30,
                border: `3px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 18,
                boxShadow: '0 14px 28px rgba(7,27,70,0.06)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                Available time
              </h2>

              <div
                style={{
                  marginTop: 18,
                  borderRadius: 22,
                  background: '#f4f6fb',
                  padding: 16,
                  fontSize: 18,
                  fontWeight: 900,
                  color: BRAND.blue,
                }}
              >
                📅 {formatDate(selectedDate)}
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 15,
                    color: BRAND.muted,
                    fontWeight: 800,
                  }}
                >
                  Busy slots are unavailable.
                </div>
              </div>

              <TimeGroup
                title="Morning"
                times={MORNING_TIMES}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
              />

              <TimeGroup
                title="Day"
                times={DAY_TIMES}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
              />

              <TimeGroup
                title="Evening"
                times={EVENING_TIMES}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
              />
            </section>
          ) : null}

          {step === 'details' ? (
            <>
              <section
                style={{
                  marginTop: 18,
                  borderRadius: 30,
                  border: `3px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 16,
                  boxShadow: '0 14px 28px rgba(7,27,70,0.06)',
                }}
              >
                <div
                  style={{
                    borderRadius: 24,
                    border: '2px solid #d8dde8',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                  }}
                >
                  <BookingModeCard
                    active={bookingMode === 'quick'}
                    icon="💬"
                    title="Quick"
                    description="Minimum details. The provider can contact you only via Olamep chat."
                    badge="Chat only"
                    onClick={() => setBookingMode('quick')}
                  />

                  <BookingModeCard
                    active={bookingMode === 'full'}
                    icon="🔐"
                    title="Full"
                    description="Contacts unlock for the provider only after confirmation and payment."
                    badge="Contacts after confirmation"
                    onClick={() => setBookingMode('full')}
                  />
                </div>
              </section>

              <section
                style={{
                  marginTop: 18,
                  borderRadius: 30,
                  border: `3px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 18,
                  boxShadow: '0 14px 28px rgba(7,27,70,0.06)',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  Contact details
                </h2>

                <div
                  style={{
                    marginTop: 20,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                  }}
                >
                  <label style={{ display: 'grid', gap: 8 }}>
                    <FieldHeader label="First name" required />
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First name"
                      style={inputStyle()}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: 8 }}>
                    <FieldHeader label="Last name" required />
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last name"
                      style={inputStyle()}
                    />
                  </label>
                </div>

                <label style={{ marginTop: 18, display: 'grid', gap: 8 }}>
                  <FieldHeader label="Phone" required />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '128px 1fr',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        height: 58,
                        borderRadius: 20,
                        border: '2px solid #d8dde8',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        color: BRAND.navy,
                        fontSize: 19,
                        fontWeight: 900,
                      }}
                    >
                      🇬🇧 +44
                    </div>

                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Phone"
                      inputMode="tel"
                      style={inputStyle()}
                    />
                  </div>
                </label>

                <label style={{ marginTop: 18, display: 'grid', gap: 8 }}>
                  <FieldHeader label="Note for provider" optional />
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Preferences, service details or important notes"
                    style={textareaStyle()}
                  />
                </label>
              </section>

              <section
                style={{
                  marginTop: 18,
                  borderRadius: 30,
                  border: `3px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 18,
                  textAlign: 'center',
                  boxShadow: '0 14px 28px rgba(7,27,70,0.06)',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  Contacts protected
                </h2>

                <p
                  style={{
                    margin: '12px 0 0',
                    fontSize: 15,
                    lineHeight: 1.4,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  Phone, social links and direct contacts stay protected. After the £1 hold,
                  chat opens. Exact contacts open only after provider confirmation.
                </p>

                <button
                  type="button"
                  onClick={() => setAccepted((prev) => !prev)}
                  style={{
                    marginTop: 16,
                    width: '100%',
                    borderRadius: 20,
                    border: `2px solid ${BRAND.border}`,
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
                      border: `2px solid ${BRAND.border}`,
                      background: accepted ? BRAND.green : '#ffffff',
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
                      color: BRAND.navy,
                    }}
                  >
                    I understand that £1 will be frozen to reserve this booking.
                    The provider must confirm the booking.
                  </span>
                </button>
              </section>

              {success ? (
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 22,
                    border: `2px solid ${BRAND.border}`,
                    background: '#dcffe8',
                    color: '#008f3a',
                    padding: 14,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  ✓ £1 frozen. Booking is waiting for provider confirmation.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </main>

      <footer
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.96)',
          borderTop: '1px solid #e6e8ee',
          padding: '10px 16px calc(12px + env(safe-area-inset-bottom))',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            borderRadius: 24,
            border: '2px solid #d8dde8',
            background: '#ffffff',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            overflow: 'hidden',
            minHeight: 78,
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              display: 'grid',
              gridTemplateColumns: '54px 1fr',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: `3px solid ${BRAND.green}`,
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                background: '#ffffff',
              }}
            >
              💬
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                {step === 'date'
                  ? 'Selected date'
                  : step === 'time'
                  ? 'Selected time'
                  : 'Next step'}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 23,
                  fontWeight: 900,
                  color:
                    step === 'details' || selectedDate || selectedTime
                      ? BRAND.navy
                      : '#a7adb8',
                  lineHeight: 1.05,
                }}
              >
                {step === 'date'
                  ? formatDate(selectedDate)
                  : step === 'time'
                  ? selectedTime || 'Not selected'
                  : 'Hold deposit'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={
              step === 'date'
                ? !selectedDate
                : step === 'time'
                ? !selectedTime
                : !canOpenPayment
            }
            onClick={() => {
              if (step === 'date') {
                handleChooseTime();
                return;
              }

              if (step === 'time') {
                handleContinueToDetails();
                return;
              }

              handleOpenPayment();
            }}
            style={{
              border: 'none',
              borderLeft: '2px solid #d8dde8',
              background:
                (step === 'date' && selectedDate) ||
                (step === 'time' && selectedTime) ||
                (step === 'details' && canOpenPayment)
                  ? BRAND.green
                  : '#b9dec2',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              cursor:
                (step === 'date' && selectedDate) ||
                (step === 'time' && selectedTime) ||
                (step === 'details' && canOpenPayment)
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            {step === 'date'
              ? 'Choose time →'
              : step === 'time'
              ? 'Continue →'
              : 'Continue →'}
          </button>
        </div>
      </footer>

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
              border: `3px solid ${BRAND.border}`,
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
                    color: BRAND.navy,
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
                    color: BRAND.muted,
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
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.navy,
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
                      border: `2px solid ${BRAND.border}`,
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
                        border: `2px solid ${BRAND.border}`,
                        background: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 22,
                        fontWeight: 900,
                        color: BRAND.navy,
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
                          color: BRAND.navy,
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
                          color: BRAND.muted,
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
                        border: `2px solid ${BRAND.border}`,
                        background: active ? BRAND.green : '#ffffff',
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
                border: `2px solid ${BRAND.border}`,
                background: '#fff7d8',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: BRAND.muted,
                  }}
                >
                  Selected method
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 16,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {selectedPaymentMethod.title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  Booking waits for provider confirmation.
                </div>
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: BRAND.navy,
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
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.navy,
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
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
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

function ServiceSummaryCard({
  avatar,
  masterName,
  category,
  subcategory,
  price,
  selectedDate,
  selectedTime,
}: {
  avatar: string;
  masterName: string;
  category: string;
  subcategory: string;
  price: number;
  selectedDate: Date | null;
  selectedTime: string;
}) {
  return (
    <section
      style={{
        borderRadius: 26,
        border: `3px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 14,
        display: 'grid',
        gridTemplateColumns: '118px 1fr auto',
        gap: 14,
        alignItems: 'center',
        boxShadow: '0 12px 26px rgba(7,27,70,0.06)',
      }}
    >
      <img
        src={avatar}
        alt={masterName}
        style={{
          width: 118,
          height: 118,
          borderRadius: 18,
          objectFit: 'cover',
          display: 'block',
        }}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.05,
            fontWeight: 900,
            color: BRAND.navy,
          }}
        >
          {masterName}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 19,
            lineHeight: 1.1,
            fontWeight: 800,
            color: '#505b6d',
          }}
        >
          {subcategory || category}
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 15,
            fontWeight: 900,
            color: BRAND.blue,
          }}
        >
          <span>📅 {formatDate(selectedDate)}</span>
          {selectedTime ? <span>🕒 {selectedTime}</span> : null}
          <span>⏱ 45m</span>
        </div>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: BRAND.navy,
          alignSelf: 'center',
        }}
      >
        £{price}
      </div>
    </section>
  );
}

function TimeGroup({
  title,
  times,
  selectedTime,
  onSelect,
}: {
  title: string;
  times: string[];
  selectedTime: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900,
            color: BRAND.navy,
          }}
        >
          {title}
        </h3>

        <div
          style={{
            borderRadius: 999,
            border: `2px solid ${BRAND.green}`,
            color: BRAND.green,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          Fast booking
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {times.map((time) => {
          const busy = BUSY_TIMES.includes(time);
          const selected = selectedTime === time;

          return (
            <button
              key={time}
              type="button"
              disabled={busy}
              onClick={() => onSelect(time)}
              style={{
                minHeight: 92,
                borderRadius: 20,
                border: selected
                  ? `3px solid ${BRAND.green}`
                  : '2px solid #d8dde8',
                background: busy ? '#f0f1f3' : selected ? '#dcffe8' : '#ffffff',
                color: busy ? '#b9bec8' : selected ? '#008f3a' : BRAND.navy,
                cursor: busy ? 'not-allowed' : 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
              }}
            >
              <span style={{ fontSize: 25 }}>{time}</span>
              <span style={{ fontSize: 13 }}>{busy ? 'Busy' : 'Available'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingModeCard({
  active,
  icon,
  title,
  description,
  badge,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 260,
        border: 'none',
        borderRight: title === 'Quick' ? '2px solid #d8dde8' : 'none',
        background: active ? '#eef6ff' : '#ffffff',
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '54px 1fr',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: title === 'Quick' ? BRAND.green : BRAND.blue,
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: active ? 'none' : '3px solid #d8dde8',
            background: active ? BRAND.green : '#ffffff',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            fontWeight: 900,
            justifySelf: 'end',
          }}
        >
          {active ? '✓' : ''}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          fontSize: 27,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 15,
          lineHeight: 1.35,
          fontWeight: 800,
          color: BRAND.muted,
        }}
      >
        {description}
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'inline-flex',
          borderRadius: 999,
          background: title === 'Quick' ? BRAND.green : '#f0f1f5',
          color: title === 'Quick' ? '#ffffff' : BRAND.muted,
          padding: '10px 14px',
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        {badge}
      </div>
    </button>
  );
}

function FieldHeader({
  label,
  required,
  optional,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {label}
      </span>

      {required ? (
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: BRAND.muted,
          }}
        >
          Required
        </span>
      ) : null}

      {optional ? (
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: BRAND.muted,
          }}
        >
          Optional
        </span>
      ) : null}
    </div>
  );
}

const roundButtonStyle: CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 999,
  border: '2px solid #d8dde8',
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 32,
  fontWeight: 900,
  cursor: 'pointer',
};
