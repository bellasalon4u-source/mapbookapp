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
} from '../../../services/bookingsStore';

type ViewMode = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type CalendarMode = 'day' | 'week' | 'month' | 'range';
type StatusFilter = 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled';
type PaymentFilter = 'all' | 'paid' | 'unpaid';
type PaymentMethodFilter = 'all' | 'card' | 'cash' | 'platform';

type PageText = {
  title: string;
  subtitle: string;
  today: string;
  tomorrow: string;
  requests: string;
  calendar: string;
  history: string;
  day: string;
  week: string;
  month: string;
  range: string;
  filters: string;
  hideFilters: string;
  freeWindows: string;
  onlyRequests: string;
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
  active: string;
  total: string;
  revenue: string;
  done: string;
  clientProcedure: string;
  price: string;
  notes: string;
  from: string;
  to: string;
  surname: string;
  status: string;
  payment: string;
  paymentMethod: string;
  all: string;
  paid: string;
  unpaid: string;
  card: string;
  cash: string;
  platform: string;
  priceFrom: string;
  priceTo: string;
  reset: string;
  apply: string;
  dateRange: string;
  legendDone: string;
  legendConfirmed: string;
  legendUnavailable: string;
  legendAttention: string;
  depositPaid: string;
  depositWaiting: string;
  contactsOpen: string;
  contactsLocked: string;
  back: string;
  close: string;
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
  softViolet: '#f3edff',
  softOrange: '#fff0da',
};

