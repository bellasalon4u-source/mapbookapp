'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import {
  getBookings,
  subscribeToBookingsStore,
  updateBookingStatus,
  getPublicBookingLocation,
  getVisibleBookingLocation,
  getProtectedBookingContact,
  canShowExactAddress,
  canShowDirectContacts,
  type BookingItem,
  type BookingStatus,
} from '../services/bookingsStore';

type BookingTab = 'upcoming' | 'completed' | 'cancelled';

const pageTexts = {
  EN: {
    title: 'My bookings',
    subtitle: 'Upcoming visits, completed services and booking access',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending confirmation',
    confirmed: 'Upcoming',
    completedStatus: 'Completed',
    cancelledStatus: 'Cancelled',
    serviceDetails: 'Service details',
    closeDetails: 'Close',
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
    menuClose: 'Close',
    menuCancel: 'Cancel booking',
    menuOpenProfile: 'Open profile',
    provider: 'Provider',
    bookingSummary: 'Booking summary',
    dateTime: 'Date & time',
    detailsUnlocked: 'Details unlocked',
    detailsLocked: 'Details are locked',
    exactAddress: 'Exact address',
    area: 'Area',
    contactAndAddress: 'Contact and address',
    bookingAccess: 'Booking access',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'Write to seller',
    callSeller: 'Call seller',
    routeToMaster: 'Route to master',
    contactsHiddenTitle: 'Contacts hidden',
    contactsHiddenText:
      'Direct contacts and exact address will appear only after payment is received and promotion is paid by the master.',
    waitingMaster: 'Waiting for master confirmation',
    waitingPayment: 'Waiting for payment',
    waitingPromotion: 'Promotion not paid',
    unlockPaid: 'Unlock paid',
    welcomeBonus: 'Welcome Bonus used',
    referralUsed: 'Referral booking used',
    lockedValue: 'Locked',
    todayAt: 'Today at',
    tomorrowAt: 'Tomorrow at',
    noPhoneAction: 'Number unavailable',
    noMessageAction: 'Contact unavailable',
    noRouteAction: 'Address locked',
  },
  ES: {
    title: 'Mis reservas',
    subtitle: 'Próximas visitas, servicios completados y acceso a la reserva',
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    pending: 'Pendiente de confirmación',
    confirmed: 'Próxima',
    completedStatus: 'Completada',
    cancelledStatus: 'Cancelada',
    serviceDetails: 'Detalles del servicio',
    closeDetails: 'Cerrar',
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
    menuClose: 'Cerrar',
    menuCancel: 'Cancelar reserva',
    menuOpenProfile: 'Abrir perfil',
    provider: 'Profesional',
    bookingSummary: 'Resumen de la reserva',
    dateTime: 'Fecha y hora',
    detailsUnlocked: 'Detalles desbloqueados',
    detailsLocked: 'Los detalles están bloqueados',
    exactAddress: 'Dirección exacta',
    area: 'Zona',
    contactAndAddress: 'Contacto y dirección',
    bookingAccess: 'Acceso a la reserva',
    phone: 'Teléfono',
    email: 'Correo',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'Escribir al vendedor',
    callSeller: 'Llamar al vendedor',
    routeToMaster: 'Ruta al profesional',
    contactsHiddenTitle: 'Contactos ocultos',
    contactsHiddenText:
      'Los contactos directos y la dirección exacta aparecerán solo después de recibir el pago y de que el profesional pague la promoción.',
    waitingMaster: 'Esperando confirmación del profesional',
    waitingPayment: 'Esperando pago',
    waitingPromotion: 'Promoción no pagada',
    unlockPaid: 'Unlock pagado',
    welcomeBonus: 'Welcome Bonus usado',
    referralUsed: 'Reserva por referido usada',
    lockedValue: 'Bloqueado',
    todayAt: 'Hoy a las',
    tomorrowAt: 'Mañana a las',
    noPhoneAction: 'Número no disponible',
    noMessageAction: 'Contacto no disponible',
    noRouteAction: 'Dirección bloqueada',
  },
  RU: {
    title: 'Мои бронирования',
    subtitle: 'Предстоящие визиты, завершённые услуги и доступ к брони',
    upcoming: 'Предстоящие',
    completed: 'Завершённые',
    cancelled: 'Отменённые',
    pending: 'Ожидает подтверждения',
    confirmed: 'Предстоящая',
    completedStatus: 'Завершено',
    cancelledStatus: 'Отменено',
    serviceDetails: 'Детали услуги',
    closeDetails: 'Закрыть',
    cancelBooking: 'Отменить бронь',
    rebook: 'Повторить бронь',
    emptyUpcoming: 'Пока нет предстоящих бронирований',
    emptyCompleted: 'Пока нет завершённых бронирований',
    emptyCancelled: 'Пока нет отменённых бронирований',
    back: 'Назад',
    home: 'Главная',
    total: 'Всего',
    bookingOverview: 'Обзор бронирований',
    activeNow: 'Активно сейчас',
    menuClose: 'Закрыть',
    menuCancel: 'Отменить бронь',
    menuOpenProfile: 'Открыть профиль',
    provider: 'Специалист',
    bookingSummary: 'Сводка бронирования',
    dateTime: 'Дата и время',
    detailsUnlocked: 'Детали открыты',
    detailsLocked: 'Детали скрыты',
    exactAddress: 'Точный адрес',
    area: 'Район',
    contactAndAddress: 'Контакты и адрес',
    bookingAccess: 'Доступ к брони',
    phone: 'Телефон',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    routeToMaster: 'Маршрут к мастеру',
    contactsHiddenTitle: 'Контакты скрыты',
    contactsHiddenText:
      'Прямые контакты и точный адрес откроются только после поступления оплаты и оплаченной рекламы мастером.',
    waitingMaster: 'Ждёт подтверждения мастера',
    waitingPayment: 'Ждёт оплату',
    waitingPromotion: 'Реклама не оплачена',
    unlockPaid: 'Unlock оплачен',
    welcomeBonus: 'Использован Welcome Bonus',
    referralUsed: 'Использовано реферальное бронирование',
    lockedValue: 'Скрыто',
    todayAt: 'Сегодня в',
    tomorrowAt: 'Завтра в',
    noPhoneAction: 'Номер недоступен',
    noMessageAction: 'Контакт недоступен',
    noRouteAction: 'Адрес скрыт',
  },
  CZ: {
    title: 'Moje rezervace',
    subtitle: 'Nadcházející návštěvy, dokončené služby a přístup k rezervaci',
    upcoming: 'Nadcházející',
    completed: 'Dokončené',
    cancelled: 'Zrušené',
    pending: 'Čeká na potvrzení',
    confirmed: 'Nadcházející',
    completedStatus: 'Dokončeno',
    cancelledStatus: 'Zrušeno',
    serviceDetails: 'Detail služby',
    closeDetails: 'Zavřít',
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
    menuClose: 'Zavřít',
    menuCancel: 'Zrušit rezervaci',
    menuOpenProfile: 'Otevřít profil',
    provider: 'Poskytovatel',
    bookingSummary: 'Souhrn rezervace',
    dateTime: 'Datum a čas',
    detailsUnlocked: 'Detaily odemčeny',
    detailsLocked: 'Detaily jsou skryté',
    exactAddress: 'Přesná adresa',
    area: 'Oblast',
    contactAndAddress: 'Kontakt a adresa',
    bookingAccess: 'Přístup k rezervaci',
    phone: 'Telefon',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'Napsat poskytovateli',
    callSeller: 'Zavolat poskytovateli',
    routeToMaster: 'Trasa ke specialistovi',
    contactsHiddenTitle: 'Kontakty skryty',
    contactsHiddenText:
      'Přímé kontakty a přesná adresa se zobrazí až po přijetí platby a zaplacení propagace poskytovatelem.',
    waitingMaster: 'Čeká na potvrzení poskytovatele',
    waitingPayment: 'Čeká na platbu',
    waitingPromotion: 'Propagace není zaplacena',
    unlockPaid: 'Unlock zaplacen',
    welcomeBonus: 'Použit Welcome Bonus',
    referralUsed: 'Použita referral rezervace',
    lockedValue: 'Skryto',
    todayAt: 'Dnes v',
    tomorrowAt: 'Zítra v',
    noPhoneAction: 'Číslo není dostupné',
    noMessageAction: 'Kontakt není dostupný',
    noRouteAction: 'Adresa je skrytá',
  },
  DE: {
    title: 'Meine Buchungen',
    subtitle: 'Bevorstehende Besuche, abgeschlossene Leistungen und Buchungszugang',
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    pending: 'Wartet auf Bestätigung',
    confirmed: 'Bevorstehend',
    completedStatus: 'Abgeschlossen',
    cancelledStatus: 'Storniert',
    serviceDetails: 'Servicedetails',
    closeDetails: 'Schließen',
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
    menuClose: 'Schließen',
    menuCancel: 'Buchung stornieren',
    menuOpenProfile: 'Profil öffnen',
    provider: 'Anbieter',
    bookingSummary: 'Buchungsübersicht',
    dateTime: 'Datum & Uhrzeit',
    detailsUnlocked: 'Details freigeschaltet',
    detailsLocked: 'Details sind gesperrt',
    exactAddress: 'Genaue Adresse',
    area: 'Bereich',
    contactAndAddress: 'Kontakt und Adresse',
    bookingAccess: 'Buchungszugang',
    phone: 'Telefon',
    email: 'E-Mail',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'An Anbieter schreiben',
    callSeller: 'Anbieter anrufen',
    routeToMaster: 'Route zum Anbieter',
    contactsHiddenTitle: 'Kontakte verborgen',
    contactsHiddenText:
      'Direkte Kontakte und genaue Adresse werden erst nach Zahlungseingang und bezahlter Promotion des Anbieters angezeigt.',
    waitingMaster: 'Wartet auf Bestätigung des Anbieters',
    waitingPayment: 'Wartet auf Zahlung',
    waitingPromotion: 'Promotion nicht bezahlt',
    unlockPaid: 'Unlock bezahlt',
    welcomeBonus: 'Welcome Bonus verwendet',
    referralUsed: 'Referral-Buchung verwendet',
    lockedValue: 'Gesperrt',
    todayAt: 'Heute um',
    tomorrowAt: 'Morgen um',
    noPhoneAction: 'Nummer nicht verfügbar',
    noMessageAction: 'Kontakt nicht verfügbar',
    noRouteAction: 'Adresse gesperrt',
  },
  PL: {
    title: 'Moje rezerwacje',
    subtitle: 'Nadchodzące wizyty, zakończone usługi i dostęp do rezerwacji',
    upcoming: 'Nadchodzące',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    pending: 'Oczekuje na potwierdzenie',
    confirmed: 'Nadchodząca',
    completedStatus: 'Zakończone',
    cancelledStatus: 'Anulowane',
    serviceDetails: 'Szczegóły usługi',
    closeDetails: 'Zamknij',
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
    menuClose: 'Zamknij',
    menuCancel: 'Anuluj rezerwację',
    menuOpenProfile: 'Otwórz profil',
    provider: 'Usługodawca',
    bookingSummary: 'Podsumowanie rezerwacji',
    dateTime: 'Data i godzina',
    detailsUnlocked: 'Szczegóły odblokowane',
    detailsLocked: 'Szczegóły są ukryte',
    exactAddress: 'Dokładny adres',
    area: 'Obszar',
    contactAndAddress: 'Kontakt i adres',
    bookingAccess: 'Dostęp do rezerwacji',
    phone: 'Telefon',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    writeSeller: 'Napisz do usługodawcy',
    callSeller: 'Zadzwoń do usługodawcy',
    routeToMaster: 'Trasa do specjalisty',
    contactsHiddenTitle: 'Kontakty ukryte',
    contactsHiddenText:
      'Bezpośrednie kontakty i dokładny adres pojawią się dopiero po otrzymaniu płatności i opłaceniu promocji przez usługodawcę.',
    waitingMaster: 'Oczekiwanie na potwierdzenie usługodawcy',
    waitingPayment: 'Oczekiwanie na płatność',
    waitingPromotion: 'Promocja nieopłacona',
    unlockPaid: 'Unlock opłacony',
    welcomeBonus: 'Użyto Welcome Bonus',
    referralUsed: 'Użyto rezerwacji polecającej',
    lockedValue: 'Ukryte',
    todayAt: 'Dzisiaj o',
    tomorrowAt: 'Jutro o',
    noPhoneAction: 'Numer niedostępny',
    noMessageAction: 'Kontakt niedostępny',
    noRouteAction: 'Adres ukryty',
  },
} as const;

