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
type QuickFilter = 'all' | 'active' | 'requests' | 'marked' | 'done';
type PaymentFilter = 'all' | 'paid' | 'unpaid';
type HistoryFilter = 'all' | 'done' | 'waiting' | 'confirmed' | 'cancelledByMe' | 'cancelledByClient';

type PageText = {
  title: string;
  subtitle: string;
  today: string;
  tomorrow: string;
  week: string;
  calendar: string;
  history: string;
  month: string;
  day: string;
  list: string;
  management: string;
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
  confirm: string;
  decline: string;
  price: string;
  notes: string;
  back: string;
  close: string;
  active: string;
  requests: string;
  total: string;
  marked: string;
  done: string;
  year: string;
  dateRange: string;
  from: string;
  to: string;
  surname: string;
  minPrice: string;
  maxPrice: string;
  paidOnly: string;
  unpaidOnly: string;
  allPayments: string;
  status: string;
  allStatuses: string;
  cancelledByMe: string;
  cancelledByClient: string;
  reset: string;
  apply: string;
  addBefore: string;
  addAfter: string;
  time: string;
  clientProcedure: string;
  repeatClient: string;
  specialNote: string;
  addCustomTime: string;
  changeMinutes: string;
  hourFixed: string;
  minute: string;
  newTime: string;
  clientCard: string;
  contactLocked: string;
  contactOpen: string;
  chatAllowed: string;
  paymentMethod: string;
  cash: string;
  card: string;
  bank: string;
  applePay: string;
  manualClient: string;
  blockTime: string;
  addBooking: string;
  clearFilter: string;
  quickFilters: string;
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
  softOrange: '#fff0da',
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
    month: 'Month',
    day: 'Day',
    list: 'List',
    management: 'Management',
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
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    confirm: 'Confirm',
    decline: 'Decline',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
    active: 'Active',
    requests: 'Requests',
    total: 'Total',
    marked: 'Marked',
    done: 'Done',
    year: 'Year',
    dateRange: 'Date range',
    from: 'From',
    to: 'To',
    surname: 'Client name',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    paidOnly: 'Paid only',
    unpaidOnly: 'Unpaid only',
    allPayments: 'All payments',
    status: 'Status',
    allStatuses: 'All statuses',
    cancelledByMe: 'Declined by me',
    cancelledByClient: 'Cancelled by client',
    reset: 'Reset',
    apply: 'Apply',
    addBefore: '+ Add time before 05:00',
    addAfter: '+ Add time after 00:00',
    time: 'Time',
    clientProcedure: 'Client / Procedure',
    repeatClient: 'Regular client',
    specialNote: 'Special note',
    addCustomTime: 'Add custom time',
    changeMinutes: 'Change minutes',
    hourFixed: 'Hour fixed',
    minute: 'Minute',
    newTime: 'New time',
    clientCard: 'Client card',
    contactLocked: 'Contacts and address are locked until confirmation',
    contactOpen: 'Contacts and address are open',
    chatAllowed: 'Chat is available before confirmation. Contacts, addresses and location stay hidden.',
    paymentMethod: 'Payment method',
    cash: 'Cash',
    card: 'Card',
    bank: 'Bank',
    applePay: 'Apple Pay',
    manualClient: 'Add client',
    blockTime: 'Close time',
    addBooking: 'Add booking',
    clearFilter: 'Clear filter',
    quickFilters: 'Quick filters',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Ежедневник, брони, запросы и календарь',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    week: 'Неделя',
    calendar: 'Календарь',
    history: 'История',
    month: 'Месяц',
    day: 'День',
    list: 'Список',
    management: 'Управление',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    synced: 'Синхронизировано',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    selectedDay: 'Выбранный день',
    bookings: 'записей',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Готово',
    confirm: 'Подтвердить',
    decline: 'Отклонить',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    requests: 'Запросы',
    total: 'Всего',
    marked: 'Отмеченные',
    done: 'Готово',
    year: 'Год',
    dateRange: 'Диапазон дат',
    from: 'От',
    to: 'До',
    surname: 'Имя клиента',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    paidOnly: 'Только оплаченные',
    unpaidOnly: 'Только неоплаченные',
    allPayments: 'Все оплаты',
    status: 'Статус',
    allStatuses: 'Все статусы',
    cancelledByMe: 'Отклонено мной',
    cancelledByClient: 'Отменено клиентом',
    reset: 'Сбросить',
    apply: 'Применить',
    addBefore: '+ Добавить время до 05:00',
    addAfter: '+ Добавить время после 00:00',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    repeatClient: 'Постоянный клиент',
    specialNote: 'Спец. заметка',
    addCustomTime: 'Добавить своё время',
    changeMinutes: 'Изменить минуты',
    hourFixed: 'Час фиксирован',
    minute: 'Минуты',
    newTime: 'Новое время',
    clientCard: 'Карточка клиента',
    contactLocked: 'Контакты и адрес закрыты до подтверждения',
    contactOpen: 'Контакты и адрес открыты',
    chatAllowed:
      'Чат доступен до подтверждения. Контакты, адреса и геолокация остаются скрытыми.',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Карта',
    bank: 'Банк',
    applePay: 'Apple Pay',
    manualClient: 'Добавить клиента',
    blockTime: 'Закрыть время',
    addBooking: 'Добавить бронь',
    clearFilter: 'Сбросить фильтр',
    quickFilters: 'Быстрые фильтры',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Щоденник, бронювання, запити та календар',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    week: 'Тиждень',
    calendar: 'Календар',
    history: 'Історія',
    month: 'Місяць',
    day: 'День',
    list: 'Список',
    management: 'Керування',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    synced: 'Синхронізовано',
    confirmed: 'Підтверджено',
    waiting: 'Очікує',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    selectedDay: 'Обраний день',
    bookings: 'записів',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Готово',
    confirm: 'Підтвердити',
    decline: 'Відхилити',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    requests: 'Запити',
    total: 'Усього',
    marked: 'Позначені',
    done: 'Готово',
    year: 'Рік',
    dateRange: 'Діапазон дат',
    from: 'Від',
    to: 'До',
    surname: 'Імʼя клієнта',
    minPrice: 'Ціна від',
    maxPrice: 'Ціна до',
    paidOnly: 'Тільки оплачені',
    unpaidOnly: 'Тільки неоплачені',
    allPayments: 'Усі оплати',
    status: 'Статус',
    allStatuses: 'Усі статуси',
    cancelledByMe: 'Відхилено мною',
    cancelledByClient: 'Скасовано клієнтом',
    reset: 'Скинути',
    apply: 'Застосувати',
    addBefore: '+ Додати час до 05:00',
    addAfter: '+ Додати час після 00:00',
    time: 'Час',
    clientProcedure: 'Клієнт / Процедура',
    repeatClient: 'Постійний клієнт',
    specialNote: 'Спец. нотатка',
    addCustomTime: 'Додати свій час',
    changeMinutes: 'Змінити хвилини',
    hourFixed: 'Година фіксована',
    minute: 'Хвилини',
    newTime: 'Новий час',
    clientCard: 'Картка клієнта',
    contactLocked: 'Контакти та адреса закриті до підтвердження',
    contactOpen: 'Контакти та адреса відкриті',
    chatAllowed:
      'Чат доступний до підтвердження. Контакти, адреси та геолокація залишаються прихованими.',
    paymentMethod: 'Спосіб оплати',
    cash: 'Готівка',
    card: 'Картка',
    bank: 'Банк',
    applePay: 'Apple Pay',
    manualClient: 'Додати клієнта',
    blockTime: 'Закрити час',
    addBooking: 'Додати бронь',
    clearFilter: 'Скинути фільтр',
    quickFilters: 'Швидкі фільтри',
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
  bank: '🏦',
  apple: '📱',
};

