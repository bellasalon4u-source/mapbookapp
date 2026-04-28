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
type PaymentFilter = 'all' | 'paid' | 'unpaid';
type PaymentMethodFilter = 'all' | 'cash' | 'card' | 'app' | 'phone';
type HistoryStatusFilter =
  | 'all'
  | 'completed'
  | 'pending'
  | 'upcoming'
  | 'cancelledByMe'
  | 'cancelledByClient';

type ClientCardMode = 'full' | 'locked';

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
  filters: string;
  manage: string;
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
  confirm: string;
  reject: string;
  price: string;
  notes: string;
  back: string;
  close: string;
  active: string;
  total: string;
  requests: string;
  done: string;
  revenue: string;
  dateRange: string;
  from: string;
  to: string;
  surname: string;
  minPrice: string;
  maxPrice: string;
  paidOnly: string;
  unpaidOnly: string;
  allPayments: string;
  paymentMethod: string;
  cash: string;
  card: string;
  app: string;
  phone: string;
  reset: string;
  apply: string;
  addBefore: string;
  addAfter: string;
  time: string;
  clientProcedure: string;
  status: string;
  repeatClient: string;
  specialNote: string;
  addCustomTime: string;
  addClient: string;
  closeTime: string;
  year: string;
  selectedPeriod: string;
  allStatuses: string;
  cancelledByMe: string;
  cancelledByClient: string;
  fullInfo: string;
  lockedInfo: string;
  contactsLocked: string;
  contactsOpen: string;
  depositPaid: string;
  depositWaiting: string;
  sendPhoto: string;
  addressLocked: string;
  tapRow: string;
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
    filters: 'Filters',
    manage: 'Manage',
    freeWindows: 'Free windows',
    onlyRequests: 'Only requests',
    synced: 'Synced',
    confirmed: 'Confirmed',
    waiting: 'Waiting',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free slot',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    confirm: 'Confirm',
    reject: 'Reject',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
    active: 'Active',
    total: 'Total',
    requests: 'Requests',
    done: 'Done',
    revenue: 'Revenue',
    dateRange: 'Date range',
    from: 'From',
    to: 'To',
    surname: 'Client name',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    paidOnly: 'Paid only',
    unpaidOnly: 'Unpaid only',
    allPayments: 'All payments',
    paymentMethod: 'Payment method',
    cash: 'Cash',
    card: 'Card',
    app: 'App',
    phone: 'Phone',
    reset: 'Reset',
    apply: 'Apply',
    addBefore: '+ Add time before 05:00',
    addAfter: '+ Add time after 00:00',
    time: 'Time',
    clientProcedure: 'Client / Procedure',
    status: 'Status',
    repeatClient: 'Regular client',
    specialNote: 'Special note',
    addCustomTime: 'Add minutes',
    addClient: 'Add client',
    closeTime: 'Close time',
    year: 'Year',
    selectedPeriod: 'Selected period',
    allStatuses: 'All statuses',
    cancelledByMe: 'Rejected by me',
    cancelledByClient: 'Cancelled by client',
    fullInfo: 'Client card',
    lockedInfo: 'Client request',
    contactsLocked: 'Contacts locked',
    contactsOpen: 'Contacts open',
    depositPaid: 'Deposit paid',
    depositWaiting: 'Deposit waiting',
    sendPhoto: 'Send photo',
    addressLocked: 'Address and contacts open after confirmation',
    tapRow: 'Tap row to open client card',
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
    filters: 'Фильтры',
    manage: 'Управление',
    freeWindows: 'Свободные окна',
    onlyRequests: 'Только запросы',
    synced: 'Синхронизировано',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    bookings: 'записей',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Готово',
    confirm: 'Подтвердить',
    reject: 'Отклонить',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    total: 'Всего',
    requests: 'Запросы',
    done: 'Готово',
    revenue: 'Доход',
    dateRange: 'Диапазон дат',
    from: 'От',
    to: 'До',
    surname: 'Имя клиента',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    paidOnly: 'Только оплаченные',
    unpaidOnly: 'Только неоплаченные',
    allPayments: 'Все оплаты',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Карта',
    app: 'В приложении',
    phone: 'Телефон',
    reset: 'Сбросить',
    apply: 'Применить',
    addBefore: '+ Добавить время до 05:00',
    addAfter: '+ Добавить время после 00:00',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    status: 'Статус',
    repeatClient: 'Постоянный клиент',
    specialNote: 'Спец. заметка',
    addCustomTime: 'Добавить минуты',
    addClient: 'Добавить клиента',
    closeTime: 'Закрыть время',
    year: 'Год',
    selectedPeriod: 'Выбранный период',
    allStatuses: 'Все статусы',
    cancelledByMe: 'Отклонено мной',
    cancelledByClient: 'Отменено клиентом',
    fullInfo: 'Карточка клиента',
    lockedInfo: 'Заявка клиента',
    contactsLocked: 'Контакты закрыты',
    contactsOpen: 'Контакты открыты',
    depositPaid: 'Депозит оплачен',
    depositWaiting: 'Депозит ожидает',
    sendPhoto: 'Фото',
    addressLocked: 'Адрес и контакты откроются после подтверждения',
    tapRow: 'Нажмите на строку, чтобы открыть карточку клиента',
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
    filters: 'Фільтри',
    manage: 'Керування',
    freeWindows: 'Вільні вікна',
    onlyRequests: 'Тільки запити',
    synced: 'Синхронізовано',
    confirmed: 'Підтверджено',
    waiting: 'Очікує',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    bookings: 'записів',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Готово',
    confirm: 'Підтвердити',
    reject: 'Відхилити',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    total: 'Усього',
    requests: 'Запити',
    done: 'Готово',
    revenue: 'Дохід',
    dateRange: 'Діапазон дат',
    from: 'Від',
    to: 'До',
    surname: 'Імʼя клієнта',
    minPrice: 'Ціна від',
    maxPrice: 'Ціна до',
    paidOnly: 'Тільки оплачені',
    unpaidOnly: 'Тільки неоплачені',
    allPayments: 'Усі оплати',
    paymentMethod: 'Спосіб оплати',
    cash: 'Готівка',
    card: 'Картка',
    app: 'У застосунку',
    phone: 'Телефон',
    reset: 'Скинути',
    apply: 'Застосувати',
    addBefore: '+ Додати час до 05:00',
    addAfter: '+ Додати час після 00:00',
    time: 'Час',
    clientProcedure: 'Клієнт / Процедура',
    status: 'Статус',
    repeatClient: 'Постійний клієнт',
    specialNote: 'Спец. нотатка',
    addCustomTime: 'Додати хвилини',
    addClient: 'Додати клієнта',
    closeTime: 'Закрити час',
    year: 'Рік',
    selectedPeriod: 'Обраний період',
    allStatuses: 'Усі статуси',
    cancelledByMe: 'Відхилено мною',
    cancelledByClient: 'Скасовано клієнтом',
    fullInfo: 'Картка клієнта',
    lockedInfo: 'Заявка клієнта',
    contactsLocked: 'Контакти закриті',
    contactsOpen: 'Контакти відкриті',
    depositPaid: 'Депозит оплачено',
    depositWaiting: 'Депозит очікує',
    sendPhoto: 'Фото',
    addressLocked: 'Адреса й контакти відкриються після підтвердження',
    tapRow: 'Натисніть на рядок, щоб відкрити картку клієнта',
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

