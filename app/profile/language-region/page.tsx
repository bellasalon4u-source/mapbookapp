'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getAppRegionSettings,
  updateAppRegionSettings,
  type AppCurrency,
  type SearchLocationMode,
} from '../../../services/appRegionStore';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

type StoredLocation = {
  source: 'current' | 'custom';
  label: string;
  lat: number | null;
  lng: number | null;
};

type PageTextShape = {
  title: string;
  subtitle: string;
  save: string;
  saveBottom: string;
  languageSection: string;
  regionSection: string;
  currencySection: string;
  locationSection: string;
  useCurrentLocation: string;
  currentLocationHint: string;
  useRegionLocation: string;
  regionLocationHint: string;
  locationLoading: string;
  locationSuccess: string;
  locationError: string;
  saved: string;
  selected: string;
  languageApp: string;
  overview: string;
  livePreview: string;
  compactSetup: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
  londonEurope: string;
  madridEurope: string;
  pragueEurope: string;
  berlinEurope: string;
  warsawEurope: string;
  kyivEurope: string;
  newYorkNA: string;
  dubaiME: string;
  romeEurope: string;
  parisEurope: string;
};

type RegionOption = {
  value: string;
  label: string;
  subtitle: string;
  flag: string;
  lat: number;
  lng: number;
  currency: AppCurrency;
};

