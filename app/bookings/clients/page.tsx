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
  type BookingItem,
} from '../../services/bookingsStore';

type ClientBookingStatus =
  | 'request'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'quick'
  | 'blocked';

type CalendarDayState = 'free' | 'full' | 'partial' | 'off' | 'request';

type ClientBooking = {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  day: number;
  time: string;
  duration: string;
  price: number;
  status: ClientBookingStatus;
  bookingType: 'normal' | 'quick';
  paymentMethod: 'OlaCash' | 'Card' | 'Cash' | 'Crypto' | 'QR';
  holdClient: number;
  holdMaster: number;
  note: string;
  registeredClient: boolean;
  sourceBooking?: BookingItem;
};

const baseTexts = {
  title: 'My clients',
  subtitle: 'Bookings, client requests, calendar and fast payments',
  today: 'Today',
  requests: 'Requests',
  calendar: 'Calendar',
  history: 'History',
  search: 'Search client, service, amount',
  activeToday: 'Active today',
  confirmed: 'Confirmed',
  quickBooking: 'Quick booking',
  request: 'Request',
  completed: 'Completed',
  cancelled: 'Cancelled',
  free: 'Free',
  full: 'Full',
  partial: 'Partial',
  off: 'Off',
  clientCard: 'Client card',
  service: 'Service',
  time: 'Time',
  price: 'Price',
  payment: 'Payment',
  holds: 'Holds',
  cancel: 'Cancel',
  close: 'Close',
  empty: 'No client bookings for this day',
  home: 'Home',
  tapToEdit: 'Tap any row to edit',
  move: 'Move',
  moveUp: 'Move up',
  moveDown: 'Move down',
  contact: 'Contact',
  phone: 'Phone',
  email: 'E-mail',
  message: 'Message',
  olamepManager: 'Olamep manager',
  managerOnly:
    'Quick booking without registration. Communication is available only through the internal Olamep manager.',
  registeredContact: 'Registered client. Available contact channels are shown below.',
  editValue: 'Edit value',
  save: 'Save',
  selectTime: 'Select time',
  cancelBooking: 'Cancel booking',
  confirmRequest: 'Confirm request',
  markComplete: 'Mark complete',
};