const texts: Partial<Record<AppLanguage, PageText>> = {
  EN: {
    title: 'My clients',
    subtitle: 'Bookings, requests, calendar and client notebook',
    today: 'Today',
    tomorrow: 'Tomorrow',
    requests: 'Requests',
    calendar: 'Calendar',
    history: 'History',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    range: 'Range',
    filters: 'Filters',
    hideFilters: 'Hide filters',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    confirmed: 'Confirmed',
    waiting: 'Needs attention',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free slot',
    bookings: 'bookings',
    noBookings: 'No bookings for this period',
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    active: 'Active',
    total: 'Total',
    revenue: 'Revenue',
    done: 'Done',
    clientProcedure: 'Client / Procedure',
    price: 'Price',
    notes: 'Notes',
    from: 'From',
    to: 'To',
    surname: 'Surname / client',
    status: 'Status',
    payment: 'Payment',
    paymentMethod: 'Payment method',
    all: 'All',
    paid: 'Paid',
    unpaid: 'Unpaid',
    card: 'Card',
    cash: 'Cash',
    platform: 'Platform',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    reset: 'Reset',
    apply: 'Apply',
    dateRange: 'Date range',
    legendDone: 'Done',
    legendConfirmed: 'Confirmed',
    legendUnavailable: 'Unavailable',
    legendAttention: 'Needs attention',
    depositPaid: 'Deposit paid',
    depositWaiting: 'Deposit waiting',
    contactsOpen: 'Contacts open',
    contactsLocked: 'Contacts locked',
    back: 'Back',
    close: 'Close',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Записи, запросы, календарь и линейчатая тетрадь клиентов',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    range: 'Диапазон',
    filters: 'Фильтры',
    hideFilters: 'Скрыть фильтры',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    confirmed: 'Подтверждено',
    waiting: 'Требует внимания',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    bookings: 'записи',
    noBookings: 'На этот период записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Отметить готово',
    active: 'Активные',
    total: 'Всего',
    revenue: 'Доход',
    done: 'Готово',
    clientProcedure: 'Клиент / Процедура',
    price: 'Цена',
    notes: 'Заметки',
    from: 'От',
    to: 'До',
    surname: 'Фамилия / клиент',
    status: 'Готовность',
    payment: 'Оплата',
    paymentMethod: 'Вид оплаты',
    all: 'Все',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    card: 'Карта',
    cash: 'Наличные',
    platform: 'Платформа',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    reset: 'Сбросить',
    apply: 'Применить',
    dateRange: 'Диапазон дат',
    legendDone: 'Готово',
    legendConfirmed: 'Подтвержд.',
    legendUnavailable: 'Недоступно',
    legendAttention: 'Требует вним.',
    depositPaid: 'Депозит оплачен',
    depositWaiting: 'Ждёт депозит',
    contactsOpen: 'Контакты открыты',
    contactsLocked: 'Контакты закрыты',
    back: 'Назад',
    close: 'Закрыть',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Записи, запити, календар і лінійний зошит клієнтів',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    day: 'День',
    week: 'Тиждень',
    month: 'Місяць',
    range: 'Діапазон',
    filters: 'Фільтри',
    hideFilters: 'Сховати фільтри',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    confirmed: 'Підтверджено',
    waiting: 'Потребує уваги',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    bookings: 'записи',
    noBookings: 'На цей період записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Позначити готово',
    active: 'Активні',
    total: 'Усього',
    revenue: 'Дохід',
    done: 'Готово',
    clientProcedure: 'Клієнт / Процедура',
    price: 'Ціна',
    notes: 'Нотатки',
    from: 'Від',
    to: 'До',
    surname: 'Прізвище / клієнт',
    status: 'Готовність',
    payment: 'Оплата',
    paymentMethod: 'Вид оплати',
    all: 'Усі',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    card: 'Карта',
    cash: 'Готівка',
    platform: 'Платформа',
    priceFrom: 'Ціна від',
    priceTo: 'Ціна до',
    reset: 'Скинути',
    apply: 'Застосувати',
    dateRange: 'Діапазон дат',
    legendDone: 'Готово',
    legendConfirmed: 'Підтвердж.',
    legendUnavailable: 'Недоступно',
    legendAttention: 'Потребує уваги',
    depositPaid: 'Депозит оплачено',
    depositWaiting: 'Очікує депозит',
    contactsOpen: 'Контакти відкриті',
    contactsLocked: 'Контакти закриті',
    back: 'Назад',
    close: 'Закрити',
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

function startOfWeek(date: Date) {
  const day = (date.getDay() + 6) % 7;
  return startOfDay(addDays(date, -day));
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

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function safeDate(value?: string) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toInputDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseInputDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? startOfDay(new Date()) : startOfDay(date);
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

function getFullDate(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getWeekDays(language: AppLanguage) {
  const monday = new Date(2026, 3, 20);

  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(addDays(monday, index))
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

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function getPaymentMethod(booking: BookingItem): PaymentMethodFilter {
  if (booking.paymentReceivedByPlatform || booking.unlockFeePaid) return 'platform';
  if (booking.clientPaid) return 'card';
  return 'cash';
}

function getClientSearchValue(booking: BookingItem) {
  return `${booking.masterName || ''} ${booking.serviceName || ''} ${booking.location || ''} ${
    booking.areaLabel || ''
  }`.toLowerCase();
}

function createDemoSchedule(today: Date): BookingItem[] {
  return [
    {
      id: 'client-demo-today-1',
      masterId: 'client-lucie',
      masterName: 'Lucie Hlavová',
      masterAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      serviceName: 'Стрижка волос',
      price: 35,
      status: 'upcoming',
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
      dateLabel: 'Today at 09:00',
      location: 'Camden, London',
      areaLabel: 'Camden',
      exactAddress: '21 Camden High Street, London',
      clientPaid: true,
      paymentReceivedByPlatform: true,
      unlockFeePaid: true,
      bookingConfirmedByMaster: true,
      promotionPaidByMaster: true,
    } as BookingItem,
    {
      id: 'client-demo-today-2',
      masterId: 'client-janicka',
      masterName: 'Janička Andělová',
      masterAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
      serviceName: 'Маникюр',
      price: 30,
      status: 'completed',
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
      dateLabel: 'Today at 10:30',
      location: 'Soho, London',
      areaLabel: 'Soho',
      exactAddress: '18 Greek Street, Soho, London',
      clientPaid: true,
      paymentReceivedByPlatform: true,
      unlockFeePaid: true,
      bookingConfirmedByMaster: true,
      promotionPaidByMaster: true,
    } as BookingItem,
    {
      id: 'client-demo-today-3',
      masterId: 'client-klara',
      masterName: 'Klára Nováková',
      masterAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      serviceName: 'Массаж',
      price: 60,
      status: 'cancelled',
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0).toISOString(),
      dateLabel: 'Today at 13:00',
      location: 'Chelsea, London',
      areaLabel: 'Chelsea',
      exactAddress: '11 King’s Road, Chelsea, London',
      clientPaid: false,
      paymentReceivedByPlatform: false,
      unlockFeePaid: false,
      bookingConfirmedByMaster: false,
      promotionPaidByMaster: false,
    } as BookingItem,
    {
      id: 'client-demo-today-4',
      masterId: 'client-lenka',
      masterName: 'Lenka Bohatová',
      masterAvatar:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
      serviceName: 'Окрашивание',
      price: 85,
      status: 'upcoming',
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0).toISOString(),
      dateLabel: 'Today at 16:00',
      location: 'Islington, London',
      areaLabel: 'Islington',
      exactAddress: '7 Upper Street, Islington, London',
      clientPaid: true,
      paymentReceivedByPlatform: true,
      unlockFeePaid: true,
      bookingConfirmedByMaster: true,
      promotionPaidByMaster: true,
    } as BookingItem,
    {
      id: 'client-demo-tomorrow-1',
      masterId: 'client-barbora',
      masterName: 'Barbora Bendová',
      masterAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      serviceName: 'Наращивание волос',
      price: 120,
      status: 'pending',
      dateTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        18,
        0
      ).toISOString(),
      dateLabel: 'Tomorrow at 18:00',
      location: 'Hackney, London',
      areaLabel: 'Hackney',
      exactAddress: '12 Mare Street, Hackney, London',
      clientPaid: true,
      paymentReceivedByPlatform: false,
      unlockFeePaid: false,
      bookingConfirmedByMaster: false,
      promotionPaidByMaster: false,
    } as BookingItem,
  ];
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

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarDate, setCalendarDate] = useState<Date>(today);
  const [rangeFrom, setRangeFrom] = useState(toInputDate(today));
  const [rangeTo, setRangeTo] = useState(toInputDate(today));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFreeWindows, setShowFreeWindows] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => {
      const saved = getBookings();
      const demo = createDemoSchedule(startOfDay(new Date()));
      const hasToday = saved.some((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, startOfDay(new Date())) : false;
      });

      setBookings(hasToday ? saved : [...demo, ...saved]);
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

  const period = useMemo(() => {
    if (viewMode === 'today') return { from: today, to: endOfDay(today), label: getFullDate(today, language) };
    if (viewMode === 'tomorrow')
      return { from: tomorrow, to: endOfDay(tomorrow), label: getFullDate(tomorrow, language) };
    if (calendarMode === 'week')
      return {
        from: startOfWeek(selectedDate),
        to: endOfWeek(selectedDate),
        label: `${getFullDate(startOfWeek(selectedDate), language)} — ${getFullDate(
          endOfWeek(selectedDate),
          language
        )}`,
      };
    if (calendarMode === 'month')
      return {
        from: startOfMonth(calendarDate),
        to: endOfMonth(calendarDate),
        label: getMonthName(calendarDate, language),
      };
    if (calendarMode === 'range') {
      const from = parseInputDate(rangeFrom);
      const to = endOfDay(parseInputDate(rangeTo));
      return {
        from,
        to,
        label: `${getFullDate(from, language)} — ${getFullDate(to, language)}`,
      };
    }

    return { from: selectedDate, to: endOfDay(selectedDate), label: getFullDate(selectedDate, language) };
  }, [calendarDate, calendarMode, language, rangeFrom, rangeTo, selectedDate, text, today, tomorrow, viewMode]);

  const visibleBookings = useMemo(() => {
    const min = priceFrom.trim() ? Number(priceFrom) : null;
    const max = priceTo.trim() ? Number(priceTo) : null;
    const q = search.trim().toLowerCase();

    let source = bookings.filter((booking) => {
      const date = getBookingDate(booking);
      return date ? date >= period.from && date <= period.to : false;
    });

    if (viewMode === 'requests') {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (viewMode === 'history') {
      source = source.filter(
        (booking) => booking.status === 'completed' || booking.status === 'cancelled'
      );
    }

    if (q) {
      source = source.filter((booking) => getClientSearchValue(booking).includes(q));
    }

    if (statusFilter !== 'all') {
      source = source.filter((booking) => booking.status === statusFilter);
    }

    if (paymentFilter === 'paid') {
      source = source.filter(isPaid);
    }

    if (paymentFilter === 'unpaid') {
      source = source.filter((booking) => !isPaid(booking));
    }

    if (paymentMethodFilter !== 'all') {
      source = source.filter((booking) => getPaymentMethod(booking) === paymentMethodFilter);
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
    bookings,
    paymentFilter,
    paymentMethodFilter,
    period,
    priceFrom,
    priceTo,
    search,
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

  const activeCount = visibleBookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'upcoming'
  ).length;
  const completedCount = visibleBookings.filter((booking) => booking.status === 'completed').length;
  const totalRevenue = visibleBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + Number(booking.price || 0), 0);

  const setTodayMode = () => {
    const now = startOfDay(new Date());
    setViewMode('today');
    setCalendarMode('day');
    setSelectedDate(now);
    setCalendarDate(now);
    setRangeFrom(toInputDate(now));
    setRangeTo(toInputDate(now));
  };

  const setTomorrowMode = () => {
    const next = addDays(startOfDay(new Date()), 1);
    setViewMode('tomorrow');
    setCalendarMode('day');
    setSelectedDate(next);
    setCalendarDate(next);
    setRangeFrom(toInputDate(next));
    setRangeTo(toInputDate(next));
  };

  const selectCalendarMode = (mode: CalendarMode) => {
    setCalendarMode(mode);
    setViewMode('calendar');

    if (mode === 'day') {
      setRangeFrom(toInputDate(selectedDate));
      setRangeTo(toInputDate(selectedDate));
    }

    if (mode === 'week') {
      setRangeFrom(toInputDate(startOfWeek(selectedDate)));
      setRangeTo(toInputDate(endOfWeek(selectedDate)));
    }

    if (mode === 'month') {
      setRangeFrom(toInputDate(startOfMonth(calendarDate)));
      setRangeTo(toInputDate(endOfMonth(calendarDate)));
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setPaymentMethodFilter('all');
    setPriceFrom('');
    setPriceTo('');
  };

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
  };

  const goPrev = () => {
    const next = new Date(calendarDate);
    if (calendarMode === 'week') next.setDate(next.getDate() - 7);
    else if (calendarMode === 'day') next.setDate(next.getDate() - 1);
    else next.setMonth(next.getMonth() - 1);

    setCalendarDate(startOfDay(next));
    setSelectedDate(startOfDay(next));
    setViewMode('calendar');
  };

  const goNext = () => {
    const next = new Date(calendarDate);
    if (calendarMode === 'week') next.setDate(next.getDate() + 7);
    else if (calendarMode === 'day') next.setDate(next.getDate() + 1);
    else next.setMonth(next.getMonth() + 1);

    setCalendarDate(startOfDay(next));
    setSelectedDate(startOfDay(next));
    setViewMode('calendar');
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
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button type="button" onClick={() => router.back()} aria-label={text.back} style={circleButtonStyle}>
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

        <section style={topTabsWrapStyle}>
          <TopButton label={text.today} active={viewMode === 'today'} onClick={setTodayMode} />
          <TopButton label={text.tomorrow} active={viewMode === 'tomorrow'} onClick={setTomorrowMode} />
          <TopButton
            label={text.requests}
            active={viewMode === 'requests'}
            onClick={() => setViewMode('requests')}
          />
          <TopButton
            label={text.calendar}
            active={viewMode === 'calendar'}
            onClick={() => setViewMode('calendar')}
          />
          <TopButton label={text.history} active={viewMode === 'history'} onClick={() => setViewMode('history')} />
        </section>

        <section style={statsWrapStyle}>
          <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
          <StatBox title={text.total} value={String(visibleBookings.length)} bg={BRAND.softBlue} />
          <StatBox title={text.revenue} value={money(totalRevenue)} bg={BRAND.softOrange} />
          <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softViolet} />
        </section>

        <section style={calendarWrapStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button type="button" onClick={goPrev} style={smallCircleButtonStyle}>
              ‹
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: 27,
                lineHeight: 1,
                fontWeight: 900,
                color: BRAND.navy,
                textTransform: 'capitalize',
              }}
            >
              {getMonthName(calendarDate, language)}
            </div>

            <button type="button" onClick={goNext} style={smallCircleButtonStyle}>
              ›
            </button>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 8 }}>
            <select
              value={calendarDate.getFullYear()}
              onChange={(event) => {
                const next = new Date(calendarDate);
                next.setFullYear(Number(event.target.value));
                setCalendarDate(next);
                setSelectedDate(next);
                setViewMode('calendar');
              }}
              style={selectStyle}
            >
              {Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 2 + index).map((year) => (
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
                setSelectedDate(next);
                setViewMode('calendar');
              }}
              style={selectStyle}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {new Intl.DateTimeFormat(getLocale(language), { month: 'long' }).format(
                    new Date(2026, index, 1)
                  )}
                </option>
              ))}
            </select>

            <button type="button" onClick={setTodayMode} style={todayButtonStyle}>
              {text.today}
            </button>
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            <ModeButton label={text.day} active={calendarMode === 'day'} onClick={() => selectCalendarMode('day')} />
            <ModeButton label={text.week} active={calendarMode === 'week'} onClick={() => selectCalendarMode('week')} />
            <ModeButton
              label={text.month}
              active={calendarMode === 'month'}
              onClick={() => selectCalendarMode('month')}
            />
            <ModeButton
              label={text.range}
              active={calendarMode === 'range'}
              onClick={() => selectCalendarMode('range')}
            />
          </div>

          {calendarMode === 'range' ? (
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <DateInput label={text.from} value={rangeFrom} onChange={setRangeFrom} />
              <DateInput label={text.to} value={rangeTo} onChange={setRangeTo} />
            </div>
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
              }}
            />
          ) : null}

          <PeriodSummary label={period.label} count={visibleBookings.length} />

          <div style={{ marginTop: 10, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 5 }}>
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              style={{
                ...filterChipStyle,
                background: filtersOpen ? BRAND.navy : '#ffffff',
                color: filtersOpen ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {filtersOpen ? text.hideFilters : text.filters}
            </button>

            <button
              type="button"
              onClick={() => setShowFreeWindows((prev) => !prev)}
              style={{
                ...filterChipStyle,
                background: showFreeWindows ? BRAND.navy : '#ffffff',
                color: showFreeWindows ? '#ffffff' : BRAND.navy,
              }}
            >
              ◷ {text.freeWindows}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter((prev) => (prev === 'pending' ? 'all' : 'pending'))}
              style={{
                ...filterChipStyle,
                background: statusFilter === 'pending' ? BRAND.navy : '#ffffff',
                color: statusFilter === 'pending' ? '#ffffff' : BRAND.navy,
              }}
            >
              ⚠ {text.onlyRequests}
            </button>
          </div>

          {filtersOpen ? (
            <FiltersPanel
              text={text}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              paymentMethodFilter={paymentMethodFilter}
              setPaymentMethodFilter={setPaymentMethodFilter}
              priceFrom={priceFrom}
              setPriceFrom={setPriceFrom}
              priceTo={priceTo}
              setPriceTo={setPriceTo}
              onReset={resetFilters}
            />
          ) : null}

          <Legend text={text} />
        </section>

        <NotebookHeader text={text} viewMode={viewMode} />

        <section style={{ marginTop: 8, display: 'grid', gap: 0 }}>
          {visibleBookings.length === 0 && !showFreeWindows ? (
            <div style={emptyNotebookStyle}>{text.noBookings}</div>
          ) : null}

          {visibleBookings.map((booking) => (
            <NotebookRow
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
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function TopButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 16,
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
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: active ? BRAND.navy : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        fontSize: 13,
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div
      style={{
        minHeight: 82,
        borderRadius: 20,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 12,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 900, color: BRAND.navy }}>{value}</div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label
      style={{
        borderRadius: 17,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: '8px 10px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.muted }}>{label}</div>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          marginTop: 4,
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: BRAND.navy,
          fontSize: 13,
          fontWeight: 900,
        }}
      />
    </label>
  );
}

function PeriodSummary({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 20,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 44px',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.2,
          fontWeight: 900,
          color: BRAND.navy,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </div>

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: `2px solid ${BRAND.border}`,
          background: BRAND.softBlue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {count}
      </div>
    </div>
  );
}

function FiltersPanel({
  text,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  priceFrom,
  setPriceFrom,
  priceTo,
  setPriceTo,
  onReset,
}: {
  text: PageText;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  paymentFilter: PaymentFilter;
  setPaymentFilter: (value: PaymentFilter) => void;
  paymentMethodFilter: PaymentMethodFilter;
  setPaymentMethodFilter: (value: PaymentMethodFilter) => void;
  priceFrom: string;
  setPriceFrom: (value: string) => void;
  priceTo: string;
  setPriceTo: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 22,
        border: `2px solid ${BRAND.border}`,
        background: '#fffdf8',
        padding: 11,
      }}
    >
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={text.surname}
        style={filterInputStyle}
      />

      <FilterTitle label={text.status} />
      <ChipRow>
        <SmallChip label={text.all} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        <SmallChip
          label={text.confirmed}
          active={statusFilter === 'upcoming'}
          onClick={() => setStatusFilter('upcoming')}
        />
        <SmallChip
          label={text.waiting}
          active={statusFilter === 'pending'}
          onClick={() => setStatusFilter('pending')}
        />
        <SmallChip
          label={text.completed}
          active={statusFilter === 'completed'}
          onClick={() => setStatusFilter('completed')}
        />
        <SmallChip
          label={text.cancelled}
          active={statusFilter === 'cancelled'}
          onClick={() => setStatusFilter('cancelled')}
        />
      </ChipRow>

      <FilterTitle label={text.payment} />
      <ChipRow>
        <SmallChip label={text.all} active={paymentFilter === 'all'} onClick={() => setPaymentFilter('all')} />
        <SmallChip label={text.paid} active={paymentFilter === 'paid'} onClick={() => setPaymentFilter('paid')} />
        <SmallChip
          label={text.unpaid}
          active={paymentFilter === 'unpaid'}
          onClick={() => setPaymentFilter('unpaid')}
        />
      </ChipRow>

      <FilterTitle label={text.paymentMethod} />
      <ChipRow>
        <SmallChip
          label={text.all}
          active={paymentMethodFilter === 'all'}
          onClick={() => setPaymentMethodFilter('all')}
        />
        <SmallChip
          label={text.card}
          active={paymentMethodFilter === 'card'}
          onClick={() => setPaymentMethodFilter('card')}
        />
        <SmallChip
          label={text.cash}
          active={paymentMethodFilter === 'cash'}
          onClick={() => setPaymentMethodFilter('cash')}
        />
        <SmallChip
          label={text.platform}
          active={paymentMethodFilter === 'platform'}
          onClick={() => setPaymentMethodFilter('platform')}
        />
      </ChipRow>

      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input
          value={priceFrom}
          onChange={(event) => setPriceFrom(event.target.value)}
          placeholder={text.priceFrom}
          inputMode="numeric"
          style={filterInputStyle}
        />
        <input
          value={priceTo}
          onChange={(event) => setPriceTo(event.target.value)}
          placeholder={text.priceTo}
          inputMode="numeric"
          style={filterInputStyle}
        />
      </div>

      <button type="button" onClick={onReset} style={resetButtonStyle}>
        {text.reset}
      </button>
    </div>
  );
}

