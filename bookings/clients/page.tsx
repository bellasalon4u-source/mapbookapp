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
  updateBookingStatus,
  type BookingItem,
} from '../../services/bookingsStore';

type ClientBookingStatus =
  | 'request'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'quick'
  | 'blocked';

type CalendarDayState = 'free' | 'full' | 'partial' | 'off' | 'request';

type ClientBooking = {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  day: number;
  time: string;
  duration: string;
  price: number;
  status: ClientBookingStatus;
  bookingType: 'normal' | 'quick';
  paymentMethod: 'OlaCash' | 'Card' | 'Cash' | 'Crypto' | 'QR';
  holdClient: number;
  holdMaster: number;
  note: string;
  sourceBooking?: BookingItem;
};

const pageTexts: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    today: string;
    requests: string;
    calendar: string;
    history: string;
    search: string;
    activeToday: string;
    confirmed: string;
    quickBooking: string;
    request: string;
    completed: string;
    cancelled: string;
    free: string;
    full: string;
    partial: string;
    off: string;
    clientCard: string;
    service: string;
    time: string;
    price: string;
    payment: string;
    holds: string;
    confirm: string;
    cancel: string;
    complete: string;
    quickPay: string;
    close: string;
    reasonTitle: string;
    reasonSick: string;
    reasonClientNoReply: string;
    reasonTimeMistake: string;
    reasonUnavailable: string;
    reasonOther: string;
    confirmCancel: string;
    paymentTitle: string;
    amount: string;
    generateCode: string;
    share: string;
    empty: string;
    home: string;
  }
