'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { categories } from '../../../../services/categories';

type PhotoItem = {
  id: string;
  name: string;
  preview: string;
  type: 'image' | 'video';
  scale: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
  confirmed: boolean;
};

type SheetMode =
  | null
  | 'title'
  | 'description'
  | 'category'
  | 'subcategory'
  | 'price'
  | 'payment'
  | 'hours'
  | 'format'
  | 'contacts'
  | 'address';

type PaymentMethod = {
  id: string;
  label: string;
  icon: string;
};

const BRAND = {
  navy: '#061b49',
  black: '#111111',
  blue: '#087BFF',
  green: '#23C552',
  red: '#F0182D',
  yellow: '#FFF3B8',
  cream: '#FFFDF8',
  softBlue: '#EAF2FF',
  softPink: '#FFF1F7',
  softGreen: '#EFFFF3',
  gray: '#707988',
};

const MAX_PHOTOS = 50;

const TEXT: Partial<
  Record<
    AppLanguage,
    {
      pageTitle: string;
      pageSubtitle: string;
      photos: string;
      addPhotoVideo: string;
      photoHint: string;
      toolsHint: string;
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
      hoursHint: string;
      serviceFormat: string;
      contactDetails: string;
      contactsHint: string;
      address: string;
      addressHint: string;
      continue: string;
      save: string;
      close: string;
      back: string;
      chooseCategory: string;
      chooseSubcategory: string;
      enterTitle: string;
      enterDescription: string;
      priceType: string;
      fixedPrice: string;
      priceRange: string;
      minPrice: string;
      maxPrice: string;
      pounds: string;
      pennies: string;
      from: string;
      to: string;
      card: string;
      cash: string;
      applePay: string;
      googlePay: string;
      paypal: string;
      bankTransfer: string;
      olamepBalance: string;
      crypto: string;
      fromTime: string;
      toTime: string;
      atMyPlace: string;
      atClient: string;
      online: string;
      phone: string;
      whatsapp: string;
      businessWhatsapp: string;
      telegram: string;
      viber: string;
      instagram: string;
      email: string;
      website: string;
      city: string;
      district: string;
      street: string;
      building: string;
      floor: string;
      flat: string;
      publishOnlyAfterPayment: string;
      alertTitle: string;
      alertDescription: string;
      alertCategory: string;
      alertSubcategory: string;
      alertPhoto: string;
      ready: string;
    }
  >
