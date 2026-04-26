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
  total: string;
  activeNow: string;
  menuClose: string;
  menuCancel: string;
  menuOpenProfile: string;
  provider: string;
  bookingSummary: string;
  dateTime: string;
  detailsUnlocked: string;
  detailsLocked: string;
  exactAddress: string;
  area: string;
  contactAndAddress: string;
  phone: string;
  email: string;
  social: string;
  openChat: string;
  callSeller: string;
  routeToMaster: string;
  contactsHiddenTitle: string;
  contactsHiddenText: string;
  waitingMaster: string;
  waitingPayment: string;
  lockedValue: string;
  todayAt: string;
  tomorrowAt: string;
  noPhoneAction: string;
  noRouteAction: string;
  chatAvailable: string;
  chatOnly: string;
  lockedUntilConfirm: string;
  paidDeposit: string;
  masterMustConfirm: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#1467f2',
  green: '#21b84b',
  red: '#ff4b4b',
  pink: '#ff4f9a',
  yellow: '#ffd629',
  border: '#111111',
  muted: '#626977',
};

const pageTexts: Partial<Record<AppLanguage, PageTexts>> = {
  EN: {
    title: 'My bookings',
    subtitle: 'Booking status, chat, address and contact access',
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
    total: 'Total',
    activeNow: 'Active now',
    menuClose: 'Close',
    menuCancel: 'Cancel booking',
    menuOpenProfile: 'Open profile',
    provider: 'Provider',
    bookingSummary: 'Booking summary',
    dateTime: 'Date & time',
    detailsUnlocked: 'Contacts unlocked',
    detailsLocked: 'Waiting for provider confirmation',
    exactAddress: 'Exact address',
    area: 'Area',
    contactAndAddress: 'Specialist contacts',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    openChat: 'Open chat',
    callSeller: 'Call seller',
    routeToMaster: 'Build route',
    contactsHiddenTitle: 'Contacts are locked',
    contactsHiddenText:
      'After deposit payment, chat is available. Phone, exact address and route unlock only after the provider confirms the booking.',
    waitingMaster: 'Waiting for provider confirmation',
    waitingPayment: 'Waiting for deposit payment',
    lockedValue: 'Locked',
    todayAt: 'Today at',
    tomorrowAt: 'Tomorrow at',
    noPhoneAction: 'Phone locked',
    noRouteAction: 'Route locked',
    chatAvailable: 'Chat available',
    chatOnly: 'Chat only until confirmation',
    lockedUntilConfirm: 'Locked until provider confirms',
    paidDeposit: 'Deposit paid',
    masterMustConfirm: 'Provider must confirm',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Статус брони, чат, адрес и доступ к контактам',
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
    total: 'Всего',
    activeNow: 'Активно сейчас',
    menuClose: 'Закрыть',
    menuCancel: 'Отменить бронь',
    menuOpenProfile: 'Открыть профиль',
    provider: 'Специалист',
    bookingSummary: 'Сводка бронирования',
    dateTime: 'Дата и время',
    detailsUnlocked: 'Контакты открыты',
    detailsLocked: 'Ждём подтверждения мастера',
    exactAddress: 'Точный адрес',
    area: 'Район',
    contactAndAddress: 'Контакты специалиста',
    phone: 'Телефон',
    email: 'Email',
    social: 'Соцсети',
    openChat: 'Открыть чат',
    callSeller: 'Позвонить',
    routeToMaster: 'Маршрут',
    contactsHiddenTitle: 'Контакты закрыты',
    contactsHiddenText:
      'После оплаты депозита доступен только чат. Телефон, точный адрес и маршрут откроются только после подтверждения брони мастером.',
    waitingMaster: 'Ждёт подтверждения мастера',
    waitingPayment: 'Ждёт оплату депозита',
    lockedValue: 'Скрыто',
    todayAt: 'Сегодня в',
    tomorrowAt: 'Завтра в',
    noPhoneAction: 'Телефон закрыт',
    noRouteAction: 'Маршрут закрыт',
    chatAvailable: 'Чат доступен',
    chatOnly: 'Только чат до подтверждения',
    lockedUntilConfirm: 'Закрыто до подтверждения мастером',
    paidDeposit: 'Депозит оплачен',
    masterMustConfirm: 'Мастер должен подтвердить',
  },
  UA: {
    title: 'Мої бронювання',
    subtitle: 'Статус бронювання, чат, адреса і доступ до контактів',
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
    total: 'Усього',
    activeNow: 'Активно зараз',
    menuClose: 'Закрити',
    menuCancel: 'Скасувати бронювання',
    menuOpenProfile: 'Відкрити профіль',
    provider: 'Спеціаліст',
    bookingSummary: 'Підсумок бронювання',
    dateTime: 'Дата і час',
    detailsUnlocked: 'Контакти відкрито',
    detailsLocked: 'Очікуємо підтвердження майстра',
    exactAddress: 'Точна адреса',
    area: 'Район',
    contactAndAddress: 'Контакти спеціаліста',
    phone: 'Телефон',
    email: 'Email',
    social: 'Соцмережі',
    openChat: 'Відкрити чат',
    callSeller: 'Подзвонити',
    routeToMaster: 'Маршрут',
    contactsHiddenTitle: 'Контакти закрито',
    contactsHiddenText:
      'Після оплати депозиту доступний тільки чат. Телефон, точна адреса і маршрут відкриються тільки після підтвердження бронювання майстром.',
    waitingMaster: 'Очікує підтвердження майстра',
    waitingPayment: 'Очікує оплату депозиту',
    lockedValue: 'Приховано',
    todayAt: 'Сьогодні о',
    tomorrowAt: 'Завтра о',
    noPhoneAction: 'Телефон закрито',
    noRouteAction: 'Маршрут закрито',
    chatAvailable: 'Чат доступний',
    chatOnly: 'Тільки чат до підтвердження',
    lockedUntilConfirm: 'Закрито до підтвердження майстром',
    paidDeposit: 'Депозит оплачено',
    masterMustConfirm: 'Майстер має підтвердити',
  },
};

