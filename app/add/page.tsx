'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { addListing } from '../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type PhotoItem = {
  id: string;
  name: string;
  preview: string;
};

type PhoneValue = {
  countryCode: string;
  number: string;
};

type ContactValue = {
  phone: PhoneValue;
  whatsapp: PhoneValue;
  businessWhatsapp: PhoneValue;
  telegram: string;
  viber: PhoneValue;
  instagram: string;
  website: string;
  email: string;
};

type CategoryConfig = {
  id: string;
  icon: string;
  label: Partial<Record<AppLanguage, string>>;
  subcategories: {
    id: string;
    label: Partial<Record<AppLanguage, string>>;
  }[];
};

type Texts = {
  title: string;
  subtitle: string;
  back: string;
  required: string;
  photos: string;
  photosHint: string;
  addPhotos: string;
  photoSource: string;
  gallery: string;
  camera: string;
  files: string;
  mainPhoto: string;
  tapMainPhoto: string;
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
  city: string;
  cityPlaceholder: string;
  district: string;
  districtPlaceholder: string;
  address: string;
  addressPlaceholder: string;
  hours: string;
  hoursPlaceholder: string;
  availability: string;
  availableToday: string;
  serviceModes: string;
  atClient: string;
  atMyPlace: string;
  online: string;
  paymentMethods: string;
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
  country: string;
  phoneNumber: string;
  publish: string;
  close: string;
  published: string;
  enterTitle: string;
  enterDescription: string;
  enterPrice: string;
  enterCity: string;
  enterDistrict: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#2578ff',
  green: '#55c75f',
  yellow: '#ffe44d',
  coral: '#ff4b52',
  pink: '#ff4fa0',
  cream: '#fffdf8',
  bg: '#f7f4ee',
  black: '#111111',
  muted: '#737b86',
};

const countries = [
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'PL', dial: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
];