const textOverrides: Partial<Record<AppLanguage, Partial<typeof baseTexts>>> = {
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони, запросы клиентов, календарь и быстрые платежи',
    today: 'Сегодня',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    search: 'Поиск клиент, услуга, сумма',
    activeToday: 'Активно сегодня',
    confirmed: 'Подтверждено',
    quickBooking: 'Быстрая бронь',
    request: 'Запрос',
    completed: 'Завершено',
    cancelled: 'Отменено',
    free: 'Свободно',
    full: 'Полная бронь',
    partial: 'Частично',
    off: 'Нерабочий',
    clientCard: 'Карточка клиента',
    service: 'Услуга',
    time: 'Время',
    price: 'Сумма',
    payment: 'Оплата',
    holds: 'Заморозка',
    cancel: 'Отмена',
    close: 'Закрыть',
    empty: 'На этот день нет записей клиентов',
    home: 'Главная',
    tapToEdit: 'Нажмите на строку, чтобы изменить',
    move: 'Переместить',
    moveUp: 'Выше',
    moveDown: 'Ниже',
    contact: 'Связь',
    phone: 'Телефон',
    email: 'E-mail',
    message: 'Написать',
    olamepManager: 'Менеджер Olamep',
    managerOnly:
      'Быстрая бронь без регистрации. Связь доступна только через внутреннего менеджера Olamep.',
    registeredContact: 'Зарегистрированный клиент. Доступные способы связи ниже.',
    editValue: 'Изменить значение',
    save: 'Сохранить',
    selectTime: 'Выбрать время',
    cancelBooking: 'Отменить бронь',
    confirmRequest: 'Подтвердить запрос',
    markComplete: 'Завершить',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Броні, запити клієнтів, календар і швидкі платежі',
    today: 'Сьогодні',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    search: 'Пошук клієнт, послуга, сума',
    activeToday: 'Активно сьогодні',
    confirmed: 'Підтверджено',
    quickBooking: 'Швидка бронь',
    request: 'Запит',
    completed: 'Завершено',
    cancelled: 'Скасовано',
    price: 'Сума',
    message: 'Написати',
    moveUp: 'Вище',
    moveDown: 'Нижче',
    managerOnly:
      'Швидка бронь без реєстрації. Зв’язок доступний тільки через внутрішнього менеджера Olamep.',
  },
  ES: {
    title: 'Mis clientes',
    subtitle: 'Reservas, solicitudes, calendario y pagos rápidos',
    today: 'Hoy',
    requests: 'Solicitudes',
    calendar: 'Calendario',
    history: 'Historial',
    activeToday: 'Activo hoy',
    confirmed: 'Confirmado',
    quickBooking: 'Reserva rápida',
    request: 'Solicitud',
    completed: 'Completado',
    cancelled: 'Cancelado',
    price: 'Importe',
    message: 'Mensaje',
  },
  CZ: {
    title: 'Moji klienti',
    subtitle: 'Rezervace, požadavky, kalendář a rychlé platby',
    today: 'Dnes',
    requests: 'Požadavky',
    calendar: 'Kalendář',
    history: 'Historie',
    activeToday: 'Aktivní dnes',
    confirmed: 'Potvrzeno',
    quickBooking: 'Rychlá rezervace',
    request: 'Požadavek',
    completed: 'Dokončeno',
    cancelled: 'Zrušeno',
    price: 'Částka',
    message: 'Napsat',
  },
  DE: {
    title: 'Meine Kunden',
    subtitle: 'Buchungen, Anfragen, Kalender und Schnellzahlungen',
    today: 'Heute',
    requests: 'Anfragen',
    calendar: 'Kalender',
    history: 'Verlauf',
    activeToday: 'Heute aktiv',
    confirmed: 'Bestätigt',
    quickBooking: 'Schnellbuchung',
    request: 'Anfrage',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    price: 'Betrag',
    message: 'Schreiben',
  },
  IT: {
    title: 'I miei clienti',
    today: 'Oggi',
    requests: 'Richieste',
    calendar: 'Calendario',
    history: 'Storico',
    message: 'Scrivi',
  },
  FR: {
    title: 'Mes clients',
    today: 'Aujourd’hui',
    requests: 'Demandes',
    calendar: 'Calendrier',
    history: 'Historique',
    message: 'Écrire',
  },
  AR: {
    title: 'عملائي',
    today: 'اليوم',
    requests: 'الطلبات',
    calendar: 'التقويم',
    history: 'السجل',
    message: 'رسالة',
  },
  PL: {
    title: 'Moi klienci',
    today: 'Dzisiaj',
    requests: 'Zapytania',
    calendar: 'Kalendarz',
    history: 'Historia',
    message: 'Napisz',
  },
};

const demoClients: ClientBooking[] = [
  {
    id: 'provider-demo-1',
    clientName: 'Anna Brown',
    clientAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    clientPhone: '+44 7700 900123',
    clientEmail: 'anna@example.com',
    serviceName: 'Haircut',
    date: '2026-04-25',
    day: 25,
    time: '15:00',
    duration: '45 min',
    price: 35,
    status: 'confirmed',
    bookingType: 'normal',
    paymentMethod: 'OlaCash',
    holdClient: 1,
    holdMaster: 1,
    note: 'Client wants a clean bob haircut.',
    registeredClient: true,
  },
  {
    id: 'provider-demo-2',
    clientName: 'Sofia Miller',
    clientAvatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    clientPhone: '',
    clientEmail: '',
    serviceName: 'Keratin extensions',
    date: '2026-04-25',
    day: 25,
    time: '17:30',
    duration: '2h',
    price: 120,
    status: 'quick',
    bookingType: 'quick',
    paymentMethod: 'Card',
    holdClient: 1,
    holdMaster: 1,
    note: 'Quick booking without registered client profile.',
    registeredClient: false,
  },
  {
    id: 'provider-demo-3',
    clientName: 'Mia Johnson',
    clientAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    clientPhone: '+44 7700 900789',
    clientEmail: 'mia@example.com',
    serviceName: 'Makeup',
    date: '2026-04-26',
    day: 26,
    time: '11:00',
    duration: '1h',
    price: 50,
    status: 'request',
    bookingType: 'normal',
    paymentMethod: 'QR',
    holdClient: 1,
    holdMaster: 0,
    note: 'Waiting for provider confirmation.',
    registeredClient: true,
  },
];

