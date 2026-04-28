'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import { getOrCreateChatThread } from '../../../services/chatStore';
import {
  getBookings,
  subscribeToBookingsStore,
  updateBookingStatus,
  patchBooking,
  confirmBookingByMaster,
  declineBookingByMaster,
  getPublicBookingLocation,
  getVisibleBookingLocation,
  getProtectedBookingContact,
  canShowExactAddress,
  canShowDirectContacts,
  type BookingItem,
} from '../../../services/bookingsStore';

type ViewMode = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type CalendarMode = 'month' | 'week' | 'day' | 'list';
type PaymentFilter = 'all' | 'paid' | 'unpaid';
type HistoryFilter =
  | 'all'
  | 'done'
  | 'waiting'
  | 'confirmed'
  | 'declinedByMe'
  | 'declinedByClient';

type TimePickerTarget =
  | {
      type: 'booking';
      bookingId: string;
      fixedHour: number;
      currentMinute: number;
    }
  | {
      type: 'slot';
      fixedHour: number;
      currentMinute: number;
    }
  | null;

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
  dateRange: string;
  from: string;
  to: string;
  surname: string;
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
  status: string;
  repeatClient: string;
  specialNote: string;
  addCustomTime: string;
  changeMinutes: string;
  fixedHour: string;
  newTime: string;
  clientCard: string;
  contactLocked: string;
  contactLockedText: string;
  fullInfoOpen: string;
  confirm: string;
  decline: string;
  declinedByMe: string;
  declinedByClient: string;
  paymentMethod: string;
  cash: string;
  card: string;
  appPay: string;
  phonePay: string;
  addClient: string;
  blockTime: string;
  clientName: string;
  service: string;
  address: string;
  phone: string;
  email: string;
  save: string;
  createManualBooking: string;
  closeTime: string;
  chatAllowed: string;
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
    dateRange: 'Date range',
    from: 'From',
    to: 'To',
    surname: 'Client name',
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
    status: 'Status',
    repeatClient: 'Regular client',
    specialNote: 'Special note',
    addCustomTime: 'Add custom time',
    changeMinutes: 'Change minutes',
    fixedHour: 'Hour fixed',
    newTime: 'New time',
    clientCard: 'Client card',
    contactLocked: 'Contacts locked',
    contactLockedText:
      'Chat and photos are allowed before confirmation. Phone, exact address and contact details open only after confirmation.',
    fullInfoOpen: 'Full client information is open',
    confirm: 'Confirm',
    decline: 'Decline',
    declinedByMe: 'Declined by me',
    declinedByClient: 'Declined by client',
    paymentMethod: 'Payment method',
    cash: 'Cash',
    card: 'Card',
    appPay: 'App',
    phonePay: 'Phone',
    addClient: 'Add client',
    blockTime: 'Block time',
    clientName: 'Client name',
    service: 'Service',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    save: 'Save',
    createManualBooking: 'Create manual booking',
    closeTime: 'Close time',
    chatAllowed: 'Chat is available',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Ежедневник, брони, запросы и календарь',
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
    price: 'Цена',
    notes: 'Заметки',
    back: 'Назад',
    close: 'Закрыть',
    active: 'Активные',
    total: 'Всего',
    revenue: 'Доход',
    done: 'Готово',
    dateRange: 'Диапазон дат',
    from: 'От',
    to: 'До',
    surname: 'Имя клиента',
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
    status: 'Статус',
    repeatClient: 'Постоянный клиент',
    specialNote: 'Спец. заметка',
    addCustomTime: 'Добавить своё время',
    changeMinutes: 'Изменить минуты',
    fixedHour: 'Час фиксирован',
    newTime: 'Новое время',
    clientCard: 'Карточка клиента',
    contactLocked: 'Контакты закрыты',
    contactLockedText:
      'До подтверждения можно писать в чат и обмениваться фото. Телефон, точный адрес и контакты открываются только после подтверждения.',
    fullInfoOpen: 'Полная информация о клиенте открыта',
    confirm: 'Подтвердить',
    decline: 'Отклонить',
    declinedByMe: 'Отклонено мной',
    declinedByClient: 'Отклонено клиентом',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Карта',
    appPay: 'В приложении',
    phonePay: 'Телефон',
    addClient: 'Добавить клиента',
    blockTime: 'Закрыть время',
    clientName: 'Имя клиента',
    service: 'Услуга',
    address: 'Адрес',
    phone: 'Телефон',
    email: 'Email',
    save: 'Сохранить',
    createManualBooking: 'Создать запись вручную',
    closeTime: 'Закрыть время',
    chatAllowed: 'Чат доступен',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Щоденник, бронювання, запити та календар',
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
    price: 'Ціна',
    notes: 'Нотатки',
    back: 'Назад',
    close: 'Закрити',
    active: 'Активні',
    total: 'Усього',
    revenue: 'Дохід',
    done: 'Готово',
    dateRange: 'Діапазон дат',
    from: 'Від',
    to: 'До',
    surname: 'Імʼя клієнта',
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
    status: 'Статус',
    repeatClient: 'Постійний клієнт',
    specialNote: 'Спец. нотатка',
    addCustomTime: 'Додати свій час',
    changeMinutes: 'Змінити хвилини',
    fixedHour: 'Година фіксована',
    newTime: 'Новий час',
    clientCard: 'Картка клієнта',
    contactLocked: 'Контакти закриті',
    contactLockedText:
      'До підтвердження можна писати в чат і обмінюватися фото. Телефон, точна адреса і контакти відкриваються тільки після підтвердження.',
    fullInfoOpen: 'Повна інформація про клієнта відкрита',
    confirm: 'Підтвердити',
    decline: 'Відхилити',
    declinedByMe: 'Відхилено мною',
    declinedByClient: 'Відхилено клієнтом',
    paymentMethod: 'Спосіб оплати',
    cash: 'Готівка',
    card: 'Карта',
    appPay: 'У застосунку',
    phonePay: 'Телефон',
    addClient: 'Додати клієнта',
    blockTime: 'Закрити час',
    clientName: 'Імʼя клієнта',
    service: 'Послуга',
    address: 'Адреса',
    phone: 'Телефон',
    email: 'Email',
    save: 'Зберегти',
    createManualBooking: 'Створити запис вручну',
    closeTime: 'Закрити час',
    chatAllowed: 'Чат доступний',
  },
};