const paymentMethodsByBooking: Record<string, PaymentMethodFilter> = {
  'client-demo-1': 'cash',
  'client-demo-2': 'card',
  'client-demo-3': 'cash',
  'client-demo-4': 'phone',
  'client-demo-5': 'app',
  'client-demo-6': 'card',
  'client-demo-7': 'phone',
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

function getTimeLabelFromDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getTimeLabel(booking: BookingItem) {
  const date = getBookingDate(booking);
  if (!date) return '—';
  return getTimeLabelFromDate(date);
}

function getHourLabel(hour: number) {
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

function getLongDateTitle(date: Date, language: AppLanguage) {
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

function getPaymentMethod(booking: BookingItem): PaymentMethodFilter {
  return paymentMethodsByBooking[booking.id] || 'app';
}

function getPaymentIcon(method: PaymentMethodFilter) {
  if (method === 'cash') return '💷';
  if (method === 'card') return '💳';
  if (method === 'phone') return '📱';
  if (method === 'app') return '🟢';
  return '•';
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
    dateLabel: getTimeLabelFromDate(dateTime),
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
  const yesterday = addDays(today, -1);

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
      'частично / отменено'
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
      yesterday,
      12,
      0,
      'Mila Wellness',
      'Massage',
      70,
      'completed',
      'Hackney, London',
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
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showFreeWindows, setShowFreeWindows] = useState(true);
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rangeFrom, setRangeFrom] = useState(() => toInputDate(startOfDay(new Date())));
  const [rangeTo, setRangeTo] = useState(() => toInputDate(startOfDay(new Date())));
  const [noteBooking, setNoteBooking] = useState<BookingItem | null>(null);
  const [clientBooking, setClientBooking] = useState<BookingItem | null>(null);
  const [timePicker, setTimePicker] = useState<{ hour: number; bookingId?: string } | null>(null);
  const [customMinute, setCustomMinute] = useState(25);

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

  const visibleBookings = useMemo(() => {
    const from = fromInputDate(rangeFrom);
    const to = fromInputDate(rangeTo);
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

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
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? date >= from && date <= toEnd : false;
      });
    }

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
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

    if (paymentMethodFilter !== 'all') {
      source = source.filter((booking) => getPaymentMethod(booking) === paymentMethodFilter);
    }

    if (historyStatusFilter !== 'all') {
      if (historyStatusFilter === 'completed') {
        source = source.filter((booking) => booking.status === 'completed');
      }

      if (historyStatusFilter === 'pending') {
        source = source.filter((booking) => booking.status === 'pending');
      }

      if (historyStatusFilter === 'upcoming') {
        source = source.filter((booking) => booking.status === 'upcoming');
      }

      if (historyStatusFilter === 'cancelledByMe' || historyStatusFilter === 'cancelledByClient') {
        source = source.filter((booking) => booking.status === 'cancelled');
      }
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
    historyStatusFilter,
    maxPrice,
    minPrice,
    nameFilter,
    paymentFilter,
    paymentMethodFilter,
    rangeFrom,
    rangeTo,
    selectedDate,
    showOnlyRequests,
    today,
    tomorrow,
    viewMode,
  ]);

  const activeCount = bookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'upcoming'
  ).length;
  const requestCount = bookings.filter((booking) => booking.status === 'pending').length;
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length;
  const totalRevenue = visibleBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + Number(booking.price || 0), 0);

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
    return Array.from({ length: 7 }, (_, index) => current - 2 + index);
  }, []);

  const handleTopMode = (mode: ViewMode) => {
    setViewMode(mode);
    setControlsOpen(false);

    if (mode === 'today') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarMode('day');
      setRangeFrom(toInputDate(now));
      setRangeTo(toInputDate(now));
    }

    if (mode === 'tomorrow') {
      const next = addDays(startOfDay(new Date()), 1);
      setSelectedDate(next);
      setCalendarDate(next);
      setCalendarMode('day');
      setRangeFrom(toInputDate(next));
      setRangeTo(toInputDate(next));
    }

    if (mode === 'week') {
      setCalendarMode('week');
      setRangeFrom(toInputDate(getWeekDates(selectedDate)[0]));
      setRangeTo(toInputDate(getWeekDates(selectedDate)[6]));
    }

    if (mode === 'calendar') {
      setCalendarMode('month');
    }

    if (mode === 'history') {
      setCalendarMode('list');
      setControlsOpen(true);
      const start = addDays(startOfDay(new Date()), -30);
      const end = addDays(startOfDay(new Date()), 30);
      setRangeFrom(toInputDate(start));
      setRangeTo(toInputDate(end));
    }
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
    setPaymentMethodFilter('all');
    setHistoryStatusFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setRangeFrom(toInputDate(activeDate));
    setRangeTo(toInputDate(activeDate));
  };

  const applyMinute = () => {
    if (!timePicker) return;

    if (timePicker.bookingId) {
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id !== timePicker.bookingId) return booking;

          const date = getBookingDate(booking);
          if (!date) return booking;

          const nextDate = new Date(date);
          nextDate.setMinutes(customMinute, 0, 0);

          return {
            ...booking,
            dateTime: nextDate.toISOString(),
            dateLabel: getTimeLabelFromDate(nextDate),
          };
        })
      );
    }

    setTimePicker(null);
  };

  const headerCountLabel =
    viewMode === 'history'
      ? `${visibleBookings.length} ${text.bookings} · ${text.history}`
      : `${visibleBookings.length} ${text.bookings} · ${money(totalRevenue)}`;

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

        <section style={statsWrapStyle}>
          <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
          <StatBox title={text.requests} value={String(requestCount)} bg={BRAND.softYellow} />
          <StatBox title={text.total} value={String(bookings.length)} bg={BRAND.softBlue} />
          <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softViolet} />
        </section>

        <section style={scheduleControlStyle}>
          <div style={dateControlGridStyle}>
            <button
              type="button"
              onClick={() => {
                const next = viewMode === 'calendar' ? addMonths(calendarDate, -1) : addDays(activeDate, -1);
                setSelectedDate(startOfDay(next));
                setCalendarDate(startOfDay(next));
                if (viewMode === 'today' || viewMode === 'tomorrow') setViewMode('calendar');
              }}
              style={smallCircleStyle}
            >
              ‹
            </button>

            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <div style={dateTitleStyle}>{getDateTitle(activeDate, language)}</div>
              <div style={dateMetaStyle}>
                {headerCountLabel} · {getMonthTitle(calendarDate, language)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = viewMode === 'calendar' ? addMonths(calendarDate, 1) : addDays(activeDate, 1);
                setSelectedDate(startOfDay(next));
                setCalendarDate(startOfDay(next));
                if (viewMode === 'today' || viewMode === 'tomorrow') setViewMode('calendar');
              }}
              style={smallCircleStyle}
            >
              ›
            </button>
          </div>

          <div style={quickActionsRowStyle}>
            <button
              type="button"
              onClick={() => setControlsOpen((prev) => !prev)}
              style={{
                ...quickChipStyle,
                background: controlsOpen ? BRAND.navy : '#ffffff',
                color: controlsOpen ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {text.manage}
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
              onClick={() => setShowOnlyRequests((prev) => !prev)}
              style={{
                ...quickChipStyle,
                background: showOnlyRequests ? BRAND.navy : '#ffffff',
                color: showOnlyRequests ? '#ffffff' : BRAND.navy,
              }}
            >
              ⚠ {text.onlyRequests}
            </button>
          </div>

          {controlsOpen ? (
            <ControlPanel
              text={text}
              language={language}
              calendarDate={calendarDate}
              setCalendarDate={setCalendarDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarMode={calendarMode}
              setCalendarMode={setCalendarMode}
              setViewMode={setViewMode}
              years={years}
              rangeFrom={rangeFrom}
              setRangeFrom={setRangeFrom}
              rangeTo={rangeTo}
              setRangeTo={setRangeTo}
              nameFilter={nameFilter}
              setNameFilter={setNameFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              paymentMethodFilter={paymentMethodFilter}
              setPaymentMethodFilter={setPaymentMethodFilter}
              historyStatusFilter={historyStatusFilter}
              setHistoryStatusFilter={setHistoryStatusFilter}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              revenue={totalRevenue}
              onReset={resetFilters}
              onApply={() => setControlsOpen(false)}
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
              }}
            />
          ) : null}

          {viewMode === 'week' || calendarMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={bookings}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('calendar');
                setCalendarMode('day');
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

        <section style={{ marginTop: 18 }}>
          {viewMode !== 'week' ? (
            <>
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
            </>
          ) : null}

          {viewMode === 'week' ? (
            <WeekSchedule
              text={text}
              language={language}
              bookings={visibleBookings}
              selectedDate={selectedDate}
              showFreeWindows={showFreeWindows}
              onMinute={(hour, bookingId) => {
                setCustomMinute(25);
                setTimePicker({ hour, bookingId });
              }}
              onOpenClient={setClientBooking}
              onNote={setNoteBooking}
              onDone={markDone}
              onConfirm={confirmBooking}
              onReject={rejectBooking}
              onChat={(booking) => router.push(`/messages?booking=${encodeURIComponent(booking.id)}`)}
            />
          ) : (
            <NotebookSchedule
              text={text}
              bookings={visibleBookings}
              activeDate={activeDate}
              showFreeWindows={showFreeWindows}
              onMinute={(hour, bookingId) => {
                setCustomMinute(25);
                setTimePicker({ hour, bookingId });
              }}
              onOpenClient={setClientBooking}
              onNote={setNoteBooking}
              onDone={markDone}
              onConfirm={confirmBooking}
              onReject={rejectBooking}
              onChat={(booking) => router.push(`/messages?booking=${encodeURIComponent(booking.id)}`)}
            />
          )}

          {viewMode !== 'week' ? (
            <button
              type="button"
              onClick={() => {
                setCustomMinute(25);
                setTimePicker({ hour: 0 });
              }}
              style={{ ...addTimeButtonStyle, marginTop: 12 }}
            >
              {text.addAfter}
            </button>
          ) : null}
        </section>
      </div>

      <BottomNav active="clients" />

      {noteBooking ? (
        <NoteModal booking={noteBooking} text={text} onClose={() => setNoteBooking(null)} />
      ) : null}

      {clientBooking ? (
        <ClientCardModal
          booking={clientBooking}
          text={text}
          mode={isUnlocked(clientBooking) ? 'full' : 'locked'}
          onClose={() => setClientBooking(null)}
          onDone={() => markDone(clientBooking)}
          onConfirm={() => confirmBooking(clientBooking)}
          onReject={() => rejectBooking(clientBooking)}
          onChat={() => router.push(`/messages?booking=${encodeURIComponent(clientBooking.id)}`)}
        />
      ) : null}

      {timePicker ? (
        <TimePickerModal
          text={text}
          hour={timePicker.hour}
          minute={customMinute}
          onMinute={setCustomMinute}
          onClose={() => setTimePicker(null)}
          onApply={applyMinute}
        />
      ) : null}
    </main>
  );
}

function ControlPanel({
  text,
  language,
  calendarDate,
  setCalendarDate,
  selectedDate,
  setSelectedDate,
  calendarMode,
  setCalendarMode,
  setViewMode,
  years,
  rangeFrom,
  setRangeFrom,
  rangeTo,
  setRangeTo,
  nameFilter,
  setNameFilter,
  paymentFilter,
  setPaymentFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  historyStatusFilter,
  setHistoryStatusFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  revenue,
  onReset,
  onApply,
}: {
  text: PageText;
  language: AppLanguage;
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  setViewMode: (mode: ViewMode) => void;
  years: number[];
  rangeFrom: string;
  setRangeFrom: (value: string) => void;
  rangeTo: string;
  setRangeTo: (value: string) => void;
  nameFilter: string;
  setNameFilter: (value: string) => void;
  paymentFilter: PaymentFilter;
  setPaymentFilter: (value: PaymentFilter) => void;
  paymentMethodFilter: PaymentMethodFilter;
  setPaymentMethodFilter: (value: PaymentMethodFilter) => void;
  historyStatusFilter: HistoryStatusFilter;
  setHistoryStatusFilter: (value: HistoryStatusFilter) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  revenue: number;
  onReset: () => void;
  onApply: () => void;
}) {
  return (
    <div style={controlBoxStyle}>
      <div style={filtersGridStyle}>
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

      <div style={modeRowStyle}>
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
                setViewMode(mode === 'week' ? 'week' : 'calendar');
                if (mode === 'day') setSelectedDate(startOfDay(selectedDate));
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

      <div style={{ marginTop: 10, ...filtersGridStyle }}>
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
          <span>{text.surname}</span>
          <input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Smith"
            style={inputStyle}
          />
        </label>

        <label style={fieldLabelStyle}>
          <span>{text.status}</span>
          <select
            value={historyStatusFilter}
            onChange={(event) => setHistoryStatusFilter(event.target.value as HistoryStatusFilter)}
            style={inputStyle}
          >
            <option value="all">{text.allStatuses}</option>
            <option value="completed">{text.completed}</option>
            <option value="pending">{text.waiting}</option>
            <option value="upcoming">{text.confirmed}</option>
            <option value="cancelledByMe">{text.cancelledByMe}</option>
            <option value="cancelledByClient">{text.cancelledByClient}</option>
          </select>
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
          <span>{text.paymentMethod}</span>
          <select
            value={paymentMethodFilter}
            onChange={(event) => setPaymentMethodFilter(event.target.value as PaymentMethodFilter)}
            style={inputStyle}
          >
            <option value="all">{text.paymentMethod}</option>
            <option value="cash">{text.cash}</option>
            <option value="card">{text.card}</option>
            <option value="app">{text.app}</option>
            <option value="phone">{text.phone}</option>
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

      <div style={revenueBoxStyle}>
        <span>{text.revenue}</span>
        <strong>{money(revenue)}</strong>
      </div>

      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button type="button" onClick={onReset} style={plainButtonStyle}>
          {text.reset}
        </button>
        <button type="button" onClick={onApply} style={darkButtonStyle}>
          {text.apply}
        </button>
      </div>
    </div>
  );
}

function NotebookSchedule({
  text,
  bookings,
  activeDate,
  showFreeWindows,
  onMinute,
  onOpenClient,
  onNote,
  onDone,
  onConfirm,
  onReject,
  onChat,
}: {
  text: PageText;
  bookings: BookingItem[];
  activeDate: Date;
  showFreeWindows: boolean;
  onMinute: (hour: number, bookingId?: string) => void;
  onOpenClient: (booking: BookingItem) => void;
  onNote: (booking: BookingItem) => void;
  onDone: (booking: BookingItem) => void;
  onConfirm: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
}) {
  const hours = Array.from({ length: 20 }, (_, index) => index + 5);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {hours.map((hour) => {
        const hourBookings = bookings.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, activeDate) && date.getHours() === hour : false;
        });

        if (hourBookings.length === 0 && !showFreeWindows) return null;

        if (hourBookings.length === 0) {
          return <FreeSlotRow key={hour} hour={hour} text={text} onMinute={() => onMinute(hour)} />;
        }

        return hourBookings.map((booking) => (
          <NotebookBookingRow
            key={booking.id}
            booking={booking}
            text={text}
            onMinute={() => onMinute(hour, booking.id)}
            onOpenClient={() => onOpenClient(booking)}
            onNote={() => onNote(booking)}
            onDone={() => onDone(booking)}
            onConfirm={() => onConfirm(booking)}
            onReject={() => onReject(booking)}
            onChat={() => onChat(booking)}
          />
        ));
      })}
    </div>
  );
}