const categories: CategoryConfig[] = [
  {
    id: 'beauty',
    icon: '💄',
    label: { EN: 'Beauty', RU: 'Красота', UA: 'Краса', ES: 'Belleza', CZ: 'Krása' },
    subcategories: [
      { id: 'Hair', label: { EN: 'Hair', RU: 'Волосы', UA: 'Волосся' } },
      { id: 'Nails', label: { EN: 'Nails', RU: 'Ногти', UA: 'Нігті' } },
      { id: 'Lashes', label: { EN: 'Lashes', RU: 'Ресницы', UA: 'Вії' } },
      { id: 'Brows', label: { EN: 'Brows', RU: 'Брови', UA: 'Брови' } },
      { id: 'Makeup', label: { EN: 'Makeup', RU: 'Макияж', UA: 'Макіяж' } },
      { id: 'Hair Extensions', label: { EN: 'Hair Extensions', RU: 'Наращивание волос', UA: 'Нарощування волосся' } },
      { id: 'Laser Hair Removal', label: { EN: 'Laser Hair Removal', RU: 'Лазерная эпиляция', UA: 'Лазерна епіляція' } },
    ],
  },
  {
    id: 'barber',
    icon: '✂️',
    label: { EN: 'Barber', RU: 'Барбер', UA: 'Барбер' },
    subcategories: [
      { id: 'Haircut', label: { EN: 'Haircut', RU: 'Стрижка', UA: 'Стрижка' } },
      { id: 'Beard', label: { EN: 'Beard', RU: 'Борода', UA: 'Борода' } },
      { id: 'Fade', label: { EN: 'Fade', RU: 'Фейд', UA: 'Фейд' } },
    ],
  },
  {
    id: 'wellness',
    icon: '🧘',
    label: { EN: 'Wellness', RU: 'Велнес', UA: 'Велнес' },
    subcategories: [
      { id: 'Massage', label: { EN: 'Massage', RU: 'Массаж', UA: 'Масаж' } },
      { id: 'SPA', label: { EN: 'SPA', RU: 'SPA', UA: 'SPA' } },
      { id: 'Yoga', label: { EN: 'Yoga', RU: 'Йога', UA: 'Йога' } },
      { id: 'Fitness', label: { EN: 'Fitness', RU: 'Фитнес', UA: 'Фітнес' } },
    ],
  },
  {
    id: 'home',
    icon: '🏠',
    label: { EN: 'Home', RU: 'Дом', UA: 'Дім' },
    subcategories: [
      { id: 'Cleaning', label: { EN: 'Cleaning', RU: 'Уборка', UA: 'Прибирання' } },
      { id: 'Handyman', label: { EN: 'Handyman', RU: 'Мастер на дом', UA: 'Майстер додому' } },
      { id: 'Carpet Cleaning', label: { EN: 'Carpet Cleaning', RU: 'Чистка ковров', UA: 'Чистка килимів' } },
      { id: 'Private Chef', label: { EN: 'Private Chef', RU: 'Шеф-повар на дом', UA: 'Шеф-кухар додому' } },
    ],
  },
  {
    id: 'repairs',
    icon: '🛠️',
    label: { EN: 'Repairs', RU: 'Ремонт', UA: 'Ремонт' },
    subcategories: [
      { id: 'Electrician', label: { EN: 'Electrician', RU: 'Электрик', UA: 'Електрик' } },
      { id: 'Plumber', label: { EN: 'Plumber', RU: 'Сантехник', UA: 'Сантехнік' } },
      { id: 'Furniture Assembly', label: { EN: 'Furniture Assembly', RU: 'Сборка мебели', UA: 'Збірка меблів' } },
    ],
  },
  {
    id: 'tech',
    icon: '📱',
    label: { EN: 'Tech', RU: 'Техника', UA: 'Техніка' },
    subcategories: [
      { id: 'Phone Repair', label: { EN: 'Phone Repair', RU: 'Ремонт телефона', UA: 'Ремонт телефону' } },
      { id: 'Laptop Repair', label: { EN: 'Laptop Repair', RU: 'Ремонт ноутбука', UA: 'Ремонт ноутбука' } },
      { id: 'Setup', label: { EN: 'Setup', RU: 'Настройка техники', UA: 'Налаштування техніки' } },
    ],
  },
  {
    id: 'pets',
    icon: '🐾',
    label: { EN: 'Pets', RU: 'Питомцы', UA: 'Тварини' },
    subcategories: [
      { id: 'Dog Grooming', label: { EN: 'Dog Grooming', RU: 'Груминг собак', UA: 'Грумінг собак' } },
      { id: 'Dog Walking', label: { EN: 'Dog Walking', RU: 'Выгул собак', UA: 'Вигул собак' } },
      { id: 'Pet Sitting', label: { EN: 'Pet Sitting', RU: 'Передержка питомцев', UA: 'Перетримка тварин' } },
    ],
  },
  {
    id: 'events',
    icon: '🎉',
    label: { EN: 'Events', RU: 'События', UA: 'Події' },
    subcategories: [
      { id: 'Photographer', label: { EN: 'Photographer', RU: 'Фотограф', UA: 'Фотограф' } },
      { id: 'Event DJ', label: { EN: 'Event DJ', RU: 'DJ на мероприятие', UA: 'DJ на подію' } },
      { id: 'Decor', label: { EN: 'Decor', RU: 'Декор', UA: 'Декор' } },
    ],
  },
  {
    id: 'food',
    icon: '🍽️',
    label: { EN: 'Food', RU: 'Еда', UA: 'Їжа' },
    subcategories: [
      { id: 'Chef at Home', label: { EN: 'Chef at Home', RU: 'Шеф-повар на дом', UA: 'Шеф-кухар додому' } },
      { id: 'Restaurant Table Booking', label: { EN: 'Restaurant Table Booking', RU: 'Бронь столика', UA: 'Бронь столика' } },
      { id: 'Catering', label: { EN: 'Catering', RU: 'Кейтеринг', UA: 'Кейтеринг' } },
    ],
  },
  {
    id: 'fashion',
    icon: '👗',
    label: { EN: 'Fashion', RU: 'Мода', UA: 'Мода' },
    subcategories: [
      { id: 'Stylist', label: { EN: 'Stylist', RU: 'Стилист', UA: 'Стиліст' } },
      { id: 'Tailoring', label: { EN: 'Tailoring', RU: 'Пошив одежды', UA: 'Пошиття одягу' } },
      { id: 'Piercing', label: { EN: 'Piercing', RU: 'Пирсинг', UA: 'Пірсинг' } },
      { id: 'Tattoo', label: { EN: 'Tattoo', RU: 'Тату', UA: 'Тату' } },
      { id: 'Tattoo Removal', label: { EN: 'Tattoo Removal', RU: 'Удаление тату', UA: 'Видалення тату' } },
    ],
  },
];

