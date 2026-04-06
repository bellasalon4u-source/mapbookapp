export type AppLanguage = 'EN' | 'ES' | 'RU' | 'CZ' | 'DE' | 'PL';

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
    allCategories: 'All categories',
    chooseCategoryAndSubcategory: 'Choose category and subcategory',
    extraCategories: 'Extra categories',
    more: 'More'
  },

  ES: {
    searchPlaceholder: 'Buscar servicios, categorías o profesionales...',
    recentSearches: 'Búsquedas recientes',
    popularSearches: 'Búsquedas populares',
    noResultsFound: 'No se han encontrado resultados',
    smartMatches: 'Coincidencias inteligentes',
    categories: 'Categorías',
    services: 'Servicios',
    pros: 'Profesionales',
    listings: 'Anuncios',
    allLiked: 'Todos los favoritos',
    prosAvailableNow: 'profesionales disponibles ahora',
    mapStyle: 'Estilo del mapa',
    myLocation: 'Mi ubicación',
    clearSelection: 'Borrar selección',
    available: 'Disponible',
    unavailable: 'No disponible',
    verifiedPro: 'Profesional verificado',
    availableNow: 'Disponible ahora',
    unavailableToday: 'No disponible hoy',
    from: 'Desde',
    view: 'Ver',
    route: 'Ruta',
    bookNow: 'Reservar ahora',
    popularServices: 'Servicios populares',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Billetera',
    allCategories: 'Todas las categorías',
    chooseCategoryAndSubcategory: 'Elige categoría y subcategoría',
    extraCategories: 'Categorías extra',
    more: 'Más'
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
    allCategories: 'Все категории',
    chooseCategoryAndSubcategory: 'Выберите категорию и подкатегорию',
    extraCategories: 'Дополнительные категории',
    more: 'Ещё'
  },

  CZ: {
    searchPlaceholder: 'Hledat služby, kategorie nebo profesionály...',
    recentSearches: 'Nedávná hledání',
    popularSearches: 'Populární hledání',
    noResultsFound: 'Nic nenalezeno',
    smartMatches: 'Chytré shody',
    categories: 'Kategorie',
    services: 'Služby',
    pros: 'Profesionálové',
    listings: 'Inzeráty',
    allLiked: 'Vše oblíbené',
    prosAvailableNow: 'profesionálů dostupných nyní',
    mapStyle: 'Styl mapy',
    myLocation: 'Moje poloha',
    clearSelection: 'Vymazat výběr',
    available: 'Dostupný',
    unavailable: 'Nedostupný',
    verifiedPro: 'Ověřený profesionál',
    availableNow: 'Dostupný nyní',
    unavailableToday: 'Dnes nedostupný',
    from: 'Od',
    view: 'Zobrazit',
    route: 'Trasa',
    bookNow: 'Rezervovat',
    popularServices: 'Populární služby',
    cash: 'Hotovost',
    card: 'Karta',
    wallet: 'Peněženka',
    allCategories: 'Všechny kategorie',
    chooseCategoryAndSubcategory: 'Vyberte kategorii a podkategorii',
    extraCategories: 'Další kategorie',
    more: 'Více'
  },

  DE: {
    searchPlaceholder: 'Dienstleistungen, Kategorien oder Profis suchen...',
    recentSearches: 'Letzte Suchen',
    popularSearches: 'Beliebte Suchen',
    noResultsFound: 'Keine Ergebnisse gefunden',
    smartMatches: 'Intelligente Treffer',
    categories: 'Kategorien',
    services: 'Dienstleistungen',
    pros: 'Profis',
    listings: 'Anzeigen',
    allLiked: 'Alle Favoriten',
    prosAvailableNow: 'Profis jetzt verfügbar',
    mapStyle: 'Kartenstil',
    myLocation: 'Mein Standort',
    clearSelection: 'Auswahl löschen',
    available: 'Verfügbar',
    unavailable: 'Nicht verfügbar',
    verifiedPro: 'Verifizierter Profi',
    availableNow: 'Jetzt verfügbar',
    unavailableToday: 'Heute nicht verfügbar',
    from: 'Ab',
    view: 'Ansehen',
    route: 'Route',
    bookNow: 'Jetzt buchen',
    popularServices: 'Beliebte Dienstleistungen',
    cash: 'Bar',
    card: 'Karte',
    wallet: 'Wallet',
    allCategories: 'Alle Kategorien',
    chooseCategoryAndSubcategory: 'Kategorie und Unterkategorie wählen',
    extraCategories: 'Weitere Kategorien',
    more: 'Mehr'
  },

  PL: {
    searchPlaceholder: 'Szukaj usług, kategorii lub specjalistów...',
    recentSearches: 'Ostatnie wyszukiwania',
    popularSearches: 'Popularne wyszukiwania',
    noResultsFound: 'Nic nie znaleziono',
    smartMatches: 'Inteligentne dopasowania',
    categories: 'Kategorie',
    services: 'Usługi',
    pros: 'Specjaliści',
    listings: 'Ogłoszenia',
    allLiked: 'Wszystkie ulubione',
    prosAvailableNow: 'specjalistów dostępnych teraz',
    mapStyle: 'Styl mapy',
    myLocation: 'Moja lokalizacja',
    clearSelection: 'Wyczyść wybór',
    available: 'Dostępny',
    unavailable: 'Niedostępny',
    verifiedPro: 'Zweryfikowany specjalista',
    availableNow: 'Dostępny teraz',
    unavailableToday: 'Dziś niedostępny',
    from: 'Od',
    view: 'Zobacz',
    route: 'Trasa',
    bookNow: 'Zarezerwuj',
    popularServices: 'Popularne usługi',
    cash: 'Gotówka',
    card: 'Karta',
    wallet: 'Portfel',
    allCategories: 'Wszystkie kategorie',
    chooseCategoryAndSubcategory: 'Wybierz kategorię i podkategorię',
    extraCategories: 'Dodatkowe kategorie',
    more: 'Więcej'
  }
} as const;

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (
    saved === 'EN' ||
    saved === 'ES' ||
    saved === 'RU' ||
    saved === 'CZ' ||
    saved === 'DE' ||
    saved === 'PL'
  ) {
    return saved;
  }

  return 'EN';
}

export function saveLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, language);
}

export function t(language: AppLanguage) {
  return translations[language] || translations.EN;
}
