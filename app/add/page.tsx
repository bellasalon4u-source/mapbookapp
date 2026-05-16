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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: `2px solid ${BRAND.black}`,
          background: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 0 rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <img
          src="/ui/logo/logo.png"
          alt="Olamep"
          style={{
            width: 38,
            height: 38,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
        }}
      >
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
}: {
  icon: string;
  title: string;
  value?: string;
  bg: string;
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

  const openMediaPicker = () => {
    mediaInputRef.current?.click();
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
            padding: '10px 20px 12px',
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
                margin: '8px 0 0',
                fontSize: 36,
                lineHeight: 0.98,
                fontWeight: 900,
                color: BRAND.navy,
                letterSpacing: '-1.4px',
              }}
            >
              Add your service
            </h1>

            <div
              style={{
                marginTop: 7,
                fontSize: 15,
                lineHeight: 1.25,
                fontWeight: 900,
                color: BRAND.muted,
              }}
            >
              Create a strong listing for clients nearby
            </div>

            <div
              style={{
                margin: '10px auto 0',
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
                {completedSteps}/5
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

          <Row
            icon="＋"
            bg="#ffffff"
            title="Photos"
            value={media.length > 0 ? `${media.length}/50 selected` : 'Add photos or videos'}
            onClick={() => setSheet('media')}
          />

          <Row
            icon="£"
            bg="#ffffff"
            title="Price"
            value={priceLabel}
            onClick={() => setSheet('price')}
          />

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
            value="Add phone, WhatsApp, Telegram and more"
            onClick={() => setSheet('contacts')}
          />

          <Row
            icon="📍"
            bg="#ffe6e6"
            title="Address"
            value="Add city, area and service location"
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
          subtitle="Add up to 50 photos or videos. You can remove and replace them anytime."
          onClose={() => setSheet(null)}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <button
              type="button"
              onClick={openMediaPicker}
              style={{
                minHeight: 68,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                display: 'grid',
                gridTemplateColumns: '54px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 30 }}>📷</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>Camera / Gallery / Files</span>
              <span style={{ fontSize: 28, fontWeight: 900 }}>＋</span>
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
              After upload: move, zoom, rotate and confirm your photo position.
            </div>

            {media.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {media.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      height: 150,
                      borderRadius: 20,
                      border: `2px solid ${BRAND.black}`,
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
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'price' ? (
        <SheetBox title="Price" subtitle="Choose fixed price or price range." onClose={() => setSheet(null)}>
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
                    height: 58,
                    borderRadius: 18,
                    border: `2px solid ${BRAND.black}`,
                    background: priceMode === item.id ? BRAND.blue : '#fff',
                    color: priceMode === item.id ? '#fff' : BRAND.navy,
                    fontSize: 17,
                    fontWeight: 900,
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

            <button
              type="button"
              onClick={() => setSheet(null)}
              style={{
                width: '100%',
                height: 58,
                borderRadius: 20,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#fff',
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Done
            </button>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'title' ? (
        <SheetBox title="Title" subtitle="Use a short, clear title." onClose={() => setSheet(null)}>
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
        <SheetBox title="Description" subtitle="Tell clients what you do." onClose={() => setSheet(null)}>
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
        <SheetBox title="Choose category" subtitle="Pick the main category." onClose={() => setSheet(null)}>
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

      {sheet === 'contacts' ? (
        <SheetBox title="Contact details" subtitle="Add channels clients can use after booking." onClose={() => setSheet(null)}>
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
