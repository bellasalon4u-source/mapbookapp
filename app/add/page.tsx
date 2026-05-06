'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { addListing } from '../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

type PriceMode = 'single' | 'range';
type ServiceFormat = 'at_my_place' | 'at_client' | 'online';
type PaymentMethodId =
  | 'card'
  | 'cash'
  | 'apple-pay'
  | 'google-pay'
  | 'paypal'
  | 'bank'
  | 'wallet'
  | 'crypto';

type ContactKey =
  | 'phone'
  | 'whatsapp'
  | 'businessWhatsapp'
  | 'telegram'
  | 'viber'
  | 'instagram'
  | 'website'
  | 'email';

type MediaItem = {
  id: string;
  file: File;
  preview: string;
  kind: 'photo' | 'video';
  scale: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
  confirmed: boolean;
};

type CategoryItem = {
  id: string;
  label: Record<string, string>;
  icon: string;
  subcategories: string[];
};

type Texts = {
  pageTitle: string;
  pageSubtitle: string;
  photos: string;
  addPhotoVideo: string;
  mediaHint: string;
  editHint: string;
  price: string;
  setPrice: string;
  fromTo: string;
  paymentMethods: string;
  title: string;
  titleHint: string;
  description: string;
  descriptionHint: string;
  category: string;
  subcategory: string;
  workingHours: string;
  serviceFormat: string;
  contactDetails: string;
  contactHint: string;
  address: string;
  addressHint: string;
  continue: string;
  publish: string;
  selectCategory: string;
  selectSubcategory: string;
  setWorkingHours: string;
  atMyPlace: string;
  atClient: string;
  online: string;
  cancel: string;
  save: string;
  close: string;
  priceSettings: string;
  priceType: string;
  singlePrice: string;
  priceRange: string;
  pounds: string;
  pence: string;
  minPrice: string;
  maxPrice: string;
  choosePaymentMethods: string;
  contacts: string;
  addressDetails: string;
  city: string;
  district: string;
  street: string;
  postcode: string;
  phone: string;
  whatsapp: string;
  businessWhatsapp: string;
  telegram: string;
  viber: string;
  instagram: string;
  website: string;
  email: string;
  addTitleAlert: string;
  addDescriptionAlert: string;
  addCategoryAlert: string;
  addSubcategoryAlert: string;
  addPhotoAlert: string;
  published: string;
};

const BRAND = {
  navy: '#071b46',
  black: '#111111',
  green: '#24c45a',
  blue: '#1677ff',
  red: '#ff2456',
  yellow: '#ffe44d',
  cream: '#fffdf8',
  softBlue: '#eef5ff',
  softGreen: '#eaffef',
  softPink: '#fff0f7',
  softYellow: '#fff8d9',
  muted: '#6f7887',
};

