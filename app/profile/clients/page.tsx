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

type ViewMode = 'today' | 'tomorrow' | 'week' | 'calendar' | 'history';
type CalendarMode = 'month' | 'week' | 'day' | 'list';
type CalendarStage = 'year' | 'months' | 'month';
type StatusFilter = 'all' | 'completed' | 'upcoming' | 'pending' | 'cancelled';
type PaymentFilter = 'all' | 'paid' | 'unpaid';

type PageText = {
  title: string;
  subtitle: string;
  today: string;
  tomorrow: string;
  week: string;
  calendar: string;
  history: string;
  year: string;
  month: string;
  day: string;
  list: string;
  chooseYear: string;
  chooseMonth: string;
  management: string;
  freeWindows: string;
  onlyRequests: string;
  confirmed: string;
  waiting: string;
  completed: string;
  cancelled: string;
  unavailable: string;
  available: string;
  all: string;
  marked: string;
  bookings: string;
  noBookings: string;
  details: string;
  openChat: string;
  markDone: string;
  approve: string;
  reject: string;
  price: string;
  notes: string;
  back: string;
  close: string;
  dateRange: string;
  from: string;
  to: string;
  clientName: string;
  minPrice: string;
  maxPrice: string;
  paidOnly: string;
  unpaidOnly: string;
  allPayments: string;
  reset: string;
  apply: string;
  addBefore: string;
  addAfter: string;
  time: string;
  clientProcedure: string;
  repeatClient: string;
  specialNote: string;
  addCustomTime: string;
  minute: string;
  newTime: string;
  paymentMethod: string;
  cash: string;
  card: string;
  app: string;
  clientCard: string;
  contactsLocked: string;
  contactsOpen: string;
  depositPaid: string;
  depositWaiting: string;
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
  softViolet: '#f2edff',
  cream: '#fffdf8',
};

const texts: Partial<Record<AppLanguage, PageText>> = {
  EN: {
    title: 'My clients',
    subtitle: 'Daily notebook, bookings, requests and calendar',
    today: 'Today',
    tomorrow: 'Tomorrow',
    week: 'Week',
    calendar: 'Calendar',
    history: 'History',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    list: 'List',
    chooseYear: 'Choose year',
    chooseMonth: 'Choose month',
    management: 'Management',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    confirmed: 'Confirmed',
    waiting: 'Waiting',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free slot',
    all: 'All',
    marked: 'Marked',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    approve: 'Approve',
    reject: 'Reject',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
    dateRange: 'Date range',
    from: 'From',
    to: 'To',
    clientName: 'Client name',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    paidOnly: 'Paid only',
    unpaidOnly: 'Unpaid only',
    allPayments: 'All payments',
    reset: 'Reset',
    apply: 'Apply',
    addBefore: '+ Add time before 05:00',
    addAfter: '+ Add time after 00:00',
    time: 'Time',
    clientProcedure: 'Client / Procedure',
    repeatClient: 'Regular client',
    specialNote: 'Special note',
    addCustomTime: 'Add custom time',
    minute: 'Minute',
    newTime: 'New time',
    paymentMethod: 'Payment method',
    cash: 'Cash',
    card: 'Card',
    app: 'App',
    clientCard: 'Client card',
    contactsLocked: 'Contacts locked',
    contactsOpen: 'Contacts open',
    depositPaid: 'Deposit paid',
    depositWaiting: 'Deposit waiting',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Ежедневник, брони, запросы и календарь',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    week: 'Неделя',
    calendar: 'Календарь',
    history: 'История',
    year: 'Год',
    month: 'Месяц',
    day: 'День',
    list: 'Список',
    chooseYear: 'Выбери год',
    chooseMonth: 'Выбери месяц',
    management: 'Управление',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    all: 'Все',
    marked: 'Отмеченные',
    bookings: 'записей',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Готово',
    approve: 'Подтвердить',
    reject: 'Отклонить',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    dateRange: 'Диапазон дат',
    from: 'От',
    to: 'До',
    clientName: 'Имя клиента',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    paidOnly: 'Только оплаченные',
    unpaidOnly: 'Только неоплаченные',
    allPayments: 'Все оплаты',
    reset: 'Сбросить',
    apply: 'Применить',
    addBefore: '+ Добавить время до 05:00',
    addAfter: '+ Добавить время после 00:00',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    repeatClient: 'Постоянный клиент',
    specialNote: 'Спец. заметка',
    addCustomTime: 'Добавить своё время',
    minute: 'Минуты',
    newTime: 'Новое время',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Карта',
    app: 'В приложении',
    clientCard: 'Карточка клиента',
    contactsLocked: 'Контакты скрыты',
    contactsOpen: 'Контакты открыты',
    depositPaid: 'Оплачено',
    depositWaiting: 'Ждёт оплаты',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Щоденник, бронювання, запити та календар',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    week: 'Тиждень',
    calendar: 'Календар',
    history: 'Історія',
    year: 'Рік',
    month: 'Місяць',
    day: 'День',
    list: 'Список',
    chooseYear: 'Обери рік',
    chooseMonth: 'Обери місяць',
    management: 'Керування',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    confirmed: 'Підтверджено',
    waiting: 'Очікує',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    all: 'Усе',
    marked: 'Позначені',
    bookings: 'записів',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Готово',
    approve: 'Підтвердити',
    reject: 'Відхилити',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    dateRange: 'Діапазон дат',
    from: 'Від',
    to: 'До',
    clientName: 'Імʼя клієнта',
    minPrice: 'Ціна від',
    maxPrice: 'Ціна до',
    paidOnly: 'Тільки оплачені',
    unpaidOnly: 'Тільки неоплачені',
    allPayments: 'Усі оплати',
    reset: 'Скинути',
    apply: 'Застосувати',
    addBefore: '+ Додати час до 05:00',
    addAfter: '+ Додати час після 00:00',
    time: 'Час',
    clientProcedure: 'Клієнт / Процедура',
    repeatClient: 'Постійний клієнт',
    specialNote: 'Спец. нотатка',
    addCustomTime: 'Додати свій час',
    minute: 'Хвилини',
    newTime: 'Новий час',
    paymentMethod: 'Спосіб оплати',
    cash: 'Готівка',
    card: 'Картка',
    app: 'У додатку',
    clientCard: 'Картка клієнта',
    contactsLocked: 'Контакти приховано',
    contactsOpen: 'Контакти відкрито',
    depositPaid: 'Оплачено',
    depositWaiting: 'Очікує оплати',
  },
};

