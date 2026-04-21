'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { categories } from '../../../../services/categories';

type RadiusOption = {
  id: '10' | '50' | '100';
  label: string;
  km: number;
  pricePerDay: number;
  color: string;
  bg: string;
};

type PhotoLayout = 'single' | 'grid';
type BadgeMode = 'none' | 'discount' | 'top' | 'new';

type PaymentMethod = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

type PromotionTexts = {
  pageTitle: string;
  pageSubtitle: string;
  category: string;
  subcategory: string;
  chooseCategory: string;
  chooseSubcategory: string;
  title: string;
  titlePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  badgeText: string;
  badgeNone: string;
  badgeDiscount: string;
  badgeTop: string;
  badgeNew: string;
  discountValue: string;
  discountValuePlaceholder: string;
  visibility: string;
  visibilityHint: string;
  radius: string;
  perDay: string;
  duration: string;
  durationHint: string;
  days: string;
  photo: string;
  photoHint: string;
  addPhoto: string;
  photoAdded: string;
  photoSource: string;
  gallery: string;
  camera: string;
  files: string;
  layout: string;
  layoutSingle: string;
  layoutGrid: string;
  summary: string;
  total: string;
  continueToPayment: string;
  done: string;
  enterCategory: string;
  enterSubcategory: string;
  enterTitle: string;
  enterDescription: string;
  addPhotoAlert: string;
  close: string;
  paymentHint: string;
  firstAdBonus: string;
  photosCount: string;
  adjustPhoto: string;
  photoEditorHint: string;
  resetPhoto: string;
  applyPhoto: string;
  cancel: string;
  miniVideo: string;
  miniVideoHint: string;
  addMiniVideo: string;
  replaceMiniVideo: string;
  miniVideoAdded: string;
  removeMiniVideo: string;
  videoTooLong: string;
  invalidVideo: string;
  livePreview: string;
  sponsored: string;
  openAd: string;
  removeVideoFirst: string;
  removePhotosFirst: string;
  choosePaymentMethod: string;
  paymentMethodsHint: string;
  selectedPaymentMethod: string;
  confirmPayment: string;
};

type PhotoItem = {
  id: string;
  name: string;
  preview: string;
  scale: number;
  offsetX: number;
  offsetY: number;
};

