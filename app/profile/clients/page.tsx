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
type CalendarMode = 'month' | 'week' | 'day' | 'list';
type PaymentFilter = 'all' | 'paid' | 'unpaid';
type StatusFilter = 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled';

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
  year: string;
  chooseMonth: string;
  range: string;
  from: string;
  to: string;
  client: string;
  procedure: string;
  time: string;
  status: string;
  payment: string;
  all: string;
  paid: string;
  unpaid: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  apply: string;
  clear: string;
  addBefore: string;
  addAfter: string;
  specialNote: string;
  regularClient: string;
  moveEarlier: string;
  moveLater: string;
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
  cream: '#fffdf8',
};

const texts: Partial<Record<AppLanguage, PageText>> = {
  EN: {
    title: 'My clients',
    subtitle: 'Daily notebook, bookings, requests and calendar',
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
    hideFilters: 'Hide filters',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    synced: 'Synced',
    confirmed: 'Confirmed',
    waiting: 'Needs attention',
    completed: 'Done',
    cancelled: 'Unavailable',
    unavailable: 'Unavailable',
    available: 'Free slot',
    selectedDay: 'Selected day',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Details',
    openChat: 'Chat',
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
    chooseMonth: 'Month',
    range: 'Range',
    from: 'From',
    to: 'To',
    client: 'Client',
    procedure: 'Procedure',
    time: 'Time',
    status: 'Status',
    payment: 'Payment',
    all: 'All',
    paid: 'Paid',
    unpaid: 'Unpaid',
    search: 'Search name or service',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    apply: 'Apply',
    clear: 'Clear',
    addBefore: 'Add time before 05:00',
    addAfter: 'Add time after 00:00',
    specialNote: 'Special note',
    regularClient: 'Regular client',
    moveEarlier: 'Earlier',
    moveLater: 'Later',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Ежедневник, записи, запросы и календарь',
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
    hideFilters: 'Скрыть',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    synced: 'Синхронизировано',
    confirmed: 'Подтверждено',
    waiting: 'Требует внимания',
    completed: 'Готово',
    cancelled: 'Недоступно',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    selectedDay: 'Выбранный день',
    bookings: 'записи',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Готово',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    total: 'Всего',
    revenue: 'Доход',
    done: 'Готово',
    year: 'Год',
    chooseMonth: 'Месяц',
    range: 'Диапазон',
    from: 'От',
    to: 'До',
    client: 'Клиент',
    procedure: 'Процедура',
    time: 'Время',
    status: 'Статус',
    payment: 'Оплата',
    all: 'Все',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    search: 'Поиск по имени или услуге',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    apply: 'Применить',
    clear: 'Очистить',
    addBefore: 'Добавить время до 05:00',
    addAfter: 'Добавить время после 00:00',
    specialNote: 'Особая заметка',
    regularClient: 'Постоянный клиент',
    moveEarlier: 'Раньше',
    moveLater: 'Позже',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Щоденник, записи, запити і календар',
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
    hideFilters: 'Сховати',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    synced: 'Синхронізовано',
    confirmed: 'Підтверджено',
    waiting: 'Потребує уваги',
    completed: 'Готово',
    cancelled: 'Недоступно',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    selectedDay: 'Обраний день',
    bookings: 'записи',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Готово',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    total: 'Усього',
    revenue: 'Дохід',
    done: 'Готово',
    year: 'Рік',
    chooseMonth: 'Місяць',
    range: 'Діапазон',
    from: 'Від',
    to: 'До',
    client: 'Клієнт',
    procedure: 'Процедура',
    time: 'Час',
    status: 'Статус',
    payment: 'Оплата',
    all: 'Усі',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    search: 'Пошук за імʼям або послугою',
    minPrice: 'Ціна від',
    maxPrice: 'Ціна до',
    apply: 'Застосувати',
    clear: 'Очистити',
    addBefore: 'Додати час до 05:00',
    addAfter: 'Додати час після 00:00',
    specialNote: 'Особлива нотатка',
    regularClient: 'Постійний клієнт',
    moveEarlier: 'Раніше',
    moveLater: 'Пізніше',
  },
};

