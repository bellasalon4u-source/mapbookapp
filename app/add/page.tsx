'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

const BRAND = {
  navy: '#071b46',
  black: '#111111',
  green: '#24c45a',
  blue: '#1677ff',
  red: '#ff2456',
  muted: '#5f6877',
  softBlue: '#eef5ff',
  softGreen: '#eaffef',
  softPink: '#fff0f7',
  softYellow: '#fff8d9',
};

type PaymentMethodId = 'card' | 'cash' | 'apple-pay' | 'google-pay' | 'paypal' | 'bank';
type ServiceFormatId = 'all' | 'my-place' | 'client-place' | 'online';
type PriceMode = 'fixed' | 'range';

type Sheet =
  | null
  | 'media'
  | 'title'
  | 'description'
  | 'category'
  | 'subcategory'
  | 'hours'
  | 'contacts'
  | 'address'
  | 'payments'
  | 'price';

type MediaItem = {
  id: string;
  preview: string;
  kind: 'photo' | 'video';
  scale: number;
  rotate: number;
};

type ContactChannelId =
  | 'phone'
  | 'whatsapp'
  | 'telegram'
  | 'viber'
  | 'instagram'
  | 'email'
  | 'website';

type ContactEntry = {
  id: string;
  code: string;
  value: string;
};

const categories = [
  {
    id: 'beauty',
    icon: '🪞',
    label: 'Beauty',
    subcategories: ['Hair & Styling', 'Nails', 'Brows', 'Lashes', 'Makeup', 'Hair extensions'],
  },
  {
    id: 'barber',
    icon: '💈',
    label: 'Barber',
    subcategories: ['Haircut', 'Beard', 'Shaving', 'Kids haircut'],
  },
  {
    id: 'wellness',
    icon: '🪷',
    label: 'Wellness',
    subcategories: ['Massage', 'SPA', 'Yoga', 'Pilates', 'Facial massage'],
  },
  {
    id: 'food',
    icon: '🍽️',
    label: 'Food & Restaurants',
    subcategories: ['Chef at home', 'Catering', 'Restaurant booking', 'Cake'],
  },
  {
    id: 'home',
    icon: '🏡',
    label: 'Home',
    subcategories: ['Cleaning', 'Deep cleaning', 'Cooking', 'Furniture assembly'],
  },
  {
    id: 'repairs',
    icon: '🛠️',
    label: 'Repairs',
    subcategories: ['Phone repair', 'Laptop repair', 'Appliance repair', 'Furniture repair'],
  },
  {
    id: 'tech',
    icon: '💻',
    label: 'Tech',
    subcategories: ['Phone setup', 'Laptop setup', 'Website help', 'Smart home'],
  },
  {
    id: 'fashion',
    icon: '👜',
    label: 'Fashion & Tailoring',
    subcategories: ['Stylist', 'Tailoring', 'Dress rental', 'Personal shopping'],
  },
  {
    id: 'pets',
    icon: '🐾',
    label: 'Pets',
    subcategories: ['Dog grooming', 'Pet sitting', 'Dog walking', 'Training'],
  },
  {
    id: 'auto',
    icon: '🚗',
    label: 'Auto',
    subcategories: ['Car wash', 'Diagnostics', 'Tyres', 'Mobile mechanic'],
  },
  {
    id: 'moving',
    icon: '📦',
    label: 'Moving & Delivery',
    subcategories: ['Moving help', 'Courier', 'Furniture delivery', 'Man with van'],
  },
  {
    id: 'fitness',
    icon: '🏋️',
    label: 'Fitness',
    subcategories: ['Personal trainer', 'Pilates', 'Yoga', 'Nutrition'],
  },
];

const paymentMethods: { id: PaymentMethodId; icon: string; title: string }[] = [
  { id: 'card', icon: '💳', title: 'Card' },
  { id: 'cash', icon: '💵', title: 'Cash' },
  { id: 'apple-pay', icon: '', title: 'Apple Pay' },
  { id: 'google-pay', icon: 'G', title: 'Google Pay' },
  { id: 'paypal', icon: '🅿️', title: 'PayPal' },
  { id: 'bank', icon: '🏦', title: 'Bank transfer' },
];