> = {
  EN: {
    title: 'My clients',
    subtitle: 'Bookings, client requests, calendar and fast payments',
    today: 'Today',
    requests: 'Requests',
    calendar: 'Calendar',
    history: 'History',
    search: 'Search client, service, amount',
    activeToday: 'Active today',
    confirmed: 'Confirmed',
    quickBooking: 'Quick booking',
    request: 'Request',
    completed: 'Completed',
    cancelled: 'Cancelled',
    free: 'Free',
    full: 'Full',
    partial: 'Partial',
    off: 'Off',
    clientCard: 'Client card',
    service: 'Service',
    time: 'Time',
    price: 'Price',
    payment: 'Payment',
    holds: 'Holds',
    confirm: 'Confirm',
    cancel: 'Cancel',
    complete: 'Complete',
    quickPay: 'Fast payment',
    close: 'Close',
    reasonTitle: 'Cancellation reason',
    reasonSick: 'I am unavailable / sick',
    reasonClientNoReply: 'Client does not reply',
    reasonTimeMistake: 'Wrong time',
    reasonUnavailable: 'Service unavailable',
    reasonOther: 'Other reason',
    confirmCancel: 'Confirm cancellation',
    paymentTitle: 'Generate payment code',
    amount: 'Amount',
    generateCode: 'Generate barcode',
    share: 'Share',
    empty: 'No client bookings for this day',
    home: 'Home',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрые расчёты',
    today: 'Сегодня',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    search: 'Поиск: клиент, услуга, сумма',
    activeToday: 'Активно сегодня',
    confirmed: 'Подтверждено',
    quickBooking: 'Быстрая бронь',
    request: 'Запрос',
    completed: 'Завершено',
    cancelled: 'Отменено',
    free: 'Свободно',
    full: 'Полная бронь',
    partial: 'Частично',
    off: 'Нерабочий',
    clientCard: 'Карточка клиента',
    service: 'Услуга',
    time: 'Время',
    price: 'Цена',
    payment: 'Оплата',
    holds: 'Заморозка',
    confirm: 'Подтвердить',
    cancel: 'Отменить',
    complete: 'Завершить',
    quickPay: 'Быстрый расчёт',
    close: 'Закрыть',
    reasonTitle: 'Причина отмены',
    reasonSick: 'Я недоступен / заболел',
    reasonClientNoReply: 'Клиент не отвечает',
    reasonTimeMistake: 'Ошибка во времени',
    reasonUnavailable: 'Услуга недоступна',
    reasonOther: 'Другая причина',
    confirmCancel: 'Подтвердить отмену',
    paymentTitle: 'Сгенерировать код оплаты',
    amount: 'Сумма',
    generateCode: 'Создать баркод',
    share: 'Поделиться',
    empty: 'На этот день нет записей клиентов',
    home: 'Главная',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Броні у мене, запити, календар і швидкі розрахунки',
    today: 'Сьогодні',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    search: 'Пошук: клієнт, послуга, сума',
    activeToday: 'Активно сьогодні',
    confirmed: 'Підтверджено',
    quickBooking: 'Швидка бронь',
    request: 'Запит',
    completed: 'Завершено',
    cancelled: 'Скасовано',
    free: 'Вільно',
    full: 'Повна бронь',
    partial: 'Частково',
    off: 'Неробочий',
    clientCard: 'Картка клієнта',
    service: 'Послуга',
    time: 'Час',
    price: 'Ціна',
    payment: 'Оплата',
    holds: 'Заморозка',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    complete: 'Завершити',
    quickPay: 'Швидкий розрахунок',
    close: 'Закрити',
    reasonTitle: 'Причина скасування',
    reasonSick: 'Я недоступний / захворів',
    reasonClientNoReply: 'Клієнт не відповідає',
    reasonTimeMistake: 'Помилка в часі',
    reasonUnavailable: 'Послуга недоступна',
    reasonOther: 'Інша причина',
    confirmCancel: 'Підтвердити скасування',
    paymentTitle: 'Згенерувати код оплати',
    amount: 'Сума',
    generateCode: 'Створити баркод',
    share: 'Поділитися',
    empty: 'На цей день немає записів клієнтів',
    home: 'Головна',
  },
  ES: {
    title: 'Mis clientes',
    subtitle: 'Reservas recibidas, solicitudes, calendario y pagos rápidos',
    today: 'Hoy',
    requests: 'Solicitudes',
    calendar: 'Calendario',
    history: 'Historial',
    search: 'Buscar cliente, servicio, importe',
    activeToday: 'Activo hoy',
    confirmed: 'Confirmado',
    quickBooking: 'Reserva rápida',
    request: 'Solicitud',
    completed: 'Completado',
    cancelled: 'Cancelado',
    free: 'Libre',
    full: 'Completo',
    partial: 'Parcial',
    off: 'No laboral',
    clientCard: 'Ficha del cliente',
    service: 'Servicio',
    time: 'Hora',
    price: 'Precio',
    payment: 'Pago',
    holds: 'Retenciones',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    complete: 'Completar',
    quickPay: 'Pago rápido',
    close: 'Cerrar',
    reasonTitle: 'Motivo de cancelación',
    reasonSick: 'No estoy disponible',
    reasonClientNoReply: 'El cliente no responde',
    reasonTimeMistake: 'Hora incorrecta',
    reasonUnavailable: 'Servicio no disponible',
    reasonOther: 'Otro motivo',
    confirmCancel: 'Confirmar cancelación',
    paymentTitle: 'Generar código de pago',
    amount: 'Importe',
    generateCode: 'Generar código',
    share: 'Compartir',
    empty: 'No hay reservas de clientes para este día',
    home: 'Inicio',
  },
  CZ: {
    title: 'Moji klienti',
    subtitle: 'Rezervace u mě, požadavky, kalendář a rychlé platby',
    today: 'Dnes',
    requests: 'Požadavky',
    calendar: 'Kalendář',
    history: 'Historie',
    search: 'Hledat klienta, službu, částku',
    activeToday: 'Aktivní dnes',
    confirmed: 'Potvrzeno',
    quickBooking: 'Rychlá rezervace',
    request: 'Požadavek',
    completed: 'Dokončeno',
    cancelled: 'Zrušeno',
    free: 'Volno',
    full: 'Plno',
    partial: 'Částečně',
    off: 'Nepracovní',
    clientCard: 'Karta klienta',
    service: 'Služba',
    time: 'Čas',
    price: 'Cena',
    payment: 'Platba',
    holds: 'Blokace',
    confirm: 'Potvrdit',
    cancel: 'Zrušit',
    complete: 'Dokončit',
    quickPay: 'Rychlá platba',
    close: 'Zavřít',
    reasonTitle: 'Důvod zrušení',
    reasonSick: 'Nejsem dostupný',
    reasonClientNoReply: 'Klient neodpovídá',
    reasonTimeMistake: 'Chybný čas',
    reasonUnavailable: 'Služba není dostupná',
    reasonOther: 'Jiný důvod',
    confirmCancel: 'Potvrdit zrušení',
    paymentTitle: 'Vygenerovat platební kód',
    amount: 'Částka',
    generateCode: 'Vytvořit kód',
    share: 'Sdílet',
    empty: 'Na tento den nejsou žádné rezervace',
    home: 'Domů',
  },
  DE: {
    title: 'Meine Kunden',
    subtitle: 'Buchungen bei mir, Anfragen, Kalender und Schnellzahlungen',
    today: 'Heute',
    requests: 'Anfragen',
    calendar: 'Kalender',
    history: 'Verlauf',
    search: 'Kunde, Service, Betrag suchen',
    activeToday: 'Heute aktiv',
    confirmed: 'Bestätigt',
    quickBooking: 'Schnellbuchung',
    request: 'Anfrage',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    free: 'Frei',
    full: 'Voll',
    partial: 'Teilweise',
    off: 'Frei',
    clientCard: 'Kundenkarte',
    service: 'Service',
    time: 'Zeit',
    price: 'Preis',
    payment: 'Zahlung',
    holds: 'Holds',
    confirm: 'Bestätigen',
    cancel: 'Stornieren',
    complete: 'Abschließen',
    quickPay: 'Schnellzahlung',
    close: 'Schließen',
    reasonTitle: 'Stornogrund',
    reasonSick: 'Ich bin nicht verfügbar',
    reasonClientNoReply: 'Kunde antwortet nicht',
    reasonTimeMistake: 'Falsche Zeit',
    reasonUnavailable: 'Service nicht verfügbar',
    reasonOther: 'Anderer Grund',
    confirmCancel: 'Storno bestätigen',
    paymentTitle: 'Zahlungscode erstellen',
    amount: 'Betrag',
    generateCode: 'Barcode erstellen',
    share: 'Teilen',
    empty: 'Keine Kundenbuchungen an diesem Tag',
    home: 'Home',
  },
  IT: {
    title: 'I miei clienti',
    subtitle: 'Prenotazioni ricevute, richieste, calendario e pagamenti rapidi',
    today: 'Oggi',
    requests: 'Richieste',
    calendar: 'Calendario',
    history: 'Storico',
    search: 'Cerca cliente, servizio, importo',
    activeToday: 'Attivo oggi',
    confirmed: 'Confermato',
    quickBooking: 'Prenotazione rapida',
    request: 'Richiesta',
    completed: 'Completato',
    cancelled: 'Annullato',
    free: 'Libero',
    full: 'Pieno',
    partial: 'Parziale',
    off: 'Non lavorativo',
    clientCard: 'Scheda cliente',
    service: 'Servizio',
    time: 'Orario',
    price: 'Prezzo',
    payment: 'Pagamento',
    holds: 'Blocchi',
    confirm: 'Conferma',
    cancel: 'Annulla',
    complete: 'Completa',
    quickPay: 'Pagamento rapido',
    close: 'Chiudi',
    reasonTitle: 'Motivo cancellazione',
    reasonSick: 'Non sono disponibile',
    reasonClientNoReply: 'Il cliente non risponde',
    reasonTimeMistake: 'Orario sbagliato',
    reasonUnavailable: 'Servizio non disponibile',
    reasonOther: 'Altro motivo',
    confirmCancel: 'Conferma annullamento',
    paymentTitle: 'Genera codice pagamento',
    amount: 'Importo',
    generateCode: 'Genera barcode',
    share: 'Condividi',
    empty: 'Nessuna prenotazione clienti per questo giorno',
    home: 'Home',
  },
  FR: {
    title: 'Mes clients',
    subtitle: 'Réservations reçues, demandes, calendrier et paiements rapides',
    today: 'Aujourd’hui',
    requests: 'Demandes',
    calendar: 'Calendrier',
    history: 'Historique',
    search: 'Rechercher client, service, montant',
    activeToday: 'Actif aujourd’hui',
    confirmed: 'Confirmé',
    quickBooking: 'Réservation rapide',
    request: 'Demande',
    completed: 'Terminé',
    cancelled: 'Annulé',
    free: 'Libre',
    full: 'Complet',
    partial: 'Partiel',
    off: 'Non travaillé',
    clientCard: 'Fiche client',
    service: 'Service',
    time: 'Heure',
    price: 'Prix',
    payment: 'Paiement',
    holds: 'Blocages',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    complete: 'Terminer',
    quickPay: 'Paiement rapide',
    close: 'Fermer',
    reasonTitle: 'Motif d’annulation',
    reasonSick: 'Je ne suis pas disponible',
    reasonClientNoReply: 'Le client ne répond pas',
    reasonTimeMistake: 'Mauvaise heure',
    reasonUnavailable: 'Service indisponible',
    reasonOther: 'Autre motif',
    confirmCancel: 'Confirmer annulation',
    paymentTitle: 'Générer le code de paiement',
    amount: 'Montant',
    generateCode: 'Créer barcode',
    share: 'Partager',
    empty: 'Aucune réservation client ce jour',
    home: 'Accueil',
  },
  AR: {
    title: 'عملائي',
    subtitle: 'الحجوزات لدي والطلبات والتقويم والمدفوعات السريعة',
    today: 'اليوم',
    requests: 'الطلبات',
    calendar: 'التقويم',
    history: 'السجل',
    search: 'بحث العميل أو الخدمة أو المبلغ',
    activeToday: 'نشط اليوم',
    confirmed: 'مؤكد',
    quickBooking: 'حجز سريع',
    request: 'طلب',
    completed: 'مكتمل',
    cancelled: 'ملغى',
    free: 'متاح',
    full: 'ممتلئ',
    partial: 'جزئي',
    off: 'غير متاح',
    clientCard: 'بطاقة العميل',
    service: 'الخدمة',
    time: 'الوقت',
    price: 'السعر',
    payment: 'الدفع',
    holds: 'الحجز',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    complete: 'إكمال',
    quickPay: 'دفع سريع',
    close: 'إغلاق',
    reasonTitle: 'سبب الإلغاء',
    reasonSick: 'أنا غير متاح',
    reasonClientNoReply: 'العميل لا يرد',
    reasonTimeMistake: 'وقت خاطئ',
    reasonUnavailable: 'الخدمة غير متاحة',
    reasonOther: 'سبب آخر',
    confirmCancel: 'تأكيد الإلغاء',
    paymentTitle: 'إنشاء رمز الدفع',
    amount: 'المبلغ',
    generateCode: 'إنشاء باركود',
    share: 'مشاركة',
    empty: 'لا توجد حجوزات لهذا اليوم',
    home: 'الرئيسية',
  },
  PL: {
    title: 'Moi klienci',
    subtitle: 'Rezerwacje u mnie, zapytania, kalendarz i szybkie płatności',
    today: 'Dzisiaj',
    requests: 'Zapytania',
    calendar: 'Kalendarz',
    history: 'Historia',
    search: 'Szukaj klienta, usługi, kwoty',
    activeToday: 'Aktywne dziś',
    confirmed: 'Potwierdzone',
    quickBooking: 'Szybka rezerwacja',
    request: 'Zapytanie',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    free: 'Wolne',
    full: 'Pełne',
    partial: 'Częściowo',
    off: 'Nie pracuje',
    clientCard: 'Karta klienta',
    service: 'Usługa',
    time: 'Godzina',
    price: 'Cena',
    payment: 'Płatność',
    holds: 'Blokady',
    confirm: 'Potwierdź',
    cancel: 'Anuluj',
    complete: 'Zakończ',
    quickPay: 'Szybka płatność',
    close: 'Zamknij',
    reasonTitle: 'Powód anulowania',
    reasonSick: 'Jestem niedostępny',
    reasonClientNoReply: 'Klient nie odpowiada',
    reasonTimeMistake: 'Zły czas',
    reasonUnavailable: 'Usługa niedostępna',
    reasonOther: 'Inny powód',
    confirmCancel: 'Potwierdź anulowanie',
    paymentTitle: 'Wygeneruj kod płatności',
    amount: 'Kwota',
    generateCode: 'Utwórz barcode',
    share: 'Udostępnij',
    empty: 'Brak rezerwacji klientów na ten dzień',
    home: 'Start',
  },
};

