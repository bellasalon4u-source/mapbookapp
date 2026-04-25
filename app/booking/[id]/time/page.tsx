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

function parseDurationToMinutes(value: string) {
  const hourMatch = value.match(/(\d+)\s*h/i);
  const minuteMatch = value.match(/(\d+)\s*m/i);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}

function listingToMasterShape(listing: ListingLike, index: number, text: ReturnType<typeof getTexts>) {
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

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingDataNotFound: 'Данные бронирования не найдены',
      chooseTime: 'Выберите время',
      selectedServices: 'Выбранные услуги',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      availableTime: 'Доступное время',
      selectedDate: 'Выбранная дата',
      selected: 'Выбрано',
      notSelected: 'Не выбрано',
      continue: 'Продолжить',
      zeroMinutes: '0м',
      morning: 'Утро',
      day: 'День',
      evening: 'Вечер',
      busy: 'Занято',
      fastBooking: 'Быстрая бронь',
      timeHint: 'Выберите удобное время. Занятые слоты недоступны.',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
    };
  }

  if (language === 'UA') {
    return {
      bookingDataNotFound: 'Дані бронювання не знайдено',
      chooseTime: 'Оберіть час',
      selectedServices: 'Вибрані послуги',
      totalDuration: 'Загальна тривалість',
      totalPrice: 'Загальна ціна',
      availableTime: 'Доступний час',
      selectedDate: 'Вибрана дата',
      selected: 'Вибрано',
      notSelected: 'Не вибрано',
      continue: 'Продовжити',
      zeroMinutes: '0хв',
      morning: 'Ранок',
      day: 'День',
      evening: 'Вечір',
      busy: 'Зайнято',
      fastBooking: 'Швидке бронювання',
      timeHint: 'Оберіть зручний час. Зайняті слоти недоступні.',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
    };
  }

  if (language === 'ES') {
    return {
      bookingDataNotFound: 'Datos de reserva no encontrados',
      chooseTime: 'Elige hora',
      selectedServices: 'Servicios seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      availableTime: 'Hora disponible',
      selectedDate: 'Fecha seleccionada',
      selected: 'Seleccionado',
      notSelected: 'No seleccionado',
      continue: 'Continuar',
      zeroMinutes: '0 min',
      morning: 'Mañana',
      day: 'Día',
      evening: 'Tarde',
      busy: 'Ocupado',
      fastBooking: 'Reserva rápida',
      timeHint: 'Elige una hora conveniente. Los horarios ocupados no están disponibles.',
      providerFallback: 'Profesional',
      serviceProviderFallback: 'Proveedor de servicios',
      serviceFallback: 'Servicio principal',
      premiumOption: 'Opción premium',
    };
  }

  if (language === 'CZ') {
    return {
      bookingDataNotFound: 'Údaje rezervace nebyly nalezeny',
      chooseTime: 'Vyberte čas',
      selectedServices: 'Vybrané služby',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      availableTime: 'Dostupný čas',
      selectedDate: 'Vybrané datum',
      selected: 'Vybráno',
      notSelected: 'Nevybráno',
      continue: 'Pokračovat',
      zeroMinutes: '0 min',
      morning: 'Ráno',
      day: 'Den',
      evening: 'Večer',
      busy: 'Obsazeno',
      fastBooking: 'Rychlá rezervace',
      timeHint: 'Vyberte vhodný čas. Obsazené časy nejsou dostupné.',
      providerFallback: 'Specialista',
      serviceProviderFallback: 'Poskytovatel služeb',
      serviceFallback: 'Hlavní služba',
      premiumOption: 'Prémiová možnost',
    };
  }

  if (language === 'DE') {
    return {
      bookingDataNotFound: 'Buchungsdaten nicht gefunden',
      chooseTime: 'Zeit wählen',
      selectedServices: 'Ausgewählte Leistungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      availableTime: 'Verfügbare Zeit',
      selectedDate: 'Ausgewähltes Datum',
      selected: 'Ausgewählt',
      notSelected: 'Nicht ausgewählt',
      continue: 'Weiter',
      zeroMinutes: '0 Min',
      morning: 'Morgen',
      day: 'Tag',
      evening: 'Abend',
      busy: 'Besetzt',
      fastBooking: 'Schnellbuchung',
      timeHint: 'Wähle eine passende Zeit. Besetzte Zeiten sind nicht verfügbar.',
      providerFallback: 'Spezialist',
      serviceProviderFallback: 'Dienstleister',
      serviceFallback: 'Hauptservice',
      premiumOption: 'Premium-Option',
    };
  }

  if (language === 'PL') {
    return {
      bookingDataNotFound: 'Nie znaleziono danych rezerwacji',
      chooseTime: 'Wybierz godzinę',
      selectedServices: 'Wybrane usługi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      availableTime: 'Dostępny czas',
      selectedDate: 'Wybrana data',
      selected: 'Wybrano',
      notSelected: 'Nie wybrano',
      continue: 'Dalej',
      zeroMinutes: '0 min',
      morning: 'Rano',
      day: 'Dzień',
      evening: 'Wieczór',
      busy: 'Zajęte',
      fastBooking: 'Szybka rezerwacja',
      timeHint: 'Wybierz dogodną godzinę. Zajęte sloty są niedostępne.',
      providerFallback: 'Specjalista',
      serviceProviderFallback: 'Usługodawca',
      serviceFallback: 'Usługa główna',
      premiumOption: 'Opcja premium',
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseTime: 'Choose time',
    selectedServices: 'Selected services',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    availableTime: 'Available time',
    selectedDate: 'Selected date',
    selected: 'Selected',
    notSelected: 'Not selected',
    continue: 'Continue',
    zeroMinutes: '0m',
    morning: 'Morning',
    day: 'Day',
    evening: 'Evening',
    busy: 'Busy',
    fastBooking: 'Fast booking',
    timeHint: 'Choose a convenient time. Busy slots are unavailable.',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
  };
}

