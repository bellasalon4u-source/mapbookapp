export type AppLanguage = 'EN' | 'RU' | 'UA';

export const LANGUAGE_STORAGE_KEY = 'mapbook_language';

export const translations = {
  EN: {
    searchPlaceholder: 'Search services, categories or professionals...',
    popularServices: 'Popular Services',
    allLiked: 'All liked',
    prosAvailableNow: 'pros available now',
    available: 'Available',
    unavailable: 'Unavailable',
    availableNow: 'Available now',
    unavailableToday: 'Unavailable today',
    verifiedPro: 'Verified Pro',
    from: 'From',
    view: 'View',
    route: 'Route',
    bookNow: 'Book now',
    categories: 'Categories',
    services: 'Services',
    pros: 'Pros',
    listings: 'Listings',
    smartMatches: 'Smart matches',
    recentSearches: 'Recent searches',
    popularSearches: 'Popular searches',
    noResultsFound: 'No results found',
    chooseCategoryAndSubcategory: 'Choose category and subcategory',
    allCategories: 'All categories',
    extraCategories: 'Extra categories',
    cash: 'Cash',
    card: 'Card',
    wallet: 'Wallet',
    mapStyle: 'Map style',
    myLocation: 'My location',
    clearSelection: 'Clear selection',
  },
  RU: {
    searchPlaceholder: 'Поиск услуг, категорий или специалистов...',
    popularServices: 'Популярные услуги',
    allLiked: 'Все избранные',
    prosAvailableNow: 'специалистов сейчас онлайн',
    available: 'Доступен',
    unavailable: 'Недоступен',
    availableNow: 'Сейчас доступен',
    unavailableToday: 'Сегодня недоступен',
    verifiedPro: 'Проверенный специалист',
    from: 'От',
    view: 'Открыть',
    route: 'Маршрут',
    bookNow: 'Записаться',
    categories: 'Категории',
    services: 'Услуги',
    pros: 'Специалисты',
    listings: 'Объявления',
    smartMatches: 'Умные совпадения',
    recentSearches: 'Недавние поиски',
    popularSearches: 'Популярные запросы',
    noResultsFound: 'Ничего не найдено',
    chooseCategoryAndSubcategory: 'Выберите категорию и подкатегорию',
    allCategories: 'Все категории',
    extraCategories: 'Дополнительные категории',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Кошелёк',
    mapStyle: 'Стиль карты',
    myLocation: 'Моё местоположение',
    clearSelection: 'Сбросить выбор',
  },
  UA: {
    searchPlaceholder: 'Пошук послуг, категорій або спеціалістів...',
    popularServices: 'Популярні послуги',
    allLiked: 'Усе вибране',
    prosAvailableNow: 'спеціалістів зараз онлайн',
    available: 'Доступний',
    unavailable: 'Недоступний',
    availableNow: 'Зараз доступний',
    unavailableToday: 'Сьогодні недоступний',
    verifiedPro: 'Перевірений спеціаліст',
    from: 'Від',
    view: 'Відкрити',
    route: 'Маршрут',
    bookNow: 'Записатися',
    categories: 'Категорії',
    services: 'Послуги',
    pros: 'Спеціалісти',
    listings: 'Оголошення',
    smartMatches: 'Розумні збіги',
    recentSearches: 'Нещодавні пошуки',
    popularSearches: 'Популярні запити',
    noResultsFound: 'Нічого не знайдено',
    chooseCategoryAndSubcategory: 'Оберіть категорію та підкатегорію',
    allCategories: 'Усі категорії',
    extraCategories: 'Додаткові категорії',
    cash: 'Готівка',
    card: 'Картка',
    wallet: 'Гаманець',
    mapStyle: 'Стиль мапи',
    myLocation: 'Моє місцезнаходження',
    clearSelection: 'Скинути вибір',
  },
} as const;

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'EN' || saved === 'RU' || saved === 'UA') return saved;

  return 'EN';
}

export function saveLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function t(language: AppLanguage) {
  return translations[language] || translations.EN;
}