const clientRepeatCount: Record<string, number> = {
  'Lucie Hlavová': 4,
  'Janička Andělová': 2,
  'Klára Nováková': 1,
  'Lenka Bohatová': 5,
  'Barbora Bendová': 3,
  'Sophie Williams': 4,
  'Emily Carter': 3,
};

const paymentIcons: Record<string, string> = {
  cash: '💷',
  card: '💳',
  app: '📲',
  phone: '📱',
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
  return date.toISOString().slice(0, 10);
}

function fromInputDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return startOfDay(new Date());
  return date;
}

function getHourLabel(hour: number) {
  if (hour === 24) return '24:00';
  return `${String(hour).padStart(2, '0')}:00`;
}

function getTimeLabelFromDate(date: Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getTimeLabel(booking: BookingItem) {
  return getTimeLabelFromDate(getBookingDate(booking));
}

function getDateTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getFullDateTitle(date: Date, language: AppLanguage) {
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

function statusLabel(booking: BookingItem, text: PageText) {
  if (booking.status === 'completed') return text.completed;
  if (booking.status === 'pending') return text.waiting;
  if (booking.status === 'cancelled') {
    if (String(booking.category || '').includes('declined_by_client')) {
      return text.declinedByClient;
    }
    return text.declinedByMe;
  }
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

function getPaymentMethod(booking: BookingItem) {
  const note = String(booking.category || '').toLowerCase();

  if (note.includes('cash')) return 'cash';
  if (note.includes('phone')) return 'phone';
  if (note.includes('app')) return 'app';
  if (note.includes('card')) return 'card';

  const index = Math.abs(
    String(booking.id || '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  );

  return ['card', 'cash', 'app', 'phone'][index % 4];
}

function getBookingNote(booking: BookingItem) {
  const raw = String(booking.category || '');
  return raw
    .replace('payment:cash', '')
    .replace('payment:card', '')
    .replace('payment:app', '')
    .replace('payment:phone', '')
    .replace('declined_by_me', '')
    .replace('declined_by_client', '')
    .trim();
}

function isHistoryMatch(booking: BookingItem, filter: HistoryFilter) {
  if (filter === 'all') return true;
  if (filter === 'done') return booking.status === 'completed';
  if (filter === 'waiting') return booking.status === 'pending';
  if (filter === 'confirmed') return booking.status === 'upcoming';
  if (filter === 'declinedByMe') {
    return booking.status === 'cancelled' && !String(booking.category || '').includes('declined_by_client');
  }
  if (filter === 'declinedByClient') {
    return booking.status === 'cancelled' && String(booking.category || '').includes('declined_by_client');
  }
  return true;
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
  note: string,
  payment: 'cash' | 'card' | 'app' | 'phone' = 'card'
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
    category: `${note} payment:${payment}`,
  } as BookingItem;
}

function createDemoBookings(baseDate: Date): BookingItem[] {
  const today = startOfDay(baseDate);
  const tomorrow = addDays(today, 1);

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
      'чёлка короче',
      'card'
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
      'готово',
      'cash'
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
      'частично / отменено declined_by_client',
      'phone'
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
      'холодный блонд',
      'app'
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
      'новые пряди',
      'cash'
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
      'ждёт подтверждения',
      'card'
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
      'вечерний макияж',
      'phone'
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rangeFrom, setRangeFrom] = useState(() => toInputDate(startOfDay(new Date())));
  const [rangeTo, setRangeTo] = useState(() => toInputDate(startOfDay(new Date())));
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);
  const [manualTargetHour, setManualTargetHour] = useState<number | null>(null);
  const [manualClientName, setManualClientName] = useState('');
  const [manualService, setManualService] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNote, setManualNote] = useState('');

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

  const filteredBookings = useMemo(() => {
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
        const week = getWeekDates(selectedDate);
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? week.some((item) => isSameDay(item, date)) : false;
        });
      }

      if (calendarMode === 'day' || calendarMode === 'list') {
        source = source.filter((booking) => {
          const date = getBookingDate(booking);
          return date ? isSameDay(date, selectedDate) : false;
        });
      }
    }

    if (viewMode === 'requests') {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (viewMode === 'history') {
      source = source.filter((booking) => isHistoryMatch(booking, historyFilter));
    }

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    if (filtersOpen) {
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? date >= from && date <= toEnd : false;
      });
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
      const left = getBookingDate(a)?.getTime() || 0;
      const right = getBookingDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [
    bookings,
    calendarDate,
    calendarMode,
    filtersOpen,
    historyFilter,
    maxPrice,
    minPrice,
    nameFilter,
    paymentFilter,
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
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length;
  const totalRevenue = bookings
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

    if (mode === 'calendar') {
      setCalendarMode('month');
      setHistoryFilter('all');
    }

    if (mode === 'requests') {
      setCalendarMode('list');
      setHistoryFilter('waiting');
    }

    if (mode === 'history') {
      setCalendarMode('list');
      setHistoryFilter('all');
    }
  };

  const syncLocalBooking = (bookingId: string, patch: Partial<BookingItem>) => {
    setBookings((prev) =>
      prev.map((item) => (item.id === bookingId ? ({ ...item, ...patch } as BookingItem) : item))
    );
  };

  const markDone = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'completed');
    syncLocalBooking(booking.id, { status: 'completed' });
  };

  const confirmBooking = (booking: BookingItem) => {
    confirmBookingByMaster(booking.id);
    syncLocalBooking(booking.id, {
      status: 'upcoming',
      bookingConfirmedByMaster: true,
      promotionPaidByMaster: true,
    });
    setSelectedBooking(null);
  };

  const declineBooking = (booking: BookingItem) => {
    declineBookingByMaster(booking.id);
    syncLocalBooking(booking.id, {
      status: 'cancelled',
      category: `${booking.category || ''} declined_by_me`,
      bookingConfirmedByMaster: false,
      promotionPaidByMaster: false,
    });
    setSelectedBooking(null);
  };

  const openChat = (booking: BookingItem) => {
    const thread = getOrCreateChatThread({
      threadId: `client-booking-${booking.id}`,
      providerName: booking.masterName || text.clientName,
      providerAvatar:
        booking.masterAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      category: booking.serviceName || 'Booking',
      online: true,
      lastSeenText: text.chatAllowed,
    });

    router.push(`/messages/${encodeURIComponent(thread.id)}`);
  };

  const resetFilters = () => {
    setNameFilter('');
    setPaymentFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setRangeFrom(toInputDate(activeDate));
    setRangeTo(toInputDate(activeDate));
    setHistoryFilter('all');
  };

  const applyMinuteChange = (minute: number) => {
    if (!timePickerTarget) return;

    if (timePickerTarget.type === 'booking') {
      const booking = bookings.find((item) => item.id === timePickerTarget.bookingId);
      if (!booking) {
        setTimePickerTarget(null);
        return;
      }

      const currentDate = getBookingDate(booking) || activeDate;
      const nextDate = new Date(currentDate);
      nextDate.setHours(timePickerTarget.fixedHour, minute, 0, 0);

      patchBooking(booking.id, {
        dateTime: nextDate.toISOString(),
        dateLabel: `${String(timePickerTarget.fixedHour).padStart(2, '0')}:${String(minute).padStart(
          2,
          '0'
        )}`,
      });

      syncLocalBooking(booking.id, {
        dateTime: nextDate.toISOString(),
        dateLabel: `${String(timePickerTarget.fixedHour).padStart(2, '0')}:${String(minute).padStart(
          2,
          '0'
        )}`,
      });
    }

    setTimePickerTarget(null);
  };

  const addManualBooking = (asBlocked: boolean) => {
    if (manualTargetHour === null) return;

    const date = new Date(activeDate);
    date.setHours(manualTargetHour, 0, 0, 0);

    const id = `manual-${Date.now()}`;
    const next: BookingItem = {
      id,
      masterId: id,
      masterName: asBlocked ? text.unavailable : manualClientName.trim() || text.clientName,
      masterAvatar: '',
      serviceName: asBlocked ? text.available : manualService.trim() || text.service,
      price: asBlocked ? 0 : Number(manualPrice || 0),
      status: asBlocked ? 'cancelled' : 'upcoming',
      dateTime: date.toISOString(),
      dateLabel: getTimeLabelFromDate(date),
      location: manualAddress.trim() || 'London',
      areaLabel: manualAddress.trim() || 'London',
      exactAddress: manualAddress.trim() || 'London',
      unlockFeePaid: !asBlocked,
      clientPaid: !asBlocked,
      paymentReceivedByPlatform: !asBlocked,
      bookingConfirmedByMaster: !asBlocked,
      promotionPaidByMaster: !asBlocked,
      contactPhone: '+44 7700 123456',
      contactEmail: 'client@olamep.com',
      category: `${manualNote.trim()} payment:cash ${asBlocked ? 'declined_by_me' : ''}`,
    };

    setBookings((prev) => [next, ...prev]);
    setManualTargetHour(null);
    setManualClientName('');
    setManualService('');
    setManualPrice('');
    setManualAddress('');
    setManualNote('');
  };

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
        <header style={pageHeaderStyle}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <StatBox title={text.active} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title={text.total} value={String(bookings.length)} bg={BRAND.softBlue} />
            <StatBox title={text.revenue} value={money(totalRevenue)} bg={BRAND.softOrange} />
            <StatBox title={text.done} value={String(completedCount)} bg={BRAND.softViolet} />
          </div>
        </section>

        <section style={compactCalendarPanelStyle}>
          <div style={dateLineStyle}>
            <button
              type="button"
              onClick={() => {
                const next = addDays(activeDate, -1);
                setSelectedDate(next);
                setCalendarDate(next);
                setViewMode('calendar');
                setCalendarMode('day');
              }}
              style={smallCircleStyle}
            >
              ‹
            </button>

            <div style={{ textAlign: 'center', minWidth: 0 }}>
              <div style={dateTitleStyle}>{getDateTitle(activeDate, language)}</div>
              <div style={dateSubTitleStyle}>
                {filteredBookings.length} {text.bookings} · {getMonthTitle(calendarDate, language)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = addDays(activeDate, 1);
                setSelectedDate(next);
                setCalendarDate(next);
                setViewMode('calendar');
                setCalendarMode('day');
              }}
              style={smallCircleStyle}
            >
              ›
            </button>
          </div>

          <div style={filterActionsRowStyle}>
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              style={{
                ...filterChipStyle,
                background: filtersOpen ? BRAND.navy : '#ffffff',
                color: filtersOpen ? '#ffffff' : BRAND.navy,
              }}
            >
              ☰ {text.filters}
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

          {filtersOpen ? (
            <div style={filtersBoxStyle}>
              <div style={filtersGridStyle}>
                <label style={fieldLabelStyle}>
                  <span>Year</span>
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
                  <span>Month</span>
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
                    setFiltersOpen(false);
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
                  }}
                />
              ) : null}

              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
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

              {viewMode === 'history' ? (
                <div style={historyFiltersStyle}>
                  {([
                    ['all', text.history],
                    ['done', text.completed],
                    ['waiting', text.waiting],
                    ['confirmed', text.confirmed],
                    ['declinedByMe', text.declinedByMe],
                    ['declinedByClient', text.declinedByClient],
                  ] as const).map(([filter, label]) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setHistoryFilter(filter)}
                      style={{
                        ...smallPillButtonStyle,
                        background: historyFilter === filter ? BRAND.navy : '#ffffff',
                        color: historyFilter === filter ? '#ffffff' : BRAND.navy,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={resetFilters} style={plainButtonStyle}>
                  {text.reset}
                </button>
                <button type="button" onClick={() => setFiltersOpen(false)} style={darkButtonStyle}>
                  {text.apply}
                </button>
              </div>
            </div>
          ) : null}

          <div style={legendStyle}>
            <LegendDot color={BRAND.blue} label={text.completed} />
            <LegendDot color={BRAND.green} label={text.confirmed} />
            <LegendDot color={BRAND.red} label={text.unavailable} />
            <LegendDot color={BRAND.yellow} label={text.waiting} />
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() =>
              setTimePickerTarget({
                type: 'slot',
                fixedHour: 4,
                currentMinute: 25,
              })
            }
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
            onDone={markDone}
            onChat={openChat}
            onConfirm={confirmBooking}
            onDecline={declineBooking}
            onOpenCard={setSelectedBooking}
            onOpenTimePicker={(booking) => {
              const date = getBookingDate(booking) || activeDate;
              setTimePickerTarget({
                type: 'booking',
                bookingId: booking.id,
                fixedHour: date.getHours(),
                currentMinute: date.getMinutes(),
              });
            }}
            onManual={(hour) => setManualTargetHour(hour)}
          />

          <button
            type="button"
            onClick={() =>
              setTimePickerTarget({
                type: 'slot',
                fixedHour: 24,
                currentMinute: 0,
              })
            }
            style={{ ...addTimeButtonStyle, marginTop: 12 }}
          >
            {text.addAfter}
          </button>
        </section>
      </div>

      <BottomNav active="clients" />

      {selectedBooking ? (
        <ClientCardModal
          booking={selectedBooking}
          text={text}
          language={language}
          onClose={() => setSelectedBooking(null)}
          onChat={() => openChat(selectedBooking)}
          onConfirm={() => confirmBooking(selectedBooking)}
          onDecline={() => declineBooking(selectedBooking)}
          onDone={() => markDone(selectedBooking)}
        />
      ) : null}

      {timePickerTarget ? (
        <MinutePickerModal
          text={text}
          target={timePickerTarget}
          onClose={() => setTimePickerTarget(null)}
          onApply={applyMinuteChange}
        />
      ) : null}

      {manualTargetHour !== null ? (
        <ManualBookingModal
          text={text}
          hour={manualTargetHour}
          clientName={manualClientName}
          service={manualService}
          price={manualPrice}
          address={manualAddress}
          note={manualNote}
          onClientName={setManualClientName}
          onService={setManualService}
          onPrice={setManualPrice}
          onAddress={setManualAddress}
          onNote={setManualNote}
          onClose={() => setManualTargetHour(null)}
          onSave={() => addManualBooking(false)}
          onBlock={() => addManualBooking(true)}
        />
      ) : null}
    </main>
  );
}

