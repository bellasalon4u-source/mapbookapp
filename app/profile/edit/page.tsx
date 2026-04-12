'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
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
};

type ExtraProfileData = {
  district: string;
  address: string;
  contacts: Record<ContactKey, string>;
  avatarHistory: string[];
};

const EXTRA_PROFILE_STORAGE_KEY = 'mapbook_profile_extra_v1';

const COUNTRIES: CountryOption[] = [
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', label: 'Czech Republic' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', label: 'Ukraine' },
  { code: 'PL', dial: '+48', flag: '🇵🇱', label: 'Poland' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', label: 'Germany' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', label: 'Spain' },
  { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', label: 'United Arab Emirates' },
];

const CONTACT_ITEMS: ContactItem[] = [
  {
    key: 'whatsapp',
    iconKey: 'whatsapp',
    accent: 'green',
    title: {
      EN: 'WhatsApp',
      ES: 'WhatsApp',
      RU: 'WhatsApp',
      CZ: 'WhatsApp',
      DE: 'WhatsApp',
      PL: 'WhatsApp',
    },
    placeholder: {
      EN: 'WhatsApp number',
      ES: 'Número de WhatsApp',
      RU: 'Номер WhatsApp',
      CZ: 'WhatsApp číslo',
      DE: 'WhatsApp-Nummer',
      PL: 'Numer WhatsApp',
    },
  },
  {
    key: 'businessWhatsapp',
    iconKey: 'businessWhatsapp',
    accent: 'green',
    title: {
      EN: 'Business WhatsApp',
      ES: 'WhatsApp Business',
      RU: 'Business WhatsApp',
      CZ: 'Business WhatsApp',
      DE: 'Business WhatsApp',
      PL: 'Business WhatsApp',
    },
    placeholder: {
      EN: 'Business WhatsApp number',
      ES: 'Número de WhatsApp Business',
      RU: 'Номер Business WhatsApp',
      CZ: 'Číslo Business WhatsApp',
      DE: 'Business-WhatsApp-Nummer',
      PL: 'Numer Business WhatsApp',
    },
  },
  {
    key: 'telegram',
    iconKey: 'telegram',
    accent: 'blue',
    title: {
      EN: 'Telegram',
      ES: 'Telegram',
      RU: 'Telegram',
      CZ: 'Telegram',
      DE: 'Telegram',
      PL: 'Telegram',
    },
    placeholder: {
      EN: 'Telegram username or phone',
      ES: 'Usuario o teléfono de Telegram',
      RU: 'Username или телефон Telegram',
      CZ: 'Telegram uživatel nebo telefon',
      DE: 'Telegram-Name oder Telefon',
      PL: 'Nazwa użytkownika lub telefon Telegram',
    },
  },
  {
    key: 'viber',
    iconKey: 'viber',
    accent: 'violet',
    title: {
      EN: 'Viber',
      ES: 'Viber',
      RU: 'Viber',
      CZ: 'Viber',
      DE: 'Viber',
      PL: 'Viber',
    },
    placeholder: {
      EN: 'Viber number',
      ES: 'Número de Viber',
      RU: 'Номер Viber',
      CZ: 'Viber číslo',
      DE: 'Viber-Nummer',
      PL: 'Numer Viber',
    },
  },
  {
    key: 'instagram',
    iconKey: 'instagram',
    accent: 'pink',
    title: {
      EN: 'Instagram',
      ES: 'Instagram',
      RU: 'Instagram',
      CZ: 'Instagram',
      DE: 'Instagram',
      PL: 'Instagram',
    },
    placeholder: {
      EN: '@username',
      ES: '@usuario',
      RU: '@username',
      CZ: '@uživatel',
      DE: '@benutzername',
      PL: '@nazwa',
    },
  },
  {
    key: 'website',
    iconKey: 'website',
    accent: 'orange',
    title: {
      EN: 'Website',
      ES: 'Sitio web',
      RU: 'Сайт',
      CZ: 'Web',
      DE: 'Website',
      PL: 'Strona',
    },
    placeholder: {
      EN: 'https://your-site.com',
      ES: 'https://tu-sitio.com',
      RU: 'https://ваш-сайт.com',
      CZ: 'https://vas-web.cz',
      DE: 'https://deine-seite.de',
      PL: 'https://twoja-strona.pl',
    },
  },
  {
    key: 'email',
    iconKey: 'email',
    accent: 'blue',
    title: {
      EN: 'Email',
      ES: 'Email',
      RU: 'Email',
      CZ: 'Email',
      DE: 'E-Mail',
      PL: 'Email',
    },
    placeholder: {
      EN: 'name@example.com',
      ES: 'nombre@ejemplo.com',
      RU: 'name@example.com',
      CZ: 'jmeno@priklad.cz',
      DE: 'name@beispiel.de',
      PL: 'name@przyklad.pl',
    },
  },
];

