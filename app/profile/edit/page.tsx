'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

type CountryOption = {
  code: string;
  dial: string;
  flag: string;
  label: string;
};

type ContactKey =
  | 'whatsapp'
  | 'businessWhatsapp'
  | 'telegram'
  | 'viber'
  | 'instagram'
  | 'website'
  | 'email';

type PhoneContactKey = 'whatsapp' | 'businessWhatsapp' | 'telegram' | 'viber';

type ContactItem = {
  key: ContactKey;
  iconKey:
    | 'whatsapp'
    | 'businessWhatsapp'
    | 'telegram'
    | 'viber'
    | 'instagram'
    | 'website'
    | 'email';
  title: Record<AppLanguage, string>;
  placeholder: Record<AppLanguage, string>;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange';
  type: 'phone' | 'text';
};

type PhoneContactValue = {
  countryCode: string;
  number: string;
};

type ExtraProfileData = {
  district: string;
  address: string;
  contacts: Record<ContactKey, string>;
  avatarHistory: string[];
  contactPhoneMeta?: Partial<Record<PhoneContactKey, PhoneContactValue>>;
  selectedCountryCode?: string;
  postcode?: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
};

type AddressSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  postcode?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  lat?: number;
  lng?: number;
};

const EXTRA_PROFILE_STORAGE_KEY = 'mapbook_profile_extra_v2';
const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const COUNTRIES: CountryOption[] = [
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', label: 'Czech Republic' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', label: 'Ukraine' },
  { code: 'PL', dial: '+48', flag: '🇵🇱', label: 'Poland' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', label: 'Germany' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', label: 'Spain' },
  { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', label: 'United Arab Emirates' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', label: 'France' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', label: 'Italy' },
  { code: 'NL', dial: '+31', flag: '🇳🇱', label: 'Netherlands' },
  { code: 'BE', dial: '+32', flag: '🇧🇪', label: 'Belgium' },
];

const CONTACT_ITEMS: ContactItem[] = [
  {
    key: 'whatsapp',
    iconKey: 'whatsapp',
    accent: 'green',
    type: 'phone',
    title: {
      EN: 'WhatsApp',
      ES: 'WhatsApp',
      RU: 'WhatsApp',
      UA: 'WhatsApp',
      CZ: 'WhatsApp',
      DE: 'WhatsApp',
      IT: 'WhatsApp',
      FR: 'WhatsApp',
      AR: 'واتساب',
      PL: 'WhatsApp',
    },
    placeholder: {
      EN: 'Phone number',
      ES: 'Número de teléfono',
      RU: 'Номер телефона',
      UA: 'Номер телефону',
      CZ: 'Telefonní číslo',
      DE: 'Telefonnummer',
      IT: 'Numero di telefono',
      FR: 'Numéro de téléphone',
      AR: 'رقم الهاتف',
      PL: 'Numer telefonu',
    },
  },
  {
    key: 'businessWhatsapp',
    iconKey: 'businessWhatsapp',
    accent: 'green',
    type: 'phone',
    title: {
      EN: 'Business WhatsApp',
      ES: 'WhatsApp Business',
      RU: 'Business WhatsApp',
      UA: 'Business WhatsApp',
      CZ: 'Business WhatsApp',
      DE: 'Business WhatsApp',
      IT: 'WhatsApp Business',
      FR: 'WhatsApp Business',
      AR: 'واتساب للأعمال',
      PL: 'Business WhatsApp',
    },
    placeholder: {
      EN: 'Business number',
      ES: 'Número de negocio',
      RU: 'Рабочий номер',
      UA: 'Робочий номер',
      CZ: 'Firemní číslo',
      DE: 'Business-Nummer',
      IT: 'Numero business',
      FR: 'Numéro professionnel',
      AR: 'رقم العمل',
      PL: 'Numer firmowy',
    },
  },
  {
    key: 'telegram',
    iconKey: 'telegram',
    accent: 'blue',
    type: 'phone',
    title: {
      EN: 'Telegram',
      ES: 'Telegram',
      RU: 'Telegram',
      UA: 'Telegram',
      CZ: 'Telegram',
      DE: 'Telegram',
      IT: 'Telegram',
      FR: 'Telegram',
      AR: 'تيليجرام',
      PL: 'Telegram',
    },
    placeholder: {
      EN: 'Phone number',
      ES: 'Número de teléfono',
      RU: 'Номер телефона',
      UA: 'Номер телефону',
      CZ: 'Telefonní číslo',
      DE: 'Telefonnummer',
      IT: 'Numero di telefono',
      FR: 'Numéro de téléphone',
      AR: 'رقم الهاتف',
      PL: 'Numer telefonu',
    },
  },
  {
    key: 'viber',
    iconKey: 'viber',
    accent: 'violet',
    type: 'phone',
    title: {
      EN: 'Viber',
      ES: 'Viber',
      RU: 'Viber',
      UA: 'Viber',
      CZ: 'Viber',
      DE: 'Viber',
      IT: 'Viber',
      FR: 'Viber',
      AR: 'فايبر',
      PL: 'Viber',
    },
    placeholder: {
      EN: 'Phone number',
      ES: 'Número de teléfono',
      RU: 'Номер телефона',
      UA: 'Номер телефону',
      CZ: 'Telefonní číslo',
      DE: 'Telefonnummer',
      IT: 'Numero di telefono',
      FR: 'Numéro de téléphone',
      AR: 'رقم الهاتف',
      PL: 'Numer telefonu',
    },
  },
  {
    key: 'instagram',
    iconKey: 'instagram',
    accent: 'pink',
    type: 'text',
    title: {
      EN: 'Instagram',
      ES: 'Instagram',
      RU: 'Instagram',
      UA: 'Instagram',
      CZ: 'Instagram',
      DE: 'Instagram',
      IT: 'Instagram',
      FR: 'Instagram',
      AR: 'إنستغرام',
      PL: 'Instagram',
    },
    placeholder: {
      EN: '@username',
      ES: '@usuario',
      RU: '@username',
      UA: '@username',
      CZ: '@uživatel',
      DE: '@benutzername',
      IT: '@username',
      FR: '@nom',
      AR: '@اسم_المستخدم',
      PL: '@nazwa',
    },
  },
  {
    key: 'website',
    iconKey: 'website',
    accent: 'orange',
    type: 'text',
    title: {
      EN: 'Website',
      ES: 'Sitio web',
      RU: 'Сайт',
      UA: 'Сайт',
      CZ: 'Web',
      DE: 'Website',
      IT: 'Sito web',
      FR: 'Site web',
      AR: 'الموقع',
      PL: 'Strona',
    },
    placeholder: {
      EN: 'https://your-site.com',
      ES: 'https://tu-sitio.com',
      RU: 'https://ваш-сайт.com',
      UA: 'https://ваш-сайт.com',
      CZ: 'https://vas-web.cz',
      DE: 'https://deine-seite.de',
      IT: 'https://tuo-sito.it',
      FR: 'https://votre-site.fr',
      AR: 'https://your-site.com',
      PL: 'https://twoja-strona.pl',
    },
  },
  {
    key: 'email',
    iconKey: 'email',
    accent: 'blue',
    type: 'text',
    title: {
      EN: 'Email',
      ES: 'Email',
      RU: 'Email',
      UA: 'Email',
      CZ: 'Email',
      DE: 'E-Mail',
      IT: 'Email',
      FR: 'Email',
      AR: 'البريد الإلكتروني',
      PL: 'Email',
    },
    placeholder: {
      EN: 'name@example.com',
      ES: 'nombre@ejemplo.com',
      RU: 'name@example.com',
      UA: 'name@example.com',
      CZ: 'jmeno@priklad.cz',
      DE: 'name@beispiel.de',
      IT: 'nome@esempio.it',
      FR: 'nom@exemple.fr',
      AR: 'name@example.com',
      PL: 'name@przyklad.pl',
    },
  },
];

