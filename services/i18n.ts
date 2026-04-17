export const APP_LANGUAGES = [
  'EN',
  'ES',
  'RU',
  'UA',
  'CZ',
  'DE',
  'IT',
  'FR',
  'AR',
  'PL',
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

const STORAGE_KEY = 'mapbook_language';
export const LANGUAGE_CHANGE_EVENT = 'mapbook:language-change';

type TranslationShape = {
  searchPlaceholder: string;
  recentSearches: string;
  popularSearches: string;
  noResultsFound: string;
  smartMatches: string;
  categories: string;
  services: string;
  pros: string;
  listings: string;
  allLiked: string;
  prosAvailableNow: string;
  mapStyle: string;
  myLocation: string;
  clearSelection: string;
  available: string;
  unavailable: string;
  verifiedPro: string;
  availableNow: string;
  unavailableToday: string;
  from: string;
  view: string;
  route: string;
  bookNow: string;
  popularServices: string;
  cash: string;
  card: string;
  wallet: string;
  crypto: string;
  allCategories: string;
  chooseCategoryAndSubcategory: string;
  extraCategories: string;
  more: string;
  selectedLanguage: string;
  textMustMatchLanguage: string;
  clearField: string;
  next: string;
  save: string;
  search: string;
  edit: string;
  add: string;
  close: string;
  backToHome: string;
  published: string;
  paid: string;
  uploadPhoto: string;
  uploadPhotos: string;
  chooseCategory: string;
  chooseSubcategory: string;
  payAd: string;
  payDeal: string;
  payNow: string;
  openProfile: string;
  remove: string;
  openMap: string;
  favouritePlaces: string;
  likedProfessionals: string;
  trustedChoice: string;
  paymentMethods: string;
  paymentMethodsSub: string;
  bookingAccess: string;
  provider: string;
  exactAddress: string;
  providerPhone: string;
  providerEmail: string;
  routeLocked: string;
  writeSeller: string;
  callSeller: string;
  routeToMaster: string;
  hiddenUntilPaid: string;
  detailsUnlocked: string;
  secureBooking: string;
  paymentProtected: string;

  popularSearchDogHotel: string;
  popularSearchCarpetCleaning: string;
  popularSearchPhoneRepair: string;
  popularSearchHairExtensions: string;
  popularSearchMassage: string;
  popularSearchMovingHelp: string;

  hotOffersNear: string;
  sponsored: string;
  specialOfferNearYou: string;
  viewsLabel: string;
  viewAction: string;
  bookAction: string;
  fallbackServiceLabel: string;

  dealsToday: string;
  allDealsToday: string;
  bestPriceToday: string;
  todayDiscount: string;
  hotOffer: string;
  discountToday: string;
  activeToday: string;
  discountBadge: string;
  freeFirstAd: string;
  freeFirstBooking: string;
  freeFirstHotOffer: string;
  welcomeFreeActions: string;
  newUserBonusTitle: string;
  newUserBonusText: string;
};

const EN: TranslationShape = {
  searchPlaceholder: 'Search services, categories, locations or professionals...',
  recentSearches: 'Recent searches',
  popularSearches: 'Popular searches',
  noResultsFound: 'No results found',
  smartMatches: 'Smart matches',
  categories: 'Categories',
  services: 'Services',
  pros: 'Pros',
  listings: 'Listings',
  allLiked: 'All liked',
  prosAvailableNow: 'pros available now',
  mapStyle: 'Map style',
  myLocation: 'My location',
  clearSelection: 'Clear selection',
  available: 'Available',
  unavailable: 'Unavailable',
  verifiedPro: 'Verified Pro',
  availableNow: 'Available now',
  unavailableToday: 'Unavailable today',
  from: 'From',
  view: 'Open',
  route: 'Route',
  bookNow: 'Book now',
  popularServices: 'Popular services',
  cash: 'Cash',
  card: 'Card',
  wallet: 'Wallet',
  crypto: 'Crypto',
  allCategories: 'All categories',
  chooseCategoryAndSubcategory: 'Choose category and subcategory',
  extraCategories: 'Extra categories',
  more: 'More',
  selectedLanguage: 'Selected language',
  textMustMatchLanguage: 'The text must match the selected language.',
  clearField: 'Clear field',
  next: 'Next',
  save: 'Save',
  search: 'Search',
  edit: 'Edit',
  add: 'Add',
  close: 'Close',
  backToHome: 'Back to home',
  published: 'Published',
  paid: 'Paid',
  uploadPhoto: 'Upload photo',
  uploadPhotos: 'Upload photos',
  chooseCategory: 'Choose category',
  chooseSubcategory: 'Choose subcategory',
  payAd: 'Pay for ad',
  payDeal: 'Pay for deal',
  payNow: 'Pay now',
  openProfile: 'Open profile',
  remove: 'Remove',
  openMap: 'Open on map',
  favouritePlaces: 'Favourite places',
  likedProfessionals: 'Liked professionals',
  trustedChoice: 'Trusted choice',
  paymentMethods: 'Payment methods',
  paymentMethodsSub: 'Cards, PayPal and crypto wallets',
  bookingAccess: 'Booking access',
  provider: 'Provider',
  exactAddress: 'Exact address',
  providerPhone: 'Phone',
  providerEmail: 'Email',
  routeLocked: 'Route after payment',
  writeSeller: 'Write to seller',
  callSeller: 'Call seller',
  routeToMaster: 'Route to provider',
  hiddenUntilPaid: 'Exact address, route and direct contact are available after payment',
  detailsUnlocked: 'Details unlocked',
  secureBooking: 'Secure booking',
  paymentProtected: 'Protected booking details',

  popularSearchDogHotel: 'Dog hotel',
  popularSearchCarpetCleaning: 'Carpet cleaning',
  popularSearchPhoneRepair: 'Phone repair',
  popularSearchHairExtensions: 'Hair extensions',
  popularSearchMassage: 'Massage',
  popularSearchMovingHelp: 'Moving help',

  hotOffersNear: 'Hot offers near',
  sponsored: 'Sponsored',
  specialOfferNearYou: 'Special offer near you',
  viewsLabel: 'Views',
  viewAction: 'Open',
  bookAction: 'Book',
  fallbackServiceLabel: 'Service',

  dealsToday: 'Today deals',
  allDealsToday: 'All today deals',
  bestPriceToday: 'Best price today',
  todayDiscount: 'Today discount',
  hotOffer: 'Hot offer',
  discountToday: 'Today discount',
  activeToday: 'Active today',
  discountBadge: 'Discount',
  freeFirstAd: 'First ad free',
  freeFirstBooking: 'First booking free',
  freeFirstHotOffer: 'First hot offer free',
  welcomeFreeActions: 'Welcome free actions',
  newUserBonusTitle: 'Free first launch',
  newUserBonusText:
    'New users can publish their first ad, first booking and first hot offer for free.',
};

export const translations: Record<AppLanguage, TranslationShape> = {
  EN,
  ES: {
    ...EN,
    searchPlaceholder: 'Buscar servicios, categorías, ubicaciones o profesionales...',
    recentSearches: 'Búsquedas recientes',
    popularSearches: 'Búsquedas populares',
    noResultsFound: 'No se han encontrado resultados',
    smartMatches: 'Coincidencias inteligentes',
    categories: 'Categorías',
    services: 'Servicios',
    pros: 'Profesionales',
    listings: 'Anuncios',
    allLiked: 'Todos los favoritos',
    available: 'Disponible',
    unavailable: 'No disponible',
    verifiedPro: 'Profesional verificado',
    availableNow: 'Disponible ahora',
    unavailableToday: 'No disponible hoy',
    from: 'Desde',
    view: 'Abrir',
    route: 'Ruta',
    bookNow: 'Reservar',
    more: 'Más',
    save: 'Guardar',
    search: 'Buscar',
    edit: 'Editar',
    add: 'Añadir',
    close: 'Cerrar',
    backToHome: 'Ir al inicio',
    published: 'Publicado',
    paid: 'Pagado',
    uploadPhoto: 'Subir foto',
    uploadPhotos: 'Subir fotos',
    chooseCategory: 'Elegir categoría',
    chooseSubcategory: 'Elegir subcategoría',
    payAd: 'Pagar anuncio',
    payDeal: 'Pagar descuento',
    payNow: 'Pagar ahora',
    openProfile: 'Abrir perfil',
    remove: 'Eliminar',
    openMap: 'Abrir en mapa',
    favouritePlaces: 'Lugares favoritos',
    likedProfessionals: 'Profesionales favoritos',
    trustedChoice: 'Elección confiable',
    paymentMethods: 'Métodos de pago',
    paymentMethodsSub: 'Tarjetas, PayPal y billeteras cripto',
    bookingAccess: 'Acceso a la reserva',
    provider: 'Profesional',
    exactAddress: 'Dirección exacta',
    providerPhone: 'Teléfono',
    providerEmail: 'Email',
    routeLocked: 'Ruta después del pago',
    writeSeller: 'Escribir al profesional',
    callSeller: 'Llamar al profesional',
    routeToMaster: 'Ruta al profesional',
    hiddenUntilPaid:
      'La dirección exacta, la ruta y el contacto directo estarán disponibles después del pago',
    detailsUnlocked: 'Detalles desbloqueados',
    secureBooking: 'Reserva segura',
    paymentProtected: 'Datos protegidos de la reserva',
    sponsored: 'Patrocinado',
    viewAction: 'Abrir',
    bookAction: 'Reservar',
  },
  RU: {
    ...EN,
    searchPlaceholder: 'Поиск услуг, категорий, локаций или специалистов...',
    recentSearches: 'Недавние поиски',
    popularSearches: 'Популярные запросы',
    noResultsFound: 'Ничего не найдено',
    smartMatches: 'Умные совпадения',
    categories: 'Категории',
    services: 'Услуги',
    pros: 'Специалисты',
    listings: 'Объявления',
    allLiked: 'Все избранные',
    available: 'Доступно',
    unavailable: 'Недоступно',
    verifiedPro: 'Проверенный специалист',
    availableNow: 'Доступен сейчас',
    unavailableToday: 'Сегодня недоступен',
    from: 'От',
    view: 'Открыть',
    route: 'Маршрут',
    bookNow: 'Забронировать',
    popularServices: 'Популярные услуги',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Кошелёк',
    crypto: 'Крипто',
    allCategories: 'Все категории',
    chooseCategoryAndSubcategory: 'Выберите категорию и подкатегорию',
    extraCategories: 'Дополнительные категории',
    more: 'Ещё',
    selectedLanguage: 'Выбранный язык',
    textMustMatchLanguage: 'Текст должен соответствовать выбранному языку.',
    clearField: 'Очистить поле',
    next: 'Далее',
    save: 'Сохранить',
    search: 'Поиск',
    edit: 'Редактировать',
    add: 'Добавить',
    close: 'Закрыть',
    backToHome: 'На главную',
    published: 'Опубликовано',
    paid: 'Оплачено',
    uploadPhoto: 'Добавить фото',
    uploadPhotos: 'Добавить фото',
    chooseCategory: 'Выбрать категорию',
    chooseSubcategory: 'Выбрать подкатегорию',
    payAd: 'Оплатить рекламу',
    payDeal: 'Оплатить скидку',
    payNow: 'Оплатить',
    openProfile: 'Открыть профиль',
    remove: 'Убрать',
    openMap: 'Открыть на карте',
    favouritePlaces: 'Избранные места',
    likedProfessionals: 'Избранные специалисты',
    trustedChoice: 'Надёжный выбор',
    paymentMethods: 'Способы оплаты',
    paymentMethodsSub: 'Карты, PayPal и криптокошельки',
    bookingAccess: 'Доступ к бронированию',
    provider: 'Исполнитель',
    exactAddress: 'Точный адрес',
    providerPhone: 'Телефон',
    providerEmail: 'Email',
    routeLocked: 'Маршрут после оплаты',
    writeSeller: 'Написать мастеру',
    callSeller: 'Позвонить мастеру',
    routeToMaster: 'Маршрут к мастеру',
    hiddenUntilPaid:
      'Точный адрес, маршрут и прямой контакт доступны только после оплаты',
    detailsUnlocked: 'Доступ открыт',
    secureBooking: 'Безопасное бронирование',
    paymentProtected: 'Защищённые данные бронирования',

    popularSearchDogHotel: 'Отель для собак',
    popularSearchCarpetCleaning: 'Чистка ковров',
    popularSearchPhoneRepair: 'Ремонт телефона',
    popularSearchHairExtensions: 'Наращивание волос',
    popularSearchMassage: 'Массаж',
    popularSearchMovingHelp: 'Помощь с переездом',

    hotOffersNear: 'Горячие предложения рядом с',
    sponsored: 'Реклама',
    specialOfferNearYou: 'Специальное предложение рядом с вами',
    viewsLabel: 'Просмотры',
    viewAction: 'Открыть',
    bookAction: 'Бронь',
    fallbackServiceLabel: 'Услуга',

    dealsToday: 'Скидки сегодня',
    allDealsToday: 'Все скидки сегодня',
    bestPriceToday: 'Лучшая цена сегодня',
    todayDiscount: 'Скидка сегодня',
    hotOffer: 'Горячее предложение',
    discountToday: 'Скидка сегодня',
    activeToday: 'Активно сегодня',
    discountBadge: 'Скидка',
    freeFirstAd: 'Первая реклама бесплатно',
    freeFirstBooking: 'Первое бронирование бесплатно',
    freeFirstHotOffer: 'Первый hot offer бесплатно',
    welcomeFreeActions: 'Стартовые бесплатные действия',
    newUserBonusTitle: 'Первый запуск бесплатно',
    newUserBonusText:
      'Новый пользователь может бесплатно запустить первую рекламу, первое бронирование и первый hot offer.',
  },
  UA: {
    ...EN,
    searchPlaceholder: 'Пошук послуг, категорій, локацій або спеціалістів...',
    recentSearches: 'Нещодавні пошуки',
    popularSearches: 'Популярні запити',
    noResultsFound: 'Нічого не знайдено',
    smartMatches: 'Розумні збіги',
    categories: 'Категорії',
    services: 'Послуги',
    pros: 'Спеціалісти',
    listings: 'Оголошення',
    allLiked: 'Усе обране',
    available: 'Доступно',
    unavailable: 'Недоступно',
    verifiedPro: 'Перевірений спеціаліст',
    availableNow: 'Доступний зараз',
    unavailableToday: 'Сьогодні недоступний',
    from: 'Від',
    view: 'Відкрити',
    route: 'Маршрут',
    bookNow: 'Забронювати',
    more: 'Ще',
    save: 'Зберегти',
    search: 'Пошук',
    edit: 'Редагувати',
    add: 'Додати',
    close: 'Закрити',
    backToHome: 'На головну',
    published: 'Опубліковано',
    paid: 'Оплачено',
    uploadPhoto: 'Додати фото',
    uploadPhotos: 'Додати фото',
    chooseCategory: 'Обрати категорію',
    chooseSubcategory: 'Обрати підкатегорію',
    payAd: 'Оплатити рекламу',
    payDeal: 'Оплатити знижку',
    payNow: 'Оплатити',
    openProfile: 'Відкрити профіль',
    remove: 'Прибрати',
    openMap: 'Відкрити на карті',
    favouritePlaces: 'Улюблені місця',
    likedProfessionals: 'Улюблені спеціалісти',
    trustedChoice: 'Надійний вибір',
    sponsored: 'Реклама',
    viewAction: 'Відкрити',
    bookAction: 'Бронь',
  },
  CZ: {
    ...EN,
    searchPlaceholder: 'Hledat služby, kategorie, lokality nebo profesionály...',
    recentSearches: 'Nedávná hledání',
    popularSearches: 'Populární hledání',
    noResultsFound: 'Nic nenalezeno',
    smartMatches: 'Chytré shody',
    categories: 'Kategorie',
    services: 'Služby',
    pros: 'Profesionálové',
    listings: 'Inzeráty',
    allLiked: 'Vše oblíbené',
    available: 'Dostupné',
    unavailable: 'Nedostupné',
    verifiedPro: 'Ověřený specialista',
    availableNow: 'Dostupný nyní',
    unavailableToday: 'Dnes nedostupný',
    view: 'Otevřít',
    route: 'Trasa',
    bookNow: 'Rezervovat',
    more: 'Více',
    save: 'Uložit',
    search: 'Hledat',
    edit: 'Upravit',
    add: 'Přidat',
    close: 'Zavřít',
    backToHome: 'Domů',
    published: 'Publikováno',
    paid: 'Zaplaceno',
    uploadPhoto: 'Nahrát fotku',
    uploadPhotos: 'Nahrát fotky',
    chooseCategory: 'Vybrat kategorii',
    chooseSubcategory: 'Vybrat podkategorii',
    payAd: 'Zaplatit reklamu',
    payDeal: 'Zaplatit slevu',
    payNow: 'Zaplatit',
    openProfile: 'Otevřít profil',
    remove: 'Odebrat',
    openMap: 'Otevřít na mapě',
    favouritePlaces: 'Oblíbená místa',
    likedProfessionals: 'Oblíbení specialisté',
    trustedChoice: 'Důvěryhodná volba',
    sponsored: 'Reklama',
    viewAction: 'Otevřít',
    bookAction: 'Rezervovat',
  },
  DE: {
    ...EN,
    searchPlaceholder: 'Dienstleistungen, Kategorien, Orte oder Profis suchen...',
    recentSearches: 'Letzte Suchen',
    popularSearches: 'Beliebte Suchen',
    noResultsFound: 'Keine Ergebnisse gefunden',
    smartMatches: 'Intelligente Treffer',
    categories: 'Kategorien',
    services: 'Dienstleistungen',
    pros: 'Profis',
    listings: 'Anzeigen',
    allLiked: 'Alle Favoriten',
    available: 'Verfügbar',
    unavailable: 'Nicht verfügbar',
    verifiedPro: 'Verifizierter Profi',
    availableNow: 'Jetzt verfügbar',
    unavailableToday: 'Heute nicht verfügbar',
    view: 'Öffnen',
    route: 'Route',
    bookNow: 'Jetzt buchen',
    more: 'Mehr',
    save: 'Speichern',
    search: 'Suchen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    close: 'Schließen',
    backToHome: 'Zur Startseite',
    published: 'Veröffentlicht',
    paid: 'Bezahlt',
    uploadPhoto: 'Foto hochladen',
    uploadPhotos: 'Fotos hochladen',
    chooseCategory: 'Kategorie wählen',
    chooseSubcategory: 'Unterkategorie wählen',
    payAd: 'Anzeige bezahlen',
    payDeal: 'Rabatt bezahlen',
    payNow: 'Jetzt bezahlen',
    openProfile: 'Profil öffnen',
    remove: 'Entfernen',
    openMap: 'Auf Karte öffnen',
    favouritePlaces: 'Lieblingsorte',
    likedProfessionals: 'Favorisierte Profis',
    trustedChoice: 'Vertrauenswürdige Wahl',
    sponsored: 'Werbung',
    viewAction: 'Öffnen',
    bookAction: 'Buchen',
  },
  IT: {
    ...EN,
    save: 'Salva',
    search: 'Cerca',
    edit: 'Modifica',
    add: 'Aggiungi',
    close: 'Chiudi',
    backToHome: 'Home',
    published: 'Pubblicato',
    paid: 'Pagato',
    uploadPhoto: 'Carica foto',
    uploadPhotos: 'Carica foto',
    chooseCategory: 'Scegli categoria',
    chooseSubcategory: 'Scegli sottocategoria',
    payAd: 'Paga pubblicità',
    payDeal: 'Paga sconto',
    payNow: 'Paga ora',
    openProfile: 'Apri profilo',
    remove: 'Rimuovi',
    openMap: 'Apri sulla mappa',
    sponsored: 'Pubblicità',
    viewAction: 'Apri',
    bookAction: 'Prenota',
  },
  FR: {
    ...EN,
    save: 'Enregistrer',
    search: 'Rechercher',
    edit: 'Modifier',
    add: 'Ajouter',
    close: 'Fermer',
    backToHome: 'Accueil',
    published: 'Publié',
    paid: 'Payé',
    uploadPhoto: 'Ajouter photo',
    uploadPhotos: 'Ajouter photos',
    chooseCategory: 'Choisir catégorie',
    chooseSubcategory: 'Choisir sous-catégorie',
    payAd: 'Payer la pub',
    payDeal: 'Payer la réduction',
    payNow: 'Payer maintenant',
    openProfile: 'Ouvrir profil',
    remove: 'Supprimer',
    openMap: 'Ouvrir sur la carte',
    sponsored: 'Publicité',
    viewAction: 'Ouvrir',
    bookAction: 'Réserver',
  },
  AR: {
    ...EN,
    save: 'حفظ',
    search: 'بحث',
    edit: 'تعديل',
    add: 'إضافة',
    close: 'إغلاق',
    backToHome: 'الرئيسية',
    published: 'تم النشر',
    paid: 'تم الدفع',
    uploadPhoto: 'إضافة صورة',
    uploadPhotos: 'إضافة صور',
    chooseCategory: 'اختر الفئة',
    chooseSubcategory: 'اختر الفئة الفرعية',
    payAd: 'ادفع الإعلان',
    payDeal: 'ادفع الخصم',
    payNow: 'ادفع الآن',
    openProfile: 'افتح الملف',
    remove: 'إزالة',
    openMap: 'افتح على الخريطة',
    sponsored: 'إعلان',
    viewAction: 'فتح',
    bookAction: 'احجز',
  },
  PL: {
    ...EN,
    searchPlaceholder: 'Szukaj usług, kategorii, lokalizacji lub specjalistów...',
    recentSearches: 'Ostatnie wyszukiwania',
    popularSearches: 'Popularne wyszukiwania',
    noResultsFound: 'Nic nie znaleziono',
    smartMatches: 'Inteligentne dopasowania',
    categories: 'Kategorie',
    services: 'Usługi',
    pros: 'Specjaliści',
    listings: 'Ogłoszenia',
    allLiked: 'Wszystkie ulubione',
    available: 'Dostępne',
    unavailable: 'Niedostępne',
    verifiedPro: 'Zweryfikowany specjalista',
    availableNow: 'Dostępny teraz',
    unavailableToday: 'Dziś niedostępny',
    view: 'Otwórz',
    route: 'Trasa',
    bookNow: 'Zarezerwuj',
    more: 'Więcej',
    save: 'Zapisz',
    search: 'Szukaj',
    edit: 'Edytuj',
    add: 'Dodaj',
    close: 'Zamknij',
    backToHome: 'Do strony głównej',
    published: 'Opublikowano',
    paid: 'Opłacono',
    uploadPhoto: 'Dodaj zdjęcie',
    uploadPhotos: 'Dodaj zdjęcia',
    chooseCategory: 'Wybierz kategorię',
    chooseSubcategory: 'Wybierz podkategorię',
    payAd: 'Opłać reklamę',
    payDeal: 'Opłać zniżkę',
    payNow: 'Zapłać teraz',
    openProfile: 'Otwórz profil',
    remove: 'Usuń',
    openMap: 'Otwórz na mapie',
    favouritePlaces: 'Ulubione miejsca',
    likedProfessionals: 'Ulubieni specjaliści',
    trustedChoice: 'Zaufany wybór',
    sponsored: 'Reklama',
    viewAction: 'Otwórz',
    bookAction: 'Rezerwuj',
  },
};

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return APP_LANGUAGES.includes((value || '') as AppLanguage);
}

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (isAppLanguage(saved)) return saved;

  return 'EN';
}

export function saveLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent(LANGUAGE_CHANGE_EVENT, {
      detail: { language },
    })
  );
}

export function subscribeToLanguageChange(callback: (language: AppLanguage) => void) {
  if (typeof window === 'undefined') return () => {};

  const handleCustomLanguageChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ language?: AppLanguage }>;
    const nextLanguage = customEvent.detail?.language;

    if (nextLanguage && isAppLanguage(nextLanguage)) {
      callback(nextLanguage);
      return;
    }

    callback(getSavedLanguage());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    callback(getSavedLanguage());
  };

  window.addEventListener(LANGUAGE_CHANGE_EVENT, handleCustomLanguageChange as EventListener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(
      LANGUAGE_CHANGE_EVENT,
      handleCustomLanguageChange as EventListener
    );
    window.removeEventListener('storage', handleStorage);
  };
}

export function t(language: AppLanguage) {
  return translations[language] || translations.EN;
}