type CurrencyOption = {
  value: AppCurrency;
  symbol: string;
  title: string;
  subtitle: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Language & region',
    subtitle: 'App language, country, currency and location mode',
    save: 'Save',
    saveBottom: 'Save settings',
    languageSection: 'Languages available in app',
    regionSection: 'Countries / regions',
    currencySection: 'Currency',
    locationSection: 'Location',
    useCurrentLocation: 'Use current location',
    currentLocationHint: 'Use your device GPS for search and map results',
    useRegionLocation: 'Use selected region',
    regionLocationHint: 'Search near the selected country or region center',
    locationLoading: 'Getting current location...',
    locationSuccess: 'Current location selected',
    locationError: 'Unable to get current location',
    saved: 'Settings saved',
    selected: 'Selected',
    languageApp: 'App language',
    overview: 'Current setup',
    livePreview: 'Live preview',
    compactSetup: 'Quick summary',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
    londonEurope: 'London · Europe',
    madridEurope: 'Madrid · Europe',
    pragueEurope: 'Prague · Europe',
    berlinEurope: 'Berlin · Europe',
    warsawEurope: 'Warsaw · Europe',
    kyivEurope: 'Kyiv · Europe',
    newYorkNA: 'New York · North America',
    dubaiME: 'Dubai · Middle East',
    romeEurope: 'Rome · Europe',
    parisEurope: 'Paris · Europe',
  },
  ES: {
    title: 'Idioma y región',
    subtitle: 'Idioma de la app, país, moneda y modo de ubicación',
    save: 'Guardar',
    saveBottom: 'Guardar ajustes',
    languageSection: 'Idiomas disponibles en la app',
    regionSection: 'Países / regiones',
    currencySection: 'Moneda',
    locationSection: 'Ubicación',
    useCurrentLocation: 'Usar ubicación actual',
    currentLocationHint: 'Usa el GPS del dispositivo para búsqueda y mapa',
    useRegionLocation: 'Usar región seleccionada',
    regionLocationHint: 'Buscar cerca del centro del país o región seleccionados',
    locationLoading: 'Obteniendo ubicación actual...',
    locationSuccess: 'Ubicación actual seleccionada',
    locationError: 'No se pudo obtener la ubicación',
    saved: 'Ajustes guardados',
    selected: 'Seleccionado',
    languageApp: 'Idioma de la app',
    overview: 'Configuración actual',
    livePreview: 'Vista previa',
    compactSetup: 'Resumen rápido',
    britishPound: 'Libra esterlina',
    euro: 'Euro',
    usDollar: 'Dólar estadounidense',
    polishZloty: 'Zloty polaco',
    czechKoruna: 'Corona checa',
    ukrainianHryvnia: 'Grivna ucraniana',
    uaeDirham: 'Dirham de EAU',
    londonEurope: 'Londres · Europa',
    madridEurope: 'Madrid · Europa',
    pragueEurope: 'Praga · Europa',
    berlinEurope: 'Berlín · Europa',
    warsawEurope: 'Varsovia · Europa',
    kyivEurope: 'Kyiv · Europa',
    newYorkNA: 'Nueva York · Norteamérica',
    dubaiME: 'Dubái · Oriente Medio',
    romeEurope: 'Roma · Europa',
    parisEurope: 'París · Europa',
  },
  RU: {
    title: 'Язык и регион',
    subtitle: 'Язык приложения, страна, валюта и режим локации',
    save: 'Сохранить',
    saveBottom: 'Сохранить настройки',
    languageSection: 'Языки приложения',
    regionSection: 'Страны / регионы',
    currencySection: 'Валюта',
    locationSection: 'Локация',
    useCurrentLocation: 'Использовать текущую локацию',
    currentLocationHint: 'Использовать GPS телефона для поиска и карты',
    useRegionLocation: 'Использовать выбранный регион',
    regionLocationHint: 'Искать рядом с центром выбранной страны или региона',
    locationLoading: 'Определяем текущую локацию...',
    locationSuccess: 'Текущая локация выбрана',
    locationError: 'Не удалось определить локацию',
    saved: 'Настройки сохранены',
    selected: 'Выбрано',
    languageApp: 'Язык приложения',
    overview: 'Текущая конфигурация',
    livePreview: 'Предпросмотр',
    compactSetup: 'Краткая сводка',
    britishPound: 'Британский фунт',
    euro: 'Евро',
    usDollar: 'Доллар США',
    polishZloty: 'Польский злотый',
    czechKoruna: 'Чешская крона',
    ukrainianHryvnia: 'Украинская гривна',
    uaeDirham: 'Дирхам ОАЭ',
    londonEurope: 'Лондон · Европа',
    madridEurope: 'Мадрид · Европа',
    pragueEurope: 'Прага · Европа',
    berlinEurope: 'Берлин · Европа',
    warsawEurope: 'Варшава · Европа',
    kyivEurope: 'Киев · Европа',
    newYorkNA: 'Нью-Йорк · Северная Америка',
    dubaiME: 'Дубай · Ближний Восток',
    romeEurope: 'Рим · Европа',
    parisEurope: 'Париж · Европа',
  },
  UA: {
    title: 'Мова і регіон',
    subtitle: 'Мова застосунку, країна, валюта та режим локації',
    save: 'Зберегти',
    saveBottom: 'Зберегти налаштування',
    languageSection: 'Мови застосунку',
    regionSection: 'Країни / регіони',
    currencySection: 'Валюта',
    locationSection: 'Локація',
    useCurrentLocation: 'Використовувати поточну локацію',
    currentLocationHint: 'Використовувати GPS телефону для пошуку та карти',
    useRegionLocation: 'Використовувати вибраний регіон',
    regionLocationHint: 'Шукати поруч із центром вибраної країни або регіону',
    locationLoading: 'Визначаємо поточну локацію...',
    locationSuccess: 'Поточну локацію вибрано',
    locationError: 'Не вдалося визначити локацію',
    saved: 'Налаштування збережено',
    selected: 'Вибрано',
    languageApp: 'Мова застосунку',
    overview: 'Поточна конфігурація',
    livePreview: 'Попередній перегляд',
    compactSetup: 'Короткий підсумок',
    britishPound: 'Британський фунт',
    euro: 'Євро',
    usDollar: 'Долар США',
    polishZloty: 'Польський злотий',
    czechKoruna: 'Чеська крона',
    ukrainianHryvnia: 'Українська гривня',
    uaeDirham: 'Дирхам ОАЕ',
    londonEurope: 'Лондон · Європа',
    madridEurope: 'Мадрид · Європа',
    pragueEurope: 'Прага · Європа',
    berlinEurope: 'Берлін · Європа',
    warsawEurope: 'Варшава · Європа',
    kyivEurope: 'Київ · Європа',
    newYorkNA: 'Нью-Йорк · Північна Америка',
    dubaiME: 'Дубай · Близький Схід',
    romeEurope: 'Рим · Європа',
    parisEurope: 'Париж · Європа',
  },
  CZ: {
    title: 'Jazyk a region',
    subtitle: 'Jazyk aplikace, země, měna a režim polohy',
    save: 'Uložit',
    saveBottom: 'Uložit nastavení',
    languageSection: 'Jazyky aplikace',
    regionSection: 'Země / regiony',
    currencySection: 'Měna',
    locationSection: 'Poloha',
    useCurrentLocation: 'Použít aktuální polohu',
    currentLocationHint: 'Použít GPS zařízení pro hledání a mapu',
    useRegionLocation: 'Použít vybraný region',
    regionLocationHint: 'Hledat poblíž středu vybrané země nebo regionu',
    locationLoading: 'Zjišťuji aktuální polohu...',
    locationSuccess: 'Aktuální poloha vybrána',
    locationError: 'Nepodařilo se zjistit polohu',
    saved: 'Nastavení uloženo',
    selected: 'Vybráno',
    languageApp: 'Jazyk aplikace',
    overview: 'Aktuální nastavení',
    livePreview: 'Náhled',
    compactSetup: 'Rychlý přehled',
    britishPound: 'Britská libra',
    euro: 'Euro',
    usDollar: 'Americký dolar',
    polishZloty: 'Polský zlotý',
    czechKoruna: 'Česká koruna',
    ukrainianHryvnia: 'Ukrajinská hřivna',
    uaeDirham: 'Dirham SAE',
    londonEurope: 'Londýn · Evropa',
    madridEurope: 'Madrid · Evropa',
    pragueEurope: 'Praha · Evropa',
    berlinEurope: 'Berlín · Evropa',
    warsawEurope: 'Varšava · Evropa',
    kyivEurope: 'Kyjev · Evropa',
    newYorkNA: 'New York · Severní Amerika',
    dubaiME: 'Dubaj · Blízký východ',
    romeEurope: 'Řím · Evropa',
    parisEurope: 'Paříž · Evropa',
  },
  DE: {
    title: 'Sprache & Region',
    subtitle: 'App-Sprache, Land, Währung und Standortmodus',
    save: 'Speichern',
    saveBottom: 'Einstellungen speichern',
    languageSection: 'Verfügbare App-Sprachen',
    regionSection: 'Länder / Regionen',
    currencySection: 'Währung',
    locationSection: 'Standort',
    useCurrentLocation: 'Aktuellen Standort verwenden',
    currentLocationHint: 'GPS des Geräts für Suche und Karte verwenden',
    useRegionLocation: 'Ausgewählte Region verwenden',
    regionLocationHint: 'In der Nähe des Zentrums des gewählten Landes oder der Region suchen',
    locationLoading: 'Aktueller Standort wird ermittelt...',
    locationSuccess: 'Aktueller Standort ausgewählt',
    locationError: 'Standort konnte nicht ermittelt werden',
    saved: 'Einstellungen gespeichert',
    selected: 'Ausgewählt',
    languageApp: 'App-Sprache',
    overview: 'Aktuelle Konfiguration',
    livePreview: 'Vorschau',
    compactSetup: 'Kurzübersicht',
    britishPound: 'Britisches Pfund',
    euro: 'Euro',
    usDollar: 'US-Dollar',
    polishZloty: 'Polnischer Zloty',
    czechKoruna: 'Tschechische Krone',
    ukrainianHryvnia: 'Ukrainische Hrywnja',
    uaeDirham: 'VAE-Dirham',
    londonEurope: 'London · Europa',
    madridEurope: 'Madrid · Europa',
    pragueEurope: 'Prag · Europa',
    berlinEurope: 'Berlin · Europa',
    warsawEurope: 'Warschau · Europa',
    kyivEurope: 'Kyjiw · Europa',
    newYorkNA: 'New York · Nordamerika',
    dubaiME: 'Dubai · Naher Osten',
    romeEurope: 'Rom · Europa',
    parisEurope: 'Paris · Europa',
  },
  IT: {
    title: 'Lingua e regione',
    subtitle: 'Lingua app, paese, valuta e modalità posizione',
    save: 'Salva',
    saveBottom: 'Salva impostazioni',
    languageSection: 'Lingue disponibili nell’app',
    regionSection: 'Paesi / regioni',
    currencySection: 'Valuta',
    locationSection: 'Posizione',
    useCurrentLocation: 'Usa posizione attuale',
    currentLocationHint: 'Usa il GPS del dispositivo per ricerca e mappa',
    useRegionLocation: 'Usa regione selezionata',
    regionLocationHint: 'Cerca vicino al centro del paese o regione selezionati',
    locationLoading: 'Recupero posizione attuale...',
    locationSuccess: 'Posizione attuale selezionata',
    locationError: 'Impossibile ottenere la posizione',
    saved: 'Impostazioni salvate',
    selected: 'Selezionato',
    languageApp: 'Lingua app',
    overview: 'Configurazione attuale',
    livePreview: 'Anteprima',
    compactSetup: 'Riepilogo rapido',
    britishPound: 'Sterlina britannica',
    euro: 'Euro',
    usDollar: 'Dollaro USA',
    polishZloty: 'Zloty polacco',
    czechKoruna: 'Corona ceca',
    ukrainianHryvnia: 'Grivnia ucraina',
    uaeDirham: 'Dirham EAU',
    londonEurope: 'Londra · Europa',
    madridEurope: 'Madrid · Europa',
    pragueEurope: 'Praga · Europa',
    berlinEurope: 'Berlino · Europa',
    warsawEurope: 'Varsavia · Europa',
    kyivEurope: 'Kyiv · Europa',
    newYorkNA: 'New York · Nord America',
    dubaiME: 'Dubai · Medio Oriente',
    romeEurope: 'Roma · Europa',
    parisEurope: 'Parigi · Europa',
  },
  FR: {
    title: 'Langue et région',
    subtitle: 'Langue de l’app, pays, devise et mode de localisation',
    save: 'Enregistrer',
    saveBottom: 'Enregistrer les réglages',
    languageSection: 'Langues disponibles dans l’app',
    regionSection: 'Pays / régions',
    currencySection: 'Devise',
    locationSection: 'Localisation',
    useCurrentLocation: 'Utiliser la position actuelle',
    currentLocationHint: 'Utiliser le GPS de votre appareil pour la recherche et la carte',
    useRegionLocation: 'Utiliser la région sélectionnée',
    regionLocationHint: 'Rechercher près du centre du pays ou de la région sélectionnée',
    locationLoading: 'Récupération de la position actuelle...',
    locationSuccess: 'Position actuelle sélectionnée',
    locationError: 'Impossible d’obtenir la position',
    saved: 'Paramètres enregistrés',
    selected: 'Sélectionné',
    languageApp: 'Langue de l’app',
    overview: 'Configuration actuelle',
    livePreview: 'Aperçu',
    compactSetup: 'Résumé rapide',
    britishPound: 'Livre sterling',
    euro: 'Euro',
    usDollar: 'Dollar américain',
    polishZloty: 'Zloty polonais',
    czechKoruna: 'Couronne tchèque',
    ukrainianHryvnia: 'Hryvnia ukrainienne',
    uaeDirham: 'Dirham EAU',
    londonEurope: 'Londres · Europe',
    madridEurope: 'Madrid · Europe',
    pragueEurope: 'Prague · Europe',
    berlinEurope: 'Berlin · Europe',
    warsawEurope: 'Varsovie · Europe',
    kyivEurope: 'Kyiv · Europe',
    newYorkNA: 'New York · Amérique du Nord',
    dubaiME: 'Dubaï · Moyen-Orient',
    romeEurope: 'Rome · Europe',
    parisEurope: 'Paris · Europe',
  },
  AR: {
    title: 'اللغة والمنطقة',
    subtitle: 'لغة التطبيق والدولة والعملة ووضع الموقع',
    save: 'حفظ',
    saveBottom: 'حفظ الإعدادات',
    languageSection: 'اللغات المتاحة في التطبيق',
    regionSection: 'الدول / المناطق',
    currencySection: 'العملة',
    locationSection: 'الموقع',
    useCurrentLocation: 'استخدام الموقع الحالي',
    currentLocationHint: 'استخدام GPS الجهاز للبحث والخريطة',
    useRegionLocation: 'استخدام المنطقة المحددة',
    regionLocationHint: 'البحث بالقرب من مركز الدولة أو المنطقة المحددة',
    locationLoading: 'جارٍ تحديد الموقع الحالي...',
    locationSuccess: 'تم اختيار الموقع الحالي',
    locationError: 'تعذر تحديد الموقع',
    saved: 'تم حفظ الإعدادات',
    selected: 'تم الاختيار',
    languageApp: 'لغة التطبيق',
    overview: 'الإعداد الحالي',
    livePreview: 'معاينة',
    compactSetup: 'ملخص سريع',
    britishPound: 'الجنيه البريطاني',
    euro: 'اليورو',
    usDollar: 'الدولار الأمريكي',
    polishZloty: 'الزلوتي البولندي',
    czechKoruna: 'الكرونة التشيكية',
    ukrainianHryvnia: 'الهريفنيا الأوكرانية',
    uaeDirham: 'الدرهم الإماراتي',
    londonEurope: 'لندن · أوروبا',
    madridEurope: 'مدريد · أوروبا',
    pragueEurope: 'براغ · أوروبا',
    berlinEurope: 'برلين · أوروبا',
    warsawEurope: 'وارسو · أوروبا',
    kyivEurope: 'كييف · أوروبا',
    newYorkNA: 'نيويورك · أمريكا الشمالية',
    dubaiME: 'دبي · الشرق الأوسط',
    romeEurope: 'روما · أوروبا',
    parisEurope: 'باريس · أوروبا',
  },
  PL: {
    title: 'Język i region',
    subtitle: 'Język aplikacji, kraj, waluta i tryb lokalizacji',
    save: 'Zapisz',
    saveBottom: 'Zapisz ustawienia',
    languageSection: 'Języki aplikacji',
    regionSection: 'Kraje / regiony',
    currencySection: 'Waluta',
    locationSection: 'Lokalizacja',
    useCurrentLocation: 'Użyj bieżącej lokalizacji',
    currentLocationHint: 'Użyj GPS telefonu do wyszukiwania i mapy',
    useRegionLocation: 'Użyj wybranego regionu',
    regionLocationHint: 'Szukaj w pobliżu centrum wybranego kraju lub regionu',
    locationLoading: 'Pobieranie bieżącej lokalizacji...',
    locationSuccess: 'Wybrano bieżącą lokalizację',
    locationError: 'Nie udało się pobrać lokalizacji',
    saved: 'Ustawienia zapisane',
    selected: 'Wybrano',
    languageApp: 'Język aplikacji',
    overview: 'Aktualna konfiguracja',
    livePreview: 'Podgląd',
    compactSetup: 'Szybkie podsumowanie',
    britishPound: 'Funt brytyjski',
    euro: 'Euro',
    usDollar: 'Dolar amerykański',
    polishZloty: 'Złoty polski',
    czechKoruna: 'Korona czeska',
    ukrainianHryvnia: 'Hrywna ukraińska',
    uaeDirham: 'Dirham ZEA',
    londonEurope: 'Londyn · Europa',
    madridEurope: 'Madryt · Europa',
    pragueEurope: 'Praga · Europa',
    berlinEurope: 'Berlin · Europa',
    warsawEurope: 'Warszawa · Europa',
    kyivEurope: 'Kijów · Europa',
    newYorkNA: 'Nowy Jork · Ameryka Północna',
    dubaiME: 'Dubaj · Bliski Wschód',
    romeEurope: 'Rzym · Europa',
    parisEurope: 'Paryż · Europa',
  },
};