function formatMinutes(minutes: number, language: AppLanguage) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

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

  if (language === 'DE') {
    if (h > 0 && m > 0) return `${h}Std ${m}Min`;
    if (h > 0) return `${h}Std`;
    return `${m}Min`;
  }

  if (language === 'ES' || language === 'CZ' || language === 'PL') {
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
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
  const allMasters = getAllMasters() as any[];
  const listings = getListings() as ListingLike[];

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const master = useMemo(() => {
    const builtInMaster = getMasterById(id);
    if (builtInMaster) return builtInMaster;

    const listingIndex = listings.findIndex((item) => String(item.id) === id);
    if (listingIndex !== -1) {
      return listingToMasterShape(listings[listingIndex], listingIndex, text);
    }

    const fallbackMaster = allMasters.find((item: any) => String(item.id) === id);
    if (fallbackMaster) return fallbackMaster;

    return null;
  }, [id, listings, allMasters, text]);

  const selectedItems = useMemo(() => {
    if (!master) return [] as ServiceLike[];

    return master.services.filter((service: ServiceLike) =>
      selectedServiceSlugs.includes(service.slug)
    );
  }, [master, selectedServiceSlugs]);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', () => setLanguage(getSavedLanguage()));

    return () => {
      unsubLanguage();
    };
  }, []);

  if (!master || !selectedItems.length || !date) {
    return <main style={{ padding: 24 }}>{text.bookingDataNotFound}</main>;
  }

  const totalPrice = selectedItems.reduce((sum: number, item: ServiceLike) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum: number, item: ServiceLike) => sum + parseDurationToMinutes(item.duration),
    0
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 132,
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
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 30, fontWeight: 900 }}>{text.chooseTime}</div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
              background: '#fff',
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 28px rgba(29,23,18,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                objectFit: 'cover',
              }}
            />

            <div>
              <div style={{ fontSize: 21, fontWeight: 900 }}>{master.name}</div>
              <div style={{ marginTop: 5, color: '#746b62', fontSize: 14, fontWeight: 700 }}>
                {master.title} • {master.city}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 22, fontWeight: 900 }}>
            {text.selectedServices}
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 18,
                  background: '#faf6ef',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 14,
                  }}
                />

                <div>
                  <div style={{ fontSize: 17, fontWeight: 900 }}>{item.title}</div>
                  <div style={{ marginTop: 4, color: '#746b62', fontSize: 14, fontWeight: 700 }}>
                    {item.duration}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 900, color: '#ef3e36' }}>
                  {formatDisplayPrice(item.price)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 800 }}>
                {text.totalDuration}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatMinutes(totalMinutes, language)}
              </div>
            </div>

            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 800 }}>
                {text.totalPrice}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6, color: '#ef3e36' }}>
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 28,
            padding: 18,
            boxShadow: '0 10px 28px rgba(29,23,18,0.06)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900 }}>{text.availableTime}</div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 18,
              background: '#f7f1e8',
              padding: '12px 14px',
              color: '#6f655b',
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {text.selectedDate}:{' '}
            <span style={{ fontWeight: 900, color: '#1d1712' }}>{date}</span>
            <br />
            {text.timeHint}
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 18 }}>
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
                  <div style={{ fontSize: 18, fontWeight: 900 }}>
                    {getGroupTitle(group.id, text)}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      background: '#edf9ef',
                      color: '#15803d',
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
                        disabled={busy}
                        onClick={() => {
                          if (busy) return;
                          setSelectedTime(slot);
                        }}
                        style={{
                          minHeight: 62,
                          borderRadius: 20,
                          padding: '10px 8px',
                          border: active
                            ? '2px solid #16a34a'
                            : busy
                            ? '1px solid #f0a6af'
                            : '1px solid #ddd2c4',
                          background: active ? '#dcfce7' : busy ? '#ffe4e6' : '#fff',
                          color: active ? '#15803d' : busy ? '#e11d48' : '#1d1712',
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: busy ? 0.72 : 1,
                        }}
                      >
                        <div style={{ fontSize: 18, fontWeight: 900 }}>{slot}</div>
                        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800 }}>
                          {busy ? text.busy : text.availableTime}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
          padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
          boxShadow: '0 -10px 24px rgba(29,23,18,0.08)',
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 800 }}>
              {text.selected}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                marginTop: 6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedTime ? `${date} • ${selectedTime}` : text.notSelected}
            </div>
          </div>

          <button
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
              border: 'none',
              background: selectedTime ? '#16a34a' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 24px',
              fontWeight: 900,
              fontSize: 18,
              cursor: selectedTime ? 'pointer' : 'not-allowed',
              boxShadow: selectedTime ? '0 8px 18px rgba(22,163,74,0.24)' : 'none',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
