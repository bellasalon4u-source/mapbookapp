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
type CalendarMode = 'year' | 'month' | 'week' | 'day' | 'list';
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
  year: string;
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
  bookings: string;
  noBookings: string;
  details: string;
  openChat: string;
  markDone: string;
  back: string;
  close: string;
  active: string;
  total: string;
  revenue: string;
  done: string;
  time: string;
  clientProcedure: string;
  price: string;
  notes: string;
  allStatuses: string;
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
  tapHint: string;
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
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
    filters: 'Filters',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    synced: 'Auto sync · no conflicts',
    confirmed: 'Confirmed',
    waiting: 'Waiting',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free window',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    back: 'Back',
    close: 'Close',
    active: 'Active',
    total: 'Total',
    revenue: 'Revenue',
    done: 'Done',
    time: 'Time',
    clientProcedure: 'Client / Procedure',
    price: 'Price',
    notes: 'Notes',
    allStatuses: 'All statuses',
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
    tapHint: 'Tap a row to edit · hold and drag to change time',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрые расчёты',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    year: 'Год',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Список',
    filters: 'Фильтры',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    synced: 'Автосинхронизация · без конфликтов',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    bookings: 'записи',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Отметить готово',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    total: 'Всего',
    revenue: 'Доход',
    done: 'Готово',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    price: 'Цена',
    notes: 'Заметки',
    allStatuses: 'Все статусы',
    searchClient: 'Клиент или услуга',
    fromDate: 'Дата от',
    toDate: 'Дата до',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    payment: 'Оплата',
    allPayments: 'Все оплаты',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    platformPaid: 'Через платформу',
    notPlatformPaid: 'Не через платформу',
    resetFilters: 'Сбросить фильтры',
    dateRange: 'Диапазон дат',
    tapHint: 'Тап по строке — редактировать · удержание и перетаскивание — изменить время',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Бронювання у мене, запити, календар і швидкі розрахунки',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    year: 'Рік',
    month: 'Місяць',
    week: 'Тиждень',
    day: 'День',
    list: 'Список',
    filters: 'Фільтри',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    synced: 'Автосинхронізація · без конфліктів',
    confirmed: 'Підтверджено',
    waiting: 'Очікує',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    bookings: 'записи',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Позначити готово',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    total: 'Усього',
    revenue: 'Дохід',
    done: 'Готово',
    time: 'Час',
    clientProcedure: 'Клієнт / Процедура',
    price: 'Ціна',
    notes: 'Нотатки',
    allStatuses: 'Усі статуси',
    searchClient: 'Клієнт або послуга',
    fromDate: 'Дата від',
    toDate: 'Дата до',
    priceFrom: 'Ціна від',
    priceTo: 'Ціна до',
    payment: 'Оплата',
    allPayments: 'Усі оплати',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    platformPaid: 'Через платформу',
    notPlatformPaid: 'Не через платформу',
    resetFilters: 'Скинути фільтри',
    dateRange: 'Діапазон дат',
    tapHint: 'Тап по рядку — редагувати · утримання і перетягування — змінити час',
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

