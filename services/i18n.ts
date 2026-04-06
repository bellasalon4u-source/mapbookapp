export type AppLanguage = 'EN' | 'UA' | 'RU';

type TranslationMap = {
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
  chooseCategoryAndSubcategory: string;
  allCategories: string;
  extraCategories: string;
  cash: string;
  card: string;
  wallet: string;
  mapStyle: string;
  myLocation: string;
  clearSelection: string;

  beauty: string;
  barber: string;
  wellness: string;
  home: string;
  repairs: string;
  tech: string;
  pets: string;
  fashion: string;
  auto: string;
  moving: string;
  fitness: string;
  education: string;
  events: string;
  activities: string;
  creative: string;
};

const translations: Record<AppLanguage, TranslationMap> = {
  EN: {
    searchPlaceholder: 'Search services, categories or professionals...',
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
    available: 'Available',
    unavailable: 'Unavailable',
    verifiedPro: 'Verified Pro',
    availableNow: 'Available now',
    unavailableToday: 'Unavailable today',
    from: 'From',
    view: 'View',
    route: 'Route',
    bookNow: 'Book now',
    popularServices: 'Popular Services',
    chooseCategoryAndSubcategory: 'Choose category and subcategory',
    allCategories: 'All categories',
    extraCategories: 'Extra categories',
    cash: 'Cash',
    card: 'Card',
    wallet: 'Wallet',
    mapStyle: 'Map style',
    myLocation: 'My location',
    clearSelection: 'Clear selection',

    beauty: 'Beauty',
    barber: 'Barber',
    wellness: 'Wellness',
    home: 'Home',
    repairs: 'Repairs',
    tech: 'Tech',
    pets: 'Pets',
    fashion: 'Fashion',
    auto: 'Auto',
    moving: 'Moving',
    fitness: 'Fitness',
    education: 'Education',
    events: 'Events',
    activities: 'Activities',
    creative: 'Creative',
  },

  UA: {
    searchPlaceholder: 'Пошук послуг, категорій або спеціалістів...',
    recentSearches: 'Останні пошуки',
    popularSearches: 'Популярні пошуки',
    noResultsFound: 'Нічого не знайдено',
    smartMatches: 'Розумні збіги',
    categories: 'Категорії',
    services: 'Послуги',
    pros: 'Спеціалісти',
    listings: 'Оголошення',
    allLiked: 'Усі вподобані',
    prosAvailableNow: 'спеціалістів доступно зараз',
    available: 'Доступний',
    unavailable: 'Недоступний',
    verifiedPro: 'Перевірений спеціаліст',
    availableNow: 'Доступний зараз',
    unavailableToday: 'Сьогодні недоступний',
    from: 'Від',
    view: 'Перегляд',
    route: 'Маршрут',
    bookNow: 'Забронювати',
    popularServices: 'Популярні послуги',
    chooseCategoryAndSubcategory: 'Оберіть категорію та підкатегорію',
    allCategories: 'Усі категорії',
    extraCategories: 'Додаткові категорії',
    cash: 'Готівка',
    card: 'Картка',
    wallet: 'Гаманець',
    mapStyle: 'Стиль мапи',
    myLocation: 'Моє місцезнаходження',
    clearSelection: 'Скинути вибір',

    beauty: 'Краса',
    barber: 'Барбер',
    wellness: 'Велнес',
    home: 'Дім',
    repairs: 'Ремонт',
    tech: 'Техніка',
    pets: 'Тварини',
    fashion: 'Мода',
    auto: 'Авто',
    moving: 'Переїзд',
    fitness: 'Фітнес',
    education: 'Освіта',
    events: 'Події',
    activities: 'Активності',
    creative: 'Креатив',
  },

  RU: {
    searchPlaceholder: 'Поиск услуг, категорий или специалистов...',
    recentSearches: 'Недавние поиски',
    popularSearches: 'Популярные поиски',
    noResultsFound: 'Ничего не найдено',
    smartMatches: 'Умные совпадения',
    categories: 'Категории',
    services: 'Услуги',
    pros: 'Специалисты',
    listings: 'Объявления',
    allLiked: 'Все избранные',
    prosAvailableNow: 'специалистов доступно сейчас',
    available: 'Доступен',
    unavailable: 'Недоступен',
    verifiedPro: 'Проверенный специалист',
    availableNow: 'Доступен сейчас',
    unavailableToday: 'Сегодня недоступен',
    from: 'От',
    view: 'Смотреть',
    route: 'Маршрут',
    bookNow: 'Забронировать',
    popularServices: 'Популярные услуги',
    chooseCategoryAndSubcategory: 'Выберите категорию и подкатегорию',
    allCategories: 'Все категории',
    extraCategories: 'Дополнительные категории',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Кошелёк',
    mapStyle: 'Стиль карты',
    myLocation: 'Моё местоположение',
    clearSelection: 'Сбросить выбор',

    beauty: 'Красота',
    barber: 'Барбер',
    wellness: 'Велнес',
    home: 'Дом',
    repairs: 'Ремонт',
    tech: 'Техника',
    pets: 'Животные',
    fashion: 'Мода',
    auto: 'Авто',
    moving: 'Переезд',
    fitness: 'Фитнес',
    education: 'Обучение',
    events: 'События',
    activities: 'Активности',
    creative: 'Креатив',
  },
};

export function t(language: AppLanguage) {
  return translations[language] || translations.EN;
}

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem('mapbook_language');
  if (saved === 'EN' || saved === 'UA' || saved === 'RU') return saved;

  return 'EN';
}

export function saveLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('mapbook_language', language);
}
