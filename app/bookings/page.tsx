'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import { getOrCreateChatThread } from '../../services/chatStore';
import {
  getBookings,
  subscribeToBookingsStore,
  updateBookingStatus,
  getPublicBookingLocation,
  getVisibleBookingLocation,
  getProtectedBookingContact,
  canShowExactAddress,
  canShowDirectContacts,
  type BookingItem,
  type BookingStatus,
} from '../services/bookingsStore';

type BookingTab = 'upcoming' | 'completed' | 'cancelled';
type BookingFilter = 'all' | 'confirmed' | 'pending' | 'paid' | 'openContacts';

type PageTexts = {
  title: string;
  subtitle: string;
  upcoming: string;
  completed: string;
  cancelled: string;
  pending: string;
  confirmed: string;
  completedStatus: string;
  cancelledStatus: string;
  serviceDetails: string;
  closeDetails: string;
  cancelBooking: string;
  rebook: string;
  emptyUpcoming: string;
  emptyCompleted: string;
  emptyCancelled: string;
  back: string;
  home: string;
  activeNow: string;
  total: string;
  provider: string;
  bookingSummary: string;
  dateTime: string;
  price: string;
  address: string;
  area: string;
  exactAddress: string;
  contacts: string;
  phone: string;
  email: string;
  social: string;
  openChat: string;
  callSeller: string;
  routeToMaster: string;
  menuClose: string;
  menuCancel: string;
  menuOpenProfile: string;
  paidDeposit: string;
  waitingPayment: string;
  chatAvailable: string;
  chatLocked: string;
  waitingMaster: string;
  contactsUnlocked: string;
  contactsLocked: string;
  lockedValue: string;
  hiddenTitle: string;
  hiddenText: string;
  noPhoneAction: string;
  noRouteAction: string;
  todayAt: string;
  tomorrowAt: string;
  doneBadge: string;
  needsAction: string;
  calendarTitle: string;
  selectedDay: string;
  today: string;
  month: string;
  year: string;
  searchPlaceholder: string;
  all: string;
  paidOnly: string;
  openContacts: string;
  closeDay: string;
  noBookingsForDate: string;
  selectedDatePanel: string;
  urgentTitle: string;
  urgentSubtitle: string;
  filters: string;
  showFilters: string;
  hideFilters: string;
  monthView: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  border: '#111111',
  muted: '#657080',
};