const textsByLanguage: Partial<Record<AppLanguage, Texts>> = {
  EN: {
    pageTitle: 'Add your service',
    pageSubtitle: 'Create a strong listing for clients nearby',
    photos: 'Photos',
    addPhotoVideo: 'Add photo / video',
    mediaHint: 'Add photos and videos from your files.',
    editHint: 'Move, zoom, rotate and confirm.',
    price: 'Price',
    setPrice: 'Set your price',
    fromTo: 'from £40 to £60',
    paymentMethods: 'Payment methods',
    title: 'Title',
    titleHint: 'Add a short and clear title',
    description: 'Description',
    descriptionHint: 'Describe your service in detail',
    category: 'Category',
    subcategory: 'Subcategory',
    workingHours: 'Working hours',
    serviceFormat: 'Service format',
    contactDetails: 'Contact details',
    contactHint: 'Opens a separate sheet of channels',
    address: 'Address',
    addressHint: 'Opens a separate address form',
    continue: 'Continue',
    publish: 'Publish service',
    selectCategory: 'Select category',
    selectSubcategory: 'Select subcategory',
    setWorkingHours: 'Set working hours',
    atMyPlace: 'At my place',
    atClient: 'At client',
    online: 'Online',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    priceSettings: 'Price settings',
    priceType: 'Price type',
    singlePrice: 'One price',
    priceRange: 'From — to',
    pounds: 'Pounds',
    pence: 'Pence',
    minPrice: 'From',
    maxPrice: 'To',
    choosePaymentMethods: 'Choose payment methods',
    contacts: 'Contacts',
    addressDetails: 'Address details',
    city: 'City',
    district: 'District / area',
    street: 'Street, building, studio, floor',
    postcode: 'Postcode',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'Email',
    addTitleAlert: 'Add service title',
    addDescriptionAlert: 'Add service description',
    addCategoryAlert: 'Choose category',
    addSubcategoryAlert: 'Choose subcategory',
    addPhotoAlert: 'Add at least one photo or video',
    published: 'Service published successfully',
  },
  RU: {
    pageTitle: 'Добавить услугу',
    pageSubtitle: 'Создайте красивое объявление, чтобы клиенты нашли вас рядом',
    photos: 'Фото',
    addPhotoVideo: 'Добавить фото / видео',
    mediaHint: 'Добавьте фото и видео из файлов.',
    editHint: 'Двигайте, увеличивайте, поворачивайте и подтверждайте.',
    price: 'Цена',
    setPrice: 'Установите цену',
    fromTo: 'от £40 до £60',
    paymentMethods: 'Методы оплаты',
    title: 'Заголовок',
    titleHint: 'Добавьте короткий и понятный заголовок',
    description: 'Описание',
    descriptionHint: 'Подробно опишите услугу',
    category: 'Категория',
    subcategory: 'Подкатегория',
    workingHours: 'Часы работы',
    serviceFormat: 'Формат услуги',
    contactDetails: 'Контактные данные',
    contactHint: 'Открывается отдельное окно каналов связи',
    address: 'Адрес',
    addressHint: 'Открывается отдельная форма адреса',
    continue: 'Продолжить',
    publish: 'Опубликовать услугу',
    selectCategory: 'Выберите категорию',
    selectSubcategory: 'Выберите подкатегорию',
    setWorkingHours: 'Установить часы работы',
    atMyPlace: 'У меня',
    atClient: 'Выезд к клиенту',
    online: 'Онлайн',
    cancel: 'Отмена',
    save: 'Сохранить',
    close: 'Закрыть',
    priceSettings: 'Настройки цены',
    priceType: 'Тип цены',
    singlePrice: 'Одна цена',
    priceRange: 'От — до',
    pounds: 'Фунты',
    pence: 'Пенсы',
    minPrice: 'От',
    maxPrice: 'До',
    choosePaymentMethods: 'Выберите методы оплаты',
    contacts: 'Контакты',
    addressDetails: 'Адрес',
    city: 'Город',
    district: 'Район / зона',
    street: 'Улица, дом, студия, этаж',
    postcode: 'Почтовый индекс',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    addTitleAlert: 'Добавьте заголовок услуги',
    addDescriptionAlert: 'Добавьте описание услуги',
    addCategoryAlert: 'Выберите категорию',
    addSubcategoryAlert: 'Выберите подкатегорию',
    addPhotoAlert: 'Добавьте хотя бы одно фото или видео',
    published: 'Услуга успешно опубликована',
  },
  UA: {
    pageTitle: 'Додати послугу',
    pageSubtitle: 'Створіть гарне оголошення, щоб клієнти знайшли вас поруч',
    photos: 'Фото',
    addPhotoVideo: 'Додати фото / відео',
    mediaHint: 'Додайте фото та відео з файлів.',
    editHint: 'Рухайте, збільшуйте, повертайте і підтверджуйте.',
    price: 'Ціна',
    setPrice: 'Встановіть ціну',
    fromTo: 'від £40 до £60',
    paymentMethods: 'Методи оплати',
    title: 'Заголовок',
    titleHint: 'Додайте короткий і зрозумілий заголовок',
    description: 'Опис',
    descriptionHint: 'Детально опишіть послугу',
    category: 'Категорія',
    subcategory: 'Підкатегорія',
    workingHours: 'Години роботи',
    serviceFormat: 'Формат послуги',
    contactDetails: 'Контактні дані',
    contactHint: 'Відкривається окреме вікно каналів звʼязку',
    address: 'Адреса',
    addressHint: 'Відкривається окрема форма адреси',
    continue: 'Продовжити',
    publish: 'Опублікувати послугу',
    selectCategory: 'Оберіть категорію',
    selectSubcategory: 'Оберіть підкатегорію',
    setWorkingHours: 'Встановити години роботи',
    atMyPlace: 'У мене',
    atClient: 'Виїзд до клієнта',
    online: 'Онлайн',
    cancel: 'Скасувати',
    save: 'Зберегти',
    close: 'Закрити',
    priceSettings: 'Налаштування ціни',
    priceType: 'Тип ціни',
    singlePrice: 'Одна ціна',
    priceRange: 'Від — до',
    pounds: 'Фунти',
    pence: 'Пенси',
    minPrice: 'Від',
    maxPrice: 'До',
    choosePaymentMethods: 'Оберіть методи оплати',
    contacts: 'Контакти',
    addressDetails: 'Адреса',
    city: 'Місто',
    district: 'Район / зона',
    street: 'Вулиця, будинок, студія, поверх',
    postcode: 'Поштовий індекс',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    addTitleAlert: 'Додайте заголовок послуги',
    addDescriptionAlert: 'Додайте опис послуги',
    addCategoryAlert: 'Оберіть категорію',
    addSubcategoryAlert: 'Оберіть підкатегорію',
    addPhotoAlert: 'Додайте хоча б одне фото або відео',
    published: 'Послугу успішно опубліковано',
  },
};