function WeekSchedule({
  text,
  language,
  bookings,
  selectedDate,
  showFreeWindows,
  onMinute,
  onOpenClient,
  onNote,
  onDone,
  onConfirm,
  onReject,
  onChat,
}: {
  text: PageText;
  language: AppLanguage;
  bookings: BookingItem[];
  selectedDate: Date;
  showFreeWindows: boolean;
  onMinute: (hour: number, bookingId?: string) => void;
  onOpenClient: (booking: BookingItem) => void;
  onNote: (booking: BookingItem) => void;
  onDone: (booking: BookingItem) => void;
  onConfirm: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
}) {
  const days = getWeekDates(selectedDate);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {days.map((day) => {
        const dayBookings = bookings.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, day) : false;
        });

        if (dayBookings.length === 0 && !showFreeWindows) return null;

        return (
          <section key={day.toISOString()} style={weekDayBlockStyle}>
            <h3 style={weekDayTitleStyle}>{getLongDateTitle(day, language)}</h3>

            <NotebookSchedule
              text={text}
              bookings={dayBookings}
              activeDate={day}
              showFreeWindows={showFreeWindows}
              onMinute={onMinute}
              onOpenClient={onOpenClient}
              onNote={onNote}
              onDone={onDone}
              onConfirm={onConfirm}
              onReject={onReject}
              onChat={onChat}
            />
          </section>
        );
      })}
    </div>
  );
}