const demoSchedule: BookingItem[] = [
  {
    id: 'client-demo-1',
    masterId: 'client-lucie',
    masterName: 'Lucie Hlavová',
    masterAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Стрижка волос',
    price: 35,
    status: 'upcoming',
    dateTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
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
    id: 'client-demo-2',
    masterId: 'client-janicka',
    masterName: 'Janička Andělová',
    masterAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Маникюр',
    price: 30,
    status: 'completed',
    dateTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
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
    id: 'client-demo-3',
    masterId: 'client-klara',
    masterName: 'Klára Nováková',
    masterAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Массаж',
    price: 60,
    status: 'cancelled',
    dateTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
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
    id: 'client-demo-4',
    masterId: 'client-lenka',
    masterName: 'Lenka Bohatová',
    masterAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Окрашивание',
    price: 85,
    status: 'upcoming',
    dateTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
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
    id: 'client-demo-5',
    masterId: 'client-barbora',
    masterName: 'Barbora Bendová',
    masterAvatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Наращивание волос',
    price: 120,
    status: 'pending',
    dateTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    dateLabel: 'Today at 18:00',
    location: 'Hackney, London',
    areaLabel: 'Hackney',
    exactAddress: '44 Mare Street, Hackney, London',
    clientPaid: false,
    paymentReceivedByPlatform: false,
    unlockFeePaid: false,
    bookingConfirmedByMaster: false,
    promotionPaidByMaster: false,
  } as BookingItem,
];

const regularClients = new Set(['Lucie Hlavová', 'Lenka Bohatová', 'Barbora Bendová']);

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

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateInput(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return startOfDay(new Date());
  return startOfDay(date);
}

function getMonthName(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMonthOnly(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), { month: 'long' }).format(date);
}

