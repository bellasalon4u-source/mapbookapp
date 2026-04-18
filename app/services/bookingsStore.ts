export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending';

export type BookingItem = {
  id: string;
  masterId: string;
  masterName: string;
  masterAvatar?: string;
  serviceName: string;
  category?: string;

  // Для клиента всегда храним безопасную локацию
  location: string;

  // Безопасный район / зона показа
  areaLabel?: string;

  // Точный адрес — только для внутреннего хранения, не показывать напрямую
  exactAddress?: string;

  dateLabel: string;
  dateTime: string;
  price: number;
  status: BookingStatus;

  // Старое поле оставляем для совместимости
  unlockFeePaid: boolean;

  usedWelcomeBonus?: boolean;
  usedReferralCredit?: boolean;

  // Новый блок правил доступа
  bookingConfirmedByMaster?: boolean;
  clientPaid?: boolean;
  paymentReceivedByPlatform?: boolean;
  promotionPaidByMaster?: boolean;

  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactInstagram?: string;
};

const STORAGE_KEY = 'mapbook_bookings_state_v2';

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
    areaLabel: 'Camden, London',
    exactAddress: '21 Camden High Street, London',
    dateLabel: 'Сегодня в 14:00',
    dateTime: '2026-04-12T14:00:00.000Z',
    price: 35,
    status: 'upcoming',
    unlockFeePaid: true,
    bookingConfirmedByMaster: true,
    clientPaid: true,
    paymentReceivedByPlatform: true,
    promotionPaidByMaster: true,
    contactPhone: '+44 7700 123456',
    contactEmail: 'master@mapbook.app',
    contactWhatsapp: '+44 7700 123456',
    contactTelegram: '@maria_camden',
    contactInstagram: '@maria.nails.camden',
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
    areaLabel: 'Soho, London',
    exactAddress: '18 Greek Street, Soho, London',
    dateLabel: 'Завтра в 11:30',
    dateTime: '2026-04-13T11:30:00.000Z',
    price: 28,
    status: 'upcoming',
    unlockFeePaid: true,
    usedWelcomeBonus: true,
    bookingConfirmedByMaster: true,
    clientPaid: true,
    paymentReceivedByPlatform: true,
    promotionPaidByMaster: true,
    contactPhone: '+44 7700 654321',
    contactEmail: 'barber@mapbook.app',
    contactWhatsapp: '+44 7700 654321',
    contactTelegram: '@soho_barber',
    contactInstagram: '@soho.barber.club',
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
    areaLabel: 'Islington, London',
    exactAddress: '7 Upper Street, Islington, London',
    dateLabel: '15 мая, 16:00',
    dateTime: '2026-05-15T16:00:00.000Z',
    price: 60,
    status: 'pending',
    unlockFeePaid: false,
    usedReferralCredit: true,
    bookingConfirmedByMaster: false,
    clientPaid: false,
    paymentReceivedByPlatform: false,
    promotionPaidByMaster: false,
    contactPhone: '+44 7700 777888',
    contactEmail: 'wellness@mapbook.app',
    contactWhatsapp: '+44 7700 777888',
    contactTelegram: '@olivia_wellness',
    contactInstagram: '@olivia.wellness',
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
    areaLabel: 'Chelsea, London',
    exactAddress: '11 King’s Road, Chelsea, London',
    dateLabel: '10 апреля, 12:00',
    dateTime: '2026-04-10T12:00:00.000Z',
    price: 50,
    status: 'completed',
    unlockFeePaid: true,
    bookingConfirmedByMaster: true,
    clientPaid: true,
    paymentReceivedByPlatform: true,
    promotionPaidByMaster: true,
    contactPhone: '+44 7700 111222',
    contactEmail: 'beauty@mapbook.app',
    contactWhatsapp: '+44 7700 111222',
    contactTelegram: '@sophia_makeup',
    contactInstagram: '@sophia.makeup.chelsea',
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
    areaLabel: 'Wembley, London',
    exactAddress: '52 Wembley Park Drive, London',
    dateLabel: '2 апреля, 15:00',
    dateTime: '2026-04-02T15:00:00.000Z',
    price: 40,
    status: 'cancelled',
    unlockFeePaid: false,
    bookingConfirmedByMaster: false,
    clientPaid: false,
    paymentReceivedByPlatform: false,
    promotionPaidByMaster: false,
    contactPhone: '+44 7700 333444',
    contactEmail: 'repair@mapbook.app',
    contactWhatsapp: '+44 7700 333444',
    contactTelegram: '@daniel_fix',
    contactInstagram: '@daniel.repair',
  },
];

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalizeBooking(booking: BookingItem): BookingItem {
  return {
    ...booking,
    areaLabel: booking.areaLabel || booking.location,
    bookingConfirmedByMaster: booking.bookingConfirmedByMaster ?? false,
    clientPaid: booking.clientPaid ?? booking.unlockFeePaid ?? false,
    paymentReceivedByPlatform: booking.paymentReceivedByPlatform ?? false,
    promotionPaidByMaster: booking.promotionPaidByMaster ?? false,
  };
}

