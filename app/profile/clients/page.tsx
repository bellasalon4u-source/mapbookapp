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
type PaidFilter = 'all' | 'paid' | 'unpaid';
type StatusFilter = 'all' | BookingStatus;
type PaymentMethodFilter = 'all' | 'card' | 'cash' | 'platform';

type BookingWithPayment = BookingItem & {
  paymentMethod?: 'card' | 'cash' | 'platform';
  notes?: string;
  clientSurname?: string;
};

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
  year: string;
  filters: string;
  hideFilters: string;
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
  dateFrom: string;
  dateTo: string;
  clientName: string;
  status: string;
  payment: string;
  paymentMethod: string;
  priceFrom: string;
  priceTo: string;
  all: string;
  paid: string;
  unpaid: string;
  card: string;
  cash: string;
  platform: string;
  reset: string;
  range: string;
  statusLegendDone: string;
  statusLegendConfirmed: string;
  statusLegendUnavailable: string;
  statusLegendAttention: string;
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
  cream: '#fffdf8',
  softViolet: '#f3edff',
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
    year: 'Year',
    filters: 'Filters',
    hideFilters: 'Hide filters',
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
    dateFrom: 'Date from',
    dateTo: 'Date to',
    clientName: 'Client surname or name',
    status: 'Readiness status',
    payment: 'Payment status',
    paymentMethod: 'Payment method',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    all: 'All',
    paid: 'Paid',
    unpaid: 'Unpaid',
    card: 'Card',
    cash: 'Cash',
    platform: 'Platform',
    reset: 'Reset',
    range: 'Range',
    statusLegendDone: 'Done',
    statusLegendConfirmed: 'Confirmed',
    statusLegendUnavailable: 'Unavailable',
    statusLegendAttention: 'Needs attention',
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
    year: 'Год',
    filters: 'Фильтры',
    hideFilters: 'Скрыть фильтры',
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
    dateFrom: 'Дата от',
    dateTo: 'Дата до',
    clientName: 'Фамилия или имя клиента',
    status: 'Статус готовности',
    payment: 'Статус оплаты',
    paymentMethod: 'Вид оплаты',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    all: 'Все',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    card: 'Карта',
    cash: 'Наличные',
    platform: 'Платформа',
    reset: 'Сбросить',
    range: 'Диапазон',
    statusLegendDone: 'Готово',
    statusLegendConfirmed: 'Подтверждено',
    statusLegendUnavailable: 'Недоступно',
    statusLegendAttention: 'Требует внимания',
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
    year: 'Рік',
    filters: 'Фільтри',
    hideFilters: 'Сховати фільтри',
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
    dateFrom: 'Дата від',
    dateTo: 'Дата до',
    clientName: 'Прізвище або імʼя клієнта',
    status: 'Статус готовності',
    payment: 'Статус оплати',
    paymentMethod: 'Тип оплати',
    priceFrom: 'Ціна від',
    priceTo: 'Ціна до',
    all: 'Усі',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    card: 'Картка',
    cash: 'Готівка',
    platform: 'Платформа',
    reset: 'Скинути',
    range: 'Діапазон',
    statusLegendDone: 'Готово',
    statusLegendConfirmed: 'Підтверджено',
    statusLegendUnavailable: 'Недоступно',
    statusLegendAttention: 'Потребує уваги',
  },
};