const categories: CategoryItem[] = [
  {
    id: 'beauty',
    icon: '💄',
    label: { EN: 'Beauty', RU: 'Красота', UA: 'Краса' },
    subcategories: ['Hair & Styling', 'Nails', 'Brows', 'Lashes', 'Makeup', 'Hair extensions'],
  },
  {
    id: 'barber',
    icon: '✂️',
    label: { EN: 'Barber', RU: 'Барбер', UA: 'Барбер' },
    subcategories: ['Haircut', 'Beard', 'Shaving', 'Kids haircut'],
  },
  {
    id: 'wellness',
    icon: '🧘',
    label: { EN: 'Wellness', RU: 'Велнес', UA: 'Велнес' },
    subcategories: ['Massage', 'SPA', 'Yoga', 'Pilates', 'Facial massage'],
  },
  {
    id: 'home',
    icon: '🏠',
    label: { EN: 'Home', RU: 'Дом', UA: 'Дім' },
    subcategories: ['Cleaning', 'Deep cleaning', 'Cooking', 'Furniture assembly'],
  },
  {
    id: 'repairs',
    icon: '🛠️',
    label: { EN: 'Repairs', RU: 'Ремонт', UA: 'Ремонт' },
    subcategories: ['Electrician', 'Plumber', 'Handyman', 'Painting'],
  },
  {
    id: 'tech',
    icon: '📱',
    label: { EN: 'Tech', RU: 'Техника', UA: 'Техніка' },
    subcategories: ['Phone repair', 'Laptop repair', 'Setup', 'Smart home'],
  },
  {
    id: 'pets',
    icon: '🐾',
    label: { EN: 'Pets', RU: 'Питомцы', UA: 'Тварини' },
    subcategories: ['Dog walking', 'Pet sitting', 'Grooming', 'Training'],
  },
  {
    id: 'events',
    icon: '🎉',
    label: { EN: 'Events', RU: 'События', UA: 'Події' },
    subcategories: ['Photographer', 'Host', 'Decor', 'Makeup for event'],
  },
  {
    id: 'food',
    icon: '🍽️',
    label: { EN: 'Food', RU: 'Еда', UA: 'Їжа' },
    subcategories: ['Chef at home', 'Catering', 'Restaurant booking', 'Cake'],
  },
  {
    id: 'fashion',
    icon: '👗',
    label: { EN: 'Fashion', RU: 'Мода', UA: 'Мода' },
    subcategories: ['Stylist', 'Tailoring', 'Dress rental', 'Personal shopping'],
  },
];

const paymentMethods: {
  id: PaymentMethodId;
  icon: string;
  title: string;
}[] = [
  { id: 'card', icon: '💳', title: 'Card' },
  { id: 'cash', icon: '💵', title: 'Cash' },
  { id: 'apple-pay', icon: '', title: 'Apple Pay' },
  { id: 'google-pay', icon: 'G', title: 'Google Pay' },
  { id: 'paypal', icon: '🅿️', title: 'PayPal' },
  { id: 'bank', icon: '🏦', title: 'Bank transfer' },
  { id: 'wallet', icon: '👛', title: 'OlaCash' },
  { id: 'crypto', icon: '₿', title: 'Crypto' },
];

const contactItems: {
  key: ContactKey;
  icon: string;
  bg: string;
}[] = [
  { key: 'phone', icon: '📞', bg: '#fff8d9' },
  { key: 'whatsapp', icon: '🟢', bg: '#eaffef' },
  { key: 'businessWhatsapp', icon: '💼', bg: '#fff8d9' },
  { key: 'telegram', icon: '✈️', bg: '#eef5ff' },
  { key: 'viber', icon: '🟣', bg: '#f3eeff' },
  { key: 'instagram', icon: '📸', bg: '#fff0f7' },
  { key: 'email', icon: '✉️', bg: '#eef5ff' },
  { key: 'website', icon: '🌐', bg: '#eaffef' },
];

function getText(language: AppLanguage) {
  return textsByLanguage[language] || textsByLanguage.EN!;
}

function langLabel(item: CategoryItem, language: AppLanguage) {
  return item.label[language] || item.label.EN || item.id;
}

