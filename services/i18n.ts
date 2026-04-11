export const APP_LANGUAGES = ['EN', 'ES', 'RU', 'CZ', 'DE', 'PL'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

const STORAGE_KEY = 'mapbook_language';
export const LANGUAGE_CHANGE_EVENT = 'mapbook:language-change';

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
    more: 'More',
    selectedLanguage: 'Selected language',
    textMustMatchLanguage: 'The text must match the selected language.',
    clearField: 'Clear field',
    next: 'Next',
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
    more: 'Más',
    selectedLanguage: 'Idioma seleccionado',
    textMustMatchLanguage: 'El texto debe coincidir con el idioma seleccionado.',
    clearField: 'Borrar campo',
    next: 'Siguiente',
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
    more: 'Ещё',
    selectedLanguage: 'Выбранный язык',
    textMustMatchLanguage: 'Текст должен соответствовать выбранному языку.',
    clearField: 'Очистить поле',
    next: 'Далее',
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
    more: 'Více',
    selectedLanguage: 'Vybraný jazyk',
    textMustMatchLanguage: 'Text musí odpovídat zvolenému jazyku.',
    clearField: 'Vymazat pole',
    next: 'Další',
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
    more: 'Mehr',
    selectedLanguage: 'Ausgewählte Sprache',
    textMustMatchLanguage: 'Der Text muss zur ausgewählten Sprache passen.',
    clearField: 'Feld leeren',
    next: 'Weiter',
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
    more: 'Więcej',
    selectedLanguage: 'Wybrany język',
    textMustMatchLanguage: 'Tekst musi odpowiadać wybranemu językowi.',
    clearField: 'Wyczyść pole',
    next: 'Dalej',
  },
} as const;

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return APP_LANGUAGES.includes((value || '') as AppLanguage);
}

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'EN';

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (isAppLanguage(saved)) {
    return saved;
  }

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
  if (typeof window === 'undefined') {
    return () => {};
  }

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