const demoClients: ClientBooking[] = [
  {
    id: 'provider-demo-1',
    clientName: 'Anna Brown',
    clientAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    clientPhone: '+44 7700 900123',
    clientEmail: 'anna@example.com',
    serviceName: 'Haircut',
    date: '2026-04-25',
    day: 25,
    time: '15:00',
    duration: '45 min',
    price: 35,
    status: 'confirmed',
    bookingType: 'normal',
    paymentMethod: 'OlaCash',
    holdClient: 1,
    holdMaster: 1,
    note: 'Client wants a clean bob haircut.',
  },
  {
    id: 'provider-demo-2',
    clientName: 'Sofia Miller',
    clientAvatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    clientPhone: '+44 7700 900456',
    clientEmail: 'sofia@example.com',
    serviceName: 'Keratin extensions',
    date: '2026-04-25',
    day: 25,
    time: '17:30',
    duration: '2h',
    price: 120,
    status: 'quick',
    bookingType: 'quick',
    paymentMethod: 'Card',
    holdClient: 1,
    holdMaster: 1,
    note: 'Quick booking. Contact opens after confirmation.',
  },
  {
    id: 'provider-demo-3',
    clientName: 'Mia Johnson',
    clientAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    clientPhone: '+44 7700 900789',
    clientEmail: 'mia@example.com',
    serviceName: 'Makeup',
    date: '2026-04-26',
    day: 26,
    time: '11:00',
    duration: '1h',
    price: 50,
    status: 'request',
    bookingType: 'normal',
    paymentMethod: 'QR',
    holdClient: 1,
    holdMaster: 0,
    note: 'Waiting for provider confirmation.',
  },
];

