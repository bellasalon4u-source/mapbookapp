'use client';

import { useEffect, useMemo, useState } from 'react';
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
  type BookingItem,
} from '../../../services/bookingsStore';

type ClientStatus = 'active' | 'new' | 'returning' | 'completed';
type ClientFilter = 'all' | 'active' | 'returning' | 'new' | 'completed';

type ClientItem = {
  id: string;
  name: string;
  avatar: string;
  service: string;
  lastBooking: string;
  totalSpent: number;
  bookingsCount: number;
  status: ClientStatus;
  completed: boolean;
  lastBookingId?: string;
  masterId?: string;
};

type ClientsText = {
  title: string;
  subtitle: string;
  search: string;
  totalClients: string;
  activeClients: string;
  totalRevenue: string;
  repeatClients: string;
  allLabel: string;
  newLabel: string;
  activeLabel: string;
  returningLabel: string;
  completedLabel: string;
  bookings: string;
  spent: string;
  lastBooking: string;
  message: string;
  viewBookings: string;
  noClients: string;
  noClientsHint: string;
  back: string;
  close: string;
  calendarLinked: string;
  synced: string;
  requests: string;
  history: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  cream: '#fff4dc',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
  softOrange: '#fff0da',
  bg: '#ffffff',
  border: '#050505',
  muted: '#657080',
};

