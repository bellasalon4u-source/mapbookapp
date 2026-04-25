'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById, getAllMasters } from '../../../../services/masters';
import { getListings } from '../../../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { formatDisplayPrice } from '../../../../services/currencyDisplay';

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

type ServiceLike = {
  slug: string;
  title: string;
  duration: string;
  price: number;
  image: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#1467f2',
  green: '#21b84b',
  red: '#ff4b4b',
  border: '#111111',
  muted: '#626977',
};

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingDataNotFound: 'Данные бронирования не найдены',
      chooseTime: 'Выберите время',
      subtitle: 'Выберите удобное время для визита',
      selectedServices: 'Выбранная услуга',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      availableTime: 'Доступное время',
      selectedDate: 'Выбранная дата',
      selected: 'Выбрано',
      notSelected: 'Не выбрано',
      continue: 'Продолжить',
      morning: 'Утро',
      day: 'День',
      evening: 'Вечер',
      busy: 'Занято',
      available: 'Доступно',
      fastBooking: 'Быстрая бронь',
      timeHint: 'Занятые слоты недоступны.',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
      message: 'Сообщения',
    };
  }

  if (language === 'UA') {
    return {
      bookingDataNotFound: 'Дані бронювання не знайдено',
      chooseTime: 'Оберіть час',
      subtitle: 'Оберіть зручний час для візиту',
      selectedServices: 'Обрана послуга',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      availableTime: 'Доступний час',
      selectedDate: 'Обрана дата',
      selected: 'Обрано',
      notSelected: 'Не обрано',
      continue: 'Продовжити',
      morning: 'Ранок',
      day: 'День',
      evening: 'Вечір',
      busy: 'Зайнято',
      available: 'Доступно',
      fastBooking: 'Швидке бронювання',
      timeHint: 'Зайняті слоти недоступні.',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
      message: 'Повідомлення',
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseTime: 'Choose time',
    subtitle: 'Select the best time for your appointment',
    selectedServices: 'Selected service',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    availableTime: 'Available time',
    selectedDate: 'Selected date',
    selected: 'Selected',
    notSelected: 'Not selected',
    continue: 'Continue',
    morning: 'Morning',
    day: 'Day',
    evening: 'Evening',
    busy: 'Busy',
    available: 'Available',
    fastBooking: 'Fast booking',
    timeHint: 'Busy slots are unavailable.',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
    message: 'Messages',
  };
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 34,
          height: 42,
          position: 'relative',
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #1467f2 0deg, #20c96b 90deg, #ffd629 160deg, #ff3f68 230deg, #1467f2 360deg)',
          boxShadow: '0 8px 18px rgba(20,103,242,0.18)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 17,
            height: 17,
            borderRadius: '50%',
            background: '#ffffff',
            border: '4px solid #071b46',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function MessageIcon() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: `2px solid ${BRAND.green}`,
        background: '#ffffff',
        color: BRAND.green,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        fontWeight: 900,
      }}
    >
      💬
    </div>
  );
}

function parseDurationToMinutes(value: string) {
  const text = String(value || '').toLowerCase();

  const hourMatch = text.match(/(\d+)\s*(h|hour|hours|ч|г|std)/i);
  const minuteMatch = text.match(/(\d+)\s*(m|min|mins|minute|minutes|м|хв)/i);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours === 0 && minutes === 0) {
    const onlyNumber = Number(text.replace(/[^\d.]/g, ''));
    if (Number.isFinite(onlyNumber) && onlyNumber > 0) return onlyNumber;
  }

  return hours * 60 + minutes;
}

function formatMinutes(minutes: number, language: AppLanguage) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (!minutes) return '0m';

  if (language === 'RU') {
    if (h > 0 && m > 0) return `${h}ч ${m}м`;
    if (h > 0) return `${h}ч`;
    return `${m}м`;
  }

  if (language === 'UA') {
    if (h > 0 && m > 0) return `${h}г ${m}хв`;
    if (h > 0) return `${h}г`;
    return `${m}хв`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function listingToMasterShape(listing: ListingLike, index: number, text: ReturnType<typeof getTexts>) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
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
    id: String(listing.id),
    name: listing.title || text.providerFallback,
    title: listing.subcategory || text.serviceProviderFallback,
    city: listing.location || 'London',
    avatar: gallery[0],
    services: [
      {
        slug: 'main-service',
        title: listing.subcategory || listing.title || text.serviceFallback,
        duration: listing.hours || '1h',
        price: priceFrom,
        image: gallery[0],
      },
      {
        slug: 'premium-service',
        title: text.premiumOption,
        duration: '2h',
        price: priceFrom + 20,
        image: gallery[1] || gallery[0],
      },
    ],
  };
}

const timeGroups = [
  {
    id: 'morning',
    slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  },
  {
    id: 'day',
    slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  },
  {
    id: 'evening',
    slots: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'],
  },
] as const;

const busySlots = new Set(['11:00', '13:30', '17:30']);

function getGroupTitle(id: string, text: ReturnType<typeof getTexts>) {
  if (id === 'morning') return text.morning;
  if (id === 'day') return text.day;
  return text.evening;
}

