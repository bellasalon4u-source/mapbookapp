export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending';

export type BookingItem = {
  id: string;
  masterId: string;
  masterName: string;
  masterAvatar?: string;
  serviceName: string;
  category?: string;
  location: string;
  dateLabel: string;
  dateTime: string;
  price: number;
  status: BookingStatus;
  unlockFeePaid: boolean;
  usedWelcomeBonus?: boolean;
  usedReferralCredit?: boolean;
};

const STORAGE_KEY = 'mapbook_bookings_state';

const defaultBookings: BookingItem[] = [
  {
    id: 'booking_1',
    masterId: 'master_1',
    masterName: 'Мария Иванова',
    masterAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Маникюр',
    category: 'Красота',
    location: 'Camden, London',
    dateLabel: 'Сегодня в 14:00',
    dateTime: '2026-04-12T14:00:00.000Z',
    price: 35,
    status: 'upcoming',
    unlockFeePaid: true,
  },
  {
    id: 'booking_2',
    masterId: 'master_2',
    masterName: 'James Smith',
    masterAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Стрижка',
    category: 'Барбер',
    location: 'Soho, London',
    dateLabel: 'Завтра в 11:30',
    dateTime: '2026-04-13T11:30:00.000Z',
    price: 28,
    status: 'upcoming',
    unlockFeePaid: true,
    usedWelcomeBonus: true,
  },
  {
    id: 'booking_3',
    masterId: 'master_3',
    masterName: 'Olivia Brown',
    masterAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Массаж',
    category: 'Велнес',
    location: 'Islington, London',
    dateLabel: '15 мая, 16:00',
    dateTime: '2026-05-15T16:00:00.000Z',
    price: 60,
    status: 'pending',
    unlockFeePaid: false,
    usedReferralCredit: true,
  },
  {
    id: 'booking_4',
    masterId: 'master_4',
    masterName: 'Sophia Lee',
    masterAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Визаж',
    category: 'Красота',
    location: 'Chelsea, London',
    dateLabel: '10 апреля, 12:00',
    dateTime: '2026-04-10T12:00:00.000Z',
    price: 50,
    status: 'completed',
    unlockFeePaid: true,
  },
  {
    id: 'booking_5',
    masterId: 'master_5',
    masterName: 'Daniel Wilson',
    masterAvatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Ремонт телефона',
    category: 'Ремонт',
    location: 'Wembley, London',
    dateLabel: '2 апреля, 15:00',
    dateTime: '2026-04-02T15:00:00.000Z',
    price: 40,
    status: 'cancelled',
    unlockFeePaid: true,
  },
];

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadBookings(): BookingItem[] {
  if (!isBrowser()) return defaultBookings;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBookings;

    const parsed = JSON.parse(raw) as BookingItem[];
    return Array.isArray(parsed) ? parsed : defaultBookings;
  } catch {
    return defaultBookings;
  }
}

let bookingsState: BookingItem[] = defaultBookings;

if (isBrowser()) {
  bookingsState = loadBookings();
}

function saveBookings() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingsState));
}

function emitChange() {
  saveBookings();
  listeners.forEach((listener) => listener());
}

export function getBookings(): BookingItem[] {
  return bookingsState;
}

export function subscribeToBookingsStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setBookings(nextBookings: BookingItem[]) {
  bookingsState = nextBookings;
  emitChange();
}

export function resetBookings() {
  bookingsState = defaultBookings;
  emitChange();
}

export function addBooking(booking: BookingItem) {
  bookingsState = [booking, ...bookingsState];
  emitChange();
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  bookingsState = bookingsState.map((booking) =>
    booking.id === bookingId ? { ...booking, status } : booking
  );
  emitChange();
}

export function getUpcomingBookings() {
  return bookingsState.filter(
    (booking) => booking.status === 'upcoming' || booking.status === 'pending'
  );
}

export function getCompletedBookings() {
  return bookingsState.filter((booking) => booking.status === 'completed');
}

export function getCancelledBookings() {
  return bookingsState.filter((booking) => booking.status === 'cancelled');
}

export function getLatestBooking() {
  return bookingsState[0] ?? null;
}
