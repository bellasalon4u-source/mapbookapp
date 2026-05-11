'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';

const BRAND = {
  navy: '#071b46',
  black: '#111111',
  green: '#24c45a',
  blue: '#1677ff',
  red: '#ff2456',
  yellow: '#ffe44d',
  muted: '#6f7887',
  softBlue: '#eef5ff',
  softGreen: '#eaffef',
  softPink: '#fff0f7',
  softYellow: '#fff8d9',
};

type PaymentMethodId = 'card' | 'apple-pay' | 'google-pay' | 'paypal' | 'bank';

type Sheet =
  | null
  | 'title'
  | 'description'
  | 'category'
  | 'contacts'
  | 'address'
  | 'payments'
  | 'price'
  | 'preview';

type MediaItem = {
  id: string;
  preview: string;
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
  {
    id: 'pets',
    icon: '🐾',
    label: 'Pets',
    subcategories: ['Dog walking', 'Pet sitting', 'Grooming', 'Training'],
  },
  {
    id: 'events',
    icon: '🎉',
    label: 'Events',
    subcategories: ['Photographer', 'Host', 'Decor', 'Makeup for event'],
  },
];

const paymentMethods: { id: PaymentMethodId; icon: string; title: string }[] = [
  { id: 'card', icon: '💳', title: 'Card' },
  { id: 'apple-pay', icon: '', title: 'Apple Pay' },
  { id: 'google-pay', icon: 'G', title: 'Google Pay' },
  { id: 'paypal', icon: '🅿️', title: 'PayPal' },
  { id: 'bank', icon: '🏦', title: 'Bank transfer' },
];

const contactFields = [
  { key: 'phone', icon: '📞', label: 'Phone', placeholder: '+44 phone number' },
  { key: 'whatsapp', icon: '🟢', label: 'WhatsApp', placeholder: '+44 WhatsApp number' },
  { key: 'telegram', icon: '✈️', label: 'Telegram', placeholder: '@username' },
  { key: 'instagram', icon: '📸', label: 'Instagram', placeholder: '@instagram' },
  { key: 'email', icon: '✉️', label: 'Email', placeholder: 'you@email.com' },
  { key: 'website', icon: '🌐', label: 'Website', placeholder: 'yourwebsite.com' },
];

function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background:
            'conic-gradient(from 20deg, #ff2456, #ffe44d, #24c45a, #1677ff, #7b2cff, #ff2456)',
        }}
      />
      <span style={{ fontSize: 34, fontWeight: 900, color: BRAND.navy }}>Olamep</span>
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
        minHeight: 72,
        borderRadius: 20,
        border: `2px solid ${BRAND.black}`,
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: '54px minmax(0, 1fr) auto',
        gap: 14,
        alignItems: 'center',
        padding: '10px 16px 10px 12px',
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
        <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.navy }}>{title}</div>
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
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
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
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: '#fff',
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
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: BRAND.navy }}>{title}</div>
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

function inputBoxStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 58,
    borderRadius: 18,
    border: `2px solid ${BRAND.black}`,
    padding: '0 16px',
    fontSize: 16,
    fontWeight: 900,
    color: BRAND.navy,
    boxSizing: 'border-box',
  };
}

