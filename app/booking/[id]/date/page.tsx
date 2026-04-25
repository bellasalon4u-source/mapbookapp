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

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingDataNotFound: 'Данные бронирования не найдены',
      chooseDate: 'Выберите дату',
      selectedServices: 'Выбранные услуги',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      today: 'Сегодня',
      chooseYear: 'Выберите год',
      chooseMonth: 'Выберите месяц',
      available: 'Доступно',
      unavailable: 'Недоступно',
      partial: 'Частично',
      todayLabel: 'Сегодня',
      selectedDate: 'Выбранная дата',
      notSelected: 'Не выбрано',
      chooseTime: 'Выбрать время',
      from: 'от',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
      zeroMinutes: '0м',
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
    };
  }

  if (language === 'UA') {
    return {
      bookingDataNotFound: 'Дані бронювання не знайдені',
      chooseDate: 'Оберіть дату',
      selectedServices: 'Обрані послуги',
      totalDuration: 'Загальна тривалість',
      totalPrice: 'Загальна ціна',
      today: 'Сьогодні',
      chooseYear: 'Оберіть рік',
      chooseMonth: 'Оберіть місяць',
      available: 'Доступно',
      unavailable: 'Недоступно',
      partial: 'Частково',
      todayLabel: 'Сьогодні',
      selectedDate: 'Обрана дата',
      notSelected: 'Не обрано',
      chooseTime: 'Обрати час',
      from: 'від',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
      zeroMinutes: '0хв',
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
    };
  }

  if (language === 'ES') {
    return {
      bookingDataNotFound: 'Datos de reserva no encontrados',
      chooseDate: 'Elige fecha',
      selectedServices: 'Servicios seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      today: 'Hoy',
      chooseYear: 'Elige año',
      chooseMonth: 'Elige mes',
      available: 'Disponible',
      unavailable: 'No disponible',
      partial: 'Parcial',
      todayLabel: 'Hoy',
      selectedDate: 'Fecha seleccionada',
      notSelected: 'No seleccionada',
      chooseTime: 'Elegir hora',
      from: 'desde',
      providerFallback: 'Profesional',
      serviceProviderFallback: 'Proveedor de servicios',
      serviceFallback: 'Servicio principal',
      premiumOption: 'Opción premium',
      zeroMinutes: '0 min',
      monthsFull: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      monthsShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      weekdaysShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    };
  }

  if (language === 'CZ') {
    return {
      bookingDataNotFound: 'Údaje rezervace nebyly nalezeny',
      chooseDate: 'Vyberte datum',
      selectedServices: 'Vybrané služby',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      today: 'Dnes',
      chooseYear: 'Vyberte rok',
      chooseMonth: 'Vyberte měsíc',
      available: 'Dostupné',
      unavailable: 'Nedostupné',
      partial: 'Částečně',
      todayLabel: 'Dnes',
      selectedDate: 'Vybrané datum',
      notSelected: 'Nevybráno',
      chooseTime: 'Vybrat čas',
      from: 'od',
      providerFallback: 'Specialista',
      serviceProviderFallback: 'Poskytovatel služeb',
      serviceFallback: 'Hlavní služba',
      premiumOption: 'Prémiová možnost',
      zeroMinutes: '0 min',
      monthsFull: [
        'Leden',
        'Únor',
        'Březen',
        'Duben',
        'Květen',
        'Červen',
        'Červenec',
        'Srpen',
        'Září',
        'Říjen',
        'Listopad',
        'Prosinec',
      ],
      monthsShort: [
        'led',
        'úno',
        'bře',
        'dub',
        'kvě',
        'čen',
        'čvc',
        'srp',
        'zář',
        'říj',
        'lis',
        'pro',
      ],
      weekdaysShort: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
    };
  }

  if (language === 'DE') {
    return {
      bookingDataNotFound: 'Buchungsdaten nicht gefunden',
      chooseDate: 'Datum wählen',
      selectedServices: 'Ausgewählte Leistungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      today: 'Heute',
      chooseYear: 'Jahr wählen',
      chooseMonth: 'Monat wählen',
      available: 'Verfügbar',
      unavailable: 'Nicht verfügbar',
      partial: 'Teilweise',
      todayLabel: 'Heute',
      selectedDate: 'Ausgewähltes Datum',
      notSelected: 'Nicht ausgewählt',
      chooseTime: 'Zeit wählen',
      from: 'ab',
      providerFallback: 'Spezialist',
      serviceProviderFallback: 'Dienstleister',
      serviceFallback: 'Hauptservice',
      premiumOption: 'Premium-Option',
      zeroMinutes: '0 Min',
      monthsFull: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
      ],
      monthsShort: [
        'Jan',
        'Feb',
        'Mär',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez',
      ],
      weekdaysShort: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    };
  }

  if (language === 'PL') {
    return {
      bookingDataNotFound: 'Nie znaleziono danych rezerwacji',
      chooseDate: 'Wybierz datę',
      selectedServices: 'Wybrane usługi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      today: 'Dziś',
      chooseYear: 'Wybierz rok',
      chooseMonth: 'Wybierz miesiąc',
      available: 'Dostępne',
      unavailable: 'Niedostępne',
      partial: 'Częściowo',
      todayLabel: 'Dziś',
      selectedDate: 'Wybrana data',
      notSelected: 'Nie wybrano',
      chooseTime: 'Wybierz godzinę',
      from: 'od',
      providerFallback: 'Specjalista',
      serviceProviderFallback: 'Usługodawca',
      serviceFallback: 'Usługa główna',
      premiumOption: 'Opcja premium',
      zeroMinutes: '0 min',
      monthsFull: [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
      ],
      monthsShort: [
        'sty',
        'lut',
        'mar',
        'kwi',
        'maj',
        'cze',
        'lip',
        'sie',
        'wrz',
        'paź',
        'lis',
        'gru',
      ],
      weekdaysShort: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'],
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseDate: 'Choose date',
    selectedServices: 'Selected services',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    today: 'Today',
    chooseYear: 'Choose year',
    chooseMonth: 'Choose month',
    available: 'Available',
    unavailable: 'Unavailable',
    partial: 'Partial',
    todayLabel: 'Today',
    selectedDate: 'Selected date',
    notSelected: 'Not selected',
    chooseTime: 'Choose time',
    from: 'from',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
    zeroMinutes: '0m',
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
  };
}