function inputStyle(): CSSProperties {
  return {
    width: '100%',
    height: 58,
    borderRadius: 18,
    border: `2px solid ${BRAND.black}`,
    background: '#ffffff',
    color: BRAND.navy,
    padding: '0 16px',
    fontSize: 16,
    fontWeight: 900,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function textareaStyle(): CSSProperties {
  return {
    ...inputStyle(),
    height: 130,
    padding: '16px',
    resize: 'none',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.45,
  };
}

function OlamepLogo({ size = 42 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        color: BRAND.navy,
        fontWeight: 900,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50% 50% 50% 10%',
          transform: 'rotate(-45deg)',
          background:
            'conic-gradient(from 20deg, #ff2456, #ffe44d, #24c45a, #1677ff, #7b2cff, #ff2456)',
          border: '1.5px solid rgba(7,27,70,0.12)',
          boxShadow: '0 8px 22px rgba(22,119,255,0.18)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '28%',
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <span style={{ fontSize: 34, lineHeight: 1 }}>Olamep</span>
    </div>
  );
}

function TopHeader({
  text,
  onBack,
  onClose,
}: {
  text: Texts;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <header
      style={{
        padding: '22px 24px 26px',
        borderBottom: '1px solid #e2e7f0',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 54,
            height: 54,
            borderRadius: 999,
            border: `2px solid ${BRAND.black}`,
            background: '#fff',
            color: BRAND.navy,
            fontSize: 30,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 54,
            height: 54,
            borderRadius: 999,
            border: `2px solid ${BRAND.black}`,
            background: '#fff',
            color: BRAND.navy,
            fontSize: 28,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', paddingTop: 2 }}>
          <OlamepLogo size={38} />

          <h1
            style={{
              margin: '18px 0 0',
              fontSize: 44,
              lineHeight: 0.95,
              fontWeight: 900,
              color: BRAND.navy,
              letterSpacing: -1,
            }}
          >
            {text.pageTitle}
          </h1>

          <div
            style={{
              marginTop: 12,
              fontSize: 18,
              lineHeight: 1.2,
              fontWeight: 900,
              color: BRAND.muted,
            }}
          >
            {text.pageSubtitle}
          </div>
        </div>
      </div>
    </header>
  );
}

function RowButton({
  icon,
  bg,
  title,
  value,
  onClick,
  children,
}: {
  icon: string;
  bg: string;
  title: string;
  value?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 72,
        borderRadius: 20,
        border: `2px solid ${BRAND.black}`,
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '54px 1fr auto',
        gap: 14,
        alignItems: 'center',
        padding: '10px 16px 10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: `1.5px solid ${BRAND.black}`,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 25,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: BRAND.navy,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        {value ? (
          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              lineHeight: 1.25,
              fontWeight: 900,
              color: BRAND.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </div>
        ) : null}

        {children}
      </div>

      <div
        style={{
          color: BRAND.navy,
          fontSize: 34,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ›
      </div>
    </button>
  );
}

function BottomSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,17,17,0.34)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: 'calc(100vh - 52px)',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '30px 30px 0 0',
          border: `2px solid ${BRAND.black}`,
          padding: '18px 18px calc(20px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 46px',
            gap: 10,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: BRAND.navy,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 46,
              height: 46,
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              color: BRAND.navy,
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
  color = BRAND.green,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 52,
        borderRadius: 18,
        border: `2px solid ${BRAND.black}`,
        background: active ? color : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        padding: '10px 12px',
        fontSize: 16,
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function AddServicePage() {
  const router = useRouter();

  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const [media, setMedia] = useState<MediaItem[]>([]);

  const [priceMode, setPriceMode] = useState<PriceMode>('range');
  const [pricePounds, setPricePounds] = useState('45');
  const [pricePence, setPricePence] = useState('00');
  const [priceFrom, setPriceFrom] = useState('40');
  const [priceTo, setPriceTo] = useState('60');

  const [selectedPayments, setSelectedPayments] = useState<PaymentMethodId[]>([
    'card',
    'cash',
    'apple-pay',
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categoryId, setCategoryId] = useState('beauty');
  const [subcategory, setSubcategory] = useState('Hair & Styling');

  const [hoursFrom, setHoursFrom] = useState('09:00');
  const [hoursTo, setHoursTo] = useState('20:00');

  const [formats, setFormats] = useState<ServiceFormat[]>(['at_client']);

  const [contacts, setContacts] = useState<Record<ContactKey, string>>({
    phone: '',
    whatsapp: '',
    businessWhatsapp: '',
    telegram: '',
    viber: '',
    instagram: '',
    website: '',
    email: '',
  });

  const [address, setAddress] = useState({
    city: '',
    district: '',
    street: '',
    postcode: '',
  });

  const [activeSheet, setActiveSheet] = useState<
    | null
    | 'price'
    | 'payments'
    | 'category'
    | 'subcategory'
    | 'hours'
    | 'format'
    | 'contacts'
    | 'address'
    | 'editor'
  >(null);

  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editorScale, setEditorScale] = useState(1);
  const [editorRotate, setEditorRotate] = useState(0);
  const [editorOffsetX, setEditorOffsetX] = useState(0);
  const [editorOffsetY, setEditorOffsetY] = useState(0);

  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  useEffect(() => {
    setLanguage(getSavedLanguage());
    const unsub = subscribeToLanguageChange((next) => setLanguage(next));
    return () => unsub();
  }, []);

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.preview));
    };
    // cleanup on unmount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text = getText(language);

  const currentCategory = useMemo(() => {
    return categories.find((item) => item.id === categoryId) || categories[0];
  }, [categoryId]);

  const priceSummary =
    priceMode === 'range'
      ? `£${priceFrom} — £${priceTo}`
      : `£${pricePounds}.${pricePence.padStart(2, '0').slice(0, 2)}`;

  const contactPreview = useMemo(() => {
    const filled = Object.entries(contacts).filter(([, value]) => value.trim()).length;
    return filled ? `${filled} channels added` : text.contactHint;
  }, [contacts, text.contactHint]);

  const addressPreview = useMemo(() => {
    const parts = [address.city, address.district, address.street, address.postcode].filter(Boolean);
    return parts.length ? parts.join(', ') : text.addressHint;
  }, [address, text.addressHint]);

  const openMediaPicker = () => {
    mediaInputRef.current?.click();
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, 50 - media.length);
    const selected = files.slice(0, remaining);

    const mapped: MediaItem[] = selected
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file, index) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        kind: file.type.startsWith('video/') ? 'video' : 'photo',
        scale: 1,
        rotate: 0,
        offsetX: 0,
        offsetY: 0,
        confirmed: false,
      }));

    setMedia((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const openEditor = (item: MediaItem) => {
    setEditingMediaId(item.id);
    setEditorScale(item.scale);
    setEditorRotate(item.rotate);
    setEditorOffsetX(item.offsetX);
    setEditorOffsetY(item.offsetY);
    setActiveSheet('editor');
  };

  const applyEditor = () => {
    if (!editingMediaId) return;

    setMedia((prev) =>
      prev.map((item) =>
        item.id === editingMediaId
          ? {
              ...item,
              scale: editorScale,
              rotate: editorRotate,
              offsetX: editorOffsetX,
              offsetY: editorOffsetY,
              confirmed: true,
            }
          : item
      )
    );

    setActiveSheet(null);
    setEditingMediaId(null);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const togglePayment = (id: PaymentMethodId) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFormat = (id: ServiceFormat) => {
    setFormats((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: editorOffsetX,
      startOffsetY: editorOffsetY,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    setEditorOffsetX(dragRef.current.startOffsetX + event.clientX - dragRef.current.startX);
    setEditorOffsetY(dragRef.current.startOffsetY + event.clientY - dragRef.current.startY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.pointerId = null;
  };

  const handlePublish = () => {
    if (!media.length) {
      alert(text.addPhotoAlert);
      return;
    }

    if (!title.trim()) {
      alert(text.addTitleAlert);
      return;
    }

    if (!description.trim()) {
      alert(text.addDescriptionAlert);
      return;
    }

    if (!categoryId) {
      alert(text.addCategoryAlert);
      return;
    }

    if (!subcategory) {
      alert(text.addSubcategoryAlert);
      return;
    }

    const location = [address.city, address.district, address.street, address.postcode]
      .filter(Boolean)
      .join(', ');

    addListing({
      title: title.trim(),
      description: description.trim(),
      category: currentCategory?.label.EN || categoryId,
      subcategory,
      price: priceSummary,
      location,
      hours: `${hoursFrom} - ${hoursTo}`,
      availableToday: true,
      serviceModes: formats,
      paymentMethods: selectedPayments as any,
      contact: {
        phone: contacts.phone,
        whatsapp: contacts.whatsapp,
        businessWhatsapp: contacts.businessWhatsapp,
        telegram: contacts.telegram,
        viber: contacts.viber,
        instagram: contacts.instagram,
        website: contacts.website,
        email: contacts.email,
      } as any,
      photos: media.map((item) => item.preview),
    });

    alert(text.published);
    router.push('/');
  };

  const editingMedia = media.find((item) => item.id === editingMediaId) || null;

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          paddingBottom: 112,
        }}
      >
        <TopHeader text={text} onBack={() => router.back()} onClose={() => router.push('/')} />

        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            padding: '18px 18px 0',
          }}
        >
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelected}
            style={{ display: 'none' }}
          />

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                border: `2px solid ${BRAND.black}`,
                borderRadius: 24,
                background: '#ffffff',
                padding: 12,
                minHeight: 360,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>{text.photos}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.muted }}>
                  {media.length}/50
                </div>
              </div>

              <button
                type="button"
                onClick={openMediaPicker}
                style={{
                  width: '100%',
                  height: 206,
                  borderRadius: 22,
                  border: '2px dashed #9aa3b1',
                  background: '#ffffff',
                  color: BRAND.navy,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 999,
                    border: `3px solid ${BRAND.green}`,
                    color: BRAND.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 42,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  +
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    lineHeight: 1.2,
                  }}
                >
                  {text.addPhotoVideo}
                </div>
              </button>

              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: 8,
                  alignItems: 'start',
                }}
              >
                <div style={{ fontSize: 24 }}>🖼️</div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.35,
                    color: BRAND.muted,
                    fontWeight: 900,
                  }}
                >
                  {text.mediaHint}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  border: `2px solid ${BRAND.blue}`,
                  borderRadius: 18,
                  background: '#e8f2ff',
                  padding: 10,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    color: BRAND.navy,
                    fontSize: 30,
                    fontWeight: 900,
                  }}
                >
                  <span>↔</span>
                  <span>⌕+</span>
                  <span>↻</span>
                  <span>→</span>
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: BRAND.green,
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                    }}
                  >
                    ✓
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: BRAND.navy,
                    fontSize: 15,
                    fontWeight: 900,
                    lineHeight: 1.3,
                  }}
                >
                  {text.editHint}
                </div>
              </div>

              {media.length > 0 ? (
                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {media.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openEditor(item)}
                      style={{
                        aspectRatio: '1 / 1',
                        borderRadius: 14,
                        border: `2px solid ${BRAND.black}`,
                        overflow: 'hidden',
                        padding: 0,
                        background: '#ffffff',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                    >
                      {item.kind === 'video' ? (
                        <video
                          src={item.preview}
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <img
                          src={item.preview}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `translate(${item.offsetX}px, ${item.offsetY}px) scale(${item.scale}) rotate(${item.rotate}deg)`,
                          }}
                        />
                      )}

                      {item.confirmed ? (
                        <span
                          style={{
                            position: 'absolute',
                            right: 4,
                            bottom: 4,
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: BRAND.green,
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              style={{
                border: `2px solid ${BRAND.black}`,
                borderRadius: 24,
                background: '#ffffff',
                overflow: 'hidden',
                minHeight: 360,
              }}
            >
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 14 }}>
                  {text.price}
                </div>

                <div
                  style={{
                    color: BRAND.muted,
                    fontSize: 15,
                    fontWeight: 900,
                    marginBottom: 12,
                  }}
                >
                  {text.setPrice}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSheet('price')}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        height: 76,
                        borderRadius: 16,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.green,
                        fontSize: 34,
                        fontWeight: 900,
                      }}
                    >
                      £
                    </div>

                    <div
                      style={{
                        height: 76,
                        borderRadius: 16,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.red,
                        fontSize: 34,
                        fontWeight: 900,
                      }}
                    >
                      {pricePounds || '0'}
                    </div>

                    <div
                      style={{
                        height: 76,
                        borderRadius: 16,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.red,
                        fontSize: 34,
                        fontWeight: 900,
                      }}
                    >
                      {pricePence.padStart(2, '0').slice(0, 2)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      height: 50,
                      borderRadius: 16,
                      border: `2px solid ${BRAND.black}`,
                      display: 'grid',
                      gridTemplateColumns: '34px 1fr 24px',
                      gap: 8,
                      alignItems: 'center',
                      padding: '0 12px',
                      color: BRAND.navy,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>🏷️</span>
                    <span
                      style={{
                        fontSize: 17,
                        lineHeight: 1.05,
                        fontWeight: 900,
                      }}
                    >
                      {priceMode === 'range' ? `From £${priceFrom} to £${priceTo}` : priceSummary}
                    </span>
                    <span style={{ fontSize: 30, fontWeight: 900 }}>›</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveSheet('payments')}
                style={{
                  width: '100%',
                  border: 'none',
                  borderTop: `2px solid ${BRAND.black}`,
                  background: '#ffffff',
                  padding: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: `2px solid ${BRAND.black}`,
                    background: BRAND.softBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 25,
                  }}
                >
                  💳
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1.05,
                      color: BRAND.navy,
                    }}
                  >
                    {text.paymentMethods}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    {selectedPayments.slice(0, 4).map((id) => {
                      const method = paymentMethods.find((item) => item.id === id);
                      return (
                        <span
                          key={id}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            border: `1.5px solid ${BRAND.black}`,
                            background: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 900,
                          }}
                        >
                          {method?.icon}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <span style={{ fontSize: 34, fontWeight: 900, color: BRAND.navy }}>›</span>
              </button>
            </div>
          </section>

          <section style={{ display: 'grid', gap: 8 }}>
            <RowButton
              icon="📋"
              bg={BRAND.softYellow}
              title={text.title}
              value={title || text.titleHint}
              onClick={() => {
                const next = prompt(text.title, title);
                if (next !== null) setTitle(next);
              }}
            />

            <RowButton
              icon="🔤"
              bg={BRAND.softBlue}
              title={text.description}
              value={description || text.descriptionHint}
              onClick={() => {
                const next = prompt(text.description, description);
                if (next !== null) setDescription(next);
              }}
            />

            <RowButton
              icon="🏷️"
              bg="#f3eeff"
              title={text.category}
              value={langLabel(currentCategory, language)}
              onClick={() => setActiveSheet('category')}
            />

            <RowButton
              icon="▦"
              bg={BRAND.softPink}
              title={text.subcategory}
              value={subcategory || text.selectSubcategory}
              onClick={() => setActiveSheet('subcategory')}
            />

            <RowButton
              icon="🕘"
              bg={BRAND.softGreen}
              title={text.workingHours}
              value={`${hoursFrom} — ${hoursTo}`}
              onClick={() => setActiveSheet('hours')}
            />

            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#ffffff',
                padding: 12,
                display: 'grid',
                gridTemplateColumns: '54px 1fr',
                gap: 14,
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  border: `1.5px solid ${BRAND.black}`,
                  background: BRAND.softBlue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 25,
                }}
              >
                🏠
              </div>

              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: BRAND.navy,
                    marginBottom: 10,
                  }}
                >
                  {text.serviceFormat}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                  }}
                >
                  <PillButton
                    active={formats.includes('at_my_place')}
                    onClick={() => toggleFormat('at_my_place')}
                  >
                    🏠 {text.atMyPlace}
                  </PillButton>

                  <PillButton
                    active={formats.includes('at_client')}
                    onClick={() => toggleFormat('at_client')}
                  >
                    👤 {text.atClient}
                  </PillButton>

                  <PillButton
                    active={formats.includes('online')}
                    onClick={() => toggleFormat('online')}
                  >
                    🌐 {text.online}
                  </PillButton>
                </div>
              </div>
            </div>

            <RowButton
              icon="📞"
              bg={BRAND.softGreen}
              title={text.contactDetails}
              value={contactPreview}
              onClick={() => setActiveSheet('contacts')}
            >
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  gap: 6,
                  overflow: 'hidden',
                }}
              >
                {contactItems.map((item) => (
                  <span
                    key={item.key}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      border: `1.5px solid ${BRAND.black}`,
                      background: item.bg,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                ))}
              </div>
            </RowButton>

            <RowButton
              icon="📍"
              bg="#ffe6e6"
              title={text.address}
              value={addressPreview}
              onClick={() => setActiveSheet('address')}
            />
          </section>
        </div>

        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            background: 'rgba(255,255,255,0.96)',
            borderTop: '1px solid #e2e7f0',
            padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',
          }}
        >
          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            <button
              type="button"
              onClick={handlePublish}
              style={{
                width: '100%',
                height: 68,
                borderRadius: 24,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 0 rgba(17,17,17,0.08)',
              }}
            >
              {text.continue}
            </button>
          </div>
        </div>
      </main>

      {activeSheet === 'price' ? (
        <BottomSheet title={text.priceSettings} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <PillButton
                active={priceMode === 'single'}
                onClick={() => setPriceMode('single')}
                color={BRAND.blue}
              >
                {text.singlePrice}
              </PillButton>

              <PillButton
                active={priceMode === 'range'}
                onClick={() => setPriceMode('range')}
                color={BRAND.blue}
              >
                {text.priceRange}
              </PillButton>
            </div>

            {priceMode === 'single' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.pounds}</div>
                  <input
                    value={pricePounds}
                    onChange={(e) => setPricePounds(e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    style={{
                      ...inputStyle(),
                      color: BRAND.red,
                      fontSize: 30,
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.pence}</div>
                  <input
                    value={pricePence}
                    onChange={(e) =>
                      setPricePence(e.target.value.replace(/[^\d]/g, '').slice(0, 2))
                    }
                    inputMode="numeric"
                    style={{
                      ...inputStyle(),
                      color: BRAND.red,
                      fontSize: 30,
                      textAlign: 'center',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.minPrice}</div>
                  <input
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    style={{
                      ...inputStyle(),
                      color: BRAND.red,
                      fontSize: 30,
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.maxPrice}</div>
                  <input
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    style={{
                      ...inputStyle(),
                      color: BRAND.red,
                      fontSize: 30,
                      textAlign: 'center',
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              style={{
                height: 58,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {text.save}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'payments' ? (
        <BottomSheet title={text.choosePaymentMethods} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {paymentMethods.map((method) => {
              const active = selectedPayments.includes(method.id);

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => togglePayment(method.id)}
                  style={{
                    minHeight: 62,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.softBlue : '#ffffff',
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 32px',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      border: `1.5px solid ${BRAND.black}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 23,
                      fontWeight: 900,
                      background: '#ffffff',
                    }}
                  >
                    {method.icon}
                  </span>

                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {method.title}
                  </span>

                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `2px solid ${BRAND.black}`,
                      background: active ? BRAND.green : '#ffffff',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'category' ? (
        <BottomSheet title={text.selectCategory} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {categories.map((item) => {
              const active = categoryId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(item.id);
                    setSubcategory(item.subcategories[0] || '');
                    setActiveSheet(null);
                  }}
                  style={{
                    minHeight: 72,
                    borderRadius: 20,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.blue : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {langLabel(item, language)}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'subcategory' ? (
        <BottomSheet title={text.selectSubcategory} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {currentCategory.subcategories.map((item) => {
              const active = subcategory === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSubcategory(item);
                    setActiveSheet(null);
                  }}
                  style={{
                    minHeight: 58,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.blue : '#ffffff',
                    color: active ? '#ffffff' : BRAND.navy,
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '0 16px',
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'hours' ? (
        <BottomSheet title={text.setWorkingHours} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.minPrice}</div>
              <input
                type="time"
                value={hoursFrom}
                onChange={(e) => setHoursFrom(e.target.value)}
                style={inputStyle()}
              />
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>{text.maxPrice}</div>
              <input
                type="time"
                value={hoursTo}
                onChange={(e) => setHoursTo(e.target.value)}
                style={inputStyle()}
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              style={{
                gridColumn: '1 / -1',
                height: 58,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {text.save}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'contacts' ? (
        <BottomSheet title={text.contacts} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {contactItems.map((item) => (
              <div
                key={item.key}
                style={{
                  borderRadius: 20,
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
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      border: `1.5px solid ${BRAND.black}`,
                      background: item.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 23,
                    }}
                  >
                    {item.icon}
                  </span>

                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {text[item.key]}
                  </span>
                </div>

                <input
                  value={contacts[item.key]}
                  onChange={(e) =>
                    setContacts((prev) => ({
                      ...prev,
                      [item.key]: e.target.value,
                    }))
                  }
                  placeholder={text[item.key]}
                  style={inputStyle()}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              style={{
                height: 58,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {text.save}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'address' ? (
        <BottomSheet title={text.addressDetails} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              ['city', text.city],
              ['district', text.district],
              ['street', text.street],
              ['postcode', text.postcode],
            ].map(([key, label]) => (
              <div key={key}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{label}</div>
                <input
                  value={address[key as keyof typeof address]}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={label}
                  style={inputStyle()}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              style={{
                height: 58,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {text.save}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {activeSheet === 'editor' && editingMedia ? (
        <BottomSheet title={text.editHint} onClose={() => setActiveSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 24,
                border: `2px solid ${BRAND.black}`,
                overflow: 'hidden',
                background: '#eef5ff',
                touchAction: 'none',
                position: 'relative',
              }}
            >
              {editingMedia.kind === 'video' ? (
                <video
                  src={editingMedia.preview}
                  muted
                  loop
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `translate(${editorOffsetX}px, ${editorOffsetY}px) scale(${editorScale}) rotate(${editorRotate}deg)`,
                  }}
                />
              ) : (
                <img
                  src={editingMedia.preview}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `translate(${editorOffsetX}px, ${editorOffsetY}px) scale(${editorScale}) rotate(${editorRotate}deg)`,
                    userSelect: 'none',
                  }}
                />
              )}
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Zoom</div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={editorScale}
                onChange={(e) => setEditorScale(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Rotate</div>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={editorRotate}
                onChange={(e) => setEditorRotate(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  removeMedia(editingMedia.id);
                  setActiveSheet(null);
                }}
                style={{
                  height: 56,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: '#ffffff',
                  color: BRAND.red,
                  fontSize: 17,
                  fontWeight: 900,
                }}
              >
                Delete
              </button>

              <button
                type="button"
                onClick={applyEditor}
                style={{
                  height: 56,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: BRAND.green,
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 900,
                }}
              >
                ✓ {text.save}
              </button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
