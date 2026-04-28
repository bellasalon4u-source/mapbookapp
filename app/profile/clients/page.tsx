'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getBookings,
  subscribeToBookingsStore,
  updateBookingStatus,
  getPublicBookingLocation,
  getVisibleBookingLocation,
  canShowExactAddress,
  canShowDirectContacts,
  type BookingItem,
  type BookingStatus,
} from '../../../services/bookingsStore';

type ViewMode = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type CalendarMode = 'month' | 'week' | 'day' | 'list';
type StatusFilter = 'all' | BookingStatus;
type PaymentFilter = 'all' | 'paid' | 'unpaid' | 'platform' | 'notPlatform';

type PageText = {
  title: string;
  subtitle: string;
  today: string;
  tomorrow: string;
  requests: string;
  calendar: string;
  history: string;
  month: string;
  week: string;
  day: string;
  list: string;
  filters: string;
  freeWindows: string;
  onlyRequests: string;
  synced: string;
  confirmed: string;
  waiting: string;
  completed: string;
  cancelled: string;
  unavailable: string;
  available: string;
  selectedDay: string;
  bookings: string;
  noBookings: string;
  details: string;
  openChat: string;
  markDone: string;
  price: string;
  notes: string;
  back: string;
  close: string;
  active: string;
  total: string;
  revenue: string;
  done: string;
  year: string;
  allStatuses: string;
  statusLegendDone: string;
  statusLegendConfirmed: string;
  statusLegendUnavailable: string;
  statusLegendAttention: string;
  searchClient: string;
  fromDate: string;
  toDate: string;
  priceFrom: string;
  priceTo: string;
  payment: string;
  allPayments: string;
  paid: string;
  unpaid: string;
  platformPaid: string;
  notPlatformPaid: string;
  resetFilters: string;
  dateRange: string;
  period: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  orange: '#ffb020',
  border: '#050505',
  muted: '#657080',
  softBlue: '#eaf4ff',
  softGreen: '#dcffe8',
  softYellow: '#fff4c7',
  softRed: '#ffe3ea',
  softPurple: '#f3edff',
  cream: '#fffdf8',
};