const baseTexts: Texts = {
  title: 'Add your service',
  subtitle: 'Create a strong listing for clients nearby',
  back: 'Back',
  required: 'Required fields',
  photos: 'Photos',
  photosHint: 'Add up to 20 photos. The first photo will be shown as the main one.',
  addPhotos: 'Add photos',
  photoSource: 'Photo source',
  gallery: 'Gallery',
  camera: 'Camera',
  files: 'Files',
  mainPhoto: 'Main',
  tapMainPhoto: 'Tap a photo to make it main',
  serviceInfo: 'Service info',
  serviceTitle: 'Service title',
  serviceTitlePlaceholder: 'For example: Hair extensions, massage, cleaning',
  description: 'Description',
  descriptionPlaceholder: 'Describe your service, experience, what is included...',
  category: 'Category',
  subcategory: 'Subcategory',
  price: 'Price',
  pricePlaceholder: 'For example: £45',
  location: 'Location',
  city: 'City / town',
  cityPlaceholder: 'London',
  district: 'District / area',
  districtPlaceholder: 'Camden, Chelsea, Mayfair...',
  address: 'Address details',
  addressPlaceholder: 'Street, building, studio, floor...',
  hours: 'Working hours',
  hoursPlaceholder: 'For example: 09:00 - 20:00',
  availability: 'Availability',
  availableToday: 'Available today',
  serviceModes: 'Service format',
  atClient: 'At client',
  atMyPlace: 'At my place',
  online: 'Online',
  paymentMethods: 'Payment methods',
  cash: 'Cash',
  card: 'Card',
  wallet: 'OlaCash',
  contacts: 'Contacts',
  contactsHint: 'Add contact channels separately. They will be used for bookings and trust.',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  businessWhatsapp: 'Business WhatsApp',
  telegram: 'Telegram',
  viber: 'Viber',
  instagram: 'Instagram',
  website: 'Website',
  email: 'Email',
  country: 'Country',
  phoneNumber: 'Phone number',
  publish: 'Publish service',
  close: 'Close',
  published: 'Service published successfully',
  enterTitle: 'Please enter service title',
  enterDescription: 'Please enter description',
  enterPrice: 'Please enter price',
  enterCity: 'Please enter city / town',
  enterDistrict: 'Please enter district / area',
};