const languageOptions: { value: AppLanguage; label: string; flag: string }[] = [
  { value: 'EN', label: 'English', flag: '🇬🇧' },
  { value: 'ES', label: 'Español', flag: '🇪🇸' },
  { value: 'RU', label: 'Русский', flag: '🇷🇺' },
  { value: 'UA', label: 'Українська', flag: '🇺🇦' },
  { value: 'CZ', label: 'Čeština', flag: '🇨🇿' },
  { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { value: 'FR', label: 'Français', flag: '🇫🇷' },
  { value: 'AR', label: 'العربية', flag: '🇸🇦' },
  { value: 'PL', label: 'Polski', flag: '🇵🇱' },
];

function getRegionOptions(text: PageTextShape): RegionOption[] {
  return [
    { value: 'United Kingdom', label: 'United Kingdom', subtitle: text.londonEurope, flag: '🇬🇧', lat: 51.5074, lng: -0.1278, currency: 'GBP' },
    { value: 'Spain', label: 'Spain', subtitle: text.madridEurope, flag: '🇪🇸', lat: 40.4168, lng: -3.7038, currency: 'EUR' },
    { value: 'Czech Republic', label: 'Czech Republic', subtitle: text.pragueEurope, flag: '🇨🇿', lat: 50.0755, lng: 14.4378, currency: 'CZK' },
    { value: 'Germany', label: 'Germany', subtitle: text.berlinEurope, flag: '🇩🇪', lat: 52.52, lng: 13.405, currency: 'EUR' },
    { value: 'Poland', label: 'Poland', subtitle: text.warsawEurope, flag: '🇵🇱', lat: 52.2297, lng: 21.0122, currency: 'PLN' },
    { value: 'Ukraine', label: 'Ukraine', subtitle: text.kyivEurope, flag: '🇺🇦', lat: 50.4501, lng: 30.5234, currency: 'UAH' },
    { value: 'United States', label: 'United States', subtitle: text.newYorkNA, flag: '🇺🇸', lat: 40.7128, lng: -74.006, currency: 'USD' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates', subtitle: text.dubaiME, flag: '🇦🇪', lat: 25.2048, lng: 55.2708, currency: 'AED' },
    { value: 'Italy', label: 'Italy', subtitle: text.romeEurope, flag: '🇮🇹', lat: 41.9028, lng: 12.4964, currency: 'EUR' },
    { value: 'France', label: 'France', subtitle: text.parisEurope, flag: '🇫🇷', lat: 48.8566, lng: 2.3522, currency: 'EUR' },
  ];
}

function getCurrencyOptions(text: PageTextShape): CurrencyOption[] {
  return [
    { value: 'GBP', symbol: '£', title: 'GBP', subtitle: text.britishPound },
    { value: 'EUR', symbol: '€', title: 'EUR', subtitle: text.euro },
    { value: 'USD', symbol: '$', title: 'USD', subtitle: text.usDollar },
    { value: 'PLN', symbol: 'zł', title: 'PLN', subtitle: text.polishZloty },
    { value: 'CZK', symbol: 'Kč', title: 'CZK', subtitle: text.czechKoruna },
    { value: 'UAH', symbol: '₴', title: 'UAH', subtitle: text.ukrainianHryvnia },
    { value: 'AED', symbol: 'AED', title: 'AED', subtitle: text.uaeDirham },
  ];
}

function getCurrentLocationLabel(language: AppLanguage) {
  if (language === 'ES') return 'Ubicación actual';
  if (language === 'RU') return 'Текущее местоположение';
  if (language === 'UA') return 'Поточна локація';
  if (language === 'CZ') return 'Aktuální poloha';
  if (language === 'DE') return 'Aktueller Standort';
  if (language === 'IT') return 'Posizione attuale';
  if (language === 'FR') return 'Position actuelle';
  if (language === 'AR') return 'الموقع الحالي';
  if (language === 'PL') return 'Bieżąca lokalizacja';
  return 'Current location';
}

function formatCoords(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return '';
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        border: '2px solid #111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      {checked ? (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: '#111111',
          }}
        />
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 900,
        color: '#17130f',
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function Card({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: compact ? 28 : 30,
        padding: compact ? 16 : 18,
        border: '2px solid #111111',
      }}
    >
      {children}
    </div>
  );
}