function NotebookBookingRow({
  booking,
  text,
  onMinute,
  onOpenClient,
  onNote,
  onDone,
  onConfirm,
  onReject,
  onChat,
}: {
  booking: BookingItem;
  text: PageText;
  onMinute: () => void;
  onOpenClient: () => void;
  onNote: () => void;
  onDone: () => void;
  onConfirm: () => void;
  onReject: () => void;
  onChat: () => void;
}) {
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const repeat = clientRepeatCount[booking.masterName] || 1;
  const method = getPaymentMethod(booking);
  const locked = !isUnlocked(booking);
  const location = locked ? getPublicBookingLocation(booking) : getVisibleBookingLocation(booking);

  return (
    <article
      draggable
      title={text.tapRow}
      onClick={onOpenClient}
      style={{
        position: 'relative',
        minHeight: 96,
        borderRadius: 18,
        border: cancelled ? `2px solid #f2b5c7` : `2px solid #dce8dd`,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffe3ea 49%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '94px minmax(0, 1fr) 72px 34px',
        gap: 8,
        alignItems: 'center',
        padding: '9px 9px 9px 0',
        overflow: 'hidden',
        boxShadow: '0 6px 16px rgba(7,27,70,0.04)',
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

      <div style={timeCellStyle}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMinute();
          }}
          style={timePlusStyle}
        >
          +
        </button>

        {done ? <span style={doneCheckStyle}>✓</span> : null}

        <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>
          {getTimeLabel(booking)}
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 18,
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
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <MiniPill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
            <MiniPill
              label={isPaid(booking) ? text.depositPaid : text.depositWaiting}
              color={isPaid(booking) ? '#008f3a' : '#b87500'}
              bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
            />
          </div>
        ) : null}

        {!cancelled ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 900,
              color: BRAND.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              filter: locked && pending ? 'blur(2px)' : 'none',
            }}
          >
            📍 {location || 'London'}
          </div>
        ) : null}

        {!cancelled ? (
          <div
            style={{
              marginTop: 7,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={onChat} style={compactChatButtonStyle}>
              💬 {text.openChat}
            </button>

            {pending ? (
              <>
                <button type="button" onClick={onConfirm} style={compactGreenButtonStyle}>
                  ✓
                </button>
                <button type="button" onClick={onReject} style={compactRedButtonStyle}>
                  ×
                </button>
              </>
            ) : done ? (
              <button type="button" onClick={onOpenClient} style={compactOutlineButtonStyle}>
                {text.details}
              </button>
            ) : (
              <button type="button" onClick={onDone} style={compactGreenWideButtonStyle}>
                ✓ {text.markDone}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'grid', justifyItems: 'end', gap: 5 }}>
        <span style={{ fontSize: 18 }}>{getPaymentIcon(method)}</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: cancelled ? BRAND.red : color === BRAND.yellow ? BRAND.orange : color,
            textAlign: 'right',
          }}
        >
          {money(Number(booking.price || 0))}
        </span>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNote();
        }}
        aria-label={text.notes}
        style={noteMenuButtonStyle}
      >
        ☰
      </button>
    </article>
  );
}