const textOverrides: Partial<Record<AppLanguage, Partial<Texts>>> = {
  RU: {
    title: 'Добавить услугу',
    subtitle: 'Создайте красивое объявление, чтобы клиенты нашли вас рядом',
    back: 'Назад',
    required: 'Обязательные поля',
    photos: 'Фото',
    photosHint: 'Добавьте до 20 фото. Первое фото будет главным.',
    addPhotos: 'Добавить фото',
    photoSource: 'Источник фото',
    gallery: 'Галерея',
    camera: 'Камера',
    files: 'Файлы',
    mainPhoto: 'Главное',
    tapMainPhoto: 'Нажмите на фото, чтобы сделать его главным',
    serviceInfo: 'Информация об услуге',
    serviceTitle: 'Название услуги',
    serviceTitlePlaceholder: 'Например: наращивание волос, массаж, уборка',
    description: 'Описание',
    descriptionPlaceholder: 'Опишите услугу, опыт, что входит в цену...',
    category: 'Категория',
    subcategory: 'Подкатегория',
    price: 'Цена',
    pricePlaceholder: 'Например: £45',
    location: 'Локация',
    city: 'Город / населённый пункт',
    cityPlaceholder: 'London',
    district: 'Район / зона',
    districtPlaceholder: 'Camden, Chelsea, Mayfair...',
    address: 'Подробный адрес',
    addressPlaceholder: 'Улица, дом, студия, этаж...',
    hours: 'Часы работы',
    hoursPlaceholder: 'Например: 09:00 - 20:00',
    availability: 'Доступность',
    availableToday: 'Доступно сегодня',
    serviceModes: 'Формат услуги',
    atClient: 'У клиента',
    atMyPlace: 'У меня',
    online: 'Онлайн',
    paymentMethods: 'Способы оплаты',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'OlaCash',
    contacts: 'Контакты',
    contactsHint: 'Добавьте каждый канал связи отдельно. Это нужно для бронирований и доверия.',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    country: 'Страна',
    phoneNumber: 'Номер телефона',
    publish: 'Опубликовать услугу',
    close: 'Закрыть',
    published: 'Услуга успешно опубликована',
    enterTitle: 'Введите название услуги',
    enterDescription: 'Введите описание',
    enterPrice: 'Введите цену',
    enterCity: 'Введите город / населённый пункт',
    enterDistrict: 'Введите район / зону',
  },
  UA: {
    title: 'Додати послугу',
    subtitle: 'Створіть гарне оголошення, щоб клієнти знайшли вас поруч',
    required: 'Обов’язкові поля',
    photos: 'Фото',
    addPhotos: 'Додати фото',
    serviceInfo: 'Інформація про послугу',
    serviceTitle: 'Назва послуги',
    description: 'Опис',
    category: 'Категорія',
    subcategory: 'Підкатегорія',
    price: 'Ціна',
    location: 'Локація',
    city: 'Місто / населений пункт',
    district: 'Район / зона',
    address: 'Детальна адреса',
    hours: 'Години роботи',
    availability: 'Доступність',
    availableToday: 'Доступно сьогодні',
    serviceModes: 'Формат послуги',
    atClient: 'У клієнта',
    atMyPlace: 'У мене',
    online: 'Онлайн',
    paymentMethods: 'Способи оплати',
    cash: 'Готівка',
    card: 'Картка',
    contacts: 'Контакти',
    publish: 'Опублікувати послугу',
    close: 'Закрити',
    published: 'Послугу успішно опубліковано',
  },
};

function getTexts(language: AppLanguage): Texts {
  return {
    ...baseTexts,
    ...(textOverrides[language] || {}),
  };
}

function getLabel(
  value: Partial<Record<AppLanguage, string>>,
  language: AppLanguage,
  fallback: string
) {
  return value[language] || value.EN || fallback;
}

function fieldStyle(): CSSProperties {
  return {
    width: '100%',
    minHeight: 58,
    borderRadius: 20,
    border: `2px solid ${BRAND.black}`,
    background: '#ffffff',
    color: BRAND.navy,
    outline: 'none',
    padding: '0 16px',
    fontSize: 16,
    fontWeight: 800,
    boxSizing: 'border-box',
  };
}

function textareaStyle(): CSSProperties {
  return {
    ...fieldStyle(),
    minHeight: 126,
    padding: '16px',
    resize: 'none',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.4,
  };
}

function SectionCard({
  title,
  children,
  required,
  accent = 'white',
}: {
  title: string;
  children: ReactNode;
  required?: boolean;
  accent?: 'white' | 'yellow' | 'blue' | 'green' | 'pink';
}) {
  const bg =
    accent === 'yellow'
      ? '#fff7d6'
      : accent === 'blue'
      ? '#eef4ff'
      : accent === 'green'
      ? '#effbf2'
      : accent === 'pink'
      ? '#fff1f7'
      : '#ffffff';

  return (
    <section
      style={{
        borderRadius: 30,
        border: `3px solid ${BRAND.black}`,
        background: bg,
        padding: 16,
        boxShadow: '0 6px 0 rgba(17,17,17,0.06)',
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
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.1,
            fontWeight: 900,
            color: BRAND.navy,
            letterSpacing: '-0.4px',
          }}
        >
          {title}
        </h2>

        {required ? (
          <span style={{ color: BRAND.coral, fontSize: 22, fontWeight: 900 }}>*</span>
        ) : null}
      </div>

      {children}
    </section>
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
        gap: 6,
        alignItems: 'center',
        marginBottom: 8,
        fontSize: 15,
        fontWeight: 900,
        color: BRAND.black,
      }}
    >
      <span>{children}</span>
      {required ? <span style={{ color: BRAND.coral }}>*</span> : null}
    </label>
  );
}