export default function LanguageRegionPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());

  const initialRegionSettings = getAppRegionSettings();

  const [selectedRegion, setSelectedRegion] = useState(initialRegionSettings.region);
  const [selectedCurrency, setSelectedCurrency] = useState<AppCurrency>(initialRegionSettings.currency);
  const [selectedLocationMode, setSelectedLocationMode] = useState<SearchLocationMode>(
    initialRegionSettings.locationMode
  );
  const [selectedLocation, setSelectedLocation] = useState<StoredLocation>({
    source: initialRegionSettings.locationMode,
    label:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.label
        : initialRegionSettings.customLocation.label,
    lat:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.lat
        : initialRegionSettings.customLocation.lat,
    lng:
      initialRegionSettings.locationMode === 'current'
        ? initialRegionSettings.currentLocation.lng
        : initialRegionSettings.customLocation.lng,
  });

  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
      setSelectedLanguage(nextLanguage);
    });

    const syncProfile = () => {
      setProfile(getUserProfile());
    };

    const unsubProfile = subscribeToUserProfile(syncProfile);

    return () => {
      unsubLanguage();
      unsubProfile();
    };
  }, []);

  useEffect(() => {
    saveLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const text: PageTextShape = pageTexts[language] || pageTexts.EN;

  const regionOptions = useMemo<RegionOption[]>(() => getRegionOptions(text), [text]);
  const currencyOptions = useMemo<CurrencyOption[]>(() => getCurrencyOptions(text), [text]);

  const selectedRegionMeta =
    regionOptions.find((item) => item.value === selectedRegion) || regionOptions[0];

  const locationSummary = useMemo(() => {
    if (selectedLocation?.label) {
      const coords = formatCoords(selectedLocation.lat, selectedLocation.lng);
      return coords ? `${selectedLocation.label} · ${coords}` : selectedLocation.label;
    }

    return `${selectedRegionMeta.label} · ${selectedRegionMeta.subtitle}`;
  }, [selectedLocation, selectedRegionMeta]);

  const handleUseRegionLocation = () => {
    const nextLocation: StoredLocation = {
      source: 'custom',
      label: selectedRegionMeta.label,
      lat: selectedRegionMeta.lat,
      lng: selectedRegionMeta.lng,
    };

    setSelectedLocationMode('custom');
    setSelectedLocation(nextLocation);
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert(text.locationError);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: StoredLocation = {
          source: 'current',
          label: getCurrentLocationLabel(selectedLanguage),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocationMode('current');
        setSelectedLocation(nextLocation);
        setIsLocating(false);
        alert(text.locationSuccess);
      },
      () => {
        setIsLocating(false);
        alert(text.locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = () => {
    saveLanguage(selectedLanguage);

    const regionLocation = {
      lat: selectedRegionMeta.lat,
      lng: selectedRegionMeta.lng,
      label: selectedRegionMeta.label,
    };

    const currentLocation =
      selectedLocationMode === 'current'
        ? {
            lat: selectedLocation?.lat ?? null,
            lng: selectedLocation?.lng ?? null,
            label: selectedLocation?.label || getCurrentLocationLabel(selectedLanguage),
          }
        : {
            lat: initialRegionSettings.currentLocation.lat,
            lng: initialRegionSettings.currentLocation.lng,
            label:
              initialRegionSettings.currentLocation.label ||
              getCurrentLocationLabel(selectedLanguage),
          };

    updateAppRegionSettings({
      language: selectedLanguage,
      region: selectedRegion,
      currency: selectedCurrency,
      locationMode: selectedLocationMode,
      currentLocation,
      customLocation: regionLocation,
    });

    updateUserProfile({
      language: selectedLanguage,
      region: selectedRegion,
    });

    alert((pageTexts[selectedLanguage] || pageTexts.EN).saved);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '20px 16px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr auto',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
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
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {text.title}
            </h1>
            <div
              style={{
                marginTop: 6,
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
            onClick={handleSave}
            style={{
              border: '2px solid #111111',
              background: '#2ea44f',
              color: '#fff',
              borderRadius: 999,
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.save}
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <Card compact>
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#2f241c',
                color: '#fff',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                {text.compactSetup}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                    {text.languageApp}
                  </div>
                  <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                    {languageOptions.find((item) => item.value === selectedLanguage)?.flag}{' '}
                    {languageOptions.find((item) => item.value === selectedLanguage)?.label}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                    {text.selected}
                  </div>
                  <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                    {selectedRegion} · {selectedCurrency}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                    {text.livePreview}
                  </div>
                  <div style={{ fontSize: 15, color: '#17130f', fontWeight: 900 }}>
                    {locationSummary}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.languageSection}</SectionTitle>

            <div style={{ display: 'grid', gap: 10 }}>
              {languageOptions.map((option) => {
                const checked = selectedLanguage === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedLanguage(option.value)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '34px 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 12px',
                      background: checked ? '#f7f1e7' : '#fff',
                      border: '2px solid #111111',
                      textAlign: 'left',
                      borderRadius: 22,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 24 }}>{option.flag}</div>

                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                        {text.languageApp}
                      </div>
                    </div>

                    <Radio checked={checked} />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.regionSection}</SectionTitle>

            <div style={{ display: 'grid', gap: 10 }}>
              {regionOptions.map((option) => {
                const checked = selectedRegion === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(option.value);

                      if (selectedCurrency === selectedRegionMeta.currency) {
                        setSelectedCurrency(option.currency);
                      }

                      if (selectedLocationMode === 'custom') {
                        setSelectedLocation({
                          source: 'custom',
                          label: option.label,
                          lat: option.lat,
                          lng: option.lng,
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '34px 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 12px',
                      background: checked ? '#f7f1e7' : '#fff',
                      border: '2px solid #111111',
                      textAlign: 'left',
                      borderRadius: 22,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 24 }}>{option.flag}</div>

                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                        {option.subtitle}
                      </div>
                    </div>

                    <Radio checked={checked} />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.currencySection}</SectionTitle>

            <div style={{ display: 'grid', gap: 10 }}>
              {currencyOptions.map((option) => {
                const checked = selectedCurrency === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCurrency(option.value)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '62px 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 12px',
                      background: checked ? '#f7f1e7' : '#fff',
                      border: '2px solid #111111',
                      textAlign: 'left',
                      borderRadius: 22,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {option.symbol}
                    </div>

                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                        {option.title}
                      </div>
                      <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700 }}>
                        {option.subtitle}
                      </div>
                    </div>

                    <Radio checked={checked} />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>{text.locationSection}</SectionTitle>

            <div style={{ display: 'grid', gap: 12 }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 14px',
                  background: selectedLocationMode === 'current' ? '#f1efe7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 24,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 24 }}>📍</div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                    {isLocating ? text.locationLoading : text.useCurrentLocation}
                  </div>
                  <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700, marginTop: 4 }}>
                    {text.currentLocationHint}
                  </div>
                </div>

                <Radio checked={selectedLocationMode === 'current'} />
              </button>

              <button
                type="button"
                onClick={handleUseRegionLocation}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 14px',
                  background: selectedLocationMode === 'custom' ? '#f1efe7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 24,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 24 }}>🗺️</div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                    {text.useRegionLocation}
                  </div>
                  <div style={{ fontSize: 13, color: '#7c746a', fontWeight: 700, marginTop: 4 }}>
                    {text.regionLocationHint}
                  </div>
                </div>

                <Radio checked={selectedLocationMode === 'custom'} />
              </button>

              <div
                style={{
                  borderRadius: 20,
                  background: '#f8f5ef',
                  border: '2px solid #111111',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 900, marginBottom: 4 }}>
                  {text.selected}
                </div>
                <div style={{ fontSize: 14, color: '#17130f', fontWeight: 900 }}>
                  {locationSummary}
                </div>
              </div>
            </div>
          </Card>

          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: '14px 16px',
              border: '2px solid #111111',
              color: '#6d6459',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {profile.fullName} · {selectedLanguage} · {selectedRegion} · {selectedCurrency}
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{
              width: '100%',
              minHeight: 58,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#2ea44f',
              color: '#fff',
              fontSize: 17,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.saveBottom}
          </button>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