function FreeSlotRow({ hour, text, onMinute }: { hour: number; text: PageText; onMinute: () => void }) {
  return (
    <article style={freeSlotRowStyle}>
      <button type="button" onClick={onMinute} style={freePlusStyle}>
        +
      </button>

      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: '#a1a8b4',
        }}
      >
        {getHourLabel(hour)}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: BRAND.muted,
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
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
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
              minHeight: 72,
              borderRadius: 17,
              border: `2px solid ${BRAND.border}`,
              background: selected ? BRAND.navy : '#ffffff',
              color: selected ? '#ffffff' : BRAND.navy,
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            <div style={{ fontSize: 9, textTransform: 'capitalize' }}>
              {new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(date)}
            </div>
            <div style={{ marginTop: 4, fontSize: 22 }}>{date.getDate()}</div>
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

        <div style={noteBoxStyle}>{booking.category || text.notes}</div>

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
  mode,
  onClose,
  onDone,
  onConfirm,
  onReject,
  onChat,
}: {
  booking: BookingItem;
  text: PageText;
  mode: ClientCardMode;
  onClose: () => void;
  onDone: () => void;
  onConfirm: () => void;
  onReject: () => void;
  onChat: () => void;
}) {
  const pending = booking.status === 'pending';
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const locked = mode === 'locked';
  const method = getPaymentMethod(booking);
  const location = locked ? getPublicBookingLocation(booking) : getVisibleBookingLocation(booking);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={clientCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={modalTitleStyle}>{locked ? text.lockedInfo : text.fullInfo}</h2>

        <div style={clientTopStyle}>
          <div style={clientAvatarStyle}>{booking.masterName.slice(0, 1)}</div>

          <div style={{ minWidth: 0 }}>
            <div style={clientNameStyle}>{booking.masterName}</div>
            <div style={clientServiceStyle}>{booking.serviceName}</div>
            <MiniPill label={statusLabel(booking, text)} color={statusColor(booking)} bg={statusBg(booking)} />
          </div>
        </div>

        <div style={clientPriceStyle}>
          <span>{money(Number(booking.price || 0))}</span>
          <strong>{getPaymentIcon(method)}</strong>
        </div>

        <div style={clientInfoGridStyle}>
          <InfoLine label={text.time} value={getTimeLabel(booking)} />
          <InfoLine label={text.paymentMethod} value={method === 'cash' ? text.cash : method === 'card' ? text.card : method === 'phone' ? text.phone : text.app} />
          <InfoLine label={text.notes} value={booking.category || '—'} />
          <InfoLine label={text.status} value={statusLabel(booking, text)} />
        </div>

        <div style={locked ? lockedInfoBoxStyle : fullInfoBoxStyle}>
          {locked ? (
            <>
              <strong>{text.addressLocked}</strong>
              <div style={{ marginTop: 8, filter: 'blur(3px)' }}>
                📍 {location || 'London'} · +44 7700 123456 · client@olamep.com
              </div>
            </>
          ) : (
            <>
              <strong>{text.contactsOpen}</strong>
              <div style={{ marginTop: 8 }}>📍 {location || 'London'}</div>
              <div style={{ marginTop: 5 }}>☎ +44 7700 123456</div>
              <div style={{ marginTop: 5 }}>✉ client@olamep.com</div>
            </>
          )}
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: pending ? '1fr 1fr' : '1fr 1fr', gap: 8 }}>
          <button type="button" onClick={onChat} style={plainButtonStyle}>
            💬 {text.openChat}
          </button>

          <button type="button" onClick={onChat} style={plainButtonStyle}>
            📷 {text.sendPhoto}
          </button>

          {pending ? (
            <>
              <button type="button" onClick={onConfirm} style={darkButtonStyle}>
                ✓ {text.confirm}
              </button>
              <button type="button" onClick={onReject} style={redActionButtonStyle}>
                × {text.reject}
              </button>
            </>
          ) : null}

          {!pending && !done && !cancelled ? (
            <button type="button" onClick={onDone} style={{ ...darkButtonStyle, gridColumn: '1 / -1' }}>
              ✓ {text.markDone}
            </button>
          ) : null}
        </div>
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

        <div style={fixedHourBoxStyle}>
          <div>
            <div style={{ fontSize: 50, fontWeight: 900, color: BRAND.green }}>
              {String(hour).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>Hour fixed</div>
          </div>

          <label style={fieldLabelStyle}>
            <span>Minute</span>
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

        <div style={newTimeBoxStyle}>
          ⏱ {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </div>

        <button type="button" onClick={onApply} style={{ ...darkButtonStyle, marginTop: 14 }}>
          {text.apply}
        </button>
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

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div style={{ ...statBoxStyle, background: bg }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>{value}</div>
    </div>
  );
}

function MiniPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 22,
        padding: '0 7px',
        borderRadius: 999,
        border: `1.6px solid ${color}`,
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
    <span style={legendDotStyle}>
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
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
};

