'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
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
import { getOrCreateChatThread } from '../../../services/chatStore';

type ViewMode = 'today' | 'tomorrow' | 'week' | 'calendar' | 'history';
type CalendarStage = 'year' | 'month' | 'day';
type StatusFilter = 'all' | 'completed' | 'upcoming' | 'pending' | 'cancelled';
type PaymentFilter = 'all' | 'paid' | 'unpaid';

type FilterSwitches = {
  dateRange: boolean;
  timeRange: boolean;
  price: boolean;
  client: boolean;
  service: boolean;
  payment: boolean;
  status: boolean;
};

type SlotAction = {
  hour: number;
  minute: number;
  label: string;
} | null;

type DragMoveState = {
  bookingId: string;
  pointerId: number;
  active: boolean;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

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
  filters: string;
  freeWindows: string;
  confirmed: string;
  waiting: string;
  completed: string;
  cancelled: string;
  unavailable: string;
  available: string;
  all: string;
  bookings: string;
  noBookings: string;
  details: string;
  openChat: string;
  markDone: string;
  approve: string;
  reject: string;
  clearSlot: string;
  clearedFromSchedule: string;
  price: string;
  notes: string;
  back: string;
  close: string;
  chooseYear: string;
  chooseMonth: string;
  from: string;
  to: string;
  clientName: string;
  service: string;
  timeRange: string;
  dateRange: string;
  minPrice: string;
  maxPrice: string;
  paidOnly: string;
  unpaidOnly: string;
  allPayments: string;
  reset: string;
  apply: string;
  save: string;
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
  wholeWeek: string;
  tapDayHint: string;
  whatAdd: string;
  manualClient: string;
  unavailableTime: string;
  breakTime: string;
  preciseMinute: string;
  manualClientName: string;
  manualService: string;
  manualPrice: string;
  manualNote: string;
  moveCancel: string;
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
    month: 'Month',
    day: 'Day',
    list: 'List',
    management: 'Management',
    filters: 'Filters',
    freeWindows: 'Free windows',
    confirmed: 'Confirmed',
    waiting: 'Waiting',
    completed: 'Done',
    cancelled: 'Cancelled',
    unavailable: 'Unavailable',
    available: 'Free slot',
    all: 'All',
    bookings: 'bookings',
    noBookings: 'No bookings for this date',
    details: 'Details',
    openChat: 'Chat',
    markDone: 'Mark done',
    approve: 'Approve',
    reject: 'Reject',
    clearSlot: 'Clear',
    clearedFromSchedule: 'Cleared from schedule',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
    chooseYear: 'Choose year',
    chooseMonth: 'Choose month',
    from: 'From',
    to: 'To',
    clientName: 'Client name',
    service: 'Service',
    timeRange: 'Time range',
    dateRange: 'Date range',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    paidOnly: 'Paid only',
    unpaidOnly: 'Unpaid only',
    allPayments: 'All payments',
    reset: 'Reset',
    apply: 'Apply',
    save: 'Save',
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
    wholeWeek: 'Whole week',
    tapDayHint: 'Tap a day or booking to open details',
    whatAdd: 'What to add?',
    manualClient: 'Add manual client',
    unavailableTime: 'Make time unavailable',
    breakTime: 'Add break',
    preciseMinute: 'Change minutes',
    manualClientName: 'Client name',
    manualService: 'Service',
    manualPrice: 'Price',
    manualNote: 'Note',
    moveCancel: 'Cancel move',
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
    filters: 'Фильтры',
    freeWindows: 'Свободные окна',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает',
    completed: 'Готово',
    cancelled: 'Отменено',
    unavailable: 'Недоступно',
    available: 'Свободное окно',
    all: 'Все',
    bookings: 'записей',
    noBookings: 'На эту дату записей нет',
    details: 'Детали',
    openChat: 'Чат',
    markDone: 'Готово',
    approve: 'Подтвердить',
    reject: 'Отклонить',
    clearSlot: 'Очистить',
    clearedFromSchedule: 'Очищено из расписания',
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    chooseYear: 'Выбери год',
    chooseMonth: 'Выбери месяц',
    from: 'От',
    to: 'До',
    clientName: 'Имя или фамилия',
    service: 'Услуга',
    timeRange: 'Время',
    dateRange: 'Диапазон дат',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    paidOnly: 'Только оплаченные',
    unpaidOnly: 'Только неоплаченные',
    allPayments: 'Все оплаты',
    reset: 'Сбросить',
    apply: 'Применить',
    save: 'Сохранить',
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
    wholeWeek: 'Вся неделя',
    tapDayHint: 'Нажми на день или запись, чтобы открыть детали',
    whatAdd: 'Что добавить?',
    manualClient: 'Добавить клиента вручную',
    unavailableTime: 'Сделать время недоступным',
    breakTime: 'Добавить перерыв',
    preciseMinute: 'Уточнить минуты',
    manualClientName: 'Имя клиента',
    manualService: 'Услуга',
    manualPrice: 'Цена',
    manualNote: 'Заметка',
    moveCancel: 'Отменить перенос',
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
    filters: 'Фільтри',
    freeWindows: 'Вільні вікна',
    confirmed: 'Підтверджено',
    waiting: 'Очікує',
    completed: 'Готово',
    cancelled: 'Скасовано',
    unavailable: 'Недоступно',
    available: 'Вільне вікно',
    all: 'Усе',
    bookings: 'записів',
    noBookings: 'На цю дату записів немає',
    details: 'Деталі',
    openChat: 'Чат',
    markDone: 'Готово',
    approve: 'Підтвердити',
    reject: 'Відхилити',
    clearSlot: 'Очистити',
    clearedFromSchedule: 'Очищено з розкладу',
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    chooseYear: 'Обери рік',
    chooseMonth: 'Обери місяць',
    from: 'Від',
    to: 'До',
    clientName: 'Імʼя або прізвище',
    service: 'Послуга',
    timeRange: 'Час',
    dateRange: 'Діапазон дат',
    minPrice: 'Ціна від',
    maxPrice: 'Ціна до',
    paidOnly: 'Тільки оплачені',
    unpaidOnly: 'Тільки неоплачені',
    allPayments: 'Усі оплати',
    reset: 'Скинути',
    apply: 'Застосувати',
    save: 'Зберегти',
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
    wholeWeek: 'Увесь тиждень',
    tapDayHint: 'Натисни на день або запис, щоб відкрити деталі',
    whatAdd: 'Що додати?',
    manualClient: 'Додати клієнта вручну',
    unavailableTime: 'Зробити час недоступним',
    breakTime: 'Додати перерву',
    preciseMinute: 'Уточнити хвилини',
    manualClientName: 'Імʼя клієнта',
    manualService: 'Послуга',
    manualPrice: 'Ціна',
    manualNote: 'Нотатка',
    moveCancel: 'Скасувати перенос',
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

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function timeStringToMinutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return Number(h || 0) * 60 + Number(m || 0);
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

function makeManualBooking(
  date: Date,
  name: string,
  serviceName: string,
  price: number,
  status: BookingItem['status'],
  note: string
): BookingItem {
  const id = `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const paid = status !== 'cancelled';

  return {
    id,
    masterId: id,
    masterName: name,
    masterAvatar: '',
    serviceName,
    price,
    status,
    dateTime: date.toISOString(),
    dateLabel: getTimeLabel(date),
    location: '',
    areaLabel: '',
    exactAddress: '',
    clientPaid: paid,
    paymentReceivedByPlatform: paid,
    unlockFeePaid: paid,
    bookingConfirmedByMaster: status !== 'pending',
    promotionPaidByMaster: status !== 'pending',
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
  const [clearedBookingIds, setClearedBookingIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [calendarStage, setCalendarStage] = useState<CalendarStage>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showFreeWindows, setShowFreeWindows] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [weekOverviewOpen, setWeekOverviewOpen] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterSwitches, setFilterSwitches] = useState<FilterSwitches>({
    dateRange: false,
    timeRange: false,
    price: false,
    client: false,
    service: false,
    payment: false,
    status: false,
  });

  const [nameFilter, setNameFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [modalStatusFilter, setModalStatusFilter] = useState<StatusFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rangeFrom, setRangeFrom] = useState(() => toInputDate(startOfDay(new Date())));
  const [rangeTo, setRangeTo] = useState(() => toInputDate(startOfDay(new Date())));
  const [timeFrom, setTimeFrom] = useState('05:00');
  const [timeTo, setTimeTo] = useState('23:59');

  const [noteBooking, setNoteBooking] = useState<BookingItem | null>(null);
  const [clientCardBooking, setClientCardBooking] = useState<BookingItem | null>(null);
  const [timePicker, setTimePicker] = useState<{ hour: number; bookingId?: string } | null>(null);
  const [slotAction, setSlotAction] = useState<SlotAction>(null);
  const [customMinute, setCustomMinute] = useState(25);
  const [extraTimes, setExtraTimes] = useState<string[]>([]);
  const [timeOverrides, setTimeOverrides] = useState<Record<string, string>>({});

  const [manualName, setManualName] = useState('');
  const [manualService, setManualService] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualNote, setManualNote] = useState('');

  const [dragMove, setDragMove] = useState<DragMoveState | null>(null);
  const dragTimerRef = useRef<number | null>(null);
  const dragClickBlockRef = useRef(false);
  const pendingDragRef = useRef<{ bookingId: string; startX: number; startY: number } | null>(null);

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

  useEffect(() => {
    return () => {
      if (dragTimerRef.current) {
        window.clearTimeout(dragTimerRef.current);
      }

      if (typeof document !== 'undefined') {
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.touchAction = '';
      }
    };
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const getEffectiveDate = (booking: BookingItem) => {
    const override = timeOverrides[booking.id];
    if (override) return safeDate(override);
    return getBookingDate(booking);
  };

  const activeDate = useMemo(() => {
    if (viewMode === 'today') return today;
    if (viewMode === 'tomorrow') return tomorrow;
    return selectedDate;
  }, [selectedDate, today, tomorrow, viewMode]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

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
      if (calendarStage === 'year') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? date.getFullYear() === calendarDate.getFullYear() : false;
        });
      }

      if (calendarStage === 'month') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return (
            date &&
            date.getFullYear() === calendarDate.getFullYear() &&
            date.getMonth() === calendarDate.getMonth()
          );
        });
      }

      if (calendarStage === 'day') {
        source = source.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? isSameDay(date, selectedDate) : false;
        });
      }
    }

    if (viewMode === 'history') {
      source = [...bookings];
    }

    if (viewMode !== 'history') {
      source = source.filter((booking) => !clearedBookingIds.includes(booking.id));
    }

    return source;
  }, [
    bookings,
    calendarDate,
    calendarStage,
    clearedBookingIds,
    selectedDate,
    timeOverrides,
    today,
    tomorrow,
    viewMode,
  ]);

  const filteredBookings = useMemo(() => {
    let source = [...periodBookings];

    if (statusFilter !== 'all') {
      source = source.filter((booking) => booking.status === statusFilter);
    }

    if (filterSwitches.status && modalStatusFilter !== 'all') {
      source = source.filter((booking) => booking.status === modalStatusFilter);
    }

    if (filterSwitches.dateRange) {
      const from = fromInputDate(rangeFrom);
      const to = fromInputDate(rangeTo);
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);

      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? date >= from && date <= toEnd : false;
      });
    }

    if (filterSwitches.timeRange) {
      const from = timeStringToMinutes(timeFrom);
      const to = timeStringToMinutes(timeTo);

      source = source.filter((booking) => {
        const date = getEffectiveDate(booking);
        return date ? minutesOfDay(date) >= from && minutesOfDay(date) <= to : false;
      });
    }

    if (filterSwitches.client && nameFilter.trim()) {
      const query = nameFilter.trim().toLowerCase();
      source = source.filter((booking) => booking.masterName.toLowerCase().includes(query));
    }

    if (filterSwitches.service && serviceFilter.trim()) {
      const query = serviceFilter.trim().toLowerCase();
      source = source.filter((booking) =>
        String(booking.serviceName || '').toLowerCase().includes(query)
      );
    }

    if (filterSwitches.payment && paymentFilter === 'paid') {
      source = source.filter((booking) => isPaid(booking));
    }

    if (filterSwitches.payment && paymentFilter === 'unpaid') {
      source = source.filter((booking) => !isPaid(booking));
    }

    if (filterSwitches.price && minPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) >= Number(minPrice));
    }

    if (filterSwitches.price && maxPrice.trim()) {
      source = source.filter((booking) => Number(booking.price || 0) <= Number(maxPrice));
    }

    return source.sort((a, b) => {
      const left = getEffectiveDate(a)?.getTime() || 0;
      const right = getEffectiveDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    filterSwitches,
    maxPrice,
    minPrice,
    modalStatusFilter,
    nameFilter,
    paymentFilter,
    periodBookings,
    rangeFrom,
    rangeTo,
    serviceFilter,
    statusFilter,
    timeFrom,
    timeOverrides,
    timeTo,
  ]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filterSwitches).filter(Boolean).length;
  }, [filterSwitches]);

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

  const years = useMemo(() => Array.from({ length: 10 }, (_, index) => 2026 + index), []);

  const clearDragTimer = () => {
    if (dragTimerRef.current) {
      window.clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
  };

  const stopDragMove = () => {
    clearDragTimer();
    pendingDragRef.current = null;
    setDragMove(null);

    if (typeof document !== 'undefined') {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.touchAction = '';
    }
  };

  const moveBookingToSlot = (bookingId: string, slotTime: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status === 'completed') return;

    const [hourRaw, minuteRaw] = slotTime.split(':').map(Number);
    const next = new Date(activeDate);
    const hour = Number.isFinite(hourRaw) ? hourRaw : 0;
    const minute = Number.isFinite(minuteRaw) ? minuteRaw : 0;

    if (hour >= 24) {
      next.setHours(23, 59, 0, 0);
    } else {
      next.setHours(hour, minute, 0, 0);
    }

    setTimeOverrides((prev) => ({
      ...prev,
      [bookingId]: next.toISOString(),
    }));
  };

  const swapBookings = (fromBookingId: string, toBookingId: string) => {
    if (fromBookingId === toBookingId) return;

    const fromBooking = bookings.find((item) => item.id === fromBookingId);
    const toBooking = bookings.find((item) => item.id === toBookingId);

    if (!fromBooking || !toBooking) return;
    if (fromBooking.status === 'completed' || toBooking.status === 'completed') return;

    const fromDate = getEffectiveDate(fromBooking);
    const toDate = getEffectiveDate(toBooking);

    if (!fromDate || !toDate) return;

    setTimeOverrides((prev) => ({
      ...prev,
      [fromBookingId]: toDate.toISOString(),
      [toBookingId]: fromDate.toISOString(),
    }));
  };

  const clearCancelledFromSchedule = (booking: BookingItem) => {
    if (booking.status !== 'cancelled') return;

    stopDragMove();

    setClearedBookingIds((prev) => (prev.includes(booking.id) ? prev : [...prev, booking.id]));

    setTimeOverrides((prev) => {
      const next = { ...prev };
      delete next[booking.id];
      return next;
    });
  };

  const getDropTargetFromPoint = (clientX: number, clientY: number, draggedBookingId: string) => {
    const slotElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-drop-slot]')
    );

    for (const element of slotElements) {
      const rect = element.getBoundingClientRect();

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return {
          type: 'slot' as const,
          value: element.dataset.dropSlot || '',
        };
      }
    }

    const bookingElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-booking-drop-id]')
    );

    for (const element of bookingElements) {
      const bookingId = element.dataset.bookingDropId || '';

      if (!bookingId || bookingId === draggedBookingId) continue;

      const rect = element.getBoundingClientRect();

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return {
          type: 'booking' as const,
          value: bookingId,
        };
      }
    }

    return null;
  };

  const finishDragDrop = (clientX: number, clientY: number) => {
    if (!dragMove?.active) return;

    const draggedBookingId = dragMove.bookingId;
    const target = getDropTargetFromPoint(clientX, clientY, draggedBookingId);

    if (target?.type === 'slot' && target.value) {
      moveBookingToSlot(draggedBookingId, target.value);
    }

    if (target?.type === 'booking' && target.value) {
      swapBookings(draggedBookingId, target.value);
    }

    dragClickBlockRef.current = true;
    window.setTimeout(() => {
      dragClickBlockRef.current = false;
    }, 250);

    stopDragMove();
  };

  const handleBookingPointerDown = (
    booking: BookingItem,
    event: ReactPointerEvent<HTMLElement>
  ) => {
    if (booking.status === 'completed') return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-no-drag="true"]')) return;

    event.preventDefault();

    clearDragTimer();

    pendingDragRef.current = {
      bookingId: booking.id,
      startX: event.clientX,
      startY: event.clientY,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignore pointer capture errors on older browsers
    }

    dragTimerRef.current = window.setTimeout(() => {
      pendingDragRef.current = null;

      setDragMove({
        bookingId: booking.id,
        pointerId: event.pointerId,
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
      });

      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.touchAction = 'none';
    }, 360);
  };

  const handleBookingPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const pending = pendingDragRef.current;

    if (pending && !dragMove?.active) {
      const dx = Math.abs(event.clientX - pending.startX);
      const dy = Math.abs(event.clientY - pending.startY);

      if (dx > 12 || dy > 12) {
        clearDragTimer();
        pendingDragRef.current = null;
      }
    }

    if (!dragMove?.active) return;

    event.preventDefault();

    setDragMove((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        x: event.clientX,
        y: event.clientY,
      };
    });
  };

  const handleBookingPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    clearDragTimer();
    pendingDragRef.current = null;

    if (!dragMove?.active) return;

    event.preventDefault();
    finishDragDrop(event.clientX, event.clientY);
  };

  const handleBookingPointerCancel = () => {
    clearDragTimer();
    pendingDragRef.current = null;

    if (dragMove?.active) {
      stopDragMove();
    }
  };

  const handleOpenBookingChat = (booking: BookingItem) => {
    const thread = getOrCreateChatThread({
      threadId: booking.id,
      providerName: booking.masterName || 'Client',
      providerAvatar: booking.masterAvatar || '',
      category: booking.serviceName || 'Booking',
      online: true,
      lastSeenText: 'Online',
    });

    router.push(`/messages/${encodeURIComponent(thread.id)}`);
  };

  const handleTopMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStatusFilter('all');
    stopDragMove();

    if (mode === 'today') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarStage('day');
      setWeekOverviewOpen(false);
      setRangeFrom(toInputDate(now));
      setRangeTo(toInputDate(now));
    }

    if (mode === 'tomorrow') {
      const next = addDays(startOfDay(new Date()), 1);
      setSelectedDate(next);
      setCalendarDate(next);
      setCalendarStage('day');
      setWeekOverviewOpen(false);
      setRangeFrom(toInputDate(next));
      setRangeTo(toInputDate(next));
    }

    if (mode === 'week') {
      const now = startOfDay(new Date());
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarStage('day');
      setWeekOverviewOpen(true);
    }

    if (mode === 'calendar') {
      const base = calendarDate.getFullYear() < 2026 ? new Date(2026, 0, 1) : calendarDate;
      setCalendarDate(base);
      setSelectedDate(base);
      setCalendarStage('year');
      setWeekOverviewOpen(false);
    }

    if (mode === 'history') {
      setCalendarStage('day');
      setWeekOverviewOpen(false);
      setFilterModalOpen(true);
    }
  };

  const movePeriod = (direction: number) => {
    stopDragMove();

    if (viewMode === 'week') {
      const next = addDays(selectedDate, direction * 7);
      setSelectedDate(next);
      setCalendarDate(next);
      setWeekOverviewOpen(true);
      return;
    }

    if (viewMode === 'calendar' && calendarStage === 'year') {
      const next = new Date(calendarDate);
      next.setFullYear(Math.max(2026, next.getFullYear() + direction));
      setCalendarDate(next);
      return;
    }

    if (viewMode === 'calendar' && calendarStage === 'month') {
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
      setCalendarStage('day');
    }
  };

  const markDone = (booking: BookingItem) => {
    stopDragMove();
    updateBookingStatus(booking.id, 'completed');
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: 'completed' } : item))
    );
  };

  const approveBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'upcoming');
    setClearedBookingIds((prev) => prev.filter((id) => id !== booking.id));
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
    setFilterSwitches({
      dateRange: false,
      timeRange: false,
      price: false,
      client: false,
      service: false,
      payment: false,
      status: false,
    });
    setNameFilter('');
    setServiceFilter('');
    setPaymentFilter('all');
    setModalStatusFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setTimeFrom('05:00');
    setTimeTo('23:59');
    setStatusFilter('all');
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

  const openSlotAction = (time: string) => {
    stopDragMove();

    const [hour, minute] = time.split(':').map(Number);
    setSlotAction({
      hour: Number(hour || 0),
      minute: Number(minute || 0),
      label: time,
    });
    setManualName('');
    setManualService('');
    setManualPrice('');
    setManualNote('');
  };

  const createManualSlot = (kind: 'client' | 'unavailable' | 'break') => {
    if (!slotAction) return;

    const date = new Date(activeDate);
    date.setHours(slotAction.hour, slotAction.minute, 0, 0);

    if (kind === 'client') {
      const booking = makeManualBooking(
        date,
        manualName.trim() || text.manualClient,
        manualService.trim() || text.service,
        Number(manualPrice || 0),
        'upcoming',
        manualNote.trim() || text.manualClient
      );

      setBookings((prev) => [...prev, booking]);
    }

    if (kind === 'unavailable') {
      const booking = makeManualBooking(
        date,
        text.unavailableTime,
        text.unavailable,
        0,
        'cancelled',
        manualNote.trim() || text.unavailableTime
      );

      setBookings((prev) => [...prev, booking]);
    }

    if (kind === 'break') {
      const booking = makeManualBooking(
        date,
        text.breakTime,
        text.breakTime,
        0,
        'cancelled',
        manualNote.trim() || text.breakTime
      );

      setBookings((prev) => [...prev, booking]);
    }

    setSlotAction(null);
  };

  const titleForPanel = useMemo(() => {
    if (viewMode === 'calendar' && calendarStage === 'year') return text.chooseYear;
    if (viewMode === 'calendar' && calendarStage === 'month') return text.chooseMonth;
    if (viewMode === 'week' && weekOverviewOpen) {
      return `${getDateTitle(weekDates[0], language)} — ${getDateTitle(weekDates[6], language)}`;
    }

    return getDateTitle(activeDate, language);
  }, [
    activeDate,
    calendarStage,
    language,
    text.chooseMonth,
    text.chooseYear,
    viewMode,
    weekDates,
    weekOverviewOpen,
  ]);

  const shouldShowDaySchedule =
    viewMode === 'today' ||
    viewMode === 'tomorrow' ||
    viewMode === 'history' ||
    (viewMode === 'week' && !weekOverviewOpen) ||
    (viewMode === 'calendar' && calendarStage === 'day');

  const draggedBooking = dragMove
    ? bookings.find((booking) => booking.id === dragMove.bookingId) || null
    : null;

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
          onClear={() => setStatusFilter('all')}
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
            <button type="button" onClick={() => movePeriod(-1)} style={smallCircleStyle}>
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
                {titleForPanel}
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

            <button type="button" onClick={() => movePeriod(1)} style={smallCircleStyle}>
              ›
            </button>
          </div>

          <div style={quickControlsRowStyle}>
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              style={{
                ...quickChipStyle,
                background: activeFilterCount > 0 ? BRAND.green : '#ffffff',
                color: activeFilterCount > 0 ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {text.filters}
              {activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
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
          </div>

          {viewMode === 'week' ? (
            <WeekStrip
              language={language}
              selectedDate={selectedDate}
              bookings={filteredBookings.length ? filteredBookings : periodBookings}
              timeOverrides={timeOverrides}
              onSelect={(date) => {
                stopDragMove();
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setViewMode('week');
                setWeekOverviewOpen(false);
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'year' ? (
            <YearOverview
              language={language}
              year={calendarDate.getFullYear()}
              years={years}
              bookings={filteredBookings.length ? filteredBookings : periodBookings}
              getEffectiveDate={getEffectiveDate}
              onYear={(year) => {
                const next = new Date(calendarDate);
                next.setFullYear(year);
                next.setMonth(0);
                setCalendarDate(next);
              }}
              onMonth={(monthIndex) => {
                const next = new Date(calendarDate);
                next.setMonth(monthIndex);
                next.setDate(1);
                setCalendarDate(next);
                setSelectedDate(next);
                setCalendarStage('month');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'month' ? (
            <MonthLargeCalendar
              language={language}
              calendarDate={calendarDate}
              selectedDate={selectedDate}
              bookings={filteredBookings.length ? filteredBookings : periodBookings}
              getEffectiveDate={getEffectiveDate}
              onSelect={(date) => {
                setSelectedDate(startOfDay(date));
                setCalendarDate(startOfDay(date));
                setCalendarStage('day');
              }}
            />
          ) : null}

          {viewMode === 'calendar' && calendarStage === 'day' ? (
            <button
              type="button"
              onClick={() => setCalendarStage('month')}
              style={{ ...plainButtonStyle, width: '100%', marginTop: 12 }}
            >
              ← {text.chooseMonth}
            </button>
          ) : null}
        </section>

        {viewMode === 'week' && weekOverviewOpen ? (
          <WeekAgenda
            text={text}
            language={language}
            weekDates={weekDates}
            bookings={filteredBookings}
            getEffectiveDate={getEffectiveDate}
            onDay={(date) => {
              setSelectedDate(startOfDay(date));
              setCalendarDate(startOfDay(date));
              setWeekOverviewOpen(false);
            }}
            onBooking={setClientCardBooking}
          />
        ) : null}

        {shouldShowDaySchedule ? (
          <section style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={() => openSlotAction('04:00')}
              style={addTimeButtonStyle}
              data-drop-slot="04:00"
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
              clearedBookingIds={clearedBookingIds}
              dragMove={dragMove}
              isDragClickBlocked={() => dragClickBlockRef.current}
              onOpenSlot={openSlotAction}
              onBookingPointerDown={handleBookingPointerDown}
              onBookingPointerMove={handleBookingPointerMove}
              onBookingPointerUp={handleBookingPointerUp}
              onBookingPointerCancel={handleBookingPointerCancel}
              onChangeBookingMinute={(booking, hour, minute) => {
                setCustomMinute(minute);
                setTimePicker({ hour, bookingId: booking.id });
              }}
              onDone={markDone}
              onApprove={approveBooking}
              onReject={rejectBooking}
              onClearCancelled={clearCancelledFromSchedule}
              onChat={handleOpenBookingChat}
              onDetails={(booking) => setClientCardBooking(booking)}
              onNote={setNoteBooking}
            />

            <button
              type="button"
              onClick={() => openSlotAction('24:00')}
              style={{ ...addTimeButtonStyle, marginTop: 12 }}
              data-drop-slot="24:00"
            >
              {text.addAfter}
            </button>
          </section>
        ) : null}
      </div>

      <BottomNav active="clients" />

      {dragMove?.active ? (
        <>
          <button
            type="button"
            onClick={stopDragMove}
            aria-label={text.moveCancel}
            style={dragCancelButtonStyle}
          >
            ×
          </button>

          {draggedBooking ? (
            <DragGhost booking={draggedBooking} text={text} x={dragMove.x} y={dragMove.y} />
          ) : null}
        </>
      ) : null}

      {filterModalOpen ? (
        <FilterModal
          text={text}
          switches={filterSwitches}
          onSwitches={setFilterSwitches}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          timeFrom={timeFrom}
          timeTo={timeTo}
          nameFilter={nameFilter}
          serviceFilter={serviceFilter}
          paymentFilter={paymentFilter}
          statusFilter={modalStatusFilter}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onRangeFrom={setRangeFrom}
          onRangeTo={setRangeTo}
          onTimeFrom={setTimeFrom}
          onTimeTo={setTimeTo}
          onName={setNameFilter}
          onService={setServiceFilter}
          onPayment={setPaymentFilter}
          onStatus={setModalStatusFilter}
          onMinPrice={setMinPrice}
          onMaxPrice={setMaxPrice}
          onReset={resetFilters}
          onClose={() => setFilterModalOpen(false)}
        />
      ) : null}

      {slotAction ? (
        <SlotActionModal
          text={text}
          slot={slotAction}
          manualName={manualName}
          manualService={manualService}
          manualPrice={manualPrice}
          manualNote={manualNote}
          onName={setManualName}
          onService={setManualService}
          onPrice={setManualPrice}
          onNote={setManualNote}
          onManualClient={() => createManualSlot('client')}
          onUnavailable={() => createManualSlot('unavailable')}
          onBreak={() => createManualSlot('break')}
          onPreciseMinute={() => {
            setCustomMinute(slotAction.minute || 25);
            setTimePicker({ hour: slotAction.hour });
            setSlotAction(null);
          }}
          onClose={() => setSlotAction(null)}
        />
      ) : null}

      {noteBooking ? (
        <NoteModal booking={noteBooking} text={text} onClose={() => setNoteBooking(null)} />
      ) : null}

      {clientCardBooking ? (
        <ClientCardModal
          booking={clientCardBooking}
          text={text}
          onClose={() => setClientCardBooking(null)}
          onChat={() => handleOpenBookingChat(clientCardBooking)}
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
  const items: Array<{ key: StatusFilter; label: string; color: string }> = [
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
                minWidth: 112,
                minHeight: 54,
                borderRadius: 18,
                border: `2.3px solid ${BRAND.border}`,
                background: active ? BRAND.navy : '#ffffff',
                color: active ? '#ffffff' : BRAND.navy,
                display: 'grid',
                gridTemplateColumns: item.key === 'all' ? '1fr auto' : 'auto 1fr auto',
                alignItems: 'center',
                gap: 7,
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              {item.key !== 'all' ? (
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 999,
                    background: item.color,
                    display: 'inline-block',
                  }}
                />
              ) : null}
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

function FilterModal({
  text,
  switches,
  onSwitches,
  rangeFrom,
  rangeTo,
  timeFrom,
  timeTo,
  nameFilter,
  serviceFilter,
  paymentFilter,
  statusFilter,
  minPrice,
  maxPrice,
  onRangeFrom,
  onRangeTo,
  onTimeFrom,
  onTimeTo,
  onName,
  onService,
  onPayment,
  onStatus,
  onMinPrice,
  onMaxPrice,
  onReset,
  onClose,
}: {
  text: PageText;
  switches: FilterSwitches;
  onSwitches: (value: FilterSwitches) => void;
  rangeFrom: string;
  rangeTo: string;
  timeFrom: string;
  timeTo: string;
  nameFilter: string;
  serviceFilter: string;
  paymentFilter: PaymentFilter;
  statusFilter: StatusFilter;
  minPrice: string;
  maxPrice: string;
  onRangeFrom: (value: string) => void;
  onRangeTo: (value: string) => void;
  onTimeFrom: (value: string) => void;
  onTimeTo: (value: string) => void;
  onName: (value: string) => void;
  onService: (value: string) => void;
  onPayment: (value: PaymentFilter) => void;
  onStatus: (value: StatusFilter) => void;
  onMinPrice: (value: string) => void;
  onMaxPrice: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const toggle = (key: keyof FilterSwitches) => {
    onSwitches({ ...switches, [key]: !switches[key] });
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 44px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <h2 style={modalTitleStyle}>{text.filters}</h2>
          <button type="button" onClick={onClose} style={modalCloseStyle}>
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <FilterCard
            title={text.dateRange}
            active={switches.dateRange}
            onToggle={() => toggle('dateRange')}
          >
            <div style={twoColStyle}>
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
            </div>
          </FilterCard>

          <FilterCard
            title={text.timeRange}
            active={switches.timeRange}
            onToggle={() => toggle('timeRange')}
          >
            <div style={twoColStyle}>
              <label style={fieldLabelStyle}>
                <span>{text.from}</span>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(event) => onTimeFrom(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={fieldLabelStyle}>
                <span>{text.to}</span>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(event) => onTimeTo(event.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </FilterCard>

          <FilterCard
            title={text.price}
            active={switches.price}
            onToggle={() => toggle('price')}
          >
            <div style={twoColStyle}>
              <label style={fieldLabelStyle}>
                <span>{text.minPrice}</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(event) => onMinPrice(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={fieldLabelStyle}>
                <span>{text.maxPrice}</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(event) => onMaxPrice(event.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </FilterCard>

          <FilterCard
            title={text.clientName}
            active={switches.client}
            onToggle={() => toggle('client')}
          >
            <input
              value={nameFilter}
              onChange={(event) => onName(event.target.value)}
              placeholder="Smith / Anna"
              style={inputStyle}
            />
          </FilterCard>

          <FilterCard
            title={text.service}
            active={switches.service}
            onToggle={() => toggle('service')}
          >
            <input
              value={serviceFilter}
              onChange={(event) => onService(event.target.value)}
              placeholder="Hair / Massage"
              style={inputStyle}
            />
          </FilterCard>

          <FilterCard
            title={text.allPayments}
            active={switches.payment}
            onToggle={() => toggle('payment')}
          >
            <select
              value={paymentFilter}
              onChange={(event) => onPayment(event.target.value as PaymentFilter)}
              style={inputStyle}
            >
              <option value="all">{text.allPayments}</option>
              <option value="paid">{text.paidOnly}</option>
              <option value="unpaid">{text.unpaidOnly}</option>
            </select>
          </FilterCard>

          <FilterCard
            title={text.history}
            active={switches.status}
            onToggle={() => toggle('status')}
          >
            <select
              value={statusFilter}
              onChange={(event) => onStatus(event.target.value as StatusFilter)}
              style={inputStyle}
            >
              <option value="all">{text.all}</option>
              <option value="completed">{text.completed}</option>
              <option value="upcoming">{text.confirmed}</option>
              <option value="pending">{text.waiting}</option>
              <option value="cancelled">{text.cancelled}</option>
            </select>
          </FilterCard>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button type="button" onClick={onReset} style={plainButtonStyle}>
            {text.reset}
          </button>
          <button type="button" onClick={onClose} style={darkButtonStyle}>
            {text.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterCard({
  title,
  active,
  onToggle,
  children,
}: {
  title: string;
  active: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `2.4px solid ${active ? BRAND.green : BRAND.border}`,
        background: active ? BRAND.softGreen : '#ffffff',
        padding: 10,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          minHeight: 42,
          border: 'none',
          background: 'transparent',
          color: BRAND.navy,
          display: 'grid',
          gridTemplateColumns: '1fr 34px',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 900, textAlign: 'left' }}>{title}</span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: `2px solid ${active ? BRAND.green : BRAND.border}`,
            background: active ? BRAND.green : '#ffffff',
            color: active ? '#ffffff' : BRAND.navy,
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          {active ? '✓' : '+'}
        </span>
      </button>

      {active ? <div style={{ marginTop: 8 }}>{children}</div> : null}
    </div>
  );
}

function SlotActionModal({
  text,
  slot,
  manualName,
  manualService,
  manualPrice,
  manualNote,
  onName,
  onService,
  onPrice,
  onNote,
  onManualClient,
  onUnavailable,
  onBreak,
  onPreciseMinute,
  onClose,
}: {
  text: PageText;
  slot: NonNullable<SlotAction>;
  manualName: string;
  manualService: string;
  manualPrice: string;
  manualNote: string;
  onName: (value: string) => void;
  onService: (value: string) => void;
  onPrice: (value: string) => void;
  onNote: (value: string) => void;
  onManualClient: () => void;
  onUnavailable: () => void;
  onBreak: () => void;
  onPreciseMinute: () => void;
  onClose: () => void;
}) {
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 44px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div>
            <h2 style={modalTitleStyle}>{text.whatAdd}</h2>
            <div style={{ marginTop: 4, fontSize: 15, fontWeight: 900, color: BRAND.green }}>
              {slot.label}
            </div>
          </div>
          <button type="button" onClick={onClose} style={modalCloseStyle}>
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <button
            type="button"
            onClick={() => setManualOpen((prev) => !prev)}
            style={slotActionButtonStyle}
          >
            <span>👤</span>
            <strong>{text.manualClient}</strong>
            <span>{manualOpen ? '−' : '+'}</span>
          </button>

          {manualOpen ? (
            <div style={manualFormStyle}>
              <label style={fieldLabelStyle}>
                <span>{text.manualClientName}</span>
                <input
                  value={manualName}
                  onChange={(event) => onName(event.target.value)}
                  placeholder="Anna Smith"
                  style={inputStyle}
                />
              </label>

              <label style={fieldLabelStyle}>
                <span>{text.manualService}</span>
                <input
                  value={manualService}
                  onChange={(event) => onService(event.target.value)}
                  placeholder="Hair / Massage"
                  style={inputStyle}
                />
              </label>

              <div style={twoColStyle}>
                <label style={fieldLabelStyle}>
                  <span>{text.manualPrice}</span>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(event) => onPrice(event.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={fieldLabelStyle}>
                  <span>{text.manualNote}</span>
                  <input
                    value={manualNote}
                    onChange={(event) => onNote(event.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              <button type="button" onClick={onManualClient} style={darkButtonStyle}>
                {text.save}
              </button>
            </div>
          ) : null}

          <button type="button" onClick={onUnavailable} style={slotUnavailableButtonStyle}>
            <span>⛔</span>
            <strong>{text.unavailableTime}</strong>
            <span>›</span>
          </button>

          <button type="button" onClick={onBreak} style={slotBreakButtonStyle}>
            <span>☕</span>
            <strong>{text.breakTime}</strong>
            <span>›</span>
          </button>

          <button type="button" onClick={onPreciseMinute} style={slotActionButtonStyle}>
            <span>⏱</span>
            <strong>{text.preciseMinute}</strong>
            <span>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function YearOverview({
  language,
  year,
  years,
  bookings,
  getEffectiveDate,
  onYear,
  onMonth,
}: {
  language: AppLanguage;
  year: number;
  years: number[];
  bookings: BookingItem[];
  getEffectiveDate: (booking: BookingItem) => Date | null;
  onYear: (year: number) => void;
  onMonth: (monthIndex: number) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={yearWheelStyle}>
        {years.map((item) => {
          const active = item === year;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onYear(item)}
              style={{
                ...yearWheelButtonStyle,
                background: active ? BRAND.navy : '#ffffff',
                color: active ? '#ffffff' : BRAND.navy,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div style={monthsGridStyle}>
        {Array.from({ length: 12 }, (_, monthIndex) => {
          const monthBookings = bookings.filter((booking) => {
            const date = getEffectiveDate(booking);
            return date && date.getFullYear() === year && date.getMonth() === monthIndex;
          });

          return (
            <button
              key={monthIndex}
              type="button"
              onClick={() => onMonth(monthIndex)}
              style={{
                minHeight: 92,
                borderRadius: 22,
                border: `2.5px solid ${BRAND.border}`,
                background: monthBookings.length ? BRAND.softGreen : '#ffffff',
                color: BRAND.navy,
                cursor: 'pointer',
                padding: 10,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 900, textTransform: 'capitalize' }}>
                {getShortMonthName(monthIndex, language)}
              </div>

              <div
                style={{
                  margin: '10px auto 0',
                  width: 42,
                  height: 30,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: monthBookings.length ? BRAND.green : '#ffffff',
                  color: monthBookings.length ? '#ffffff' : BRAND.muted,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {monthBookings.length}
              </div>

              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 3 }}>
                {monthBookings.slice(0, 5).map((booking) => (
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
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthLargeCalendar({
  language,
  calendarDate,
  selectedDate,
  bookings,
  getEffectiveDate,
  onSelect,
}: {
  language: AppLanguage;
  calendarDate: Date;
  selectedDate: Date;
  bookings: BookingItem[];
  getEffectiveDate: (booking: BookingItem) => Date | null;
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
            const bookingDate = getEffectiveDate(booking);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          const selected = isSameDay(date, selectedDate);

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
                background: selected ? BRAND.navy : currentMonth ? '#ffffff' : '#f5f5f5',
                color: selected ? '#ffffff' : currentMonth ? BRAND.navy : '#a8a8a8',
                cursor: 'pointer',
                padding: 4,
                display: 'grid',
                alignContent: 'space-between',
                justifyItems: 'center',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 900 }}>{date.getDate()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {dayBookings.slice(0, 5).map((booking) => (
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
        const dayBookings = bookings.filter((booking) => {
          const override = timeOverrides[booking.id];
          const bookingDate = override ? safeDate(override) : getBookingDate(booking);
          return bookingDate ? isSameDay(bookingDate, date) : false;
        });

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
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
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
            </div>
            <div style={{ marginTop: 2, fontSize: 11 }}>{dayBookings.length}</div>
          </button>
        );
      })}
    </div>
  );
}

function WeekAgenda({
  text,
  language,
  weekDates,
  bookings,
  getEffectiveDate,
  onDay,
  onBooking,
}: {
  text: PageText;
  language: AppLanguage;
  weekDates: Date[];
  bookings: BookingItem[];
  getEffectiveDate: (booking: BookingItem) => Date | null;
  onDay: (date: Date) => void;
  onBooking: (booking: BookingItem) => void;
}) {
  return (
    <section style={weekAgendaStyle}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
        {text.wholeWeek}
      </h2>
      <p style={{ margin: '5px 0 12px', fontSize: 12, fontWeight: 900, color: BRAND.muted }}>
        {text.tapDayHint}
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {weekDates.map((date) => {
          const dayBookings = bookings.filter((booking) => {
            const bookingDate = getEffectiveDate(booking);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDay(date)}
              style={weekDayAgendaStyle}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: BRAND.navy,
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {getLongDateTitle(date, language)}
                </div>

                <div style={{ marginTop: 7, display: 'grid', gap: 6 }}>
                  {dayBookings.length === 0 ? (
                    <div style={{ fontSize: 14, fontWeight: 900, color: BRAND.muted }}>
                      {text.available}
                    </div>
                  ) : (
                    dayBookings.slice(0, 4).map((booking) => {
                      const bookingDate = getEffectiveDate(booking);

                      return (
                        <div
                          key={booking.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            onBooking(booking);
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '52px 1fr auto',
                            gap: 8,
                            alignItems: 'center',
                            borderRadius: 14,
                            border: `1.8px solid ${statusColor(booking.status)}`,
                            background: statusBg(booking.status),
                            padding: '7px 8px',
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 900 }}>
                            {getTimeLabel(bookingDate)}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {booking.masterName}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 900 }}>
                            {money(Number(booking.price || 0))}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: dayBookings.length ? BRAND.softBlue : '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {dayBookings.length}
              </div>
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
  clearedBookingIds,
  dragMove,
  isDragClickBlocked,
  onOpenSlot,
  onBookingPointerDown,
  onBookingPointerMove,
  onBookingPointerUp,
  onBookingPointerCancel,
  onChangeBookingMinute,
  onDone,
  onApprove,
  onReject,
  onClearCancelled,
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
  clearedBookingIds: string[];
  dragMove: DragMoveState | null;
  isDragClickBlocked: () => boolean;
  onOpenSlot: (time: string) => void;
  onBookingPointerDown: (booking: BookingItem, event: ReactPointerEvent<HTMLElement>) => void;
  onBookingPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onBookingPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onBookingPointerCancel: () => void;
  onChangeBookingMinute: (booking: BookingItem, hour: number, minute: number) => void;
  onDone: (booking: BookingItem) => void;
  onApprove: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
  onClearCancelled: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
  onDetails: (booking: BookingItem) => void;
  onNote: (booking: BookingItem) => void;
}) {
  const baseHours = Array.from(
    { length: 20 },
    (_, index) => `${String(index + 5).padStart(2, '0')}:00`
  );
  const bookingTimes = bookings
    .map((booking) => getEffectiveDate(booking))
    .filter((date): date is Date => Boolean(date))
    .filter((date) => isSameDay(date, activeDate))
    .map((date) => getTimeLabel(date));

  const times = [...new Set([...baseHours, ...extraTimes, ...bookingTimes])].sort();

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {times.map((time) => {
        const timeBookings = bookings.filter((booking) => {
          const date = getEffectiveDate(booking);
          return date ? isSameDay(date, activeDate) && getTimeLabel(date) === time : false;
        });

        if (timeBookings.length === 0 && !showFreeWindows) return null;

        if (timeBookings.length === 0) {
          return (
            <FreeSlotRow
              key={time}
              time={time}
              text={text}
              onOpenSlot={() => onOpenSlot(time)}
            />
          );
        }

        return timeBookings.map((booking) => {
          const date = getEffectiveDate(booking);
          const minute = date?.getMinutes() || 0;

          return (
            <NotebookBookingRow
              key={`${booking.id}-${getTimeLabel(date)}`}
              booking={booking}
              date={date}
              text={text}
              cleared={clearedBookingIds.includes(booking.id)}
              isMoving={dragMove?.active && dragMove.bookingId === booking.id}
              isMoveMode={Boolean(dragMove?.active)}
              isDragClickBlocked={isDragClickBlocked}
              onPointerDown={(event) => onBookingPointerDown(booking, event)}
              onPointerMove={onBookingPointerMove}
              onPointerUp={onBookingPointerUp}
              onPointerCancel={onBookingPointerCancel}
              onMinute={() => onChangeBookingMinute(booking, date?.getHours() || 0, minute)}
              onDone={() => onDone(booking)}
              onApprove={() => onApprove(booking)}
              onReject={() => onReject(booking)}
              onClearCancelled={() => onClearCancelled(booking)}
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
  cleared,
  isMoving,
  isMoveMode,
  isDragClickBlocked,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onMinute,
  onDone,
  onApprove,
  onReject,
  onClearCancelled,
  onChat,
  onDetails,
  onNote,
}: {
  booking: BookingItem;
  date: Date | null;
  text: PageText;
  cleared: boolean;
  isMoving: boolean;
  isMoveMode: boolean;
  isDragClickBlocked: () => boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onMinute: () => void;
  onDone: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClearCancelled: () => void;
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
      data-booking-drop-id={!done && !cancelled ? booking.id : undefined}
      onPointerDown={!done && !cancelled ? onPointerDown : undefined}
      onPointerMove={!done && !cancelled ? onPointerMove : undefined}
      onPointerUp={!done && !cancelled ? onPointerUp : undefined}
      onPointerCancel={!done && !cancelled ? onPointerCancel : undefined}
      onContextMenu={(event) => {
        if (!done && !cancelled) event.preventDefault();
      }}
      onClick={() => {
        if (isMoveMode || isDragClickBlocked()) return;
        onDetails();
      }}
      style={{
        position: 'relative',
        minHeight: cancelled ? 96 : 116,
        borderRadius: 22,
        border: isMoving
          ? `4px solid ${BRAND.border}`
          : `2px solid ${cancelled ? '#f3a9bb' : '#d8e3dd'}`,
        outline: isMoving ? `2px solid #ffffff` : 'none',
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 47%, #ffe3ea 48%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '104px minmax(0, 1fr) 64px 34px',
        gap: 7,
        alignItems: 'center',
        padding: '10px 9px 10px 0',
        overflow: 'hidden',
        boxShadow: isMoving
          ? '0 16px 34px rgba(0,0,0,0.18)'
          : '0 7px 18px rgba(7,27,70,0.05)',
        cursor: done || cancelled ? 'pointer' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: done || cancelled ? 'manipulation' : 'none',
        opacity: isMoving ? 0.82 : 1,
        transform: isMoving ? 'scale(1.01)' : 'none',
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
        data-no-drag="true"
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
          {cancelled ? booking.masterName || text.unavailable : booking.masterName}
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
          {booking.serviceName || text.service}
        </div>

        {cancelled ? (
          <div
            data-no-drag="true"
            onClick={(event) => event.stopPropagation()}
            style={{
              marginTop: 7,
              display: 'flex',
              gap: 7,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <MiniPill label={text.cancelled} color={BRAND.red} bg="#ffffff" />

            {cleared ? (
              <MiniPill label={text.clearedFromSchedule} color={BRAND.muted} bg="#ffffff" />
            ) : (
              <button type="button" onClick={onClearCancelled} style={smallRedButtonStyle}>
                × {text.clearSlot}
              </button>
            )}
          </div>
        ) : (
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
              data-no-drag="true"
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
        )}
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
        data-no-drag="true"
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
  onOpenSlot,
}: {
  time: string;
  text: PageText;
  onOpenSlot: () => void;
}) {
  return (
    <article
      data-drop-slot={time}
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
        <button type="button" onClick={onOpenSlot} style={timePlusButtonStyle}>
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

function DragGhost({
  booking,
  text,
  x,
  y,
}: {
  booking: BookingItem;
  text: PageText;
  x: number;
  y: number;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 500,
        width: 245,
        minHeight: 78,
        borderRadius: 22,
        border: `4px solid ${BRAND.border}`,
        background: statusBg(booking.status),
        boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
        pointerEvents: 'none',
        padding: 12,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: BRAND.navy,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {booking.masterName}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: 900,
            color: BRAND.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {booking.serviceName || text.service}
        </div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, color: statusColor(booking.status) }}>
        {money(Number(booking.price || 0))}
      </div>
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

const yearWheelStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  padding: '2px 0 10px',
};

const yearWheelButtonStyle: CSSProperties = {
  flexShrink: 0,
  minWidth: 92,
  minHeight: 52,
  borderRadius: 18,
  border: `2.5px solid ${BRAND.border}`,
  fontSize: 20,
  fontWeight: 900,
  cursor: 'pointer',
};

const monthsGridStyle: CSSProperties = {
  marginTop: 8,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
};

const twoColStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 9,
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

const manualFormStyle: CSSProperties = {
  borderRadius: 20,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.softGreen,
  padding: 12,
  display: 'grid',
  gap: 10,
};

const slotActionButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 58,
  borderRadius: 18,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  display: 'grid',
  gridTemplateColumns: '34px 1fr 28px',
  gap: 8,
  alignItems: 'center',
  padding: '0 12px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 15,
};

const slotUnavailableButtonStyle: CSSProperties = {
  ...slotActionButtonStyle,
  border: `2.5px solid ${BRAND.red}`,
  background: BRAND.softRed,
};

const slotBreakButtonStyle: CSSProperties = {
  ...slotActionButtonStyle,
  border: `2.5px solid ${BRAND.orange}`,
  background: '#fff0da',
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

const weekAgendaStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 13,
};

const weekDayAgendaStyle: CSSProperties = {
  width: '100%',
  minHeight: 92,
  borderRadius: 22,
  border: `2.2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 12,
  display: 'grid',
  gridTemplateColumns: '1fr 48px',
  gap: 10,
  alignItems: 'center',
  cursor: 'pointer',
  textAlign: 'left',
};

const dragCancelButtonStyle: CSSProperties = {
  position: 'fixed',
  right: 18,
  top: 'calc(18px + env(safe-area-inset-top))',
  zIndex: 520,
  width: 64,
  height: 64,
  borderRadius: 999,
  border: `4px solid ${BRAND.border}`,
  background: BRAND.red,
  color: '#ffffff',
  fontSize: 36,
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
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
  maxHeight: '88vh',
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
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 25,
  fontWeight: 900,
  color: BRAND.navy,
};