const demoSchedule: BookingWithPayment[] = [
  {
    id: 'client-demo-1',
    masterId: 'client-lucie',
    masterName: 'Lucie Hlavová',
    clientSurname: 'Hlavová',
    masterAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Стрижка волос',
    price: 35,
    status: 'upcoming',
    dateTime: setDemoTime(9, 0),
    dateLabel: 'Today at 09:00',
    location: 'Camden, London',
    areaLabel: 'Camden',
    exactAddress: '21 Camden High Street, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: true,
    paymentMethod: 'card',
    notes: 'чёлка короче',
  },
  {
    id: 'client-demo-2',
    masterId: 'client-janicka',
    masterName: 'Janička Andělová',
    clientSurname: 'Andělová',
    masterAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Маникюр',
    price: 30,
    status: 'completed',
    dateTime: setDemoTime(10, 30),
    dateLabel: 'Today at 10:30',
    location: 'Soho, London',
    areaLabel: 'Soho',
    exactAddress: '18 Greek Street, Soho, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: true,
    paymentMethod: 'platform',
    notes: 'готово',
  },
  {
    id: 'client-demo-3',
    masterId: 'client-klara',
    masterName: 'Klára Nováková',
    clientSurname: 'Nováková',
    masterAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Массаж',
    price: 60,
    status: 'pending',
    dateTime: setDemoTime(13, 0),
    dateLabel: 'Today at 13:00',
    location: 'Chelsea, London',
    areaLabel: 'Chelsea',
    exactAddress: '11 King’s Road, Chelsea, London',
    clientPaid: false,
    paymentReceivedByPlatform: false,
    unlockFeePaid: false,
    paymentMethod: 'cash',
    notes: 'частично / отменено',
  },
  {
    id: 'client-demo-4',
    masterId: 'blocked-slot',
    masterName: 'Недоступно',
    clientSurname: 'Недоступно',
    masterAvatar: '',
    serviceName: '',
    price: 0,
    status: 'cancelled',
    dateTime: setDemoTime(15, 0),
    dateLabel: 'Today at 15:00',
    location: '',
    areaLabel: '',
    exactAddress: '',
    clientPaid: false,
    paymentReceivedByPlatform: false,
    unlockFeePaid: false,
    paymentMethod: 'cash',
    notes: '',
  },
  {
    id: 'client-demo-5',
    masterId: 'client-lenka',
    masterName: 'Lenka Bohatá',
    clientSurname: 'Bohatá',
    masterAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Окрашивание',
    price: 85,
    status: 'upcoming',
    dateTime: setDemoTime(16, 0),
    dateLabel: 'Today at 16:00',
    location: 'Camden, London',
    areaLabel: 'Camden',
    exactAddress: '21 Camden High Street, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: true,
    paymentMethod: 'card',
    notes: 'холодный блонд',
  },
];

function setDemoTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

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

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function dateToInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inputToDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
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

function getMonthName(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getShortMonthName(monthIndex: number, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), { month: 'long' }).format(
    new Date(2026, monthIndex, 1)
  );
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

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function paymentMethodOf(booking: BookingItem): PaymentMethodFilter {
  const value = (booking as BookingWithPayment).paymentMethod;
  if (value === 'card' || value === 'cash' || value === 'platform') return value;
  if (booking.paymentReceivedByPlatform) return 'platform';
  return 'card';
}

function isCancelledLike(booking: BookingItem) {
  return booking.status === 'cancelled' || booking.status === 'pending';
}