const editProfileTexts = {
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
    contactsHint: 'Each contact can be different. Fill only what you want to show.',
    cityPlaceholder: 'Select city',
    districtPlaceholder: 'Select area / district',
    addressPlaceholder: 'Street, house, flat, notes',
    phonePlaceholder: 'Phone number',
    countrySearch: 'Search country or code',
    emailSmartHint: 'Use a real email for bookings and notifications',
    saved: 'Profile saved',
    basicInfo: 'Basic information',
    locationInfo: 'Location',
    required: 'Required',
    optional: 'Optional',
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
    contactsHint: 'Cada contacto puede ser diferente. Completa solo lo que quieras mostrar.',
    cityPlaceholder: 'Selecciona ciudad',
    districtPlaceholder: 'Selecciona zona / distrito',
    addressPlaceholder: 'Calle, casa, piso, notas',
    phonePlaceholder: 'Número de teléfono',
    countrySearch: 'Buscar país o código',
    emailSmartHint: 'Usa un email real para reservas y notificaciones',
    saved: 'Perfil guardado',
    basicInfo: 'Información básica',
    locationInfo: 'Ubicación',
    required: 'Obligatorio',
    optional: 'Opcional',
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
    contactsHint: 'Каждый контакт может быть отдельным. Заполняйте только то, что хотите показывать.',
    cityPlaceholder: 'Выберите город',
    districtPlaceholder: 'Выберите район / локацию',
    addressPlaceholder: 'Улица, дом, квартира, заметки',
    phonePlaceholder: 'Номер телефона',
    countrySearch: 'Поиск страны или кода',
    emailSmartHint: 'Используйте реальный email для бронирований и уведомлений',
    saved: 'Профиль сохранён',
    basicInfo: 'Основная информация',
    locationInfo: 'Локация',
    required: 'Обязательно',
    optional: 'Необязательно',
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
    contactsHint: 'Každý kontakt může být jiný. Vyplňte jen to, co chcete zobrazit.',
    cityPlaceholder: 'Vyberte město',
    districtPlaceholder: 'Vyberte oblast / lokalitu',
    addressPlaceholder: 'Ulice, dům, byt, poznámky',
    phonePlaceholder: 'Telefonní číslo',
    countrySearch: 'Hledat stát nebo kód',
    emailSmartHint: 'Použijte skutečný email pro rezervace a oznámení',
    saved: 'Profil uložen',
    basicInfo: 'Základní informace',
    locationInfo: 'Poloha',
    required: 'Povinné',
    optional: 'Volitelné',
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
    contactsHint: 'Jeder Kontakt kann unterschiedlich sein. Fülle nur aus, was du zeigen möchtest.',
    cityPlaceholder: 'Stadt auswählen',
    districtPlaceholder: 'Bereich / Standort auswählen',
    addressPlaceholder: 'Straße, Haus, Wohnung, Hinweise',
    phonePlaceholder: 'Telefonnummer',
    countrySearch: 'Land oder Vorwahl suchen',
    emailSmartHint: 'Nutze eine echte E-Mail für Buchungen und Benachrichtigungen',
    saved: 'Profil gespeichert',
    basicInfo: 'Grundinformationen',
    locationInfo: 'Standort',
    required: 'Pflicht',
    optional: 'Optional',
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
    contactsHint: 'Każdy kontakt może być inny. Uzupełnij tylko to, co chcesz pokazać.',
    cityPlaceholder: 'Wybierz miasto',
    districtPlaceholder: 'Wybierz obszar / lokalizację',
    addressPlaceholder: 'Ulica, dom, mieszkanie, notatki',
    phonePlaceholder: 'Numer telefonu',
    countrySearch: 'Szukaj kraju lub kodu',
    emailSmartHint: 'Użyj prawdziwego emaila do rezerwacji i powiadomień',
    saved: 'Profil zapisany',
    basicInfo: 'Podstawowe informacje',
    locationInfo: 'Lokalizacja',
    required: 'Wymagane',
    optional: 'Opcjonalne',
  },
} as const;

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