export default function NewPromotionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null);

  const [priceFrom, setPriceFrom] = useState('40');
  const [priceTo, setPriceTo] = useState('60');

  const [selectedPayments, setSelectedPayments] = useState<PaymentMethodId[]>(['card']);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('beauty');
  const [subcategory, setSubcategory] = useState('Hair & Styling');
  const [contacts, setContacts] = useState<Record<string, string>>({});
  const [address, setAddress] = useState<Record<string, string>>({});

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

  const selectedPaymentTitles = useMemo(() => {
    return paymentMethods
      .filter((method) => selectedPayments.includes(method.id))
      .map((method) => method.title)
      .join(', ');
  }, [selectedPayments]);

  const handlePhotosSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const selected = files.slice(0, 50 - media.length);

    const next = selected
      .filter((file) => file.type.startsWith('image/'))
      .map((file, index) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        preview: URL.createObjectURL(file),
      }));

    setMedia((prev) => [...prev, ...next]);
    event.target.value = '';
  };

  const togglePayment = (id: PaymentMethodId) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const publishPromotion = () => {
    alert('Advertisement ready for payment');
    setSheet(null);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
          paddingBottom: 112,
          overflowX: 'hidden',
        }}
      >
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
          <div style={{ maxWidth: 430, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => router.back()}
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
                width: 54,
                height: 54,
                borderRadius: 999,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                color: BRAND.navy,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              ×
            </button>

            <Logo />

            <h1
              style={{
                margin: '18px 0 0',
                fontSize: 44,
                lineHeight: 0.95,
                fontWeight: 900,
                color: BRAND.navy,
              }}
            >
              Promote service
            </h1>

            <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: BRAND.muted }}>
              Create a bright listing for clients nearby
            </div>
          </div>
        </header>

        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            padding: '18px',
            display: 'grid',
            gap: 12,
            boxSizing: 'border-box',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosSelected}
            style={{ display: 'none' }}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotosSelected}
            style={{ display: 'none' }}
          />

          <section
            style={{
              border: `2px solid ${BRAND.black}`,
              borderRadius: 24,
              background: '#fff',
              padding: 14,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Photos</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.muted }}>{media.length}/50</div>
            </div>

            <div
              style={{
                width: '100%',
                minHeight: 220,
                borderRadius: 22,
                border: '2px dashed #9aa3b1',
                background: '#fff',
                color: BRAND.navy,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                padding: 16,
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  borderRadius: 20,
                  border: `2px solid ${BRAND.black}`,
                  background: BRAND.softBlue,
                  color: BRAND.navy,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                <span style={{ fontSize: 36 }}>📷</span>
                Camera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  borderRadius: 20,
                  border: `2px solid ${BRAND.black}`,
                  background: BRAND.softGreen,
                  color: BRAND.navy,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                <span style={{ fontSize: 36 }}>🖼️</span>
                Files
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '36px 1fr', gap: 8 }}>
              <div style={{ fontSize: 26 }}>🖼️</div>
              <div style={{ fontSize: 16, lineHeight: 1.35, color: BRAND.muted, fontWeight: 900 }}>
                Add up to 50 photos from camera, gallery or files.
              </div>
            </div>
          </section>

          <section
            style={{
              border: `2px solid ${BRAND.black}`,
              borderRadius: 24,
              background: '#fff',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 14 }}>Price</div>
              <div style={{ color: BRAND.muted, fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
                Set promotion budget
              </div>

              <button
                type="button"
                onClick={() => setSheet('price')}
                style={{ width: '100%', border: 'none', background: 'transparent', padding: 0 }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 16,
                      border: `2px solid ${BRAND.black}`,
                      padding: '12px 10px',
                      background: BRAND.softBlue,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>From</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>£{priceFrom}</div>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      border: `2px solid ${BRAND.black}`,
                      padding: '12px 10px',
                      background: BRAND.softGreen,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.muted }}>To</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>£{priceTo}</div>
                  </div>
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
                padding: 16,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: '52px minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <span
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
              </span>

              <span style={{ minWidth: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.05 }}>Payment methods</div>
                <div style={{ marginTop: 5, fontSize: 14, color: BRAND.muted, fontWeight: 900 }}>
                  {selectedPaymentTitles || 'Tap to choose'}
                </div>
              </span>

              <span style={{ fontSize: 34, fontWeight: 900 }}>›</span>
            </button>
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
            value={description || 'Describe your advertisement in detail'}
            onClick={() => setSheet('description')}
          />

          <Row
            icon="🏷️"
            bg={BRAND.softPink}
            title="Category"
            value={`${currentCategory.label} • ${subcategory || 'Choose subcategory'}`}
            onClick={() => setSheet('category')}
          />

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
              fontWeight: 900,
            }}
          >
            Preview your advertisement before payment.
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
            padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',
          }}
        >
          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            <button
              type="button"
              onClick={() => setSheet('preview')}
              style={{
                width: '100%',
                height: 68,
                borderRadius: 24,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              Preview
            </button>
          </div>
        </div>
      </main>

      {sheet === 'title' ? (
        <SheetBox title="Title" onClose={() => setSheet(null)}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a short and clear title"
            style={inputBoxStyle()}
          />
        </SheetBox>
      ) : null}

      {sheet === 'description' ? (
        <SheetBox title="Description" onClose={() => setSheet(null)}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your advertisement in detail"
            style={{
              width: '100%',
              height: 150,
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
        </SheetBox>
      ) : null}

      {sheet === 'category' ? (
        <SheetBox title="Choose category" onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {categories.map((item) => {
                const active = item.id === categoryId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(item.id);
                      setSubcategory('');
                    }}
                    style={{
                      minHeight: 70,
                      borderRadius: 18,
                      border: `2px solid ${BRAND.black}`,
                      background: active ? BRAND.blue : '#fff',
                      color: active ? '#fff' : BRAND.navy,
                      fontSize: 18,
                      fontWeight: 900,
                      position: 'relative',
                    }}
                  >
                    <span style={{ marginRight: 8 }}>{item.icon}</span>
                    {item.label}
                    {active ? (
                      <span
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          background: BRAND.green,
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                borderTop: `2px solid ${BRAND.black}`,
                paddingTop: 14,
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
                Choose subcategory
              </div>

              {currentCategory.subcategories.map((item) => {
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
                      background: active ? BRAND.softGreen : '#fff',
                      color: BRAND.navy,
                      fontSize: 18,
                      fontWeight: 900,
                      display: 'grid',
                      gridTemplateColumns: '1fr 34px',
                      alignItems: 'center',
                      padding: '0 14px',
                      textAlign: 'left',
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'payments' ? (
        <SheetBox title="Payment methods" onClose={() => setSheet(null)}>
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
                    background: active ? BRAND.softBlue : '#fff',
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
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: active ? BRAND.green : '#fff',
                      color: '#fff',
                      display: 'inline-flex',
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
        </SheetBox>
      ) : null}

      {sheet === 'price' ? (
        <SheetBox title="Price" onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>From</div>
              <input
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="From"
                style={inputBoxStyle()}
              />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>To</div>
              <input
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="To"
                style={inputBoxStyle()}
              />
            </div>
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'contacts' ? (
        <SheetBox title="Contact details" onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {contactFields.map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr',
                  gap: 10,
                  alignItems: 'center',
                  borderRadius: 18,
                  border: `2px solid ${BRAND.black}`,
                  padding: 10,
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: `1.5px solid ${BRAND.black}`,
                    background: BRAND.softBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 23,
                  }}
                >
                  {item.icon}
                </span>
                <input
                  value={contacts[item.key] || ''}
                  onChange={(e) =>
                    setContacts((prev) => ({
                      ...prev,
                      [item.key]: e.target.value,
                    }))
                  }
                  placeholder={item.placeholder}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    fontWeight: 900,
                    color: BRAND.navy,
                    minWidth: 0,
                  }}
                />
              </label>
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'address' ? (
        <SheetBox title="Address" onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['city', 'City'],
              ['district', 'District / area'],
              ['street', 'Street, building, studio, floor'],
              ['postcode', 'Postcode'],
            ].map(([key, label]) => (
              <input
                key={key}
                value={address[key] || ''}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                placeholder={label}
                style={inputBoxStyle()}
              />
            ))}
          </div>
        </SheetBox>
      ) : null}

      {sheet === 'preview' ? (
        <SheetBox title="Preview advertisement" onClose={() => setSheet(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                borderRadius: 24,
                border: `2px solid ${BRAND.black}`,
                background: '#fff',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: 170,
                  background: media[0] ? `url(${media[0].preview}) center/cover` : BRAND.softBlue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                }}
              >
                {media[0] ? null : '🖼️'}
              </div>

              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.navy }}>
                  {title || 'Your advertisement title'}
                </div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 900, color: BRAND.muted }}>
                  {currentCategory.label} • {subcategory || 'Subcategory'}
                </div>
                <div style={{ marginTop: 10, fontSize: 16, fontWeight: 900, color: BRAND.navy }}>
                  Budget from £{priceFrom} to £{priceTo}
                </div>
                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: BRAND.muted }}>
                  {description || 'Your advertisement description will appear here.'}
                </div>
                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 900, color: BRAND.navy }}>
                  Payment: {selectedPaymentTitles || 'Not selected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={publishPromotion}
              style={{
                width: '100%',
                height: 62,
                borderRadius: 22,
                border: `2px solid ${BRAND.black}`,
                background: BRAND.green,
                color: '#fff',
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              Continue to payment
            </button>
          </div>
        </SheetBox>
      ) : null}
    </>
  );
}
