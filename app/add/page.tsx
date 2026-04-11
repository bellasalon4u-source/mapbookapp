'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addListing } from '../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

const countries = [
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'PL', dial: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'NL', dial: '+31', flag: '🇳🇱', name: 'Netherlands' },
] as const;

type PhoneContactValue = {
  countryCode: string;
  number: string;
};

const categoriesByLanguage: Record<
  AppLanguage,
  {
    value: string;
    label: string;
    icon: string;
  }[]
> = {
  EN: [
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Home', icon: '🏠' },
    { value: 'Repairs', label: 'Repairs', icon: '🛠️' },
    { value: 'Tech', label: 'Tech', icon: '📱' },
    { value: 'Pets', label: 'Pets', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Moving', icon: '📦' },
    { value: 'Activities', label: 'Activities', icon: '🎯' },
    { value: 'Events', label: 'Events', icon: '🎉' },
    { value: 'Creative', label: 'Creative', icon: '🎨' },
  ],
  RU: [
    { value: 'Beauty', label: 'Красота', icon: '💄' },
    { value: 'Wellness', label: 'Велнес', icon: '🧘' },
    { value: 'Home', label: 'Дом', icon: '🏠' },
    { value: 'Repairs', label: 'Ремонт', icon: '🛠️' },
    { value: 'Tech', label: 'Техника', icon: '📱' },
    { value: 'Pets', label: 'Питомцы', icon: '🐾' },
    { value: 'Auto', label: 'Авто', icon: '🚗' },
    { value: 'Moving', label: 'Переезд', icon: '📦' },
    { value: 'Activities', label: 'Активности', icon: '🎯' },
    { value: 'Events', label: 'События', icon: '🎉' },
    { value: 'Creative', label: 'Креатив', icon: '🎨' },
  ],
  ES: [
    { value: 'Beauty', label: 'Belleza', icon: '💄' },
    { value: 'Wellness', label: 'Bienestar', icon: '🧘' },
    { value: 'Home', label: 'Hogar', icon: '🏠' },
    { value: 'Repairs', label: 'Reparaciones', icon: '🛠️' },
    { value: 'Tech', label: 'Tecnología', icon: '📱' },
    { value: 'Pets', label: 'Mascotas', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Mudanza', icon: '📦' },
    { value: 'Activities', label: 'Actividades', icon: '🎯' },
    { value: 'Events', label: 'Eventos', icon: '🎉' },
    { value: 'Creative', label: 'Creativo', icon: '🎨' },
  ],
  CZ: [
    { value: 'Beauty', label: 'Krása', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Domov', icon: '🏠' },
    { value: 'Repairs', label: 'Opravy', icon: '🛠️' },
    { value: 'Tech', label: 'Technika', icon: '📱' },
    { value: 'Pets', label: 'Mazlíčci', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Stěhování', icon: '📦' },
    { value: 'Activities', label: 'Aktivity', icon: '🎯' },
    { value: 'Events', label: 'Události', icon: '🎉' },
    { value: 'Creative', label: 'Kreativa', icon: '🎨' },
  ],
  DE: [
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Zuhause', icon: '🏠' },
    { value: 'Repairs', label: 'Reparaturen', icon: '🛠️' },
    { value: 'Tech', label: 'Technik', icon: '📱' },
    { value: 'Pets', label: 'Haustiere', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Umzug', icon: '📦' },
    { value: 'Activities', label: 'Aktivitäten', icon: '🎯' },
    { value: 'Events', label: 'Events', icon: '🎉' },
    { value: 'Creative', label: 'Kreativ', icon: '🎨' },
  ],
  PL: [
    { value: 'Beauty', label: 'Uroda', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Dom', icon: '🏠' },
    { value: 'Repairs', label: 'Naprawy', icon: '🛠️' },
    { value: 'Tech', label: 'Technika', icon: '📱' },
    { value: 'Pets', label: 'Zwierzęta', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Przeprowadzka', icon: '📦' },
    { value: 'Activities', label: 'Aktywności', icon: '🎯' },
    { value: 'Events', label: 'Wydarzenia', icon: '🎉' },
    { value: 'Creative', label: 'Kreatywne', icon: '🎨' },
  ],
};

const subcategoriesByCategory: Record<
  string,
  Record<AppLanguage, { value: string; label: string }[]>
> = {
  Beauty: {
    EN: [
      { value: 'Hair', label: 'Hair' },
      { value: 'Nails', label: 'Nails' },
      { value: 'Brows', label: 'Brows' },
      { value: 'Lashes', label: 'Lashes' },
      { value: 'Makeup', label: 'Makeup' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    RU: [
      { value: 'Hair', label: 'Волосы' },
      { value: 'Nails', label: 'Ногти' },
      { value: 'Brows', label: 'Брови' },
      { value: 'Lashes', label: 'Ресницы' },
      { value: 'Makeup', label: 'Макияж' },
      { value: 'Keratin', label: 'Кератин' },
    ],
    ES: [
      { value: 'Hair', label: 'Cabello' },
      { value: 'Nails', label: 'Uñas' },
      { value: 'Brows', label: 'Cejas' },
      { value: 'Lashes', label: 'Pestañas' },
      { value: 'Makeup', label: 'Maquillaje' },
      { value: 'Keratin', label: 'Keratina' },
    ],
    CZ: [
      { value: 'Hair', label: 'Vlasy' },
      { value: 'Nails', label: 'Nehty' },
      { value: 'Brows', label: 'Obočí' },
      { value: 'Lashes', label: 'Řasy' },
      { value: 'Makeup', label: 'Make-up' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    DE: [
      { value: 'Hair', label: 'Haare' },
      { value: 'Nails', label: 'Nägel' },
      { value: 'Brows', label: 'Augenbrauen' },
      { value: 'Lashes', label: 'Wimpern' },
      { value: 'Makeup', label: 'Make-up' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    PL: [
      { value: 'Hair', label: 'Włosy' },
      { value: 'Nails', label: 'Paznokcie' },
      { value: 'Brows', label: 'Brwi' },
      { value: 'Lashes', label: 'Rzęsy' },
      { value: 'Makeup', label: 'Makijaż' },
      { value: 'Keratin', label: 'Keratyna' },
    ],
  },
};

const pageTexts: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    photosSection: string;
    photosHint: string;
    uploadPhotos: string;
    tapMainPhotoHint: string;
    mainPhoto: string;
    deletePhoto: string;
    clearField: string;
    requiredFieldsHint: string;
    serviceTitle: string;
    serviceTitlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    category: string;
    subcategory: string;
    price: string;
    pricePlaceholder: string;
    location: string;
    locationHint: string;
    city: string;
    cityPlaceholder: string;
    district: string;
    districtPlaceholder: string;
    addressDetails: string;
    addressDetailsPlaceholder: string;
    hours: string;
    hoursPlaceholder: string;
    availableToday: string;
    availableTodayHint: string;
    atClient: string;
    atMyPlace: string;
    online: string;
    paymentMethods: string;
    paymentMethodsHint: string;
    cash: string;
    card: string;
    wallet: string;
    contact: string;
    contactHint: string;
    phone: string;
    whatsapp: string;
    businessWhatsapp: string;
    telegram: string;
    viber: string;
    instagram: string;
    website: string;
    email: string;
    chooseCountry: string;
    searchCountry: string;
    phoneNumber: string;
    publishService: string;
    pleaseEnterServiceTitle: string;
    pleaseEnterPrice: string;
    pleaseEnterCity: string;
    pleaseEnterDistrict: string;
    servicePublishedSuccessfully: string;
  }
> = {
  EN: {
    title: 'Add your service',
    subtitle: 'Create a strong listing for clients nearby',
    photosSection: 'Photos',
    photosHint: 'Add great photos to get more views',
    uploadPhotos: 'Upload photos',
    tapMainPhotoHint: 'Tap any photo to make it main',
    mainPhoto: 'Main',
    deletePhoto: 'Delete photo',
    clearField: 'Clear field',
    requiredFieldsHint: '* Required fields',
    serviceTitle: 'Service title',
    serviceTitlePlaceholder: 'Enter service title',
    description: 'Description',
    descriptionPlaceholder: 'Describe your service...',
    category: 'Category',
    subcategory: 'Subcategory',
    price: 'Price',
    pricePlaceholder: 'Enter price',
    location: 'Location',
    locationHint: 'Add a clearer structured location for clients',
    city: 'City / town',
    cityPlaceholder: 'Enter city or town',
    district: 'District / area',
    districtPlaceholder: 'Enter district or area',
    addressDetails: 'Address details',
    addressDetailsPlaceholder: 'Building, street, floor, studio number...',
    hours: 'Working hours',
    hoursPlaceholder: 'Select hours',
    availableToday: 'Available today',
    availableTodayHint: 'This affects the map pin status',
    atClient: 'At client',
    atMyPlace: 'At my place',
    online: 'Online',
    paymentMethods: 'Payment methods',
    paymentMethodsHint: 'How can clients pay?',
    cash: 'Cash',
    card: 'Card',
    wallet: 'E-money',
    contact: 'Contacts',
    contactHint: 'Add every contact channel separately',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'Email',
    chooseCountry: 'Choose country',
    searchCountry: 'Search country or code',
    phoneNumber: 'Phone number',
    publishService: 'Publish service',
    pleaseEnterServiceTitle: 'Please enter service title',
    pleaseEnterPrice: 'Please enter price',
    pleaseEnterCity: 'Please enter city / town',
    pleaseEnterDistrict: 'Please enter district / area',
    servicePublishedSuccessfully: 'Service published successfully',
  },
  RU: {
    title: 'Добавить услугу',
    subtitle: 'Создайте сильное объявление для клиентов рядом',
    photosSection: 'Фото',
    photosHint: 'Добавьте хорошие фото, чтобы получить больше просмотров',
    uploadPhotos: 'Загрузить фото',
    tapMainPhotoHint: 'Нажмите на фото, чтобы сделать его главным',
    mainPhoto: 'Главное',
    deletePhoto: 'Удалить фото',
    clearField: 'Очистить поле',
    requiredFieldsHint: '* Обязательные поля',
    serviceTitle: 'Название услуги',
    serviceTitlePlaceholder: 'Введите название услуги',
    description: 'Описание',
    descriptionPlaceholder: 'Опишите вашу услугу...',
    category: 'Категория',
    subcategory: 'Подкатегория',
    price: 'Цена',
    pricePlaceholder: 'Введите цену',
    location: 'Локация',
    locationHint: 'Добавьте более понятную локацию для клиентов',
    city: 'Город / населённый пункт',
    cityPlaceholder: 'Введите город или населённый пункт',
    district: 'Район / зона',
    districtPlaceholder: 'Введите район или зону',
    addressDetails: 'Подробный адрес',
    addressDetailsPlaceholder: 'Дом, улица, этаж, номер студии...',
    hours: 'Часы работы',
    hoursPlaceholder: 'Выберите часы',
    availableToday: 'Доступно сегодня',
    availableTodayHint: 'Это влияет на статус пина на карте',
    atClient: 'У клиента',
    atMyPlace: 'У меня',
    online: 'Онлайн',
    paymentMethods: 'Способы оплаты',
    paymentMethodsHint: 'Как клиенты могут оплатить?',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Электронные деньги',
    contact: 'Контакты',
    contactHint: 'Добавьте каждый канал связи отдельно',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    chooseCountry: 'Выберите страну',
    searchCountry: 'Поиск страны или кода',
    phoneNumber: 'Номер телефона',
    publishService: 'Опубликовать услугу',
    pleaseEnterServiceTitle: 'Введите название услуги',
    pleaseEnterPrice: 'Введите цену',
    pleaseEnterCity: 'Введите город / населённый пункт',
    pleaseEnterDistrict: 'Введите район / зону',
    servicePublishedSuccessfully: 'Услуга успешно опубликована',
  },
  ES: {
    title: 'Añadir tu servicio',
    subtitle: 'Crea un anuncio fuerte para clientes cercanos',
    photosSection: 'Fotos',
    photosHint: 'Añade buenas fotos para conseguir más visitas',
    uploadPhotos: 'Subir fotos',
    tapMainPhotoHint: 'Toca una foto para ponerla como principal',
    mainPhoto: 'Principal',
    deletePhoto: 'Eliminar foto',
    clearField: 'Borrar campo',
    requiredFieldsHint: '* Campos obligatorios',
    serviceTitle: 'Título del servicio',
    serviceTitlePlaceholder: 'Introduce el título del servicio',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe tu servicio...',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    price: 'Precio',
    pricePlaceholder: 'Introduce el precio',
    location: 'Ubicación',
    locationHint: 'Añade una ubicación más clara para los clientes',
    city: 'Ciudad / localidad',
    cityPlaceholder: 'Introduce ciudad o localidad',
    district: 'Distrito / zona',
    districtPlaceholder: 'Introduce distrito o zona',
    addressDetails: 'Dirección detallada',
    addressDetailsPlaceholder: 'Edificio, calle, piso, número de estudio...',
    hours: 'Horario',
    hoursPlaceholder: 'Selecciona horario',
    availableToday: 'Disponible hoy',
    availableTodayHint: 'Esto afecta el estado del pin en el mapa',
    atClient: 'A domicilio',
    atMyPlace: 'En mi lugar',
    online: 'Online',
    paymentMethods: 'Métodos de pago',
    paymentMethodsHint: '¿Cómo pueden pagar los clientes?',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Dinero electrónico',
    contact: 'Contactos',
    contactHint: 'Añade cada canal de contacto por separado',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'WhatsApp Business',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Sitio web',
    email: 'Email',
    chooseCountry: 'Elegir país',
    searchCountry: 'Buscar país o código',
    phoneNumber: 'Número de teléfono',
    publishService: 'Publicar servicio',
    pleaseEnterServiceTitle: 'Introduce el título del servicio',
    pleaseEnterPrice: 'Introduce el precio',
    pleaseEnterCity: 'Introduce ciudad / localidad',
    pleaseEnterDistrict: 'Introduce distrito / zona',
    servicePublishedSuccessfully: 'Servicio publicado con éxito',
  },
  CZ: {
    title: 'Přidat službu',
    subtitle: 'Vytvořte silnou nabídku pro klienty v okolí',
    photosSection: 'Fotky',
    photosHint: 'Přidejte kvalitní fotky pro více zobrazení',
    uploadPhotos: 'Nahrát fotky',
    tapMainPhotoHint: 'Klepněte na fotku pro nastavení hlavní',
    mainPhoto: 'Hlavní',
    deletePhoto: 'Smazat fotku',
    clearField: 'Vymazat pole',
    requiredFieldsHint: '* Povinná pole',
    serviceTitle: 'Název služby',
    serviceTitlePlaceholder: 'Zadejte název služby',
    description: 'Popis',
    descriptionPlaceholder: 'Popište svou službu...',
    category: 'Kategorie',
    subcategory: 'Podkategorie',
    price: 'Cena',
    pricePlaceholder: 'Zadejte cenu',
    location: 'Lokalita',
    locationHint: 'Přidejte jasnější lokalitu pro klienty',
    city: 'Město / obec',
    cityPlaceholder: 'Zadejte město nebo obec',
    district: 'Čtvrť / oblast',
    districtPlaceholder: 'Zadejte čtvrť nebo oblast',
    addressDetails: 'Podrobná adresa',
    addressDetailsPlaceholder: 'Budova, ulice, patro, číslo studia...',
    hours: 'Pracovní doba',
    hoursPlaceholder: 'Vyberte hodiny',
    availableToday: 'Dostupné dnes',
    availableTodayHint: 'To ovlivňuje stav pinu na mapě',
    atClient: 'U klienta',
    atMyPlace: 'U mě',
    online: 'Online',
    paymentMethods: 'Způsoby platby',
    paymentMethodsHint: 'Jak mohou klienti zaplatit?',
    cash: 'Hotovost',
    card: 'Karta',
    wallet: 'Elektronické peníze',
    contact: 'Kontakty',
    contactHint: 'Přidejte každý kontakt zvlášť',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Web',
    email: 'Email',
    chooseCountry: 'Vyberte zemi',
    searchCountry: 'Hledat zemi nebo kód',
    phoneNumber: 'Telefonní číslo',
    publishService: 'Publikovat službu',
    pleaseEnterServiceTitle: 'Zadejte název služby',
    pleaseEnterPrice: 'Zadejte cenu',
    pleaseEnterCity: 'Zadejte město / obec',
    pleaseEnterDistrict: 'Zadejte čtvrť / oblast',
    servicePublishedSuccessfully: 'Služba byla úspěšně publikována',
  },
  DE: {
    title: 'Dienstleistung hinzufügen',
    subtitle: 'Erstelle ein starkes Angebot für Kunden in der Nähe',
    photosSection: 'Fotos',
    photosHint: 'Füge gute Fotos hinzu, um mehr Aufrufe zu erhalten',
    uploadPhotos: 'Fotos hochladen',
    tapMainPhotoHint: 'Tippe auf ein Foto, um es als Hauptfoto festzulegen',
    mainPhoto: 'Hauptfoto',
    deletePhoto: 'Foto löschen',
    clearField: 'Feld leeren',
    requiredFieldsHint: '* Pflichtfelder',
    serviceTitle: 'Titel der Dienstleistung',
    serviceTitlePlaceholder: 'Titel der Dienstleistung eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibe deine Dienstleistung...',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    price: 'Preis',
    pricePlaceholder: 'Preis eingeben',
    location: 'Standort',
    locationHint: 'Füge einen klareren Standort für Kunden hinzu',
    city: 'Stadt / Ort',
    cityPlaceholder: 'Stadt oder Ort eingeben',
    district: 'Bezirk / Gebiet',
    districtPlaceholder: 'Bezirk oder Gebiet eingeben',
    addressDetails: 'Adressdetails',
    addressDetailsPlaceholder: 'Gebäude, Straße, Etage, Studio-Nummer...',
    hours: 'Arbeitszeiten',
    hoursPlaceholder: 'Zeiten wählen',
    availableToday: 'Heute verfügbar',
    availableTodayHint: 'Das beeinflusst den Status des Kartenpins',
    atClient: 'Beim Kunden',
    atMyPlace: 'Bei mir',
    online: 'Online',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsHint: 'Wie können Kunden bezahlen?',
    cash: 'Bar',
    card: 'Karte',
    wallet: 'E-Geld',
    contact: 'Kontakte',
    contactHint: 'Jeden Kontaktkanal separat hinzufügen',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'E-Mail',
    chooseCountry: 'Land wählen',
    searchCountry: 'Land oder Code suchen',
    phoneNumber: 'Telefonnummer',
    publishService: 'Dienstleistung veröffentlichen',
    pleaseEnterServiceTitle: 'Bitte Titel der Dienstleistung eingeben',
    pleaseEnterPrice: 'Bitte Preis eingeben',
    pleaseEnterCity: 'Bitte Stadt / Ort eingeben',
    pleaseEnterDistrict: 'Bitte Bezirk / Gebiet eingeben',
    servicePublishedSuccessfully: 'Dienstleistung erfolgreich veröffentlicht',
  },
  PL: {
    title: 'Dodaj usługę',
    subtitle: 'Stwórz mocne ogłoszenie dla klientów w pobliżu',
    photosSection: 'Zdjęcia',
    photosHint: 'Dodaj dobre zdjęcia, aby zdobyć więcej wyświetleń',
    uploadPhotos: 'Prześlij zdjęcia',
    tapMainPhotoHint: 'Dotknij zdjęcia, aby ustawić je jako główne',
    mainPhoto: 'Główne',
    deletePhoto: 'Usuń zdjęcie',
    clearField: 'Wyczyść pole',
    requiredFieldsHint: '* Pola obowiązkowe',
    serviceTitle: 'Nazwa usługi',
    serviceTitlePlaceholder: 'Wpisz nazwę usługi',
    description: 'Opis',
    descriptionPlaceholder: 'Opisz swoją usługę...',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    price: 'Cena',
    pricePlaceholder: 'Wpisz cenę',
    location: 'Lokalizacja',
    locationHint: 'Dodaj bardziej przejrzystą lokalizację dla klientów',
    city: 'Miasto / miejscowość',
    cityPlaceholder: 'Wpisz miasto lub miejscowość',
    district: 'Dzielnica / obszar',
    districtPlaceholder: 'Wpisz dzielnicę lub obszar',
    addressDetails: 'Szczegóły adresu',
    addressDetailsPlaceholder: 'Budynek, ulica, piętro, numer studia...',
    hours: 'Godziny pracy',
    hoursPlaceholder: 'Wybierz godziny',
    availableToday: 'Dostępne dziś',
    availableTodayHint: 'Wpływa to na status pinezki na mapie',
    atClient: 'U klienta',
    atMyPlace: 'U mnie',
    online: 'Online',
    paymentMethods: 'Metody płatności',
    paymentMethodsHint: 'Jak klienci mogą zapłacić?',
    cash: 'Gotówka',
    card: 'Karta',
    wallet: 'Pieniądz elektroniczny',
    contact: 'Kontakty',
    contactHint: 'Dodaj każdy kanał kontaktu osobno',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Strona internetowa',
    email: 'Email',
    chooseCountry: 'Wybierz kraj',
    searchCountry: 'Szukaj kraju lub kodu',
    phoneNumber: 'Numer telefonu',
    publishService: 'Opublikuj usługę',
    pleaseEnterServiceTitle: 'Wpisz nazwę usługi',
    pleaseEnterPrice: 'Wpisz cenę',
    pleaseEnterCity: 'Wpisz miasto / miejscowość',
    pleaseEnterDistrict: 'Wpisz dzielnicę / obszar',
    servicePublishedSuccessfully: 'Usługa została opublikowana',
  },
};

type ServicePhotoItem = {
  id: string;
  file: File;
  preview: string;
};

function normalizeInstagram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('@')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `@${trimmed.replace(/^@+/, '')}`;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

function SectionCard({
  title,
  children,
  required,
}: {
  title: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 28,
        padding: 18,
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
        border: '1px solid #ebe4da',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 900,
            color: '#1f2430',
          }}
        >
          {title}
        </div>

        {required ? (
          <span
            style={{
              color: '#ff4d4f',
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            *
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 16,
        fontWeight: 800,
        marginBottom: 8,
        color: '#1f2430',
      }}
    >
      <span>{children}</span>
      {required ? (
        <span
          style={{
            color: '#ff4d4f',
            fontSize: 16,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          *
        </span>
      ) : null}
    </label>
  );
}

function ClearValueButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: 'none',
        background: '#ece7df',
        color: '#5f6b77',
        fontSize: 18,
        fontWeight: 900,
        lineHeight: 1,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      ×
    </button>
  );
}

function ContactInput({
  icon,
  label,
  value,
  onChange,
  onBlur,
  onClear,
  placeholder,
  inputMode = 'text',
  type = 'text',
  clearTitle,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onClear?: () => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: string;
  clearTitle: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e7e0d6',
        borderRadius: 18,
        background: '#fff',
        padding: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: '#f7f5f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#1f2430',
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: onClear && value ? '1fr auto' : '1fr',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          type={type}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: '100%',
            border: '1px solid #ece5da',
            borderRadius: 14,
            padding: '14px 12px',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
            background: '#fcfbf9',
            color: '#1f2430',
          }}
        />

        {onClear && value ? (
          <ClearValueButton onClick={onClear} title={clearTitle} />
        ) : null}
      </div>
    </div>
  );
}

function PhoneChannelInput({
  icon,
  label,
  value,
  onChange,
  onClear,
  clearTitle,
  text,
}: {
  icon: string;
  label: string;
  value: PhoneContactValue;
  onChange: (next: PhoneContactValue) => void;
  onClear: () => void;
  clearTitle: string;
  text: {
    chooseCountry: string;
    searchCountry: string;
    phoneNumber: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry =
    countries.find((item) => item.code === value.countryCode) || countries[0];

  const filteredCountries = countries.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.dial.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        border: '1px solid #e7e0d6',
        borderRadius: 18,
        background: '#fff',
        padding: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: '#f7f5f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#1f2430',
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: value.number ? '130px 1fr auto' : '130px 1fr',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            style={{
              width: '100%',
              height: 50,
              border: '1px solid #ece5da',
              borderRadius: 14,
              background: '#fcfbf9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '0 12px',
              cursor: 'pointer',
              color: '#1f2430',
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dial}</span>
            </span>
            <span>▾</span>
          </button>

          {open ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 8px)',
                width: 280,
                maxWidth: 'calc(100vw - 40px)',
                background: '#fff',
                border: '1px solid #e7e0d6',
                borderRadius: 18,
                boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                padding: 12,
                zIndex: 40,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#7a8490',
                  marginBottom: 8,
                }}
              >
                {text.chooseCountry}
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={text.searchCountry}
                style={{
                  width: '100%',
                  border: '1px solid #ece5da',
                  borderRadius: 12,
                  padding: '12px 10px',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 10,
                }}
              />

              <div
                style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  display: 'grid',
                  gap: 6,
                }}
              >
                {filteredCountries.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onChange({
                        ...value,
                        countryCode: item.code,
                      });
                      setOpen(false);
                      setSearch('');
                    }}
                    style={{
                      border: '1px solid #f0e9de',
                      background: '#fff',
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <span>{item.flag}</span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#1f2430',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#5f6b77',
                        flexShrink: 0,
                      }}
                    >
                      {item.dial}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <input
          value={value.number}
          onChange={(e) =>
            onChange({
              ...value,
              number: e.target.value,
            })
          }
          placeholder={text.phoneNumber}
          inputMode="tel"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: '100%',
            border: '1px solid #ece5da',
            borderRadius: 14,
            padding: '14px 12px',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
            background: '#fcfbf9',
            color: '#1f2430',
            height: 50,
          }}
        />

        {value.number ? (
          <ClearValueButton onClick={onClear} title={clearTitle} />
        ) : null}
      </div>
    </div>
  );
}

export default function AddServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [subcategory, setSubcategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [hours, setHours] = useState('');
  const [availableToday, setAvailableToday] = useState(true);

  const [atClient, setAtClient] = useState(true);
  const [atMyPlace, setAtMyPlace] = useState(false);
  const [online, setOnline] = useState(false);

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [wallet, setWallet] = useState(false);

  const [phone, setPhone] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });
  const [whatsapp, setWhatsapp] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });
  const [businessWhatsapp, setBusinessWhatsapp] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });
  const [telegram, setTelegram] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });
  const [viber, setViber] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });

  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  const [photos, setPhotos] = useState<ServicePhotoItem[]>([]);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, [photos]);

  const text = pageTexts[language] || pageTexts.EN;
  const categories = categoriesByLanguage[language] || categoriesByLanguage.EN;

  const subcategories = useMemo(() => {
    const map = subcategoriesByCategory[category];
    if (!map) return [] as { value: string; label: string }[];
    return map[language] || map.EN || [];
  }, [category, language]);

  useEffect(() => {
    if (!subcategories.length) {
      setSubcategory('');
      return;
    }

    const exists = subcategories.some((item) => item.value === subcategory);
    if (!exists) {
      setSubcategory(subcategories[0].value);
    }
  }, [subcategory, subcategories]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const nextSubs =
      subcategoriesByCategory[value]?.[language] ||
      subcategoriesByCategory[value]?.EN ||
      [];
    setSubcategory(nextSubs[0]?.value || '');
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;

    const imageFiles = nextFiles.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const mapped = imageFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...mapped].slice(0, 8));
    event.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const found = prev.find((item) => item.id === photoId);
      if (found) {
        URL.revokeObjectURL(found.preview);
      }
      return prev.filter((item) => item.id !== photoId);
    });
  };

  const handleSetMainPhoto = (photoId: string) => {
    setPhotos((prev) => {
      const index = prev.findIndex((item) => item.id === photoId);
      if (index <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const formatPhoneValue = (value: PhoneContactValue) => {
    const country = countries.find((item) => item.code === value.countryCode) || countries[0];
    if (!value.number.trim()) return '';
    return `${country.dial} ${value.number.trim()}`;
  };

  const composedLocation = [city.trim(), district.trim(), addressDetails.trim()]
    .filter(Boolean)
    .join(', ');

  const handlePublish = () => {
    if (!title.trim()) {
      alert(text.pleaseEnterServiceTitle);
      return;
    }

    if (!price.trim()) {
      alert(text.pleaseEnterPrice);
      return;
    }

    if (!city.trim()) {
      alert(text.pleaseEnterCity);
      return;
    }

    if (!district.trim()) {
      alert(text.pleaseEnterDistrict);
      return;
    }

    const serviceModes = [
      atClient ? 'at_client' : null,
      atMyPlace ? 'at_my_place' : null,
      online ? 'online' : null,
    ].filter(Boolean) as ('at_client' | 'at_my_place' | 'online')[];

    const paymentMethods = [
      cash ? 'cash' : null,
      card ? 'card' : null,
      wallet ? 'wallet' : null,
    ].filter(Boolean) as ('cash' | 'card' | 'wallet')[];

    addListing({
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory,
      price: price.trim(),
      location: composedLocation,
      hours: hours.trim(),
      availableToday,
      serviceModes,
      paymentMethods,
      contact: {
        phone: formatPhoneValue(phone),
        whatsapp: formatPhoneValue(whatsapp),
        telegram: formatPhoneValue(telegram),
        businessWhatsapp: formatPhoneValue(businessWhatsapp),
        viber: formatPhoneValue(viber),
        instagram: normalizeInstagram(instagram),
        website: normalizeWebsite(website),
        email: email.trim().toLowerCase(),
      } as any,
      photos: photos.map((item) => item.preview),
    });

    alert(text.servicePublishedSuccessfully);
    router.push('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f5f1',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 124,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(247,245,241,0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e6dfd5',
            padding: '16px 16px 14px',
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: '1px solid #e5ddd1',
              background: '#fff',
              fontSize: 28,
              color: '#1f2430',
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            ✕
          </button>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#1f2430',
                lineHeight: 1.15,
              }}
            >
              {text.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7a8490',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.subtitle}
            </div>
          </div>
        </header>

        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #ebe4da',
              boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
              padding: 16,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#1f2430',
                  }}
                >
                  {text.photosSection}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: '#7a8490',
                    fontWeight: 700,
                    lineHeight: 1.35,
                  }}
                >
                  {text.photosHint}
                </div>
              </div>

              <div
                style={{
                  color: '#7a8490',
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {text.requiredFieldsHint}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenFilePicker}
              style={{
                width: '100%',
                border: '1px dashed #cad8cb',
                background: '#fcfffc',
                borderRadius: 22,
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  border: '2px solid #4ea560',
                  color: '#4ea560',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: '#f4fbf5',
                }}
              >
                +
              </div>

              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#2d7b3c',
                  }}
                >
                  {text.uploadPhotos}
                </div>
              </div>
            </button>

            {photos.length > 0 ? (
              <>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: '#7a8490',
                    fontWeight: 700,
                  }}
                >
                  {text.tapMainPhotoHint}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                  }}
                >
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      style={{
                        position: 'relative',
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: index === 0 ? '3px solid #2d7b3c' : '1px solid #e7e0d6',
                        background: '#f8f8f8',
                        aspectRatio: '1 / 1',
                        boxShadow: index === 0 ? '0 8px 18px rgba(45,123,60,0.14)' : 'none',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        style={{
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          width: '100%',
                          height: '100%',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={photo.preview}
                          alt={`service-${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </button>

                      {index === 0 ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: 8,
                            bottom: 8,
                            background: 'rgba(45,123,60,0.92)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {text.mainPhoto}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        aria-label={text.deletePhoto}
                        onClick={() => handleRemovePhoto(photo.id)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          border: 'none',
                          background: 'rgba(255,255,255,0.96)',
                          color: '#1f2430',
                          fontSize: 20,
                          fontWeight: 900,
                          lineHeight: 1,
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.serviceTitle} required>
            <FieldLabel required>{text.serviceTitle}</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={text.serviceTitlePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel required>{text.description}</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.descriptionPlaceholder}
              rows={5}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.category} required>
            <FieldLabel required>{text.category}</FieldLabel>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                background: '#fff',
              }}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>

            <FieldLabel required>{text.subcategory}</FieldLabel>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                background: '#fff',
              }}
            >
              {subcategories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.price} required>
            <FieldLabel required>{text.price}</FieldLabel>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={text.pricePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.location} required>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.locationHint}
            </div>

            <FieldLabel required>{text.city}</FieldLabel>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={text.cityPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel required>{text.district}</FieldLabel>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={text.districtPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel>{text.addressDetails}</FieldLabel>
            <textarea
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder={text.addressDetailsPlaceholder}
              rows={3}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.hours} required>
            <FieldLabel required>{text.hours}</FieldLabel>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={text.hoursPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.availableToday}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#7a8490',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {text.availableTodayHint}
              </div>

              <button
                type="button"
                onClick={() => setAvailableToday((v) => !v)}
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: availableToday ? '#4f91f1' : '#d6dbe2',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: availableToday ? 32 : 4,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                />
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setAtClient((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: atClient ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atClient ? '#5aa764' : '#faf8f4',
                  color: atClient ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.atClient}
              </button>

              <button
                type="button"
                onClick={() => setAtMyPlace((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: atMyPlace ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atMyPlace ? '#5aa764' : '#faf8f4',
                  color: atMyPlace ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.atMyPlace}
              </button>

              <button
                type="button"
                onClick={() => setOnline((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: online ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: online ? '#5aa764' : '#faf8f4',
                  color: online ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.online}
              </button>
            </div>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.paymentMethods}>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              {text.paymentMethodsHint}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCash((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: cash ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: cash ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>💵</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.cash}</span>
                <span style={{ fontSize: 18 }}>{cash ? '☑' : '☐'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCard((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: card ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: card ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>💳</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.card}</span>
                <span style={{ fontSize: 18 }}>{card ? '☑' : '☐'}</span>
              </button>

              <button
                type="button"
                onClick={() => setWallet((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: wallet ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: wallet ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>👛</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.wallet}</span>
                <span style={{ fontSize: 18 }}>{wallet ? '☑' : '☐'}</span>
              </button>
            </div>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.contact}>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.contactHint}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <PhoneChannelInput
                icon="📞"
                label={text.phone}
                value={phone}
                onChange={setPhone}
                onClear={() => setPhone({ ...phone, number: '' })}
                clearTitle={text.clearField}
                text={{
                  chooseCountry: text.chooseCountry,
                  searchCountry: text.searchCountry,
                  phoneNumber: text.phoneNumber,
                }}
              />

              <PhoneChannelInput
                icon="🟢"
                label={text.whatsapp}
                value={whatsapp}
                onChange={setWhatsapp}
                onClear={() => setWhatsapp({ ...whatsapp, number: '' })}
                clearTitle={text.clearField}
                text={{
                  chooseCountry: text.chooseCountry,
                  searchCountry: text.searchCountry,
                  phoneNumber: text.phoneNumber,
                }}
              />

              <PhoneChannelInput
                icon="💼"
                label={text.businessWhatsapp}
                value={businessWhatsapp}
                onChange={setBusinessWhatsapp}
                onClear={() => setBusinessWhatsapp({ ...businessWhatsapp, number: '' })}
                clearTitle={text.clearField}
                text={{
                  chooseCountry: text.chooseCountry,
                  searchCountry: text.searchCountry,
                  phoneNumber: text.phoneNumber,
                }}
              />

              <PhoneChannelInput
                icon="✈️"
                label={text.telegram}
                value={telegram}
                onChange={setTelegram}
                onClear={() => setTelegram({ ...telegram, number: '' })}
                clearTitle={text.clearField}
                text={{
                  chooseCountry: text.chooseCountry,
                  searchCountry: text.searchCountry,
                  phoneNumber: text.phoneNumber,
                }}
              />

              <PhoneChannelInput
                icon="🟣"
                label={text.viber}
                value={viber}
                onChange={setViber}
                onClear={() => setViber({ ...viber, number: '' })}
                clearTitle={text.clearField}
                text={{
                  chooseCountry: text.chooseCountry,
                  searchCountry: text.searchCountry,
                  phoneNumber: text.phoneNumber,
                }}
              />

              <ContactInput
                icon="📸"
                label={text.instagram}
                value={instagram}
                onChange={setInstagram}
                onBlur={() => setInstagram((prev) => normalizeInstagram(prev))}
                onClear={() => setInstagram('')}
                clearTitle={text.clearField}
                placeholder={text.instagram}
              />

              <ContactInput
                icon="🌐"
                label={text.website}
                value={website}
                onChange={setWebsite}
                onBlur={() => setWebsite((prev) => normalizeWebsite(prev))}
                onClear={() => setWebsite('')}
                clearTitle={text.clearField}
                placeholder={text.website}
                inputMode="url"
              />

              <ContactInput
                icon="✉️"
                label={text.email}
                value={email}
                onChange={setEmail}
                onBlur={() => setEmail((prev) => prev.trim().toLowerCase())}
                onClear={() => setEmail('')}
                clearTitle={text.clearField}
                placeholder={text.email}
                inputMode="email"
                type="email"
              />
            </div>
          </SectionCard>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(247,245,241,0.98)',
          borderTop: '1px solid #e6dfd5',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            type="button"
            onClick={handlePublish}
            style={{
              width: '100%',
              border: 'none',
              background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
              color: '#fff',
              borderRadius: 20,
              padding: '18px 18px',
              fontSize: 18,
              fontWeight: 900,
              boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
            }}
          >
            {text.publishService}
          </button>
        </div>
      </div>
    </main>
  );
}