function getDayTitle(date: Date, language: AppLanguage) {
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
  if (booking.status === 'cancelled') return text.unavailable;
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFreeWindows, setShowFreeWindows] = useState(true);
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [fromDate, setFromDate] = useState<Date>(() => startOfDay(new Date()));
  const [toDate, setToDate] = useState<Date>(() => startOfDay(new Date()));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => {
      const saved = getBookings();
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

  const visibleBookings = useMemo(() => {
    let source = [...bookings];

    if (viewMode === 'today') {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, today) : false;
      });
    }

    if (viewMode === 'tomorrow') {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, tomorrow) : false;
      });
    }

    if (viewMode === 'requests') {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (viewMode === 'history') {
      source = source.filter(
        (booking) => booking.status === 'completed' || booking.status === 'cancelled'
      );
    }

    if (viewMode === 'calendar') {
      if (calendarMode === 'day' || calendarMode === 'list') {
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, selectedDate) : false;
        });
      }

      if (calendarMode === 'week') {
        const weekStart = addDays(selectedDate, -((selectedDate.getDay() + 6) % 7));
        const weekEnd = addDays(weekStart, 6);
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? date >= weekStart && date <= addDays(weekEnd, 1) : false;
        });
      }

      if (calendarMode === 'month') {
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return (
            date &&
            date.getMonth() === calendarDate.getMonth() &&
            date.getFullYear() === calendarDate.getFullYear()
          );
        });
      }
    }

    source = source.filter((booking) => {
      const date = getBookingDate(booking);
      return date ? date >= fromDate && date <= addDays(toDate, 1) : true;
    });

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
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

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      source = source.filter((booking) => {
        return (
          booking.masterName.toLowerCase().includes(q) ||
          booking.serviceName.toLowerCase().includes(q) ||
          String(booking.location || '').toLowerCase().includes(q)
        );
      });
    }

    if (minPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) >= Number(minPrice));
    }

    if (maxPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) <= Number(maxPrice));
    }

    return source.sort((a, b) => {
      const left = getBookingDate(a)?.getTime() || 0;
      const right = getBookingDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    bookings,
    calendarDate,
    calendarMode,
    fromDate,
    maxPrice,
    minPrice,
    paymentFilter,
    query,
    selectedDate,
    showOnlyRequests,
    statusFilter,
    today,
    tomorrow,
    toDate,
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

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setShowOnlyRequests(false);
    setFromDate(selectedDate);
    setToDate(selectedDate);
  };

  const jumpToday = () => {
    const now = startOfDay(new Date());
    setSelectedDate(now);
    setCalendarDate(now);
    setFromDate(now);
    setToDate(now);
    setViewMode('today');
    setCalendarMode('day');
  };

  const selectDay = (date: Date) => {
    const day = startOfDay(date);
    setSelectedDate(day);
    setCalendarDate(day);
    setFromDate(day);
    setToDate(day);
    setViewMode('calendar');
    setCalendarMode('day');
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
                onClick={() => {
                  setViewMode(mode);
                  if (mode === 'today') {
                    setSelectedDate(today);
                    setCalendarDate(today);
                    setFromDate(today);
                    setToDate(today);
                    setCalendarMode('day');
                  }
                  if (mode === 'tomorrow') {
                    setSelectedDate(tomorrow);
                    setCalendarDate(tomorrow);
                    setFromDate(tomorrow);
                    setToDate(tomorrow);
                    setCalendarMode('day');
                  }
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

        <section style={statsShellStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title={text.total} value={String(visibleBookings.length)} bg={BRAND.softBlue} />
            <StatBox title={text.revenue} value={money(totalRevenue)} bg="#fff0da" />
            <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softViolet} />
          </div>
        </section>

        <section style={calendarShellStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px',
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
              }}
              style={roundButtonStyle}
            >
              ‹
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: 28,
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
              }}
              style={roundButtonStyle}
            >
              ›
            </button>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 8 }}>
            <SelectBox
              label={text.year}
              value={calendarDate.getFullYear()}
              onChange={(value) => {
                const next = new Date(calendarDate);
                next.setFullYear(Number(value));
                setCalendarDate(next);
              }}
              options={years.map((year) => ({ value: String(year), label: String(year) }))}
            />

            <SelectBox
              label={text.chooseMonth}
              value={calendarDate.getMonth()}
              onChange={(value) => {
                const next = new Date(calendarDate);
                next.setMonth(Number(value));
                setCalendarDate(next);
              }}
              options={Array.from({ length: 12 }, (_, index) => ({
                value: String(index),
                label: getMonthOnly(new Date(2026, index, 1), language),
              }))}
            />

            <button type="button" onClick={jumpToday} style={todayButtonStyle}>
              {text.today}
            </button>
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
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

          {calendarMode === 'month' ? (
            <CalendarGrid
              language={language}
              calendarDate={calendarDate}
              selectedDate={selectedDate}
              bookings={monthBookings}
              onSelect={selectDay}
            />
          ) : null}

          {calendarMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={bookings}
              onSelect={selectDay}
            />
          ) : null}

          <div style={rangeCardStyle}>
            <div>
              <div style={{ fontSize: 23, fontWeight: 900, color: BRAND.navy }}>{text.range}</div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900, color: BRAND.muted }}>
                {dateInputValue(fromDate)} · {visibleBookings.length} {text.bookings}
              </div>
            </div>

            <div style={rangeCountStyle}>{visibleBookings.length}</div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              style={{
                ...filterPillStyle,
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
                ...filterPillStyle,
                background: showFreeWindows ? BRAND.navy : '#ffffff',
                color: showFreeWindows ? '#ffffff' : BRAND.navy,
              }}
            >
              ◷ {text.freeWindows}
            </button>

            <button
              type="button"
              onClick={() => setShowOnlyRequests((prev) => !prev)}
              style={{
                ...filterPillStyle,
                background: showOnlyRequests ? BRAND.navy : '#ffffff',
                color: showOnlyRequests ? '#ffffff' : BRAND.navy,
              }}
            >
              ⚠ {text.onlyRequests}
            </button>
          </div>

          {filtersOpen ? (
            <section style={filtersBoxStyle}>
              <div style={{ display: 'grid', gap: 9 }}>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={text.search}
                  style={inputStyle}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={smallLabelStyle}>
                    <span>{text.from}</span>
                    <input
                      type="date"
                      value={dateInputValue(fromDate)}
                      onChange={(event) => setFromDate(fromDateInput(event.target.value))}
                      style={plainInputStyle}
                    />
                  </label>

                  <label style={smallLabelStyle}>
                    <span>{text.to}</span>
                    <input
                      type="date"
                      value={dateInputValue(toDate)}
                      onChange={(event) => setToDate(fromDateInput(event.target.value))}
                      style={plainInputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder={text.minPrice}
                    inputMode="numeric"
                    style={inputStyle}
                  />
                  <input
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder={text.maxPrice}
                    inputMode="numeric"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    style={inputStyle}
                  >
                    <option value="all">{text.status}: {text.all}</option>
                    <option value="upcoming">{text.confirmed}</option>
                    <option value="pending">{text.waiting}</option>
                    <option value="completed">{text.completed}</option>
                    <option value="cancelled">{text.cancelled}</option>
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)}
                    style={inputStyle}
                  >
                    <option value="all">{text.payment}: {text.all}</option>
                    <option value="paid">{text.paid}</option>
                    <option value="unpaid">{text.unpaid}</option>
                  </select>
                </div>

                <button type="button" onClick={resetFilters} style={clearButtonStyle}>
                  {text.clear}
                </button>
              </div>
            </section>
          ) : null}

          <div style={legendStyle}>
            <LegendDot color={BRAND.blue} label={text.completed} />
            <LegendDot color={BRAND.green} label={text.confirmed} />
            <LegendDot color={BRAND.red} label={text.unavailable} />
            <LegendDot color={BRAND.yellow} label={text.waiting} />
          </div>
        </section>

        <NotebookSchedule
          text={text}
          bookings={visibleBookings}
          showFreeWindows={showFreeWindows}
          openNoteId={openNoteId}
          onOpenNote={setOpenNoteId}
          onMarkDone={markDone}
          onDetails={() => router.push('/bookings')}
          onChat={() => router.push('/messages')}
        />
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function NotebookSchedule({
  text,
  bookings,
  showFreeWindows,
  openNoteId,
  onOpenNote,
  onMarkDone,
  onDetails,
  onChat,
}: {
  text: PageText;
  bookings: BookingItem[];
  showFreeWindows: boolean;
  openNoteId: string | null;
  onOpenNote: (id: string | null) => void;
  onMarkDone: (booking: BookingItem) => void;
  onDetails: () => void;
  onChat: () => void;
}) {
  const scheduleHours = Array.from({ length: 20 }, (_, index) => index + 5);

  const bookingsByHour = useMemo(() => {
    const map = new Map<number, BookingItem[]>();

    bookings.forEach((booking) => {
      const date = getBookingDate(booking);
      if (!date) return;
      const hour = date.getHours();
      const current = map.get(hour) || [];
      current.push(booking);
      map.set(hour, current);
    });

    return map;
  }, [bookings]);

  return (
    <section style={{ marginTop: 18 }}>
      <button type="button" style={addTimeButtonStyle}>
        + {text.addBefore}
      </button>

      <div style={notebookHeaderStyle}>
        <div>{text.time}</div>
        <div>{text.client} / {text.procedure}</div>
        <div>{text.price}</div>
        <div>{text.notes}</div>
      </div>

      <div style={notebookStyle}>
        {scheduleHours.map((hour) => {
          const hourBookings = bookingsByHour.get(hour) || [];

          if (hourBookings.length === 0) {
            if (!showFreeWindows) return null;

            return (
              <FreeNotebookLine
                key={`free-${hour}`}
                hour={hour}
                text={text}
              />
            );
          }

          return hourBookings.map((booking) => (
            <NotebookBookingLine
              key={booking.id}
              booking={booking}
              text={text}
              noteOpen={openNoteId === booking.id}
              onOpenNote={() => onOpenNote(openNoteId === booking.id ? null : booking.id)}
              onMarkDone={() => onMarkDone(booking)}
              onDetails={onDetails}
              onChat={onChat}
            />
          ));
        })}
      </div>

      <button type="button" style={addTimeButtonStyle}>
        + {text.addAfter}
      </button>
    </section>
  );
}