> = {
  EN: {
    pageTitle: 'Add advertisement',
    pageSubtitle: 'Create a bright listing for clients nearby',
    photos: 'Photos',
    addPhotoVideo: 'Add photo / video',
    photoHint: 'Add photos and videos from your files.',
    toolsHint: 'Move, zoom, rotate and confirm.',
    price: 'Price',
    setPrice: 'Set your price',
    fromTo: 'from £40 to £60',
    paymentMethods: 'Payment methods',
    title: 'Title',
    titleHint: 'Add a short and clear title',
    description: 'Description',
    descriptionHint: 'Describe your advertisement in detail',
    category: 'Category',
    subcategory: 'Subcategory',
    workingHours: 'Working hours',
    hoursHint: '09:00 — 20:00',
    serviceFormat: 'Service format',
    contactDetails: 'Contact details',
    contactsHint: 'Opens a separate sheet of channels',
    address: 'Address',
    addressHint: 'Opens a separate address form',
    continue: 'Continue',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    chooseCategory: 'Choose category',
    chooseSubcategory: 'Choose subcategory',
    enterTitle: 'Enter title',
    enterDescription: 'Enter description',
    priceType: 'Price type',
    fixedPrice: 'Fixed price',
    priceRange: 'Price range',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    pounds: 'Pounds',
    pennies: 'Pennies',
    from: 'From',
    to: 'To',
    card: 'Card',
    cash: 'Cash',
    applePay: 'Apple Pay',
    googlePay: 'Google Pay',
    paypal: 'PayPal',
    bankTransfer: 'Bank transfer',
    olamepBalance: 'Olamep balance',
    crypto: 'Crypto wallet',
    fromTime: 'From',
    toTime: 'To',
    atMyPlace: 'At my place',
    atClient: 'At client',
    online: 'Online',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    email: 'Email',
    website: 'Website',
    city: 'City',
    district: 'District / area',
    street: 'Street',
    building: 'Building',
    floor: 'Floor',
    flat: 'Flat / studio',
    publishOnlyAfterPayment: 'Publication goes live only after payment.',
    alertTitle: 'Please add title',
    alertDescription: 'Please add description',
    alertCategory: 'Please choose category',
    alertSubcategory: 'Please choose subcategory',
    alertPhoto: 'Please add at least one photo or video',
    ready: 'Ready',
  },
  RU: {
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте яркое объявление, чтобы клиенты нашли вас рядом',
    photos: 'Фото',
    addPhotoVideo: 'Добавить фото / видео',
    photoHint: 'Добавьте фото и видео из файлов.',
    toolsHint: 'Двигайте, увеличивайте, поворачивайте и фиксируйте.',
    price: 'Цена',
    setPrice: 'Установите цену',
    fromTo: 'от £40 до £60',
    paymentMethods: 'Способы оплаты',
    title: 'Заголовок',
    titleHint: 'Добавьте короткий и понятный заголовок',
    description: 'Описание',
    descriptionHint: 'Опишите рекламу подробно',
    category: 'Категория',
    subcategory: 'Подкатегория',
    workingHours: 'Часы работы',
    hoursHint: '09:00 — 20:00',
    serviceFormat: 'Формат услуги',
    contactDetails: 'Контактные данные',
    contactsHint: 'Открывается отдельное окно каналов связи',
    address: 'Адрес',
    addressHint: 'Открывается отдельная форма адреса',
    continue: 'Продолжить',
    save: 'Сохранить',
    close: 'Закрыть',
    back: 'Назад',
    chooseCategory: 'Выберите категорию',
    chooseSubcategory: 'Выберите подкатегорию',
    enterTitle: 'Введите заголовок',
    enterDescription: 'Введите описание',
    priceType: 'Тип цены',
    fixedPrice: 'Одна цена',
    priceRange: 'Цена от и до',
    minPrice: 'Цена от',
    maxPrice: 'Цена до',
    pounds: 'Фунты',
    pennies: 'Пенсы',
    from: 'От',
    to: 'До',
    card: 'Карта',
    cash: 'Наличные',
    applePay: 'Apple Pay',
    googlePay: 'Google Pay',
    paypal: 'PayPal',
    bankTransfer: 'Банк',
    olamepBalance: 'Баланс Olamep',
    crypto: 'Криптокошелёк',
    fromTime: 'С',
    toTime: 'До',
    atMyPlace: 'У меня',
    atClient: 'Выезд к клиенту',
    online: 'Онлайн',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    email: 'Email',
    website: 'Сайт',
    city: 'Город',
    district: 'Район / зона',
    street: 'Улица',
    building: 'Дом',
    floor: 'Этаж',
    flat: 'Квартира / студия',
    publishOnlyAfterPayment: 'Публикация выйдет только после оплаты.',
    alertTitle: 'Добавьте заголовок',
    alertDescription: 'Добавьте описание',
    alertCategory: 'Выберите категорию',
    alertSubcategory: 'Выберите подкатегорию',
    alertPhoto: 'Добавьте хотя бы одно фото или видео',
    ready: 'Готово',
  },
};

