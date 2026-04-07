'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../services/i18n';
import {
  getBookings,
  subscribeToBookingsStore,
  type BookingItem,
  type BookingStatus,
} from '../app/services/bookingsStore';

const bookingsTexts = {
  EN: {
    title: 'My bookings',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending confirmation',
    unlockPaid: 'Unlock paid',
    welcomeBonus: 'Welcome Bonus used',
    referralUsed: 'Referral booking used',
    empty: 'No bookings in this section yet',
  },
  ES: {
    title: 'Mis reservas',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Esperando confirmación',
    unlockPaid: 'Unlock pagado',
    welcomeBonus: 'Welcome Bonus usado',
    referralUsed: 'Reserva por referido usada',
    empty: 'Todavía no hay reservas en esta sección',
  },
  RU: {
    title: 'Мои бронирования',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ожидает подтверждения',
    unlockPaid: 'Unlock оплачен',
    welcomeBonus: 'Использован Welcome Bonus',
    referralUsed: 'Использовано бесплатное бронирование',
    empty: 'В этом разделе пока нет бронирований',
  },
  CZ: {
    title: 'Moje rezervace',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká na potvrzení',
    unlockPaid: 'Unlock zaplacen',
    welcomeBonus: 'Použit Welcome Bonus',
    referralUsed: 'Použita rezervace zdarma',
    empty: 'V této sekci zatím nejsou žádné rezervace',
  },
  DE: {
    title: 'Meine Buchungen',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Wartet auf Bestätigung',
    unlockPaid: 'Unlock bezahlt',
    welcomeBonus: 'Welcome Bonus verwendet',
    referralUsed: 'Kostenlose Empfehlung verwendet',
    empty: 'In diesem Bereich gibt es noch keine Buchungen',
  },
  PL: {
    title: 'Moje rezerwacje',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekuje na potwierdzenie',
    unlockPaid: 'Unlock opłacony',
    welcomeBonus: 'Użyto Welcome Bonus',
    referralUsed: 'Użyto darmowej rezerwacji',
    empty: 'W tej sekcji nie ma jeszcze rezerwacji',
  },
} as const;

type TabKey = 'upcoming' | 'completed' | 'cancelled';

function formatPrice(price: number) {
  return `£${price.toFixed(2)}`;
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
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </button>

          <h1 className="text-xl font-bold text-[#1d1712]">{text.title}</h1>

          <div className="h-11 w-11" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              activeTab === 'upcoming'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.upcoming}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              activeTab === 'completed'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.completed}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              activeTab === 'cancelled'
                ? 'bg-[#2f241c] text-white'
                : 'border border-[#efe4d7] bg-white text-[#3a2d24]'
            }`}
          >
            {text.cancelled}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {filteredBookings.length === 0 && (
            <div className="rounded-[28px] border border-[#efe4d7] bg-white p-6 text-center text-sm font-medium text-[#7a7065] shadow-sm">
              {text.empty}
            </div>
          )}

          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    booking.masterAvatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={booking.masterName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-extrabold text-[#1d1712]">
                        {booking.masterName}
                      </h2>
                      <p className="mt-1 text-sm text-[#6f6458]">{booking.serviceName}</p>
                      <p className="mt-1 text-xs text-[#8a7d70]">{booking.location}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-[#1d1712]">
                        {formatPrice(booking.price)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm font-medium text-[#5f5449]">
                    {booking.dateLabel}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        booking.status === 'pending'
                          ? 'bg-[#fff1df] text-[#c67610]'
                          : booking.status === 'completed'
                          ? 'bg-[#e9f7ea] text-[#2e8b57]'
                          : booking.status === 'cancelled'
                          ? 'bg-[#fdeaea] text-[#c94d4d]'
                          : 'bg-[#f2ede7] text-[#5c5046]'
                      }`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>

                    {booking.unlockFeePaid && (
                      <span className="rounded-full bg-[#f2ede7] px-3 py-1 text-xs font-bold text-[#5c5046]">
                        {text.unlockPaid}
                      </span>
                    )}

                    {booking.usedWelcomeBonus && (
                      <span className="rounded-full bg-[#e8f5ea] px-3 py-1 text-xs font-bold text-[#2d8a55]">
                        {text.welcomeBonus}
                      </span>
                    )}

                    {booking.usedReferralCredit && (
                      <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-bold text-[#4b67c2]">
                        {text.referralUsed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