function NotebookBookingLine({
  booking,
  text,
  noteOpen,
  onOpenNote,
  onMarkDone,
  onDetails,
  onChat,
}: {
  booking: BookingItem;
  text: PageText;
  noteOpen: boolean;
  onOpenNote: () => void;
  onMarkDone: () => void;
  onDetails: () => void;
  onChat: () => void;
}) {
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const location = isUnlocked(booking)
    ? getVisibleBookingLocation(booking)
    : getPublicBookingLocation(booking);
  const isRegular = regularClients.has(booking.masterName);

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 22,
        border: `2.5px solid ${BRAND.border}`,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffe3ea 49%, #ffe3ea 100%)'
          : bg,
        padding: 10,
        display: 'grid',
        gridTemplateColumns: '86px minmax(0, 1fr) 72px 32px',
        gap: 8,
        alignItems: 'center',
        boxShadow: '0 8px 18px rgba(7,27,70,0.05)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: color,
        }}
      />

      {done ? (
        <div style={doneTickStyle}>✓</div>
      ) : null}

      <div style={{ fontSize: 29, fontWeight: 900, color: BRAND.navy, textAlign: 'center' }}>
        {getTimeLabel(booking)}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 19,
              lineHeight: 1.05,
              fontWeight: 900,
              color: cancelled ? BRAND.red : BRAND.navy,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {cancelled ? text.unavailable : booking.masterName}
          </div>

          {isRegular ? (
            <span title={text.regularClient} style={{ fontSize: 15, color: BRAND.yellow }}>
              ★★★
            </span>
          ) : null}

          {pending ? (
            <button
              type="button"
              onClick={onOpenNote}
              title={text.specialNote}
              style={noteIconStyle}
            >
              !
            </button>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 13,
            fontWeight: 900,
            color: BRAND.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {cancelled ? text.available : booking.serviceName || text.procedure}
        </div>

        {!cancelled ? (
          <div style={{ marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Pill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
            <Pill
              label={isPaid(booking) ? 'Deposit paid' : 'Deposit waiting'}
              color={isPaid(booking) ? '#008f3a' : '#b87500'}
              bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
            />
            <Pill
              label={isUnlocked(booking) ? 'Contacts open' : 'Contacts locked'}
              color={isUnlocked(booking) ? '#008f3a' : BRAND.blue}
              bg={isUnlocked(booking) ? BRAND.softGreen : BRAND.softBlue}
            />
          </div>
        ) : null}

        {!cancelled ? (
          <div
            style={{
              marginTop: 7,
              fontSize: 12,
              lineHeight: 1.25,
              fontWeight: 900,
              color: BRAND.muted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            📍 {location || 'London'}
          </div>
        ) : null}

        {noteOpen ? (
          <div style={noteBoxStyle}>
            {text.specialNote}: {pending ? 'Клиент ждёт подтверждение / можно добавить свою заметку.' : 'Нет специальных пожеланий.'}
          </div>
        ) : null}

        {!cancelled ? (
          <div style={{ marginTop: 9, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button type="button" onClick={onChat} style={miniOutlineButtonStyle}>
              💬 {text.openChat}
            </button>
            {done ? (
              <button type="button" onClick={onDetails} style={miniOutlineButtonStyle}>
                {text.details}
              </button>
            ) : (
              <button type="button" onClick={onMarkDone} style={miniGreenButtonStyle}>
                ✓ {text.markDone}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 25,
          fontWeight: 900,
          color: cancelled ? BRAND.red : color,
          textAlign: 'right',
        }}
      >
        {money(Number(booking.price || 0))}
      </div>

      <button type="button" onClick={onDetails} style={menuDotsStyle}>
        ≡
      </button>
    </article>
  );
}

function FreeNotebookLine({ hour, text }: { hour: number; text: PageText }) {
  return (
    <article
      style={{
        borderRadius: 18,
        border: '2px dashed #d7dce4',
        background: '#ffffff',
        minHeight: 54,
        display: 'grid',
        gridTemplateColumns: '86px minmax(0, 1fr)',
        gap: 8,
        alignItems: 'center',
        padding: 10,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#9ca3af',
          textAlign: 'center',
        }}
      >
        {String(hour).padStart(2, '0')}:00
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color: BRAND.muted }}>
        {text.available}
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
    <div style={calendarGridShellStyle}>
      <div style={weekHeaderStyle}>
        {weekDays.map((day) => (
          <div key={day} style={weekDayStyle}>
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
  const weekStart = addDays(selectedDate, -((selectedDate.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map((date) => {
        const count = bookings.filter((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        }).length;
        const active = isSameDay(date, selectedDate);

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelect(date)}
            style={{
              minHeight: 68,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: active ? BRAND.navy : '#ffffff',
              color: active ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(date)}
            </span>
            <span style={{ fontSize: 20, fontWeight: 900 }}>{date.getDate()}</span>
            <span style={{ fontSize: 10, fontWeight: 900 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label style={selectShellStyle}>
      <span style={{ display: 'none' }}>{label}</span>
      <select value={String(value)} onChange={(event) => onChange(event.target.value)} style={selectStyle}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div style={{ ...statBoxStyle, background: bg }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div style={{ fontSize: 31, fontWeight: 900, color: BRAND.navy }}>{value}</div>
    </div>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 24,
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 7, height: 7, borderRadius: 999, background: color, display: 'inline-block' }} />;
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

const statsShellStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 25,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 12,
};

const statBoxStyle: CSSProperties = {
  minHeight: 92,
  borderRadius: 22,
  border: `2.5px solid ${BRAND.border}`,
  padding: 14,
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

const roundButtonStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 27,
  fontWeight: 900,
  cursor: 'pointer',
};

const selectShellStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 17,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
};

const selectStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: BRAND.navy,
  fontSize: 15,
  fontWeight: 900,
};

const todayButtonStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 17,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const calendarModeButtonStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const rangeCardStyle: CSSProperties = {
  marginTop: 12,
  minHeight: 76,
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: '10px 14px',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 10,
  alignItems: 'center',
};

const rangeCountStyle: CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softBlue,
  color: BRAND.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 23,
  fontWeight: 900,
};

const filterPillStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  padding: '0 16px',
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
  flexShrink: 0,
};

const filtersBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: '#f8fbff',
  padding: 12,
};

const inputStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  padding: '0 12px',
  fontSize: 13,
  fontWeight: 900,
  outline: 'none',
  minWidth: 0,
};

const smallLabelStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: '7px 10px',
  display: 'grid',
  gap: 3,
  fontSize: 10,
  fontWeight: 900,
  color: BRAND.muted,
};

const plainInputStyle: CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  minWidth: 0,
};

const clearButtonStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
};

const legendStyle: CSSProperties = {
  marginTop: 12,
  minHeight: 44,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  overflowX: 'auto',
  padding: '0 13px',
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.navy,
};

const calendarGridShellStyle: CSSProperties = {
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

const addTimeButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
  borderRadius: 18,
  border: `2px dashed #d7dce4`,
  background: '#ffffff',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
  marginBottom: 8,
};

const notebookHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '86px minmax(0,1fr) 72px 32px',
  gap: 8,
  padding: '0 10px 8px',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
};

const notebookStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  paddingBottom: 8,
};

const doneTickStyle: CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 8,
  width: 24,
  height: 24,
  borderRadius: 999,
  border: `2px solid ${BRAND.green}`,
  background: '#ffffff',
  color: BRAND.green,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 900,
  zIndex: 2,
};

const noteIconStyle: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.yellow,
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
  flexShrink: 0,
};

const noteBoxStyle: CSSProperties = {
  marginTop: 8,
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 9,
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 900,
  color: BRAND.navy,
};

const miniOutlineButtonStyle: CSSProperties = {
  minHeight: 40,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const miniGreenButtonStyle: CSSProperties = {
  minHeight: 40,
  borderRadius: 15,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const menuDotsStyle: CSSProperties = {
  width: 30,
  height: 34,
  border: 'none',
  background: 'transparent',
  color: BRAND.muted,
  fontSize: 27,
  fontWeight: 900,
  cursor: 'pointer',
};
