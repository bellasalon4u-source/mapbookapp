'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addListing } from '../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

const addServiceTexts = {
  EN: {
    title: 'Add your service',
    uploadPhotos: 'Upload photos',
    serviceTitle: 'Service title',
    serviceTitlePlaceholder: 'Enter service title',
    description: 'Description',
    descriptionPlaceholder: 'Describe your service...',
    category: 'Category',
    subcategory: 'Subcategory',
    price: 'Price',
    pricePlaceholder: 'Enter price',
    location: 'Location / area',
    locationPlaceholder: 'Select location / area',
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
    contact: 'Contact',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Publish service',
    enterServiceTitle: 'Please enter service title',
    enterPrice: 'Please enter price',
    success: 'Service published successfully',
    categories: {
      Beauty: 'Beauty',
      Wellness: 'Wellness',
      Home: 'Home',
      Repairs: 'Repairs',
      Tech: 'Tech',
      Pets: 'Pets',
      Auto: 'Auto',
      Moving: 'Moving',
      Activities: 'Activities',
      Events: 'Events',
      Creative: 'Creative',
    },
    subcategories: {
      Hair: 'Hair',
      Nails: 'Nails',
      Brows: 'Brows',
      Lashes: 'Lashes',
      Makeup: 'Makeup',
      Keratin: 'Keratin',
      Massage: 'Massage',
      Spa: 'Spa',
      Therapy: 'Therapy',
      Recovery: 'Recovery',
      Yoga: 'Yoga',
      Cleaning: 'Cleaning',
      Handyman: 'Handyman',
      Plumbing: 'Plumbing',
      Electrical: 'Electrical',
      'Furniture assembly': 'Furniture assembly',
      'Appliance repair': 'Appliance repair',
      'Phone repair': 'Phone repair',
      'Laptop repair': 'Laptop repair',
      'TV repair': 'TV repair',
      'Shoe repair': 'Shoe repair',
      Phone: 'Phone',
      Laptop: 'Laptop',
      Tablet: 'Tablet',
      'Computer help': 'Computer help',
      Setup: 'Setup',
      Grooming: 'Grooming',
      'Dog walking': 'Dog walking',
      'Pet sitting': 'Pet sitting',
      'Pet taxi': 'Pet taxi',
      Training: 'Training',
      'Car wash': 'Car wash',
      Detailing: 'Detailing',
      Diagnostics: 'Diagnostics',
      'Tire service': 'Tire service',
      Delivery: 'Delivery',
      'Moving help': 'Moving help',
      'Furniture transport': 'Furniture transport',
      Courier: 'Courier',
      Fitness: 'Fitness',
      Dance: 'Dance',
      Tutor: 'Tutor',
      'Kids activities': 'Kids activities',
      Decorator: 'Decorator',
      Host: 'Host',
      Photographer: 'Photographer',
      'Makeup for events': 'Makeup for events',
      Design: 'Design',
      Photo: 'Photo',
      Video: 'Video',
      Editing: 'Editing',
      'Content creation': 'Content creation',
    },
  },
  ES: {
    title: 'Añadir servicio',
    uploadPhotos: 'Subir fotos',
    serviceTitle: 'Título del servicio',
    serviceTitlePlaceholder: 'Introduce el título del servicio',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe tu servicio...',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    price: 'Precio',
    pricePlaceholder: 'Introduce el precio',
    location: 'Ubicación / zona',
    locationPlaceholder: 'Selecciona ubicación / zona',
    hours: 'Horario de trabajo',
    hoursPlaceholder: 'Selecciona horario',
    availableToday: 'Disponible hoy',
    availableTodayHint: 'Esto afecta al estado del pin en el mapa',
    atClient: 'En casa del cliente',
    atMyPlace: 'En mi local',
    online: 'Online',
    paymentMethods: 'Métodos de pago',
    paymentMethodsHint: '¿Cómo pueden pagar los clientes?',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Dinero electrónico',
    contact: 'Contacto',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Publicar servicio',
    enterServiceTitle: 'Por favor, introduce el título del servicio',
    enterPrice: 'Por favor, introduce el precio',
    success: 'Servicio publicado con éxito',
    categories: {
      Beauty: 'Belleza',
      Wellness: 'Bienestar',
      Home: 'Hogar',
      Repairs: 'Reparaciones',
      Tech: 'Tecnología',
      Pets: 'Mascotas',
      Auto: 'Auto',
      Moving: 'Mudanza',
      Activities: 'Actividades',
      Events: 'Eventos',
      Creative: 'Creativo',
    },
    subcategories: {
      Hair: 'Cabello',
      Nails: 'Uñas',
      Brows: 'Cejas',
      Lashes: 'Pestañas',
      Makeup: 'Maquillaje',
      Keratin: 'Keratina',
      Massage: 'Masaje',
      Spa: 'Spa',
      Therapy: 'Terapia',
      Recovery: 'Recuperación',
      Yoga: 'Yoga',
      Cleaning: 'Limpieza',
      Handyman: 'Manitas',
      Plumbing: 'Fontanería',
      Electrical: 'Electricidad',
      'Furniture assembly': 'Montaje de muebles',
      'Appliance repair': 'Reparación de electrodomésticos',
      'Phone repair': 'Reparación de teléfonos',
      'Laptop repair': 'Reparación de portátiles',
      'TV repair': 'Reparación de TV',
      'Shoe repair': 'Reparación de calzado',
      Phone: 'Teléfono',
      Laptop: 'Portátil',
      Tablet: 'Tablet',
      'Computer help': 'Ayuda informática',
      Setup: 'Configuración',
      Grooming: 'Peluquería',
      'Dog walking': 'Paseo de perros',
      'Pet sitting': 'Cuidado de mascotas',
      'Pet taxi': 'Taxi para mascotas',
      Training: 'Entrenamiento',
      'Car wash': 'Lavado de coches',
      Detailing: 'Detailing',
      Diagnostics: 'Diagnóstico',
      'Tire service': 'Servicio de neumáticos',
      Delivery: 'Entrega',
      'Moving help': 'Ayuda con mudanza',
      'Furniture transport': 'Transporte de muebles',
      Courier: 'Mensajería',
      Fitness: 'Fitness',
      Dance: 'Baile',
      Tutor: 'Tutor',
      'Kids activities': 'Actividades infantiles',
      Decorator: 'Decorador',
      Host: 'Anfitrión',
      Photographer: 'Fotógrafo',
      'Makeup for events': 'Maquillaje para eventos',
      Design: 'Diseño',
      Photo: 'Foto',
      Video: 'Vídeo',
      Editing: 'Edición',
      'Content creation': 'Creación de contenido',
    },
  },
  RU: {
    title: 'Добавить услугу',
    uploadPhotos: 'Загрузить фото',
    serviceTitle: 'Название услуги',
    serviceTitlePlaceholder: 'Введите название услуги',
    description: 'Описание',
    descriptionPlaceholder: 'Опишите вашу услугу...',
    category: 'Категория',
    subcategory: 'Подкатегория',
    price: 'Цена',
    pricePlaceholder: 'Введите цену',
    location: 'Локация / район',
    locationPlaceholder: 'Выберите локацию / район',
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
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Опубликовать услугу',
    enterServiceTitle: 'Пожалуйста, введите название услуги',
    enterPrice: 'Пожалуйста, введите цену',
    success: 'Услуга успешно опубликована',
    categories: {
      Beauty: 'Красота',
      Wellness: 'Велнес',
      Home: 'Дом',
      Repairs: 'Ремонт',
      Tech: 'Техника',
      Pets: 'Питомцы',
      Auto: 'Авто',
      Moving: 'Переезд',
      Activities: 'Активности',
      Events: 'События',
      Creative: 'Креатив',
    },
    subcategories: {
      Hair: 'Волосы',
      Nails: 'Ногти',
      Brows: 'Брови',
      Lashes: 'Ресницы',
      Makeup: 'Макияж',
      Keratin: 'Кератин',
      Massage: 'Массаж',
      Spa: 'Спа',
      Therapy: 'Терапия',
      Recovery: 'Восстановление',
      Yoga: 'Йога',
      Cleaning: 'Уборка',
      Handyman: 'Мастер на час',
      Plumbing: 'Сантехника',
      Electrical: 'Электрика',
      'Furniture assembly': 'Сборка мебели',
      'Appliance repair': 'Ремонт техники',
      'Phone repair': 'Ремонт телефонов',
      'Laptop repair': 'Ремонт ноутбуков',
      'TV repair': 'Ремонт телевизоров',
      'Shoe repair': 'Ремонт обуви',
      Phone: 'Телефон',
      Laptop: 'Ноутбук',
      Tablet: 'Планшет',
      'Computer help': 'Помощь с компьютером',
      Setup: 'Настройка',
      Grooming: 'Груминг',
      'Dog walking': 'Выгул собак',
      'Pet sitting': 'Передержка',
      'Pet taxi': 'Пет-такси',
      Training: 'Тренировка',
      'Car wash': 'Мойка авто',
      Detailing: 'Детейлинг',
      Diagnostics: 'Диагностика',
      'Tire service': 'Шиномонтаж',
      Delivery: 'Доставка',
      'Moving help': 'Помощь с переездом',
      'Furniture transport': 'Перевозка мебели',
      Courier: 'Курьер',
      Fitness: 'Фитнес',
      Dance: 'Танцы',
      Tutor: 'Репетитор',
      'Kids activities': 'Детские активности',
      Decorator: 'Декоратор',
      Host: 'Ведущий',
      Photographer: 'Фотограф',
      'Makeup for events': 'Макияж для мероприятий',
      Design: 'Дизайн',
      Photo: 'Фото',
      Video: 'Видео',
      Editing: 'Монтаж',
      'Content creation': 'Создание контента',
    },
  },
  CZ: {
    title: 'Přidat službu',
    uploadPhotos: 'Nahrát fotky',
    serviceTitle: 'Název služby',
    serviceTitlePlaceholder: 'Zadejte název služby',
    description: 'Popis',
    descriptionPlaceholder: 'Popište svou službu...',
    category: 'Kategorie',
    subcategory: 'Podkategorie',
    price: 'Cena',
    pricePlaceholder: 'Zadejte cenu',
    location: 'Lokalita / oblast',
    locationPlaceholder: 'Vyberte lokalitu / oblast',
    hours: 'Pracovní doba',
    hoursPlaceholder: 'Vyberte hodiny',
    availableToday: 'Dostupné dnes',
    availableTodayHint: 'To ovlivňuje stav pinu na mapě',
    atClient: 'U klienta',
    atMyPlace: 'U mě',
    online: 'Online',
    paymentMethods: 'Platební metody',
    paymentMethodsHint: 'Jak mohou klienti platit?',
    cash: 'Hotovost',
    card: 'Karta',
    wallet: 'Elektronické peníze',
    contact: 'Kontakt',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Publikovat službu',
    enterServiceTitle: 'Zadejte prosím název služby',
    enterPrice: 'Zadejte prosím cenu',
    success: 'Služba byla úspěšně publikována',
    categories: {
      Beauty: 'Krása',
      Wellness: 'Wellness',
      Home: 'Domov',
      Repairs: 'Opravy',
      Tech: 'Technika',
      Pets: 'Mazlíčci',
      Auto: 'Auto',
      Moving: 'Stěhování',
      Activities: 'Aktivity',
      Events: 'Události',
      Creative: 'Kreativa',
    },
    subcategories: {
      Hair: 'Vlasy',
      Nails: 'Nehty',
      Brows: 'Obočí',
      Lashes: 'Řasy',
      Makeup: 'Make-up',
      Keratin: 'Keratin',
      Massage: 'Masáž',
      Spa: 'Spa',
      Therapy: 'Terapie',
      Recovery: 'Regenerace',
      Yoga: 'Jóga',
      Cleaning: 'Úklid',
      Handyman: 'Hodinový manžel',
      Plumbing: 'Instalatérství',
      Electrical: 'Elektro',
      'Furniture assembly': 'Montáž nábytku',
      'Appliance repair': 'Oprava spotřebičů',
      'Phone repair': 'Oprava telefonu',
      'Laptop repair': 'Oprava notebooku',
      'TV repair': 'Oprava televize',
      'Shoe repair': 'Oprava obuvi',
      Phone: 'Telefon',
      Laptop: 'Notebook',
      Tablet: 'Tablet',
      'Computer help': 'Pomoc s počítačem',
      Setup: 'Nastavení',
      Grooming: 'Grooming',
      'Dog walking': 'Venčení psů',
      'Pet sitting': 'Hlídání mazlíčků',
      'Pet taxi': 'Pet taxi',
      Training: 'Trénink',
      'Car wash': 'Mytí auta',
      Detailing: 'Detailing',
      Diagnostics: 'Diagnostika',
      'Tire service': 'Pneuservis',
      Delivery: 'Doručení',
      'Moving help': 'Pomoc se stěhováním',
      'Furniture transport': 'Přeprava nábytku',
      Courier: 'Kurýr',
      Fitness: 'Fitness',
      Dance: 'Tanec',
      Tutor: 'Lektor',
      'Kids activities': 'Dětské aktivity',
      Decorator: 'Dekoratér',
      Host: 'Moderátor',
      Photographer: 'Fotograf',
      'Makeup for events': 'Make-up na akce',
      Design: 'Design',
      Photo: 'Foto',
      Video: 'Video',
      Editing: 'Editace',
      'Content creation': 'Tvorba obsahu',
    },
  },
  DE: {
    title: 'Service hinzufügen',
    uploadPhotos: 'Fotos hochladen',
    serviceTitle: 'Servicetitel',
    serviceTitlePlaceholder: 'Servicetitel eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibe deinen Service...',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    price: 'Preis',
    pricePlaceholder: 'Preis eingeben',
    location: 'Ort / Gebiet',
    locationPlaceholder: 'Ort / Gebiet auswählen',
    hours: 'Arbeitszeiten',
    hoursPlaceholder: 'Zeiten auswählen',
    availableToday: 'Heute verfügbar',
    availableTodayHint: 'Dies beeinflusst den Pin-Status auf der Karte',
    atClient: 'Beim Kunden',
    atMyPlace: 'Bei mir',
    online: 'Online',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsHint: 'Wie können Kunden bezahlen?',
    cash: 'Bar',
    card: 'Karte',
    wallet: 'E-Geld',
    contact: 'Kontakt',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Service veröffentlichen',
    enterServiceTitle: 'Bitte Servicetitel eingeben',
    enterPrice: 'Bitte Preis eingeben',
    success: 'Service erfolgreich veröffentlicht',
    categories: {
      Beauty: 'Beauty',
      Wellness: 'Wellness',
      Home: 'Zuhause',
      Repairs: 'Reparaturen',
      Tech: 'Technik',
      Pets: 'Haustiere',
      Auto: 'Auto',
      Moving: 'Umzug',
      Activities: 'Aktivitäten',
      Events: 'Events',
      Creative: 'Kreativ',
    },
    subcategories: {
      Hair: 'Haare',
      Nails: 'Nägel',
      Brows: 'Augenbrauen',
      Lashes: 'Wimpern',
      Makeup: 'Make-up',
      Keratin: 'Keratin',
      Massage: 'Massage',
      Spa: 'Spa',
      Therapy: 'Therapie',
      Recovery: 'Erholung',
      Yoga: 'Yoga',
      Cleaning: 'Reinigung',
      Handyman: 'Handwerker',
      Plumbing: 'Sanitär',
      Electrical: 'Elektrik',
      'Furniture assembly': 'Möbelmontage',
      'Appliance repair': 'Gerätereparatur',
      'Phone repair': 'Handyreparatur',
      'Laptop repair': 'Laptop-Reparatur',
      'TV repair': 'TV-Reparatur',
      'Shoe repair': 'Schuhreparatur',
      Phone: 'Telefon',
      Laptop: 'Laptop',
      Tablet: 'Tablet',
      'Computer help': 'Computerhilfe',
      Setup: 'Einrichtung',
      Grooming: 'Pflege',
      'Dog walking': 'Hunde ausführen',
      'Pet sitting': 'Tiersitting',
      'Pet taxi': 'Tier-Taxi',
      Training: 'Training',
      'Car wash': 'Autowäsche',
      Detailing: 'Detailing',
      Diagnostics: 'Diagnose',
      'Tire service': 'Reifenservice',
      Delivery: 'Lieferung',
      'Moving help': 'Umzugshilfe',
      'Furniture transport': 'Möbeltransport',
      Courier: 'Kurier',
      Fitness: 'Fitness',
      Dance: 'Tanz',
      Tutor: 'Nachhilfe',
      'Kids activities': 'Kinderaktivitäten',
      Decorator: 'Dekorateur',
      Host: 'Moderator',
      Photographer: 'Fotograf',
      'Makeup for events': 'Make-up für Events',
      Design: 'Design',
      Photo: 'Foto',
      Video: 'Video',
      Editing: 'Bearbeitung',
      'Content creation': 'Content-Erstellung',
    },
  },
  PL: {
    title: 'Dodaj usługę',
    uploadPhotos: 'Prześlij zdjęcia',
    serviceTitle: 'Nazwa usługi',
    serviceTitlePlaceholder: 'Wpisz nazwę usługi',
    description: 'Opis',
    descriptionPlaceholder: 'Opisz swoją usługę...',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    price: 'Cena',
    pricePlaceholder: 'Wpisz cenę',
    location: 'Lokalizacja / obszar',
    locationPlaceholder: 'Wybierz lokalizację / obszar',
    hours: 'Godziny pracy',
    hoursPlaceholder: 'Wybierz godziny',
    availableToday: 'Dostępne dziś',
    availableTodayHint: 'To wpływa na status pina na mapie',
    atClient: 'U klienta',
    atMyPlace: 'U mnie',
    online: 'Online',
    paymentMethods: 'Metody płatności',
    paymentMethodsHint: 'Jak klienci mogą zapłacić?',
    cash: 'Gotówka',
    card: 'Karta',
    wallet: 'Pieniądz elektroniczny',
    contact: 'Kontakt',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    publish: 'Opublikuj usługę',
    enterServiceTitle: 'Wpisz nazwę usługi',
    enterPrice: 'Wpisz cenę',
    success: 'Usługa została opublikowana',
    categories: {
      Beauty: 'Uroda',
      Wellness: 'Wellness',
      Home: 'Dom',
      Repairs: 'Naprawy',
      Tech: 'Technika',
      Pets: 'Zwierzęta',
      Auto: 'Auto',
      Moving: 'Przeprowadzka',
      Activities: 'Aktywności',
      Events: 'Wydarzenia',
      Creative: 'Kreatywne',
    },
    subcategories: {
      Hair: 'Włosy',
      Nails: 'Paznokcie',
      Brows: 'Brwi',
      Lashes: 'Rzęsy',
      Makeup: 'Makijaż',
      Keratin: 'Keratyna',
      Massage: 'Masaż',
      Spa: 'Spa',
      Therapy: 'Terapia',
      Recovery: 'Regeneracja',
      Yoga: 'Joga',
      Cleaning: 'Sprzątanie',
      Handyman: 'Złota rączka',
      Plumbing: 'Hydraulika',
      Electrical: 'Elektryka',
      'Furniture assembly': 'Montaż mebli',
      'Appliance repair': 'Naprawa sprzętu',
      'Phone repair': 'Naprawa telefonu',
      'Laptop repair': 'Naprawa laptopa',
      'TV repair': 'Naprawa telewizora',
      'Shoe repair': 'Naprawa butów',
      Phone: 'Telefon',
      Laptop: 'Laptop',
      Tablet: 'Tablet',
      'Computer help': 'Pomoc komputerowa',
      Setup: 'Konfiguracja',
      Grooming: 'Grooming',
      'Dog walking': 'Wyprowadzanie psów',
      'Pet sitting': 'Opieka nad zwierzętami',
      'Pet taxi': 'Taxi dla zwierząt',
      Training: 'Trening',
      'Car wash': 'Myjnia',
      Detailing: 'Detailing',
      Diagnostics: 'Diagnostyka',
      'Tire service': 'Serwis opon',
      Delivery: 'Dostawa',
      'Moving help': 'Pomoc przy przeprowadzce',
      'Furniture transport': 'Transport mebli',
      Courier: 'Kurier',
      Fitness: 'Fitness',
      Dance: 'Taniec',
      Tutor: 'Korepetytor',
      'Kids activities': 'Zajęcia dla dzieci',
      Decorator: 'Dekorator',
      Host: 'Prowadzący',
      Photographer: 'Fotograf',
      'Makeup for events': 'Makijaż na wydarzenia',
      Design: 'Design',
      Photo: 'Zdjęcie',
      Video: 'Wideo',
      Editing: 'Edycja',
      'Content creation': 'Tworzenie treści',
    },
  },
} as const;