const texts: Partial<Record<AppLanguage, PageText>> = {
  EN: {
    title: 'My clients',
    subtitle: 'Bookings, requests, calendar and quick calculations',
    today: 'Today',
    tomorrow: 'Tomorrow',
    requests: 'Requests',
    calendar: 'Calendar',
    history: 'History',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
    filters: 'Filters',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    synced: 'Synced',
    confirmed: 'Confirmed',
    waiting: 'Waiting',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free slot',
    selectedDay: 'Selected day',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Booking details',
    openChat: 'Open chat',
    markDone: 'Mark done',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
    active: 'Active',
    total: 'Total',
    revenue: 'Revenue',
    done: 'Done',
    year: 'Year',
    allStatuses: 'All statuses',
    statusLegendDone: 'Done',
    statusLegendConfirmed: 'Confirmed',
    statusLegendUnavailable: 'Unavailable',
    statusLegendAttention: 'Needs attention',
    searchClient: 'Client or service',
    fromDate: 'From date',
    toDate: 'To date',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    payment: 'Payment',
    allPayments: 'All payments',
    paid: 'Paid',
    unpaid: 'Unpaid',
    platformPaid: 'Paid through platform',
    notPlatformPaid: 'Not platform',
    resetFilters: 'Reset filters',
    dateRange: 'Date range',
    period: 'Period',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрые расчёты',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Список',
    filters: 'Фильтры',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    synced: 'Синхронизировано',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает подтверждения',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    selectedDay: 'Выбранный день',
    bookings: 'записи',
    noBookings: 'На эту дату записей нет',
    details: 'Детали брони',
    openChat: 'Открыть чат',
    markDone: 'Отметить готово',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    total: 'Всего',
    revenue: 'Доход',
    done: 'Готово',
    year: 'Год',
    allStatuses: 'Все статусы',
    statusLegendDone: 'Готово',
    statusLegendConfirmed: 'Подтверждено',
    statusLegendUnavailable: 'Недоступно',
    statusLegendAttention: 'Требует внимания',
    searchClient: 'Клиент или услуга',
    fromDate: 'Дата от',
    toDate: 'Дата до',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    payment: 'Оплата',
    allPayments: 'Все оплаты',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    platformPaid: 'Оплачено через платформу',
    notPlatformPaid: 'Не через платформу',
    resetFilters: 'Сбросить фильтры',
    dateRange: 'Диапазон дат',
    period: 'Период',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Бронювання у мене, запити, календар і швидкі розрахунки',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    month: 'Місяць',
    week: 'Тиждень',
    day: 'День',
    list: 'Список',
    filters: 'Фільтри',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    synced: 'Синхронізовано',
    confirmed: 'Підтверджено',
    waiting: 'Очікує підтвердження',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    selectedDay: 'Обраний день',
    bookings: 'записи',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі бронювання',
    openChat: 'Відкрити чат',
    markDone: 'Позначити готово',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    total: 'Усього',
    revenue: 'Дохід',
    done: 'Готово',
    year: 'Рік',
    allStatuses: 'Усі статуси',
    statusLegendDone: 'Готово',
    statusLegendConfirmed: 'Підтверджено',
    statusLegendUnavailable: 'Недоступно',
    statusLegendAttention: 'Потребує уваги',
    searchClient: 'Клієнт або послуга',
    fromDate: 'Дата від',
    toDate: 'Дата до',
    priceFrom: 'Ціна від',
    priceTo: 'Ціна до',
    payment: 'Оплата',
    allPayments: 'Усі оплати',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    platformPaid: 'Оплачено через платформу',
    notPlatformPaid: 'Не через платформу',
    resetFilters: 'Скинути фільтри',
    dateRange: 'Діапазон дат',
    period: 'Період',
  },
};

function getText(language: AppLanguage) {
  return texts[language] || texts.EN!;
}

function getLocale(language: AppLanguage) {
  if (language === 'RU') return 'ru-RU';
  if (language === 'UA') return 'uk-UA';
  if (language === 'CZ') return 'cs-CZ';
  if (language === 'ES') return 'es-ES';
  if (language === 'DE') return 'de-DE';
  if (language === 'FR') return 'fr-FR';
  if (language === 'IT') return 'it-IT';
  if (language === 'PL') return 'pl-PL';
  if (language === 'AR') return 'ar';
  return 'en-GB';
}

