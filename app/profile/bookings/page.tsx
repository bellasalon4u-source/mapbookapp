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
  canShowExactAddress,
  canShowDirectContacts,
  getVisibleBookingLocation,
  getProtectedBookingContact,
  type BookingItem,
  type BookingStatus,
} from '../../services/bookingsStore';

const bookingsTexts = {
  EN: {
    title: 'My bookings',
    subtitle: 'Upcoming visits, completed services and booking access',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending confirmation',
    unlockPaid: 'Unlock paid',
    welcomeBonus: 'Welcome Bonus used',
    referralUsed: 'Referral booking used',
    empty: 'No bookings in this section yet',
    serviceDetails: 'Service details',
    bookingSummary: 'Booking summary',
    total: 'Total',
    dateTime: 'Date & time',
    contactAndAddress: 'Contact and address',
    hiddenUntilPaid:
      'Exact address, route and direct contact are available only after payment confirmation and paid promotion',
    writeSeller: 'Write to seller',
    callSeller: 'Call seller',
    routeToMaster: 'Route to master',
    exactAddress: 'Exact address',
    detailsUnlocked: 'Details unlocked',
    secureBooking: 'Secure booking',
    providerPhone: 'Phone',
    providerEmail: 'Email',
    routeLocked: 'Route after unlock',
    bookingAccess: 'Booking access',
    provider: 'Provider',
    paymentProtected: 'Protected details',
    directContactLocked: 'Direct contacts are locked',
    addressLocked: 'Exact address is locked',
    area: 'Area',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Book again',
  },
  ES: {
    title: 'Mis reservas',
    subtitle: 'Próximas visitas, servicios completados y acceso a reservas',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Esperando confirmación',
    unlockPaid: 'Unlock pagado',
    welcomeBonus: 'Welcome Bonus usado',
    referralUsed: 'Reserva por referido usada',
    empty: 'Todavía no hay reservas en esta sección',
    serviceDetails: 'Detalles del servicio',
    bookingSummary: 'Resumen de la reserva',
    total: 'Total',
    dateTime: 'Fecha y hora',
    contactAndAddress: 'Contacto y dirección',
    hiddenUntilPaid:
      'La dirección exacta, la ruta y el contacto directo están disponibles solo después de confirmar el pago y la promoción pagada',
    writeSeller: 'Escribir al profesional',
    callSeller: 'Llamar al profesional',
    routeToMaster: 'Ruta al profesional',
    exactAddress: 'Dirección exacta',
    detailsUnlocked: 'Detalles desbloqueados',
    secureBooking: 'Reserva segura',
    providerPhone: 'Teléfono',
    providerEmail: 'Email',
    routeLocked: 'Ruta después del desbloqueo',
    bookingAccess: 'Acceso a la reserva',
    provider: 'Profesional',
    paymentProtected: 'Datos protegidos',
    directContactLocked: 'Los contactos directos están bloqueados',
    addressLocked: 'La dirección exacta está bloqueada',
    area: 'Zona',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Reservar otra vez',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Предстоящие визиты, завершённые услуги и доступ к бронированию',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ожидает подтверждения',
    unlockPaid: 'Unlock оплачен',
    welcomeBonus: 'Использован Welcome Bonus',
    referralUsed: 'Использовано бесплатное бронирование',
    empty: 'В этом разделе пока нет бронирований',
    serviceDetails: 'Подробнее об услуге',
    bookingSummary: 'Сводка бронирования',
    total: 'Итого',
    dateTime: 'Дата и время',
    contactAndAddress: 'Контакты и адрес',
    hiddenUntilPaid:
      'Точный адрес, маршрут и прямой контакт доступны только после подтверждённой оплаты и оплаченной рекламы мастера',
    writeSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    routeToMaster: 'Маршрут к мастеру',
    exactAddress: 'Точный адрес',
    detailsUnlocked: 'Доступ открыт',
    secureBooking: 'Безопасное бронирование',
    providerPhone: 'Телефон',
    providerEmail: 'Email',
    routeLocked: 'Маршрут после открытия',
    bookingAccess: 'Доступ к бронированию',
    provider: 'Исполнитель',
    paymentProtected: 'Защищённые данные',
    directContactLocked: 'Прямые контакты скрыты',
    addressLocked: 'Точный адрес скрыт',
    area: 'Район',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Забронировать снова',
  },
  UA: {
    title: 'Мої бронювання',
    subtitle: 'Майбутні візити, завершені послуги та доступ до бронювання',
    upcoming: 'Майбутні',
    completed: 'Завершені',
    cancelled: 'Скасовані',
    pending: 'Очікує підтвердження',
    unlockPaid: 'Unlock оплачено',
    welcomeBonus: 'Використано Welcome Bonus',
    referralUsed: 'Використано безкоштовне бронювання',
    empty: 'У цьому розділі поки немає бронювань',
    serviceDetails: 'Деталі послуги',
    bookingSummary: 'Підсумок бронювання',
    total: 'Разом',
    dateTime: 'Дата і час',
    contactAndAddress: 'Контакти та адреса',
    hiddenUntilPaid:
      'Точна адреса, маршрут і прямий контакт доступні лише після підтвердженої оплати та оплаченої реклами майстра',
    writeSeller: 'Написати майстру',
    callSeller: 'Подзвонити майстру',
    routeToMaster: 'Маршрут до майстра',
    exactAddress: 'Точна адреса',
    detailsUnlocked: 'Доступ відкрито',
    secureBooking: 'Безпечне бронювання',
    providerPhone: 'Телефон',
    providerEmail: 'Email',
    routeLocked: 'Маршрут після відкриття',
    bookingAccess: 'Доступ до бронювання',
    provider: 'Виконавець',
    paymentProtected: 'Захищені дані',
    directContactLocked: 'Прямі контакти приховані',
    addressLocked: 'Точну адресу приховано',
    area: 'Район',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Забронювати знову',
  },
  CZ: {
    title: 'Moje rezervace',
    subtitle: 'Nadcházející návštěvy, dokončené služby a přístup k rezervaci',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká na potvrzení',
    unlockPaid: 'Unlock zaplacen',
    welcomeBonus: 'Použit Welcome Bonus',
    referralUsed: 'Použita rezervace zdarma',
    empty: 'V této sekci zatím nejsou žádné rezervace',
    serviceDetails: 'Detail služby',
    bookingSummary: 'Souhrn rezervace',
    total: 'Celkem',
    dateTime: 'Datum a čas',
    contactAndAddress: 'Kontakt a adresa',
    hiddenUntilPaid:
      'Přesná adresa, trasa a přímý kontakt jsou dostupné až po potvrzené platbě a zaplacené propagaci',
    writeSeller: 'Napsat specialistovi',
    callSeller: 'Zavolat specialistovi',
    routeToMaster: 'Trasa ke specialistovi',
    exactAddress: 'Přesná adresa',
    detailsUnlocked: 'Detaily odemčeny',
    secureBooking: 'Bezpečná rezervace',
    providerPhone: 'Telefon',
    providerEmail: 'Email',
    routeLocked: 'Trasa po odemčení',
    bookingAccess: 'Přístup k rezervaci',
    provider: 'Poskytovatel',
    paymentProtected: 'Chráněné údaje',
    directContactLocked: 'Přímé kontakty jsou skryté',
    addressLocked: 'Přesná adresa je skrytá',
    area: 'Oblast',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Rezervovat znovu',
  },
  DE: {
    title: 'Meine Buchungen',
    subtitle: 'Bevorstehende Besuche, abgeschlossene Services und Buchungszugriff',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Wartet auf Bestätigung',
    unlockPaid: 'Unlock bezahlt',
    welcomeBonus: 'Welcome Bonus verwendet',
    referralUsed: 'Kostenlose Empfehlung verwendet',
    empty: 'In diesem Bereich gibt es noch keine Buchungen',
    serviceDetails: 'Servicedetails',
    bookingSummary: 'Buchungsübersicht',
    total: 'Gesamt',
    dateTime: 'Datum & Uhrzeit',
    contactAndAddress: 'Kontakt und Adresse',
    hiddenUntilPaid:
      'Genaue Adresse, Route und direkter Kontakt sind erst nach bestätigter Zahlung und bezahlter Promotion verfügbar',
    writeSeller: 'Dem Anbieter schreiben',
    callSeller: 'Anbieter anrufen',
    routeToMaster: 'Route zum Anbieter',
    exactAddress: 'Genaue Adresse',
    detailsUnlocked: 'Details freigeschaltet',
    secureBooking: 'Sichere Buchung',
    providerPhone: 'Telefon',
    providerEmail: 'E-Mail',
    routeLocked: 'Route nach Freischaltung',
    bookingAccess: 'Buchungszugriff',
    provider: 'Anbieter',
    paymentProtected: 'Geschützte Daten',
    directContactLocked: 'Direkte Kontakte sind gesperrt',
    addressLocked: 'Genaue Adresse ist gesperrt',
    area: 'Bereich',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Erneut buchen',
  },
  PL: {
    title: 'Moje rezerwacje',
    subtitle: 'Nadchodzące wizyty, zakończone usługi i dostęp do rezerwacji',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekuje na potwierdzenie',
    unlockPaid: 'Unlock opłacony',
    welcomeBonus: 'Użyto Welcome Bonus',
    referralUsed: 'Użyto darmowej rezerwacji',
    empty: 'W tej sekcji nie ma jeszcze rezerwacji',
    serviceDetails: 'Szczegóły usługi',
    bookingSummary: 'Podsumowanie rezerwacji',
    total: 'Łącznie',
    dateTime: 'Data i godzina',
    contactAndAddress: 'Kontakt i adres',
    hiddenUntilPaid:
      'Dokładny adres, trasa i bezpośredni kontakt są dostępne dopiero po potwierdzonej płatności i opłaconej promocji',
    writeSeller: 'Napisz do specjalisty',
    callSeller: 'Zadzwoń do specjalisty',
    routeToMaster: 'Trasa do specjalisty',
    exactAddress: 'Dokładny adres',
    detailsUnlocked: 'Dane odblokowane',
    secureBooking: 'Bezpieczna rezerwacja',
    providerPhone: 'Telefon',
    providerEmail: 'Email',
    routeLocked: 'Trasa po odblokowaniu',
    bookingAccess: 'Dostęp do rezerwacji',
    provider: 'Wykonawca',
    paymentProtected: 'Chronione dane',
    directContactLocked: 'Bezpośrednie kontakty są ukryte',
    addressLocked: 'Dokładny adres jest ukryty',
    area: 'Obszar',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    rebook: 'Zarezerwuj ponownie',
  },
} as const;

