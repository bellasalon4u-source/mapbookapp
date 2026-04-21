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
  UA: {
    pageTitle: 'Додати знижку дня',
    pageSubtitle: 'Створіть спеціальну пропозицію на сьогодні або на кілька днів.',
    category: 'Категорія',
    subcategory: 'Підкатегорія',
    chooseCategory: 'Оберіть категорію',
    chooseSubcategory: 'Оберіть підкатегорію',
    discountTitle: 'Назва знижки',
    discountTitlePlaceholder: 'Введіть назву знижки',
    discountPercent: 'Розмір знижки',
    onlyToday: 'Обмежена пропозиція',
    description: 'Опис',
    descriptionPlaceholder: 'Введіть опис...',
    chooseDays: 'Оберіть кількість днів',
    photo: 'Фото',
    photoHint: 'Додайте 1 фото для знижки дня.',
    addPhoto: 'Додати фото',
    replacePhoto: 'Замінити',
    photoAdded: 'Фото додано',
    photoSource: 'Джерело фото',
    gallery: 'Галерея',
    camera: 'Камера',
    files: 'Файли',
    totalToPay: 'Разом до оплати',
    choosePaymentMethod: 'Оберіть спосіб оплати',
    paymentMethodsHint: 'Оберіть, як хочете оплатити',
    selected: 'Обрано',
    cancel: 'Скасувати',
    pay: 'Оплатити',
    done: 'Готово',
    ok: 'OK',
    publishDay1: 'Опублікувати знижку на 1 день',
    publishDays: 'Опублікувати знижку на {days} днів',
    day: 'день',
    day2to4: 'дні',
    days: 'днів',
    forPrice: 'за',
    enterCategory: 'Оберіть категорію',
    enterSubcategory: 'Оберіть підкатегорію',
    enterDiscountTitle: 'Введіть назву знижки',
    enterDiscountPercent: 'Введіть розмір знижки',
    enterDescription: 'Введіть опис',
    addPhotoAlert: 'Додайте фото',
    close: 'Закрити',
    paymentHint: 'Знижка дня публікується тільки після оплати.',
    summary: 'Підсумок знижки дня',
    adjustPhoto: 'Налаштувати фото',
    photoEditorHint: 'Переміщуйте одним пальцем. Збільшуйте повзунком.',
    resetPhoto: 'Скинути',
    applyPhoto: 'Застосувати',
  },
  IT: {} as DealTexts,
  FR: {} as DealTexts,
  AR: {} as DealTexts,
};