function getTexts(language: AppLanguage) {
  return {
    ...baseTexts,
    ...(textOverrides[language] || {}),
  };
}

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

function mapBookingsToProviderClients(bookings: BookingItem[]): ClientBooking[] {
  if (!bookings.length) return demoClients;

  return bookings.map((booking, index) => {
    const anyBooking = booking as any;
    const status: ClientBookingStatus =
      booking.status === 'pending'
        ? index % 2 === 0
          ? 'request'
          : 'quick'
        : booking.status === 'upcoming'
        ? 'confirmed'
        : booking.status === 'completed'
        ? 'completed'
        : 'cancelled';

    const quick = status === 'quick';
    const registeredClient = !quick && anyBooking.registeredClient !== false;

    return {
      id: String(booking.id || `provider-${index}`),
      clientName:
        anyBooking.clientName ||
        anyBooking.customerName ||
        anyBooking.userName ||
        ['Anna Brown', 'Sofia Miller', 'Mia Johnson', 'Olivia Smith'][index % 4],
      clientAvatar:
        anyBooking.clientAvatar ||
        anyBooking.customerAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      clientPhone: registeredClient ? anyBooking.clientPhone || '+44 7700 900123' : '',
      clientEmail: registeredClient ? anyBooking.clientEmail || 'client@example.com' : '',
      serviceName: String(booking.serviceName || 'Service'),
      date: anyBooking.date || '2026-04-25',
      day: Number(anyBooking.day || 25 + (index % 4)),
      time: String(anyBooking.time || anyBooking.timeLabel || booking.dateLabel || '15:00').slice(
        -5
      ),
      duration: anyBooking.duration || '1h',
      price: Number(booking.price || 45),
      status,
      bookingType: quick ? 'quick' : 'normal',
      paymentMethod: index % 3 === 0 ? 'OlaCash' : index % 3 === 1 ? 'Card' : 'QR',
      holdClient: 1,
      holdMaster: status === 'request' ? 0 : 1,
      note: anyBooking.note || 'Booking synced from customer booking list.',
      registeredClient,
      sourceBooking: booking,
    };
  });
}

function getStatusStyle(status: ClientBookingStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'request') {
    return { label: text.request, bg: '#fff0da', color: '#a96a00' };
  }

  if (status === 'quick') {
    return { label: `⚡ ${text.quickBooking}`, bg: '#ffe7e7', color: '#c74343' };
  }

  if (status === 'confirmed') {
    return { label: text.confirmed, bg: '#e6efff', color: '#245cc9' };
  }

  if (status === 'completed') {
    return { label: text.completed, bg: '#dff2e3', color: '#1d7a38' };
  }

  return { label: text.cancelled, bg: '#fde5e5', color: '#c74343' };
}

function getDayState(day: number, clients: ClientBooking[]): CalendarDayState {
  if ([7, 14, 21, 28].includes(day)) return 'off';

  const bookingsForDay = clients.filter((item) => item.day === day);

  if (bookingsForDay.some((item) => item.status === 'request' || item.status === 'quick')) {
    return 'request';
  }

  if (bookingsForDay.length >= 3) return 'full';
  if (bookingsForDay.length > 0) return 'partial';

  return 'free';
}

function getDayColor(state: CalendarDayState) {
  if (state === 'full') return '#dff2e3';
  if (state === 'partial') return '#eeeeee';
  if (state === 'off') return '#fde5e5';
  if (state === 'request') return '#fff0da';
  return '#ffffff';
}