const serviceFormats: { id: ServiceFormatId; icon: string; title: string }[] = [
  { id: 'all', icon: '✨', title: 'All' },
  { id: 'my-place', icon: '🏠', title: 'At my place' },
  { id: 'client-place', icon: '👤', title: 'At client' },
  { id: 'online', icon: '🌐', title: 'Online' },
];

const contactChannels: { id: ContactChannelId; icon: string; title: string; placeholder: string }[] = [
  { id: 'phone', icon: '☎️', title: 'Phone', placeholder: 'Phone number' },
  { id: 'whatsapp', icon: '🟢', title: 'WhatsApp', placeholder: 'WhatsApp number' },
  { id: 'telegram', icon: '✈️', title: 'Telegram', placeholder: 'Telegram username or number' },
  { id: 'viber', icon: '🟣', title: 'Viber', placeholder: 'Viber number' },
  { id: 'instagram', icon: '📸', title: 'Instagram', placeholder: '@username' },
  { id: 'email', icon: '✉️', title: 'Email', placeholder: 'email@example.com' },
  { id: 'website', icon: '🌐', title: 'Website', placeholder: 'https://website.com' },
];

const sheetOrder: Sheet[] = [
  'media',
  'price',
  'title',
  'description',
  'category',
  'hours',
  'contacts',
  'address',
  'payments',
];

function BrandLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          border: `2px solid ${BRAND.black}`,
          background:
            'radial-gradient(circle at 50% 38%, #ffffff 0 17%, transparent 18%), conic-gradient(from 35deg, #ff2456, #ff8a00, #ffe44d, #24c45a, #18b6ff, #7b2cff, #ff2456)',
          boxShadow: '0 4px 0 rgba(0,0,0,0.04)',
        }}
      />
      <span style={{ fontSize: 25, fontWeight: 900, color: BRAND.navy, letterSpacing: '-1px' }}>
        Olamep
      </span>
    </div>
  );
}

function CategoryIcon({ icon }: { icon: string }) {
  return (
    <span
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        border: `2px solid ${BRAND.black}`,
        background: '#ffffff',
        display: 'grid',
        placeItems: 'center',
        fontSize: 30,
        boxShadow: '0 4px 0 rgba(0,0,0,0.04)',
      }}
    >
      {icon}
    </span>
  );
}

function Row({
  icon,
  title,
  value,
  bg,
  done,
  attention,
  onClick,
}: {
  icon: string;
  title: string;
  value?: string;
  bg: string;
  done?: boolean;
  attention?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 68,
        borderRadius: 20,
        border: `2px solid ${attention ? BRAND.red : BRAND.black}`,
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: '54px 1fr auto',
        gap: 14,
        alignItems: 'center',
        padding: '9px 14px 9px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
    >
      <span
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
        }}
      >
        {icon}
      </span>

      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.navy }}>{title}</div>
        {value ? (
          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              fontWeight: 900,
              color: attention ? BRAND.red : BRAND.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </div>
        ) : null}
      </span>

      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          border: `2px solid ${BRAND.black}`,
          background: done ? BRAND.green : '#fff',
          color: done ? '#fff' : BRAND.navy,
          display: 'grid',
          placeItems: 'center',
          fontSize: done ? 18 : 24,
          fontWeight: 900,
        }}
      >
        {done ? '✓' : '›'}
      </span>
    </button>
  );
}

