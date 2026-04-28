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
  updateBookingStatus,
  getPublicBookingLocation,
  getVisibleBookingLocation,
  canShowExactAddress,
  canShowDirectContacts,
  type BookingItem,
} from '../../../services/bookingsStore';

type ViewMode = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type CalendarMode = 'month' | 'week' | 'day' | 'list';

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
    details: 'Booking details',
    openChat: 'Open chat',
    markDone: 'Mark done',
    price: 'Price',
    notes: 'Notes',
    back: 'Back',
    close: 'Close',
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
    filters: 'Фильтры',
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
    filters: 'Фільтри',
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
  },
};

const demoSchedule: BookingItem[] = [
  {
    id: 'client-demo-1',
    masterId: 'client-lenka',
    masterName: 'Lenka Smith',
    masterAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Визаж',
    price: 50,
    status: 'completed',
    dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    dateLabel: 'Today at 10:00',
    location: 'Camden, London',
    areaLabel: 'Camden',
    exactAddress: '21 Camden High Street, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: true,
  } as BookingItem,
  {
    id: 'client-demo-2',
    masterId: 'client-klara',
    masterName: 'Kliára Nováková',
    masterAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Массаж',
    price: 60,
    status: 'upcoming',
    dateTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    dateLabel: 'Today at 12:30',
    location: 'Soho, London',
    areaLabel: 'Soho',
    exactAddress: '18 Greek Street, Soho, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: true,
  } as BookingItem,
  {
    id: 'client-demo-3',
    masterId: 'client-anna',
    masterName: 'Anna Johnson',
    masterAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    serviceName: 'Укладка',
    price: 40,
    status: 'pending',
    dateTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    dateLabel: 'Today at 15:00',
    location: 'Chelsea, London',
    areaLabel: 'Chelsea',
    exactAddress: '11 King’s Road, Chelsea, London',
    clientPaid: true,
    paymentReceivedByPlatform: true,
    unlockFeePaid: false,
  } as BookingItem,
  {
    id: 'client-demo-4',
    masterId: 'blocked-slot',
    masterName: 'Недоступно',
    masterAvatar: '',
    serviceName: '',
    price: 0,
    status: 'cancelled',
    dateTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    dateLabel: 'Today at 17:30',
    location: '',
    areaLabel: '',
    exactAddress: '',
    clientPaid: false,
    paymentReceivedByPlatform: false,
    unlockFeePaid: false,
  } as BookingItem,
];

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