function getTexts(language: AppLanguage) {
  return pageTexts[language] || pageTexts.EN;
}

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

function mapBookingsToProviderClients(bookings: BookingItem[]): ClientBooking[] {
  if (!bookings.length) return demoClients;

  return bookings.map((booking, index) => {
    const anyBooking = booking as any;
    const status: ClientBookingStatus =
      booking.status === 'pending'
        ? index % 2 === 0
          ? 'request'
          : 'quick'
        : booking.status === 'upcoming'
        ? 'confirmed'
        : booking.status === 'completed'
        ? 'completed'
        : 'cancelled';

    return {
      id: String(booking.id || `provider-${index}`),
      clientName:
        anyBooking.clientName ||
        anyBooking.customerName ||
        anyBooking.userName ||
        ['Anna Brown', 'Sofia Miller', 'Mia Johnson', 'Olivia Smith'][index % 4],
      clientAvatar:
        anyBooking.clientAvatar ||
        anyBooking.customerAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      clientPhone: anyBooking.clientPhone || '+44 7700 900123',
      clientEmail: anyBooking.clientEmail || 'client@example.com',
      serviceName: String(booking.serviceName || 'Service'),
      date: anyBooking.date || '2026-04-25',
      day: Number(anyBooking.day || 25 + (index % 4)),
      time: String(anyBooking.time || anyBooking.timeLabel || booking.dateLabel || '15:00').slice(-5),
      duration: anyBooking.duration || '1h',
      price: Number(booking.price || 45),
      status,
      bookingType: status === 'quick' ? 'quick' : 'normal',
      paymentMethod: index % 3 === 0 ? 'OlaCash' : index % 3 === 1 ? 'Card' : 'QR',
      holdClient: 1,
      holdMaster: status === 'request' ? 0 : 1,
      note: anyBooking.note || 'Booking synced from customer booking list.',
      sourceBooking: booking,
    };
  });
}