const editProfileTexts: Record<
  AppLanguage,
  {
    title: string;
    save: string;
    subtitle: string;
    profilePhoto: string;
    uploadFromCamera: string;
    uploadFromGallery: string;
    uploadFromFiles: string;
    recentPhotos: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    bio: string;
    bioPlaceholder: string;
    contacts: string;
    contactsHint: string;
    cityPlaceholder: string;
    districtPlaceholder: string;
    addressPlaceholder: string;
    phonePlaceholder: string;
    countrySearch: string;
    chooseCountry: string;
    emailSmartHint: string;
    saved: string;
    basicInfo: string;
    locationInfo: string;
    required: string;
    optional: string;
    country: string;
    clearHistory: string;
  }
> = {
  EN: {
    title: 'Edit profile',
    save: 'Save',
    subtitle: 'Profile, contacts and location',
    profilePhoto: 'Profile photo',
    uploadFromCamera: 'Camera',
    uploadFromGallery: 'Gallery',
    uploadFromFiles: 'Files',
    recentPhotos: 'Photo history',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    city: 'City',
    district: 'Area / district',
    address: 'Detailed address',
    bio: 'About me',
    bioPlaceholder: 'Tell us a little about yourself',
    contacts: 'Contacts',
    contactsHint: 'Fill only the contacts you want to show on your profile.',
    cityPlaceholder: 'Select city',
    districtPlaceholder: 'Select area / district',
    addressPlaceholder: 'Street, house, flat, notes',
    phonePlaceholder: 'Phone number',
    countrySearch: 'Search country or code',
    chooseCountry: 'Choose a country',
    emailSmartHint: 'Use a real email for bookings and notifications',
    saved: 'Profile saved',
    basicInfo: 'Basic information',
    locationInfo: 'Location',
    required: 'Required',
    optional: 'Optional',
    country: 'Country',
    clearHistory: 'Clear history',
  },
  ES: {
    title: 'Editar perfil',
    save: 'Guardar',
    subtitle: 'Perfil, contactos y ubicación',
    profilePhoto: 'Foto de perfil',
    uploadFromCamera: 'Cámara',
    uploadFromGallery: 'Galería',
    uploadFromFiles: 'Archivos',
    recentPhotos: 'Historial de fotos',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    city: 'Ciudad',
    district: 'Zona / distrito',
    address: 'Dirección detallada',
    bio: 'Sobre mí',
    bioPlaceholder: 'Cuéntanos un poco sobre ti',
    contacts: 'Contactos',
    contactsHint: 'Completa solo los contactos que quieras mostrar en tu perfil.',
    cityPlaceholder: 'Selecciona ciudad',
    districtPlaceholder: 'Selecciona zona / distrito',
    addressPlaceholder: 'Calle, casa, piso, notas',
    phonePlaceholder: 'Número de teléfono',
    countrySearch: 'Buscar país o código',
    chooseCountry: 'Elegir país',
    emailSmartHint: 'Usa un email real para reservas y notificaciones',
    saved: 'Perfil guardado',
    basicInfo: 'Información básica',
    locationInfo: 'Ubicación',
    required: 'Obligatorio',
    optional: 'Opcional',
    country: 'País',
    clearHistory: 'Borrar historial',
  },
  RU: {
    title: 'Редактировать профиль',
    save: 'Сохранить',
    subtitle: 'Профиль, контакты и локация',
    profilePhoto: 'Фото профиля',
    uploadFromCamera: 'Камера',
    uploadFromGallery: 'Галерея',
    uploadFromFiles: 'Файлы',
    recentPhotos: 'История фото',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    city: 'Город',
    district: 'Район / локация',
    address: 'Подробный адрес',
    bio: 'О себе',
    bioPlaceholder: 'Расскажите немного о себе',
    contacts: 'Контакты',
    contactsHint: 'Заполняйте только те контакты, которые хотите показывать в профиле.',
    cityPlaceholder: 'Выберите город',
    districtPlaceholder: 'Выберите район / локацию',
    addressPlaceholder: 'Улица, дом, квартира, заметки',
    phonePlaceholder: 'Номер телефона',
    countrySearch: 'Поиск страны или кода',
    chooseCountry: 'Выберите страну',
    emailSmartHint: 'Используйте реальный email для бронирований и уведомлений',
    saved: 'Профиль сохранён',
    basicInfo: 'Основная информация',
    locationInfo: 'Локация',
    required: 'Обязательно',
    optional: 'Необязательно',
    country: 'Страна',
    clearHistory: 'Очистить историю',
  },
  UA: {
    title: 'Редагувати профіль',
    save: 'Зберегти',
    subtitle: 'Профіль, контакти та локація',
    profilePhoto: 'Фото профілю',
    uploadFromCamera: 'Камера',
    uploadFromGallery: 'Галерея',
    uploadFromFiles: 'Файли',
    recentPhotos: 'Історія фото',
    firstName: "Ім'я",
    lastName: 'Прізвище',
    phone: 'Телефон',
    city: 'Місто',
    district: 'Район / локація',
    address: 'Детальна адреса',
    bio: 'Про себе',
    bioPlaceholder: 'Розкажіть трохи про себе',
    contacts: 'Контакти',
    contactsHint: 'Заповнюйте лише ті контакти, які хочете показувати у профілі.',
    cityPlaceholder: 'Оберіть місто',
    districtPlaceholder: 'Оберіть район / локацію',
    addressPlaceholder: 'Вулиця, будинок, квартира, нотатки',
    phonePlaceholder: 'Номер телефону',
    countrySearch: 'Пошук країни або коду',
    chooseCountry: 'Оберіть країну',
    emailSmartHint: 'Використовуйте реальний email для бронювань і сповіщень',
    saved: 'Профіль збережено',
    basicInfo: 'Основна інформація',
    locationInfo: 'Локація',
    required: "Обов'язково",
    optional: 'Необовʼязково',
    country: 'Країна',
    clearHistory: 'Очистити історію',
  },
  CZ: {
    title: 'Upravit profil',
    save: 'Uložit',
    subtitle: 'Profil, kontakty a poloha',
    profilePhoto: 'Profilová fotka',
    uploadFromCamera: 'Kamera',
    uploadFromGallery: 'Galerie',
    uploadFromFiles: 'Soubory',
    recentPhotos: 'Historie fotek',
    firstName: 'Jméno',
    lastName: 'Příjmení',
    phone: 'Telefon',
    city: 'Město',
    district: 'Oblast / lokalita',
    address: 'Podrobná adresa',
    bio: 'O mně',
    bioPlaceholder: 'Řekněte něco o sobě',
    contacts: 'Kontakty',
    contactsHint: 'Vyplňte jen kontakty, které chcete zobrazit v profilu.',
    cityPlaceholder: 'Vyberte město',
    districtPlaceholder: 'Vyberte oblast / lokalitu',
    addressPlaceholder: 'Ulice, dům, byt, poznámky',
    phonePlaceholder: 'Telefonní číslo',
    countrySearch: 'Hledat stát nebo kód',
    chooseCountry: 'Vyberte stát',
    emailSmartHint: 'Použijte skutečný email pro rezervace a oznámení',
    saved: 'Profil uložen',
    basicInfo: 'Základní informace',
    locationInfo: 'Poloha',
    required: 'Povinné',
    optional: 'Volitelné',
    country: 'Stát',
    clearHistory: 'Vymazat historii',
  },
  DE: {
    title: 'Profil bearbeiten',
    save: 'Speichern',
    subtitle: 'Profil, Kontakte und Standort',
    profilePhoto: 'Profilfoto',
    uploadFromCamera: 'Kamera',
    uploadFromGallery: 'Galerie',
    uploadFromFiles: 'Dateien',
    recentPhotos: 'Fotoverlauf',
    firstName: 'Vorname',
    lastName: 'Nachname',
    phone: 'Telefon',
    city: 'Stadt',
    district: 'Bereich / Standort',
    address: 'Genaue Adresse',
    bio: 'Über mich',
    bioPlaceholder: 'Erzähl etwas über dich',
    contacts: 'Kontakte',
    contactsHint: 'Fülle nur die Kontakte aus, die du im Profil zeigen willst.',
    cityPlaceholder: 'Stadt auswählen',
    districtPlaceholder: 'Bereich / Standort auswählen',
    addressPlaceholder: 'Straße, Haus, Wohnung, Hinweise',
    phonePlaceholder: 'Telefonnummer',
    countrySearch: 'Land oder Vorwahl suchen',
    chooseCountry: 'Land wählen',
    emailSmartHint: 'Nutze eine echte E-Mail für Buchungen und Benachrichtigungen',
    saved: 'Profil gespeichert',
    basicInfo: 'Grundinformationen',
    locationInfo: 'Standort',
    required: 'Pflicht',
    optional: 'Optional',
    country: 'Land',
    clearHistory: 'Verlauf löschen',
  },
  IT: {
    title: 'Modifica profilo',
    save: 'Salva',
    subtitle: 'Profilo, contatti e posizione',
    profilePhoto: 'Foto profilo',
    uploadFromCamera: 'Fotocamera',
    uploadFromGallery: 'Galleria',
    uploadFromFiles: 'File',
    recentPhotos: 'Cronologia foto',
    firstName: 'Nome',
    lastName: 'Cognome',
    phone: 'Telefono',
    city: 'Città',
    district: 'Zona / area',
    address: 'Indirizzo dettagliato',
    bio: 'Su di me',
    bioPlaceholder: 'Raccontaci qualcosa di te',
    contacts: 'Contatti',
    contactsHint: 'Compila solo i contatti che vuoi mostrare nel profilo.',
    cityPlaceholder: 'Seleziona città',
    districtPlaceholder: 'Seleziona zona / area',
    addressPlaceholder: 'Via, numero, appartamento, note',
    phonePlaceholder: 'Numero di telefono',
    countrySearch: 'Cerca paese o prefisso',
    chooseCountry: 'Scegli un paese',
    emailSmartHint: 'Usa un’email reale per prenotazioni e notifiche',
    saved: 'Profilo salvato',
    basicInfo: 'Informazioni di base',
    locationInfo: 'Posizione',
    required: 'Obbligatorio',
    optional: 'Opzionale',
    country: 'Paese',
    clearHistory: 'Cancella cronologia',
  },
  FR: {
    title: 'Modifier le profil',
    save: 'Enregistrer',
    subtitle: 'Profil, contacts et localisation',
    profilePhoto: 'Photo de profil',
    uploadFromCamera: 'Caméra',
    uploadFromGallery: 'Galerie',
    uploadFromFiles: 'Fichiers',
    recentPhotos: 'Historique des photos',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Téléphone',
    city: 'Ville',
    district: 'Zone / quartier',
    address: 'Adresse détaillée',
    bio: 'À propos de moi',
    bioPlaceholder: 'Parlez un peu de vous',
    contacts: 'Contacts',
    contactsHint: 'Remplissez uniquement les contacts que vous souhaitez afficher.',
    cityPlaceholder: 'Sélectionnez une ville',
    districtPlaceholder: 'Sélectionnez une zone / un quartier',
    addressPlaceholder: 'Rue, maison, appartement, notes',
    phonePlaceholder: 'Numéro de téléphone',
    countrySearch: 'Rechercher un pays ou un code',
    chooseCountry: 'Choisir un pays',
    emailSmartHint: 'Utilisez un vrai email pour les réservations et notifications',
    saved: 'Profil enregistré',
    basicInfo: 'Informations de base',
    locationInfo: 'Localisation',
    required: 'Obligatoire',
    optional: 'Optionnel',
    country: 'Pays',
    clearHistory: 'Effacer l’historique',
  },
  AR: {
    title: 'تعديل الملف الشخصي',
    save: 'حفظ',
    subtitle: 'الملف الشخصي وجهات الاتصال والموقع',
    profilePhoto: 'صورة الملف الشخصي',
    uploadFromCamera: 'الكاميرا',
    uploadFromGallery: 'المعرض',
    uploadFromFiles: 'الملفات',
    recentPhotos: 'سجل الصور',
    firstName: 'الاسم',
    lastName: 'اللقب',
    phone: 'الهاتف',
    city: 'المدينة',
    district: 'المنطقة / الحي',
    address: 'العنوان التفصيلي',
    bio: 'نبذة عني',
    bioPlaceholder: 'اكتب قليلاً عن نفسك',
    contacts: 'جهات الاتصال',
    contactsHint: 'املأ فقط وسائل الاتصال التي تريد إظهارها في الملف.',
    cityPlaceholder: 'اختر المدينة',
    districtPlaceholder: 'اختر المنطقة / الحي',
    addressPlaceholder: 'الشارع، المنزل، الشقة، ملاحظات',
    phonePlaceholder: 'رقم الهاتف',
    countrySearch: 'ابحث عن دولة أو رمز',
    chooseCountry: 'اختر دولة',
    emailSmartHint: 'استخدم بريداً حقيقياً للحجوزات والإشعارات',
    saved: 'تم حفظ الملف الشخصي',
    basicInfo: 'المعلومات الأساسية',
    locationInfo: 'الموقع',
    required: 'مطلوب',
    optional: 'اختياري',
    country: 'الدولة',
    clearHistory: 'مسح السجل',
  },
  PL: {
    title: 'Edytuj profil',
    save: 'Zapisz',
    subtitle: 'Profil, kontakty i lokalizacja',
    profilePhoto: 'Zdjęcie profilowe',
    uploadFromCamera: 'Aparat',
    uploadFromGallery: 'Galeria',
    uploadFromFiles: 'Pliki',
    recentPhotos: 'Historia zdjęć',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    phone: 'Telefon',
    city: 'Miasto',
    district: 'Obszar / lokalizacja',
    address: 'Dokładny adres',
    bio: 'O mnie',
    bioPlaceholder: 'Napisz coś o sobie',
    contacts: 'Kontakty',
    contactsHint: 'Uzupełnij tylko te kontakty, które chcesz pokazać w profilu.',
    cityPlaceholder: 'Wybierz miasto',
    districtPlaceholder: 'Wybierz obszar / lokalizację',
    addressPlaceholder: 'Ulica, dom, mieszkanie, notatki',
    phonePlaceholder: 'Numer telefonu',
    countrySearch: 'Szukaj kraju lub kodu',
    chooseCountry: 'Wybierz kraj',
    emailSmartHint: 'Użyj prawdziwego emaila do rezerwacji i powiadomień',
    saved: 'Profil zapisany',
    basicInfo: 'Podstawowe informacje',
    locationInfo: 'Lokalizacja',
    required: 'Wymagane',
    optional: 'Opcjonalne',
    country: 'Kraj',
    clearHistory: 'Wyczyść historię',
  },
};

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return {
      firstName: parts[0] || '',
      lastName: '',
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function getDefaultCountryByPhone(phone: string) {
  const normalized = phone.trim();
  return COUNTRIES.find((country) => normalized.startsWith(country.dial)) || COUNTRIES[0];
}

function stripDialCode(phone: string, dial: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith(dial)) {
    return trimmed.slice(dial.length).trim();
  }
  return trimmed.replace(/[^\d]/g, '');
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d\s()-]/g, '');
}