type VideoItem = {
  name: string;
  preview: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const MAX_VIDEO_SECONDS = 5;

const enTexts: PromotionTexts = {
  pageTitle: 'Add advertisement',
  pageSubtitle: 'Create a bright ad to get more views and clients.',
  category: 'Category',
  subcategory: 'Subcategory',
  chooseCategory: 'Choose category',
  chooseSubcategory: 'Choose subcategory',
  title: 'Ad title',
  titlePlaceholder: 'Enter ad title',
  description: 'Description',
  descriptionPlaceholder: 'Enter ad description...',
  badgeText: 'Badge / promo text',
  badgeNone: 'None',
  badgeDiscount: 'Discount',
  badgeTop: 'TOP',
  badgeNew: 'NEW',
  discountValue: 'Discount value',
  discountValuePlaceholder: '20',
  visibility: 'Ad visibility',
  visibilityHint:
    'The ad will be shown inside the selected radius from the current search point.',
  radius: 'Radius',
  perDay: 'per day',
  duration: 'Ad duration',
  durationHint: 'From 10 to 30 days',
  days: 'Days',
  photo: 'Photos',
  photoHint: 'Add one or several photos for the ad.',
  addPhoto: 'Add photos',
  photoAdded: 'Photos added',
  photoSource: 'Photo source',
  gallery: 'Gallery',
  camera: 'Camera',
  files: 'Files',
  layout: 'Display layout',
  layoutSingle: '1 photo',
  layoutGrid: 'Grid 2–9',
  summary: 'Ad summary',
  total: 'Total',
  continueToPayment: 'Continue to payment',
  done: 'Done',
  enterCategory: 'Choose category',
  enterSubcategory: 'Choose subcategory',
  enterTitle: 'Enter ad title',
  enterDescription: 'Enter ad description',
  addPhotoAlert: 'Add at least one photo or one mini video',
  close: 'Close',
  paymentHint: 'Publication goes live only after payment.',
  firstAdBonus: 'First ad can be free for 7 days for new users',
  photosCount: 'Photos',
  adjustPhoto: 'Adjust photo',
  photoEditorHint: 'Move with one finger. Zoom with slider.',
  resetPhoto: 'Reset',
  applyPhoto: 'Apply',
  cancel: 'Cancel',
  miniVideo: 'Mini video',
  miniVideoHint: 'Optional. Add 1 short loop video up to 5 seconds.',
  addMiniVideo: 'Add mini video',
  replaceMiniVideo: 'Replace video',
  miniVideoAdded: 'Mini video added',
  removeMiniVideo: 'Remove video',
  videoTooLong: 'Mini video must be 5 seconds or shorter',
  invalidVideo: 'Please choose a valid video file',
  livePreview: 'Live preview',
  sponsored: 'Sponsored',
  openAd: 'Open ad',
  removeVideoFirst: 'Remove the mini video first',
  removePhotosFirst: 'Remove photos first',
  choosePaymentMethod: 'Choose payment method',
  paymentMethodsHint: 'Select one method to continue payment',
  selectedPaymentMethod: 'Selected method',
  confirmPayment: 'Pay now',
};

const textByLanguage: Record<AppLanguage, PromotionTexts> = {
  EN: enTexts,
  RU: {
    ...enTexts,
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте яркую рекламу, чтобы получить больше просмотров и клиентов.',
    category: 'Категория',
    subcategory: 'Подкатегория',
    chooseCategory: 'Выберите категорию',
    chooseSubcategory: 'Выберите подкатегорию',
    title: 'Название рекламы',
    titlePlaceholder: 'Введите название рекламы',
    description: 'Описание',
    descriptionPlaceholder: 'Введите описание рекламы...',
    badgeText: 'Бейдж / промо текст',
    badgeNone: 'Ничего',
    badgeDiscount: 'Скидка',
    badgeTop: 'TOP',
    badgeNew: 'NEW',
    discountValue: 'Размер скидки',
    discountValuePlaceholder: '20',
    visibility: 'Видимость рекламы',
    visibilityHint:
      'Реклама будет показываться в выбранном радиусе от текущей точки поиска услуг.',
    radius: 'Радиус',
    perDay: 'в день',
    duration: 'Срок рекламы',
    durationHint: 'От 10 до 30 дней',
    days: 'Дни',
    photo: 'Фото',
    photoHint: 'Добавьте одно или несколько фото для рекламы.',
    addPhoto: 'Добавить фото',
    photoAdded: 'Фото добавлены',
    photoSource: 'Источник файла',
    gallery: 'Галерея',
    camera: 'Камера',
    files: 'Файлы',
    layout: 'Вид показа',
    layoutSingle: '1 фото',
    layoutGrid: 'Сетка 2–9',
    summary: 'Итог рекламы',
    total: 'Итого',
    continueToPayment: 'Перейти к оплате',
    done: 'Готово',
    enterCategory: 'Выберите категорию',
    enterSubcategory: 'Выберите подкатегорию',
    enterTitle: 'Введите название рекламы',
    enterDescription: 'Введите описание рекламы',
    addPhotoAlert: 'Добавьте хотя бы одно фото или одно мини видео',
    close: 'Закрыть',
    paymentHint: 'Публикация выйдет только после оплаты.',
    firstAdBonus: 'Первая реклама может быть бесплатной на 7 дней для новых пользователей',
    photosCount: 'Фото',
    adjustPhoto: 'Настроить фото',
    photoEditorHint: 'Перемещай одним пальцем. Увеличивай ползунком.',
    resetPhoto: 'Сбросить',
    applyPhoto: 'Применить',
    cancel: 'Отмена',
    miniVideo: 'Мини видео',
    miniVideoHint: 'Необязательно. Добавьте 1 короткое видео до 5 секунд.',
    addMiniVideo: 'Добавить мини видео',
    replaceMiniVideo: 'Заменить видео',
    miniVideoAdded: 'Мини видео добавлено',
    removeMiniVideo: 'Удалить видео',
    videoTooLong: 'Мини видео должно быть не длиннее 5 секунд',
    invalidVideo: 'Выберите корректный видеофайл',
    livePreview: 'Предварительный просмотр',
    sponsored: 'Реклама',
    openAd: 'Открыть',
    removeVideoFirst: 'Сначала удалите мини видео',
    removePhotosFirst: 'Сначала удалите фото',
    choosePaymentMethod: 'Выберите способ оплаты',
    paymentMethodsHint: 'Выберите один способ для продолжения оплаты',
    selectedPaymentMethod: 'Выбранный способ',
    confirmPayment: 'Оплатить',
  },
  ES: {
    ...enTexts,
    pageTitle: 'Añadir publicidad',
    pageSubtitle: 'Crea un anuncio llamativo para conseguir más vistas y clientes.',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    chooseCategory: 'Elegir categoría',
    chooseSubcategory: 'Elegir subcategoría',
    title: 'Título del anuncio',
    titlePlaceholder: 'Introduce el título del anuncio',
    description: 'Descripción',
    descriptionPlaceholder: 'Introduce la descripción del anuncio...',
    badgeText: 'Texto promocional',
    badgeNone: 'Ninguno',
    badgeDiscount: 'Descuento',
    discountValue: 'Valor del descuento',
    visibility: 'Visibilidad del anuncio',
    radius: 'Radio',
    perDay: 'por día',
    duration: 'Duración',
    days: 'Días',
    photo: 'Fotos',
    addPhoto: 'Añadir fotos',
    continueToPayment: 'Continuar al pago',
    choosePaymentMethod: 'Elegir método de pago',
    confirmPayment: 'Pagar ahora',
  },
  CZ: enTexts,
  DE: enTexts,
  PL: enTexts,
  UA: {
    ...enTexts,
    pageTitle: 'Додати рекламу',
    pageSubtitle: 'Створіть яскраву рекламу, щоб отримати більше переглядів і клієнтів.',
    category: 'Категорія',
    subcategory: 'Підкатегорія',
    chooseCategory: 'Оберіть категорію',
    chooseSubcategory: 'Оберіть підкатегорію',
    title: 'Назва реклами',
    titlePlaceholder: 'Введіть назву реклами',
    description: 'Опис',
    descriptionPlaceholder: 'Введіть опис реклами...',
    badgeText: 'Бейдж / промо текст',
    badgeNone: 'Немає',
    badgeDiscount: 'Знижка',
    discountValue: 'Розмір знижки',
    visibility: 'Видимість реклами',
    radius: 'Радіус',
    perDay: 'на день',
    duration: 'Тривалість реклами',
    days: 'Дні',
    photo: 'Фото',
    addPhoto: 'Додати фото',
    continueToPayment: 'Перейти до оплати',
    choosePaymentMethod: 'Оберіть спосіб оплати',
    confirmPayment: 'Оплатити',
  },
  IT: enTexts,
  FR: enTexts,
  AR: enTexts,
};

const radiusOptionsByLanguage: Record<AppLanguage, RadiusOption[]> = {
  EN: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  RU: [
    { id: '10', label: '10 км', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 км', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 км', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  ES: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  CZ: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  DE: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  PL: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  UA: [
    { id: '10', label: '10 км', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 км', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 км', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  IT: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  FR: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
  AR: [
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ],
};

const paymentMethodsByLanguage: Record<AppLanguage, PaymentMethod[]> = {
  EN: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  RU: [
    { id: 'card', title: 'Банковская карта', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'Баланс MapBook', subtitle: 'Оплата со счёта приложения', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Быстрая оплата', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Мгновенная оплата', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Мгновенная оплата', icon: 'G' },
    { id: 'crypto', title: 'Криптокошелёк', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Банковский перевод', subtitle: 'Ручной перевод', icon: '🏦' },
  ],
  ES: [
    { id: 'card', title: 'Tarjeta bancaria', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'Saldo MapBook', subtitle: 'Pagar desde el saldo', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Pago rápido', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Pago instantáneo', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Pago instantáneo', icon: 'G' },
    { id: 'crypto', title: 'Billetera cripto', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Transferencia bancaria', subtitle: 'Transferencia manual', icon: '🏦' },
  ],
  CZ: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  DE: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  PL: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  UA: [
    { id: 'card', title: 'Банківська карта', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'Баланс MapBook', subtitle: 'Оплата з балансу додатка', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Швидка оплата', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Миттєва оплата', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Миттєва оплата', icon: 'G' },
    { id: 'crypto', title: 'Криптогаманець', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Банківський переказ', subtitle: 'Ручний переказ', icon: '🏦' },
  ],
  IT: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  FR: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
  AR: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSafeScale(value: number) {
  return clamp(Number.isFinite(value) ? value : 1, MIN_SCALE, MAX_SCALE);
}

function getBadgeLabel(mode: BadgeMode, discountValue: string, text: PromotionTexts) {
  if (mode === 'discount') {
    const clean = discountValue.replace(/[^\d]/g, '');
    return clean ? `-${clean}%` : '-20%';
  }
  if (mode === 'top') return text.badgeTop;
  if (mode === 'new') return text.badgeNew;
  return '';
}

function translateCategoryLabel(categoryId: string, language: AppLanguage, fallback?: string) {
  const map: Record<string, Record<AppLanguage, string>> = {
    beauty: {
      EN: 'Beauty',
      ES: 'Belleza',
      RU: 'Красота',
      UA: 'Краса',
      CZ: 'Krása',
      DE: 'Beauty',
      IT: 'Beauty',
      FR: 'Beauté',
      AR: 'الجمال',
      PL: 'Uroda',
    },
    barber: {
      EN: 'Barber',
      ES: 'Barbero',
      RU: 'Барбер',
      UA: 'Барбер',
      CZ: 'Barber',
      DE: 'Barber',
      IT: 'Barber',
      FR: 'Barbier',
      AR: 'حلاقة',
      PL: 'Barber',
    },
    wellness: {
      EN: 'Wellness',
      ES: 'Bienestar',
      RU: 'Велнес',
      UA: 'Велнес',
      CZ: 'Wellness',
      DE: 'Wellness',
      IT: 'Benessere',
      FR: 'Bien-être',
      AR: 'عافية',
      PL: 'Wellness',
    },
    home: {
      EN: 'Home',
      ES: 'Hogar',
      RU: 'Дом',
      UA: 'Дім',
      CZ: 'Domov',
      DE: 'Zuhause',
      IT: 'Casa',
      FR: 'Maison',
      AR: 'المنزل',
      PL: 'Dom',
    },
    repairs: {
      EN: 'Repairs',
      ES: 'Reparaciones',
      RU: 'Ремонт',
      UA: 'Ремонт',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      IT: 'Riparazioni',
      FR: 'Réparations',
      AR: 'إصلاحات',
      PL: 'Naprawy',
    },
    tech: {
      EN: 'Tech',
      ES: 'Tecnología',
      RU: 'Техника',
      UA: 'Техніка',
      CZ: 'Technika',
      DE: 'Technik',
      IT: 'Tech',
      FR: 'Tech',
      AR: 'تقنية',
      PL: 'Technika',
    },
    fashion: {
      EN: 'Fashion',
      ES: 'Moda',
      RU: 'Мода',
      UA: 'Мода',
      CZ: 'Móda',
      DE: 'Mode',
      IT: 'Moda',
      FR: 'Mode',
      AR: 'موضة',
      PL: 'Moda',
    },
    pets: {
      EN: 'Pets',
      ES: 'Mascotas',
      RU: 'Питомцы',
      UA: 'Тварини',
      CZ: 'Mazlíčci',
      DE: 'Haustiere',
      IT: 'Animali',
      FR: 'Animaux',
      AR: 'حيوانات',
      PL: 'Zwierzęta',
    },
    auto: {
      EN: 'Auto',
      ES: 'Auto',
      RU: 'Авто',
      UA: 'Авто',
      CZ: 'Auto',
      DE: 'Auto',
      IT: 'Auto',
      FR: 'Auto',
      AR: 'سيارات',
      PL: 'Auto',
    },
    moving: {
      EN: 'Moving',
      ES: 'Mudanza',
      RU: 'Переезд',
      UA: 'Переїзд',
      CZ: 'Stěhování',
      DE: 'Umzug',
      IT: 'Trasloco',
      FR: 'Déménagement',
      AR: 'نقل',
      PL: 'Przeprowadzka',
    },
    fitness: {
      EN: 'Fitness',
      ES: 'Fitness',
      RU: 'Фитнес',
      UA: 'Фітнес',
      CZ: 'Fitness',
      DE: 'Fitness',
      IT: 'Fitness',
      FR: 'Fitness',
      AR: 'لياقة',
      PL: 'Fitness',
    },
    education: {
      EN: 'Education',
      ES: 'Educación',
      RU: 'Обучение',
      UA: 'Навчання',
      CZ: 'Vzdělání',
      DE: 'Bildung',
      IT: 'Formazione',
      FR: 'Éducation',
      AR: 'تعليم',
      PL: 'Edukacja',
    },
    events: {
      EN: 'Events',
      ES: 'Eventos',
      RU: 'События',
      UA: 'Події',
      CZ: 'Události',
      DE: 'Events',
      IT: 'Eventi',
      FR: 'Événements',
      AR: 'فعاليات',
      PL: 'Wydarzenia',
    },
    activities: {
      EN: 'Activities',
      ES: 'Actividades',
      RU: 'Активности',
      UA: 'Активності',
      CZ: 'Aktivity',
      DE: 'Aktivitäten',
      IT: 'Attività',
      FR: 'Activités',
      AR: 'أنشطة',
      PL: 'Aktywności',
    },
    creative: {
      EN: 'Creative',
      ES: 'Creativo',
      RU: 'Креатив',
      UA: 'Креатив',
      CZ: 'Kreativa',
      DE: 'Kreativ',
      IT: 'Creativo',
      FR: 'Créatif',
      AR: 'إبداعي',
      PL: 'Kreatywne',
    },
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Record<AppLanguage, string>> = {
    Hair: {
      EN: 'Hair',
      ES: 'Cabello',
      RU: 'Волосы',
      UA: 'Волосся',
      CZ: 'Vlasy',
      DE: 'Haare',
      IT: 'Capelli',
      FR: 'Cheveux',
      AR: 'الشعر',
      PL: 'Włosy',
    },
    'Brows & Lashes': {
      EN: 'Brows & Lashes',
      ES: 'Cejas y pestañas',
      RU: 'Брови и ресницы',
      UA: 'Брови та вії',
      CZ: 'Obočí a řasy',
      DE: 'Augenbrauen & Wimpern',
      IT: 'Sopracciglia e ciglia',
      FR: 'Sourcils et cils',
      AR: 'الحواجب والرموش',
      PL: 'Brwi i rzęsy',
    },
    Nails: {
      EN: 'Nails',
      ES: 'Uñas',
      RU: 'Ногти',
      UA: 'Нігті',
      CZ: 'Nehty',
      DE: 'Nägel',
      IT: 'Unghie',
      FR: 'Ongles',
      AR: 'الأظافر',
      PL: 'Paznokcie',
    },
    Makeup: {
      EN: 'Makeup',
      ES: 'Maquillaje',
      RU: 'Макияж',
      UA: 'Макіяж',
      CZ: 'Make-up',
      DE: 'Make-up',
      IT: 'Make-up',
      FR: 'Maquillage',
      AR: 'مكياج',
      PL: 'Makijaż',
    },
    Skincare: {
      EN: 'Skincare',
      ES: 'Cuidado de la piel',
      RU: 'Уход за кожей',
      UA: 'Догляд за шкірою',
      CZ: 'Péče o pleť',
      DE: 'Hautpflege',
      IT: 'Cura della pelle',
      FR: 'Soin de la peau',
      AR: 'العناية بالبشرة',
      PL: 'Pielęgnacja skóry',
    },
    Aesthetics: {
      EN: 'Aesthetics',
      ES: 'Estética',
      RU: 'Эстетика',
      UA: 'Естетика',
      CZ: 'Estetika',
      DE: 'Ästhetik',
      IT: 'Estetica',
      FR: 'Esthétique',
      AR: 'التجميل',
      PL: 'Estetyka',
    },
    Haircut: {
      EN: 'Haircut',
      ES: 'Corte de pelo',
      RU: 'Стрижка',
      UA: 'Стрижка',
      CZ: 'Střih',
      DE: 'Haarschnitt',
      IT: 'Taglio',
      FR: 'Coupe',
      AR: 'قص الشعر',
      PL: 'Strzyżenie',
    },
    'Beard Trim': {
      EN: 'Beard Trim',
      ES: 'Recorte de barba',
      RU: 'Подравнивание бороды',
      UA: 'Підрівнювання бороди',
      CZ: 'Úprava vousů',
      DE: 'Bart trimmen',
      IT: 'Regolazione barba',
      FR: 'Taille de barbe',
      AR: 'تهذيب اللحية',
      PL: 'Przycinanie brody',
    },
    Shave: {
      EN: 'Shave',
      ES: 'Afeitado',
      RU: 'Бритьё',
      UA: 'Гоління',
      CZ: 'Holení',
      DE: 'Rasur',
      IT: 'Rasatura',
      FR: 'Rasage',
      AR: 'حلاقة',
      PL: 'Golenie',
    },
    Fade: {
      EN: 'Fade',
      ES: 'Fade',
      RU: 'Фейд',
      UA: 'Фейд',
      CZ: 'Fade',
      DE: 'Fade',
      IT: 'Fade',
      FR: 'Fade',
      AR: 'فيد',
      PL: 'Fade',
    },
    'Kids Haircut': {
      EN: 'Kids Haircut',
      ES: 'Corte infantil',
      RU: 'Детская стрижка',
      UA: 'Дитяча стрижка',
      CZ: 'Dětský střih',
      DE: 'Kinderhaarschnitt',
      IT: 'Taglio bambino',
      FR: 'Coupe enfant',
      AR: 'قص أطفال',
      PL: 'Strzyżenie dziecięce',
    },
    Styling: {
      EN: 'Styling',
      ES: 'Peinado',
      RU: 'Укладка',
      UA: 'Укладка',
      CZ: 'Styling',
      DE: 'Styling',
      IT: 'Styling',
      FR: 'Coiffage',
      AR: 'تصفيف',
      PL: 'Stylizacja',
    },
    Massage: {
      EN: 'Massage',
      ES: 'Masaje',
      RU: 'Массаж',
      UA: 'Масаж',
      CZ: 'Masáž',
      DE: 'Massage',
      IT: 'Massaggio',
      FR: 'Massage',
      AR: 'مساج',
      PL: 'Masaż',
    },
    Spa: {
      EN: 'Spa',
      ES: 'Spa',
      RU: 'Спа',
      UA: 'Спа',
      CZ: 'Spa',
      DE: 'Spa',
      IT: 'Spa',
      FR: 'Spa',
      AR: 'سبا',
      PL: 'Spa',
    },
    Relaxation: {
      EN: 'Relaxation',
      ES: 'Relajación',
      RU: 'Релакс',
      UA: 'Релакс',
      CZ: 'Relaxace',
      DE: 'Entspannung',
      IT: 'Relax',
      FR: 'Relaxation',
      AR: 'استرخاء',
      PL: 'Relaks',
    },
    Recovery: {
      EN: 'Recovery',
      ES: 'Recuperación',
      RU: 'Восстановление',
      UA: 'Відновлення',
      CZ: 'Regenerace',
      DE: 'Erholung',
      IT: 'Recupero',
      FR: 'Récupération',
      AR: 'تعافٍ',
      PL: 'Regeneracja',
    },
    'Holistic Care': {
      EN: 'Holistic Care',
      ES: 'Cuidado holístico',
      RU: 'Холистический уход',
      UA: 'Холістичний догляд',
      CZ: 'Holistická péče',
      DE: 'Ganzheitliche Pflege',
      IT: 'Cura olistica',
      FR: 'Soin holistique',
      AR: 'رعاية شمولية',
      PL: 'Opieka holistyczna',
    },
    'Therapy Support': {
      EN: 'Therapy Support',
      ES: 'Apoyo terapéutico',
      RU: 'Терапевтическая помощь',
      UA: 'Терапевтична підтримка',
      CZ: 'Terapeutická podpora',
      DE: 'Therapie-Unterstützung',
      IT: 'Supporto terapeutico',
      FR: 'Soutien thérapeutique',
      AR: 'دعم علاجي',
      PL: 'Wsparcie terapeutyczne',
    },
    Cleaning: {
      EN: 'Cleaning',
      ES: 'Limpieza',
      RU: 'Уборка',
      UA: 'Прибирання',
      CZ: 'Úklid',
      DE: 'Reinigung',
      IT: 'Pulizia',
      FR: 'Nettoyage',
      AR: 'تنظيف',
      PL: 'Sprzątanie',
    },
    'Deep Cleaning': {
      EN: 'Deep Cleaning',
      ES: 'Limpieza profunda',
      RU: 'Глубокая уборка',
      UA: 'Глибоке прибирання',
      CZ: 'Hloubkové čištění',
      DE: 'Tiefenreinigung',
      IT: 'Pulizia profonda',
      FR: 'Nettoyage en profondeur',
      AR: 'تنظيف عميق',
      PL: 'Dogłębne czyszczenie',
    },
    'Garden Help': {
      EN: 'Garden Help',
      ES: 'Ayuda en jardín',
      RU: 'Помощь в саду',
      UA: 'Допомога в саду',
      CZ: 'Pomoc na zahradě',
      DE: 'Gartenhilfe',
      IT: 'Aiuto in giardino',
      FR: 'Aide au jardin',
      AR: 'مساعدة في الحديقة',
      PL: 'Pomoc w ogrodzie',
    },
    Handyman: {
      EN: 'Handyman',
      ES: 'Manitas',
      RU: 'Мастер на час',
      UA: 'Майстер на годину',
      CZ: 'Hodinový manžel',
      DE: 'Handwerker',
      IT: 'Tuttofare',
      FR: 'Bricoleur',
      AR: 'عامل صيانة',
      PL: 'Złota rączka',
    },
    'Furniture Assembly': {
      EN: 'Furniture Assembly',
      ES: 'Montaje de muebles',
      RU: 'Сборка мебели',
      UA: 'Збірка меблів',
      CZ: 'Montáž nábytku',
      DE: 'Möbelmontage',
      IT: 'Montaggio mobili',
      FR: 'Montage de meubles',
      AR: 'تركيب الأثاث',
      PL: 'Montaż mebli',
    },
    'Home Help': {
      EN: 'Home Help',
      ES: 'Ayuda en casa',
      RU: 'Помощь по дому',
      UA: 'Допомога по дому',
      CZ: 'Pomoc v domácnosti',
      DE: 'Haushaltshilfe',
      IT: 'Aiuto domestico',
      FR: 'Aide à domicile',
      AR: 'مساعدة منزلية',
      PL: 'Pomoc domowa',
    },
    'Home Repairs': {
      EN: 'Home Repairs',
      ES: 'Reparaciones del hogar',
      RU: 'Домашний ремонт',
      UA: 'Домашній ремонт',
      CZ: 'Opravy doma',
      DE: 'Hausreparaturen',
      IT: 'Riparazioni domestiche',
      FR: 'Réparations à domicile',
      AR: 'إصلاحات منزلية',
      PL: 'Naprawy domowe',
    },
    'Appliance Repair': {
      EN: 'Appliance Repair',
      ES: 'Reparación de electrodomésticos',
      RU: 'Ремонт техники',
      UA: 'Ремонт техніки',
      CZ: 'Oprava spotřebičů',
      DE: 'Gerätereparatur',
      IT: 'Riparazione elettrodomestici',
      FR: 'Réparation d’appareils',
      AR: 'إصلاح الأجهزة',
      PL: 'Naprawa sprzętu',
    },
    'Furniture Repair': {
      EN: 'Furniture Repair',
      ES: 'Reparación de muebles',
      RU: 'Ремонт мебели',
      UA: 'Ремонт меблів',
      CZ: 'Oprava nábytku',
      DE: 'Möbelreparatur',
      IT: 'Riparazione mobili',
      FR: 'Réparation de meubles',
      AR: 'إصلاح الأثاث',
      PL: 'Naprawa mebli',
    },
    'Shoe Repair': {
      EN: 'Shoe Repair',
      ES: 'Reparación de zapatos',
      RU: 'Ремонт обуви',
      UA: 'Ремонт взуття',
      CZ: 'Oprava bot',
      DE: 'Schuhreparatur',
      IT: 'Riparazione scarpe',
      FR: 'Réparation de chaussures',
      AR: 'إصلاح الأحذية',
      PL: 'Naprawa butów',
    },
    'Clothing Repair': {
      EN: 'Clothing Repair',
      ES: 'Reparación de ropa',
      RU: 'Ремонт одежды',
      UA: 'Ремонт одягу',
      CZ: 'Oprava oblečení',
      DE: 'Kleiderreparatur',
      IT: 'Riparazione vestiti',
      FR: 'Réparation de vêtements',
      AR: 'إصلاح الملابس',
      PL: 'Naprawa odzieży',
    },
    'Watch Repair': {
      EN: 'Watch Repair',
      ES: 'Reparación de relojes',
      RU: 'Ремонт часов',
      UA: 'Ремонт годинників',
      CZ: 'Oprava hodinek',
      DE: 'Uhrenreparatur',
      IT: 'Riparazione orologi',
      FR: 'Réparation de montres',
      AR: 'إصلاح الساعات',
      PL: 'Naprawa zegarków',
    },
    'Phone Repair': {
      EN: 'Phone Repair',
      ES: 'Reparación de teléfono',
      RU: 'Ремонт телефона',
      UA: 'Ремонт телефону',
      CZ: 'Oprava telefonu',
      DE: 'Handyreparatur',
      IT: 'Riparazione telefono',
      FR: 'Réparation téléphone',
      AR: 'إصلاح الهاتف',
      PL: 'Naprawa telefonu',
    },
    'Computer Repair': {
      EN: 'Computer Repair',
      ES: 'Reparación de ordenador',
      RU: 'Ремонт компьютера',
      UA: 'Ремонт комп’ютера',
      CZ: 'Oprava počítače',
      DE: 'Computerreparatur',
      IT: 'Riparazione computer',
      FR: 'Réparation ordinateur',
      AR: 'إصلاح الكمبيوتر',
      PL: 'Naprawa komputera',
    },
    'Laptop Repair': {
      EN: 'Laptop Repair',
      ES: 'Reparación de portátil',
      RU: 'Ремонт ноутбука',
      UA: 'Ремонт ноутбука',
      CZ: 'Oprava notebooku',
      DE: 'Laptopreparatur',
      IT: 'Riparazione laptop',
      FR: 'Réparation portable',
      AR: 'إصلاح اللابتوب',
      PL: 'Naprawa laptopa',
    },
    'Tablet Repair': {
      EN: 'Tablet Repair',
      ES: 'Reparación de tablet',
      RU: 'Ремонт планшета',
      UA: 'Ремонт планшета',
      CZ: 'Oprava tabletu',
      DE: 'Tablet-Reparatur',
      IT: 'Riparazione tablet',
      FR: 'Réparation tablette',
      AR: 'إصلاح التابلت',
      PL: 'Naprawa tabletu',
    },
    'TV Setup': {
      EN: 'TV Setup',
      ES: 'Configuración TV',
      RU: 'Настройка ТВ',
      UA: 'Налаштування ТВ',
      CZ: 'Nastavení TV',
      DE: 'TV-Einrichtung',
      IT: 'Configurazione TV',
      FR: 'Configuration TV',
      AR: 'إعداد التلفاز',
      PL: 'Konfiguracja TV',
    },
    'Smart Device Help': {
      EN: 'Smart Device Help',
      ES: 'Ayuda con dispositivos inteligentes',
      RU: 'Помощь с умными устройствами',
      UA: 'Допомога з розумними пристроями',
      CZ: 'Pomoc s chytrými zařízeními',
      DE: 'Hilfe mit Smart-Geräten',
      IT: 'Aiuto dispositivi smart',
      FR: 'Aide appareils connectés',
      AR: 'مساعدة الأجهزة الذكية',
      PL: 'Pomoc ze smart urządzeniami',
    },
    Tailoring: {
      EN: 'Tailoring',
      ES: 'Sastrería',
      RU: 'Пошив',
      UA: 'Пошиття',
      CZ: 'Krejčovství',
      DE: 'Schneiderei',
      IT: 'Sartoria',
      FR: 'Couture',
      AR: 'خياطة',
      PL: 'Krawiectwo',
    },
    Alterations: {
      EN: 'Alterations',
      ES: 'Arreglos',
      RU: 'Переделка',
      UA: 'Переробка',
      CZ: 'Úpravy',
      DE: 'Änderungen',
      IT: 'Modifiche',
      FR: 'Retouches',
      AR: 'تعديلات',
      PL: 'Przeróbki',
    },
    'Custom Sewing': {
      EN: 'Custom Sewing',
      ES: 'Costura a medida',
      RU: 'Индивидуальный пошив',
      UA: 'Індивідуальне пошиття',
      CZ: 'Zakázkové šití',
      DE: 'Maßschneiderei',
      IT: 'Cucito su misura',
      FR: 'Couture sur mesure',
      AR: 'خياطة مخصصة',
      PL: 'Szycie na miarę',
    },
    'Shoe Care': {
      EN: 'Shoe Care',
      ES: 'Cuidado del calzado',
      RU: 'Уход за обувью',
      UA: 'Догляд за взуттям',
      CZ: 'Péče o obuv',
      DE: 'Schuhpflege',
      IT: 'Cura scarpe',
      FR: 'Entretien des chaussures',
      AR: 'العناية بالأحذية',
      PL: 'Pielęgnacja butów',
    },
    'Bag Repair': {
      EN: 'Bag Repair',
      ES: 'Reparación de bolsos',
      RU: 'Ремонт сумок',
      UA: 'Ремонт сумок',
      CZ: 'Oprava tašek',
      DE: 'Taschenreparatur',
      IT: 'Riparazione borse',
      FR: 'Réparation sacs',
      AR: 'إصلاح الحقائب',
      PL: 'Naprawa toreb',
    },
    Grooming: {
      EN: 'Grooming',
      ES: 'Peluquería',
      RU: 'Груминг',
      UA: 'Грумінг',
      CZ: 'Grooming',
      DE: 'Grooming',
      IT: 'Toelettatura',
      FR: 'Toilettage',
      AR: 'تنظيف الحيوانات',
      PL: 'Grooming',
    },
    'Dog Walking': {
      EN: 'Dog Walking',
      ES: 'Paseo de perros',
      RU: 'Выгул собак',
      UA: 'Вигул собак',
      CZ: 'Venčení psů',
      DE: 'Gassi-Service',
      IT: 'Passeggiata cani',
      FR: 'Promenade de chiens',
      AR: 'تمشية الكلاب',
      PL: 'Wyprowadzanie psów',
    },
    'Pet Sitting': {
      EN: 'Pet Sitting',
      ES: 'Cuidado de mascotas',
      RU: 'Передержка питомцев',
      UA: 'Перетримка тварин',
      CZ: 'Hlídání mazlíčků',
      DE: 'Tiersitting',
      IT: 'Pet sitting',
      FR: 'Garde d’animaux',
      AR: 'رعاية الحيوانات',
      PL: 'Opieka nad zwierzętami',
    },
    'Pet Taxi': {
      EN: 'Pet Taxi',
      ES: 'Taxi para mascotas',
      RU: 'Такси для питомцев',
      UA: 'Таксі для тварин',
      CZ: 'Taxi pro mazlíčky',
      DE: 'Tier-Taxi',
      IT: 'Taxi per animali',
      FR: 'Taxi animaux',
      AR: 'تاكسي الحيوانات',
      PL: 'Taxi dla zwierząt',
    },
    'Pet Delivery': {
      EN: 'Pet Delivery',
      ES: 'Entrega para mascotas',
      RU: 'Доставка для питомцев',
      UA: 'Доставка для тварин',
      CZ: 'Doručení pro mazlíčky',
      DE: 'Lieferung für Tiere',
      IT: 'Consegna per animali',
      FR: 'Livraison animaux',
      AR: 'توصيل للحيوانات',
      PL: 'Dostawa dla zwierząt',
    },
    Training: {
      EN: 'Training',
      ES: 'Entrenamiento',
      RU: 'Дрессировка',
      UA: 'Тренування',
      CZ: 'Trénink',
      DE: 'Training',
      IT: 'Allenamento',
      FR: 'Entraînement',
      AR: 'تدريب',
      PL: 'Trening',
    },
    'Home Visits': {
      EN: 'Home Visits',
      ES: 'Visitas a domicilio',
      RU: 'Выезд на дом',
      UA: 'Візит додому',
      CZ: 'Návštěvy doma',
      DE: 'Hausbesuche',
      IT: 'Visite a domicilio',
      FR: 'Visites à domicile',
      AR: 'زيارات منزلية',
      PL: 'Wizyty domowe',
    },
    'Accessories & Gifts': {
      EN: 'Accessories & Gifts',
      ES: 'Accesorios y regalos',
      RU: 'Аксессуары и подарки',
      UA: 'Аксесуари та подарунки',
      CZ: 'Doplňky a dárky',
      DE: 'Accessoires & Geschenke',
      IT: 'Accessori e regali',
      FR: 'Accessoires et cadeaux',
      AR: 'إكسسوارات وهدايا',
      PL: 'Akcesoria i prezenty',
    },
    'Car Wash': {
      EN: 'Car Wash',
      ES: 'Lavado de coche',
      RU: 'Мойка авто',
      UA: 'Мийка авто',
      CZ: 'Mytí auta',
      DE: 'Autowäsche',
      IT: 'Lavaggio auto',
      FR: 'Lavage auto',
      AR: 'غسيل السيارة',
      PL: 'Mycie auta',
    },
    Detailing: {
      EN: 'Detailing',
      ES: 'Detailing',
      RU: 'Детейлинг',
      UA: 'Детейлінг',
      CZ: 'Detailing',
      DE: 'Detailing',
      IT: 'Detailing',
      FR: 'Detailing',
      AR: 'تلميع',
      PL: 'Detailing',
    },
    'Tyre Help': {
      EN: 'Tyre Help',
      ES: 'Ayuda con neumáticos',
      RU: 'Помощь с шинами',
      UA: 'Допомога з шинами',
      CZ: 'Pomoc s pneumatikami',
      DE: 'Reifenhilfe',
      IT: 'Aiuto pneumatici',
      FR: 'Aide pneus',
      AR: 'مساعدة الإطارات',
      PL: 'Pomoc z oponami',
    },
    'Battery Help': {
      EN: 'Battery Help',
      ES: 'Ayuda con batería',
      RU: 'Помощь с аккумулятором',
      UA: 'Допомога з акумулятором',
      CZ: 'Pomoc s baterií',
      DE: 'Batteriehilfe',
      IT: 'Aiuto batteria',
      FR: 'Aide batterie',
      AR: 'مساعدة البطارية',
      PL: 'Pomoc z akumulatorem',
    },
    Diagnostics: {
      EN: 'Diagnostics',
      ES: 'Diagnóstico',
      RU: 'Диагностика',
      UA: 'Діагностика',
      CZ: 'Diagnostika',
      DE: 'Diagnose',
      IT: 'Diagnostica',
      FR: 'Diagnostic',
      AR: 'تشخيص',
      PL: 'Diagnostyka',
    },
    'Driver Service': {
      EN: 'Driver Service',
      ES: 'Servicio de conductor',
      RU: 'Услуги водителя',
      UA: 'Послуги водія',
      CZ: 'Řidičské služby',
      DE: 'Fahrerservice',
      IT: 'Servizio autista',
      FR: 'Service chauffeur',
      AR: 'خدمة السائق',
      PL: 'Usługa kierowcy',
    },
    'Small Moves': {
      EN: 'Small Moves',
      ES: 'Pequeñas mudanzas',
      RU: 'Небольшие переезды',
      UA: 'Невеликі переїзди',
      CZ: 'Malé stěhování',
      DE: 'Kleine Umzüge',
      IT: 'Piccoli traslochi',
      FR: 'Petits déménagements',
      AR: 'نقلات صغيرة',
      PL: 'Małe przeprowadzki',
    },
    'Van Help': {
      EN: 'Van Help',
      ES: 'Ayuda con furgoneta',
      RU: 'Помощь с фургоном',
      UA: 'Допомога з фургоном',
      CZ: 'Pomoc s dodávkou',
      DE: 'Transporter-Hilfe',
      IT: 'Aiuto furgone',
      FR: 'Aide fourgon',
      AR: 'مساعدة الشاحنة',
      PL: 'Pomoc z vanem',
    },
    'Furniture Delivery': {
      EN: 'Furniture Delivery',
      ES: 'Entrega de muebles',
      RU: 'Доставка мебели',
      UA: 'Доставка меблів',
      CZ: 'Doručení nábytku',
      DE: 'Möbellieferung',
      IT: 'Consegna mobili',
      FR: 'Livraison meubles',
      AR: 'توصيل الأثاث',
      PL: 'Dostawa mebli',
    },
    Courier: {
      EN: 'Courier',
      ES: 'Mensajería',
      RU: 'Курьер',
      UA: 'Курʼєр',
      CZ: 'Kurýr',
      DE: 'Kurier',
      IT: 'Corriere',
      FR: 'Coursier',
      AR: 'توصيل',
      PL: 'Kurier',
    },
    'Same-Day Delivery': {
      EN: 'Same-Day Delivery',
      ES: 'Entrega el mismo día',
      RU: 'Доставка в тот же день',
      UA: 'Доставка в той самий день',
      CZ: 'Doručení ve stejný den',
      DE: 'Lieferung am selben Tag',
      IT: 'Consegna in giornata',
      FR: 'Livraison le jour même',
      AR: 'توصيل بنفس اليوم',
      PL: 'Dostawa tego samego dnia',
    },
    'Heavy Transport': {
      EN: 'Heavy Transport',
      ES: 'Transporte pesado',
      RU: 'Тяжёлые перевозки',
      UA: 'Важкі перевезення',
      CZ: 'Těžká doprava',
      DE: 'Schwertransport',
      IT: 'Trasporto pesante',
      FR: 'Transport lourd',
      AR: 'نقل ثقيل',
      PL: 'Transport ciężki',
    },
    'Personal Training': {
      EN: 'Personal Training',
      ES: 'Entrenamiento personal',
      RU: 'Персональные тренировки',
      UA: 'Персональні тренування',
      CZ: 'Osobní trénink',
      DE: 'Personal Training',
      IT: 'Allenamento personale',
      FR: 'Coaching personnel',
      AR: 'تدريب شخصي',
      PL: 'Trening personalny',
    },
    Yoga: {
      EN: 'Yoga',
      ES: 'Yoga',
      RU: 'Йога',
      UA: 'Йога',
      CZ: 'Jóga',
      DE: 'Yoga',
      IT: 'Yoga',
      FR: 'Yoga',
      AR: 'يوغا',
      PL: 'Joga',
    },
    Pilates: {
      EN: 'Pilates',
      ES: 'Pilates',
      RU: 'Пилатес',
      UA: 'Пілатес',
      CZ: 'Pilates',
      DE: 'Pilates',
      IT: 'Pilates',
      FR: 'Pilates',
      AR: 'بيلاتس',
      PL: 'Pilates',
    },
    Stretching: {
      EN: 'Stretching',
      ES: 'Estiramientos',
      RU: 'Растяжка',
      UA: 'Розтяжка',
      CZ: 'Protahování',
      DE: 'Stretching',
      IT: 'Stretching',
      FR: 'Étirements',
      AR: 'تمدد',
      PL: 'Stretching',
    },
    'Dance Fitness': {
      EN: 'Dance Fitness',
      ES: 'Fitness de baile',
      RU: 'Танцевальный фитнес',
      UA: 'Танцювальний фітнес',
      CZ: 'Taneční fitness',
      DE: 'Dance Fitness',
      IT: 'Dance fitness',
      FR: 'Fitness danse',
      AR: 'لياقة رقص',
      PL: 'Fitness taneczny',
    },
    'Outdoor Training': {
      EN: 'Outdoor Training',
      ES: 'Entrenamiento al aire libre',
      RU: 'Тренировки на улице',
      UA: 'Тренування на вулиці',
      CZ: 'Venkovní trénink',
      DE: 'Outdoor-Training',
      IT: 'Allenamento outdoor',
      FR: 'Entraînement extérieur',
      AR: 'تدريب خارجي',
      PL: 'Trening outdoor',
    },
    Languages: {
      EN: 'Languages',
      ES: 'Idiomas',
      RU: 'Языки',
      UA: 'Мови',
      CZ: 'Jazyky',
      DE: 'Sprachen',
      IT: 'Lingue',
      FR: 'Langues',
      AR: 'لغات',
      PL: 'Języki',
    },
    Tutoring: {
      EN: 'Tutoring',
      ES: 'Tutoría',
      RU: 'Репетиторство',
      UA: 'Репетиторство',
      CZ: 'Doučování',
      DE: 'Nachhilfe',
      IT: 'Tutoraggio',
      FR: 'Tutorat',
      AR: 'دروس خصوصية',
      PL: 'Korepetycje',
    },
    'Music Lessons': {
      EN: 'Music Lessons',
      ES: 'Clases de música',
      RU: 'Уроки музыки',
      UA: 'Уроки музики',
      CZ: 'Hudební lekce',
      DE: 'Musikunterricht',
      IT: 'Lezioni di musica',
      FR: 'Cours de musique',
      AR: 'دروس موسيقى',
      PL: 'Lekcje muzyki',
    },
    'Kids Learning': {
      EN: 'Kids Learning',
      ES: 'Aprendizaje infantil',
      RU: 'Обучение детей',
      UA: 'Навчання дітей',
      CZ: 'Dětské vzdělávání',
      DE: 'Kinderlernen',
      IT: 'Apprendimento bambini',
      FR: 'Apprentissage enfants',
      AR: 'تعليم الأطفال',
      PL: 'Nauka dzieci',
    },
    'Exam Prep': {
      EN: 'Exam Prep',
      ES: 'Preparación de exámenes',
      RU: 'Подготовка к экзаменам',
      UA: 'Підготовка до іспитів',
      CZ: 'Příprava na zkoušky',
      DE: 'Prüfungsvorbereitung',
      IT: 'Preparazione esami',
      FR: 'Préparation examens',
      AR: 'تحضير للامتحانات',
      PL: 'Przygotowanie do egzaminów',
    },
    'Skill Coaching': {
      EN: 'Skill Coaching',
      ES: 'Coaching de habilidades',
      RU: 'Развитие навыков',
      UA: 'Розвиток навичок',
      CZ: 'Koučink dovedností',
      DE: 'Kompetenz-Coaching',
      IT: 'Coaching competenze',
      FR: 'Coaching compétences',
      AR: 'تدريب مهارات',
      PL: 'Coaching umiejętności',
    },
    Photography: {
      EN: 'Photography',
      ES: 'Fotografía',
      RU: 'Фотография',
      UA: 'Фотографія',
      CZ: 'Fotografie',
      DE: 'Fotografie',
      IT: 'Fotografia',
      FR: 'Photographie',
      AR: 'تصوير',
      PL: 'Fotografia',
    },
    Videography: {
      EN: 'Videography',
      ES: 'Videografía',
      RU: 'Видеосъёмка',
      UA: 'Відеозйомка',
      CZ: 'Videografie',
      DE: 'Videografie',
      IT: 'Videografia',
      FR: 'Vidéographie',
      AR: 'تصوير فيديو',
      PL: 'Wideografia',
    },
    Decor: {
      EN: 'Decor',
      ES: 'Decoración',
      RU: 'Декор',
      UA: 'Декор',
      CZ: 'Dekorace',
      DE: 'Dekor',
      IT: 'Decor',
      FR: 'Décor',
      AR: 'ديكور',
      PL: 'Dekoracje',
    },
    'DJ & Music': {
      EN: 'DJ & Music',
      ES: 'DJ y música',
      RU: 'DJ и музыка',
      UA: 'DJ та музика',
      CZ: 'DJ a hudba',
      DE: 'DJ & Musik',
      IT: 'DJ e musica',
      FR: 'DJ et musique',
      AR: 'دي جي وموسيقى',
      PL: 'DJ i muzyka',
    },
    'Event Makeup': {
      EN: 'Event Makeup',
      ES: 'Maquillaje para eventos',
      RU: 'Макияж на событие',
      UA: 'Макіяж на подію',
      CZ: 'Make-up na akce',
      DE: 'Event-Make-up',
      IT: 'Make-up eventi',
      FR: 'Maquillage événement',
      AR: 'مكياج للمناسبات',
      PL: 'Makijaż eventowy',
    },
    'Catering Help': {
      EN: 'Catering Help',
      ES: 'Ayuda de catering',
      RU: 'Помощь с кейтерингом',
      UA: 'Допомога з кейтерингом',
      CZ: 'Pomoc s cateringem',
      DE: 'Catering-Hilfe',
      IT: 'Aiuto catering',
      FR: 'Aide traiteur',
      AR: 'مساعدة الضيافة',
      PL: 'Pomoc cateringowa',
    },
    Tours: {
      EN: 'Tours',
      ES: 'Tours',
      RU: 'Туры',
      UA: 'Тури',
      CZ: 'Prohlídky',
      DE: 'Touren',
      IT: 'Tour',
      FR: 'Tours',
      AR: 'جولات',
      PL: 'Wycieczki',
    },
    Workshops: {
      EN: 'Workshops',
      ES: 'Talleres',
      RU: 'Мастер-классы',
      UA: 'Майстер-класи',
      CZ: 'Workshopy',
      DE: 'Workshops',
      IT: 'Workshop',
      FR: 'Ateliers',
      AR: 'ورش عمل',
      PL: 'Warsztaty',
    },
    'Kids Activities': {
      EN: 'Kids Activities',
      ES: 'Actividades para niños',
      RU: 'Детские активности',
      UA: 'Дитячі активності',
      CZ: 'Dětské aktivity',
      DE: 'Kinderaktivitäten',
      IT: 'Attività per bambini',
      FR: 'Activités enfants',
      AR: 'أنشطة للأطفال',
      PL: 'Aktywności dla dzieci',
    },
    'Art Classes': {
      EN: 'Art Classes',
      ES: 'Clases de arte',
      RU: 'Уроки искусства',
      UA: 'Уроки мистецтва',
      CZ: 'Kurzy umění',
      DE: 'Kunstkurse',
      IT: 'Lezioni d’arte',
      FR: 'Cours d’art',
      AR: 'دروس فن',
      PL: 'Lekcje sztuki',
    },
    'Dance Classes': {
      EN: 'Dance Classes',
      ES: 'Clases de baile',
      RU: 'Танцевальные занятия',
      UA: 'Танцювальні заняття',
      CZ: 'Taneční lekce',
      DE: 'Tanzkurse',
      IT: 'Lezioni di danza',
      FR: 'Cours de danse',
      AR: 'دروس رقص',
      PL: 'Lekcje tańca',
    },
    'Outdoor Activities': {
      EN: 'Outdoor Activities',
      ES: 'Actividades al aire libre',
      RU: 'Активности на улице',
      UA: 'Активності на вулиці',
      CZ: 'Venkovní aktivity',
      DE: 'Outdoor-Aktivitäten',
      IT: 'Attività outdoor',
      FR: 'Activités extérieures',
      AR: 'أنشطة خارجية',
      PL: 'Aktywności outdoor',
    },
    'Graphic Design': {
      EN: 'Graphic Design',
      ES: 'Diseño gráfico',
      RU: 'Графический дизайн',
      UA: 'Графічний дизайн',
      CZ: 'Grafický design',
      DE: 'Grafikdesign',
      IT: 'Graphic design',
      FR: 'Design graphique',
      AR: 'تصميم جرافيك',
      PL: 'Projektowanie graficzne',
    },
    'Content Creation': {
      EN: 'Content Creation',
      ES: 'Creación de contenido',
      RU: 'Создание контента',
      UA: 'Створення контенту',
      CZ: 'Tvorba obsahu',
      DE: 'Content-Erstellung',
      IT: 'Creazione contenuti',
      FR: 'Création de contenu',
      AR: 'إنشاء محتوى',
      PL: 'Tworzenie treści',
    },
    'Photo Editing': {
      EN: 'Photo Editing',
      ES: 'Edición de fotos',
      RU: 'Обработка фото',
      UA: 'Обробка фото',
      CZ: 'Úprava fotografií',
      DE: 'Fotobearbeitung',
      IT: 'Editing foto',
      FR: 'Retouche photo',
      AR: 'تحرير الصور',
      PL: 'Edycja zdjęć',
    },
    'Video Editing': {
      EN: 'Video Editing',
      ES: 'Edición de video',
      RU: 'Монтаж видео',
      UA: 'Монтаж відео',
      CZ: 'Úprava videa',
      DE: 'Videobearbeitung',
      IT: 'Editing video',
      FR: 'Montage vidéo',
      AR: 'تحرير الفيديو',
      PL: 'Montaż wideo',
    },
    Branding: {
      EN: 'Branding',
      ES: 'Branding',
      RU: 'Брендинг',
      UA: 'Брендинг',
      CZ: 'Branding',
      DE: 'Branding',
      IT: 'Branding',
      FR: 'Branding',
      AR: 'هوية العلامة',
      PL: 'Branding',
    },
    'Social Media Help': {
      EN: 'Social Media Help',
      ES: 'Ayuda redes sociales',
      RU: 'Помощь с соцсетями',
      UA: 'Допомога з соцмережами',
      CZ: 'Pomoc se sociálními sítěmi',
      DE: 'Hilfe mit Social Media',
      IT: 'Aiuto social media',
      FR: 'Aide réseaux sociaux',
      AR: 'مساعدة السوشيال ميديا',
      PL: 'Pomoc z social media',
    },
    Other: {
      EN: 'Other',
      ES: 'Otro',
      RU: 'Другое',
      UA: 'Інше',
      CZ: 'Jiné',
      DE: 'Andere',
      IT: 'Altro',
      FR: 'Autre',
      AR: 'أخرى',
      PL: 'Inne',
    },
  };

  return dict[value]?.[language] || value;
}

export default function NewPromotionPage() {
  const router = useRouter();

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const galleryVideoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement | null>(null);
  const filesVideoInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeMode, setBadgeMode] = useState<BadgeMode>('none');
  const [badgeDiscountValue, setBadgeDiscountValue] = useState('20');
  const [days, setDays] = useState(10);
  const [radius, setRadius] = useState<RadiusOption['id']>('10');
  const [layout, setLayout] = useState<PhotoLayout>('single');
  const [showPhotoSourceMenu, setShowPhotoSourceMenu] = useState(false);
  const [showVideoSourceMenu, setShowVideoSourceMenu] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [miniVideo, setMiniVideo] = useState<VideoItem | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [editorPhotoId, setEditorPhotoId] = useState<string | null>(null);
  const [editorScale, setEditorScale] = useState(1);
  const [editorOffsetX, setEditorOffsetX] = useState(0);
  const [editorOffsetY, setEditorOffsetY] = useState(0);

  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  useEffect(() => {
    setLanguage(getSavedLanguage());
    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.preview) URL.revokeObjectURL(photo.preview);
      });
      if (miniVideo?.preview) URL.revokeObjectURL(miniVideo.preview);
    };
  }, [photos, miniVideo]);

  const text = textByLanguage[language] || textByLanguage.EN;
  const radiusOptions = radiusOptionsByLanguage[language] || radiusOptionsByLanguage.EN;
  const paymentMethods = paymentMethodsByLanguage[language] || paymentMethodsByLanguage.EN;

  const selectedRadius = radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const localizedCategories = useMemo(() => {
    return categories.map((item) => ({
      ...item,
      localizedLabel: translateCategoryLabel(item.id, language, item.label),
      localizedShortLabel: translateCategoryLabel(
        item.id,
        language,
        item.shortLabel || item.label
      ),
      localizedSubcategories: item.subcategories.map((sub) => ({
        value: sub,
        label: translateSubcategory(sub, language),
      })),
    }));
  }, [language]);

  const currentCategory =
    localizedCategories.find((item) => item.id === categoryId) || null;

  const subcategoryOptions = currentCategory?.localizedSubcategories || [];

  const totalPrice = useMemo(
    () => Number((selectedRadius.pricePerDay * days).toFixed(2)),
    [selectedRadius.pricePerDay, days]
  );

  const editorPhoto = useMemo(
    () => photos.find((photo) => photo.id === editorPhotoId) || null,
    [photos, editorPhotoId]
  );

  const selectedPaymentMethod =
    paymentMethods.find((item) => item.id === selectedPayment) || paymentMethods[0];

  const previewBadge = getBadgeLabel(badgeMode, badgeDiscountValue, text);

  const openEditor = (photoId: string) => {
    const current = photos.find((photo) => photo.id === photoId);
    if (!current) return;
    setEditorPhotoId(photoId);
    setEditorScale(getSafeScale(current.scale));
    setEditorOffsetX(current.offsetX || 0);
    setEditorOffsetY(current.offsetY || 0);
  };

  const closeEditor = () => {
    dragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };
    setEditorPhotoId(null);
  };

  const applyEditor = () => {
    if (!editorPhotoId) return;
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === editorPhotoId
          ? {
              ...photo,
              scale: getSafeScale(editorScale),
              offsetX: editorOffsetX,
              offsetY: editorOffsetY,
            }
          : photo
      )
    );
    closeEditor();
  };

  const resetEditor = () => {
    setEditorScale(1);
    setEditorOffsetX(0);
    setEditorOffsetY(0);
  };

  const handleEditorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: editorOffsetX,
      startOffsetY: editorOffsetY,
    };
  };

  const handleEditorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setEditorOffsetX(dragRef.current.startOffsetX + deltaX);
    setEditorOffsetY(dragRef.current.startOffsetY + deltaY);
  };

  const handleEditorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.pointerId = null;
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (miniVideo) {
      alert(text.removeVideoFirst);
      event.target.value = '';
      return;
    }

    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 9 - photos.length);
    const selected = files.slice(0, remainingSlots);

    const nextPhotos: PhotoItem[] = selected.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      preview: URL.createObjectURL(file),
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }));

    setPhotos((prev) => [...prev, ...nextPhotos]);
    event.target.value = '';
    setShowPhotoSourceMenu(false);
  };

  const handleVideoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (photos.length > 0) {
      alert(text.removePhotosFirst);
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(text.invalidVideo);
      event.target.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = preview;

    video.onloadedmetadata = () => {
      if (video.duration > MAX_VIDEO_SECONDS) {
        URL.revokeObjectURL(preview);
        alert(text.videoTooLong);
        event.target.value = '';
        return;
      }

      if (miniVideo?.preview) {
        URL.revokeObjectURL(miniVideo.preview);
      }

      setMiniVideo({
        name: file.name,
        preview,
      });

      setShowVideoSourceMenu(false);
      event.target.value = '';
    };

    video.onerror = () => {
      URL.revokeObjectURL(preview);
      alert(text.invalidVideo);
      event.target.value = '';
    };
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((photo) => photo.id === id);
      if (found?.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((photo) => photo.id !== id);
    });

    if (editorPhotoId === id) {
      closeEditor();
    }
  };

  const handleRemoveVideo = () => {
    if (miniVideo?.preview) {
      URL.revokeObjectURL(miniVideo.preview);
    }
    setMiniVideo(null);
  };

  const handleContinueToPayment = () => {
    if (!categoryId) {
      alert(text.enterCategory);
      return;
    }
    if (!subcategory) {
      alert(text.enterSubcategory);
      return;
    }
    if (!title.trim()) {
      alert(text.enterTitle);
      return;
    }
    if (!description.trim()) {
      alert(text.enterDescription);
      return;
    }
    if (photos.length === 0 && !miniVideo) {
      alert(text.addPhotoAlert);
      return;
    }

    setShowPaymentSheet(true);
  };

  const handleConfirmPayment = () => {
    setShowPaymentSheet(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push('/profile/payments');
    }, 700);
  };

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f4ee',
          padding: '20px 16px 120px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr',
              gap: 14,
              alignItems: 'start',
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 28,
                fontWeight: 900,
                color: '#17130f',
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                {text.pageTitle}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: '#6f675f',
                  fontWeight: 700,
                }}
              >
                {text.pageSubtitle}
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.photo} <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#7b7268',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {text.photoHint}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.layout}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setLayout('single')}
                style={{
                  minHeight: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: layout === 'single' ? '#17130f' : '#fff',
                  color: layout === 'single' ? '#fff' : '#17130f',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.layoutSingle}
              </button>

              <button
                type="button"
                onClick={() => setLayout('grid')}
                style={{
                  minHeight: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: layout === 'grid' ? '#17130f' : '#fff',
                  color: layout === 'grid' ? '#fff' : '#17130f',
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.layoutGrid}
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />
            <input
              ref={filesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => setShowPhotoSourceMenu(true)}
              style={{
                width: '100%',
                minHeight: 92,
                borderRadius: 22,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                gap: 14,
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  border: '2px solid #c69212',
                  background: '#fff7d6',
                  color: '#c69212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  fontWeight: 700,
                }}
              >
                +
              </div>

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.addPhoto}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  JPG / PNG / WEBP · max 9
                </div>
              </div>
            </button>

            {photos.length > 0 ? (
              <>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.photoAdded}: {photos.length}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: layout === 'single' ? '1fr' : '1fr 2fr',
                    gap: 10,
                  }}
                >
                  {(layout === 'single' ? [photos[0]] : photos).map((photo) => {
                    if (!photo) return null;

                    return (
                      <div
                        key={photo.id}
                        style={{
                          borderRadius: 22,
                          border: '1.5px solid #111111',
                          overflow: 'hidden',
                          background: '#fff',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: layout === 'single' ? 220 : 150,
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#f4f1ea',
                          }}
                        >
                          <img
                            src={photo.preview}
                            alt={photo.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transform: `translate(${photo.offsetX}px, ${photo.offsetY}px) scale(${photo.scale})`,
                              transformOrigin: 'center center',
                            }}
                          />
                        </div>

                        <div
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            display: 'flex',
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => openEditor(photo.id)}
                            style={{
                              minWidth: 34,
                              height: 34,
                              borderRadius: 999,
                              border: '1.5px solid #111111',
                              background: '#ffffff',
                              color: '#17130f',
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: 'pointer',
                              padding: '0 10px',
                            }}
                          >
                            ↔
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            style={{
                              minWidth: 34,
                              height: 34,
                              borderRadius: 999,
                              border: '1.5px solid #111111',
                              background: '#ffffff',
                              color: '#17130f',
                              fontSize: 18,
                              fontWeight: 900,
                              cursor: 'pointer',
                              padding: '0 10px',
                            }}
                          >
                            ×
                          </button>
                        </div>

                        <div
                          style={{
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              color: '#7b7268',
                              fontWeight: 700,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {photo.name}
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditor(photo.id)}
                            style={{
                              height: 34,
                              borderRadius: 12,
                              border: '1.5px solid #111111',
                              background: '#fff',
                              color: '#17130f',
                              padding: '0 10px',
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            {text.adjustPhoto}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.miniVideo}
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#7b7268',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {text.miniVideoHint}
            </div>

            <input
              ref={galleryVideoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelected}
              style={{ display: 'none' }}
            />
            <input
              ref={cameraVideoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleVideoSelected}
              style={{ display: 'none' }}
            />
            <input
              ref={filesVideoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelected}
              style={{ display: 'none' }}
            />

            {!miniVideo ? (
              <button
                type="button"
                onClick={() => setShowVideoSourceMenu(true)}
                style={{
                  width: '100%',
                  minHeight: 92,
                  borderRadius: 22,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  padding: 14,
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: 14,
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 22,
                    border: '2px solid #2f7cf6',
                    background: '#edf4ff',
                    color: '#2f7cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  ▶
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {text.addMiniVideo}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: '#7b7268',
                      fontWeight: 700,
                    }}
                  >
                    MP4 / MOV / WEBM · max 5 sec
                  </div>
                </div>
              </button>
            ) : (
              <div
                style={{
                  borderRadius: 22,
                  border: '1.5px solid #111111',
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <video
                  src={miniVideo.preview}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    display: 'block',
                    background: '#000',
                  }}
                />

                <div
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: '#17130f',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {text.miniVideoAdded}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: '#7b7268',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {miniVideo.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => setShowVideoSourceMenu(true)}
                      style={{
                        height: 40,
                        borderRadius: 14,
                        border: '1.5px solid #111111',
                        background: '#ffffff',
                        color: '#17130f',
                        padding: '0 14px',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.replaceMiniVideo}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      style={{
                        height: 40,
                        borderRadius: 14,
                        border: '1.5px solid #111111',
                        background: '#ffffff',
                        color: '#17130f',
                        padding: '0 14px',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.removeMiniVideo}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    marginBottom: 12,
                  }}
                >
                  {text.category} <span style={{ color: '#ef4444' }}>*</span>
                </div>

                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategory('');
                  }}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#fff',
                    padding: '0 14px',
                    fontSize: 16,
                    color: '#17130f',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 800,
                  }}
                >
                  <option value="">{text.chooseCategory}</option>
                  {localizedCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.localizedLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    marginBottom: 12,
                  }}
                >
                  {text.subcategory} <span style={{ color: '#ef4444' }}>*</span>
                </div>

                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!categoryId}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#fff',
                    padding: '0 14px',
                    fontSize: 16,
                    color: '#17130f',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 800,
                    opacity: categoryId ? 1 : 0.6,
                  }}
                >
                  <option value="">{text.chooseSubcategory}</option>
                  {subcategoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.title} <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={text.titlePlaceholder}
              style={{
                width: '100%',
                height: 58,
                borderRadius: 18,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '0 16px',
                fontSize: 16,
                color: '#17130f',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.description} <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.descriptionPlaceholder}
              rows={4}
              style={{
                width: '100%',
                borderRadius: 18,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '14px 16px',
                fontSize: 16,
                color: '#17130f',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'Arial, sans-serif',
              }}
            />

            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 12,
              }}
            >
              {text.badgeText}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {([
                ['none', text.badgeNone],
                ['discount', text.badgeDiscount],
                ['top', text.badgeTop],
                ['new', text.badgeNew],
              ] as [BadgeMode, string][]).map(([mode, label]) => {
                const active = badgeMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBadgeMode(mode)}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#fff',
                      color: active ? '#fff' : '#17130f',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {badgeMode === 'discount' ? (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#17130f',
                    marginBottom: 8,
                  }}
                >
                  {text.discountValue}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 42px',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <input
                    value={badgeDiscountValue}
                    onChange={(e) =>
                      setBadgeDiscountValue(e.target.value.replace(/[^\d]/g, ''))
                    }
                    placeholder={text.discountValuePlaceholder}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 16,
                      border: '1.5px solid #111111',
                      background: '#fff',
                      padding: '0 14px',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#17130f',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    %
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.visibility}
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#7b7268',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {text.visibilityHint}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {radiusOptions.map((option) => {
                const active = radius === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRadius(option.id)}
                    style={{
                      width: '100%',
                      borderRadius: 22,
                      border: '2px solid #111111',
                      background: active ? option.bg : '#fff',
                      padding: '14px 16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 12,
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#17130f',
                        }}
                      >
                        {text.radius} {option.label}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 14,
                          color: '#7b7268',
                          fontWeight: 700,
                        }}
                      >
                        £{option.pricePerDay} {text.perDay}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 999,
                        border: '1.5px solid #111111',
                        background: option.bg,
                        color: option.color,
                        padding: '8px 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {option.label}
                    </div>

                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: active ? option.color : '#fff',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    marginBottom: 12,
                  }}
                >
                  {text.duration}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: '#7b7268',
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {text.durationHint}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    marginBottom: 12,
                  }}
                >
                  {text.days}
                </div>

                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#fff',
                    padding: '0 12px',
                    fontSize: 16,
                    color: '#17130f',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 900,
                  }}
                >
                  {Array.from({ length: 21 }, (_, index) => index + 10).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 30,
              border: '2px solid #111111',
              background: '#fff',
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 14,
              }}
            >
              {text.livePreview}
            </div>

            <div
              style={{
                borderRadius: 26,
                border: '2px solid #111111',
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 320,
                  background: '#ebe6da',
                }}
              >
                {miniVideo ? (
                  <video
                    src={miniVideo.preview}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : photos[0] ? (
                  <img
                    src={photos[0].preview}
                    alt={photos[0].name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: `translate(${photos[0].offsetX}px, ${photos[0].offsetY}px) scale(${photos[0].scale})`,
                      transformOrigin: 'center center',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8a8177',
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    Preview
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      height: 42,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#ffe44d',
                      color: '#17130f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 16px',
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    {text.sponsored}
                  </div>

                  {previewBadge ? (
                    <div
                      style={{
                        height: 42,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: '#fff',
                        color: '#17130f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 16px',
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {previewBadge}
                    </div>
                  ) : null}
                </div>

                {miniVideo ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: 'rgba(255,255,255,0.92)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    ▶
                  </div>
                ) : null}
              </div>

              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {title || 'Your ad title'}
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#fff7d6',
                      color: '#c69212',
                      padding: '8px 14px',
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    {selectedRadius.label}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: '#6f675f',
                    fontWeight: 700,
                  }}
                >
                  {description || 'Your ad description will appear here'}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#fff',
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {days} {text.days}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#fff',
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    £{totalPrice}
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: 16,
                    width: '100%',
                    height: 56,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#17130f',
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: 'default',
                  }}
                >
                  {text.openAd}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 24,
              border: '2px solid #111111',
              background: selectedRadius.bg,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.summary}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 6,
                fontSize: 15,
                fontWeight: 800,
                color: '#17130f',
              }}
            >
              <div>{text.category}: {currentCategory?.localizedLabel || '—'}</div>
              <div>
                {text.subcategory}:{' '}
                {subcategoryOptions.find((item) => item.value === subcategory)?.label || '—'}
              </div>
              <div>{text.radius}: {selectedRadius.label}</div>
              <div>{text.duration}: {days}</div>
              <div>£{selectedRadius.pricePerDay} / {text.perDay}</div>
              <div>{text.photosCount}: {photos.length}</div>
              <div>{text.miniVideo}: {miniVideo ? '1' : '0'}</div>
              <div>
                {text.badgeText}: {previewBadge || text.badgeNone}
              </div>
              <div
                style={{
                  color: selectedRadius.color,
                  fontSize: 18,
                }}
              >
                {text.total}: £{totalPrice}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                borderRadius: 16,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '12px 14px',
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.45,
                color: '#17130f',
              }}
            >
              {text.paymentHint}
              <div style={{ marginTop: 6, color: '#2f7cf6' }}>{text.firstAdBonus}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueToPayment}
            style={{
              marginTop: 16,
              width: '100%',
              height: 60,
              borderRadius: 22,
              border: '2px solid #111111',
              background: '#ffe44d',
              color: '#17130f',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 0 rgba(17,17,17,0.08)',
            }}
          >
            {text.continueToPayment} · £{totalPrice}
          </button>

          {isSuccess ? (
            <div
              style={{
                marginTop: 16,
                borderRadius: 22,
                border: '2px solid #111111',
                background: '#edf4ff',
                color: '#2f7cf6',
                padding: '14px 16px',
                fontSize: 18,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {text.done}
            </div>
          ) : null}
        </div>
      </main>

      {showPhotoSourceMenu ? (
        <div
          onClick={() => setShowPhotoSourceMenu(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,20,20,0.18)',
            zIndex: 120,
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
              padding: '0 14px calc(24px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                border: '2px solid #111111',
                borderRadius: 26,
                background: '#ffffff',
                boxShadow: '0 18px 34px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 16px 10px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.photoSource}
              </div>

              <div style={{ display: 'grid', gap: 10, padding: '0 14px 14px' }}>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  🖼 {text.gallery}
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  📷 {text.camera}
                </button>

                <button
                  type="button"
                  onClick={() => filesInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  📁 {text.files}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoSourceMenu(false)}
                style={{
                  width: '100%',
                  height: 54,
                  border: 'none',
                  borderTop: '2px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✕ {text.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showVideoSourceMenu ? (
        <div
          onClick={() => setShowVideoSourceMenu(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,20,20,0.18)',
            zIndex: 130,
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
              padding: '0 14px calc(24px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                border: '2px solid #111111',
                borderRadius: 26,
                background: '#ffffff',
                boxShadow: '0 18px 34px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 16px 10px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.miniVideo}
              </div>

              <div style={{ display: 'grid', gap: 10, padding: '0 14px 14px' }}>
                <button
                  type="button"
                  onClick={() => galleryVideoInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  🖼 {text.gallery}
                </button>

                <button
                  type="button"
                  onClick={() => cameraVideoInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  📷 {text.camera}
                </button>

                <button
                  type="button"
                  onClick={() => filesVideoInputRef.current?.click()}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  📁 {text.files}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowVideoSourceMenu(false)}
                style={{
                  width: '100%',
                  height: 54,
                  border: 'none',
                  borderTop: '2px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✕ {text.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPaymentSheet ? (
        <div
          onClick={() => setShowPaymentSheet(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.38)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              borderRadius: 28,
              border: '2px solid #111111',
              background: '#ffffff',
              padding: 18,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                textAlign: 'center',
              }}
            >
              {text.choosePaymentMethod}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.45,
                color: '#7b7268',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {text.paymentMethodsHint}
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gap: 10,
              }}
            >
              {paymentMethods.map((method) => {
                const active = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    style={{
                      width: '100%',
                      minHeight: 72,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: active ? '#f8f7f3' : '#fff',
                      padding: '12px 14px',
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr 26px',
                      gap: 14,
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        border: '2px solid #111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 900,
                        background: '#fff',
                        color: '#17130f',
                      }}
                    >
                      {method.icon}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#17130f',
                        }}
                      >
                        {method.title}
                      </div>

                      <div
                        style={{
                          marginTop: 2,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#7b7268',
                        }}
                      >
                        {method.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: active ? '#17130f' : '#fff',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {active ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 16,
                border: '1.5px solid #111111',
                background: '#fff',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#7b7268',
                  }}
                >
                  {text.selectedPaymentMethod}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {selectedPaymentMethod?.title}
                </div>
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                £{totalPrice}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setShowPaymentSheet(false)}
                style={{
                  height: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#fff',
                  color: '#17130f',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.cancel}
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                style={{
                  height: 54,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#17130f',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.confirmPayment} · £{totalPrice}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editorPhoto ? (
        <div
          onClick={closeEditor}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,17,17,0.42)',
            zIndex: 300,
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
              padding: '0 14px calc(20px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                border: '2px solid #111111',
                borderRadius: 26,
                background: '#ffffff',
                boxShadow: '0 18px 34px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 16px 8px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.adjustPhoto}
              </div>

              <div
                style={{
                  padding: '0 16px 14px',
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.photoEditorHint}
              </div>

              <div style={{ padding: '0 16px 14px' }}>
                <div
                  onPointerDown={handleEditorPointerDown}
                  onPointerMove={handleEditorPointerMove}
                  onPointerUp={handleEditorPointerUp}
                  onPointerCancel={handleEditorPointerUp}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 22,
                    border: '2px solid #111111',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f4f1ea',
                    touchAction: 'none',
                  }}
                >
                  <img
                    src={editorPhoto.preview}
                    alt={editorPhoto.name}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      userSelect: 'none',
                      transform: `translate(${editorOffsetX}px, ${editorOffsetY}px) scale(${editorScale})`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <input
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={0.01}
                    value={editorScale}
                    onChange={(e) => setEditorScale(getSafeScale(Number(e.target.value)))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 10,
                  padding: '0 16px 16px',
                }}
              >
                <button
                  type="button"
                  onClick={resetEditor}
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.resetPhoto}
                </button>

                <button
                  type="button"
                  onClick={closeEditor}
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: '2px solid #111111',
                    background: '#fff',
                    color: '#17130f',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.cancel}
                </button>

                <button
                  type="button"
                  onClick={applyEditor}
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: '2px solid #111111',
                    background: '#17130f',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {text.applyPhoto}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
