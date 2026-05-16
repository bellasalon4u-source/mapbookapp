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
  lightMuted: '#8b95a3',
  softBlue: '#eef5ff',
  softGreen: '#eaffef',
  softPink: '#fff0f7',
  softYellow: '#fff8d9',
};

type PaymentMethodId = 'card' | 'cash' | 'apple-pay' | 'google-pay' | 'paypal' | 'bank';
type ServiceFormatId = 'all' | 'my-place' | 'client-place' | 'online';

type Sheet =
  | null
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
};

const categories = [
  {
    id: 'beauty',
    icon: '💄',
    label: 'Beauty',
    subcategories: ['Hair & Styling', 'Nails', 'Brows', 'Lashes', 'Makeup', 'Hair extensions'],
  },
  {
    id: 'barber',
    icon: '✂️',
    label: 'Barber',
    subcategories: ['Haircut', 'Beard', 'Shaving', 'Kids haircut'],
  },
  {
    id: 'wellness',
    icon: '🧘',
    label: 'Wellness',
    subcategories: ['Massage', 'SPA', 'Yoga', 'Pilates', 'Facial massage'],
  },
  {
    id: 'home',
    icon: '🏠',
    label: 'Home',
    subcategories: ['Cleaning', 'Deep cleaning', 'Cooking', 'Furniture assembly'],
  },
  {
    id: 'food',
    icon: '🍽️',
    label: 'Food',
    subcategories: ['Chef at home', 'Catering', 'Restaurant booking', 'Cake'],
  },
  {
    id: 'fashion',
    icon: '👗',
    label: 'Fashion',
    subcategories: ['Stylist', 'Tailoring', 'Dress rental', 'Personal shopping'],
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

function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background:
            'conic-gradient(from 20deg, #ff2456, #ffe44d, #24c45a, #1677ff, #7b2cff, #ff2456)',
          boxShadow: '0 4px 12px rgba(22,119,255,0.16)',
        }}
      />
      <span style={{ fontSize: 30, fontWeight: 900, color: BRAND.navy, letterSpacing: '-1px' }}>
        Olamep
      </span>
    </div>
  );
}

function Row({
  icon,
  title,
  value,
  bg,
  onClick,
  children,
}: {
  icon: string;
  title: string;
  value?: string;
  bg: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 68,
        borderRadius: 20,
        border: `2px solid ${BRAND.black}`,
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: '54px 1fr auto',
        gap: 14,
        alignItems: 'center',
        padding: '9px 16px 9px 12px',
        textAlign: 'left',
        cursor: 'pointer',
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
      </span>

      <span style={{ fontSize: 34, fontWeight: 900, color: BRAND.navy }}>›</span>
    </button>
  );
}

function SheetBox({
  title,
  subtitle,
  onClose,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
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
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: 'calc(100vh - 70px)',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '30px 30px 0 0',
          border: `2px solid ${BRAND.black}`,
          padding: '18px 18px calc(20px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          boxShadow: '0 -18px 36px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: onBack ? '46px 1fr 46px' : '1fr 46px',
            gap: 10,
            alignItems: 'start',
            marginBottom: 14,
          }}
        >
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
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
          ) : null}

          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: BRAND.navy, lineHeight: 1 }}>
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  marginTop: 7,
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.muted,
                  lineHeight: 1.3,
                }}
              >
                {subtitle}
              </div>
            ) : null}
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