function getStatusStyle(status: ClientBookingStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'request') {
    return { label: text.request, bg: '#fff0da', color: '#a96a00' };
  }

  if (status === 'quick') {
    return { label: `⚡ ${text.quickBooking}`, bg: '#ffe7e7', color: '#c74343' };
  }

  if (status === 'confirmed') {
    return { label: text.confirmed, bg: '#e6efff', color: '#245cc9' };
  }

  if (status === 'completed') {
    return { label: text.completed, bg: '#dff2e3', color: '#1d7a38' };
  }

  return { label: text.cancelled, bg: '#f4f0ea', color: '#6f675f' };
}

function getDayState(day: number, clients: ClientBooking[]): CalendarDayState {
  if ([7, 14, 21, 28].includes(day)) return 'off';

  const bookingsForDay = clients.filter((item) => item.day === day);

  if (bookingsForDay.some((item) => item.status === 'request' || item.status === 'quick')) {
    return 'request';
  }

  if (bookingsForDay.length >= 3) return 'full';
  if (bookingsForDay.length > 0) return 'partial';

  return 'free';
}

function getDayColor(state: CalendarDayState) {
  if (state === 'full') return '#dff2e3';
  if (state === 'partial') return '#eeeeee';
  if (state === 'off') return '#fde5e5';
  if (state === 'request') return '#fff0da';
  return '#ffffff';
}