type TabKey = 'upcoming' | 'completed' | 'cancelled';

function formatPrice(price: number) {
  return `£${price.toFixed(2)}`;
}

function getStatusStyles(status: BookingStatus) {
  if (status === 'pending') {
    return { background: '#fff4db', color: '#b7791f' };
  }
  if (status === 'completed') {
    return { background: '#ecfdf3', color: '#15803d' };
  }
  if (status === 'cancelled') {
    return { background: '#fff1f2', color: '#dc2626' };
  }
  return { background: '#eef4ff', color: '#2563eb' };
}

function getStatusIcon(status: BookingStatus) {
  if (status === 'pending') return '⏳';
  if (status === 'completed') return '✓';
  if (status === 'cancelled') return '✕';
  return '📅';
}

export default function ProfileBookingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');

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
    const unsubBookings = subscribeToBookingsStore(syncBookings);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
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
    if (status === 'completed') return text.completed;
    if (status === 'cancelled') return text.cancelled;
    return text.upcoming;
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '20px 16px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
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
              color: '#17130f',
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {text.title}
            </h1>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 2,
            }}
          >
            {([
              { key: 'upcoming', label: text.upcoming },
              { key: 'completed', label: text.completed },
              { key: 'cancelled', label: text.cancelled },
            ] as const).map((item) => {
              const active = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    border: '2px solid #111111',
                    borderRadius: 999,
                    padding: '12px 18px',
                    fontWeight: 900,
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    background: active ? '#17130f' : '#fff',
                    color: active ? '#fff' : '#17130f',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredBookings.length === 0 && (
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fff',
                padding: 24,
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#7a7065',
              }}
            >
              {text.empty}
            </div>
          )}

          {filteredBookings.map((booking) => {
            const exactAddressUnlocked = canShowExactAddress(booking);
            const directContactsUnlocked = canShowDirectContacts(booking);
            const protectedContact = getProtectedBookingContact(booking);
            const visibleLocation = getVisibleBookingLocation(booking);
            const publicArea = booking.areaLabel || booking.location;
            const showRebookButton =
              booking.status === 'completed' || booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                style={{
                  borderRadius: 30,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '76px 1fr auto',
                    gap: 14,
                    alignItems: 'start',
                  }}
                >
                  <img
                    src={
                      booking.masterAvatar ||
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={booking.masterName}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 22,
                      objectFit: 'cover',
                      display: 'block',
                      border: '2px solid #111111',
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#8a7f74',
                        marginBottom: 6,
                      }}
                    >
                      {text.provider}
                    </div>

                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: '#17130f',
                        lineHeight: 1.15,
                      }}
                    >
                      {booking.masterName}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 15,
                        color: '#70665d',
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {booking.serviceName}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#17130f',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatPrice(booking.price)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      borderRadius: 999,
                      border: '2px solid #111111',
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      ...getStatusStyles(booking.status),
                    }}
                  >
                    <span>{getStatusIcon(booking.status)}</span>
                    <span>{getStatusLabel(booking.status)}</span>
                  </span>

                  {booking.unlockFeePaid && (
                    <span
                      style={{
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#eef4ff',
                        color: '#2563eb',
                      }}
                    >
                      {text.unlockPaid}
                    </span>
                  )}

                  {booking.usedWelcomeBonus && (
                    <span
                      style={{
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#fff4db',
                        color: '#b7791f',
                      }}
                    >
                      {text.welcomeBonus}
                    </span>
                  )}

                  {booking.usedReferralCredit && (
                    <span
                      style={{
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#fff0f6',
                        color: '#ff4fa0',
                      }}
                    >
                      {text.referralUsed}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 24,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                      marginBottom: 12,
                    }}
                  >
                    {text.bookingSummary}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.dateTime}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: '#17130f',
                          lineHeight: 1.45,
                        }}
                      >
                        {booking.dateLabel}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.total}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#17130f',
                        }}
                      >
                        {formatPrice(booking.price)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 18,
                      background: exactAddressUnlocked ? '#ecfdf3' : '#fff4db',
                      padding: 12,
                      border: '2px solid #111111',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: exactAddressUnlocked ? '#15803d' : '#b7791f',
                        marginBottom: 6,
                      }}
                    >
                      {exactAddressUnlocked ? text.detailsUnlocked : text.secureBooking}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: exactAddressUnlocked ? '#166534' : '#8d6c24',
                        fontWeight: 700,
                      }}
                    >
                      {exactAddressUnlocked
                        ? `${text.exactAddress}: ${visibleLocation}`
                        : `${text.area}: ${publicArea}`}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 24,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {text.contactAndAddress}
                    </div>

                    <span
                      style={{
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 10px',
                        background: directContactsUnlocked ? '#ecfdf3' : '#fff4db',
                        color: directContactsUnlocked ? '#15803d' : '#b7791f',
                        fontSize: 11,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {directContactsUnlocked ? text.bookingAccess : text.paymentProtected}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.providerPhone}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: directContactsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {protectedContact.phone || '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.providerEmail}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: directContactsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {protectedContact.email || '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.whatsapp}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: directContactsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {protectedContact.whatsapp || '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.telegram}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: directContactsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {protectedContact.telegram || '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {text.instagram}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: directContactsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {protectedContact.instagram || '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff',
                        padding: 12,
                        border: '2px solid #111111',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#877d73',
                          fontWeight: 800,
                          marginBottom: 6,
                        }}
                      >
                        {exactAddressUnlocked ? text.exactAddress : text.area}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: exactAddressUnlocked ? '#17130f' : '#a19488',
                          lineHeight: 1.45,
                        }}
                      >
                        {exactAddressUnlocked ? visibleLocation : publicArea}
                      </div>
                    </div>
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
                      disabled={!directContactsUnlocked}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: '2px solid #111111',
                        background: directContactsUnlocked ? '#eef4ff' : '#f2f1ef',
                        color: directContactsUnlocked ? '#2563eb' : '#b0a79e',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: directContactsUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {text.writeSeller}
                    </button>

                    <button
                      type="button"
                      disabled={!directContactsUnlocked}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: '2px solid #111111',
                        background: directContactsUnlocked ? '#ecfdf3' : '#f2f1ef',
                        color: directContactsUnlocked ? '#15803d' : '#b0a79e',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: directContactsUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {text.callSeller}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!exactAddressUnlocked}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      height: 54,
                      borderRadius: 20,
                      border: '2px solid #111111',
                      background: exactAddressUnlocked ? '#ff4fa0' : '#f2f1ef',
                      color: exactAddressUnlocked ? '#fff' : '#b0a79e',
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: exactAddressUnlocked ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {exactAddressUnlocked ? text.routeToMaster : text.routeLocked}
                  </button>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/master/${booking.masterId}`)}
                    style={{
                      width: '100%',
                      height: 56,
                      borderRadius: 22,
                      border: '2px solid #111111',
                      background: '#2f241c',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.serviceDetails}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/booking/${booking.masterId}`)}
                    style={{
                      width: '100%',
                      height: 56,
                      borderRadius: 22,
                      border: '2px solid #111111',
                      background: '#eaf2ff',
                      color: '#1f4fa8',
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.rebook}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