const clientsTexts: Record<AppLanguage, ClientsText> = {
  EN: {
    title: 'My clients',
    subtitle: 'Bookings, requests, calendar and quick client history',
    search: 'Search clients, services...',
    totalClients: 'Total clients',
    activeClients: 'Active',
    totalRevenue: 'Revenue',
    repeatClients: 'Repeat clients',
    allLabel: 'All',
    newLabel: 'New',
    activeLabel: 'Active',
    returningLabel: 'Repeat',
    completedLabel: 'Completed',
    bookings: 'bookings',
    spent: 'spent',
    lastBooking: 'Last booking',
    message: 'Message',
    viewBookings: 'Bookings',
    noClients: 'No clients yet',
    noClientsHint: 'When someone books your service, clients will appear here.',
    back: 'Back',
    close: 'Close',
    calendarLinked: 'Calendar linked',
    synced: 'Synchronized',
    requests: 'Requests',
    history: 'History',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрая история клиентов',
    search: 'Поиск клиентов, услуг...',
    totalClients: 'Всего клиентов',
    activeClients: 'Активные',
    totalRevenue: 'Доход',
    repeatClients: 'Повторные',
    allLabel: 'Все',
    newLabel: 'Новые',
    activeLabel: 'Активные',
    returningLabel: 'Повторные',
    completedLabel: 'Готовые',
    bookings: 'брони',
    spent: 'потрачено',
    lastBooking: 'Последняя бронь',
    message: 'Сообщение',
    viewBookings: 'Брони',
    noClients: 'Клиентов пока нет',
    noClientsHint: 'Когда кто-то забронирует вашу услугу, клиенты появятся здесь.',
    back: 'Назад',
    close: 'Закрыть',
    calendarLinked: 'Связано с календарём',
    synced: 'Синхронизировано',
    requests: 'Запросы',
    history: 'История',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Бронювання у мене, запити, календар і швидка історія клієнтів',
    search: 'Пошук клієнтів, послуг...',
    totalClients: 'Усього клієнтів',
    activeClients: 'Активні',
    totalRevenue: 'Дохід',
    repeatClients: 'Повторні',
    allLabel: 'Усі',
    newLabel: 'Нові',
    activeLabel: 'Активні',
    returningLabel: 'Повторні',
    completedLabel: 'Готові',
    bookings: 'броні',
    spent: 'витрачено',
    lastBooking: 'Остання бронь',
    message: 'Повідомлення',
    viewBookings: 'Броні',
    noClients: 'Клієнтів поки немає',
    noClientsHint: 'Коли хтось забронює вашу послугу, клієнти зʼявляться тут.',
    back: 'Назад',
    close: 'Закрити',
    calendarLinked: 'Повʼязано з календарем',
    synced: 'Синхронізовано',
    requests: 'Запити',
    history: 'Історія',
  },
  ES: {
    title: 'Mis clientes',
    subtitle: 'Reservas, solicitudes, calendario e historial rápido',
    search: 'Buscar clientes, servicios...',
    totalClients: 'Clientes',
    activeClients: 'Activos',
    totalRevenue: 'Ingresos',
    repeatClients: 'Repetidos',
    allLabel: 'Todo',
    newLabel: 'Nuevo',
    activeLabel: 'Activo',
    returningLabel: 'Repite',
    completedLabel: 'Completado',
    bookings: 'reservas',
    spent: 'gastado',
    lastBooking: 'Última reserva',
    message: 'Mensaje',
    viewBookings: 'Reservas',
    noClients: 'Aún no hay clientes',
    noClientsHint: 'Cuando alguien reserve tu servicio, aparecerá aquí.',
    back: 'Atrás',
    close: 'Cerrar',
    calendarLinked: 'Calendario conectado',
    synced: 'Sincronizado',
    requests: 'Solicitudes',
    history: 'Historial',
  },
  CZ: {
    title: 'Moji klienti',
    subtitle: 'Rezervace, žádosti, kalendář a rychlá historie klientů',
    search: 'Hledat klienty, služby...',
    totalClients: 'Klienti',
    activeClients: 'Aktivní',
    totalRevenue: 'Příjem',
    repeatClients: 'Opakovaní',
    allLabel: 'Vše',
    newLabel: 'Nový',
    activeLabel: 'Aktivní',
    returningLabel: 'Opakuje',
    completedLabel: 'Dokončeno',
    bookings: 'rezervací',
    spent: 'utraceno',
    lastBooking: 'Poslední rezervace',
    message: 'Zpráva',
    viewBookings: 'Rezervace',
    noClients: 'Zatím žádní klienti',
    noClientsHint: 'Jakmile si někdo rezervuje vaši službu, klienti se zobrazí zde.',
    back: 'Zpět',
    close: 'Zavřít',
    calendarLinked: 'Propojeno s kalendářem',
    synced: 'Synchronizováno',
    requests: 'Žádosti',
    history: 'Historie',
  },
  DE: {
    title: 'Meine Kunden',
    subtitle: 'Buchungen, Anfragen, Kalender und schnelle Kundenhistorie',
    search: 'Kunden, Services suchen...',
    totalClients: 'Kunden',
    activeClients: 'Aktiv',
    totalRevenue: 'Umsatz',
    repeatClients: 'Wiederkehrend',
    allLabel: 'Alle',
    newLabel: 'Neu',
    activeLabel: 'Aktiv',
    returningLabel: 'Wiederkehrend',
    completedLabel: 'Abgeschlossen',
    bookings: 'Buchungen',
    spent: 'ausgegeben',
    lastBooking: 'Letzte Buchung',
    message: 'Nachricht',
    viewBookings: 'Buchungen',
    noClients: 'Noch keine Kunden',
    noClientsHint: 'Wenn jemand deinen Service bucht, erscheinen Kunden hier.',
    back: 'Zurück',
    close: 'Schließen',
    calendarLinked: 'Kalender verbunden',
    synced: 'Synchronisiert',
    requests: 'Anfragen',
    history: 'Historie',
  },
  IT: {
    title: 'I miei clienti',
    subtitle: 'Prenotazioni, richieste, calendario e cronologia clienti',
    search: 'Cerca clienti, servizi...',
    totalClients: 'Clienti',
    activeClients: 'Attivi',
    totalRevenue: 'Entrate',
    repeatClients: 'Ricorrenti',
    allLabel: 'Tutti',
    newLabel: 'Nuovo',
    activeLabel: 'Attivo',
    returningLabel: 'Ricorrente',
    completedLabel: 'Completato',
    bookings: 'prenotazioni',
    spent: 'speso',
    lastBooking: 'Ultima prenotazione',
    message: 'Messaggio',
    viewBookings: 'Prenotazioni',
    noClients: 'Ancora nessun cliente',
    noClientsHint: 'Quando qualcuno prenota il tuo servizio, apparirà qui.',
    back: 'Indietro',
    close: 'Chiudi',
    calendarLinked: 'Calendario collegato',
    synced: 'Sincronizzato',
    requests: 'Richieste',
    history: 'Cronologia',
  },
  FR: {
    title: 'Mes clients',
    subtitle: 'Réservations, demandes, calendrier et historique rapide',
    search: 'Rechercher clients, services...',
    totalClients: 'Clients',
    activeClients: 'Actifs',
    totalRevenue: 'Revenus',
    repeatClients: 'Fidèles',
    allLabel: 'Tous',
    newLabel: 'Nouveau',
    activeLabel: 'Actif',
    returningLabel: 'Fidèle',
    completedLabel: 'Terminé',
    bookings: 'réservations',
    spent: 'dépensé',
    lastBooking: 'Dernière réservation',
    message: 'Message',
    viewBookings: 'Réservations',
    noClients: 'Aucun client pour le moment',
    noClientsHint: 'Quand quelqu’un réservera votre service, il apparaîtra ici.',
    back: 'Retour',
    close: 'Fermer',
    calendarLinked: 'Calendrier lié',
    synced: 'Synchronisé',
    requests: 'Demandes',
    history: 'Historique',
  },
  PL: {
    title: 'Moi klienci',
    subtitle: 'Rezerwacje, zapytania, kalendarz i szybka historia klientów',
    search: 'Szukaj klientów, usług...',
    totalClients: 'Klienci',
    activeClients: 'Aktywni',
    totalRevenue: 'Przychód',
    repeatClients: 'Powracający',
    allLabel: 'Wszystko',
    newLabel: 'Nowy',
    activeLabel: 'Aktywny',
    returningLabel: 'Powracający',
    completedLabel: 'Zakończono',
    bookings: 'rezerwacji',
    spent: 'wydano',
    lastBooking: 'Ostatnia rezerwacja',
    message: 'Wiadomość',
    viewBookings: 'Rezerwacje',
    noClients: 'Brak klientów',
    noClientsHint: 'Gdy ktoś zarezerwuje usługę, klienci pojawią się tutaj.',
    back: 'Wstecz',
    close: 'Zamknij',
    calendarLinked: 'Połączono z kalendarzem',
    synced: 'Zsynchronizowano',
    requests: 'Zapytania',
    history: 'Historia',
  },
  AR: {
    title: 'عملائي',
    subtitle: 'الحجوزات والطلبات والتقويم وسجل العملاء السريع',
    search: 'ابحث عن العملاء أو الخدمات...',
    totalClients: 'العملاء',
    activeClients: 'نشطون',
    totalRevenue: 'الإيراد',
    repeatClients: 'متكررون',
    allLabel: 'الكل',
    newLabel: 'جديد',
    activeLabel: 'نشط',
    returningLabel: 'متكرر',
    completedLabel: 'مكتمل',
    bookings: 'حجوزات',
    spent: 'مدفوع',
    lastBooking: 'آخر حجز',
    message: 'رسالة',
    viewBookings: 'الحجوزات',
    noClients: 'لا يوجد عملاء بعد',
    noClientsHint: 'عندما يحجز شخص خدمتك، سيظهر العملاء هنا.',
    back: 'رجوع',
    close: 'إغلاق',
    calendarLinked: 'مرتبط بالتقويم',
    synced: 'متزامن',
    requests: 'الطلبات',
    history: 'السجل',
  },
};

