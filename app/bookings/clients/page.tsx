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
  patchBooking,
  canShowDirectContacts,
  getProtectedBookingContact,
  type BookingItem,
} from '../../services/bookingsStore';

type ProviderView = 'today' | 'tomorrow' | 'requests' | 'calendar' | 'history';
type SlotStatus = 'free' | 'confirmed' | 'completed' | 'cancelled' | 'blocked' | 'pending';
type ContactMode = 'full' | 'quick';

type FilterKey = 'all' | SlotStatus;
type SortKey = 'time' | 'name' | 'priceAsc' | 'priceDesc' | 'procedure';

type ProviderSlot = {
  id: string;
  time: string;
  duration: string;
  clientName: string;
  clientAvatar?: string;
  serviceName: string;
  price: number;
  status: SlotStatus;
  paymentMethod: 'OlaCash' | 'Card' | 'Cash' | 'Crypto' | 'QR';
  notes: string;
  contactMode: ContactMode;
  sourceBooking?: BookingItem;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactInstagram?: string;
};

const pageTexts: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    today: string;
    tomorrow: string;
    requests: string;
    calendar: string;
    history: string;
    activeToday: string;
    requestsCount: string;
    search: string;
    dayTitle: string;
    daySubtitle: string;
    time: string;
    clientProcedure: string;
    price: string;
    notes: string;
    freeSlot: string;
    unavailable: string;
    addBooking: string;
    closeTime: string;
    clientCard: string;
    procedure: string;
    status: string;
    contacts: string;
    fullContactInfo: string;
    quickContactInfo: string;
    call: string;
    whatsapp: string;
    internalChat: string;
    message: string;
    editNotes: string;
    save: string;
    close: string;
    changeTime: string;
    hour: string;
    minutes: string;
    newTime: string;
    synced: string;
    cancel: string;
    confirmed: string;
    completed: string;
    cancelled: string;
    pending: string;
    blocked: string;
    free: string;
    home: string;
  }
