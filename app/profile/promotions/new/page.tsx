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

type MediaMode = 'single' | 'collage' | 'video';
type SheetMode =
  | null
  | 'media'
  | 'title'
  | 'description'
  | 'category'
  | 'subcategory'
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
  green: '#22c55e',
  greenDark: '#16a34a',
  red: '#ff2456',
  blue: '#0b7cff',
  cream: '#fffdf8',
  soft: '#f7f8fb',
  softGreen: '#eaffef',
  gray: '#707988',
  dark: '#070b14',
};

const PRICE_PER_DAY = 2;
const FIRST_AD_FREE = true;

const TEXT = {
  EN: {
    pageTitle: 'Add advertisement',
    pageSubtitle: 'Create a bright premium ad that clients notice nearby',
    media: 'Photo / video',
    chooseMedia: 'Choose media',
    mediaHint: '1 photo, collage 2–4 photos or 1 short video',
    title: 'Title',
    titleHint: 'Short catchy ad title',
    description: 'Description',
    descriptionHint: 'Tell clients about the offer',
    category: 'Category',
    categoryHint: 'Choose category and subcategory',
    days: 'Advertising days',
    daysHint: 'Choose number of days',
    enhance: 'Improve advertisement',
    enhanceHint: 'Stickers and ad style',
    contacts: 'Contact details',
    contactsHint: 'Add contact methods',
    address: 'Address',
    addressHint: 'City, district, street',
    continue: 'Continue to payment',
    save: 'Save',
    done: 'Done',
    cancel: 'Cancel',
    replace: 'Replace',
    chooseCategory: 'Choose category',
    chooseSubcategory: 'Choose subcategory',
    firstDayFree: 'First day free',
    total: 'Total',
    free: 'Free',
    payment: 'Payment',
    profile: 'Profile',
    book: 'Book',
    addNumber: 'Add number',
    addUsername: 'Add username',
    alertMedia: 'Please add photo or video.',
    alertTitle: 'Please add title.',
    alertDescription: 'Please add description.',
    alertCategory: 'Please choose category and subcategory.',
    alertPhone: 'Please add phone number.',
    registerFirst: 'Please register before payment.',
  },
  RU: {
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте яркую премиальную рекламу, которую клиенты заметят рядом',
    media: 'Фото / видео',
    chooseMedia: 'Выбрать медиа',
    mediaHint: '1 фото, коллаж 2–4 фото или 1 короткое видео',
    title: 'Заголовок',
    titleHint: 'Короткий цепляющий заголовок',
    description: 'Описание',
    descriptionHint: 'Расскажите клиентам о предложении',
    category: 'Категория',
    categoryHint: 'Выберите категорию и подкатегорию',
    days: 'Дни рекламы',
    daysHint: 'Выберите количество дней',
    enhance: 'Улучшить рекламу',
    enhanceHint: 'Стикеры и вид рекламы',
    contacts: 'Контактные данные',
    contactsHint: 'Добавьте способы связи',
    address: 'Адрес',
    addressHint: 'Город, район, улица',
    continue: 'Перейти к оплате',
    save: 'Сохранить',
    done: 'Готово',
    cancel: 'Отмена',
    replace: 'Заменить',
    chooseCategory: 'Выберите категорию',
    chooseSubcategory: 'Выберите подкатегорию',
    firstDayFree: 'Первый день бесплатно',
    total: 'Итого',
    free: 'Бесплатно',
    payment: 'Оплата',
    profile: 'Профиль',
    book: 'Забронировать',
    addNumber: 'Добавить номер',
    addUsername: 'Добавить username',
    alertMedia: 'Добавьте фото или видео.',
    alertTitle: 'Добавьте заголовок.',
    alertDescription: 'Добавьте описание.',
    alertCategory: 'Выберите категорию и подкатегорию.',
    alertPhone: 'Добавьте номер телефона.',
    registerFirst: 'Перед оплатой нужно зарегистрироваться.',
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

function isUserRegistered() {
  if (typeof window === 'undefined') return false;

  const keys = [
    'mapbook_user_profile',
    'olamep_user_profile',
    'mapbook_auth_user',
    'olamep_auth_user',
  ];

  return keys.some((key) => {
    try {
      return Boolean(localStorage.getItem(key));
    } catch {
      return false;
    }
  });
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
        border: `1.8px solid ${BRAND.black}`,
        borderRadius: 22,
        background: '#ffffff',
        boxShadow: '0 8px 22px rgba(6,27,73,0.07)',
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
          width: 48,
          height: 48,
          borderRadius: 14,
          objectFit: 'contain',
          border: `1.5px solid ${BRAND.black}`,
          background: '#fff',
        }}
      />
      <span
        style={{
          fontSize: 30,
          fontWeight: 950,
          color: BRAND.navy,
          letterSpacing: '-1px',
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
  bg = BRAND.softGreen,
}: {
  icon?: string;
  image?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 14,
        border: `1.6px solid ${BRAND.black}`,
        background: bg,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {image ? (
        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: 25 }}>{icon || '📍'}</span>
      )}
    </div>
  );
}

