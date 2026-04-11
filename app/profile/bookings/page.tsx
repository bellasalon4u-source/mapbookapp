'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getBookings,
  subscribeToBookingsStore,
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
    hiddenUntilPaid: 'Exact address, route and direct contact are available after payment',
    writeSeller: 'Write to seller',
    callSeller: 'Call seller',
    routeToMaster: 'Route to master',
    exactAddress: 'Exact address',
    detailsUnlocked: 'Details unlocked',
    secureBooking: 'Secure booking',
    providerPhone: 'Phone',
    providerEmail: 'Email',
    routeLocked: 'Route after payment',
    bookingAccess: 'Booking access',
    provider: 'Provider',
    paymentProtected: 'Protected booking details',
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
    hiddenUntilPaid: 'La dirección exacta, la ruta y el contacto directo estarán disponibles después del pago',
    writeSeller: 'Escribir al profesional',
    callSeller: 'Llamar al profesional',
    routeToMaster: 'Ruta al profesional',
    exactAddress: 'Dirección exacta',
    detailsUnlocked: 'Detalles desbloqueados',
    secureBooking: 'Reserva segura',
    providerPhone: 'Teléfono',
    providerEmail: 'Email',
    routeLocked: 'Ruta después del pago',
    bookingAccess: 'Acceso a la reserva',
    provider: 'Profesional',
    paymentProtected: 'Datos protegidos de la reserva',
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
    hiddenUntilPaid: 'Точный адрес, маршрут и прямой контакт доступны только после оплаты',
    writeSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    routeToMaster: 'Маршрут к мастеру',
    exactAddress: 'Точный адрес',
    detailsUnlocked: 'Доступ открыт',
    secureBooking: 'Безопасное бронирование',
    providerPhone: 'Телефон',
    providerEmail: 'Email',
    routeLocked: 'Маршрут после оплаты',
    bookingAccess: 'Доступ к бронированию',
    provider: 'Исполнитель',
    paymentProtected: 'Защищённые данные бронирования',
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
    hiddenUntilPaid: 'Přesná adresa, trasa a přímý kontakt jsou dostupné až po zaplacení',
    writeSeller: 'Napsat specialistovi',
    callSeller: 'Zavolat specialistovi',
    routeToMaster: 'Trasa ke specialistovi',
    exactAddress: 'Přesná adresa',
    detailsUnlocked: 'Detaily odemčeny',
    secureBooking: 'Bezpečná rezervace',
    providerPhone: 'Telefon',
    providerEmail: 'Email',
    routeLocked: 'Trasa po zaplacení',
    bookingAccess: 'Přístup k rezervaci',
    provider: 'Poskytovatel',
    paymentProtected: 'Chráněné údaje rezervace',
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
    hiddenUntilPaid: 'Genaue Adresse, Route und direkter Kontakt sind erst nach der Zahlung verfügbar',
    writeSeller: 'Dem Anbieter schreiben',
    callSeller: 'Anbieter anrufen',
    routeToMaster: 'Route zum Anbieter',
    exactAddress: 'Genaue Adresse',
    detailsUnlocked: 'Details freigeschaltet',
    secureBooking: 'Sichere Buchung',
    providerPhone: 'Telefon',
    providerEmail: 'E-Mail',
    routeLocked: 'Route nach Zahlung',
    bookingAccess: 'Buchungszugriff',
    provider: 'Anbieter',
    paymentProtected: 'Geschützte Buchungsdaten',
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
    hiddenUntilPaid: 'Dokładny adres, trasa i bezpośredni kontakt są dostępne dopiero po opłacie',
    writeSeller: 'Napisz do specjalisty',
    callSeller: 'Zadzwoń do specjalisty',
    routeToMaster: 'Trasa do specjalisty',
    exactAddress: 'Dokładny adres',
    detailsUnlocked: 'Dane odblokowane',
    secureBooking: 'Bezpieczna rezerwacja',
    providerPhone: 'Telefon',
    providerEmail: 'Email',
    routeLocked: 'Trasa po płatności',
    bookingAccess: 'Dostęp do rezerwacji',
    provider: 'Wykonawca',
    paymentProtected: 'Chronione dane rezerwacji',
  },
} as const;

type TabKey = 'upcoming' | 'completed' | 'cancelled';

function formatPrice(price: number) {
  return `£${price.toFixed(2)}`;
}

