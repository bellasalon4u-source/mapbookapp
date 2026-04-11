'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
  icon: string;
  title: Record<AppLanguage, string>;
  placeholder: Record<AppLanguage, string>;
};

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
    icon: '💬',
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
    icon: '🏢',
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
    icon: '✈️',
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
    icon: '📞',
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
    icon: '📸',
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
    icon: '🌐',
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
    icon: '✉️',
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
  },
  ES: {
    title: 'Editar perfil',
    save: 'Guardar',
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
  },
  RU: {
    title: 'Редактировать профиль',
    save: 'Сохранить',
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
  },
  CZ: {
    title: 'Upravit profil',
    save: 'Uložit',
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
  },
  DE: {
    title: 'Profil bearbeiten',
    save: 'Speichern',
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
  },
  PL: {
    title: 'Edytuj profil',
    save: 'Zapisz',
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
  return (
    COUNTRIES.find((country) => normalized.startsWith(country.dial)) || COUNTRIES[0]
  );
}

function stripDialCode(phone: string, dial: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith(dial)) {
    return trimmed.slice(dial.length).trim();
  }
  return trimmed.replace(/[^\d]/g, '');
}

export default function EditProfilePage() {
  const router = useRouter();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

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
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState(getUserProfile().bio);
  const [avatar, setAvatar] = useState(getUserProfile().avatar);
  const [avatarHistory, setAvatarHistory] = useState<string[]>([
    getUserProfile().avatar,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ]);

  const [countrySearch, setCountrySearch] = useState('');
  const [contacts, setContacts] = useState<Record<ContactKey, string>>({
    whatsapp: '',
    businessWhatsapp: '',
    telegram: '',
    viber: '',
    instagram: '',
    website: '',
    email: getUserProfile().email,
  });

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      const next = getUserProfile();
      const name = splitFullName(next.fullName);
      const country = getDefaultCountryByPhone(next.phone);

      setProfile(next);
      setFirstName(name.firstName);
      setLastName(name.lastName);
      setEmail(next.email);
      setPhoneCountry(country);
      setPhoneNumber(stripDialCode(next.phone, country.dial));
      setCity(next.city);
      setBio(next.bio);
      setAvatar(next.avatar);
      setAvatarHistory((prev) => {
        const merged = [next.avatar, ...prev].filter(Boolean);
        return Array.from(new Set(merged)).slice(0, 8);
      });
      setContacts((prev) => ({
        ...prev,
        email: next.email,
      }));
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
      setAvatarHistory((prev) => [result, ...prev.filter((item) => item !== result)].slice(0, 8));
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                {text.firstName}
              </div>
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
                }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
                {text.lastName}
              </div>
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
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
              {text.phone}
            </div>

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
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
              {text.city}
            </div>
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
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
              {text.district}
            </div>
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
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
              {text.address}
            </div>
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
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: '#17130f' }}>
              {text.bio}
            </div>
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
            {CONTACT_ITEMS.map((item) => (
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
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      background: '#fff1f7',
                      color: '#ff4fa0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    {item.icon}
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
                  value={contacts[item.key]}
                  onChange={(e) =>
                    setContacts((prev) => ({
                      ...prev,
                      [item.key]: e.target.value,
                    }))
                  }
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
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