const fallbackClients: ClientItem[] = [
  {
    id: 'client-1',
    name: 'Sophie Williams',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    service: 'Hair extensions',
    lastBooking: 'Today, 14:30',
    totalSpent: 180,
    bookingsCount: 3,
    status: 'active',
    completed: false,
  },
  {
    id: 'client-2',
    name: 'Emily Carter',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    service: 'Makeup',
    lastBooking: 'Yesterday, 11:00',
    totalSpent: 95,
    bookingsCount: 2,
    status: 'returning',
    completed: false,
  },
  {
    id: 'client-3',
    name: 'Anna Novak',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    service: 'Manicure',
    lastBooking: '22 Apr, 16:00',
    totalSpent: 45,
    bookingsCount: 1,
    status: 'new',
    completed: false,
  },
];

function getText(language: AppLanguage) {
  return clientsTexts[language] || clientsTexts.EN;
}

function statusMeta(status: ClientStatus, text: ClientsText) {
  if (status === 'new') {
    return { label: text.newLabel, bg: BRAND.softPink, color: BRAND.pink };
  }

  if (status === 'returning') {
    return { label: text.returningLabel, bg: BRAND.softBlue, color: BRAND.blue };
  }

  if (status === 'completed') {
    return { label: text.completedLabel, bg: BRAND.softOrange, color: '#b87500' };
  }

  return { label: text.activeLabel, bg: BRAND.softGreen, color: '#008f3a' };
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function bookingDateValue(booking: BookingItem) {
  const date = new Date(booking.dateTime || '');
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function buildClientsFromBookings(bookings: BookingItem[]): ClientItem[] {
  if (!bookings.length) return fallbackClients;

  const map = new Map<string, ClientItem & { latestTime: number }>();

  bookings.forEach((booking) => {
    const key = String(booking.masterId || booking.masterName || booking.id);
    const latestTime = bookingDateValue(booking);
    const previous = map.get(key);
    const isCompleted = booking.status === 'completed';
    const bookingPrice = Number(booking.price || 0);

    if (!previous) {
      map.set(key, {
        id: key,
        name: booking.masterName || 'Client',
        avatar:
          booking.masterAvatar ||
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        service: booking.serviceName || 'Service',
        lastBooking: booking.dateLabel || '',
        totalSpent: bookingPrice,
        bookingsCount: 1,
        status: isCompleted ? 'completed' : booking.status === 'pending' ? 'new' : 'active',
        completed: isCompleted,
        lastBookingId: booking.id,
        masterId: booking.masterId,
        latestTime,
      });
      return;
    }

    previous.totalSpent += bookingPrice;
    previous.bookingsCount += 1;

    if (latestTime >= previous.latestTime) {
      previous.latestTime = latestTime;
      previous.service = booking.serviceName || previous.service;
      previous.lastBooking = booking.dateLabel || previous.lastBooking;
      previous.lastBookingId = booking.id;
      previous.masterId = booking.masterId;
      previous.completed = isCompleted;
    }

    if (previous.bookingsCount > 1 && previous.status !== 'completed') {
      previous.status = 'returning';
    }

    if (isCompleted) {
      previous.status = 'completed';
    }
  });

  return Array.from(map.values())
    .sort((a, b) => b.latestTime - a.latestTime)
    .map(({ latestTime, ...client }) => client);
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
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ClientFilter>('all');

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncBookings = () => {
      setBookings(getBookings());
    };

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

  const text = useMemo(() => getText(language), [language]);

  const clients = useMemo(() => buildClientsFromBookings(bookings), [bookings]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesFilter =
        activeFilter === 'all' ||
        client.status === activeFilter ||
        (activeFilter === 'returning' && client.bookingsCount > 1);

      const matchesSearch =
        !q ||
        client.name.toLowerCase().includes(q) ||
        client.service.toLowerCase().includes(q) ||
        client.lastBooking.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [clients, search, activeFilter]);

  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const activeCount = clients.filter((client) => client.status === 'active').length;
  const repeatCount = clients.filter((client) => client.bookingsCount > 1).length;

  const openMessage = (client: ClientItem) => {
    const thread = getOrCreateChatThread({
      threadId: `client-${client.id}`,
      providerName: client.name,
      providerAvatar: client.avatar,
      category: client.service,
      online: true,
      lastSeenText: 'Online',
    });

    router.push(`/messages/${encodeURIComponent(thread.id)}`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 210,
        fontFamily: 'Arial, sans-serif',
        overflowX: 'hidden',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 210px' }}>
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
            marginTop: 17,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 13,
            boxShadow: '0 10px 26px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <StatCard title={text.totalClients} value={String(clients.length)} bg={BRAND.softBlue} />
            <StatCard title={text.activeClients} value={String(activeCount)} bg={BRAND.softGreen} />
            <StatCard title={text.totalRevenue} value={money(totalRevenue)} bg={BRAND.softOrange} />
            <StatCard title={text.repeatClients} value={String(repeatCount)} bg={BRAND.softPink} />
          </div>

          <div
            style={{
              marginTop: 12,
              height: 54,
              borderRadius: 18,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 14px',
            }}
          >
            <span style={{ fontSize: 21 }}>🔎</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.search}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                fontWeight: 800,
                color: BRAND.navy,
                minWidth: 0,
              }}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: 13,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 7,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          {([
            ['all', text.allLabel],
            ['active', text.activeLabel],
            ['returning', text.returningLabel],
            ['new', text.newLabel],
            ['completed', text.completedLabel],
          ] as const).map(([filter, label]) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                style={{
                  flexShrink: 0,
                  minHeight: 42,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: active ? BRAND.navy : '#ffffff',
                  color: active ? '#ffffff' : BRAND.navy,
                  padding: '0 16px',
                  fontSize: 12,
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
            marginTop: 13,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: '#f8fbff',
            padding: 10,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          <MiniSyncBadge icon="📅" label={text.calendarLinked} />
          <MiniSyncBadge icon="✅" label={text.synced} />
          <MiniSyncBadge icon="📩" label={text.requests} />
          <MiniSyncBadge icon="🕘" label={text.history} />
        </section>

        <section style={{ marginTop: 16, display: 'grid', gap: 12, paddingBottom: 90 }}>
          {filteredClients.length === 0 ? (
            <div
              style={{
                borderRadius: 26,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
              <div style={{ fontSize: 21, fontWeight: 900, color: BRAND.navy }}>
                {text.noClients}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.4,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.noClientsHint}
              </div>
            </div>
          ) : (
            filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                text={text}
                onMessage={() => openMessage(client)}
                onBookings={() => router.push('/bookings')}
              />
            ))
          )}
        </section>
      </div>

      <BottomNav active="clients" />
    </main>
  );
}

function StatCard({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 12,
        minHeight: 86,
        display: 'grid',
        alignContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.muted }}>{title}</div>
      <div
        style={{
          marginTop: 8,
          fontSize: 25,
          lineHeight: 1,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniSyncBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        minHeight: 42,
        borderRadius: 15,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 10px',
        fontSize: 11,
        fontWeight: 900,
        color: BRAND.navy,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ClientCard({
  client,
  text,
  onMessage,
  onBookings,
}: {
  client: ClientItem;
  text: ClientsText;
  onMessage: () => void;
  onBookings: () => void;
}) {
  const meta = statusMeta(client.status, text);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 26,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 13,
        boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
        overflow: 'hidden',
      }}
    >
      {client.completed ? (
        <div
          style={{
            position: 'absolute',
            top: 13,
            right: 13,
            width: 38,
            height: 38,
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.green,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 900,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.14)',
            zIndex: 2,
          }}
        >
          ✓
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '74px minmax(0, 1fr)',
          gap: 12,
          alignItems: 'center',
          paddingRight: client.completed ? 38 : 0,
        }}
      >
        <img
          src={client.avatar}
          alt={client.name}
          style={{
            width: 74,
            height: 74,
            borderRadius: 22,
            objectFit: 'cover',
            display: 'block',
            border: `2.5px solid ${BRAND.border}`,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 20,
                lineHeight: 1.1,
                fontWeight: 900,
                color: BRAND.navy,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {client.name}
            </div>

            <span
              style={{
                minHeight: 28,
                padding: '0 9px',
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: meta.bg,
                color: meta.color,
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {meta.label}
            </span>
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              fontWeight: 800,
              color: BRAND.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {client.service}
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 12,
              fontWeight: 900,
              color: BRAND.blue,
            }}
          >
            {text.lastBooking}: {client.lastBooking || '—'}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 13,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <SmallInfo label={text.bookings} value={String(client.bookingsCount)} />
        <SmallInfo label={text.spent} value={money(client.totalSpent)} />
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onMessage}
          style={{
            minHeight: 48,
            borderRadius: 17,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softViolet,
            color: BRAND.navy,
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          💬 {text.message}
        </button>

        <button
          type="button"
          onClick={onBookings}
          style={{
            minHeight: 48,
            borderRadius: 17,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.blue,
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          📅 {text.viewBookings}
        </button>
      </div>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minHeight: 60,
        borderRadius: 18,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: BRAND.muted }}>{label}</div>
      <div
        style={{
          marginTop: 5,
          fontSize: 20,
          lineHeight: 1,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {value}
      </div>
    </div>
  );
}