function RowButton({
  icon,
  image,
  title,
  subtitle,
  right,
  onClick,
}: {
  icon?: string;
  image?: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 72,
        border: `1.8px solid ${BRAND.black}`,
        borderRadius: 18,
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto',
        gap: 10,
        alignItems: 'center',
        padding: '10px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 5px 15px rgba(6,27,73,0.05)',
      }}
    >
      <IconBox icon={icon} image={image} />

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 950, color: BRAND.navy, lineHeight: 1.1 }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: 800,
            color: BRAND.gray,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle}
        </div>
      </div>

      {right || <span style={{ fontSize: 30, fontWeight: 950, color: BRAND.black }}>›</span>}
    </button>
  );
}

function Sheet({
  title,
  dark,
  children,
  onClose,
}: {
  title: string;
  dark?: boolean;
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
          maxHeight: '88vh',
          overflowY: 'auto',
          background: dark ? BRAND.dark : '#fff',
          color: dark ? '#fff' : BRAND.navy,
          border: `2px solid ${dark ? '#ffffff' : BRAND.black}`,
          borderBottom: 'none',
          borderRadius: '28px 28px 0 0',
          padding: '16px 16px calc(18px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr 44px',
            gap: 8,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <button type="button" onClick={onClose} style={sheetRoundStyle(dark)}>
            ←
          </button>
          <div
            style={{
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 950,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <button type="button" onClick={onClose} style={sheetRoundStyle(dark)}>
            ×
          </button>
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
      <span style={{ fontSize: 15, fontWeight: 950, color: BRAND.navy }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={5}
          style={fieldStyle(true)}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={fieldStyle(false)}
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
  const [sticker, setSticker] = useState('top');
  const [visualStyle, setVisualStyle] = useState('premium');

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
    const unsubscribe = subscribeToLanguageChange((nextLanguage) => setLanguage(nextLanguage));
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
      ? `${days} дн.  £${adPrice}`
      : `${days} days  £${adPrice}`;

  const stickerOptions = [
    { id: 'today', label: language === 'RU' ? 'Сегодня' : 'Today', emoji: '⚡' },
    { id: 'top', label: 'TOP', emoji: '⭐' },
    { id: 'new', label: 'NEW', emoji: '✨' },
    { id: 'sale', label: language === 'RU' ? 'Скидка' : 'Sale', emoji: '🏷️' },
    { id: 'lux', label: 'LUX', emoji: '💎' },
    { id: 'hot', label: language === 'RU' ? 'Горячее' : 'Hot', emoji: '🔥' },
  ];

  const styleOptions = [
    { id: 'classic', label: 'Classic', image: 'linear-gradient(135deg,#f7d6e0,#dbeafe)' },
    { id: 'flyer', label: 'Flyer', image: 'linear-gradient(135deg,#fde68a,#bfdbfe)' },
    { id: 'premium', label: 'Premium', image: 'linear-gradient(135deg,#fbbf24,#111827)' },
    { id: 'glow', label: 'Glow', image: 'linear-gradient(135deg,#312e81,#ec4899)' },
  ];

  const chosenSticker = stickerOptions.find((item) => item.id === sticker) || stickerOptions[1];
  const chosenStyle = styleOptions.find((item) => item.id === visualStyle) || styleOptions[2];

  const contactOptions: {
    key: ContactKey;
    label: string;
    icon: string;
    color: string;
    placeholder: string;
    phoneLike?: boolean;
    addText: string;
  }[] = [
    {
      key: 'phone',
      label: language === 'RU' ? 'Телефон' : 'Phone',
      icon: '☎',
      color: '#111827',
      placeholder: '7000 000000',
      phoneLike: true,
      addText: text.addNumber,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: '☘',
      color: '#25D366',
      placeholder: '7000 000000',
      phoneLike: true,
      addText: text.addNumber,
    },
    {
      key: 'businessWhatsapp',
      label: 'Business WhatsApp',
      icon: 'B',
      color: '#128C7E',
      placeholder: '7000 000000',
      phoneLike: true,
      addText: text.addNumber,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: '✈',
      color: '#229ED9',
      placeholder: '@username',
      addText: text.addUsername,
    },
    {
      key: 'viber',
      label: 'Viber',
      icon: '☎',
      color: '#7360F2',
      placeholder: '7000 000000',
      phoneLike: true,
      addText: text.addNumber,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: '◎',
      color: '#E4405F',
      placeholder: '@username',
      addText: text.addUsername,
    },
    {
      key: 'email',
      label: 'Email',
      icon: '@',
      color: '#0b7cff',
      placeholder: 'you@email.com',
      addText: language === 'RU' ? 'Добавить email' : 'Add email',
    },
    {
      key: 'website',
      label: 'Website',
      icon: 'www',
      color: '#061b49',
      placeholder: 'yourwebsite.com',
      addText: language === 'RU' ? 'Добавить сайт' : 'Add website',
    },
  ];

  const paymentOptions = [
    { id: 'card', label: language === 'RU' ? 'Карта' : 'Card', icon: '💳' },
    { id: 'balance', label: language === 'RU' ? 'Баланс' : 'Balance', icon: '👛' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'apple', label: 'Apple Pay', icon: '' },
  ];

  const primaryPhone = contacts.phone[0]?.value || '';
  const contactCount = Object.values(contacts).flat().filter((item) => item.value.trim()).length;

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

    const limit = mode === 'collage' ? 4 : 1;
    const min = mode === 'collage' ? 2 : 1;

    const allowed = files
      .filter((file) => {
        if (mode === 'video') return file.type.startsWith('video/');
        return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      })
      .slice(0, limit);

    if (allowed.length < min) {
      alert(
        language === 'RU'
          ? 'Для коллажа выберите минимум 2 фото. HEIC/HEIF не поддерживается.'
          : 'For collage choose at least 2 photos. HEIC/HEIF is not supported.'
      );
      event.target.value = '';
      return;
    }

    media.forEach((item) => URL.revokeObjectURL(item.preview));

    setMedia(
      allowed.map((file) => ({
        id: uid(),
        name: file.name,
        preview: URL.createObjectURL(file),
        type: mode === 'video' ? 'video' : 'image',
        scale: 1,
        rotate: 0,
        offsetX: 0,
        offsetY: 0,
      }))
    );

    setMediaMode(mode);
    event.target.value = '';
  };

  const handleReplaceSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editorMediaId) return;

    const ok = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

    if (!ok) {
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

  const updateMediaItem = (id: string, patch: Partial<MediaItem>) => {
    setMedia((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeMediaItem = (id: string) => {
    setMedia((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const reorderMedia = (targetId: string) => {
    if (!dragMediaId || dragMediaId === targetId) return;

    setMedia((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === dragMediaId);
      const toIndex = prev.findIndex((item) => item.id === targetId);

      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);

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
      [key]: [...prev[key], { id: uid(), countryCode: phoneLike ? '+44' : '', value: '' }],
    }));
  };

  const removeContactEntry = (key: ContactKey, id: string) => {
    setContacts((prev) => ({
      ...prev,
      [key]: prev[key].length > 1 ? prev[key].filter((entry) => entry.id !== id) : prev[key],
    }));
  };

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

    if (!isUserRegistered()) {
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
          color: BRAND.navy,
          fontFamily: 'Arial, sans-serif',
          paddingBottom: 116,
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
              zIndex: 70,
              background: 'rgba(255,255,255,0.97)',
              padding: '18px 16px 12px',
              display: 'grid',
              gridTemplateColumns: '48px 1fr 48px',
              gap: 10,
              alignItems: 'start',
              borderBottom: '1px solid rgba(6,27,73,0.08)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <RoundButton onClick={() => router.back()}>←</RoundButton>

            <div style={{ textAlign: 'center' }}>
              <AppLogo />

              <div
                style={{
                  marginTop: 26,
                  fontSize: 31,
                  fontWeight: 950,
                  lineHeight: 1.02,
                  letterSpacing: '-1.3px',
                  color: BRAND.navy,
                }}
              >
                {text.pageTitle}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 13,
                  lineHeight: 1.28,
                  fontWeight: 850,
                  color: BRAND.gray,
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
                <div style={{ fontSize: 21, fontWeight: 950, color: BRAND.navy }}>
                  {text.media}
                </div>
                <button
                  type="button"
                  onClick={() => setSheet('media')}
                  style={{
                    border: `1.8px solid ${BRAND.black}`,
                    background: BRAND.softGreen,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 950,
                    color: BRAND.navy,
                    cursor: 'pointer',
                  }}
                >
                  {mediaMode === 'single'
                    ? '1 фото'
                    : mediaMode === 'collage'
                      ? `Коллаж ${media.length || 3}`
                      : 'Видео'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => (media.length ? undefined : setSheet('media'))}
                style={{
                  width: '100%',
                  minHeight: 252,
                  border: media.length ? 'none' : `1.8px dashed ${BRAND.green}`,
                  borderRadius: 20,
                  background: media.length ? '#fff' : BRAND.softGreen,
                  cursor: media.length ? 'default' : 'pointer',
                  overflow: 'hidden',
                  padding: media.length ? 0 : 16,
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
                      minHeight: 216,
                      display: 'grid',
                      placeItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 999,
                          border: `3px solid ${BRAND.green}`,
                          color: BRAND.green,
                          display: 'grid',
                          placeItems: 'center',
                          margin: '0 auto 12px',
                          fontSize: 48,
                          fontWeight: 800,
                        }}
                      >
                        +
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 950, color: BRAND.navy }}>
                        {text.chooseMedia}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 14,
                          fontWeight: 850,
                          color: BRAND.gray,
                        }}
                      >
                        {text.mediaHint}
                      </div>
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
              subtitle={
                currentCategory
                  ? `${currentCategory.label}${subcategory ? ` • ${subcategory}` : ''}`
                  : text.categoryHint
              }
              onClick={() => setSheet('category')}
            />

            <RowButton
              icon="📅"
              title={text.days}
              subtitle={text.daysHint}
              right={
                <div
                  style={{
                    textAlign: 'right',
                    color: BRAND.green,
                    fontSize: 14,
                    fontWeight: 950,
                    lineHeight: 1.2,
                  }}
                >
                  <div>{language === 'RU' ? `${days} дн.` : `${days} days`}</div>
                  <div>{adPrice === 0 ? text.free : `£${adPrice}`}</div>
                </div>
              }
              onClick={() => setSheet('days')}
            />

            <RowButton
              icon="⭐"
              title={text.enhance}
              subtitle={`${chosenSticker.label} • ${chosenStyle.label}`}
              right={
                <div
                  style={{
                    border: `1.6px solid ${BRAND.green}`,
                    borderRadius: 999,
                    padding: '6px 12px',
                    color: BRAND.green,
                    fontSize: 13,
                    fontWeight: 950,
                  }}
                >
                  {chosenSticker.label}
                </div>
              }
              onClick={() => setSheet('enhance')}
            />

            <RowButton
              icon="📞"
              title={text.contacts}
              subtitle={contactCount ? `${contactCount} способа` : text.contactsHint}
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

            <AdPreviewCard
              title={title}
              description={description}
              media={media}
              mode={mediaMode}
              sticker={chosenSticker}
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
          zIndex: 90,
          background: 'rgba(255,255,255,0.96)',
          borderTop: '1px solid rgba(6,27,73,0.08)',
          padding: '10px 16px calc(12px + env(safe-area-inset-bottom))',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button type="button" onClick={handleContinue} style={primaryButtonStyle()}>
            <span>{text.continue}</span>
            <span style={{ fontSize: 24 }}>›</span>
          </button>
        </div>
      </div>

      {sheet === 'media' ? (
        <Sheet title={text.chooseMedia} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { mode: 'single' as const, title: '1 фото', hint: 'JPG / PNG / WEBP' },
              { mode: 'collage' as const, title: 'Коллаж 2–4', hint: 'Несколько фото в одной рекламе' },
              { mode: 'video' as const, title: 'Мини-видео', hint: 'Короткое видео до 5 секунд' },
            ].map((item) => {
              const active = mediaMode === item.mode;

              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setMediaMode(item.mode)}
                  style={{
                    minHeight: 64,
                    borderRadius: 18,
                    border: `1.8px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '1fr 30px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>
                    <div style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>
                      {item.title}
                    </div>
                    <div style={{ marginTop: 3, fontSize: 13, fontWeight: 800, color: BRAND.gray }}>
                      {item.hint}
                    </div>
                  </span>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: active ? BRAND.green : '#fff',
                      color: '#fff',
                      border: `1.6px solid ${BRAND.black}`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 15,
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
                style={mediaPickButtonStyle()}
              >
                📷<br />Камера
              </button>
              <button
                type="button"
                onClick={() => handleMediaPick(mediaMode, 'gallery')}
                style={mediaPickButtonStyle()}
              >
                🖼️<br />Галерея
              </button>
              <button
                type="button"
                onClick={() =>
                  mediaMode === 'video'
                    ? handleMediaPick('video', 'video')
                    : handleMediaPick(mediaMode, 'files')
                }
                style={mediaPickButtonStyle()}
              >
                📁<br />Файлы
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
              <span>Далее</span>
              <span>›</span>
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
              <span>Далее</span>
              <span>›</span>
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
                    minHeight: 76,
                    borderRadius: 18,
                    border: `1.8px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '58px 1fr 24px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <IconBox icon={item.icon} image={item.image} bg="#fff" />

                  <span>
                    <div style={{ fontSize: 19, fontWeight: 950, color: BRAND.navy }}>
                      {item.label}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: BRAND.gray }}>
                      {item.subcategories.length} подкатегорий
                    </div>
                  </span>

                  <span style={{ fontSize: 28, fontWeight: 950 }}>{active ? '✓' : '›'}</span>
                </button>
              );
            })}
          </div>
        </Sheet>
      ) : null}

      {sheet === 'subcategory' ? (
        <Sheet title={text.chooseSubcategory} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 9 }}>
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
                    minHeight: 56,
                    borderRadius: 17,
                    border: `1.8px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    color: BRAND.navy,
                    display: 'grid',
                    gridTemplateColumns: '1fr 28px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 14px',
                    fontSize: 17,
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

      {sheet === 'days' ? (
        <Sheet title={text.days} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            {FIRST_AD_FREE ? (
              <div
                style={{
                  borderRadius: 20,
                  border: `1.8px solid ${BRAND.black}`,
                  background: BRAND.red,
                  color: '#fff',
                  padding: 14,
                  boxShadow: '0 0 20px rgba(255,36,86,0.25)',
                }}
              >
                <div style={{ fontSize: 21, fontWeight: 950 }}>🎁 {text.firstDayFree}</div>
                <div style={{ marginTop: 4, fontSize: 13, fontWeight: 850 }}>
                  Только для первой рекламы
                </div>
              </div>
            ) : null}

            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              style={{
                height: 68,
                borderRadius: 20,
                border: `1.8px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                padding: '0 16px',
                fontSize: 22,
                fontWeight: 950,
              }}
            >
              {Array.from({ length: 365 }, (_, index) => index + 1).map((day) => {
                const price = FIRST_AD_FREE ? Math.max(0, day - 1) * PRICE_PER_DAY : day * PRICE_PER_DAY;
                return (
                  <option key={day} value={day}>
                    {day} дн. — {price === 0 ? 'бесплатно' : `£${price}`}
                  </option>
                );
              })}
            </select>

            <ShellCard style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 850, color: BRAND.gray }}>{text.total}</div>
              <div style={{ marginTop: 4, fontSize: 32, fontWeight: 950, color: BRAND.green }}>
                {adPrice === 0 ? text.free : `£${adPrice}`}
              </div>
            </ShellCard>

            <button type="button" onClick={() => setSheet('enhance')} style={primaryButtonStyle()}>
              <span>Далее</span>
              <span>›</span>
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'enhance' ? (
        <Sheet title={text.enhance} dark onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>Вид рекламы</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {styleOptions.map((item) => {
                  const active = visualStyle === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVisualStyle(item.id)}
                      style={{
                        minHeight: 92,
                        borderRadius: 14,
                        border: `2px solid ${active ? BRAND.green : 'rgba(255,255,255,0.25)'}`,
                        background: '#101827',
                        color: '#fff',
                        overflow: 'hidden',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ height: 56, background: item.image }} />
                      <div style={{ padding: '7px 4px', fontSize: 11, fontWeight: 900 }}>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>Стикер</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
                {stickerOptions.map((item) => {
                  const active = sticker === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSticker(item.id)}
                      style={{
                        minHeight: 42,
                        borderRadius: 11,
                        border: `2px solid ${active ? BRAND.green : 'rgba(255,255,255,0.35)'}`,
                        background: active ? '#fff' : 'rgba(255,255,255,0.09)',
                        color: active ? BRAND.navy : '#fff',
                        fontSize: 12,
                        fontWeight: 950,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'block', filter: active ? 'drop-shadow(0 0 6px #22c55e)' : 'none' }}>
                        {item.emoji}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={() => setSheet('contacts')} style={primaryButtonStyle()}>
              <span>Далее</span>
              <span>›</span>
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'contacts' ? (
        <Sheet title={text.contacts} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {contactOptions.map((option) => (
              <div
                key={option.key}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: 12,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <BrandIcon label={option.icon} color={option.color} />
                  <div style={{ fontSize: 16, fontWeight: 950, color: BRAND.navy }}>
                    {option.label}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 7 }}>
                  {contacts[option.key].map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: option.phoneLike ? '112px 1fr 26px' : '1fr 26px',
                        gap: 7,
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

                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: entry.value.trim() ? BRAND.green : '#d1d5db',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 13,
                          fontWeight: 950,
                        }}
                      >
                        ✓
                      </span>

                      {contacts[option.key].length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeContactEntry(option.key, entry.id)}
                          style={{
                            gridColumn: option.phoneLike ? '2 / 4' : '1 / 3',
                            justifySelf: 'start',
                            border: 'none',
                            background: 'transparent',
                            color: BRAND.red,
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          удалить
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addContactEntry(option.key, option.phoneLike)}
                  style={{
                    marginTop: 8,
                    height: 34,
                    borderRadius: 10,
                    border: `1.5px solid ${BRAND.green}`,
                    background: '#fff',
                    color: BRAND.green,
                    fontSize: 13,
                    fontWeight: 950,
                    cursor: 'pointer',
                    padding: '0 12px',
                  }}
                >
                  + {option.addText}
                </button>
              </div>
            ))}

            <button type="button" onClick={() => setSheet('address')} style={primaryButtonStyle()}>
              <span>Далее</span>
              <span>›</span>
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'address' ? (
        <Sheet title={text.address} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field label="Город" value={address.city} onChange={(next) => setAddress((prev) => ({ ...prev, city: next }))} placeholder="London" />
            <Field label="Район" value={address.district} onChange={(next) => setAddress((prev) => ({ ...prev, district: next }))} placeholder="Camden, Chelsea, Mayfair" />
            <Field label="Улица" value={address.street} onChange={(next) => setAddress((prev) => ({ ...prev, street: next }))} placeholder="Street" />
            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              <span>{text.save}</span>
              <span>✓</span>
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'payment' ? (
        <Sheet title={text.payment} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {paymentOptions.map((item) => {
              const active = paymentMethod === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id)}
                  style={{
                    minHeight: 62,
                    borderRadius: 18,
                    border: `1.8px solid ${active ? BRAND.green : BRAND.black}`,
                    background: active ? BRAND.softGreen : '#fff',
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 26px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <IconBox icon={item.icon} bg="#fff" />
                  <span style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>{item.label}</span>
                  <span>{active ? '✓' : ''}</span>
                </button>
              );
            })}

            <ShellCard style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 850, color: BRAND.gray }}>{text.total}</div>
              <div style={{ marginTop: 4, fontSize: 34, fontWeight: 950, color: BRAND.green }}>
                {adPrice === 0 ? text.free : `£${adPrice}`}
              </div>
            </ShellCard>

            <button
              type="button"
              onClick={() => alert('Payment will be connected next.')}
              style={primaryButtonStyle()}
            >
              <span>Оплатить и опубликовать</span>
              <span>✓</span>
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
      <div style={{ height: 252, position: 'relative', overflow: 'hidden', borderRadius: 18 }}>
        <video src={media[0]?.preview} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {media[0] ? <CleanRemoveButton id={media[0].id} onRemove={onRemove} /> : null}
      </div>
    );
  }

  if (mode === 'collage') {
    const count = media.length;

    return (
      <div
        style={{
          height: 252,
          display: 'grid',
          gridTemplateColumns: count === 3 ? '1.32fr 0.8fr' : '1fr 1fr',
          gridTemplateRows: count === 2 ? '1fr' : '1fr 1fr',
          gap: 6,
          background: '#fff',
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
              borderRadius: 15,
              border: `1.5px solid ${BRAND.black}`,
              padding: 0,
              background: '#fff',
              cursor: 'pointer',
              gridRow: count === 3 && index === 0 ? '1 / span 2' : 'auto',
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
        width: '100%',
        height: 252,
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: 18,
        background: '#fff',
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
        width: compact ? 28 : 34,
        height: compact ? 28 : 34,
        borderRadius: 999,
        border: `1.7px solid ${BRAND.black}`,
        background: 'rgba(255,255,255,0.95)',
        color: BRAND.red,
        fontSize: compact ? 17 : 22,
        fontWeight: 950,
        display: 'grid',
        placeItems: 'center',
        zIndex: 6,
        cursor: 'pointer',
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
  text: typeof TEXT.RU;
  onChange: (patch: Partial<MediaItem>) => void;
  onClose: () => void;
  onReplace: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !lastPointRef.current) return;

    const dx = event.clientX - lastPointRef.current.x;
    const dy = event.clientY - lastPointRef.current.y;

    onChange({
      offsetX: item.offsetX + dx,
      offsetY: item.offsetY + dy,
    });

    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const stopDrag = () => {
    setDragging(false);
    lastPointRef.current = null;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: '#080b12',
        color: '#fff',
        display: 'grid',
        gridTemplateRows: '68px 1fr auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 44px',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
        }}
      >
        <button type="button" onClick={onClose} style={darkIconButtonStyle()}>
          ←
        </button>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 950 }}>
          Редактирование фото
        </div>
        <button type="button" onClick={onClose} style={darkIconButtonStyle()}>
          ⛶
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        style={{
          margin: '0 16px',
          borderRadius: 20,
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
          padding: '14px 16px calc(18px + env(safe-area-inset-bottom))',
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <button type="button" onClick={() => onChange({ rotate: item.rotate + 90 })} style={editorToolStyle()}>
            ↻<br />Повернуть
          </button>
          <button type="button" onClick={() => onChange({ scale: item.scale * -1 })} style={editorToolStyle()}>
            ⇋<br />Отразить
          </button>
          <button type="button" onClick={() => onChange({ scale: 1, rotate: 0, offsetX: 0, offsetY: 0 })} style={editorToolStyle()}>
            ☐<br />Сбросить
          </button>
          <button type="button" onClick={onReplace} style={editorToolStyle()}>
            🖼<br />Заменить
          </button>
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={Math.abs(item.scale)}
          onChange={(event) => onChange({ scale: Number(event.target.value) })}
        />

        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={item.rotate}
          onChange={(event) => onChange({ rotate: Number(event.target.value) })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" onClick={onClose} style={darkSecondaryButtonStyle()}>
            {text.cancel}
          </button>
          <button type="button" onClick={onClose} style={darkGreenButtonStyle()}>
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
        width: 34,
        height: 34,
        borderRadius: 999,
        background: color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: label.length > 2 ? 9 : 15,
        fontWeight: 950,
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
  mode,
  sticker,
  text,
}: {
  title: string;
  description: string;
  media: MediaItem[];
  mode: MediaMode;
  sticker: { label: string; emoji: string };
  text: typeof TEXT.RU;
}) {
  return (
    <ShellCard style={{ padding: 12, marginBottom: 12 }}>
      <div
        style={{
          border: `1.8px solid ${BRAND.black}`,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#fff',
          display: 'grid',
          gridTemplateColumns: '42% 1fr',
          minHeight: 154,
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', background: BRAND.softGreen }}>
          {media[0] ? (
            mode === 'video' ? (
              <video src={media[0].preview} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={media[0].preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 36 }}>🖼️</div>
          )}

          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              borderRadius: 999,
              background: BRAND.red,
              color: '#fff',
              padding: '6px 9px',
              fontSize: 12,
              fontWeight: 950,
            }}
          >
            {sticker.label}
          </div>
        </div>

        <div style={{ padding: 12, position: 'relative' }}>
          <div style={{ position: 'absolute', right: 12, top: 10, fontSize: 23 }}>♡</div>

          <div style={{ paddingRight: 28, fontSize: 19, fontWeight: 950, color: BRAND.navy, lineHeight: 1.15 }}>
            {title || 'Стрижка собак и уход'}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 850, color: BRAND.gray }}>
            ⭐ 4.9 (128) <span style={{ marginLeft: 12 }}>1.2 км 📍</span>
          </div>

          <div style={{ marginTop: 9, fontSize: 18, fontWeight: 950, color: BRAND.green }}>
            от £25
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            <button type="button" style={previewButtonStyle('#fff', BRAND.navy)}>
              {text.profile}
            </button>
            <button type="button" style={previewButtonStyle(BRAND.green, '#fff')}>
              {text.book}
            </button>
          </div>

          {description ? (
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: BRAND.gray, lineHeight: 1.3 }}>
              {description.slice(0, 70)}
            </div>
          ) : null}
        </div>
      </div>
    </ShellCard>
  );
}