const texts: Partial<Record<AppLanguage, PageTexts>> = {
  EN: {
    title: 'My bookings',
    subtitle: 'Calendar, filters, booking status, chat and contact access',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Waiting for provider',
    confirmed: 'Confirmed',
    completedStatus: 'Completed',
    cancelledStatus: 'Cancelled',
    serviceDetails: 'Booking details',
    closeDetails: 'Close',
    cancelBooking: 'Cancel booking',
    rebook: 'Book again',
    emptyUpcoming: 'No upcoming bookings yet',
    emptyCompleted: 'No completed bookings yet',
    emptyCancelled: 'No cancelled bookings yet',
    back: 'Back',
    home: 'Home',
    activeNow: 'Active now',
    total: 'Total',
    provider: 'Provider',
    bookingSummary: 'Booking summary',
    dateTime: 'Date & time',
    price: 'Price',
    address: 'Address',
    area: 'Area',
    exactAddress: 'Exact address',
    contacts: 'Contacts',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    openChat: 'Open chat',
    callSeller: 'Call',
    routeToMaster: 'Route',
    menuClose: 'Close',
    menuCancel: 'Cancel booking',
    menuOpenProfile: 'Open profile',
    paidDeposit: 'Deposit paid',
    waitingPayment: 'Waiting for deposit',
    chatAvailable: 'Chat available',
    chatLocked: 'Chat locked',
    waitingMaster: 'Provider must confirm',
    contactsUnlocked: 'Address & contacts open',
    contactsLocked: 'Locked until provider confirms',
    lockedValue: 'Locked',
    hiddenTitle: 'Contacts are locked',
    hiddenText:
      'Chat is available after deposit payment. Phone, exact address and route open only after the provider confirms the booking.',
    noPhoneAction: 'Phone locked',
    noRouteAction: 'Route locked',
    todayAt: 'Today at',
    tomorrowAt: 'Tomorrow at',
    doneBadge: 'Done',
    needsAction: 'Needs action',
    calendarTitle: 'Booking calendar',
    selectedDay: 'Selected day',
    today: 'Today',
    month: 'Month',
    year: 'Year',
    searchPlaceholder: 'Search master, service, area',
    all: 'All',
    paidOnly: 'Deposit paid',
    openContacts: 'Contacts open',
    closeDay: 'Close day',
    noBookingsForDate: 'No bookings for this date',
    selectedDatePanel: 'Bookings for selected date',
    urgentTitle: 'Today & tomorrow',
    urgentSubtitle: 'Urgent bookings shown first',
    filters: 'Filters',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    monthView: 'Month view',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Календарь, фильтры, статус брони, чат и доступ к контактам',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ждёт мастера',
    confirmed: 'Подтверждено',
    completedStatus: 'Завершено',
    cancelledStatus: 'Отменено',
    serviceDetails: 'Детали брони',
    closeDetails: 'Закрыть',
    cancelBooking: 'Отменить бронь',
    rebook: 'Повторить бронь',
    emptyUpcoming: 'Пока нет предстоящих бронирований',
    emptyCompleted: 'Пока нет завершённых бронирований',
    emptyCancelled: 'Пока нет отменённых бронирований',
    back: 'Назад',
    home: 'Главная',
    activeNow: 'Активно сейчас',
    total: 'Всего',
    provider: 'Специалист',
    bookingSummary: 'Сводка брони',
    dateTime: 'Дата и время',
    price: 'Цена',
    address: 'Адрес',
    area: 'Район',
    exactAddress: 'Точный адрес',
    contacts: 'Контакты',
    phone: 'Телефон',
    email: 'Email',
    social: 'Соцсети',
    openChat: 'Открыть чат',
    callSeller: 'Позвонить',
    routeToMaster: 'Маршрут',
    menuClose: 'Закрыть',
    menuCancel: 'Отменить бронь',
    menuOpenProfile: 'Открыть профиль',
    paidDeposit: 'Депозит оплачен',
    waitingPayment: 'Ждёт оплату депозита',
    chatAvailable: 'Чат доступен',
    chatLocked: 'Чат закрыт',
    waitingMaster: 'Мастер должен подтвердить',
    contactsUnlocked: 'Адрес и контакты открыты',
    contactsLocked: 'Закрыто до подтверждения мастером',
    lockedValue: 'Скрыто',
    hiddenTitle: 'Контакты закрыты',
    hiddenText:
      'После оплаты депозита доступен чат. Телефон, точный адрес и маршрут откроются только после подтверждения брони мастером.',
    noPhoneAction: 'Телефон закрыт',
    noRouteAction: 'Маршрут закрыт',
    todayAt: 'Сегодня в',
    tomorrowAt: 'Завтра в',
    doneBadge: 'Готово',
    needsAction: 'Нужно действие',
    calendarTitle: 'Календарь бронирований',
    selectedDay: 'Выбранный день',
    today: 'Сегодня',
    month: 'Месяц',
    year: 'Год',
    searchPlaceholder: 'Поиск: мастер, услуга, район',
    all: 'Все',
    paidOnly: 'Депозит оплачен',
    openContacts: 'Контакты открыты',
    closeDay: 'Закрыть день',
    noBookingsForDate: 'На эту дату броней нет',
    selectedDatePanel: 'Брони выбранной даты',
    urgentTitle: 'Сегодня и завтра',
    urgentSubtitle: 'Срочные брони показываются сверху',
    filters: 'Фильтры',
    showFilters: 'Включить фильтры',
    hideFilters: 'Скрыть фильтры',
    monthView: 'Весь месяц',
  },
  UA: {
    title: 'Мої бронювання',
    subtitle: 'Календар, фільтри, статус бронювання, чат і доступ до контактів',
    upcoming: 'Майбутні',
    completed: 'Завершені',
    cancelled: 'Скасовані',
    pending: 'Очікує майстра',
    confirmed: 'Підтверджено',
    completedStatus: 'Завершено',
    cancelledStatus: 'Скасовано',
    serviceDetails: 'Деталі бронювання',
    closeDetails: 'Закрити',
    cancelBooking: 'Скасувати бронювання',
    rebook: 'Забронювати знову',
    emptyUpcoming: 'Поки немає майбутніх бронювань',
    emptyCompleted: 'Поки немає завершених бронювань',
    emptyCancelled: 'Поки немає скасованих бронювань',
    back: 'Назад',
    home: 'Головна',
    activeNow: 'Активно зараз',
    total: 'Усього',
    provider: 'Спеціаліст',
    bookingSummary: 'Підсумок бронювання',
    dateTime: 'Дата і час',
    price: 'Ціна',
    address: 'Адреса',
    area: 'Район',
    exactAddress: 'Точна адреса',
    contacts: 'Контакти',
    phone: 'Телефон',
    email: 'Email',
    social: 'Соцмережі',
    openChat: 'Відкрити чат',
    callSeller: 'Подзвонити',
    routeToMaster: 'Маршрут',
    menuClose: 'Закрити',
    menuCancel: 'Скасувати бронювання',
    menuOpenProfile: 'Відкрити профіль',
    paidDeposit: 'Депозит оплачено',
    waitingPayment: 'Очікує оплату депозиту',
    chatAvailable: 'Чат доступний',
    chatLocked: 'Чат закрито',
    waitingMaster: 'Майстер має підтвердити',
    contactsUnlocked: 'Адреса і контакти відкриті',
    contactsLocked: 'Закрито до підтвердження майстром',
    lockedValue: 'Приховано',
    hiddenTitle: 'Контакти закрито',
    hiddenText:
      'Після оплати депозиту доступний чат. Телефон, точна адреса і маршрут відкриються тільки після підтвердження бронювання майстром.',
    noPhoneAction: 'Телефон закрито',
    noRouteAction: 'Маршрут закрито',
    todayAt: 'Сьогодні о',
    tomorrowAt: 'Завтра о',
    doneBadge: 'Готово',
    needsAction: 'Потрібна дія',
    calendarTitle: 'Календар бронювань',
    selectedDay: 'Обраний день',
    today: 'Сьогодні',
    month: 'Місяць',
    year: 'Рік',
    searchPlaceholder: 'Пошук: майстер, послуга, район',
    all: 'Усі',
    paidOnly: 'Депозит оплачено',
    openContacts: 'Контакти відкриті',
    closeDay: 'Закрити день',
    noBookingsForDate: 'На цю дату бронювань немає',
    selectedDatePanel: 'Бронювання обраної дати',
    urgentTitle: 'Сьогодні та завтра',
    urgentSubtitle: 'Термінові бронювання зверху',
    filters: 'Фільтри',
    showFilters: 'Увімкнути фільтри',
    hideFilters: 'Сховати фільтри',
    monthView: 'Весь місяць',
  },
};