const serviceNameMap: Record<string, Partial<Record<AppLanguage, string>>> = {
  Маникюр: { EN: 'Manicure', RU: 'Маникюр', UA: 'Манікюр' },
  Стрижка: { EN: 'Haircut', RU: 'Стрижка', UA: 'Стрижка' },
  Массаж: { EN: 'Massage', RU: 'Массаж', UA: 'Масаж' },
  Визаж: { EN: 'Makeup', RU: 'Визаж', UA: 'Візаж' },
  'Ремонт телефона': { EN: 'Phone repair', RU: 'Ремонт телефона', UA: 'Ремонт телефону' },
};

const monthMap: Record<string, Partial<Record<AppLanguage, string>>> = {
  января: { EN: 'January', RU: 'января', UA: 'січня' },
  февраля: { EN: 'February', RU: 'февраля', UA: 'лютого' },
  марта: { EN: 'March', RU: 'марта', UA: 'березня' },
  апреля: { EN: 'April', RU: 'апреля', UA: 'квітня' },
  мая: { EN: 'May', RU: 'мая', UA: 'травня' },
  июня: { EN: 'June', RU: 'июня', UA: 'червня' },
  июля: { EN: 'July', RU: 'июля', UA: 'липня' },
  августа: { EN: 'August', RU: 'августа', UA: 'серпня' },
  сентября: { EN: 'September', RU: 'сентября', UA: 'вересня' },
  октября: { EN: 'October', RU: 'октября', UA: 'жовтня' },
  ноября: { EN: 'November', RU: 'ноября', UA: 'листопада' },
  декабря: { EN: 'December', RU: 'декабря', UA: 'грудня' },
};

function getTexts(language: AppLanguage) {
  return pageTexts[language] || pageTexts.EN!;
}

function formatPrice(price: number) {
  return `£${Number(price || 0).toFixed(2)}`;
}

function translateServiceName(value: string, language: AppLanguage) {
  return serviceNameMap[value]?.[language] || serviceNameMap[value]?.EN || value;
}

function translateDateLabel(value: string, language: AppLanguage, text: PageTexts) {
  const source = String(value || '').trim();
  if (!source) return source;

  if (source.startsWith('Сегодня в ')) {
    return `${text.todayAt} ${source.replace('Сегодня в ', '').trim()}`;
  }

  if (source.startsWith('Завтра в ')) {
    return `${text.tomorrowAt} ${source.replace('Завтра в ', '').trim()}`;
  }

  const match = source.match(/^(\d{1,2})\s+([А-Яа-яё]+),\s*(\d{1,2}:\d{2})$/);
  if (match) {
    const [, day, rawMonth, time] = match;
    const month = monthMap[rawMonth.toLowerCase()];
    if (month) return `${day} ${month[language] || month.EN || rawMonth}, ${time}`;
  }

  return source;
}

