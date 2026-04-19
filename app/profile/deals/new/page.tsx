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
import PaymentMethodSheet, {
  type PaymentSheetMethod,
} from '../../../../components/payments/PaymentMethodSheet';

type DealTexts = {
  pageTitle: string;
  pageSubtitle: string;
  category: string;
  subcategory: string;
  chooseCategory: string;
  chooseSubcategory: string;
  discountTitle: string;
  discountTitlePlaceholder: string;
  discountPercent: string;
  onlyToday: string;
  description: string;
  descriptionPlaceholder: string;
  chooseDays: string;
  photo: string;
  photoHint: string;
  addPhoto: string;
  replacePhoto: string;
  photoAdded: string;
  photoSource: string;
  gallery: string;
  camera: string;
  files: string;
  totalToPay: string;
  choosePaymentMethod: string;
  paymentMethodsHint: string;
  selected: string;
  cancel: string;
  pay: string;
  done: string;
  ok: string;
  publishDay1: string;
  publishDays: string;
  day: string;
  day2to4: string;
  days: string;
  forPrice: string;
  enterCategory: string;
  enterSubcategory: string;
  enterDiscountTitle: string;
  enterDiscountPercent: string;
  enterDescription: string;
  addPhotoAlert: string;
  close: string;
  paymentHint: string;
  summary: string;
  adjustPhoto: string;
  photoEditorHint: string;
  resetPhoto: string;
  applyPhoto: string;
};

