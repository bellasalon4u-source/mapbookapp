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
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { categories } from '../../../../services/categories';
import { isAuthenticated } from '../../../../services/authStore';

type MediaMode = 'single' | 'collage' | 'video';

type SheetMode =
  | null
  | 'media'
  | 'category'
  | 'subcategory'
  | 'title'
  | 'description'
  | 'days'
  | 'enhance'
  | 'contacts'
  | 'address'
  | 'payment';

type MediaItem = {
  id: string;
  name: string;
  preview: string;
  type: 'image' | 'video';
  scale: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

type ContactKey =
  | 'phone'
  | 'whatsapp'
  | 'businessWhatsapp'
  | 'telegram'
  | 'viber'
  | 'instagram'
  | 'email'
  | 'website';

type ContactEntry = {
  id: string;
  countryCode: string;
  value: string;
};

type CategoryView = {
  id: string;
  label: string;
  icon: string;
  image?: string;
  subcategories: string[];
};

const BRAND = {
  navy: '#061b49',
  black: '#111111',
  green: '#24c85a',
  greenDark: '#17a84a',
  blue: '#087bff',
  red: '#ff244f',
  yellow: '#fff3b8',
  cream: '#fffdf8',
  softGreen: '#eaffef',
  softBlue: '#eef5ff',
  softPink: '#fff1f7',
  softYellow: '#fff8d9',
  gray: '#707988',
  dark: '#080f1f',
};

const PRICE_PER_DAY = 2;
const FIRST_AD_FREE = true;

const TEXT = {
  EN: {
    pageTitle: 'Add advertisement',
    pageSubtitle: 'Create a premium ad that clients notice nearby',
    media: 'Photo / video',
    chooseMedia: 'Choose media',
    mediaHint: '1 photo, 2–4 photo collage, or 1 short video',
    singlePhoto: '1 photo',
    collage: 'Collage',
    video: 'Mini video',
    camera: 'Camera',
    gallery: 'Gallery',
    files: 'Files',
    title: 'Title',
    titleHint: 'Short catchy ad title',
    description: 'Description',
    descriptionHint: 'What makes this offer special?',
    category: 'Category',
    chooseCategory: 'Choose category',
    chooseSubcategory: 'Choose subcategory',
    days: 'Advertising days',
    daysHint: '1 day = £2',
    firstDayFree: 'First day free',
    enhance: 'Ad Style Studio',
    enhanceHint: 'Sticker and visual style',
    contacts: 'Contact details',
    contactsHint: 'Phone, WhatsApp, Telegram, Viber, Instagram',
    address: 'Address',
    addressHint: 'Where this ad should be shown',
    preview: 'Premium preview',
    continue: 'Continue to payment',
    save: 'Save',
    done: 'Done',
    cancel: 'Cancel',
    replace: 'Replace photo',
    total: 'Total',
    free: 'Free',
    payment: 'Payment',
    publishOnlyAfterPayment: 'Advertisement is published only after payment.',
    alertMedia: 'Please add photo or video.',
    alertTitle: 'Please add title.',
    alertDescription: 'Please add description.',
    alertCategory: 'Please choose category and subcategory.',
    alertPhone: 'Please add phone number.',
    registerFirst: 'Please register before payment.',
    profile: 'Profile',
    book: 'Book',
    addNumber: 'Add number',
  },
  RU: {
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте премиальную рекламу, которую клиенты заметят рядом',
    media: 'Фото / видео',
    chooseMedia: 'Выбрать медиа',
    mediaHint: '1 фото, коллаж 2–4 фото или 1 короткое видео',
    singlePhoto: '1 фото',
    collage: 'Коллаж',
    video: 'Мини-видео',
    camera: 'Камера',
    gallery: 'Галерея',
    files: 'Файлы',
    title: 'Заголовок',
    titleHint: 'Короткий цепляющий заголовок',
    description: 'Описание',
    descriptionHint: 'Что особенного в этом предложении?',
    category: 'Категория',
    chooseCategory: 'Выбрать категорию',
    chooseSubcategory: 'Выбрать подкатегорию',
    days: 'Дни рекламы',
    daysHint: '1 день = £2',
    firstDayFree: 'Первый день бесплатно',
    enhance: 'Стиль рекламы',
    enhanceHint: 'Наклейка и визуальный стиль',
    contacts: 'Контактные данные',
    contactsHint: 'Телефон, WhatsApp, Telegram, Viber, Instagram',
    address: 'Адрес',
    addressHint: 'Где показывать рекламу',
    preview: 'Премиум предпросмотр',
    continue: 'Перейти к оплате',
    save: 'Сохранить',
    done: 'Готово',
    cancel: 'Отмена',
    replace: 'Заменить фото',
    total: 'Итого',
    free: 'Бесплатно',
    payment: 'Оплата',
    publishOnlyAfterPayment: 'Реклама публикуется только после оплаты.',
    alertMedia: 'Добавьте фото или видео.',
    alertTitle: 'Добавьте заголовок.',
    alertDescription: 'Добавьте описание.',
    alertCategory: 'Выберите категорию и подкатегорию.',
    alertPhone: 'Добавьте номер телефона.',
    registerFirst: 'Перед оплатой нужно зарегистрироваться.',
    profile: 'Профиль',
    book: 'Забронировать',
    addNumber: 'Добавить номер',
  },
};

function getText(language: AppLanguage) {
  return language === 'RU' ? TEXT.RU : TEXT.EN;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localizeLabel(value: unknown, language: AppLanguage) {
  if (typeof value === 'string') return value;

  if (value && typeof value === 'object') {
    const map = value as Record<string, string>;
    return map[language] || map.EN || map.RU || Object.values(map)[0] || '';
  }

  return '';
}

function ShellCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        border: `2px solid ${BRAND.black}`,
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 4px 0 rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function AppLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/ui/logo/app-icon.svg"
        alt="Olamep"
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          objectFit: 'contain',
        }}
      />
      <span
        style={{
          color: BRAND.navy,
          fontSize: 32,
          fontWeight: 950,
          lineHeight: 1,
        }}
      >
        Olamep
      </span>
    </div>
  );
}

function RoundButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={roundButtonStyle()}>
      {children}
    </button>
  );
}

function IconBox({
  icon,
  image,
  bg = '#ffffff',
}: {
  icon?: string;
  image?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 16,
        border: `1.8px solid ${BRAND.black}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {image ? (
        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: 28 }}>{icon || '📍'}</span>
      )}
    </div>
  );
}

function RowButton({
  icon,
  image,
  title,
  subtitle,
  secondLine,
  onClick,
}: {
  icon: string;
  image?: string;
  title: string;
  subtitle: string;
  secondLine?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 78,
        border: `2px solid ${BRAND.black}`,
        borderRadius: 20,
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: '62px 1fr 26px',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <IconBox icon={icon} image={image} bg={BRAND.softGreen} />

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 950, color: BRAND.navy, lineHeight: 1.1 }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 14,
            fontWeight: 850,
            color: BRAND.gray,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
        {secondLine ? (
          <div
            style={{
              marginTop: 3,
              fontSize: 13,
              fontWeight: 900,
              color: BRAND.green,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {secondLine}
          </div>
        ) : null}
      </div>

      <span style={{ fontSize: 32, fontWeight: 950, color: BRAND.black }}>›</span>
    </button>
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
        zIndex: 500,
        background: 'rgba(0,0,0,0.34)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: '86vh',
          overflowY: 'auto',
          background: '#fff',
          border: `2px solid ${BRAND.black}`,
          borderBottom: 'none',
          borderRadius: '30px 30px 0 0',
          padding: '18px 16px calc(18px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            gap: 10,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <RoundButton onClick={onClose}>←</RoundButton>
          <div
            style={{
              textAlign: 'center',
              color: BRAND.navy,
              fontSize: 26,
              fontWeight: 950,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <RoundButton onClick={onClose}>×</RoundButton>
        </div>

        {children}
      </div>
    </div>
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
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 16, fontWeight: 950, color: BRAND.navy }}>{label}</span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={5}
          style={{
            width: '100%',
            border: `2px solid ${BRAND.black}`,
            borderRadius: 18,
            padding: 14,
            fontSize: 17,
            fontWeight: 800,
            color: BRAND.navy,
            outline: 'none',
            resize: 'none',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 58,
            border: `2px solid ${BRAND.black}`,
            borderRadius: 18,
            padding: '0 16px',
            fontSize: 17,
            fontWeight: 850,
            color: BRAND.navy,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
    </label>
  );
}

export default function NewPromotionPage() {
  const router = useRouter();

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const text = getText(language);

  const [sheet, setSheet] = useState<SheetMode>(null);

  const [mediaMode, setMediaMode] = useState<MediaMode>('single');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [dragMediaId, setDragMediaId] = useState<string | null>(null);
  const [editorMediaId, setEditorMediaId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const [days, setDays] = useState(1);
  const [sticker, setSticker] = useState('today');
  const [visualStyle, setVisualStyle] = useState('classic');

  const [contacts, setContacts] = useState<Record<ContactKey, ContactEntry[]>>({
    phone: [{ id: uid(), countryCode: '+44', value: '' }],
    whatsapp: [{ id: uid(), countryCode: '+44', value: '' }],
    businessWhatsapp: [{ id: uid(), countryCode: '+44', value: '' }],
    telegram: [{ id: uid(), countryCode: '', value: '' }],
    viber: [{ id: uid(), countryCode: '+44', value: '' }],
    instagram: [{ id: uid(), countryCode: '', value: '' }],
    email: [{ id: uid(), countryCode: '', value: '' }],
    website: [{ id: uid(), countryCode: '', value: '' }],
  });

  const [address, setAddress] = useState({
    city: '',
    district: '',
    street: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubscribe = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [media]);

  const localizedCategories = useMemo<CategoryView[]>(() => {
    return (categories as any[]).map((item) => ({
      id: String(item.id || ''),
      label:
        localizeLabel(item.label, language) ||
        localizeLabel(item.shortLabel, language) ||
        String(item.id || 'Category'),
      icon: String(item.icon || '📍'),
      image: item.image || item.imageUrl || item.src || item.photo || '',
      subcategories: Array.isArray(item.subcategories)
        ? item.subcategories.map((sub: unknown) => localizeLabel(sub, language) || String(sub))
        : [],
    }));
  }, [language]);

  const currentCategory = localizedCategories.find((item) => item.id === categoryId);
  const subcategoryOptions = currentCategory?.subcategories || [];
  const editorMedia = media.find((item) => item.id === editorMediaId) || null;

  const adPrice = FIRST_AD_FREE ? Math.max(0, days - 1) * PRICE_PER_DAY : days * PRICE_PER_DAY;

  const daysSummary =
    language === 'RU'
      ? `${days} дн. • ${adPrice === 0 ? text.free : `£${adPrice}`}`
      : `${days} days • ${adPrice === 0 ? text.free : `£${adPrice}`}`;

  const mediaSummary =
    mediaMode === 'single'
      ? text.singlePhoto
      : mediaMode === 'collage'
        ? `${text.collage} ${media.length ? media.length : '2–4'}`
        : text.video;

  const stickerOptions = [
    { id: 'today', label: language === 'RU' ? 'Сегодня' : 'Today', emoji: '⚡' },
    { id: 'top', label: 'TOP', emoji: '⭐' },
    { id: 'new', label: 'NEW', emoji: '✨' },
    { id: 'sale', label: language === 'RU' ? 'Скидка' : 'Sale', emoji: '🏷️' },
    { id: 'lux', label: 'LUX', emoji: '💎' },
    { id: 'hot', label: language === 'RU' ? 'Горячее' : 'Hot', emoji: '🔥' },
  ];

  const styleOptions = [
    { id: 'classic', label: language === 'RU' ? 'Классик' : 'Classic', emoji: '🎯' },
    { id: 'flyer', label: language === 'RU' ? 'Флаер' : 'Flyer', emoji: '🎨' },
    { id: 'premium', label: language === 'RU' ? 'Премиум' : 'Premium', emoji: '👑' },
    { id: 'neon', label: language === 'RU' ? 'Сияние' : 'Glow', emoji: '💫' },
  ];

  const chosenSticker = stickerOptions.find((item) => item.id === sticker) || stickerOptions[0];
  const chosenStyle = styleOptions.find((item) => item.id === visualStyle) || styleOptions[0];

  const paymentOptions = [
    { id: 'card', label: language === 'RU' ? 'Карта' : 'Card', icon: '💳' },
    { id: 'balance', label: language === 'RU' ? 'Баланс' : 'Balance', icon: '👛' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'apple', label: 'Apple Pay', icon: '' },
  ];

  const contactOptions: {
    key: ContactKey;
    label: string;
    icon: string;
    brand: string;
    placeholder: string;
    phoneLike?: boolean;
  }[] = [
    {
      key: 'phone',
      label: language === 'RU' ? 'Телефон' : 'Phone',
      icon: '☎',
      brand: '#0f172a',
      placeholder: '7000 000000',
      phoneLike: true,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: 'WA',
      brand: '#25D366',
      placeholder: '7000 000000',
      phoneLike: true,
    },
    {
      key: 'businessWhatsapp',
      label: 'Business WhatsApp',
      icon: 'WB',
      brand: '#128C7E',
      placeholder: '7000 000000',
      phoneLike: true,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: 'TG',
      brand: '#229ED9',
      placeholder: '@username',
    },
    {
      key: 'viber',
      label: 'Viber',
      icon: 'VB',
      brand: '#7360F2',
      placeholder: '7000 000000',
      phoneLike: true,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: 'IG',
      brand: '#E4405F',
      placeholder: '@username',
    },
    {
      key: 'email',
      label: 'Email',
      icon: '@',
      brand: '#087bff',
      placeholder: 'you@email.com',
    },
    {
      key: 'website',
      label: 'Website',
      icon: 'www',
      brand: '#061b49',
      placeholder: 'yourwebsite.com',
    },
  ];

  const handleMediaPick = (mode: MediaMode, source: 'camera' | 'gallery' | 'files' | 'video') => {
    setMediaMode(mode);
    setSheet(null);

    setTimeout(() => {
      if (source === 'camera') cameraInputRef.current?.click();
      if (source === 'gallery') galleryInputRef.current?.click();
      if (source === 'files') fileInputRef.current?.click();
      if (source === 'video') videoInputRef.current?.click();
    }, 50);
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>, mode: MediaMode) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const minRequired = mode === 'collage' ? 2 : 1;
    const limit = mode === 'collage' ? 4 : 1;

    const allowed = files
      .filter((file) => {
        if (mode === 'video') return file.type.startsWith('video/');
        return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      })
      .slice(0, limit);

    if (allowed.length < minRequired) {
      alert(
        language === 'RU'
          ? 'Для коллажа выберите минимум 2 фото. HEIC/HEIF не поддерживается.'
          : 'For collage choose at least 2 photos. HEIC/HEIF is not supported.'
      );
      event.target.value = '';
      return;
    }

    media.forEach((item) => URL.revokeObjectURL(item.preview));

    const next = allowed.map((file) => ({
      id: uid(),
      name: file.name,
      preview: URL.createObjectURL(file),
      type: mode === 'video' ? ('video' as const) : ('image' as const),
      scale: 1,
      rotate: 0,
      offsetX: 0,
      offsetY: 0,
    }));

    setMediaMode(mode);
    setMedia(next);
    event.target.value = '';
  };

  const handleReplaceSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editorMediaId) return;

    const isOk = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

    if (!isOk) {
      alert(language === 'RU' ? 'Выберите JPG, PNG или WEBP.' : 'Choose JPG, PNG or WEBP.');
      event.target.value = '';
      return;
    }

    setMedia((prev) =>
      prev.map((item) => {
        if (item.id !== editorMediaId) return item;

        URL.revokeObjectURL(item.preview);

        return {
          ...item,
          name: file.name,
          preview: URL.createObjectURL(file),
          type: 'image',
          scale: 1,
          rotate: 0,
          offsetX: 0,
          offsetY: 0,
        };
      })
    );

    event.target.value = '';
  };

  const removeMediaItem = (id: string) => {
    setMedia((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateMediaItem = (id: string, patch: Partial<MediaItem>) => {
    setMedia((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const reorderMedia = (targetId: string) => {
    if (!dragMediaId || dragMediaId === targetId) return;

    setMedia((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === dragMediaId);
      const toIndex = prev.findIndex((item) => item.id === targetId);

      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);

      return next;
    });

    setDragMediaId(null);
  };

  const updateContactEntry = (key: ContactKey, id: string, patch: Partial<ContactEntry>) => {
    setContacts((prev) => ({
      ...prev,
      [key]: prev[key].map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  };

  const addContactEntry = (key: ContactKey, phoneLike?: boolean) => {
    setContacts((prev) => ({
      ...prev,
      [key]: [
        ...prev[key],
        {
          id: uid(),
          countryCode: phoneLike ? '+44' : '',
          value: '',
        },
      ],
    }));
  };

  const removeContactEntry = (key: ContactKey, id: string) => {
    setContacts((prev) => ({
      ...prev,
      [key]: prev[key].length > 1 ? prev[key].filter((entry) => entry.id !== id) : prev[key],
    }));
  };

  const primaryPhone = contacts.phone[0]?.value || '';

  const handleContinue = () => {
    if (!media.length) {
      alert(text.alertMedia);
      setSheet('media');
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

    if (!categoryId || !subcategory) {
      alert(text.alertCategory);
      setSheet('category');
      return;
    }

    if (!primaryPhone.trim()) {
      alert(text.alertPhone);
      setSheet('contacts');
      return;
    }

    if (!isAuthenticated()) {
      alert(text.registerFirst);
      router.push(`/auth?returnTo=${encodeURIComponent('/profile/promotions/new')}`);
      return;
    }

    setSheet('payment');
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          paddingBottom: 118,
        }}
      >
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => handleMediaSelected(event, mediaMode)}
          style={{ display: 'none' }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={(event) => handleMediaSelected(event, mediaMode)}
          style={{ display: 'none' }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => handleMediaSelected(event, mediaMode)}
          style={{ display: 'none' }}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(event) => handleMediaSelected(event, 'video')}
          style={{ display: 'none' }}
        />

        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleReplaceSelected}
          style={{ display: 'none' }}
        />

        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 60,
              background: 'rgba(255,255,255,0.98)',
              borderBottom: '1px solid #e8ebf0',
              padding: '18px 16px 14px',
              display: 'grid',
              gridTemplateColumns: '54px 1fr 54px',
              gap: 10,
              alignItems: 'start',
            }}
          >
            <RoundButton onClick={() => router.back()}>←</RoundButton>

            <div style={{ textAlign: 'center' }}>
              <AppLogo />

              <div
                style={{
                  marginTop: 14,
                  fontSize: 33,
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

            <RoundButton onClick={() => router.push('/')}>×</RoundButton>
          </header>

          <section style={{ padding: '14px 12px 0', display: 'grid', gap: 10 }}>
            <ShellCard style={{ padding: 12 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 950 }}>{text.media}</div>
                <div
                  style={{
                    border: `2px solid ${BRAND.black}`,
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                    fontWeight: 950,
                    background: BRAND.softGreen,
                  }}
                >
                  {mediaSummary}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheet('media')}
                style={{
                  width: '100%',
                  minHeight: 238,
                  borderRadius: 22,
                  border: `2px dashed ${BRAND.green}`,
                  background: media.length ? '#ffffff' : BRAND.softGreen,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 0,
                }}
              >
                {media.length ? (
                  <MediaPreview
                    media={media}
                    mode={mediaMode}
                    onRemove={removeMediaItem}
                    onOpenEditor={setEditorMediaId}
                    onDragStart={setDragMediaId}
                    onDropItem={reorderMedia}
                  />
                ) : (
                  <div
                    style={{
                      minHeight: 238,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: 999,
                        border: `2.5px solid ${BRAND.green}`,
                        color: BRAND.green,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 44,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      +
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 950, color: BRAND.navy }}>
                      {text.chooseMedia}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 850, color: BRAND.gray }}>
                      {text.mediaHint}
                    </div>
                  </div>
                )}
              </button>
            </ShellCard>

            <RowButton
              icon="📝"
              title={text.title}
              subtitle={title || text.titleHint}
              onClick={() => setSheet('title')}
            />

            <RowButton
              icon="T"
              title={text.description}
              subtitle={description || text.descriptionHint}
              onClick={() => setSheet('description')}
            />

            <RowButton
              icon={currentCategory?.icon || '🏷️'}
              image={currentCategory?.image}
              title={text.category}
              subtitle={currentCategory?.label || text.chooseCategory}
              secondLine={subcategory || ''}
              onClick={() => setSheet('category')}
            />

            <RowButton
              icon="📅"
              title={text.days}
              subtitle={text.daysHint}
              secondLine={daysSummary}
              onClick={() => setSheet('days')}
            />

            <RowButton
              icon={chosenSticker.emoji}
              title={text.enhance}
              subtitle={`${chosenSticker.label} • ${chosenStyle.label}`}
              onClick={() => setSheet('enhance')}
            />

            <RowButton
              icon="📞"
              title={text.contacts}
              subtitle={primaryPhone ? `${contacts.phone[0].countryCode} ${primaryPhone}` : text.contactsHint}
              onClick={() => setSheet('contacts')}
            />

            <RowButton
              icon="📍"
              title={text.address}
              subtitle={
                [address.city, address.district, address.street].filter(Boolean).join(', ') ||
                text.addressHint
              }
              onClick={() => setSheet('address')}
            />

            <ShellCard
              style={{
                padding: 12,
                background: BRAND.softYellow,
                fontSize: 14,
                fontWeight: 900,
                lineHeight: 1.35,
              }}
            >
              ⭐ {text.publishOnlyAfterPayment}
            </ShellCard>

            <AdPreviewCard
              title={title}
              description={description}
              media={media}
              mediaMode={mediaMode}
              chosenSticker={chosenSticker}
              chosenStyle={chosenStyle}
              language={language}
              text={text}
            />
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
          borderTop: '1px solid #e8ebf0',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button type="button" onClick={handleContinue} style={primaryButtonStyle()}>
            {text.continue}
          </button>
        </div>
      </div>

      {sheet === 'media' ? (
        <Sheet title={text.chooseMedia} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { mode: 'single' as const, title: text.singlePhoto, hint: 'JPG / PNG / WEBP' },
              { mode: 'collage' as const, title: text.collage, hint: '2–4 photos in one ad image' },
              { mode: 'video' as const, title: text.video, hint: 'Up to 5 seconds recommended' },
            ].map((item) => {
              const active = mediaMode === item.mode;

              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setMediaMode(item.mode)}
                  style={{
                    minHeight: 62,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '1fr 32px',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>
                    <div style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>
                      {item.title}
                    </div>
                    <div style={{ marginTop: 3, fontSize: 13, fontWeight: 850, color: BRAND.gray }}>
                      {item.hint}
                    </div>
                  </span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `2px solid ${BRAND.black}`,
                      background: active ? BRAND.green : '#fff',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 950,
                    }}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleMediaPick(mediaMode, 'camera')}
                style={smallChoiceStyle()}
              >
                📷<br />
                {text.camera}
              </button>
              <button
                type="button"
                onClick={() => handleMediaPick(mediaMode, 'gallery')}
                style={smallChoiceStyle()}
              >
                🖼️<br />
                {text.gallery}
              </button>
              <button
                type="button"
                onClick={() =>
                  mediaMode === 'video'
                    ? handleMediaPick('video', 'video')
                    : handleMediaPick(mediaMode, 'files')
                }
                style={smallChoiceStyle()}
              >
                📁<br />
                {text.files}
              </button>
            </div>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'title' ? (
        <Sheet title={text.title} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field label={text.title} value={title} onChange={setTitle} placeholder={text.titleHint} />
            <button type="button" onClick={() => setSheet('description')} style={primaryButtonStyle()}>
              {language === 'RU' ? 'Далее →' : 'Next →'}
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
              placeholder={text.descriptionHint}
              multiline
            />
            <button type="button" onClick={() => setSheet('category')} style={primaryButtonStyle()}>
              {language === 'RU' ? 'Далее →' : 'Next →'}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'category' ? (
        <Sheet title={text.chooseCategory} onClose={() => setSheet(null)}>
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
                    minHeight: 78,
                    borderRadius: 18,
                    border: `2px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '62px 1fr 28px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <IconBox icon={item.icon} image={item.image} bg="#fff" />

                  <span>
                    <div style={{ fontSize: 20, fontWeight: 950, color: BRAND.navy }}>
                      {item.label}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 850, color: BRAND.gray }}>
                      {item.subcategories.length}{' '}
                      {language === 'RU' ? 'подкатегорий' : 'subcategories'}
                    </div>
                  </span>

                  <span style={{ fontSize: 30, fontWeight: 950 }}>{active ? '✓' : '›'}</span>
                </button>
              );
            })}
          </div>
        </Sheet>
      ) : null}

      {sheet === 'subcategory' ? (
        <Sheet title={text.chooseSubcategory} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {subcategoryOptions.map((item) => {
              const active = item === subcategory;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSubcategory(item);
                    setSheet('days');
                  }}
                  style={{
                    minHeight: 58,
                    borderRadius: 18,
                    border: `2px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    color: BRAND.navy,
                    display: 'grid',
                    gridTemplateColumns: '1fr 32px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    fontSize: 18,
                    fontWeight: 950,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{item}</span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: active ? BRAND.green : '#fff',
                      color: '#fff',
                      border: `2px solid ${BRAND.black}`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 16,
                    }}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </Sheet>
      ) : null}

      {sheet === 'days' ? (
        <Sheet title={text.days} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            {FIRST_AD_FREE ? (
              <ShellCard
                style={{
                  padding: 14,
                  background: BRAND.red,
                  color: '#fff',
                  animation: 'pulseGift 1.4s infinite',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 950 }}>
                  🎁 {text.firstDayFree}
                </div>
                <div style={{ marginTop: 5, fontSize: 14, fontWeight: 850 }}>
                  {language === 'RU'
                    ? 'Только для первой рекламы'
                    : 'Only for the first advertisement'}
                </div>
              </ShellCard>
            ) : null}

            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              style={{
                width: '100%',
                height: 70,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                padding: '0 16px',
                fontSize: 22,
                fontWeight: 950,
              }}
            >
              {Array.from({ length: 365 }, (_, index) => index + 1).map((day) => {
                const price = FIRST_AD_FREE
                  ? Math.max(0, day - 1) * PRICE_PER_DAY
                  : day * PRICE_PER_DAY;

                return (
                  <option key={day} value={day}>
                    {language === 'RU'
                      ? `${day} дн. — ${price === 0 ? 'бесплатно' : `£${price}`}`
                      : `${day} days — ${price === 0 ? 'free' : `£${price}`}`}
                  </option>
                );
              })}
            </select>

            <ShellCard style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 850, color: BRAND.gray }}>
                {text.total}
              </div>
              <div style={{ marginTop: 4, fontSize: 34, fontWeight: 950, color: BRAND.green }}>
                {adPrice === 0 ? text.free : `£${adPrice}`}
              </div>
            </ShellCard>

            <button type="button" onClick={() => setSheet('enhance')} style={primaryButtonStyle()}>
              {language === 'RU' ? 'Далее →' : 'Next →'}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'enhance' ? (
        <Sheet title={text.enhance} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>
                {language === 'RU' ? 'Наклейка' : 'Sticker'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {stickerOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSticker(item.id)}
                    style={glowChipStyle(sticker === item.id)}
                  >
                    <span style={{ animation: sticker === item.id ? 'glowEmoji 1.2s infinite' : 'none' }}>
                      {item.emoji}
                    </span>{' '}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>
                {language === 'RU' ? 'Вид рекламы' : 'Ad style'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {styleOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVisualStyle(item.id)}
                    style={glowChipStyle(visualStyle === item.id)}
                  >
                    <span style={{ animation: visualStyle === item.id ? 'glowEmoji 1.2s infinite' : 'none' }}>
                      {item.emoji}
                    </span>{' '}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setSheet('contacts')} style={primaryButtonStyle()}>
              {language === 'RU' ? 'Далее →' : 'Next →'}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'contacts' ? (
        <Sheet title={text.contacts} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {contactOptions.map((option) => (
              <ShellCard key={option.key} style={{ padding: 12 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <BrandIcon label={option.icon} color={option.brand} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 850, color: BRAND.gray }}>
                      {contacts[option.key].filter((item) => item.value.trim()).length > 0
                        ? '✓ Added'
                        : option.placeholder}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {contacts[option.key].map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: option.phoneLike ? '104px 1fr 34px' : '1fr 34px',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
                      {option.phoneLike ? (
                        <select
                          value={entry.countryCode}
                          onChange={(event) =>
                            updateContactEntry(option.key, entry.id, {
                              countryCode: event.target.value,
                            })
                          }
                          style={contactSelectStyle()}
                        >
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+380">🇺🇦 +380</option>
                          <option value="+420">🇨🇿 +420</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+39">🇮🇹 +39</option>
                        </select>
                      ) : null}

                      <input
                        value={entry.value}
                        onChange={(event) =>
                          updateContactEntry(option.key, entry.id, {
                            value: option.phoneLike
                              ? event.target.value.replace(/[^\d ]/g, '')
                              : event.target.value,
                          })
                        }
                        placeholder={option.placeholder}
                        style={contactInputStyle()}
                      />

                      <button
                        type="button"
                        onClick={() => removeContactEntry(option.key, entry.id)}
                        style={miniRemoveButtonStyle()}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addContactEntry(option.key, option.phoneLike)}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    height: 44,
                    borderRadius: 16,
                    border: `2px solid ${BRAND.black}`,
                    background: BRAND.softGreen,
                    color: BRAND.navy,
                    fontSize: 15,
                    fontWeight: 950,
                    cursor: 'pointer',
                  }}
                >
                  + {text.addNumber}
                </button>
              </ShellCard>
            ))}

            <button type="button" onClick={() => setSheet('address')} style={primaryButtonStyle()}>
              {language === 'RU' ? 'Далее →' : 'Next →'}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'address' ? (
        <Sheet title={text.address} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field
              label={language === 'RU' ? 'Город' : 'City'}
              value={address.city}
              onChange={(next) => setAddress((prev) => ({ ...prev, city: next }))}
              placeholder="London"
            />
            <Field
              label={language === 'RU' ? 'Район' : 'District'}
              value={address.district}
              onChange={(next) => setAddress((prev) => ({ ...prev, district: next }))}
              placeholder="Camden, Chelsea, Mayfair"
            />
            <Field
              label={language === 'RU' ? 'Улица' : 'Street'}
              value={address.street}
              onChange={(next) => setAddress((prev) => ({ ...prev, street: next }))}
              placeholder="Street"
            />
            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'payment' ? (
        <Sheet title={text.payment} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {paymentOptions.map((item) => {
              const active = item.id === paymentMethod;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id)}
                  style={{
                    minHeight: 64,
                    borderRadius: 18,
                    border: `2px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr 32px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <IconBox icon={item.icon} bg="#fff" />
                  <span style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>
                    {item.label}
                  </span>
                  <span>{active ? '✓' : ''}</span>
                </button>
              );
            })}

            <ShellCard style={{ padding: 14, background: BRAND.softYellow }}>
              <div style={{ fontSize: 14, fontWeight: 850, color: BRAND.gray }}>
                {text.total}
              </div>
              <div style={{ marginTop: 4, fontSize: 34, fontWeight: 950, color: BRAND.green }}>
                {adPrice === 0 ? text.free : `£${adPrice}`}
              </div>
            </ShellCard>

            <button
              type="button"
              onClick={() => {
                alert(language === 'RU' ? 'Оплата подключается следующим шагом.' : 'Payment will be connected next.');
              }}
              style={primaryButtonStyle()}
            >
              {language === 'RU' ? 'Оплатить и опубликовать' : 'Pay and publish'}
            </button>
          </div>
        </Sheet>
      ) : null}

      {editorMedia ? (
        <PhotoEditor
          item={editorMedia}
          text={text}
          onChange={(patch) => updateMediaItem(editorMedia.id, patch)}
          onClose={() => setEditorMediaId(null)}
          onReplace={() => replaceInputRef.current?.click()}
        />
      ) : null}

      <style jsx global>{`
        @keyframes pulseGift {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(255,36,79,0.0); }
          50% { transform: scale(1.015); box-shadow: 0 0 22px rgba(255,36,79,0.36); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,36,79,0.0); }
        }

        @keyframes glowEmoji {
          0% { filter: drop-shadow(0 0 0 rgba(36,200,90,0)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 10px rgba(36,200,90,0.75)); transform: scale(1.14); }
          100% { filter: drop-shadow(0 0 0 rgba(36,200,90,0)); transform: scale(1); }
        }
      `}</style>
    </>
  );
}