const paymentLabels = {
  cash: 'cash',
  card: 'card',
  bank: 'bank',
  apple: 'apple',
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

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
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
  return date.toISOString().slice(0, 10);
}

function fromInputDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return startOfDay(new Date());
  return date;
}

function getTimeFromDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getTimeLabel(booking: BookingItem) {
  const date = getBookingDate(booking);
  if (!date) return '—';
  return getTimeFromDate(date);
}

function getHourLabel(hour: number) {
  if (hour === 24) return '24:00';
  return `${String(hour).padStart(2, '0')}:00`;
}

function getDateTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getDateTitleLong(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

function getWeekDates(date: Date) {
  const base = startOfDay(date);
  const day = (base.getDay() + 6) % 7;
  const monday = addDays(base, -day);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
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

function isPaid(booking: BookingItem) {
  return Boolean(booking.clientPaid || booking.paymentReceivedByPlatform || booking.unlockFeePaid);
}

function isUnlocked(booking: BookingItem) {
  return canShowExactAddress(booking) && canShowDirectContacts(booking);
}

function isActiveBooking(booking: BookingItem) {
  return booking.status === 'upcoming' || booking.status === 'pending';
}

function isMarkedBooking(booking: BookingItem) {
  return booking.status === 'completed';
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

function getPaymentKey(booking: BookingItem) {
  const keys = Object.keys(paymentIcons);
  const index = Math.abs(
    String(booking.id || booking.masterName)
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  );
  return keys[index % keys.length] || 'card';
}

function getBookingHistoryKind(booking: BookingItem): HistoryFilter {
  const note = String(booking.category || '').toLowerCase();

  if (booking.status === 'completed') return 'done';
  if (booking.status === 'pending') return 'waiting';
  if (booking.status === 'upcoming') return 'confirmed';
  if (note.includes('client')) return 'cancelledByClient';
  if (booking.status === 'cancelled') return 'cancelledByMe';
  return 'all';
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
    unlockFeePaid: confirmed,
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
  const afterTomorrow = addDays(today, 2);

  return [
    makeBooking(
      'client-demo-1',
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
      'client-demo-2',
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
      'client-demo-3',
      today,
      13,
      0,
      'Klára Nováková',
      'Массаж',
      60,
      'cancelled',
      'Chelsea, London',
      'cancelled_by_client частично / отменено'
    ),
    makeBooking(
      'client-demo-4',
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
      'client-demo-5',
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
      'client-demo-6',
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
      'client-demo-7',
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
      'client-demo-8',
      afterTomorrow,
      12,
      15,
      'Nadia Beauty',
      'Brows',
      40,
      'completed',
      'Hackney, London',
      'готово'
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
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showFreeWindows, setShowFreeWindows] = useState(true);
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const [nameFilter, setNameFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rangeFrom, setRangeFrom] = useState(() => toInputDate(startOfDay(new Date())));
  const [rangeTo, setRangeTo] = useState(() => toInputDate(startOfDay(new Date())));

  const [noteBooking, setNoteBooking] = useState<BookingItem | null>(null);
  const [clientCardBooking, setClientCardBooking] = useState<BookingItem | null>(null);

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerHour, setTimePickerHour] = useState(5);
  const [timePickerMinute, setTimePickerMinute] = useState(0);
  const [timePickerBookingId, setTimePickerBookingId] = useState<string | null>(null);
  const [customSlots, setCustomSlots] = useState<Record<string, number[]>>({});

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

  const dateKey = useMemo(() => toInputDate(activeDate), [activeDate]);

  const basePeriodBookings = useMemo(() => {
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

    if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? weekDates.some((item) => isSameDay(item, date)) : false;
      });
    }

    if (viewMode === 'calendar') {
      if (calendarMode === 'month') {
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return (
            date &&
            date.getFullYear() === calendarDate.getFullYear() &&
            date.getMonth() === calendarDate.getMonth()
          );
        });
      }

      if (calendarMode === 'week') {
        const weekDates = getWeekDates(selectedDate);
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? weekDates.some((item) => isSameDay(item, date)) : false;
        });
      }

      if (calendarMode === 'day' || calendarMode === 'list') {
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, selectedDate) : false;
        });
      }
    }

    if (viewMode === 'history') {
      const from = fromInputDate(rangeFrom);
      const to = endOfDay(fromInputDate(rangeTo));

      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? date >= from && date <= to : false;
      });
    }

    return source;
  }, [
    bookings,
    calendarDate,
    calendarMode,
    rangeFrom,
    rangeTo,
    selectedDate,
    today,
    tomorrow,
    viewMode,
  ]);

  const periodRevenue = useMemo(() => {
    return basePeriodBookings
      .filter((booking) => booking.status !== 'cancelled')
      .reduce((sum, booking) => sum + Number(booking.price || 0), 0);
  }, [basePeriodBookings]);

  const filteredBookings = useMemo(() => {
    let source = [...basePeriodBookings];

    if (viewMode === 'week') {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, selectedDate) : false;
      });
    }

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (quickFilter === 'active') {
      source = source.filter(isActiveBooking);
    }

    if (quickFilter === 'requests') {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (quickFilter === 'marked' || quickFilter === 'done') {
      source = source.filter(isMarkedBooking);
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

    if (historyFilter !== 'all') {
      source = source.filter((booking) => getBookingHistoryKind(booking) === historyFilter);
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
    basePeriodBookings,
    historyFilter,
    maxPrice,
    minPrice,
    nameFilter,
    paymentFilter,
    quickFilter,
    selectedDate,
    showOnlyRequests,
    viewMode,
  ]);

  const selectedDayBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, activeDate) : false;
      })
      .sort((a, b) => {
        const left = getBookingDate(a)?.getTime() || 0;
        const right = getBookingDate(b)?.getTime() || 0;
        return left - right;
      });
  }, [activeDate, bookings]);

  const activeCount = basePeriodBookings.filter(isActiveBooking).length;
  const requestCount = basePeriodBookings.filter((booking) => booking.status === 'pending').length;
  const markedCount = basePeriodBookings.filter(isMarkedBooking).length;

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

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => current - 3 + index);
  }, []);

  const handleTopMode = (mode: ViewMode) => {
    setViewMode(mode);
    setQuickFilter('all');

    if (mode === 'today') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarMode('day');
      setRangeFrom(toInputDate(now));
      setRangeTo(toInputDate(now));
      setHistoryFilter('all');
    }

    if (mode === 'tomorrow') {
      const next = addDays(startOfDay(new Date()), 1);
      setSelectedDate(next);
      setCalendarDate(next);
      setCalendarMode('day');
      setRangeFrom(toInputDate(next));
      setRangeTo(toInputDate(next));
      setHistoryFilter('all');
    }

    if (mode === 'week') {
      const now = startOfDay(new Date());
      const week = getWeekDates(now);
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarMode('week');
      setRangeFrom(toInputDate(week[0]));
      setRangeTo(toInputDate(week[6]));
      setHistoryFilter('all');
    }

    if (mode === 'calendar') {
      setCalendarMode('month');
      setHistoryFilter('all');
    }

    if (mode === 'history') {
      setCalendarMode('list');
      const from = addDays(startOfDay(new Date()), -30);
      const to = startOfDay(new Date());
      setRangeFrom(toInputDate(from));
      setRangeTo(toInputDate(to));
    }
  };

  const moveDate = (direction: -1 | 1) => {
    if (viewMode === 'today' || viewMode === 'tomorrow' || calendarMode === 'day') {
      const next = addDays(activeDate, direction);
      setSelectedDate(next);
      setCalendarDate(next);
      setViewMode('calendar');
      setCalendarMode('day');
      setRangeFrom(toInputDate(next));
      setRangeTo(toInputDate(next));
      return;
    }

    if (viewMode === 'week' || calendarMode === 'week') {
      const next = addDays(selectedDate, direction * 7);
      const week = getWeekDates(next);
      setSelectedDate(next);
      setCalendarDate(next);
      setRangeFrom(toInputDate(week[0]));
      setRangeTo(toInputDate(week[6]));
      return;
    }

    if (calendarMode === 'month') {
      const next = addMonths(calendarDate, direction);
      setCalendarDate(next);
      return;
    }

    const next = addDays(activeDate, direction);
    setSelectedDate(next);
    setCalendarDate(next);
  };

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: 'completed' } : item))
    );
  };

  const confirmBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'upcoming');
    setBookings((prev) =>
      prev.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              status: 'upcoming',
              bookingConfirmedByMaster: true,
              unlockFeePaid: true,
            }
          : item
      )
    );
  };

  const declineBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'cancelled');
    setBookings((prev) =>
      prev.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              status: 'cancelled',
              category: `${item.category || ''} cancelled_by_me`,
            }
          : item
      )
    );
  };

  const resetFilters = () => {
    setNameFilter('');
    setPaymentFilter('all');
    setHistoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setShowOnlyRequests(false);
    setQuickFilter('all');

    if (viewMode === 'history') {
      setRangeFrom(toInputDate(addDays(startOfDay(new Date()), -30)));
      setRangeTo(toInputDate(startOfDay(new Date())));
    } else {
      setRangeFrom(toInputDate(activeDate));
      setRangeTo(toInputDate(activeDate));
    }
  };

  const openMinutePicker = (hour: number, booking?: BookingItem) => {
    const date = booking ? getBookingDate(booking) : null;
    setTimePickerHour(date ? date.getHours() : hour);
    setTimePickerMinute(date ? date.getMinutes() : 0);
    setTimePickerBookingId(booking?.id || null);
    setTimePickerOpen(true);
  };

  const applyMinutePicker = () => {
    if (timePickerBookingId) {
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id !== timePickerBookingId) return booking;

          const date = getBookingDate(booking) || activeDate;
          const nextDate = new Date(date);
          nextDate.setHours(timePickerHour, timePickerMinute, 0, 0);

          return {
            ...booking,
            dateTime: nextDate.toISOString(),
            dateLabel: `${String(timePickerHour).padStart(2, '0')}:${String(timePickerMinute).padStart(
              2,
              '0'
            )}`,
          };
        })
      );
    } else {
      setCustomSlots((prev) => {
        const value = timePickerHour * 60 + timePickerMinute;
        const existing = prev[dateKey] || [];
        const next = Array.from(new Set([...existing, value])).sort((a, b) => a - b);
        return { ...prev, [dateKey]: next };
      });
    }

    setTimePickerOpen(false);
  };

  const activeDateTitle = getDateTitle(activeDate, language);
  const periodSubtitle =
    viewMode === 'week'
      ? `${filteredBookings.length} ${text.bookings} · ${money(periodRevenue)} · ${getMonthTitle(
          selectedDate,
          language
        )}`
      : `${filteredBookings.length} ${text.bookings} · ${money(periodRevenue)} · ${getMonthTitle(
          activeDate,
          language
        )}`;

  const topModes: Array<[ViewMode, string]> = [
    ['today', text.today],
    ['tomorrow', text.tomorrow],
    ['week', text.week],
    ['calendar', text.calendar],
    ['history', text.history],
  ];

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
        <header style={headerStyle}>
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
          <h1 style={pageTitleStyle}>{text.title}</h1>
          <p style={pageSubtitleStyle}>{text.subtitle}</p>
        </section>

        <section style={topTabsWrapStyle}>
          {topModes.map(([mode, label]) => {
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

        <section style={statsWrapStyle}>
          <QuickStat
            title={text.active}
            value={String(activeCount)}
            bg={BRAND.softGreen}
            active={quickFilter === 'active'}
            onClick={() => setQuickFilter((prev) => (prev === 'active' ? 'all' : 'active'))}
          />
          <QuickStat
            title={text.requests}
            value={String(requestCount)}
            bg={BRAND.softYellow}
            active={quickFilter === 'requests'}
            onClick={() => setQuickFilter((prev) => (prev === 'requests' ? 'all' : 'requests'))}
          />
          <QuickStat
            title={text.total}
            value={String(basePeriodBookings.length)}
            bg={BRAND.softBlue}
            active={quickFilter === 'all'}
            onClick={() => setQuickFilter('all')}
          />
          <QuickStat
            title={text.marked}
            value={String(markedCount)}
            bg={BRAND.softViolet}
            active={quickFilter === 'marked'}
            onClick={() => setQuickFilter((prev) => (prev === 'marked' ? 'all' : 'marked'))}
          />
        </section>

        {quickFilter !== 'all' ? (
          <button type="button" onClick={() => setQuickFilter('all')} style={clearFilterStyle}>
            × {text.clearFilter}
          </button>
        ) : null}

        <section style={calendarPanelStyle}>
          <div style={dateHeaderStyle}>
            <button type="button" onClick={() => moveDate(-1)} style={smallCircleStyle}>
              ‹
            </button>

            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <div style={dateTitleStyle}>{activeDateTitle}</div>
              <div style={dateSubtitleStyle}>{periodSubtitle}</div>
            </div>

            <button type="button" onClick={() => moveDate(1)} style={smallCircleStyle}>
              ›
            </button>
          </div>

          <div style={controlRowStyle}>
            <button
              type="button"
              onClick={() => setManagementOpen(true)}
              style={{
                ...filterChipStyle,
                background: managementOpen ? BRAND.navy : '#ffffff',
                color: managementOpen ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {text.management}
            </button>

            <button type="button" onClick={() => handleTopMode('today')} style={filterChipStyle}>
              🗓️ {text.today}
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
              onClick={() => setShowOnlyRequests((prev) => !prev)}
              style={{
                ...filterChipStyle,
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
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('week');
                setCalendarMode('week');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarMode === 'month' ? (
            <MonthGrid
              language={language}
              calendarDate={calendarDate}
              selectedDate={selectedDate}
              bookings={monthBookings}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('calendar');
                setCalendarMode('day');
                setRangeFrom(toInputDate(date));
                setRangeTo(toInputDate(date));
              }}
            />
          ) : null}

          <div style={legendStyle}>
            <LegendDot color={BRAND.blue} label={text.completed} />
            <LegendDot color={BRAND.green} label={text.confirmed} />
            <LegendDot color={BRAND.red} label={text.unavailable} />
            <LegendDot color={BRAND.yellow} label={text.waiting} />
          </div>
        </section>

        {managementOpen ? (
          <ManagementPanel
            text={text}
            language={language}
            years={years}
            calendarDate={calendarDate}
            calendarMode={calendarMode}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            nameFilter={nameFilter}
            paymentFilter={paymentFilter}
            historyFilter={historyFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
            periodRevenue={periodRevenue}
            viewMode={viewMode}
            onCalendarDate={setCalendarDate}
            onCalendarMode={(mode) => {
              setCalendarMode(mode);
              if (mode === 'week') {
                setViewMode('week');
              } else if (mode === 'month') {
                setViewMode('calendar');
              } else {
                setViewMode('calendar');
              }
            }}
            onRangeFrom={setRangeFrom}
            onRangeTo={setRangeTo}
            onName={setNameFilter}
            onPayment={setPaymentFilter}
            onHistory={setHistoryFilter}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
            onReset={resetFilters}
            onApply={() => setManagementOpen(false)}
          />
        ) : null}

        <section style={{ marginTop: 20 }}>
          <button type="button" onClick={() => openMinutePicker(4)} style={addTimeButtonStyle}>
            {text.addBefore}
          </button>

          <div style={notebookHeaderStyle}>
            <span>{text.time}</span>
            <span>{text.clientProcedure}</span>
            <span>{text.price}</span>
            <span>{text.notes}</span>
          </div>

          {viewMode === 'week' ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <h2 style={daySectionTitleStyle}>{getDateTitleLong(selectedDate, language)}</h2>
              <NotebookSchedule
                text={text}
                bookings={filteredBookings}
                activeDate={selectedDate}
                showFreeWindows={showFreeWindows}
                customSlots={customSlots[dateKey] || []}
                onMinute={openMinutePicker}
                onDone={markDone}
                onConfirm={confirmBooking}
                onDecline={declineBooking}
                onChat={(booking) => {
                  router.push(`/messages?booking=${encodeURIComponent(booking.id)}`);
                }}
                onDetails={setClientCardBooking}
                onNote={setNoteBooking}
              />
            </div>
          ) : (
            <NotebookSchedule
              text={text}
              bookings={filteredBookings}
              activeDate={activeDate}
              showFreeWindows={showFreeWindows}
              customSlots={customSlots[dateKey] || []}
              onMinute={openMinutePicker}
              onDone={markDone}
              onConfirm={confirmBooking}
              onDecline={declineBooking}
              onChat={(booking) => {
                router.push(`/messages?booking=${encodeURIComponent(booking.id)}`);
              }}
              onDetails={setClientCardBooking}
              onNote={setNoteBooking}
            />
          )}

          <button
            type="button"
            onClick={() => openMinutePicker(24)}
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
          onConfirm={() => confirmBooking(clientCardBooking)}
          onDecline={() => declineBooking(clientCardBooking)}
          onDone={() => markDone(clientCardBooking)}
        />
      ) : null}

      {timePickerOpen ? (
        <TimePickerModal
          text={text}
          hour={timePickerHour}
          minute={timePickerMinute}
          onMinute={setTimePickerMinute}
          onClose={() => setTimePickerOpen(false)}
          onApply={applyMinutePicker}
        />
      ) : null}
    </main>
  );
}

