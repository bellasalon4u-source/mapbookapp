'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type BookingTab = 'upcoming' | 'completed' | 'cancelled';

type BookingItem = {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  status: BookingStatus;
  image: string;
  price: string;
};

const pageTexts = {
  EN: {
    title: 'My bookings',
    subtitle: 'Upcoming visits and booking history',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completedStatus: 'Completed',
    cancelledStatus: 'Cancelled',
    serviceDetails: 'Service details',
    cancelBooking: 'Cancel booking',
    rebook: 'Book again',
    emptyUpcoming: 'No upcoming bookings yet',
    emptyCompleted: 'No completed bookings yet',
    emptyCancelled: 'No cancelled bookings yet',
    back: 'Back',
    home: 'Home',
    total: 'Total',
    bookingOverview: 'Booking overview',
    activeNow: 'Active now',
  },
  ES: {
    title: 'Mis reservas',
    subtitle: 'Próximas visitas e historial de reservas',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completedStatus: 'Completada',
    cancelledStatus: 'Cancelada',
    serviceDetails: 'Detalles del servicio',
    cancelBooking: 'Cancelar reserva',
    rebook: 'Reservar otra vez',
    emptyUpcoming: 'Aún no hay reservas próximas',
    emptyCompleted: 'Aún no hay reservas completadas',
    emptyCancelled: 'Aún no hay reservas canceladas',
    back: 'Atrás',
    home: 'Inicio',
    total: 'Total',
    bookingOverview: 'Resumen de reservas',
    activeNow: 'Activo ahora',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Предстоящие визиты и история бронирований',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'В ожидании',
    confirmed: 'Подтверждено',
    completedStatus: 'Завершено',
    cancelledStatus: 'Отменено',
    serviceDetails: 'Детали услуги',
    cancelBooking: 'Отменить бронь',
    rebook: 'Забронировать снова',
    emptyUpcoming: 'Пока нет предстоящих бронирований',
    emptyCompleted: 'Пока нет завершённых бронирований',
    emptyCancelled: 'Пока нет отменённых бронирований',
    back: 'Назад',
    home: 'Главная',
    total: 'Всего',
    bookingOverview: 'Обзор бронирований',
    activeNow: 'Активно сейчас',
  },
  CZ: {
    title: 'Moje rezervace',
    subtitle: 'Nadcházející návštěvy a historie rezervací',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká se',
    confirmed: 'Potvrzeno',
    completedStatus: 'Dokončeno',
    cancelledStatus: 'Zrušeno',
    serviceDetails: 'Detail služby',
    cancelBooking: 'Zrušit rezervaci',
    rebook: 'Rezervovat znovu',
    emptyUpcoming: 'Zatím žádné nadcházející rezervace',
    emptyCompleted: 'Zatím žádné dokončené rezervace',
    emptyCancelled: 'Zatím žádné zrušené rezervace',
    back: 'Zpět',
    home: 'Domů',
    total: 'Celkem',
    bookingOverview: 'Přehled rezervací',
    activeNow: 'Aktivní nyní',
  },
  DE: {
    title: 'Meine Buchungen',
    subtitle: 'Bevorstehende Besuche und Buchungsverlauf',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    completedStatus: 'Abgeschlossen',
    cancelledStatus: 'Storniert',
    serviceDetails: 'Servicedetails',
    cancelBooking: 'Buchung stornieren',
    rebook: 'Erneut buchen',
    emptyUpcoming: 'Noch keine bevorstehenden Buchungen',
    emptyCompleted: 'Noch keine abgeschlossenen Buchungen',
    emptyCancelled: 'Noch keine stornierten Buchungen',
    back: 'Zurück',
    home: 'Start',
    total: 'Gesamt',
    bookingOverview: 'Buchungsübersicht',
    activeNow: 'Jetzt aktiv',
  },
  PL: {
    title: 'Moje rezerwacje',
    subtitle: 'Nadchodzące wizyty i historia rezerwacji',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekujące',
    confirmed: 'Potwierdzone',
    completedStatus: 'Zakończone',
    cancelledStatus: 'Anulowane',
    serviceDetails: 'Szczegóły usługi',
    cancelBooking: 'Anuluj rezerwację',
    rebook: 'Zarezerwuj ponownie',
    emptyUpcoming: 'Brak nadchodzących rezerwacji',
    emptyCompleted: 'Brak zakończonych rezerwacji',
    emptyCancelled: 'Brak anulowanych rezerwacji',
    back: 'Wstecz',
    home: 'Strona główna',
    total: 'Łącznie',
    bookingOverview: 'Przegląd rezerwacji',
    activeNow: 'Aktywne teraz',
  },
} as const;