function getStatusMeta(status: BookingStatus, text: PageTexts) {
  if (status === 'pending') {
    return {
      label: text.pending,
      bg: '#fff7cf',
      color: '#9a6b00',
      dot: '#ffd629',
    };
  }

  if (status === 'upcoming') {
    return {
      label: text.confirmed,
      bg: '#eef9f1',
      color: '#157a35',
      dot: '#21b84b',
    };
  }

  if (status === 'completed') {
    return {
      label: text.completedStatus,
      bg: '#eef4ff',
      color: '#1467f2',
      dot: '#1467f2',
    };
  }

  return {
    label: text.cancelledStatus,
    bg: '#fff0f0',
    color: '#d92f2f',
    dot: '#ff4b4b',
  };
}

function isBookingPaid(booking: BookingItem) {
  return Boolean(booking.clientPaid || booking.paymentReceivedByPlatform);
}

function canOpenChat(booking: BookingItem) {
  return booking.status !== 'cancelled' && isBookingPaid(booking);
}

function getBookingChatThreadId(booking: BookingItem) {
  const masterId = String(booking.masterId || '').trim();
  const bookingId = String(booking.id || '').trim();

  if (masterId) return `booking-master-${masterId}`;
  if (bookingId) return `booking-${bookingId}`;

  return `booking-chat-${Date.now()}`;
}

