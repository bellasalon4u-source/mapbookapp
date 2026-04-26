'use client';

import { useEffect, useMemo, useState } from 'react';
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
  patchBooking,
  confirmBookingByMaster,
  declineBookingByMaster,
  canShowDirectContacts,
  getProtectedBookingContact,
  type BookingItem,
} from '../../services/bookingsStore';
import { getOrCreateChatThread } from '../../../services/chatStore';

type ProviderView = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type SlotStatus = 'free' | 'confirmed' | 'completed' | 'cancelled' | 'blocked' | 'pending';
type ContactMode = 'full' | 'quick';

type FilterKey = 'all' | SlotStatus;
type SortKey = 'time' | 'name' | 'priceAsc' | 'priceDesc' | 'procedure';

type ProviderSlot = {
  id: string;
  time: string;
  duration: string;
  clientName: string;
  clientAvatar?: string;
  serviceName: string;
  price: number;
  status: SlotStatus;
  paymentMethod: 'OlaCash' | 'Card' | 'Cash' | 'Crypto' | 'QR';
  notes: string;
  contactMode: ContactMode;
  sourceBooking?: BookingItem;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactInstagram?: string;
};

type PageText = {
  title: string;
  subtitle: string;
  today: string;
  tomorrow: string;
  requests: string;
  calendar: string;
  history: string;
  activeToday: string;
  requestsCount: string;
  confirmedShort: string;
  completedShort: string;
  search: string;
  daySubtitle: string;
  time: string;
  clientProcedure: string;
  price: string;
  notes: string;
  freeSlot: string;
  unavailable: string;
  clientCard: string;
  procedure: string;
  status: string;
  contacts: string;
  fullContactInfo: string;
  quickContactInfo: string;
  call: string;
  whatsapp: string;
  internalChat: string;
  message: string;
  save: string;
  close: string;
  changeTime: string;
  hour: string;
  minutes: string;
  newTime: string;
  synced: string;
  cancel: string;
  confirmed: string;
  completed: string;
  cancelled: string;
  pending: string;
  blocked: string;
  free: string;
  home: string;
  filters: string;
  alwaysShowFilters: string;
  on: string;
  off: string;
  all: string;
  byTime: string;
  byName: string;
  priceUp: string;
  priceDown: string;
  byProcedure: string;
  priceRange: string;
  from: string;
  to: string;
  apply: string;
  reset: string;
  openPriceFilter: string;
  acceptBooking: string;
  declineBooking: string;
  openChat: string;
  pendingRequestInfo: string;
  confirmedRequestInfo: string;
  noBookings: string;
  calendarPickerTitle: string;
  year: string;
  month: string;
  selectedDay: string;
  clear: string;
  needsAction: string;
};

const EN_TEXT: PageText = {
  title: 'My clients',
  subtitle: 'Bookings, client requests, calendar and fast payments',
  today: 'Today',
  tomorrow: 'Tomorrow',
  requests: 'Requests',
  calendar: 'Calendar',
  history: 'History',
  activeToday: 'Active today',
  requestsCount: 'Requests',
  confirmedShort: 'Confirmed',
  completedShort: 'Done',
  search: 'Search client, service, amount',
  daySubtitle: 'Booking management',
  time: 'Time',
  clientProcedure: 'Client / Procedure',
  price: 'Price',
  notes: 'Notes',
  freeSlot: 'Free slot',
  unavailable: 'Unavailable',
  clientCard: 'Client card',
  procedure: 'Procedure',
  status: 'Status',
  contacts: 'Contacts',
  fullContactInfo:
    'Registered client confirmed by both sides. All client contact methods are available.',
  quickContactInfo:
    'Quick booking. Only internal Olamep chat is available until full registration.',
  call: 'Call',
  whatsapp: 'WhatsApp',
  internalChat: 'Message in chat',
  message: 'Message',
  save: 'Save',
  close: 'Close',
  changeTime: 'Change time',
  hour: 'Hour',
  minutes: 'Minutes',
  newTime: 'New time',
  synced: 'Free · synced',
  cancel: 'Cancel',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending: 'Pending',
  blocked: 'Blocked',
  free: 'Free',
  home: 'Home',
  filters: 'Filters',
  alwaysShowFilters: 'Show filters',
  on: 'ON',
  off: 'OFF',
  all: 'All',
  byTime: 'By time',
  byName: 'By name',
  priceUp: 'Price ↑',
  priceDown: 'Price ↓',
  byProcedure: 'By service',
  priceRange: 'Price range',
  from: 'From',
  to: 'To',
  apply: 'Apply',
  reset: 'Reset',
  openPriceFilter: 'Price range',
  acceptBooking: 'Accept booking',
  declineBooking: 'Decline',
  openChat: 'Open chat',
  pendingRequestInfo:
    'This request is waiting for your confirmation. After accepting, the client will get address/contact access according to booking rules.',
  confirmedRequestInfo:
    'Booking is confirmed. Contacts and chat are available according to access rules.',
  noBookings: 'No bookings for this day',
  calendarPickerTitle: 'Calendar planner',
  year: 'Year',
  month: 'Month',
  selectedDay: 'Selected day',
  clear: 'Clear',
  needsAction: 'Needs action',
};

const textOverrides: Partial<Record<AppLanguage, Partial<PageText>>> = {
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрые расчёты',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    activeToday: 'Активно сегодня',
    requestsCount: 'Запросы',
    confirmedShort: 'Подтверждено',
    completedShort: 'Готово',
    search: 'Поиск: клиент, услуга, сумма',
    daySubtitle: 'Управление бронями',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    price: 'Цена',
    notes: 'Пометки',
    freeSlot: 'Свободное окно',
    unavailable: 'Недоступно',
    clientCard: 'Карта клиента',
    procedure: 'Процедура',
    status: 'Статус',
    contacts: 'Контакты',
    fullContactInfo:
      'Бронь подтверждена. Если клиент оплатил депозит, мастеру доступны разрешённые способы связи.',
    quickContactInfo:
      'Быстрая бронь. До подтверждения доступен только внутренний чат Olamep.',
    call: 'Позвонить',
    whatsapp: 'WhatsApp',
    internalChat: 'Написать в чат',
    message: 'Сообщение',
    save: 'Сохранить',
    close: 'Закрыть',
    changeTime: 'Изменить время',
    hour: 'Час',
    minutes: 'Минуты',
    newTime: 'Новое время',
    synced: 'Свободно · синхронизировано',
    cancel: 'Отмена',
    confirmed: 'Подтверждено',
    completed: 'Готово',
    cancelled: 'Отменено',
    pending: 'Ожидает',
    blocked: 'Недоступно',
    free: 'Свободно',
    home: 'Главная',
    filters: 'Фильтры',
    alwaysShowFilters: 'Показывать фильтры',
    on: 'ВКЛ',
    off: 'ВЫКЛ',
    all: 'Все',
    byTime: 'По времени',
    byName: 'По имени',
    priceUp: 'Цена ↑',
    priceDown: 'Цена ↓',
    byProcedure: 'По процедуре',
    priceRange: 'Диапазон цены',
    from: 'От',
    to: 'До',
    apply: 'Применить',
    reset: 'Сбросить',
    openPriceFilter: 'Цена от/до',
    acceptBooking: 'Подтвердить бронь',
    declineBooking: 'Отклонить',
    openChat: 'Открыть чат',
    pendingRequestInfo:
      'Эта заявка ждёт вашего подтверждения. После подтверждения клиент получит доступ к адресу и контактам по правилам брони.',
    confirmedRequestInfo:
      'Бронь подтверждена. Чат и контакты доступны по правилам доступа.',
    noBookings: 'На этот день броней нет',
    calendarPickerTitle: 'Календарь мастера',
    year: 'Год',
    month: 'Месяц',
    selectedDay: 'Выбранный день',
    clear: 'Чисто',
    needsAction: 'Нужно действие',
  },
};