const clientRepeatCount: Record<string, number> = {
  'Lucie Hlavová': 4,
  'Janička Andělová': 2,
  'Klára Nováková': 1,
  'Lenka Bohatová': 5,
  'Barbora Bendová': 3,
  'Sophie Williams': 1,
  'Emily Carter': 4,
};

const paymentIcons: Record<string, string> = {
  cash: '💷',
  card: '💳',
  app: '📱',
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

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromInputDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return startOfDay(new Date());
  return date;
}

function getTimeLabel(date: Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getDateTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getMonthTitle(date: Date, language: AppLanguage) {
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

function getWeekDates(date: Date) {
  const base = startOfDay(date);
  const day = (base.getDay() + 6) % 7;
  const monday = addDays(base, -day);

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function isPaid(booking: BookingItem) {
  return Boolean(booking.clientPaid || booking.paymentReceivedByPlatform || booking.unlockFeePaid);
}

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function statusLabel(status: BookingItem['status'], text: PageText) {
  if (status === 'completed') return text.completed;
  if (status === 'pending') return text.waiting;
  if (status === 'cancelled') return text.unavailable;
  return text.confirmed;
}

function statusColor(status: BookingItem['status']) {
  if (status === 'completed') return BRAND.blue;
  if (status === 'pending') return BRAND.yellow;
  if (status === 'cancelled') return BRAND.red;
  return BRAND.green;
}

function statusBg(status: BookingItem['status']) {
  if (status === 'completed') return BRAND.softBlue;
  if (status === 'pending') return BRAND.softYellow;
  if (status === 'cancelled') return BRAND.softRed;
  return BRAND.softGreen;
}

function getPaymentMethod(booking: BookingItem) {
  const id = String(booking.id || '');

  if (id.includes('2') || id.includes('card')) return 'card';
  if (id.includes('5') || id.includes('app')) return 'app';
  return 'cash';
}

function statusMatches(booking: BookingItem, statusFilter: StatusFilter) {
  if (statusFilter === 'all') return true;
  return booking.status === statusFilter;
}

function makeBooking(
  id: string,
  date: Date,
  hour: number,
  minute: number,
  name: string,
  serviceName: string,
  price: number,
  status: BookingItem['status'],
  address: string,
  note: string
): BookingItem {
  const dateTime = new Date(date);
  dateTime.setHours(hour, minute, 0, 0);

  const confirmed = status === 'upcoming' || status === 'completed';
  const paid = status !== 'cancelled';

  return {
    id,
    masterId: id,
    masterName: name,
    masterAvatar: '',
    serviceName,
    price,
    status,
    dateTime: dateTime.toISOString(),
    dateLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    location: address,
    areaLabel: address.split(',')[0] || address,
    exactAddress: address,
    clientPaid: paid,
    paymentReceivedByPlatform: paid,
    unlockFeePaid: paid,
    bookingConfirmedByMaster: confirmed,
    promotionPaidByMaster: confirmed,
    contactPhone: '+44 7700 123456',
    contactEmail: 'client@olamep.com',
    contactWhatsapp: '+44 7700 123456',
    contactTelegram: '@client',
    contactInstagram: '@client',
    category: note,
  } as BookingItem;
}

function createDemoBookings(baseDate: Date): BookingItem[] {
  const today = startOfDay(baseDate);
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);

  return [
    makeBooking(
      'client-demo-1-cash',
      today,
      9,
      0,
      'Lucie Hlavová',
      'Стрижка волос',
      35,
      'upcoming',
      '21 Camden High Street, London',
      'чёлка короче'
    ),
    makeBooking(
      'client-demo-2-card',
      today,
      10,
      30,
      'Janička Andělová',
      'Маникюр',
      30,
      'completed',
      '18 Greek Street, Soho, London',
      'готово'
    ),
    makeBooking(
      'client-demo-3-cash',
      today,
      13,
      0,
      'Klára Nováková',
      'Массаж',
      60,
      'cancelled',
      'Chelsea, London',
      'частично / отменено'
    ),
    makeBooking(
      'client-demo-4-app',
      today,
      16,
      0,
      'Lenka Bohatová',
      'Окрашивание',
      85,
      'upcoming',
      '11 King’s Road, Chelsea, London',
      'холодный блонд'
    ),
    makeBooking(
      'client-demo-5-app',
      today,
      18,
      0,
      'Barbora Bendová',
      'Наращивание волос',
      120,
      'upcoming',
      '52 Wembley Park Drive, London',
      'новые пряди'
    ),
    makeBooking(
      'client-demo-6-card',
      tomorrow,
      11,
      0,
      'Sophie Williams',
      'Hair extensions',
      180,
      'pending',
      'Mayfair, London',
      'ждёт подтверждения'
    ),
    makeBooking(
      'client-demo-7-app',
      tomorrow,
      14,
      0,
      'Emily Carter',
      'Makeup',
      95,
      'upcoming',
      'Soho, London',
      'вечерний макияж'
    ),
    makeBooking(
      'client-demo-8-cash',
      dayAfterTomorrow,
      12,
      0,
      'Mia Brown',
      'Massage',
      75,
      'completed',
      'Camden, London',
      'постоянный клиент'
    ),
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

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');
  const [calendarStage, setCalendarStage] = useState<CalendarStage>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showFreeWindows, setShowFreeWindows] = useState(true);
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [nameFilter, setNameFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rangeFrom, setRangeFrom] = useState(() => toInputDate(startOfDay(new Date())));
  const [rangeTo, setRangeTo] = useState(() => toInputDate(startOfDay(new Date())));
  const [noteBooking, setNoteBooking] = useState<BookingItem | null>(null);
  const [clientCardBooking, setClientCardBooking] = useState<BookingItem | null>(null);
  const [timePicker, setTimePicker] = useState<{ hour: number; bookingId?: string } | null>(null);
  const [customMinute, setCustomMinute] = useState(25);
  const [extraTimes, setExtraTimes] = useState<string[]>([]);
  const [timeOverrides, setTimeOverrides] = useState<Record<string, string>>({});

  const text = useMemo(() => getText(language), [language]);

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => {
      const saved = getBookings();
      const real = saved.filter((booking) => !String(booking.id).startsWith('booking_'));
      setBookings(real.length > 0 ? real : createDemoBookings(new Date()));
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

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const activeDate = useMemo(() => {
    if (viewMode === 'today') return today;
    if (viewMode === 'tomorrow') return tomorrow;
    return selectedDate;
  }, [selectedDate, today, tomorrow, viewMode]);

  const getEffectiveDate = (booking: BookingItem) => {
    const override = timeOverrides[booking.id];
    if (override) return safeDate(override);
    return getBookingDate(booking);
  };

  const periodBookings = useMemo(() => {
    let source = [...bookings];

    if (viewMode === 'today') {
      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? isSameDay(date, today) : false;
      });
    }

    if (viewMode === 'tomorrow') {
      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? isSameDay(date, tomorrow) : false;
      });
    }

    if (viewMode === 'week') {
      const week = getWeekDates(selectedDate);
      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? week.some((item) => isSameDay(item, date)) : false;
      });
    }

    if (viewMode === 'calendar') {
      if (calendarStage === 'year' || calendarStage === 'months') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? date.getFullYear() === calendarDate.getFullYear() : false;
        });
      } else if (calendarMode === 'month') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return (
            date &&
            date.getFullYear() === calendarDate.getFullYear() &&
            date.getMonth() === calendarDate.getMonth()
          );
        });
      } else if (calendarMode === 'day' || calendarMode === 'list') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? isSameDay(date, selectedDate) : false;
        });
      }
    }

    if (viewMode === 'history') {
      const from = fromInputDate(rangeFrom);
      const to = fromInputDate(rangeTo);
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);

      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? date >= from && date <= toEnd : true;
      });
    }

    return source;
  }, [
    bookings,
    calendarDate,
    calendarMode,
    calendarStage,
    rangeFrom,
    rangeTo,
    selectedDate,
    timeOverrides,
    today,
    tomorrow,
    viewMode,
  ]);

  const filteredBookings = useMemo(() => {
    let source = [...periodBookings];

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (statusFilter !== 'all') {
      source = source.filter((booking) => booking.status === statusFilter);
    }

    if (nameFilter.trim()) {
      const query = nameFilter.trim().toLowerCase();
      source = source.filter((booking) => booking.masterName.toLowerCase().includes(query));
    }

    if (paymentFilter === 'paid') {
      source = source.filter((booking) => isPaid(booking));
    }

    if (paymentFilter === 'unpaid') {
      source = source.filter((booking) => !isPaid(booking));
    }

    if (minPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) >= Number(minPrice));
    }

    if (maxPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) <= Number(maxPrice));
    }

    return source.sort((a, b) => {
      const left = getEffectiveDate(a)?.getTime() || 0;
      const right = getEffectiveDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    maxPrice,
    minPrice,
    nameFilter,
    paymentFilter,
    periodBookings,
    showOnlyRequests,
    statusFilter,
    timeOverrides,
  ]);

  const statusCounts = useMemo(() => {
    return {
      all: periodBookings.length,
      completed: periodBookings.filter((booking) => booking.status === 'completed').length,
      upcoming: periodBookings.filter((booking) => booking.status === 'upcoming').length,
      pending: periodBookings.filter((booking) => booking.status === 'pending').length,
      cancelled: periodBookings.filter((booking) => booking.status === 'cancelled').length,
    };
  }, [periodBookings]);

  const periodRevenue = filteredBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + Number(booking.price || 0), 0);

  const monthBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const date = getEffectiveDate(booking);
      return (
        date &&
        date.getMonth() === calendarDate.getMonth() &&
        date.getFullYear() === calendarDate.getFullYear() &&
        statusMatches(booking, statusFilter)
      );
    });
  }, [bookings, calendarDate, statusFilter, timeOverrides]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => current - 3 + index);
  }, []);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const handleTopMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStatusFilter('all');
    setShowOnlyRequests(false);

    if (mode === 'today') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarMode('day');
      setCalendarStage('month');
      setRangeFrom(toInputDate(now));
      setRangeTo(toInputDate(now));
    }

    if (mode === 'tomorrow') {
      const next = addDays(startOfDay(new Date()), 1);
      setSelectedDate(next);
      setCalendarDate(next);
      setCalendarMode('day');
      setCalendarStage('month');
      setRangeFrom(toInputDate(next));
      setRangeTo(toInputDate(next));
    }

    if (mode === 'week') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarMode('week');
      setCalendarStage('month');
    }

    if (mode === 'calendar') {
      setCalendarMode('month');
      setCalendarStage('year');
      setManagementOpen(false);
    }

    if (mode === 'history') {
      setCalendarMode('list');
      setCalendarStage('month');
      setManagementOpen(true);
    }
  };

  const moveDay = (direction: number) => {
    if (viewMode === 'week') {
      const next = addDays(selectedDate, direction * 7);
      setSelectedDate(next);
      setCalendarDate(next);
      return;
    }

    if (viewMode === 'calendar' && calendarStage === 'year') {
      const next = new Date(calendarDate);
      next.setFullYear(next.getFullYear() + direction);
      setCalendarDate(next);
      return;
    }

    if (viewMode === 'calendar' && calendarStage === 'months') {
      const next = new Date(calendarDate);
      next.setFullYear(next.getFullYear() + direction);
      setCalendarDate(next);
      return;
    }

    if (viewMode === 'calendar' && calendarStage === 'month' && calendarMode === 'month') {
      const next = new Date(calendarDate);
      next.setMonth(next.getMonth() + direction);
      setCalendarDate(next);
      return;
    }

    const next = addDays(activeDate, direction);
    setSelectedDate(next);
    setCalendarDate(next);

    if (viewMode === 'today' || viewMode === 'tomorrow') {
      setViewMode('calendar');
      setCalendarMode('day');
      setCalendarStage('month');
    }
  };

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: 'completed' } : item))
    );
  };

  const approveBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'upcoming');
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: 'upcoming' } : item))
    );
  };

  const rejectBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'cancelled');
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: 'cancelled' } : item))
    );
  };

  const resetFilters = () => {
    setNameFilter('');
    setPaymentFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setStatusFilter('all');
    setShowOnlyRequests(false);
    setRangeFrom(toInputDate(activeDate));
    setRangeTo(toInputDate(activeDate));
  };

  const saveCustomMinute = () => {
    if (!timePicker) return;

    const hour = timePicker.hour;
    const minute = customMinute;

    if (timePicker.bookingId) {
      const booking = bookings.find((item) => item.id === timePicker.bookingId);
      const current = booking ? getEffectiveDate(booking) : null;

      if (current) {
        const next = new Date(current);
        next.setMinutes(minute, 0, 0);
        setTimeOverrides((prev) => ({ ...prev, [timePicker.bookingId!]: next.toISOString() }));
      }
    } else {
      const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      setExtraTimes((prev) => (prev.includes(label) ? prev : [...prev, label]));
    }

    setTimePicker(null);
  };

  const activeTitle =
    viewMode === 'week'
      ? `${getDateTitle(weekDates[0], language)} — ${getDateTitle(weekDates[6], language)}`
      : viewMode === 'calendar' && calendarStage === 'year'
      ? text.chooseYear
      : viewMode === 'calendar' && calendarStage === 'months'
      ? `${text.chooseMonth} · ${calendarDate.getFullYear()}`
      : viewMode === 'calendar' && calendarStage === 'month' && calendarMode === 'month'
      ? getMonthTitle(calendarDate, language)
      : getDateTitle(activeDate, language);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: BRAND.navy,
        paddingBottom: 170,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 176px' }}>
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
          <h1 style={pageTitleStyle}>{text.title}</h1>
          <p style={pageSubtitleStyle}>{text.subtitle}</p>
        </section>

        <section style={topTabsWrapStyle}>
          {([
            ['today', text.today],
            ['tomorrow', text.tomorrow],
            ['week', text.week],
            ['calendar', text.calendar],
            ['history', text.history],
          ] as const).map(([mode, label]) => {
            const active = viewMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleTopMode(mode)}
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

        <StatusFilterBar
          text={text}
          activeFilter={statusFilter}
          counts={statusCounts}
          onSelect={setStatusFilter}
          onClear={() => {
            setStatusFilter('all');
            setShowOnlyRequests(false);
          }}
        />

        <section style={calendarPanelStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button type="button" onClick={() => moveDay(-1)} style={smallCircleStyle}>
              ‹
            </button>

            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 900,
                  color: BRAND.navy,
                  lineHeight: 1.05,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textTransform: 'capitalize',
                }}
              >
                {activeTitle}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.muted,
                  textTransform: 'capitalize',
                }}
              >
                {filteredBookings.length} {text.bookings} · {money(periodRevenue)} ·{' '}
                {getMonthTitle(calendarDate, language)}
              </div>
            </div>

            <button type="button" onClick={() => moveDay(1)} style={smallCircleStyle}>
              ›
            </button>
          </div>

          <div style={quickControlsRowStyle}>
            <button
              type="button"
              onClick={() => setManagementOpen((prev) => !prev)}
              style={{
                ...quickChipStyle,
                background: managementOpen ? BRAND.navy : '#ffffff',
                color: managementOpen ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {text.management}
            </button>

            <button type="button" onClick={() => handleTopMode('today')} style={quickChipStyle}>
              🗓️ {text.today}
            </button>

            <button
              type="button"
              onClick={() => setShowFreeWindows((prev) => !prev)}
              style={{
                ...quickChipStyle,
                background: showFreeWindows ? BRAND.navy : '#ffffff',
                color: showFreeWindows ? '#ffffff' : BRAND.navy,
              }}
            >
              ◷ {text.freeWindows}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOnlyRequests((prev) => !prev);
                setStatusFilter('all');
              }}
              style={{
                ...quickChipStyle,
                background: showOnlyRequests ? BRAND.navy : '#ffffff',
                color: showOnlyRequests ? '#ffffff' : BRAND.navy,
              }}
            >
              ⚠ {text.onlyRequests}
            </button>
          </div>

          {viewMode === 'week' || calendarMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={bookings}
              timeOverrides={timeOverrides}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('week');
                setCalendarMode('week');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'year' ? (
            <YearPicker
              years={years}
              calendarDate={calendarDate}
              bookings={bookings}
              statusFilter={statusFilter}
              timeOverrides={timeOverrides}
              onSelect={(year) => {
                const next = new Date(calendarDate);
                next.setFullYear(year);
                setCalendarDate(next);
                setCalendarStage('months');
                setCalendarMode('month');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'months' ? (
            <MonthPicker
              language={language}
              year={calendarDate.getFullYear()}
              bookings={bookings}
              statusFilter={statusFilter}
              timeOverrides={timeOverrides}
              onSelect={(month) => {
                const next = new Date(calendarDate);
                next.setMonth(month);
                setCalendarDate(next);
                setCalendarStage('month');
                setCalendarMode('month');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'month' && calendarMode === 'month' ? (
            <MonthGrid
              language={language}
              calendarDate={calendarDate}
              selectedDate={selectedDate}
              bookings={monthBookings}
              timeOverrides={timeOverrides}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('calendar');
                setCalendarMode('day');
                setCalendarStage('month');
              }}
            />
          ) : null}

          {managementOpen ? (
            <div style={managementBoxStyle}>
              <div style={managementGridStyle}>
                <label style={fieldLabelStyle}>
                  <span>{text.year}</span>
                  <select
                    value={calendarDate.getFullYear()}
                    onChange={(event) => {
                      const next = new Date(calendarDate);
                      next.setFullYear(Number(event.target.value));
                      setCalendarDate(next);
                    }}
                    style={inputStyle}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.month}</span>
                  <select
                    value={calendarDate.getMonth()}
                    onChange={(event) => {
                      const next = new Date(calendarDate);
                      next.setMonth(Number(event.target.value));
                      setCalendarDate(next);
                    }}
                    style={inputStyle}
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index} value={index}>
                        {getShortMonthName(index, language)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={calendarModeRowStyle}>
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
                        setCalendarStage('month');
                        setViewMode(mode === 'week' ? 'week' : 'calendar');
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

              <div style={{ marginTop: 10, ...managementGridStyle }}>
                <label style={fieldLabelStyle}>
                  <span>{text.from}</span>
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={(event) => setRangeFrom(event.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.to}</span>
                  <input
                    type="date"
                    value={rangeTo}
                    onChange={(event) => setRangeTo(event.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.clientName}</span>
                  <input
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.target.value)}
                    placeholder="Smith"
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.allPayments}</span>
                  <select
                    value={paymentFilter}
                    onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)}
                    style={inputStyle}
                  >
                    <option value="all">{text.allPayments}</option>
                    <option value="paid">{text.paidOnly}</option>
                    <option value="unpaid">{text.unpaidOnly}</option>
                  </select>
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.minPrice}</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.maxPrice}</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={resetFilters} style={plainButtonStyle}>
                  {text.reset}
                </button>
                <button type="button" onClick={() => setManagementOpen(false)} style={darkButtonStyle}>
                  {text.apply}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={() => {
              setCustomMinute(25);
              setTimePicker({ hour: 4 });
            }}
            style={addTimeButtonStyle}
          >
            {text.addBefore}
          </button>

          <div style={notebookHeaderStyle}>
            <span>{text.time}</span>
            <span>{text.clientProcedure}</span>
            <span>{text.price}</span>
            <span>{text.notes}</span>
          </div>

          <NotebookSchedule
            text={text}
            bookings={filteredBookings}
            activeDate={activeDate}
            showFreeWindows={showFreeWindows}
            extraTimes={extraTimes}
            getEffectiveDate={getEffectiveDate}
            onAddMinute={(hour) => {
              setCustomMinute(25);
              setTimePicker({ hour });
            }}
            onChangeBookingMinute={(booking, hour, minute) => {
              setCustomMinute(minute);
              setTimePicker({ hour, bookingId: booking.id });
            }}
            onDone={markDone}
            onApprove={approveBooking}
            onReject={rejectBooking}
            onChat={(booking) => router.push(`/messages?booking=${encodeURIComponent(booking.id)}`)}
            onDetails={(booking) => setClientCardBooking(booking)}
            onNote={setNoteBooking}
          />

          <button
            type="button"
            onClick={() => {
              setCustomMinute(25);
              setTimePicker({ hour: 24 });
            }}
            style={{ ...addTimeButtonStyle, marginTop: 12 }}
          >
            {text.addAfter}
          </button>
        </section>
      </div>

      <BottomNav active="clients" />

      {noteBooking ? (
        <NoteModal booking={noteBooking} text={text} onClose={() => setNoteBooking(null)} />
      ) : null}

      {clientCardBooking ? (
        <ClientCardModal
          booking={clientCardBooking}
          text={text}
          onClose={() => setClientCardBooking(null)}
          onChat={() => router.push(`/messages?booking=${encodeURIComponent(clientCardBooking.id)}`)}
        />
      ) : null}

      {timePicker ? (
        <TimePickerModal
          text={text}
          hour={timePicker.hour}
          minute={customMinute}
          onMinute={setCustomMinute}
          onClose={() => setTimePicker(null)}
          onApply={saveCustomMinute}
        />
      ) : null}
    </main>
  );
}

