'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
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

type ServicePhotoItem = {
  id: string;
  file: File;
  preview: string;
};

type CategoryItem = {
  value: string;
  label: string;
  icon: string;
};

type SubcategoryItem = {
  value: string;
  label: string;
};

type CopyText = {
  title: string;
  subtitle: string;
  requiredFields: string;
  photos: string;
  photosHint: string;
  uploadPhotos: string;
  tapMainPhotoHint: string;
  mainPhoto: string;
  deletePhoto: string;
  clearField: string;
  serviceInfo: string;
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
  availability: string;
  availabilityHint: string;
  atClient: string;
  atMyPlace: string;
  online: string;
  paymentMethods: string;
  paymentHint: string;
  cash: string;
  card: string;
  wallet: string;
  contacts: string;
  contactsHint: string;
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
  publish: string;
  enterServiceTitle: string;
  enterPrice: string;
  enterCity: string;
  enterDistrict: string;
  published: string;
};

const textByLanguage: Record<AppLanguage, CopyText> = {
  EN: {
    title: 'Add your service',
    subtitle: 'Create a strong listing for clients nearby',
    requiredFields: '* Required fields',
    photos: 'Photos',
    photosHint: 'Add great photos to get more views',
    uploadPhotos: 'Upload photos',
    tapMainPhotoHint: 'Tap a photo to make it main',
    mainPhoto: 'Main',
    deletePhoto: 'Delete photo',
    clearField: 'Clear field',
    serviceInfo: 'Service info',
    serviceTitle: 'Service title',
    serviceTitlePlaceholder: 'Enter service title',
    description: 'Description',
    descriptionPlaceholder: 'Describe your service...',
    category: 'Category',
    subcategory: 'Subcategory',
    price: 'Price',
    pricePlaceholder: 'Enter price',
    location: 'Location',
    locationHint: 'Add a clearer location for clients',
    city: 'City / town',
    cityPlaceholder: 'Enter city or town',
    district: 'District / area',
    districtPlaceholder: 'Enter district or area',
    addressDetails: 'Address details',
    addressDetailsPlaceholder: 'Building, street, floor, studio number...',
    hours: 'Working hours',
    hoursPlaceholder: 'For example: 09:00 - 20:00',
    availability: 'Availability',
    availabilityHint: 'This affects your map status',
    atClient: 'At client',
    atMyPlace: 'At my place',
    online: 'Online',
    paymentMethods: 'Payment methods',
    paymentHint: 'How can clients pay?',
    cash: 'Cash',
    card: 'Card',
    wallet: 'E-money',
    contacts: 'Contacts',
    contactsHint: 'Add each contact channel separately',
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
    publish: 'Publish service',
    enterServiceTitle: 'Please enter service title',
    enterPrice: 'Please enter price',
    enterCity: 'Please enter city / town',
    enterDistrict: 'Please enter district / area',
    published: 'Service published successfully',
  },
  RU: {
    title: 'Добавить услугу',
    subtitle: 'Создайте сильное объявление для клиентов рядом',
    requiredFields: '* Обязательные поля',
    photos: 'Фото',
    photosHint: 'Добавьте хорошие фото, чтобы получить больше просмотров',
    uploadPhotos: 'Загрузить фото',
    tapMainPhotoHint: 'Нажмите на фото, чтобы сделать его главным',
    mainPhoto: 'Главное',
    deletePhoto: 'Удалить фото',
    clearField: 'Очистить поле',
    serviceInfo: 'Информация об услуге',
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
    hoursPlaceholder: 'Например: 09:00 - 20:00',
    availability: 'Доступность',
    availabilityHint: 'Это влияет на статус на карте',
    atClient: 'У клиента',
    atMyPlace: 'У меня',
    online: 'Онлайн',
    paymentMethods: 'Способы оплаты',
    paymentHint: 'Как клиенты могут оплатить?',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Электронные деньги',
    contacts: 'Контакты',
    contactsHint: 'Добавьте каждый канал связи отдельно',
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
    publish: 'Опубликовать услугу',
    enterServiceTitle: 'Введите название услуги',
    enterPrice: 'Введите цену',
    enterCity: 'Введите город / населённый пункт',
    enterDistrict: 'Введите район / зону',
    published: 'Услуга успешно опубликована',
  },
  ES: {
    title: 'Añadir servicio',
    subtitle: 'Crea un anuncio fuerte para clientes cercanos',
    requiredFields: '* Campos obligatorios',
    photos: 'Fotos',
    photosHint: 'Añade buenas fotos para conseguir más vistas',
    uploadPhotos: 'Subir fotos',
    tapMainPhotoHint: 'Toca una foto para hacerla principal',
    mainPhoto: 'Principal',
    deletePhoto: 'Eliminar foto',
    clearField: 'Borrar campo',
    serviceInfo: 'Información del servicio',
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
    addressDetails: 'Detalles de la dirección',
    addressDetailsPlaceholder: 'Edificio, calle, piso, número de estudio...',
    hours: 'Horario de trabajo',
    hoursPlaceholder: 'Por ejemplo: 09:00 - 20:00',
    availability: 'Disponibilidad',
    availabilityHint: 'Esto afecta tu estado en el mapa',
    atClient: 'En casa del cliente',
    atMyPlace: 'En mi lugar',
    online: 'Online',
    paymentMethods: 'Métodos de pago',
    paymentHint: '¿Cómo pueden pagar los clientes?',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Dinero electrónico',
    contacts: 'Contactos',
    contactsHint: 'Añade cada canal de contacto por separado',
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
    publish: 'Publicar servicio',
    enterServiceTitle: 'Introduce el título del servicio',
    enterPrice: 'Introduce el precio',
    enterCity: 'Introduce ciudad / localidad',
    enterDistrict: 'Introduce distrito / zona',
    published: 'Servicio publicado correctamente',
  },
  CZ: {
    title: 'Přidat službu',
    subtitle: 'Vytvořte silný inzerát pro klienty v okolí',
    requiredFields: '* Povinná pole',
    photos: 'Fotky',
    photosHint: 'Přidejte kvalitní fotky pro více zobrazení',
    uploadPhotos: 'Nahrát fotky',
    tapMainPhotoHint: 'Klikněte na fotku a nastavte ji jako hlavní',
    mainPhoto: 'Hlavní',
    deletePhoto: 'Smazat fotku',
    clearField: 'Vymazat pole',
    serviceInfo: 'Informace o službě',
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
    district: 'Oblast / zóna',
    districtPlaceholder: 'Zadejte oblast nebo zónu',
    addressDetails: 'Podrobnosti adresy',
    addressDetailsPlaceholder: 'Budova, ulice, patro, číslo studia...',
    hours: 'Pracovní doba',
    hoursPlaceholder: 'Například: 09:00 - 20:00',
    availability: 'Dostupnost',
    availabilityHint: 'To ovlivňuje váš stav na mapě',
    atClient: 'U klienta',
    atMyPlace: 'U mě',
    online: 'Online',
    paymentMethods: 'Způsoby platby',
    paymentHint: 'Jak mohou klienti zaplatit?',
    cash: 'Hotovost',
    card: 'Karta',
    wallet: 'Elektronické peníze',
    contacts: 'Kontakty',
    contactsHint: 'Přidejte každý kontaktní kanál zvlášť',
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
    publish: 'Publikovat službu',
    enterServiceTitle: 'Zadejte název služby',
    enterPrice: 'Zadejte cenu',
    enterCity: 'Zadejte město / obec',
    enterDistrict: 'Zadejte oblast / zónu',
    published: 'Služba byla úspěšně publikována',
  },
  DE: {
    title: 'Service hinzufügen',
    subtitle: 'Erstellen Sie ein starkes Angebot für Kunden in der Nähe',
    requiredFields: '* Pflichtfelder',
    photos: 'Fotos',
    photosHint: 'Fügen Sie gute Fotos hinzu, um mehr Aufrufe zu erhalten',
    uploadPhotos: 'Fotos hochladen',
    tapMainPhotoHint: 'Tippen Sie auf ein Foto, um es zum Hauptfoto zu machen',
    mainPhoto: 'Hauptfoto',
    deletePhoto: 'Foto löschen',
    clearField: 'Feld löschen',
    serviceInfo: 'Serviceinformationen',
    serviceTitle: 'Servicetitel',
    serviceTitlePlaceholder: 'Servicetitel eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreiben Sie Ihren Service...',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    price: 'Preis',
    pricePlaceholder: 'Preis eingeben',
    location: 'Standort',
    locationHint: 'Fügen Sie einen klareren Standort für Kunden hinzu',
    city: 'Stadt / Ort',
    cityPlaceholder: 'Stadt oder Ort eingeben',
    district: 'Bezirk / Gebiet',
    districtPlaceholder: 'Bezirk oder Gebiet eingeben',
    addressDetails: 'Adressdetails',
    addressDetailsPlaceholder: 'Gebäude, Straße, Etage, Studio-Nummer...',
    hours: 'Arbeitszeiten',
    hoursPlaceholder: 'Zum Beispiel: 09:00 - 20:00',
    availability: 'Verfügbarkeit',
    availabilityHint: 'Das beeinflusst Ihren Status auf der Karte',
    atClient: 'Beim Kunden',
    atMyPlace: 'Bei mir',
    online: 'Online',
    paymentMethods: 'Zahlungsmethoden',
    paymentHint: 'Wie können Kunden bezahlen?',
    cash: 'Bar',
    card: 'Karte',
    wallet: 'E-Geld',
    contacts: 'Kontakte',
    contactsHint: 'Fügen Sie jeden Kontaktkanal separat hinzu',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'Email',
    chooseCountry: 'Land auswählen',
    searchCountry: 'Land oder Code suchen',
    phoneNumber: 'Telefonnummer',
    publish: 'Service veröffentlichen',
    enterServiceTitle: 'Servicetitel eingeben',
    enterPrice: 'Preis eingeben',
    enterCity: 'Stadt / Ort eingeben',
    enterDistrict: 'Bezirk / Gebiet eingeben',
    published: 'Service erfolgreich veröffentlicht',
  },
  PL: {
    title: 'Dodaj usługę',
    subtitle: 'Stwórz mocne ogłoszenie dla klientów w pobliżu',
    requiredFields: '* Pola obowiązkowe',
    photos: 'Zdjęcia',
    photosHint: 'Dodaj dobre zdjęcia, aby zdobyć więcej wyświetleń',
    uploadPhotos: 'Prześlij zdjęcia',
    tapMainPhotoHint: 'Kliknij zdjęcie, aby ustawić je jako główne',
    mainPhoto: 'Główne',
    deletePhoto: 'Usuń zdjęcie',
    clearField: 'Wyczyść pole',
    serviceInfo: 'Informacje o usłudze',
    serviceTitle: 'Nazwa usługi',
    serviceTitlePlaceholder: 'Wpisz nazwę usługi',
    description: 'Opis',
    descriptionPlaceholder: 'Opisz swoją usługę...',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    price: 'Cena',
    pricePlaceholder: 'Wpisz cenę',
    location: 'Lokalizacja',
    locationHint: 'Dodaj bardziej zrozumiałą lokalizację dla klientów',
    city: 'Miasto / miejscowość',
    cityPlaceholder: 'Wpisz miasto lub miejscowość',
    district: 'Dzielnica / obszar',
    districtPlaceholder: 'Wpisz dzielnicę lub obszar',
    addressDetails: 'Szczegóły adresu',
    addressDetailsPlaceholder: 'Budynek, ulica, piętro, numer studia...',
    hours: 'Godziny pracy',
    hoursPlaceholder: 'Na przykład: 09:00 - 20:00',
    availability: 'Dostępność',
    availabilityHint: 'To wpływa na status na mapie',
    atClient: 'U klienta',
    atMyPlace: 'U mnie',
    online: 'Online',
    paymentMethods: 'Metody płatności',
    paymentHint: 'Jak klienci mogą zapłacić?',
    cash: 'Gotówka',
    card: 'Karta',
    wallet: 'Pieniądz elektroniczny',
    contacts: 'Kontakty',
    contactsHint: 'Dodaj każdy kanał kontaktu osobno',
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
    publish: 'Opublikuj usługę',
    enterServiceTitle: 'Wpisz nazwę usługi',
    enterPrice: 'Wpisz cenę',
    enterCity: 'Wpisz miasto / miejscowość',
    enterDistrict: 'Wpisz dzielnicę / obszar',
    published: 'Usługa została opublikowana',
  },
  UA: {
    title: 'Додати послугу',
    subtitle: 'Створіть сильне оголошення для клієнтів поруч',
    requiredFields: '* Обов’язкові поля',
    photos: 'Фото',
    photosHint: 'Додайте хороші фото, щоб отримати більше переглядів',
    uploadPhotos: 'Завантажити фото',
    tapMainPhotoHint: 'Натисніть на фото, щоб зробити його головним',
    mainPhoto: 'Головне',
    deletePhoto: 'Видалити фото',
    clearField: 'Очистити поле',
    serviceInfo: 'Інформація про послугу',
    serviceTitle: 'Назва послуги',
    serviceTitlePlaceholder: 'Введіть назву послуги',
    description: 'Опис',
    descriptionPlaceholder: 'Опишіть вашу послугу...',
    category: 'Категорія',
    subcategory: 'Підкатегорія',
    price: 'Ціна',
    pricePlaceholder: 'Введіть ціну',
    location: 'Локація',
    locationHint: 'Додайте зрозумілішу локацію для клієнтів',
    city: 'Місто / населений пункт',
    cityPlaceholder: 'Введіть місто або населений пункт',
    district: 'Район / зона',
    districtPlaceholder: 'Введіть район або зону',
    addressDetails: 'Детальна адреса',
    addressDetailsPlaceholder: 'Будинок, вулиця, поверх, номер студії...',
    hours: 'Години роботи',
    hoursPlaceholder: 'Наприклад: 09:00 - 20:00',
    availability: 'Доступність',
    availabilityHint: 'Це впливає на статус на карті',
    atClient: 'У клієнта',
    atMyPlace: 'У мене',
    online: 'Онлайн',
    paymentMethods: 'Способи оплати',
    paymentHint: 'Як клієнти можуть оплатити?',
    cash: 'Готівка',
    card: 'Картка',
    wallet: 'Електронні гроші',
    contacts: 'Контакти',
    contactsHint: 'Додайте кожен канал зв’язку окремо',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    chooseCountry: 'Оберіть країну',
    searchCountry: 'Пошук країни або коду',
    phoneNumber: 'Номер телефону',
    publish: 'Опублікувати послугу',
    enterServiceTitle: 'Введіть назву послуги',
    enterPrice: 'Введіть ціну',
    enterCity: 'Введіть місто / населений пункт',
    enterDistrict: 'Введіть район / зону',
    published: 'Послугу успішно опубліковано',
  },
  IT: {
    title: 'Aggiungi servizio',
    subtitle: 'Crea un annuncio forte per i clienti vicini',
    requiredFields: '* Campi obbligatori',
    photos: 'Foto',
    photosHint: 'Aggiungi belle foto per ottenere più visualizzazioni',
    uploadPhotos: 'Carica foto',
    tapMainPhotoHint: 'Tocca una foto per renderla principale',
    mainPhoto: 'Principale',
    deletePhoto: 'Elimina foto',
    clearField: 'Cancella campo',
    serviceInfo: 'Informazioni sul servizio',
    serviceTitle: 'Titolo del servizio',
    serviceTitlePlaceholder: 'Inserisci il titolo del servizio',
    description: 'Descrizione',
    descriptionPlaceholder: 'Descrivi il tuo servizio...',
    category: 'Categoria',
    subcategory: 'Sottocategoria',
    price: 'Prezzo',
    pricePlaceholder: 'Inserisci il prezzo',
    location: 'Posizione',
    locationHint: 'Aggiungi una posizione più chiara per i clienti',
    city: 'Città / paese',
    cityPlaceholder: 'Inserisci città o paese',
    district: 'Zona / quartiere',
    districtPlaceholder: 'Inserisci zona o quartiere',
    addressDetails: 'Dettagli indirizzo',
    addressDetailsPlaceholder: 'Edificio, strada, piano, numero studio...',
    hours: 'Orari di lavoro',
    hoursPlaceholder: 'Per esempio: 09:00 - 20:00',
    availability: 'Disponibilità',
    availabilityHint: 'Questo influisce sul tuo stato sulla mappa',
    atClient: 'Dal cliente',
    atMyPlace: 'Da me',
    online: 'Online',
    paymentMethods: 'Metodi di pagamento',
    paymentHint: 'Come possono pagare i clienti?',
    cash: 'Contanti',
    card: 'Carta',
    wallet: 'Denaro elettronico',
    contacts: 'Contatti',
    contactsHint: 'Aggiungi ogni canale di contatto separatamente',
    phone: 'Telefono',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Sito web',
    email: 'Email',
    chooseCountry: 'Scegli paese',
    searchCountry: 'Cerca paese o prefisso',
    phoneNumber: 'Numero di telefono',
    publish: 'Pubblica servizio',
    enterServiceTitle: 'Inserisci il titolo del servizio',
    enterPrice: 'Inserisci il prezzo',
    enterCity: 'Inserisci città / paese',
    enterDistrict: 'Inserisci zona / quartiere',
    published: 'Servizio pubblicato con successo',
  },
  FR: {
    title: 'Ajouter un service',
    subtitle: 'Créez une annonce forte pour les clients proches',
    requiredFields: '* Champs obligatoires',
    photos: 'Photos',
    photosHint: 'Ajoutez de belles photos pour obtenir plus de vues',
    uploadPhotos: 'Télécharger des photos',
    tapMainPhotoHint: 'Touchez une photo pour la rendre principale',
    mainPhoto: 'Principale',
    deletePhoto: 'Supprimer la photo',
    clearField: 'Effacer le champ',
    serviceInfo: 'Informations sur le service',
    serviceTitle: 'Titre du service',
    serviceTitlePlaceholder: 'Entrez le titre du service',
    description: 'Description',
    descriptionPlaceholder: 'Décrivez votre service...',
    category: 'Catégorie',
    subcategory: 'Sous-catégorie',
    price: 'Prix',
    pricePlaceholder: 'Entrez le prix',
    location: 'Localisation',
    locationHint: 'Ajoutez une localisation plus claire pour les clients',
    city: 'Ville / localité',
    cityPlaceholder: 'Entrez la ville ou la localité',
    district: 'Quartier / zone',
    districtPlaceholder: 'Entrez le quartier ou la zone',
    addressDetails: 'Détails de l’adresse',
    addressDetailsPlaceholder: 'Bâtiment, rue, étage, numéro de studio...',
    hours: 'Heures de travail',
    hoursPlaceholder: 'Par exemple : 09:00 - 20:00',
    availability: 'Disponibilité',
    availabilityHint: 'Cela affecte votre statut sur la carte',
    atClient: 'Chez le client',
    atMyPlace: 'Chez moi',
    online: 'En ligne',
    paymentMethods: 'Modes de paiement',
    paymentHint: 'Comment les clients peuvent-ils payer ?',
    cash: 'Espèces',
    card: 'Carte',
    wallet: 'Argent électronique',
    contacts: 'Contacts',
    contactsHint: 'Ajoutez chaque canal de contact séparément',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Site web',
    email: 'Email',
    chooseCountry: 'Choisir un pays',
    searchCountry: 'Rechercher un pays ou un code',
    phoneNumber: 'Numéro de téléphone',
    publish: 'Publier le service',
    enterServiceTitle: 'Entrez le titre du service',
    enterPrice: 'Entrez le prix',
    enterCity: 'Entrez la ville / localité',
    enterDistrict: 'Entrez le quartier / zone',
    published: 'Service publié avec succès',
  },
  AR: {
    title: 'إضافة خدمة',
    subtitle: 'أنشئ إعلانًا قويًا للعملاء القريبين',
    requiredFields: '* حقول إلزامية',
    photos: 'الصور',
    photosHint: 'أضف صورًا جيدة للحصول على المزيد من المشاهدات',
    uploadPhotos: 'رفع الصور',
    tapMainPhotoHint: 'اضغط على صورة لجعلها الرئيسية',
    mainPhoto: 'الرئيسية',
    deletePhoto: 'حذف الصورة',
    clearField: 'مسح الحقل',
    serviceInfo: 'معلومات الخدمة',
    serviceTitle: 'عنوان الخدمة',
    serviceTitlePlaceholder: 'أدخل عنوان الخدمة',
    description: 'الوصف',
    descriptionPlaceholder: 'صف خدمتك...',
    category: 'الفئة',
    subcategory: 'الفئة الفرعية',
    price: 'السعر',
    pricePlaceholder: 'أدخل السعر',
    location: 'الموقع',
    locationHint: 'أضف موقعًا أوضح للعملاء',
    city: 'المدينة / البلدة',
    cityPlaceholder: 'أدخل المدينة أو البلدة',
    district: 'المنطقة',
    districtPlaceholder: 'أدخل المنطقة',
    addressDetails: 'تفاصيل العنوان',
    addressDetailsPlaceholder: 'المبنى، الشارع، الطابق، رقم الاستوديو...',
    hours: 'ساعات العمل',
    hoursPlaceholder: 'مثال: 09:00 - 20:00',
    availability: 'التوفر',
    availabilityHint: 'هذا يؤثر على حالتك على الخريطة',
    atClient: 'عند العميل',
    atMyPlace: 'في مكاني',
    online: 'أونلاين',
    paymentMethods: 'طرق الدفع',
    paymentHint: 'كيف يمكن للعملاء الدفع؟',
    cash: 'نقدًا',
    card: 'بطاقة',
    wallet: 'مال إلكتروني',
    contacts: 'جهات الاتصال',
    contactsHint: 'أضف كل وسيلة تواصل بشكل منفصل',
    phone: 'الهاتف',
    whatsapp: 'واتساب',
    businessWhatsapp: 'واتساب للأعمال',
    telegram: 'تيليجرام',
    viber: 'فايبر',
    instagram: 'إنستغرام',
    website: 'الموقع الإلكتروني',
    email: 'البريد الإلكتروني',
    chooseCountry: 'اختر الدولة',
    searchCountry: 'ابحث عن دولة أو رمز',
    phoneNumber: 'رقم الهاتف',
    publish: 'نشر الخدمة',
    enterServiceTitle: 'أدخل عنوان الخدمة',
    enterPrice: 'أدخل السعر',
    enterCity: 'أدخل المدينة / البلدة',
    enterDistrict: 'أدخل المنطقة',
    published: 'تم نشر الخدمة بنجاح',
  },
};