function getMonthTitle(date: Date, language: AppLanguage) {
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

function getYearRange(date: Date) {
  return {
    from: startOfDay(new Date(date.getFullYear(), 0, 1)),
    to: endOfDay(new Date(date.getFullYear(), 11, 31)),
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
  if (booking.status === 'pending') return BRAND.yellow;
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
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');
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
    const syncBookings = () => setBookings(getBookings());

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
      if (calendarMode === 'year') return getYearRange(calendarDate);
      if (calendarMode === 'month' || calendarMode === 'list') return getMonthRange(calendarDate);
      if (calendarMode === 'week') return getWeekRange(selectedDate);

      return {
        from: startOfDay(selectedDate),
        to: endOfDay(selectedDate),
      };
    }

    if (viewMode === 'history') {
      return null;
    }

    if (viewMode === 'requests') {
      return null;
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

    if (paymentFilter === 'paid') source = source.filter((booking) => isPaid(booking));
    if (paymentFilter === 'unpaid') source = source.filter((booking) => !isPaid(booking));
    if (paymentFilter === 'platform') source = source.filter((booking) => isPlatformPaid(booking));
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
    return Array.from({ length: 8 }, (_, index) => current - 2 + index);
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
      setCalendarMode('day');
    }

    if (mode === 'tomorrow') {
      setSelectedDate(tomorrow);
      setCalendarDate(tomorrow);
      setCalendarMode('day');
    }

    if (mode === 'calendar') {
      setCalendarMode('month');
    }
  };

  const goToday = () => {
    setRangeFrom('');
    setRangeTo('');
    setSelectedDate(today);
    setCalendarDate(today);
    setViewMode('today');
    setCalendarMode('day');
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
        <header style={headerStyle}>
          <button type="button" onClick={() => router.back()} aria-label={text.back} style={headerCircleButtonStyle}>
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button type="button" onClick={() => router.push('/profile')} aria-label={text.close} style={headerCircleButtonStyle}>
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1 style={titleStyle}>{text.title}</h1>
          <p style={subtitleStyle}>{text.subtitle}</p>
        </section>

        <section style={topTabsShellStyle}>
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
                  ...topTabStyle,
                  background: active ? BRAND.navy : '#ffffff',
                  color: active ? '#ffffff' : BRAND.navy,
                }}
              >
                {label}
              </button>
            );
          })}
        </section>

        <section style={statsShellStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title={text.total} value={String(visibleBookings.length)} bg={BRAND.softBlue} />
            <StatBox title={text.revenue} value={money(totalRevenue)} bg="#fff0da" />
            <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softPurple} />
          </div>
        </section>

        <section style={calendarShellStyle}>
          <div style={calendarHeaderStyle}>
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                if (calendarMode === 'year') next.setFullYear(next.getFullYear() - 1);
                else next.setMonth(next.getMonth() - 1);
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={roundButtonStyle}
            >
              ‹
            </button>

            <div style={calendarTitleStyle}>
              {calendarMode === 'year' ? calendarDate.getFullYear() : getMonthTitle(calendarDate, language)}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                if (calendarMode === 'year') next.setFullYear(next.getFullYear() + 1);
                else next.setMonth(next.getMonth() + 1);
                setCalendarDate(next);
                setViewMode('calendar');
              }}
              style={roundButtonStyle}
            >
              ›
            </button>
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 8 }}>
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

          <div style={calendarModeTabsStyle}>
            {([
              ['year', text.year],
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
                    ...calendarModeButtonStyle,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {calendarMode === 'year' ? (
            <YearGrid
              year={calendarDate.getFullYear()}
              language={language}
              bookings={bookings}
              onSelectMonth={(month) => {
                const next = new Date(calendarDate);
                next.setMonth(month);
                next.setDate(1);
                setCalendarDate(next);
                setSelectedDate(next);
                setCalendarMode('month');
                setViewMode('calendar');
              }}
            />
          ) : null}

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
            <DayFocus date={selectedDate} language={language} bookings={visibleBookings} text={text} />
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

          <div style={filterButtonsScrollStyle}>
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
            <div style={syncPillStyle}>✓ {text.synced}</div>
          </div>

          {filtersOpen ? (
            <div style={filtersPanelStyle}>
              <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.navy }}>
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
            </div>
          ) : null}

          <LegendBar text={text} />
        </section>

        <section style={dayTitlePanelStyle}>
          <div>
            <div style={dayTitleStyle}>
              {selectedRange
                ? `${inputDateValue(selectedRange.from)} — ${inputDateValue(selectedRange.to)}`
                : getDateTitle(selectedDate, language)}
            </div>

            <div style={dayCountStyle}>
              {visibleBookings.length} {text.bookings}
            </div>
          </div>

          <button type="button" onClick={goToday} style={todayGradientButtonStyle}>
            {text.today}
          </button>
        </section>

        <section style={notebookShellStyle}>
          <div style={notebookHeaderStyle}>
            <span>{text.time}</span>
            <span>{text.clientProcedure}</span>
            <span>{text.price}</span>
            <span>{text.notes}</span>
          </div>

          {visibleBookings.length === 0 && !showFreeWindows ? (
            <div style={emptyNotebookStyle}>{text.noBookings}</div>
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

          {showFreeWindows ? (
            <>
              <FreeWindowRow time="12:00" text={text} />
              <FreeWindowRow time="19:00" text={text} />
            </>
          ) : null}

          <div style={hintStyle}>ⓘ {text.tapHint}</div>
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function YearGrid({
  year,
  language,
  bookings,
  onSelectMonth,
}: {
  year: number;
  language: AppLanguage;
  bookings: BookingItem[];
  onSelectMonth: (month: number) => void;
}) {
  return (
    <div style={yearGridStyle}>
      {Array.from({ length: 12 }, (_, month) => {
        const monthItems = bookings.filter((booking) => {
          const date = getBookingDate(booking);
          return date && date.getFullYear() === year && date.getMonth() === month;
        });

        return (
          <button key={month} type="button" onClick={() => onSelectMonth(month)} style={miniMonthStyle}>
            <div style={miniMonthTitleStyle}>{getOnlyMonthName(month, language)}</div>
            <MiniMonthCalendar year={year} month={month} bookings={monthItems} />
          </button>
        );
      })}
    </div>
  );
}

function MiniMonthCalendar({
  year,
  month,
  bookings,
}: {
  year: number;
  month: number;
  bookings: BookingItem[];
}) {
  const cells = getCalendarCells(year, month).slice(0, 35);

  return (
    <div style={miniMonthGridStyle}>
      {cells.map(({ date, currentMonth }) => {
        const hasBooking = bookings.some((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        });

        return (
          <span
            key={date.toISOString()}
            style={{
              fontSize: 7.5,
              fontWeight: 900,
              color: hasBooking ? BRAND.red : currentMonth ? BRAND.navy : '#c9c9c9',
            }}
          >
            {date.getDate()}
          </span>
        );
      })}
    </div>
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
    <div style={monthGridShellStyle}>
      <div style={weekHeaderStyle}>
        {weekDays.map((day) => (
          <div key={day} style={weekHeaderCellStyle}>
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
                background: selected ? '#111111' : currentMonth ? '#ffffff' : '#f5f5f5',
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
    <div style={weekStripStyle}>
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
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, color: selected ? '#ffffff' : BRAND.muted }}>
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
    <div style={dayFocusStyle}>
      <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.navy, textTransform: 'capitalize' }}>
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
      {groupedDates.length === 0 ? <div style={smallEmptyStyle}>{text.noBookings}</div> : null}

      {groupedDates.map((date) => {
        const count = bookings.filter((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        }).length;

        return (
          <button key={date.toISOString()} type="button" onClick={() => onSelect(date)} style={monthListButtonStyle}>
            <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'capitalize' }}>
              {getDateTitle(date, language)}
            </span>
            <span style={countBadgeStyle}>{count}</span>
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

  const note = cancelled
    ? text.unavailable
    : isPlatformPaid(booking)
    ? text.platformPaid
    : isPaid(booking)
    ? text.paid
    : text.unpaid;

  return (
    <article style={scheduleRowOuterStyle}>
      <div style={{ ...timelineLineStyle, background: color }} />

      <button type="button" onClick={onDetails} style={{ ...scheduleRowInnerStyle, background: bg }}>
        <div style={timeCellStyle}>{getTimeLabel(booking)}</div>

        <div style={{ minWidth: 0 }}>
          <div style={clientNameStyle}>{cancelled ? text.unavailable : booking.masterName}</div>
          {!cancelled ? (
            <>
              <div style={serviceNameStyle}>{booking.serviceName || 'Service'}</div>
              <div style={locationStyle}>📍 {location || 'London'}</div>
              <div style={{ marginTop: 6 }}>
                <Pill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
              </div>
            </>
          ) : null}
        </div>

        <div style={{ ...priceCellStyle, color: cancelled ? BRAND.red : color }}>
          {cancelled ? '—' : money(Number(booking.price || 0))}
        </div>

        <div style={notesCellStyle}>
          <span>{note}</span>
          <span style={{ fontSize: 22, lineHeight: 1 }}>≡</span>
        </div>
      </button>

      {!done && !cancelled ? (
        <div style={rowActionsStyle}>
          <button type="button" onClick={onChat} style={greenButtonStyle}>
            💬 {text.openChat}
          </button>
          <button type="button" onClick={onDone} style={outlineButtonStyle}>
            ✓ {text.markDone}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function FreeWindowRow({ time, text }: { time: string; text: PageText }) {
  return (
    <article style={freeWindowOuterStyle}>
      <div style={freeTimelineStyle} />
      <div style={freeWindowInnerStyle}>
        <div style={timeCellStyle}>{time}</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: BRAND.muted }}>{text.available}</div>
        <div />
        <div style={notesCellStyle}>≡</div>
      </div>
    </article>
  );
}

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div style={{ ...statBoxStyle, background: bg }}>
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

function LegendBar({ text }: { text: PageText }) {
  return (
    <div style={legendBarStyle}>
      <LegendDot color={BRAND.blue} label={text.completed} />
      <LegendDot color={BRAND.green} label={text.confirmed} />
      <LegendDot color={BRAND.red} label={text.unavailable} />
      <LegendDot color={BRAND.yellow} label={text.waiting} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={legendItemStyle}>
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
        minHeight: 23,
        padding: '0 8px',
        borderRadius: 999,
        border: `1.5px solid ${color}`,
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

const headerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '48px 1fr 48px',
  alignItems: 'center',
  gap: 10,
};

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

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 38,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: '-1.4px',
  color: BRAND.navy,
};

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.35,
  fontWeight: 800,
  color: BRAND.muted,
};

const topTabsShellStyle: CSSProperties = {
  marginTop: 15,
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 7,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 6,
};

const topTabStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  fontSize: 11,
  fontWeight: 900,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const statsShellStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 25,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 12,
};

const statBoxStyle: CSSProperties = {
  minHeight: 78,
  borderRadius: 20,
  border: `2.5px solid ${BRAND.border}`,
  padding: 11,
  display: 'grid',
  alignContent: 'space-between',
};

const calendarShellStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 10,
};

const calendarHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: 8,
};

const calendarTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 25,
  fontWeight: 900,
  color: BRAND.navy,
  textTransform: 'capitalize',
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

const calendarModeTabsStyle: CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 7,
};

const calendarModeButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 11,
  fontWeight: 900,
  cursor: 'pointer',
};

const yearGridStyle: CSSProperties = {
  marginTop: 12,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 9,
};

const miniMonthStyle: CSSProperties = {
  minHeight: 118,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 8,
  cursor: 'pointer',
  textAlign: 'left',
};

const miniMonthTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: BRAND.navy,
  textTransform: 'capitalize',
  marginBottom: 5,
};

const miniMonthGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 2,
  textAlign: 'center',
};

const monthGridShellStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 22,
  border: '1.5px solid #e3e3e3',
  overflow: 'hidden',
  background: '#ffffff',
};

const weekHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  borderBottom: '1.5px solid #e3e3e3',
  background: '#fbfbfb',
};

const weekHeaderCellStyle: CSSProperties = {
  height: 31,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 900,
  color: BRAND.muted,
  textTransform: 'capitalize',
};

const weekStripStyle: CSSProperties = {
  marginTop: 12,
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 6,
};

const dayFocusStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softBlue,
  padding: 13,
};

const smallEmptyStyle: CSSProperties = {
  minHeight: 70,
  borderRadius: 18,
  border: '1.5px dashed #d7dce4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
};

const monthListButtonStyle: CSSProperties = {
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
};

const countBadgeStyle: CSSProperties = {
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
};

const filterButtonsScrollStyle: CSSProperties = {
  marginTop: 12,
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  paddingBottom: 2,
};

const syncPillStyle: CSSProperties = {
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
};

const filtersPanelStyle: CSSProperties = {
  marginTop: 10,
  borderRadius: 20,
  border: `2px solid ${BRAND.border}`,
  background: '#fbfbfb',
  padding: 10,
  display: 'grid',
  gap: 10,
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

const legendBarStyle: CSSProperties = {
  marginTop: 10,
  minHeight: 42,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 5,
  padding: '0 8px',
  alignItems: 'center',
};

const legendItemStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  fontSize: 9,
  fontWeight: 900,
  color: BRAND.navy,
};

const dayTitlePanelStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: '#f8fbff',
  padding: 11,
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 10,
  alignItems: 'center',
};

const dayTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  lineHeight: 1.05,
  color: BRAND.navy,
  textTransform: 'capitalize',
};

const dayCountStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
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

const notebookShellStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 26,
  border: `2.5px solid ${BRAND.border}`,
  background:
    'repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 37px, #eef2f6 38px, #ffffff 39px)',
  padding: 10,
  display: 'grid',
  gap: 9,
  overflow: 'hidden',
};

const notebookHeaderStyle: CSSProperties = {
  minHeight: 30,
  display: 'grid',
  gridTemplateColumns: '64px 1fr 70px 68px',
  gap: 8,
  alignItems: 'center',
  color: BRAND.muted,
  fontSize: 10.5,
  fontWeight: 900,
  padding: '0 6px',
};

const emptyNotebookStyle: CSSProperties = {
  minHeight: 90,
  borderRadius: 18,
  border: '2px dashed #d7dce4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: BRAND.muted,
  fontSize: 14,
  fontWeight: 900,
  textAlign: 'center',
};

const scheduleRowOuterStyle: CSSProperties = {
  position: 'relative',
  borderRadius: 18,
  overflow: 'hidden',
};

const scheduleRowInnerStyle: CSSProperties = {
  width: '100%',
  minHeight: 76,
  border: '1.5px solid rgba(0,0,0,0.08)',
  borderRadius: 18,
  padding: '9px 8px 9px 13px',
  display: 'grid',
  gridTemplateColumns: '64px minmax(0, 1fr) 70px 68px',
  gap: 8,
  alignItems: 'center',
  textAlign: 'left',
  cursor: 'pointer',
};

const timelineLineStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 9,
  bottom: 9,
  width: 5,
  borderRadius: 999,
  zIndex: 2,
};

const timeCellStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 900,
  color: BRAND.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const clientNameStyle: CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.05,
  fontWeight: 900,
  color: BRAND.navy,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const serviceNameStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 12.5,
  fontWeight: 800,
  color: '#2d3748',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const locationStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 10.5,
  fontWeight: 800,
  color: BRAND.muted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const priceCellStyle: CSSProperties = {
  fontSize: 21,
  fontWeight: 900,
  textAlign: 'center',
};

const notesCellStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
  fontSize: 11.5,
  lineHeight: 1.1,
  fontWeight: 800,
  color: '#3f4752',
};

const rowActionsStyle: CSSProperties = {
  marginTop: 6,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
};

const outlineButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const greenButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 14,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const freeWindowOuterStyle: CSSProperties = {
  position: 'relative',
  borderRadius: 18,
  overflow: 'hidden',
};

const freeTimelineStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 9,
  bottom: 9,
  width: 5,
  borderRadius: 999,
  background: '#bfc5cc',
  zIndex: 2,
};

const freeWindowInnerStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 18,
  border: '1.5px dashed #cfd5dd',
  background: 'rgba(255,255,255,0.78)',
  padding: '8px 8px 8px 13px',
  display: 'grid',
  gridTemplateColumns: '64px minmax(0, 1fr) 70px 68px',
  gap: 8,
  alignItems: 'center',
};

const hintStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 11.5,
  lineHeight: 1.35,
  fontWeight: 800,
  color: BRAND.muted,
};