function YearPicker({
  years,
  calendarDate,
  bookings,
  statusFilter,
  timeOverrides,
  onSelect,
}: {
  years: number[];
  calendarDate: Date;
  bookings: BookingItem[];
  statusFilter: StatusFilter;
  timeOverrides: Record<string, string>;
  onSelect: (year: number) => void;
}) {
  return (
    <div style={yearGridStyle}>
      {years.map((year) => {
        const yearBookings = bookings.filter((booking) => {
          const override = timeOverrides[booking.id];
          const date = override ? safeDate(override) : getBookingDate(booking);

          return date && date.getFullYear() === year && statusMatches(booking, statusFilter);
        });

        const selected = calendarDate.getFullYear() === year;

        return (
          <button
            key={year}
            type="button"
            onClick={() => onSelect(year)}
            style={{
              minHeight: 82,
              borderRadius: 22,
              border: `2.5px solid ${BRAND.border}`,
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: 6,
              fontWeight: 900,
            }}
          >
            <span style={{ fontSize: 26 }}>{year}</span>
            <span
              style={{
                minWidth: 30,
                minHeight: 24,
                borderRadius: 999,
                background: selected ? '#ffffff' : BRAND.softBlue,
                color: selected ? BRAND.navy : BRAND.blue,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 900,
                padding: '0 8px',
              }}
            >
              {yearBookings.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MonthPicker({
  language,
  year,
  bookings,
  statusFilter,
  timeOverrides,
  onSelect,
}: {
  language: AppLanguage;
  year: number;
  bookings: BookingItem[];
  statusFilter: StatusFilter;
  timeOverrides: Record<string, string>;
  onSelect: (month: number) => void;
}) {
  return (
    <div style={monthCardsGridStyle}>
      {Array.from({ length: 12 }, (_, month) => {
        const monthBookings = bookings.filter((booking) => {
          const override = timeOverrides[booking.id];
          const date = override ? safeDate(override) : getBookingDate(booking);

          return (
            date &&
            date.getFullYear() === year &&
            date.getMonth() === month &&
            statusMatches(booking, statusFilter)
          );
        });

        return (
          <button
            key={month}
            type="button"
            onClick={() => onSelect(month)}
            style={{
              minHeight: 90,
              borderRadius: 23,
              border: `2.5px solid ${BRAND.border}`,
              background: monthBookings.length > 0 ? BRAND.softGreen : '#ffffff',
              color: BRAND.navy,
              cursor: 'pointer',
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              gap: 7,
              fontWeight: 900,
              padding: 8,
            }}
          >
            <span
              style={{
                fontSize: 15,
                lineHeight: 1.1,
                textTransform: 'capitalize',
                textAlign: 'center',
              }}
            >
              {getShortMonthName(month, language)}
            </span>

            <span
              style={{
                minWidth: 34,
                minHeight: 28,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: monthBookings.length > 0 ? BRAND.green : '#ffffff',
                color: monthBookings.length > 0 ? '#ffffff' : BRAND.muted,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 900,
                padding: '0 8px',
              }}
            >
              {monthBookings.length}
            </span>

            <span style={{ display: 'flex', gap: 3 }}>
              {monthBookings.slice(0, 4).map((booking) => (
                <span
                  key={booking.id}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: statusColor(booking.status),
                  }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StatusFilterBar({
  text,
  activeFilter,
  counts,
  onSelect,
  onClear,
}: {
  text: PageText;
  activeFilter: StatusFilter;
  counts: Record<StatusFilter, number>;
  onSelect: (value: StatusFilter) => void;
  onClear: () => void;
}) {
  const items: Array<{
    key: StatusFilter;
    label: string;
    color: string;
  }> = [
    { key: 'all', label: text.all, color: BRAND.navy },
    { key: 'completed', label: text.completed, color: BRAND.blue },
    { key: 'upcoming', label: text.confirmed, color: BRAND.green },
    { key: 'cancelled', label: text.unavailable, color: BRAND.red },
    { key: 'pending', label: text.waiting, color: BRAND.yellow },
  ];

  return (
    <section style={statusPanelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
        {activeFilter !== 'all' ? (
          <button type="button" onClick={onClear} style={clearStatusButtonStyle}>
            ×
          </button>
        ) : null}

        {items.map((item) => {
          const active = activeFilter === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              style={{
                flexShrink: 0,
                minWidth: 108,
                minHeight: 54,
                borderRadius: 18,
                border: `2.3px solid ${BRAND.border}`,
                background: active ? BRAND.navy : '#ffffff',
                color: active ? '#ffffff' : BRAND.navy,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: 7,
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: item.color,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
              >
                {item.label}
              </span>
              <span style={{ fontSize: 20, fontWeight: 900 }}>{counts[item.key]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NotebookSchedule({
  text,
  bookings,
  activeDate,
  showFreeWindows,
  extraTimes,
  getEffectiveDate,
  onAddMinute,
  onChangeBookingMinute,
  onDone,
  onApprove,
  onReject,
  onChat,
  onDetails,
  onNote,
}: {
  text: PageText;
  bookings: BookingItem[];
  activeDate: Date;
  showFreeWindows: boolean;
  extraTimes: string[];
  getEffectiveDate: (booking: BookingItem) => Date | null;
  onAddMinute: (hour: number) => void;
  onChangeBookingMinute: (booking: BookingItem, hour: number, minute: number) => void;
  onDone: (booking: BookingItem) => void;
  onApprove: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
  onDetails: (booking: BookingItem) => void;
  onNote: (booking: BookingItem) => void;
}) {
  const baseHours = Array.from(
    { length: 20 },
    (_, index) => `${String(index + 5).padStart(2, '0')}:00`
  );
  const times = [...new Set([...baseHours, ...extraTimes])].sort();

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {times.map((time) => {
        const [hourText] = time.split(':');
        const hour = Number(hourText);

        const timeBookings = bookings.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? isSameDay(date, activeDate) && getTimeLabel(date) === time : false;
        });

        const hourBookings =
          timeBookings.length > 0
            ? timeBookings
            : bookings.filter((booking) => {
                const date = getEffectiveDate(booking);
                return date
                  ? isSameDay(date, activeDate) && date.getHours() === hour && time.endsWith(':00')
                  : false;
              });

        if (hourBookings.length === 0 && !showFreeWindows) return null;

        if (hourBookings.length === 0) {
          return (
            <FreeSlotRow
              key={time}
              time={time}
              text={text}
              onAddMinute={() => onAddMinute(hour)}
            />
          );
        }

        return hourBookings.map((booking) => {
          const date = getEffectiveDate(booking);
          const minute = date?.getMinutes() || 0;

          return (
            <NotebookBookingRow
              key={`${booking.id}-${getTimeLabel(date)}`}
              booking={booking}
              date={date}
              text={text}
              onMinute={() => onChangeBookingMinute(booking, date?.getHours() || hour, minute)}
              onDone={() => onDone(booking)}
              onApprove={() => onApprove(booking)}
              onReject={() => onReject(booking)}
              onChat={() => onChat(booking)}
              onDetails={() => onDetails(booking)}
              onNote={() => onNote(booking)}
            />
          );
        });
      })}
    </div>
  );
}

function NotebookBookingRow({
  booking,
  date,
  text,
  onMinute,
  onDone,
  onApprove,
  onReject,
  onChat,
  onDetails,
  onNote,
}: {
  booking: BookingItem;
  date: Date | null;
  text: PageText;
  onMinute: () => void;
  onDone: () => void;
  onApprove: () => void;
  onReject: () => void;
  onChat: () => void;
  onDetails: () => void;
  onNote: () => void;
}) {
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const color = statusColor(booking.status);
  const bg = statusBg(booking.status);
  const repeat = clientRepeatCount[booking.masterName] || 1;
  const paymentMethod = getPaymentMethod(booking);
  const location = isUnlocked(booking)
    ? getVisibleBookingLocation(booking)
    : getPublicBookingLocation(booking);

  return (
    <article
      draggable
      title="Long press / drag to move time"
      onClick={onDetails}
      style={{
        position: 'relative',
        minHeight: cancelled ? 82 : 116,
        borderRadius: 22,
        border: `2px solid ${cancelled ? '#f3a9bb' : '#d8e3dd'}`,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 47%, #ffe3ea 48%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '104px minmax(0, 1fr) 64px 34px',
        gap: 7,
        alignItems: 'center',
        padding: '10px 9px 10px 0',
        overflow: 'hidden',
        boxShadow: '0 7px 18px rgba(7,27,70,0.05)',
        cursor: 'pointer',
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

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          display: 'grid',
          gridTemplateColumns: '38px 1fr',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 14,
        }}
      >
        <button type="button" onClick={onMinute} style={timePlusButtonStyle}>
          {done ? '✓' : '+'}
        </button>

        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: done ? BRAND.blue : cancelled ? BRAND.red : BRAND.navy,
            whiteSpace: 'nowrap',
          }}
        >
          {getTimeLabel(date)}
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 19,
            lineHeight: 1.05,
            fontWeight: 900,
            color: cancelled ? BRAND.red : BRAND.navy,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {cancelled ? text.unavailable : booking.masterName}
          {repeat >= 3 ? (
            <span title={text.repeatClient} style={{ marginLeft: 5, color: BRAND.orange }}>
              ★
            </span>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 13,
            lineHeight: 1.15,
            fontWeight: 800,
            color: BRAND.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {cancelled ? text.available : booking.serviceName || 'Service'}
        </div>

        {!cancelled ? (
          <>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <MiniPill label={statusLabel(booking.status, text)} color={color} bg="#ffffff" />
              <MiniPill
                label={isPaid(booking) ? text.depositPaid : text.depositWaiting}
                color={isPaid(booking) ? '#008f3a' : '#b87500'}
                bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 900,
                color: BRAND.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              📍 {location || 'London'}
            </div>

            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                marginTop: 7,
                display: 'flex',
                gap: 7,
                alignItems: 'center',
              }}
            >
              <button type="button" onClick={onChat} style={smallActionButtonStyle}>
                💬 {text.openChat}
              </button>

              {pending ? (
                <>
                  <button type="button" onClick={onApprove} style={smallGreenButtonStyle}>
                    ✓ {text.approve}
                  </button>
                  <button type="button" onClick={onReject} style={smallRedButtonStyle}>
                    ×
                  </button>
                </>
              ) : done ? (
                <button type="button" onClick={onDetails} style={smallActionButtonStyle}>
                  {text.details}
                </button>
              ) : (
                <button type="button" onClick={onDone} style={smallGreenButtonStyle}>
                  ✓ {text.markDone}
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div style={{ textAlign: 'right' }}>
        {!cancelled ? (
          <div style={{ fontSize: 17, lineHeight: 1, marginBottom: 4 }}>
            {paymentIcons[paymentMethod]}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: cancelled ? BRAND.red : color === BRAND.yellow ? BRAND.orange : color,
          }}
        >
          {money(Number(booking.price || 0))}
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNote();
        }}
        aria-label={text.notes}
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          border: 'none',
          background: 'transparent',
          color: BRAND.muted,
          fontSize: 25,
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        ☰
      </button>
    </article>
  );
}

function FreeSlotRow({
  time,
  text,
  onAddMinute,
}: {
  time: string;
  text: PageText;
  onAddMinute: () => void;
}) {
  return (
    <article
      style={{
        minHeight: 68,
        borderRadius: 22,
        border: '2px dashed #d7dce4',
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '104px minmax(0, 1fr)',
        alignItems: 'center',
        padding: '0 18px 0 14px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr', alignItems: 'center', gap: 4 }}>
        <button type="button" onClick={onAddMinute} style={timePlusButtonStyle}>
          +
        </button>

        <div
          style={{
            fontSize: 25,
            fontWeight: 900,
            color: '#a1a8b4',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: BRAND.muted,
          textAlign: 'left',
        }}
      >
        {text.available}
      </div>
    </article>
  );
}

function MonthGrid({
  language,
  calendarDate,
  selectedDate,
  bookings,
  timeOverrides,
  onSelect,
}: {
  language: AppLanguage;
  calendarDate: Date;
  selectedDate: Date;
  bookings: BookingItem[];
  timeOverrides: Record<string, string>;
  onSelect: (date: Date) => void;
}) {
  const weekDays = getWeekDays(language);
  const cells = getCalendarCells(calendarDate.getFullYear(), calendarDate.getMonth());

  return (
    <div style={monthGridWrapStyle}>
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
            const override = timeOverrides[booking.id];
            const bookingDate = override ? safeDate(override) : getBookingDate(booking);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          const selected = isSameDay(date, selectedDate);

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
                background: selected ? BRAND.navy : currentMonth ? '#ffffff' : '#f5f5f5',
                color: selected ? '#ffffff' : currentMonth ? BRAND.navy : '#a8a8a8',
                cursor: 'pointer',
                padding: 4,
                display: 'grid',
                alignContent: 'space-between',
                justifyItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 900 }}>{date.getDate()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {dayBookings.slice(0, 4).map((booking) => (
                  <span
                    key={booking.id}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: statusColor(booking.status),
                    }}
                  />
                ))}
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
  timeOverrides,
  onSelect,
}: {
  language: AppLanguage;
  selectedDate: Date;
  bookings: BookingItem[];
  timeOverrides: Record<string, string>;
  onSelect: (date: Date) => void;
}) {
  const days = getWeekDates(selectedDate);

  return (
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map((date) => {
        const selected = isSameDay(date, selectedDate);
        const count = bookings.filter((booking) => {
          const override = timeOverrides[booking.id];
          const bookingDate = override ? safeDate(override) : getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        }).length;

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelect(date)}
            style={{
              minHeight: 78,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            <div style={{ fontSize: 10, textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(date)}
            </div>
            <div style={{ marginTop: 4, fontSize: 23 }}>{date.getDate()}</div>
            <div style={{ marginTop: 4, fontSize: 11 }}>{count}</div>
          </button>
        );
      })}
    </div>
  );
}

function NoteModal({
  booking,
  text,
  onClose,
}: {
  booking: BookingItem;
  text: PageText;
  onClose: () => void;
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={modalTitleStyle}>{text.specialNote}</h2>

        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: BRAND.navy }}>
          {booking.masterName}
        </div>

        <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: BRAND.muted }}>
          {booking.serviceName}
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softYellow,
            padding: 13,
            fontSize: 15,
            lineHeight: 1.4,
            fontWeight: 800,
            color: BRAND.navy,
          }}
        >
          {booking.category || text.notes}
        </div>

        <button type="button" onClick={onClose} style={{ ...darkButtonStyle, marginTop: 14 }}>
          {text.close}
        </button>
      </div>
    </div>
  );
}

function ClientCardModal({
  booking,
  text,
  onClose,
  onChat,
}: {
  booking: BookingItem;
  text: PageText;
  onClose: () => void;
  onChat: () => void;
}) {
  const unlocked = isUnlocked(booking);
  const location = unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);
  const paymentMethod = getPaymentMethod(booking);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={modalTitleStyle}>{text.clientCard}</h2>

        <div
          style={{
            marginTop: 12,
            borderRadius: 22,
            border: `2.5px solid ${BRAND.border}`,
            background: statusBg(booking.status),
            padding: 14,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
            {booking.masterName}
          </div>

          <div style={{ marginTop: 5, fontSize: 15, fontWeight: 800, color: BRAND.muted }}>
            {booking.serviceName}
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
            <MiniPill
              label={statusLabel(booking.status, text)}
              color={statusColor(booking.status)}
              bg="#ffffff"
            />
            <div style={{ fontSize: 28, fontWeight: 900, color: statusColor(booking.status) }}>
              {money(Number(booking.price || 0))}
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 15, fontWeight: 900, color: BRAND.navy }}>
            {paymentIcons[paymentMethod]} {text.paymentMethod}
          </div>

          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 900, color: BRAND.muted }}>
            📍 {location || 'London'}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 12,
              color: BRAND.navy,
              fontWeight: 800,
              filter: unlocked ? 'none' : 'blur(3px)',
              userSelect: unlocked ? 'auto' : 'none',
            }}
          >
            +44 7700 123456 · client@olamep.com
          </div>

          {!unlocked ? (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 900, color: BRAND.red }}>
              🔒 {text.contactsLocked}
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 900, color: '#008f3a' }}>
              ✅ {text.contactsOpen}
            </div>
          )}
        </div>

        <button type="button" onClick={onChat} style={{ ...darkButtonStyle, marginTop: 14 }}>
          💬 {text.openChat}
        </button>
      </div>
    </div>
  );
}

function TimePickerModal({
  text,
  hour,
  minute,
  onMinute,
  onClose,
  onApply,
}: {
  text: PageText;
  hour: number;
  minute: number;
  onMinute: (value: number) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={modalTitleStyle}>{text.addCustomTime}</h2>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div
            style={{
              minHeight: 78,
              borderRadius: 20,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.softGreen,
              color: '#008f3a',
              display: 'grid',
              placeItems: 'center',
              fontSize: 33,
              fontWeight: 900,
            }}
          >
            {String(hour).padStart(2, '0')}
          </div>

          <label style={fieldLabelStyle}>
            <span>{text.minute}</span>
            <select
              value={minute}
              onChange={(event) => onMinute(Number(event.target.value))}
              style={inputStyle}
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((item) => (
                <option key={item} value={item}>
                  {String(item).padStart(2, '0')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softGreen,
            color: '#008f3a',
            minHeight: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          {text.newTime}: {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </div>

        <button type="button" onClick={onApply} style={{ ...darkButtonStyle, marginTop: 14 }}>
          {text.apply}
        </button>
      </div>
    </div>
  );
}

function MiniPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 24,
        padding: '0 7px',
        borderRadius: 999,
        border: `1.8px solid ${color}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 900,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
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

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 38,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: '-1.4px',
  color: BRAND.navy,
};

const pageSubtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.35,
  fontWeight: 800,
  color: BRAND.muted,
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

const statusPanelStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 25,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 9,
  overflow: 'hidden',
};

const clearStatusButtonStyle: CSSProperties = {
  flexShrink: 0,
  width: 44,
  height: 44,
  borderRadius: 999,
  border: `2.3px solid ${BRAND.border}`,
  background: BRAND.red,
  color: '#ffffff',
  fontSize: 23,
  fontWeight: 900,
  cursor: 'pointer',
};

const calendarPanelStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 13,
  overflow: 'hidden',
};

const smallCircleStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 25,
  fontWeight: 900,
  cursor: 'pointer',
};

const quickControlsRowStyle: CSSProperties = {
  marginTop: 13,
  display: 'flex',
  gap: 9,
  overflowX: 'auto',
  paddingBottom: 7,
};

const quickChipStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 45,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  padding: '0 15px',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const managementBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 22,
  border: `2.5px solid ${BRAND.border}`,
  background: BRAND.cream,
  padding: 12,
};

const managementGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 9,
};

const calendarModeRowStyle: CSSProperties = {
  marginTop: 11,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 7,
};

const modeButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const fieldLabelStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
  fontSize: 11,
  fontWeight: 900,
  color: BRAND.muted,
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
  boxSizing: 'border-box',
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  padding: '0 10px',
};

const plainButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const darkButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const addTimeButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 54,
  borderRadius: 22,
  border: '2px dashed #d7dce4',
  background: '#ffffff',
  color: BRAND.muted,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const notebookHeaderStyle: CSSProperties = {
  marginTop: 12,
  display: 'grid',
  gridTemplateColumns: '104px 1fr 64px 34px',
  gap: 7,
  padding: '0 14px 8px',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
};

const timePlusButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 23,
  lineHeight: 1,
  fontWeight: 900,
  cursor: 'pointer',
};

const smallActionButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 14,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  padding: '0 10px',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const smallGreenButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 14,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  padding: '0 10px',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const smallRedButtonStyle: CSSProperties = {
  minHeight: 36,
  minWidth: 36,
  borderRadius: 14,
  border: `2px solid ${BRAND.red}`,
  background: BRAND.red,
  color: '#ffffff',
  padding: '0 10px',
  fontSize: 16,
  fontWeight: 900,
  cursor: 'pointer',
};

const yearGridStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 9,
};

const monthCardsGridStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 9,
};

const monthGridWrapStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 20,
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
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 900,
  color: BRAND.muted,
  textTransform: 'capitalize',
};

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.28)',
  zIndex: 300,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
};

const modalCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 430,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  borderBottom: 'none',
  background: '#ffffff',
  padding: '18px 16px calc(22px + env(safe-area-inset-bottom))',
  boxSizing: 'border-box',
};

const modalCloseStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 24,
  fontWeight: 900,
  cursor: 'pointer',
  marginBottom: 12,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 25,
  fontWeight: 900,
  color: BRAND.navy,
};
