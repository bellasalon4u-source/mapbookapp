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
  blue: '#087bff',
  red: '#ff255d',
  yellow: '#fff3b8',
  cream: '#fffdf8',
  softGreen: '#eaffef',
  softBlue: '#eef5ff',
  softPink: '#fff1f7',
  softYellow: '#fff8d9',
  gray: '#707988',
};

const FIRST_AD_FREE = true;
const PRICE_PER_DAY = 2;

const TEXT = {
  EN: {
    pageTitle: 'Add advertisement',
    pageSubtitle: 'Create a bright ad that clients notice nearby',
    media: 'Photo / video',
    mediaHint: '1 photo, 4-photo collage, or 1 short video',
    chooseMedia: 'Choose media',
    singlePhoto: '1 photo',
    collage: '4-photo collage',
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
    daysHint: '1 day free for first ad',
    enhance: 'Improve ad',
    enhanceHint: 'Sticker and visual style',
    contacts: 'Contact details',
    contactsHint: 'Phone number for clients',
    address: 'Address',
    addressHint: 'Where this ad should be shown',
    payment: 'Payment',
    paymentHint: 'Pay only before publishing',
    preview: 'Preview',
    continue: 'Continue to payment',
    save: 'Save',
    firstDayFree: 'First day free',
    total: 'Total',
    free: 'Free',
    publishOnlyAfterPayment: 'Advertisement is published only after payment.',
    alertMedia: 'Please add photo or video.',
    alertTitle: 'Please add title.',
    alertDescription: 'Please add description.',
    alertCategory: 'Please choose category and subcategory.',
    alertPhone: 'Please add phone number.',
    registerFirst: 'Please register before payment.',
  },
  RU: {
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте яркую рекламу, которую клиенты заметят рядом',
    media: 'Фото / видео',
    mediaHint: '1 фото, коллаж из 4 фото или 1 короткое видео',
    chooseMedia: 'Выбрать медиа',
    singlePhoto: '1 фото',
    collage: 'Коллаж 4 фото',
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
    daysHint: 'Первый день бесплатно для первой рекламы',
    enhance: 'Улучшить рекламу',
    enhanceHint: 'Наклейка и визуальный стиль',
    contacts: 'Контактные данные',
    contactsHint: 'Телефон для клиентов',
    address: 'Адрес',
    addressHint: 'Где показывать рекламу',
    payment: 'Оплата',
    paymentHint: 'Оплата только перед публикацией',
    preview: 'Предпросмотр',
    continue: 'Перейти к оплате',
    save: 'Сохранить',
    firstDayFree: 'Первый день бесплатно',
    total: 'Итого',
    free: 'Бесплатно',
    publishOnlyAfterPayment: 'Реклама публикуется только после оплаты.',
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
        borderRadius: 22,
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
        minHeight: 76,
        border: `2px solid ${BRAND.black}`,
        borderRadius: 19,
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

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const text = getText(language);

  const [sheet, setSheet] = useState<SheetMode>(null);

  const [mediaMode, setMediaMode] = useState<MediaMode>('single');
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const [days, setDays] = useState(1);
  const [sticker, setSticker] = useState('today');
  const [visualStyle, setVisualStyle] = useState('classic');

  const [phone, setPhone] = useState('');
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

  const adPrice = FIRST_AD_FREE ? Math.max(0, days - 1) * PRICE_PER_DAY : days * PRICE_PER_DAY;

  const daysSummary =
    language === 'RU'
      ? `${days} дн. • ${adPrice === 0 ? text.free : `£${adPrice}`}`
      : `${days} days • ${adPrice === 0 ? text.free : `£${adPrice}`}`;

  const mediaSummary =
    mediaMode === 'single'
      ? text.singlePhoto
      : mediaMode === 'collage'
        ? text.collage
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

    const allowed = files
      .filter((file) => {
        if (mode === 'video') return file.type.startsWith('video/');
        return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      })
      .slice(0, limit);

    if (!allowed.length) {
      alert(
        language === 'RU'
          ? 'Для рекламы используйте JPG, PNG, WEBP или короткое видео. HEIC/HEIF часто не отображается в браузере.'
          : 'Please use JPG, PNG, WEBP or short video. HEIC/HEIF may not display in browser.'
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
    }));

    setMediaMode(mode);
    setMedia(next);
    event.target.value = '';
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

    if (!phone.trim()) {
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

          <section
            style={{
              padding: '14px 12px 0',
              display: 'grid',
              gap: 10,
            }}
          >
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
                  minHeight: 194,
                  borderRadius: 20,
                  border: `2px dashed ${BRAND.green}`,
                  background: media.length ? '#ffffff' : BRAND.softGreen,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 0,
                }}
              >
                {media.length ? (
                  mediaMode === 'collage' ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        gap: 4,
                        height: 194,
                        padding: 4,
                        boxSizing: 'border-box',
                      }}
                    >
                      {media.map((item) => (
                        <img
                          key={item.id}
                          src={item.preview}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 14,
                          }}
                        />
                      ))}
                    </div>
                  ) : mediaMode === 'video' ? (
                    <video
                      src={media[0].preview}
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: 194, objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={media[0].preview}
                      alt={media[0].name}
                      style={{ width: '100%', height: 194, objectFit: 'cover' }}
                    />
                  )
                ) : (
                  <div
                    style={{
                      minHeight: 194,
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

                {media.length ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: `2px solid ${BRAND.black}`,
                      background: BRAND.green,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 950,
                    }}
                  >
                    ✓
                  </span>
                ) : null}
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
              subtitle={phone || text.contactsHint}
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

            <ShellCard style={{ padding: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 950, marginBottom: 10 }}>
                {text.preview}
              </div>

              <div
                style={{
                  border: `2px solid ${BRAND.black}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    height: 134,
                    background: BRAND.softGreen,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {media[0] ? (
                    media[0].type === 'video' ? (
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
                    }}
                  >
                    {chosenSticker.emoji} {chosenSticker.label}
                  </div>
                </div>

                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 950, color: BRAND.navy }}>
                    {title || text.titleHint}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      fontWeight: 850,
                      color: BRAND.gray,
                      lineHeight: 1.3,
                    }}
                  >
                    {description || text.descriptionHint}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                    }}
                  >
                    <button type="button" style={previewButtonStyle(BRAND.blue)}>
                      {language === 'RU' ? 'Профиль' : 'Profile'}
                    </button>
                    <button type="button" style={previewButtonStyle(BRAND.green)}>
                      {language === 'RU' ? 'Забронировать' : 'Book'}
                    </button>
                  </div>
                </div>
              </div>
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
          borderTop: '1px solid #e8ebf0',
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

      {sheet === 'media' ? (
        <Sheet title={text.chooseMedia} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { mode: 'single' as const, title: text.singlePhoto, hint: 'JPG / PNG / WEBP' },
              { mode: 'collage' as const, title: text.collage, hint: '4 images in one collage' },
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
              placeholder={text.descriptionHint}
              multiline
            />
            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
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
                    setSheet(null);
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
            <ShellCard style={{ padding: 14, background: BRAND.softGreen }}>
              <div style={{ fontSize: 18, fontWeight: 950, color: BRAND.navy }}>
                {text.firstDayFree}
              </div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 850, color: BRAND.gray }}>
                £{PRICE_PER_DAY} / day
              </div>
            </ShellCard>

            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              style={{
                width: '100%',
                height: 64,
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

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
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
                    style={chipStyle(sticker === item.id)}
                  >
                    {item.emoji} {item.label}
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
                    style={chipStyle(visualStyle === item.id)}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setSheet(null)} style={primaryButtonStyle()}>
              {text.save}
            </button>
          </div>
        </Sheet>
      ) : null}

      {sheet === 'contacts' ? (
        <Sheet title={text.contacts} onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field
              label={language === 'RU' ? 'Телефон' : 'Phone'}
              value={phone}
              onChange={setPhone}
              placeholder="+44 7000 000000"
            />
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
    </>
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
    height: 58,
    borderRadius: 20,
    border: '2px solid #111111',
    background: '#24c85a',
    color: '#fff',
    fontSize: 18,
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

function chipStyle(active: boolean): CSSProperties {
  return {
    minHeight: 54,
    borderRadius: 18,
    border: `2px solid ${active ? BRAND.green : BRAND.black}`,
    background: active ? BRAND.softGreen : '#fff',
    color: BRAND.navy,
    fontSize: 16,
    fontWeight: 950,
    cursor: 'pointer',
  };
}

function previewButtonStyle(bg: string): CSSProperties {
  return {
    height: 44,
    borderRadius: 16,
    border: '2px solid #111111',
    background: bg,
    color: '#fff',
    fontSize: 15,
    fontWeight: 950,
    cursor: 'pointer',
  };
}