function roundButtonStyle(): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: `1.8px solid ${BRAND.black}`,
    background: '#fff',
    color: BRAND.navy,
    fontSize: 27,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function sheetRoundStyle(dark?: boolean): CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: `1.8px solid ${dark ? 'rgba(255,255,255,0.7)' : BRAND.black}`,
    background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
    color: dark ? '#fff' : BRAND.navy,
    fontSize: 25,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function primaryButtonStyle(): CSSProperties {
  return {
    width: '100%',
    height: 60,
    borderRadius: 18,
    border: `1.8px solid ${BRAND.black}`,
    background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 950,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0 8px 18px rgba(34,197,94,0.25)',
  };
}

function fieldStyle(multiline: boolean): CSSProperties {
  return {
    width: '100%',
    height: multiline ? 140 : 54,
    borderRadius: 18,
    border: `1.8px solid ${BRAND.black}`,
    padding: multiline ? 14 : '0 14px',
    fontSize: 16,
    fontWeight: 850,
    color: BRAND.navy,
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  };
}

function mediaPickButtonStyle(): CSSProperties {
  return {
    minHeight: 72,
    borderRadius: 18,
    border: `1.8px solid ${BRAND.black}`,
    background: '#fff',
    color: BRAND.navy,
    fontSize: 14,
    fontWeight: 950,
    cursor: 'pointer',
    lineHeight: 1.35,
  };
}