function readExtraProfileData(): ExtraProfileData {
  if (typeof window === 'undefined') {
    return {
      district: '',
      address: '',
      contacts: {
        whatsapp: '',
        businessWhatsapp: '',
        telegram: '',
        viber: '',
        instagram: '',
        website: '',
        email: '',
      },
      avatarHistory: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(EXTRA_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        district: '',
        address: '',
        contacts: {
          whatsapp: '',
          businessWhatsapp: '',
          telegram: '',
          viber: '',
          instagram: '',
          website: '',
          email: '',
        },
        avatarHistory: [],
      };
    }

    const parsed = JSON.parse(raw) as Partial<ExtraProfileData>;
    return {
      district: parsed.district || '',
      address: parsed.address || '',
      contacts: {
        whatsapp: parsed.contacts?.whatsapp || '',
        businessWhatsapp: parsed.contacts?.businessWhatsapp || '',
        telegram: parsed.contacts?.telegram || '',
        viber: parsed.contacts?.viber || '',
        instagram: parsed.contacts?.instagram || '',
        website: parsed.contacts?.website || '',
        email: parsed.contacts?.email || '',
      },
      avatarHistory: Array.isArray(parsed.avatarHistory) ? parsed.avatarHistory : [],
    };
  } catch {
    return {
      district: '',
      address: '',
      contacts: {
        whatsapp: '',
        businessWhatsapp: '',
        telegram: '',
        viber: '',
        instagram: '',
        website: '',
        email: '',
      },
      avatarHistory: [],
    };
  }
}