const serviceTranslations: Record<string, Partial<Record<AppLanguage, string>>> = {
  Маникюр: {
    EN: 'Manicure',
    RU: 'Маникюр',
    UA: 'Манікюр',
    ES: 'Manicura',
    CZ: 'Manikúra',
    DE: 'Maniküre',
    IT: 'Manicure',
    FR: 'Manucure',
    PL: 'Manicure',
    AR: 'مانيكير',
  },
  Стрижка: {
    EN: 'Haircut',
    RU: 'Стрижка волос',
    UA: 'Стрижка',
    ES: 'Corte de pelo',
    CZ: 'Střih vlasů',
    DE: 'Haarschnitt',
    IT: 'Taglio capelli',
    FR: 'Coupe de cheveux',
    PL: 'Strzyżenie',
    AR: 'قص شعر',
  },
  Массаж: {
    EN: 'Massage',
    RU: 'Массаж',
    UA: 'Масаж',
    ES: 'Masaje',
    CZ: 'Masáž',
    DE: 'Massage',
    IT: 'Massaggio',
    FR: 'Massage',
    PL: 'Masaż',
    AR: 'تدليك',
  },
  Визаж: {
    EN: 'Makeup',
    RU: 'Визаж',
    UA: 'Візаж',
    ES: 'Maquillaje',
    CZ: 'Make-up',
    DE: 'Make-up',
    IT: 'Trucco',
    FR: 'Maquillage',
    PL: 'Makijaż',
    AR: 'مكياج',
  },
  'Ремонт телефона': {
    EN: 'Phone repair',
    RU: 'Ремонт телефона',
    UA: 'Ремонт телефону',
    ES: 'Reparación de teléfono',
    CZ: 'Oprava telefonu',
    DE: 'Handy-Reparatur',
    IT: 'Riparazione telefono',
    FR: 'Réparation téléphone',
    PL: 'Naprawa telefonu',
    AR: 'إصلاح الهاتف',
  },
};

const demoAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';

function getTexts(language: AppLanguage): PageText {
  return {
    ...EN_TEXT,
    ...(textOverrides[language] || {}),
  };
}

function translateService(value: string, language: AppLanguage) {
  return serviceTranslations[value]?.[language] || serviceTranslations[value]?.EN || value;
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(0)}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  const left = startOfDay(a);
  const right = startOfDay(b);
  return left.getTime() === right.getTime();
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

function formatDateTitle(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMonthName(monthIndex: number, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
  }).format(new Date(2026, monthIndex, 1));
}

function getShortWeekDays(language: AppLanguage) {
  const base = new Date(2026, 3, 20);
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(getLocale(language), { weekday: 'short' }).format(
      addDays(base, index)
    )
  );
}

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const start = addDays(firstDay, -firstWeekDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function getSlotStatusLabel(status: SlotStatus, text: PageText) {
  if (status === 'confirmed') return text.confirmed;
  if (status === 'completed') return text.completed;
  if (status === 'cancelled') return text.cancelled;
  if (status === 'pending') return text.pending;
  if (status === 'blocked') return text.blocked;
  return text.free;
}

function getFilterLabel(filter: FilterKey, text: PageText) {
  if (filter === 'all') return text.all;
  return getSlotStatusLabel(filter, text);
}

function getSortLabel(sort: SortKey, text: PageText) {
  if (sort === 'time') return text.byTime;
  if (sort === 'name') return text.byName;
  if (sort === 'priceAsc') return text.priceUp;
  if (sort === 'priceDesc') return text.priceDown;
  return text.byProcedure;
}

function getFilterStyle(filter: FilterKey, active: boolean) {
  if (!active) {
    return {
      background: '#ffffff',
      color: '#17130f',
      border: '#111111',
    };
  }

  if (filter === 'confirmed') {
    return {
      background: '#dcffe8',
      color: '#008f3a',
      border: '#24c45a',
    };
  }

  if (filter === 'completed') {
    return {
      background: '#dcecff',
      color: '#0e73d8',
      border: '#0e73d8',
    };
  }

  if (filter === 'cancelled' || filter === 'blocked') {
    return {
      background: '#ffe0e8',
      color: '#ff2456',
      border: '#ff2456',
    };
  }

  if (filter === 'pending') {
    return {
      background: '#fff1bf',
      color: '#b87500',
      border: '#ffbf1f',
    };
  }

  if (filter === 'free') {
    return {
      background: '#f4f4f4',
      color: '#6f675f',
      border: '#cfcfcf',
    };
  }

  return {
    background: '#17130f',
    color: '#ffffff',
    border: '#111111',
  };
}

function getSlotStyle(status: SlotStatus) {
  if (status === 'confirmed') {
    return {
      bg: '#dcffe8',
      border: '#24c45a',
      color: '#008f3a',
      side: '#24c45a',
    };
  }

  if (status === 'completed') {
    return {
      bg: '#dcecff',
      border: '#0e73d8',
      color: '#0e73d8',
      side: '#0e73d8',
    };
  }

  if (status === 'cancelled') {
    return {
      bg: 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffd2dd 49%, #ffd2dd 100%)',
      border: '#ff4b72',
      color: '#d91f4f',
      side: '#ff2456',
    };
  }

  if (status === 'blocked') {
    return {
      bg: '#ffd2dd',
      border: '#ff4b72',
      color: '#d91f4f',
      side: '#ff2456',
    };
  }

  if (status === 'pending') {
    return {
      bg: '#fff1bf',
      border: '#ffbf1f',
      color: '#b87500',
      side: '#ffbf1f',
    };
  }

  return {
    bg: '#ffffff',
    border: '#e4e4e4',
    color: '#6f675f',
    side: '#d9d9d9',
  };
}

function parseTimeFromDateTime(value?: string) {
  const date = safeDate(value);
  if (!date) return '09:00';

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  });
}