function ManagementPanel({
  text,
  language,
  years,
  calendarDate,
  calendarMode,
  rangeFrom,
  rangeTo,
  nameFilter,
  paymentFilter,
  historyFilter,
  minPrice,
  maxPrice,
  periodRevenue,
  viewMode,
  onCalendarDate,
  onCalendarMode,
  onRangeFrom,
  onRangeTo,
  onName,
  onPayment,
  onHistory,
  onMinPrice,
  onMaxPrice,
  onReset,
  onApply,
}: {
  text: PageText;
  language: AppLanguage;
  years: number[];
  calendarDate: Date;
  calendarMode: CalendarMode;
  rangeFrom: string;
  rangeTo: string;
  nameFilter: string;
  paymentFilter: PaymentFilter;
  historyFilter: HistoryFilter;
  minPrice: string;
  maxPrice: string;
  periodRevenue: number;
  viewMode: ViewMode;
  onCalendarDate: (date: Date) => void;
  onCalendarMode: (mode: CalendarMode) => void;
  onRangeFrom: (value: string) => void;
  onRangeTo: (value: string) => void;
  onName: (value: string) => void;
  onPayment: (value: PaymentFilter) => void;
  onHistory: (value: HistoryFilter) => void;
  onMinPrice: (value: string) => void;
  onMaxPrice: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
}) {
  return (
    <section style={managementPanelStyle}>
      <div style={managementTopStyle}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>{text.management}</div>
          <div style={{ marginTop: 3, fontSize: 13, fontWeight: 900, color: BRAND.muted }}>
            {text.dateRange} · {money(periodRevenue)}
          </div>
        </div>

        <button type="button" onClick={onApply} style={miniCloseButtonStyle}>
          ×
        </button>
      </div>

      <div style={filtersGridStyle}>
        <label style={fieldLabelStyle}>
          <span>{text.year}</span>
          <select
            value={calendarDate.getFullYear()}
            onChange={(event) => {
              const next = new Date(calendarDate);
              next.setFullYear(Number(event.target.value));
              onCalendarDate(next);
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
              onCalendarDate(next);
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

      <div style={modeGridStyle}>
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
              onClick={() => onCalendarMode(mode)}
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

      <div style={filtersGridStyle}>
        <label style={fieldLabelStyle}>
          <span>{text.from}</span>
          <input
            type="date"
            value={rangeFrom}
            onChange={(event) => onRangeFrom(event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.to}</span>
          <input
            type="date"
            value={rangeTo}
            onChange={(event) => onRangeTo(event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.surname}</span>
          <input value={nameFilter} onChange={(event) => onName(event.target.value)} placeholder="Smith" style={inputStyle} />
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.allPayments}</span>
          <select
            value={paymentFilter}
            onChange={(event) => onPayment(event.target.value as PaymentFilter)}
            style={inputStyle}
          >
            <option value="all">{text.allPayments}</option>
            <option value="paid">{text.paidOnly}</option>
            <option value="unpaid">{text.unpaidOnly}</option>
          </select>
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.minPrice}</span>
          <input type="number" value={minPrice} onChange={(event) => onMinPrice(event.target.value)} style={inputStyle} />
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.maxPrice}</span>
          <input type="number" value={maxPrice} onChange={(event) => onMaxPrice(event.target.value)} style={inputStyle} />
        </label>

        <label style={{ ...fieldLabelStyle, gridColumn: '1 / -1' }}>
          <span>{text.history}</span>
          <select
            value={historyFilter}
            onChange={(event) => onHistory(event.target.value as HistoryFilter)}
            style={inputStyle}
            disabled={viewMode !== 'history'}
          >
            <option value="all">{text.allStatuses}</option>
            <option value="done">{text.completed}</option>
            <option value="waiting">{text.waiting}</option>
            <option value="confirmed">{text.confirmed}</option>
            <option value="cancelledByMe">{text.cancelledByMe}</option>
            <option value="cancelledByClient">{text.cancelledByClient}</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" onClick={onReset} style={plainButtonStyle}>
          {text.reset}
        </button>
        <button type="button" onClick={onApply} style={darkButtonStyle}>
          {text.apply}
        </button>
      </div>
    </section>
  );
}

function NotebookSchedule({
  text,
  bookings,
  activeDate,
  showFreeWindows,
  customSlots,
  onMinute,
  onDone,
  onConfirm,
  onDecline,
  onChat,
  onDetails,
  onNote,
}: {
  text: PageText;
  bookings: BookingItem[];
  activeDate: Date;
  showFreeWindows: boolean;
  customSlots: number[];
  onMinute: (hour: number, booking?: BookingItem) => void;
  onDone: (booking: BookingItem) => void;
  onConfirm: (booking: BookingItem) => void;
  onDecline: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
  onDetails: (booking: BookingItem) => void;
  onNote: (booking: BookingItem) => void;
}) {
  const hours = Array.from({ length: 20 }, (_, index) => index + 5);
  const slotMinutes = Array.from(new Set([...hours.map((hour) => hour * 60), ...customSlots])).sort(
    (a, b) => a - b
  );

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {slotMinutes.map((minuteOfDay) => {
        const hour = Math.floor(minuteOfDay / 60);
        const minute = minuteOfDay % 60;

        const slotBookings = bookings.filter((booking) => {
          const date = getBookingDate(booking);
          return date
            ? isSameDay(date, activeDate) && date.getHours() === hour && date.getMinutes() === minute
            : false;
        });

        const hourBookings = bookings.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, activeDate) && date.getHours() === hour : false;
        });

        const finalBookings = slotBookings.length > 0 ? slotBookings : hourBookings.length > 0 && minute === 0 ? hourBookings : [];

        if (finalBookings.length === 0 && !showFreeWindows) return null;

        if (finalBookings.length === 0) {
          return (
            <FreeSlotRow
              key={`${hour}-${minute}`}
              hour={hour}
              minute={minute}
              text={text}
              onMinute={() => onMinute(hour)}
            />
          );
        }

        return finalBookings.map((booking) => (
          <NotebookBookingRow
            key={booking.id}
            booking={booking}
            text={text}
            onMinute={() => {
              const date = getBookingDate(booking);
              onMinute(date?.getHours() || hour, booking);
            }}
            onDone={() => onDone(booking)}
            onConfirm={() => onConfirm(booking)}
            onDecline={() => onDecline(booking)}
            onChat={() => onChat(booking)}
            onDetails={() => onDetails(booking)}
            onNote={() => onNote(booking)}
          />
        ));
      })}
    </div>
  );
}