const categoryKeys = [
  'Beauty',
  'Wellness',
  'Home',
  'Repairs',
  'Tech',
  'Pets',
  'Auto',
  'Moving',
  'Activities',
  'Events',
  'Creative',
] as const;

const subcategoriesByCategory: Record<string, string[]> = {
  Beauty: ['Hair', 'Nails', 'Brows', 'Lashes', 'Makeup', 'Keratin'],
  Wellness: ['Massage', 'Spa', 'Therapy', 'Recovery', 'Yoga'],
  Home: ['Cleaning', 'Handyman', 'Plumbing', 'Electrical', 'Furniture assembly'],
  Repairs: ['Appliance repair', 'Phone repair', 'Laptop repair', 'TV repair', 'Shoe repair'],
  Tech: ['Phone', 'Laptop', 'Tablet', 'Computer help', 'Setup'],
  Pets: ['Grooming', 'Dog walking', 'Pet sitting', 'Pet taxi', 'Training'],
  Auto: ['Car wash', 'Detailing', 'Diagnostics', 'Tire service'],
  Moving: ['Delivery', 'Moving help', 'Furniture transport', 'Courier'],
  Activities: ['Fitness', 'Dance', 'Tutor', 'Kids activities'],
  Events: ['Decorator', 'Host', 'Photographer', 'Makeup for events'],
  Creative: ['Design', 'Photo', 'Video', 'Editing', 'Content creation'],
};