const serviceNameMap: Record<string, Partial<Record<AppLanguage, string>>> = {
  Маникюр: {
    EN: 'Manicure',
    ES: 'Manicura',
    RU: 'Маникюр',
    CZ: 'Manikúra',
    DE: 'Maniküre',
    PL: 'Manicure',
  },
  Стрижка: {
    EN: 'Haircut',
    ES: 'Corte de pelo',
    RU: 'Стрижка',
    CZ: 'Střih',
    DE: 'Haarschnitt',
    PL: 'Strzyżenie',
  },
  Массаж: {
    EN: 'Massage',
    ES: 'Masaje',
    RU: 'Массаж',
    CZ: 'Masáž',
    DE: 'Massage',
    PL: 'Masaż',
  },
  Визаж: {
    EN: 'Makeup',
    ES: 'Maquillaje',
    RU: 'Визаж',
    CZ: 'Make-up',
    DE: 'Make-up',
    PL: 'Makijaż',
  },
  'Ремонт телефона': {
    EN: 'Phone repair',
    ES: 'Reparación de teléfono',
    RU: 'Ремонт телефона',
    CZ: 'Oprava telefonu',
    DE: 'Handy-Reparatur',
    PL: 'Naprawa telefonu',
  },
};

const monthMap: Record<string, Partial<Record<AppLanguage, string>>> = {
  января: { EN: 'January', ES: 'enero', RU: 'января', CZ: 'ledna', DE: 'Januar', PL: 'stycznia' },
  февраля: { EN: 'February', ES: 'febrero', RU: 'февраля', CZ: 'února', DE: 'Februar', PL: 'lutego' },
  марта: { EN: 'March', ES: 'marzo', RU: 'марта', CZ: 'března', DE: 'März', PL: 'marca' },
  апреля: { EN: 'April', ES: 'abril', RU: 'апреля', CZ: 'dubna', DE: 'April', PL: 'kwietnia' },
  мая: { EN: 'May', ES: 'mayo', RU: 'мая', CZ: 'května', DE: 'Mai', PL: 'maja' },
  июня: { EN: 'June', ES: 'junio', RU: 'июня', CZ: 'června', DE: 'Juni', PL: 'czerwca' },
  июля: { EN: 'July', ES: 'julio', RU: 'июля', CZ: 'července', DE: 'Juli', PL: 'lipca' },
  августа: { EN: 'August', ES: 'agosto', RU: 'августа', CZ: 'srpna', DE: 'August', PL: 'sierpnia' },
  сентября: { EN: 'September', ES: 'septiembre', RU: 'сентября', CZ: 'září', DE: 'September', PL: 'września' },
  октября: { EN: 'October', ES: 'octubre', RU: 'октября', CZ: 'října', DE: 'Oktober', PL: 'października' },
  ноября: { EN: 'November', ES: 'noviembre', RU: 'ноября', CZ: 'listopadu', DE: 'November', PL: 'listopada' },
  декабря: { EN: 'December', ES: 'diciembre', RU: 'декабря', CZ: 'prosince', DE: 'Dezember', PL: 'grudnia' },
};