function mapBookingStatusToSlotStatus(booking: BookingItem): SlotStatus {
  if (booking.status === 'completed') return 'completed';
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'pending') return 'pending';
  return 'confirmed';
}

function getDemoClientName(index: number) {
  if (index === 0) return 'Lucie Hlavová';
  if (index === 1) return 'Janička Andělová';
  if (index === 2) return 'Klára Nováková';
  if (index === 3) return 'Lenka Bohatová';
  return 'Barbora Bendová';
}

function getDemoNote(index: number) {
  if (index === 0) return 'чёлка короче, слои по бокам';
  if (index === 1) return 'готово';
  if (index === 2) return 'частично / отменено';
  if (index === 3) return 'холодный блонд';
  return 'новые пряди';
}

function mapBookingsToSlots(bookings: BookingItem[], language: AppLanguage): ProviderSlot[] {
  const mapped = bookings.slice(0, 20).map((booking, index) => {
    const directContactsAvailable = canShowDirectContacts(booking);

    return {
      id: booking.id,
      time: parseTimeFromDateTime(booking.dateTime),
      duration: index === 0 ? '60 min' : index === 1 ? '45 min' : '60 min',
      clientName: getDemoClientName(index),
      clientAvatar: booking.masterAvatar || demoAvatar,
      serviceName: translateService(booking.serviceName, language),
      price: booking.price,
      status: mapBookingStatusToSlotStatus(booking),
      paymentMethod: index === 0 ? 'OlaCash' : index === 1 ? 'Card' : index === 2 ? 'QR' : 'Cash',
      notes: getDemoNote(index),
      contactMode: directContactsAvailable ? 'full' : 'quick',
      sourceBooking: booking,
      contactPhone: booking.contactPhone,
      contactEmail: booking.contactEmail,
      contactWhatsapp: booking.contactWhatsapp,
      contactTelegram: booking.contactTelegram,
      contactInstagram: booking.contactInstagram,
    } satisfies ProviderSlot;
  });

  return mapped.sort((a, b) => a.time.localeCompare(b.time));
}