const categoriesByLanguage: Record<AppLanguage, CategoryItem[]> = {
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
  UA: [
    { value: 'Beauty', label: 'Краса', icon: '💄' },
    { value: 'Wellness', label: 'Велнес', icon: '🧘' },
    { value: 'Home', label: 'Дім', icon: '🏠' },
    { value: 'Repairs', label: 'Ремонт', icon: '🛠️' },
    { value: 'Tech', label: 'Техніка', icon: '📱' },
    { value: 'Pets', label: 'Тварини', icon: '🐾' },
    { value: 'Auto', label: 'Авто', icon: '🚗' },
    { value: 'Moving', label: 'Переїзд', icon: '📦' },
    { value: 'Activities', label: 'Активності', icon: '🎯' },
    { value: 'Events', label: 'Події', icon: '🎉' },
    { value: 'Creative', label: 'Креатив', icon: '🎨' },
  ],
  IT: [
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Wellness', label: 'Benessere', icon: '🧘' },
    { value: 'Home', label: 'Casa', icon: '🏠' },
    { value: 'Repairs', label: 'Riparazioni', icon: '🛠️' },
    { value: 'Tech', label: 'Tech', icon: '📱' },
    { value: 'Pets', label: 'Animali', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Trasloco', icon: '📦' },
    { value: 'Activities', label: 'Attività', icon: '🎯' },
    { value: 'Events', label: 'Eventi', icon: '🎉' },
    { value: 'Creative', label: 'Creativo', icon: '🎨' },
  ],
  FR: [
    { value: 'Beauty', label: 'Beauté', icon: '💄' },
    { value: 'Wellness', label: 'Bien-être', icon: '🧘' },
    { value: 'Home', label: 'Maison', icon: '🏠' },
    { value: 'Repairs', label: 'Réparations', icon: '🛠️' },
    { value: 'Tech', label: 'Tech', icon: '📱' },
    { value: 'Pets', label: 'Animaux', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Déménagement', icon: '📦' },
    { value: 'Activities', label: 'Activités', icon: '🎯' },
    { value: 'Events', label: 'Événements', icon: '🎉' },
    { value: 'Creative', label: 'Créatif', icon: '🎨' },
  ],
  AR: [
    { value: 'Beauty', label: 'الجمال', icon: '💄' },
    { value: 'Wellness', label: 'عافية', icon: '🧘' },
    { value: 'Home', label: 'المنزل', icon: '🏠' },
    { value: 'Repairs', label: 'إصلاحات', icon: '🛠️' },
    { value: 'Tech', label: 'تقنية', icon: '📱' },
    { value: 'Pets', label: 'حيوانات', icon: '🐾' },
    { value: 'Auto', label: 'سيارات', icon: '🚗' },
    { value: 'Moving', label: 'نقل', icon: '📦' },
    { value: 'Activities', label: 'أنشطة', icon: '🎯' },
    { value: 'Events', label: 'فعاليات', icon: '🎉' },
    { value: 'Creative', label: 'إبداعي', icon: '🎨' },
  ],
};

const subcategoriesByCategory: Record<string, SubcategoryItem[]> = {
  Beauty: [
    { value: 'Hair', label: 'Hair' },
    { value: 'Nails', label: 'Nails' },
    { value: 'Brows', label: 'Brows' },
    { value: 'Lashes', label: 'Lashes' },
    { value: 'Makeup', label: 'Makeup' },
    { value: 'Keratin', label: 'Keratin' },
  ],
  Wellness: [
    { value: 'Massage', label: 'Massage' },
    { value: 'SPA', label: 'SPA' },
    { value: 'Yoga', label: 'Yoga' },
  ],
  Home: [
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Deep Cleaning', label: 'Deep Cleaning' },
    { value: 'Furniture', label: 'Furniture' },
  ],
  Repairs: [
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Plumber', label: 'Plumber' },
    { value: 'Handyman', label: 'Handyman' },
  ],
  Tech: [
    { value: 'Phone Repair', label: 'Phone Repair' },
    { value: 'Laptop Repair', label: 'Laptop Repair' },
    { value: 'Setup', label: 'Setup' },
  ],
  Pets: [
    { value: 'Pet Sitting', label: 'Pet Sitting' },
    { value: 'Dog Walking', label: 'Dog Walking' },
    { value: 'Grooming', label: 'Grooming' },
  ],
  Auto: [
    { value: 'Car Wash', label: 'Car Wash' },
    { value: 'Diagnostics', label: 'Diagnostics' },
    { value: 'Tyres', label: 'Tyres' },
  ],
  Moving: [
    { value: 'Small Moves', label: 'Small Moves' },
    { value: 'Packing', label: 'Packing' },
    { value: 'Van Help', label: 'Van Help' },
  ],
  Activities: [
    { value: 'Coach', label: 'Coach' },
    { value: 'Tutor', label: 'Tutor' },
    { value: 'Guide', label: 'Guide' },
  ],
  Events: [
    { value: 'Photographer', label: 'Photographer' },
    { value: 'Decor', label: 'Decor' },
    { value: 'Host', label: 'Host' },
  ],
  Creative: [
    { value: 'Design', label: 'Design' },
    { value: 'Content', label: 'Content' },
    { value: 'Editing', label: 'Editing' },
  ],
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

function isUserRegistered() {
  if (typeof window === 'undefined') return false;

  const possibleKeys = [
    'olamepUserRegistered',
    'mapbookUserRegistered',
    'olamep_registered',
    'mapbook_registered',
    'olamep_auth_user',
    'mapbook_auth_user',
    'currentUser',
    'user',
  ];

  return possibleKeys.some((key) => {
    const value = window.localStorage.getItem(key);
    if (!value) return false;

    const normalized = value.toLowerCase().trim();

    return (
      normalized === 'yes' ||
      normalized === 'true' ||
      normalized === '1' ||
      normalized.includes('email') ||
      normalized.includes('phone') ||
      normalized.includes('name')
    );
  });
}

function inputBaseStyle(): CSSProperties {
  return {
    width: '100%',
    border: '1.5px solid #111111',
    borderRadius: 18,
    padding: '16px 14px',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#17130f',
  };
}

function SectionCard({
  title,
  children,
  required,
}: {
  title: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div
      style={{
        background: '#f7f4ee',
        borderRadius: 30,
        padding: 18,
        border: '2px solid #111111',
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
            fontSize: 18,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {title}
        </div>

        {required ? (
          <span
            style={{
              color: '#ef4444',
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
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 16,
        fontWeight: 900,
        marginBottom: 10,
        color: '#17130f',
      }}
    >
      <span>{children}</span>
      {required ? (
        <span
          style={{
            color: '#ef4444',
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
        width: 34,
        height: 34,
        borderRadius: 999,
        border: '1.5px solid #111111',
        background: '#ffffff',
        color: '#17130f',
        fontSize: 20,
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
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: string;
  clearTitle: string;
}) {
  return (
    <div
      style={{
        border: '2px solid #111111',
        borderRadius: 24,
        background: '#ffffff',
        padding: 14,
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
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1.5px solid #111111',
            background: '#f7f4ee',
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
            fontWeight: 900,
            color: '#17130f',
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
          style={inputBaseStyle()}
        />

        {onClear && value ? <ClearValueButton onClick={onClear} title={clearTitle} /> : null}
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
        border: '2px solid #111111',
        borderRadius: 24,
        background: '#ffffff',
        padding: 14,
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
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1.5px solid #111111',
            background: '#f7f4ee',
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
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: value.number ? '132px 1fr auto' : '132px 1fr',
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
              height: 56,
              border: '1.5px solid #111111',
              borderRadius: 18,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '0 12px',
              cursor: 'pointer',
              color: '#17130f',
              fontSize: 15,
              fontWeight: 900,
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
                width: 290,
                maxWidth: 'calc(100vw - 40px)',
                background: '#ffffff',
                border: '1.5px solid #111111',
                borderRadius: 22,
                boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                padding: 12,
                zIndex: 50,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#7a7268',
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
                  ...inputBaseStyle(),
                  padding: '12px 10px',
                  fontSize: 14,
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
                      border: '1.5px solid #111111',
                      background: '#fff',
                      borderRadius: 14,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span>{item.flag}</span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#17130f',
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
            ...inputBaseStyle(),
            height: 56,
          }}
        />

        {value.number ? <ClearValueButton onClick={onClear} title={clearTitle} /> : null}
      </div>
    </div>
  );
}

export default function AddServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isUserRegistered()) {
      router.replace(`/auth?next=${encodeURIComponent('/add')}`);
    }
  }, [router]);

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

  const [phone, setPhone] = useState<PhoneContactValue>({ countryCode: 'GB', number: '' });
  const [whatsapp, setWhatsapp] = useState<PhoneContactValue>({ countryCode: 'GB', number: '' });
  const [businessWhatsapp, setBusinessWhatsapp] = useState<PhoneContactValue>({
    countryCode: 'GB',
    number: '',
  });
  const [telegram, setTelegram] = useState<PhoneContactValue>({ countryCode: 'GB', number: '' });
  const [viber, setViber] = useState<PhoneContactValue>({ countryCode: 'GB', number: '' });

  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  const [photos, setPhotos] = useState<ServicePhotoItem[]>([]);

  useEffect(() => {
    setLanguage(getSavedLanguage());
    const unsub = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((item) => URL.revokeObjectURL(item.preview));
    };
    // cleanup only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text = textByLanguage[language] || textByLanguage.EN;
  const categories = categoriesByLanguage[language] || categoriesByLanguage.EN;

  const subcategories = useMemo(() => {
    return subcategoriesByCategory[category] || [];
  }, [category]);

  useEffect(() => {
    if (!subcategories.length) {
      setSubcategory('');
      return;
    }
    if (!subcategories.some((item) => item.value === subcategory)) {
      setSubcategory(subcategories[0].value);
    }
  }, [subcategory, subcategories]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const next = subcategoriesByCategory[value] || [];
    setSubcategory(next[0]?.value || '');
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;

    const imageFiles = nextFiles.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const availableSlots = Math.max(0, 20 - photos.length);
    if (!availableSlots) {
      event.target.value = '';
      return;
    }

    const mapped = imageFiles.slice(0, availableSlots).map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const found = prev.find((item) => item.id === photoId);
      if (found) URL.revokeObjectURL(found.preview);
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

  const handlePublish = () => {
    if (!isUserRegistered()) {
      router.replace(`/auth?next=${encodeURIComponent('/add')}`);
      return;
    }

    if (!title.trim()) {
      alert(text.enterServiceTitle);
      return;
    }

    if (!price.trim()) {
      alert(text.enterPrice);
      return;
    }

    if (!city.trim()) {
      alert(text.enterCity);
      return;
    }

    if (!district.trim()) {
      alert(text.enterDistrict);
      return;
    }

    const composedLocation = [city.trim(), district.trim(), addressDetails.trim()]
      .filter(Boolean)
      .join(', ');

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

    alert(text.published);
    router.push('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 124,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(247,244,238,0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #ddd4c7',
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
              border: '1.5px solid #d8d1c6',
              background: '#fff',
              fontSize: 28,
              color: '#1f2430',
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              cursor: 'pointer',
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
              background: '#f7f4ee',
              borderRadius: 30,
              border: '2px solid #111111',
              padding: 18,
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
                    color: '#17130f',
                  }}
                >
                  {text.photos}
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
                {text.requiredFields}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenFilePicker}
              style={{
                width: '100%',
                border: '1.5px solid #111111',
                background: '#ffffff',
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
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  border: '2px solid #4ea560',
                  color: '#4ea560',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
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
                    fontWeight: 900,
                    color: '#2d7b3c',
                  }}
                >
                  {text.uploadPhotos}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: '#7a8490',
                    fontWeight: 700,
                  }}
                >
                  {photos.length}/20
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
                        border: index === 0 ? '3px solid #2d7b3c' : '1.5px solid #111111',
                        background: '#f8f8f8',
                        aspectRatio: '1 / 1',
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
                          border: '1.5px solid #111111',
                          background: 'rgba(255,255,255,0.96)',
                          color: '#17130f',
                          fontSize: 20,
                          fontWeight: 900,
                          lineHeight: 1,
                          cursor: 'pointer',
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
          <SectionCard title={text.serviceInfo} required>
            <FieldLabel required>{text.serviceTitle}</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={text.serviceTitlePlaceholder}
              style={{
                ...inputBaseStyle(),
                marginBottom: 18,
              }}
            />

            <FieldLabel required>{text.description}</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.descriptionPlaceholder}
              rows={5}
              style={{
                ...inputBaseStyle(),
                resize: 'none',
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
                ...inputBaseStyle(),
                marginBottom: 18,
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
              style={inputBaseStyle()}
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
              style={inputBaseStyle()}
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
                ...inputBaseStyle(),
                marginBottom: 18,
              }}
            />

            <FieldLabel required>{text.district}</FieldLabel>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={text.districtPlaceholder}
              style={{
                ...inputBaseStyle(),
                marginBottom: 18,
              }}
            />

            <FieldLabel>{text.addressDetails}</FieldLabel>
            <textarea
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder={text.addressDetailsPlaceholder}
              rows={3}
              style={{
                ...inputBaseStyle(),
                resize: 'none',
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
              style={inputBaseStyle()}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.availability}>
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
                {text.availabilityHint}
              </div>

              <button
                type="button"
                onClick={() => setAvailableToday((v) => !v)}
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 999,
                  border: '1.5px solid #111111',
                  background: availableToday ? '#4f91f1' : '#d6dbe2',
                  position: 'relative',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: availableToday ? 31 : 3,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: '#fff',
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
              {[
                { active: atClient, set: setAtClient, label: text.atClient },
                { active: atMyPlace, set: setAtMyPlace, label: text.atMyPlace },
                { active: online, set: setOnline, label: text.online },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.set((v: boolean) => !v)}
                  style={{
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: item.active ? '#5aa764' : '#ffffff',
                    color: item.active ? '#ffffff' : '#17130f',
                    padding: '14px 10px',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
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
              {text.paymentHint}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { active: cash, set: setCash, label: text.cash, icon: '💵' },
                { active: card, set: setCard, label: text.card, icon: '💳' },
                { active: wallet, set: setWallet, label: text.wallet, icon: '👛' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.set((v: boolean) => !v)}
                  style={{
                    borderRadius: 20,
                    border: '1.5px solid #111111',
                    background: item.active ? '#eef5ff' : '#ffffff',
                    padding: '16px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  <span style={{ fontSize: 18 }}>{item.active ? '☑' : '☐'}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.contacts}>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.contactsHint}
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
          background: 'rgba(247,244,238,0.98)',
          borderTop: '1px solid #ddd4c7',
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
              border: '2px solid #111111',
              background: '#279ca2',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 18px',
              fontSize: 18,
              fontWeight: 900,
              boxShadow: '0 6px 0 rgba(17,17,17,0.08)',
              cursor: 'pointer',
            }}
          >
            {text.publish}
          </button>
        </div>
      </div>
    </main>
  );
}