function getMonthName(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
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
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calendarDate, setCalendarDate] = useState<Date>(() => startOfDay(new Date()));
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [showFreeWindows, setShowFreeWindows] = useState(false);

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
      source = source.filter((booking) => {
        const date = getBookingDate(booking);
        return date ? isSameDay(date, selectedDate) : false;
      });
    }

    if (showOnlyRequests) {
      source = source.filter((booking) => booking.status === 'pending');
    }

    return source.sort((a, b) => {
      const left = getBookingDate(a)?.getTime() || 0;
      const right = getBookingDate(b)?.getTime() || 0;
      return left - right;
    });
  }, [bookings, selectedDate, showOnlyRequests, today, tomorrow, viewMode]);

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

  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);
  const activeCount = bookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'upcoming'
  ).length;
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length;

  const selectedDateLabel = new Intl.DateTimeFormat(getLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);

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
              border: `2.5px solid ${BRAND.border}`,
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
            onClick={() => router.push('/profile')}
            aria-label={text.close}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
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

        <section
          style={{
            marginTop: 15,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 7,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 6,
          }}
        >
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
                onClick={() => setViewMode(mode)}
                style={{
                  minHeight: 42,
                  borderRadius: 15,
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
          })}
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 25,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox title="Active" value={String(activeCount)} bg={BRAND.softGreen} />
            <StatBox title="Total" value={String(bookings.length)} bg={BRAND.softBlue} />
            <StatBox title="Revenue" value={money(totalRevenue)} bg="#fff0da" />
            <StatBox title="Done" value={String(completedCount)} bg="#f3edff" />
          </div>
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 28,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 10,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
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
                fontSize: 22,
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

          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 7,
            }}
          >
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
                  onClick={() => setCalendarMode(mode)}
                  style={{
                    minHeight: 38,
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
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

          <CalendarGrid
            language={language}
            calendarDate={calendarDate}
            selectedDate={selectedDate}
            bookings={monthBookings}
            onSelect={(date) => {
              setSelectedDate(startOfDay(date));
              setViewMode('calendar');
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            <ToggleButton
              active={showOnlyRequests}
              label={text.onlyRequests}
              onClick={() => setShowOnlyRequests((prev) => !prev)}
            />
            <ToggleButton
              active={showFreeWindows}
              label={text.freeWindows}
              onClick={() => setShowFreeWindows((prev) => !prev)}
            />
          </div>

          <div
            style={{
              marginTop: 10,
              minHeight: 38,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: BRAND.softGreen,
              color: '#008f3a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            ☁ {text.synced}
          </div>
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#f8fbff',
            padding: 11,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: BRAND.navy,
                }}
              >
                {selectedDateLabel}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                {visibleBookings.length} {text.bookings}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const now = startOfDay(new Date());
                setSelectedDate(now);
                setCalendarDate(now);
                setViewMode('today');
              }}
              style={{
                minWidth: 72,
                height: 46,
                borderRadius: 17,
                border: `2px solid ${BRAND.border}`,
                background:
                  'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.today}
            </button>
          </div>
        </section>

        <section style={{ marginTop: 13, display: 'grid', gap: 10 }}>
          {visibleBookings.length === 0 && !showFreeWindows ? (
            <div
              style={{
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
              }}
            >
              {text.noBookings}
            </div>
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

          {showFreeWindows ? (
            <FreeWindowRow time="19:00" text={text} />
          ) : null}
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
        }}
      >
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

function ScheduleRow({
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
  const color = statusColor(booking);
  const bg = statusBg(booking);
  const done = booking.status === 'completed';
  const cancelled = booking.status === 'cancelled';
  const location = isUnlocked(booking)
    ? getVisibleBookingLocation(booking)
    : getPublicBookingLocation(booking);

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr)',
        gap: 12,
        boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 18,
          bottom: 18,
          width: 5,
          borderRadius: 999,
          background: color,
        }}
      />

      {done ? (
        <div
          style={{
            position: 'absolute',
            right: 11,
            top: 11,
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
          }}
        >
          ✓
        </div>
      ) : null}

      <div
        style={{
          fontSize: 25,
          fontWeight: 900,
          color: BRAND.navy,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getTimeLabel(booking)}
      </div>

      <div style={{ minWidth: 0, paddingRight: done ? 38 : 0 }}>
        <div
          style={{
            display: 'inline-flex',
            minHeight: 28,
            alignItems: 'center',
            borderRadius: 999,
            border: `2px solid ${color}`,
            background: bg,
            color,
            padding: '0 9px',
            fontSize: 11,
            fontWeight: 900,
            marginBottom: 7,
          }}
        >
          {done ? '✓ ' : cancelled ? '× ' : ''}
          {statusLabel(booking, text)}
        </div>

        <div
          style={{
            fontSize: 18,
            lineHeight: 1.1,
            fontWeight: 900,
            color: cancelled ? BRAND.red : BRAND.navy,
          }}
        >
          {cancelled ? text.unavailable : booking.masterName}
        </div>

        {!cancelled ? (
          <>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {booking.serviceName || 'Service'}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 900,
                color: BRAND.blue,
              }}
            >
              📍 {location || 'London'}
            </div>

            <div
              style={{
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: BRAND.red,
                }}
              >
                {money(Number(booking.price || 0))}
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <button type="button" onClick={onDetails} style={outlineButtonStyle}>
                {text.details}
              </button>

              <button type="button" onClick={onChat} style={greenButtonStyle}>
                💬 {text.openChat}
              </button>
            </div>

            {booking.status !== 'completed' ? (
              <button
                type="button"
                onClick={onDone}
                style={{
                  marginTop: 8,
                  width: '100%',
                  minHeight: 42,
                  borderRadius: 15,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.softBlue,
                  color: BRAND.blue,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✓ {text.markDone}
              </button>
            ) : null}
          </>
        ) : (
          <div
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.available}
          </div>
        )}
      </div>
    </article>
  );
}

function FreeWindowRow({ time, text }: { time: string; text: PageText }) {
  return (
    <article
      style={{
        borderRadius: 22,
        border: `2px solid #d2d2d2`,
        background: '#f8f8f8',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr)',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 25,
          fontWeight: 900,
          color: '#7b8490',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {time}
      </div>

      <div>
        <div style={{ fontSize: 17, fontWeight: 900, color: BRAND.navy }}>
          {text.available}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: BRAND.muted }}>
          Available for booking
        </div>
      </div>
    </article>
  );
}

function StatBox({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div
      style={{
        minHeight: 78,
        borderRadius: 20,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 11,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
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
      }}
    >
      {label}
    </button>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        minHeight: 26,
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

const roundButtonStyle = {
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

const outlineButtonStyle = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.border}`,
  background: '#ffffff',
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};

const greenButtonStyle = {
  minHeight: 42,
  borderRadius: 15,
  border: `2px solid ${BRAND.green}`,
  background: BRAND.green,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 900,
  cursor: 'pointer',
};