function FilterTitle({ label }: { label: string }) {
  return (
    <div style={{ marginTop: 10, marginBottom: 7, fontSize: 12, fontWeight: 900, color: BRAND.muted }}>
      {label}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>{children}</div>;
}

function SmallChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        minHeight: 34,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: active ? BRAND.navy : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        padding: '0 11px',
        fontSize: 11,
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function Legend({ text }: { text: PageText }) {
  return (
    <div
      style={{
        marginTop: 9,
        borderRadius: 18,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        overflowX: 'auto',
        padding: '0 12px',
      }}
    >
      <LegendItem color={BRAND.blue} label={text.legendDone} />
      <LegendItem color={BRAND.green} label={text.legendConfirmed} />
      <LegendItem color={BRAND.red} label={text.legendUnavailable} />
      <LegendItem color={BRAND.yellow} label={text.legendAttention} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 900,
        color: BRAND.navy,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

function NotebookHeader({ text, viewMode }: { text: PageText; viewMode: ViewMode }) {
  return (
    <div
      style={{
        marginTop: 14,
        display: 'grid',
        gridTemplateColumns: '66px 1fr 62px 62px',
        gap: 7,
        padding: '0 8px',
        color: BRAND.muted,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      <div>{viewMode === 'tomorrow' ? text.tomorrow : text.today}</div>
      <div>{text.clientProcedure}</div>
      <div>{text.price}</div>
      <div>{text.notes}</div>
    </div>
  );
}

function NotebookRow({
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
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const location = isUnlocked(booking) ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);

  return (
    <article
      style={{
        minHeight: 88,
        borderLeft: `4px solid ${color}`,
        borderRight: `2px solid ${BRAND.border}`,
        borderBottom: `2px solid ${BRAND.border}`,
        borderTop: `2px solid ${BRAND.border}`,
        borderRadius: 18,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffe3ea 50%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '66px minmax(0, 1fr)',
        gap: 9,
        padding: 10,
        marginTop: 8,
        boxShadow: '0 6px 14px rgba(7,27,70,0.04)',
      }}
    >
      <div
        style={{
          color: BRAND.navy,
          fontSize: 19,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getTimeLabel(booking)}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 68px 58px',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.08,
                fontWeight: 900,
                color: cancelled ? BRAND.red : BRAND.navy,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cancelled ? text.unavailable : booking.masterName}
            </div>

            <div
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: 800,
                color: BRAND.muted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cancelled ? text.available : booking.serviceName || 'Service'}
            </div>
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: cancelled ? BRAND.red : done ? BRAND.blue : BRAND.green,
              textAlign: 'right',
            }}
          >
            {money(Number(booking.price || 0))}
          </div>

          <button
            type="button"
            onClick={onDetails}
            style={{
              width: 38,
              height: 34,
              borderRadius: 12,
              border: 'none',
              background: 'transparent',
              color: BRAND.muted,
              fontSize: 23,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ≡
          </button>
        </div>

        {!cancelled ? (
          <>
            <div style={{ marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Pill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
              <Pill
                label={isPaid(booking) ? text.depositPaid : text.depositWaiting}
                color={isPaid(booking) ? '#008f3a' : '#b87500'}
                bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
              />
              <Pill
                label={isUnlocked(booking) ? text.contactsOpen : text.contactsLocked}
                color={isUnlocked(booking) ? '#008f3a' : BRAND.blue}
                bg={isUnlocked(booking) ? BRAND.softGreen : BRAND.softBlue}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                lineHeight: 1.25,
                fontWeight: 800,
                color: BRAND.muted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              📍 {location || 'London'}
            </div>

            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              <button type="button" onClick={onChat} style={smallActionButtonStyle}>
                💬 {text.openChat}
              </button>

              {!done ? (
                <button type="button" onClick={onDone} style={smallDoneButtonStyle}>
                  ✓ {text.markDone}
                </button>
              ) : (
                <button type="button" onClick={onDetails} style={smallActionButtonStyle}>
                  {text.details}
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

function FreeWindowRow({ time, text }: { time: string; text: PageText }) {
  return (
    <article
      style={{
        minHeight: 62,
        borderRadius: 18,
        border: `2px dashed #d2d2d2`,
        background: '#fbfbfb',
        display: 'grid',
        gridTemplateColumns: '66px minmax(0,1fr)',
        gap: 9,
        padding: 10,
        marginTop: 8,
      }}
    >
      <div
        style={{
          color: '#7b8490',
          fontSize: 19,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {time}
      </div>

      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: BRAND.navy }}>{text.available}</div>
        <div style={{ marginTop: 3, fontSize: 12, fontWeight: 800, color: BRAND.muted }}>
          {text.freeWindows}
        </div>
      </div>
    </article>
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
                minHeight: 50,
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
              <span style={{ fontSize: 13, fontWeight: 900 }}>{date.getDate()}</span>

              <span style={{ minHeight: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                {hasConfirmed ? <Dot color={BRAND.green} /> : null}
                {hasPending ? <Dot color={BRAND.yellow} /> : null}
                {hasCompleted ? <Dot color={BRAND.blue} /> : null}
                {hasCancelled ? <Dot color={BRAND.red} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 23,
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

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        background: color,
        display: 'inline-block',
      }}
    />
  );
}

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

const smallCircleButtonStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 26,
  fontWeight: 900,
  cursor: 'pointer',
};

const topTabsWrapStyle: CSSProperties = {
  marginTop: 15,
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 7,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 6,
};

const statsWrapStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 25,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 12,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const calendarWrapStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 10,
};

const selectStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 900,
  padding: '0 11px',
  outline: 'none',
};

const todayButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
};

const filterChipStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  padding: '0 14px',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const filterInputStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  padding: '0 12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const resetButtonStyle: CSSProperties = {
  marginTop: 11,
  width: '100%',
  minHeight: 42,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const emptyNotebookStyle: CSSProperties = {
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
  marginTop: 8,
};

const smallActionButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const smallDoneButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 14,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};