function IconBox({
  icon,
  bg,
  color,
}: {
  icon: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 900,
        flex: '0 0 auto',
      }}
    >
      {icon}
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [menuBookingId, setMenuBookingId] = useState<string | null>(null);
  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);

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
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      unsubscribeLanguage();
      unsubscribeBookings();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const text = useMemo(() => getTexts(language), [language]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return bookings.filter((item) => item.status === 'pending' || item.status === 'upcoming');
    }

    if (activeTab === 'completed') {
      return bookings.filter((item) => item.status === 'completed');
    }

    return bookings.filter((item) => item.status === 'cancelled');
  }, [activeTab, bookings]);

  const emptyText =
    activeTab === 'upcoming'
      ? text.emptyUpcoming
      : activeTab === 'completed'
      ? text.emptyCompleted
      : text.emptyCancelled;

  const activeNowCount = bookings.filter(
    (item) => item.status === 'pending' || item.status === 'upcoming'
  ).length;

  const selectedMenuBooking = bookings.find((item) => item.id === menuBookingId) ?? null;
  const selectedDetailsBooking = bookings.find((item) => item.id === detailsBookingId) ?? null;

  const handleOpenBookingDetails = (booking: BookingItem) => {
    setDetailsBookingId(booking.id);
    setMenuBookingId(null);
  };

  const handleCancelBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'cancelled');
    setMenuBookingId(null);

    if (detailsBookingId === booking.id) {
      setDetailsBookingId(null);
    }
  };

  const handleRebook = (booking: BookingItem) => {
    router.push(`/booking/${booking.masterId}`);
  };

  const handleOpenProfile = (booking: BookingItem) => {
    router.push(`/master/${booking.masterId}`);
    setMenuBookingId(null);
  };

  const handleOpenChat = (booking: BookingItem) => {
    if (!canOpenChat(booking)) return;

    const chatThread = getOrCreateChatThread({
      threadId: getBookingChatThreadId(booking),
      providerName: booking.masterName || text.provider,
      providerAvatar:
        booking.masterAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      category: booking.serviceName || 'Booking',
      online: true,
      lastSeenText: 'Online',
    });

    router.push(`/messages/${encodeURIComponent(chatThread.id)}`);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: BRAND.navy,
          paddingBottom: 112,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 18px 112px' }}>
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '46px 1fr 46px',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              aria-label={text.back}
              style={{
                width: 46,
                height: 46,
                border: 0,
                background: 'transparent',
                fontSize: 38,
                lineHeight: 1,
                color: BRAND.navy,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: BRAND.navy }}>Olamep</div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label={text.home}
              style={{
                width: 46,
                height: 46,
                border: 0,
                background: 'transparent',
                fontSize: 30,
                color: BRAND.navy,
                cursor: 'pointer',
              }}
            >
              ⌂
            </button>
          </header>

          <section style={{ marginTop: 26 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '-1.5px',
                color: BRAND.navy,
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '10px 0 0',
                fontSize: 17,
                lineHeight: 1.35,
                fontWeight: 600,
                color: '#555c68',
              }}
            >
              {text.subtitle}
            </p>
          </section>

          <section
            style={{
              marginTop: 18,
              borderRadius: 20,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 14,
              boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                border: '1.5px solid #d9dee8',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                  {text.activeNow}
                </div>
                <div style={{ marginTop: 4, fontSize: 30, fontWeight: 900, color: BRAND.navy }}>
                  {activeNowCount}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderLeft: '1.5px solid #d9dee8',
                  background: '#f5f7fb',
                }}
              >
                <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                  {text.total}
                </div>
                <div style={{ marginTop: 4, fontSize: 30, fontWeight: 900, color: BRAND.blue }}>
                  {bookings.length}
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              marginTop: 16,
              borderRadius: 20,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 8,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
            }}
          >
            {([
              ['upcoming', text.upcoming],
              ['completed', text.completed],
              ['cancelled', text.cancelled],
            ] as const).map(([tabKey, label]) => {
              const active = activeTab === tabKey;

              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  style={{
                    minHeight: 50,
                    borderRadius: 15,
                    border: `2px solid ${active ? BRAND.border : '#d9dee8'}`,
                    background: active ? BRAND.navy : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </section>

          <section style={{ marginTop: 18 }}>
            {filteredBookings.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: `2px solid ${BRAND.border}`,
                  borderRadius: 20,
                  padding: '28px 20px',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#6f7582',
                }}
              >
                {emptyText}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {filteredBookings.map((booking) => {
                  const statusMeta = getStatusMeta(booking.status, text);
                  const showCancelButton =
                    booking.status === 'pending' || booking.status === 'upcoming';
                  const publicLocation = getPublicBookingLocation(booking);
                  const paid = isBookingPaid(booking);
                  const chatEnabled = canOpenChat(booking);
                  const unlocked = canShowDirectContacts(booking) && canShowExactAddress(booking);

                  return (
                    <article
                      key={booking.id}
                      style={{
                        background: '#fff',
                        border: `2px solid ${BRAND.border}`,
                        borderRadius: 22,
                        padding: 14,
                        boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            minHeight: 36,
                            padding: '0 12px',
                            borderRadius: 999,
                            border: `2px solid ${BRAND.border}`,
                            background: statusMeta.bg,
                            color: statusMeta.color,
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: 999,
                              background: statusMeta.dot,
                              display: 'inline-block',
                            }}
                          />
                          {statusMeta.label}
                        </div>

                        <button
                          type="button"
                          onClick={() => setMenuBookingId(booking.id)}
                          style={{
                            border: `2px solid ${BRAND.border}`,
                            background: '#fff',
                            color: BRAND.navy,
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            fontSize: 20,
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        >
                          ⋯
                        </button>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '92px 1fr',
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
                            borderRadius: 16,
                            display: 'block',
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 20,
                              lineHeight: 1.1,
                              fontWeight: 900,
                              color: BRAND.navy,
                            }}
                          >
                            {booking.masterName}
                          </div>

                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#4f5663',
                            }}
                          >
                            {translateServiceName(booking.serviceName, language)}
                          </div>

                          <div
                            style={{
                              marginTop: 9,
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              gap: 7,
                              fontSize: 13,
                              fontWeight: 800,
                              color: BRAND.blue,
                            }}
                          >
                            <span>📅 {translateDateLabel(booking.dateLabel, language, text)}</span>
                          </div>

                          <div
                            style={{
                              marginTop: 7,
                              fontSize: 13,
                              fontWeight: 800,
                              color: '#626977',
                            }}
                          >
                            📍 {unlocked ? getVisibleBookingLocation(booking) : publicLocation}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 22,
                              fontWeight: 900,
                              color: BRAND.navy,
                            }}
                          >
                            {formatPrice(booking.price)}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          border: '1.5px solid #d9dee8',
                          borderRadius: 18,
                          overflow: 'hidden',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                        }}
                      >
                        <div style={{ padding: 12, background: paid ? '#eef9f1' : '#fff7cf' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                            {paid ? text.paidDeposit : text.waitingPayment}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              color: paid ? BRAND.green : '#9a6b00',
                              fontSize: 14,
                              lineHeight: 1.25,
                              fontWeight: 900,
                            }}
                          >
                            {paid ? text.chatAvailable : text.waitingPayment}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 12,
                            borderLeft: '1.5px solid #d9dee8',
                            background: unlocked ? '#eef9f1' : '#f5f7fb',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                            {unlocked ? text.detailsUnlocked : text.masterMustConfirm}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              color: unlocked ? BRAND.green : BRAND.blue,
                              fontSize: 14,
                              lineHeight: 1.25,
                              fontWeight: 900,
                            }}
                          >
                            {unlocked ? text.exactAddress : text.lockedUntilConfirm}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenBookingDetails(booking)}
                          style={{
                            minHeight: 54,
                            borderRadius: 16,
                            border: `2px solid ${BRAND.border}`,
                            background: '#ffffff',
                            color: BRAND.navy,
                            fontSize: 16,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {text.serviceDetails}
                        </button>

                        <button
                          type="button"
                          disabled={!chatEnabled}
                          onClick={() => handleOpenChat(booking)}
                          style={{
                            minHeight: 54,
                            borderRadius: 16,
                            border: `2px solid ${BRAND.green}`,
                            background: chatEnabled ? BRAND.green : '#edf2ee',
                            color: chatEnabled ? '#ffffff' : '#8b968e',
                            fontSize: 16,
                            fontWeight: 900,
                            cursor: chatEnabled ? 'pointer' : 'not-allowed',
                          }}
                        >
                          💬 {chatEnabled ? text.openChat : text.waitingPayment}
                        </button>

                        {showCancelButton ? (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking)}
                            style={{
                              minHeight: 52,
                              borderRadius: 16,
                              border: `2px solid ${BRAND.border}`,
                              background: '#fff0f0',
                              color: '#d92f2f',
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
                            onClick={() => handleRebook(booking)}
                            style={{
                              minHeight: 52,
                              borderRadius: 16,
                              border: `2px solid ${BRAND.border}`,
                              background: '#eef4ff',
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
                })}
              </div>
            )}
          </section>
        </div>

        <BottomNav active="bookings" />
      </main>

      {selectedMenuBooking ? (
        <div
          onClick={() => setMenuBookingId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.22)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: `2px solid ${BRAND.border}`,
                borderRadius: 22,
                padding: 14,
                display: 'grid',
                gap: 10,
                boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenBookingDetails(selectedMenuBooking)}
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffffff',
                  color: BRAND.navy,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.serviceDetails}
              </button>

              <button
                type="button"
                onClick={() => handleOpenProfile(selectedMenuBooking)}
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  border: `2px solid ${BRAND.border}`,
                  background: '#eef4ff',
                  color: BRAND.blue,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.menuOpenProfile}
              </button>

              {(selectedMenuBooking.status === 'pending' ||
                selectedMenuBooking.status === 'upcoming') && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedMenuBooking)}
                  style={{
                    minHeight: 54,
                    borderRadius: 16,
                    border: `2px solid ${BRAND.border}`,
                    background: '#fff0f0',
                    color: '#d92f2f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.menuCancel}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuBookingId(null)}
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.navy,
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.menuClose}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedDetailsBooking
        ? (() => {
            const detailsUnlocked =
              canShowExactAddress(selectedDetailsBooking) &&
              canShowDirectContacts(selectedDetailsBooking);
            const visibleAddress = getVisibleBookingLocation(selectedDetailsBooking);
            const safeArea = getPublicBookingLocation(selectedDetailsBooking);
            const protectedContacts = getProtectedBookingContact(selectedDetailsBooking);
            const paid = isBookingPaid(selectedDetailsBooking);
            const chatEnabled = canOpenChat(selectedDetailsBooking);

            return (
              <div
                onClick={() => setDetailsBookingId(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(17,17,17,0.22)',
                  zIndex: 220,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    maxWidth: 430,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      background: '#fff',
                      border: `2px solid ${BRAND.border}`,
                      borderRadius: 24,
                      padding: 16,
                      boxShadow: '0 22px 44px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '78px 1fr auto',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={
                          selectedDetailsBooking.masterAvatar ||
                          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={selectedDetailsBooking.masterName}
                        style={{
                          width: 78,
                          height: 78,
                          objectFit: 'cover',
                          borderRadius: 16,
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7582' }}>
                          {text.provider}
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 20,
                            lineHeight: 1.1,
                            fontWeight: 900,
                            color: BRAND.navy,
                          }}
                        >
                          {selectedDetailsBooking.masterName}
                        </div>

                        <div
                          style={{
                            marginTop: 5,
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#4f5663',
                          }}
                        >
                          {translateServiceName(selectedDetailsBooking.serviceName, language)}
                        </div>
                      </div>

                      <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.navy }}>
                        {formatPrice(selectedDetailsBooking.price)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
                      <section
                        style={{
                          border: `2px solid ${BRAND.border}`,
                          borderRadius: 20,
                          padding: 14,
                          background: '#fff',
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
                          {text.bookingSummary}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            border: '1.5px solid #d9dee8',
                            borderRadius: 18,
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ padding: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                              {text.dateTime}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 16,
                                lineHeight: 1.35,
                                fontWeight: 900,
                                color: BRAND.blue,
                              }}
                            >
                              {translateDateLabel(selectedDetailsBooking.dateLabel, language, text)}
                            </div>
                          </div>

                          <div
                            style={{
                              padding: 12,
                              borderLeft: '1.5px solid #d9dee8',
                              background: '#f5f7fb',
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                              {text.total}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 22,
                                fontWeight: 900,
                                color: BRAND.navy,
                              }}
                            >
                              {formatPrice(selectedDetailsBooking.price)}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            border: `2px solid ${BRAND.border}`,
                            borderRadius: 18,
                            padding: 14,
                            background: detailsUnlocked ? '#eef9f1' : '#f5f7fb',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 900,
                              color: detailsUnlocked ? BRAND.green : BRAND.blue,
                            }}
                          >
                            {detailsUnlocked ? text.detailsUnlocked : text.detailsLocked}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 14,
                              fontWeight: 800,
                              lineHeight: 1.45,
                              color: '#515866',
                            }}
                          >
                            {detailsUnlocked
                              ? `${text.exactAddress}: ${visibleAddress}`
                              : `${text.area}: ${safeArea}`}
                          </div>
                        </div>
                      </section>

                      <section
                        style={{
                          border: `2px solid ${BRAND.border}`,
                          borderRadius: 20,
                          padding: 14,
                          background: '#fff',
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
                          {text.contactAndAddress}
                        </div>

                        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                          <div
                            style={{
                              border: '1.5px solid #d9dee8',
                              borderRadius: 16,
                              padding: 12,
                              display: 'grid',
                              gridTemplateColumns: '42px 1fr',
                              gap: 12,
                              alignItems: 'center',
                              opacity: detailsUnlocked ? 1 : 0.55,
                            }}
                          >
                            <IconBox icon="📍" bg="#fff5e8" color="#d68612" />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                                {detailsUnlocked ? text.exactAddress : text.area}
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: BRAND.navy,
                                }}
                              >
                                {detailsUnlocked ? visibleAddress : safeArea}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              border: '1.5px solid #d9dee8',
                              borderRadius: 16,
                              padding: 12,
                              display: 'grid',
                              gridTemplateColumns: '42px 1fr',
                              gap: 12,
                              alignItems: 'center',
                              opacity: detailsUnlocked ? 1 : 0.55,
                            }}
                          >
                            <IconBox icon="📞" bg="#eef9f1" color={BRAND.green} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                                {text.phone}
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: BRAND.navy,
                                }}
                              >
                                {detailsUnlocked
                                  ? protectedContacts.phone || text.lockedValue
                                  : text.lockedValue}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              border: '1.5px solid #d9dee8',
                              borderRadius: 16,
                              padding: 12,
                              display: 'grid',
                              gridTemplateColumns: '42px 1fr',
                              gap: 12,
                              alignItems: 'center',
                              opacity: detailsUnlocked ? 1 : 0.55,
                            }}
                          >
                            <IconBox icon="✉️" bg="#eef4ff" color={BRAND.blue} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                                {text.email}
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: BRAND.navy,
                                }}
                              >
                                {detailsUnlocked
                                  ? protectedContacts.email || text.lockedValue
                                  : text.lockedValue}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              border: '1.5px solid #d9dee8',
                              borderRadius: 16,
                              padding: 12,
                              display: 'grid',
                              gridTemplateColumns: '42px 1fr',
                              gap: 12,
                              alignItems: 'center',
                              opacity: detailsUnlocked ? 1 : 0.55,
                            }}
                          >
                            <IconBox icon="💬" bg="#fff1f7" color={BRAND.pink} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#6f7582' }}>
                                {text.social}
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: BRAND.navy,
                                }}
                              >
                                {detailsUnlocked
                                  ? [
                                      protectedContacts.whatsapp,
                                      protectedContacts.telegram,
                                      protectedContacts.instagram,
                                    ]
                                      .filter(Boolean)
                                      .join(' • ') || text.lockedValue
                                  : text.lockedValue}
                              </div>
                            </div>
                          </div>
                        </div>

                        {!detailsUnlocked ? (
                          <div
                            style={{
                              marginTop: 14,
                              border: `2px solid ${BRAND.border}`,
                              borderRadius: 18,
                              padding: 14,
                              background: '#fff7cf',
                            }}
                          >
                            <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.navy }}>
                              {text.contactsHiddenTitle}
                            </div>

                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 13,
                                lineHeight: 1.45,
                                fontWeight: 800,
                                color: '#515866',
                              }}
                            >
                              {text.contactsHiddenText}
                            </div>

                            <div
                              style={{
                                marginTop: 10,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  minHeight: 34,
                                  padding: '0 10px',
                                  borderRadius: 999,
                                  border: `2px solid ${BRAND.border}`,
                                  background: paid ? '#eef9f1' : '#eef4ff',
                                  color: paid ? BRAND.green : BRAND.blue,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontSize: 12,
                                  fontWeight: 900,
                                }}
                              >
                                {paid ? text.paidDeposit : text.waitingPayment}
                              </span>

                              <span
                                style={{
                                  minHeight: 34,
                                  padding: '0 10px',
                                  borderRadius: 999,
                                  border: `2px solid ${BRAND.border}`,
                                  background: '#f5f7fb',
                                  color: BRAND.blue,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontSize: 12,
                                  fontWeight: 900,
                                }}
                              >
                                {text.waitingMaster}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        <div
                          style={{
                            marginTop: 14,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                          }}
                        >
                          <button
                            type="button"
                            disabled={!chatEnabled}
                            onClick={() => handleOpenChat(selectedDetailsBooking)}
                            style={{
                              minHeight: 54,
                              borderRadius: 16,
                              border: `2px solid ${BRAND.green}`,
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
                            disabled={!detailsUnlocked || !protectedContacts.phone}
                            onClick={() => {
                              if (!detailsUnlocked || !protectedContacts.phone) return;
                              window.location.href = `tel:${protectedContacts.phone}`;
                            }}
                            style={{
                              minHeight: 54,
                              borderRadius: 16,
                              border: `2px solid ${BRAND.border}`,
                              background:
                                detailsUnlocked && protectedContacts.phone ? '#eef9f1' : '#f5f7fb',
                              color:
                                detailsUnlocked && protectedContacts.phone ? BRAND.green : '#9ca3af',
                              fontSize: 15,
                              fontWeight: 900,
                              cursor:
                                detailsUnlocked && protectedContacts.phone ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {detailsUnlocked && protectedContacts.phone
                              ? text.callSeller
                              : text.noPhoneAction}
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={!detailsUnlocked}
                          onClick={() => {
                            if (!detailsUnlocked) return;

                            const destination = encodeURIComponent(visibleAddress);
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${destination}`,
                              '_blank'
                            );
                          }}
                          style={{
                            marginTop: 10,
                            width: '100%',
                            minHeight: 56,
                            borderRadius: 16,
                            border: `2px solid ${BRAND.border}`,
                            background: detailsUnlocked ? '#eef4ff' : '#f5f7fb',
                            color: detailsUnlocked ? BRAND.blue : '#9ca3af',
                            fontSize: 16,
                            fontWeight: 900,
                            cursor: detailsUnlocked ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {detailsUnlocked ? text.routeToMaster : text.noRouteAction}
                        </button>
                      </section>

                      <button
                        type="button"
                        onClick={() => setDetailsBookingId(null)}
                        style={{
                          minHeight: 56,
                          width: '100%',
                          borderRadius: 16,
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

                      {(selectedDetailsBooking.status === 'completed' ||
                        selectedDetailsBooking.status === 'cancelled') && (
                        <button
                          type="button"
                          onClick={() => handleRebook(selectedDetailsBooking)}
                          style={{
                            minHeight: 56,
                            width: '100%',
                            borderRadius: 16,
                            border: `2px solid ${BRAND.border}`,
                            background: '#eef4ff',
                            color: BRAND.blue,
                            fontSize: 16,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {text.rebook}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        : null}
    </>
  );
}