function createDemoSlotsForDate(date: Date, activeView: ProviderView): ProviderSlot[] {
  if (activeView === 'requests' || activeView === 'history') return [];

  const isTomorrowLike = activeView === 'tomorrow';

  return [
    {
      id: `slot_free_${date.toISOString()}_1`,
      time: isTomorrowLike ? '10:00' : '12:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'free',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
    {
      id: `slot_blocked_${date.toISOString()}_1`,
      time: '15:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'blocked',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
    {
      id: `slot_free_${date.toISOString()}_2`,
      time: '19:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'free',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
  ];
}

function cleanMoneyInput(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parts = normalized.split('.');

  if (parts.length <= 1) return normalized;

  return `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`;
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 38,
          height: 46,
          position: 'relative',
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 8,
            width: 19,
            height: 19,
            borderRadius: '50%',
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: '#08245c',
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

export default function ProviderClientsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeView, setActiveView] = useState<ProviderView>('today');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [search, setSearch] = useState('');
  const [slots, setSlots] = useState<ProviderSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [timeSlotId, setTimeSlotId] = useState<string | null>(null);
  const [editHour, setEditHour] = useState('09');
  const [editMinute, setEditMinute] = useState('30');
  const [noteDraft, setNoteDraft] = useState('');
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);

  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => startOfDay(new Date()));

  const todayDate = useMemo(() => startOfDay(new Date()), []);
  const tomorrowDate = useMemo(() => addDays(todayDate, 1), [todayDate]);

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => setBookings(getBookings());

    syncLanguage();
    syncBookings();

    const unsubscribeLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubscribeBookings = subscribeToBookingsStore(syncBookings);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncBookings);
    window.addEventListener('storage', syncBookings);

    return () => {
      unsubscribeLanguage();
      unsubscribeBookings();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncBookings);
      window.removeEventListener('storage', syncBookings);
    };
  }, []);

  useEffect(() => {
    setSlots(mapBookingsToSlots(bookings, language));
  }, [bookings, language]);

  const text = useMemo(() => getTexts(language), [language]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || null;
  const timeSlot = slots.find((slot) => slot.id === timeSlotId) || null;

  const activeDate = useMemo(() => {
    if (activeView === 'tomorrow') return tomorrowDate;
    if (activeView === 'calendar') return selectedCalendarDate;
    return todayDate;
  }, [activeView, selectedCalendarDate, todayDate, tomorrowDate]);

  const dateTitle =
    activeView === 'tomorrow'
      ? `${text.tomorrow} · ${formatDateTitle(tomorrowDate, language)}`
      : formatDateTitle(activeDate, language);

  const visibleSlots = useMemo(() => {
    let source = slots;

    if (activeView === 'today') {
      source = source.filter((slot) => {
        const bookingDate = safeDate(slot.sourceBooking?.dateTime);
        return bookingDate ? isSameDay(bookingDate, todayDate) : false;
      });
    }

    if (activeView === 'tomorrow') {
      source = source.filter((slot) => {
        const bookingDate = safeDate(slot.sourceBooking?.dateTime);
        return bookingDate ? isSameDay(bookingDate, tomorrowDate) : false;
      });
    }

    if (activeView === 'calendar') {
      source = source.filter((slot) => {
        const bookingDate = safeDate(slot.sourceBooking?.dateTime);
        return bookingDate ? isSameDay(bookingDate, selectedCalendarDate) : false;
      });
    }

    if (activeView === 'requests') {
      source = source.filter((slot) => slot.status === 'pending');
    }

    if (activeView === 'history') {
      source = source.filter((slot) => slot.status === 'completed' || slot.status === 'cancelled');
    }

    if (filtersEnabled && activeFilter !== 'all') {
      source = source.filter((slot) => slot.status === activeFilter);
    }

    if (filtersEnabled) {
      const min = Number.parseFloat(minPrice);
      const max = Number.parseFloat(maxPrice);

      if (minPrice.trim() && !Number.isNaN(min)) {
        source = source.filter((slot) => slot.price >= Math.max(0.1, min));
      }

      if (maxPrice.trim() && !Number.isNaN(max)) {
        source = source.filter((slot) => slot.price <= max);
      }
    }

    const q = search.trim().toLowerCase();

    if (q) {
      source = source.filter((slot) => {
        return (
          slot.clientName.toLowerCase().includes(q) ||
          slot.serviceName.toLowerCase().includes(q) ||
          String(slot.price).includes(q) ||
          slot.notes.toLowerCase().includes(q) ||
          slot.paymentMethod.toLowerCase().includes(q) ||
          slot.time.toLowerCase().includes(q)
        );
      });
    }

    const withDemo = [...source];

    if (activeView === 'today' || activeView === 'tomorrow' || activeView === 'calendar') {
      withDemo.push(...createDemoSlotsForDate(activeDate, activeView));
    }

    return withDemo.sort((a, b) => {
      if (filtersEnabled && sortKey === 'name') return a.clientName.localeCompare(b.clientName);
      if (filtersEnabled && sortKey === 'procedure') return a.serviceName.localeCompare(b.serviceName);
      if (filtersEnabled && sortKey === 'priceAsc') return a.price - b.price;
      if (filtersEnabled && sortKey === 'priceDesc') return b.price - a.price;
      return a.time.localeCompare(b.time);
    });
  }, [
    activeDate,
    activeFilter,
    activeView,
    filtersEnabled,
    maxPrice,
    minPrice,
    search,
    selectedCalendarDate,
    slots,
    sortKey,
    todayDate,
    tomorrowDate,
  ]);

  const activeTodayCount = slots.filter((slot) => {
    const bookingDate = safeDate(slot.sourceBooking?.dateTime);
    const isTodayBooking = bookingDate ? isSameDay(bookingDate, todayDate) : false;
    return isTodayBooking && (slot.status === 'confirmed' || slot.status === 'pending');
  }).length;

  const requestCount = slots.filter((slot) => slot.status === 'pending').length;

  const completedCount = slots.filter((slot) => {
    const bookingDate = safeDate(slot.sourceBooking?.dateTime);
    return bookingDate && isSameDay(bookingDate, todayDate) && slot.status === 'completed';
  }).length;

  const confirmedCount = slots.filter((slot) => {
    const bookingDate = safeDate(slot.sourceBooking?.dateTime);
    return bookingDate && isSameDay(bookingDate, todayDate) && slot.status === 'confirmed';
  }).length;

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => current - 2 + index);
  }, []);

  const handleSelectCalendarDay = (date: Date) => {
    const next = startOfDay(date);
    setSelectedCalendarDate(next);
    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
  };

  const handleOpenTimeModal = (slot: ProviderSlot) => {
    const [hour, minute] = slot.time.split(':');
    setEditHour(hour || '09');
    setEditMinute(minute || '30');
    setTimeSlotId(slot.id);
  };

  const handleSaveTime = () => {
    if (!timeSlotId) return;

    const nextTime = `${editHour}:${editMinute}`;

    setSlots((current) =>
      current
        .map((slot) => (slot.id === timeSlotId ? { ...slot, time: nextTime } : slot))
        .sort((a, b) => a.time.localeCompare(b.time))
    );

    const slot = slots.find((item) => item.id === timeSlotId);
    if (slot?.sourceBooking) {
      const currentDate = new Date(slot.sourceBooking.dateTime);
      if (!Number.isNaN(currentDate.getTime())) {
        const [hours, minutes] = nextTime.split(':').map(Number);
        currentDate.setHours(hours, minutes, 0, 0);
        patchBooking(slot.sourceBooking.id, {
          dateTime: currentDate.toISOString(),
          dateLabel: `${formatDateTitle(currentDate, language)} ${nextTime}`,
        });
      }
    }

    setTimeSlotId(null);
  };

  const handleSaveNote = () => {
    if (!selectedSlot) return;

    setSlots((current) =>
      current.map((slot) =>
        slot.id === selectedSlot.id
          ? {
              ...slot,
              notes: noteDraft,
            }
          : slot
      )
    );
  };

  const handleAcceptBooking = (slot: ProviderSlot) => {
    if (!slot.sourceBooking) return;

    confirmBookingByMaster(slot.sourceBooking.id);
    setSelectedSlotId(null);
  };

  const handleDeclineBooking = (slot: ProviderSlot) => {
    if (!slot.sourceBooking) return;

    declineBookingByMaster(slot.sourceBooking.id);
    setSelectedSlotId(null);
  };

  const handleOpenChat = (slot: ProviderSlot) => {
    const booking = slot.sourceBooking;

    if (!booking) return;

    const threadId = String(booking.masterId || booking.id);

    getOrCreateChatThread({
      threadId,
      providerName: booking.masterName,
      providerAvatar: booking.masterAvatar,
      category: booking.category || booking.serviceName || 'Booking',
      online: true,
      lastSeenText: 'Online',
    });

    router.push(`/messages/${encodeURIComponent(threadId)}`);
  };

  const handleDropOnSlot = (targetSlot: ProviderSlot) => {
    if (!draggingSlotId || draggingSlotId === targetSlot.id) {
      setDraggingSlotId(null);
      return;
    }

    setSlots((current) => {
      const dragging = current.find((slot) => slot.id === draggingSlotId);
      if (!dragging) return current;

      return current
        .map((slot) => {
          if (slot.id === draggingSlotId) {
            return {
              ...slot,
              time: targetSlot.time,
            };
          }

          if (slot.id === targetSlot.id) {
            return {
              ...slot,
              time: dragging.time,
            };
          }

          return slot;
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    });

    setDraggingSlotId(null);
  };

  const filterOptions: FilterKey[] = [
    'all',
    'confirmed',
    'completed',
    'pending',
    'cancelled',
    'blocked',
    'free',
  ];

  const sortOptions: SortKey[] = ['time', 'name', 'priceAsc', 'priceDesc', 'procedure'];

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: '#17130f',
          paddingBottom: 150,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 160px' }}>
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
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 25,
                color: '#17130f',
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
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 24,
                color: '#17130f',
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
                fontSize: 33,
                fontWeight: 900,
                letterSpacing: '-1px',
                color: '#08245c',
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: 14,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#7b7268',
              }}
            >
              {text.subtitle}
            </p>
          </section>

          <section style={{ marginTop: 16 }}>
            <div
              style={{
                borderRadius: 28,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 12,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 9,
                }}
              >
                <SummaryCard
                  title={text.activeToday}
                  value={activeTodayCount}
                  bottom={`✓ ${confirmedCount} ${text.confirmedShort} · ${completedCount} ${text.completedShort}`}
                  bg="#fff0da"
                  color="#17130f"
                  accent="#8b7355"
                />

                <SummaryCard
                  title={text.requestsCount}
                  value={requestCount}
                  bottom={requestCount > 0 ? text.needsAction : text.clear}
                  bg={requestCount > 0 ? '#ffe1e7' : '#e6efff'}
                  color={requestCount > 0 ? '#d91f4f' : '#17130f'}
                  accent={requestCount > 0 ? '#ff2456' : '#0e73d8'}
                />
              </div>

              <div
                style={{
                  marginTop: 11,
                  height: 48,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 13px',
                }}
              >
                <span style={{ fontSize: 18, color: '#9ca3af' }}>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={text.search}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#17130f',
                    minWidth: 0,
                  }}
                />
              </div>
            </div>
          </section>

          <section style={{ marginTop: 14 }}>
            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 25,
                padding: 7,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 6,
              }}
            >
              {([
                ['today', text.today],
                ['tomorrow', text.tomorrow],
                ['requests', text.requests],
                ['calendar', text.calendar],
                ['history', text.history],
              ] as const).map(([key, label]) => {
                const active = activeView === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#ffffff',
                      color: active ? '#ffffff' : '#17130f',
                      fontSize: language === 'RU' || language === 'UA' ? 10.5 : 11.5,
                      fontWeight: 900,
                      cursor: 'pointer',
                      padding: '0 4px',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: 12 }}>
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#fffefa',
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
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {text.filters}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 900,
                      color: filtersEnabled ? '#008f3a' : '#7b7268',
                    }}
                  >
                    {filtersEnabled ? text.on : text.off}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersEnabled((prev) => !prev)}
                  style={{
                    minWidth: 136,
                    height: 54,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    display: 'grid',
                    gridTemplateColumns: '1fr 58px',
                    alignItems: 'center',
                    padding: 5,
                    cursor: 'pointer',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: filtersEnabled ? '#008f3a' : '#7b7268',
                      lineHeight: 1.15,
                    }}
                  >
                    {text.alwaysShowFilters}
                    <br />
                    {filtersEnabled ? text.on : text.off}
                  </span>

                  <span
                    style={{
                      width: 48,
                      height: 36,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: filtersEnabled ? '#24c45a' : '#eeeeee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: filtersEnabled ? 'flex-end' : 'flex-start',
                      padding: 3,
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: '#ffffff',
                        border: '2px solid #111111',
                        display: 'block',
                      }}
                    />
                  </span>
                </button>
              </div>

              {filtersEnabled ? (
                <>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      paddingBottom: 6,
                    }}
                  >
                    {filterOptions.map((filter) => {
                      const active = activeFilter === filter;
                      const style = getFilterStyle(filter, active);

                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          style={{
                            flexShrink: 0,
                            minHeight: 38,
                            borderRadius: 999,
                            border: `2px solid ${style.border}`,
                            background: style.background,
                            color: style.color,
                            padding: '0 13px',
                            fontSize: 12.5,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {getFilterLabel(filter, text)}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      paddingBottom: 2,
                    }}
                  >
                    {sortOptions.map((sort) => {
                      const active = sortKey === sort;

                      return (
                        <button
                          key={sort}
                          type="button"
                          onClick={() => {
                            setSortKey(sort);
                            if (sort === 'priceAsc' || sort === 'priceDesc') {
                              setPriceFilterOpen(true);
                            }
                          }}
                          style={{
                            flexShrink: 0,
                            minHeight: 36,
                            borderRadius: 999,
                            border: active ? '2px solid #0e73d8' : '2px solid #111111',
                            background: active ? '#dcecff' : '#ffffff',
                            color: active ? '#0e73d8' : '#17130f',
                            padding: '0 13px',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {getSortLabel(sort, text)}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setPriceFilterOpen(true)}
                      style={{
                        flexShrink: 0,
                        minHeight: 36,
                        borderRadius: 999,
                        border:
                          minPrice || maxPrice ? '2px solid #ff2456' : '2px solid #111111',
                        background: minPrice || maxPrice ? '#fff2f2' : '#ffffff',
                        color: minPrice || maxPrice ? '#ff2456' : '#17130f',
                        padding: '0 13px',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {minPrice || maxPrice
                        ? `${text.price}: £${minPrice || '0.10'}–£${maxPrice || '∞'}`
                        : text.openPriceFilter}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          {activeView === 'calendar' ? (
            <CalendarPlanner
              text={text}
              language={language}
              bookings={bookings}
              selectedDate={selectedCalendarDate}
              calendarMonth={calendarMonth}
              calendarYear={calendarYear}
              years={years}
              onSelectDate={handleSelectCalendarDay}
              onChangeMonth={setCalendarMonth}
              onChangeYear={setCalendarYear}
            />
          ) : null}

          <section
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: activeView === 'tomorrow' ? 24 : 26,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: '#17130f',
                  textTransform: language === 'EN' ? 'capitalize' : 'none',
                }}
              >
                {dateTitle}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#7b7268',
                }}
              >
                {text.daySubtitle}
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '58px minmax(0, 1fr) 58px 74px',
                gap: 8,
                padding: '0 4px',
                fontSize: 11,
                fontWeight: 900,
                color: '#7b7268',
              }}
            >
              <div>{text.time}</div>
              <div>{text.clientProcedure}</div>
              <div>{text.price}</div>
              <div>{text.notes}</div>
            </div>

            <div style={{ marginTop: 8, display: 'grid', gap: 9 }}>
              {visibleSlots.length === 0 ? (
                <div
                  style={{
                    minHeight: 120,
                    borderRadius: 22,
                    border: '2px dashed #d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7b7268',
                    fontSize: 15,
                    fontWeight: 900,
                  }}
                >
                  {text.noBookings}
                </div>
              ) : null}

              {visibleSlots.map((slot) => {
                const style = getSlotStyle(slot.status);
                const isEmpty = slot.status === 'free' || slot.status === 'blocked';
                const isDone = slot.status === 'completed';
                const isPending = slot.status === 'pending';
                const isConfirmed = slot.status === 'confirmed';

                return (
                  <article
                    key={slot.id}
                    draggable={!isEmpty}
                    onDragStart={() => setDraggingSlotId(slot.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropOnSlot(slot)}
                    onClick={() => {
                      if (slot.status === 'free' || slot.status === 'blocked') {
                        handleOpenTimeModal(slot);
                        return;
                      }

                      setSelectedSlotId(slot.id);
                      setNoteDraft(slot.notes);
                    }}
                    style={{
                      minHeight: 74,
                      display: 'grid',
                      gridTemplateColumns: '58px minmax(0, 1fr) 58px 74px',
                      gap: 8,
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenTimeModal(slot);
                      }}
                      style={{
                        minHeight: 58,
                        border: 'none',
                        borderLeft: `6px solid ${style.side}`,
                        background: '#ffffff',
                        color: '#17130f',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: 'pointer',
                        textAlign: 'left',
                        paddingLeft: 9,
                      }}
                    >
                      {slot.time}
                    </button>

                    <div
                      style={{
                        minHeight: 68,
                        borderRadius: 13,
                        border: `2px solid ${style.border}`,
                        background: style.bg,
                        padding: '10px 10px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {slot.status === 'free' ? (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#6f675f',
                          }}
                        >
                          {text.freeSlot}
                        </div>
                      ) : slot.status === 'blocked' ? (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 15,
                            fontWeight: 900,
                            color: '#d91f4f',
                          }}
                        >
                          {text.unavailable}
                        </div>
                      ) : (
                        <>
                          {isDone ? (
                            <span
                              style={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: '2px solid #111111',
                                background: '#24c45a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                fontWeight: 900,
                                boxShadow: '0 4px 12px rgba(36,196,90,0.25)',
                                zIndex: 2,
                              }}
                            >
                              ✓
                            </span>
                          ) : null}

                          {isPending ? (
                            <span
                              style={{
                                position: 'absolute',
                                left: 8,
                                top: 8,
                                maxWidth: 100,
                                height: 24,
                                borderRadius: 999,
                                border: '2px solid #111111',
                                background: '#ff2456',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 8px',
                                fontSize: 10,
                                fontWeight: 900,
                                zIndex: 2,
                              }}
                            >
                              ! {text.needsAction}
                            </span>
                          ) : null}

                          {isConfirmed ? (
                            <span
                              style={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                border: '2px solid #24c45a',
                                background: '#ffffff',
                                color: '#24c45a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                                fontWeight: 900,
                              }}
                            >
                              ✓
                            </span>
                          ) : null}

                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: '#17130f',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              paddingRight: isDone || isConfirmed ? 30 : 0,
                              paddingTop: isPending ? 24 : 0,
                            }}
                          >
                            {slot.clientName}
                          </div>
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: '#6f675f',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {slot.serviceName}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              display: 'inline-flex',
                              minHeight: 22,
                              padding: '0 10px',
                              alignItems: 'center',
                              borderRadius: 999,
                              border: `1.5px solid ${style.border}`,
                              background: '#ffffffcc',
                              color: style.color,
                              fontSize: 10.5,
                              fontWeight: 900,
                            }}
                          >
                            {getSlotStatusLabel(slot.status, text)}
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        minHeight: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 21,
                        fontWeight: 900,
                        color: slot.price > 0 ? '#ff2456' : '#9ca3af',
                      }}
                    >
                      {slot.price > 0 ? money(slot.price) : '—'}
                    </div>

                    <div
                      style={{
                        minHeight: 64,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 11.5,
                        lineHeight: 1.25,
                        fontWeight: 900,
                        color: slot.notes ? '#d2a300' : '#9ca3af',
                        overflow: 'hidden',
                      }}
                    >
                      {slot.notes || '—'}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <BottomNav active="clients" />
      </main>

      {selectedSlot ? (
        <ClientCardModal
          slot={selectedSlot}
          text={text}
          noteDraft={noteDraft}
          setNoteDraft={setNoteDraft}
          onSaveNote={handleSaveNote}
          onClose={() => setSelectedSlotId(null)}
          onChangeTime={() => handleOpenTimeModal(selectedSlot)}
          onAcceptBooking={() => handleAcceptBooking(selectedSlot)}
          onDeclineBooking={() => handleDeclineBooking(selectedSlot)}
          onOpenChat={() => handleOpenChat(selectedSlot)}
        />
      ) : null}

      {timeSlot ? (
        <TimeModal
          text={text}
          editHour={editHour}
          editMinute={editMinute}
          setEditHour={setEditHour}
          setEditMinute={setEditMinute}
          onClose={() => setTimeSlotId(null)}
          onSave={handleSaveTime}
        />
      ) : null}

      {priceFilterOpen ? (
        <PriceRangeModal
          text={text}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onClose={() => setPriceFilterOpen(false)}
          onReset={() => {
            setMinPrice('');
            setMaxPrice('');
            setPriceFilterOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function SummaryCard({
  title,
  value,
  bottom,
  bg,
  color,
  accent,
}: {
  title: string;
  value: number;
  bottom: string;
  bg: string;
  color: string;
  accent: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: '2px solid #111111',
        background: bg,
        padding: '12px 13px',
        minHeight: 86,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 12, color: accent, fontWeight: 900 }}>{title}</div>

      <div
        style={{
          marginTop: 5,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 900, color }}>{value}</div>

        <div
          style={{
            maxWidth: 96,
            fontSize: 10.5,
            lineHeight: 1.15,
            fontWeight: 900,
            color: accent,
            textAlign: 'right',
          }}
        >
          {bottom}
        </div>
      </div>
    </div>
  );
}

function CalendarPlanner({
  text,
  language,
  bookings,
  selectedDate,
  calendarMonth,
  calendarYear,
  years,
  onSelectDate,
  onChangeMonth,
  onChangeYear,
}: {
  text: PageText;
  language: AppLanguage;
  bookings: BookingItem[];
  selectedDate: Date;
  calendarMonth: number;
  calendarYear: number;
  years: number[];
  onSelectDate: (date: Date) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
}) {
  const weekDays = getShortWeekDays(language);
  const cells = getCalendarCells(calendarYear, calendarMonth);
  const months = Array.from({ length: 12 }, (_, index) => getMonthName(index, language));

  return (
    <section
      style={{
        marginTop: 14,
        borderRadius: 30,
        border: '2px solid #111111',
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
              color: '#08245c',
            }}
          >
            {text.calendarPickerTitle}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              lineHeight: 1.25,
              fontWeight: 900,
              color: '#6f675f',
            }}
          >
            {text.selectedDay}: {formatDateTitle(selectedDate, language)}
          </div>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            border: '2px solid #111111',
            background:
              'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
            boxShadow: '0 10px 20px rgba(14,115,216,0.18)',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <label
          style={{
            borderRadius: 18,
            border: '2px solid #111111',
            background: '#ffffff',
            padding: '9px 12px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#7b7268' }}>{text.year}</div>
          <select
            value={calendarYear}
            onChange={(event) => onChangeYear(Number(event.target.value))}
            style={{
              marginTop: 4,
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
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
            border: '2px solid #111111',
            background: '#ffffff',
            padding: '9px 12px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#7b7268' }}>{text.month}</div>
          <select
            value={calendarMonth}
            onChange={(event) => onChangeMonth(Number(event.target.value))}
            style={{
              marginTop: 4,
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              textTransform: 'capitalize',
            }}
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 5,
        }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 900,
              color: '#7b7268',
              textTransform: 'capitalize',
            }}
          >
            {day}
          </div>
        ))}

        {cells.map(({ date, currentMonth }) => {
          const dayBookings = bookings.filter((booking) => {
            const bookingDate = safeDate(booking.dateTime);
            return bookingDate ? isSameDay(bookingDate, date) : false;
          });

          const hasPending = dayBookings.some((booking) => booking.status === 'pending');
          const hasCompleted = dayBookings.some((booking) => booking.status === 'completed');
          const hasUpcoming = dayBookings.some((booking) => booking.status === 'upcoming');
          const selected = isSameDay(date, selectedDate);
          const today = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              style={{
                minHeight: 52,
                borderRadius: 16,
                border: selected
                  ? '2px solid #111111'
                  : today
                  ? '2px solid #0e73d8'
                  : '1.5px solid #e0e0e0',
                background: selected ? '#17130f' : currentMonth ? '#ffffff' : '#f3f3f3',
                color: selected ? '#ffffff' : currentMonth ? '#17130f' : '#a0a0a0',
                cursor: 'pointer',
                padding: 5,
                display: 'grid',
                alignContent: 'space-between',
                justifyItems: 'center',
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
                {hasPending ? <CalendarDot color="#ff2456" /> : null}
                {hasUpcoming ? <CalendarDot color="#24c45a" /> : null}
                {hasCompleted ? <CalendarDot color="#0e73d8" /> : null}
                {dayBookings.length > 0 ? (
                  <span
                    style={{
                      marginLeft: 2,
                      fontSize: 9,
                      fontWeight: 900,
                      color: selected ? '#ffffff' : '#7b7268',
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
    </section>
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

function ClientCardModal({
  slot,
  text,
  noteDraft,
  setNoteDraft,
  onSaveNote,
  onClose,
  onChangeTime,
  onAcceptBooking,
  onDeclineBooking,
  onOpenChat,
}: {
  slot: ProviderSlot;
  text: PageText;
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  onSaveNote: () => void;
  onClose: () => void;
  onChangeTime: () => void;
  onAcceptBooking: () => void;
  onDeclineBooking: () => void;
  onOpenChat: () => void;
}) {
  const isPending = slot.status === 'pending';
  const hasBooking = Boolean(slot.sourceBooking);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(17,17,17,0.22)',
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
          border: '2px solid #111111',
          borderBottom: 'none',
          padding: '18px 14px calc(22px + env(safe-area-inset-bottom))',
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
              border: '2px solid #111111',
              background: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <button
            type="button"
            onClick={onChangeTime}
            style={{
              minHeight: 42,
              padding: '0 14px',
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#dcecff',
              color: '#0e73d8',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.changeTime}
          </button>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <OlamepLogo />
        </div>

        <section
          style={{
            marginTop: 18,
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
              gridTemplateColumns: '82px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={slot.clientAvatar || demoAvatar}
                alt={slot.clientName}
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: 24,
                  objectFit: 'cover',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: isPending ? '#ffbf1f' : '#24c45a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                {isPending ? '!' : '✓'}
              </span>
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 27,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {slot.clientName}
              </h2>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#6f675f',
                }}
              >
                {slot.serviceName}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#6f675f',
                }}
              >
                {slot.time}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 34,
                  fontWeight: 900,
                  color: '#ff2456',
                }}
              >
                {money(slot.price)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 18,
              border: '2px solid #111111',
              background: isPending ? '#fff1bf' : '#dcffe8',
              padding: 12,
              fontSize: 13,
              lineHeight: 1.45,
              fontWeight: 900,
              color: isPending ? '#b87500' : '#008f3a',
            }}
          >
            {isPending ? text.pendingRequestInfo : text.confirmedRequestInfo}
          </div>

          {hasBooking ? (
            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: isPending ? '1fr 1fr' : '1fr',
                gap: 10,
              }}
            >
              {isPending ? (
                <>
                  <button
                    type="button"
                    onClick={onAcceptBooking}
                    style={{
                      minHeight: 54,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#24c45a',
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ {text.acceptBooking}
                  </button>

                  <button
                    type="button"
                    onClick={onDeclineBooking}
                    style={{
                      minHeight: 54,
                      borderRadius: 18,
                      border: '2px solid #ff2456',
                      background: '#fff2f4',
                      color: '#ff2456',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    × {text.declineBooking}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={onOpenChat}
                style={{
                  minHeight: 54,
                  gridColumn: isPending ? '1 / -1' : 'auto',
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff7cf',
                  color: '#b28a00',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                💬 {text.openChat}
              </button>
            </div>
          ) : null}

          <div
            style={{
              marginTop: 18,
              borderTop: '1.5px solid #eeeeee',
            }}
          >
            {[
              [text.procedure, slot.serviceName],
              [text.price, money(slot.price)],
              [text.status, getSlotStatusLabel(slot.status, text)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  minHeight: 54,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  alignItems: 'center',
                  borderBottom: '1.5px solid #eeeeee',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: label === text.price ? '#ff2456' : '#17130f',
                    textAlign: 'right',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}

            <div
              style={{
                minHeight: 74,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                alignItems: 'center',
                borderBottom: '1.5px solid #eeeeee',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                {text.notes}
              </div>

              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                onBlur={onSaveNote}
                rows={3}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: 14,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: '#d2a300',
                  textAlign: 'right',
                  background: 'transparent',
                  fontFamily: 'Arial, sans-serif',
                }}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 14,
            borderRadius: 24,
            border: '1.5px solid #e4e4e4',
            background: '#ffffff',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            <span style={{ color: '#24c45a' }}>⬟</span>
            {text.contacts}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              border: '1.5px solid #cfeeda',
              background: '#f2fff6',
              padding: 12,
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.45,
              color: '#5d665f',
            }}
          >
            {slot.contactMode === 'full' ? text.fullContactInfo : text.quickContactInfo}
          </div>

          {slot.contactMode === 'full' ? (
            <FullContactsBlock slot={slot} text={text} onOpenChat={onOpenChat} />
          ) : (
            <QuickContactsBlock text={text} onOpenChat={onOpenChat} />
          )}
        </section>
      </div>
    </div>
  );
}

function TimeModal({
  text,
  editHour,
  editMinute,
  setEditHour,
  setEditMinute,
  onClose,
  onSave,
}: {
  text: PageText;
  editHour: string;
  editMinute: string;
  setEditHour: (value: string) => void;
  setEditMinute: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 340,
        background: 'rgba(17,17,17,0.38)',
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
          background: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          border: '2px solid #111111',
          borderBottom: 'none',
          padding: '18px 22px calc(22px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 58,
            height: 5,
            borderRadius: 999,
            background: '#d8d8d8',
            margin: '0 auto 18px',
          }}
        />

        <h2
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {text.changeTime}
        </h2>

        <div
          style={{
            marginTop: 26,
            display: 'grid',
            gridTemplateColumns: '1fr 20px 1fr',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#17130f' }}>
              {text.hour}
            </div>
            <input
              value={editHour}
              onChange={(event) => {
                const clean = event.target.value.replace(/\D/g, '').slice(0, 2);
                setEditHour(clean.padStart(2, '0'));
              }}
              style={{
                marginTop: 10,
                width: '100%',
                height: 92,
                borderRadius: 18,
                border: '2px solid #dedede',
                textAlign: 'center',
                fontSize: 45,
                fontWeight: 900,
                color: '#07111f',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 26,
              textAlign: 'center',
              fontSize: 34,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            :
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#17130f' }}>
              {text.minutes}
            </div>

            <div
              style={{
                marginTop: 10,
                borderRadius: 18,
                border: '2px solid #dedede',
                overflow: 'hidden',
              }}
            >
              {['00', '15', '20', '25', '30', '35', '40', '45'].map((minute) => {
                const active = editMinute === minute;

                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => setEditMinute(minute)}
                    style={{
                      width: '100%',
                      minHeight: 34,
                      border: 'none',
                      background: active ? '#dcecff' : '#ffffff',
                      color: active ? '#0e73d8' : '#9ca3af',
                      fontSize: active ? 22 : 17,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {minute}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {text.newTime}:{' '}
          <span style={{ color: '#0e73d8' }}>
            {editHour}:{editMinute}
          </span>
        </div>

        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 800,
            color: '#008f3a',
          }}
        >
          ✓ {text.synced}
        </div>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: 56,
              borderRadius: 18,
              border: '2px solid #ff2456',
              background: '#fff2f4',
              color: '#ff2456',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.cancel}
          </button>

          <button
            type="button"
            onClick={onSave}
            style={{
              minHeight: 56,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#24c45a',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceRangeModal({
  text,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onClose,
  onReset,
}: {
  text: PageText;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 360,
        background: 'rgba(17,17,17,0.34)',
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
          background: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          border: '2px solid #111111',
          borderBottom: 'none',
          padding: '18px 18px calc(22px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 58,
            height: 5,
            borderRadius: 999,
            background: '#d8d8d8',
            margin: '0 auto 18px',
          }}
        />

        <h2
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {text.priceRange}
        </h2>

        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <label
            style={{
              borderRadius: 20,
              border: '2px solid #111111',
              padding: 14,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#7b7268' }}>
              {text.from}
            </div>
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(cleanMoneyInput(event.target.value))}
              placeholder="0.10"
              inputMode="decimal"
              style={{
                marginTop: 8,
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 28,
                fontWeight: 900,
                color: '#ff2456',
              }}
            />
          </label>

          <label
            style={{
              borderRadius: 20,
              border: '2px solid #111111',
              padding: 14,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#7b7268' }}>
              {text.to}
            </div>
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(cleanMoneyInput(event.target.value))}
              placeholder="1000"
              inputMode="decimal"
              style={{
                marginTop: 8,
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 28,
                fontWeight: 900,
                color: '#ff2456',
              }}
            />
          </label>
        </div>

        <div
          style={{
            marginTop: 12,
            borderRadius: 16,
            border: '1.5px solid #eeeeee',
            background: '#fffefa',
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 800,
            color: '#7b7268',
            lineHeight: 1.35,
          }}
        >
          Минимальная цена может быть от £0.10. Максимальную цену можно поставить любую.
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onReset}
            style={{
              minHeight: 56,
              borderRadius: 18,
              border: '2px solid #ff2456',
              background: '#fff2f4',
              color: '#ff2456',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.reset}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: 56,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#24c45a',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

function FullContactsBlock({
  slot,
  text,
  onOpenChat,
}: {
  slot: ProviderSlot;
  text: PageText;
  onOpenChat: () => void;
}) {
  const booking = slot.sourceBooking;
  const protectedContact = booking ? getProtectedBookingContact(booking) : null;

  const phone = protectedContact?.phone || slot.contactPhone || '+44 7700 900123';
  const email = protectedContact?.email || slot.contactEmail || 'lucie.hlavova@example.com';
  const whatsapp = protectedContact?.whatsapp || slot.contactWhatsapp || phone;

  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
      <ContactRow icon="☎" value={phone} buttonLabel={text.call} accent="green" />
      <ContactRow icon="✉" value={email} buttonLabel={text.message} accent="yellow" />
      <ContactRow icon="🟢" value={whatsapp} buttonLabel={text.whatsapp} accent="yellow" />
      <ContactRow
        icon="💬"
        value="Olamep chat"
        buttonLabel={text.internalChat}
        accent="yellow"
        onClick={onOpenChat}
      />

      <div
        style={{
          marginTop: 4,
          borderTop: '1.5px solid #eeeeee',
          paddingTop: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#747474',
        }}
      >
        <span>🔒</span>
        <span>Все способы связи предоставлены клиентом и доступны вам.</span>
      </div>
    </div>
  );
}

function QuickContactsBlock({
  text,
  onOpenChat,
}: {
  text: PageText;
  onOpenChat: () => void;
}) {
  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
      <ContactRow
        icon="💬"
        value="Olamep chat"
        buttonLabel={text.internalChat}
        accent="yellow"
        onClick={onOpenChat}
      />

      <div
        style={{
          marginTop: 4,
          borderTop: '1.5px solid #eeeeee',
          paddingTop: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#747474',
        }}
      >
        <span>🔒</span>
        <span>При быстрой брони доступен только внутренний чат приложения.</span>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  value,
  buttonLabel,
  accent,
  onClick,
}: {
  icon: string;
  value: string;
  buttonLabel: string;
  accent: 'green' | 'yellow';
  onClick?: () => void;
}) {
  const isYellow = accent === 'yellow';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 21,
          color: isYellow ? '#d2a300' : '#008f3a',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
          fontSize: 14,
          fontWeight: 800,
          color: '#17130f',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>

      <button
        type="button"
        onClick={onClick}
        style={{
          minHeight: 38,
          padding: '0 12px',
          borderRadius: 12,
          border: `2px solid ${isYellow ? '#f2c94c' : '#24c45a'}`,
          background: isYellow ? '#fff7cf' : '#ffffff',
          color: isYellow ? '#b28a00' : '#008f3a',
          fontSize: 12,
          fontWeight: 900,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
