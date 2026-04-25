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

type DateStatus = 'free' | 'full' | 'partial' | 'past';

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

type MasterLike = {
  id: string | number;
  name: string;
  title: string;
  city: string;
  avatar: string;
  services: ServiceLike[];
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
      chooseDate: 'Выберите дату',
      subtitle: 'Выберите удобный день для визита',
      selectedServices: 'Выбранная услуга',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      today: 'Сегодня',
      available: 'Доступно',
      unavailable: 'Недоступно',
      partial: 'Частично',
      selectedDate: 'Выбранная дата',
      notSelected: 'Не выбрано',
      chooseTime: 'Выбрать время',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
      monthsFull: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
      ],
      monthsShort: [
        'янв',
        'фев',
        'мар',
        'апр',
        'май',
        'июн',
        'июл',
        'авг',
        'сен',
        'окт',
        'ноя',
        'дек',
      ],
      weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      message: 'Сообщения',
    };
  }

  if (language === 'UA') {
    return {
      bookingDataNotFound: 'Дані бронювання не знайдені',
      chooseDate: 'Оберіть дату',
      subtitle: 'Оберіть зручний день для візиту',
      selectedServices: 'Обрана послуга',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      today: 'Сьогодні',
      available: 'Доступно',
      unavailable: 'Недоступно',
      partial: 'Частково',
      selectedDate: 'Обрана дата',
      notSelected: 'Не обрано',
      chooseTime: 'Обрати час',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
      monthsFull: [
        'Січень',
        'Лютий',
        'Березень',
        'Квітень',
        'Травень',
        'Червень',
        'Липень',
        'Серпень',
        'Вересень',
        'Жовтень',
        'Листопад',
        'Грудень',
      ],
      monthsShort: [
        'січ',
        'лют',
        'бер',
        'кві',
        'тра',
        'чер',
        'лип',
        'сер',
        'вер',
        'жов',
        'лис',
        'гру',
      ],
      weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
      message: 'Повідомлення',
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseDate: 'Choose date',
    subtitle: 'Select the best date for your appointment',
    selectedServices: 'Selected service',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    today: 'Today',
    available: 'Available',
    unavailable: 'Unavailable',
    partial: 'Partial',
    selectedDate: 'Selected date',
    notSelected: 'Not selected',
    chooseTime: 'Choose time',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
    monthsFull: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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

function listingToMasterShape(listing: ListingLike, index: number, language: AppLanguage): MasterLike {
  const text = getTexts(language);

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
    id: listing.id,
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

function getDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
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

function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const leadingEmpty = Array.from({ length: mondayBasedOffset }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));

  const totalCells = Math.ceil((leadingEmpty.length + days.length) / 7) * 7;
  const trailingEmpty = Array.from(
    { length: Math.max(0, totalCells - leadingEmpty.length - days.length) },
    () => null
  );

  return [...leadingEmpty, ...days, ...trailingEmpty];
}

function getStatusForDate(date: Date, today: Date): DateStatus {
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (normalizedDate < normalizedToday) return 'past';

  const day = normalizedDate.getDate();

  if (day % 7 === 0) return 'full';
  if (day % 5 === 0) return 'partial';

  return 'free';
}

function getStatusStyle(status: DateStatus, active: boolean, isToday: boolean) {
  if (active) {
    return {
      background: BRAND.blue,
      color: '#ffffff',
      border: `2px solid ${BRAND.blue}`,
      boxShadow: '0 8px 18px rgba(20,103,242,0.22)',
    };
  }

  if (status === 'past') {
    return {
      background: '#f3f4f6',
      color: '#b6bbc5',
      border: '1.5px solid #e1e4ea',
      boxShadow: 'none',
    };
  }

  if (status === 'full') {
    return {
      background: '#fff3f3',
      color: '#b8bdc7',
      border: '1.5px solid #e1e4ea',
      boxShadow: 'none',
    };
  }

  if (status === 'partial') {
    return {
      background: '#fffaf0',
      color: '#111111',
      border: `1.5px solid ${BRAND.border}`,
      boxShadow: 'none',
    };
  }

  if (isToday) {
    return {
      background: '#ffffff',
      color: BRAND.blue,
      border: `2px solid ${BRAND.blue}`,
      boxShadow: 'none',
    };
  }

  return {
    background: '#ffffff',
    color: BRAND.navy,
    border: `1.5px solid #d8dde8`,
    boxShadow: 'none',
  };
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = String(params.id);
  const servicesParam = searchParams.get('services') || '';

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [activeYear, setActiveYear] = useState(today.getFullYear());
  const [activeMonth, setActiveMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState('');

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

  const text = useMemo(() => getTexts(language), [language]);

  const master = useMemo(() => {
    const builtInMaster = getMasterById(id);
    if (builtInMaster) return builtInMaster as MasterLike;

    const listings = getListings() as ListingLike[];
    const listingIndex = listings.findIndex((item) => String(item.id) === id);

    if (listingIndex !== -1) {
      return listingToMasterShape(listings[listingIndex], listingIndex, language);
    }

    const fallbackMaster = (getAllMasters() as any[]).find((item) => String(item.id) === id);
    if (fallbackMaster) return fallbackMaster as MasterLike;

    return null;
  }, [id, language]);

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = useMemo(() => {
    if (!master) return [] as ServiceLike[];

    return master.services.filter((service) => selectedServiceSlugs.includes(service.slug));
  }, [master, selectedServiceSlugs]);

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const calendarCells = getMonthDates(activeYear, activeMonth);
  const selectedDate = selectedDateKey ? new Date(`${selectedDateKey}T12:00:00`) : null;
  const primaryService = selectedItems[0];

  if (!master || !selectedItems.length || !primaryService) {
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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        paddingBottom: 122,
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
            {text.chooseDate}
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
              src={primaryService.image}
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
                <span>📅 {selectedDate ? selectedDate.getDate() : '—'} {selectedDate ? text.monthsShort[selectedDate.getMonth()] : ''}</span>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px',
              gap: 10,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const prev = new Date(activeYear, activeMonth - 1, 1);
                setActiveYear(prev.getFullYear());
                setActiveMonth(prev.getMonth());
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `1.5px solid #d8dde8`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ‹
            </button>

            <div
              style={{
                minHeight: 42,
                borderRadius: 14,
                border: `1.5px solid #d8dde8`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 19,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {text.monthsFull[activeMonth]} {activeYear}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = new Date(activeYear, activeMonth + 1, 1);
                setActiveYear(next.getFullYear());
                setActiveMonth(next.getMonth());
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `1.5px solid #d8dde8`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
              color: '#515866',
              fontSize: 12,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {text.weekdaysShort.map((weekday) => (
              <div key={weekday}>{weekday}</div>
            ))}
          </div>

          <div
            style={{
              marginTop: 9,
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
            }}
          >
            {calendarCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: 50 }} />;
              }

              const key = getDateKey(date);
              const status = getStatusForDate(date, today);
              const active = selectedDateKey === key;
              const isToday = sameDay(date, today);
              const disabled = status === 'full' || status === 'past';
              const styles = getStatusStyle(status, active, isToday);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedDateKey(key);
                  }}
                  style={{
                    minHeight: 52,
                    borderRadius: 13,
                    textAlign: 'center',
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontWeight: 900,
                    padding: 0,
                    ...styles,
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              fontSize: 12,
              color: BRAND.muted,
              fontWeight: 800,
            }}
          >
            <div>● {text.available}</div>
            <div style={{ color: '#ad7200' }}>● {text.partial}</div>
            <div style={{ color: '#9ca3af' }}>● {text.unavailable}</div>
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
              gridTemplateColumns: '1fr 1.5px 1.4fr',
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
                  {text.selectedDate}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 20,
                    color: selectedDate ? BRAND.navy : '#9ca3af',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {selectedDate
                    ? `${selectedDate.getDate()} ${text.monthsShort[selectedDate.getMonth()]}`
                    : text.notSelected}
                </div>
              </div>
            </div>

            <div style={{ height: 46, background: '#d9dee8' }} />

            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => {
                if (!selectedDate) return;

                const servicesEncoded = encodeURIComponent(selectedServiceSlugs.join(','));
                const dateEncoded = encodeURIComponent(
                  `${selectedDate.getDate()} ${
                    text.monthsShort[selectedDate.getMonth()]
                  } ${selectedDate.getFullYear()}`
                );

                router.push(
                  `/booking/${master.id}/time?services=${servicesEncoded}&date=${dateEncoded}`
                );
              }}
              style={{
                height: 74,
                border: 0,
                background: selectedDate ? BRAND.green : '#b7d9bf',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 18,
                cursor: selectedDate ? 'pointer' : 'not-allowed',
              }}
            >
              {text.chooseTime} →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
