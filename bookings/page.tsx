'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../services/i18n';
import {
  getBookings,
  subscribeToBookingsStore,
  type BookingItem,
  type BookingStatus,
} from '../app/services/bookingsStore';

const bookingsTexts = {
  EN: {
    title: 'My bookings',
    subtitle: 'Upcoming visits, completed services and booking access',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending confirmation',
    upcomingStatus: 'Upcoming',
    completedStatus: 'Completed',
    cancelledStatus: 'Cancelled',
    unlockPaid: 'Unlock paid',
    bookingAccess: 'Booking access',
    welcomeBonus: 'Welcome Bonus used',
    referralUsed: 'Referral booking used',
    empty: 'No bookings in this section yet',
    provider: 'Provider',
    bookingSummary: 'Booking summary',
    dateTime: 'Date & time',
    total: 'Total',
    detailsUnlocked: 'Details unlocked',
    exactAddress: 'Exact address',
    contactAndAddress: 'Contact and address',
    phone: 'Phone',
    email: 'Email',
    hiddenUntilUnlock: 'Hidden until unlock',
    contactsHidden: 'Exact contacts and exact address are hidden until unlock is paid and confirmed.',
    writeToSeller: 'Write to seller',
    callSeller: 'Call seller',
    routeToMaster: 'Route to master',
    serviceDetails: 'Service details',
    cancelBooking: 'Cancel booking',
    actions: 'Actions',
    details: 'Service details',
    close: 'Close',
    confirmCancel: 'Cancel this booking?',
    exactDetailsLocked: 'Exact details are locked',
    generalArea: 'General area',
  },
  ES: {
    title: 'Mis reservas',
    subtitle: 'Próximas visitas, servicios completados y acceso a la reserva',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Esperando confirmación',
    upcomingStatus: 'Próxima',
    completedStatus: 'Completada',
    cancelledStatus: 'Cancelada',
    unlockPaid: 'Unlock pagado',
    bookingAccess: 'Acceso a la reserva',
    welcomeBonus: 'Welcome Bonus usado',
    referralUsed: 'Reserva por referido usada',
    empty: 'Todavía no hay reservas en esta sección',
    provider: 'Proveedor',
    bookingSummary: 'Resumen de reserva',
    dateTime: 'Fecha y hora',
    total: 'Total',
    detailsUnlocked: 'Detalles desbloqueados',
    exactAddress: 'Dirección exacta',
    contactAndAddress: 'Contacto y dirección',
    phone: 'Teléfono',
    email: 'Email',
    hiddenUntilUnlock: 'Oculto hasta unlock',
    contactsHidden:
      'Los contactos exactos y la dirección exacta están ocultos hasta que el unlock esté pagado y confirmado.',
    writeToSeller: 'Escribir al vendedor',
    callSeller: 'Llamar al vendedor',
    routeToMaster: 'Ruta al profesional',
    serviceDetails: 'Detalles del servicio',
    cancelBooking: 'Cancelar reserva',
    actions: 'Acciones',
    details: 'Detalles del servicio',
    close: 'Cerrar',
    confirmCancel: '¿Cancelar esta reserva?',
    exactDetailsLocked: 'Los detalles exactos están bloqueados',
    generalArea: 'Zona general',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Предстоящие визиты, завершённые услуги и доступ к брони',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ожидает подтверждения',
    upcomingStatus: 'Предстоящая',
    completedStatus: 'Завершена',
    cancelledStatus: 'Отменена',
    unlockPaid: 'Unlock оплачен',
    bookingAccess: 'Доступ к брони',
    welcomeBonus: 'Использован Welcome Bonus',
    referralUsed: 'Использовано бронирование по рефералу',
    empty: 'В этом разделе пока нет бронирований',
    provider: 'Исполнитель',
    bookingSummary: 'Сводка бронирования',
    dateTime: 'Дата и время',
    total: 'Итого',
    detailsUnlocked: 'Детали открыты',
    exactAddress: 'Точный адрес',
    contactAndAddress: 'Контакты и адрес',
    phone: 'Телефон',
    email: 'Email',
    hiddenUntilUnlock: 'Скрыто до unlock',
    contactsHidden:
      'Точные контакты и точный адрес скрыты, пока unlock не оплачен и не подтверждён.',
    writeToSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    routeToMaster: 'Маршрут к мастеру',
    serviceDetails: 'Детали услуги',
    cancelBooking: 'Отменить бронь',
    actions: 'Действия',
    details: 'Детали услуги',
    close: 'Закрыть',
    confirmCancel: 'Отменить это бронирование?',
    exactDetailsLocked: 'Точные данные скрыты',
    generalArea: 'Общий район',
  },
  UA: {
    title: 'Мої бронювання',
    subtitle: 'Майбутні візити, завершені послуги та доступ до бронювання',
    upcoming: 'Майбутні',
    completed: 'Завершені',
    cancelled: 'Скасовані',
    pending: 'Очікує підтвердження',
    upcomingStatus: 'Майбутня',
    completedStatus: 'Завершена',
    cancelledStatus: 'Скасована',
    unlockPaid: 'Unlock оплачено',
    bookingAccess: 'Доступ до бронювання',
    welcomeBonus: 'Використано Welcome Bonus',
    referralUsed: 'Використано реферальне бронювання',
    empty: 'У цьому розділі поки немає бронювань',
    provider: 'Виконавець',
    bookingSummary: 'Огляд бронювання',
    dateTime: 'Дата і час',
    total: 'Разом',
    detailsUnlocked: 'Деталі відкрито',
    exactAddress: 'Точна адреса',
    contactAndAddress: 'Контакти та адреса',
    phone: 'Телефон',
    email: 'Email',
    hiddenUntilUnlock: 'Приховано до unlock',
    contactsHidden:
      'Точні контакти та точна адреса приховані, поки unlock не оплачено і не підтверджено.',
    writeToSeller: 'Написати майстру',
    callSeller: 'Подзвонити майстру',
    routeToMaster: 'Маршрут до майстра',
    serviceDetails: 'Деталі послуги',
    cancelBooking: 'Скасувати бронювання',
    actions: 'Дії',
    details: 'Деталі послуги',
    close: 'Закрити',
    confirmCancel: 'Скасувати це бронювання?',
    exactDetailsLocked: 'Точні дані приховані',
    generalArea: 'Загальний район',
  },
  CZ: {
    title: 'Moje rezervace',
    subtitle: 'Nadcházející návštěvy, dokončené služby a přístup k rezervaci',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká na potvrzení',
    upcomingStatus: 'Nadcházející',
    completedStatus: 'Dokončeno',
    cancelledStatus: 'Zrušeno',
    unlockPaid: 'Unlock zaplacen',
    bookingAccess: 'Přístup k rezervaci',
    welcomeBonus: 'Použit Welcome Bonus',
    referralUsed: 'Použita referral rezervace',
    empty: 'V této sekci zatím nejsou žádné rezervace',
    provider: 'Poskytovatel',
    bookingSummary: 'Přehled rezervace',
    dateTime: 'Datum a čas',
    total: 'Celkem',
    detailsUnlocked: 'Detaily odemčeny',
    exactAddress: 'Přesná adresa',
    contactAndAddress: 'Kontakt a adresa',
    phone: 'Telefon',
    email: 'Email',
    hiddenUntilUnlock: 'Skryto do unlock',
    contactsHidden:
      'Přesné kontakty a přesná adresa jsou skryté, dokud není unlock zaplacen a potvrzen.',
    writeToSeller: 'Napsat prodejci',
    callSeller: 'Zavolat prodejci',
    routeToMaster: 'Trasa k poskytovateli',
    serviceDetails: 'Detail služby',
    cancelBooking: 'Zrušit rezervaci',
    actions: 'Akce',
    details: 'Detail služby',
    close: 'Zavřít',
    confirmCancel: 'Zrušit tuto rezervaci?',
    exactDetailsLocked: 'Přesné údaje jsou skryté',
    generalArea: 'Obecná oblast',
  },
  DE: {
    title: 'Meine Buchungen',
    subtitle: 'Bevorstehende Besuche, abgeschlossene Leistungen und Buchungszugang',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Wartet auf Bestätigung',
    upcomingStatus: 'Bevorstehend',
    completedStatus: 'Abgeschlossen',
    cancelledStatus: 'Storniert',
    unlockPaid: 'Unlock bezahlt',
    bookingAccess: 'Buchungszugang',
    welcomeBonus: 'Welcome Bonus verwendet',
    referralUsed: 'Referral-Buchung verwendet',
    empty: 'In diesem Bereich gibt es noch keine Buchungen',
    provider: 'Anbieter',
    bookingSummary: 'Buchungsübersicht',
    dateTime: 'Datum & Uhrzeit',
    total: 'Gesamt',
    detailsUnlocked: 'Details freigeschaltet',
    exactAddress: 'Genaue Adresse',
    contactAndAddress: 'Kontakt und Adresse',
    phone: 'Telefon',
    email: 'E-Mail',
    hiddenUntilUnlock: 'Bis unlock verborgen',
    contactsHidden:
      'Genaue Kontakte und genaue Adresse sind verborgen, bis unlock bezahlt und bestätigt ist.',
    writeToSeller: 'An Anbieter schreiben',
    callSeller: 'Anbieter anrufen',
    routeToMaster: 'Route zum Anbieter',
    serviceDetails: 'Servicedetails',
    cancelBooking: 'Buchung stornieren',
    actions: 'Aktionen',
    details: 'Servicedetails',
    close: 'Schließen',
    confirmCancel: 'Diese Buchung stornieren?',
    exactDetailsLocked: 'Genaue Daten sind gesperrt',
    generalArea: 'Allgemeiner Bereich',
  },
  PL: {
    title: 'Moje rezerwacje',
    subtitle: 'Nadchodzące wizyty, zakończone usługi i dostęp do rezerwacji',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekuje na potwierdzenie',
    upcomingStatus: 'Nadchodząca',
    completedStatus: 'Zakończona',
    cancelledStatus: 'Anulowana',
    unlockPaid: 'Unlock opłacony',
    bookingAccess: 'Dostęp do rezerwacji',
    welcomeBonus: 'Użyto Welcome Bonus',
    referralUsed: 'Użyto rezerwacji z polecenia',
    empty: 'W tej sekcji nie ma jeszcze rezerwacji',
    provider: 'Usługodawca',
    bookingSummary: 'Podsumowanie rezerwacji',
    dateTime: 'Data i godzina',
    total: 'Łącznie',
    detailsUnlocked: 'Dane odblokowane',
    exactAddress: 'Dokładny adres',
    contactAndAddress: 'Kontakt i adres',
    phone: 'Telefon',
    email: 'Email',
    hiddenUntilUnlock: 'Ukryte do unlock',
    contactsHidden:
      'Dokładne kontakty i dokładny adres są ukryte, dopóki unlock nie zostanie opłacony i potwierdzony.',
    writeToSeller: 'Napisz do sprzedawcy',
    callSeller: 'Zadzwoń do sprzedawcy',
    routeToMaster: 'Trasa do usługodawcy',
    serviceDetails: 'Szczegóły usługi',
    cancelBooking: 'Anuluj rezerwację',
    actions: 'Akcje',
    details: 'Szczegóły usługi',
    close: 'Zamknij',
    confirmCancel: 'Anulować tę rezerwację?',
    exactDetailsLocked: 'Dokładne dane są ukryte',
    generalArea: 'Ogólny obszar',
  },
} as const;