function money(value: number) {
  if (!value) return '—';
  return `£${Number(value || 0).toFixed(0)}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function safeDate(value?: string) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getBookingDate(booking: BookingItem) {
  return safeDate(booking.dateTime);
}

function getTimeLabel(booking: BookingItem) {
  const date = getBookingDate(booking);
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function inputDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromInput(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getMonthName(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getOnlyMonthName(monthIndex: number, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
  }).format(new Date(2026, monthIndex, 1));
}

function getWeekDays(language: AppLanguage) {
  const monday = new Date(2026, 3, 20);

  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(
      addDays(monday, index)
    )
  );
}

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const firstCell = addDays(firstDay, -firstWeekDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstCell, index);

    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function getWeekDates(selectedDate: Date) {
  const weekDay = (selectedDate.getDay() + 6) % 7;
  const monday = addDays(selectedDate, -weekDay);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function getWeekRange(selectedDate: Date) {
  const dates = getWeekDates(selectedDate);
  return {
    from: startOfDay(dates[0]),
    to: endOfDay(dates[6]),
  };
}

function getMonthRange(date: Date) {
  return {
    from: startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

function statusLabel(booking: BookingItem, text: PageText) {
  if (booking.status === 'completed') return text.completed;
  if (booking.status === 'pending') return text.waiting;
  if (booking.status === 'cancelled') return text.cancelled;
  return text.confirmed;
}

function statusColor(booking: BookingItem) {
  if (booking.status === 'completed') return BRAND.blue;
  if (booking.status === 'pending') return BRAND.orange;
  if (booking.status === 'cancelled') return BRAND.red;
  return BRAND.green;
}

function statusBg(booking: BookingItem) {
  if (booking.status === 'completed') return BRAND.softBlue;
  if (booking.status === 'pending') return BRAND.softYellow;
  if (booking.status === 'cancelled') return BRAND.softRed;
  return BRAND.softGreen;
}

function isPaid(booking: BookingItem) {
  return Boolean(booking.clientPaid || booking.paymentReceivedByPlatform || booking.unlockFeePaid);
}

function isPlatformPaid(booking: BookingItem) {
  return Boolean(booking.paymentReceivedByPlatform);
}

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function getDateTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function isInsideRange(booking: BookingItem, from: Date, to: Date) {
  const date = getBookingDate(booking);
  if (!date) return false;
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

function OlamepLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <div
        style={{
          width: 34,
          height: 42,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 17,
            height: 17,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 29,
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

export default function ProfileClientsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [showFreeWindows, setShowFreeWindows] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => {
      setBookings(getBookings());
    };

    syncLanguage();
    syncBookings();

    const unsubLang = subscribeToLanguageChange(setLanguage);
    const unsubBookings = subscribeToBookingsStore(syncBookings);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncBookings);
    window.addEventListener('storage', syncBookings);

    return () => {
      unsubLang();
      unsubBookings();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncBookings);
      window.removeEventListener('storage', syncBookings);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const selectedRange = useMemo(() => {
    const customFrom = dateFromInput(rangeFrom);
    const customTo = dateFromInput(rangeTo);

    if (customFrom && customTo) {
      return {
        from: startOfDay(customFrom),
        to: endOfDay(customTo),
      };
    }

    if (viewMode === 'today') {
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
    }

    if (viewMode === 'tomorrow') {
      return {
        from: startOfDay(tomorrow),
        to: endOfDay(tomorrow),
      };
    }

    if (viewMode === 'calendar') {
      if (calendarMode === 'month' || calendarMode === 'list') {
        return getMonthRange(calendarDate);
      }

      if (calendarMode === 'week') {
        return getWeekRange(selectedDate);
      }

      return {
        from: startOfDay(selectedDate),
        to: endOfDay(selectedDate),
      };
    }

    return null;
  }, [calendarDate, calendarMode, rangeFrom, rangeTo, selectedDate, today, tomorrow, viewMode]);

  const visibleBookings = useMemo(() => {
    let source = [...bookings];

    if (selectedRange) {
      source = source.filter((booking) => isInsideRange(booking, selectedRange.from, selectedRange.to));
    }

    if (viewMode === 'requests' || showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (viewMode === 'history') {
      source = source.filter(
        (booking) => booking.status === 'completed' || booking.status === 'cancelled'
      );
    }

    if (statusFilter !== 'all') {
      source = source.filter((booking) => booking.status === statusFilter);
    }

    if (paymentFilter === 'paid') {
      source = source.filter((booking) => isPaid(booking));
    }

    if (paymentFilter === 'unpaid') {
      source = source.filter((booking) => !isPaid(booking));
    }

    if (paymentFilter === 'platform') {
      source = source.filter((booking) => isPlatformPaid(booking));
    }

    if (paymentFilter === 'notPlatform') {
      source = source.filter((booking) => !isPlatformPaid(booking));
    }

    const minPrice = Number(priceFrom);
    const maxPrice = Number(priceTo);

    if (priceFrom.trim() && !Number.isNaN(minPrice)) {
      source = source.filter((booking) => Number(booking.price || 0) >= minPrice);
    }

    if (priceTo.trim() && !Number.isNaN(maxPrice)) {
      source = source.filter((booking) => Number(booking.price || 0) <= maxPrice);
    }

    const q = search.trim().toLowerCase();

    if (q) {
      source = source.filter((booking) => {
        return (
          booking.masterName.toLowerCase().includes(q) ||
          booking.serviceName.toLowerCase().includes(q) ||
          String(booking.location || '').toLowerCase().includes(q) ||
          String(booking.areaLabel || '').toLowerCase().includes(q)
        );
      });
    }

    return source.sort((a, b) => {
      const left = getBookingDate(a)?.getTime() || 0;
      const right = getBookingDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    bookings,
    paymentFilter,
    priceFrom,
    priceTo,
    search,
    selectedRange,
    showOnlyRequests,
    statusFilter,
    viewMode,
  ]);

  const monthBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const date = getBookingDate(booking);
      return (
        date &&
        date.getMonth() === calendarDate.getMonth() &&
        date.getFullYear() === calendarDate.getFullYear()
      );
    });
  }, [bookings, calendarDate]);

  const totalRevenue = visibleBookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);
  const activeCount = visibleBookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'upcoming'
  ).length;
  const completedCount = visibleBookings.filter((booking) => booking.status === 'completed').length;

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => current - 2 + index);
  }, []);

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setPriceFrom('');
    setPriceTo('');
    setRangeFrom('');
    setRangeTo('');
    setShowOnlyRequests(false);
    setShowFreeWindows(false);
  };

  const setMode = (mode: ViewMode) => {
    setViewMode(mode);
    setRangeFrom('');
    setRangeTo('');

    if (mode === 'today') {
      setSelectedDate(today);
      setCalendarDate(today);
    }

    if (mode === 'tomorrow') {
      setSelectedDate(tomorrow);
      setCalendarDate(tomorrow);
    }
  };

  const goToday = () => {
    setRangeFrom('');
    setRangeTo('');
    setSelectedDate(today);
    setCalendarDate(today);
    setViewMode('today');
  };

  const periodLabel = selectedRange
    ? `${inputDateValue(selectedRange.from)} — ${inputDateValue(selectedRange.to)}`
    : text.allStatuses;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: BRAND.navy,
        paddingBottom: 138,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 145px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.back}
            style={headerCircleButtonStyle}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label={text.close}
            style={headerCircleButtonStyle}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: BRAND.navy,
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            marginTop: 15,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 7,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 6,
          }}
        >
          {([
            ['today', text.today],
            ['tomorrow', text.tomorrow],
            ['requests', text.requests],
            ['calendar', text.calendar],
            ['history', text.history],
          ] as const).map(([mode, label]) => {
            const active = viewMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                style={{
                  minHeight: 42,
                  borderRadius: 15,
                  border: `2px solid ${BRAND.border}`,
                  background: active ? BRAND.navy : '#ffffff',
                  color: active ? '#ffffff' : BRAND.navy,
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </button>
            );
          })}
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 25,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title={text.total} value={String(visibleBookings.length)} bg={BRAND.softBlue} />
            <StatBox title={text.revenue} value={money(totalRevenue)} bg="#fff0da" />
            <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softPurple} />
          </div>
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 28,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 10,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                next.setMonth(next.getMonth() - 1);
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={roundButtonStyle}
            >
              ‹
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 900,
                color: BRAND.navy,
                textTransform: 'capitalize',
              }}
            >
              {getMonthName(calendarDate, language)}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                next.setMonth(next.getMonth() + 1);
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={roundButtonStyle}
            >
              ›
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 1fr',
              gap: 8,
            }}
          >
            <select
              value={calendarDate.getFullYear()}
              onChange={(event) => {
                const next = new Date(calendarDate);
                next.setFullYear(Number(event.target.value));
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={selectStyle}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={calendarDate.getMonth()}
              onChange={(event) => {
                const next = new Date(calendarDate);
                next.setMonth(Number(event.target.value));
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={selectStyle}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {getOnlyMonthName(index, language)}
                </option>
              ))}
            </select>

            <button type="button" onClick={goToday} style={smallOutlineButtonStyle}>
              {text.today}
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 7,
            }}
          >
            {([
              ['month', text.month],
              ['week', text.week],
              ['day', text.day],
              ['list', text.list],
            ] as const).map(([mode, label]) => {
              const active = calendarMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setCalendarMode(mode);
                    setViewMode('calendar');
                    setRangeFrom('');
                    setRangeTo('');
                  }}
                  style={{
                    minHeight: 38,
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {calendarMode === 'month' ? (
            <CalendarGrid
              language={language}
              calendarDate={calendarDate}
              selectedDate={selectedDate}
              bookings={monthBookings}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('calendar');
                setCalendarMode('day');
                setRangeFrom('');
                setRangeTo('');
              }}
            />
          ) : null}

          {calendarMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={bookings}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('calendar');
                setRangeFrom('');
                setRangeTo('');
              }}
            />
          ) : null}

          {calendarMode === 'day' ? (
            <DayFocus
              date={selectedDate}
              language={language}
              bookings={visibleBookings}
              text={text}
            />
          ) : null}

          {calendarMode === 'list' ? (
            <MonthList
              bookings={monthBookings}
              language={language}
              text={text}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setCalendarMode('day');
                setViewMode('calendar');
                setRangeFrom('');
                setRangeTo('');
              }}
            />
          ) : null}

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 2,
            }}
          >
            <FilterButton
              active={filtersOpen}
              label={`☰ ${text.filters}`}
              onClick={() => setFiltersOpen((prev) => !prev)}
            />
            <FilterButton
              active={showFreeWindows}
              label={`◷ ${text.freeWindows}`}
              onClick={() => setShowFreeWindows((prev) => !prev)}
            />
            <FilterButton
              active={showOnlyRequests}
              label={`♙ ${text.onlyRequests}`}
              onClick={() => setShowOnlyRequests((prev) => !prev)}
            />
            <div
              style={{
                flexShrink: 0,
                minHeight: 40,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.softGreen,
                color: '#008f3a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 13px',
                gap: 7,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              ☁ {text.synced}
            </div>
          </div>

          {filtersOpen ? (
            <div
              style={{
                marginTop: 10,
                borderRadius: 20,
                border: `2px solid ${BRAND.border}`,
                background: '#fbfbfb',
                padding: 10,
                display: 'grid',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.dateRange}: {periodLabel}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={filterLabelStyle}>
                  <span>{text.fromDate}</span>
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={(event) => {
                      setRangeFrom(event.target.value);
                      setViewMode('calendar');
                    }}
                    style={filterInputStyle}
                  />
                </label>

                <label style={filterLabelStyle}>
                  <span>{text.toDate}</span>
                  <input
                    type="date"
                    value={rangeTo}
                    onChange={(event) => {
                      setRangeTo(event.target.value);
                      setViewMode('calendar');
                    }}
                    style={filterInputStyle}
                  />
                </label>
              </div>

              <label style={filterLabelStyle}>
                <span>{text.searchClient}</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={text.searchClient}
                  style={filterInputStyle}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={filterLabelStyle}>
                  <span>{text.priceFrom}</span>
                  <input
                    value={priceFrom}
                    onChange={(event) => setPriceFrom(event.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    style={filterInputStyle}
                  />
                </label>

                <label style={filterLabelStyle}>
                  <span>{text.priceTo}</span>
                  <input
                    value={priceTo}
                    onChange={(event) => setPriceTo(event.target.value)}
                    inputMode="numeric"
                    placeholder="999"
                    style={filterInputStyle}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={filterLabelStyle}>
                  <span>{text.allStatuses}</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    style={filterInputStyle}
                  >
                    <option value="all">{text.allStatuses}</option>
                    <option value="upcoming">{text.confirmed}</option>
                    <option value="pending">{text.waiting}</option>
                    <option value="completed">{text.completed}</option>
                    <option value="cancelled">{text.cancelled}</option>
                  </select>
                </label>

                <label style={filterLabelStyle}>
                  <span>{text.payment}</span>
                  <select
                    value={paymentFilter}
                    onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)}
                    style={filterInputStyle}
                  >
                    <option value="all">{text.allPayments}</option>
                    <option value="paid">{text.paid}</option>
                    <option value="unpaid">{text.unpaid}</option>
                    <option value="platform">{text.platformPaid}</option>
                    <option value="notPlatform">{text.notPlatformPaid}</option>
                  </select>
                </label>
              </div>

              <button type="button" onClick={resetFilters} style={resetButtonStyle}>
                {text.resetFilters}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                <LegendDot color={BRAND.blue} label={text.statusLegendDone} />
                <LegendDot color={BRAND.green} label={text.statusLegendConfirmed} />
                <LegendDot color={BRAND.red} label={text.statusLegendUnavailable} />
                <LegendDot color={BRAND.yellow} label={text.statusLegendAttention} />
              </div>
            </div>
          ) : null}
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#f8fbff',
            padding: 11,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: BRAND.navy,
                  textTransform: 'capitalize',
                }}
              >
                {selectedRange
                  ? `${inputDateValue(selectedRange.from)} — ${inputDateValue(selectedRange.to)}`
                  : getDateTitle(selectedDate, language)}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                {visibleBookings.length} {text.bookings}
              </div>
            </div>

            <button type="button" onClick={goToday} style={todayGradientButtonStyle}>
              {text.today}
            </button>
          </div>
        </section>

        <section style={{ marginTop: 13, display: 'grid', gap: 10 }}>
          {visibleBookings.length === 0 && !showFreeWindows ? (
            <div
              style={{
                minHeight: 112,
                borderRadius: 24,
                border: `2px dashed #d7dce4`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 18,
                color: BRAND.muted,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              {text.noBookings}
            </div>
          ) : null}

          {visibleBookings.map((booking) => (
            <ScheduleRow
              key={booking.id}
              booking={booking}
              text={text}
              onDone={() => markDone(booking)}
              onDetails={() => router.push('/bookings')}
              onChat={() => router.push('/messages')}
            />
          ))}

          {showFreeWindows ? <FreeWindowRow time="19:00" text={text} /> : null}
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function CalendarGrid({
  language,
  calendarDate,
  selectedDate,
  bookings,
  onSelect,
}: {
  language: AppLanguage;
  calendarDate: Date;
  selectedDate: Date;
  bookings: BookingItem[];
  onSelect: (date: Date) => void;
}) {
  const weekDays = getWeekDays(language);
  const cells = getCalendarCells(calendarDate.getFullYear(), calendarDate.getMonth());

  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 22,
        border: '1.5px solid #e3e3e3',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1.5px solid #e3e3e3',
          background: '#fbfbfb',
        }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              height: 31,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 900,
              color: BRAND.muted,
              textTransform: 'capitalize',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(({ date, currentMonth }) => {
          const dayBookings = bookings.filter((booking) => {
            const bookingDate = getBookingDate(booking);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          const selected = isSameDay(date, selectedDate);
          const hasConfirmed = dayBookings.some((booking) => booking.status === 'upcoming');
          const hasPending = dayBookings.some((booking) => booking.status === 'pending');
          const hasCompleted = dayBookings.some((booking) => booking.status === 'completed');
          const hasCancelled = dayBookings.some((booking) => booking.status === 'cancelled');

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelect(date)}
              style={{
                minHeight: 52,
                border: 'none',
                borderRight: '1px solid #eeeeee',
                borderBottom: '1px solid #eeeeee',
                background: selected ? BRAND.blue : currentMonth ? '#ffffff' : '#f5f5f5',
                color: selected ? '#ffffff' : currentMonth ? BRAND.navy : '#a8a8a8',
                cursor: 'pointer',
                padding: 5,
                display: 'grid',
                alignContent: 'space-between',
                justifyItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 900 }}>{date.getDate()}</span>

              <span style={{ minHeight: 14, display: 'flex', alignItems: 'center', gap: 3 }}>
                {hasCompleted ? <Dot color={BRAND.blue} /> : null}
                {hasConfirmed ? <Dot color={BRAND.green} /> : null}
                {hasCancelled ? <Dot color={BRAND.red} /> : null}
                {hasPending ? <Dot color={BRAND.yellow} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({
  language,
  selectedDate,
  bookings,
  onSelect,
}: {
  language: AppLanguage;
  selectedDate: Date;
  bookings: BookingItem[];
  onSelect: (date: Date) => void;
}) {
  const weekDays = getWeekDays(language);
  const dates = getWeekDates(selectedDate);

  return (
    <div
      style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
      }}
    >
      {dates.map((date, index) => {
        const selected = isSameDay(date, selectedDate);
        const count = bookings.filter((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        }).length;

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelect(date)}
            style={{
              minHeight: 74,
              borderRadius: 18,
              border: `2px solid ${selected ? BRAND.border : '#e0e0e0'}`,
              background: selected ? BRAND.blue : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: selected ? '#ffffff' : BRAND.muted,
              }}
            >
              {weekDays[index]}
            </span>
            <span style={{ fontSize: 18, fontWeight: 900 }}>{date.getDate()}</span>
            {count > 0 ? <Dot color={selected ? '#ffffff' : BRAND.green} /> : null}
          </button>
        );
      })}
    </div>
  );
}