> = {
  EN: {
    title: 'My clients',
    subtitle: 'Bookings, client requests, calendar and fast payments',
    today: 'Today',
    tomorrow: 'Tomorrow',
    requests: 'Requests',
    calendar: 'Calendar',
    history: 'History',
    activeToday: 'Active today',
    requestsCount: 'Requests',
    search: 'Search client, service, amount',
    dayTitle: 'Friday, 18 April 2026',
    daySubtitle: 'Booking management',
    time: 'Time',
    clientProcedure: 'Client / Procedure',
    price: 'Price',
    notes: 'Notes',
    freeSlot: 'Free slot',
    unavailable: 'Unavailable',
    addBooking: 'Add booking',
    closeTime: 'Close time',
    clientCard: 'Client card',
    procedure: 'Procedure',
    status: 'Status',
    contacts: 'Contacts',
    fullContactInfo:
      'Registered client confirmed by both sides. All client contact methods are available.',
    quickContactInfo:
      'Quick booking. Only internal Olamep chat is available until full registration.',
    call: 'Call',
    whatsapp: 'WhatsApp',
    internalChat: 'Message in chat',
    message: 'Message',
    editNotes: 'Edit notes',
    save: 'Save',
    close: 'Close',
    changeTime: 'Change time',
    hour: 'Hour',
    minutes: 'Minutes',
    newTime: 'New time',
    synced: 'Free · synced',
    cancel: 'Cancel',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    blocked: 'Blocked',
    free: 'Free',
    home: 'Home',
  },
  RU: {
    title: 'Мои клиенты',
    subtitle: 'Брони у меня, запросы, календарь и быстрые расчёты',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    requests: 'Запросы',
    calendar: 'Календарь',
    history: 'История',
    activeToday: 'Активно сегодня',
    requestsCount: 'Запросы',
    search: 'Поиск: клиент, услуга, сумма',
    dayTitle: 'Пятница, 18 апреля 2026',
    daySubtitle: 'Управление бронями',
    time: 'Время',
    clientProcedure: 'Клиент / Процедура',
    price: 'Цена',
    notes: 'Пометки',
    freeSlot: 'Свободное окно',
    unavailable: 'Недоступно',
    addBooking: 'Добавить бронь',
    closeTime: 'Закрыть время',
    clientCard: 'Карта клиента',
    procedure: 'Процедура',
    status: 'Статус',
    contacts: 'Контакты',
    fullContactInfo:
      'Если бронь оформлена зарегистрированным клиентом и подтверждена обеими сторонами, мастеру доступны все способы связи.',
    quickContactInfo:
      'Быстрая бронь. Доступен только внутренний чат Olamep до полной регистрации клиента.',
    call: 'Позвонить',
    whatsapp: 'WhatsApp',
    internalChat: 'Написать в чат',
    message: 'Сообщение',
    editNotes: 'Изменить пометки',
    save: 'Сохранить',
    close: 'Закрыть',
    changeTime: 'Изменить время',
    hour: 'Час',
    minutes: 'Минуты',
    newTime: 'Новое время',
    synced: 'Свободно · синхронизировано',
    cancel: 'Отмена',
    confirmed: 'Подтверждено',
    completed: 'Готово',
    cancelled: 'Отменено',
    pending: 'Ожидает',
    blocked: 'Недоступно',
    free: 'Свободно',
    home: 'Главная',
  },
  UA: {
    title: 'Мої клієнти',
    subtitle: 'Броні у мене, запити, календар і швидкі розрахунки',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    requests: 'Запити',
    calendar: 'Календар',
    history: 'Історія',
    activeToday: 'Активно сьогодні',
    requestsCount: 'Запити',
    search: 'Пошук: клієнт, послуга, сума',
    dayTitle: 'Пʼятниця, 18 квітня 2026',
    daySubtitle: 'Керування бронями',
    time: 'Час',
    clientProcedure: 'Клієнт / Процедура',
    price: 'Ціна',
    notes: 'Нотатки',
    freeSlot: 'Вільне вікно',
    unavailable: 'Недоступно',
    addBooking: 'Додати бронь',
    closeTime: 'Закрити час',
    clientCard: 'Карта клієнта',
    procedure: 'Процедура',
    status: 'Статус',
    contacts: 'Контакти',
    fullContactInfo:
      'Якщо бронь оформлена зареєстрованим клієнтом і підтверджена обома сторонами, майстру доступні всі способи звʼязку.',
    quickContactInfo:
      'Швидка бронь. Доступний тільки внутрішній чат Olamep до повної реєстрації клієнта.',
    call: 'Подзвонити',
    whatsapp: 'WhatsApp',
    internalChat: 'Написати в чат',
    message: 'Повідомлення',
    editNotes: 'Змінити нотатки',
    save: 'Зберегти',
    close: 'Закрити',
    changeTime: 'Змінити час',
    hour: 'Година',
    minutes: 'Хвилини',
    newTime: 'Новий час',
    synced: 'Вільно · синхронізовано',
    cancel: 'Скасувати',
    confirmed: 'Підтверджено',
    completed: 'Готово',
    cancelled: 'Скасовано',
    pending: 'Очікує',
    blocked: 'Недоступно',
    free: 'Вільно',
    home: 'Головна',
  },
  ES: {
    title: 'Mis clientes',
    subtitle: 'Reservas recibidas, solicitudes, calendario y pagos rápidos',
    today: 'Hoy',
    tomorrow: 'Mañana',
    requests: 'Solicitudes',
    calendar: 'Calendario',
    history: 'Historial',
    activeToday: 'Activo hoy',
    requestsCount: 'Solicitudes',
    search: 'Buscar cliente, servicio, importe',
    dayTitle: 'Viernes, 18 abril 2026',
    daySubtitle: 'Gestión de reservas',
    time: 'Hora',
    clientProcedure: 'Cliente / Procedimiento',
    price: 'Precio',
    notes: 'Notas',
    freeSlot: 'Espacio libre',
    unavailable: 'No disponible',
    addBooking: 'Añadir reserva',
    closeTime: 'Bloquear hora',
    clientCard: 'Ficha del cliente',
    procedure: 'Procedimiento',
    status: 'Estado',
    contacts: 'Contactos',
    fullContactInfo:
      'Cliente registrado y confirmado por ambas partes. Todos los contactos están disponibles.',
    quickContactInfo:
      'Reserva rápida. Solo está disponible el chat interno de Olamep hasta el registro completo.',
    call: 'Llamar',
    whatsapp: 'WhatsApp',
    internalChat: 'Escribir en chat',
    message: 'Mensaje',
    editNotes: 'Editar notas',
    save: 'Guardar',
    close: 'Cerrar',
    changeTime: 'Cambiar hora',
    hour: 'Hora',
    minutes: 'Minutos',
    newTime: 'Nueva hora',
    synced: 'Libre · sincronizado',
    cancel: 'Cancelar',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    pending: 'Pendiente',
    blocked: 'Bloqueado',
    free: 'Libre',
    home: 'Inicio',
  },
  CZ: {
    title: 'Moji klienti',
    subtitle: 'Rezervace u mě, požadavky, kalendář a rychlé platby',
    today: 'Dnes',
    tomorrow: 'Zítra',
    requests: 'Požadavky',
    calendar: 'Kalendář',
    history: 'Historie',
    activeToday: 'Aktivní dnes',
    requestsCount: 'Požadavky',
    search: 'Hledat klienta, službu, částku',
    dayTitle: 'Pátek, 18. dubna 2026',
    daySubtitle: 'Správa rezervací',
    time: 'Čas',
    clientProcedure: 'Klient / Procedura',
    price: 'Cena',
    notes: 'Poznámky',
    freeSlot: 'Volné okno',
    unavailable: 'Nedostupné',
    addBooking: 'Přidat rezervaci',
    closeTime: 'Zavřít čas',
    clientCard: 'Karta klienta',
    procedure: 'Procedura',
    status: 'Status',
    contacts: 'Kontakty',
    fullContactInfo:
      'Registrovaný klient potvrzen oběma stranami. Všechny kontakty jsou dostupné.',
    quickContactInfo:
      'Rychlá rezervace. Dostupný je pouze interní chat Olamep do plné registrace klienta.',
    call: 'Zavolat',
    whatsapp: 'WhatsApp',
    internalChat: 'Napsat v chatu',
    message: 'Zpráva',
    editNotes: 'Upravit poznámky',
    save: 'Uložit',
    close: 'Zavřít',
    changeTime: 'Změnit čas',
    hour: 'Hodina',
    minutes: 'Minuty',
    newTime: 'Nový čas',
    synced: 'Volné · synchronizováno',
    cancel: 'Zrušit',
    confirmed: 'Potvrzeno',
    completed: 'Hotovo',
    cancelled: 'Zrušeno',
    pending: 'Čeká',
    blocked: 'Nedostupné',
    free: 'Volno',
    home: 'Domů',
  },
  DE: {
    title: 'Meine Kunden',
    subtitle: 'Buchungen bei mir, Anfragen, Kalender und Schnellzahlungen',
    today: 'Heute',
    tomorrow: 'Morgen',
    requests: 'Anfragen',
    calendar: 'Kalender',
    history: 'Verlauf',
    activeToday: 'Heute aktiv',
    requestsCount: 'Anfragen',
    search: 'Kunde, Service, Betrag suchen',
    dayTitle: 'Freitag, 18. April 2026',
    daySubtitle: 'Buchungsverwaltung',
    time: 'Zeit',
    clientProcedure: 'Kunde / Behandlung',
    price: 'Preis',
    notes: 'Notizen',
    freeSlot: 'Freies Fenster',
    unavailable: 'Nicht verfügbar',
    addBooking: 'Buchung hinzufügen',
    closeTime: 'Zeit sperren',
    clientCard: 'Kundenkarte',
    procedure: 'Behandlung',
    status: 'Status',
    contacts: 'Kontakte',
    fullContactInfo:
      'Registrierter Kunde, beidseitig bestätigt. Alle Kontaktwege sind verfügbar.',
    quickContactInfo:
      'Schnellbuchung. Nur interner Olamep-Chat ist bis zur vollständigen Registrierung verfügbar.',
    call: 'Anrufen',
    whatsapp: 'WhatsApp',
    internalChat: 'Im Chat schreiben',
    message: 'Nachricht',
    editNotes: 'Notizen bearbeiten',
    save: 'Speichern',
    close: 'Schließen',
    changeTime: 'Zeit ändern',
    hour: 'Stunde',
    minutes: 'Minuten',
    newTime: 'Neue Zeit',
    synced: 'Frei · synchronisiert',
    cancel: 'Abbrechen',
    confirmed: 'Bestätigt',
    completed: 'Fertig',
    cancelled: 'Storniert',
    pending: 'Wartet',
    blocked: 'Gesperrt',
    free: 'Frei',
    home: 'Home',
  },
  IT: {
    title: 'I miei clienti',
    subtitle: 'Prenotazioni ricevute, richieste, calendario e pagamenti rapidi',
    today: 'Oggi',
    tomorrow: 'Domani',
    requests: 'Richieste',
    calendar: 'Calendario',
    history: 'Storico',
    activeToday: 'Attivo oggi',
    requestsCount: 'Richieste',
    search: 'Cerca cliente, servizio, importo',
    dayTitle: 'Venerdì, 18 aprile 2026',
    daySubtitle: 'Gestione prenotazioni',
    time: 'Ora',
    clientProcedure: 'Cliente / Procedura',
    price: 'Prezzo',
    notes: 'Note',
    freeSlot: 'Slot libero',
    unavailable: 'Non disponibile',
    addBooking: 'Aggiungi prenotazione',
    closeTime: 'Chiudi orario',
    clientCard: 'Scheda cliente',
    procedure: 'Procedura',
    status: 'Stato',
    contacts: 'Contatti',
    fullContactInfo:
      'Cliente registrato e confermato da entrambe le parti. Tutti i contatti sono disponibili.',
    quickContactInfo:
      'Prenotazione rapida. Solo chat interna Olamep fino alla registrazione completa.',
    call: 'Chiama',
    whatsapp: 'WhatsApp',
    internalChat: 'Scrivi in chat',
    message: 'Messaggio',
    editNotes: 'Modifica note',
    save: 'Salva',
    close: 'Chiudi',
    changeTime: 'Cambia ora',
    hour: 'Ora',
    minutes: 'Minuti',
    newTime: 'Nuova ora',
    synced: 'Libero · sincronizzato',
    cancel: 'Annulla',
    confirmed: 'Confermato',
    completed: 'Fatto',
    cancelled: 'Annullato',
    pending: 'In attesa',
    blocked: 'Bloccato',
    free: 'Libero',
    home: 'Home',
  },
  FR: {
    title: 'Mes clients',
    subtitle: 'Réservations reçues, demandes, calendrier et paiements rapides',
    today: 'Aujourd’hui',
    tomorrow: 'Demain',
    requests: 'Demandes',
    calendar: 'Calendrier',
    history: 'Historique',
    activeToday: 'Actif aujourd’hui',
    requestsCount: 'Demandes',
    search: 'Rechercher client, service, montant',
    dayTitle: 'Vendredi, 18 avril 2026',
    daySubtitle: 'Gestion des réservations',
    time: 'Heure',
    clientProcedure: 'Client / Procédure',
    price: 'Prix',
    notes: 'Notes',
    freeSlot: 'Créneau libre',
    unavailable: 'Indisponible',
    addBooking: 'Ajouter réservation',
    closeTime: 'Fermer le créneau',
    clientCard: 'Fiche client',
    procedure: 'Procédure',
    status: 'Statut',
    contacts: 'Contacts',
    fullContactInfo:
      'Client enregistré et confirmé par les deux parties. Tous les contacts sont disponibles.',
    quickContactInfo:
      'Réservation rapide. Seul le chat interne Olamep est disponible avant inscription complète.',
    call: 'Appeler',
    whatsapp: 'WhatsApp',
    internalChat: 'Écrire dans le chat',
    message: 'Message',
    editNotes: 'Modifier notes',
    save: 'Enregistrer',
    close: 'Fermer',
    changeTime: 'Modifier l’heure',
    hour: 'Heure',
    minutes: 'Minutes',
    newTime: 'Nouvelle heure',
    synced: 'Libre · synchronisé',
    cancel: 'Annuler',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    pending: 'En attente',
    blocked: 'Bloqué',
    free: 'Libre',
    home: 'Accueil',
  },
  AR: {
    title: 'عملائي',
    subtitle: 'الحجوزات لدي والطلبات والتقويم والمدفوعات السريعة',
    today: 'اليوم',
    tomorrow: 'غدًا',
    requests: 'الطلبات',
    calendar: 'التقويم',
    history: 'السجل',
    activeToday: 'نشط اليوم',
    requestsCount: 'الطلبات',
    search: 'بحث العميل أو الخدمة أو المبلغ',
    dayTitle: 'الجمعة، 18 أبريل 2026',
    daySubtitle: 'إدارة الحجوزات',
    time: 'الوقت',
    clientProcedure: 'العميل / الخدمة',
    price: 'السعر',
    notes: 'ملاحظات',
    freeSlot: 'وقت متاح',
    unavailable: 'غير متاح',
    addBooking: 'إضافة حجز',
    closeTime: 'إغلاق الوقت',
    clientCard: 'بطاقة العميل',
    procedure: 'الخدمة',
    status: 'الحالة',
    contacts: 'جهات الاتصال',
    fullContactInfo: 'عميل مسجل ومؤكد من الطرفين. كل طرق التواصل متاحة.',
    quickContactInfo: 'حجز سريع. متاح فقط شات Olamep الداخلي حتى التسجيل الكامل.',
    call: 'اتصال',
    whatsapp: 'WhatsApp',
    internalChat: 'رسالة في الشات',
    message: 'رسالة',
    editNotes: 'تعديل الملاحظات',
    save: 'حفظ',
    close: 'إغلاق',
    changeTime: 'تغيير الوقت',
    hour: 'الساعة',
    minutes: 'الدقائق',
    newTime: 'وقت جديد',
    synced: 'متاح · متزامن',
    cancel: 'إلغاء',
    confirmed: 'مؤكد',
    completed: 'تم',
    cancelled: 'ملغى',
    pending: 'قيد الانتظار',
    blocked: 'غير متاح',
    free: 'متاح',
    home: 'الرئيسية',
  },
  PL: {
    title: 'Moi klienci',
    subtitle: 'Rezerwacje u mnie, zapytania, kalendarz i szybkie płatności',
    today: 'Dzisiaj',
    tomorrow: 'Jutro',
    requests: 'Zapytania',
    calendar: 'Kalendarz',
    history: 'Historia',
    activeToday: 'Aktywne dziś',
    requestsCount: 'Zapytania',
    search: 'Szukaj klienta, usługi, kwoty',
    dayTitle: 'Piątek, 18 kwietnia 2026',
    daySubtitle: 'Zarządzanie rezerwacjami',
    time: 'Czas',
    clientProcedure: 'Klient / Procedura',
    price: 'Cena',
    notes: 'Notatki',
    freeSlot: 'Wolne okno',
    unavailable: 'Niedostępne',
    addBooking: 'Dodaj rezerwację',
    closeTime: 'Zamknij czas',
    clientCard: 'Karta klienta',
    procedure: 'Procedura',
    status: 'Status',
    contacts: 'Kontakty',
    fullContactInfo:
      'Zarejestrowany klient potwierdzony przez obie strony. Wszystkie kontakty są dostępne.',
    quickContactInfo:
      'Szybka rezerwacja. Dostępny tylko wewnętrzny chat Olamep do pełnej rejestracji.',
    call: 'Zadzwoń',
    whatsapp: 'WhatsApp',
    internalChat: 'Napisz w czacie',
    message: 'Wiadomość',
    editNotes: 'Edytuj notatki',
    save: 'Zapisz',
    close: 'Zamknij',
    changeTime: 'Zmień czas',
    hour: 'Godzina',
    minutes: 'Minuty',
    newTime: 'Nowy czas',
    synced: 'Wolne · zsynchronizowane',
    cancel: 'Anuluj',
    confirmed: 'Potwierdzone',
    completed: 'Gotowe',
    cancelled: 'Anulowane',
    pending: 'Oczekuje',
    blocked: 'Niedostępne',
    free: 'Wolne',
    home: 'Start',
  },
};