const serviceNames: Record<string, Partial<Record<AppLanguage, string>>> = {
  Маникюр: { EN: 'Manicure', RU: 'Маникюр', UA: 'Манікюр' },
  Стрижка: { EN: 'Haircut', RU: 'Стрижка', UA: 'Стрижка' },
  Массаж: { EN: 'Massage', RU: 'Массаж', UA: 'Масаж' },
  Визаж: { EN: 'Makeup', RU: 'Визаж', UA: 'Візаж' },
  'Ремонт телефона': { EN: 'Phone repair', RU: 'Ремонт телефона', UA: 'Ремонт телефону' },
};

function getTexts(language: AppLanguage) {
  return texts[language] || texts.EN!;
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function serviceName(value: string, language: AppLanguage) {
  return serviceNames[value]?.[language] || serviceNames[value]?.EN || value;
}

function isPaid(booking: BookingItem) {
  return Boolean(booking.clientPaid || booking.paymentReceivedByPlatform || booking.unlockFeePaid);
}

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function canChat(booking: BookingItem) {
  return booking.status !== 'cancelled' && isPaid(booking);
}

function chatThreadId(booking: BookingItem) {
  return `booking-master-${booking.masterId || booking.id}`;
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function safeDate(value?: string) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatCalendarTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMonthName(monthIndex: number, language: AppLanguage) {
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

function formatDateLabel(value: string, text: PageTexts) {
  const source = String(value || '').trim();

  if (source.startsWith('Сегодня в ')) {
    return `${text.todayAt} ${source.replace('Сегодня в ', '').trim()}`;
  }

  if (source.startsWith('Завтра в ')) {
    return `${text.tomorrowAt} ${source.replace('Завтра в ', '').trim()}`;
  }

  return source;
}

function statusMeta(status: BookingStatus, text: PageTexts) {
  if (status === 'pending') {
    return {
      label: text.pending,
      bg: '#fff1bf',
      color: '#b87500',
      border: '#ffbf1f',
      icon: '!',
    };
  }

  if (status === 'upcoming') {
    return {
      label: text.confirmed,
      bg: '#dcffe8',
      color: '#008f3a',
      border: '#24c45a',
      icon: '✓',
    };
  }

  if (status === 'completed') {
    return {
      label: text.completedStatus,
      bg: '#dcecff',
      color: '#0e73d8',
      border: '#0e73d8',
      icon: '✓',
    };
  }

  return {
    label: text.cancelledStatus,
    bg: '#ffe0e8',
    color: '#d91f4f',
    border: '#ff2456',
    icon: '×',
  };
}

function bookingMatchesTab(booking: BookingItem, tab: BookingTab) {
  if (tab === 'upcoming') return booking.status === 'pending' || booking.status === 'upcoming';
  if (tab === 'completed') return booking.status === 'completed';
  return booking.status === 'cancelled';
}

function bookingMatchesFilter(booking: BookingItem, filter: BookingFilter) {
  if (filter === 'all') return true;
  if (filter === 'confirmed') return booking.status === 'upcoming';
  if (filter === 'pending') return booking.status === 'pending';
  if (filter === 'paid') return isPaid(booking);
  if (filter === 'openContacts') return isUnlocked(booking);
  return true;
}

function getBookingDate(booking: BookingItem) {
  return safeDate(booking.dateTime);
}

function sortBookingsByDate(items: BookingItem[]) {
  return [...items].sort((a, b) => {
    const left = getBookingDate(a)?.getTime() || 0;
    const right = getBookingDate(b)?.getTime() || 0;
    return left - right;
  });
}

function isTodayOrTomorrow(booking: BookingItem, today: Date) {
  const date = getBookingDate(booking);
  if (!date) return false;

  const tomorrow = addDays(today, 1);

  return isSameDay(date, today) || isSameDay(date, tomorrow);
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

export default function BookingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuBookingId, setMenuBookingId] = useState<string | null>(null);
  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const text = useMemo(() => getTexts(language), [language]);

  const urgentBookings = useMemo(() => {
    return sortBookingsByDate(
      bookings.filter((booking) => {
        return (
          isTodayOrTomorrow(booking, today) &&
          (booking.status === 'pending' || booking.status === 'upcoming')
        );
      })
    );
  }, [bookings, today]);

  const monthBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const date = getBookingDate(booking);
      return date && date.getFullYear() === calendarYear && date.getMonth() === calendarMonth;
    });
  }, [bookings, calendarMonth, calendarYear]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    let source = bookings.filter((booking) => bookingMatchesTab(booking, activeTab));

    if (selectedDate) {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, selectedDate) : false;
      });
    } else {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date && date.getFullYear() === calendarYear && date.getMonth() === calendarMonth;
      });
    }

    source = source.filter((booking) => bookingMatchesFilter(booking, activeFilter));

    if (q) {
      source = source.filter((booking) => {
        const location = `${booking.location || ''} ${booking.areaLabel || ''} ${
          booking.exactAddress || ''
        }`.toLowerCase();

        return (
          booking.masterName.toLowerCase().includes(q) ||
          booking.serviceName.toLowerCase().includes(q) ||
          location.includes(q) ||
          String(booking.price).includes(q)
        );
      });
    }

    return sortBookingsByDate(source);
  }, [activeFilter, activeTab, bookings, calendarMonth, calendarYear, search, selectedDate]);

  const activeNowCount = bookings.filter(
    (item) => item.status === 'pending' || item.status === 'upcoming'
  ).length;

  const menuBooking = bookings.find((booking) => booking.id === menuBookingId) || null;
  const detailsBooking = bookings.find((booking) => booking.id === detailsBookingId) || null;

  const emptyText =
    selectedDate
      ? text.noBookingsForDate
      : activeTab === 'upcoming'
      ? text.emptyUpcoming
      : activeTab === 'completed'
      ? text.emptyCompleted
      : text.emptyCancelled;

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => current - 2 + index);
  }, []);

  const openChat = (booking: BookingItem) => {
    if (!canChat(booking)) return;

    const thread = getOrCreateChatThread({
      threadId: chatThreadId(booking),
      providerName: booking.masterName || text.provider,
      providerAvatar:
        booking.masterAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      category: booking.serviceName || 'Booking',
      online: true,
      lastSeenText: 'Online',
    });

    router.push(`/messages/${encodeURIComponent(thread.id)}`);
  };

  const cancelBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'cancelled');
    setMenuBookingId(null);
    if (detailsBookingId === booking.id) setDetailsBookingId(null);
  };

  const handleSelectDate = (date: Date) => {
    const next = startOfDay(date);
    setSelectedDate(next);
    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
  };

  const handleCloseSelectedDate = () => {
    setSelectedDate(null);
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: BRAND.navy,
          paddingBottom: 140,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 150px' }}>
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
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 25,
                fontWeight: 900,
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
              onClick={() => router.push('/')}
              aria-label={text.home}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </header>

          <section style={{ marginTop: 16 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '-1.2px',
                color: BRAND.navy,
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13.5,
                lineHeight: 1.35,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.subtitle}
            </p>
          </section>

          {urgentBookings.length > 0 ? (
            <section
              style={{
                marginTop: 14,
                borderRadius: 26,
                border: `2px solid ${BRAND.border}`,
                background: '#fff0f3',
                padding: 12,
                boxShadow: '0 10px 22px rgba(255,36,86,0.1)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    border: `2px solid ${BRAND.border}`,
                    background: BRAND.red,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  !
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 19,
                      lineHeight: 1.05,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {text.urgentTitle}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 12,
                      fontWeight: 900,
                      color: BRAND.red,
                    }}
                  >
                    {text.urgentSubtitle}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    background: '#ffffff',
                    color: BRAND.red,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  {urgentBookings.length}
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'grid', gap: 9 }}>
                {urgentBookings.slice(0, 3).map((booking) => (
                  <UrgentBookingRow
                    key={booking.id}
                    booking={booking}
                    text={text}
                    language={language}
                    onOpen={() => setDetailsBookingId(booking.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section
            style={{
              marginTop: 14,
              borderRadius: 22,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 9,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <SummaryMiniBox
                title={text.activeNow}
                value={activeNowCount}
                bg="#fff0da"
                color={BRAND.navy}
                accent="#8b7355"
              />

              <SummaryMiniBox
                title={text.total}
                value={bookings.length}
                bg="#dcecff"
                color={BRAND.blue}
                accent={BRAND.blue}
              />

              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.border}`,
                  background: filtersOpen ? BRAND.navy : '#ffffff',
                  color: filtersOpen ? '#ffffff' : BRAND.navy,
                  fontSize: 24,
                  fontWeight: 900,
                  cursor: 'pointer',
                  position: 'relative',
                }}
                aria-label={filtersOpen ? text.hideFilters : text.showFilters}
              >
                ⚙
                {activeFilter !== 'all' || search.trim() ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: -5,
                      top: -7,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: `2px solid ${BRAND.border}`,
                      background: BRAND.red,
                      color: '#ffffff',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    !
                  </span>
                ) : null}
              </button>
            </div>

            {filtersOpen ? (
              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    height: 46,
                    borderRadius: 17,
                    border: `2px solid ${BRAND.border}`,
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 12px',
                  }}
                >
                  <span style={{ fontSize: 18, color: '#9ca3af' }}>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={text.searchPlaceholder}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 13,
                      fontWeight: 800,
                      color: BRAND.navy,
                      minWidth: 0,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 9,
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 2,
                  }}
                >
                  {([
                    ['all', text.all],
                    ['confirmed', text.confirmed],
                    ['pending', text.pending],
                    ['paid', text.paidOnly],
                    ['openContacts', text.openContacts],
                  ] as const).map(([filter, label]) => {
                    const active = activeFilter === filter;

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        style={{
                          flexShrink: 0,
                          minHeight: 38,
                          borderRadius: 999,
                          border: `2px solid ${
                            active
                              ? filter === 'pending'
                                ? BRAND.yellow
                                : filter === 'confirmed' ||
                                  filter === 'paid' ||
                                  filter === 'openContacts'
                                ? BRAND.green
                                : BRAND.border
                              : BRAND.border
                          }`,
                          background: active
                            ? filter === 'pending'
                              ? '#fff1bf'
                              : filter === 'confirmed' ||
                                filter === 'paid' ||
                                filter === 'openContacts'
                              ? '#dcffe8'
                              : BRAND.navy
                            : '#ffffff',
                          color: active
                            ? filter === 'pending'
                              ? '#b87500'
                              : filter === 'confirmed' ||
                                filter === 'paid' ||
                                filter === 'openContacts'
                              ? '#008f3a'
                              : '#ffffff'
                            : BRAND.navy,
                          padding: '0 13px',
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
              </div>
            ) : null}
          </section>

          <section
            style={{
              marginTop: 14,
              borderRadius: 24,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 7,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
            }}
          >
            {([
              ['upcoming', text.upcoming],
              ['completed', text.completed],
              ['cancelled', text.cancelled],
            ] as const).map(([tab, label]) => {
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    minHeight: 46,
                    borderRadius: 16,
                    border: `2px solid ${BRAND.border}`,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 12.2,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </section>

          <section
            style={{
              marginTop: 14,
              borderRadius: 30,
              border: `2px solid ${BRAND.border}`,
              background: '#f8fbff',
              padding: 14,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {text.calendarTitle}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 12.5,
                    lineHeight: 1.3,
                    fontWeight: 900,
                    color: BRAND.muted,
                  }}
                >
                  {selectedDate
                    ? `${text.selectedDay}: ${formatCalendarTitle(selectedDate, language)}`
                    : `${getMonthName(calendarMonth, language)} ${calendarYear}`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCalendarMonth(today.getMonth());
                  setCalendarYear(today.getFullYear());
                  setSelectedDate(null);
                }}
                style={{
                  minWidth: 62,
                  height: 54,
                  borderRadius: 20,
                  border: `2px solid ${BRAND.border}`,
                  background:
                    'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
                  boxShadow: '0 10px 20px rgba(14,115,216,0.18)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  padding: '0 8px',
                }}
              >
                {text.today}
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <label
                style={{
                  borderRadius: 18,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: '8px 11px',
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 900, color: BRAND.muted }}>
                  {text.year}
                </div>
                <select
                  value={calendarYear}
                  onChange={(event) => {
                    setCalendarYear(Number(event.target.value));
                    setSelectedDate(null);
                  }}
                  style={{
                    marginTop: 3,
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 17,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  borderRadius: 18,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: '8px 11px',
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 900, color: BRAND.muted }}>
                  {text.month}
                </div>
                <select
                  value={calendarMonth}
                  onChange={(event) => {
                    setCalendarMonth(Number(event.target.value));
                    setSelectedDate(null);
                  }}
                  style={{
                    marginTop: 3,
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 17,
                    fontWeight: 900,
                    color: BRAND.navy,
                    textTransform: 'capitalize',
                  }}
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index} value={index}>
                      {getMonthName(index, language)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <CalendarGrid
              language={language}
              bookings={monthBookings}
              selectedDate={selectedDate}
              today={today}
              month={calendarMonth}
              year={calendarYear}
              onSelectDate={handleSelectDate}
            />
          </section>

          {selectedDate ? (
            <section
              style={{
                marginTop: 14,
                borderRadius: 24,
                border: `2px solid ${BRAND.border}`,
                background: '#fffefa',
                padding: 13,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {text.selectedDatePanel}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12.5,
                    lineHeight: 1.25,
                    fontWeight: 900,
                    color: BRAND.muted,
                  }}
                >
                  {formatCalendarTitle(selectedDate, language)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseSelectedDate}
                aria-label={text.closeDay}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.navy,
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </section>
          ) : null}

          <section style={{ marginTop: 16 }}>
            {filteredBookings.length === 0 ? (
              <div
                style={{
                  minHeight: 130,
                  borderRadius: 24,
                  border: `2px dashed #d9d9d9`,
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
                {emptyText}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    text={text}
                    language={language}
                    onOpenDetails={() => setDetailsBookingId(booking.id)}
                    onOpenMenu={() => setMenuBookingId(booking.id)}
                    onOpenChat={() => openChat(booking)}
                    onCancel={() => cancelBooking(booking)}
                    onRebook={() => router.push(`/booking/${booking.masterId}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <BottomNav active="bookings" />
      </main>

      {menuBooking ? (
        <BookingMenu
          booking={menuBooking}
          text={text}
          onClose={() => setMenuBookingId(null)}
          onDetails={() => {
            setDetailsBookingId(menuBooking.id);
            setMenuBookingId(null);
          }}
          onProfile={() => router.push(`/master/${menuBooking.masterId}`)}
          onCancel={() => cancelBooking(menuBooking)}
        />
      ) : null}

      {detailsBooking ? (
        <BookingDetailsModal
          booking={detailsBooking}
          text={text}
          language={language}
          onClose={() => setDetailsBookingId(null)}
          onOpenChat={() => openChat(detailsBooking)}
          onRebook={() => router.push(`/booking/${detailsBooking.masterId}`)}
        />
      ) : null}
    </>
  );
}

function UrgentBookingRow({
  booking,
  text,
  language,
  onOpen,
}: {
  booking: BookingItem;
  text: PageTexts;
  language: AppLanguage;
  onOpen: () => void;
}) {
  const meta = statusMeta(booking.status, text);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: '100%',
        minHeight: 72,
        borderRadius: 20,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 10,
        display: 'grid',
        gridTemplateColumns: '48px minmax(0, 1fr) auto',
        gap: 10,
        alignItems: 'center',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <img
        src={
          booking.masterAvatar ||
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
        }
        alt={booking.masterName}
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          objectFit: 'cover',
          border: '1.5px solid #eeeeee',
        }}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.12,
            fontWeight: 900,
            color: BRAND.navy,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {booking.masterName}
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
          {serviceName(booking.serviceName, language)}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 900,
            color: BRAND.red,
          }}
        >
          📅 {formatDateLabel(booking.dateLabel, text)}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            display: 'inline-flex',
            minHeight: 26,
            padding: '0 8px',
            borderRadius: 999,
            border: `2px solid ${meta.border}`,
            background: meta.bg,
            color: meta.color,
            alignItems: 'center',
            fontSize: 10.5,
            fontWeight: 900,
          }}
        >
          {meta.icon}
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 15,
            fontWeight: 900,
            color: BRAND.red,
          }}
        >
          {money(booking.price)}
        </div>
      </div>
    </button>
  );
}

function CalendarGrid({
  language,
  bookings,
  selectedDate,
  today,
  month,
  year,
  onSelectDate,
}: {
  language: AppLanguage;
  bookings: BookingItem[];
  selectedDate: Date | null;
  today: Date;
  month: number;
  year: number;
  onSelectDate: (date: Date) => void;
}) {
  const weekDays = getWeekDays(language);
  const cells = getCalendarCells(year, month);

  return (
    <div
      style={{
        marginTop: 14,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 5,
      }}
    >
      {weekDays.map((day) => (
        <div
          key={day}
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9.5,
            fontWeight: 900,
            color: BRAND.muted,
            textTransform: 'capitalize',
          }}
        >
          {day}
        </div>
      ))}

      {cells.map(({ date, currentMonth }) => {
        const dayBookings = bookings.filter((booking) => {
          const bookingDate = getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        });

        const hasPending = dayBookings.some((booking) => booking.status === 'pending');
        const hasConfirmed = dayBookings.some((booking) => booking.status === 'upcoming');
        const hasCompleted = dayBookings.some((booking) => booking.status === 'completed');
        const hasCancelled = dayBookings.some((booking) => booking.status === 'cancelled');
        const selected = selectedDate ? isSameDay(date, selectedDate) : false;
        const currentToday = isSameDay(date, today);

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelectDate(date)}
            style={{
              minHeight: 52,
              borderRadius: 16,
              border: selected
                ? `2px solid ${BRAND.border}`
                : currentToday
                ? `2px solid ${BRAND.blue}`
                : '1.5px solid #e0e0e0',
              background: selected ? BRAND.navy : currentMonth ? '#ffffff' : '#f3f3f3',
              color: selected ? '#ffffff' : currentMonth ? BRAND.navy : '#a0a0a0',
              cursor: 'pointer',
              padding: 5,
              display: 'grid',
              alignContent: 'space-between',
              justifyItems: 'center',
              boxShadow: currentToday && !selected ? '0 0 0 3px rgba(14,115,216,0.1)' : 'none',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 900 }}>{date.getDate()}</span>

            <span
              style={{
                minHeight: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              }}
            >
              {hasPending ? <CalendarDot color={BRAND.red} /> : null}
              {hasConfirmed ? <CalendarDot color={BRAND.green} /> : null}
              {hasCompleted ? <CalendarDot color={BRAND.blue} /> : null}
              {hasCancelled ? <CalendarDot color="#9ca3af" /> : null}
              {dayBookings.length > 0 ? (
                <span
                  style={{
                    marginLeft: 2,
                    fontSize: 9,
                    fontWeight: 900,
                    color: selected ? '#ffffff' : BRAND.muted,
                  }}
                >
                  {dayBookings.length}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CalendarDot({ color }: { color: string }) {
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

function SummaryMiniBox({
  title,
  value,
  bg,
  color,
  accent,
}: {
  title: string;
  value: number;
  bg: string;
  color: string;
  accent: string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        padding: '8px 10px',
        minHeight: 54,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          minWidth: 0,
          fontSize: 11,
          lineHeight: 1.15,
          fontWeight: 900,
          color: accent,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 24, lineHeight: 1, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function BookingCard({
  booking,
  text,
  language,
  onOpenDetails,
  onOpenMenu,
  onOpenChat,
  onCancel,
  onRebook,
}: {
  booking: BookingItem;
  text: PageTexts;
  language: AppLanguage;
  onOpenDetails: () => void;
  onOpenMenu: () => void;
  onOpenChat: () => void;
  onCancel: () => void;
  onRebook: () => void;
}) {
  const meta = statusMeta(booking.status, text);
  const paid = isPaid(booking);
  const unlocked = isUnlocked(booking);
  const chatEnabled = canChat(booking);
  const location = unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);
  const canCancel = booking.status === 'pending' || booking.status === 'upcoming';

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 26,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 13,
        boxShadow: '0 10px 24px rgba(7,27,70,0.07)',
        overflow: 'hidden',
      }}
    >
      {booking.status === 'completed' ? (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
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
            zIndex: 2,
          }}
        >
          ✓
        </div>
      ) : null}

      {booking.status === 'pending' ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            minHeight: 30,
            padding: '0 10px',
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.red,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 900,
            zIndex: 2,
          }}
        >
          ! {text.needsAction}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: booking.status === 'pending' ? 34 : 12,
        }}
      >
        <button
          type="button"
          onClick={onOpenMenu}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            color: BRAND.navy,
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          ⋯
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '92px minmax(0, 1fr)',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <img
          src={
            booking.masterAvatar ||
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
          }
          alt={booking.masterName}
          style={{
            width: 92,
            height: 92,
            objectFit: 'cover',
            borderRadius: 20,
            border: '1.5px solid #eeeeee',
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              minHeight: 30,
              padding: '0 10px',
              borderRadius: 999,
              border: `2px solid ${meta.border}`,
              background: meta.bg,
              color: meta.color,
              fontSize: 11,
              fontWeight: 900,
              marginBottom: 7,
            }}
          >
            {meta.icon} {meta.label}
          </div>

          <div
            style={{
              fontSize: 20,
              lineHeight: 1.08,
              fontWeight: 900,
              color: BRAND.navy,
              paddingRight: booking.status === 'completed' ? 24 : 0,
            }}
          >
            {booking.masterName}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {serviceName(booking.serviceName, language)}
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 13,
              fontWeight: 900,
              color: BRAND.blue,
            }}
          >
            📅 {formatDateLabel(booking.dateLabel, text)}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.25,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            📍 {location}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 13,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
          }}
        >
          <MiniPill
            label={paid ? text.paidDeposit : text.waitingPayment}
            bg={paid ? '#dcffe8' : '#fff1bf'}
            color={paid ? '#008f3a' : '#b87500'}
          />

          <MiniPill
            label={unlocked ? text.contactsUnlocked : text.contactsLocked}
            bg={unlocked ? '#dcffe8' : '#dcecff'}
            color={unlocked ? '#008f3a' : BRAND.blue}
          />
        </div>

        <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.red }}>
          {money(booking.price)}
        </div>
      </div>

      <div style={{ marginTop: 13, display: 'grid', gap: 9 }}>
        <button
          type="button"
          onClick={onOpenDetails}
          style={{
            minHeight: 52,
            borderRadius: 17,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            color: BRAND.navy,
            fontSize: 15,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {text.serviceDetails}
        </button>

        <button
          type="button"
          disabled={!chatEnabled}
          onClick={onOpenChat}
          style={{
            minHeight: 52,
            borderRadius: 17,
            border: `2px solid ${chatEnabled ? BRAND.green : '#d7ded9'}`,
            background: chatEnabled ? BRAND.green : '#edf2ee',
            color: chatEnabled ? '#ffffff' : '#8b968e',
            fontSize: 15,
            fontWeight: 900,
            cursor: chatEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          💬 {chatEnabled ? text.openChat : text.chatLocked}
        </button>

        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: 50,
              borderRadius: 17,
              border: `2px solid ${BRAND.border}`,
              background: '#ffe0e8',
              color: '#d91f4f',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.cancelBooking}
          </button>
        ) : (
          <button
            type="button"
            onClick={onRebook}
            style={{
              minHeight: 50,
              borderRadius: 17,
              border: `2px solid ${BRAND.border}`,
              background: '#dcecff',
              color: BRAND.blue,
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.rebook}
          </button>
        )}
      </div>
    </article>
  );
}

function MiniPill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        minHeight: 30,
        padding: '0 9px',
        borderRadius: 999,
        border: `1.8px solid ${BRAND.border}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        lineHeight: 1.1,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

function BookingMenu({
  booking,
  text,
  onClose,
  onDetails,
  onProfile,
  onCancel,
}: {
  booking: BookingItem;
  text: PageTexts;
  onClose: () => void;
  onDetails: () => void;
  onProfile: () => void;
  onCancel: () => void;
}) {
  const canCancel = booking.status === 'pending' || booking.status === 'upcoming';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,17,17,0.25)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: `2px solid ${BRAND.border}`,
            borderRadius: 24,
            padding: 14,
            display: 'grid',
            gap: 10,
            boxShadow: '0 20px 44px rgba(0,0,0,0.18)',
          }}
        >
          <MenuButton label={text.serviceDetails} bg="#ffffff" color={BRAND.navy} onClick={onDetails} />
          <MenuButton label={text.menuOpenProfile} bg="#dcecff" color={BRAND.blue} onClick={onProfile} />

          {canCancel ? (
            <MenuButton label={text.menuCancel} bg="#ffe0e8" color="#d91f4f" onClick={onCancel} />
          ) : null}

          <MenuButton label={text.menuClose} bg={BRAND.navy} color="#ffffff" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  label,
  bg,
  color,
  onClick,
}: {
  label: string;
  bg: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 54,
        borderRadius: 17,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        color,
        fontSize: 16,
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function BookingDetailsModal({
  booking,
  text,
  language,
  onClose,
  onOpenChat,
  onRebook,
}: {
  booking: BookingItem;
  text: PageTexts;
  language: AppLanguage;
  onClose: () => void;
  onOpenChat: () => void;
  onRebook: () => void;
}) {
  const unlocked = isUnlocked(booking);
  const paid = isPaid(booking);
  const chatEnabled = canChat(booking);
  const contacts = getProtectedBookingContact(booking);
  const visibleAddress = getVisibleBookingLocation(booking);
  const publicArea = getPublicBookingLocation(booking);
  const meta = statusMeta(booking.status, text);

  const social = [contacts.whatsapp, contacts.telegram, contacts.instagram]
    .filter(Boolean)
    .join(' • ');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,17,17,0.25)',
        zIndex: 270,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          border: `2px solid ${BRAND.border}`,
          borderBottom: 'none',
          padding: '18px 14px calc(20px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <div
            style={{
              minHeight: 42,
              padding: '0 13px',
              borderRadius: 999,
              border: `2px solid ${meta.border}`,
              background: meta.bg,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {meta.icon} {meta.label}
          </div>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <OlamepLogo />
        </div>

        <section
          style={{
            marginTop: 16,
            borderRadius: 28,
            border: '1.5px solid #e4e4e4',
            background: '#ffffff',
            padding: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '82px minmax(0,1fr)',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={
                booking.masterAvatar ||
                'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
              }
              alt={booking.masterName}
              style={{
                width: 82,
                height: 82,
                borderRadius: 24,
                objectFit: 'cover',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>
                {text.provider}
              </div>

              <h2
                style={{
                  margin: '4px 0 0',
                  fontSize: 25,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {booking.masterName}
              </h2>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 15,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {serviceName(booking.serviceName, language)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontWeight: 900,
                  color: BRAND.red,
                }}
              >
                {money(booking.price)}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 24,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 900, color: BRAND.navy }}>
            {text.bookingSummary}
          </h3>

          <InfoGrid
            items={[
              [text.dateTime, formatDateLabel(booking.dateLabel, text)],
              [text.price, money(booking.price)],
              [text.address, unlocked ? visibleAddress : publicArea],
              [text.contacts, unlocked ? text.contactsUnlocked : text.contactsLocked],
            ]}
          />

          {!unlocked ? (
            <div
              style={{
                marginTop: 13,
                borderRadius: 18,
                border: `2px solid ${BRAND.border}`,
                background: '#fff1bf',
                padding: 13,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.navy }}>
                🔒 {text.hiddenTitle}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 13,
                  lineHeight: 1.45,
                  fontWeight: 800,
                  color: '#515866',
                }}
              >
                {text.hiddenText}
              </div>

              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <MiniPill
                  label={paid ? text.paidDeposit : text.waitingPayment}
                  bg={paid ? '#dcffe8' : '#dcecff'}
                  color={paid ? '#008f3a' : BRAND.blue}
                />
                <MiniPill label={text.waitingMaster} bg="#ffffff" color={BRAND.blue} />
              </div>
            </div>
          ) : null}
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 24,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 900, color: BRAND.navy }}>
            {text.contacts}
          </h3>

          <div style={{ marginTop: 13, display: 'grid', gap: 10 }}>
            <ContactLine
              icon="📍"
              label={unlocked ? text.exactAddress : text.area}
              value={unlocked ? visibleAddress : publicArea}
              locked={false}
            />
            <ContactLine
              icon="📞"
              label={text.phone}
              value={unlocked ? contacts.phone || text.lockedValue : text.lockedValue}
              locked={!unlocked}
            />
            <ContactLine
              icon="✉️"
              label={text.email}
              value={unlocked ? contacts.email || text.lockedValue : text.lockedValue}
              locked={!unlocked}
            />
            <ContactLine
              icon="💬"
              label={text.social}
              value={unlocked ? social || text.lockedValue : text.lockedValue}
              locked={!unlocked}
            />
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              disabled={!chatEnabled}
              onClick={onOpenChat}
              style={{
                minHeight: 54,
                borderRadius: 17,
                border: `2px solid ${chatEnabled ? BRAND.green : '#d7ded9'}`,
                background: chatEnabled ? BRAND.green : '#edf2ee',
                color: chatEnabled ? '#ffffff' : '#8b968e',
                fontSize: 15,
                fontWeight: 900,
                cursor: chatEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              💬 {text.openChat}
            </button>

            <button
              type="button"
              disabled={!unlocked || !contacts.phone}
              onClick={() => {
                if (!unlocked || !contacts.phone) return;
                window.location.href = `tel:${contacts.phone}`;
              }}
              style={{
                minHeight: 54,
                borderRadius: 17,
                border: `2px solid ${BRAND.border}`,
                background: unlocked && contacts.phone ? '#dcffe8' : '#f3f4f6',
                color: unlocked && contacts.phone ? '#008f3a' : '#9ca3af',
                fontSize: 15,
                fontWeight: 900,
                cursor: unlocked && contacts.phone ? 'pointer' : 'not-allowed',
              }}
            >
              {unlocked && contacts.phone ? text.callSeller : text.noPhoneAction}
            </button>
          </div>

          <button
            type="button"
            disabled={!unlocked}
            onClick={() => {
              if (!unlocked) return;
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  visibleAddress
                )}`,
                '_blank'
              );
            }}
            style={{
              marginTop: 10,
              width: '100%',
              minHeight: 56,
              borderRadius: 17,
              border: `2px solid ${BRAND.border}`,
              background: unlocked ? '#dcecff' : '#f3f4f6',
              color: unlocked ? BRAND.blue : '#9ca3af',
              fontSize: 16,
              fontWeight: 900,
              cursor: unlocked ? 'pointer' : 'not-allowed',
            }}
          >
            {unlocked ? text.routeToMaster : text.noRouteAction}
          </button>
        </section>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 13,
            width: '100%',
            minHeight: 56,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.navy,
            color: '#ffffff',
            fontSize: 17,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {text.closeDetails}
        </button>

        {booking.status === 'completed' || booking.status === 'cancelled' ? (
          <button
            type="button"
            onClick={onRebook}
            style={{
              marginTop: 10,
              width: '100%',
              minHeight: 56,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: '#dcecff',
              color: BRAND.blue,
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.rebook}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 18,
        border: '1.5px solid #d9dee8',
        overflow: 'hidden',
      }}
    >
      {items.map(([label, value], index) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 10,
            padding: '12px 11px',
            borderTop: index === 0 ? 'none' : '1.5px solid #d9dee8',
            background: index % 2 === 0 ? '#ffffff' : '#f8fbff',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>{label}</div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.3,
              fontWeight: 900,
              color: BRAND.navy,
              textAlign: 'right',
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactLine({
  icon,
  label,
  value,
  locked,
}: {
  icon: string;
  label: string;
  value: string;
  locked: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 17,
        border: '1.5px solid #d9dee8',
        background: '#ffffff',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '42px minmax(0,1fr)',
        gap: 11,
        alignItems: 'center',
        opacity: locked ? 0.58 : 1,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: locked ? '#f3f4f6' : '#dcecff',
          color: locked ? '#9ca3af' : BRAND.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 21,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>{label}</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 14,
            lineHeight: 1.25,
            fontWeight: 900,
            color: BRAND.navy,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
