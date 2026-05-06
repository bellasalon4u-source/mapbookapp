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

type ServiceFormat =
  | 'at_my_place'
  | 'at_client'
  | 'online';

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
  },
};

const categories: CategoryItem[] = [
  {
    id: 'beauty',
    icon: '💄',
    label: { EN: 'Beauty' },
    subcategories: [
      'Hair & Styling',
      'Nails',
      'Brows',
      'Lashes',
      'Makeup',
      'Hair extensions',
    ],
  },
];

function getText(language: AppLanguage) {
  return textsByLanguage[language] || textsByLanguage.EN!;
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

export default function AddServicePage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<AppLanguage>(getSavedLanguage());

  const text = getText(language);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsub = subscribeToLanguageChange((next) =>
      setLanguage(next)
    );

    return () => unsub();
  }, []);return (
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
            textAlign: 'center',
          }}
        >
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
                width: 42,
                height: 42,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 20deg, #ff2456, #ffe44d, #24c45a, #1677ff, #7b2cff, #ff2456)',
              }}
            />

            <span
              style={{
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              Olamep
            </span>
          </div>

          <h1
            style={{
              margin: '18px 0 0',
              fontSize: 44,
              lineHeight: 0.95,
              fontWeight: 900,
              color: BRAND.navy,
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
      </header>

      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          padding: '18px',
          display: 'grid',
          gap: 12,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            border: `2px solid ${BRAND.black}`,
            background: '#ffffff',
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            {text.contactDetails}
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: `1.5px solid ${BRAND.black}`,
                background: BRAND.softGreen,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              📞
            </span>

            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: BRAND.muted,
              }}
            >
              {text.contactHint}
            </span>
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
          padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            type="button"
            style={{
              width: '100%',
              height: 68,
              borderRadius: 24,
              border: `2px solid ${BRAND.black}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  </>
);
}