function NotebookSchedule({
  text,
  bookings,
  activeDate,
  showFreeWindows,
  onDone,
  onChat,
  onConfirm,
  onDecline,
  onOpenCard,
  onOpenTimePicker,
  onManual,
}: {
  text: PageText;
  bookings: BookingItem[];
  activeDate: Date;
  showFreeWindows: boolean;
  onDone: (booking: BookingItem) => void;
  onChat: (booking: BookingItem) => void;
  onConfirm: (booking: BookingItem) => void;
  onDecline: (booking: BookingItem) => void;
  onOpenCard: (booking: BookingItem) => void;
  onOpenTimePicker: (booking: BookingItem) => void;
  onManual: (hour: number) => void;
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
          return <FreeSlotRow key={hour} hour={hour} text={text} onManual={() => onManual(hour)} />;
        }

        return hourBookings.map((booking) => (
          <NotebookBookingRow
            key={booking.id}
            booking={booking}
            text={text}
            onDone={() => onDone(booking)}
            onChat={() => onChat(booking)}
            onConfirm={() => onConfirm(booking)}
            onDecline={() => onDecline(booking)}
            onOpenCard={() => onOpenCard(booking)}
            onOpenTimePicker={() => onOpenTimePicker(booking)}
          />
        ));
      })}
    </div>
  );
}