function loadBookings(): BookingItem[] {
  if (!isBrowser()) return defaultBookings.map(normalizeBooking);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBookings.map(normalizeBooking);

    const parsed = JSON.parse(raw) as BookingItem[];
    if (!Array.isArray(parsed)) return defaultBookings.map(normalizeBooking);

    return parsed.map(normalizeBooking);
  } catch {
    return defaultBookings.map(normalizeBooking);
  }
}

let bookingsState: BookingItem[] = defaultBookings.map(normalizeBooking);

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

export function getBookingById(bookingId: string) {
  return bookingsState.find((booking) => booking.id === bookingId) ?? null;
}

export function subscribeToBookingsStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setBookings(nextBookings: BookingItem[]) {
  bookingsState = nextBookings.map(normalizeBooking);
  emitChange();
}

export function resetBookings() {
  bookingsState = defaultBookings.map(normalizeBooking);
  emitChange();
}

export function addBooking(booking: BookingItem) {
  bookingsState = [normalizeBooking(booking), ...bookingsState];
  emitChange();
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  bookingsState = bookingsState.map((booking) =>
    booking.id === bookingId ? { ...booking, status } : booking
  );
  emitChange();
}

export function patchBooking(bookingId: string, patch: Partial<BookingItem>) {
  bookingsState = bookingsState.map((booking) =>
    booking.id === bookingId ? normalizeBooking({ ...booking, ...patch }) : booking
  );
  emitChange();
}

export function markBookingAsPaid(bookingId: string) {
  patchBooking(bookingId, {
    unlockFeePaid: true,
    clientPaid: true,
    paymentReceivedByPlatform: true,
  });
}

export function confirmBookingByMaster(bookingId: string) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  patchBooking(bookingId, {
    bookingConfirmedByMaster: true,
    status: booking.status === 'pending' ? 'upcoming' : booking.status,
  });
}

export function setMasterPromotionPaid(bookingId: string, value: boolean) {
  patchBooking(bookingId, {
    promotionPaidByMaster: value,
  });
}

export function canShowExactAddress(booking: BookingItem) {
  return Boolean(
    booking.clientPaid &&
      booking.paymentReceivedByPlatform &&
      booking.promotionPaidByMaster
  );
}

export function canShowDirectContacts(booking: BookingItem) {
  return Boolean(
    booking.bookingConfirmedByMaster &&
      booking.clientPaid &&
      booking.paymentReceivedByPlatform &&
      booking.promotionPaidByMaster
  );
}

export function getPublicBookingLocation(booking: BookingItem) {
  return booking.areaLabel || booking.location;
}

export function getVisibleBookingLocation(booking: BookingItem) {
  if (canShowExactAddress(booking)) {
    return booking.exactAddress || booking.areaLabel || booking.location;
  }

  return booking.areaLabel || booking.location;
}

export function getProtectedBookingContact(booking: BookingItem) {
  if (!canShowDirectContacts(booking)) {
    return {
      phone: null,
      email: null,
      whatsapp: null,
      telegram: null,
      instagram: null,
      locked: true,
    };
  }

  return {
    phone: booking.contactPhone || null,
    email: booking.contactEmail || null,
    whatsapp: booking.contactWhatsapp || null,
    telegram: booking.contactTelegram || null,
    instagram: booking.contactInstagram || null,
    locked: false,
  };
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