type TabKey = 'upcoming' | 'completed' | 'cancelled';

function formatPrice(price: number) {
  return `£${Number(price || 0).toFixed(2)}`;
}

function getSafeImage(booking: BookingItem) {
  return (
    (booking as any).masterAvatar ||
    (booking as any).providerAvatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  );
}

function hasUnlockedAccess(booking: BookingItem) {
  return Boolean(
    (booking as any).unlockFeePaid ||
      (booking as any).unlockPaid ||
      (booking as any).contactsUnlocked ||
      (booking as any).addressUnlocked ||
      (booking as any).detailsUnlocked
  );
}

function getExactAddress(booking: BookingItem) {
  return (
    (booking as any).exactAddress ||
    (booking as any).address ||
    (booking as any).fullAddress ||
    ''
  );
}

function getPhone(booking: BookingItem) {
  return (
    (booking as any).phone ||
    (booking as any).masterPhone ||
    (booking as any).contactPhone ||
    ''
  );
}

function getEmail(booking: BookingItem) {
  return (
    (booking as any).email ||
    (booking as any).masterEmail ||
    (booking as any).contactEmail ||
    ''
  );
}

function getGeneralLocation(booking: BookingItem) {
  return (
    (booking as any).location ||
    (booking as any).area ||
    (booking as any).city ||
    'London'
  );
}