function NotebookBookingRow({
  booking,
  text,
  onDone,
  onChat,
  onConfirm,
  onDecline,
  onOpenCard,
  onOpenTimePicker,
}: {
  booking: BookingItem;
  text: PageText;
  onDone: () => void;
  onChat: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onOpenCard: () => void;
  onOpenTimePicker: () => void;
}) {
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const repeat = clientRepeatCount[booking.masterName] || 1;
  const unlocked = isUnlocked(booking);
  const location = unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking);
  const paymentMethod = getPaymentMethod(booking);

  return (
    <article
      draggable
      title="Long press / drag to move time"
      style={{
        position: 'relative',
        minHeight: cancelled ? 78 : 118,
        borderRadius: 20,
        border: `2px solid ${cancelled ? '#f4b3c2' : '#d7e2dc'}`,
        background: cancelled
          ? 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffe3ea 49%, #ffe3ea 100%)'
          : bg,
        display: 'grid',
        gridTemplateColumns: '74px minmax(0, 1fr) 62px 32px',
        gap: 8,
        alignItems: 'center',
        padding: '8px 9px 8px 0',
        overflow: 'hidden',
        boxShadow: '0 7px 18px rgba(7,27,70,0.045)',
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

      {done ? (
        <div style={doneCheckStyle}>✓</div>
      ) : null}

      <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
        <button type="button" onClick={onOpenTimePicker} style={timePlusButtonStyle}>
          +
        </button>

        <button
          type="button"
          onClick={onOpenTimePicker}
          style={{
            background: 'transparent',
            border: 'none',
            color: BRAND.navy,
            fontSize: 25,
            lineHeight: 1,
            fontWeight: 900,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {getTimeLabel(booking)}
        </button>
      </div>

      <button type="button" onClick={onOpenCard} style={bookingMainButtonStyle}>
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
          {repeat >= 3 && !cancelled ? (
            <span title={text.repeatClient} style={{ marginLeft: 4, color: BRAND.orange }}>
              ★
            </span>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 13,
            lineHeight: 1.1,
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
              <MiniPill label={statusLabel(booking, text)} color={color} bg="#ffffff" />
              <MiniPill
                label={isPaid(booking) ? 'Deposit paid' : 'Deposit waiting'}
                color={isPaid(booking) ? '#008f3a' : '#b87500'}
                bg={isPaid(booking) ? BRAND.softGreen : BRAND.softYellow}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11.5,
                fontWeight: 900,
                color: BRAND.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                filter: unlocked ? 'none' : 'blur(2.2px)',
              }}
            >
              📍 {location || 'London'}
            </div>

            <div style={{ marginTop: 7, display: 'flex', gap: 7 }}>
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
                    onOpenCard();
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
          </>
        ) : null}
      </button>

      <div style={{ display: 'grid', justifyItems: 'end', gap: 5 }}>
        {!cancelled ? (
          <div style={{ fontSize: 18, lineHeight: 1 }}>
            {paymentIcons[paymentMethod] || '💳'}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 23,
            lineHeight: 1,
            fontWeight: 900,
            color: cancelled ? BRAND.red : color === BRAND.yellow ? BRAND.orange : color,
            textAlign: 'right',
          }}
        >
          {money(Number(booking.price || 0))}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCard}
        aria-label={text.notes}
        style={{
          width: 30,
          height: 38,
          borderRadius: 10,
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

function FreeSlotRow({ hour, text, onManual }: { hour: number; text: PageText; onManual: () => void }) {
  return (
    <article
      style={{
        minHeight: 62,
        borderRadius: 20,
        border: '2px dashed #d7dce4',
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '74px 98px minmax(0, 1fr)',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      <button type="button" onClick={onManual} style={timePlusButtonStyle}>
        +
      </button>

      <div style={{ fontSize: 25, fontWeight: 900, color: '#a1a8b4' }}>{getHourLabel(hour)}</div>

      <button
        type="button"
        onClick={onManual}
        style={{
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          fontSize: 17,
          fontWeight: 900,
          color: BRAND.muted,
          cursor: 'pointer',
        }}
      >
        {text.available}
      </button>
    </article>
  );
}

function ClientCardModal({
  booking,
  text,
  language,
  onClose,
  onChat,
  onConfirm,
  onDecline,
  onDone,
}: {
  booking: BookingItem;
  text: PageText;
  language: AppLanguage;
  onClose: () => void;
  onChat: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onDone: () => void;
}) {
  const unlocked = isUnlocked(booking);
  const contacts = getProtectedBookingContact(booking);
  const note = getBookingNote(booking);
  const paymentMethod = getPaymentMethod(booking);
  const date = getBookingDate(booking);
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={clientCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={avatarStyle}>{booking.masterName.slice(0, 1).toUpperCase()}</div>

          <h2 style={{ margin: '10px 0 0', fontSize: 25, fontWeight: 900, color: BRAND.navy }}>
            {text.clientCard}
          </h2>

          <div style={{ marginTop: 5, fontSize: 20, fontWeight: 900, color: BRAND.navy }}>
            {booking.masterName}
          </div>

          <div style={{ marginTop: 4, fontSize: 14, fontWeight: 800, color: BRAND.muted }}>
            {booking.serviceName}
          </div>

          <div style={{ marginTop: 9, fontSize: 30, fontWeight: 900, color: statusColor(booking) }}>
            {money(Number(booking.price || 0))}
          </div>
        </div>

        <div style={infoBoxStyle}>
          <InfoLine label={text.time} value={date ? getFullDateTitle(date, language) : '—'} />
          <InfoLine label={text.status} value={statusLabel(booking, text)} />
          <InfoLine
            label={text.paymentMethod}
            value={`${paymentIcons[paymentMethod] || '💳'} ${
              paymentMethod === 'cash'
                ? text.cash
                : paymentMethod === 'app'
                ? text.appPay
                : paymentMethod === 'phone'
                ? text.phonePay
                : text.card
            }`}
          />
          <InfoLine
            label={text.address}
            value={unlocked ? getVisibleBookingLocation(booking) : getPublicBookingLocation(booking)}
            locked={!unlocked}
          />
          <InfoLine label={text.phone} value={contacts.phone || text.contactLocked} locked={!unlocked} />
          <InfoLine label={text.email} value={contacts.email || text.contactLocked} locked={!unlocked} />
        </div>

        {!unlocked && !cancelled ? (
          <div style={lockedInfoStyle}>
            <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.navy }}>🔒 {text.contactLocked}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.contactLockedText}
            </div>
          </div>
        ) : null}

        {unlocked && !cancelled ? (
          <div style={openInfoStyle}>✓ {text.fullInfoOpen}</div>
        ) : null}

        {note ? (
          <div style={noteBoxStyle}>
            <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>{text.specialNote}</div>
            <div style={{ marginTop: 5, fontSize: 15, lineHeight: 1.35, fontWeight: 900, color: BRAND.navy }}>
              {note}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <button type="button" onClick={onChat} style={plainButtonStyle}>
            💬 {text.openChat}
          </button>

          {pending ? (
            <button type="button" onClick={onConfirm} style={greenWideButtonStyle}>
              ✓ {text.confirm}
            </button>
          ) : booking.status === 'completed' || cancelled ? (
            <button type="button" onClick={onClose} style={darkButtonStyle}>
              {text.close}
            </button>
          ) : (
            <button type="button" onClick={onDone} style={greenWideButtonStyle}>
              ✓ {text.markDone}
            </button>
          )}
        </div>

        {pending ? (
          <button type="button" onClick={onDecline} style={{ ...redWideButtonStyle, marginTop: 9 }}>
            × {text.decline}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MinutePickerModal({
  text,
  target,
  onClose,
  onApply,
}: {
  text: PageText;
  target: NonNullable<TimePickerTarget>;
  onClose: () => void;
  onApply: (minute: number) => void;
}) {
  const [minute, setMinute] = useState(target.currentMinute);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: BRAND.navy }}>
          {text.changeMinutes}
        </h2>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              minHeight: 112,
              borderRadius: 22,
              border: `2px solid ${BRAND.border}`,
              background: BRAND.softGreen,
              display: 'grid',
              alignContent: 'center',
              justifyItems: 'center',
              color: '#008f3a',
            }}
          >
            <div style={{ fontSize: 42, fontWeight: 900 }}>{String(target.fixedHour).padStart(2, '0')}</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 900 }}>{text.fixedHour}</div>
          </div>

          <label style={fieldLabelStyle}>
            <span>Minute</span>
            <select
              value={minute}
              onChange={(event) => setMinute(Number(event.target.value))}
              style={{
                ...inputStyle,
                minHeight: 62,
                fontSize: 28,
                textAlign: 'center',
              }}
            >
              {Array.from({ length: 60 }, (_, index) => (
                <option key={index} value={index}>
                  {String(index).padStart(2, '0')}
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
          {text.newTime}: {String(target.fixedHour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </div>

        <button type="button" onClick={() => onApply(minute)} style={{ ...darkButtonStyle, marginTop: 14 }}>
          {text.apply}
        </button>
      </div>
    </div>
  );
}

function ManualBookingModal({
  text,
  hour,
  clientName,
  service,
  price,
  address,
  note,
  onClientName,
  onService,
  onPrice,
  onAddress,
  onNote,
  onClose,
  onSave,
  onBlock,
}: {
  text: PageText;
  hour: number;
  clientName: string;
  service: string;
  price: string;
  address: string;
  note: string;
  onClientName: (value: string) => void;
  onService: (value: string) => void;
  onPrice: (value: string) => void;
  onAddress: (value: string) => void;
  onNote: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onBlock: () => void;
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} style={modalCloseStyle}>
          ×
        </button>

        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: BRAND.navy }}>
          {text.createManualBooking}
        </h2>

        <div
          style={{
            marginTop: 10,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softBlue,
            padding: 12,
            fontSize: 20,
            fontWeight: 900,
            color: BRAND.navy,
          }}
        >
          {getHourLabel(hour)}
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <label style={fieldLabelStyle}>
            <span>{text.clientName}</span>
            <input value={clientName} onChange={(event) => onClientName(event.target.value)} style={inputStyle} />
          </label>

          <label style={fieldLabelStyle}>
            <span>{text.service}</span>
            <input value={service} onChange={(event) => onService(event.target.value)} style={inputStyle} />
          </label>

          <label style={fieldLabelStyle}>
            <span>{text.price}</span>
            <input type="number" value={price} onChange={(event) => onPrice(event.target.value)} style={inputStyle} />
          </label>

          <label style={fieldLabelStyle}>
            <span>{text.address}</span>
            <input value={address} onChange={(event) => onAddress(event.target.value)} style={inputStyle} />
          </label>
        </div>

        <label style={{ ...fieldLabelStyle, marginTop: 9 }}>
          <span>{text.notes}</span>
          <input value={note} onChange={(event) => onNote(event.target.value)} style={inputStyle} />
        </label>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <button type="button" onClick={onBlock} style={redWideButtonStyle}>
            {text.blockTime}
          </button>

          <button type="button" onClick={onSave} style={greenWideButtonStyle}>
            {text.save}
          </button>
        </div>
      </div>
    </div>
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

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div
      style={{
        minHeight: 64,
        borderRadius: 17,
        border: `2px solid ${BRAND.border}`,
        background: bg,
        padding: 9,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div style={{ fontSize: value.length > 4 ? 21 : 25, fontWeight: 900, color: BRAND.navy }}>
        {value}
      </div>
    </div>
  );
}

function MiniPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 23,
        padding: '0 7px',
        borderRadius: 999,
        border: `1.8px solid ${color}`,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10.5,
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

function InfoLine({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: 10,
        padding: '9px 0',
        borderBottom: '1.5px solid #eef0f3',
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
          filter: locked ? 'blur(2.5px)' : 'none',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const pageHeaderStyle: CSSProperties = {
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
};

const compactCalendarPanelStyle: CSSProperties = {
  marginTop: 13,
  borderRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: 13,
  overflow: 'hidden',
};

const dateLineStyle: CSSProperties = {
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
  fontSize: 26,
  fontWeight: 900,
  color: BRAND.navy,
  lineHeight: 1.05,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dateSubTitleStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 900,
  color: BRAND.muted,
};

const filterActionsRowStyle: CSSProperties = {
  marginTop: 12,
  display: 'flex',
  gap: 9,
  overflowX: 'auto',
  paddingBottom: 6,
};

const filterChipStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 44,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  padding: '0 15px',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const filtersBoxStyle: CSSProperties = {
  marginTop: 10,
  borderRadius: 20,
  border: `2px solid ${BRAND.border}`,
  background: '#fffdf8',
  padding: 10,
};

const filtersGridStyle: CSSProperties = {
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

const greenWideButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const redWideButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 17,
  border: `2.5px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
};

const modeButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const smallPillButtonStyle: CSSProperties = {
  flexShrink: 0,
  minHeight: 34,
  borderRadius: 999,
  border: `2px solid ${BRAND.border}`,
  padding: '0 10px',
  fontSize: 11,
  fontWeight: 900,
  cursor: 'pointer',
};

const historyFiltersStyle: CSSProperties = {
  marginTop: 10,
  display: 'flex',
  gap: 7,
  overflowX: 'auto',
  paddingBottom: 2,
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
  gridTemplateColumns: '74px 1fr 62px 32px',
  gap: 8,
  padding: '0 11px 8px',
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
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 900,
  cursor: 'pointer',
};

const doneCheckStyle: CSSProperties = {
  position: 'absolute',
  top: 9,
  left: 25,
  width: 34,
  height: 34,
  borderRadius: 999,
  background: BRAND.green,
  color: '#ffffff',
  border: `2px solid ${BRAND.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  fontWeight: 900,
  zIndex: 2,
};

const bookingMainButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  minWidth: 0,
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
  padding: '0 9px',
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
  padding: '0 9px',
};

const tinyRedButtonStyle: CSSProperties = {
  minHeight: 34,
  width: 38,
  borderRadius: 13,
  border: `2px solid ${BRAND.red}`,
  background: BRAND.softRed,
  color: BRAND.red,
  fontSize: 18,
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
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  border: `2.5px solid ${BRAND.border}`,
  borderBottom: 'none',
  background: '#ffffff',
  padding: '18px 16px calc(22px + env(safe-area-inset-bottom))',
  boxSizing: 'border-box',
};

const clientCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 430,
  maxHeight: '92vh',
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

const avatarStyle: CSSProperties = {
  width: 82,
  height: 82,
  borderRadius: 999,
  border: `2.5px solid ${BRAND.border}`,
  background:
    'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 34,
  fontWeight: 900,
};

const infoBoxStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 20,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  padding: '4px 12px',
};

const lockedInfoStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softYellow,
  padding: 12,
};

const openInfoStyle: CSSProperties = {
  marginTop: 12,
  minHeight: 42,
  borderRadius: 999,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.softGreen,
  color: '#008f3a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 900,
};

const noteBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 18,
  border: `2px solid ${BRAND.border}`,
  background: BRAND.softOrange,
  padding: 12,
};
