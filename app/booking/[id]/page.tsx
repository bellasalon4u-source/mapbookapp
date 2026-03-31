'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById, ServiceItem } from '../../../services/masters';

type DateStatus = 'available' | 'partial' | 'full';

type DayItem = {
  iso: string;
  label: number;
  weekday: string;
  status: DateStatus;
};

function buildMonthDays() {
  const base = new Date();
  const result: DayItem[] = [];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 35; i += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);

    const dayNumber = date.getDate();
    let status: DateStatus = 'available';

    if (dayNumber % 5 === 0) status = 'full';
    else if (dayNumber % 2 === 0) status = 'partial';

    result.push({
      iso: date.toISOString().slice(0, 10),
      label: dayNumber,
      weekday: weekdays[date.getDay()],
      status,
    });
  }

  return result;
}

function buildTimeSlots(selectedDate: DayItem | null) {
  const slots = ['09:00', '10:30', '12:00', '14:00', '15:30', '16:00', '16:30', '17:00'];

  return slots.map((time, index) => {
    const unavailable =
      !selectedDate ||
      selectedDate.status === 'full' ||
      (selectedDate.status === 'partial' && index % 3 === 0);

    return {
      time,
      available: !unavailable,
    };
  });
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const serviceSlug = searchParams.get('service') || '';
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(serviceSlug);
  const [selectedDateIso, setSelectedDateIso] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const monthDays = useMemo(() => buildMonthDays(), []);
  const selectedDate = monthDays.find((day) => day.iso === selectedDateIso) || null;
  const timeSlots = useMemo(() => buildTimeSlots(selectedDate), [selectedDate]);

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const selectedService: ServiceItem | null =
    master.services.find((service) => service.slug === selectedServiceSlug) || null;

  const canConfirm = !!selectedService && !!selectedDate && !!selectedTime;

  function statusStyles(status: DateStatus) {
    if (status === 'available') {
      return { bg: '#dff1e3', color: '#248345' };
    }
    if (status === 'partial') {
      return { bg: '#ede7df', color: '#7c7368' };
    }
    return { bg: '#f7e0e0', color: '#d13e3e' };
  }

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
        <section style={{ padding: 24 }}>
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

            <div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Book appointment</div>
              <div style={{ fontSize: 18, color: '#7a7066', marginTop: 8 }}>{master.name}</div>
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
              display: 'grid',
              gridTemplateColumns: '120px 1fr auto',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 24 }}
            />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{master.name}</div>
              <div style={{ fontSize: 18, color: '#7a7066', marginTop: 10 }}>
                {master.title} • {master.city}
              </div>
            </div>
            <div
              style={{
                background: '#efe3cf',
                color: '#5c4a34',
                borderRadius: 20,
                padding: '16px 18px',
                fontWeight: 800,
                fontSize: 20,
                alignSelf: 'start',
              }}
            >
              {master.rating.toFixed(1)} ★
            </div>
          </div>

          <h2 style={{ marginTop: 28, fontSize: 30 }}>Price list</h2>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {master.services.map((service) => {
              const selected = selectedServiceSlug === service.slug;
              return (
                <div
                  key={service.slug}
                  style={{
                    background: '#fff',
                    border: selected ? '2px solid #2e9746' : '1px solid #e4d8ca',
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
                    onClick={() => {
                      setSelectedServiceSlug(service.slug);
                      setSelectedDateIso('');
                      setSelectedTime('');
                    }}
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
              );
            })}
          </div>

          {selectedService && (
            <>
              <h2 style={{ marginTop: 30, fontSize: 30 }}>Choose date</h2>

              <div
                style={{
                  marginTop: 14,
                  background: '#fff',
                  border: '1px solid #e4d8ca',
                  borderRadius: 28,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e4d8ca',
                    borderRadius: 22,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '96px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 18 }}
                  />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedService.title}</div>
                    <div style={{ marginTop: 8, color: '#746b62', fontSize: 16 }}>
                      {selectedService.duration}
                    </div>
                    <div style={{ marginTop: 8, color: '#231b15', fontSize: 18, fontWeight: 800 }}>
                      £{selectedService.price}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, fontSize: 18, fontWeight: 700 }}>Samsung-style availability</div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 10,
                  }}
                >
                  {monthDays.map((day) => {
                    const styles = statusStyles(day.status);
                    const selected = selectedDateIso === day.iso;
                    const disabled = day.status === 'full';

                    return (
                      <button
                        key={day.iso}
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setSelectedDateIso(day.iso);
                          setSelectedTime('');
                        }}
                        style={{
                          border: selected ? '2px solid #2f241c' : 'none',
                          background: styles.bg,
                          color: styles.color,
                          borderRadius: 18,
                          minHeight: 64,
                          padding: 8,
                          fontWeight: 800,
                          opacity: disabled ? 0.95 : 1,
                        }}
                      >
                        <div style={{ fontSize: 12 }}>{day.weekday}</div>
                        <div style={{ fontSize: 20, marginTop: 6 }}>{day.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 14, marginTop: 16, color: '#756b61', fontSize: 15 }}>
                  <span>🟢 Free</span>
                  <span>⚪ Partial</span>
                  <span>🔴 Full</span>
                </div>
              </div>

              {selectedDate && (
                <>
                  <h2 style={{ marginTop: 30, fontSize: 30 }}>Choose time</h2>

                  <div
                    style={{
                      marginTop: 14,
                      background: '#fff',
                      border: '1px solid #e4d8ca',
                      borderRadius: 28,
                      padding: 18,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          style={{
                            border: selectedTime === slot.time ? '2px solid #1f6d35' : '1px solid #ddd2c6',
                            background: !slot.available
                              ? '#f7dede'
                              : selectedTime === slot.time
                              ? '#2e9746'
                              : '#e0f2e3',
                            color: !slot.available
                              ? '#cf3f3f'
                              : selectedTime === slot.time
                              ? '#fff'
                              : '#1f6d35',
                            borderRadius: 18,
                            padding: '16px 14px',
                            fontSize: 20,
                            fontWeight: 800,
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>

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
              <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>Secure booking fee</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>£5</div>
            </div>
            <button
              disabled={!canConfirm}
              onClick={() => {
                if (!selectedService || !selectedDate || !selectedTime) return;

                router.push(
                  `/booking/${master.id}/success?service=${selectedService.slug}&date=${selectedDate.iso}&time=${selectedTime}`
                );
              }}
              style={{
                border: 'none',
                background: canConfirm ? '#2e9746' : '#b8d9bf',
                color: '#fff',
                borderRadius: 24,
                padding: '18px 26px',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              Confirm booking
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
