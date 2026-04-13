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
  },
  ES: {
    title: 'Mis reservas',
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
  },
  RU: {
    title: 'Мои бронирования',
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
  },
  CZ: {
    title: 'Moje rezervace',
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
  },
  DE: {
    title: 'Meine Buchungen',
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
  },
  PL: {
    title: 'Moje rezerwacje',
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
  return (
    pageTexts[language as keyof typeof pageTexts] ||
    pageTexts.EN
  );
}

function getStatusMeta(status: BookingStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'pending') {
    return {
      label: text.pending,
      bg: '#f7e5b7',
      color: '#8a6508',
      border: '#d5b35b',
    };
  }

  if (status === 'confirmed') {
    return {
      label: text.confirmed,
      bg: '#dff2e3',
      color: '#1d7a38',
      border: '#8bc59b',
    };
  }

  if (status === 'completed') {
    return {
      label: text.completedStatus,
      bg: '#e6efff',
      color: '#2559b7',
      border: '#97b3e8',
    };
  }

  return {
    label: text.cancelledStatus,
    bg: '#fde5e5',
    color: '#b53a3a',
    border: '#e4a4a4',
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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        color: '#1f2430',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'rgba(247,244,238,0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e7dfd4',
            padding: '16px',
          }}
        >
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
                border: '1.5px solid #1d1d1d',
                background: '#fff',
                fontSize: 26,
                color: '#1f2430',
                lineHeight: 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.15,
              }}
            >
              {text.title}
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label={text.home}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '1.5px solid #1d1d1d',
                background: '#fff',
                fontSize: 24,
                color: '#1f2430',
                lineHeight: 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              ⌂
            </button>
          </div>
        </header>

        <section style={{ padding: '16px' }}>
          <div
            style={{
              background: '#ebe6dd',
              border: '1.5px solid #1d1d1d',
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
                    minHeight: 54,
                    borderRadius: 20,
                    border: active ? '1.5px solid #1d1d1d' : '1px solid transparent',
                    background: active ? '#fff' : 'transparent',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: active ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ padding: '0 16px' }}>
          {filteredBookings.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #1d1d1d',
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
                      border: '1.5px solid #1d1d1d',
                      borderRadius: 30,
                      padding: 18,
                      boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
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
                          border: `1.5px solid ${statusMeta.border}`,
                          background: statusMeta.bg,
                          color: statusMeta.color,
                          fontSize: 15,
                          fontWeight: 900,
                        }}
                      >
                        {statusMeta.label}
                      </div>

                      <button
                        type="button"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#666',
                          fontSize: 28,
                          lineHeight: 1,
                          cursor: 'pointer',
                          padding: 0,
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
                          border: '1.5px solid #1d1d1d',
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
                            fontSize: 16,
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
                            fontSize: 16,
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
                            fontSize: 16,
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
                          minHeight: 60,
                          borderRadius: 22,
                          border: '2px solid #1d1d1d',
                          background: '#ffffff',
                          color: '#1d7a38',
                          fontSize: 17,
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
                            minHeight: 60,
                            borderRadius: 22,
                            border: '2px solid #1d1d1d',
                            background: '#fdeaea',
                            color: '#c74343',
                            fontSize: 17,
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
                            minHeight: 60,
                            borderRadius: 22,
                            border: '2px solid #1d1d1d',
                            background: '#eaf2ff',
                            color: '#1f4fa8',
                            fontSize: 17,
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

      <BottomNav />
    </main>
  );
}