function getDayBorder(state: CalendarDayState) {
  if (state === 'full') return '#2ca24d';
  if (state === 'partial') return '#9ca3af';
  if (state === 'off') return '#e04b4b';
  if (state === 'request') return '#f0b429';
  return '#111111';
}

function BarcodePreview() {
  return (
    <div
      style={{
        marginTop: 14,
        border: '2px solid #111111',
        borderRadius: 22,
        background: '#ffffff',
        padding: 16,
      }}
    >
      <div
        style={{
          height: 74,
          display: 'grid',
          gridTemplateColumns:
            '6px 2px 10px 4px 3px 8px 2px 12px 4px 6px 2px 10px 3px 8px 2px 6px',
          gap: 4,
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            style={{
              background: '#111111',
              borderRadius: 2,
              height: index % 3 === 0 ? 74 : index % 2 === 0 ? 62 : 68,
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 900,
          color: '#17130f',
        }}
      >
        OLACASH-PAY-1500
      </div>
    </div>
  );
}

export default function ProviderClientsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeView, setActiveView] = useState<'today' | 'requests' | 'calendar' | 'history'>(
    'calendar'
  );
  const [selectedDay, setSelectedDay] = useState(25);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [cancelClientId, setCancelClientId] = useState<string | null>(null);
  const [paymentClientId, setPaymentClientId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('35');

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncBookings = () => setBookings(getBookings());

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

  const clients = useMemo(() => mapBookingsToProviderClients(bookings), [bookings]);

  const visibleClients = useMemo(() => {
    let source = clients;

    if (activeView === 'today') {
      source = source.filter((item) => item.day === 25);
    }

    if (activeView === 'requests') {
      source = source.filter((item) => item.status === 'request' || item.status === 'quick');
    }

    if (activeView === 'calendar') {
      source = source.filter((item) => item.day === selectedDay);
    }

    if (activeView === 'history') {
      source = source.filter((item) => item.status === 'completed' || item.status === 'cancelled');
    }

    const q = search.trim().toLowerCase();

    if (!q) return source;

    return source.filter((item) => {
      return (
        item.clientName.toLowerCase().includes(q) ||
        item.serviceName.toLowerCase().includes(q) ||
        String(item.price).includes(q) ||
        item.time.toLowerCase().includes(q) ||
        item.paymentMethod.toLowerCase().includes(q)
      );
    });
  }, [activeView, clients, search, selectedDay]);

  const selectedClient = clients.find((item) => item.id === selectedClientId) || null;
  const cancelClient = clients.find((item) => item.id === cancelClientId) || null;
  const paymentClient = clients.find((item) => item.id === paymentClientId) || null;

  const activeTodayCount = clients.filter(
    (item) => item.day === 25 && item.status !== 'cancelled'
  ).length;

  const requestCount = clients.filter(
    (item) => item.status === 'request' || item.status === 'quick'
  ).length;

  const handleConfirm = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'upcoming');
    }
    setSelectedClientId(null);
  };

  const handleComplete = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'completed');
    }
    setSelectedClientId(null);
  };

  const handleCancel = (client: ClientBooking) => {
    if (client.sourceBooking) {
      updateBookingStatus(client.sourceBooking.id, 'cancelled');
    }
    setCancelClientId(null);
    setSelectedClientId(null);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: '#17130f',
          paddingBottom: 120,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 120px' }}>
          <header
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
                  lineHeight: 1.1,
                }}
              >
                {text.title}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12.5,
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
                fontSize: 24,
                color: '#17130f',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </header>

          <section style={{ marginTop: 16 }}>
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fffefa',
                padding: 14,
                boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: '#fff0da',
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#8b7355', fontWeight: 900 }}>
                    {text.activeToday}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
                    {activeTodayCount}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 22,
                    border: '2px solid #111111',
                    background: '#e6efff',
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#2559b7', fontWeight: 900 }}>
                    {text.requests}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
                    {requestCount}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  height: 48,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 13px',
                }}
              >
                <span style={{ fontSize: 18, color: '#9ca3af' }}>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={text.search}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#17130f',
                  }}
                />
              </div>
            </div>
          </section>

          <section style={{ marginTop: 14 }}>
            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 24,
                padding: 7,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 7,
              }}
            >
              {([
                ['today', text.today],
                ['requests', text.requests],
                ['calendar', text.calendar],
                ['history', text.history],
              ] as const).map(([key, label]) => {
                const active = activeView === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#ffffff',
                      color: active ? '#ffffff' : '#17130f',
                      fontSize: 12,
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

          {activeView === 'calendar' ? (
            <section style={{ marginTop: 14 }}>
              <div
                style={{
                  borderRadius: 30,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 8,
                  }}
                >
                  {Array.from({ length: 35 }).map((_, index) => {
                    const day = index + 1;
                    const state = getDayState(day, clients);
                    const active = selectedDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        style={{
                          minHeight: 42,
                          borderRadius: 14,
                          border: active
                            ? '3px solid #111111'
                            : `2px solid ${getDayBorder(state)}`,
                          background: getDayColor(state),
                          color: '#17130f',
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {day}

                        {state === 'request' ? (
                          <span
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 5,
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: '#ff4b52',
                              border: '1px solid #111111',
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  <span>🟢 {text.full}</span>
                  <span>⚪ {text.free}</span>
                  <span>⚫ {text.partial}</span>
                  <span>🔴 {text.off}</span>
                </div>
              </div>
            </section>
          ) : null}

          <section style={{ marginTop: 16 }}>
            {visibleClients.length === 0 ? (
              <div
                style={{
                  borderRadius: 28,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 24,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#6f675f',
                }}
              >
                {text.empty}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {visibleClients.map((client) => {
                  const meta = getStatusStyle(client.status, text);

                  return (
                    <article
                      key={client.id}
                      style={{
                        borderRadius: 30,
                        border: '2px solid #111111',
                        background: '#ffffff',
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '68px 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={client.clientAvatar}
                          alt={client.clientName}
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 20,
                            objectFit: 'cover',
                            border: '2px solid #111111',
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              minHeight: 28,
                              padding: '0 10px',
                              borderRadius: 999,
                              border: '2px solid #111111',
                              background: meta.bg,
                              color: meta.color,
                              fontSize: 11,
                              fontWeight: 900,
                              marginBottom: 7,
                            }}
                          >
                            {meta.label}
                          </div>

                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#17130f',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {client.clientName}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              fontWeight: 800,
                              color: '#6f675f',
                            }}
                          >
                            {client.time} · {client.serviceName}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              fontWeight: 900,
                              color: '#17130f',
                            }}
                          >
                            {money(client.price)} · {client.paymentMethod}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedClientId(client.id)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            border: '2px solid #111111',
                            background: '#ffffff',
                            fontSize: 20,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          ›
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <BottomNav active="clients" />
      </main>

      {selectedClient ? (
        <div
          onClick={() => setSelectedClientId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.28)',
            zIndex: 220,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 14px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 16,
                boxShadow: '0 22px 44px rgba(0,0,0,0.2)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '76px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <img
                  src={selectedClient.clientAvatar}
                  alt={selectedClient.clientName}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    objectFit: 'cover',
                    border: '2px solid #111111',
                  }}
                />

                <div>
                  <div style={{ fontSize: 13, color: '#8b8277', fontWeight: 900 }}>
                    {text.clientCard}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 20,
                      color: '#17130f',
                      fontWeight: 900,
                    }}
                  >
                    {selectedClient.clientName}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      color: '#6f675f',
                      fontWeight: 800,
                    }}
                  >
                    {selectedClient.clientPhone}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientId(null)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  gap: 10,
                }}
              >
                {[
                  [text.service, selectedClient.serviceName],
                  [text.time, `${selectedClient.time} · ${selectedClient.duration}`],
                  [text.price, money(selectedClient.price)],
                  [text.payment, selectedClient.paymentMethod],
                  [text.holds, `Client £${selectedClient.holdClient} · Master £${selectedClient.holdMaster}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 20,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 900 }}>
                      {label}
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 15,
                        color: '#17130f',
                        fontWeight: 900,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  borderRadius: 20,
                  border: '2px dashed #111111',
                  background: '#fffefa',
                  padding: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: '#6f675f',
                  fontWeight: 800,
                }}
              >
                {selectedClient.note}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {(selectedClient.status === 'request' || selectedClient.status === 'quick') && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(selectedClient)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#e6efff',
                      color: '#245cc9',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.confirm}
                  </button>
                )}

                {selectedClient.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentClientId(selectedClient.id);
                      setPaymentAmount(String(selectedClient.price));
                    }}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#41c83f',
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.quickPay}
                  </button>
                )}

                {selectedClient.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(selectedClient)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#dff2e3',
                      color: '#1d7a38',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.complete}
                  </button>
                )}

                {(selectedClient.status === 'request' ||
                  selectedClient.status === 'quick' ||
                  selectedClient.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => setCancelClientId(selectedClient.id)}
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#fde5e5',
                      color: '#c74343',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.cancel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cancelClient ? (
        <div
          onClick={() => setCancelClientId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.28)',
            zIndex: 240,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 14px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 16,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                {text.reasonTitle}
              </div>

              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {[
                  text.reasonSick,
                  text.reasonClientNoReply,
                  text.reasonTimeMistake,
                  text.reasonUnavailable,
                  text.reasonOther,
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    style={{
                      minHeight: 50,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      color: '#17130f',
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '0 14px',
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleCancel(cancelClient)}
                style={{
                  marginTop: 14,
                  width: '100%',
                  minHeight: 54,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#ff4b52',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {paymentClient ? (
        <div
          onClick={() => setPaymentClientId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.28)',
            zIndex: 260,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              padding: '0 14px calc(18px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 16,
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
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                    {text.paymentTitle}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#6f675f',
                    }}
                  >
                    {paymentClient.clientName} · {paymentClient.serviceName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentClientId(null)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 900 }}>
                  {text.amount}
                </div>

                <input
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  style={{
                    marginTop: 6,
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                />
              </div>

              <BarcodePreview />

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#e6efff',
                    color: '#245cc9',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.share}
                </button>

                <button
                  type="button"
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#41c83f',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.generateCode}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