export default function AddServicePage() {
  const router = useRouter();
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);

  const [pricePounds, setPricePounds] = useState('45');
  const [pricePence, setPricePence] = useState('00');
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

  const progressItems = useMemo(
    () => [
      { key: 'media', done: media.length > 0 },
      { key: 'title', done: title.trim().length > 0 },
      { key: 'description', done: description.trim().length > 0 },
      { key: 'category', done: Boolean(categoryId && subcategory) },
      { key: 'price', done: Boolean(pricePounds && selectedPayments.length > 0) },
    ],
    [media.length, title, description, categoryId, subcategory, pricePounds, selectedPayments.length]
  );

  const completedSteps = progressItems.filter((item) => item.done).length;
  const progressPercent = Math.round((completedSteps / progressItems.length) * 100);

  const handleBack = () => {
    if (sheet === 'subcategory') {
      setSheet('category');
      return;
    }

    if (sheet) {
      setSheet(null);
      return;
    }

    router.back();
  };

  const handlePublish = () => {
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

    if (!pricePounds || selectedPayments.length === 0) {
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
  };

  const togglePayment = (id: PaymentMethodId) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
            padding: '14px 20px 12px',
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
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 48,
                height: 48,
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

            <Logo />

            <h1
              style={{
                margin: '10px 0 0',
                fontSize: 42,
                lineHeight: 0.94,
                fontWeight: 900,
                color: BRAND.navy,
                letterSpacing: '-1.8px',
              }}
            >
              Add your service
            </h1>

            <div
              style={{
                marginTop: 8,
                fontSize: 16,
                lineHeight: 1.25,
                fontWeight: 900,
                color: BRAND.muted,
              }}
            >
              Create a strong listing for clients nearby
            </div>

            <div
              style={{
                margin: '12px auto 0',
                maxWidth: 320,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 10,
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
                {completedSteps}/{progressItems.length}
              </div>
            </div>
          </div>
        </header>

        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            padding: '14px 18px 18px',
            display: 'grid',
            gap: 12,
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

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                border: `2px solid ${BRAND.black}`,
                borderRadius: 24,
                background: '#fff',
                padding: 12,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 21, fontWeight: 900 }}>Photos</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: BRAND.muted }}>
                  {media.length}/50
                </div>
              </div>

              {media.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: media.length === 1 ? '1fr' : '1fr 1fr',
                    gap: 8,
                  }}
                >
                  {media.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        height: index === 0 && media.length > 1 ? 138 : 96,
                        gridRow: index === 0 && media.length > 1 ? 'span 2' : 'auto',
                        borderRadius: 18,
                        border: `1.8px solid ${BRAND.black}`,
                        overflow: 'hidden',
                        background: '#f3f6fb',
                      }}
                    >
                      {item.kind === 'video' ? (
                        <video src={item.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}

                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        style={{
                          position: 'absolute',
                          right: 6,
                          top: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: `1.5px solid ${BRAND.black}`,
                          background: '#fff',
                          color: BRAND.red,
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  style={{
                    width: '100%',
                    height: 176,
                    borderRadius: 22,
                    border: '2px dashed #9aa3b1',
                    background: '#fff',
                    color: BRAND.navy,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 999,
                      border: `3px solid ${BRAND.green}`,
                      color: BRAND.green,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 500,
                    }}
                  >
                    +
                  </div>

                  <div style={{ fontSize: 17, fontWeight: 900 }}>Add photo / video</div>
                </button>
              )}

              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '30px 1fr', gap: 8 }}>
                <div style={{ fontSize: 23 }}>🖼️</div>
                <div style={{ fontSize: 14, lineHeight: 1.35, color: BRAND.muted, fontWeight: 900 }}>
                  Add photos and videos from your files.
                </div>
              </div>

              <div
                style={{
                  marginTop: 11,
                  border: `2px solid ${BRAND.blue}`,
                  borderRadius: 18,
                  background: '#e8f2ff',
                  padding: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 25, fontWeight: 900 }}>
                  <span>↔</span>
                  <span>⌕+</span>
                  <span>↻</span>
                  <span>→</span>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: BRAND.green,
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </span>
                </div>

                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900 }}>
                  Move, zoom, rotate and confirm.
                </div>
              </div>
            </div>

            <div
              style={{
                border: `2px solid ${BRAND.black}`,
                borderRadius: 24,
                background: '#fff',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 21, fontWeight: 900, marginBottom: 10 }}>Price</div>
                <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 900, marginBottom: 10 }}>
                  Set your price
                </div>

                <button
                  type="button"
                  onClick={() => setSheet('price')}
                  style={{ width: '100%', border: 'none', background: 'transparent', padding: 0 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '0.75fr 1fr 1fr', gap: 7 }}>
                    <div
                      style={{
                        height: 64,
                        borderRadius: 15,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.green,
                        fontSize: 30,
                        fontWeight: 900,
                      }}
                    >
                      £
                    </div>

                    <div
                      style={{
                        height: 64,
                        borderRadius: 15,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.red,
                        fontSize: 30,
                        fontWeight: 900,
                      }}
                    >
                      {pricePounds}
                    </div>

                    <div
                      style={{
                        height: 64,
                        borderRadius: 15,
                        border: '1.5px solid #c9ced7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND.red,
                        fontSize: 30,
                        fontWeight: 900,
                      }}
                    >
                      {pricePence}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      minHeight: 48,
                      borderRadius: 16,
                      border: `2px solid ${BRAND.black}`,
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr 22px',
                      alignItems: 'center',
                      padding: '8px 10px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🏷️</span>
                    <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.15 }}>
                      From £{priceFrom} to £{priceTo}
                    </span>
                    <span style={{ fontSize: 28, fontWeight: 900 }}>›</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSheet('payments')}
                style={{
                  width: '100%',
                  border: 'none',
                  borderTop: `2px solid ${BRAND.black}`,
                  background: '#fff',
                  padding: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    border: `2px solid ${BRAND.black}`,
                    background: BRAND.softBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 23,
                  }}
                >
                  💳
                </span>

                <span style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.05 }}>Payment</div>
                  <div style={{ marginTop: 5, fontSize: 12, color: BRAND.muted, fontWeight: 900 }}>
                    {selectedPayments.length} selected
                  </div>
                </span>

                <span style={{ fontSize: 30, fontWeight: 900 }}>›</span>
              </button>
            </div>
          </section>

          <Row
            icon="📝"
            bg={BRAND.softYellow}
            title="Title"
            value={title || 'Add a short and clear title'}
            onClick={() => setSheet('title')}
          />

          <Row
            icon="T"
            bg={BRAND.softBlue}
            title="Description"
            value={description || 'Describe your service in detail'}
            onClick={() => setSheet('description')}
          />

          <Row
            icon="🏷️"
            bg={BRAND.softPink}
            title="Category"
            value={`${currentCategory.label} • ${subcategory}`}
            onClick={() => setSheet('category')}
          />

          <Row
            icon="🕘"
            bg={BRAND.softGreen}
            title="Working hours"
            value={`${hoursFrom} — ${hoursTo}`}
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
            value="Opens a separate sheet of channels"
            onClick={() => setSheet('contacts')}
          />

          <Row
            icon="📍"
            bg="#ffe6e6"
            title="Address"
            value="Opens a separate address form"
            onClick={() => setSheet('address')}
          />

          <div
            style={{
              borderRadius: 20,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.softYellow,
              padding: 16,
              fontSize: 16,
              lineHeight: 1.25,
              fontWeight: 900,
            }}
          >
            Free publication. £1 is charged only when you confirm a booking.
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
                height: 220,
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
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
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
                <div
                  style={{
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 900,
                    lineHeight: 1.05,
                  }}
                >
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
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: BRAND.blue,
                }}
              >
                from £{priceFrom}
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

      {sheet === 'title' ? (
        <SheetBox
          title="Title"
          subtitle="Use a short, clear title that clients understand fast."
          onClose={() => setSheet(null)}
        >
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

          <button
            type="button"
            onClick={() => setSheet(null)}
            style={{
              marginTop: 14,
              width: '100%',
              height: 56,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#fff',
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Done
          </button>
        </SheetBox>
      ) : null}

      {sheet === 'description' ? (
        <SheetBox
          title="Description"
          subtitle="Tell clients what you do, what is included, and why they should book."
          onClose={() => setSheet(null)}
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: I offer professional hair extensions with consultation, colour matching and aftercare advice."
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

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.softBlue,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 900,
              color: BRAND.navy,
            }}
          >
            Tip: mention service type, duration, location, materials and what makes your work special.
          </div>

          <button
            type="button"
            onClick={() => setSheet(null)}
            style={{
              marginTop: 14,
              width: '100%',
              height: 56,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#fff',
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Done
          </button>
        </SheetBox>
      ) : null}

      {sheet === 'category' ? (
        <SheetBox
          title="Choose category"
          subtitle="Pick the main category for your service."
          onClose={() => setSheet(null)}
        >
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
                  minHeight: 64,
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  background: item.id === categoryId ? BRAND.softBlue : '#fff',
                  color: BRAND.navy,
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <span>
                  <div>{item.label}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: BRAND.muted }}>
                    {item.subcategories.length} services
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
          onClose={() => setSheet(null)}
          onBack={() => setSheet('category')}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            {currentCategory.subcategories.map((item) => (
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
                  background: item === subcategory ? BRAND.blue : '#fff',
                  color: item === subcategory ? '#fff' : BRAND.navy,
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'hours' ? (
        <SheetBox title="Working hours" subtitle="Set when clients can book you." onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              type="time"
              value={hoursFrom}
              onChange={(e) => setHoursFrom(e.target.value)}
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
            <input
              type="time"
              value={hoursTo}
              onChange={(e) => setHoursTo(e.target.value)}
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'payments' ? (
        <SheetBox title="Payment methods" subtitle="Choose how clients can pay you." onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => togglePayment(method.id)}
                style={{
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
                }}
              >
                <span style={{ fontSize: 24 }}>{method.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 900 }}>{method.title}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: BRAND.green }}>
                  {selectedPayments.includes(method.id) ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'price' ? (
        <SheetBox title="Price" subtitle="Set your main price and optional price range." onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              value={pricePounds}
              onChange={(e) => setPricePounds(e.target.value)}
              placeholder="Pounds"
              inputMode="numeric"
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
            <input
              value={pricePence}
              onChange={(e) => setPricePence(e.target.value)}
              placeholder="Pence"
              inputMode="numeric"
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
            <input
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="From"
              inputMode="numeric"
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
            <input
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="To"
              inputMode="numeric"
              style={{
                height: 58,
                borderRadius: 18,
                border: `2px solid ${BRAND.black}`,
                padding: '0 14px',
                fontSize: 18,
                fontWeight: 900,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setSheet(null)}
            style={{
              marginTop: 14,
              width: '100%',
              height: 56,
              borderRadius: 18,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#fff',
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Done
          </button>
        </SheetBox>
      ) : null}

      {sheet === 'contacts' ? (
        <SheetBox
          title="Contact details"
          subtitle="Add channels clients can use after booking."
          onClose={() => setSheet(null)}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            {['Phone', 'WhatsApp', 'Telegram', 'Viber', 'Instagram', 'Email', 'Website'].map((item) => (
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
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'address' ? (
        <SheetBox title="Address" subtitle="Tell clients where the service is available." onClose={() => setSheet(null)}>
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
          </div>
        </SheetBox>
      ) : null}
    </>
  );
}