(['IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
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
  UA: [
    { id: 'card', title: 'Банківська карта', subtitle: 'Visa / Mastercard', icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Швидка оплата', icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express checkout', icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Оплата в 1 дотик', icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    { id: 'wallet', title: 'Баланс MapBook', subtitle: 'Списати з гаманця', icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    { id: 'crypto', title: 'Криптогаманець', subtitle: 'USDT / USDC', icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    { id: 'bank', title: 'Банківський переказ', subtitle: 'Ручний переказ', icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  ],
  IT: [] as PaymentSheetMethod[],
  FR: [] as PaymentSheetMethod[],
  AR: [] as PaymentSheetMethod[],
};

(['IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
  paymentMethodsByLanguage[lang] = paymentMethodsByLanguage.EN;
});

function getDayWord(days: number, language: AppLanguage, text: DealTexts) {
  if (language === 'RU') {
    if (days % 10 === 1 && days % 100 !== 11) return text.day;
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return text.day2to4;
    return text.days;
  }

  if (language === 'UA') {
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
    Hair: { EN: 'Hair', ES: 'Cabello', RU: 'Волосы', UA: 'Волосся', CZ: 'Vlasy', DE: 'Haare', IT: 'Capelli', FR: 'Cheveux', AR: 'الشعر', PL: 'Włosy' },
    'Brows & Lashes': { EN: 'Brows & Lashes', ES: 'Cejas y pestañas', RU: 'Брови и ресницы', UA: 'Брови та вії', CZ: 'Obočí a řasy', DE: 'Augenbrauen & Wimpern', IT: 'Sopracciglia e ciglia', FR: 'Sourcils et cils', AR: 'الحواجب والرموش', PL: 'Brwi i rzęsy' },
    Nails: { EN: 'Nails', ES: 'Uñas', RU: 'Ногти', UA: 'Нігті', CZ: 'Nehty', DE: 'Nägel', IT: 'Unghie', FR: 'Ongles', AR: 'الأظافر', PL: 'Paznokcie' },
    Makeup: { EN: 'Makeup', ES: 'Maquillaje', RU: 'Макияж', UA: 'Макіяж', CZ: 'Make-up', DE: 'Make-up', IT: 'Make-up', FR: 'Maquillage', AR: 'مكياج', PL: 'Makijaż' },
    Skincare: { EN: 'Skincare', ES: 'Cuidado de la piel', RU: 'Уход за кожей', UA: 'Догляд за шкірою', CZ: 'Péče o pleť', DE: 'Hautpflege', IT: 'Cura della pelle', FR: 'Soin de la peau', AR: 'العناية بالبشرة', PL: 'Pielęgnacja skóry' },
    Aesthetics: { EN: 'Aesthetics', ES: 'Estética', RU: 'Эстетика', UA: 'Естетика', CZ: 'Estetika', DE: 'Ästhetik', IT: 'Estetica', FR: 'Esthétique', AR: 'التجميل', PL: 'Estetyka' },
    Haircut: { EN: 'Haircut', ES: 'Corte de pelo', RU: 'Стрижка', UA: 'Стрижка', CZ: 'Střih', DE: 'Haarschnitt', IT: 'Taglio', FR: 'Coupe', AR: 'قص الشعر', PL: 'Strzyżenie' },
    'Beard Trim': { EN: 'Beard Trim', ES: 'Recorte de barba', RU: 'Подравнивание бороды', UA: 'Підрівнювання бороди', CZ: 'Úprava vousů', DE: 'Bart trimmen', IT: 'Regolazione barba', FR: 'Taille de barbe', AR: 'تهذيب اللحية', PL: 'Przycinanie brody' },
    Shave: { EN: 'Shave', ES: 'Afeitado', RU: 'Бритьё', UA: 'Гоління', CZ: 'Holení', DE: 'Rasur', IT: 'Rasatura', FR: 'Rasage', AR: 'حلاقة', PL: 'Golenie' },
    Fade: { EN: 'Fade', ES: 'Fade', RU: 'Фейд', UA: 'Фейд', CZ: 'Fade', DE: 'Fade', IT: 'Fade', FR: 'Fade', AR: 'فيد', PL: 'Fade' },
    'Kids Haircut': { EN: 'Kids Haircut', ES: 'Corte infantil', RU: 'Детская стрижка', UA: 'Дитяча стрижка', CZ: 'Dětský střih', DE: 'Kinderhaarschnitt', IT: 'Taglio bambino', FR: 'Coupe enfant', AR: 'قص أطفال', PL: 'Strzyżenie dziecięce' },
    Styling: { EN: 'Styling', ES: 'Peinado', RU: 'Укладка', UA: 'Укладка', CZ: 'Styling', DE: 'Styling', IT: 'Styling', FR: 'Coiffage', AR: 'تصفيف', PL: 'Stylizacja' },
    Massage: { EN: 'Massage', ES: 'Masaje', RU: 'Массаж', UA: 'Масаж', CZ: 'Masáž', DE: 'Massage', IT: 'Massaggio', FR: 'Massage', AR: 'مساج', PL: 'Masaż' },
    Spa: { EN: 'Spa', ES: 'Spa', RU: 'Спа', UA: 'Спа', CZ: 'Spa', DE: 'Spa', IT: 'Spa', FR: 'Spa', AR: 'سبا', PL: 'Spa' },
    Relaxation: { EN: 'Relaxation', ES: 'Relajación', RU: 'Релакс', UA: 'Релакс', CZ: 'Relaxace', DE: 'Entspannung', IT: 'Relax', FR: 'Relaxation', AR: 'استرخاء', PL: 'Relaks' },
    Recovery: { EN: 'Recovery', ES: 'Recuperación', RU: 'Восстановление', UA: 'Відновлення', CZ: 'Regenerace', DE: 'Erholung', IT: 'Recupero', FR: 'Récupération', AR: 'تعافٍ', PL: 'Regeneracja' },
    'Holistic Care': { EN: 'Holistic Care', ES: 'Cuidado holístico', RU: 'Холистический уход', UA: 'Холістичний догляд', CZ: 'Holistická péče', DE: 'Ganzheitliche Pflege', IT: 'Cura olistica', FR: 'Soin holistique', AR: 'رعاية شمولية', PL: 'Opieka holistyczna' },
    'Therapy Support': { EN: 'Therapy Support', ES: 'Apoyo terapéutico', RU: 'Терапевтическая помощь', UA: 'Терапевтична підтримка', CZ: 'Terapeutická podpora', DE: 'Therapie-Unterstützung', IT: 'Supporto terapeutico', FR: 'Soutien thérapeutique', AR: 'دعم علاجي', PL: 'Wsparcie terapeutyczne' },
    Cleaning: { EN: 'Cleaning', ES: 'Limpieza', RU: 'Уборка', UA: 'Прибирання', CZ: 'Úklid', DE: 'Reinigung', IT: 'Pulizia', FR: 'Nettoyage', AR: 'تنظيف', PL: 'Sprzątanie' },
    'Deep Cleaning': { EN: 'Deep Cleaning', ES: 'Limpieza profunda', RU: 'Глубокая уборка', UA: 'Глибоке прибирання', CZ: 'Hloubkové čištění', DE: 'Tiefenreinigung', IT: 'Pulizia profonda', FR: 'Nettoyage en profondeur', AR: 'تنظيف عميق', PL: 'Dogłębne czyszczenie' },
    'Garden Help': { EN: 'Garden Help', ES: 'Ayuda en jardín', RU: 'Помощь в саду', UA: 'Допомога в саду', CZ: 'Pomoc na zahradě', DE: 'Gartenhilfe', IT: 'Aiuto in giardino', FR: 'Aide au jardin', AR: 'مساعدة في الحديقة', PL: 'Pomoc w ogrodzie' },
    Handyman: { EN: 'Handyman', ES: 'Manitas', RU: 'Мастер на час', UA: 'Майстер на годину', CZ: 'Hodinový manžel', DE: 'Handwerker', IT: 'Tuttofare', FR: 'Bricoleur', AR: 'عامل صيانة', PL: 'Złota rączka' },
    'Furniture Assembly': { EN: 'Furniture Assembly', ES: 'Montaje de muebles', RU: 'Сборка мебели', UA: 'Збірка меблів', CZ: 'Montáž nábytku', DE: 'Möbelmontage', IT: 'Montaggio mobili', FR: 'Montage de meubles', AR: 'تركيب الأثاث', PL: 'Montaż mebli' },
    'Home Help': { EN: 'Home Help', ES: 'Ayuda en casa', RU: 'Помощь по дому', UA: 'Допомога по дому', CZ: 'Pomoc v domácnosti', DE: 'Haushaltshilfe', IT: 'Aiuto domestico', FR: 'Aide à domicile', AR: 'مساعدة منزلية', PL: 'Pomoc domowa' },
    'Home Repairs': { EN: 'Home Repairs', ES: 'Reparaciones del hogar', RU: 'Домашний ремонт', UA: 'Домашній ремонт', CZ: 'Opravy doma', DE: 'Hausreparaturen', IT: 'Riparazioni domestiche', FR: 'Réparations à domicile', AR: 'إصلاحات منزلية', PL: 'Naprawy domowe' },
    'Appliance Repair': { EN: 'Appliance Repair', ES: 'Reparación de electrodomésticos', RU: 'Ремонт техники', UA: 'Ремонт техніки', CZ: 'Oprava spotřebičů', DE: 'Gerätereparatur', IT: 'Riparazione elettrodomestici', FR: 'Réparation d’appareils', AR: 'إصلاح الأجهزة', PL: 'Naprawa sprzętu' },
    'Furniture Repair': { EN: 'Furniture Repair', ES: 'Reparación de muebles', RU: 'Ремонт мебели', UA: 'Ремонт меблів', CZ: 'Oprava nábytku', DE: 'Möbelreparatur', IT: 'Riparazione mobili', FR: 'Réparation de meubles', AR: 'إصلاح الأثاث', PL: 'Naprawa mebli' },
    'Shoe Repair': { EN: 'Shoe Repair', ES: 'Reparación de zapatos', RU: 'Ремонт обуви', UA: 'Ремонт взуття', CZ: 'Oprava bot', DE: 'Schuhreparatur', IT: 'Riparazione scarpe', FR: 'Réparation de chaussures', AR: 'إصلاح الأحذية', PL: 'Naprawa butów' },
    'Clothing Repair': { EN: 'Clothing Repair', ES: 'Reparación de ropa', RU: 'Ремонт одежды', UA: 'Ремонт одягу', CZ: 'Oprava oblečení', DE: 'Kleiderreparatur', IT: 'Riparazione vestiti', FR: 'Réparation de vêtements', AR: 'إصلاح الملابس', PL: 'Naprawa odzieży' },
    'Watch Repair': { EN: 'Watch Repair', ES: 'Reparación de relojes', RU: 'Ремонт часов', UA: 'Ремонт годинників', CZ: 'Oprava hodinek', DE: 'Uhrenreparatur', IT: 'Riparazione orologi', FR: 'Réparation de montres', AR: 'إصلاح الساعات', PL: 'Naprawa zegarków' },
    'Phone Repair': { EN: 'Phone Repair', ES: 'Reparación de teléfono', RU: 'Ремонт телефона', UA: 'Ремонт телефону', CZ: 'Oprava telefonu', DE: 'Handyreparatur', IT: 'Riparazione telefono', FR: 'Réparation téléphone', AR: 'إصلاح الهاتف', PL: 'Naprawa telefonu' },
    'Computer Repair': { EN: 'Computer Repair', ES: 'Reparación de ordenador', RU: 'Ремонт компьютера', UA: 'Ремонт комп’ютера', CZ: 'Oprava počítače', DE: 'Computerreparatur', IT: 'Riparazione computer', FR: 'Réparation ordinateur', AR: 'إصلاح الكمبيوتر', PL: 'Naprawa komputera' },
    'Laptop Repair': { EN: 'Laptop Repair', ES: 'Reparación de portátil', RU: 'Ремонт ноутбука', UA: 'Ремонт ноутбука', CZ: 'Oprava notebooku', DE: 'Laptopreparatur', IT: 'Riparazione laptop', FR: 'Réparation portable', AR: 'إصلاح اللابتوب', PL: 'Naprawa laptopa' },
    'Tablet Repair': { EN: 'Tablet Repair', ES: 'Reparación de tablet', RU: 'Ремонт планшета', UA: 'Ремонт планшета', CZ: 'Oprava tabletu', DE: 'Tablet-Reparatur', IT: 'Riparazione tablet', FR: 'Réparation tablette', AR: 'إصلاح التابلت', PL: 'Naprawa tabletu' },
    'TV Setup': { EN: 'TV Setup', ES: 'Configuración TV', RU: 'Настройка ТВ', UA: 'Налаштування ТВ', CZ: 'Nastavení TV', DE: 'TV-Einrichtung', IT: 'Configurazione TV', FR: 'Configuration TV', AR: 'إعداد التلفاز', PL: 'Konfiguracja TV' },
    'Smart Device Help': { EN: 'Smart Device Help', ES: 'Ayuda con dispositivos inteligentes', RU: 'Помощь с умными устройствами', UA: 'Допомога з розумними пристроями', CZ: 'Pomoc s chytrými zařízeními', DE: 'Hilfe mit Smart-Geräten', IT: 'Aiuto dispositivi smart', FR: 'Aide appareils connectés', AR: 'مساعدة الأجهزة الذكية', PL: 'Pomoc ze smart urządzeniami' },
    Tailoring: { EN: 'Tailoring', ES: 'Sastrería', RU: 'Пошив', UA: 'Пошиття', CZ: 'Krejčovství', DE: 'Schneiderei', IT: 'Sartoria', FR: 'Couture', AR: 'خياطة', PL: 'Krawiectwo' },
    Alterations: { EN: 'Alterations', ES: 'Arreglos', RU: 'Переделка', UA: 'Переробка', CZ: 'Úpravy', DE: 'Änderungen', IT: 'Modifiche', FR: 'Retouches', AR: 'تعديلات', PL: 'Przeróbki' },
    'Custom Sewing': { EN: 'Custom Sewing', ES: 'Costura a medida', RU: 'Индивидуальный пошив', UA: 'Індивідуальне пошиття', CZ: 'Zakázkové šití', DE: 'Maßschneiderei', IT: 'Cucito su misura', FR: 'Couture sur mesure', AR: 'خياطة مخصصة', PL: 'Szycie na miarę' },
    'Shoe Care': { EN: 'Shoe Care', ES: 'Cuidado del calzado', RU: 'Уход за обувью', UA: 'Догляд за взуттям', CZ: 'Péče o obuv', DE: 'Schuhpflege', IT: 'Cura scarpe', FR: 'Entretien des chaussures', AR: 'العناية بالأحذية', PL: 'Pielęgnacja butów' },
    'Bag Repair': { EN: 'Bag Repair', ES: 'Reparación de bolsos', RU: 'Ремонт сумок', UA: 'Ремонт сумок', CZ: 'Oprava tašek', DE: 'Taschenreparatur', IT: 'Riparazione borse', FR: 'Réparation sacs', AR: 'إصلاح الحقائب', PL: 'Naprawa toreb' },
    Grooming: { EN: 'Grooming', ES: 'Peluquería', RU: 'Груминг', UA: 'Грумінг', CZ: 'Grooming', DE: 'Grooming', IT: 'Toelettatura', FR: 'Toilettage', AR: 'تنظيف الحيوانات', PL: 'Grooming' },
    'Dog Walking': { EN: 'Dog Walking', ES: 'Paseo de perros', RU: 'Выгул собак', UA: 'Вигул собак', CZ: 'Venčení psů', DE: 'Gassi-Service', IT: 'Passeggiata cani', FR: 'Promenade de chiens', AR: 'تمشية الكلاب', PL: 'Wyprowadzanie psów' },
    'Pet Sitting': { EN: 'Pet Sitting', ES: 'Cuidado de mascotas', RU: 'Передержка питомцев', UA: 'Перетримка тварин', CZ: 'Hlídání mazlíčků', DE: 'Tiersitting', IT: 'Pet sitting', FR: 'Garde d’animaux', AR: 'رعاية الحيوانات', PL: 'Opieka nad zwierzętami' },
    'Pet Taxi': { EN: 'Pet Taxi', ES: 'Taxi para mascotas', RU: 'Такси для питомцев', UA: 'Таксі для тварин', CZ: 'Taxi pro mazlíčky', DE: 'Tier-Taxi', IT: 'Taxi per animali', FR: 'Taxi animaux', AR: 'تاكسي الحيوانات', PL: 'Taxi dla zwierząt' },
    'Pet Delivery': { EN: 'Pet Delivery', ES: 'Entrega para mascotas', RU: 'Доставка для питомцев', UA: 'Доставка для тварин', CZ: 'Doručení pro mazlíčky', DE: 'Lieferung für Tiere', IT: 'Consegna per animali', FR: 'Livraison animaux', AR: 'توصيل للحيوانات', PL: 'Dostawa dla zwierząt' },
    Training: { EN: 'Training', ES: 'Entrenamiento', RU: 'Дрессировка', UA: 'Тренування', CZ: 'Trénink', DE: 'Training', IT: 'Allenamento', FR: 'Entraînement', AR: 'تدريب', PL: 'Trening' },
    'Home Visits': { EN: 'Home Visits', ES: 'Visitas a domicilio', RU: 'Выезд на дом', UA: 'Візит додому', CZ: 'Návštěvy doma', DE: 'Hausbesuche', IT: 'Visite a domicilio', FR: 'Visites à domicile', AR: 'زيارات منزلية', PL: 'Wizyty domowe' },
    'Accessories & Gifts': { EN: 'Accessories & Gifts', ES: 'Accesorios y regalos', RU: 'Аксессуары и подарки', UA: 'Аксесуари та подарунки', CZ: 'Doplňky a dárky', DE: 'Accessoires & Geschenke', IT: 'Accessori e regali', FR: 'Accessoires et cadeaux', AR: 'إكسسوارات وهدايا', PL: 'Akcesoria i prezenty' },
    'Car Wash': { EN: 'Car Wash', ES: 'Lavado de coche', RU: 'Мойка авто', UA: 'Мийка авто', CZ: 'Mytí auta', DE: 'Autowäsche', IT: 'Lavaggio auto', FR: 'Lavage auto', AR: 'غسيل السيارة', PL: 'Mycie auta' },
    Detailing: { EN: 'Detailing', ES: 'Detailing', RU: 'Детейлинг', UA: 'Детейлінг', CZ: 'Detailing', DE: 'Detailing', IT: 'Detailing', FR: 'Detailing', AR: 'تلميع', PL: 'Detailing' },
    'Tyre Help': { EN: 'Tyre Help', ES: 'Ayuda con neumáticos', RU: 'Помощь с шинами', UA: 'Допомога з шинами', CZ: 'Pomoc s pneumatikami', DE: 'Reifenhilfe', IT: 'Aiuto pneumatici', FR: 'Aide pneus', AR: 'مساعدة الإطارات', PL: 'Pomoc z oponami' },
    'Battery Help': { EN: 'Battery Help', ES: 'Ayuda con batería', RU: 'Помощь с аккумулятором', UA: 'Допомога з акумулятором', CZ: 'Pomoc s baterií', DE: 'Batteriehilfe', IT: 'Aiuto batteria', FR: 'Aide batterie', AR: 'مساعدة البطارية', PL: 'Pomoc z akumulatorem' },
    Diagnostics: { EN: 'Diagnostics', ES: 'Diagnóstico', RU: 'Диагностика', UA: 'Діагностика', CZ: 'Diagnostika', DE: 'Diagnose', IT: 'Diagnostica', FR: 'Diagnostic', AR: 'تشخيص', PL: 'Diagnostyka' },
    'Driver Service': { EN: 'Driver Service', ES: 'Servicio de conductor', RU: 'Услуги водителя', UA: 'Послуги водія', CZ: 'Řidičské služby', DE: 'Fahrerservice', IT: 'Servizio autista', FR: 'Service chauffeur', AR: 'خدمة السائق', PL: 'Usługa kierowcy' },
    'Small Moves': { EN: 'Small Moves', ES: 'Pequeñas mudanzas', RU: 'Небольшие переезды', UA: 'Невеликі переїзди', CZ: 'Malé stěhování', DE: 'Kleine Umzüge', IT: 'Piccoli traslochi', FR: 'Petits déménagements', AR: 'نقلات صغيرة', PL: 'Małe przeprowadzki' },
    'Van Help': { EN: 'Van Help', ES: 'Ayuda con furgoneta', RU: 'Помощь с фургоном', UA: 'Допомога з фургоном', CZ: 'Pomoc s dodávkou', DE: 'Transporter-Hilfe', IT: 'Aiuto furgone', FR: 'Aide fourgon', AR: 'مساعدة الشاحنة', PL: 'Pomoc z vanem' },
    'Furniture Delivery': { EN: 'Furniture Delivery', ES: 'Entrega de muebles', RU: 'Доставка мебели', UA: 'Доставка меблів', CZ: 'Doručení nábytku', DE: 'Möbellieferung', IT: 'Consegna mobili', FR: 'Livraison meubles', AR: 'توصيل الأثاث', PL: 'Dostawa mebli' },
    Courier: { EN: 'Courier', ES: 'Mensajería', RU: 'Курьер', UA: 'Курʼєр', CZ: 'Kurýr', DE: 'Kurier', IT: 'Corriere', FR: 'Coursier', AR: 'توصيل', PL: 'Kurier' },
    'Same-Day Delivery': { EN: 'Same-Day Delivery', ES: 'Entrega el mismo día', RU: 'Доставка в тот же день', UA: 'Доставка в той самий день', CZ: 'Doručení ve stejný den', DE: 'Lieferung am selben Tag', IT: 'Consegna in giornata', FR: 'Livraison le jour même', AR: 'توصيل بنفس اليوم', PL: 'Dostawa tego samego dnia' },
    'Heavy Transport': { EN: 'Heavy Transport', ES: 'Transporte pesado', RU: 'Тяжёлые перевозки', UA: 'Важкі перевезення', CZ: 'Těžká doprava', DE: 'Schwertransport', IT: 'Trasporto pesante', FR: 'Transport lourd', AR: 'نقل ثقيل', PL: 'Transport ciężki' },
    'Personal Training': { EN: 'Personal Training', ES: 'Entrenamiento personal', RU: 'Персональные тренировки', UA: 'Персональні тренування', CZ: 'Osobní trénink', DE: 'Personal Training', IT: 'Allenamento personale', FR: 'Coaching personnel', AR: 'تدريب شخصي', PL: 'Trening personalny' },
    Yoga: { EN: 'Yoga', ES: 'Yoga', RU: 'Йога', UA: 'Йога', CZ: 'Jóga', DE: 'Yoga', IT: 'Yoga', FR: 'Yoga', AR: 'يوغا', PL: 'Joga' },
    Pilates: { EN: 'Pilates', ES: 'Pilates', RU: 'Пилатес', UA: 'Пілатес', CZ: 'Pilates', DE: 'Pilates', IT: 'Pilates', FR: 'Pilates', AR: 'بيلاتس', PL: 'Pilates' },
    Stretching: { EN: 'Stretching', ES: 'Estiramientos', RU: 'Растяжка', UA: 'Розтяжка', CZ: 'Protahování', DE: 'Stretching', IT: 'Stretching', FR: 'Étirements', AR: 'تمدد', PL: 'Stretching' },
    'Dance Fitness': { EN: 'Dance Fitness', ES: 'Fitness de baile', RU: 'Танцевальный фитнес', UA: 'Танцювальний фітнес', CZ: 'Taneční fitness', DE: 'Dance Fitness', IT: 'Dance fitness', FR: 'Fitness danse', AR: 'لياقة رقص', PL: 'Fitness taneczny' },
    'Outdoor Training': { EN: 'Outdoor Training', ES: 'Entrenamiento al aire libre', RU: 'Тренировки на улице', UA: 'Тренування на вулиці', CZ: 'Venkovní trénink', DE: 'Outdoor-Training', IT: 'Allenamento outdoor', FR: 'Entraînement extérieur', AR: 'تدريب خارجي', PL: 'Trening outdoor' },
    Languages: { EN: 'Languages', ES: 'Idiomas', RU: 'Языки', UA: 'Мови', CZ: 'Jazyky', DE: 'Sprachen', IT: 'Lingue', FR: 'Langues', AR: 'لغات', PL: 'Języki' },
    Tutoring: { EN: 'Tutoring', ES: 'Tutoría', RU: 'Репетиторство', UA: 'Репетиторство', CZ: 'Doučování', DE: 'Nachhilfe', IT: 'Tutoraggio', FR: 'Tutorat', AR: 'دروس خصوصية', PL: 'Korepetycje' },
    'Music Lessons': { EN: 'Music Lessons', ES: 'Clases de música', RU: 'Уроки музыки', UA: 'Уроки музики', CZ: 'Hudební lekce', DE: 'Musikunterricht', IT: 'Lezioni di musica', FR: 'Cours de musique', AR: 'دروس موسيقى', PL: 'Lekcje muzyki' },
    'Kids Learning': { EN: 'Kids Learning', ES: 'Aprendizaje infantil', RU: 'Обучение детей', UA: 'Навчання дітей', CZ: 'Dětské vzdělávání', DE: 'Kinderlernen', IT: 'Apprendimento bambini', FR: 'Apprentissage enfants', AR: 'تعليم الأطفال', PL: 'Nauka dzieci' },
    'Exam Prep': { EN: 'Exam Prep', ES: 'Preparación de exámenes', RU: 'Подготовка к экзаменам', UA: 'Підготовка до іспитів', CZ: 'Příprava na zkoušky', DE: 'Prüfungsvorbereitung', IT: 'Preparazione esami', FR: 'Préparation examens', AR: 'تحضير للامتحانات', PL: 'Przygotowanie do egzaminów' },
    'Skill Coaching': { EN: 'Skill Coaching', ES: 'Coaching de habilidades', RU: 'Развитие навыков', UA: 'Розвиток навичок', CZ: 'Koučink dovedností', DE: 'Kompetenz-Coaching', IT: 'Coaching competenze', FR: 'Coaching compétences', AR: 'تدريب مهارات', PL: 'Coaching umiejętności' },
    Photography: { EN: 'Photography', ES: 'Fotografía', RU: 'Фотография', UA: 'Фотографія', CZ: 'Fotografie', DE: 'Fotografie', IT: 'Fotografia', FR: 'Photographie', AR: 'تصوير', PL: 'Fotografia' },
    Videography: { EN: 'Videography', ES: 'Videografía', RU: 'Видеосъёмка', UA: 'Відеозйомка', CZ: 'Videografie', DE: 'Videografie', IT: 'Videografia', FR: 'Vidéographie', AR: 'تصوير فيديو', PL: 'Wideografia' },
    Decor: { EN: 'Decor', ES: 'Decoración', RU: 'Декор', UA: 'Декор', CZ: 'Dekorace', DE: 'Dekor', IT: 'Decor', FR: 'Décor', AR: 'ديكور', PL: 'Dekoracje' },
    'DJ & Music': { EN: 'DJ & Music', ES: 'DJ y música', RU: 'DJ и музыка', UA: 'DJ та музика', CZ: 'DJ a hudba', DE: 'DJ & Musik', IT: 'DJ e musica', FR: 'DJ et musique', AR: 'دي جي وموسيقى', PL: 'DJ i muzyka' },
    'Event Makeup': { EN: 'Event Makeup', ES: 'Maquillaje para eventos', RU: 'Макияж на событие', UA: 'Макіяж на подію', CZ: 'Make-up na akce', DE: 'Event-Make-up', IT: 'Make-up eventi', FR: 'Maquillage événement', AR: 'مكياج للمناسبات', PL: 'Makijaż eventowy' },
    'Catering Help': { EN: 'Catering Help', ES: 'Ayuda de catering', RU: 'Помощь с кейтерингом', UA: 'Допомога з кейтерингом', CZ: 'Pomoc s cateringem', DE: 'Catering-Hilfe', IT: 'Aiuto catering', FR: 'Aide traiteur', AR: 'مساعدة الضيافة', PL: 'Pomoc cateringowa' },
    Tours: { EN: 'Tours', ES: 'Tours', RU: 'Туры', UA: 'Тури', CZ: 'Prohlídky', DE: 'Touren', IT: 'Tour', FR: 'Tours', AR: 'جولات', PL: 'Wycieczki' },
    Workshops: { EN: 'Workshops', ES: 'Talleres', RU: 'Мастер-классы', UA: 'Майстер-класи', CZ: 'Workshopy', DE: 'Workshops', IT: 'Workshop', FR: 'Ateliers', AR: 'ورش عمل', PL: 'Warsztaty' },
    'Kids Activities': { EN: 'Kids Activities', ES: 'Actividades para niños', RU: 'Детские активности', UA: 'Дитячі активності', CZ: 'Dětské aktivity', DE: 'Kinderaktivitäten', IT: 'Attività per bambini', FR: 'Activités enfants', AR: 'أنشطة للأطفال', PL: 'Aktywności dla dzieci' },
    'Art Classes': { EN: 'Art Classes', ES: 'Clases de arte', RU: 'Уроки искусства', UA: 'Уроки мистецтва', CZ: 'Kurzy umění', DE: 'Kunstkurse', IT: 'Lezioni d’arte', FR: 'Cours d’art', AR: 'دروس فن', PL: 'Lekcje sztuki' },
    'Dance Classes': { EN: 'Dance Classes', ES: 'Clases de baile', RU: 'Танцевальные занятия', UA: 'Танцювальні заняття', CZ: 'Taneční lekce', DE: 'Tanzkurse', IT: 'Lezioni di danza', FR: 'Cours de danse', AR: 'دروس رقص', PL: 'Lekcje tańca' },
    'Outdoor Activities': { EN: 'Outdoor Activities', ES: 'Actividades al aire libre', RU: 'Активности на улице', UA: 'Активності на вулиці', CZ: 'Venkovní aktivity', DE: 'Outdoor-Aktivitäten', IT: 'Attività outdoor', FR: 'Activités extérieures', AR: 'أنشطة خارجية', PL: 'Aktywności outdoor' },
    'Graphic Design': { EN: 'Graphic Design', ES: 'Diseño gráfico', RU: 'Графический дизайн', UA: 'Графічний дизайн', CZ: 'Grafický design', DE: 'Grafikdesign', IT: 'Graphic design', FR: 'Design graphique', AR: 'تصميم جرافيك', PL: 'Projektowanie graficzne' },
    'Content Creation': { EN: 'Content Creation', ES: 'Creación de contenido', RU: 'Создание контента', UA: 'Створення контенту', CZ: 'Tvorba obsahu', DE: 'Content-Erstellung', IT: 'Creazione contenuti', FR: 'Création de contenu', AR: 'إنشاء محتوى', PL: 'Tworzenie treści' },
    'Photo Editing': { EN: 'Photo Editing', ES: 'Edición de fotos', RU: 'Обработка фото', UA: 'Обробка фото', CZ: 'Úprava fotografií', DE: 'Fotobearbeitung', IT: 'Editing foto', FR: 'Retouche photo', AR: 'تحرير الصور', PL: 'Edycja zdjęć' },
    'Video Editing': { EN: 'Video Editing', ES: 'Edición de video', RU: 'Монтаж видео', UA: 'Монтаж відео', CZ: 'Úprava videa', DE: 'Videobearbeitung', IT: 'Editing video', FR: 'Montage vidéo', AR: 'تحرير الفيديو', PL: 'Montaż wideo' },
    Branding: { EN: 'Branding', ES: 'Branding', RU: 'Брендинг', UA: 'Брендинг', CZ: 'Branding', DE: 'Branding', IT: 'Branding', FR: 'Branding', AR: 'هوية العلامة', PL: 'Branding' },
    'Social Media Help': { EN: 'Social Media Help', ES: 'Ayuda redes sociales', RU: 'Помощь с соцсетями', UA: 'Допомога з соцмережами', CZ: 'Pomoc se sociálními sítěmi', DE: 'Hilfe mit Social Media', IT: 'Aiuto social media', FR: 'Aide réseaux sociaux', AR: 'مساعدة السوشيال ميديا', PL: 'Pomoc z social media' },
    Other: { EN: 'Other', ES: 'Otro', RU: 'Другое', UA: 'Інше', CZ: 'Jiné', DE: 'Andere', IT: 'Altro', FR: 'Autre', AR: 'أخرى', PL: 'Inne' },
  };

  return dict[value]?.[language] || value;
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

  const localizedCategories = useMemo(() => {
    return categories.map((item) => ({
      ...item,
      localizedLabel: translateCategoryLabel(item.id, language, item.label),
      localizedSubcategories: item.subcategories.map((sub) => ({
        value: sub,
        label: translateSubcategory(sub, language),
      })),
    }));
  }, [language]);

  const currentCategory = localizedCategories.find((item) => item.id === categoryId) || null;
  const subcategoryOptions = currentCategory?.localizedSubcategories || [];

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
              <div>{text.category}: {currentCategory?.localizedLabel || '—'}</div>
              <div>
                {text.subcategory}:{' '}
                {subcategoryOptions.find((item) => item.value === subcategory)?.label || '—'}
              </div>
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