const serviceTranslations: Record<string, Partial<Record<AppLanguage, string>>> = {
  Маникюр: {
    EN: 'Manicure',
    RU: 'Маникюр',
    UA: 'Манікюр',
    ES: 'Manicura',
    CZ: 'Manikúra',
    DE: 'Maniküre',
    IT: 'Manicure',
    FR: 'Manucure',
    PL: 'Manicure',
    AR: 'مانيكير',
  },
  Стрижка: {
    EN: 'Haircut',
    RU: 'Стрижка волос',
    UA: 'Стрижка',
    ES: 'Corte de pelo',
    CZ: 'Střih vlasů',
    DE: 'Haarschnitt',
    IT: 'Taglio capelli',
    FR: 'Coupe de cheveux',
    PL: 'Strzyżenie',
    AR: 'قص شعر',
  },
  Массаж: {
    EN: 'Massage',
    RU: 'Массаж',
    UA: 'Масаж',
    ES: 'Masaje',
    CZ: 'Masáž',
    DE: 'Massage',
    IT: 'Massaggio',
    FR: 'Massage',
    PL: 'Masaż',
    AR: 'تدليك',
  },
  Визаж: {
    EN: 'Makeup',
    RU: 'Визаж',
    UA: 'Візаж',
    ES: 'Maquillaje',
    CZ: 'Make-up',
    DE: 'Make-up',
    IT: 'Trucco',
    FR: 'Maquillage',
    PL: 'Makijaż',
    AR: 'مكياج',
  },
  'Ремонт телефона': {
    EN: 'Phone repair',
    RU: 'Ремонт телефона',
    UA: 'Ремонт телефону',
    ES: 'Reparación de teléfono',
    CZ: 'Oprava telefonu',
    DE: 'Handy-Reparatur',
    IT: 'Riparazione telefono',
    FR: 'Réparation téléphone',
    PL: 'Naprawa telefonu',
    AR: 'إصلاح الهاتف',
  },
};

const demoAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';

function getTexts(language: AppLanguage) {
  return pageTexts[language] || pageTexts.EN;
}

function uiText(language: AppLanguage) {
  if (language === 'RU') {
    return {
      filters: 'Фильтры',
      filtersAlways: 'Фильтры всегда на экране',
      showFilters: 'Показать фильтры',
      hideFilters: 'Скрыть фильтры',
      priceRange: 'Диапазон цены',
      priceFrom: 'Цена от',
      priceTo: 'Цена до',
      apply: 'Применить',
      reset: 'Сбросить',
      activePrice: 'Цена',
      all: 'Все',
      byTime: 'По времени',
      byName: 'По имени',
      priceAsc: 'Цена ↑',
      priceDesc: 'Цена ↓',
      byProcedure: 'По процедуре',
    };
  }

  return {
    filters: 'Filters',
    filtersAlways: 'Always show filters',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    priceRange: 'Price range',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    apply: 'Apply',
    reset: 'Reset',
    activePrice: 'Price',
    all: 'All',
    byTime: 'By time',
    byName: 'By name',
    priceAsc: 'Price ↑',
    priceDesc: 'Price ↓',
    byProcedure: 'By service',
  };
}

function translateService(value: string, language: AppLanguage) {
  return serviceTranslations[value]?.[language] || serviceTranslations[value]?.EN || value;
}

function money(value: number) {
  return `£${Number(value || 0).toFixed(0)}`;
}

function getFilterLabel(
  filter: FilterKey,
  text: ReturnType<typeof getTexts>,
  language: AppLanguage
) {
  if (filter === 'all') return uiText(language).all;
  return getSlotStatusLabel(filter, text);
}

function getSortLabel(sort: SortKey, language: AppLanguage) {
  const labels = uiText(language);

  const map: Record<SortKey, string> = {
    time: labels.byTime,
    name: labels.byName,
    priceAsc: labels.priceAsc,
    priceDesc: labels.priceDesc,
    procedure: labels.byProcedure,
  };

  return map[sort];
}

function getSlotStatusLabel(status: SlotStatus, text: ReturnType<typeof getTexts>) {
  if (status === 'confirmed') return text.confirmed;
  if (status === 'completed') return text.completed;
  if (status === 'cancelled') return text.cancelled;
  if (status === 'pending') return text.pending;
  if (status === 'blocked') return text.blocked;
  return text.free;
}

function getFilterStyle(filter: FilterKey, active: boolean) {
  if (!active) {
    return {
      background: '#ffffff',
      color: '#17130f',
      border: '#111111',
    };
  }

  if (filter === 'confirmed') {
    return {
      background: '#e3f8ea',
      color: '#1f8c3f',
      border: '#55c75f',
    };
  }

  if (filter === 'completed') {
    return {
      background: '#e8f1ff',
      color: '#2364c8',
      border: '#2f80ed',
    };
  }

  if (filter === 'cancelled' || filter === 'blocked') {
    return {
      background: '#ffe1e7',
      color: '#cf3344',
      border: '#ff5a6b',
    };
  }

  if (filter === 'pending') {
    return {
      background: '#fff3d6',
      color: '#ad7200',
      border: '#f0b429',
    };
  }

  if (filter === 'free') {
    return {
      background: '#f4f4f4',
      color: '#6f675f',
      border: '#cfcfcf',
    };
  }

  return {
    background: '#17130f',
    color: '#ffffff',
    border: '#111111',
  };
}

function getSlotStyle(status: SlotStatus) {
  if (status === 'confirmed') {
    return {
      bg: '#e3f8ea',
      border: '#55c75f',
      color: '#1f8c3f',
      side: '#35bf55',
      price: '#ff3b3b',
    };
  }

  if (status === 'completed') {
    return {
      bg: '#e8f1ff',
      border: '#2f80ed',
      color: '#2364c8',
      side: '#2f80ed',
      price: '#ff3b3b',
    };
  }

  if (status === 'cancelled') {
    return {
      bg: 'linear-gradient(135deg, #ffffff 0%, #ffffff 48%, #ffd6dc 49%, #ffd6dc 100%)',
      border: '#ff7a85',
      color: '#cf3344',
      side: '#ff3b4e',
      price: '#ff3b3b',
    };
  }

  if (status === 'blocked') {
    return {
      bg: '#ffd8df',
      border: '#ff5a6b',
      color: '#c6283b',
      side: '#ff3b4e',
      price: '#ff3b3b',
    };
  }

  if (status === 'pending') {
    return {
      bg: '#fff3d6',
      border: '#f0b429',
      color: '#ad7200',
      side: '#f0b429',
      price: '#ff3b3b',
    };
  }

  return {
    bg: '#ffffff',
    border: '#e4e4e4',
    color: '#6f675f',
    side: '#d9d9d9',
    price: '#ff3b3b',
  };
}

