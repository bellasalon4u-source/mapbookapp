export type AppLanguage = 'EN' | 'RU' | 'UA';

const STORAGE_KEY = 'mapbook_language';

export const translations = {
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
    mapStyle: 'Map style',
    myLocation: 'My location',
    clearSelection: 'Clear selection',
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
    cash: 'Cash',
    card: 'Card',
    wallet: 'Wallet',
  },
  RU: {
    searchPlaceholder: 'Поиск услуг, категорий или специалистов...',
    recentSearches: 'Недавние поиски',
    popularSearches: 'Популярные запросы',
    noResultsFound: 'Ничего не найдено',
    smartMatches: 'Умные совпадения',
    categories: 'Категории',
    services: 'Услуги',
    pros: 'Специалисты',
    listings: 'Объявления',
    allLiked: 'Все избранные',
    prosAvailableNow: 'специалистов онлайн',
    mapStyle: 'Стиль карты',
    myLocation: 'Моё местоположение',
    clearSelection: 'Сбросить выбор',
    available: 'Доступен',
    unavailable: 'Недоступен',
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
  },
  UA: {
    searchPlaceholder: 'Пошук послуг, категорій або спеціалістів...',
    recentSearches: 'Останні пошуки',
    popularSearches: 'Популярні запити',
    noResultsFound: 'Нічого не знайдено',
    smartMatches: 'Розумні збіги',
    categories: 'Категорії',
    services: 'Послуги',
    pros: 'Спеціалісти',
    listings: 'Оголошення',
    allLiked: 'Усі обрані',
    prosAvailableNow: 'спеціалістів онлайн',
    mapStyle: 'Стиль мапи',
    myLocation: 'Моє місцезнаходження',
    clearSelection: 'Скинути вибір',
    available: 'Доступний',
    unavailable: 'Недоступний',
    verifiedPro: 'Перевірений спеціаліст',
    availableNow: 'Доступний зараз',
    unavailableToday: 'Сьогодні недоступний',
    from: 'Від',
    view: 'Відкрити',
    route: 'Маршрут',
    bookNow: 'Забронювати',
    popularServices: 'Популярні послуги',
    cash: 'Готівка',
    card: 'Картка',
    wallet: 'Гаманець',
  },
} as const;

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'EN' || saved === 'RU' || saved === 'UA') return saved;

  return 'EN';
}

export function saveLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, language);
}

export function t(language: AppLanguage) {
  return translations[language] || translations.EN;
}