function getText(language: AppLanguage) {
  return TEXT[language] || TEXT.EN!;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ShellCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: `2px solid ${BRAND.black}`,
        borderRadius: 22,
        background: '#fff',
        boxShadow: '0 3px 0 rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function IconBox({
  icon,
  bg = '#F5F7FF',
}: {
  icon: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        border: `1.8px solid ${BRAND.black}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 27,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

function RowButton({
  icon,
  iconBg,
  title,
  subtitle,
  right,
  onClick,
}: {
  icon: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 72,
        border: `2px solid ${BRAND.black}`,
        borderRadius: 16,
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <IconBox icon={icon} bg={iconBg} />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 950,
            color: BRAND.navy,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 800,
              color: BRAND.gray,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {right || (
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: BRAND.black,
            lineHeight: 1,
          }}
        >
          ›
        </div>
      )}
    </button>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 950,
          color: BRAND.navy,
        }}
      >
        {label}
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          style={{
            width: '100%',
            border: `2px solid ${BRAND.black}`,
            borderRadius: 18,
            padding: '14px 16px',
            fontSize: 17,
            fontWeight: 800,
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
            color: BRAND.navy,
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 58,
            border: `2px solid ${BRAND.black}`,
            borderRadius: 18,
            padding: '0 16px',
            fontSize: 17,
            fontWeight: 850,
            outline: 'none',
            boxSizing: 'border-box',
            color: BRAND.navy,
          }}
        />
      )}
    </div>
  );
}

function Sheet({
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
        background: 'rgba(0,0,0,0.32)',
        zIndex: 500,
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
          maxHeight: '86vh',
          overflowY: 'auto',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          border: `2px solid ${BRAND.black}`,
          borderBottom: 'none',
          background: '#fff',
          padding: '18px 16px calc(18px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 950,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div
            style={{
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 950,
              color: BRAND.navy,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              color: BRAND.navy,
              fontSize: 26,
              fontWeight: 950,
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

export default function NewPromotionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const text = getText(language);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  const [sheet, setSheet] = useState<SheetMode>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const [priceMode, setPriceMode] = useState<'fixed' | 'range'>('range');
  const [pricePounds, setPricePounds] = useState('45');
  const [pricePennies, setPricePennies] = useState('00');
  const [minPrice, setMinPrice] = useState('40');
  const [maxPrice, setMaxPrice] = useState('60');

  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('20:00');

  const [formats, setFormats] = useState({
    atMyPlace: true,
    atClient: true,
    online: false,
  });

  const [payments, setPayments] = useState<string[]>([
    'card',
    'cash',
    'applePay',
    'googlePay',
    'paypal',
    'bank',
  ]);

  const [contacts, setContacts] = useState({
    phone: '',
    whatsapp: '',
    businessWhatsapp: '',
    telegram: '',
    viber: '',
    instagram: '',
    email: '',
    website: '',
  });

  const [address, setAddress] = useState({
    city: '',
    district: '',
    street: '',
    building: '',
    floor: '',
    flat: '',
  });

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
  }, [photos]);

  const localizedCategories = useMemo(() => {
    return (categories as any[]).map((item) => ({
      id: item.id,
      label: item.label || item.shortLabel || item.id,
      icon: item.icon || '📍',
      subcategories: item.subcategories || [],
    }));
  }, []);

  const currentCategory = localizedCategories.find((item) => item.id === categoryId);
  const subcategoryOptions = currentCategory?.subcategories || [];

  const activePhoto = photos.find((item) => item.id === activePhotoId) || photos[0] || null;

  const paymentOptions: PaymentMethod[] = [
    { id: 'card', label: text.card, icon: '💳' },
    { id: 'cash', label: text.cash, icon: '💵' },
    { id: 'applePay', label: text.applePay, icon: '' },
    { id: 'googlePay', label: text.googlePay, icon: 'G' },
    { id: 'paypal', label: text.paypal, icon: '🅿️' },
    { id: 'bank', label: text.bankTransfer, icon: '🏦' },
    { id: 'wallet', label: text.olamepBalance, icon: '👛' },
    { id: 'crypto', label: text.crypto, icon: '₿' },
  ];

  const contactRows = [
    { key: 'phone', label: text.phone, icon: '📞', placeholder: '+44 7000 000000' },
    { key: 'whatsapp', label: text.whatsapp, icon: '🟢', placeholder: '+44 7000 000000' },
    { key: 'businessWhatsapp', label: text.businessWhatsapp, icon: '💼', placeholder: '+44 7000 000000' },
    { key: 'telegram', label: text.telegram, icon: '✈️', placeholder: '@username' },
    { key: 'viber', label: text.viber, icon: '🟣', placeholder: '+44 7000 000000' },
    { key: 'instagram', label: text.instagram, icon: '📸', placeholder: '@instagram' },
    { key: 'email', label: text.email, icon: '✉️', placeholder: 'you@email.com' },
    { key: 'website', label: text.website, icon: '🌐', placeholder: 'yourwebsite.com' },
  ] as const;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, MAX_PHOTOS - photos.length);
    const selected = files.slice(0, remaining);

    const next: PhotoItem[] = selected
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file) => ({
        id: uid(),
        name: file.name,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        scale: 1,
        rotate: 0,
        offsetX: 0,
        offsetY: 0,
        confirmed: false,
      }));

    setPhotos((prev) => {
      const merged = [...prev, ...next];
      if (!activePhotoId && merged[0]) setActivePhotoId(merged[0].id);
      return merged;
    });

    event.target.value = '';
  };

  const updateActivePhoto = (patch: Partial<PhotoItem>) => {
    if (!activePhoto) return;

    setPhotos((prev) =>
      prev.map((item) => (item.id === activePhoto.id ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveActivePhoto = () => {
    if (!activePhoto) return;

    setPhotos((prev) => {
      const found = prev.find((item) => item.id === activePhoto.id);
      if (found) URL.revokeObjectURL(found.preview);

      const next = prev.filter((item) => item.id !== activePhoto.id);
      setActivePhotoId(next[0]?.id || null);
      return next;
    });
  };

  const togglePayment = (id: string) => {
    setPayments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedPaymentLabels = paymentOptions
    .filter((item) => payments.includes(item.id))
    .slice(0, 3)
    .map((item) => item.label)
    .join(', ');

  const priceSummary =
    priceMode === 'fixed'
      ? `£${pricePounds || '0'}.${pricePennies || '00'}`
      : `${text.from} £${minPrice || '0'} ${text.to.toLowerCase()} £${maxPrice || '0'}`;

  const handleContinue = () => {
    if (photos.length === 0) {
      alert(text.alertPhoto);
      return;
    }

    if (!title.trim()) {
      alert(text.alertTitle);
      setSheet('title');
      return;
    }

    if (!description.trim()) {
      alert(text.alertDescription);
      setSheet('description');
      return;
    }

    if (!categoryId) {
      alert(text.alertCategory);
      setSheet('category');
      return;
    }

    if (!subcategory) {
      alert(text.alertSubcategory);
      setSheet('subcategory');
      return;
    }

    alert(text.publishOnlyAfterPayment);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          paddingBottom: 116,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesSelected}
          style={{ display: 'none' }}
        />

        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 60,
              background: 'rgba(255,255,255,0.98)',
              borderBottom: '1px solid #E5E8EF',
              padding: '18px 16px 14px',
              display: 'grid',
              gridTemplateColumns: '54px 1fr 54px',
              gap: 10,
              alignItems: 'start',
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                fontSize: 30,
                fontWeight: 950,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background:
                      'conic-gradient(from 25deg, #ff255d, #ffcb05, #22c55e, #087BFF, #6d28d9, #ff255d)',
                    border: '1.5px solid rgba(0,0,0,0.12)',
                  }}
                />
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 950,
                    color: BRAND.navy,
                  }}
                >
                  Olamep
                </div>
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 950,
                  lineHeight: 0.98,
                  color: BRAND.navy,
                }}
              >
                {text.pageTitle}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 850,
                  color: BRAND.gray,
                  lineHeight: 1.25,
                }}
              >
                {text.pageSubtitle}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                fontSize: 28,
                fontWeight: 950,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </header>

          <section
            style={{
              padding: '14px 12px 0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <ShellCard style={{ padding: 10 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 950,
                    color: BRAND.navy,
                  }}
                >
                  {text.photos}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 950,
                    color: BRAND.gray,
                  }}
                >
                  {photos.length}/{MAX_PHOTOS}
                </div>
              </div>

              <button
                type="button"
                onClick={openFilePicker}
                style={{
                  width: '100%',
                  minHeight: 178,
                  borderRadius: 18,
                  border: `2px dashed ${photos.length ? BRAND.blue : '#8B94A3'}`,
                  background: photos.length ? BRAND.softBlue : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {activePhoto ? (
                  activePhoto.type === 'video' ? (
                    <video
                      src={activePhoto.preview}
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `translate(${activePhoto.offsetX}px, ${activePhoto.offsetY}px) scale(${activePhoto.scale}) rotate(${activePhoto.rotate}deg)`,
                      }}
                    />
                  ) : (
                    <img
                      src={activePhoto.preview}
                      alt={activePhoto.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `translate(${activePhoto.offsetX}px, ${activePhoto.offsetY}px) scale(${activePhoto.scale}) rotate(${activePhoto.rotate}deg)`,
                      }}
                    />
                  )
                ) : (
                  <>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 999,
                        border: `2px solid ${BRAND.green}`,
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
                        fontSize: 16,
                        fontWeight: 950,
                        color: BRAND.navy,
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {text.addPhotoVideo}
                    </div>
                  </>
                )}

                {activePhoto?.confirmed ? (
                  <div
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background: BRAND.green,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 950,
                      border: `2px solid ${BRAND.black}`,
                    }}
                  >
                    ✓
                  </div>
                ) : null}
              </button>

              <div
                style={{
                  marginTop: 9,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'flex-start',
                  color: BRAND.gray,
                  fontSize: 12,
                  fontWeight: 850,
                  lineHeight: 1.25,
                }}
              >
                <span style={{ color: BRAND.navy, fontSize: 17 }}>🖼️</span>
                <span>{text.photoHint}</span>
              </div>

              <div
                style={{
                  marginTop: 10,
                  border: `1.7px solid ${BRAND.blue}`,
                  borderRadius: 14,
                  background: '#E7F1FF',
                  padding: '9px 6px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 4,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    updateActivePhoto({
                      offsetX: activePhoto ? activePhoto.offsetX - 8 : 0,
                    })
                  }
                  style={toolButtonStyle()}
                >
                  ↔
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateActivePhoto({
                      scale: activePhoto ? clamp(activePhoto.scale + 0.1, 1, 3) : 1,
                    })
                  }
                  style={toolButtonStyle()}
                >
                  ⌕+
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateActivePhoto({
                      rotate: activePhoto ? activePhoto.rotate + 90 : 0,
                    })
                  }
                  style={toolButtonStyle()}
                >
                  ↻
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateActivePhoto({
                      offsetX: activePhoto ? activePhoto.offsetX + 8 : 0,
                    })
                  }
                  style={toolButtonStyle()}
                >
                  →
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateActivePhoto({
                      confirmed: true,
                    })
                  }
                  style={{
                    ...toolButtonStyle(),
                    background: BRAND.green,
                    color: '#fff',
                    borderRadius: 999,
                  }}
                >
                  ✓
                </button>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    fontSize: 12,
                    fontWeight: 950,
                    color: BRAND.navy,
                    marginTop: 2,
                  }}
                >
                  {text.toolsHint}
                </div>
              </div>

              {activePhoto ? (
                <button
                  type="button"
                  onClick={handleRemoveActivePhoto}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    height: 34,
                    borderRadius: 12,
                    border: `1.7px solid ${BRAND.black}`,
                    background: '#fff',
                    color: BRAND.red,
                    fontSize: 13,
                    fontWeight: 950,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              ) : null}
            </ShellCard>

            <ShellCard style={{ padding: 10, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 950,
                  color: BRAND.navy,
                  marginBottom: 8,
                }}
              >
                {text.price}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 850,
                  color: BRAND.gray,
                  marginBottom: 8,
                }}
              >
                {text.setPrice}
              </div>

              <button
                type="button"
                onClick={() => setSheet('price')}
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
                    gridTemplateColumns: '44px 1fr 48px',
                    gap: 6,
                    alignItems: 'center',
                  }}
                >
                  <div style={priceBoxStyle(false)}>£</div>
                  <div style={priceBoxStyle(true)}>{pricePounds || '0'}</div>
                  <div style={priceBoxStyle(true)}>{pricePennies || '00'}</div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    height: 38,
                    border: `2px solid ${BRAND.black}`,
                    borderRadius: 13,
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 22px',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0 8px',
                    color: BRAND.navy,
                    fontSize: 13,
                    fontWeight: 950,
                  }}
                >
                  <span>🏷️</span>
                  <span>{priceSummary}</span>
                  <span style={{ fontSize: 25, lineHeight: 1 }}>›</span>
                </div>
              </button>

              <div
                style={{
                  height: 2,
                  background: BRAND.black,
                  margin: '12px -10px 10px',
                }}
              />

              <button
                type="button"
                onClick={() => setSheet('payment')}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 9,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 950,
                      color: BRAND.navy,
                    }}
                  >
                    {text.paymentMethods}
                  </div>
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 950,
                      color: BRAND.black,
                      lineHeight: 1,
                    }}
                  >
                    ›
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 7,
                  }}
                >
                  {paymentOptions.slice(0, 6).map((method) => {
                    const active = payments.includes(method.id);

                    return (
                      <div
                        key={method.id}
                        style={{
                          minHeight: 52,
                          border: `1.7px solid ${BRAND.black}`,
                          borderRadius: 12,
                          background: active ? '#F8FBFF' : '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 3,
                          color: BRAND.navy,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 23,
                            fontWeight: 950,
                            color: method.id === 'googlePay' ? BRAND.blue : BRAND.navy,
                          }}
                        >
                          {method.icon}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 950,
                            textAlign: 'center',
                            lineHeight: 1.05,
                          }}
                        >
                          {method.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </button>
            </ShellCard>
          </section>

          <section style={{ padding: '12px 12px 0', display: 'grid', gap: 8 }}>
            <RowButton
              icon="📝"
              iconBg="#FFF4C7"
              title={text.title}
              subtitle={title || text.titleHint}
              onClick={() => setSheet('title')}
            />

            <RowButton
              icon="T"
              iconBg="#E9F7FF"
              title={text.description}
              subtitle={description || text.descriptionHint}
              onClick={() => setSheet('description')}
            />

            <RowButton
              icon="🏷️"
              iconBg="#F5E8FF"
              title={text.category}
              subtitle={currentCategory?.label || text.chooseCategory}
              onClick={() => setSheet('category')}
            />

            <RowButton
              icon="⌘"
              iconBg="#FFE8FA"
              title={text.subcategory}
              subtitle={subcategory || text.chooseSubcategory}
              onClick={() => setSheet('subcategory')}
            />

            <RowButton
              icon="🕘"
              iconBg="#EFFFF3"
              title={text.workingHours}
              subtitle={`${fromTime} — ${toTime}`}
              onClick={() => setSheet('hours')}
            />

            <ShellCard style={{ padding: 10 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <IconBox icon="🏠" bg="#EEF4FF" />
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 950,
                    color: BRAND.navy,
                  }}
                >
                  {text.serviceFormat}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                }}
              >
                {[
                  ['atMyPlace', text.atMyPlace, '🏠'],
                  ['atClient', text.atClient, '👤'],
                  ['online', text.online, '🌐'],
                ].map(([key, label, icon]) => {
                  const active = formats[key as keyof typeof formats];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormats((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof prev],
                        }))
                      }
                      style={{
                        minHeight: 48,
                        borderRadius: 13,
                        border: `2px solid ${BRAND.black}`,
                        background: active ? BRAND.green : '#fff',
                        color: active ? '#fff' : BRAND.navy,
                        fontSize: 13,
                        fontWeight: 950,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ marginRight: 4 }}>{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </ShellCard>

            <RowButton
              icon="📞"
              iconBg="#EFFFF3"
              title={text.contactDetails}
              subtitle={selectedPaymentLabels ? text.contactsHint : text.contactsHint}
              right={
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {['🟢', '✈️', '🟣', '📸', '✉️', '🌐'].map((icon) => (
                    <div
                      key={icon}
                      style={{
                        width: 31,
                        height: 31,
                        borderRadius: 9,
                        border: `1.5px solid ${BRAND.black}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 17,
                        background: '#fff',
                      }}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              }
              onClick={() => setSheet('contacts')}
            />

            <RowButton
              icon="📍"
              iconBg="#FFECEC"
              title={text.address}
              subtitle={
                [address.city, address.district, address.street].filter(Boolean).join(', ') ||
                text.addressHint
              }
              onClick={() => setSheet('address')}
            />

            <ShellCard
              style={{
                padding: '12px 14px',
                background: '#FFF8D7',
                fontSize: 14,
                fontWeight: 900,
                color: BRAND.navy,
                lineHeight: 1.35,
              }}
            >
              {text.publishOnlyAfterPayment}
            </ShellCard>
          </section>
        </div>
      </main>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          background: 'rgba(255,255,255,0.98)',
          borderTop: '1px solid #E5E8EF',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            type="button"
            onClick={handleContinue}
            style={{
              width: '100%',
              height: 64,
              borderRadius: 22,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#fff',
              fontSize: 22,
              fontWeight: 950,
              cursor: 'pointer',
              boxShadow: '0 6px 0 rgba(0,0,0,0.10)',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>

      {sheet === 'title' ? (
        <Sheet title={text.title} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field
              label={text.title}
              value={title}
              onChange={setTitle}
              placeholder={text.enterTitle}
            />
            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'description' ? (
        <Sheet title={text.description} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field
              label={text.description}
              value={description}
              onChange={setDescription}
              placeholder={text.enterDescription}
              multiline
            />
            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'category' ? (
        <Sheet title={text.category} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {localizedCategories.map((item) => {
              const active = item.id === categoryId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(item.id);
                    setSubcategory('');
                    setSheet('subcategory');
                  }}
                  style={{
                    minHeight: 62,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.blue : '#fff',
                    color: active ? '#fff' : BRAND.navy,
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 30px',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    fontSize: 18,
                    fontWeight: 950,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 27 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  <span>{active ? '✓' : '›'}</span>
                </button>
              );
            })}
          </div>
        </Sheet>
      ) : null}

      {sheet === 'subcategory' ? (
        <Sheet title={text.subcategory} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {!categoryId ? (
              <button
                type="button"
                onClick={() => setSheet('category')}
                style={primaryButtonStyle()}
              >
                {text.chooseCategory}
              </button>
            ) : null}

            {subcategoryOptions.map((item: string) => {
              const active = item === subcategory;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSubcategory(item);
                    setSheet(null);
                  }}
                  style={{
                    minHeight: 58,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.blue : '#fff',
                    color: active ? '#fff' : BRAND.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '10px 14px',
                    fontSize: 18,
                    fontWeight: 950,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{item}</span>
                  <span>{active ? '✓' : '›'}</span>
                </button>
              );
            })}
          </div>
        </Sheet>
      ) : null}

      {sheet === 'price' ? (
        <Sheet title={text.price} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {[
                ['fixed', text.fixedPrice],
                ['range', text.priceRange],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPriceMode(mode as 'fixed' | 'range')}
                  style={{
                    height: 54,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: priceMode === mode ? BRAND.blue : '#fff',
                    color: priceMode === mode ? '#fff' : BRAND.navy,
                    fontSize: 16,
                    fontWeight: 950,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {priceMode === 'fixed' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <Field
                  label={text.pounds}
                  value={pricePounds}
                  onChange={(next) => setPricePounds(next.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder="45"
                />
                <Field
                  label={text.pennies}
                  value={pricePennies}
                  onChange={(next) => setPricePennies(next.replace(/[^\d]/g, '').slice(0, 2))}
                  placeholder="00"
                />
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <Field
                  label={text.minPrice}
                  value={minPrice}
                  onChange={(next) => setMinPrice(next.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder="40"
                />
                <Field
                  label={text.maxPrice}
                  value={maxPrice}
                  onChange={(next) => setMaxPrice(next.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder="60"
                />
              </div>
            )}

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'payment' ? (
        <Sheet title={text.paymentMethods} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {paymentOptions.map((method) => {
              const active = payments.includes(method.id);

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => togglePayment(method.id)}
                  style={{
                    minHeight: 64,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.softBlue : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 32px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <IconBox icon={method.icon} bg="#fff" />
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 950,
                      color: BRAND.navy,
                    }}
                  >
                    {method.label}
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `2px solid ${BRAND.black}`,
                      background: active ? BRAND.green : '#fff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 950,
                    }}
                  >
                    {active ? '✓' : ''}
                  </div>
                </button>
              );
            })}

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'hours' ? (
        <Sheet title={text.workingHours} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <Field label={text.fromTime} value={fromTime} onChange={setFromTime} placeholder="09:00" />
              <Field label={text.toTime} value={toTime} onChange={setToTime} placeholder="20:00" />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              {['09:00', '10:00', '12:00', '18:00', '20:00', '22:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFromTime(time)}
                  style={{
                    height: 44,
                    borderRadius: 14,
                    border: `2px solid ${BRAND.black}`,
                    background: '#fff',
                    color: BRAND.navy,
                    fontSize: 15,
                    fontWeight: 950,
                    cursor: 'pointer',
                  }}
                >
                  {time}
                </button>
              ))}
            </div>

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'contacts' ? (
        <Sheet title={text.contactDetails} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {contactRows.map((row) => (
              <div
                key={row.key}
                style={{
                  border: `2px solid ${BRAND.black}`,
                  borderRadius: 20,
                  background: '#fff',
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <IconBox icon={row.icon} bg="#F7FAFF" />
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 950,
                      color: BRAND.navy,
                    }}
                  >
                    {row.label}
                  </div>
                </div>

                <input
                  value={contacts[row.key]}
                  onChange={(e) =>
                    setContacts((prev) => ({
                      ...prev,
                      [row.key]: e.target.value,
                    }))
                  }
                  placeholder={row.placeholder}
                  style={{
                    width: '100%',
                    height: 54,
                    border: `2px solid ${BRAND.black}`,
                    borderRadius: 17,
                    padding: '0 14px',
                    fontSize: 16,
                    fontWeight: 850,
                    color: BRAND.navy,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'address' ? (
        <Sheet title={text.address} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field
              label={text.city}
              value={address.city}
              onChange={(next) => setAddress((prev) => ({ ...prev, city: next }))}
              placeholder="London"
            />
            <Field
              label={text.district}
              value={address.district}
              onChange={(next) => setAddress((prev) => ({ ...prev, district: next }))}
              placeholder="Camden, Chelsea, Mayfair..."
            />
            <Field
              label={text.street}
              value={address.street}
              onChange={(next) => setAddress((prev) => ({ ...prev, street: next }))}
              placeholder="Street"
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}
            >
              <Field
                label={text.building}
                value={address.building}
                onChange={(next) => setAddress((prev) => ({ ...prev, building: next }))}
                placeholder="12"
              />
              <Field
                label={text.floor}
                value={address.floor}
                onChange={(next) => setAddress((prev) => ({ ...prev, floor: next }))}
                placeholder="2"
              />
              <Field
                label={text.flat}
                value={address.flat}
                onChange={(next) => setAddress((prev) => ({ ...prev, flat: next }))}
                placeholder="5"
              />
            </div>

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}

function toolButtonStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 36,
    border: 'none',
    background: 'transparent',
    color: '#061b49',
    fontSize: 25,
    fontWeight: 950,
    cursor: 'pointer',
    lineHeight: 1,
  };
}

function priceBoxStyle(isNumber: boolean): React.CSSProperties {
  return {
    height: 58,
    borderRadius: 13,
    border: '1.7px solid #C8CCD4',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isNumber ? 27 : 24,
    fontWeight: 950,
    color: isNumber ? '#F0182D' : '#23C552',
    boxSizing: 'border-box',
  };
}

function primaryButtonStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 58,
    borderRadius: 20,
    border: '2px solid #111111',
    background: '#23C552',
    color: '#fff',
    fontSize: 18,
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 5px 0 rgba(0,0,0,0.10)',
  };
}
