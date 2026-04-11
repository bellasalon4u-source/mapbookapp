'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllMasters } from '../../services/masters';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type TabType = 'upcoming' | 'completed' | 'cancelled';

type BookingItem = {
  id: number;
  masterId: string;
  service: string;
  master: string;
  date: string;
  time: string;
  image: string;
  phone: string;
  bookingStatus:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled_by_client'
    | 'cancelled_by_seller'
    | 'no_show';
  reviewStatus: 'locked' | 'available' | 'submitted';
};

const pageTexts: Record<
  AppLanguage,
  {
    title: string;
    upcoming: string;
    completed: string;
    cancelled: string;
    pending: string;
    confirmed: string;
    reviewed: string;
    completedStatus: string;
    cancelledByYou: string;
    cancelledBySeller: string;
    noShow: string;
    serviceDetails: string;
    cancelBooking: string;
    writeSeller: string;
    callSeller: string;
    leaveReview: string;
    viewReview: string;
    cancelConfirm: string;
    noBookings: string;
  }
> = {
  EN: {
    title: 'My bookings',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    confirmed: 'Confirmed',
    reviewed: 'Reviewed',
    completedStatus: 'Completed',
    cancelledByYou: 'Cancelled by you',
    cancelledBySeller: 'Cancelled by seller',
    noShow: 'No-show',
    serviceDetails: 'Service details',
    cancelBooking: 'Cancel booking',
    writeSeller: 'Write seller',
    callSeller: 'Call seller',
    leaveReview: 'Leave review',
    viewReview: 'View review',
    cancelConfirm: 'Cancel this booking?',
    noBookings: 'No bookings in this section yet',
  },
  RU: {
    title: 'Мои бронирования',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ожидает',
    confirmed: 'Подтверждено',
    reviewed: 'Отзыв оставлен',
    completedStatus: 'Завершено',
    cancelledByYou: 'Отменено вами',
    cancelledBySeller: 'Отменено мастером',
    noShow: 'Неявка',
    serviceDetails: 'Подробнее об услуге',
    cancelBooking: 'Отменить бронь',
    writeSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    leaveReview: 'Оставить отзыв',
    viewReview: 'Посмотреть отзыв',
    cancelConfirm: 'Отменить это бронирование?',
    noBookings: 'В этом разделе пока нет бронирований',
  },
  ES: {
    title: 'Mis reservas',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    reviewed: 'Reseñada',
    completedStatus: 'Completada',
    cancelledByYou: 'Cancelada por ti',
    cancelledBySeller: 'Cancelada por el profesional',
    noShow: 'No asistió',
    serviceDetails: 'Detalles del servicio',
    cancelBooking: 'Cancelar reserva',
    writeSeller: 'Escribir al profesional',
    callSeller: 'Llamar al profesional',
    leaveReview: 'Dejar reseña',
    viewReview: 'Ver reseña',
    cancelConfirm: '¿Cancelar esta reserva?',
    noBookings: 'Todavía no hay reservas en esta sección',
  },
  CZ: {
    title: 'Moje rezervace',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká se',
    confirmed: 'Potvrzeno',
    reviewed: 'Recenze přidána',
    completedStatus: 'Dokončeno',
    cancelledByYou: 'Zrušeno vámi',
    cancelledBySeller: 'Zrušeno poskytovatelem',
    noShow: 'Nedostavení se',
    serviceDetails: 'Detail služby',
    cancelBooking: 'Zrušit rezervaci',
    writeSeller: 'Napsat poskytovateli',
    callSeller: 'Zavolat poskytovateli',
    leaveReview: 'Přidat recenzi',
    viewReview: 'Zobrazit recenzi',
    cancelConfirm: 'Zrušit tuto rezervaci?',
    noBookings: 'V této sekci zatím nejsou žádné rezervace',
  },
  DE: {
    title: 'Meine Buchungen',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    reviewed: 'Bewertet',
    completedStatus: 'Abgeschlossen',
    cancelledByYou: 'Von dir storniert',
    cancelledBySeller: 'Vom Anbieter storniert',
    noShow: 'Nicht erschienen',
    serviceDetails: 'Service-Details',
    cancelBooking: 'Buchung stornieren',
    writeSeller: 'An Anbieter schreiben',
    callSeller: 'Anbieter anrufen',
    leaveReview: 'Bewertung abgeben',
    viewReview: 'Bewertung ansehen',
    cancelConfirm: 'Diese Buchung stornieren?',
    noBookings: 'In diesem Bereich gibt es noch keine Buchungen',
  },
  PL: {
    title: 'Moje rezerwacje',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekujące',
    confirmed: 'Potwierdzone',
    reviewed: 'Opinia dodana',
    completedStatus: 'Zakończone',
    cancelledByYou: 'Anulowane przez Ciebie',
    cancelledBySeller: 'Anulowane przez usługodawcę',
    noShow: 'Nieobecność',
    serviceDetails: 'Szczegóły usługi',
    cancelBooking: 'Anuluj rezerwację',
    writeSeller: 'Napisz do usługodawcy',
    callSeller: 'Zadzwoń do usługodawcy',
    leaveReview: 'Dodaj opinię',
    viewReview: 'Zobacz opinię',
    cancelConfirm: 'Anulować tę rezerwację?',
    noBookings: 'W tej sekcji nie ma jeszcze rezerwacji',
  },
};

const menuButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#f8f8f8',
  borderRadius: 12,
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: 15,
  fontWeight: 700,
  color: '#1d1d1d',
};

export default function BookingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [tab, setTab] = useState<TabType>('upcoming');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  const text = pageTexts[language] || pageTexts.EN;
  const masters = getAllMasters();

  const m1 = masters[0];
  const m2 = masters[1] ?? masters[0];
  const m3 = masters[2] ?? masters[0];
  const m4 = masters[3] ?? masters[1] ?? masters[0];

  const initialBookings: BookingItem[] = useMemo(
    () => [
      {
        id: 1,
        masterId: m1?.id || '',
        service: m1?.services?.[0]?.title || 'Keratin Bonds',
        master: m1?.name || 'Bella Keratin Studio',
        date: '24 Apr 2026',
        time: '12:00',
        image:
          m1?.services?.[0]?.image ||
          m1?.cover ||
          m1?.avatar ||
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80',
        phone: '+447700123456',
        bookingStatus: 'pending',
        reviewStatus: 'locked',
      },
      {
        id: 2,
        masterId: m2?.id || m1?.id || '',
        service: m2?.services?.[0]?.title || 'Brow Lamination',
        master: m2?.name || 'Camden Brows Bar',
        date: '27 Apr 2026',
        time: '15:30',
        image:
          m2?.services?.[0]?.image ||
          m2?.cover ||
          m2?.avatar ||
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
        phone: '+447700222333',
        bookingStatus: 'confirmed',
        reviewStatus: 'locked',
      },
      {
        id: 3,
        masterId: m3?.id || m1?.id || '',
        service: m3?.services?.[0]?.title || 'Hair Coloring',
        master: m3?.name || 'Olga Beauty Studio',
        date: '20 Apr 2026',
        time: '16:00',
        image:
          m3?.services?.[0]?.image ||
          m3?.cover ||
          m3?.avatar ||
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        phone: '+447700444555',
        bookingStatus: 'completed',
        reviewStatus: 'available',
      },
      {
        id: 4,
        masterId: m1?.id || '',
        service: m1?.services?.[1]?.title || m1?.services?.[0]?.title || 'Tape-In Extensions',
        master: m1?.name || 'Bella Keratin Studio',
        date: '18 Apr 2026',
        time: '11:00',
        image:
          m1?.services?.[1]?.image ||
          m1?.services?.[0]?.image ||
          m1?.cover ||
          m1?.avatar ||
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
        phone: '+447700123456',
        bookingStatus: 'completed',
        reviewStatus: 'submitted',
      },
      {
        id: 5,
        masterId: m4?.id || m1?.id || '',
        service: m4?.services?.[0]?.title || 'Nano Ring Extensions',
        master: m4?.name || 'Luxury Hair London',
        date: '15 Apr 2026',
        time: '13:00',
        image:
          m4?.services?.[0]?.image ||
          m4?.cover ||
          m4?.avatar ||
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        phone: '+447700777888',
        bookingStatus: 'cancelled_by_client',
        reviewStatus: 'locked',
      },
      {
        id: 6,
        masterId: m2?.id || m1?.id || '',
        service: m2?.services?.[1]?.title || m2?.services?.[0]?.title || 'Hair Botox',
        master: m2?.name || 'Silk Hair Salon',
        date: '12 Apr 2026',
        time: '10:00',
        image:
          m2?.services?.[1]?.image ||
          m2?.services?.[0]?.image ||
          m2?.cover ||
          m2?.avatar ||
          'https://images.unsplash.com/photo-1522336284037-91f7da073525?auto=format&fit=crop&w=600&q=80',
        phone: '+447700999111',
        bookingStatus: 'cancelled_by_seller',
        reviewStatus: 'locked',
      },
      {
        id: 7,
        masterId: m3?.id || m1?.id || '',
        service: m3?.services?.[1]?.title || m3?.services?.[0]?.title || 'Facial Massage',
        master: m3?.name || 'Glow Studio',
        date: '10 Apr 2026',
        time: '15:00',
        image:
          m3?.services?.[1]?.image ||
          m3?.services?.[0]?.image ||
          m3?.cover ||
          m3?.avatar ||
          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        phone: '+447700555666',
        bookingStatus: 'no_show',
        reviewStatus: 'locked',
      },
    ],
    [m1, m2, m3, m4]
  );

  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);

  const upcomingItems = useMemo(
    () =>
      bookings.filter(
        (item) =>
          item.bookingStatus === 'pending' || item.bookingStatus === 'confirmed'
      ),
    [bookings]
  );

  const completedItems = useMemo(
    () => bookings.filter((item) => item.bookingStatus === 'completed'),
    [bookings]
  );

  const cancelledItems = useMemo(
    () =>
      bookings.filter(
        (item) =>
          item.bookingStatus === 'cancelled_by_client' ||
          item.bookingStatus === 'cancelled_by_seller' ||
          item.bookingStatus === 'no_show'
      ),
    [bookings]
  );

  const currentItems =
    tab === 'upcoming'
      ? upcomingItems
      : tab === 'completed'
      ? completedItems
      : cancelledItems;

  const getStatusBadge = (
    bookingStatus: BookingItem['bookingStatus'],
    reviewStatus: BookingItem['reviewStatus']
  ) => {
    if (bookingStatus === 'pending') {
      return { text: text.pending, bg: '#f4e3bf', color: '#9a6a15' };
    }

    if (bookingStatus === 'confirmed') {
      return { text: text.confirmed, bg: '#dceedd', color: '#1f7d39' };
    }

    if (bookingStatus === 'completed' && reviewStatus === 'submitted') {
      return { text: text.reviewed, bg: '#dceedd', color: '#1f7d39' };
    }

    if (bookingStatus === 'completed') {
      return { text: text.completedStatus, bg: '#dceedd', color: '#1f7d39' };
    }

    if (bookingStatus === 'cancelled_by_client') {
      return { text: text.cancelledByYou, bg: '#f3dfdf', color: '#b14545' };
    }

    if (bookingStatus === 'cancelled_by_seller') {
      return { text: text.cancelledBySeller, bg: '#f3dfdf', color: '#b14545' };
    }

    return { text: text.noShow, bg: '#f3dfdf', color: '#b14545' };
  };

  const openBooking = (item: BookingItem) => {
    if (!item.masterId) return;
    router.push(`/master/${item.masterId}`);
  };

  const writeSeller = () => {
    router.push('/messages');
  };

  const callSeller = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const cancelBooking = (id: number) => {
    const confirmed = window.confirm(text.cancelConfirm);
    if (!confirmed) return;

    setBookings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              bookingStatus: 'cancelled_by_client',
              reviewStatus: 'locked',
            }
          : item
      )
    );
    setOpenMenuId(null);
    setTab('cancelled');
  };

  const leaveReview = (item: BookingItem) => {
    if (!item.masterId) return;
    router.push(`/master/${item.masterId}/leave-review`);
  };

  const viewReview = (item: BookingItem) => {
    if (!item.masterId) return;
    router.push(`/master/${item.masterId}/reviews`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8f8f8',
        fontFamily: 'Arial, sans-serif',
        color: '#151515',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: 'none',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 30, fontWeight: 800 }}>{text.title}</div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: 'none',
              background: '#fff',
              fontSize: 22,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: '#eeeeee',
            borderRadius: 999,
            padding: 6,
            gap: 6,
            marginBottom: 20,
          }}
        >
          {[
            { key: 'upcoming', label: text.upcoming },
            { key: 'completed', label: text.completed },
            { key: 'cancelled', label: text.cancelled },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key as TabType);
                setOpenMenuId(null);
              }}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 8px',
                fontWeight: 800,
                fontSize: 16,
                background: tab === item.key ? '#fff' : 'transparent',
                color: '#1d1d1d',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {currentItems.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                textAlign: 'center',
                color: '#6a6a6a',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {text.noBookings}
            </div>
          ) : null}

          {currentItems.map((item) => {
            const badge = getStatusBadge(item.bookingStatus, item.reviewStatus);

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 24,
                  padding: 16,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: 999,
                      padding: '8px 14px',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {badge.text}
                  </div>

                  <button
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                    }
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 24,
                      color: '#666',
                    }}
                  >
                    ⋯
                  </button>
                </div>

                {openMenuId === item.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 58,
                      right: 16,
                      width: 220,
                      background: '#fff',
                      border: '1px solid #e8e2d8',
                      borderRadius: 18,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                      padding: 8,
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <button
                      onClick={() => openBooking(item)}
                      style={menuButtonStyle}
                    >
                      {text.serviceDetails}
                    </button>

                    {(item.bookingStatus === 'pending' ||
                      item.bookingStatus === 'confirmed') && (
                      <button
                        onClick={() => cancelBooking(item.id)}
                        style={{ ...menuButtonStyle, color: '#c33d3d' }}
                      >
                        {text.cancelBooking}
                      </button>
                    )}

                    {item.bookingStatus === 'confirmed' && (
                      <>
                        <button onClick={writeSeller} style={menuButtonStyle}>
                          {text.writeSeller}
                        </button>
                        <button
                          onClick={() => callSeller(item.phone)}
                          style={menuButtonStyle}
                        >
                          {text.callSeller}
                        </button>
                      </>
                    )}

                    {item.bookingStatus === 'completed' &&
                      item.reviewStatus === 'available' && (
                        <button
                          onClick={() => leaveReview(item)}
                          style={menuButtonStyle}
                        >
                          {text.leaveReview}
                        </button>
                      )}

                    {item.bookingStatus === 'completed' &&
                      item.reviewStatus === 'submitted' && (
                        <button
                          onClick={() => viewReview(item)}
                          style={menuButtonStyle}
                        >
                          {text.viewReview}
                        </button>
                      )}
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '92px 1fr',
                    gap: 14,
                    marginTop: 14,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.service}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 18,
                      objectFit: 'cover',
                    }}
                  />

                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{item.service}</div>
                    <div style={{ marginTop: 6, color: '#6a6a6a', fontSize: 17 }}>
                      {item.master}
                    </div>
                    <div style={{ marginTop: 8, color: '#454545', fontSize: 16 }}>
                      {item.date} • {item.time}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => openBooking(item)}
                    style={{
                      flex: '1 1 160px',
                      borderRadius: 16,
                      padding: '14px 16px',
                      background: '#fff',
                      color: '#16803a',
                      border: '2px solid #16803a',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {text.serviceDetails}
                  </button>

                  {item.bookingStatus === 'pending' && (
                    <button
                      onClick={() => cancelBooking(item.id)}
                      style={{
                        flex: '1 1 160px',
                        borderRadius: 16,
                        padding: '14px 16px',
                        background: '#fff3f3',
                        color: '#c33d3d',
                        border: '2px solid #efcaca',
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {text.cancelBooking}
                    </button>
                  )}

                  {item.bookingStatus === 'confirmed' && (
                    <>
                      <button
                        onClick={writeSeller}
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#eef8f0',
                          color: '#16803a',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {text.writeSeller}
                      </button>

                      <button
                        onClick={() => callSeller(item.phone)}
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#eef8f0',
                          color: '#16803a',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {text.callSeller}
                      </button>

                      <button
                        onClick={() => cancelBooking(item.id)}
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#fff3f3',
                          color: '#c33d3d',
                          border: '2px solid #efcaca',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {text.cancelBooking}
                      </button>
                    </>
                  )}

                  {item.bookingStatus === 'completed' &&
                    item.reviewStatus === 'available' && (
                      <button
                        onClick={() => leaveReview(item)}
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#0f8b3f',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {text.leaveReview}
                      </button>
                    )}

                  {item.bookingStatus === 'completed' &&
                    item.reviewStatus === 'submitted' && (
                      <button
                        onClick={() => viewReview(item)}
                        style={{
                          flex: '1 1 160px',
                          borderRadius: 16,
                          padding: '14px 16px',
                          background: '#eef8f0',
                          color: '#16803a',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {text.viewReview}
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