function MediaPreview({
  media,
  mode,
  onRemove,
  onOpenEditor,
  onDragStart,
  onDropItem,
}: {
  media: MediaItem[];
  mode: MediaMode;
  onRemove: (id: string) => void;
  onOpenEditor: (id: string) => void;
  onDragStart: (id: string) => void;
  onDropItem: (id: string) => void;
}) {
  if (mode === 'video') {
    return (
      <div style={{ height: 238, position: 'relative' }}>
        <video
          src={media[0]?.preview}
          muted
          loop
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {media[0] ? <CleanRemoveButton id={media[0].id} onRemove={onRemove} /> : null}
      </div>
    );
  }

  if (mode === 'collage') {
    const count = media.length;

    return (
      <div
        style={{
          height: 238,
          display: 'grid',
          gridTemplateColumns: count === 3 ? '1.2fr 0.8fr' : '1fr 1fr',
          gridTemplateRows: count === 2 ? '1fr' : '1fr 1fr',
          gap: 5,
          padding: 5,
          boxSizing: 'border-box',
        }}
      >
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            draggable
            onDragStart={(event) => {
              event.stopPropagation();
              onDragStart(item.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDropItem(item.id);
            }}
            onClick={(event) => {
              event.stopPropagation();
              onOpenEditor(item.id);
            }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 16,
              border: '1.5px solid #111111',
              gridRow: count === 3 && index === 0 ? '1 / span 2' : 'auto',
              background: '#fff',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src={item.preview}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `translate(${item.offsetX}px, ${item.offsetY}px) scale(${item.scale}) rotate(${item.rotate}deg)`,
              }}
            />
            <CleanRemoveButton id={item.id} onRemove={onRemove} compact />
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (media[0]) onOpenEditor(media[0].id);
      }}
      style={{
        height: 238,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <img
        src={media[0]?.preview}
        alt={media[0]?.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${media[0]?.offsetX || 0}px, ${media[0]?.offsetY || 0}px) scale(${media[0]?.scale || 1}) rotate(${media[0]?.rotate || 0}deg)`,
        }}
      />
      {media[0] ? <CleanRemoveButton id={media[0].id} onRemove={onRemove} /> : null}
    </button>
  );
}

function CleanRemoveButton({
  id,
  onRemove,
  compact,
}: {
  id: string;
  onRemove: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onRemove(id);
      }}
      style={{
        position: 'absolute',
        top: 7,
        right: 7,
        width: compact ? 27 : 34,
        height: compact ? 27 : 34,
        borderRadius: 999,
        border: '2px solid #111111',
        background: '#ffffff',
        color: '#ff244f',
        fontSize: compact ? 16 : 21,
        fontWeight: 950,
        display: 'grid',
        placeItems: 'center',
        zIndex: 5,
      }}
    >
      ×
    </button>
  );
}

function PhotoEditor({
  item,
  text,
  onChange,
  onClose,
  onReplace,
}: {
  item: MediaItem;
  text: typeof TEXT.EN;
  onChange: (patch: Partial<MediaItem>) => void;
  onClose: () => void;
  onReplace: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || !lastPointRef.current) return;

    const dx = event.clientX - lastPointRef.current.x;
    const dy = event.clientY - lastPointRef.current.y;

    onChange({
      offsetX: item.offsetX + dx,
      offsetY: item.offsetY + dy,
    });

    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const stopDrag = () => {
    setIsDragging(false);
    lastPointRef.current = null;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: 'rgba(5,10,20,0.96)',
        color: '#fff',
        display: 'grid',
        gridTemplateRows: '72px 1fr auto',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: '52px 1fr 52px',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <button type="button" onClick={onClose} style={darkRoundButtonStyle()}>
          ←
        </button>
        <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 950 }}>
          {text.media}
        </div>
        <button type="button" onClick={onClose} style={darkRoundButtonStyle()}>
          ×
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        style={{
          margin: '0 16px',
          borderRadius: 28,
          border: '2px solid rgba(255,255,255,0.6)',
          overflow: 'hidden',
          background: '#111',
          display: 'grid',
          placeItems: 'center',
          touchAction: 'none',
        }}
      >
        <img
          src={item.preview}
          alt={item.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `translate(${item.offsetX}px, ${item.offsetY}px) scale(${item.scale}) rotate(${item.rotate}deg)`,
          }}
        />
      </div>

      <div
        style={{
          padding: '16px 16px calc(18px + env(safe-area-inset-bottom))',
          display: 'grid',
          gap: 12,
        }}
      >
        <label style={{ display: 'grid', gap: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 900 }}>Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={item.scale}
            onChange={(event) => onChange({ scale: Number(event.target.value) })}
          />
        </label>

        <label style={{ display: 'grid', gap: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 900 }}>Rotate</span>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={item.rotate}
            onChange={(event) => onChange({ rotate: Number(event.target.value) })}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" onClick={onReplace} style={secondaryDarkButtonStyle()}>
            {text.replace}
          </button>
          <button type="button" onClick={onClose} style={greenDarkButtonStyle()}>
            {text.done}
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandIcon({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 15,
        border: `2px solid ${BRAND.black}`,
        background: color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: label.length > 2 ? 11 : 15,
        fontWeight: 950,
        letterSpacing: '-0.4px',
      }}
    >
      {label}
    </div>
  );
}

function AdPreviewCard({
  title,
  description,
  media,
  mediaMode,
  chosenSticker,
  chosenStyle,
  language,
  text,
}: {
  title: string;
  description: string;
  media: MediaItem[];
  mediaMode: MediaMode;
  chosenSticker: { label: string; emoji: string };
  chosenStyle: { label: string; emoji: string };
  language: AppLanguage;
  text: typeof TEXT.EN;
}) {
  return (
    <ShellCard style={{ padding: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 950, marginBottom: 10 }}>
        {text.preview}
      </div>

      <div
        style={{
          border: `2px solid ${BRAND.black}`,
          borderRadius: 22,
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <div
          style={{
            height: 158,
            background: BRAND.softGreen,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {media[0] ? (
            mediaMode === 'video' ? (
              <video
                src={media[0].preview}
                muted
                loop
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                src={media[0].preview}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )
          ) : (
            <div
              style={{
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 42,
              }}
            >
              🖼️
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              left: 10,
              top: 10,
              border: `2px solid ${BRAND.black}`,
              borderRadius: 999,
              background: BRAND.yellow,
              color: BRAND.navy,
              padding: '6px 10px',
              fontSize: 13,
              fontWeight: 950,
              animation: 'glowEmoji 1.5s infinite',
            }}
          >
            {chosenSticker.emoji} {chosenSticker.label}
          </div>

          <div
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              border: `2px solid ${BRAND.black}`,
              borderRadius: 999,
              background: '#fff',
              color: BRAND.navy,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 950,
            }}
          >
            {chosenStyle.emoji} {chosenStyle.label}
          </div>
        </div>

        <div style={{ padding: 13 }}>
          <div style={{ fontSize: 21, fontWeight: 950, color: BRAND.navy }}>
            {title || text.titleHint}
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: 850,
              color: BRAND.gray,
              lineHeight: 1.35,
            }}
          >
            {description || text.descriptionHint}
          </div>

          <div
            style={{
              marginTop: 11,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            <button type="button" style={previewButtonStyle('#fff', BRAND.navy)}>
              {text.profile}
            </button>
            <button type="button" style={previewButtonStyle(BRAND.green, '#fff')}>
              {text.book}
            </button>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

function roundButtonStyle(): CSSProperties {
  return {
    width: 54,
    height: 54,
    borderRadius: 999,
    border: '2px solid #111111',
    background: '#ffffff',
    color: '#061b49',
    fontSize: 28,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function primaryButtonStyle(): CSSProperties {
  return {
    width: '100%',
    height: 64,
    borderRadius: 22,
    border: '2px solid #111111',
    background: 'linear-gradient(180deg, #24c85a 0%, #17a84a 100%)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 5px 0 rgba(0,0,0,0.10)',
  };
}

function smallChoiceStyle(): CSSProperties {
  return {
    minHeight: 74,
    borderRadius: 18,
    border: '2px solid #111111',
    background: '#ffffff',
    color: '#061b49',
    fontSize: 14,
    fontWeight: 950,
    cursor: 'pointer',
    lineHeight: 1.35,
  };
}

function glowChipStyle(active: boolean): CSSProperties {
  return {
    minHeight: 58,
    borderRadius: 18,
    border: `2px solid ${active ? BRAND.green : BRAND.black}`,
    background: active ? BRAND.softGreen : '#fff',
    color: BRAND.navy,
    fontSize: 16,
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: active ? '0 0 16px rgba(36,200,90,0.25)' : 'none',
  };
}

function contactSelectStyle(): CSSProperties {
  return {
    height: 50,
    borderRadius: 16,
    border: `2px solid ${BRAND.black}`,
    background: '#fff',
    color: BRAND.navy,
    fontSize: 14,
    fontWeight: 950,
    padding: '0 7px',
  };
}

function contactInputStyle(): CSSProperties {
  return {
    height: 50,
    borderRadius: 16,
    border: `2px solid ${BRAND.black}`,
    padding: '0 12px',
    fontSize: 15,
    fontWeight: 850,
    color: BRAND.navy,
    outline: 'none',
    minWidth: 0,
  };
}

function miniRemoveButtonStyle(): CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: `2px solid ${BRAND.black}`,
    background: '#fff',
    color: BRAND.red,
    fontSize: 20,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function darkRoundButtonStyle(): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: '2px solid rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 24,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function secondaryDarkButtonStyle(): CSSProperties {
  return {
    height: 56,
    borderRadius: 18,
    border: '2px solid rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function greenDarkButtonStyle(): CSSProperties {
  return {
    height: 56,
    borderRadius: 18,
    border: '2px solid #111111',
    background: BRAND.green,
    color: '#fff',
    fontSize: 18,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function previewButtonStyle(bg: string, color: string): CSSProperties {
  return {
    height: 46,
    borderRadius: 16,
    border: '2px solid #111111',
    background: bg,
    color,
    fontSize: 15,
    fontWeight: 950,
    cursor: 'pointer',
  };
}