function SheetBox({
  title,
  subtitle,
  onClose,
  onBack,
  onHome,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  onHome: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,17,17,0.36)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: 'calc(100vh - 28px)',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 28,
          border: `2px solid ${BRAND.black}`,
          padding: '14px 14px calc(16px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          boxShadow: '0 18px 38px rgba(0,0,0,0.22)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '46px 1fr 46px 46px',
            gap: 8,
            alignItems: 'start',
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            onClick={onBack || onClose}
            style={{
              width: 46,
              height: 46,
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            ←
          </button>

          <div>
            <div style={{ fontSize: 25, fontWeight: 900, color: BRAND.navy, lineHeight: 1 }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, color: BRAND.muted, lineHeight: 1.3 }}>
                {subtitle}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onHome}
            style={{
              width: 46,
              height: 46,
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              color: BRAND.navy,
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            🏠
          </button>

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

function GreenDoneButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        height: 58,
        borderRadius: 20,
        border: `2px solid ${BRAND.black}`,
        background: BRAND.green,
        color: '#fff',
        fontSize: 20,
        fontWeight: 900,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}

export default function AddServicePage() {
  const router = useRouter();
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

  const [priceMode, setPriceMode] = useState<PriceMode>('range');
  const [priceFixed, setPriceFixed] = useState('45');
  const [priceFrom, setPriceFrom] = useState('40');
  const [priceTo, setPriceTo] = useState('60');

  const [selectedPayments, setSelectedPayments] = useState<PaymentMethodId[]>([
    'card',
    'cash',
    'apple-pay',
  ]);

  const [serviceFormat, setServiceFormat] = useState<ServiceFormatId>('client-place');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('beauty');
  const [subcategory, setSubcategory] = useState('Hair & Styling');
  const [hoursFrom, setHoursFrom] = useState('09:00');
  const [hoursTo, setHoursTo] = useState('20:00');

  const [contacts, setContacts] = useState<Record<ContactChannelId, ContactEntry[]>>({
    phone: [{ id: 'phone-1', code: '+44', value: '' }],
    whatsapp: [{ id: 'whatsapp-1', code: '+44', value: '' }],
    telegram: [{ id: 'telegram-1', code: '+44', value: '' }],
    viber: [{ id: 'viber-1', code: '+44', value: '' }],
    instagram: [{ id: 'instagram-1', code: '', value: '' }],
    email: [{ id: 'email-1', code: '', value: '' }],
    website: [{ id: 'website-1', code: '', value: '' }],
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
  }, [media]);

  const currentCategory = useMemo(
    () => categories.find((item) => item.id === categoryId) || categories[0],
    [categoryId]
  );

  const contactsCount = useMemo(() => {
    return Object.values(contacts).flat().filter((entry) => entry.value.trim()).length;
  }, [contacts]);

  const completedSteps = useMemo(() => {
    return [
      media.length > 0,
      title.trim().length > 0,
      description.trim().length > 0,
      Boolean(categoryId && subcategory),
      Boolean(priceFixed || priceFrom),
    ].filter(Boolean).length;
  }, [media.length, title, description, categoryId, subcategory, priceFixed, priceFrom]);

  const progressPercent = Math.round((completedSteps / 5) * 100);

  const priceLabel =
    priceMode === 'fixed'
      ? `£${priceFixed || '0'}`
      : `From £${priceFrom || '0'} to £${priceTo || '0'}`;

  const editingMedia = editingMediaId ? media.find((item) => item.id === editingMediaId) : null;

  const goHome = () => router.push('/');

  const closeToStart = () => {
    setSheet(null);
    setEditingMediaId(null);
  };

  const goPreviousSheet = () => {
    if (sheet === 'subcategory') {
      setSheet('category');
      return;
    }

    if (!sheet) {
      router.back();
      return;
    }

    const currentIndex = sheetOrder.indexOf(sheet);
    if (currentIndex > 0) {
      setSheet(sheetOrder[currentIndex - 1]);
      return;
    }

    setSheet(null);
  };

  const goNextSheet = () => {
    if (sheet === 'category') {
      setSheet('subcategory');
      return;
    }

    if (sheet === 'subcategory') {
      setSheet('hours');
      return;
    }

    if (!sheet) return;

    const currentIndex = sheetOrder.indexOf(sheet);
    const next = currentIndex >= 0 ? sheetOrder[currentIndex + 1] : null;

    if (next) {
      setSheet(next);
      return;
    }

    setSheet(null);
  };

  const handleBack = () => {
    if (editingMediaId) {
      setEditingMediaId(null);
      return;
    }

    if (sheet) {
      goPreviousSheet();
      return;
    }

    router.back();
  };

  const handlePublish = () => {
    if (media.length === 0) {
      setSheet('media');
      return;
    }

    if (!title.trim()) {
      setSheet('title');
      return;
    }

    if (!description.trim()) {
      setSheet('description');
      return;
    }

    if (!categoryId || !subcategory) {
      setSheet('category');
      return;
    }

    if (!priceFixed && !priceFrom) {
      setSheet('price');
      return;
    }

    alert('Your service is now live');
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const selected = files.slice(0, 50 - media.length);

    const next = selected
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file, index) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        preview: URL.createObjectURL(file),
        kind: file.type.startsWith('video/') ? ('video' as const) : ('photo' as const),
        scale: 1,
        rotate: 0,
      }));

    setMedia((prev) => [...prev, ...next]);
    event.target.value = '';
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((item) => item.id !== id);
    });

    if (editingMediaId === id) setEditingMediaId(null);
  };

  const updateMediaTransform = (id: string, patch: Partial<Pick<MediaItem, 'scale' | 'rotate'>>) => {
    setMedia((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const togglePayment = (id: PaymentMethodId) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addContactEntry = (channel: ContactChannelId) => {
    setContacts((prev) => ({
      ...prev,
      [channel]: [
        ...prev[channel],
        {
          id: `${channel}-${Date.now()}`,
          code: ['instagram', 'email', 'website'].includes(channel) ? '' : '+44',
          value: '',
        },
      ],
    }));
  };

  const updateContactEntry = (
    channel: ContactChannelId,
    id: string,
    patch: Partial<ContactEntry>
  ) => {
    setContacts((prev) => ({
      ...prev,
      [channel]: prev[channel].map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  };

  const removeContactEntry = (channel: ContactChannelId, id: string) => {
    setContacts((prev) => ({
      ...prev,
      [channel]: prev[channel].length <= 1 ? prev[channel] : prev[channel].filter((entry) => entry.id !== id),
    }));
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          paddingBottom: 108,
        }}
      >
        <header
          style={{
            padding: '6px 14px 8px',
            borderBottom: '1px solid #e2e7f0',
            background: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ maxWidth: 430, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              ←
            </button>

            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                display: 'flex',
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={goHome}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.black}`,
                  background: '#fff',
                  color: BRAND.navy,
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                🏠
              </button>

              <button
                type="button"
                onClick={closeToStart}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.black}`,
                  background: '#fff',
                  color: BRAND.navy,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ×
              </button>
            </div>

            <BrandLogo />

            <h1
              style={{
                margin: '4px 0 0',
                fontSize: 30,
                lineHeight: 0.98,
                fontWeight: 900,
                color: BRAND.navy,
                letterSpacing: '-1.2px',
              }}
            >
              Add your service
            </h1>

            <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.2, fontWeight: 900, color: BRAND.muted }}>
              Create a strong listing for clients nearby
            </div>

            <div
              style={{
                margin: '8px auto 0',
                maxWidth: 310,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 9,
                  borderRadius: 999,
                  border: `1.5px solid ${BRAND.black}`,
                  background: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: BRAND.green,
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                {completedSteps}/5
              </div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 430, margin: '0 auto', padding: '14px 18px 18px', display: 'grid', gap: 12 }}>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelected}
            style={{ display: 'none' }}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={handleMediaSelected}
            style={{ display: 'none' }}
          />

          <input
            ref={filesInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelected}
            style={{ display: 'none' }}
          />

          <Row
            icon="＋"
            bg="#ffffff"
            title="Photos"
            value={media.length > 0 ? `${media.length}/50 selected` : 'Add photos or videos'}
            done={media.length > 0}
            attention={media.length === 0}
            onClick={() => setSheet('media')}
          />

          <Row
            icon="£"
            bg="#ffffff"
            title="Price"
            value={priceLabel}
            done={Boolean(priceFixed || priceFrom)}
            onClick={() => setSheet('price')}
          />

          <Row
            icon="📝"
            bg={BRAND.softYellow}
            title="Title"
            value={title || 'Add a short and clear title'}
            done={title.trim().length > 0}
            onClick={() => setSheet('title')}
          />

          <Row
            icon="T"
            bg={BRAND.softBlue}
            title="Description"
            value={description || 'Describe your service in detail'}
            done={description.trim().length > 0}
            onClick={() => setSheet('description')}
          />

          <Row
            icon="🏷️"
            bg={BRAND.softPink}
            title="Category"
            value={`${currentCategory.label} • ${subcategory}`}
            done={Boolean(categoryId && subcategory)}
            onClick={() => setSheet('category')}
          />

          <Row
            icon="🕘"
            bg={BRAND.softGreen}
            title="Working hours"
            value={`${hoursFrom} — ${hoursTo}`}
            done={Boolean(hoursFrom && hoursTo)}
            onClick={() => setSheet('hours')}
          />

          <div
            style={{
              borderRadius: 20,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              padding: 12,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 14 }}>
              <span
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
              </span>

              <span>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Service format</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {serviceFormats.map((item) => {
                    const active = serviceFormat === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setServiceFormat(item.id)}
                        style={{
                          minHeight: 48,
                          borderRadius: 16,
                          border: `2px solid ${BRAND.black}`,
                          background: active ? BRAND.green : '#fff',
                          color: active ? '#fff' : BRAND.navy,
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {item.icon} {item.title}
                      </button>
                    );
                  })}
                </div>
              </span>
            </div>
          </div>

          <Row
            icon="📞"
            bg={BRAND.softGreen}
            title="Contact details"
            value={contactsCount > 0 ? `${contactsCount} contacts added` : 'Add phone, WhatsApp, Telegram and more'}
            done={contactsCount > 0}
            onClick={() => setSheet('contacts')}
          />

          <Row
            icon="📍"
            bg="#ffe6e6"
            title="Address"
            value="Add city, area and service location"
            done={false}
            onClick={() => setSheet('address')}
          />

          <div
            style={{
              borderRadius: 20,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              padding: 14,
              fontSize: 15,
              lineHeight: 1.25,
              fontWeight: 900,
            }}
          >
            <span style={{ color: BRAND.green }}>✓ Free publication.</span>{' '}
            <span style={{ color: BRAND.navy }}>£1 is charged only when you confirm a booking.</span>
          </div>

          <div
            style={{
              borderRadius: 28,
              border: `2px solid ${BRAND.black}`,
              background: '#fff',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                position: 'relative',
                height: 200,
                background: '#f3f4f6',
                overflow: 'hidden',
              }}
            >
              <img
                src={
                  media[0]?.preview ||
                  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 12,
                  background: '#ffe44d',
                  border: `2px solid ${BRAND.black}`,
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                PREVIEW
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.black}`,
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ♡
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '48px 14px 14px',
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 100%)',
                }}
              >
                <div style={{ color: '#fff', fontSize: 23, fontWeight: 900, lineHeight: 1.05 }}>
                  {title || 'Your service title'}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  <span>★ 4.9</span>
                  <span>📍 1.2 km</span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color: BRAND.blue }}>
                {priceMode === 'fixed' ? `£${priceFixed}` : `from £${priceFrom}`}
              </div>

              <button
                type="button"
                style={{
                  height: 52,
                  padding: '0 22px',
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: BRAND.blue,
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                View
              </button>
            </div>
          </div>
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
            padding: '10px 18px calc(10px + env(safe-area-inset-bottom))',
            boxShadow: '0 -10px 26px rgba(7,27,70,0.08)',
          }}
        >
          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            <button
              type="button"
              onClick={handlePublish}
              style={{
                width: '100%',
                height: 62,
                borderRadius: 22,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.blue,
                color: '#fff',
                fontSize: 23,
                fontWeight: 900,
                boxShadow: '0 8px 22px rgba(22,119,255,0.22)',
              }}
            >
              Publish service ›
            </button>
          </div>
        </div>
      </main>

      {sheet === 'media' ? (
        <SheetBox
          title="Photos"
          subtitle="Add up to 50 photos or videos. Tap a photo to edit."
          onClose={closeToStart}
          onBack={goPreviousSheet}
          onHome={goHome}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                width: '100%',
                minHeight: 64,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                textAlign: 'left',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 26 }}>📷</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>Camera</span>
              <span style={{ fontSize: 26, fontWeight: 900 }}>＋</span>
            </button>

            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              style={{
                width: '100%',
                minHeight: 64,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                textAlign: 'left',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 26 }}>🖼️</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>Photo & video library</span>
              <span style={{ fontSize: 26, fontWeight: 900 }}>＋</span>
            </button>

            <button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              style={{
                width: '100%',
                minHeight: 64,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                textAlign: 'left',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 26 }}>📁</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>Choose files</span>
              <span style={{ fontSize: 26, fontWeight: 900 }}>＋</span>
            </button>

            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.softBlue,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 900,
                color: BRAND.navy,
              }}
            >
              After upload: tap photo, zoom, rotate and confirm your position.
            </div>

            {media.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEditingMediaId(item.id)}
                    style={{
                      position: 'relative',
                      height: 150,
                      borderRadius: 20,
                      border: `2px solid ${BRAND.black}`,
                      overflow: 'hidden',
                      background: '#f3f6fb',
                      padding: 0,
                    }}
                  >
                    {item.kind === 'video' ? (
                      <video
                        src={item.preview}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
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
                          transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
                        }}
                      />
                    )}

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia(item.id);
                      }}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        border: `2px solid ${BRAND.black}`,
                        background: '#fff',
                        color: BRAND.red,
                        fontSize: 20,
                        fontWeight: 900,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {editingMedia ? (
        <SheetBox
          title="Edit photo"
          subtitle="Zoom and rotate your image."
          onClose={() => setEditingMediaId(null)}
          onBack={() => setEditingMediaId(null)}
          onHome={goHome}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                height: 330,
                borderRadius: 24,
                border: `2px solid ${BRAND.black}`,
                overflow: 'hidden',
                background: '#f3f6fb',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {editingMedia.kind === 'video' ? (
                <video
                  src={editingMedia.preview}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${editingMedia.scale}) rotate(${editingMedia.rotate}deg)`,
                  }}
                />
              ) : (
                <img
                  src={editingMedia.preview}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${editingMedia.scale}) rotate(${editingMedia.rotate}deg)`,
                  }}
                />
              )}
            </div>

            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                padding: 12,
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900 }}>Zoom</div>
              <input
                type="range"
                min="1"
                max="2.4"
                step="0.05"
                value={editingMedia.scale}
                onChange={(e) => updateMediaTransform(editingMedia.id, { scale: Number(e.target.value) })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() =>
                    updateMediaTransform(editingMedia.id, {
                      rotate: editingMedia.rotate - 90,
                    })
                  }
                  style={{
                    height: 52,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: '#fff',
                    color: BRAND.navy,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  ↺ Rotate
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateMediaTransform(editingMedia.id, {
                      rotate: editingMedia.rotate + 90,
                    })
                  }
                  style={{
                    height: 52,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: '#fff',
                    color: BRAND.navy,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  Rotate ↻
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeMedia(editingMedia.id)}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.red,
                color: '#fff',
                fontSize: 19,
                fontWeight: 900,
              }}
            >
              Delete photo
            </button>

            <GreenDoneButton onClick={() => setEditingMediaId(null)}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'price' ? (
        <SheetBox title="Price" subtitle="Choose fixed price or price range." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'fixed' as PriceMode, title: 'Fixed price' },
                { id: 'range' as PriceMode, title: 'From / To' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPriceMode(item.id)}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: priceMode === item.id ? BRAND.blue : '#fff',
                    color: priceMode === item.id ? '#fff' : BRAND.navy,
                    fontSize: 17,
                    fontWeight: 900,
                    boxSizing: 'border-box',
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {priceMode === 'fixed' ? (
              <input
                value={priceFixed}
                onChange={(e) => setPriceFixed(e.target.value)}
                placeholder="Fixed price"
                inputMode="numeric"
                style={{
                  width: '100%',
                  height: 62,
                  borderRadius: 20,
                  border: `2px solid ${BRAND.black}`,
                  padding: '0 16px',
                  fontSize: 24,
                  fontWeight: 900,
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder="From"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    height: 62,
                    borderRadius: 20,
                    border: `2px solid ${BRAND.black}`,
                    padding: '0 16px',
                    fontSize: 24,
                    fontWeight: 900,
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  placeholder="To"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    height: 62,
                    borderRadius: 20,
                    border: `2px solid ${BRAND.black}`,
                    padding: '0 16px',
                    fontSize: 24,
                    fontWeight: 900,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'title' ? (
        <SheetBox title="Title" subtitle="Use a short, clear title." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Hair extensions in London"
            style={{
              width: '100%',
              height: 58,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              padding: '0 16px',
              fontSize: 16,
              fontWeight: 900,
              boxSizing: 'border-box',
            }}
          />

          <div style={{ marginTop: 14 }}>
            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'description' ? (
        <SheetBox title="Description" subtitle="Tell clients what you do." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service in detail"
            style={{
              width: '100%',
              height: 132,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              padding: 16,
              fontSize: 16,
              fontWeight: 900,
              resize: 'none',
              fontFamily: 'Arial, sans-serif',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ marginTop: 14 }}>
            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'category' ? (
        <SheetBox title="Choose category" subtitle="Pick the main category." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 10 }}>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategoryId(item.id);
                  setSubcategory(item.subcategories[0]);
                  setSheet('subcategory');
                }}
                style={{
                  width: '100%',
                  minHeight: 76,
                  borderRadius: 22,
                  border: `2px solid ${BRAND.black}`,
                  background: item.id === categoryId ? BRAND.softBlue : '#fff',
                  color: BRAND.navy,
                  display: 'grid',
                  gridTemplateColumns: '68px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: 18,
                  fontWeight: 900,
                  boxSizing: 'border-box',
                }}
              >
                <CategoryIcon icon={item.icon} />
                <span>
                  <div>{item.label}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: BRAND.muted }}>
                    {item.subcategories.length} subcategories
                  </div>
                </span>
                <span style={{ fontSize: 28 }}>›</span>
              </button>
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'subcategory' ? (
        <SheetBox
          title="Choose subcategory"
          subtitle={`Choose service type in ${currentCategory.label}.`}
          onClose={closeToStart}
          onBack={() => setSheet('category')}
          onHome={goHome}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            {currentCategory.subcategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSubcategory(item);
                  setSheet('hours');
                }}
                style={{
                  width: '100%',
                  minHeight: 58,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: item === subcategory ? BRAND.blue : '#fff',
                  color: item === subcategory ? '#fff' : BRAND.navy,
                  fontSize: 18,
                  fontWeight: 900,
                  boxSizing: 'border-box',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'hours' ? (
        <SheetBox title="Working hours" subtitle="Use digital time format." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>From</span>
                <input
                  value={hoursFrom}
                  onChange={(e) => setHoursFrom(e.target.value)}
                  placeholder="09:00"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    height: 62,
                    borderRadius: 20,
                    border: `2px solid ${BRAND.black}`,
                    padding: '0 14px',
                    fontSize: 26,
                    fontWeight: 900,
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>To</span>
                <input
                  value={hoursTo}
                  onChange={(e) => setHoursTo(e.target.value)}
                  placeholder="20:00"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    height: 62,
                    borderRadius: 20,
                    border: `2px solid ${BRAND.black}`,
                    padding: '0 14px',
                    fontSize: 26,
                    fontWeight: 900,
                    boxSizing: 'border-box',
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                ['09:00', '18:00'],
                ['10:00', '20:00'],
                ['00:00', '24:00'],
              ].map(([from, to]) => (
                <button
                  key={`${from}-${to}`}
                  type="button"
                  onClick={() => {
                    setHoursFrom(from);
                    setHoursTo(to);
                  }}
                  style={{
                    minHeight: 46,
                    borderRadius: 16,
                    border: `2px solid ${BRAND.black}`,
                    background: '#fff',
                    color: BRAND.navy,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {from}
                  <br />
                  {to}
                </button>
              ))}
            </div>

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'contacts' ? (
        <SheetBox title="Contact details" subtitle="Add several numbers for each contact type." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 12 }}>
            {contactChannels.map((channel) => (
              <div
                key={channel.id}
                style={{
                  borderRadius: 22,
                  border: `2px solid ${BRAND.black}`,
                  background: '#fff',
                  padding: 12,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 10, alignItems: 'center' }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      border: `2px solid ${BRAND.black}`,
                      background: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 23,
                    }}
                  >
                    {channel.icon}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>{channel.title}</span>
                  <button
                    type="button"
                    onClick={() => addContactEntry(channel.id)}
                    style={{
                      height: 38,
                      borderRadius: 14,
                      border: `2px solid ${BRAND.black}`,
                      background: BRAND.green,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 900,
                      padding: '0 10px',
                    }}
                  >
                    + Add
                  </button>
                </div>

                {contacts[channel.id].map((entry) => {
                  const withCode = !['instagram', 'email', 'website'].includes(channel.id);

                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: withCode ? '74px 1fr 36px' : '1fr 36px',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
                      {withCode ? (
                        <input
                          value={entry.code}
                          onChange={(e) => updateContactEntry(channel.id, entry.id, { code: e.target.value })}
                          placeholder="+44"
                          style={{
                            width: '100%',
                            height: 50,
                            borderRadius: 16,
                            border: `2px solid ${BRAND.black}`,
                            padding: '0 10px',
                            fontSize: 15,
                            fontWeight: 900,
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : null}

                      <input
                        value={entry.value}
                        onChange={(e) => updateContactEntry(channel.id, entry.id, { value: e.target.value })}
                        placeholder={channel.placeholder}
                        style={{
                          width: '100%',
                          height: 50,
                          borderRadius: 16,
                          border: `2px solid ${BRAND.black}`,
                          padding: '0 12px',
                          fontSize: 15,
                          fontWeight: 900,
                          boxSizing: 'border-box',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => removeContactEntry(channel.id, entry.id)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          border: `2px solid ${BRAND.black}`,
                          background: '#fff',
                          color: BRAND.red,
                          fontSize: 18,
                          fontWeight: 900,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'payments' ? (
        <SheetBox title="Payment methods" subtitle="Choose how clients can pay you." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 10 }}>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => togglePayment(method.id)}
                style={{
                  width: '100%',
                  minHeight: 62,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: selectedPayments.includes(method.id) ? BRAND.softBlue : '#fff',
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 32px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 14px',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ fontSize: 24 }}>{method.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 900 }}>{method.title}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: BRAND.green }}>
                  {selectedPayments.includes(method.id) ? '✓' : ''}
                </span>
              </button>
            ))}

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'address' ? (
        <SheetBox title="Address" subtitle="Tell clients where the service is available." onClose={closeToStart} onBack={goPreviousSheet} onHome={goHome}>
          <div style={{ display: 'grid', gap: 10 }}>
            {['City', 'District / area', 'Street, building, studio, floor', 'Postcode'].map((item) => (
              <input
                key={item}
                placeholder={item}
                style={{
                  width: '100%',
                  height: 58,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  padding: '0 16px',
                  fontSize: 16,
                  fontWeight: 900,
                  boxSizing: 'border-box',
                }}
              />
            ))}

            <GreenDoneButton onClick={goNextSheet}>✓ Done</GreenDoneButton>
          </div>
        </SheetBox>
      ) : null}
    </>
  );
}