function contactSelectStyle(): CSSProperties {
  return {
    height: 38,
    borderRadius: 9,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: BRAND.navy,
    fontSize: 13,
    fontWeight: 900,
    padding: '0 6px',
  };
}

function contactInputStyle(): CSSProperties {
  return {
    height: 38,
    borderRadius: 9,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: BRAND.navy,
    fontSize: 14,
    fontWeight: 850,
    padding: '0 10px',
    minWidth: 0,
    outline: 'none',
  };
}

function darkIconButtonStyle(): CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 26,
    fontWeight: 900,
    cursor: 'pointer',
  };
}

function editorToolStyle(): CSSProperties {
  return {
    minHeight: 54,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 12,
    fontWeight: 850,
    cursor: 'pointer',
    lineHeight: 1.3,
  };
}

function darkSecondaryButtonStyle(): CSSProperties {
  return {
    height: 54,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function darkGreenButtonStyle(): CSSProperties {
  return {
    height: 54,
    borderRadius: 18,
    border: 'none',
    background: BRAND.green,
    color: '#fff',
    fontSize: 16,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function previewButtonStyle(bg: string, color: string): CSSProperties {
  return {
    height: 38,
    borderRadius: 13,
    border: `1.6px solid ${BRAND.black}`,
    background: bg,
    color,
    fontSize: 13,
    fontWeight: 950,
    cursor: 'pointer',
  };
}