function getTexts(language: AppLanguage) {
  return pageTexts[language] || pageTexts.EN;
}

function formatPrice(price: number) {
  return `£${price.toFixed(2)}`;
}

function translateServiceName(value: string, language: AppLanguage) {
  return serviceNameMap[value]?.[language] || serviceNameMap[value]?.EN || value;
}

function translateDateLabel(
  value: string,
  language: AppLanguage,
  text: ReturnType<typeof getTexts>
) {
  const source = String(value || '').trim();
  if (!source) return source;

  if (source.startsWith('Сегодня в ')) {
    const time = source.replace('Сегодня в ', '').trim();
    return `${text.todayAt} ${time}`;
  }

  if (source.startsWith('Завтра в ')) {
    const time = source.replace('Завтра в ', '').trim();
    return `${text.tomorrowAt} ${time}`;
  }

  const match = source.match(/^(\d{1,2})\s+([А-Яа-яё]+),\s*(\d{1,2}:\d{2})$/);
  if (match) {
    const [, day, rawMonth, time] = match;
    const month = monthMap[rawMonth.toLowerCase()];
    if (month) {
      return `${day} ${month[language] || month.EN || rawMonth}, ${time}`;
    }
  }

  return source;
}

function getStatusMeta(status: BookingStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'pending') {
    return {
      label: text.pending,
      bg: '#fff0da',
      color: '#c07a00',
    };
  }

  if (status === 'upcoming') {
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

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [menuBookingId, setMenuBookingId] = useState<string | null>(null);
  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);

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

    return () => {
      unsubscribeLanguage();
      unsubscribeBookings();
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(() => getTexts(language), [language]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return bookings.filter((item) => item.status === 'pending' || item.status === 'upcoming');
    }

    if (activeTab === 'completed') {
      return bookings.filter((item) => item.status === 'completed');
    }

    return bookings.filter((item) => item.status === 'cancelled');
  }, [activeTab, bookings]);

  const emptyText =
    activeTab === 'upcoming'
      ? text.emptyUpcoming
      : activeTab === 'completed'
      ? text.emptyCompleted
      : text.emptyCancelled;

  const activeNowCount = bookings.filter(
    (item) => item.status === 'pending' || item.status === 'upcoming'
  ).length;

  const selectedMenuBooking = bookings.find((item) => item.id === menuBookingId) ?? null;
  const selectedDetailsBooking = bookings.find((item) => item.id === detailsBookingId) ?? null;

  const handleOpenBookingDetails = (booking: BookingItem) => {
    setDetailsBookingId(booking.id);
    setMenuBookingId(null);
  };

  const handleCancelBooking = (booking: BookingItem) => {
    updateBookingStatus(booking.id, 'cancelled');
    setMenuBookingId(null);
    if (detailsBookingId === booking.id) {
      setDetailsBookingId(null);
    }
  };

  const handleRebook = (booking: BookingItem) => {
    router.push(`/booking/${booking.masterId}`);
  };

  const handleOpenProfile = (booking: BookingItem) => {
    router.push(`/master/${booking.masterId}`);
    setMenuBookingId(null);
  };

  return (
    <>
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
                    {text.total}: {bookings.length}
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
                    booking.status === 'pending' || booking.status === 'upcoming';
                  const publicLocation = getPublicBookingLocation(booking);

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
                          onClick={() => setMenuBookingId(booking.id)}
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
                          src={
                            booking.masterAvatar ||
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={booking.masterName}
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
                              fontSize: 14,
                              fontWeight: 800,
                              color: '#9a9086',
                            }}
                          >
                            {text.provider}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 20,
                              fontWeight: 900,
                              color: '#17130f',
                              lineHeight: 1.2,
                            }}
                          >
                            {booking.masterName}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#6d6d6d',
                              lineHeight: 1.35,
                            }}
                          >
                            {translateServiceName(booking.serviceName, language)}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#5c6470',
                              lineHeight: 1.35,
                            }}
                          >
                            {translateDateLabel(booking.dateLabel, language, text)}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#8e8478',
                            }}
                          >
                            {publicLocation}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#17130f',
                            }}
                          >
                            {formatPrice(booking.price)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenBookingDetails(booking)}
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
                            onClick={() => handleCancelBooking(booking)}
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
                            onClick={() => handleRebook(booking)}
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

        <BottomNav active="bookings" />
      </main>

      {selectedMenuBooking ? (
        <div
          onClick={() => setMenuBookingId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.22)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 28,
                padding: 14,
                display: 'grid',
                gap: 10,
                boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenBookingDetails(selectedMenuBooking)}
                style={{
                  minHeight: 54,
                  borderRadius: 20,
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

              <button
                type="button"
                onClick={() => handleOpenProfile(selectedMenuBooking)}
                style={{
                  minHeight: 54,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#eef3ff',
                  color: '#2959b7',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.menuOpenProfile}
              </button>

              {(selectedMenuBooking.status === 'pending' ||
                selectedMenuBooking.status === 'upcoming') && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedMenuBooking)}
                  style={{
                    minHeight: 54,
                    borderRadius: 20,
                    border: '2px solid #111111',
                    background: '#fdeaea',
                    color: '#c74343',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.menuCancel}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuBookingId(null)}
                style={{
                  minHeight: 54,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#17130f',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.menuClose}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedDetailsBooking
        ? (() => {
            const detailsUnlocked = canShowExactAddress(selectedDetailsBooking);
            const contactsUnlocked = canShowDirectContacts(selectedDetailsBooking);
            const visibleAddress = getVisibleBookingLocation(selectedDetailsBooking);
            const safeArea = getPublicBookingLocation(selectedDetailsBooking);
            const protectedContacts = getProtectedBookingContact(selectedDetailsBooking);

            return (
              <div
                onClick={() => setDetailsBookingId(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(17,17,17,0.22)',
                  zIndex: 220,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    maxWidth: 430,
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      background: '#fff',
                      border: '2px solid #111111',
                      borderRadius: 30,
                      padding: 18,
                      boxShadow: '0 22px 44px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '96px 1fr auto',
                        gap: 14,
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={
                          selectedDetailsBooking.masterAvatar ||
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={selectedDetailsBooking.masterName}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'cover',
                          borderRadius: 22,
                          border: '2px solid #111111',
                        }}
                      />

                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#9a9086' }}>
                          {text.provider}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                          {selectedDetailsBooking.masterName}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, color: '#6d6d6d' }}>
                          {translateServiceName(selectedDetailsBooking.serviceName, language)}
                        </div>
                      </div>

                      <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                        {formatPrice(selectedDetailsBooking.price)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                      <div
                        style={{
                          border: '2px solid #111111',
                          borderRadius: 28,
                          padding: 16,
                          background: '#fff',
                        }}
                      >
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#17130f' }}>
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
                              minHeight: 118,
                              border: '2px solid #111111',
                              borderRadius: 24,
                              padding: 16,
                              background: '#fff',
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                              {text.dateTime}
                            </div>
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 18,
                                lineHeight: 1.4,
                                fontWeight: 900,
                                color: '#17130f',
                              }}
                            >
                              {translateDateLabel(selectedDetailsBooking.dateLabel, language, text)}
                            </div>
                          </div>

                          <div
                            style={{
                              minHeight: 118,
                              border: '2px solid #111111',
                              borderRadius: 24,
                              padding: 16,
                              background: '#fff',
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                              {text.total}
                            </div>
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 18,
                                lineHeight: 1.4,
                                fontWeight: 900,
                                color: '#17130f',
                              }}
                            >
                              {formatPrice(selectedDetailsBooking.price)}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 14,
                            border: '2px solid #111111',
                            borderRadius: 24,
                            padding: 16,
                            background: detailsUnlocked ? '#dff0e7' : '#f4f0ea',
                            color: detailsUnlocked ? '#1f7b47' : '#7b7268',
                          }}
                        >
                          <div style={{ fontSize: 16, fontWeight: 900 }}>
                            {detailsUnlocked ? text.detailsUnlocked : text.detailsLocked}
                          </div>
                          <div style={{ marginTop: 10, fontSize: 15, fontWeight: 800, lineHeight: 1.45 }}>
                            {detailsUnlocked
                              ? `${text.exactAddress}: ${visibleAddress}`
                              : `${text.area}: ${safeArea}`}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          border: '2px solid #111111',
                          borderRadius: 28,
                          padding: 16,
                          background: '#fff',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <div style={{ fontSize: 17, fontWeight: 900, color: '#17130f' }}>
                            {text.contactAndAddress}
                          </div>

                          <div
                            style={{
                              minHeight: 40,
                              padding: '0 14px',
                              borderRadius: 999,
                              border: '2px solid #111111',
                              background: '#dff0e7',
                              color: '#1f7b47',
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: 13,
                              fontWeight: 900,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {text.bookingAccess}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                          <div
                            style={{
                              border: '2px solid #111111',
                              borderRadius: 22,
                              padding: 14,
                              background: '#fff',
                              opacity: contactsUnlocked ? 1 : 0.45,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                              {text.phone}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                              {protectedContacts.phone || text.lockedValue}
                            </div>
                          </div>

                          <div
                            style={{
                              border: '2px solid #111111',
                              borderRadius: 22,
                              padding: 14,
                              background: '#fff',
                              opacity: contactsUnlocked ? 1 : 0.45,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                              {text.email}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                              {protectedContacts.email || text.lockedValue}
                            </div>
                          </div>

                          <div
                            style={{
                              border: '2px solid #111111',
                              borderRadius: 22,
                              padding: 14,
                              background: '#fff',
                              opacity: detailsUnlocked ? 1 : 0.45,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#9a9086' }}>
                              {detailsUnlocked ? text.exactAddress : text.area}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                              {detailsUnlocked ? visibleAddress : safeArea}
                            </div>
                          </div>
                        </div>

                        {!contactsUnlocked ? (
                          <div
                            style={{
                              marginTop: 14,
                              border: '2px dashed #111111',
                              borderRadius: 22,
                              padding: 14,
                              background: '#faf7f2',
                            }}
                          >
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                              {text.contactsHiddenTitle}
                            </div>
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 13,
                                lineHeight: 1.45,
                                fontWeight: 700,
                                color: '#6f675f',
                              }}
                            >
                              {text.contactsHiddenText}
                            </div>

                            <div
                              style={{
                                marginTop: 10,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                              }}
                            >
                              {!selectedDetailsBooking.bookingConfirmedByMaster ? (
                                <span
                                  style={{
                                    minHeight: 36,
                                    padding: '0 12px',
                                    borderRadius: 999,
                                    border: '2px solid #111111',
                                    background: '#fff0da',
                                    color: '#c07a00',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  {text.waitingMaster}
                                </span>
                              ) : null}

                              {!selectedDetailsBooking.clientPaid ||
                              !selectedDetailsBooking.paymentReceivedByPlatform ? (
                                <span
                                  style={{
                                    minHeight: 36,
                                    padding: '0 12px',
                                    borderRadius: 999,
                                    border: '2px solid #111111',
                                    background: '#eef3ff',
                                    color: '#2959b7',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  {text.waitingPayment}
                                </span>
                              ) : null}

                              {!selectedDetailsBooking.promotionPaidByMaster ? (
                                <span
                                  style={{
                                    minHeight: 36,
                                    padding: '0 12px',
                                    borderRadius: 999,
                                    border: '2px solid #111111',
                                    background: '#fdeaea',
                                    color: '#c74343',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  {text.waitingPromotion}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        <div
                          style={{
                            marginTop: 14,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 12,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !protectedContacts.whatsapp &&
                                !protectedContacts.telegram &&
                                !protectedContacts.instagram &&
                                !protectedContacts.email
                              ) {
                                return;
                              }
                            }}
                            style={{
                              minHeight: 54,
                              borderRadius: 20,
                              border: '2px solid #111111',
                              background: '#eef3ff',
                              color: '#2959b7',
                              fontSize: 16,
                              fontWeight: 900,
                              cursor:
                                protectedContacts.whatsapp ||
                                protectedContacts.telegram ||
                                protectedContacts.instagram ||
                                protectedContacts.email
                                  ? 'pointer'
                                  : 'not-allowed',
                              opacity:
                                protectedContacts.whatsapp ||
                                protectedContacts.telegram ||
                                protectedContacts.instagram ||
                                protectedContacts.email
                                  ? 1
                                  : 0.55,
                            }}
                          >
                            {protectedContacts.whatsapp ||
                            protectedContacts.telegram ||
                            protectedContacts.instagram ||
                            protectedContacts.email
                              ? text.writeSeller
                              : text.noMessageAction}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!protectedContacts.phone) return;
                              window.location.href = `tel:${protectedContacts.phone}`;
                            }}
                            style={{
                              minHeight: 54,
                              borderRadius: 20,
                              border: '2px solid #111111',
                              background: '#dff0e7',
                              color: '#1f7b47',
                              fontSize: 16,
                              fontWeight: 900,
                              cursor: protectedContacts.phone ? 'pointer' : 'not-allowed',
                              opacity: protectedContacts.phone ? 1 : 0.55,
                            }}
                          >
                            {protectedContacts.phone ? text.callSeller : text.noPhoneAction}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!detailsUnlocked) return;
                            const destination = encodeURIComponent(visibleAddress);
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${destination}`,
                              '_blank'
                            );
                          }}
                          style={{
                            marginTop: 12,
                            width: '100%',
                            minHeight: 58,
                            borderRadius: 22,
                            border: '2px solid #111111',
                            background: '#f94ca0',
                            color: '#ffffff',
                            fontSize: 17,
                            fontWeight: 900,
                            cursor: detailsUnlocked ? 'pointer' : 'not-allowed',
                            opacity: detailsUnlocked ? 1 : 0.55,
                          }}
                        >
                          {detailsUnlocked ? text.routeToMaster : text.noRouteAction}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailsBookingId(null)}
                        style={{
                          minHeight: 58,
                          width: '100%',
                          borderRadius: 22,
                          border: '2px solid #111111',
                          background: '#2f241c',
                          color: '#ffffff',
                          fontSize: 18,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {text.closeDetails}
                      </button>

                      {(selectedDetailsBooking.status === 'completed' ||
                        selectedDetailsBooking.status === 'cancelled') && (
                        <button
                          type="button"
                          onClick={() => handleRebook(selectedDetailsBooking)}
                          style={{
                            minHeight: 58,
                            width: '100%',
                            borderRadius: 22,
                            border: '2px solid #111111',
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
                  </div>
                </div>
              </div>
            );
          })()
        : null}
    </>
  );
}