function parseTimeFromDateTime(value?: string) {
  if (!value) return '09:00';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '09:00';

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  });
}

function mapBookingStatusToSlotStatus(booking: BookingItem, index: number): SlotStatus {
  if (booking.status === 'completed') return 'completed';
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'pending') return 'pending';

  if (index === 1) return 'completed';
  return 'confirmed';
}

function mapBookingsToSlots(bookings: BookingItem[], language: AppLanguage): ProviderSlot[] {
  const mapped = bookings.slice(0, 5).map((booking, index) => {
    const directContactsAvailable = canShowDirectContacts(booking);

    return {
      id: booking.id,
      time: parseTimeFromDateTime(booking.dateTime),
      duration: index === 0 ? '60 min' : index === 1 ? '45 min' : '60 min',
      clientName:
        index === 0
          ? 'Lucie Hlavová'
          : index === 1
          ? 'Janička Andělová'
          : index === 2
          ? 'Klára Nováková'
          : index === 3
          ? 'Lenka Bohatová'
          : 'Barbora Bendová',
      clientAvatar: booking.masterAvatar || demoAvatar,
      serviceName: translateService(booking.serviceName, language),
      price: booking.price,
      status: mapBookingStatusToSlotStatus(booking, index),
      paymentMethod: index === 0 ? 'OlaCash' : index === 1 ? 'Card' : index === 2 ? 'QR' : 'Cash',
      notes:
        index === 0
          ? 'чёлка короче, слои по бокам'
          : index === 1
          ? 'готово'
          : index === 2
          ? 'частично / отменено'
          : index === 3
          ? 'холодный блонд'
          : 'новые пряди',
      contactMode: directContactsAvailable ? 'full' : 'quick',
      sourceBooking: booking,
      contactPhone: booking.contactPhone,
      contactEmail: booking.contactEmail,
      contactWhatsapp: booking.contactWhatsapp,
      contactTelegram: booking.contactTelegram,
      contactInstagram: booking.contactInstagram,
    } satisfies ProviderSlot;
  });

  const demoSlots: ProviderSlot[] = [
    {
      id: 'slot_free_1200',
      time: '12:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'free',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
    {
      id: 'slot_blocked_1500',
      time: '15:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'blocked',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
    {
      id: 'slot_free_1900',
      time: '19:00',
      duration: '60 min',
      clientName: '',
      serviceName: '',
      price: 0,
      status: 'free',
      paymentMethod: 'Cash',
      notes: '',
      contactMode: 'quick',
    },
  ];

  return [...mapped, ...demoSlots].sort((a, b) => a.time.localeCompare(b.time));
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 38,
          height: 46,
          position: 'relative',
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #2fc96d 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          transform: 'rotate(0deg)',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 8,
            width: 19,
            height: 19,
            borderRadius: '50%',
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: '#08245c',
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

export default function ProviderClientsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [bookings, setBookings] = useState<BookingItem[]>(getBookings());
  const [activeView, setActiveView] = useState<ProviderView>('today');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [search, setSearch] = useState('');
  const [slots, setSlots] = useState<ProviderSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [timeSlotId, setTimeSlotId] = useState<string | null>(null);
  const [editHour, setEditHour] = useState('09');
  const [editMinute, setEditMinute] = useState('30');
  const [noteDraft, setNoteDraft] = useState('');
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);

  const [filtersAlwaysVisible, setFiltersAlwaysVisible] = useState(true);
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [showPriceSheet, setShowPriceSheet] = useState(false);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [priceDraftFrom, setPriceDraftFrom] = useState('');
  const [priceDraftTo, setPriceDraftTo] = useState('');

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

  useEffect(() => {
    setSlots(mapBookingsToSlots(bookings, language));
  }, [bookings, language]);

  useEffect(() => {
    if (filtersAlwaysVisible) {
      setShowFiltersPanel(true);
    }
  }, [filtersAlwaysVisible]);

  const text = useMemo(() => getTexts(language), [language]);
  const labels = useMemo(() => uiText(language), [language]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || null;
  const timeSlot = slots.find((slot) => slot.id === timeSlotId) || null;

  const priceFilterActive = priceFrom.trim() !== '' || priceTo.trim() !== '';

  const visibleSlots = useMemo(() => {
    let source = slots;

    if (activeView === 'tomorrow') {
      source = slots.map((slot, index) => ({
        ...slot,
        id: `${slot.id}_tomorrow`,
        time: index === 0 ? '10:00' : index === 1 ? '11:30' : index === 2 ? '14:00' : slot.time,
      }));
    }

    if (activeView === 'requests') {
      source = source.filter((slot) => slot.status === 'pending');
    }

    if (activeView === 'history') {
      source = source.filter((slot) => slot.status === 'completed' || slot.status === 'cancelled');
    }

    if (activeFilter !== 'all') {
      source = source.filter((slot) => slot.status === activeFilter);
    }

    const minPrice = priceFrom.trim() === '' ? null : Number(priceFrom);
    const maxPrice = priceTo.trim() === '' ? null : Number(priceTo);

    if (minPrice !== null && !Number.isNaN(minPrice)) {
      source = source.filter((slot) => slot.price >= minPrice);
    }

    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      source = source.filter((slot) => slot.price <= maxPrice);
    }

    const q = search.trim().toLowerCase();

    if (q) {
      source = source.filter((slot) => {
        return (
          slot.clientName.toLowerCase().includes(q) ||
          slot.serviceName.toLowerCase().includes(q) ||
          String(slot.price).includes(q) ||
          slot.notes.toLowerCase().includes(q) ||
          slot.paymentMethod.toLowerCase().includes(q) ||
          slot.time.toLowerCase().includes(q)
        );
      });
    }

    return [...source].sort((a, b) => {
      if (sortKey === 'name') return a.clientName.localeCompare(b.clientName);
      if (sortKey === 'procedure') return a.serviceName.localeCompare(b.serviceName);
      if (sortKey === 'priceAsc') return a.price - b.price;
      if (sortKey === 'priceDesc') return b.price - a.price;
      return a.time.localeCompare(b.time);
    });
  }, [activeFilter, activeView, priceFrom, priceTo, search, slots, sortKey]);

  const activeTodayCount = slots.filter(
    (slot) => slot.status === 'confirmed' || slot.status === 'pending'
  ).length;

  const requestCount = slots.filter((slot) => slot.status === 'pending').length;

  const handleOpenTimeModal = (slot: ProviderSlot) => {
    const [hour, minute] = slot.time.split(':');
    setEditHour(hour || '09');
    setEditMinute(minute || '30');
    setTimeSlotId(slot.id);
  };

  const handleOpenPriceSheet = () => {
    setPriceDraftFrom(priceFrom);
    setPriceDraftTo(priceTo);
    setShowPriceSheet(true);
  };

  const handleApplyPriceFilter = () => {
    setPriceFrom(priceDraftFrom.replace(/[^\d]/g, ''));
    setPriceTo(priceDraftTo.replace(/[^\d]/g, ''));
    setShowPriceSheet(false);
  };

  const handleResetPriceFilter = () => {
    setPriceDraftFrom('');
    setPriceDraftTo('');
    setPriceFrom('');
    setPriceTo('');
    setShowPriceSheet(false);
  };

  const handleSaveTime = () => {
    if (!timeSlotId) return;

    const nextTime = `${editHour}:${editMinute}`;

    setSlots((current) =>
      current
        .map((slot) => (slot.id === timeSlotId ? { ...slot, time: nextTime } : slot))
        .sort((a, b) => a.time.localeCompare(b.time))
    );

    const slot = slots.find((item) => item.id === timeSlotId);
    if (slot?.sourceBooking) {
      const currentDate = new Date(slot.sourceBooking.dateTime);
      if (!Number.isNaN(currentDate.getTime())) {
        const [hours, minutes] = nextTime.split(':').map(Number);
        currentDate.setHours(hours, minutes, 0, 0);
        patchBooking(slot.sourceBooking.id, {
          dateTime: currentDate.toISOString(),
          dateLabel: `${text.today} ${nextTime}`,
        });
      }
    }

    setTimeSlotId(null);
  };

  const handleSaveNote = () => {
    if (!selectedSlot) return;

    setSlots((current) =>
      current.map((slot) =>
        slot.id === selectedSlot.id
          ? {
              ...slot,
              notes: noteDraft,
            }
          : slot
      )
    );
  };

  const handleDropOnSlot = (targetSlot: ProviderSlot) => {
    if (!draggingSlotId || draggingSlotId === targetSlot.id) {
      setDraggingSlotId(null);
      return;
    }

    setSlots((current) => {
      const dragging = current.find((slot) => slot.id === draggingSlotId);
      if (!dragging) return current;

      return current
        .map((slot) => {
          if (slot.id === draggingSlotId) {
            return {
              ...slot,
              time: targetSlot.time,
            };
          }

          if (slot.id === targetSlot.id) {
            return {
              ...slot,
              time: dragging.time,
            };
          }

          return slot;
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    });

    setDraggingSlotId(null);
  };

  const filterOptions: FilterKey[] = [
    'all',
    'confirmed',
    'completed',
    'pending',
    'cancelled',
    'blocked',
    'free',
  ];

  const sortOptions: SortKey[] = ['time', 'name', 'priceAsc', 'priceDesc', 'procedure'];

  const shouldShowFilters = filtersAlwaysVisible || showFiltersPanel;

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          color: '#17130f',
          paddingBottom: 118,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 120px' }}>
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 48px',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 25,
                color: '#17130f',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ textAlign: 'center' }}>
              <OlamepLogo />
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label={text.home}
              style={{
                width: 48,
                height: 48,
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
            <h1
              style={{
                margin: 0,
                fontSize: 33,
                fontWeight: 900,
                letterSpacing: '-1px',
                color: '#08245c',
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: 14,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#7b7268',
              }}
            >
              {text.subtitle}
            </p>
          </section>

          <section style={{ marginTop: 16 }}>
            <div
              style={{
                borderRadius: 28,
                border: '2px solid #111111',
                background: '#ffffff',
                padding: 14,
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
                  <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>
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
                    {text.requestsCount}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>
                    {requestCount}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  height: 50,
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
                    minWidth: 0,
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
                borderRadius: 25,
                padding: 7,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 6,
              }}
            >
              {([
                ['today', text.today],
                ['tomorrow', text.tomorrow],
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
                      minHeight: 46,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#ffffff',
                      color: active ? '#ffffff' : '#17130f',
                      fontSize: language === 'RU' || language === 'UA' ? 10.5 : 11.5,
                      fontWeight: 900,
                      cursor: 'pointer',
                      padding: '0 4px',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: 12 }}>
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#fffefa',
                padding: 10,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {labels.filters}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (filtersAlwaysVisible) return;
                    setShowFiltersPanel((prev) => !prev);
                  }}
                  style={{
                    minHeight: 38,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: filtersAlwaysVisible ? '#e3f8ea' : '#ffffff',
                    color: filtersAlwaysVisible ? '#1f8c3f' : '#17130f',
                    padding: '0 13px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: filtersAlwaysVisible ? 'default' : 'pointer',
                  }}
                >
                  {showFiltersPanel || filtersAlwaysVisible ? labels.hideFilters : labels.showFilters}
                </button>
              </div>

              <div
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  padding: 10,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {labels.filtersAlways}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#8b8277',
                    }}
                  >
                    {filtersAlwaysVisible ? 'ON' : 'OFF'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersAlwaysVisible((prev) => !prev)}
                  style={{
                    width: 62,
                    height: 34,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: filtersAlwaysVisible ? '#41c83f' : '#ececec',
                    padding: 3,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: filtersAlwaysVisible ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: '#ffffff',
                      border: '2px solid #111111',
                    }}
                  />
                </button>
              </div>

              {shouldShowFilters ? (
                <div style={{ marginTop: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      paddingBottom: 6,
                    }}
                  >
                    {filterOptions.map((filter) => {
                      const active = activeFilter === filter;
                      const style = getFilterStyle(filter, active);

                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          style={{
                            flexShrink: 0,
                            minHeight: 38,
                            borderRadius: 999,
                            border: `2px solid ${style.border}`,
                            background: style.background,
                            color: style.color,
                            padding: '0 13px',
                            fontSize: 12.5,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {getFilterLabel(filter, text, language)}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      paddingBottom: 2,
                    }}
                  >
                    {sortOptions.map((sort) => {
                      const active = sortKey === sort;

                      return (
                        <button
                          key={sort}
                          type="button"
                          onClick={() => setSortKey(sort)}
                          style={{
                            flexShrink: 0,
                            minHeight: 36,
                            borderRadius: 999,
                            border: active ? '2px solid #2f80ed' : '2px solid #111111',
                            background: active ? '#e8f1ff' : '#ffffff',
                            color: active ? '#2364c8' : '#17130f',
                            padding: '0 13px',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {getSortLabel(sort, language)}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleOpenPriceSheet}
                      style={{
                        flexShrink: 0,
                        minHeight: 36,
                        borderRadius: 999,
                        border: priceFilterActive ? '2px solid #ff3b3b' : '2px solid #111111',
                        background: priceFilterActive ? '#fff0f0' : '#ffffff',
                        color: priceFilterActive ? '#ff3b3b' : '#17130f',
                        padding: '0 13px',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {priceFilterActive
                        ? `${labels.activePrice}: £${priceFrom || '0'}–£${priceTo || '∞'}`
                        : labels.priceRange}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 14,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {activeView === 'tomorrow' ? text.tomorrow : text.dayTitle}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#7b7268',
                }}
              >
                {text.daySubtitle}
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '64px 1fr 68px 78px',
                gap: 8,
                padding: '0 4px',
                fontSize: 11,
                fontWeight: 900,
                color: '#7b7268',
              }}
            >
              <div>{text.time}</div>
              <div>{text.clientProcedure}</div>
              <div>{text.price}</div>
              <div>{text.notes}</div>
            </div>

            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {visibleSlots.map((slot) => {
                const style = getSlotStyle(slot.status);
                const isEmpty = slot.status === 'free' || slot.status === 'blocked';

                return (
                  <article
                    key={slot.id}
                    draggable={!isEmpty}
                    onDragStart={() => setDraggingSlotId(slot.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropOnSlot(slot)}
                    onClick={() => {
                      if (slot.status === 'free' || slot.status === 'blocked') {
                        handleOpenTimeModal(slot);
                        return;
                      }

                      setSelectedSlotId(slot.id);
                      setNoteDraft(slot.notes);
                    }}
                    style={{
                      minHeight: 72,
                      display: 'grid',
                      gridTemplateColumns: '64px 1fr 68px 78px',
                      gap: 8,
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenTimeModal(slot);
                      }}
                      style={{
                        minHeight: 58,
                        border: 'none',
                        borderLeft: `6px solid ${style.side}`,
                        background: '#ffffff',
                        color: '#17130f',
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: 'pointer',
                        textAlign: 'left',
                        paddingLeft: 9,
                      }}
                    >
                      {slot.time}
                    </button>

                    <div
                      style={{
                        minHeight: 64,
                        borderRadius: 13,
                        border: `2px solid ${style.border}`,
                        background: style.bg,
                        padding: '10px 12px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      {slot.status === 'free' ? (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#6f675f',
                          }}
                        >
                          {text.freeSlot}
                        </div>
                      ) : slot.status === 'blocked' ? (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 15,
                            fontWeight: 900,
                            color: '#c6283b',
                          }}
                        >
                          {text.unavailable}
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: '#17130f',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {slot.clientName}
                          </div>
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: '#6f675f',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {slot.serviceName}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              display: 'inline-flex',
                              minHeight: 22,
                              padding: '0 10px',
                              alignItems: 'center',
                              borderRadius: 999,
                              border: `1.5px solid ${style.border}`,
                              background: '#ffffffcc',
                              color: style.color,
                              fontSize: 10.5,
                              fontWeight: 900,
                            }}
                          >
                            {getSlotStatusLabel(slot.status, text)}
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        minHeight: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 900,
                        color: slot.price > 0 ? '#ff3b3b' : '#9ca3af',
                      }}
                    >
                      {slot.price > 0 ? money(slot.price) : '—'}
                    </div>

                    <div
                      style={{
                        minHeight: 64,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 12,
                        lineHeight: 1.25,
                        fontWeight: 900,
                        color: slot.notes ? '#d2a300' : '#9ca3af',
                        overflow: 'hidden',
                      }}
                    >
                      {slot.notes || '—'}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <BottomNav active="bookings" />
      </main>

      {selectedSlot ? (
        <div
          onClick={() => setSelectedSlotId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(17,17,17,0.22)',
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
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              border: '2px solid #111111',
              borderBottom: 'none',
              padding: '18px 14px calc(22px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedSlotId(null)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

              <button
                type="button"
                onClick={() => handleOpenTimeModal(selectedSlot)}
                style={{
                  minHeight: 42,
                  padding: '0 14px',
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#e8f1ff',
                  color: '#2364c8',
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.changeTime}
              </button>
            </div>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <OlamepLogo />
            </div>

            <section
              style={{
                marginTop: 18,
                borderRadius: 28,
                border: '1.5px solid #e4e4e4',
                background: '#ffffff',
                padding: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '82px 1fr',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={selectedSlot.clientAvatar || demoAvatar}
                    alt={selectedSlot.clientName}
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 24,
                      objectFit: 'cover',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: -2,
                      bottom: -2,
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: '#25b65a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 27,
                      lineHeight: 1.05,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {selectedSlot.clientName}
                  </h2>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#6f675f',
                    }}
                  >
                    {selectedSlot.serviceName}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#6f675f',
                    }}
                  >
                    18 апреля 2026 · {selectedSlot.time}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 34,
                      fontWeight: 900,
                      color: '#ff3b3b',
                    }}
                  >
                    {money(selectedSlot.price)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  borderTop: '1.5px solid #eeeeee',
                }}
              >
                {[
                  [text.procedure, selectedSlot.serviceName],
                  [text.price, money(selectedSlot.price)],
                  [text.status, getSlotStatusLabel(selectedSlot.status, text)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      minHeight: 54,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      alignItems: 'center',
                      borderBottom: '1.5px solid #eeeeee',
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: label === text.price ? '#ff3b3b' : '#17130f',
                        textAlign: 'right',
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    minHeight: 74,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    alignItems: 'center',
                    borderBottom: '1.5px solid #eeeeee',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                    {text.notes}
                  </div>

                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    onBlur={handleSaveNote}
                    rows={3}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: 14,
                      lineHeight: 1.25,
                      fontWeight: 800,
                      color: '#d2a300',
                      textAlign: 'right',
                      background: 'transparent',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  />
                </div>
              </div>
            </section>

            <section
              style={{
                marginTop: 14,
                borderRadius: 24,
                border: '1.5px solid #e4e4e4',
                background: '#ffffff',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                <span style={{ color: '#25b65a' }}>⬟</span>
                {text.contacts}
              </div>

              <div
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  border: '1.5px solid #cfeeda',
                  background: '#f2fff6',
                  padding: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.45,
                  color: '#5d665f',
                }}
              >
                {selectedSlot.contactMode === 'full' ? text.fullContactInfo : text.quickContactInfo}
              </div>

              {selectedSlot.contactMode === 'full' ? (
                <FullContactsBlock slot={selectedSlot} text={text} />
              ) : (
                <QuickContactsBlock text={text} />
              )}
            </section>
          </div>
        </div>
      ) : null}

      {timeSlot ? (
        <div
          onClick={() => setTimeSlotId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 340,
            background: 'rgba(17,17,17,0.38)',
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
              background: '#ffffff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              border: '2px solid #111111',
              borderBottom: 'none',
              padding: '18px 22px calc(22px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: 58,
                height: 5,
                borderRadius: 999,
                background: '#d8d8d8',
                margin: '0 auto 18px',
              }}
            />

            <h2
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.changeTime}
            </h2>

            <div
              style={{
                marginTop: 26,
                display: 'grid',
                gridTemplateColumns: '1fr 20px 1fr',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#17130f' }}>
                  {text.hour}
                </div>
                <input
                  value={editHour}
                  onChange={(event) => {
                    const clean = event.target.value.replace(/\D/g, '').slice(0, 2);
                    setEditHour(clean.padStart(2, '0'));
                  }}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    height: 92,
                    borderRadius: 18,
                    border: '2px solid #dedede',
                    textAlign: 'center',
                    fontSize: 45,
                    fontWeight: 900,
                    color: '#07111f',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 26,
                  textAlign: 'center',
                  fontSize: 34,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                :
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#17130f' }}>
                  {text.minutes}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    borderRadius: 18,
                    border: '2px solid #dedede',
                    overflow: 'hidden',
                  }}
                >
                  {['00', '15', '20', '25', '30', '35', '40', '45'].map((minute) => {
                    const active = editMinute === minute;

                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => setEditMinute(minute)}
                        style={{
                          width: '100%',
                          minHeight: 34,
                          border: 'none',
                          background: active ? '#e8f1ff' : '#ffffff',
                          color: active ? '#2364c8' : '#9ca3af',
                          fontSize: active ? 22 : 17,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {minute}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.newTime}:{' '}
              <span style={{ color: '#2364c8' }}>
                {editHour}:{editMinute}
              </span>
            </div>

            <div
              style={{
                marginTop: 12,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: '#25a653',
              }}
            >
              ✓ {text.synced}
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setTimeSlotId(null)}
                style={{
                  minHeight: 56,
                  borderRadius: 18,
                  border: '2px solid #ff4b52',
                  background: '#fff2f4',
                  color: '#ff4b52',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.cancel}
              </button>

              <button
                type="button"
                onClick={handleSaveTime}
                style={{
                  minHeight: 56,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#41c83f',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPriceSheet ? (
        <div
          onClick={() => setShowPriceSheet(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 360,
            background: 'rgba(17,17,17,0.34)',
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
              background: '#ffffff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              border: '2px solid #111111',
              borderBottom: 'none',
              padding: '18px 18px calc(22px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: 58,
                height: 5,
                borderRadius: 999,
                background: '#d8d8d8',
                margin: '0 auto 18px',
              }}
            />

            <h2
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {labels.priceRange}
            </h2>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <label
                style={{
                  borderRadius: 20,
                  border: '2px solid #111111',
                  padding: 12,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#7b7268',
                    marginBottom: 8,
                  }}
                >
                  {labels.priceFrom}
                </div>
                <input
                  value={priceDraftFrom}
                  onChange={(event) => setPriceDraftFrom(event.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="45"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#ff3b3b',
                    background: 'transparent',
                  }}
                />
              </label>

              <label
                style={{
                  borderRadius: 20,
                  border: '2px solid #111111',
                  padding: 12,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#7b7268',
                    marginBottom: 8,
                  }}
                >
                  {labels.priceTo}
                </div>
                <input
                  value={priceDraftTo}
                  onChange={(event) => setPriceDraftTo(event.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="50"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#ff3b3b',
                    background: 'transparent',
                  }}
                />
              </label>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={handleResetPriceFilter}
                style={{
                  minHeight: 56,
                  borderRadius: 18,
                  border: '2px solid #ff4b52',
                  background: '#fff2f4',
                  color: '#ff4b52',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {labels.reset}
              </button>

              <button
                type="button"
                onClick={handleApplyPriceFilter}
                style={{
                  minHeight: 56,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#41c83f',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {labels.apply}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FullContactsBlock({
  slot,
  text,
}: {
  slot: ProviderSlot;
  text: ReturnType<typeof getTexts>;
}) {
  const booking = slot.sourceBooking;
  const protectedContact = booking ? getProtectedBookingContact(booking) : null;

  const phone = protectedContact?.phone || slot.contactPhone || '+44 7700 900123';
  const email = protectedContact?.email || slot.contactEmail || 'lucie.hlavova@example.com';
  const whatsapp = protectedContact?.whatsapp || slot.contactWhatsapp || phone;

  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
      <ContactRow icon="☎" value={phone} buttonLabel={text.call} accent="green" />
      <ContactRow icon="✉" value={email} buttonLabel={text.message} accent="yellow" />
      <ContactRow icon="🟢" value={whatsapp} buttonLabel={text.whatsapp} accent="yellow" />
      <ContactRow icon="💬" value="Olamep chat" buttonLabel={text.internalChat} accent="yellow" />

      <div
        style={{
          marginTop: 4,
          borderTop: '1.5px solid #eeeeee',
          paddingTop: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#747474',
        }}
      >
        <span>🔒</span>
        <span>Все способы связи предоставлены клиентом и доступны вам.</span>
      </div>
    </div>
  );
}

function QuickContactsBlock({ text }: { text: ReturnType<typeof getTexts> }) {
  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
      <ContactRow icon="💬" value="Olamep chat" buttonLabel={text.internalChat} accent="yellow" />

      <div
        style={{
          marginTop: 4,
          borderTop: '1.5px solid #eeeeee',
          paddingTop: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: '#747474',
        }}
      >
        <span>🔒</span>
        <span>При быстрой брони доступен только внутренний чат приложения.</span>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  value,
  buttonLabel,
  accent,
}: {
  icon: string;
  value: string;
  buttonLabel: string;
  accent: 'green' | 'yellow';
}) {
  const isYellow = accent === 'yellow';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 21,
          color: isYellow ? '#d2a300' : '#25a653',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
          fontSize: 14,
          fontWeight: 800,
          color: '#17130f',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>

      <button
        type="button"
        style={{
          minHeight: 38,
          padding: '0 12px',
          borderRadius: 12,
          border: `2px solid ${isYellow ? '#f2c94c' : '#55c75f'}`,
          background: isYellow ? '#fff7cf' : '#ffffff',
          color: isYellow ? '#b28a00' : '#25a653',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