function getStatusStyles(status: BookingStatus) {
  if (status === 'pending') {
    return { background: '#fff5e8', color: '#d68612' };
  }
  if (status === 'completed') {
    return { background: '#eef9f1', color: '#2fa35a' };
  }
  if (status === 'cancelled') {
    return { background: '#fff1f1', color: '#ef4444' };
  }
  return { background: '#eef4ff', color: '#2f7cf6' };
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

    window.addEventListener('focus', syncLanguage);
    const unsubBookings = subscribeToBookingsStore(syncBookings);

    return () => {
      window.removeEventListener('focus', syncLanguage);
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
        background: '#fbf7ef',
        padding: '20px 16px 110px',
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
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
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
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <div
          style={{
            marginTop: 18,
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
                  border: 'none',
                  borderRadius: 999,
                  padding: '14px 20px',
                  fontWeight: 900,
                  fontSize: 15,
                  whiteSpace: 'nowrap',
                  background: active ? '#2f241c' : '#fff',
                  color: active ? '#fff' : '#2b231d',
                  boxShadow: active
                    ? '0 10px 22px rgba(47,36,28,0.18)'
                    : 'inset 0 0 0 1px #efe4d7',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredBookings.length === 0 && (
            <div
              style={{
                borderRadius: 30,
                border: '1px solid #efe4d7',
                background: '#fff',
                padding: 24,
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#7a7065',
                boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
              }}
            >
              {text.empty}
            </div>
          )}

          {filteredBookings.map((booking) => {
            const detailsUnlocked =
              booking.unlockFeePaid || booking.usedWelcomeBonus || booking.usedReferralCredit;

            return (
              <div
                key={booking.id}
                style={{
                  borderRadius: 30,
                  border: '1px solid #efe4d7',
                  background: '#fff',
                  padding: 16,
                  boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
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
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#eef4ff',
                        color: '#2f7cf6',
                      }}
                    >
                      {text.unlockPaid}
                    </span>
                  )}

                  {booking.usedWelcomeBonus && (
                    <span
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#fff5e8',
                        color: '#d68612',
                      }}
                    >
                      {text.welcomeBonus}
                    </span>
                  )}

                  {booking.usedReferralCredit && (
                    <span
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        background: '#fff1f7',
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
                    background: '#fcfaf6',
                    border: '1px solid #f1e8dc',
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
                        border: '1px solid #efe4d7',
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
                        border: '1px solid #efe4d7',
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
                      background: detailsUnlocked ? '#eef9f1' : '#fff6e8',
                      padding: 12,
                      border: detailsUnlocked ? '1px solid #dcecdf' : '1px solid #f4e3c5',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: detailsUnlocked ? '#2fa35a' : '#d68612',
                        marginBottom: 6,
                      }}
                    >
                      {detailsUnlocked ? text.detailsUnlocked : text.secureBooking}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: detailsUnlocked ? '#2f6f46' : '#8d6c24',
                        fontWeight: 700,
                      }}
                    >
                      {detailsUnlocked
                        ? `${text.exactAddress}: ${booking.location}`
                        : text.hiddenUntilPaid}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 24,
                    border: '1px solid #f1e8dc',
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
                        padding: '8px 10px',
                        background: detailsUnlocked ? '#eef9f1' : '#fff5e8',
                        color: detailsUnlocked ? '#2fa35a' : '#d68612',
                        fontSize: 11,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {detailsUnlocked ? text.bookingAccess : text.paymentProtected}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fcfaf6',
                        padding: 12,
                        border: '1px solid #f1e8dc',
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
                          color: detailsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {detailsUnlocked ? '+44 7700 123456' : '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fcfaf6',
                        padding: 12,
                        border: '1px solid #f1e8dc',
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
                          color: detailsUnlocked ? '#17130f' : '#a19488',
                        }}
                      >
                        {detailsUnlocked ? 'master@mapbook.app' : '••••••••••'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fcfaf6',
                        padding: 12,
                        border: '1px solid #f1e8dc',
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
                        {text.exactAddress}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: detailsUnlocked ? '#17130f' : '#a19488',
                          lineHeight: 1.45,
                        }}
                      >
                        {detailsUnlocked ? booking.location : '••••••••••'}
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
                      disabled={!detailsUnlocked}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: 'none',
                        background: detailsUnlocked ? '#eef4ff' : '#f2f1ef',
                        color: detailsUnlocked ? '#2f7cf6' : '#b0a79e',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: detailsUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {text.writeSeller}
                    </button>

                    <button
                      type="button"
                      disabled={!detailsUnlocked}
                      style={{
                        height: 52,
                        borderRadius: 18,
                        border: 'none',
                        background: detailsUnlocked ? '#eef9f1' : '#f2f1ef',
                        color: detailsUnlocked ? '#2fa35a' : '#b0a79e',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: detailsUnlocked ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {text.callSeller}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!detailsUnlocked}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      height: 54,
                      borderRadius: 20,
                      border: 'none',
                      background: detailsUnlocked
                        ? 'linear-gradient(180deg, #ff62aa 0%, #ff4fa0 100%)'
                        : '#f2f1ef',
                      color: detailsUnlocked ? '#fff' : '#b0a79e',
                      fontSize: 16,
                      fontWeight: 900,
                      boxShadow: detailsUnlocked
                        ? '0 12px 24px rgba(255,79,160,0.18)'
                        : 'none',
                      cursor: detailsUnlocked ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {detailsUnlocked ? text.routeToMaster : text.routeLocked}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/master/${booking.masterId}`)}
                  style={{
                    marginTop: 14,
                    width: '100%',
                    height: 56,
                    borderRadius: 22,
                    border: 'none',
                    background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 900,
                    boxShadow: '0 14px 28px rgba(31,23,18,0.20)',
                    cursor: 'pointer',
                  }}
                >
                  {text.serviceDetails}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