const demoBookings: BookingItem[] = [
  {
    id: 'booking-1',
    title: 'Brow Shape',
    place: 'Camden Brows Bar',
    date: '24 Apr 2026',
    time: '12:00',
    status: 'pending',
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    price: '£28',
  },
  {
    id: 'booking-2',
    title: "Men's Haircut",
    place: 'Soho Barber Club',
    date: '27 Apr 2026',
    time: '15:30',
    status: 'confirmed',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    price: '£25',
  },
  {
    id: 'booking-3',
    title: 'Relax Massage Session',
    place: 'Mila Wellness',
    date: '14 Apr 2026',
    time: '18:00',
    status: 'completed',
    image:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    price: '£45',
  },
  {
    id: 'booking-4',
    title: 'Nail Set',
    place: 'Beauty Studio Rose',
    date: '10 Apr 2026',
    time: '11:15',
    status: 'cancelled',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    price: '£32',
  },
];

function getTexts(language: AppLanguage) {
  return pageTexts[language as keyof typeof pageTexts] || pageTexts.EN;
}

function getStatusMeta(status: BookingStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'pending') {
    return {
      label: text.pending,
      bg: '#fff0da',
      color: '#c07a00',
    };
  }

  if (status === 'confirmed') {
    return {
      label: text.confirmed,
      bg: '#dff2e3',
      color: '#1d7a38',
    };
  }

  if (status === 'completed') {
    return {
      label: text.completedStatus,
      bg: '#e6efff',
      color: '#2559b7',
    };
  }

  return {
    label: text.cancelledStatus,
    bg: '#fde5e5',
    color: '#b53a3a',
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => unsubscribe();
  }, []);

  const text = useMemo(() => getTexts(language), [language]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return demoBookings.filter(
        (item) => item.status === 'pending' || item.status === 'confirmed'
      );
    }

    if (activeTab === 'completed') {
      return demoBookings.filter((item) => item.status === 'completed');
    }

    return demoBookings.filter((item) => item.status === 'cancelled');
  }, [activeTab]);

  const emptyText =
    activeTab === 'upcoming'
      ? text.emptyUpcoming
      : activeTab === 'completed'
      ? text.emptyCompleted
      : text.emptyCancelled;

  const activeNowCount = demoBookings.filter(
    (item) => item.status === 'pending' || item.status === 'confirmed'
  ).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#17130f',
        paddingBottom: 110,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
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
            aria-label={text.back}
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
                lineHeight: 1.15,
              }}
            >
              {text.title}
            </div>
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
              fontSize: 22,
              color: '#17130f',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ⌂
          </button>
        </div>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#2f241c',
                color: '#fff',
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff1f7',
                    color: '#ff4fa0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                  }}
                >
                  📅
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: '#ffffff',
                    }}
                  >
                    {text.bookingOverview}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: '#ddd2c6',
                      fontWeight: 700,
                    }}
                  >
                    {text.title}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    minHeight: 40,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#dff2e3',
                    color: '#1d7a38',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {text.activeNow}: {activeNowCount}
                </div>

                <div
                  style={{
                    minHeight: 40,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {text.total}: {demoBookings.length}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <div
            style={{
              background: '#fff',
              border: '2px solid #111111',
              borderRadius: 26,
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
                    minHeight: 52,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: active ? '#17130f' : '#fff',
                    color: active ? '#fff' : '#17130f',
                    fontSize: 15,
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

        <section style={{ marginTop: 18 }}>
          {filteredBookings.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 28,
                padding: '28px 20px',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#6f7882',
              }}
            >
              {emptyText}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {filteredBookings.map((booking) => {
                const statusMeta = getStatusMeta(booking.status, text);
                const showCancelButton =
                  booking.status === 'pending' || booking.status === 'confirmed';

                return (
                  <article
                    key={booking.id}
                    style={{
                      background: '#fff',
                      border: '2px solid #111111',
                      borderRadius: 30,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 42,
                          padding: '0 16px',
                          borderRadius: 999,
                          border: '2px solid #111111',
                          background: statusMeta.bg,
                          color: statusMeta.color,
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        {statusMeta.label}
                      </div>

                      <button
                        type="button"
                        style={{
                          border: '2px solid #111111',
                          background: '#fff',
                          color: '#17130f',
                          width: 42,
                          height: 42,
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
                        gridTemplateColumns: '96px 1fr',
                        gap: 16,
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={booking.image}
                        alt={booking.title}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'cover',
                          borderRadius: 22,
                          border: '2px solid #111111',
                          display: 'block',
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: '#17130f',
                            lineHeight: 1.2,
                          }}
                        >
                          {booking.title}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#6d6d6d',
                            lineHeight: 1.35,
                          }}
                        >
                          {booking.place}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#5c6470',
                            lineHeight: 1.35,
                          }}
                        >
                          {booking.date} • {booking.time}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 17,
                            fontWeight: 900,
                            color: '#17130f',
                          }}
                        >
                          {booking.price}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                      <button
                        type="button"
                        style={{
                          minHeight: 56,
                          borderRadius: 22,
                          border: '2px solid #111111',
                          background: '#ffffff',
                          color: '#17130f',
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {text.serviceDetails}
                      </button>

                      {showCancelButton ? (
                        <button
                          type="button"
                          style={{
                            minHeight: 56,
                            borderRadius: 22,
                            border: '2px solid #111111',
                            background: '#fdeaea',
                            color: '#c74343',
                            fontSize: 16,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {text.cancelBooking}
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={{
                            minHeight: 56,
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
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