function getDayBorder(state: CalendarDayState) {
  if (state === 'full') return '#2ca24d';
  if (state === 'partial') return '#9ca3af';
  if (state === 'off') return '#e04b4b';
  if (state === 'request') return '#f0b429';
  return '#111111';
}

function SupportMiniIcon() {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: '2px solid #111111',
        background: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      ☎
    </span>
  );
}

export default function ProviderClientsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeView, setActiveView] = useState<'today' | 'requests' | 'calendar' | 'history'>(
    'calendar'
  );
  const [selectedDay, setSelectedDay] = useState(25);
  const [selectedTime, setSelectedTime] = useState('15:00');
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [localOrder, setLocalOrder] = useState<string[]>([]);

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

    return () => {
      unsubscribeLanguage();
      unsubscribeBookings();
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(() => getTexts(language), [language]);

  const clients = useMemo(() => mapBookingsToProviderClients(bookings), [bookings]);

  useEffect(() => {
    setLocalOrder((current) => {
      const ids = clients.map((item) => item.id);
      const kept = current.filter((id) => ids.includes(id));
      const missing = ids.filter((id) => !kept.includes(id));
      return [...kept, ...missing];
    });
  }, [clients]);

  const orderedClients = useMemo(() => {
    if (!localOrder.length) return clients;

    return [...clients].sort((a, b) => {
      const aIndex = localOrder.indexOf(a.id);
      const bIndex = localOrder.indexOf(b.id);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [clients, localOrder]);

  const visibleClients = useMemo(() => {
    let source = orderedClients;

    if (activeView === 'today') {
      source = source.filter((item) => item.day === 25);
    }

    if (activeView === 'requests') {
      source = source.filter((item) => item.status === 'request' || item.status === 'quick');
    }

    if (activeView === 'calendar') {
      source = source.filter((item) => item.day === selectedDay);
    }

    if (activeView === 'history') {
      source = source.filter((item) => item.status === 'completed' || item.status === 'cancelled');
    }

    const q = search.trim().toLowerCase();

    if (!q) return source;

    return source.filter((item) => {
      return (
        item.clientName.toLowerCase().includes(q) ||
        item.serviceName.toLowerCase().includes(q) ||
        String(item.price).includes(q) ||
        item.time.toLowerCase().includes(q) ||
        item.paymentMethod.toLowerCase().includes(q)
      );
    });
  }, [activeView, orderedClients, search, selectedDay]);

  const selectedClient = clients.find((item) => item.id === selectedClientId) || null;

  const activeTodayCount = clients.filter(
    (item) => item.day === 25 && item.status !== 'cancelled'
  ).length;

  const requestCount = clients.filter(
    (item) => item.status === 'request' || item.status === 'quick'
  ).length;

  const moveClient = (clientId: string, direction: 'up' | 'down') => {
    setLocalOrder((current) => {
      const ids = current.length ? [...current] : clients.map((item) => item.id);
      const index = ids.indexOf(clientId);
      if (index === -1) return ids;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= ids.length) return ids;

      const copy = [...ids];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, item);

      return copy;
    });
  };

  const handleConfirm = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'upcoming');
    }
    setSelectedClientId(null);
  };

  const handleComplete = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'completed');
    }
    setSelectedClientId(null);
  };

  const handleCancel = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'cancelled');
    }
    setSelectedClientId(null);
  };

  const openEditRow = (row: string, value: string) => {
    setEditingRow(row);
    setEditValue(value);
  };

  const closeEditRow = () => {
    setEditingRow(null);
    setEditValue('');
  };

  const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:30', '19:00'];

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: '#17130f',
          paddingBottom: 120,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 120px' }}>
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr 54px',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 26,
                color: '#17130f',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                {text.title}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12.5,
                  color: '#7b7268',
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {text.subtitle}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label={text.home}
              style={{
                width: 54,
                height: 54,
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
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fffefa',
                padding: 14,
                boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: '#fff0da',
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#8b7355', fontWeight: 900 }}>
                    {text.activeToday}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
                    {activeTodayCount}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: '#e6efff',
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#2559b7', fontWeight: 900 }}>
                    {text.requests}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
                    {requestCount}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
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
                borderRadius: 24,
                padding: 7,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 7,
              }}
            >
              {([
                ['today', text.today],
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
                      minHeight: 48,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#ffffff',
                      color: active ? '#ffffff' : '#17130f',
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
          </section>

          {activeView === 'calendar' ? (
            <section style={{ marginTop: 14 }}>
              <div
                style={{
                  borderRadius: 30,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 8,
                  }}
                >
                  {Array.from({ length: 35 }).map((_, index) => {
                    const day = index + 1;
                    const state = getDayState(day, clients);
                    const active = selectedDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        style={{
                          minHeight: 42,
                          borderRadius: 14,
                          border: active
                            ? '3px solid #111111'
                            : `2px solid ${getDayBorder(state)}`,
                          background: getDayColor(state),
                          color: '#17130f',
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {day}

                        {state === 'request' ? (
                          <span
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 5,
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: '#ff4b52',
                              border: '1px solid #111111',
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {timeSlots.map((slot) => {
                    const active = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          minHeight: 42,
                          borderRadius: 999,
                          border: '2px solid #111111',
                          background: active ? '#2578ff' : '#ffffff',
                          color: active ? '#ffffff' : '#17130f',
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          <section style={{ marginTop: 16 }}>
            {visibleClients.length === 0 ? (
              <div
                style={{
                  borderRadius: 28,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 24,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#6f675f',
                }}
              >
                {text.empty}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {visibleClients.map((client) => {
                  const meta = getStatusStyle(client.status, text);

                  return (
                    <article
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      style={{
                        borderRadius: 30,
                        border: '2px solid #111111',
                        background: '#ffffff',
                        padding: 14,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '68px 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={client.clientAvatar}
                          alt={client.clientName}
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 20,
                            objectFit: 'cover',
                            border: '2px solid #111111',
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              minHeight: 28,
                              padding: '0 10px',
                              borderRadius: 999,
                              border: '2px solid #111111',
                              background: meta.bg,
                              color: meta.color,
                              fontSize: 11,
                              fontWeight: 900,
                              marginBottom: 7,
                            }}
                          >
                            {meta.label}
                          </div>

                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#17130f',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {client.clientName}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              fontWeight: 800,
                              color: '#6f675f',
                            }}
                          >
                            {client.time} · {client.serviceName}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 15,
                              fontWeight: 1000,
                              color: '#ef3e36',
                            }}
                          >
                            {money(client.price)}
                          </div>
                        </div>

                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            border: '2px solid #111111',
                            background: '#ffffff',
                            fontSize: 20,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#17130f',
                          }}
                        >
                          ›
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <BottomNav active="clients" />
      </main>

      {selectedClient ? (
        <div
          onClick={() => setSelectedClientId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.28)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingTop: 72,
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              maxHeight: 'calc(100vh - 92px)',
              overflowY: 'auto',
              padding: '0 14px calc(28px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 16,
                boxShadow: '0 22px 44px rgba(0,0,0,0.2)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '76px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <img
                  src={selectedClient.clientAvatar}
                  alt={selectedClient.clientName}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    objectFit: 'cover',
                    border: '2px solid #111111',
                  }}
                />

                <div>
                  <div style={{ fontSize: 13, color: '#8b8277', fontWeight: 900 }}>
                    {text.clientCard}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 20,
                      color: '#17130f',
                      fontWeight: 900,
                    }}
                  >
                    {selectedClient.clientName}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      color: '#6f675f',
                      fontWeight: 800,
                    }}
                  >
                    {selectedClient.registeredClient ? text.registeredContact : text.managerOnly}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientId(null)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 20,
                  border: '2px dashed #111111',
                  background: '#fffefa',
                  padding: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: '#6f675f',
                  fontWeight: 800,
                }}
              >
                {text.tapToEdit}
              </div>

              <div
                style={{
                  marginTop: 12,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#8b8277',
                    fontWeight: 900,
                    marginBottom: 10,
                  }}
                >
                  {text.move}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => moveClient(selectedClient.id, 'up')}
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      color: '#17130f',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.moveUp}
                  </button>

                  <button
                    type="button"
                    onClick={() => moveClient(selectedClient.id, 'down')}
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      color: '#17130f',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.moveDown}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                {[
                  [text.service, selectedClient.serviceName],
                  [text.time, `${selectedClient.time} · ${selectedClient.duration}`],
                  [text.price, money(selectedClient.price)],
                  [text.payment, selectedClient.paymentMethod],
                  [
                    text.holds,
                    `Client £${selectedClient.holdClient} · Master £${selectedClient.holdMaster}`,
                  ],
                ].map(([label, value]) => {
                  const rowKey = String(label);
                  const isPrice = label === text.price;
                  const isTime = label === text.time;
                  const active = editingRow === rowKey;

                  return (
                    <div
                      key={label}
                      onClick={() => openEditRow(rowKey, String(value))}
                      style={{
                        borderRadius: 20,
                        border: active
                          ? '2px solid #2578ff'
                          : isTime
                          ? '2px solid #2578ff'
                          : '2px solid #111111',
                        background: active ? '#eaf3ff' : isTime ? '#f0f6ff' : '#ffffff',
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 900 }}>
                        {label}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: isPrice ? 22 : 15,
                          color: isPrice ? '#ef3e36' : '#17130f',
                          fontWeight: 1000,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 1000,
                    color: '#17130f',
                    marginBottom: 10,
                  }}
                >
                  {text.contact}
                </div>

                {selectedClient.registeredClient ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div
                      style={{
                        borderRadius: 18,
                        border: '2px solid #111111',
                        padding: '11px 12px',
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {text.phone}: {selectedClient.clientPhone}
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        border: '2px solid #111111',
                        padding: '11px 12px',
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {text.email}: {selectedClient.clientEmail}
                    </div>

                    <button
                      type="button"
                      style={{
                        minHeight: 50,
                        borderRadius: 18,
                        border: '2px solid #111111',
                        background: '#ffe44d',
                        color: '#17130f',
                        fontSize: 15,
                        fontWeight: 1000,
                        cursor: 'pointer',
                      }}
                    >
                      ✉ {text.message}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#ffe44d',
                      padding: 12,
                      color: '#17130f',
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    <SupportMiniIcon />
                    <span>{text.olamepManager}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 12,
                  borderRadius: 20,
                  border: '2px dashed #111111',
                  background: '#fffefa',
                  padding: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: '#6f675f',
                  fontWeight: 800,
                }}
              >
                {selectedClient.note}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 10,
                }}
              >
                {(selectedClient.status === 'request' || selectedClient.status === 'quick') && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(selectedClient)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#e6efff',
                      color: '#245cc9',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.confirmRequest}
                  </button>
                )}

                {selectedClient.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(selectedClient)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#dff2e3',
                      color: '#1d7a38',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.markComplete}
                  </button>
                )}

                {(selectedClient.status === 'request' ||
                  selectedClient.status === 'quick' ||
                  selectedClient.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => handleCancel(selectedClient)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#ff4b52',
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 1000,
                      cursor: 'pointer',
                    }}
                  >
                    {text.cancelBooking}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editingRow ? (
        <div
          onClick={closeEditRow}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.25)',
            zIndex: 1500,
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
              padding: '0 14px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 16,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 1000, color: '#17130f' }}>
                {text.editValue}
              </div>

              <input
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                autoFocus
                style={{
                  marginTop: 14,
                  width: '100%',
                  height: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  padding: '0 14px',
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#17130f',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              <button
                type="button"
                onClick={closeEditRow}
                style={{
                  marginTop: 14,
                  width: '100%',
                  minHeight: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#2578ff',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 1000,
                  cursor: 'pointer',
                }}
              >
                {text.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