function saveExtraProfileData(data: ExtraProfileData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(EXTRA_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

function getAccentColors(accent: ContactItem['accent']) {
  if (accent === 'green') return { bg: '#eef9f1', color: '#25D366', border: '#d8f0df' };
  if (accent === 'blue') return { bg: '#eef4ff', color: '#229ED9', border: '#d9e6ff' };
  if (accent === 'violet') return { bg: '#f3efff', color: '#7360f2', border: '#e4dcff' };
  if (accent === 'orange') return { bg: '#fff5e8', color: '#d68612', border: '#f6e4c9' };
  return { bg: '#fff1f7', color: '#ff4fa0', border: '#f7d9e8' };
}

function fieldLabel(title: string, helper: string) {
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
      <span style={{ fontSize: 12, fontWeight: 800, color: '#8a7f74' }}>{helper}</span>
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
        <path
          fill="#fff"
          d="M13.46 7.03a.8.8 0 1 0 0 1.6c1.06 0 1.92.86 1.92 1.92a.8.8 0 1 0 1.6 0 3.52 3.52 0 0 0-3.52-3.52Zm-.02 2.2a.58.58 0 1 0 0 1.16.78.78 0 0 1 .78.78.58.58 0 1 0 1.16 0 1.94 1.94 0 0 0-1.94-1.94Z"
        />
      </svg>
    );
  }

  if (iconKey === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" style={commonSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="instagramGradientMapbook" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="30%" stopColor="#fa7e1e" />
            <stop offset="60%" stopColor="#d62976" />
            <stop offset="85%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#instagramGradientMapbook)" />
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
  const [bio, setBio] = useState(getUserProfile().bio);
  const [avatar, setAvatar] = useState(getUserProfile().avatar);
  const [avatarHistory, setAvatarHistory] = useState<string[]>([
    getUserProfile().avatar,
    ...initialExtra.avatarHistory,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ]);
  const [countrySearch, setCountrySearch] = useState('');
  const [contacts, setContacts] = useState<Record<ContactKey, string>>({
    whatsapp: initialExtra.contacts.whatsapp,
    businessWhatsapp: initialExtra.contacts.businessWhatsapp,
    telegram: initialExtra.contacts.telegram,
    viber: initialExtra.contacts.viber,
    instagram: initialExtra.contacts.instagram,
    website: initialExtra.contacts.website,
    email: initialExtra.contacts.email || getUserProfile().email,
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
      setBio(next.bio);
      setAvatar(next.avatar);
      setAvatarHistory((prev) =>
        Array.from(
          new Set([next.avatar, ...extra.avatarHistory, ...prev].filter(Boolean))
        ).slice(0, 12)
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

  const text = useMemo(
    () => editProfileTexts[language as keyof typeof editProfileTexts] || editProfileTexts.EN,
    [language]
  );

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;

    return COUNTRIES.filter(
      (country) =>
        country.label.toLowerCase().includes(q) ||
        country.dial.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

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

  const handleSave = () => {
    const combinedFullName = `${firstName} ${lastName}`.trim();
    const finalPhone = `${phoneCountry.dial} ${phoneNumber}`.trim();

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
      contacts: {
        ...contacts,
        email,
      },
      avatarHistory,
    });

    alert(text.saved);
    router.push('/profile');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
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

      <div style={{ maxWidth: 430, margin: '0 auto' }}>
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
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
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
              border: 'none',
              borderRadius: 999,
              background: '#2f241c',
              color: '#fff',
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(47,36,28,0.18)',
            }}
          >
            {text.save}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            background: '#fff',
            border: '1px solid #efe4d7',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
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
                borderRadius: 34,
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 14px 28px rgba(44, 23, 10, 0.12)',
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
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #d8eadb',
                background: '#eef8f0',
                color: '#2f8b48',
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
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #f1d9e6',
                background: '#fff1f7',
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
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #ddd6cb',
                background: '#faf8f5',
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
              fontSize: 14,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 10,
            }}
          >
            {text.recentPhotos}
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
                <button
                  key={avatarUrl}
                  type="button"
                  onClick={() => setAvatar(avatarUrl)}
                  style={{
                    flex: '0 0 auto',
                    width: 82,
                    height: 82,
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: selected ? '3px solid #ff4fa0' : '1px solid #efe4d7',
                    background: '#fff',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: selected ? '0 10px 22px rgba(255,79,160,0.16)' : 'none',
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
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            background: '#fff',
            border: '1px solid #efe4d7',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
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
              {fieldLabel(text.firstName, text.required)}
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 18,
                  border: '1px solid #efe4d7',
                  background: '#fffdf9',
                  padding: '0 16px',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </label>

            <label>
              {fieldLabel(text.lastName, text.required)}
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 18,
                  border: '1px solid #efe4d7',
                  background: '#fffdf9',
                  padding: '0 16px',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            {fieldLabel(text.phone, text.required)}

            <input
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder={text.countrySearch}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 16,
                border: '1px solid #efe4d7',
                background: '#fcfaf6',
                padding: '0 14px',
                fontSize: 14,
                outline: 'none',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
                marginBottom: 10,
              }}
            >
              {filteredCountries.map((country) => {
                const active = phoneCountry.code === country.code;

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setPhoneCountry(country)}
                    style={{
                      flex: '0 0 auto',
                      minWidth: 122,
                      height: 48,
                      borderRadius: 16,
                      border: active ? '2px solid #ff4fa0' : '1px solid #efe4d7',
                      background: active ? '#fff1f7' : '#fff',
                      color: '#17130f',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: '0 12px',
                    }}
                  >
                    {country.flag} {country.dial}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '104px 1fr',
                gap: 10,
              }}
            >
              <div
                style={{
                  height: 54,
                  borderRadius: 18,
                  border: '1px solid #efe4d7',
                  background: '#fcfaf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                <span>{phoneCountry.flag}</span>
                <span>{phoneCountry.dial}</span>
              </div>

              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s()-]/g, ''))}
                placeholder={text.phonePlaceholder}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 18,
                  border: '1px solid #efe4d7',
                  background: '#fffdf9',
                  padding: '0 16px',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {fieldLabel(text.bio, text.optional)}
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={text.bioPlaceholder}
              rows={4}
              style={{
                width: '100%',
                resize: 'none',
                borderRadius: 18,
                border: '1px solid #efe4d7',
                background: '#fffdf9',
                padding: '14px 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            background: '#fff',
            border: '1px solid #efe4d7',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
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

          <div style={{ marginTop: 2 }}>
            {fieldLabel(text.city, text.required)}
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={text.cityPlaceholder}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 18,
                border: '1px solid #efe4d7',
                background: '#fffdf9',
                padding: '0 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            {fieldLabel(text.district, text.optional)}
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={text.districtPlaceholder}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 18,
                border: '1px solid #efe4d7',
                background: '#fffdf9',
                padding: '0 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            {fieldLabel(text.address, text.optional)}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={text.addressPlaceholder}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 18,
                border: '1px solid #efe4d7',
                background: '#fffdf9',
                padding: '0 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            background: '#fff',
            border: '1px solid #efe4d7',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.contacts}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              lineHeight: 1.55,
              color: '#7b7268',
              fontWeight: 700,
            }}
          >
            {text.contactsHint}
          </div>

          <div style={{ marginTop: 14, display: 'grid', gap: 14 }}>
            {CONTACT_ITEMS.map((item) => {
              const accent = getAccentColors(item.accent);

              return (
                <div
                  key={item.key}
                  style={{
                    borderRadius: 22,
                    border: '1px solid #efe4d7',
                    background: '#fcfaf6',
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
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        background: accent.bg,
                        border: `1px solid ${accent.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ContactBrandIcon iconKey={item.iconKey} size={20} />
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {item.title[language]}
                    </div>
                  </div>

                  <input
                    value={item.key === 'email' ? email : contacts[item.key]}
                    onChange={(e) => {
                      if (item.key === 'email') {
                        setEmail(e.target.value);
                        setContacts((prev) => ({ ...prev, email: e.target.value }));
                        return;
                      }

                      setContacts((prev) => ({
                        ...prev,
                        [item.key]: e.target.value,
                      }));
                    }}
                    placeholder={item.placeholder[language]}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 16,
                      border: '1px solid #efe4d7',
                      background: '#fff',
                      padding: '0 14px',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  {item.key === 'email' ? (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: '#8a7f74',
                        fontWeight: 700,
                      }}
                    >
                      {text.emailSmartHint}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