export default function AddServicePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [subcategory, setSubcategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [availableToday, setAvailableToday] = useState(true);

  const [atClient, setAtClient] = useState(true);
  const [atMyPlace, setAtMyPlace] = useState(false);
  const [online, setOnline] = useState(false);

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [wallet, setWallet] = useState(false);

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  const text = addServiceTexts[language] || addServiceTexts.EN;

  const categories = categoryKeys.map((key) => ({
    value: key,
    label: text.categories[key],
  }));

  const subcategories = (subcategoriesByCategory[category] || []).map((key) => ({
    value: key,
    label: text.subcategories[key as keyof typeof text.subcategories] || key,
  }));

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const nextSubs = subcategoriesByCategory[value] || [];
    setSubcategory(nextSubs[0] || '');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert(text.enterServiceTitle);
      return;
    }

    if (!price.trim()) {
      alert(text.enterPrice);
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
      location: location.trim(),
      hours: hours.trim(),
      availableToday,
      serviceModes,
      paymentMethods,
      contact: {
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegram: telegram.trim(),
      },
      photos: [],
    });

    alert(text.success);
    router.push('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f5f1',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 120,
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
            gridTemplateColumns: '44px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 30,
              color: '#1f2430',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1f2430',
            }}
          >
            {text.title}
          </div>
        </header>

        <section style={{ padding: '18px 16px 0' }}>
          <button
            type="button"
            style={{
              width: '100%',
              border: '1px solid #dfe4de',
              background: '#fff',
              borderRadius: 18,
              padding: '18px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: '2px solid #4ea560',
                color: '#4ea560',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              +
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#2d7b3c',
              }}
            >
              {text.uploadPhotos}
            </span>
          </button>
        </section>

        <section style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {text.serviceTitle}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={text.serviceTitlePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {text.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.descriptionPlaceholder}
              rows={4}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.category}
            </div>

            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 14,
                background: '#fff',
              }}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.subcategory}
            </div>

            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
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
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {text.price}
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={text.pricePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {text.location}
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={text.locationPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {text.hours}
            </label>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={text.hoursPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {text.availableToday}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#7a8490',
                    marginTop: 4,
                  }}
                >
                  {text.availableTodayHint}
                </div>
              </div>

              <button
                onClick={() => setAvailableToday((v) => !v)}
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: availableToday ? '#4f91f1' : '#d6dbe2',
                  position: 'relative',
                  cursor: 'pointer',
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
                onClick={() => setAtClient((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: atClient ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atClient ? '#5aa764' : '#faf8f4',
                  color: atClient ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {text.atClient}
              </button>

              <button
                onClick={() => setAtMyPlace((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: atMyPlace ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atMyPlace ? '#5aa764' : '#faf8f4',
                  color: atMyPlace ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {text.atMyPlace}
              </button>

              <button
                onClick={() => setOnline((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: online ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: online ? '#5aa764' : '#faf8f4',
                  color: online ? '#fff' : '#1f2430',
                  padding: '13px 10px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {text.online}
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {text.paymentMethods}
            </div>

            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
              }}
            >
              {text.paymentMethodsHint}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              <button
                onClick={() => setCash((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: cash ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: cash ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>💵</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.cash}</span>
                <span style={{ fontSize: 18 }}>{cash ? '☑' : '☐'}</span>
              </button>

              <button
                onClick={() => setCard((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: card ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: card ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>💳</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.card}</span>
                <span style={{ fontSize: 18 }}>{card ? '☑' : '☐'}</span>
              </button>

              <button
                onClick={() => setWallet((v) => !v)}
                style={{
                  borderRadius: 14,
                  border: wallet ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: wallet ? '#eef5ff' : '#fff',
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1f2430',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>👛</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.wallet}</span>
                <span style={{ fontSize: 18 }}>{wallet ? '☑' : '☐'}</span>
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '14px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              border: '1px solid #ebe4da',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.contact}
            </div>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={text.phone}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={text.whatsapp}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder={text.telegram}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 14,
                padding: '15px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
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
            onClick={handlePublish}
            style={{
              width: '100%',
              border: 'none',
              background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
              color: '#fff',
              borderRadius: 18,
              padding: '18px 18px',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
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