function DayFocus({
  date,
  language,
  bookings,
  text,
}: {
  date: Date;
  language: AppLanguage;
  bookings: BookingItem[];
  text: PageText;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 22,
        border: `2px solid ${BRAND.border}`,
        background: BRAND.softBlue,
        padding: 13,
      }}
    >
      <div
        style={{
          fontSize: 19,
          fontWeight: 900,
          color: BRAND.navy,
          textTransform: 'capitalize',
        }}
      >
        {getDateTitle(date, language)}
      </div>
      <div style={{ marginTop: 5, fontSize: 13, fontWeight: 900, color: BRAND.muted }}>
        {bookings.length} {text.bookings}
      </div>
    </div>
  );
}

function MonthList({
  bookings,
  language,
  text,
  onSelect,
}: {
  bookings: BookingItem[];
  language: AppLanguage;
  text: PageText;
  onSelect: (date: Date) => void;
}) {
  const groupedDates = Array.from(
    new Set(
      bookings
        .map((booking) => getBookingDate(booking))
        .filter((date): date is Date => Boolean(date))
        .map((date) => startOfDay(date).toISOString())
    )
  ).map((iso) => new Date(iso));

  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
      {groupedDates.length === 0 ? (
        <div
          style={{
            minHeight: 70,
            borderRadius: 18,
            border: '1.5px dashed #d7dce4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.muted,
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {text.noBookings}
        </div>
      ) : null}

      {groupedDates.map((date) => {
        const count = bookings.filter((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        }).length;

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelect(date)}
            style={{
              minHeight: 54,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                textTransform: 'capitalize',
              }}
            >
              {getDateTitle(date, language)}
            </span>
            <span
              style={{
                minHeight: 28,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                color: BRAND.blue,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 10px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ScheduleRow({
  booking,
  text,
  onDone,
  onDetails,
  onChat,
}: {
  booking: BookingItem;
  text: PageText;
  onDone: () => void;
  onDetails: () => void;
  onChat: () => void;
}) {
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const location = isUnlocked(booking)
    ? getVisibleBookingLocation(booking)
    : getPublicBookingLocation(booking);

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background:
          'repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 31px, #edf1f6 32px, #ffffff 33px)',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr)',
        gap: 12,
        boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 7,
          background: color,
        }}
      />

      {done ? (
        <div
          style={{
            position: 'absolute',
            right: 11,
            top: 11,
            width: 34,
            height: 34,
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.green,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 21,
            fontWeight: 900,
          }}
        >
          ✓
        </div>
      ) : null}

      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: BRAND.navy,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 12,
        }}
      >
        {getTimeLabel(booking)}
      </div>

      <div style={{ minWidth: 0, paddingRight: done ? 38 : 0 }}>
        <div
          style={{
            display: 'inline-flex',
            minHeight: 28,
            alignItems: 'center',
            borderRadius: 999,
            border: `2px solid ${color}`,
            background: bg,
            color,
            padding: '0 9px',
            fontSize: 11,
            fontWeight: 900,
            marginBottom: 7,
          }}
        >
          {done ? '✓ ' : cancelled ? '× ' : ''}
          {statusLabel(booking, text)}
        </div>

        <div
          style={{
            fontSize: 18,
            lineHeight: 1.1,
            fontWeight: 900,
            color: cancelled ? BRAND.red : BRAND.navy,
          }}
        >
          {cancelled ? text.unavailable : booking.masterName}
        </div>

        {!cancelled ? (
          <>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {booking.serviceName || 'Service'}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 900,
                color: BRAND.blue,
              }}
            >
              📍 {location || 'London'}
            </div>

            <div
              style={{
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Pill
                  label={isPaid(booking) ? text.paid : text.unpaid}
                  color={isPaid(booking) ? '#008f3a' : '#b87500'}
                  bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
                />
                <Pill
                  label={isPlatformPaid(booking) ? text.platformPaid : text.notPlatformPaid}
                  color={isPlatformPaid(booking) ? BRAND.blue : BRAND.muted}
                  bg={isPlatformPaid(booking) ? BRAND.softBlue : '#f3f4f6'}
                />
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: BRAND.red,
                }}
              >
                {money(Number(booking.price || 0))}
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <button type="button" onClick={onDetails} style={outlineButtonStyle}>
                {text.details}
              </button>

              <button type="button" onClick={onChat} style={greenButtonStyle}>
                💬 {text.openChat}
              </button>
            </div>

            {booking.status !== 'completed' ? (
              <button
                type="button"
                onClick={onDone}
                style={{
                  marginTop: 8,
                  width: '100%',
                  minHeight: 42,
                  borderRadius: 15,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.softBlue,
                  color: BRAND.blue,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✓ {text.markDone}
              </button>
            ) : null}
          </>
        ) : (
          <div
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.available}
          </div>
        )}
      </div>
    </article>
  );
}