function combinePhone(country: CountryOption, number: string) {
  const clean = number.trim();
  if (!clean) return '';
  return `${country.dial} ${clean}`.trim();
}

function parseStoredPhoneContact(value: string): PhoneContactValue {
  const fallbackCountry = COUNTRIES[0];
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return {
      countryCode: fallbackCountry.code,
      number: '',
    };
  }

  const matchedCountry =
    COUNTRIES.find((country) => trimmed.startsWith(country.dial)) || fallbackCountry;

  return {
    countryCode: matchedCountry.code,
    number: stripDialCode(trimmed, matchedCountry.dial),
  };
}

function emptyContacts(): Record<ContactKey, string> {
  return {
    whatsapp: '',
    businessWhatsapp: '',
    telegram: '',
    viber: '',
    instagram: '',
    website: '',
    email: '',
  };
}

function emptyPhoneMeta(): Record<PhoneContactKey, PhoneContactValue> {
  return {
    whatsapp: { countryCode: 'GB', number: '' },
    businessWhatsapp: { countryCode: 'GB', number: '' },
    telegram: { countryCode: 'GB', number: '' },
    viber: { countryCode: 'GB', number: '' },
  };
}

function readExtraProfileData(): ExtraProfileData {
  if (typeof window === 'undefined') {
    return {
      district: '',
      address: '',
      contacts: emptyContacts(),
      avatarHistory: [],
      contactPhoneMeta: emptyPhoneMeta(),
      selectedCountryCode: 'GB',
      postcode: '',
      formattedAddress: '',
      lat: undefined,
      lng: undefined,
    };
  }

  try {
    const raw = window.localStorage.getItem(EXTRA_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        district: '',
        address: '',
        contacts: emptyContacts(),
        avatarHistory: [],
        contactPhoneMeta: emptyPhoneMeta(),
        selectedCountryCode: 'GB',
        postcode: '',
        formattedAddress: '',
        lat: undefined,
        lng: undefined,
      };
    }

    const parsed = JSON.parse(raw) as Partial<ExtraProfileData>;
    const contacts = {
      whatsapp: parsed.contacts?.whatsapp || '',
      businessWhatsapp: parsed.contacts?.businessWhatsapp || '',
      telegram: parsed.contacts?.telegram || '',
      viber: parsed.contacts?.viber || '',
      instagram: parsed.contacts?.instagram || '',
      website: parsed.contacts?.website || '',
      email: parsed.contacts?.email || '',
    };

    return {
      district: parsed.district || '',
      address: parsed.address || '',
      contacts,
      avatarHistory: Array.isArray(parsed.avatarHistory) ? parsed.avatarHistory : [],
      contactPhoneMeta: {
        whatsapp:
          parsed.contactPhoneMeta?.whatsapp || parseStoredPhoneContact(contacts.whatsapp),
        businessWhatsapp:
          parsed.contactPhoneMeta?.businessWhatsapp ||
          parseStoredPhoneContact(contacts.businessWhatsapp),
        telegram:
          parsed.contactPhoneMeta?.telegram || parseStoredPhoneContact(contacts.telegram),
        viber: parsed.contactPhoneMeta?.viber || parseStoredPhoneContact(contacts.viber),
      },
      selectedCountryCode: parsed.selectedCountryCode || 'GB',
      postcode: parsed.postcode || '',
      formattedAddress: parsed.formattedAddress || '',
      lat: parsed.lat,
      lng: parsed.lng,
    };
  } catch {
    return {
      district: '',
      address: '',
      contacts: emptyContacts(),
      avatarHistory: [],
      contactPhoneMeta: emptyPhoneMeta(),
      selectedCountryCode: 'GB',
      postcode: '',
      formattedAddress: '',
      lat: undefined,
      lng: undefined,
    };
  }
}