function ChipButton({
  active,
  children,
  onClick,
  icon,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  icon?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 50,
        borderRadius: 18,
        border: `2px solid ${BRAND.black}`,
        background: active ? BRAND.green : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        fontSize: 14,
        fontWeight: 900,
        cursor: 'pointer',
        padding: '10px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        boxShadow: active ? '0 6px 14px rgba(85,199,95,0.24)' : 'none',
      }}
    >
      {icon ? <span>{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

function PhoneInput({
  label,
  icon,
  value,
  onChange,
  text,
}: {
  label: string;
  icon: string;
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  text: Texts;
}) {
  const selected = countries.find((item) => item.code === value.countryCode) || countries[0];

  return (
    <div
      style={{
        borderRadius: 22,
        border: `2px solid ${BRAND.black}`,
        background: '#ffffff',
        padding: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          color: BRAND.navy,
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: `2px solid ${BRAND.black}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff7d6',
          }}
        >
          {icon}
        </span>
        {label}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '124px 1fr',
          gap: 8,
        }}
      >
        <select
          value={value.countryCode}
          onChange={(event) =>
            onChange({
              ...value,
              countryCode: event.target.value,
            })
          }
          aria-label={text.country}
          style={{
            ...fieldStyle(),
            minHeight: 54,
            padding: '0 8px',
            fontSize: 14,
          }}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.dial}
            </option>
          ))}
        </select>

        <input
          value={value.number}
          onChange={(event) =>
            onChange({
              ...value,
              number: event.target.value,
            })
          }
          placeholder={text.phoneNumber}
          inputMode="tel"
          style={{
            ...fieldStyle(),
            minHeight: 54,
          }}
        />
      </div>

      {value.number.trim() ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
          }}
        >
          {selected.flag} {selected.name}
        </div>
      ) : null}
    </div>
  );
}

function ContactInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: `2px solid ${BRAND.black}`,
        background: '#ffffff',
        padding: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          color: BRAND.navy,
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: `2px solid ${BRAND.black}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#eef4ff',
          }}
        >
          {icon}
        </span>
        {label}
      </div>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{
          ...fieldStyle(),
          minHeight: 54,
        }}
      />
    </div>
  );
}

export default function AddServicePage() {
  const router = useRouter();

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [showPhotoSource, setShowPhotoSource] = useState(false);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('beauty');
  const [subcategory, setSubcategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [availableToday, setAvailableToday] = useState(true);

  const [atClient, setAtClient] = useState(true);
  const [atMyPlace, setAtMyPlace] = useState(false);
  const [online, setOnline] = useState(false);

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [wallet, setWallet] = useState(false);

  const [contacts, setContacts] = useState<ContactValue>({
    phone: { countryCode: 'GB', number: '' },
    whatsapp: { countryCode: 'GB', number: '' },
    businessWhatsapp: { countryCode: 'GB', number: '' },
    telegram: '',
    viber: { countryCode: 'GB', number: '' },
    instagram: '',
    website: '',
    email: '',
  });

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsub = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [photos]);

  const text = useMemo(() => getTexts(language), [language]);

  const selectedCategory = useMemo(() => {
    return categories.find((item) => item.id === categoryId) || categories[0];
  }, [categoryId]);

  const selectedSubcategories = selectedCategory.subcategories;

  useEffect(() => {
    if (!selectedSubcategories.some((item) => item.id === subcategory)) {
      setSubcategory(selectedSubcategories[0]?.id || '');
    }
  }, [selectedSubcategories, subcategory]);

  const formatPhone = (value: PhoneValue) => {
    const country = countries.find((item) => item.code === value.countryCode) || countries[0];
    const number = value.number.trim();

    if (!number) return '';

    return `${country.dial} ${number}`;
  };

  const normalizeInstagram = (value: string) => {
    const clean = value.trim();
    if (!clean) return '';
    if (clean.startsWith('@')) return clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return `@${clean.replace(/^@+/, '')}`;
  };

  const normalizeWebsite = (value: string) => {
    const clean = value.trim();
    if (!clean) return '';
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return `https://${clean}`;
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));
    const freeSlots = Math.max(0, 20 - photos.length);

    const nextPhotos = imageFiles.slice(0, freeSlots).map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...nextPhotos]);
    setShowPhotoSource(false);
    event.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const found = prev.find((photo) => photo.id === photoId);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const makeMainPhoto = (photoId: string) => {
    setPhotos((prev) => {
      const index = prev.findIndex((photo) => photo.id === photoId);
      if (index <= 0) return prev;

      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const updatePhoneContact = (key: keyof Pick<ContactValue, 'phone' | 'whatsapp' | 'businessWhatsapp' | 'viber'>, value: PhoneValue) => {
    setContacts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert(text.enterTitle);
      return;
    }

    if (!description.trim()) {
      alert(text.enterDescription);
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

    const selectedCategoryLabel = getLabel(selectedCategory.label, language, selectedCategory.id);
    const selectedSubcategoryLabel =
      selectedSubcategories.find((item) => item.id === subcategory)?.label || {};

    const location = [city.trim(), district.trim(), address.trim()].filter(Boolean).join(', ');

    addListing({
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory.id,
      subcategory: getLabel(selectedSubcategoryLabel, language, subcategory),
      price: price.trim(),
      location,
      hours: hours.trim(),
      availableToday,
      serviceModes: [
        atClient ? 'at_client' : null,
        atMyPlace ? 'at_my_place' : null,
        online ? 'online' : null,
      ].filter(Boolean) as ('at_client' | 'at_my_place' | 'online')[],
      paymentMethods: [
        cash ? 'cash' : null,
        card ? 'card' : null,
        wallet ? 'wallet' : null,
      ].filter(Boolean) as ('cash' | 'card' | 'wallet')[],
      contact: {
        phone: formatPhone(contacts.phone),
        whatsapp: formatPhone(contacts.whatsapp),
        businessWhatsapp: formatPhone(contacts.businessWhatsapp),
        telegram: contacts.telegram.trim(),
        viber: formatPhone(contacts.viber),
        instagram: normalizeInstagram(contacts.instagram),
        website: normalizeWebsite(contacts.website),
        email: contacts.email.trim().toLowerCase(),
      } as any,
      photos: photos.map((photo) => photo.preview),
      searchText: [
        title,
        description,
        selectedCategory.id,
        selectedCategoryLabel,
        subcategory,
        getLabel(selectedSubcategoryLabel, language, subcategory),
        city,
        district,
        address,
      ].join(' '),
    } as any);

    alert(text.published);
    router.push('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #eef4ff 0%, #fffdf8 34%, #fff1f7 100%)',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.black,
        paddingBottom: 126,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 60,
            background: 'rgba(238,244,255,0.96)',
            backdropFilter: 'blur(12px)',
            borderBottom: `2px solid rgba(17,17,17,0.12)`,
            padding: '18px 16px 14px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '58px 58px 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label={text.back}
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                border: `3px solid ${BRAND.black}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 32,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                border: `3px solid ${BRAND.black}`,
                background: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src="/ui/logo/logo.png"
                alt="Olamep"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.navy,
                  letterSpacing: '-1px',
                }}
              >
                {text.title}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 14,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.subtitle}
              </div>
            </div>
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gap: 16,
            padding: '16px 14px 0',
          }}
        >
          <SectionCard title={text.photos} required accent="yellow">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
                alignItems: 'flex-start',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: BRAND.muted,
                  fontSize: 14,
                  lineHeight: 1.4,
                  fontWeight: 800,
                }}
              >
                {text.photosHint}
              </p>

              <span
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.black}`,
                  background: '#ffffff',
                  padding: '7px 10px',
                  fontSize: 12,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {photos.length}/20
              </span>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <input
              ref={filesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => setShowPhotoSource(true)}
              style={{
                width: '100%',
                minHeight: 94,
                borderRadius: 24,
                border: `3px solid ${BRAND.black}`,
                background: '#ffffff',
                display: 'grid',
                gridTemplateColumns: '74px 1fr',
                gap: 14,
                alignItems: 'center',
                padding: 12,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 5px 0 rgba(17,17,17,0.06)',
              }}
            >
              <span
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  border: `3px solid ${BRAND.green}`,
                  background: '#effbf2',
                  color: BRAND.green,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 46,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                +
              </span>

              <span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#2f8c67',
                    lineHeight: 1.05,
                  }}
                >
                  {text.addPhotos}
                </span>

                <span
                  style={{
                    display: 'block',
                    marginTop: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    color: BRAND.muted,
                  }}
                >
                  JPG / PNG / WEBP
                </span>
              </span>
            </button>

            {photos.length > 0 ? (
              <>
                <div
                  style={{
                    marginTop: 12,
                    color: BRAND.muted,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {text.tapMainPhoto}
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
                        border:
                          index === 0
                            ? `3px solid ${BRAND.green}`
                            : `2px solid ${BRAND.black}`,
                        background: '#ffffff',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => makeMainPhoto(photo.id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          padding: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={photo.preview}
                          alt={photo.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </button>

                      {index === 0 ? (
                        <span
                          style={{
                            position: 'absolute',
                            left: 6,
                            bottom: 6,
                            borderRadius: 999,
                            border: `2px solid ${BRAND.black}`,
                            background: BRAND.green,
                            color: '#ffffff',
                            padding: '5px 8px',
                            fontSize: 10,
                            fontWeight: 900,
                          }}
                        >
                          {text.mainPhoto}
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          border: `2px solid ${BRAND.black}`,
                          background: '#ffffff',
                          color: BRAND.black,
                          fontSize: 18,
                          fontWeight: 900,
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </SectionCard>

          <SectionCard title={text.serviceInfo} required accent="white">
            <FieldLabel required>{text.serviceTitle}</FieldLabel>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={text.serviceTitlePlaceholder}
              style={{ ...fieldStyle(), marginBottom: 16 }}
            />

            <FieldLabel required>{text.description}</FieldLabel>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={text.descriptionPlaceholder}
              style={textareaStyle()}
            />
          </SectionCard>

          <SectionCard title={text.category} required accent="blue">
            <FieldLabel required>{text.category}</FieldLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 9,
                marginBottom: 16,
              }}
            >
              {categories.map((item) => {
                const active = categoryId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(item.id);
                      setSubcategory(item.subcategories[0]?.id || '');
                    }}
                    style={{
                      minHeight: 64,
                      borderRadius: 20,
                      border: `2px solid ${BRAND.black}`,
                      background: active ? BRAND.blue : '#ffffff',
                      color: active ? '#ffffff' : BRAND.navy,
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 10,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span>{getLabel(item.label, language, item.id)}</span>
                  </button>
                );
              })}
            </div>

            <FieldLabel required>{text.subcategory}</FieldLabel>
            <select
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
              style={fieldStyle()}
            >
              {selectedSubcategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {getLabel(item.label, language, item.id)}
                </option>
              ))}
            </select>
          </SectionCard>

          <SectionCard title={text.price} required accent="green">
            <FieldLabel required>{text.price}</FieldLabel>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder={text.pricePlaceholder}
              style={fieldStyle()}
            />
          </SectionCard>

          <SectionCard title={text.location} required accent="pink">
            <FieldLabel required>{text.city}</FieldLabel>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={text.cityPlaceholder}
              style={{ ...fieldStyle(), marginBottom: 16 }}
            />

            <FieldLabel required>{text.district}</FieldLabel>
            <input
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              placeholder={text.districtPlaceholder}
              style={{ ...fieldStyle(), marginBottom: 16 }}
            />

            <FieldLabel>{text.address}</FieldLabel>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={text.addressPlaceholder}
              style={{ ...textareaStyle(), minHeight: 96 }}
            />
          </SectionCard>

          <SectionCard title={text.hours} accent="white">
            <FieldLabel>{text.hours}</FieldLabel>
            <input
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder={text.hoursPlaceholder}
              style={fieldStyle()}
            />
          </SectionCard>

          <SectionCard title={text.availability} accent="yellow">
            <ChipButton
              active={availableToday}
              icon="⚡"
              onClick={() => setAvailableToday((prev) => !prev)}
            >
              {text.availableToday}
            </ChipButton>

            <div style={{ height: 16 }} />

            <FieldLabel>{text.serviceModes}</FieldLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 9,
              }}
            >
              <ChipButton active={atClient} onClick={() => setAtClient((prev) => !prev)}>
                {text.atClient}
              </ChipButton>
              <ChipButton active={atMyPlace} onClick={() => setAtMyPlace((prev) => !prev)}>
                {text.atMyPlace}
              </ChipButton>
              <ChipButton active={online} onClick={() => setOnline((prev) => !prev)}>
                {text.online}
              </ChipButton>
            </div>
          </SectionCard>

          <SectionCard title={text.paymentMethods} accent="blue">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 9,
              }}
            >
              <ChipButton active={cash} icon="💵" onClick={() => setCash((prev) => !prev)}>
                {text.cash}
              </ChipButton>
              <ChipButton active={card} icon="💳" onClick={() => setCard((prev) => !prev)}>
                {text.card}
              </ChipButton>
              <ChipButton active={wallet} icon="👛" onClick={() => setWallet((prev) => !prev)}>
                {text.wallet}
              </ChipButton>
            </div>
          </SectionCard>

          <SectionCard title={text.contacts} accent="white">
            <p
              style={{
                margin: '0 0 14px',
                color: BRAND.muted,
                fontSize: 14,
                lineHeight: 1.4,
                fontWeight: 800,
              }}
            >
              {text.contactsHint}
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              <PhoneInput
                label={text.phone}
                icon="📞"
                value={contacts.phone}
                onChange={(value) => updatePhoneContact('phone', value)}
                text={text}
              />

              <PhoneInput
                label={text.whatsapp}
                icon="🟢"
                value={contacts.whatsapp}
                onChange={(value) => updatePhoneContact('whatsapp', value)}
                text={text}
              />

              <PhoneInput
                label={text.businessWhatsapp}
                icon="💼"
                value={contacts.businessWhatsapp}
                onChange={(value) => updatePhoneContact('businessWhatsapp', value)}
                text={text}
              />

              <ContactInput
                label={text.telegram}
                icon="✈️"
                value={contacts.telegram}
                onChange={(value) => setContacts((prev) => ({ ...prev, telegram: value }))}
                placeholder="@username"
              />

              <PhoneInput
                label={text.viber}
                icon="🟣"
                value={contacts.viber}
                onChange={(value) => updatePhoneContact('viber', value)}
                text={text}
              />

              <ContactInput
                label={text.instagram}
                icon="📸"
                value={contacts.instagram}
                onChange={(value) => setContacts((prev) => ({ ...prev, instagram: value }))}
                placeholder="@instagram"
              />

              <ContactInput
                label={text.website}
                icon="🌐"
                value={contacts.website}
                onChange={(value) => setContacts((prev) => ({ ...prev, website: value }))}
                placeholder="yourwebsite.com"
              />

              <ContactInput
                label={text.email}
                icon="✉️"
                value={contacts.email}
                onChange={(value) => setContacts((prev) => ({ ...prev, email: value }))}
                placeholder="you@email.com"
                type="email"
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          background: 'rgba(255,253,248,0.96)',
          backdropFilter: 'blur(14px)',
          borderTop: `2px solid rgba(17,17,17,0.12)`,
          padding: '12px 14px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            type="button"
            onClick={handlePublish}
            style={{
              width: '100%',
              minHeight: 62,
              borderRadius: 24,
              border: `3px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 0 rgba(17,17,17,0.10)',
            }}
          >
            {text.publish}
          </button>
        </div>
      </div>

      {showPhotoSource ? (
        <div
          onClick={() => setShowPhotoSource(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(17,17,17,0.35)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 14px calc(18px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              borderRadius: 28,
              border: `3px solid ${BRAND.black}`,
              background: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 18px 38px rgba(0,0,0,0.24)',
            }}
          >
            <div
              style={{
                padding: '18px 16px 12px',
                fontSize: 22,
                fontWeight: 900,
                color: BRAND.navy,
              }}
            >
              {text.photoSource}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 10,
                padding: '0 14px 14px',
              }}
            >
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                style={sourceButtonStyle()}
              >
                🖼 {text.gallery}
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={sourceButtonStyle()}
              >
                📷 {text.camera}
              </button>

              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                style={sourceButtonStyle()}
              >
                📁 {text.files}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoSource(false)}
              style={{
                width: '100%',
                minHeight: 56,
                border: 'none',
                borderTop: `3px solid ${BRAND.black}`,
                background: '#ffffff',
                color: BRAND.black,
                fontSize: 17,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              × {text.close}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function sourceButtonStyle(): CSSProperties {
  return {
    minHeight: 58,
    borderRadius: 20,
    border: `2px solid ${BRAND.black}`,
    background: '#fff7d6',
    color: BRAND.navy,
    fontSize: 17,
    fontWeight: 900,
    cursor: 'pointer',
  };
}