export default function BookingTimePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedTime, setSelectedTime] = useState('');

  const text = useMemo(() => getTexts(language), [language]);

  const id = String(params.id);
  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      unsubLanguage();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const master = useMemo(() => {
    const builtInMaster = getMasterById(id);
    if (builtInMaster) return builtInMaster as any;

    const listings = getListings() as ListingLike[];
    const listingIndex = listings.findIndex((item) => String(item.id) === id);

    if (listingIndex !== -1) {
      return listingToMasterShape(listings[listingIndex], listingIndex, text);
    }

    const fallbackMaster = (getAllMasters() as any[]).find((item: any) => String(item.id) === id);
    if (fallbackMaster) return fallbackMaster;

    return null;
  }, [id, text]);

  const selectedItems = useMemo(() => {
    if (!master) return [] as ServiceLike[];

    return master.services.filter((service: ServiceLike) =>
      selectedServiceSlugs.includes(service.slug)
    );
  }, [master, selectedServiceSlugs]);

  if (!master || !selectedItems.length || !date) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
        }}
      >
        {text.bookingDataNotFound}
      </main>
    );
  }

  const totalPrice = selectedItems.reduce((sum: number, item: ServiceLike) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum: number, item: ServiceLike) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const primaryService = selectedItems[0];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        paddingBottom: 126,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 18px 112px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '46px 1fr 46px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 46,
              height: 46,
              border: 0,
              background: 'transparent',
              fontSize: 38,
              lineHeight: 1,
              color: BRAND.navy,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/messages')}
            style={{
              width: 46,
              height: 46,
              border: 0,
              background: 'transparent',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <MessageIcon />
          </button>
        </header>

        <section style={{ marginTop: 28 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: '-1.6px',
              color: BRAND.navy,
            }}
          >
            {text.chooseTime}
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 500,
              color: '#515866',
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
            boxShadow: '0 8px 22px rgba(7,27,70,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr auto',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <img
              src={primaryService.image || master.avatar}
              alt={primaryService.title}
              style={{
                width: 96,
                height: 96,
                borderRadius: 14,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 21,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: BRAND.navy,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {master.name}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: '#4f5663',
                  fontSize: 16,
                  lineHeight: 1.25,
                  fontWeight: 500,
                }}
              >
                {primaryService.title}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  flexWrap: 'wrap',
                  color: BRAND.blue,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                <span>📅 {date}</span>
                <span style={{ color: '#c8cdd7' }}>|</span>
                <span>⏱ {formatMinutes(totalMinutes, language)}</span>
              </div>
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: BRAND.navy,
                whiteSpace: 'nowrap',
              }}
            >
              {formatDisplayPrice(totalPrice)}
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            background: '#ffffff',
            border: `2px solid ${BRAND.border}`,
            borderRadius: 18,
            padding: 14,
            boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
          }}
        >
          <div style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 900, color: BRAND.navy }}>
            {text.availableTime}
          </div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 16,
              background: '#f5f7fb',
              padding: '12px 14px',
              color: '#515866',
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: BRAND.blue, fontWeight: 900 }}>📅 {date}</span>
            <br />
            {text.timeHint}
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 20 }}>
            {timeGroups.map((group) => (
              <div key={group.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.navy }}>
                    {getGroupTitle(group.id, text)}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      background: '#edf9ef',
                      color: BRAND.green,
                      border: `1.5px solid ${BRAND.green}`,
                      padding: '6px 10px',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {text.fastBooking}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                  }}
                >
                  {group.slots.map((slot) => {
                    const active = selectedTime === slot;
                    const busy = busySlots.has(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (busy) return;
                          setSelectedTime(slot);
                        }}
                        style={{
                          minHeight: 64,
                          borderRadius: 16,
                          padding: '10px 8px',
                          border: active
                            ? `2px solid ${BRAND.blue}`
                            : busy
                            ? '1.5px solid #e1e4ea'
                            : '1.5px solid #d8dde8',
                          background: active ? BRAND.blue : busy ? '#f3f4f6' : '#ffffff',
                          color: active ? '#ffffff' : busy ? '#a7acb6' : BRAND.navy,
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: busy ? 0.72 : 1,
                          boxShadow: active ? '0 8px 18px rgba(20,103,242,0.22)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 19, fontWeight: 900 }}>{slot}</div>
                        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800 }}>
                          {busy ? text.busy : text.available}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          borderTop: '1px solid #e4e7ee',
          padding: '12px 18px calc(14px + env(safe-area-inset-bottom))',
          zIndex: 40,
          boxShadow: '0 -12px 28px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              minHeight: 74,
              borderRadius: 18,
              border: '1.5px solid #d9dee8',
              background: '#ffffff',
              display: 'grid',
              gridTemplateColumns: '1fr 1.5px 1.25fr',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <MessageIcon />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                  {text.selected}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 20,
                    color: selectedTime ? BRAND.navy : '#9ca3af',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {selectedTime || text.notSelected}
                </div>
              </div>
            </div>

            <div style={{ height: 46, background: '#d9dee8' }} />

            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => {
                if (!selectedTime) return;

                const servicesEncoded = encodeURIComponent(selectedServiceSlugs.join(','));

                router.push(
                  `/booking/${master.id}/details?services=${servicesEncoded}&date=${encodeURIComponent(
                    date
                  )}&time=${encodeURIComponent(selectedTime)}`
                );
              }}
              style={{
                height: 74,
                border: 0,
                background: selectedTime ? BRAND.green : '#b7d9bf',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 20,
                cursor: selectedTime ? 'pointer' : 'not-allowed',
              }}
            >
              {text.continue} →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