function saveExtraProfileData(data: ExtraProfileData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(EXTRA_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

function getAccentColors(accent: ContactItem['accent']) {
  if (accent === 'green') return { bg: '#edf9ef', border: '#111111', text: '#1f8f49' };
  if (accent === 'blue') return { bg: '#edf4ff', border: '#111111', text: '#2f7cf6' };
  if (accent === 'violet') return { bg: '#f3efff', border: '#111111', text: '#7a5af8' };
  if (accent === 'orange') return { bg: '#fff4e7', border: '#111111', text: '#d68612' };
  return { bg: '#fff0f6', border: '#111111', text: '#ff4fa0' };
}

function normalizeUkPostcode(value: string) {
  return value.toUpperCase().replace(/\s+/g, '').trim();
}

async function fetchUkPostcodeSuggestions(query: string): Promise<AddressSuggestion[]> {
  const normalized = normalizeUkPostcode(query);
  if (!normalized || normalized.length < 3) return [];

  const autoRes = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}/autocomplete?limit=6`
  );

  if (!autoRes.ok) return [];

  const autoData = await autoRes.json();
  const codes: string[] = Array.isArray(autoData?.result) ? autoData.result : [];

  if (!codes.length) return [];

  const details = await Promise.all(
    codes.map(async (code) => {
      const res = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(code.replace(/\s+/g, ''))}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const item = data?.result;
      if (!item) return null;

      const cityValue =
        item.admin_district || item.parish || item.admin_ward || item.region || '';
      const districtValue = item.admin_ward || item.parliamentary_constituency || '';
      const subtitle = [item.admin_district, item.region, item.country].filter(Boolean).join(', ');

      return {
        id: `uk-${item.postcode}`,
        title: item.postcode,
        subtitle,
        postcode: item.postcode,
        city: cityValue,
        district: districtValue,
        addressLine: item.postcode,
        lat: item.latitude,
        lng: item.longitude,
      } as AddressSuggestion;
    })
  );

  return details.filter(Boolean) as AddressSuggestion[];
}

async function fetchGlobalAddressSuggestions(
  query: string,
  countryCode: string
): Promise<AddressSuggestion[]> {
  if (!MAPBOX_PUBLIC_TOKEN || query.trim().length < 3) return [];

  const res = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      query
    )}&access_token=${encodeURIComponent(
      MAPBOX_PUBLIC_TOKEN
    )}&limit=6&country=${encodeURIComponent(countryCode.toLowerCase())}&types=address,street,place,postcode`
  );

  if (!res.ok) return [];

  const data = await res.json();
  const features = Array.isArray(data?.features) ? data.features : [];

  return features.map((feature: any, index: number) => {
    const context = Array.isArray(feature.properties?.context)
      ? feature.properties.context
      : [];

    const postcodeCtx = context.find((c: any) => c?.id?.startsWith('postcode'));
    const placeCtx = context.find((c: any) => c?.id?.startsWith('place'));
    const districtCtx =
      context.find((c: any) => c?.id?.startsWith('district')) ||
      context.find((c: any) => c?.id?.startsWith('locality')) ||
      context.find((c: any) => c?.id?.startsWith('neighborhood'));

    const title =
      feature.properties?.name ||
      feature.properties?.full_address ||
      feature.name ||
      query;

    const subtitle =
      feature.properties?.place_formatted ||
      feature.properties?.full_address ||
      '';

    const coords = Array.isArray(feature.geometry?.coordinates)
      ? feature.geometry.coordinates
      : [];

    return {
      id: feature.id || `mapbox-${index}`,
      title,
      subtitle,
      postcode: postcodeCtx?.name || '',
      city: placeCtx?.name || '',
      district: districtCtx?.name || '',
      addressLine: feature.properties?.full_address || title,
      lat: coords[1],
      lng: coords[0],
    } as AddressSuggestion;
  });
}