function listingToMasterShape(listing: ListingLike, index: number, language: AppLanguage): MasterLike {
  const text = getTexts(language);

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
  const hourMatch = value.match(/(\d+)\s*h/i);
  const minuteMatch = value.match(/(\d+)\s*m/i);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
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

function getStatusStyles(status: DateStatus, active: boolean, isToday: boolean) {
  if (active) {
    return {
      background: '#16a34a',
      color: '#ffffff',
      border: '2px solid #111111',
      boxShadow: '0 8px 0 rgba(17,17,17,0.08)',
    };
  }

  if (status === 'past') {
    return {
      background: '#f2f2f2',
      color: '#a3a3a3',
      border: '1.5px solid #dddddd',
      boxShadow: 'none',
    };
  }

  if (status === 'full') {
    return {
      background: '#ffe1e7',
      color: '#cf3344',
      border: '1.5px solid #ff7a85',
      boxShadow: 'none',
    };
  }

  if (status === 'partial') {
    return {
      background: '#fff3d6',
      color: '#ad7200',
      border: '1.5px solid #f0b429',
      boxShadow: 'none',
    };
  }

  if (isToday) {
    return {
      background: '#e8f1ff',
      color: '#2364c8',
      border: '2px solid #2f80ed',
      boxShadow: 'none',
    };
  }

  return {
    background: '#e3f8ea',
    color: '#1f8c3f',
    border: '1.5px solid #55c75f',
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
  const [pickerMode, setPickerMode] = useState<'closed' | 'year' | 'month'>('closed');

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

  const years = Array.from({ length: 4 }, (_, index) => today.getFullYear() + index);
  const monthDates = Array.from({ length: 12 }, (_, index) => new Date(activeYear, index, 1));
  const calendarCells = getMonthDates(activeYear, activeMonth);

  const selectedDate = selectedDateKey ? new Date(`${selectedDateKey}T12:00:00`) : null;

  if (!master || !selectedItems.length) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#fcf8f2',
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: '#17130f',
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
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 138,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 138px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
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
              border: '2px solid #111111',
              background: '#ffffff',
              fontSize: 26,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div
            style={{
              textAlign: 'center',
              fontSize: 27,
              lineHeight: 1.05,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.chooseDate}
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section
          style={{
            borderRadius: 28,
            border: '2px solid #111111',
            background: '#ffffff',
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr',
              gap: 12,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{
                width: 70,
                height: 70,
                borderRadius: 20,
                objectFit: 'cover',
                border: '2px solid #111111',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 900,
                  color: '#17130f',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {master.name}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f675f',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {master.title} · {master.city}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
            {text.selectedServices}
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 20,
                  border: '1.5px solid #e4d8ca',
                  background: '#fffefa',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 16,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: '#746b62',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {item.duration}
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 900, color: '#ff3b3b' }}>
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
                borderRadius: 20,
                border: '1.5px solid #e4d8ca',
                padding: 12,
              }}
            >
              <div style={{ fontSize: 13, color: '#6c645c', fontWeight: 900 }}>
                {text.totalDuration}
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatMinutes(totalMinutes, language)}
              </div>
            </div>

            <div
              style={{
                background: '#fff2f2',
                borderRadius: 20,
                border: '1.5px solid #ffd2d2',
                padding: 12,
              }}
            >
              <div style={{ fontSize: 13, color: '#6c645c', fontWeight: 900 }}>
                {text.totalPrice}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  marginTop: 6,
                  color: '#ff3b3b',
                }}
              >
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            background: '#ffffff',
            border: '2px solid #111111',
            borderRadius: 30,
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px 42px',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const prev = new Date(activeYear, activeMonth - 1, 1);
                setActiveYear(prev.getFullYear());
                setActiveMonth(prev.getMonth());
                setPickerMode('closed');
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#ffffff',
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() => setPickerMode(pickerMode === 'year' ? 'closed' : 'year')}
              style={{
                minHeight: 42,
                borderRadius: 18,
                border: '2px solid #111111',
                background: '#fffefa',
                color: '#17130f',
                fontSize: 19,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.monthsFull[activeMonth]} {activeYear}
            </button>

            <button
              type="button"
              onClick={() => setPickerMode(pickerMode === 'month' ? 'closed' : 'month')}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#e8f1ff',
                color: '#2364c8',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              📅
            </button>

            <button
              type="button"
              onClick={() => {
                const next = new Date(activeYear, activeMonth + 1, 1);
                setActiveYear(next.getFullYear());
                setActiveMonth(next.getMonth());
                setPickerMode('closed');
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#ffffff',
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
              marginTop: 10,
              color: '#6c645c',
              fontSize: 13,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {text.today}: {today.getDate()} {text.monthsShort[today.getMonth()]}{' '}
            {today.getFullYear()}
          </div>

          {pickerMode === 'year' ? (
            <div
              style={{
                marginTop: 14,
                background: '#fffaf2',
                border: '1.5px solid #eadfce',
                borderRadius: 22,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
                {text.chooseYear}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {years.map((year) => {
                  const active = activeYear === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setActiveYear(year);
                        setPickerMode('month');
                      }}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 18,
                        border: active ? '2px solid #16a34a' : '1.5px solid #111111',
                        background: active ? '#e6f8ec' : '#ffffff',
                        color: active ? '#15803d' : '#17130f',
                        fontWeight: 900,
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {pickerMode === 'month' ? (
            <div
              style={{
                marginTop: 14,
                background: '#fffaf2',
                border: '1.5px solid #eadfce',
                borderRadius: 22,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
                {text.chooseMonth}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {monthDates.map((date) => {
                  const active = activeMonth === date.getMonth();

                  return (
                    <button
                      key={date.getMonth()}
                      type="button"
                      onClick={() => {
                        setActiveMonth(date.getMonth());
                        setPickerMode('closed');
                      }}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 18,
                        border: active ? '2px solid #16a34a' : '1.5px solid #111111',
                        background: active ? '#e6f8ec' : '#ffffff',
                        color: active ? '#15803d' : '#17130f',
                        fontWeight: 900,
                        fontSize: 15,
                        cursor: 'pointer',
                      }}
                    >
                      {text.monthsFull[date.getMonth()]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 7,
              color: '#7b7268',
              fontSize: 11,
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            {text.weekdaysShort.map((weekday) => (
              <div key={weekday}>{weekday}</div>
            ))}
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 7,
            }}
          >
            {calendarCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: 44 }} />;
              }

              const key = getDateKey(date);
              const status = getStatusForDate(date, today);
              const active = selectedDateKey === key;
              const isToday = sameDay(date, today);
              const disabled = status === 'full' || status === 'past';
              const styles = getStatusStyles(status, active, isToday);

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
                    minHeight: 46,
                    borderRadius: 15,
                    textAlign: 'center',
                    opacity: disabled ? 0.75 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: 14,
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
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 16,
              fontSize: 12,
              color: '#6d645c',
              fontWeight: 800,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: '#e3f8ea',
                  border: '1px solid #55c75f',
                  display: 'inline-block',
                }}
              />
              {text.available}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: '#fff3d6',
                  border: '1px solid #f0b429',
                  display: 'inline-block',
                }}
              />
              {text.partial}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: '#ffe1e7',
                  border: '1px solid #ff7a85',
                  display: 'inline-block',
                }}
              />
              {text.unavailable}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: '#e8f1ff',
                  border: '1px solid #2f80ed',
                  display: 'inline-block',
                }}
              />
              {text.todayLabel}
            </div>
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
          borderTop: '2px solid #111111',
          padding: '14px 14px calc(14px + env(safe-area-inset-bottom))',
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#6c645c', fontWeight: 900 }}>
              {text.selectedDate}
            </div>

            <div
              style={{
                fontSize: 19,
                fontWeight: 900,
                marginTop: 5,
                color: selectedDate ? '#17130f' : '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedDate
                ? `${selectedDate.getDate()} ${
                    text.monthsShort[selectedDate.getMonth()]
                  } ${selectedDate.getFullYear()}`
                : text.notSelected}
            </div>
          </div>

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
              border: '2px solid #111111',
              background: selectedDate ? '#16a34a' : '#b7d9bf',
              color: '#ffffff',
              borderRadius: 22,
              padding: '17px 20px',
              fontWeight: 900,
              fontSize: 16,
              cursor: selectedDate ? 'pointer' : 'not-allowed',
              boxShadow: selectedDate ? '0 6px 0 rgba(17,17,17,0.08)' : 'none',
            }}
          >
            {text.chooseTime}
          </button>
        </div>
      </div>
    </main>
  );
}