function NotebookBookingRow({
  booking,
  text,
  onMinute,
  onDone,
  onConfirm,
  onDecline,
  onChat,
  onDetails,
  onNote,
}: {
  booking: BookingItem;
  text: PageText;
  onMinute: () => void;
  onDone: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onChat: () => void;
  onDetails: () => void;
  onNote: () => void;
}) {
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const repeat = clientRepeatCount[booking.masterName] || 1;
  const unlocked = isUnlocked(booking);
  const location = unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);
  const paymentKey = getPaymentKey(booking);

  return (
    <article
      draggable
      title="Long press / drag to move time"
      style={{
        position: 'relative',
        minHeight: 86,
        borderRadius: 18,
        border: `2px solid ${cancelled ? '#f4b8c8' : '#dfe7df'}`,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffe3ea 49%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '92px minmax(0, 1fr) 62px 34px',
        gap: 8,
        alignItems: 'center',
        padding: '8px 8px 8px 0',
        overflow: 'hidden',
        boxShadow: '0 6px 14px rgba(7,27,70,0.04)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: color,
        }}
      />

      <div style={timeCellStyle}>
        <button type="button" onClick={onMinute} style={timePlusButtonStyle}>
          {done ? '✓' : '+'}
        </button>
        <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>{getTimeLabel(booking)}</div>
      </div>

      <button type="button" onClick={onDetails} style={clientCellButtonStyle}>
        <div
          style={{
            fontSize: 17,
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
          <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <MiniPill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
            <MiniPill
              label={isPaid(booking) ? 'Deposit paid' : 'Deposit waiting'}
              color={isPaid(booking) ? '#008f3a' : '#b87500'}
              bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
            />
          </div>
        ) : null}

        {!cancelled ? (
          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              fontWeight: 900,
              color: BRAND.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              filter: unlocked || pending ? 'none' : 'blur(2px)',
            }}
          >
            📍 {location || 'London'}
          </div>
        ) : null}

        {!cancelled ? (
          <div style={{ marginTop: 7, display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChat();
              }}
              style={tinyOutlineButtonStyle}
            >
              💬 {text.openChat}
            </button>

            {pending ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onConfirm();
                  }}
                  style={tinyGreenButtonStyle}
                >
                  ✓ {text.confirm}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDecline();
                  }}
                  style={tinyRedButtonStyle}
                >
                  ×
                </button>
              </>
            ) : done ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDetails();
                }}
                style={tinyOutlineButtonStyle}
              >
                {text.details}
              </button>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDone();
                }}
                style={tinyGreenButtonStyle}
              >
                ✓ {text.markDone}
              </button>
            )}
          </div>
        ) : null}
      </button>

      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: cancelled ? BRAND.red : color === BRAND.yellow ? BRAND.orange : color,
          }}
        >
          {money(Number(booking.price || 0))}
        </div>
        <div
          title={text.paymentMethod}
          style={{
            marginTop: 5,
            fontSize: 17,
            filter: pending || unlocked ? 'none' : 'blur(2px)',
          }}
        >
          {paymentIcons[paymentKey]}
        </div>
      </div>

      <button
        type="button"
        onClick={onNote}
        aria-label={text.notes}
        style={{
          width: 32,
          height: 38,
          borderRadius: 10,
          border: 'none',
          background: 'transparent',
          color: BRAND.muted,
          fontSize: 24,
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
  hour,
  minute,
  text,
  onMinute,
}: {
  hour: number;
  minute: number;
  text: PageText;
  onMinute: () => void;
}) {
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <article
      style={{
        minHeight: 66,
        borderRadius: 22,
        border: '2px dashed #d7dce4',
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '86px 1fr',
        alignItems: 'center',
        padding: '0 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={onMinute} style={freePlusButtonStyle}>
          +
        </button>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#a1a8b4',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: BRAND.muted,
          textAlign: 'center',
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
            const bookingDate = getBookingDate(booking);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          const selected = isSameDay(date, selectedDate);

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
                      background: statusColor(booking),
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
  onSelect,
}: {
  language: AppLanguage;
  selectedDate: Date;
  bookings: BookingItem[];
  onSelect: (date: Date) => void;
}) {
  const days = getWeekDates(selectedDate);

  return (
    <div style={{ marginTop: 13, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
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
              minHeight: 82,
              borderRadius: 19,
              border: `2px solid ${BRAND.border}`,
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              fontWeight: 900,
              padding: '5px 2px',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(date)}
            </div>
            <div style={{ marginTop: 5, fontSize: 23 }}>{date.getDate()}</div>
            <div style={{ marginTop: 5, fontSize: 12 }}>{count}</div>
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

        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: BRAND.navy }}>
          {text.specialNote}
        </h2>

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
  onConfirm,
  onDecline,
  onDone,
}: {
  booking: BookingItem;
  text: PageText;
  onClose: () => void;
  onChat: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onDone: () => void;
}) {
  const unlocked = isUnlocked(booking);
  const pending = booking.status === 'pending';
  const date = getBookingDate(booking);
  const location = unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);
  const paymentKey = getPaymentKey(booking);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: BRAND.navy }}>
          {text.clientCard}
        </h2>

        <div style={clientCardHeadStyle}>
          <div style={avatarStyle}>{booking.masterName.slice(0, 1).toUpperCase()}</div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
              {booking.masterName}
            </div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 800, color: BRAND.muted }}>
              {booking.serviceName}
            </div>
          </div>
        </div>

        <div style={clientInfoGridStyle}>
          <InfoLine label={text.time} value={date ? `${getDateTitleLong(date, getSavedLanguage())} · ${getTimeFromDate(date)}` : '—'} />
          <InfoLine label={text.price} value={money(Number(booking.price || 0))} />
          <InfoLine label={text.status} value={statusLabel(booking, text)} />
          <InfoLine label={text.paymentMethod} value={`${paymentIcons[paymentKey]} ${paymentLabels[paymentKey]}`} />
        </div>

        <div
          style={{
            marginTop: 13,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: unlocked ? BRAND.softGreen : BRAND.softBlue,
            padding: 12,
            color: BRAND.navy,
            fontSize: 14,
            lineHeight: 1.35,
            fontWeight: 850,
          }}
        >
          {unlocked ? text.contactOpen : text.contactLocked}
          <div style={{ marginTop: 8, color: BRAND.muted }}>
            {pending ? text.chatAllowed : null}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            padding: 12,
            background: '#ffffff',
            filter: unlocked ? 'none' : 'blur(2.4px)',
            userSelect: unlocked ? 'auto' : 'none',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: BRAND.navy }}>📍 {location || 'London'}</div>
          <div style={{ marginTop: 7, fontSize: 14, fontWeight: 900, color: BRAND.navy }}>
            ☎ +44 7700 123456
          </div>
          <div style={{ marginTop: 7, fontSize: 14, fontWeight: 900, color: BRAND.navy }}>
            ✉ client@olamep.com
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: pending ? '1fr 1fr' : '1fr 1fr', gap: 9 }}>
          <button type="button" onClick={onChat} style={plainButtonStyle}>
            💬 {text.openChat}
          </button>

          {pending ? (
            <button type="button" onClick={onConfirm} style={greenActionButtonStyle}>
              ✓ {text.confirm}
            </button>
          ) : booking.status === 'completed' ? (
            <button type="button" onClick={onClose} style={darkButtonStyle}>
              {text.close}
            </button>
          ) : (
            <button type="button" onClick={onDone} style={greenActionButtonStyle}>
              ✓ {text.markDone}
            </button>
          )}
        </div>

        {pending ? (
          <button type="button" onClick={onDecline} style={{ ...redActionButtonStyle, marginTop: 9 }}>
            × {text.decline}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoLineStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
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

        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: BRAND.navy }}>
          {text.changeMinutes}
        </h2>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div
            style={{
              minHeight: 108,
              borderRadius: 22,
              border: `2px solid ${BRAND.border}`,
              background: BRAND.softGreen,
              display: 'grid',
              placeItems: 'center',
              color: '#008f3a',
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            {String(hour).padStart(2, '0')}
            <div style={{ marginTop: -14, fontSize: 12, color: BRAND.muted }}>{text.hourFixed}</div>
          </div>

          <label style={fieldLabelStyle}>
            <span>{text.minute}</span>
            <select value={minute} onChange={(event) => onMinute(Number(event.target.value))} style={minuteSelectStyle}>
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
          ◷ {text.newTime}: {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </div>

        <button type="button" onClick={onApply} style={{ ...darkButtonStyle, marginTop: 14 }}>
          {text.apply}
        </button>
      </div>
    </div>
  );
}

function QuickStat({
  title,
  value,
  bg,
  active,
  onClick,
}: {
  title: string;
  value: string;
  bg: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 78,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: active ? BRAND.navy : bg,
        color: active ? '#ffffff' : BRAND.navy,
        padding: 10,
        display: 'grid',
        alignContent: 'space-between',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: active ? '#ffffff' : BRAND.muted }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
    </button>
  );
}

function MiniPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 22,
        padding: '0 7px',
        borderRadius: 999,
        border: `1.7px solid ${color}`,
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 900,
        color: BRAND.navy,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 11, height: 11, borderRadius: 999, background: color }} />
      {label}
    </span>
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

const statsWrapStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 25,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
};

const clearFilterStyle: CSSProperties = {
  marginTop: 10,
  width: '100%',
  minHeight: 38,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 13,
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

const dateHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '42px minmax(0, 1fr) 42px',
  alignItems: 'center',
  gap: 8,
};

const dateTitleStyle: CSSProperties = {
  fontSize: 27,
  fontWeight: 900,
  color: BRAND.navy,
  lineHeight: 1.05,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dateSubtitleStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 14,
  fontWeight: 900,
  color: BRAND.muted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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

const controlRowStyle: CSSProperties = {
  marginTop: 13,
  display: 'flex',
  gap: 9,
  overflowX: 'auto',
  paddingBottom: 6,
};

const filterChipStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 46,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  padding: '0 16px',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const managementPanelStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 24,
  border: `2.5px solid ${BRAND.border}`,
  background: BRAND.cream,
  padding: 13,
};

const managementTopStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 40px',
  gap: 10,
  alignItems: 'center',
  marginBottom: 12,
};

const miniCloseButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 22,
  fontWeight: 900,
  cursor: 'pointer',
};

const filtersGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const modeGridStyle: CSSProperties = {
  marginTop: 11,
  marginBottom: 11,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
};

const fieldLabelStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 48,
  boxSizing: 'border-box',
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 900,
  padding: '0 11px',
};

const modeButtonStyle: CSSProperties = {
  minHeight: 43,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const plainButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const darkButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const greenActionButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const redActionButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const legendStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  overflowX: 'auto',
  padding: '0 12px',
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
  gridTemplateColumns: '92px 1fr 62px 42px',
  gap: 8,
  padding: '0 14px 8px',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
};

const daySectionTitleStyle: CSSProperties = {
  margin: '0 0 -4px',
  fontSize: 20,
  lineHeight: 1.1,
  fontWeight: 900,
  color: BRAND.navy,
};

const timeCellStyle: CSSProperties = {
  minHeight: 68,
  display: 'grid',
  gridTemplateColumns: '38px 1fr',
  gap: 8,
  alignItems: 'center',
  paddingLeft: 14,
};

const timePlusButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 21,
  fontWeight: 900,
  cursor: 'pointer',
};

const freePlusButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 21,
  fontWeight: 900,
  cursor: 'pointer',
  flexShrink: 0,
};

const clientCellButtonStyle: CSSProperties = {
  minWidth: 0,
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
};

const tinyOutlineButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 13,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  padding: '0 10px',
};

const tinyGreenButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 13,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  padding: '0 10px',
};

const tinyRedButtonStyle: CSSProperties = {
  minHeight: 34,
  minWidth: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 16,
  fontWeight: 900,
  cursor: 'pointer',
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
  maxHeight: '86vh',
  overflowY: 'auto',
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

const minuteSelectStyle: CSSProperties = {
  width: '100%',
  minHeight: 108,
  boxSizing: 'border-box',
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 34,
  fontWeight: 900,
  padding: '0 18px',
};

const clientCardHeadStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: '70px 1fr',
  gap: 13,
  alignItems: 'center',
};

const avatarStyle: CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background:
    'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  fontWeight: 900,
};

const clientInfoGridStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gap: 8,
};

const infoLineStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 14,
  border: '1.8px solid #e2e5ea',
  background: '#fbfbfb',
  display: 'grid',
  gridTemplateColumns: '1fr 1.4fr',
  alignItems: 'center',
  gap: 8,
  padding: '0 10px',
  fontSize: 13,
  color: BRAND.muted,
  fontWeight: 900,
};