export default function ProfileBookingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [menuBookingId, setMenuBookingId] = useState<string | null>(null);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncBookings = () => {
      setBookings(getBookings());
    };

    syncLanguage();
    syncBookings();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', syncLanguage);
    const unsubBookings = subscribeToBookingsStore(syncBookings);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubLanguage();
      unsubBookings();
    };
  }, []);

  const text = useMemo(
    () => bookingsTexts[language as keyof typeof bookingsTexts] || bookingsTexts.EN,
    [language]
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return bookings.filter(
        (booking) => booking.status === 'upcoming' || booking.status === 'pending'
      );
    }

    if (activeTab === 'completed') {
      return bookings.filter((booking) => booking.status === 'completed');
    }

    return bookings.filter((booking) => booking.status === 'cancelled');
  }, [activeTab, bookings]);

  const getStatusLabel = (status: BookingStatus) => {
    if (status === 'pending') return text.pending;
    if (status === 'completed') return text.completedStatus;
    if (status === 'cancelled') return text.cancelledStatus;
    return text.upcomingStatus;
  };

  const selectedMenuBooking =
    filteredBookings.find((item) => String(item.id) === menuBookingId) || null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        padding: '24px 16px 130px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '98px 1fr 20px',
            gap: 12,
            alignItems: 'start',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 98,
              height: 98,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 42,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center', paddingTop: 6 }}>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.05,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.title}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 17,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#8b8176',
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              height: 78,
              borderRadius: 999,
              border: '2px solid #111111',
              background: activeTab === 'upcoming' ? '#17130f' : '#fff',
              color: activeTab === 'upcoming' ? '#fff' : '#17130f',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.upcoming}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            style={{
              height: 78,
              borderRadius: 999,
              border: '2px solid #111111',
              background: activeTab === 'completed' ? '#17130f' : '#fff',
              color: activeTab === 'completed' ? '#fff' : '#17130f',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.completed}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            style={{
              height: 78,
              borderRadius: 999,
              border: '2px solid #111111',
              background: activeTab === 'cancelled' ? '#17130f' : '#fff',
              color: activeTab === 'cancelled' ? '#fff' : '#17130f',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.cancelled}
          </button>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filteredBookings.length === 0 ? (
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fff',
                padding: 28,
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 800,
                color: '#7a7065',
              }}
            >
              {text.empty}
            </div>
          ) : null}

          {filteredBookings.map((booking) => {
            const unlocked = hasUnlockedAccess(booking);
            const safeImage = getSafeImage(booking);
            const phone = getPhone(booking);
            const email = getEmail(booking);
            const exactAddress = getExactAddress(booking);
            const generalLocation = getGeneralLocation(booking);

            return (
              <div
                key={booking.id}
                style={{
                  borderRadius: 34,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'start',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '12px 18px',
                        fontSize: 16,
                        fontWeight: 900,
                        background:
                          booking.status === 'pending'
                            ? '#fff1df'
                            : booking.status === 'completed'
                            ? '#e0f1e5'
                            : booking.status === 'cancelled'
                            ? '#f9e3e3'
                            : '#eef3ff',
                        color:
                          booking.status === 'pending'
                            ? '#b97d12'
                            : booking.status === 'completed'
                            ? '#2b9155'
                            : booking.status === 'cancelled'
                            ? '#c94d4d'
                            : '#3568d4',
                      }}
                    >
                      {booking.status === 'pending'
                        ? '⏳'
                        : booking.status === 'completed'
                        ? '✓'
                        : booking.status === 'cancelled'
                        ? '×'
                        : '🗓'}
                      {getStatusLabel(booking.status)}
                    </span>

                    {(booking as any).usedWelcomeBonus ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: 999,
                          border: '2px solid #111111',
                          padding: '12px 18px',
                          fontSize: 16,
                          fontWeight: 900,
                          background: '#e8f5ea',
                          color: '#2d8a55',
                        }}
                      >
                        {text.welcomeBonus}
                      </span>
                    ) : null}

                    {(booking as any).usedReferralCredit ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: 999,
                          border: '2px solid #111111',
                          padding: '12px 18px',
                          fontSize: 16,
                          fontWeight: 900,
                          background: '#ffe8f4',
                          color: '#e54aa0',
                        }}
                      >
                        {text.referralUsed}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setMenuBookingId(String(booking.id))}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#fff',
                      fontSize: 28,
                      fontWeight: 900,
                      color: '#17130f',
                      cursor: 'pointer',
                    }}
                  >
                    …
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: '96px 1fr auto',
                    gap: 14,
                    alignItems: 'start',
                  }}
                >
                  <img
                    src={safeImage}
                    alt={booking.masterName}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 24,
                      border: '2px solid #111111',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 17,
                        color: '#8b8176',
                        fontWeight: 800,
                      }}
                    >
                      {text.provider}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 28,
                        lineHeight: 1.1,
                        color: '#17130f',
                        fontWeight: 900,
                        wordBreak: 'break-word',
                      }}
                    >
                      {booking.masterName}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 17,
                        color: '#7f756b',
                        fontWeight: 800,
                      }}
                    >
                      {booking.serviceName}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 28,
                      color: '#17130f',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatPrice(booking.price)}
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {unlocked ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '12px 18px',
                        fontSize: 16,
                        fontWeight: 900,
                        background: '#eef3ff',
                        color: '#3568d4',
                      }}
                    >
                      {text.unlockPaid}
                    </span>
                  ) : null}

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 999,
                      border: '2px solid #111111',
                      padding: '12px 18px',
                      fontSize: 16,
                      fontWeight: 900,
                      background: '#e0f1e5',
                      color: '#2b9155',
                    }}
                  >
                    {text.bookingAccess}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 32,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {text.bookingSummary}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#fff',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: '#9a8f84',
                          fontWeight: 800,
                        }}
                      >
                        {text.dateTime}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 20,
                          lineHeight: 1.35,
                          color: '#17130f',
                          fontWeight: 900,
                        }}
                      >
                        {(booking as any).dateLabel || (booking as any).date || generalLocation}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#fff',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: '#9a8f84',
                          fontWeight: 800,
                        }}
                      >
                        {text.total}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 22,
                          color: '#17130f',
                          fontWeight: 900,
                        }}
                      >
                        {formatPrice(booking.price)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 24,
                      border: '2px solid #111111',
                      background: unlocked ? '#dff0e6' : '#f2f2f2',
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        color: unlocked ? '#1f7f49' : '#8b8176',
                        fontWeight: 900,
                      }}
                    >
                      {unlocked ? text.detailsUnlocked : text.exactDetailsLocked}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 18,
                        lineHeight: 1.4,
                        color: unlocked ? '#1f7f49' : '#6f675f',
                        fontWeight: 900,
                      }}
                    >
                      {unlocked
                        ? `${text.exactAddress}: ${exactAddress || generalLocation}`
                        : `${text.generalArea}: ${generalLocation}`}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 32,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: 16,
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
                    <div
                      style={{
                        fontSize: 21,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {text.contactAndAddress}
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '10px 16px',
                        fontSize: 15,
                        fontWeight: 900,
                        background: '#e0f1e5',
                        color: '#1f7f49',
                      }}
                    >
                      {text.bookingAccess}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      filter: unlocked ? 'none' : 'blur(6px)',
                      pointerEvents: unlocked ? 'auto' : 'none',
                      userSelect: unlocked ? 'auto' : 'none',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#fff',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: '#9a8f84',
                          fontWeight: 800,
                        }}
                      >
                        {text.phone}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 18,
                          color: '#17130f',
                          fontWeight: 900,
                          wordBreak: 'break-word',
                        }}
                      >
                        {phone || '+44 7700 123456'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#fff',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: '#9a8f84',
                          fontWeight: 800,
                        }}
                      >
                        {text.email}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 18,
                          color: '#17130f',
                          fontWeight: 900,
                          wordBreak: 'break-word',
                        }}
                      >
                        {email || 'master@mapbook.app'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#fff',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: '#9a8f84',
                          fontWeight: 800,
                        }}
                      >
                        {text.exactAddress}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 18,
                          color: '#17130f',
                          fontWeight: 900,
                          wordBreak: 'break-word',
                        }}
                      >
                        {exactAddress || generalLocation}
                      </div>
                    </div>
                  </div>

                  {!unlocked ? (
                    <div
                      style={{
                        marginTop: 14,
                        borderRadius: 24,
                        border: '2px dashed #111111',
                        background: '#f9f9f9',
                        padding: 16,
                        fontSize: 15,
                        lineHeight: 1.45,
                        color: '#6f675f',
                        fontWeight: 800,
                      }}
                    >
                      {text.contactsHidden}
                    </div>
                  ) : null}

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          alert(text.contactsHidden);
                          return;
                        }
                        router.push('/messages');
                      }}
                      style={{
                        height: 82,
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#eef3ff',
                        color: '#3568d4',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.writeToSeller}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          alert(text.contactsHidden);
                          return;
                        }
                        if (phone) {
                          window.location.href = `tel:${phone}`;
                        } else {
                          alert(text.hiddenUntilUnlock);
                        }
                      }}
                      style={{
                        height: 82,
                        borderRadius: 24,
                        border: '2px solid #111111',
                        background: '#dff0e6',
                        color: '#1f7f49',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.callSeller}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        alert(text.contactsHidden);
                        return;
                      }
                      const destination = encodeURIComponent(exactAddress || generalLocation);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
                    }}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      height: 86,
                      borderRadius: 26,
                      border: '2px solid #111111',
                      background: '#ff4fa3',
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.routeToMaster}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  style={{
                    marginTop: 18,
                    width: '100%',
                    height: 86,
                    borderRadius: 26,
                    border: '2px solid #111111',
                    background: '#3a281d',
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.serviceDetails}
                </button>

                {(booking.status === 'upcoming' || booking.status === 'pending') && (
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(text.confirmCancel);
                      if (!ok) return;
                      alert(text.confirmCancel);
                    }}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      height: 86,
                      borderRadius: 26,
                      border: '2px solid #111111',
                      background: '#f9e3e3',
                      color: '#c94d4d',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.cancelBooking}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedMenuBooking ? (
        <div
          onClick={() => setMenuBookingId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 16,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 14,
              }}
            >
              {text.actions}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  router.push(`/bookings/${selectedMenuBooking.id}`);
                  setMenuBookingId(null);
                }}
                style={{
                  width: '100%',
                  height: 64,
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#17130f',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.details}
              </button>

              {(selectedMenuBooking.status === 'upcoming' ||
                selectedMenuBooking.status === 'pending') && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuBookingId(null);
                    const ok = window.confirm(text.confirmCancel);
                    if (!ok) return;
                    alert(text.confirmCancel);
                  }}
                  style={{
                    width: '100%',
                    height: 64,
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: '#f9e3e3',
                    color: '#c94d4d',
                    fontSize: 17,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.cancelBooking}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuBookingId(null)}
                style={{
                  width: '100%',
                  height: 60,
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#17130f',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav active="bookings" />
    </main>
  );
}