function FieldHeader({
  title,
  helper,
}: {
  title: string;
  helper: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10,
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 900, color: '#17130f' }}>{title}</span>
      <span style={{ fontSize: 12, fontWeight: 900, color: '#8a7f74' }}>{helper}</span>
    </div>
  );
}

function ContactBrandIcon({
  iconKey,
  size = 20,
}: {
  iconKey: ContactItem['iconKey'];
  size?: number;
}) {
  const commonSvgStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'block',
  };

  if (iconKey === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <path
          fill="#25D366"
          d="M12 2C6.48 2 2 6.3 2 11.62c0 1.86.55 3.6 1.51 5.07L2.4 22l5.53-1.43A10.27 10.27 0 0 0 12 21.24c5.52 0 10-4.3 10-9.62S17.52 2 12 2Z"
        />
        <path
          fill="#fff"
          d="M17.52 14.44c-.23-.11-1.36-.66-1.57-.73-.21-.08-.36-.11-.52.11-.15.22-.6.73-.73.88-.13.15-.27.17-.5.06a6.53 6.53 0 0 1-1.93-1.16 7.2 7.2 0 0 1-1.34-1.63c-.14-.22-.01-.34.1-.45.1-.1.23-.27.34-.4.11-.13.15-.22.23-.37.08-.15.04-.28-.02-.4-.06-.11-.52-1.23-.71-1.69-.19-.45-.39-.39-.52-.39h-.45c-.15 0-.4.06-.6.28-.21.22-.8.77-.8 1.88 0 1.1.83 2.18.94 2.33.11.15 1.62 2.53 3.93 3.55.55.23.98.37 1.32.47.55.17 1.04.15 1.43.09.44-.06 1.36-.55 1.55-1.08.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.26Z"
        />
      </svg>
    );
  }

  if (iconKey === 'businessWhatsapp') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <path
          fill="#25D366"
          d="M12 2C6.48 2 2 6.3 2 11.62c0 1.86.55 3.6 1.51 5.07L2.4 22l5.53-1.43A10.27 10.27 0 0 0 12 21.24c5.52 0 10-4.3 10-9.62S17.52 2 12 2Z"
        />
        <circle cx="12" cy="11.8" r="6.1" fill="#fff" />
        <path
          fill="#25D366"
          d="M9.2 8.1h3.27c1.72 0 2.65.95 2.65 2.2 0 .9-.5 1.48-1.18 1.75.94.22 1.54.95 1.54 1.99 0 1.46-1.09 2.46-2.97 2.46H9.2V8.1Zm3 3.27c.79 0 1.23-.33 1.23-.94 0-.58-.42-.92-1.23-.92h-1.19v1.86h1.19Zm.19 3.69c.94 0 1.45-.37 1.45-1.06 0-.67-.51-1.03-1.45-1.03h-1.38v2.09h1.38Z"
        />
      </svg>
    );
  }

  if (iconKey === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#229ED9" />
        <path
          fill="#fff"
          d="M17.64 7.62 6.9 11.76c-.73.29-.72.7-.13.88l2.76.86 1.07 3.31c.13.36.06.5.45.5.3 0 .43-.14.6-.31l1.47-1.42 3.06 2.25c.56.31.96.15 1.1-.52l1.83-8.61c.2-.82-.31-1.19-.91-.92Zm-5.61 6.32-.47 2.8-.01.01c-.07 0-.1-.03-.12-.08l-.94-2.91 6.19-3.91c.29-.18.56-.08.34.11l-4.99 4.48Z"
        />
      </svg>
    );
  }

  if (iconKey === 'viber') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <path
          fill="#7360F2"
          d="M12 2.2c-5.2 0-9.4 3.57-9.4 7.97 0 2.52 1.37 4.77 3.5 6.23V21l4.03-2.23c.6.1 1.22.15 1.87.15 5.2 0 9.4-3.57 9.4-7.97S17.2 2.2 12 2.2Z"
        />
        <path
          fill="#fff"
          d="M8.64 8.18c-.22.07-.43.23-.54.49-.11.27-.18.68-.09 1.16.15.85.68 1.95 1.55 2.92.87.98 1.87 1.64 2.69 1.89.46.14.87.14 1.15.07.27-.07.46-.24.58-.45l.32-.56c.1-.18.04-.41-.14-.52l-.95-.6a.42.42 0 0 0-.52.05l-.44.36a.25.25 0 0 1-.22.05c-.36-.1-1-.5-1.56-1.13-.57-.63-.92-1.33-.99-1.71a.25.25 0 0 1 .08-.22l.39-.39a.42.42 0 0 0 .08-.51l-.53-1.01a.41.41 0 0 0-.49-.19l-.57.2Z"
        />
      </svg>
    );
  }

  if (iconKey === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient
            id="instagramGradientMapbookContactFull"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="30%" stopColor="#fa7e1e" />
            <stop offset="60%" stopColor="#d62976" />
            <stop offset="85%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          fill="url(#instagramGradientMapbookContactFull)"
        />
        <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
      </svg>
    );
  }

  if (iconKey === 'website') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#d68612" />
        <path
          fill="#fff"
          d="M5.8 12c0-.45.05-.89.14-1.31H9.4c-.08.42-.12.86-.12 1.31 0 .45.04.89.12 1.31H5.94A6.7 6.7 0 0 1 5.8 12Zm.73-2.81h3.28c.29-.94.7-1.8 1.22-2.49a6.24 6.24 0 0 0-4.5 2.49Zm0 5.62a6.24 6.24 0 0 0 4.5 2.49c-.52-.69-.93-1.55-1.22-2.49H6.53ZM12 6.08c-.65.58-1.2 1.72-1.53 3.11h3.06C13.2 7.8 12.65 6.66 12 6.08Zm0 11.84c.65-.58 1.2-1.72 1.53-3.11h-3.06c.33 1.39.88 2.53 1.53 3.11Zm1.81-4.61c.08-.42.12-.86.12-1.31 0-.45-.04-.89-.12-1.31h3.46c.09.42.14.86.14 1.31 0 .45-.05.89-.14 1.31h-3.46Zm-.28-4.12h3.28a6.24 6.24 0 0 0-4.5-2.49c.52.69.93 1.55 1.22 2.49Zm0 5.62c-.29.94-.7 1.8-1.22 2.49a6.24 6.24 0 0 0 4.5-2.49h-3.28Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="#2f7cf6" />
      <path fill="#fff" d="M6 8.2 12 13l6-4.8v1.6L12 14.6 6 9.8V8.2Z" />
    </svg>
  );
}