function FreeWindowRow({ time, text }: { time: string; text: PageText }) {
  return (
    <article
      style={{
        borderRadius: 22,
        border: `2px solid #d2d2d2`,
        background:
          'repeating-linear-gradient(180deg, #f8f8f8 0px, #f8f8f8 31px, #e1e1e1 32px, #f8f8f8 33px)',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr)',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#7b8490',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {time}
      </div>

      <div>
        <div style={{ fontSize: 17, fontWeight: 900, color: BRAND.navy }}>
          {text.available}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: BRAND.muted }}>
          Available for booking
        </div>
      </div>
    </article>
  );
}

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div
      style={{
        minHeight: 78,
        borderRadius: 20,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 11,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div style={{ fontSize: 25, fontWeight: 900, color: BRAND.navy }}>{value}</div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        minHeight: 40,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: active ? BRAND.navy : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        padding: '0 13px',
        fontSize: 12,
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        fontSize: 9,
        fontWeight: 900,
        color: BRAND.navy,
      }}
    >
      <Dot color={color} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 26,
        padding: '0 8px',
        borderRadius: 999,
        border: `1.8px solid ${color}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10.5,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        background: color,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

const headerCircleButtonStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 25,
  fontWeight: 900,
  cursor: 'pointer',
};

const roundButtonStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 24,
  fontWeight: 900,
  cursor: 'pointer',
};

const selectStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  padding: '0 8px',
  outline: 'none',
};

const smallOutlineButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const todayGradientButtonStyle: CSSProperties = {
  minWidth: 72,
  height: 46,
  borderRadius: 17,
  border: `2px solid ${BRAND.border}`,
  background:
    'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const outlineButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const greenButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const filterLabelStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  fontSize: 10.5,
  fontWeight: 900,
  color: BRAND.muted,
};

const filterInputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  height: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  padding: '0 10px',
  outline: 'none',
  boxSizing: 'border-box',
};

const resetButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};