type DealPhotoState = {
  name: string;
  preview: string;
  scale: number;
  offsetX: number;
  offsetY: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

const textByLanguage: Record<AppLanguage, DealTexts> = {
  EN: {
    pageTitle: 'Add day deal',
    pageSubtitle: 'Create a special offer for today or several days.',
    category: 'Category',
    subcategory: 'Subcategory',
    chooseCategory: 'Choose category',
    chooseSubcategory: 'Choose subcategory',
    discountTitle: 'Deal title',
    discountTitlePlaceholder: 'Enter deal title',
    discountPercent: 'Discount size',
    onlyToday: 'Limited time offer',
    description: 'Description',
    descriptionPlaceholder: 'Enter description...',
    chooseDays: 'Choose number of days',
    photo: 'Photo',
    photoHint: 'Add 1 photo for the day deal.',
    addPhoto: 'Add photo',
    replacePhoto: 'Replace',
    photoAdded: 'Photo added',
    photoSource: 'Photo source',
    gallery: 'Gallery',
    camera: 'Camera',
    files: 'Files',
    totalToPay: 'Total to pay',
    choosePaymentMethod: 'Choose payment method',
    paymentMethodsHint: 'Select how you want to pay',
    selected: 'Selected',
    cancel: 'Cancel',
    pay: 'Pay',
    done: 'Done',
    ok: 'OK',
    publishDay1: 'Publish deal for 1 day',
    publishDays: 'Publish deal for {days} days',
    day: 'day',
    day2to4: 'days',
    days: 'days',
    forPrice: 'for',
    enterCategory: 'Choose category',
    enterSubcategory: 'Choose subcategory',
    enterDiscountTitle: 'Enter deal title',
    enterDiscountPercent: 'Enter discount size',
    enterDescription: 'Enter description',
    addPhotoAlert: 'Add photo',
    close: 'Close',
    paymentHint: 'The day deal is published only after payment.',
    summary: 'Day deal summary',
    adjustPhoto: 'Adjust photo',
    photoEditorHint: 'Move with one finger. Zoom with slider.',
    resetPhoto: 'Reset',
    applyPhoto: 'Apply',
  },
  RU: {
    pageTitle: 'Добавить скидку дня',
    pageSubtitle: 'Создайте специальное предложение на сегодня или на несколько дней.',
    category: 'Категория',
    subcategory: 'Подкатегория',
    chooseCategory: 'Выберите категорию',
    chooseSubcategory: 'Выберите подкатегорию',
    discountTitle: 'Название скидки',
    discountTitlePlaceholder: 'Введите название скидки',
    discountPercent: 'Размер скидки',
    onlyToday: 'Ограниченное предложение',
    description: 'Описание',
    descriptionPlaceholder: 'Введите описание...',
    chooseDays: 'Выбрать количество дней',
    photo: 'Фото',
    photoHint: 'Добавьте 1 фото для скидки дня.',
    addPhoto: 'Добавить фото',
    replacePhoto: 'Заменить',
    photoAdded: 'Фото добавлено',
    photoSource: 'Источник фото',
    gallery: 'Галерея',
    camera: 'Камера',
    files: 'Файлы',
    totalToPay: 'Итого к оплате',
    choosePaymentMethod: 'Выберите способ оплаты',
    paymentMethodsHint: 'Выберите, как хотите оплатить',
    selected: 'Выбрано',
    cancel: 'Отмена',
    pay: 'Оплатить',
    done: 'Готово',
    ok: 'OK',
    publishDay1: 'Опубликовать скидку на 1 день',
    publishDays: 'Опубликовать скидку на {days} дней',
    day: 'день',
    day2to4: 'дня',
    days: 'дней',
    forPrice: 'за',
    enterCategory: 'Выберите категорию',
    enterSubcategory: 'Выберите подкатегорию',
    enterDiscountTitle: 'Введите название скидки',
    enterDiscountPercent: 'Введите размер скидки',
    enterDescription: 'Введите описание',
    addPhotoAlert: 'Добавьте фото',
    close: 'Закрыть',
    paymentHint: 'Скидка дня публикуется только после оплаты.',
    summary: 'Итог скидки дня',
    adjustPhoto: 'Настроить фото',
    photoEditorHint: 'Перемещай одним пальцем. Увеличивай ползунком.',
    resetPhoto: 'Сбросить',
    applyPhoto: 'Применить',
  },
  ES: {
    pageTitle: 'Añadir descuento',
    pageSubtitle: 'Crea una oferta especial para hoy o para varios días.',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    chooseCategory: 'Elige categoría',
    chooseSubcategory: 'Elige subcategoría',
    discountTitle: 'Título del descuento',
    discountTitlePlaceholder: 'Introduce el título del descuento',
    discountPercent: 'Tamaño del descuento',
    onlyToday: 'Oferta limitada',
    description: 'Descripción',
    descriptionPlaceholder: 'Introduce la descripción...',
    chooseDays: 'Elegir número de días',
    photo: 'Foto',
    photoHint: 'Añade 1 foto para el descuento del día.',
    addPhoto: 'Añadir foto',
    replacePhoto: 'Reemplazar',
    photoAdded: 'Foto añadida',
    photoSource: 'Origen de foto',
    gallery: 'Galería',
    camera: 'Cámara',
    files: 'Archivos',
    totalToPay: 'Total a pagar',
    choosePaymentMethod: 'Elige método de pago',
    paymentMethodsHint: 'Selecciona cómo quieres pagar',
    selected: 'Seleccionado',
    cancel: 'Cancelar',
    pay: 'Pagar',
    done: 'Hecho',
    ok: 'OK',
    publishDay1: 'Publicar descuento por 1 día',
    publishDays: 'Publicar descuento por {days} días',
    day: 'día',
    day2to4: 'días',
    days: 'días',
    forPrice: 'por',
    enterCategory: 'Elige categoría',
    enterSubcategory: 'Elige subcategoría',
    enterDiscountTitle: 'Introduce el título del descuento',
    enterDiscountPercent: 'Introduce el tamaño del descuento',
    enterDescription: 'Introduce la descripción',
    addPhotoAlert: 'Añade una foto',
    close: 'Cerrar',
    paymentHint: 'La oferta se publica solo después del pago.',
    summary: 'Resumen del descuento',
    adjustPhoto: 'Ajustar foto',
    photoEditorHint: 'Mueve con un dedo. Haz zoom con el control.',
    resetPhoto: 'Restablecer',
    applyPhoto: 'Aplicar',
  },
  CZ: {
    pageTitle: 'Přidat slevu dne',
    pageSubtitle: 'Vytvořte speciální nabídku na dnešek nebo na několik dní.',
    category: 'Kategorie',
    subcategory: 'Podkategorie',
    chooseCategory: 'Vyberte kategorii',
    chooseSubcategory: 'Vyberte podkategorii',
    discountTitle: 'Název slevy',
    discountTitlePlaceholder: 'Zadejte název slevy',
    discountPercent: 'Výše slevy',
    onlyToday: 'Časově omezená nabídka',
    description: 'Popis',
    descriptionPlaceholder: 'Zadejte popis...',
    chooseDays: 'Vyberte počet dní',
    photo: 'Foto',
    photoHint: 'Přidejte 1 fotku pro slevu dne.',
    addPhoto: 'Přidat foto',
    replacePhoto: 'Nahradit',
    photoAdded: 'Foto přidáno',
    photoSource: 'Zdroj fotky',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Soubory',
    totalToPay: 'Celkem k platbě',
    choosePaymentMethod: 'Vyberte způsob platby',
    paymentMethodsHint: 'Vyberte, jak chcete zaplatit',
    selected: 'Vybráno',
    cancel: 'Zrušit',
    pay: 'Zaplatit',
    done: 'Hotovo',
    ok: 'OK',
    publishDay1: 'Publikovat slevu na 1 den',
    publishDays: 'Publikovat slevu na {days} dní',
    day: 'den',
    day2to4: 'dny',
    days: 'dní',
    forPrice: 'za',
    enterCategory: 'Vyberte kategorii',
    enterSubcategory: 'Vyberte podkategorii',
    enterDiscountTitle: 'Zadejte název slevy',
    enterDiscountPercent: 'Zadejte výši slevy',
    enterDescription: 'Zadejte popis',
    addPhotoAlert: 'Přidejte fotku',
    close: 'Zavřít',
    paymentHint: 'Sleva dne bude publikována až po platbě.',
    summary: 'Shrnutí slevy dne',
    adjustPhoto: 'Upravit fotku',
    photoEditorHint: 'Posuňte jedním prstem. Přibližte posuvníkem.',
    resetPhoto: 'Resetovat',
    applyPhoto: 'Použít',
  },
  DE: {
    pageTitle: 'Tagesrabatt hinzufügen',
    pageSubtitle: 'Erstellen Sie ein Sonderangebot für heute oder mehrere Tage.',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    chooseCategory: 'Kategorie wählen',
    chooseSubcategory: 'Unterkategorie wählen',
    discountTitle: 'Rabatttitel',
    discountTitlePlaceholder: 'Rabatttitel eingeben',
    discountPercent: 'Rabattgröße',
    onlyToday: 'Zeitlich begrenztes Angebot',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibung eingeben...',
    chooseDays: 'Anzahl der Tage wählen',
    photo: 'Foto',
    photoHint: 'Fügen Sie 1 Foto für den Tagesrabatt hinzu.',
    addPhoto: 'Foto hinzufügen',
    replacePhoto: 'Ersetzen',
    photoAdded: 'Foto hinzugefügt',
    photoSource: 'Fotoquelle',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Dateien',
    totalToPay: 'Gesamtbetrag',
    choosePaymentMethod: 'Zahlungsmethode wählen',
    paymentMethodsHint: 'Wählen Sie, wie Sie bezahlen möchten',
    selected: 'Ausgewählt',
    cancel: 'Abbrechen',
    pay: 'Bezahlen',
    done: 'Fertig',
    ok: 'OK',
    publishDay1: 'Rabatt für 1 Tag veröffentlichen',
    publishDays: 'Rabatt für {days} Tage veröffentlichen',
    day: 'Tag',
    day2to4: 'Tage',
    days: 'Tage',
    forPrice: 'für',
    enterCategory: 'Kategorie wählen',
    enterSubcategory: 'Unterkategorie wählen',
    enterDiscountTitle: 'Rabatttitel eingeben',
    enterDiscountPercent: 'Rabattgröße eingeben',
    enterDescription: 'Beschreibung eingeben',
    addPhotoAlert: 'Foto hinzufügen',
    close: 'Schließen',
    paymentHint: 'Der Tagesrabatt wird erst nach Zahlung veröffentlicht.',
    summary: 'Tagesrabatt Übersicht',
    adjustPhoto: 'Foto anpassen',
    photoEditorHint: 'Mit einem Finger verschieben. Mit dem Regler zoomen.',
    resetPhoto: 'Zurücksetzen',
    applyPhoto: 'Anwenden',
  },
  PL: {
    pageTitle: 'Dodaj zniżkę dnia',
    pageSubtitle: 'Utwórz specjalną ofertę na dziś lub na kilka dni.',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    chooseCategory: 'Wybierz kategorię',
    chooseSubcategory: 'Wybierz podkategorię',
    discountTitle: 'Nazwa zniżki',
    discountTitlePlaceholder: 'Wpisz nazwę zniżki',
    discountPercent: 'Wysokość zniżki',
    onlyToday: 'Oferta ograniczona czasowo',
    description: 'Opis',
    descriptionPlaceholder: 'Wpisz opis...',
    chooseDays: 'Wybierz liczbę dni',
    photo: 'Zdjęcie',
    photoHint: 'Dodaj 1 zdjęcie do zniżki dnia.',
    addPhoto: 'Dodaj zdjęcie',
    replacePhoto: 'Zamień',
    photoAdded: 'Zdjęcie dodane',
    photoSource: 'Źródło zdjęcia',
    gallery: 'Galeria',
    camera: 'Kamera',
    files: 'Pliki',
    totalToPay: 'Razem do zapłaty',
    choosePaymentMethod: 'Wybierz metodę płatności',
    paymentMethodsHint: 'Wybierz, jak chcesz zapłacić',
    selected: 'Wybrano',
    cancel: 'Anuluj',
    pay: 'Zapłać',
    done: 'Gotowe',
    ok: 'OK',
    publishDay1: 'Opublikuj zniżkę na 1 dzień',
    publishDays: 'Opublikuj zniżkę na {days} dni',
    day: 'dzień',
    day2to4: 'dni',
    days: 'dni',
    forPrice: 'za',
    enterCategory: 'Wybierz kategorię',
    enterSubcategory: 'Wybierz podkategorię',
    enterDiscountTitle: 'Wpisz nazwę zniżki',
    enterDiscountPercent: 'Wpisz wysokość zniżki',
    enterDescription: 'Wpisz opis',
    addPhotoAlert: 'Dodaj zdjęcie',
    close: 'Zamknij',
    paymentHint: 'Zniżka dnia zostanie opublikowana dopiero po płatności.',
    summary: 'Podsumowanie zniżki dnia',
    adjustPhoto: 'Dopasuj zdjęcie',
    photoEditorHint: 'Przesuwaj jednym palcem. Powiększaj suwakiem.',
    resetPhoto: 'Resetuj',
    applyPhoto: 'Zastosuj',
  },
  UA: {} as DealTexts,
  IT: {} as DealTexts,
  FR: {} as DealTexts,
  AR: {} as DealTexts,
};

(['UA', 'IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
  textByLanguage[lang] = textByLanguage.EN;
});

const paymentMethodsByLanguage: Record<AppLanguage, PaymentSheetMethod[]> = {
  EN: [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast payment', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express checkout', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'One-tap payment', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'MapBook balance', subtitle: 'Charge from wallet', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  RU: [
    { id: 'card', title: 'Банковская карта', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Быстрая оплата', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express checkout', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Оплата в 1 касание', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'Баланс MapBook', subtitle: 'Списать с кошелька', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Криптокошелёк', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Банковский перевод', subtitle: 'Manual transfer', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  ES: [
    { id: 'card', title: 'Tarjeta bancaria', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Pago rápido', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Pago exprés', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Pago en 1 toque', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'Saldo MapBook', subtitle: 'Cobrar desde la cartera', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Cartera cripto', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Transferencia bancaria', subtitle: 'Transferencia manual', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  CZ: [
    { id: 'card', title: 'Bankovní karta', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Rychlá platba', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Expresní platba', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Platba jedním klepnutím', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'Zůstatek MapBook', subtitle: 'Strhnout z peněženky', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Krypto peněženka', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Bankovní převod', subtitle: 'Ruční převod', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  DE: [
    { id: 'card', title: 'Bankkarte', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Schnelle Zahlung', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express-Checkout', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Ein-Klick-Zahlung', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'MapBook-Guthaben', subtitle: 'Vom Wallet abbuchen', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Krypto-Wallet', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Banküberweisung', subtitle: 'Manuelle Überweisung', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  PL: [
    { id: 'card', title: 'Karta bankowa', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Szybka płatność', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express checkout', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Płatność jednym dotknięciem', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'Saldo MapBook', subtitle: 'Pobierz z portfela', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Portfel krypto', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Przelew bankowy', subtitle: 'Przelew ręczny', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  UA: [] as PaymentSheetMethod[],
  IT: [] as PaymentSheetMethod[],
  FR: [] as PaymentSheetMethod[],
  AR: [] as PaymentSheetMethod[],
};

(['UA', 'IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
  paymentMethodsByLanguage[lang] = paymentMethodsByLanguage.EN;
});

function getDayWord(days: number, language: AppLanguage, text: DealTexts) {
  if (language === 'RU') {
    if (days % 10 === 1 && days % 100 !== 11) return text.day;
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return text.day2to4;
    return text.days;
  }

  return days === 1 ? text.day : text.days;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSafeScale(value: number) {
  return clamp(Number.isFinite(value) ? value : 1, MIN_SCALE, MAX_SCALE);
}

export default function NewDealPage() {
  const router = useRouter();

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [discountTitle, setDiscountTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(1);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showPhotoSourceMenu, setShowPhotoSourceMenu] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [photo, setPhoto] = useState<DealPhotoState | null>(null);

  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
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
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    };
  }, [photo]);

  const text = textByLanguage[language] || textByLanguage.EN;
  const paymentMethods = paymentMethodsByLanguage[language] || paymentMethodsByLanguage.EN;
  const totalPrice = useMemo(() => days * 1, [days]);
  const daysOptions = Array.from({ length: 100 }, (_, index) => index + 1);
  const currentCategory = categories.find((item) => item.id === categoryId) || null;
  const subcategoryOptions = currentCategory?.subcategories || [];

  const publishText =
    days === 1
      ? `${text.publishDay1}: £${totalPrice}`
      : `${text.publishDays.replace('{days}', String(days))}: £${totalPrice}`;

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    const preview = URL.createObjectURL(file);

    setPhoto({
      name: file.name,
      preview,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });

    event.target.value = '';
    setShowPhotoSourceMenu(false);
  };

  const handleRemovePhoto = () => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhoto(null);
    setShowPhotoEditor(false);
  };

  const openPhotoEditor = () => {
    if (!photo) return;

    setEditorScale(getSafeScale(photo.scale));
    setEditorOffsetX(photo.offsetX || 0);
    setEditorOffsetY(photo.offsetY || 0);
    setShowPhotoEditor(true);
  };

  const closePhotoEditor = () => {
    dragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };
    setShowPhotoEditor(false);
  };

  const applyPhotoEditor = () => {
    setPhoto((prev) =>
      prev
        ? {
            ...prev,
            scale: getSafeScale(editorScale),
            offsetX: editorOffsetX,
            offsetY: editorOffsetY,
          }
        : prev
    );
    closePhotoEditor();
  };

  const resetPhotoEditor = () => {
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

  const handleOpenPayment = () => {
    if (!categoryId) {
      alert(text.enterCategory);
      return;
    }

    if (!subcategory) {
      alert(text.enterSubcategory);
      return;
    }

    if (!discountTitle.trim()) {
      alert(text.enterDiscountTitle);
      return;
    }

    if (!discountPercent.trim()) {
      alert(text.enterDiscountPercent);
      return;
    }

    if (!description.trim()) {
      alert(text.enterDescription);
      return;
    }

    if (!photo?.name.trim()) {
      alert(text.addPhotoAlert);
      return;
    }

    setShowPaymentSheet(true);
    setIsSuccess(false);
  };

  const handlePay = () => {
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

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelected}
              style={{ display: 'none' }}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelected}
              style={{ display: 'none' }}
            />

            <input
              ref={filesInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelected}
              style={{ display: 'none' }}
            />

            {!photo ? (
              <button
                type="button"
                onClick={() => setShowPhotoSourceMenu(true)}
                style={{
                  width: '100%',
                  minHeight: 96,
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
                    border: '2px solid #2f8c67',
                    background: '#f5fff8',
                    color: '#2f8c67',
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
                      color: '#2f8c67',
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
                      wordBreak: 'break-word',
                    }}
                  >
                    JPG / PNG / WEBP
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
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 220,
                    overflow: 'hidden',
                    background: '#f4f1ea',
                  }}
                >
                  <img
                    src={photo.preview}
                    alt={photo.name || 'deal-photo'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: `translate(${photo.offsetX}px, ${photo.offsetY}px) scale(${photo.scale})`,
                      transformOrigin: 'center center',
                    }}
                  />

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
                      onClick={openPhotoEditor}
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
                      onClick={handleRemovePhoto}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        border: '1.5px solid #111111',
                        background: '#ffffff',
                        color: '#17130f',
                        fontSize: 20,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

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
                      {text.photoAdded}
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
                      {photo.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={openPhotoEditor}
                      style={{
                        height: 40,
                        borderRadius: 14,
                        border: '1.5px solid #111111',
                        background: '#ffffff',
                        color: '#17130f',
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.adjustPhoto}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPhotoSourceMenu(true)}
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
                      {text.replacePhoto}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 18,
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
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
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
                    <option key={item} value={item}>
                      {item}
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
              {text.discountTitle} <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <input
              value={discountTitle}
              onChange={(e) => setDiscountTitle(e.target.value)}
              placeholder={text.discountTitlePlaceholder}
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
                display: 'grid',
                gridTemplateColumns: '1fr 132px 26px',
                gap: 10,
                alignItems: 'end',
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
                  {text.discountPercent} <span style={{ color: '#ef4444' }}>*</span>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: '#7b7268',
                    fontWeight: 700,
                  }}
                >
                  {text.onlyToday}
                </div>
              </div>

              <div>
                <input
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value.replace(/[^\d]/g, ''))}
                  style={{
                    width: '100%',
                    height: 58,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#fff',
                    padding: '0 16px',
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                />
              </div>

              <div
                style={{
                  height: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                %
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                height: 1,
                background: '#e7ddd0',
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
              {text.chooseDays}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setShowDaysPicker((prev) => !prev)}
                style={{
                  height: 62,
                  borderRadius: 20,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {days}
                </span>

                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  ›
                </span>
              </button>

              <div
                style={{
                  minWidth: 96,
                  height: 62,
                  borderRadius: 20,
                  border: '1.5px solid #111111',
                  background: '#edf9ef',
                  color: '#2fa35a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 900,
                  padding: '0 12px',
                  boxSizing: 'border-box',
                }}
              >
                £{totalPrice}
              </div>
            </div>

            {showDaysPicker ? (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 24,
                  border: '1.5px solid #111111',
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {daysOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDays(value);
                        setShowDaysPicker(false);
                      }}
                      style={{
                        width: '100%',
                        height: 52,
                        border: 'none',
                        borderBottom:
                          value === daysOptions[daysOptions.length - 1]
                            ? 'none'
                            : '1px solid #ece3d7',
                        background: value === days ? '#f3fbf3' : '#fff',
                        color: value === days ? '#2fa35a' : '#17130f',
                        fontSize: 20,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowDaysPicker(false)}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 18,
                      border: '2px solid #111111',
                      background: '#2f8c67',
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.ok}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 24,
              border: '2px solid #111111',
              background: '#edf9ef',
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
              <div>{text.category}: {currentCategory?.label || '—'}</div>
              <div>{text.subcategory}: {subcategory || '—'}</div>
              <div>{text.discountPercent}: {discountPercent ? `${discountPercent}%` : '—'}</div>
              <div>{text.chooseDays}: {days}</div>
              <div>{text.totalToPay}: £{totalPrice}</div>
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
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenPayment}
            style={{
              marginTop: 16,
              width: '100%',
              height: 60,
              borderRadius: 22,
              border: '2px solid #111111',
              background: '#2f8c67',
              color: '#fff',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 0 rgba(17,17,17,0.08)',
            }}
          >
            {publishText} · £{totalPrice}
          </button>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {[1, 2, 3].map((value) => (
              <div
                key={value}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  border: '1.5px solid #111111',
                  background: days === value ? '#eef9f1' : '#fff',
                  color: days === value ? '#2fa35a' : '#6d6258',
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {value} {getDayWord(value, language, text)} £{value}
              </div>
            ))}
          </div>

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

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: '0 14px 14px',
                }}
              >
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

      {showPhotoEditor && photo ? (
        <div
          onClick={closePhotoEditor}
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
                    src={photo.preview}
                    alt={photo.name}
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
                  onClick={resetPhotoEditor}
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
                  onClick={closePhotoEditor}
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
                  onClick={applyPhotoEditor}
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

      <PaymentMethodSheet
        open={showPaymentSheet}
        amount={totalPrice}
        methods={paymentMethods}
        selectedMethodId={selectedPayment}
        texts={{
          title: text.choosePaymentMethod,
          subtitle: text.paymentMethodsHint,
          total: text.totalToPay,
          selected: text.selected,
          cancel: text.cancel,
          pay: text.pay,
        }}
        onClose={() => setShowPaymentSheet(false)}
        onSelect={setSelectedPayment}
        onPay={handlePay}
      />
    </>
  );
}