const statBoxStyle: CSSProperties = {
  minHeight: 76,
  borderRadius: 18,
  border: `2.3px solid ${BRAND.border}`,
  padding: 9,
  display: 'grid',
  alignContent: 'space-between',
};

const scheduleControlStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 13,
  overflow: 'hidden',
};

const dateControlGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '42px 1fr 42px',
  alignItems: 'center',
  gap: 8,
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

const dateTitleStyle: CSSProperties = {
  fontSize: 25,
  fontWeight: 900,
  color: BRAND.navy,
  textTransform: 'capitalize',
  lineHeight: 1.05,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dateMetaStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 13,
  fontWeight: 900,
  color: BRAND.muted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const quickActionsRowStyle: CSSProperties = {
  marginTop: 12,
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
  padding: '0 15px',
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const controlBoxStyle: CSSProperties = {
  marginTop: 10,
  borderRadius: 22,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.cream,
  padding: 12,
};

const filtersGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 9,
};

const modeRowStyle: CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 7,
};

const modeButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 12,
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

const revenueBoxStyle: CSSProperties = {
  marginTop: 10,
  minHeight: 46,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softOrange,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  fontSize: 14,
  fontWeight: 900,
  color: BRAND.navy,
};

const plainButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
};

const darkButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.navy,
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
};

const redActionButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `2px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 14,
  fontWeight: 900,
  cursor: 'pointer',
};

const legendStyle: CSSProperties = {
  marginTop: 10,
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

const legendDotStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.navy,
  whiteSpace: 'nowrap',
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
  gridTemplateColumns: '112px 1fr 72px 42px',
  gap: 8,
  padding: '0 14px 8px',
  color: BRAND.muted,
  fontSize: 13,
  fontWeight: 900,
};

const timeCellStyle: CSSProperties = {
  minHeight: 72,
  display: 'grid',
  gridTemplateRows: '26px 1fr',
  alignItems: 'center',
  justifyItems: 'center',
  paddingLeft: 10,
  position: 'relative',
};

const timePlusStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 20,
  lineHeight: 1,
  fontWeight: 900,
  cursor: 'pointer',
};

const doneCheckStyle: CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 32,
  width: 32,
  height: 32,
  borderRadius: 999,
  background: BRAND.green,
  color: '#ffffff',
  border: `2px solid #ffffff`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 19,
  fontWeight: 900,
  zIndex: 2,
};

const compactChatButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  padding: '0 10px',
};

const compactOutlineButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  padding: '0 10px',
};

const compactGreenButtonStyle: CSSProperties = {
  width: 38,
  minHeight: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const compactRedButtonStyle: CSSProperties = {
  width: 38,
  minHeight: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 17,
  fontWeight: 900,
  cursor: 'pointer',
};

const compactGreenWideButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 13,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  padding: '0 10px',
};

const noteMenuButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  border: 'none',
  background: 'transparent',
  color: BRAND.muted,
  fontSize: 24,
  fontWeight: 900,
  cursor: 'pointer',
};

const freeSlotRowStyle: CSSProperties = {
  minHeight: 64,
  borderRadius: 22,
  border: '2px dashed #d7dce4',
  background: '#ffffff',
  display: 'grid',
  gridTemplateColumns: '58px 112px minmax(0, 1fr)',
  alignItems: 'center',
  padding: '0 14px',
};

const freePlusStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: `2.2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 24,
  lineHeight: 1,
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

const weekDayBlockStyle: CSSProperties = {
  borderRadius: 24,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 10,
};

const weekDayTitleStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 18,
  fontWeight: 900,
  color: BRAND.navy,
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

const clientCardStyle: CSSProperties = {
  ...modalCardStyle,
  maxHeight: '88vh',
  overflowY: 'auto',
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

const noteBoxStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softYellow,
  padding: 13,
  fontSize: 15,
  lineHeight: 1.4,
  fontWeight: 800,
  color: BRAND.navy,
};

const clientTopStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: '68px 1fr',
  gap: 12,
  alignItems: 'center',
};

const clientAvatarStyle: CSSProperties = {
  width: 68,
  height: 68,
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

const clientNameStyle: CSSProperties = {
  fontSize: 21,
  fontWeight: 900,
  color: BRAND.navy,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const clientServiceStyle: CSSProperties = {
  marginTop: 4,
  marginBottom: 7,
  fontSize: 14,
  fontWeight: 800,
  color: BRAND.muted,
};

const clientPriceStyle: CSSProperties = {
  marginTop: 14,
  minHeight: 62,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softGreen,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
  fontSize: 30,
  fontWeight: 900,
  color: '#008f3a',
};

const clientInfoGridStyle: CSSProperties = {
  marginTop: 12,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
};

const infoLineStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 16,
  border: `2px solid #e3e3e3`,
  padding: 10,
  display: 'grid',
  alignContent: 'space-between',
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
};

const lockedInfoBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softYellow,
  padding: 13,
  fontSize: 14,
  lineHeight: 1.4,
  fontWeight: 900,
  color: BRAND.navy,
};

const fullInfoBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softGreen,
  padding: 13,
  fontSize: 14,
  lineHeight: 1.4,
  fontWeight: 900,
  color: BRAND.navy,
};

const fixedHourBoxStyle: CSSProperties = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  alignItems: 'end',
};

const newTimeBoxStyle: CSSProperties = {
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
};