function CountryPickerModal({
  open,
  title,
  searchLabel,
  countries,
  search,
  onSearchChange,
  selectedCountryCode,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  searchLabel: string;
  countries: CountryOption[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedCountryCode: string;
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,16,12,0.52)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '82vh',
          overflow: 'hidden',
          background: '#fbf7ef',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          border: '2px solid #111111',
          boxShadow: '0 -8px 0 rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '2px solid #111111',
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>{title}</div>
        </div>

        <div style={{ padding: 16, borderBottom: '2px solid #111111', background: '#fbf7ef' }}>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchLabel}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              padding: '0 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', padding: '4px 0 18px', background: '#fbf7ef' }}>
          {countries.map((country) => {
            const active = selectedCountryCode === country.code;

            return (
              <button
                key={country.code}
                type="button"
                onClick={() => onSelect(country)}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '2px solid #111111',
                  background: active ? '#edf9ef' : '#fff',
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '30px 1fr auto auto',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 22 }}>{country.flag}</span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {country.label}
                </span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: '#5f6771',
                  }}
                >
                  {country.dial}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: active ? '#1f8f49' : 'transparent',
                  }}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  item,
  language,
  textValue,
  phoneValue,
  onTextChange,
  onPhoneChange,
  onOpenCountryPicker,
}: {
  item: ContactItem;
  language: AppLanguage;
  textValue: string;
  phoneValue?: PhoneContactValue;
  onTextChange: (value: string) => void;
  onPhoneChange?: (value: PhoneContactValue) => void;
  onOpenCountryPicker?: () => void;
}) {
  const colors = getAccentColors(item.accent);

  if (item.type === 'phone' && phoneValue && onPhoneChange && onOpenCountryPicker) {
    const country =
      COUNTRIES.find((entry) => entry.code === phoneValue.countryCode) || COUNTRIES[0];

    return (
      <div
        style={{
          border: `2px solid ${colors.border}`,
          background: colors.bg,
          borderRadius: 28,
          padding: 14,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '28px 1fr',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <ContactBrandIcon iconKey={item.iconKey} size={22} />
          <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
            {item.title[language]}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '132px 1fr',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onOpenCountryPicker}
            style={{
              height: 56,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
                {country.dial}
              </span>
            </span>
            <span style={{ fontSize: 12, color: '#8a7f74', fontWeight: 900 }}>▼</span>
          </button>

          <input
            value={phoneValue.number}
            onChange={(e) =>
              onPhoneChange({
                ...phoneValue,
                number: normalizePhoneNumber(e.target.value),
              })
            }
            placeholder={item.placeholder[language]}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              padding: '0 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `2px solid ${colors.border}`,
        background: colors.bg,
        borderRadius: 28,
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <ContactBrandIcon iconKey={item.iconKey} size={22} />
        <div style={{ fontSize: 15, fontWeight: 900, color: '#17130f' }}>
          {item.title[language]}
        </div>
      </div>

      <input
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={item.placeholder[language]}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 18,
          border: '2px solid #111111',
          background: '#fff',
          padding: '0 14px',
          fontSize: 15,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

const shellCardStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 34,
  background: '#fff',
  border: '2px solid #111111',
  padding: 18,
};

const textInputStyle: CSSProperties = {
  width: '100%',
  height: 58,
  borderRadius: 20,
  border: '2px solid #111111',
  background: '#fff',
  padding: '0 16px',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

const textAreaStyle: CSSProperties = {
  width: '100%',
  borderRadius: 22,
  border: '2px solid #111111',
  background: '#fff',
  padding: '14px 16px',
  fontSize: 16,
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default function EditProfilePage() {
  const router = useRouter();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  const initialExtra = readExtraProfileData();
  const initialName = splitFullName(getUserProfile().fullName);
  const initialCountry = getDefaultCountryByPhone(getUserProfile().phone);

  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState(getUserProfile().email);
  const [phoneCountry, setPhoneCountry] = useState<CountryOption>(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState(
    stripDialCode(getUserProfile().phone, initialCountry.dial)
  );
  const [city, setCity] = useState(getUserProfile().city);
  const [district, setDistrict] = useState(initialExtra.district);
  const [address, setAddress] = useState(initialExtra.address);
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    initialExtra.selectedCountryCode || 'GB'
  );
  const [postcode, setPostcode] = useState(initialExtra.postcode || '');
  const [formattedAddress, setFormattedAddress] = useState(initialExtra.formattedAddress || '');
  const [addressSearch, setAddressSearch] = useState(initialExtra.formattedAddress || '');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [addressMeta, setAddressMeta] = useState<{ lat?: number; lng?: number }>({
    lat: initialExtra.lat,
    lng: initialExtra.lng,
  });
  const [bio, setBio] = useState(getUserProfile().bio);
  const [avatar, setAvatar] = useState(getUserProfile().avatar);
  const [avatarHistory, setAvatarHistory] = useState<string[]>([
    getUserProfile().avatar,
    ...initialExtra.avatarHistory,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ]);

  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [activeContactCountryPicker, setActiveContactCountryPicker] =
    useState<PhoneContactKey | null>(null);
  const [contactCountrySearch, setContactCountrySearch] = useState('');

  const [contacts, setContacts] = useState<Record<ContactKey, string>>({
    whatsapp: initialExtra.contacts.whatsapp,
    businessWhatsapp: initialExtra.contacts.businessWhatsapp,
    telegram: initialExtra.contacts.telegram,
    viber: initialExtra.contacts.viber,
    instagram: initialExtra.contacts.instagram,
    website: initialExtra.contacts.website,
    email: initialExtra.contacts.email || getUserProfile().email,
  });

  const [contactPhoneMeta, setContactPhoneMeta] = useState<Record<
    PhoneContactKey,
    PhoneContactValue
  >>({
    whatsapp:
      initialExtra.contactPhoneMeta?.whatsapp ||
      parseStoredPhoneContact(initialExtra.contacts.whatsapp),
    businessWhatsapp:
      initialExtra.contactPhoneMeta?.businessWhatsapp ||
      parseStoredPhoneContact(initialExtra.contacts.businessWhatsapp),
    telegram:
      initialExtra.contactPhoneMeta?.telegram ||
      parseStoredPhoneContact(initialExtra.contacts.telegram),
    viber:
      initialExtra.contactPhoneMeta?.viber ||
      parseStoredPhoneContact(initialExtra.contacts.viber),
  });

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      const next = getUserProfile();
      const extra = readExtraProfileData();
      const name = splitFullName(next.fullName);
      const country = getDefaultCountryByPhone(next.phone);

      setProfile(next);
      setFirstName(name.firstName);
      setLastName(name.lastName);
      setEmail(next.email);
      setPhoneCountry(country);
      setPhoneNumber(stripDialCode(next.phone, country.dial));
      setCity(next.city);
      setDistrict(extra.district || '');
      setAddress(extra.address || '');
      setSelectedCountryCode(extra.selectedCountryCode || 'GB');
      setPostcode(extra.postcode || '');
      setFormattedAddress(extra.formattedAddress || '');
      setAddressSearch(extra.formattedAddress || '');
      setAddressMeta({
        lat: extra.lat,
        lng: extra.lng,
      });
      setBio(next.bio);
      setAvatar(next.avatar);
      setAvatarHistory((prev) =>
        Array.from(new Set([next.avatar, ...extra.avatarHistory, ...prev].filter(Boolean))).slice(
          0,
          12
        )
      );
      setContacts({
        whatsapp: extra.contacts.whatsapp || '',
        businessWhatsapp: extra.contacts.businessWhatsapp || '',
        telegram: extra.contacts.telegram || '',
        viber: extra.contacts.viber || '',
        instagram: extra.contacts.instagram || '',
        website: extra.contacts.website || '',
        email: extra.contacts.email || next.email,
      });
      setContactPhoneMeta({
        whatsapp:
          extra.contactPhoneMeta?.whatsapp || parseStoredPhoneContact(extra.contacts.whatsapp),
        businessWhatsapp:
          extra.contactPhoneMeta?.businessWhatsapp ||
          parseStoredPhoneContact(extra.contacts.businessWhatsapp),
        telegram:
          extra.contactPhoneMeta?.telegram || parseStoredPhoneContact(extra.contacts.telegram),
        viber: extra.contactPhoneMeta?.viber || parseStoredPhoneContact(extra.contacts.viber),
      });
    };

    syncLanguage();
    syncProfile();

    window.addEventListener('focus', syncLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubProfile();
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      const query = addressSearch.trim();

      if (query.length < 3) {
        setAddressSuggestions([]);
        setAddressDropdownOpen(false);
        return;
      }

      try {
        setAddressLoading(true);

        let results: AddressSuggestion[] = [];

        if (selectedCountryCode === 'GB') {
          const normalized = normalizeUkPostcode(query);
          const looksLikePostcode = /^[A-Z0-9\s]{3,8}$/i.test(normalized);

          if (looksLikePostcode) {
            results = await fetchUkPostcodeSuggestions(query);
          } else {
            results = await fetchGlobalAddressSuggestions(query, selectedCountryCode);
          }
        } else {
          results = await fetchGlobalAddressSuggestions(query, selectedCountryCode);
        }

        setAddressSuggestions(results);
        setAddressDropdownOpen(results.length > 0);
      } catch {
        setAddressSuggestions([]);
        setAddressDropdownOpen(false);
      } finally {
        setAddressLoading(false);
      }
    };

    const timer = window.setTimeout(run, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [addressSearch, selectedCountryCode]);

  const text = useMemo(() => editProfileTexts[language] || editProfileTexts.EN, [language]);

  const filteredMainCountries = useMemo(() => {
    const q = phoneCountrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;

    return COUNTRIES.filter(
      (country) =>
        country.label.toLowerCase().includes(q) ||
        country.dial.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q)
    );
  }, [phoneCountrySearch]);

  const filteredContactCountries = useMemo(() => {
    const q = contactCountrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;

    return COUNTRIES.filter(
      (country) =>
        country.label.toLowerCase().includes(q) ||
        country.dial.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q)
    );
  }, [contactCountrySearch]);

  const handlePhotoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      setAvatar(result);
      setAvatarHistory((prev) => [result, ...prev.filter((item) => item !== result)].slice(0, 12));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeAvatarFromHistory = (avatarUrl: string) => {
    const nextHistory = avatarHistory.filter((item) => item !== avatarUrl);
    setAvatarHistory(nextHistory);

    if (avatar === avatarUrl) {
      const fallback = nextHistory[0] || getUserProfile().avatar;
      setAvatar(fallback);
    }
  };

  const clearAvatarHistory = () => {
    setAvatarHistory([avatar]);
  };

  const handlePhoneContactCountrySelect = (country: CountryOption) => {
    if (!activeContactCountryPicker) return;

    setContactPhoneMeta((prev) => ({
      ...prev,
      [activeContactCountryPicker]: {
        ...prev[activeContactCountryPicker],
        countryCode: country.code,
      },
    }));

    setActiveContactCountryPicker(null);
  };

  const applyAddressSuggestion = (item: AddressSuggestion) => {
    const nextFormatted = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title;

    setAddressSearch(nextFormatted);
    setFormattedAddress(nextFormatted);
    setPostcode(item.postcode || '');
    setCity(item.city || '');
    setDistrict(item.district || '');
    setAddress(item.addressLine || item.title || '');
    setAddressDropdownOpen(false);
    setAddressSuggestions([]);
    setAddressMeta({
      lat: item.lat,
      lng: item.lng,
    });
  };

  const handleSave = () => {
    const combinedFullName = `${firstName} ${lastName}`.trim();
    const finalPhone = combinePhone(phoneCountry, phoneNumber);

    const nextContacts: Record<ContactKey, string> = {
      ...contacts,
      email,
      whatsapp: combinePhone(
        COUNTRIES.find((item) => item.code === contactPhoneMeta.whatsapp.countryCode) ||
          COUNTRIES[0],
        contactPhoneMeta.whatsapp.number
      ),
      businessWhatsapp: combinePhone(
        COUNTRIES.find(
          (item) => item.code === contactPhoneMeta.businessWhatsapp.countryCode
        ) || COUNTRIES[0],
        contactPhoneMeta.businessWhatsapp.number
      ),
      telegram: combinePhone(
        COUNTRIES.find((item) => item.code === contactPhoneMeta.telegram.countryCode) ||
          COUNTRIES[0],
        contactPhoneMeta.telegram.number
      ),
      viber: combinePhone(
        COUNTRIES.find((item) => item.code === contactPhoneMeta.viber.countryCode) ||
          COUNTRIES[0],
        contactPhoneMeta.viber.number
      ),
    };

    updateUserProfile({
      fullName: combinedFullName,
      email,
      phone: finalPhone,
      city,
      bio,
      avatar,
    });

    saveExtraProfileData({
      district,
      address,
      contacts: nextContacts,
      avatarHistory,
      contactPhoneMeta,
      selectedCountryCode,
      postcode,
      formattedAddress,
      lat: addressMeta.lat,
      lng: addressMeta.lng,
    });

    alert(text.saved);
    router.push('/profile');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        color: '#17130f',
        paddingBottom: 110,
      }}
    >
      <CountryPickerModal
        open={countryPickerOpen}
        title={text.chooseCountry}
        searchLabel={text.countrySearch}
        countries={filteredMainCountries}
        search={phoneCountrySearch}
        onSearchChange={setPhoneCountrySearch}
        selectedCountryCode={phoneCountry.code}
        onClose={() => setCountryPickerOpen(false)}
        onSelect={(country) => {
          setPhoneCountry(country);
          setCountryPickerOpen(false);
        }}
      />

      <CountryPickerModal
        open={Boolean(activeContactCountryPicker)}
        title={text.chooseCountry}
        searchLabel={text.countrySearch}
        countries={filteredContactCountries}
        search={contactCountrySearch}
        onSearchChange={setContactCountrySearch}
        selectedCountryCode={
          activeContactCountryPicker
            ? contactPhoneMeta[activeContactCountryPicker].countryCode
            : 'GB'
        }
        onClose={() => setActiveContactCountryPicker(null)}
        onSelect={handlePhoneContactCountrySelect}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoFile}
        style={{ display: 'none' }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFile}
        style={{ display: 'none' }}
      />
      <input
        ref={filesInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFile}
        style={{ display: 'none' }}
      />

      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr auto',
            alignItems: 'center',
            gap: 12,
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
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            ←
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.title}
            </h1>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
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
              borderRadius: 999,
              background: '#2f241c',
              color: '#fff',
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.save}
          </button>
        </div>

        <div style={shellCardStyle}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 14,
            }}
          >
            {text.profilePhoto}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={avatar}
              alt={profile.fullName}
              style={{
                width: 112,
                height: 112,
                borderRadius: 32,
                objectFit: 'cover',
                display: 'block',
                border: '3px solid #111111',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                minHeight: 52,
                borderRadius: 18,
                border: '2px solid #111111',
                background: '#edf9ef',
                color: '#1f8f49',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              📷 {text.uploadFromCamera}
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              style={{
                minHeight: 52,
                borderRadius: 18,
                border: '2px solid #111111',
                background: '#fff0f6',
                color: '#ff4fa0',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🖼️ {text.uploadFromGallery}
            </button>

            <button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              style={{
                minHeight: 52,
                borderRadius: 18,
                border: '2px solid #111111',
                background: '#fff4e7',
                color: '#17130f',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              📁 {text.uploadFromFiles}
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.recentPhotos}
            </div>

            <button
              type="button"
              onClick={clearAvatarHistory}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#8a7f74',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.clearHistory}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {avatarHistory.map((avatarUrl) => {
              const selected = avatarUrl === avatar;

              return (
                <div
                  key={avatarUrl}
                  style={{
                    position: 'relative',
                    flex: '0 0 auto',
                    width: 82,
                    height: 82,
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: selected ? '3px solid #ff4fa0' : '2px solid #111111',
                    background: '#fff',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAvatar(avatarUrl)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={avatarUrl}
                      alt="Avatar option"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeAvatarFromHistory(avatarUrl)}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      border: '2px solid #ffffff',
                      background: 'rgba(23,19,15,0.82)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={shellCardStyle}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 14,
            }}
          >
            {text.basicInfo}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <FieldHeader title={text.firstName} helper={text.required} />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={textInputStyle}
              />
            </label>

            <label>
              <FieldHeader title={text.lastName} helper={text.required} />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={textInputStyle}
              />
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            <FieldHeader title={text.phone} helper={text.required} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '132px 1fr',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPhoneCountrySearch('');
                  setCountryPickerOpen(true);
                }}
                style={{
                  height: 58,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 19 }}>{phoneCountry.flag}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                    {phoneCountry.dial}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: '#8a7f74', fontWeight: 900 }}>▼</span>
              </button>

              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(normalizePhoneNumber(e.target.value))}
                placeholder={text.phonePlaceholder}
                style={textInputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <FieldHeader title={text.bio} helper={text.optional} />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={text.bioPlaceholder}
              rows={5}
              style={textAreaStyle}
            />
          </div>
        </div>

        <div style={shellCardStyle}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 14,
            }}
          >
            {text.locationInfo}
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label>
              <FieldHeader title={text.country} helper={text.required} />
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  const nextCode = e.target.value;
                  setSelectedCountryCode(nextCode);
                  setAddressSuggestions([]);
                  setAddressDropdownOpen(false);
                  setAddressSearch('');
                  setFormattedAddress('');
                  setPostcode('');
                  setCity('');
                  setDistrict('');
                  setAddress('');
                  setAddressMeta({});
                }}
                style={textInputStyle}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <FieldHeader
                title={selectedCountryCode === 'GB' ? 'Postcode' : 'Postcode / ZIP'}
                helper={text.optional}
              />
              <input
                value={postcode}
                onChange={(e) => {
                  setPostcode(e.target.value);
                  if (selectedCountryCode === 'GB') {
                    setAddressSearch(e.target.value);
                  }
                }}
                placeholder={selectedCountryCode === 'GB' ? 'SW1A 1AA' : 'ZIP / postal code'}
                style={textInputStyle}
              />
            </label>

            <label>
              <FieldHeader
                title={selectedCountryCode === 'GB' ? 'Address lookup' : 'Address search'}
                helper={text.optional}
              />
              <input
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                placeholder={
                  selectedCountryCode === 'GB'
                    ? 'Start typing postcode or address'
                    : 'Start typing address'
                }
                style={textInputStyle}
              />

              {addressLoading ? (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#8a7f74',
                  }}
                >
                  Searching...
                </div>
              ) : null}

              {addressDropdownOpen && addressSuggestions.length > 0 ? (
                <div
                  style={{
                    marginTop: 8,
                    border: '2px solid #111111',
                    borderRadius: 22,
                    background: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {addressSuggestions.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyAddressSuggestion(item)}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderBottom:
                          index === addressSuggestions.length - 1
                            ? 'none'
                            : '2px solid #111111',
                        background: '#fff',
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: '#17130f',
                        }}
                      >
                        {item.title}
                      </div>
                      {item.subtitle ? (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#7b7268',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.subtitle}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </label>

            <label>
              <FieldHeader title={text.city} helper={text.required} />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={text.cityPlaceholder}
                style={textInputStyle}
              />
            </label>

            <label>
              <FieldHeader title={text.district} helper={text.optional} />
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={text.districtPlaceholder}
                style={textInputStyle}
              />
            </label>

            <label>
              <FieldHeader title={text.address} helper={text.optional} />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={text.addressPlaceholder}
                rows={3}
                style={textAreaStyle}
              />
            </label>
          </div>
        </div>

        <div style={shellCardStyle}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 6,
            }}
          >
            {text.contacts}
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#7b7268',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {text.contactsHint}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {CONTACT_ITEMS.map((item) => {
              if (item.type === 'phone') {
                const key = item.key as PhoneContactKey;

                return (
                  <ContactRow
                    key={item.key}
                    item={item}
                    language={language}
                    textValue=""
                    phoneValue={contactPhoneMeta[key]}
                    onTextChange={() => {}}
                    onPhoneChange={(value) =>
                      setContactPhoneMeta((prev) => ({
                        ...prev,
                        [key]: value,
                      }))
                    }
                    onOpenCountryPicker={() => {
                      setContactCountrySearch('');
                      setActiveContactCountryPicker(key);
                    }}
                  />
                );
              }

              return (
                <ContactRow
                  key={item.key}
                  item={item}
                  language={language}
                  textValue={item.key === 'email' ? email : contacts[item.key]}
                  onTextChange={(value) => {
                    if (item.key === 'email') {
                      setEmail(value);
                      setContacts((prev) => ({
                        ...prev,
                        email: value,
                      }));
                      return;
                    }

                    setContacts((prev) => ({
                      ...prev,
                      [item.key]: value,
                    }));
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              fontWeight: 900,
              color: '#8a7f74',
            }}
          >
            {text.emailSmartHint}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