function inRange(booking: BookingItem, from: Date, to: Date) {
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
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [showFreeWindows, setShowFreeWindows] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nameQuery, setNameQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [dateFrom, setDateFrom] = useState(() => dateToInput(startOfDay(new Date())));
  const [dateTo, setDateTo] = useState(() => dateToInput(startOfDay(new Date())));

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => {
      const saved = getBookings() as BookingWithPayment[];
      setBookings(saved.length > 0 ? saved : demoSchedule);
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

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => current - 2 + index);
  }, []);

  const baseDateRange = useMemo(() => {
    if (viewMode === 'today') return { from: today, to: endOfDay(today) };
    if (viewMode === 'tomorrow') return { from: tomorrow, to: endOfDay(tomorrow) };

    if (viewMode === 'calendar') {
      if (calendarMode === 'month') {
        return { from: startOfMonth(calendarDate), to: endOfMonth(calendarDate) };
      }

      if (calendarMode === 'week') {
        return { from: startOfWeek(selectedDate), to: endOfWeek(selectedDate) };
      }

      if (calendarMode === 'list') {
        const from = inputToDate(dateFrom) || selectedDate;
        const to = inputToDate(dateTo) || selectedDate;
        return { from: startOfDay(from), to: endOfDay(to) };
      }

      return { from: selectedDate, to: endOfDay(selectedDate) };
    }

    if (viewMode === 'requests' || viewMode === 'history') {
      const from = inputToDate(dateFrom);
      const to = inputToDate(dateTo);
      if (from && to) return { from: startOfDay(from), to: endOfDay(to) };
      return { from: new Date(2020, 0, 1), to: new Date(2035, 11, 31) };
    }

    return { from: selectedDate, to: endOfDay(selectedDate) };
  }, [calendarDate, calendarMode, dateFrom, dateTo, selectedDate, today, tomorrow, viewMode]);

  const visibleBookings = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();
    const min = priceFrom.trim() ? Number(priceFrom) : null;
    const max = priceTo.trim() ? Number(priceTo) : null;

    let source = bookings.filter((booking) => inRange(booking, baseDateRange.from, baseDateRange.to));

    if (viewMode === 'requests') {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (viewMode === 'history') {
      source = source.filter(
        (booking) => booking.status === 'completed' || booking.status === 'cancelled'
      );
    }

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (query) {
      source = source.filter((booking) => {
        const full = `${booking.masterName || ''} ${booking.clientSurname || ''} ${
          booking.serviceName || ''
        } ${booking.areaLabel || ''}`.toLowerCase();

        return full.includes(query);
      });
    }

    if (statusFilter !== 'all') {
      source = source.filter((booking) => booking.status === statusFilter);
    }

    if (paidFilter === 'paid') {
      source = source.filter((booking) => isPaid(booking));
    }

    if (paidFilter === 'unpaid') {
      source = source.filter((booking) => !isPaid(booking));
    }

    if (paymentMethodFilter !== 'all') {
      source = source.filter((booking) => paymentMethodOf(booking) === paymentMethodFilter);
    }

    if (min !== null && !Number.isNaN(min)) {
      source = source.filter((booking) => Number(booking.price || 0) >= min);
    }

    if (max !== null && !Number.isNaN(max)) {
      source = source.filter((booking) => Number(booking.price || 0) <= max);
    }

    return source.sort((a, b) => {
      const left = getBookingDate(a)?.getTime() || 0;
      const right = getBookingDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    baseDateRange,
    bookings,
    nameQuery,
    paidFilter,
    paymentMethodFilter,
    priceFrom,
    priceTo,
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

  const selectedDateLabel = new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);

  const periodLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(getLocale(language), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (isSameDay(baseDateRange.from, baseDateRange.to)) {
      return formatter.format(baseDateRange.from);
    }

    return `${formatter.format(baseDateRange.from)} — ${formatter.format(baseDateRange.to)}`;
  }, [baseDateRange, language]);

  const selectToday = () => {
    const now = startOfDay(new Date());
    setViewMode('today');
    setCalendarMode('day');
    setSelectedDate(now);
    setCalendarDate(now);
    setDateFrom(dateToInput(now));
    setDateTo(dateToInput(now));
  };

  const selectTomorrow = () => {
    const next = addDays(startOfDay(new Date()), 1);
    setViewMode('tomorrow');
    setCalendarMode('day');
    setSelectedDate(next);
    setCalendarDate(next);
    setDateFrom(dateToInput(next));
    setDateTo(dateToInput(next));
  };

  const resetFilters = () => {
    setNameQuery('');
    setStatusFilter('all');
    setPaidFilter('all');
    setPaymentMethodFilter('all');
    setPriceFrom('');
    setPriceTo('');
    setShowOnlyRequests(false);
    setShowFreeWindows(false);
  };

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
  };

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
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.back}
            style={circleButtonStyle}
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
            style={circleButtonStyle}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1 style={titleStyle}>{text.title}</h1>
          <p style={subtitleStyle}>{text.subtitle}</p>
        </section>

        <section style={topTabsStyle}>
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
                onClick={() => {
                  if (mode === 'today') {
                    selectToday();
                    return;
                  }

                  if (mode === 'tomorrow') {
                    selectTomorrow();
                    return;
                  }

                  setViewMode(mode);
                }}
                style={{
                  ...tabButtonStyle,
                  background: active ? BRAND.navy : '#ffffff',
                  color: active ? '#ffffff' : BRAND.navy,
                }}
              >
                {label}
              </button>
            );
          })}
        </section>

        <section style={statsSectionStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title={text.total} value={String(visibleBookings.length)} bg={BRAND.softBlue} />
            <StatBox title={text.revenue} value={money(totalRevenue)} bg="#fff0da" />
            <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softViolet} />
          </div>
        </section>

        <section style={calendarShellStyle}>
          <div style={calendarHeaderStyle}>
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                next.setMonth(next.getMonth() - 1);
                setCalendarDate(next);
              }}
              style={roundButtonStyle}
            >
              ‹
            </button>

            <div style={calendarTitleStyle}>{getMonthName(calendarDate, language)}</div>

            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarDate);
                next.setMonth(next.getMonth() + 1);
                setCalendarDate(next);
              }}
              style={roundButtonStyle}
            >
              ›
            </button>
          </div>

          <div style={dateControlsStyle}>
            <select
              value={calendarDate.getFullYear()}
              onChange={(event) => {
                const next = new Date(calendarDate);
                next.setFullYear(Number(event.target.value));
                setCalendarDate(next);
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
              }}
              style={selectStyle}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {getShortMonthName(index, language)}
                </option>
              ))}
            </select>

            <button type="button" onClick={selectToday} style={todayButtonStyle}>
              {text.today}
            </button>
          </div>

          <div style={modeTabsStyle}>
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
                    if (mode === 'list') {
                      setDateFrom(dateToInput(baseDateRange.from));
                      setDateTo(dateToInput(baseDateRange.to));
                    }
                  }}
                  style={{
                    ...modeButtonStyle,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
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
                const next = startOfDay(date);
                setSelectedDate(next);
                setCalendarDate(next);
                setViewMode('calendar');
                setCalendarMode('day');
                setDateFrom(dateToInput(next));
                setDateTo(dateToInput(next));
              }}
            />
          ) : null}

          {calendarMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={bookings}
              onSelect={(date) => {
                const next = startOfDay(date);
                setSelectedDate(next);
                setCalendarDate(next);
                setViewMode('calendar');
              }}
            />
          ) : null}

          {calendarMode === 'day' || calendarMode === 'list' ? (
            <div style={selectedPeriodStyle}>
              <div>
                <div style={selectedPeriodTitleStyle}>
                  {calendarMode === 'list' ? text.range : selectedDateLabel}
                </div>
                <div style={selectedPeriodSubStyle}>
                  {periodLabel} · {visibleBookings.length} {text.bookings}
                </div>
              </div>
              <div style={periodCountStyle}>{visibleBookings.length}</div>
            </div>
          ) : null}

          <div style={filterActionsStyle}>
            <ToggleButton
              active={filtersOpen}
              label={filtersOpen ? text.hideFilters : text.filters}
              onClick={() => setFiltersOpen((prev) => !prev)}
            />
            <ToggleButton
              active={showFreeWindows}
              label={text.freeWindows}
              onClick={() => setShowFreeWindows((prev) => !prev)}
            />
            <ToggleButton
              active={showOnlyRequests}
              label={text.onlyRequests}
              onClick={() => setShowOnlyRequests((prev) => !prev)}
            />
          </div>

          {filtersOpen ? (
            <FiltersPanel
              text={text}
              dateFrom={dateFrom}
              dateTo={dateTo}
              nameQuery={nameQuery}
              statusFilter={statusFilter}
              paidFilter={paidFilter}
              paymentMethodFilter={paymentMethodFilter}
              priceFrom={priceFrom}
              priceTo={priceTo}
              setDateFrom={setDateFrom}
              setDateTo={setDateTo}
              setNameQuery={setNameQuery}
              setStatusFilter={setStatusFilter}
              setPaidFilter={setPaidFilter}
              setPaymentMethodFilter={setPaymentMethodFilter}
              setPriceFrom={setPriceFrom}
              setPriceTo={setPriceTo}
              onReset={resetFilters}
              onUseRange={() => {
                setViewMode('calendar');
                setCalendarMode('list');
              }}
            />
          ) : null}

          <Legend text={text} />
        </section>

        <section style={{ marginTop: 13, display: 'grid', gap: 10 }}>
          <NotebookHeader text={text} />

          {visibleBookings.length === 0 && !showFreeWindows ? (
            <div style={emptyStyle}>{text.noBookings}</div>
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

          {showFreeWindows ? <FreeWindowRow time="12:00" text={text} /> : null}
          {showFreeWindows ? <FreeWindowRow time="19:00" text={text} /> : null}
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function FiltersPanel({
  text,
  dateFrom,
  dateTo,
  nameQuery,
  statusFilter,
  paidFilter,
  paymentMethodFilter,
  priceFrom,
  priceTo,
  setDateFrom,
  setDateTo,
  setNameQuery,
  setStatusFilter,
  setPaidFilter,
  setPaymentMethodFilter,
  setPriceFrom,
  setPriceTo,
  onReset,
  onUseRange,
}: {
  text: PageText;
  dateFrom: string;
  dateTo: string;
  nameQuery: string;
  statusFilter: StatusFilter;
  paidFilter: PaidFilter;
  paymentMethodFilter: PaymentMethodFilter;
  priceFrom: string;
  priceTo: string;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setNameQuery: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  setPaidFilter: (value: PaidFilter) => void;
  setPaymentMethodFilter: (value: PaymentMethodFilter) => void;
  setPriceFrom: (value: string) => void;
  setPriceTo: (value: string) => void;
  onReset: () => void;
  onUseRange: () => void;
}) {
  return (
    <div style={filtersPanelStyle}>
      <div style={twoColStyle}>
        <Field label={text.dateFrom}>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              onUseRange();
            }}
            style={inputStyle}
          />
        </Field>

        <Field label={text.dateTo}>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              onUseRange();
            }}
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label={text.clientName}>
        <input
          value={nameQuery}
          onChange={(event) => setNameQuery(event.target.value)}
          placeholder={text.clientName}
          style={inputStyle}
        />
      </Field>

      <div style={twoColStyle}>
        <Field label={text.status}>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            style={inputStyle}
          >
            <option value="all">{text.all}</option>
            <option value="upcoming">{text.confirmed}</option>
            <option value="pending">{text.waiting}</option>
            <option value="completed">{text.completed}</option>
            <option value="cancelled">{text.cancelled}</option>
          </select>
        </Field>

        <Field label={text.payment}>
          <select
            value={paidFilter}
            onChange={(event) => setPaidFilter(event.target.value as PaidFilter)}
            style={inputStyle}
          >
            <option value="all">{text.all}</option>
            <option value="paid">{text.paid}</option>
            <option value="unpaid">{text.unpaid}</option>
          </select>
        </Field>
      </div>

      <div style={twoColStyle}>
        <Field label={text.priceFrom}>
          <input
            value={priceFrom}
            onChange={(event) => setPriceFrom(event.target.value)}
            type="number"
            inputMode="numeric"
            placeholder="0"
            style={inputStyle}
          />
        </Field>

        <Field label={text.priceTo}>
          <input
            value={priceTo}
            onChange={(event) => setPriceTo(event.target.value)}
            type="number"
            inputMode="numeric"
            placeholder="999"
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label={text.paymentMethod}>
        <select
          value={paymentMethodFilter}
          onChange={(event) => setPaymentMethodFilter(event.target.value as PaymentMethodFilter)}
          style={inputStyle}
        >
          <option value="all">{text.all}</option>
          <option value="card">{text.card}</option>
          <option value="cash">{text.cash}</option>
          <option value="platform">{text.platform}</option>
        </select>
      </Field>

      <button type="button" onClick={onReset} style={resetButtonStyle}>
        {text.reset}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 900, color: BRAND.muted }}>{label}</span>
      {children}
    </label>
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
    <div style={calendarGridShellStyle}>
      <div style={weekHeaderGridStyle}>
        {weekDays.map((day) => (
          <div key={day} style={weekDayStyle}>
            {day}
          </div>
        ))}
      </div>

      <div style={calendarDaysGridStyle}>
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
                minHeight: 58,
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
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map((date) => {
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
              minHeight: 70,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(date)}
            </span>
            <span style={{ fontSize: 19, fontWeight: 900 }}>{date.getDate()}</span>
            <span style={{ fontSize: 10, fontWeight: 900 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function NotebookHeader({ text }: { text: PageText }) {
  return (
    <div style={notebookHeaderStyle}>
      <div>{text.today}</div>
      <div>Клиент / Процедура</div>
      <div>{text.price}</div>
      <div>{text.notes}</div>
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
  booking: BookingWithPayment;
  text: PageText;
  onDone: () => void;
  onDetails: () => void;
  onChat: () => void;
}) {
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const problem = isCancelledLike(booking);
  const location = isUnlocked(booking)
    ? getVisibleBookingLocation(booking)
    : getPublicBookingLocation(booking);

  return (
    <article style={scheduleOuterStyle}>
      <div style={{ ...timeRailStyle, background: color }} />

      <div style={timeCellStyle}>{getTimeLabel(booking)}</div>

      <div
        style={{
          ...notebookRowStyle,
          background: problem
            ? `linear-gradient(135deg, #ffffff 0%, #ffffff 48%, ${bg} 49%, ${bg} 100%)`
            : bg,
          borderColor: problem ? color : '#d7e6dc',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ ...clientNameStyle, color: cancelled ? BRAND.red : BRAND.navy }}>
            {cancelled ? text.unavailable : booking.masterName}
          </div>

          <div style={serviceStyle}>{cancelled ? text.available : booking.serviceName || 'Service'}</div>

          {!cancelled ? (
            <div style={miniLocationStyle}>📍 {location || 'London'}</div>
          ) : null}

          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <SmallBadge label={statusLabel(booking, text)} color={color} bg={bg} />
            <SmallBadge
              label={isPaid(booking) ? text.paid : text.unpaid}
              color={isPaid(booking) ? '#008f3a' : '#b87500'}
              bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
            />
          </div>
        </div>

        <div style={priceCellStyle}>{money(Number(booking.price || 0))}</div>

        <div style={notesCellStyle}>
          <div>{booking.notes || (cancelled ? '—' : text.notes)}</div>
          <button type="button" onClick={onDetails} style={rowMenuButtonStyle}>
            ≡
          </button>
        </div>
      </div>

      {!cancelled ? (
        <div style={rowActionsStyle}>
          <button type="button" onClick={onDetails} style={outlineButtonStyle}>
            {text.details}
          </button>

          <button type="button" onClick={onChat} style={greenButtonStyle}>
            💬 {text.openChat}
          </button>

          {!done ? (
            <button type="button" onClick={onDone} style={doneButtonStyle}>
              ✓ {text.markDone}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function FreeWindowRow({ time, text }: { time: string; text: PageText }) {
  return (
    <article style={scheduleOuterStyle}>
      <div style={{ ...timeRailStyle, background: '#c7c7c7' }} />
      <div style={timeCellStyle}>{time}</div>
      <div
        style={{
          ...notebookRowStyle,
          background: '#ffffff',
          border: '2px dashed #d2d2d2',
        }}
      >
        <div>
          <div style={clientNameStyle}>{text.available}</div>
          <div style={serviceStyle}>Available for booking</div>
        </div>
        <div style={priceCellStyle}>—</div>
        <div style={notesCellStyle}>—</div>
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

function ToggleButton({
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
        minHeight: 40,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: active ? BRAND.navy : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        fontSize: 12,
        fontWeight: 900,
        cursor: 'pointer',
        padding: '0 13px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function SmallBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 22,
        padding: '0 7px',
        borderRadius: 999,
        border: `1.5px solid ${color}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

function Legend({ text }: { text: PageText }) {
  return (
    <div style={legendStyle}>
      <LegendItem color={BRAND.blue} label={text.statusLegendDone} />
      <LegendItem color={BRAND.green} label={text.statusLegendConfirmed} />
      <LegendItem color={BRAND.red} label={text.statusLegendUnavailable} />
      <LegendItem color={BRAND.yellow} label={text.statusLegendAttention} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={legendItemStyle}>
      <Dot color={color} />
      <span>{label}</span>
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
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

const circleButtonStyle: CSSProperties = {
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

const topTabsStyle: CSSProperties = {
  marginTop: 15,
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 7,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 6,
};

const tabButtonStyle: CSSProperties = {
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

const statsSectionStyle: CSSProperties = {
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
  fontSize: 22,
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

const dateControlsStyle: CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: '0.8fr 1.2fr 0.8fr',
  gap: 7,
};

const selectStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 900,
  padding: '0 10px',
  outline: 'none',
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
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

const todayButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const modeTabsStyle: CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 7,
};

const modeButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const calendarGridShellStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 22,
  border: '1.5px solid #e3e3e3',
  overflow: 'hidden',
  background: '#ffffff',
};

const weekHeaderGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  borderBottom: '1.5px solid #e3e3e3',
  background: '#fbfbfb',
};

const weekDayStyle: CSSProperties = {
  height: 31,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 900,
  color: BRAND.muted,
  textTransform: 'capitalize',
};

const calendarDaysGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
};

const selectedPeriodStyle: CSSProperties = {
  marginTop: 12,
  minHeight: 74,
  borderRadius: 20,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: '10px 12px',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 10,
  alignItems: 'center',
};

const selectedPeriodTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: BRAND.navy,
  lineHeight: 1.1,
};

const selectedPeriodSubStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
};

const periodCountStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softBlue,
  color: BRAND.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 17,
  fontWeight: 900,
};

const filterActionsStyle: CSSProperties = {
  marginTop: 12,
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  paddingBottom: 3,
};

const filtersPanelStyle: CSSProperties = {
  marginTop: 10,
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: '#f8fbff',
  padding: 11,
  display: 'grid',
  gap: 10,
};

const twoColStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 9,
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

const legendStyle: CSSProperties = {
  marginTop: 10,
  minHeight: 40,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  overflowX: 'auto',
  padding: '0 12px',
};

const legendItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 10.5,
  fontWeight: 900,
  color: BRAND.navy,
  whiteSpace: 'nowrap',
};

const notebookHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '64px 1fr 58px 70px',
  gap: 8,
  padding: '0 8px',
  color: BRAND.muted,
  fontSize: 11,
  fontWeight: 900,
};

const emptyStyle: CSSProperties = {
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
};

const scheduleOuterStyle: CSSProperties = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '64px minmax(0, 1fr)',
  gap: 8,
  alignItems: 'stretch',
};

const timeRailStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 8,
  bottom: 8,
  width: 5,
  borderRadius: 999,
};

const timeCellStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: BRAND.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: 7,
};

const notebookRowStyle: CSSProperties = {
  minHeight: 84,
  borderRadius: 16,
  border: '2px solid #d7e6dc',
  padding: '10px 10px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 58px 70px',
  gap: 8,
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(7,27,70,0.04)',
};

const clientNameStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  lineHeight: 1.1,
};

const serviceStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 12,
  fontWeight: 800,
  color: BRAND.muted,
};

const miniLocationStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  fontWeight: 900,
  color: BRAND.blue,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const priceCellStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: BRAND.red,
  textAlign: 'right',
};

const notesCellStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 22px',
  gap: 4,
  alignItems: 'center',
  color: BRAND.navy,
  fontSize: 11,
  lineHeight: 1.15,
  fontWeight: 800,
};

const rowMenuButtonStyle: CSSProperties = {
  width: 22,
  height: 22,
  border: 'none',
  background: 'transparent',
  color: BRAND.muted,
  fontSize: 18,
  fontWeight: 900,
  cursor: 'pointer',
};

const rowActionsStyle: CSSProperties = {
  gridColumn: '2 / 3',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  marginTop: -2,
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

const doneButtonStyle: CSSProperties = {
  gridColumn: '1 / 3',
  minHeight: 38,
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softBlue,
  color: BRAND.blue,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};
